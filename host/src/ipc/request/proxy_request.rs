use serde::Deserialize;

#[derive(Deserialize)]
pub struct ProxyRequest {
    pub(crate) url: String,
    pub(crate) callback_id: String,
}
