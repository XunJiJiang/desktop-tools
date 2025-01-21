use serde::{Deserialize, Serialize};
use tauri::{
  ipc::Response, Manager, WebviewWindow,
};

use crate::utils::{generate_unique_key, Res};
use std::{collections::HashMap, str};

use lazy_static::lazy_static;

#[derive(Serialize, Deserialize)]
struct WindowInfoRes {
  original_label: String,
  label: String,
  key: String,
  allow_multiple: bool,
}

struct WindowsCreateInfo {
  path: String,
  label: String,
  allow_multiple: bool,
}

lazy_static! {
  static ref WINDOWS_CREATE_INFO: HashMap<String, WindowsCreateInfo> = {
    let mut map = HashMap::new();
    map.insert(
      "full-viewport".to_string(),
      WindowsCreateInfo {
        path: "apps/full-viewport/index.html".to_string(),
        label: "full-viewport".to_string(),
        allow_multiple: true,
      },
    );
    map.insert(
      "main-viewport-only".to_string(),
      WindowsCreateInfo {
        path: "apps/main-viewport-only/index.html".to_string(),
        label: "main-viewport-only".to_string(),
        allow_multiple: true,
      },
    );
    map
  };
}

#[tauri::command]
pub async fn create_window(app: tauri::AppHandle, label: String) -> Response {
  let window_create_info = WINDOWS_CREATE_INFO.get_key_value(label.as_str()).unwrap().1;

  let key = generate_unique_key();
  let _label = if window_create_info.allow_multiple {
    format!("{}-{}", &window_create_info.label, &key)
  } else {
    window_create_info.label.clone()
  };

  // let window = tauri::window::Window::new();

  // let webview = tauri::webview::Webview::builder::new(
  //   &_label,
  //   tauri::WebviewUrl::App(window_create_info.path.clone().into()),
  // )
  // .build();

  let mut config = app.config().app.windows.get(0).unwrap().clone();
  config.label = _label.clone();
  config.url = tauri::WebviewUrl::App(window_create_info.path.clone().into());

  match tauri::WebviewWindowBuilder::from_config(
    &app,
    &config,
  )
  .unwrap()
  .build()
  {
    Ok(window) => window,
    Err(e) => {
      let webview_window = match get_webview_window(app, label.clone()) {
        Ok(window) => window,
        Err(res) => {
          return Response::new(serde_json::to_string(&res).unwrap());
        }
      };
      webview_window.show().unwrap();
      webview_window.set_focus().unwrap();
      return Response::new(
        serde_json::to_string(&Res {
          status: "error".to_string(),
          data: e.to_string(),
        })
        .unwrap(),
      );
    }
  };

  let info = WindowInfoRes {
    original_label: label.clone(),
    label: _label.clone(),
    key: key.clone(),
    allow_multiple: window_create_info.allow_multiple,
  };

  Response::new(
    serde_json::to_string(&Res {
      status: "ok".to_string(),
      data: info,
    })
    .unwrap(),
  )
}

#[derive(Serialize, Deserialize)]
struct WindowStateRes {
  original_label: String,
  label: String,
  state: String,
}

fn get_webview_window(app: tauri::AppHandle, label: String) -> Result<WebviewWindow, Res<String>> {
  let webview_window = match app.get_webview_window(label.as_str()) {
    Some(window) => window,
    None => {
      return Err(Res {
        status: "error".to_string(),
        data: "window not found".to_string(),
      });
    }
  };

  Ok(webview_window)
}

#[tauri::command]
pub fn get_window_state(app: tauri::AppHandle, label: String) -> Response {
  let webview_window = match get_webview_window(app, label.clone()) {
    Ok(window) => window,
    Err(res) => {
      return Response::new(serde_json::to_string(&res).unwrap());
    }
  };

  let state = match webview_window.is_visible().unwrap() {
    true => "show",
    false => "hide",
  };

  let res = WindowStateRes {
    original_label: label.split('-').next().unwrap().to_string(),
    label: label.clone(),
    state: state.to_string(),
  };

  Response::new(
    serde_json::to_string(&Res {
      status: "ok".to_string(),
      data: res,
    })
    .unwrap(),
  )
}

#[tauri::command]
pub fn hide_window(app: tauri::AppHandle, label: String) -> Response {
  let webview_window = match get_webview_window(app, label.clone()) {
    Ok(window) => window,
    Err(res) => {
      return Response::new(serde_json::to_string(&res).unwrap());
    }
  };

  webview_window.hide().unwrap();

  Response::new(
    serde_json::to_string(&Res {
      status: "ok".to_string(),
      data: "window hidden".to_string(),
    })
    .unwrap(),
  )
}

#[tauri::command]
pub fn show_window(app: tauri::AppHandle, label: String) -> Response {
  let webview_window = match get_webview_window(app, label.clone()) {
    Ok(window) => window,
    Err(res) => {
      return Response::new(serde_json::to_string(&res).unwrap());
    }
  };

  webview_window.show().unwrap();

  Response::new(
    serde_json::to_string(&Res {
      status: "ok".to_string(),
      data: "window shown".to_string(),
    })
    .unwrap(),
  )
}
