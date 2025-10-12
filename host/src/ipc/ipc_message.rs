use serde::Deserialize;
use crate::ipc::request::command_request::CommandRequest;

#[derive(Deserialize)]
#[serde(tag = "type")]
pub enum IpcMessage {
    Command(CommandRequest),
}
