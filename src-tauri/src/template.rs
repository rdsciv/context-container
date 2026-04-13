use regex::Regex;
use std::collections::HashMap;

pub fn process(template: &str, variables: &HashMap<String, String>) -> (String, Vec<String>) {
    let re = Regex::new(r"\{\{([\w.]+)\}\}").unwrap();

    // First pass: find missing variables
    let mut missing: Vec<String> = Vec::new();
    for caps in re.captures_iter(template) {
        let key = caps.get(1).unwrap().as_str().trim();
        if !variables.contains_key(key) && !missing.contains(&key.to_string()) {
            missing.push(key.to_string());
        }
    }

    // Second pass: replace all variables
    let result = re.replace_all(template, |caps: &regex::Captures| -> String {
        let key = caps.get(1).unwrap().as_str().trim();
        match variables.get(key) {
            Some(value) => value.clone(),
            None => format!("[MISSING: {}]", key),
        }
    });

    (result.to_string(), missing)
}

pub fn flatten_profile(
    metadata: &HashMap<String, String>,
    tech_stack: &HashMap<String, String>,
) -> HashMap<String, String> {
    let mut flat = metadata.clone();
    flat.extend(tech_stack.clone());
    flat
}
