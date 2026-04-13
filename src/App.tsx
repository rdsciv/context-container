import { useEffect, useState } from "react";
import { api } from "./api";
import type { ViewState, ProfileStore, ContextImage, McpServer, ProcessedResult } from "./types";
import { Dashboard } from "./components/Dashboard";
import { ProfilesView } from "./components/ProfilesView";
import { McpView } from "./components/McpView";
import { SessionView } from "./components/SessionView";
import { ImageEditor } from "./components/ImageEditor";
import "./App.css";

function App() {
  const [viewState, setViewState] = useState<ViewState>({ view: "dashboard" });
  const [profiles, setProfiles] = useState<ProfileStore | null>(null);
  const [images, setImages] = useState<ContextImage[]>([]);
  const [mcpServers, setMcpServers] = useState<McpServer[]>([]);
  const [activeSession, setActiveSession] = useState<ProcessedResult | null>(null);
  const [editTemplate, setEditTemplate] = useState<string>("");

  const view = viewState.view;

  useEffect(() => {
    api.initApp().then(() => loadData()).catch(console.error);
  }, []);

  const loadData = async () => {
    try {
      const [p, i, m] = await Promise.all([
        api.getProfiles(),
        api.getImages(),
        api.getMcpServers(),
      ]);
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
      setViewState({ view: "session" });
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

  const handleEditImage = async (imageId: string) => {
    try {
      const content = await api.getTemplateContent(imageId);
      setEditTemplate(content);
      setViewState({ view: "edit-image", editImageId: imageId });
    } catch (err) {
      console.error(err);
    }
  };

  const handleImageSaved = () => {
    loadData();
    setViewState({ view: "dashboard" });
  };

  const editingImage = view === "edit-image"
    ? images.find((img) => img.id === viewState.editImageId)
    : undefined;

  return (
    <div className="app-container">
      <div className="sidebar">
        <div className="sidebar-title">Context Container</div>

        <div
          className={`nav-item ${view === "dashboard" || view === "create-image" || view === "edit-image" ? "active" : ""}`}
          onClick={() => setViewState({ view: "dashboard" })}
        >
          <span>📦</span> Images
        </div>

        <div
          className={`nav-item ${view === "profiles" ? "active" : ""}`}
          onClick={() => setViewState({ view: "profiles" })}
        >
          <span>👤</span> Profiles
        </div>

        <div
          className={`nav-item ${view === "mcp" ? "active" : ""}`}
          onClick={() => setViewState({ view: "mcp" })}
        >
          <span>🔌</span> MCP Servers
        </div>

        {activeSession && (
          <div
            className={`nav-item ${view === "session" ? "active" : ""}`}
            onClick={() => setViewState({ view: "session" })}
            style={{ marginTop: "auto", borderTop: "1px solid var(--border-color)" }}
          >
            <span>🟢</span> Active Session
          </div>
        )}
      </div>

      <div className="main-content">
        {view === "dashboard" && (
          <Dashboard
            images={images}
            mcpServers={mcpServers}
            onProcessContext={handleProcessContext}
            onCreateImage={() => setViewState({ view: "create-image" })}
            onEditImage={handleEditImage}
          />
        )}

        {view === "profiles" && profiles && (
          <ProfilesView profiles={profiles} onReload={loadData} />
        )}

        {view === "mcp" && (
          <McpView servers={mcpServers} onToggle={toggleMcp} />
        )}

        {view === "session" && activeSession && profiles && (
          <SessionView result={activeSession} images={images} profiles={profiles} />
        )}

        {view === "create-image" && (
          <ImageEditor
            mcpServers={mcpServers}
            onSave={handleImageSaved}
            onCancel={() => setViewState({ view: "dashboard" })}
          />
        )}

        {view === "edit-image" && editingImage && (
          <ImageEditor
            existingImage={editingImage}
            existingTemplate={editTemplate}
            mcpServers={mcpServers}
            onSave={handleImageSaved}
            onCancel={() => setViewState({ view: "dashboard" })}
          />
        )}
      </div>
    </div>
  );
}

export default App;
