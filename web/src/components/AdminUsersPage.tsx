// components/AdminUsersPage.tsx
//
// The admin-only screen for creating and managing users. Role/capability
// controls (the checkboxes for Admin/Master access) only appear for a
// MASTER user — an ADMIN can still create and activate/deactivate
// users, but has no way to grant or change anyone's capabilities. This
// mirrors the backend's real enforcement (routes/users.ts's isMaster
// check); hiding the controls here is just UX, not the actual security
// boundary.

import { useEffect, useState, type FormEvent } from "react";
import {
  listUsers,
  createUser,
  setUserActive,
  setUserCapabilities,
  type AdminUser,
  type NewUserResult,
} from "../lib/users";
import { useAuth, ApiError } from "../context/AuthContext";

export function AdminUsersPage() {
  const { user: currentUser } = useAuth();
  const isMaster = currentUser?.capabilities.includes("master") ?? false;

  const [users, setUsers] = useState<AdminUser[] | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);

  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [grantAdmin, setGrantAdmin] = useState(false);
  const [grantMaster, setGrantMaster] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);

  // Holds the result of the most recent creation, so the temporary
  // password can be shown ONCE. It's never fetchable again after this
  // (see routes/users.ts's comment on why), so this is the only chance
  // the admin has to see/copy it.
  const [justCreated, setJustCreated] = useState<NewUserResult | null>(null);

  function refreshUsers() {
    listUsers()
      .then(setUsers)
      .catch((err) => setLoadError(err instanceof ApiError ? err.message : "Failed to load users"));
  }

  useEffect(() => {
    refreshUsers();
  }, []);

  async function handleCreate(e: FormEvent) {
    e.preventDefault();
    setCreateError(null);
    setJustCreated(null);
    setIsCreating(true);
    try {
      const capabilities: string[] = [];
      if (isMaster && grantAdmin) capabilities.push("admin");
      if (isMaster && grantMaster) capabilities.push("master");

      const result = await createUser({ email, name, capabilities });
      setJustCreated(result);
      setEmail("");
      setName("");
      setGrantAdmin(false);
      setGrantMaster(false);
      refreshUsers();
    } catch (err) {
      setCreateError(err instanceof ApiError ? err.message : "Failed to create user");
    } finally {
      setIsCreating(false);
    }
  }

  async function handleToggleActive(user: AdminUser) {
    try {
      await setUserActive(user.id, !user.isActive);
      refreshUsers();
    } catch (err) {
      alert(err instanceof ApiError ? err.message : "Failed to update user");
    }
  }

  async function handleToggleCapability(user: AdminUser, capability: string) {
    const has = user.capabilities.includes(capability);
    const next = has ? user.capabilities.filter((c) => c !== capability) : [...user.capabilities, capability];
    try {
      await setUserCapabilities(user.id, next);
      refreshUsers();
    } catch (err) {
      alert(err instanceof ApiError ? err.message : "Failed to update capabilities");
    }
  }

  return (
    <div>
      <h2 style={{ fontSize: "1.1rem" }}>Users</h2>

      <form
        onSubmit={handleCreate}
        style={{ display: "flex", flexDirection: "column", gap: "0.5rem", maxWidth: 320, marginBottom: "1.5rem" }}
      >
        <label style={{ display: "flex", flexDirection: "column", gap: "0.25rem" }}>
          Name
          <input value={name} onChange={(e) => setName(e.target.value)} required style={{ padding: "0.4rem" }} />
        </label>
        <label style={{ display: "flex", flexDirection: "column", gap: "0.25rem" }}>
          Email
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            style={{ padding: "0.4rem" }}
          />
        </label>

        {/* Role controls only shown to a MASTER user — an ADMIN has no
            way to grant capabilities, so showing disabled/no-op
            checkboxes to them would just be confusing. */}
        {isMaster && (
          <>
            <label style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
              <input type="checkbox" checked={grantAdmin} onChange={(e) => setGrantAdmin(e.target.checked)} />
              Admin access
            </label>
            <label style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
              <input type="checkbox" checked={grantMaster} onChange={(e) => setGrantMaster(e.target.checked)} />
              Master access
            </label>
          </>
        )}

        {createError && <div style={{ color: "#dc2626", fontSize: "0.9rem" }}>{createError}</div>}
        <button type="submit" disabled={isCreating} style={{ padding: "0.5rem", cursor: "pointer" }}>
          {isCreating ? "Creating..." : "Create user"}
        </button>
      </form>

      {justCreated && (
        <div
          style={{
            border: "1px solid #16a34a",
            borderRadius: 8,
            padding: "0.75rem 1rem",
            marginBottom: "1.5rem",
            maxWidth: 400,
          }}
        >
          <p style={{ margin: 0, fontWeight: 600 }}>
            {justCreated.name} created — share this temporary password now
          </p>
          <p style={{ margin: "0.4rem 0 0", fontSize: "0.85rem", color: "#666" }}>
            This is shown once and cannot be retrieved again.
          </p>
          <code
            style={{
              display: "block",
              marginTop: "0.5rem",
              padding: "0.4rem 0.6rem",
              background: "#f3f4f6",
              borderRadius: 4,
              fontSize: "0.95rem",
            }}
          >
            {justCreated.temporaryPassword}
          </code>
        </div>
      )}

      {loadError && <div style={{ color: "#dc2626" }}>{loadError}</div>}

      {users && (
        <table style={{ borderCollapse: "collapse", width: "100%", maxWidth: 700 }}>
          <thead>
            <tr style={{ textAlign: "left", borderBottom: "1px solid #ddd" }}>
              <th style={{ padding: "0.4rem" }}>Name</th>
              <th style={{ padding: "0.4rem" }}>Email</th>
              <th style={{ padding: "0.4rem" }}>Status</th>
              {isMaster && <th style={{ padding: "0.4rem" }}>Admin</th>}
              {isMaster && <th style={{ padding: "0.4rem" }}>Master</th>}
              {!isMaster && <th style={{ padding: "0.4rem" }}>Capabilities</th>}
              <th style={{ padding: "0.4rem" }}></th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.id} style={{ borderBottom: "1px solid #eee" }}>
                <td style={{ padding: "0.4rem" }}>{user.name}</td>
                <td style={{ padding: "0.4rem" }}>{user.email}</td>
                <td style={{ padding: "0.4rem" }}>{user.isActive ? "Active" : "Deactivated"}</td>

                {/* Master users get live, clickable checkboxes that
                    immediately call the API — no separate "edit mode,"
                    since there are only two capabilities to manage
                    today. Non-master users just see a read-only summary
                    instead, since they can't change any of this. */}
                {isMaster && (
                  <td style={{ padding: "0.4rem" }}>
                    <input
                      type="checkbox"
                      checked={user.capabilities.includes("admin")}
                      onChange={() => handleToggleCapability(user, "admin")}
                    />
                  </td>
                )}
                {isMaster && (
                  <td style={{ padding: "0.4rem" }}>
                    <input
                      type="checkbox"
                      checked={user.capabilities.includes("master")}
                      onChange={() => handleToggleCapability(user, "master")}
                    />
                  </td>
                )}
                {!isMaster && <td style={{ padding: "0.4rem" }}>{user.capabilities.join(", ") || "—"}</td>}

                <td style={{ padding: "0.4rem" }}>
                  <button onClick={() => handleToggleActive(user)} style={{ cursor: "pointer" }}>
                    {user.isActive ? "Deactivate" : "Reactivate"}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}