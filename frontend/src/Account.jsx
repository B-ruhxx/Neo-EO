import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import {
  User,
  Mail,
  Phone,
  MapPin,
  CreditCard,
  ShieldCheck,
  PiggyBank,
  FileText,
  Copy,
  Edit3,
  Lock,
  Smartphone,
  CheckCircle2,
  Building2,
  Printer,
  Sparkles,
  KeyRound,
  Award,
  TrendingUp,
  Zap,
  HelpCircle,
} from "lucide-react";
import ClientLayout from "./ClientLayout";
import MetricCard from "./MetricCard";
import SegmentedTabs from "./SegmentedTabs";
import Modal from "./Modal";
import { getUserTier, TIERS } from "./tierUtils";
import "./Account.css";

export default function Account() {
  const navigate = useNavigate();
  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem("user");
      return saved ? JSON.parse(saved) : null;
    } catch (e) {
      return null;
    }
  });
  const [activeTab, setActiveTab] = useState("personal");
  const [copiedField, setCopiedField] = useState(null);

  // Modales
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [isCertModalOpen, setIsCertModalOpen] = useState(false);

  // Estado del formulario de edición
  const [editForm, setEditForm] = useState(() => {
    try {
      const saved = localStorage.getItem("user");
      const parsed = saved ? JSON.parse(saved) : null;
      return {
        firstName: parsed?.firstName || "",
        lastName: parsed?.lastName || "",
        phoneNumber: parsed?.phoneNumber || "",
        address: parsed?.address || "",
        city: parsed?.city || "",
        postalCode: parsed?.postalCode || "",
        country: parsed?.country || "",
      };
    } catch (e) {
      return {
        firstName: "",
        lastName: "",
        phoneNumber: "",
        address: "",
        city: "",
        postalCode: "",
        country: "",
      };
    }
  });
  const [isSaving, setIsSaving] = useState(false);

  // Estado del formulario de contraseña
  const [passwordForm, setPasswordForm] = useState({
    oldPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [passwordMsg, setPasswordMsg] = useState({ type: "", text: "" });

  // Estado de 2FA
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(true);

  const token = localStorage.getItem("token");

  useEffect(() => {
    if (!token) {
      navigate("/login");
      return;
    }

    const fetchUser = async () => {
      try {
        const res = await axios.get("http://localhost:8080/api/auth/me", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setUser(res.data);
        setEditForm({
          firstName: res.data.firstName || "",
          lastName: res.data.lastName || "",
          phoneNumber: res.data.phoneNumber || "",
          address: res.data.address || "",
          city: res.data.city || "",
          postalCode: res.data.postalCode || "",
          country: res.data.country || "",
        });
      } catch (err) {
        console.error("Error al obtener datos del usuario:", err);
      }
    };

    fetchUser();
  }, [navigate, token]);

  const copyToClipboard = (text, label) => {
    if (!text) return;
    navigator.clipboard.writeText(String(text));
    setCopiedField(label);
    setTimeout(() => setCopiedField(null), 2500);
  };

  const handleEditChange = (e) => {
    setEditForm({ ...editForm, [e.target.name]: e.target.value });
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const res = await axios.put(
        "http://localhost:8080/api/auth/me",
        editForm,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );
      setUser(res.data);
      localStorage.setItem("user", JSON.stringify(res.data));
      setIsEditModalOpen(false);
      copyToClipboard("saved", "¡Perfil actualizado con éxito!");
    } catch (err) {
      console.error("Error al actualizar perfil:", err);
      alert("Hubo un error al actualizar los datos. Por favor intenta de nuevo.");
    } finally {
      setIsSaving(false);
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setPasswordMsg({
        type: "error",
        text: "Las nuevas contraseñas no coinciden.",
      });
      return;
    }

    try {
      await axios.patch(
        "http://localhost:8080/auth/change-password",
        {
          oldPassword: passwordForm.oldPassword,
          newPassword: passwordForm.newPassword,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );
      setPasswordMsg({
        type: "success",
        text: "Contraseña cambiada exitosamente.",
      });
      setPasswordForm({ oldPassword: "", newPassword: "", confirmPassword: "" });
      setTimeout(() => {
        setIsPasswordModalOpen(false);
        setPasswordMsg({ type: "", text: "" });
      }, 1500);
    } catch (err) {
      console.error("Error al cambiar contraseña:", err);
      setPasswordMsg({
        type: "error",
        text: "Verifica tu contraseña actual e intenta nuevamente.",
      });
    }
  };

  if (!user) {
    return (
      <ClientLayout active="account" title="Mi Cuenta">
        <div style={{ padding: "40px", textAlign: "center", color: "var(--text-muted)" }}>
          Cargando información del usuario...
        </div>
      </ClientLayout>
    );
  }

  const initials = (
    (user.firstName ? user.firstName[0] : "") +
    (user.lastName ? user.lastName[0] : "")
  ).toUpperCase() || "NB";

  const accountNumber = `NEO-${String(user.id || 1).padStart(4, "0")}-4102-8891`;
  const ibanNumber = `PE91 0021 0004 1845 0200 ${String(user.id || 1).padStart(4, "0")}`;
  const userTier = getUserTier(user);

  const tabs = [
    { id: "personal", label: "Datos Personales", icon: User },
    { id: "membership", label: "Nivel & Membresía", icon: Sparkles },
    { id: "security", label: "Seguridad & Accesos", icon: ShieldCheck },
    { id: "banking", label: "Datos Bancarios & Certificados", icon: Building2 },
  ];

  return (
    <ClientLayout
      active="account"
      title="Mi Cuenta"
      subtitle="Gestiona tu información personal, seguridad y acreditaciones bancarias"
    >
      <div className="account-page-wrapper">
        {/* Toast Notificación */}
        {copiedField && (
          <div className="copy-toast">
            <CheckCircle2 size={16} style={{ display: "inline", marginRight: "6px" }} />
            {copiedField === "saved" ? "Perfil actualizado" : `Copiado: ${copiedField}`}
          </div>
        )}

        {/* 1. Cuadrícula de Métricas KPI Superiores (MetricCard) */}
        <div className="account-kpi-grid">
          <MetricCard
            title="Saldo Consolidado"
            value={`$${Number(user.balance || 0).toLocaleString("en-US", { minimumFractionDigits: 2 })} USD`}
            subtitle="Cuenta corriente principal"
            icon={CreditCard}
            accent="emerald"
            graphicType="wave"
            badge="+2.4% este mes"
            badgeType="success"
          />

          <MetricCard
            title="Tarjetas Vinculadas"
            value="3 Tarjetas"
            subtitle="1 Débito física • 2 Virtuales"
            icon={CreditCard}
            accent="primary"
            graphicType="cards"
            badge="Activas"
            badgeType="info"
            onClick={() => navigate("/cards")}
          />

          <MetricCard
            title="Bóvedas de Ahorro"
            value="2 Metas"
            subtitle="Rendimiento APY 4.5%"
            icon={PiggyBank}
            accent="cyan"
            graphicType="vault"
            badge="Generando Interés"
            badgeType="success"
            onClick={() => navigate("/vaults")}
          />

          <MetricCard
            title="Salud de Seguridad"
            value="95% Segura"
            subtitle="2FA y Contraseña Robustas"
            icon={ShieldCheck}
            accent="info"
            graphicType="security"
            badge="Excelente"
            badgeType="success"
          />
        </div>

        {/* 2. Hero Banner Ejecutivo de Perfil */}
        <div className="account-hero-card">
          <div className="account-hero-left">
            <div className="account-avatar-wrapper">
              <div className="account-large-avatar">{initials}</div>
              <span className="account-avatar-status" title="En línea" />
            </div>

            <div className="account-hero-info">
              <h2 className="account-hero-name">
                {user.firstName} {user.lastName}
              </h2>

              <div className="account-hero-tags">
                <span className="account-verified-pill">
                  <CheckCircle2 size={12} /> Cuenta Verificada
                </span>
                <button
                  type="button"
                  className="account-tier-pill"
                  style={{
                    background: userTier.bgSubtle,
                    color: userTier.color,
                    borderColor: userTier.borderColor,
                    cursor: "pointer",
                  }}
                  onClick={() => setActiveTab("membership")}
                  title="Ver detalles y beneficios de tu nivel de cliente"
                >
                  <Sparkles size={12} /> {userTier.name}
                </button>
                <button
                  type="button"
                  className="account-id-pill"
                  onClick={() => copyToClipboard(accountNumber, "No. de Cuenta")}
                  title="Clic para copiar"
                >
                  <Copy size={11} /> {accountNumber}
                </button>
              </div>
            </div>
          </div>

          <div className="account-hero-actions">
            <button
              type="button"
              className="btn-hero-primary"
              onClick={() => setIsEditModalOpen(true)}
            >
              <Edit3 size={15} /> Editar Información
            </button>
            <button
              type="button"
              className="btn-hero-secondary"
              onClick={() => setIsCertModalOpen(true)}
            >
              <FileText size={15} /> Ficha Bancaria
            </button>
          </div>
        </div>

        {/* 3. Barra de Pestañas Segmentadas */}
        <div className="account-tabs-container">
          <SegmentedTabs
            tabs={tabs}
            activeTab={activeTab}
            onChange={(tabId) => setActiveTab(tabId)}
          />
        </div>

        {/* 4. Contenedor de Contenido según Pestaña */}
        <div className="account-tab-content-card">
          {/* Pestaña: Datos Personales */}
          {activeTab === "personal" && (
            <div>
              <div className="account-section-header">
                <div>
                  <h3 className="account-section-title">
                    <User size={18} /> Información de Identidad del Cliente
                  </h3>
                  <p className="account-section-subtitle">
                    Datos validados conforme a las normativas de banca digital y KYC
                  </p>
                </div>
                <button
                  type="button"
                  className="btn-hero-secondary"
                  style={{ height: "36px", fontSize: "12px" }}
                  onClick={() => setIsEditModalOpen(true)}
                >
                  <Edit3 size={13} /> Modificar
                </button>
              </div>

              <div className="profile-fields-grid" style={{ marginTop: "20px" }}>
                <div className="profile-field-item">
                  <span className="profile-field-label">
                    <User size={12} /> Nombre(s)
                  </span>
                  <p className="profile-field-value">{user.firstName || "—"}</p>
                </div>

                <div className="profile-field-item">
                  <span className="profile-field-label">
                    <User size={12} /> Apellidos
                  </span>
                  <p className="profile-field-value">{user.lastName || "—"}</p>
                </div>

                <div className="profile-field-item">
                  <span className="profile-field-label">
                    <Mail size={12} /> Correo Electrónico
                  </span>
                  <p className="profile-field-value">{user.email || "—"}</p>
                </div>

                <div className="profile-field-item">
                  <span className="profile-field-label">
                    <Phone size={12} /> Teléfono Móvil
                  </span>
                  {user.phoneNumber ? (
                    <p className="profile-field-value">{user.phoneNumber}</p>
                  ) : (
                    <span
                      className="profile-field-empty"
                      onClick={() => setIsEditModalOpen(true)}
                    >
                      + Configurar número de teléfono
                    </span>
                  )}
                </div>

                <div className="profile-field-item">
                  <span className="profile-field-label">
                    <MapPin size={12} /> Dirección Residencial
                  </span>
                  {user.address ? (
                    <p className="profile-field-value">{user.address}</p>
                  ) : (
                    <span
                      className="profile-field-empty"
                      onClick={() => setIsEditModalOpen(true)}
                    >
                      + Agregar dirección residencial
                    </span>
                  )}
                </div>

                <div className="profile-field-item">
                  <span className="profile-field-label">
                    <Building2 size={12} /> Ciudad
                  </span>
                  {user.city ? (
                    <p className="profile-field-value">{user.city}</p>
                  ) : (
                    <span
                      className="profile-field-empty"
                      onClick={() => setIsEditModalOpen(true)}
                    >
                      + Agregar ciudad
                    </span>
                  )}
                </div>

                <div className="profile-field-item">
                  <span className="profile-field-label">
                    <MapPin size={12} /> Código Postal
                  </span>
                  {user.postalCode ? (
                    <p className="profile-field-value">{user.postalCode}</p>
                  ) : (
                    <span
                      className="profile-field-empty"
                      onClick={() => setIsEditModalOpen(true)}
                    >
                      + Agregar código postal
                    </span>
                  )}
                </div>

                <div className="profile-field-item">
                  <span className="profile-field-label">
                    <Building2 size={12} /> País de Residencia
                  </span>
                  {user.country ? (
                    <p className="profile-field-value">{user.country}</p>
                  ) : (
                    <span
                      className="profile-field-empty"
                      onClick={() => setIsEditModalOpen(true)}
                    >
                      + Agregar país
                    </span>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Pestaña: Nivel & Membresía */}
          {activeTab === "membership" && (
            <div>
              <div className="account-section-header">
                <div>
                  <h3 className="account-section-title">
                    <Award size={18} /> Nivel de Cliente & Membresía Exclusiva
                  </h3>
                  <p className="account-section-subtitle">
                    Beneficios financieros calculados automáticamente según tu saldo consolidado
                  </p>
                </div>
              </div>

              {/* Card Resumen de Nivel Activo */}
              <div className="membership-overview-card">
                <div className="membership-header-row">
                  <div className="membership-tier-title-wrap">
                    <div
                      className="membership-tier-icon"
                      style={{ backgroundColor: userTier.bgSubtle, color: userTier.color }}
                    >
                      <Sparkles size={22} />
                    </div>
                    <div>
                      <h4 style={{ margin: 0, fontSize: "1.25rem", color: "var(--text-primary)" }}>
                        {userTier.name} — <span style={{ color: userTier.color }}>{userTier.label}</span>
                      </h4>
                      <p style={{ margin: "4px 0 0 0", fontSize: "13px", color: "var(--text-muted)" }}>
                        Disfrutas de un <strong>{userTier.cashback} de cashback</strong> y beneficios prioritarios.
                      </p>
                    </div>
                  </div>

                  <span
                    className="membership-tier-badge"
                    style={{
                      backgroundColor: userTier.bgSubtle,
                      color: userTier.color,
                      border: `1px solid ${userTier.borderColor}`,
                    }}
                  >
                    NIVEL ACTIVO: {userTier.shortName}
                  </span>
                </div>

                {/* Barra de Progreso hacia el siguiente nivel */}
                <div className="membership-progress-section">
                  <div className="membership-progress-labels">
                    <span>
                      {userTier.nextTier ? (
                        <>
                          <TrendingUp size={13} style={{ display: "inline", verticalAlign: "middle", marginRight: "4px" }} />
                          Progreso hacia <strong>{userTier.nextTier.name}</strong> (${userTier.nextTier.minBalance.toLocaleString("en-US")} USD)
                        </>
                      ) : (
                        "Nivel Máximo VIP Alcanzado"
                      )}
                    </span>
                    <strong style={{ color: "var(--text-primary)" }}>
                      {userTier.nextTier ? `${userTier.progressPercent}%` : "100%"}
                    </strong>
                  </div>

                  <div className="membership-progress-track">
                    <div
                      className="membership-progress-bar"
                      style={{
                        width: `${userTier.progressPercent}%`,
                        background: `linear-gradient(90deg, ${userTier.color} 0%, ${userTier.accentColor} 100%)`,
                      }}
                    />
                  </div>

                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: "11px", color: "var(--text-muted)" }}>
                    <span>Saldo evaluado: ${(userTier.balance || 0).toLocaleString("en-US", { minimumFractionDigits: 2 })} USD</span>
                    {userTier.nextTier ? (
                      <span>Te faltan <strong>${userTier.remainingAmount.toLocaleString("en-US", { minimumFractionDigits: 2 })} USD</strong> para subir</span>
                    ) : (
                      <span>Nivel Elite Neobank</span>
                    )}
                  </div>
                </div>
              </div>

              {/* Grid Comparativo de Todos los Niveles */}
              <h4 style={{ margin: "24px 0 12px 0", fontSize: "15px", color: "var(--text-primary)", display: "flex", alignItems: "center", gap: "8px" }}>
                <Zap size={16} style={{ color: "var(--primary)" }} /> Comparativa de Categorías Neobank
              </h4>

              <div className="tiers-comparison-grid">
                {Object.values(TIERS).map((t) => {
                  const isCurrent = t.id === userTier.id;
                  return (
                    <div
                      key={t.id}
                      className={`tier-comparison-card ${isCurrent ? "is-current" : ""}`}
                      style={{
                        borderColor: isCurrent ? t.color : "var(--border-subtle)",
                      }}
                    >
                      {isCurrent && (
                        <span
                          className="tier-card-current-badge"
                          style={{ backgroundColor: t.bgSubtle, color: t.color, border: `1px solid ${t.borderColor}` }}
                        >
                          Nivel Actual
                        </span>
                      )}

                      <div>
                        <h5 className="tier-card-name" style={{ color: t.color }}>
                          {t.name}
                        </h5>
                        <span className="tier-card-balance">
                          {t.minBalance === 0
                            ? "Saldo desde $0 USD"
                            : `Desde $${t.minBalance.toLocaleString("en-US")} USD`}
                        </span>
                      </div>

                      <div className="tier-card-cashback-badge">
                        <Zap size={12} /> Cashback {t.cashback}
                      </div>

                      <ul className="tier-card-perks">
                        {t.perks.map((perk, pIdx) => (
                          <li key={pIdx} className="tier-card-perk-item">
                            <CheckCircle2 size={13} style={{ color: t.color, flexShrink: 0, marginTop: "2px" }} />
                            <span>{perk}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  );
                })}
              </div>

              <div style={{ marginTop: "20px", padding: "14px 18px", borderRadius: "var(--radius-md)", backgroundColor: "var(--bg-surface)", border: "1px solid var(--border-subtle)", display: "flex", alignItems: "center", gap: "10px" }}>
                <HelpCircle size={18} style={{ color: "var(--primary)", flexShrink: 0 }} />
                <p style={{ margin: 0, fontSize: "12px", color: "var(--text-muted)", lineHeight: 1.5 }}>
                  <strong>¿Cómo se gestiona el nivel?</strong> Tu categoría se actualiza en tiempo real de forma automática en función de los activos combinados en tu cuenta principal y bóvedas de ahorro. No requiere trámites ni costos de mantenimiento mensual.
                </p>
              </div>
            </div>
          )}

          {/* Pestaña: Seguridad & Accesos */}
          {activeTab === "security" && (
            <div>
              <div className="account-section-header">
                <div>
                  <h3 className="account-section-title">
                    <ShieldCheck size={18} /> Parámetros de Seguridad y Credenciales
                  </h3>
                  <p className="account-section-subtitle">
                    Protege el acceso a tus fondos y gestiona tus métodos de autenticación
                  </p>
                </div>
              </div>

              <div className="security-cards-grid" style={{ marginTop: "20px" }}>
                <div className="security-box">
                  <div className="security-box-header">
                    <span className="security-box-title">
                      <KeyRound size={16} /> Contraseña de Acceso
                    </span>
                    <button
                      type="button"
                      className="btn-hero-secondary"
                      style={{ height: "34px", fontSize: "12px" }}
                      onClick={() => setIsPasswordModalOpen(true)}
                    >
                      Cambiar
                    </button>
                  </div>
                  <p className="security-box-desc">
                    Tu contraseña fue actualizada recientemente. Te recomendamos cambiarla cada 90 días.
                  </p>
                  <span style={{ fontSize: "12px", color: "var(--text-muted)" }}>
                    Estado: <strong>•••••••••••• (Cifrada con BCrypt)</strong>
                  </span>
                </div>

                <div className="security-box">
                  <div className="security-box-header">
                    <span className="security-box-title">
                      <Smartphone size={16} /> Verificación en Dos Pasos (2FA)
                    </span>
                    <label className="toggle" style={{ margin: 0 }}>
                      <input
                        type="checkbox"
                        checked={twoFactorEnabled}
                        onChange={() => setTwoFactorEnabled(!twoFactorEnabled)}
                      />
                      <span className="slider" />
                    </label>
                  </div>
                  <p className="security-box-desc">
                    Solicita un código de un solo uso por SMS o App autenticadora al iniciar sesión desde dispositivos no reconocidos.
                  </p>
                  <span
                    style={{
                      fontSize: "12px",
                      color: twoFactorEnabled ? "var(--success)" : "var(--text-muted)",
                      fontWeight: 600,
                    }}
                  >
                    {twoFactorEnabled ? "✓ Protección 2FA Habilitada" : "Desactivada"}
                  </span>
                </div>

                <div className="security-box" style={{ gridColumn: "span 2" }}>
                  <div className="security-box-header">
                    <span className="security-box-title">
                      <Lock size={16} /> Sesión y Dispositivo Actual
                    </span>
                    <span className="account-verified-pill">Activa ahora</span>
                  </div>
                  <p className="security-box-desc">
                    Estás conectado desde un navegador verificado en Linux. Token JWT seguro con rotación automática.
                  </p>
                  <div
                    style={{
                      display: "flex",
                      gap: "20px",
                      fontSize: "12px",
                      color: "var(--text-muted)",
                      marginTop: "6px",
                    }}
                  >
                    <span>IP: <strong>127.0.0.1 (Localhost Seguro)</strong></span>
                    <span>Cifrado: <strong>TLS 1.3 / AES-256</strong></span>
                    <span>Tipo de Cuenta: <strong>{user.role === "ADMIN" ? "Superusuario Administrador" : "Cliente Particular"}</strong></span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Pestaña: Datos Bancarios & Certificados */}
          {activeTab === "banking" && (
            <div>
              <div className="account-section-header">
                <div>
                  <h3 className="account-section-title">
                    <Building2 size={18} /> Acreditación Bancaria & Límites
                  </h3>
                  <p className="account-section-subtitle">
                    Datos estandarizados para recibir transferencias nacionales e internacionales
                  </p>
                </div>
                <button
                  type="button"
                  className="btn-hero-primary"
                  style={{ height: "36px", fontSize: "12px" }}
                  onClick={() => setIsCertModalOpen(true)}
                >
                  <Printer size={13} /> Generar Certificado
                </button>
              </div>

              <div className="banking-info-grid" style={{ marginTop: "20px" }}>
                <div className="banking-account-number-box">
                  <span style={{ fontSize: "11px", textTransform: "uppercase", color: "var(--text-muted)", fontWeight: 700 }}>
                    Código Internacional de Cuenta (CCI / IBAN)
                  </span>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <span style={{ fontSize: "16px", fontWeight: 700, letterSpacing: "1px", color: "#ffffff" }}>
                      {ibanNumber}
                    </span>
                    <button
                      type="button"
                      className="copy-mini-btn"
                      onClick={() => copyToClipboard(ibanNumber, "CCI / IBAN")}
                      title="Copiar CCI / IBAN"
                    >
                      <Copy size={16} />
                    </button>
                  </div>
                </div>

                <div className="banking-account-number-box">
                  <span style={{ fontSize: "11px", textTransform: "uppercase", color: "var(--text-muted)", fontWeight: 700 }}>
                    Código SWIFT / BIC Bancario (Perú)
                  </span>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <span style={{ fontSize: "16px", fontWeight: 700, letterSpacing: "1px", color: "#ffffff" }}>
                      NEOBPELIXXX
                    </span>
                    <button
                      type="button"
                      className="copy-mini-btn"
                      onClick={() => copyToClipboard("NEOBPELIXXX", "SWIFT")}
                      title="Copiar SWIFT"
                    >
                      <Copy size={16} />
                    </button>
                  </div>
                </div>

                <div className="security-box" style={{ gridColumn: "span 2" }}>
                  <div className="security-box-header">
                    <span className="security-box-title">
                      Límite Diario de Transferencias Salientes
                    </span>
                    <span style={{ fontSize: "13px", fontWeight: 700, color: "var(--text-primary)" }}>
                      $1,700.00 / $10,000.00 USD (17% consumido)
                    </span>
                  </div>
                  <div className="limit-progress-bar-wrap">
                    <div className="limit-progress-bar" style={{ width: "17%" }} />
                  </div>
                  <span style={{ fontSize: "11px", color: "var(--text-muted)", marginTop: "4px" }}>
                    Los límites se restablecen cada 24 horas a las 00:00 UTC. Para solicitar una ampliación de límite, contacta al soporte corporativo.
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* MODAL 1: Edición de Perfil */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title="Editar Datos de Mi Cuenta"
        subtitle="Actualiza tu información personal registrada en NeoBank"
        icon={Edit3}
        maxWidth="580px"
        footer={
          <>
            <button
              type="button"
              className="btn-hero-secondary"
              onClick={() => setIsEditModalOpen(false)}
            >
              Cancelar
            </button>
            <button
              type="button"
              className="btn-hero-primary"
              onClick={handleSaveProfile}
              disabled={isSaving}
            >
              {isSaving ? "Guardando..." : "Guardar Cambios"}
            </button>
          </>
        }
      >
        <form onSubmit={handleSaveProfile} className="modal-form-grid">
          <div className="modal-form-group">
            <label>Nombre</label>
            <input
              type="text"
              name="firstName"
              className="modal-form-input"
              value={editForm.firstName}
              onChange={handleEditChange}
              required
            />
          </div>

          <div className="modal-form-group">
            <label>Apellidos</label>
            <input
              type="text"
              name="lastName"
              className="modal-form-input"
              value={editForm.lastName}
              onChange={handleEditChange}
              required
            />
          </div>

          <div className="modal-form-group full-width">
            <label>Teléfono Móvil</label>
            <input
              type="text"
              name="phoneNumber"
              className="modal-form-input"
              placeholder="+51 912 345 678"
              value={editForm.phoneNumber}
              onChange={handleEditChange}
            />
          </div>

          <div className="modal-form-group full-width">
            <label>Dirección Residencial</label>
            <input
              type="text"
              name="address"
              className="modal-form-input"
              placeholder="Av. Javier Prado Este 2465, San Borja"
              value={editForm.address}
              onChange={handleEditChange}
            />
          </div>

          <div className="modal-form-group">
            <label>Ciudad</label>
            <input
              type="text"
              name="city"
              className="modal-form-input"
              placeholder="Lima"
              value={editForm.city}
              onChange={handleEditChange}
            />
          </div>

          <div className="modal-form-group">
            <label>Código Postal</label>
            <input
              type="text"
              name="postalCode"
              className="modal-form-input"
              placeholder="15036"
              value={editForm.postalCode}
              onChange={handleEditChange}
            />
          </div>

          <div className="modal-form-group full-width">
            <label>País</label>
            <input
              type="text"
              name="country"
              className="modal-form-input"
              placeholder="Perú"
              value={editForm.country}
              onChange={handleEditChange}
            />
          </div>
        </form>
      </Modal>

      {/* MODAL 2: Cambio de Contraseña */}
      <Modal
        isOpen={isPasswordModalOpen}
        onClose={() => setIsPasswordModalOpen(false)}
        title="Actualizar Contraseña"
        subtitle="Ingresa tu contraseña actual y la nueva contraseña"
        icon={KeyRound}
        maxWidth="460px"
        footer={
          <>
            <button
              type="button"
              className="btn-hero-secondary"
              onClick={() => setIsPasswordModalOpen(false)}
            >
              Cancelar
            </button>
            <button
              type="button"
              className="btn-hero-primary"
              onClick={handlePasswordChange}
            >
              Confirmar Cambio
            </button>
          </>
        }
      >
        <form onSubmit={handlePasswordChange} style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
          <div className="modal-form-group">
            <label>Contraseña Actual</label>
            <input
              type="password"
              className="modal-form-input"
              value={passwordForm.oldPassword}
              onChange={(e) => setPasswordForm({ ...passwordForm, oldPassword: e.target.value })}
              required
            />
          </div>

          <div className="modal-form-group">
            <label>Nueva Contraseña</label>
            <input
              type="password"
              className="modal-form-input"
              value={passwordForm.newPassword}
              onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
              required
            />
          </div>

          <div className="modal-form-group">
            <label>Confirmar Nueva Contraseña</label>
            <input
              type="password"
              className="modal-form-input"
              value={passwordForm.confirmPassword}
              onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
              required
            />
          </div>

          {passwordMsg.text && (
            <div
              style={{
                padding: "8px 12px",
                borderRadius: "6px",
                fontSize: "13px",
                backgroundColor: passwordMsg.type === "success" ? "rgba(16, 185, 129, 0.15)" : "rgba(239, 68, 68, 0.15)",
                color: passwordMsg.type === "success" ? "#10b981" : "#ef4444",
                border: `1px solid ${passwordMsg.type === "success" ? "rgba(16, 185, 129, 0.3)" : "rgba(239, 68, 68, 0.3)"}`,
              }}
            >
              {passwordMsg.text}
            </div>
          )}
        </form>
      </Modal>

      {/* MODAL 3: Ficha / Certificado Bancario */}
      <Modal
        isOpen={isCertModalOpen}
        onClose={() => setIsCertModalOpen(false)}
        title="Certificado Oficial de Titularidad Bancaria"
        subtitle="Documento acreditativo de cuenta activa emitido por NeoBank Financial Technologies"
        icon={Building2}
        maxWidth="620px"
        footer={
          <>
            <button
              type="button"
              className="btn-hero-secondary"
              onClick={() => setIsCertModalOpen(false)}
            >
              Cerrar
            </button>
            <button
              type="button"
              className="btn-hero-primary"
              onClick={() => window.print()}
            >
              <Printer size={15} /> Imprimir / Descargar PDF
            </button>
          </>
        }
      >
        <div className="bank-certificate-preview">
          <div className="cert-header">
            <div>
              <div className="cert-logo">NEOBANK</div>
              <span style={{ fontSize: "11px", color: "#64748b" }}>Financial Suite & Banking Group</span>
            </div>
            <div className="cert-stamp">EMISIÓN OFICIAL ✓</div>
          </div>

          <div className="cert-body">
            <p>
              Por medio de la presente, la entidad <strong>NeoBank S.A.</strong> certifica que a la fecha de hoy, la siguiente cuenta bancaria se encuentra en estado <strong>ACTIVO Y PLENAMENTE OPERATIVO</strong>:
            </p>

            <table className="cert-table">
              <tbody>
                <tr>
                  <td className="cert-lbl">Titular de la Cuenta:</td>
                  <td>{user.firstName} {user.lastName}</td>
                </tr>
                <tr>
                  <td className="cert-lbl">Correo Acreditado:</td>
                  <td>{user.email}</td>
                </tr>
                <tr>
                  <td className="cert-lbl">Identificador de Cliente:</td>
                  <td>{accountNumber}</td>
                </tr>
                <tr>
                  <td className="cert-lbl">CCI / IBAN:</td>
                  <td>{ibanNumber}</td>
                </tr>
                <tr>
                  <td className="cert-lbl">Código BIC / SWIFT:</td>
                  <td>NEOBPELIXXX</td>
                </tr>
                <tr>
                  <td className="cert-lbl">Moneda de Denominación:</td>
                  <td>Soles Peruanos (PEN) / Dólares Estadounidenses (USD)</td>
                </tr>
                <tr>
                  <td className="cert-lbl">Estado Regulatorio:</td>
                  <td>Verificado Tier 2 (KYC Completo)</td>
                </tr>
              </tbody>
            </table>

            <p style={{ fontSize: "11px", color: "#64748b", marginTop: "10px" }}>
              Este documento se expide a solicitud del interesado para los fines que estime convenientes. Constancia firmada digitalmente con clave criptográfica SHA-256.
            </p>
          </div>
        </div>
      </Modal>
    </ClientLayout>
  );
}
