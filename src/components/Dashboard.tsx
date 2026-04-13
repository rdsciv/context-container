import type { ContextImage, McpServer } from "../types";

interface DashboardProps {
  images: ContextImage[];
  mcpServers: McpServer[];
  onProcessContext: (imageId: string) => void;
  onCreateImage: () => void;
  onEditImage: (imageId: string) => void;
}

export function Dashboard({
  images,
  mcpServers,
  onProcessContext,
  onCreateImage,
  onEditImage,
}: DashboardProps) {
  const getMcpStatus = (depName: string) => {
    const server = mcpServers.find((s) => s.name === depName);
    return server?.enabled ?? false;
  };

  return (
    <div>
      <h2 style={{ marginTop: 0 }}>Context Images</h2>
      <p className="card-desc">
        Select a template to generate a contextual workspace payload.
      </p>

      <div className="card-grid">
        {images.map((img) => (
          <div
            key={img.id}
            className="context-card"
            onClick={() => onProcessContext(img.id)}
          >
            <div className="card-header">
              <span className="card-icon">{img.icon}</span>
              <span className="card-title">{img.name}</span>
            </div>
            <div className="card-desc">{img.description}</div>

            <div className="card-indicators">
              {img.required_variables.length > 0 && (
                <span className="tag tag-var" title={img.required_variables.join(", ")}>
                  {img.required_variables.length} variable{img.required_variables.length !== 1 ? "s" : ""}
                </span>
              )}
              {img.mcp_dependencies.length > 0 && (
                <span className="card-mcp-dots">
                  {img.mcp_dependencies.map((dep) => (
                    <span
                      key={dep}
                      className={`mcp-dot ${getMcpStatus(dep) ? "mcp-dot-active" : ""}`}
                      title={`${dep}: ${getMcpStatus(dep) ? "enabled" : "disabled"}`}
                    />
                  ))}
                </span>
              )}
            </div>

            <div className="card-tags">
              {img.tags.map((t) => (
                <span key={t} className="tag">
                  {t}
                </span>
              ))}
            </div>

            <button
              className="card-edit-btn"
              onClick={(e) => {
                e.stopPropagation();
                onEditImage(img.id);
              }}
              title="Edit template"
            >
              &#9998;
            </button>
          </div>
        ))}

        <div className="context-card create-card" onClick={onCreateImage}>
          <div className="create-card-content">
            <span className="create-card-icon">+</span>
            <span className="create-card-label">Create New</span>
          </div>
        </div>
      </div>
    </div>
  );
}
