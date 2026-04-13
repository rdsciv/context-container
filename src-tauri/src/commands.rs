use crate::models::*;
use crate::storage;
use crate::template;

#[tauri::command]
pub fn init_app() -> Result<(), String> {
    storage::init_data_dir()
}

#[tauri::command]
pub fn get_profiles() -> Result<ProfileStore, String> {
    storage::read_profiles()
}

#[tauri::command]
pub fn save_profile(profile: Profile) -> Result<(), String> {
    let mut store = storage::read_profiles()?;
    if let Some(idx) = store.profiles.iter().position(|p| p.id == profile.id) {
        store.profiles[idx] = profile;
    } else {
        store.profiles.push(profile);
    }
    storage::write_profiles(&store)
}

#[tauri::command]
pub fn delete_profile(id: String) -> Result<(), String> {
    let mut store = storage::read_profiles()?;
    store.profiles.retain(|p| p.id != id);
    if store.active_profile_id == id {
        store.active_profile_id = store.profiles.first().map(|p| p.id.clone()).unwrap_or_default();
    }
    storage::write_profiles(&store)
}

#[tauri::command]
pub fn set_active_profile(id: String) -> Result<(), String> {
    let mut store = storage::read_profiles()?;
    if !store.profiles.iter().any(|p| p.id == id) {
        return Err("Profile not found".into());
    }
    store.active_profile_id = id;
    storage::write_profiles(&store)
}

#[tauri::command]
pub fn get_images() -> Result<Vec<ContextImage>, String> {
    storage::read_images()
}

#[tauri::command]
pub fn get_template_content(image_id: String) -> Result<String, String> {
    storage::read_template(&image_id)
}

#[tauri::command]
pub fn create_image(image: ContextImage, template_content: String) -> Result<(), String> {
    let image_dir = storage::get_images_dir().join(&image.id);
    std::fs::create_dir_all(&image_dir).map_err(|e| e.to_string())?;
    let manifest = serde_json::to_string_pretty(&image).map_err(|e| e.to_string())?;
    std::fs::write(image_dir.join("manifest.json"), manifest).map_err(|e| e.to_string())?;
    std::fs::write(image_dir.join(&image.entry_file), template_content).map_err(|e| e.to_string())
}

#[tauri::command]
pub fn delete_image(id: String) -> Result<(), String> {
    let image_dir = storage::get_images_dir().join(&id);
    if image_dir.exists() {
        std::fs::remove_dir_all(&image_dir).map_err(|e| e.to_string())?;
    }
    Ok(())
}

#[tauri::command]
pub fn process_context(image_id: String) -> Result<ProcessedResult, String> {
    let store = storage::read_profiles()?;
    let profile = store.profiles.iter()
        .find(|p| p.id == store.active_profile_id)
        .ok_or("No active profile found")?;

    let template_content = storage::read_template(&image_id)?;
    let variables = template::flatten_profile(&profile.metadata, &profile.tech_stack);
    let (content, missing) = template::process(&template_content, &variables);

    Ok(ProcessedResult {
        content,
        missing_variables: missing,
        image_id,
        profile_id: profile.id.clone(),
    })
}

#[tauri::command]
pub fn get_mcp_servers() -> Result<Vec<McpServer>, String> {
    storage::read_mcp_servers()
}

#[tauri::command]
pub fn toggle_mcp_server(id: String, enabled: bool) -> Result<(), String> {
    let mut servers = storage::read_mcp_servers()?;
    if let Some(server) = servers.iter_mut().find(|s| s.id == id) {
        server.enabled = enabled;
    }
    storage::write_mcp_servers(&servers)
}
