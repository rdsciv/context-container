use crate::models::*;
use std::collections::HashMap;
use std::fs;
use std::path::PathBuf;

pub fn get_data_dir() -> PathBuf {
    let home = dirs::home_dir().expect("Could not find home directory");
    home.join(".context-container")
}

pub fn get_images_dir() -> PathBuf {
    get_data_dir().join("images")
}

pub fn get_profiles_path() -> PathBuf {
    get_data_dir().join("profiles.json")
}

pub fn get_mcp_path() -> PathBuf {
    get_data_dir().join("mcp_servers.json")
}

pub fn init_data_dir() -> Result<(), String> {
    fs::create_dir_all(get_data_dir()).map_err(|e| e.to_string())?;
    fs::create_dir_all(get_images_dir()).map_err(|e| e.to_string())?;

    if !get_profiles_path().exists() {
        let store = ProfileStore {
            profiles: vec![Profile {
                id: "prof_default".into(),
                name: "Default Profile".into(),
                metadata: HashMap::from([
                    ("user.name".into(), "Developer".into()),
                    ("user.role".into(), "Software Engineer".into()),
                    ("user.location".into(), "San Francisco, CA".into()),
                    ("user.expertise".into(), "Full-stack development".into()),
                    ("user.style".into(), "Minimalist and modern".into()),
                ]),
                tech_stack: HashMap::from([
                    ("framework.frontend".into(), "React".into()),
                    ("framework.backend".into(), "Node.js".into()),
                    ("database".into(), "PostgreSQL".into()),
                    ("deployment".into(), "Docker + AWS".into()),
                ]),
            }],
            active_profile_id: "prof_default".into(),
        };
        write_profiles(&store)?;
    }

    if !get_mcp_path().exists() {
        let servers = vec![
            McpServer { id: "mcp_github".into(), name: "GitHub".into(), enabled: true, description: "Repository access and code search".into() },
            McpServer { id: "mcp_filesystem".into(), name: "Local Filesystem".into(), enabled: true, description: "Read and write local project files".into() },
            McpServer { id: "mcp_web_search".into(), name: "Web Search".into(), enabled: false, description: "Search the web for information".into() },
            McpServer { id: "mcp_docker".into(), name: "Docker".into(), enabled: false, description: "Container management and deployment".into() },
        ];
        write_mcp_servers(&servers)?;
    }

    seed_images()?;
    Ok(())
}

fn seed_images() -> Result<(), String> {
    let dir = get_images_dir();

    let seeds: Vec<(ContextImage, &str)> = vec![
        (
            ContextImage {
                id: "img_karpathy".into(), name: "Karpathy Protocol".into(), icon: "🧠".into(),
                description: "Optimized context for high-quality code generation following LLM interaction best practices.".into(),
                version: "1.0.0".into(), entry_file: "template.md".into(),
                mcp_dependencies: vec!["GitHub".into(), "Local Filesystem".into()],
                required_variables: vec!["user.role".into(), "user.location".into(), "framework.backend".into()],
                tags: vec!["coding".into(), "best-practices".into(), "production".into()],
            },
            "# Role Definition\nAct as a senior pair programmer assisting a {{user.role}} based in {{user.location}}.\n\n# Technical Constraints\nAll code must be generated for {{framework.backend}} and adhere to its modern best practices.\n\n# Output Requirements\n- Write clean, production-ready code\n- Include error handling and edge cases\n- Add concise but meaningful comments\n- Follow the language's idiomatic conventions\n- Suggest optimizations when applicable\n\n# Interaction Style\n- Be concise and direct\n- Prioritize working code over explanations\n- Ask clarifying questions when requirements are ambiguous\n- Provide complete, runnable examples",
        ),
        (
            ContextImage {
                id: "img_research".into(), name: "Research Analyst".into(), icon: "🔬".into(),
                description: "Deep research and analysis context with structured reasoning and citation support.".into(),
                version: "1.0.0".into(), entry_file: "template.md".into(),
                mcp_dependencies: vec!["Web Search".into()],
                required_variables: vec!["user.role".into(), "user.expertise".into()],
                tags: vec!["research".into(), "analysis".into(), "academic".into()],
            },
            "# Role Definition\nYou are a senior research analyst supporting a {{user.role}} with expertise in {{user.expertise}}.\n\n# Research Protocol\n- Provide well-structured analysis with clear reasoning chains\n- Cite sources and distinguish between established facts and speculation\n- Use comparative analysis when evaluating alternatives\n- Quantify claims with data when possible\n\n# Output Format\n- Use structured headings and bullet points\n- Include a summary section at the top\n- Add a confidence level for key conclusions\n- Suggest follow-up research directions",
        ),
        (
            ContextImage {
                id: "img_devops".into(), name: "DevOps Commander".into(), icon: "⚡".into(),
                description: "Infrastructure, CI/CD, and deployment context with security-first principles.".into(),
                version: "1.0.0".into(), entry_file: "template.md".into(),
                mcp_dependencies: vec!["Docker".into(), "GitHub".into()],
                required_variables: vec!["user.role".into(), "framework.backend".into(), "database".into(), "deployment".into()],
                tags: vec!["devops".into(), "infrastructure".into(), "security".into()],
            },
            "# Role Definition\nAct as a DevOps and infrastructure expert assisting a {{user.role}}.\n\n# Technical Stack\n- Backend: {{framework.backend}}\n- Database: {{database}}\n- Deployment: {{deployment}}\n\n# Principles\n- Security-first: always consider attack surface and least privilege\n- Infrastructure as Code: prefer declarative configurations\n- Observability: include logging, metrics, and alerting\n- Reliability: design for failure with graceful degradation",
        ),
        (
            ContextImage {
                id: "img_creative".into(), name: "Creative Director".into(), icon: "🎨".into(),
                description: "Design thinking and creative writing context with brand-aware output generation.".into(),
                version: "1.0.0".into(), entry_file: "template.md".into(),
                mcp_dependencies: vec![],
                required_variables: vec!["user.role".into(), "user.style".into()],
                tags: vec!["creative".into(), "writing".into(), "design".into()],
            },
            "# Role Definition\nYou are a creative director and senior copywriter working with a {{user.role}}.\n\n# Style Guide\n- Aesthetic preference: {{user.style}}\n- Tone: Professional yet approachable\n- Voice: Confident, clear, and inspiring\n\n# Creative Principles\n- Lead with strong hooks and compelling narratives\n- Balance creativity with clarity of message\n- Consider the target audience at every step\n- Iterate quickly with multiple options",
        ),
    ];

    for (image, template) in seeds {
        let image_dir = dir.join(&image.id);
        if !image_dir.exists() {
            fs::create_dir_all(&image_dir).map_err(|e| e.to_string())?;
            let manifest = serde_json::to_string_pretty(&image).map_err(|e| e.to_string())?;
            fs::write(image_dir.join("manifest.json"), manifest).map_err(|e| e.to_string())?;
            fs::write(image_dir.join("template.md"), template).map_err(|e| e.to_string())?;
        }
    }

    Ok(())
}

pub fn read_profiles() -> Result<ProfileStore, String> {
    let content = fs::read_to_string(get_profiles_path()).map_err(|e| e.to_string())?;
    serde_json::from_str(&content).map_err(|e| e.to_string())
}

pub fn write_profiles(store: &ProfileStore) -> Result<(), String> {
    let json = serde_json::to_string_pretty(store).map_err(|e| e.to_string())?;
    fs::write(get_profiles_path(), json).map_err(|e| e.to_string())
}

pub fn read_images() -> Result<Vec<ContextImage>, String> {
    let mut images = Vec::new();
    let entries = fs::read_dir(get_images_dir()).map_err(|e| e.to_string())?;
    for entry in entries {
        let entry = entry.map_err(|e| e.to_string())?;
        let manifest = entry.path().join("manifest.json");
        if manifest.exists() {
            let content = fs::read_to_string(&manifest).map_err(|e| e.to_string())?;
            let image: ContextImage = serde_json::from_str(&content).map_err(|e| e.to_string())?;
            images.push(image);
        }
    }
    Ok(images)
}

pub fn read_template(image_id: &str) -> Result<String, String> {
    let image_dir = get_images_dir().join(image_id);
    let manifest_path = image_dir.join("manifest.json");
    let content = fs::read_to_string(&manifest_path).map_err(|e| e.to_string())?;
    let image: ContextImage = serde_json::from_str(&content).map_err(|e| e.to_string())?;
    fs::read_to_string(image_dir.join(&image.entry_file)).map_err(|e| e.to_string())
}

pub fn read_mcp_servers() -> Result<Vec<McpServer>, String> {
    let content = fs::read_to_string(get_mcp_path()).map_err(|e| e.to_string())?;
    serde_json::from_str(&content).map_err(|e| e.to_string())
}

pub fn write_mcp_servers(servers: &[McpServer]) -> Result<(), String> {
    let json = serde_json::to_string_pretty(servers).map_err(|e| e.to_string())?;
    fs::write(get_mcp_path(), json).map_err(|e| e.to_string())
}
