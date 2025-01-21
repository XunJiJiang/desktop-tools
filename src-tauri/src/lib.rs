// Learn more about Tauri commands at https://tauri.app/develop/calling-rust/

mod command;
use command::sysinfo::system_info;
use command::windows::{create_window, get_window_state, hide_window, show_window};
mod utils;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
  tauri::Builder::default()
    .plugin(tauri_plugin_os::init())
    .plugin(tauri_plugin_fs::init())
    .plugin(tauri_plugin_shell::init())
    .plugin(tauri_plugin_sql::Builder::default().build())
    .invoke_handler(tauri::generate_handler![
      system_info,
      create_window,
      get_window_state,
      hide_window,
      show_window
    ])
    .run(tauri::generate_context!())
    .expect("error while running tauri application");
}
