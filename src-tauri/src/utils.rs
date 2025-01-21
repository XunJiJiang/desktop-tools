use lazy_static::lazy_static;
use std::sync::atomic::{AtomicUsize, Ordering};

lazy_static! {
  static ref COUNTER: AtomicUsize = AtomicUsize::new(1);
}

pub fn generate_unique_key() -> String {
  let key = COUNTER.fetch_add(1, Ordering::SeqCst);
  key.to_string()
}

use serde::{Deserialize, Serialize};

#[derive(Serialize, Deserialize)]
pub struct Res<T> {
  pub status: String,
  pub data: T,
}
