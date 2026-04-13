import { useState } from "react";
import type { Profile, ProfileStore } from "../types";
import { api } from "../api";
import { ConfirmDialog } from "./ConfirmDialog";

interface ProfilesViewProps {
  profiles: ProfileStore;
  onReload: () => void;
}

type KVList = Array<[string, string]>;

const toKVList = (record: Record<string, string>): KVList =>
  Object.entries(record);

const toRecord = (list: KVList): Record<string, string> =>
  Object.fromEntries(list);

export function ProfilesView({ profiles, onReload }: ProfilesViewProps) {
  const [editing, setEditing] = useState(false);
  const [editName, setEditName] = useState("");
  const [editMeta, setEditMeta] = useState<KVList>([]);
  const [editStack, setEditStack] = useState<KVList>([]);
  const [editId, setEditId] = useState<string | null>(null);
  const [isNew, setIsNew] = useState(false);
  const [showDelete, setShowDelete] = useState(false);

  const activeProfile = profiles.profiles.find(
    (p) => p.id === profiles.active_profile_id
  );

  const startEdit = (profile: Profile) => {
    setEditId(profile.id);
    setEditName(profile.name);
    setEditMeta(toKVList(profile.metadata));
    setEditStack(toKVList(profile.tech_stack));
    setEditing(true);
    setIsNew(false);
  };

  const startNew = () => {
    const id = `prof_${crypto.randomUUID().slice(0, 8)}`;
    setEditId(id);
    setEditName("");
    setEditMeta([["", ""]]);
    setEditStack([["", ""]]);
    setEditing(true);
    setIsNew(true);
  };

  const cancelEdit = () => {
    setEditing(false);
    setEditId(null);
    setIsNew(false);
  };

  const saveProfile = async () => {
    if (!editId) return;
    const profile: Profile = {
      id: editId,
      name: editName || "Untitled Profile",
      metadata: toRecord(editMeta.filter(([k]) => k.trim() !== "")),
      tech_stack: toRecord(editStack.filter(([k]) => k.trim() !== "")),
    };
    try {
      await api.saveProfile(profile);
      if (isNew) {
        await api.setActiveProfile(profile.id);
      }
      onReload();
      cancelEdit();
    } catch (err) {
      console.error("Failed to save profile:", err);
    }
  };

  const deleteProfile = async () => {
    if (!activeProfile) return;
    try {
      await api.deleteProfile(activeProfile.id);
      onReload();
      setShowDelete(false);
    } catch (err) {
      console.error("Failed to delete profile:", err);
    }
  };

  const updateKV = (
    list: KVList,
    setList: (l: KVList) => void,
    index: number,
    pos: 0 | 1,
    value: string
  ) => {
    const updated = [...list];
    updated[index] = [...updated[index]] as [string, string];
    updated[index][pos] = value;
    setList(updated);
  };

  const removeKV = (list: KVList, setList: (l: KVList) => void, index: number) => {
    setList(list.filter((_, i) => i !== index));
  };

  const addKV = (list: KVList, setList: (l: KVList) => void) => {
    setList([...list, ["", ""]]);
  };

  const renderKVRows = (
    list: KVList,
    setList: (l: KVList) => void,
    readOnly: boolean
  ) =>
    list.map(([k, v], i) => (
      <div key={i} className="key-value-row">
        <input
          className="form-input"
          disabled={readOnly}
          value={k}
          placeholder="variable.name"
          style={{ maxWidth: "200px" }}
          onChange={(e) => updateKV(list, setList, i, 0, e.target.value)}
        />
        <input
          className="form-input"
          disabled={readOnly}
          value={v}
          placeholder="value"
          onChange={(e) => updateKV(list, setList, i, 1, e.target.value)}
        />
        {!readOnly && (
          <button
            className="btn btn-icon"
            onClick={() => removeKV(list, setList, i)}
            title="Remove"
          >
            &times;
          </button>
        )}
      </div>
    ));

  // Edit mode
  if (editing) {
    return (
      <div>
        <h2 style={{ marginTop: 0 }}>{isNew ? "New Profile" : "Edit Profile"}</h2>

        <div className="form-group">
          <label className="form-label">Profile Name</label>
          <input
            className="form-input profile-edit-header"
            value={editName}
            onChange={(e) => setEditName(e.target.value)}
            placeholder="My Profile"
            autoFocus
          />
        </div>

        <h3 style={{ fontSize: "1rem" }}>Metadata</h3>
        <div className="card-desc">
          Personal details auto-swapped into context.
        </div>
        {renderKVRows(editMeta, setEditMeta, false)}
        <button
          className="btn btn-secondary btn-sm"
          onClick={() => addKV(editMeta, setEditMeta)}
          style={{ marginTop: "8px" }}
        >
          + Add Field
        </button>

        <h3 style={{ fontSize: "1rem", marginTop: "30px" }}>Tech Stack</h3>
        <div className="card-desc">
          Frameworks and languages auto-swapped into context.
        </div>
        {renderKVRows(editStack, setEditStack, false)}
        <button
          className="btn btn-secondary btn-sm"
          onClick={() => addKV(editStack, setEditStack)}
          style={{ marginTop: "8px" }}
        >
          + Add Field
        </button>

        <div className="profile-actions">
          <button className="btn" onClick={saveProfile}>
            Save Profile
          </button>
          <button className="btn btn-secondary" onClick={cancelEdit}>
            Cancel
          </button>
        </div>
      </div>
    );
  }

  // View mode
  return (
    <div>
      <h2 style={{ marginTop: 0 }}>Active Profile</h2>
      <div className="profile-selector">
        <select
          className="profile-select"
          value={profiles.active_profile_id}
          onChange={(e) => {
            api.setActiveProfile(e.target.value).then(onReload);
          }}
        >
          {profiles.profiles.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name}
            </option>
          ))}
        </select>
      </div>

      {activeProfile && (
        <div>
          <h3 style={{ fontSize: "1rem" }}>Metadata</h3>
          <div className="card-desc">
            Personal details auto-swapped into context.
          </div>
          {renderKVRows(toKVList(activeProfile.metadata), () => {}, true)}

          <h3 style={{ fontSize: "1rem", marginTop: "30px" }}>Tech Stack</h3>
          <div className="card-desc">
            Frameworks and languages auto-swapped into context.
          </div>
          {renderKVRows(toKVList(activeProfile.tech_stack), () => {}, true)}
        </div>
      )}

      <div className="profile-actions">
        {activeProfile && (
          <button className="btn" onClick={() => startEdit(activeProfile)}>
            Edit Profile
          </button>
        )}
        <button className="btn btn-secondary" onClick={startNew}>
          + New Profile
        </button>
        {profiles.profiles.length > 1 && (
          <button className="btn btn-danger" onClick={() => setShowDelete(true)}>
            Delete
          </button>
        )}
      </div>

      {showDelete && activeProfile && (
        <ConfirmDialog
          title="Delete Profile"
          message={`Are you sure you want to delete "${activeProfile.name}"? This action cannot be undone.`}
          onConfirm={deleteProfile}
          onCancel={() => setShowDelete(false)}
        />
      )}
    </div>
  );
}
