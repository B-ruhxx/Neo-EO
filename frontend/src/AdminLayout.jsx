import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  Users,
  Landmark,
  ArrowLeftRight,
  FileSpreadsheet,
  Database,
  ExternalLink,
  Terminal,
  LogOut,
  ShieldCheck,
  Menu,
  X,
  ChevronRight,
} from "lucide-react";
import "./Admin.css";
import { DynamicMountainsBg } from "./components";

export default function AdminLayout({ children }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("adminToken");
    localStorage.removeItem("user");
    navigate("/login");
  };

  const isActive = (path) => {
    if (path === "/admin") {
      return location.pathname === "/admin";
    }
    return location.pathname.startsWith(path);
  };

  const navSections = [
    {
      title: "Gestión Bancaria",
      items: [
        { path: "/admin", label: "Panel Principal", icon: LayoutDashboard },
        { path: "/admin/users", label: "Usuarios", icon: Users },
        { path: "/admin/loans", label: "Préstamos", icon: Landmark },
        { path: "/admin/transactions", label: "Transacciones", icon: ArrowLeftRight },
      ],
    },
    {
      title: "Control & Auditoría",
      items: [
        { path: "/admin/reports", label: "Reportes", icon: FileSpreadsheet },
        { path: "/admin/database", label: "Base de Datos", icon: Database },
      ],
    },
  ];

  return (
    <div className="admin-dashboard">
      {/* Barra superior móvil */}
      <div className="admin-mobile-bar">
        <div className="admin-brand-compact">
          <div className="admin-logo-mark">
            <span className="logo-neon-dot"></span>
            <span className="logo-letter">N</span>
          </div>
          <span className="admin-brand-text">NEOBANK</span>
          <span className="admin-pill-tag">ADMIN</span>
        </div>
        <button
          className="admin-mobile-toggle"
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label="Alternar menú"
        >
          {mobileOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {/* Overlay para móviles */}
      {mobileOpen && (
        <div
          className="admin-sidebar-overlay"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Barra Lateral Principal */}
      <aside className={`admin-sidebar ${mobileOpen ? "open" : ""}`}>
        {/* SVG de Montañas Dinámicas en el Fondo */}
        <DynamicMountainsBg />

        {/* Cabecera de Marca */}
        <div className="admin-sidebar-header">
          <Link to="/admin" className="admin-brand-link" onClick={() => setMobileOpen(false)}>
            <div className="admin-brand-visual">
              {/* Emblema SVG Moderno Ultra Nítido */}
              <div className="admin-brand-icon">
                <svg width="28" height="28" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path
                    d="M6 8C6 6.89543 6.89543 6 8 6H24C25.1046 6 26 6.89543 26 8V11C26 12.1046 25.1046 13 24 13H8C6.89543 13 6 12.1046 6 11V8Z"
                    fill="url(#grad1)"
                  />
                  <path
                    d="M6 16C6 14.8954 6.89543 14 8 14H18C19.1046 14 20 14.8954 20 16V19C20 20.1046 19.1046 21 18 21H8C6.89543 21 6 20.1046 6 19V16Z"
                    fill="url(#grad2)"
                  />
                  <path
                    d="M6 24C6 22.8954 6.89543 22 8 22H24C25.1046 22 26 22.8954 26 24V25C26 25.5523 25.5523 26 25 26H7C6.44772 26 6 25.5523 6 25V24Z"
                    fill="url(#grad3)"
                  />
                  <defs>
                    <linearGradient id="grad1" x1="6" y1="6" x2="26" y2="13" gradientUnits="userSpaceOnUse">
                      <stop stopColor="#38bdf8" />
                      <stop offset="1" stopColor="#0284c7" />
                    </linearGradient>
                    <linearGradient id="grad2" x1="6" y1="14" x2="20" y2="21" gradientUnits="userSpaceOnUse">
                      <stop stopColor="#0284c7" />
                      <stop offset="1" stopColor="#0369a1" />
                    </linearGradient>
                    <linearGradient id="grad3" x1="6" y1="22" x2="26" y2="26" gradientUnits="userSpaceOnUse">
                      <stop stopColor="#0ea5e9" />
                      <stop offset="1" stopColor="#38bdf8" />
                    </linearGradient>
                  </defs>
                </svg>
              </div>
              <div className="admin-brand-info">
                <span className="admin-brand-title">NEOBANK</span>
                <span className="admin-brand-tagline">FINANCIAL SUITE</span>
              </div>
            </div>
          </Link>

          {/* Badge de Estado del Sistema */}
          <div className="admin-system-status">
            <span className="status-indicator-dot" />
            <span className="status-indicator-text">Consola de Control</span>
            <span className="status-env-pill">PROD</span>
          </div>
        </div>

        {/* Menú de Navegación por Secciones */}
        <nav className="admin-nav">
          {navSections.map((section, sIdx) => (
            <div key={sIdx} className="admin-nav-section">
              <span className="admin-section-heading">{section.title}</span>
              <ul className="admin-menu-list">
                {section.items.map((item) => {
                  const active = isActive(item.path);
                  const Icon = item.icon;
                  return (
                    <li key={item.path} className={`admin-menu-item ${active ? "active" : ""}`}>
                      <Link
                        to={item.path}
                        onClick={() => setMobileOpen(false)}
                        className="admin-menu-link"
                      >
                        <div className="admin-menu-icon-wrap">
                          <Icon size={19} className="admin-nav-icon" />
                        </div>
                        <span className="admin-menu-label">{item.label}</span>
                        {active && <ChevronRight size={14} className="admin-active-arrow" />}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}

          {/* Sección de Accesos Rápidos */}
          <div className="admin-nav-section">
            <span className="admin-section-heading">Accesos Externos</span>
            <ul className="admin-menu-list">
              <li className="admin-menu-item">
                <Link to="/dashboard" className="admin-menu-link" target="_blank" rel="noreferrer">
                  <div className="admin-menu-icon-wrap">
                    <ExternalLink size={17} className="admin-nav-icon" />
                  </div>
                  <span className="admin-menu-label">Portal Cliente</span>
                </Link>
              </li>
              <li className="admin-menu-item">
                <a
                  href="http://localhost:8080/h2-console"
                  className="admin-menu-link"
                  target="_blank"
                  rel="noreferrer"
                >
                  <div className="admin-menu-icon-wrap">
                    <Terminal size={17} className="admin-nav-icon" />
                  </div>
                  <span className="admin-menu-label">Consola H2</span>
                </a>
              </li>
            </ul>
          </div>
        </nav>

        {/* Pie de Barra Lateral: Tarjeta de Administrador */}
        <div className="admin-sidebar-footer">
          <div className="admin-user-card">
            <div className="admin-avatar">
              <span>AD</span>
              <span className="avatar-online-dot"></span>
            </div>
            <div className="admin-user-details">
              <div className="admin-user-name">Administrador</div>
              <div className="admin-user-role">
                <ShieldCheck size={12} className="icon-shield" /> Superuser
              </div>
            </div>
            <button
              className="admin-logout-icon-btn"
              onClick={handleLogout}
              title="Cerrar sesión de administrador"
              aria-label="Cerrar sesión"
            >
              <LogOut size={16} />
            </button>
          </div>
        </div>
      </aside>

      {/* Contenido Principal */}
      <main className="admin-main">{children}</main>
    </div>
  );
}
