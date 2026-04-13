use serde::{Deserialize, Serialize};
use std::collections::HashMap;

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct Profile {
    pub id: String,
    pub name: String,
    pub metadata: HashMap<String, String>,
    pub tech_stack: HashMap<String, String>,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct ProfileStore {
    pub profiles: Vec<Profile>,
    pub active_profile_id: String,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct ContextImage {
    pub id: String,
    pub name: String,
    pub description: String,
    pub version: String,
    pub mcp_dependencies: Vec<String>,
    pub entry_file: String,
    pub required_variables: Vec<String>,
    #[serde(default)]
    pub tags: Vec<String>,
    #[serde(default)]
    pub icon: String,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct ProcessedResult {
    pub content: String,
    pub missing_variables: Vec<String>,
    pub image_id: String,
    pub profile_id: String,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct McpServer {
    pub id: String,
    pub name: String,
    pub enabled: bool,
    pub description: String,
}
