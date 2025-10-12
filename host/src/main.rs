mod constants;
mod ipc;

use crate::constants::{INIT_JS};
use crate::ipc::ipc_message::IpcMessage;
use crate::ipc::user_event::UserEvent;
use anyhow::Result;
use std::process::Command;
use tao::{
    event::{Event, WindowEvent},
    event_loop::{ControlFlow, EventLoop},
    window::WindowBuilder,
};
use wry::{webview::WebViewBuilder};

fn main() -> Result<()> {
    let event_loop: EventLoop<UserEvent> = EventLoop::with_user_event();
    let window = WindowBuilder::new()
        .with_title("Graphite Rust Host")
        .build(&event_loop)?;

    let proxy = event_loop.create_proxy();

    let webview_builder = WebViewBuilder::new(window)?
        .with_url("http://localhost:5173")?
        .with_initialization_script(INIT_JS)
        .with_accept_first_mouse(true);

    let webview = webview_builder
        .with_ipc_handler(move |_, message: String| {
            match serde_json::from_str::<IpcMessage>(&message) {
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
                        proxy_clone
                            .send_event(UserEvent::CommandResult {
                                callback_id: msg.callback_id,
                                success,
                                result,
                            })
                            .expect("Failed to send event");
                    });
                }
                Err(error) => {
                    eprintln!("Failed to parse IPC message: {error}");
                }
            }
        })
        .build()?;

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
                webview
                    .evaluate_script(&script)
                    .expect("Failed to evaluate script");
            }
            _ => (),
        }
    });
}
