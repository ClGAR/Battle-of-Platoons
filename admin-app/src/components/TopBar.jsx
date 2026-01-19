import React, { useEffect, useRef, useState } from "react";
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
  const [open, setOpen] = useState(false);
  const menuRef = useRef(null);
  const resolvedName =
    userName ||
    user?.user_metadata?.full_name ||
    user?.user_metadata?.name ||
    user?.email ||
    "Admin";
  const resolvedAvatar =
    avatarUrl || user?.user_metadata?.avatar_url || user?.user_metadata?.avatarUrl || null;
  const handleLogout = onLogout || logout;

  useEffect(() => {
    const handler = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <header className="admin-topbar">
      <div className="admin-topbar__inner">
        <div className="admin-topbar__content">
          <div className="admin-topbar__title">{title}</div>

          <div className="admin-topbar__user" ref={menuRef}>
            <button
              className="admin-topbar__trigger"
              onClick={() => setOpen((prev) => !prev)}
              type="button"
            >
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
              <span className={`admin-topbar__chevron ${open ? "is-open" : ""}`}>▾</span>
            </button>

            {open && (
              <div className="admin-topbar__menu" role="menu">
                <button
                  className="admin-topbar__menu-item admin-topbar__menu-item--logout"
                  type="button"
                  onClick={handleLogout}
                  role="menuitem"
                >
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
