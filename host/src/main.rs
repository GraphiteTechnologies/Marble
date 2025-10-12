mod constants;
mod ipc;

use crate::constants::INIT_JS;
use crate::ipc::ipc_message::IpcMessage;
use crate::ipc::user_event::UserEvent;
use anyhow::Result;
use std::process::Command;
use tao::{
    event::{Event, WindowEvent},
    event_loop::{ControlFlow, EventLoop, EventLoopBuilder},
    window::{Fullscreen, WindowBuilder},
};
use wry::WebViewBuilder;

fn main() -> Result<()> {
    let event_loop: EventLoop<UserEvent> = EventLoopBuilder::<UserEvent>::with_user_event().build();
    let window = WindowBuilder::new()
        .with_title("Graphite Rust Host")
        .with_fullscreen(Some(Fullscreen::Borderless(None)))
        .build(&event_loop)?;

    let proxy = event_loop.create_proxy();

    let webview = WebViewBuilder::new()
        .with_url("http://localhost:5173")
        .with_initialization_script(INIT_JS)
        .with_accept_first_mouse(true)
        .with_ipc_handler(move |request: wry::http::Request<String>| {
            let message = request.body();
            match serde_json::from_str::<IpcMessage>(message) {
                Ok(IpcMessage::Command(msg)) => {
                    let proxy_clone = proxy.clone();
                    std::thread::spawn(move || {
                        let output = Command::new("sh").arg("-c").arg(&msg.command).output();
                        let (success, result) = match output {
                            Ok(out) => {
                                if out.status.success() {
                                    (true, String::from_utf8_lossy(&out.stdout).to_string())
                                } else {
                                    (false, String::from_utf8_lossy(&out.stderr).to_string())
                                }
                            }
                            Err(e) => (false, e.to_string()),
                        };
                        let _ = proxy_clone.send_event(UserEvent::CommandResult {
                            callback_id: msg.callback_id,
                            success,
                            result,
                        });
                    });
                }
                Err(error) => {
                    eprintln!("Failed to parse IPC message: {error}");
                }
            }
        })
        .build(&window)?;

    event_loop.run(move |event, _, control_flow| {
        *control_flow = ControlFlow::Wait;

        match event {
            Event::WindowEvent {
                event: WindowEvent::CloseRequested,
                ..
            } => *control_flow = ControlFlow::Exit,
            Event::UserEvent(UserEvent::CommandResult {
                                 callback_id,
                                 success,
                                 result,
                             }) => {
                let script = format!(
                    "window.__resolvePromise('{}', {}, {})",
                    callback_id,
                    success,
                    serde_json::to_string(&result).unwrap()
                );
                let _ = webview.evaluate_script(&script);
            }
            _ => (),
        }
    });
}
