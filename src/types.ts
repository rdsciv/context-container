export interface Profile {
  id: string;
  name: string;
  metadata: Record<string, string>;
  tech_stack: Record<string, string>;
}

export interface ProfileStore {
  profiles: Profile[];
  active_profile_id: string;
}

export interface ContextImage {
  id: string;
  name: string;
  description: string;
  version: string;
  mcp_dependencies: string[];
  entry_file: string;
  required_variables: string[];
  tags: string[];
  icon: string;
}

export interface ProcessedResult {
  content: string;
  missing_variables: string[];
  image_id: string;
  profile_id: string;
}

export interface McpServer {
  id: string;
  name: string;
  enabled: boolean;
  description: string;
}

export type View = 'dashboard' | 'profiles' | 'session' | 'mcp';
