use serde::{Deserialize, Serialize};
use sysinfo::System;
use tauri::ipc::Response;

use crate::utils::Res;

#[derive(Serialize, Deserialize)]
struct SystemInfo {
  cpu: CpuInfo,
}

#[derive(Serialize, Deserialize)]
struct CpuInfo {
  cores: usize,
}

#[tauri::command]
pub fn system_info() -> Response {
  let mut sys = System::new_all();
  sys.refresh_all();
  let cpu = sys.cpus().len();
  let info = SystemInfo {
    cpu: CpuInfo { cores: cpu },
  };
  Response::new(
    serde_json::to_string(&Res {
      status: "ok".to_string(),
      data: info,
    })
    .unwrap(),
  )
}
