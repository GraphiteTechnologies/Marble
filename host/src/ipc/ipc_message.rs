use serde::Deserialize;
use crate::ipc::request::command_request::CommandRequest;
use crate::ipc::request::proxy_request::ProxyRequest;

#[derive(Deserialize)]
#[serde(tag = "type")]
pub enum IpcMessage {
    Command(CommandRequest),
    Proxy(ProxyRequest),
}
