mod commands;
mod models;
mod storage;
mod template;

use commands::*;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .invoke_handler(tauri::generate_handler![
            init_app,
            get_profiles,
            save_profile,
            delete_profile,
            set_active_profile,
            get_images,
            get_template_content,
            create_image,
            delete_image,
            process_context,
            get_mcp_servers,
            toggle_mcp_server,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
