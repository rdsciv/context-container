import type { McpServer } from "../types";

interface McpViewProps {
  servers: McpServer[];
  onToggle: (id: string, enabled: boolean) => void;
}

export function McpView({ servers, onToggle }: McpViewProps) {
  return (
    <div>
      <h2 style={{ marginTop: 0 }}>Model Context Protocol</h2>
      <p className="card-desc">
        Manage local tools and capabilities exposed to the LLM context.
      </p>

      <div className="mcp-list">
        {servers.map((server) => (
          <div key={server.id} className="mcp-item">
            <div className="mcp-info">
              <span className="mcp-name">{server.name}</span>
              <span className="mcp-desc">{server.description}</span>
            </div>
            <label className="switch">
              <input
                type="checkbox"
                checked={server.enabled}
                onChange={(e) => onToggle(server.id, e.target.checked)}
              />
              <span className="slider"></span>
            </label>
          </div>
        ))}
      </div>
    </div>
  );
}
