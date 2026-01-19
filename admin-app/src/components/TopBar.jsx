import React from "react";
import { useAuth } from "../auth/AuthProvider";

function getInitials(name = "") {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (!parts.length) return "?";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

export default function TopBar({
  title = "Battle of Platoons",
  userName,
  userRole = "Admin",
  avatarUrl,
  onLogout,
} = {}) {
  const { user, logout } = useAuth();
  const resolvedName =
    userName ||
    user?.user_metadata?.full_name ||
    user?.user_metadata?.name ||
    user?.email ||
    "Admin";
  const resolvedAvatar =
    avatarUrl || user?.user_metadata?.avatar_url || user?.user_metadata?.avatarUrl || null;
  const handleLogout = onLogout || logout;

  return (
    <header className="admin-topbar">
      <div className="admin-topbar__inner">
        <div className="admin-topbar__content">
          <div className="admin-topbar__brand">
            <img src="/gg-logo.png" alt="Grinders Guild logo" className="admin-topbar__logo" />
            <div className="admin-topbar__brand-text">Grinders Guild</div>
          </div>

          <div className="admin-topbar__title">{title}</div>

          <div className="admin-topbar__user">
            <div className="admin-topbar__avatar" aria-hidden="true">
              {resolvedAvatar ? (
                <img
                  src={resolvedAvatar}
                  alt=""
                  className="admin-topbar__avatar-img"
                />
              ) : (
                <span className="admin-topbar__avatar-fallback">
                  {getInitials(resolvedName)}
                </span>
              )}
            </div>
            <div className="admin-topbar__meta">
              <div className="admin-topbar__name">{resolvedName}</div>
              <div className="admin-topbar__role">{userRole}</div>
            </div>

            <button className="admin-topbar__logout" onClick={handleLogout}>
              Logout
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
