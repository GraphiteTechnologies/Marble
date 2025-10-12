#[derive(Debug)]
pub enum UserEvent {
    CommandResult {
        callback_id: String,
        success: bool,
        result: String,
    },
}
