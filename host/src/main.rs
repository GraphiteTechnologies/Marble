mod constants;
mod ipc;

use crate::constants::{INIT_JS, USER_AGENT};
use crate::ipc::ipc_message::IpcMessage;
use crate::ipc::request::proxy_request::ProxyRequest;
use crate::ipc::user_event::UserEvent;
use anyhow::Result;
use scraper::{Html, Selector};
use std::process::Command;
use tao::{
    event::{Event, WindowEvent},
    event_loop::{ControlFlow, EventLoop},
    window::WindowBuilder,
};
use tokio::runtime::Runtime;
use url::Url;
use wry::{application::event_loop::EventLoopProxy, webview::WebViewBuilder};

fn handle_proxy_request(rt: &Runtime, proxy: EventLoopProxy<UserEvent>, msg: ProxyRequest) {
    let callback_id = msg.callback_id;
    rt.spawn(async move {
        let client = reqwest::Client::builder()
            .user_agent(USER_AGENT)
            .build()
            .unwrap();
        let res = client.get(&msg.url).send().await;
        let (success, result) = match res {
            Ok(response) => {
                let content_type = response
                    .headers()
                    .get("content-type")
                    .map(|v| v.to_str().unwrap_or(""))
                    .unwrap_or("");

                if content_type.contains("text/html") {
                    let base_url = Url::parse(&msg.url).unwrap();
                    let body = response.text().await.unwrap();
                    let document = Html::parse_document(&body);
                    let mut new_html = body.clone();

                    for (selector, attr) in [
                        ("a", "href"),
                        ("link", "href"),
                        ("script", "src"),
                        ("img", "src"),
                        ("iframe", "src"),
                        ("source", "src"),
                        ("embed", "src"),
                        ("form", "action"),
                    ] {
                        let element_selector = Selector::parse(selector).unwrap();
                        for element in document.select(&element_selector) {
                            if let Some(val) = element.value().attr(attr) {
                                if let Ok(abs_url) = base_url.join(val) {
                                    let proxy_url = format!(
                                        "http://localhost:5173/proxy?url={}",
                                        abs_url.as_str()
                                    );
                                    let original_attr = format!("{}=\"{}\"", attr, val);
                                    let new_attr = format!("{}=\"{}\"", attr, proxy_url);
                                    new_html = new_html.replace(&original_attr, &new_attr);
                                }
                            }
                        }
                    }
                    (true, new_html)
                } else {
                    let body = response.bytes().await.unwrap();
                    (true, String::from_utf8_lossy(&body).to_string())
                }
            }
            Err(e) => (false, e.to_string()),
        };

        proxy
            .send_event(UserEvent::ProxyResult {
                callback_id,
                success,
                result,
            })
            .expect("Failed to send event");
    });
}
fn main() -> Result<()> {
    let rt = Runtime::new()?;
    let event_loop: EventLoop<UserEvent> = EventLoop::with_user_event();
    let window = WindowBuilder::new()
        .with_title("Graphite Rust Host")
        .build(&event_loop)?;

    let proxy = event_loop.create_proxy();

    let webview = WebViewBuilder::new(window)?
        .with_url("http://localhost:5173")?
        .with_initialization_script(INIT_JS)
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
                Ok(IpcMessage::Proxy(msg)) => {
                    handle_proxy_request(&rt, proxy.clone(), msg);
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
            Event::UserEvent(UserEvent::ProxyResult {
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
