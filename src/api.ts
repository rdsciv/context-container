import { invoke } from '@tauri-apps/api/core';
import type { ProfileStore, Profile, ContextImage, ProcessedResult, McpServer } from './types';

export const api = {
  initApp: () => invoke<void>('init_app'),
  getProfiles: () => invoke<ProfileStore>('get_profiles'),
  saveProfile: (profile: Profile) => invoke<void>('save_profile', { profile }),
  deleteProfile: (id: string) => invoke<void>('delete_profile', { id }),
  setActiveProfile: (id: string) => invoke<void>('set_active_profile', { id }),
  getImages: () => invoke<ContextImage[]>('get_images'),
  getTemplateContent: (imageId: string) => invoke<string>('get_template_content', { imageId }),
  createImage: (image: ContextImage, templateContent: string) =>
    invoke<void>('create_image', { image, templateContent }),
  deleteImage: (id: string) => invoke<void>('delete_image', { id }),
  processContext: (imageId: string) => invoke<ProcessedResult>('process_context', { imageId }),
  getMcpServers: () => invoke<McpServer[]>('get_mcp_servers'),
  toggleMcpServer: (id: string, enabled: boolean) =>
    invoke<void>('toggle_mcp_server', { id, enabled }),
};
