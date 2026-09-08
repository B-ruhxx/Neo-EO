import React, { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  CreditCard,
  User,
  Settings as SettingsIcon,
  Coins,
  PiggyBank,
  ArrowLeftRight,
  BarChart3,
  Landmark,
  Receipt,
  ShieldCheck,
  LogOut,
  ChevronRight,
  ChevronLeft,
  Menu,
  X,
} from "lucide-react";
import ThemeToggle from "./ThemeToggle";
import { getUserTier } from "./tierUtils";
import { DynamicMountainsBg } from "./components";

export default function Sidebar({ active }) {
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const userTier = getUserTier(currentUser);

  useEffect(() => {
    try {
      const saved = localStorage.getItem("user");
      if (saved) {
        setCurrentUser(JSON.parse(saved));
      }
    } catch (e) {
      console.error("Error reading user from localStorage:", e);
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  // Determinar pestaña activa si no se pasó como prop
  const currentPath = location.pathname;
  const currentActive =
    active ||
    (currentPath.includes("cards")
      ? "cards"
      : currentPath.includes("analytics")
      ? "analytics"
      : currentPath.includes("loans")
      ? "loans"
      : currentPath.includes("bills")
      ? "bills"
      : currentPath.includes("transactions")
      ? "transactions"
      : currentPath.includes("vaults")
      ? "vaults"
      : currentPath.includes("account") || currentPath.includes("edit-profile")
      ? "account"
      : currentPath.includes("crypto")
      ? "crypto"
      : currentPath.includes("settings")
      ? "settings"
      : "dashboard");

  const navSections = [
    {
      title: "Banca & Cuentas",
      items: [
        { id: "dashboard", label: "Inicio", path: "/dashboard", icon: LayoutDashboard },
        { id: "transactions", label: "Movimientos", path: "/transactions", icon: ArrowLeftRight },
        { id: "cards", label: "Tarjetas", path: "/cards", icon: CreditCard },
        { id: "vaults", label: "Bóvedas", path: "/vaults", icon: PiggyBank },
      ],
    },
    {
      title: "Operaciones & Créditos",
      items: [
        { id: "loans", label: "Préstamos", path: "/loans", icon: Landmark },
        { id: "bills", label: "Servicios & Facturas", path: "/bills", icon: Receipt },
        { id: "crypto", label: "Criptomonedas", path: "/crypto", icon: Coins },
      ],
    },
    {
      title: "Mi Espacio",
      items: [
        { id: "analytics", label: "Analíticas", path: "/analytics", icon: BarChart3 },
        { id: "account", label: "Mi Cuenta", path: "/account", icon: User },
        { id: "settings", label: "Configuración", path: "/settings", icon: SettingsIcon },
      ],
    },
  ];

  const getInitials = () => {
    if (!currentUser) return "NB";
    const f = currentUser.firstName ? currentUser.firstName[0] : "";
    const l = currentUser.lastName ? currentUser.lastName[0] : "";
    return (f + l).toUpperCase() || "NB";
  };

  const isAdmin = currentUser?.role === "ADMIN";

  return (
    <>
      {/* Barra superior móvil (< 1024px) */}
      <div className="client-mobile-bar">
        <div className="client-brand-compact">
          <div className="client-logo-mark">
            <span className="logo-neon-dot" />
            <span className="logo-letter">N</span>
          </div>
          <span className="client-brand-text">NEOBANK</span>
          <span className="client-pill-tag">PERSONAL</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <ThemeToggle variant="icon" />
          <button
            type="button"
            className="client-mobile-toggle"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label={mobileOpen ? "Cerrar menú" : "Abrir menú"}
          >
            {mobileOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {/* Backdrop overlay para pantallas móviles */}
      {mobileOpen && (
        <div
          className="client-sidebar-overlay"
          onClick={() => setMobileOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Barra Lateral Principal del Cliente */}
      <aside className={`client-sidebar ${mobileOpen ? "open" : ""}`}>
        {/* SVG de Montañas Dinámicas en el Fondo */}
        <DynamicMountainsBg />

        {/* Cabecera de Marca con SVG Ultra Nítido */}
        <div className="client-sidebar-header">
          <div className="client-brand-top-row">
            <Link
              to="/dashboard"
              className="client-brand-link"
              onClick={() => setMobileOpen(false)}
            >
              <div className="client-brand-visual">
                <div className="client-brand-icon">
                  <svg
                    width="28"
                    height="28"
                    viewBox="0 0 32 32"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M6 8C6 6.89543 6.89543 6 8 6H24C25.1046 6 26 6.89543 26 8V11C26 12.1046 25.1046 13 24 13H8C6.89543 13 6 12.1046 6 11V8Z"
                      fill="url(#clientGrad1)"
                    />
                    <path
                      d="M6 16C6 14.8954 6.89543 14 8 14H18C19.1046 14 20 14.8954 20 16V19C20 20.1046 19.1046 21 18 21H8C6.89543 21 6 20.1046 6 19V16Z"
                      fill="url(#clientGrad2)"
                    />
                    <path
                      d="M6 24C6 22.8954 6.89543 22 8 22H24C25.1046 22 26 22.8954 26 24V25C26 25.5523 25.5523 26 25 26H7C6.44772 26 6 25.5523 6 25V24Z"
                      fill="url(#clientGrad3)"
                    />
                    <defs>
                      <linearGradient
                        id="clientGrad1"
                        x1="6"
                        y1="6"
                        x2="26"
                        y2="13"
                        gradientUnits="userSpaceOnUse"
                      >
                        <stop stopColor="#38bdf8" />
                        <stop offset="1" stopColor="#0284c7" />
                      </linearGradient>
                      <linearGradient
                        id="clientGrad2"
                        x1="6"
                        y1="14"
                        x2="20"
                        y2="21"
                        gradientUnits="userSpaceOnUse"
                      >
                        <stop stopColor="#38bdf8" />
                        <stop offset="1" stopColor="#0ea5e9" />
                      </linearGradient>
                      <linearGradient
                        id="clientGrad3"
                        x1="6"
                        y1="22"
                        x2="26"
                        y2="26"
                        gradientUnits="userSpaceOnUse"
                      >
                        <stop stopColor="#0ea5e9" />
                        <stop offset="1" stopColor="#38bdf8" />
                      </linearGradient>
                    </defs>
                  </svg>
                </div>
                <div className="client-brand-info">
                  <span className="client-brand-title">NEOBANK</span>
                  <span className="client-brand-tagline">BANCA PERSONAL</span>
                </div>
              </div>
            </Link>

            <button
              type="button"
              className="sidebar-collapse-btn"
              aria-label="Colapsar menú lateral"
              onClick={() => setMobileOpen(false)}
            >
              <ChevronLeft size={16} />
            </button>
          </div>

          {/* Badge de Estado de Cuenta */}
          <div className="client-system-status">
            <div className="status-indicator-left">
              <span className="status-indicator-dot" />
              <span className="status-indicator-text">Cuenta Activa</span>
            </div>
            <span
              className="status-env-pill"
              style={{
                backgroundColor: "rgba(255, 255, 255, 0.08)",
                color: "#e2e8f0",
                borderColor: "rgba(255, 255, 255, 0.14)",
                fontWeight: 700,
              }}
            >
              {userTier?.shortName || "GOLD"}
            </span>
          </div>
        </div>

        {/* Menú de Navegación por Secciones */}
        <nav className="client-nav" aria-label="Navegación principal">
          {navSections.map((section, sIdx) => (
            <div key={sIdx} className="client-nav-section">
              <span className="client-section-heading">{section.title}</span>
              <ul className="client-menu-list">
                {section.items.map((item) => {
                  const active = currentActive === item.id;
                  const Icon = item.icon;
                  return (
                    <li
                      key={item.id}
                      className={`client-menu-item ${active ? "active" : ""}`}
                    >
                      <Link
                        to={item.path}
                        onClick={() => setMobileOpen(false)}
                        className="client-menu-link"
                        aria-current={active ? "page" : undefined}
                      >
                        <div className="client-menu-icon-wrap">
                          <Icon size={19} className="client-nav-icon" />
                        </div>
                        <span className="client-menu-label">{item.label}</span>
                        {active && (
                          <ChevronRight size={14} className="client-active-arrow" />
                        )}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}

          {/* Acceso Rápido al Panel Admin si el usuario tiene rol ADMIN */}
          {isAdmin && (
            <div className="client-nav-section">
              <span className="client-section-heading">Superusuario</span>
              <ul className="client-menu-list">
                <li className="client-menu-item">
                  <Link
                    to="/admin"
                    onClick={() => setMobileOpen(false)}
                    className="client-menu-link admin-switch-link"
                  >
                    <div className="client-menu-icon-wrap">
                      <ShieldCheck size={19} className="client-nav-icon" style={{ color: "#38bdf8" }} />
                    </div>
                    <span className="client-menu-label" style={{ color: "#7dd3fc", fontWeight: 600 }}>
                      Panel Administrador
                    </span>
                    <span className="admin-shortcut-tag">ADMIN</span>
                  </Link>
                </li>
              </ul>
            </div>
          )}
        </nav>

        {/* Pie de Barra Lateral: Perfil del Usuario & Theme Switcher */}
        <div className="client-sidebar-footer">
          <div className="client-user-card">
            <Link to="/account" className="client-user-info-link" title="Ver mi cuenta">
              <div className="client-user-avatar">{getInitials()}</div>
              <div className="client-user-details">
                <span className="client-user-name">
                  {currentUser?.firstName
                    ? `${currentUser.firstName} ${currentUser.lastName || ""}`
                    : "Usuario"}
                </span>
                <span className="client-user-balance">
                  {typeof currentUser?.balance === "number"
                    ? `$${currentUser.balance.toLocaleString("en-US", { minimumFractionDigits: 2 })} USD`
                    : "Cuenta Activa"}
                </span>
              </div>
            </Link>

            <div className="client-footer-actions">
              <ThemeToggle variant="icon" className="sidebar-theme-toggle" />
              <button
                type="button"
                className="client-logout-btn"
                onClick={handleLogout}
                title="Cerrar Sesión"
                aria-label="Cerrar Sesión"
              >
                <LogOut size={16} />
              </button>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
