import { useEffect, useState } from "react";
import { api } from "./api";
import type { View, ProfileStore, ContextImage, McpServer, ProcessedResult } from "./types";
import "./App.css";

function App() {
  const [view, setView] = useState<View>("dashboard");
  const [profiles, setProfiles] = useState<ProfileStore | null>(null);
  const [images, setImages] = useState<ContextImage[]>([]);
  const [mcpServers, setMcpServers] = useState<McpServer[]>([]);
  const [activeSession, setActiveSession] = useState<ProcessedResult | null>(null);

  useEffect(() => {
    // Initialize data dir on start
    api.initApp().then(() => {
      loadData();
    }).catch(console.error);
  }, []);

  const loadData = async () => {
    try {
      const p = await api.getProfiles();
      const i = await api.getImages();
      const m = await api.getMcpServers();
      setProfiles(p);
      setImages(i);
      setMcpServers(m);
    } catch (err) {
      console.error("Error loading data:", err);
    }
  };

  const handleProcessContext = async (imageId: string) => {
    try {
      const res = await api.processContext(imageId);
      setActiveSession(res);
      setView("session");
    } catch (err) {
      console.error(err);
    }
  };

  const toggleMcp = async (id: string, enabled: boolean) => {
    try {
      await api.toggleMcpServer(id, enabled);
      loadData();
    } catch (err) {
      console.error(err);
    }
  };

  // Replace missing vars with formatted span
  const formatPreview = (content: string) => {
    const parts = content.split(/(\[MISSING: [^\]]+\])/);
    return parts.map((part, i) => {
      if (part.startsWith("[MISSING:")) {
        return <span key={i} className="missing-var">{part}</span>;
      }
      return <span key={i}>{part}</span>;
    });
  };

  return (
    <div className="app-container">
      <div className="sidebar">
        <div className="sidebar-title">Context Container</div>
        
        <div 
          className={`nav-item ${view === "dashboard" ? "active" : ""}`}
          onClick={() => setView("dashboard")}
        >
          <span>📦</span> Images
        </div>
        
        <div 
          className={`nav-item ${view === "profiles" ? "active" : ""}`}
          onClick={() => setView("profiles")}
        >
          <span>👤</span> Profiles
        </div>

        <div 
          className={`nav-item ${view === "mcp" ? "active" : ""}`}
          onClick={() => setView("mcp")}
        >
          <span>🔌</span> MCP Servers
        </div>
        
        {activeSession && (
          <div 
            className={`nav-item ${view === "session" ? "active" : ""}`}
            onClick={() => setView("session")}
            style={{ marginTop: 'auto', borderTop: '1px solid var(--border-color)'}}
          >
            <span>🟢</span> Active Session
          </div>
        )}
      </div>

      <div className="main-content">
        {view === "dashboard" && (
          <div>
            <h2 style={{marginTop: 0}}>Context Images</h2>
            <p className="card-desc">Select a template to generate a contextual workspace payload.</p>
            
            <div className="card-grid">
              {images.map(img => (
                <div key={img.id} className="context-card" onClick={() => handleProcessContext(img.id)}>
                  <div className="card-header">
                    <span className="card-icon">{img.icon}</span>
                    <span className="card-title">{img.name}</span>
                  </div>
                  <div className="card-desc">{img.description}</div>
                  <div className="card-tags">
                    {img.tags.map(t => <span key={t} className="tag">{t}</span>)}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {view === "profiles" && profiles && (
          <div>
            <h2 style={{marginTop: 0}}>Active Profile</h2>
            <div className="profile-selector">
              <select 
                className="profile-select" 
                value={profiles.active_profile_id}
                onChange={(e) => {
                  api.setActiveProfile(e.target.value).then(loadData);
                }}
              >
                {profiles.profiles.map(p => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>
            </div>

            {profiles.profiles.find(p => p.id === profiles.active_profile_id) && (
              <div>
                <h3 style={{fontSize: "1rem"}}>Metadata</h3>
                <div className="card-desc">Personal details auto-swapped into context.</div>
                {Object.entries(profiles.profiles.find(p => p.id === profiles.active_profile_id)?.metadata || {}).map(([k, v]) => (
                  <div key={k} className="key-value-row">
                    <input className="form-input" disabled value={k} style={{maxWidth: "200px"}}/>
                    <input className="form-input" disabled value={v} />
                  </div>
                ))}

                <h3 style={{fontSize: "1rem", marginTop: '30px'}}>Tech Stack</h3>
                <div className="card-desc">Frameworks and languages auto-swapped into context.</div>
                {Object.entries(profiles.profiles.find(p => p.id === profiles.active_profile_id)?.tech_stack || {}).map(([k, v]) => (
                  <div key={k} className="key-value-row">
                    <input className="form-input" disabled value={k} style={{maxWidth: "200px"}}/>
                    <input className="form-input" disabled value={v} />
                  </div>
                ))}
              </div>
            )}
            
            <button className="btn btn-secondary" style={{marginTop: "20px"}}>+ Edit Profile</button>
          </div>
        )}

        {view === "mcp" && (
          <div>
            <h2 style={{marginTop: 0}}>Model Context Protocol</h2>
            <p className="card-desc">Manage local tools and capabilities exposed to the LLM context.</p>

            <div className="mcp-list">
              {mcpServers.map(server => (
                <div key={server.id} className="mcp-item">
                  <div className="mcp-info">
                    <span className="mcp-name">{server.name}</span>
                    <span className="mcp-desc">{server.description}</span>
                  </div>
                  <label className="switch">
                    <input 
                      type="checkbox" 
                      checked={server.enabled} 
                      onChange={(e) => toggleMcp(server.id, e.target.checked)}
                    />
                    <span className="slider"></span>
                  </label>
                </div>
              ))}
            </div>
          </div>
        )}

        {view === "session" && activeSession && (
          <div>
            <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px'}}>
              <h2 style={{margin: 0}}>Synthesized Context</h2>
              <button className="btn" onClick={() => navigator.clipboard.writeText(activeSession.content)}>
                Copy Payload
              </button>
            </div>
            
            {activeSession.missing_variables.length > 0 && (
              <div style={{background: 'rgba(255, 107, 107, 0.1)', border: '1px solid rgba(255,107,107,0.3)', padding: '15px', borderRadius: '8px', marginBottom: '20px'}}>
                <strong style={{color: '#ff6b6b'}}>Warning: Missing Variables</strong>
                <p style={{margin: '5px 0 0 0', fontSize: '0.9rem', color: 'var(--text-secondary)'}}>
                  The active profile is missing the following variables required by this template:
                  {activeSession.missing_variables.map(v => <span key={v} className="tag" style={{marginLeft: '8px', background: 'rgba(255,107,107,0.2)'}}>{v}</span>)}
                </p>
              </div>
            )}

            <div className="code-preview">
              {formatPreview(activeSession.content)}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
