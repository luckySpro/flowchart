#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]
mod file_commands;
mod storage;
use tauri::Manager;

#[tauri::command]
async fn save_draft(app: tauri::AppHandle, document: String) -> Result<(), String> {
    let directory = app.path().app_data_dir().map_err(|e| e.to_string())?;
    tauri::async_runtime::spawn_blocking(move || storage::save(&directory, &document))
        .await
        .map_err(|e| e.to_string())?
}

#[tauri::command]
async fn load_draft(app: tauri::AppHandle) -> Result<Option<String>, String> {
    let directory = app.path().app_data_dir().map_err(|e| e.to_string())?;
    tauri::async_runtime::spawn_blocking(move || storage::load(&directory))
        .await
        .map_err(|e| e.to_string())?
}

fn main() {
    if let Err(error) = tauri::Builder::default()
        .plugin(tauri_plugin_dialog::init())
        .invoke_handler(tauri::generate_handler![
            save_draft,
            load_draft,
            file_commands::export_file,
            file_commands::open_document
        ])
        .run(tauri::generate_context!())
    {
        eprintln!("序图启动失败：{error}");
        std::process::exit(1);
    }
}
