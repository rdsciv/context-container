import { useState, useMemo } from "react";
import type { ContextImage, McpServer } from "../types";
import { api } from "../api";
import { ConfirmDialog } from "./ConfirmDialog";

interface ImageEditorProps {
  existingImage?: ContextImage;
  existingTemplate?: string;
  mcpServers: McpServer[];
  onSave: () => void;
  onCancel: () => void;
}

export function ImageEditor({
  existingImage,
  existingTemplate,
  mcpServers,
  onSave,
  onCancel,
}: ImageEditorProps) {
  const isEdit = !!existingImage;

  const [name, setName] = useState(existingImage?.name ?? "");
  const [description, setDescription] = useState(existingImage?.description ?? "");
  const [icon, setIcon] = useState(existingImage?.icon ?? "📄");
  const [tagsInput, setTagsInput] = useState(existingImage?.tags.join(", ") ?? "");
  const [template, setTemplate] = useState(existingTemplate ?? "");
  const [mcpDeps, setMcpDeps] = useState<string[]>(existingImage?.mcp_dependencies ?? []);
  const [showDelete, setShowDelete] = useState(false);
  const [saving, setSaving] = useState(false);

  const detectedVars = useMemo(() => {
    const matches = template.matchAll(/\{\{([\w.]+)\}\}/g);
    return [...new Set([...matches].map((m) => m[1]))];
  }, [template]);

  const parsedTags = tagsInput
    .split(",")
    .map((t) => t.trim())
    .filter(Boolean);

  const toggleDep = (serverName: string) => {
    setMcpDeps((prev) =>
      prev.includes(serverName)
        ? prev.filter((d) => d !== serverName)
        : [...prev, serverName]
    );
  };

  const handleSave = async () => {
    if (!name.trim() || !template.trim()) return;
    setSaving(true);
    try {
      const image: ContextImage = {
        id: existingImage?.id ?? `img_${crypto.randomUUID().slice(0, 8)}`,
        name: name.trim(),
        description: description.trim(),
        icon,
        version: existingImage?.version ?? "1.0.0",
        entry_file: existingImage?.entry_file ?? "template.md",
        mcp_dependencies: mcpDeps,
        required_variables: detectedVars,
        tags: parsedTags,
      };
      await api.createImage(image, template);
      onSave();
    } catch (err) {
      console.error("Failed to save image:", err);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!existingImage) return;
    try {
      await api.deleteImage(existingImage.id);
      onSave();
    } catch (err) {
      console.error("Failed to delete image:", err);
    }
  };

  return (
    <div className="image-editor">
      <h2 style={{ marginTop: 0 }}>
        {isEdit ? "Edit Context Image" : "Create Context Image"}
      </h2>

      <div className="image-editor-grid">
        <div className="image-editor-fields">
          <div className="form-group">
            <label className="form-label">Icon</label>
            <input
              className="form-input"
              value={icon}
              onChange={(e) => setIcon(e.target.value)}
              style={{ maxWidth: "80px", fontSize: "1.5rem", textAlign: "center" }}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Name</label>
            <input
              className="form-input"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="My Context Image"
              autoFocus
            />
          </div>

          <div className="form-group">
            <label className="form-label">Description</label>
            <input
              className="form-input"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="What this context does..."
            />
          </div>

          <div className="form-group">
            <label className="form-label">Tags (comma-separated)</label>
            <input
              className="form-input"
              value={tagsInput}
              onChange={(e) => setTagsInput(e.target.value)}
              placeholder="coding, review, testing"
            />
            {parsedTags.length > 0 && (
              <div className="tag-input-preview">
                {parsedTags.map((t) => (
                  <span key={t} className="tag">{t}</span>
                ))}
              </div>
            )}
          </div>

          <div className="form-group">
            <label className="form-label">MCP Dependencies</label>
            <div className="mcp-checkboxes">
              {mcpServers.map((s) => (
                <label key={s.id} className="mcp-checkbox-label">
                  <input
                    type="checkbox"
                    checked={mcpDeps.includes(s.name)}
                    onChange={() => toggleDep(s.name)}
                  />
                  <span>{s.name}</span>
                </label>
              ))}
            </div>
          </div>

          {detectedVars.length > 0 && (
            <div className="form-group">
              <label className="form-label">Detected Variables</label>
              <div className="auto-vars">
                {detectedVars.map((v) => (
                  <span key={v} className="tag tag-var">{`{{${v}}}`}</span>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="image-editor-template">
          <label className="form-label">
            Template Content
            <span style={{ fontWeight: 400, marginLeft: "8px", color: "var(--text-secondary)" }}>
              Use {"{{variable.name}}"} for profile substitution
            </span>
          </label>
          <textarea
            className="template-editor"
            value={template}
            onChange={(e) => setTemplate(e.target.value)}
            placeholder={"# Role Definition\nAct as a {{user.role}} specializing in {{framework.backend}}.\n\n# Instructions\n..."}
          />
        </div>
      </div>

      <div className="profile-actions">
        <button className="btn" onClick={handleSave} disabled={saving || !name.trim() || !template.trim()}>
          {saving ? "Saving..." : isEdit ? "Save Changes" : "Create Image"}
        </button>
        <button className="btn btn-secondary" onClick={onCancel}>
          Cancel
        </button>
        {isEdit && (
          <button
            className="btn btn-danger"
            onClick={() => setShowDelete(true)}
            style={{ marginLeft: "auto" }}
          >
            Delete Image
          </button>
        )}
      </div>

      {showDelete && existingImage && (
        <ConfirmDialog
          title="Delete Context Image"
          message={`Are you sure you want to delete "${existingImage.name}"? The template file will be permanently removed.`}
          onConfirm={handleDelete}
          onCancel={() => setShowDelete(false)}
        />
      )}
    </div>
  );
}
