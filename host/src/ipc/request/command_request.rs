use serde::Deserialize;

#[derive(Deserialize)]
pub struct CommandRequest {
    pub(crate) command: String,
    pub(crate) callback_id: String,
}
