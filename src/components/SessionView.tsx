import { useState } from "react";
import type { ProcessedResult, ContextImage, ProfileStore } from "../types";
import { api } from "../api";

interface SessionViewProps {
  result: ProcessedResult;
  images: ContextImage[];
  profiles: ProfileStore;
}

function formatPreview(content: string) {
  const parts = content.split(/(\[MISSING: [^\]]+\])/);
  return parts.map((part, i) => {
    if (part.startsWith("[MISSING:")) {
      return (
        <span key={i} className="missing-var">
          {part}
        </span>
      );
    }
    return <span key={i}>{part}</span>;
  });
}

export function SessionView({ result, images, profiles }: SessionViewProps) {
  const [copied, setCopied] = useState(false);
  const [showSource, setShowSource] = useState(false);
  const [rawTemplate, setRawTemplate] = useState<string | null>(null);

  const imageName = images.find((i) => i.id === result.image_id)?.name ?? "Unknown";
  const profileName =
    profiles.profiles.find((p) => p.id === result.profile_id)?.name ?? "Unknown";

  const handleCopy = async () => {
    await navigator.clipboard.writeText(result.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const toggleSource = async () => {
    if (!showSource && rawTemplate === null) {
      try {
        const content = await api.getTemplateContent(result.image_id);
        setRawTemplate(content);
      } catch (err) {
        console.error(err);
        return;
      }
    }
    setShowSource(!showSource);
  };

  return (
    <div>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "20px",
        }}
      >
        <h2 style={{ margin: 0 }}>Synthesized Context</h2>
        <div style={{ display: "flex", gap: "8px" }}>
          <button className="btn btn-secondary" onClick={toggleSource}>
            {showSource ? "Hide Source" : "View Source"}
          </button>
          <button
            className={`btn ${copied ? "btn-copied" : ""}`}
            onClick={handleCopy}
          >
            {copied ? "Copied!" : "Copy Payload"}
          </button>
        </div>
      </div>

      <div className="session-source-bar">
        Generated from <strong>{imageName}</strong> using <strong>{profileName}</strong>
      </div>

      {result.missing_variables.length > 0 && (
        <div
          style={{
            background: "rgba(255, 107, 107, 0.1)",
            border: "1px solid rgba(255,107,107,0.3)",
            padding: "15px",
            borderRadius: "8px",
            marginBottom: "20px",
          }}
        >
          <strong style={{ color: "#ff6b6b" }}>Warning: Missing Variables</strong>
          <p
            style={{
              margin: "5px 0 0 0",
              fontSize: "0.9rem",
              color: "var(--text-secondary)",
            }}
          >
            The active profile is missing the following variables required by
            this template:
            {result.missing_variables.map((v) => (
              <span
                key={v}
                className="tag"
                style={{ marginLeft: "8px", background: "rgba(255,107,107,0.2)" }}
              >
                {v}
              </span>
            ))}
          </p>
        </div>
      )}

      {showSource && rawTemplate !== null ? (
        <div className="dual-pane">
          <div>
            <div className="pane-label">Source Template</div>
            <div className="code-preview">{rawTemplate}</div>
          </div>
          <div>
            <div className="pane-label">Processed Output</div>
            <div className="code-preview">{formatPreview(result.content)}</div>
          </div>
        </div>
      ) : (
        <div className="code-preview">{formatPreview(result.content)}</div>
      )}
    </div>
  );
}
