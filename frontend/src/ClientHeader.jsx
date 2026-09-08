import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { ShieldCheck } from "lucide-react";
import { NotificationBell, ThemeToggle } from "./components";
import { getUserTier } from "./tierUtils";

export default function ClientHeader({
  title,
  subtitle,
  actions,
}) {
  const [user, setUser] = useState(null);
  const userTier = getUserTier(user);

  useEffect(() => {
    try {
      const saved = localStorage.getItem("user");
      if (saved) {
        setUser(JSON.parse(saved));
      }
    } catch (e) {
      console.error(e);
    }
  }, []);

  const getInitials = () => {
    if (!user) return "NB";
    const f = user.firstName ? user.firstName[0] : "";
    const l = user.lastName ? user.lastName[0] : "";
    return (f + l).toUpperCase() || "NB";
  };

  return (
    <header className="client-header">
      <div className="client-header-left">
        {title && <h1 className="client-header-title">{title}</h1>}
        {subtitle && <p className="client-header-subtitle">{subtitle}</p>}
      </div>

      <div className="client-header-right">
        {actions && <div className="client-header-actions">{actions}</div>}

        {/* Interruptor Estratégico de Tema (Modo Claro / Modo Oscuro) */}
        <ThemeToggle variant="pill" className="header-theme-toggle" />

        {/* Campana de Notificaciones */}
        <NotificationBell />

        {/* Chip de Perfil de Usuario */}
        <Link to="/account" className="client-header-user-chip" title="Ver Mi Cuenta">
          <div className="user-chip-avatar">{getInitials()}</div>
          <div className="user-chip-info">
            <span className="user-chip-name">
              {user?.firstName ? `${user.firstName} ${user.lastName || ""}` : "Usuario"}
            </span>
            <span className="user-chip-tier">
              {user?.role === "ADMIN" ? (
                <span className="chip-admin-badge">
                  <ShieldCheck size={11} /> Admin
                </span>
              ) : (
                <span style={{ color: userTier.color, fontWeight: 600 }}>
                  {userTier.label}
                </span>
              )}
            </span>
          </div>
        </Link>
      </div>
    </header>
  );
}
