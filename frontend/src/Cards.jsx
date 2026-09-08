import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import {
  CreditCard,
  Plus,
  Shield,
  Lock,
  Unlock,
  Eye,
  EyeOff,
  RefreshCw,
  Sliders,
  Key,
  Globe,
  Trash2,
  AlertCircle,
  CheckCircle2,
  Sparkles,
  Zap,
} from "lucide-react";
import ClientLayout from "./ClientLayout";
import MetricCard from "./MetricCard";
import "./Dashboard.css";
import "./Cards.css";
import "./LightMode.css";

export default function Cards() {
  const navigate = useNavigate();
  const [cards, setCards] = useState([]);
  const [selectedCardId, setSelectedCardId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showNumbers, setShowNumbers] = useState(false);

  // Modales
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showLimitsModal, setShowLimitsModal] = useState(false);
  const [showPinModal, setShowPinModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  // Formularios
  const [newCardType, setNewCardType] = useState("VIRTUAL");
  const [newCardColor, setNewCardColor] = useState("obsidian");
  const [newCardDaily, setNewCardDaily] = useState("500");
  const [newCardMonthly, setNewCardMonthly] = useState("2000");
  const [newCardPin, setNewCardPin] = useState("1234");
  const [newCardHolder, setNewCardHolder] = useState("");

  const [editDailyLimit, setEditDailyLimit] = useState("");
  const [editMonthlyLimit, setEditMonthlyLimit] = useState("");
  const [editPin, setEditPin] = useState("");
  const [editPinConfirm, setEditPinConfirm] = useState("");

  // Feedback
  const [feedbackSuccess, setFeedbackSuccess] = useState("");
  const [feedbackError, setFeedbackError] = useState("");
  const [actionLoading, setActionLoading] = useState(false);

  const token = localStorage.getItem("token");

  const fetchCards = async () => {
    if (!token) {
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      const res = await axios.get("http://localhost:8080/api/cards", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = Array.isArray(res.data) ? res.data : [];
      setCards(data);
      if (data.length > 0) {
        // Mantener seleccionada la actual o la primera
        setSelectedCardId((prev) => {
          const exists = data.some((c) => c.id === prev);
          return exists ? prev : data[0].id;
        });
      } else {
        setSelectedCardId(null);
      }
    } catch (err) {
      console.error("Error al cargar tarjetas:", err);
      setFeedbackError("No se pudieron cargar las tarjetas.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!token) {
      navigate("/login");
      return;
    }
    fetchCards();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  const selectedCard = cards.find((c) => c.id === selectedCardId) || cards[0];

  const showSuccess = (msg) => {
    setFeedbackSuccess(msg);
    setTimeout(() => setFeedbackSuccess(""), 4000);
  };

  const showError = (msg) => {
    setFeedbackError(msg);
    setTimeout(() => setFeedbackError(""), 5000);
  };

  // Crear Tarjeta
  const handleCreateCard = async (e) => {
    e.preventDefault();
    setActionLoading(true);
    setFeedbackError("");
    try {
      const res = await axios.post(
        "http://localhost:8080/api/cards",
        {
          cardType: newCardType,
          color: newCardColor,
          dailyLimit: parseFloat(newCardDaily) || 500,
          monthlyLimit: parseFloat(newCardMonthly) || 2000,
          pin: newCardPin || "1234",
          cardHolder: newCardHolder || undefined,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setShowCreateModal(false);
      showSuccess("¡Tarjeta emitida exitosamente!");
      await fetchCards();
      if (res.data?.id) setSelectedCardId(res.data.id);
    } catch (err) {
      showError(err.response?.data?.message || "Error al crear la tarjeta.");
    } finally {
      setActionLoading(false);
    }
  };

  // Congelar / Descongelar
  const handleToggleFreeze = async () => {
    if (!selectedCard) return;
    setActionLoading(true);
    try {
      const isFrozen = selectedCard.status === "FROZEN";
      const endpoint = isFrozen
        ? `http://localhost:8080/api/cards/${selectedCard.id}/unfreeze`
        : `http://localhost:8080/api/cards/${selectedCard.id}/freeze`;
      await axios.patch(endpoint, {}, { headers: { Authorization: `Bearer ${token}` } });
      showSuccess(isFrozen ? "Tarjeta desbloqueada y lista para usar." : "Tarjeta congelada temporalmente.");
      await fetchCards();
    } catch (err) {
      showError("No se pudo cambiar el estado de la tarjeta.");
    } finally {
      setActionLoading(false);
    }
  };

  // Toggle Compras por Internet
  const handleToggleOnline = async () => {
    if (!selectedCard) return;
    setActionLoading(true);
    try {
      await axios.patch(
        `http://localhost:8080/api/cards/${selectedCard.id}/toggle-online`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      showSuccess("Preferencia de compras por internet actualizada.");
      await fetchCards();
    } catch (err) {
      showError("Error al actualizar la configuración de pagos online.");
    } finally {
      setActionLoading(false);
    }
  };

  // Regenerar Tarjeta (CVV / Número)
  const handleRegenerate = async () => {
    if (!selectedCard) return;
    if (!window.confirm("¿Deseas generar nuevos números y CVV para esta tarjeta? Los números anteriores dejarán de funcionar.")) return;
    setActionLoading(true);
    try {
      await axios.post(
        `http://localhost:8080/api/cards/${selectedCard.id}/regenerate`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      showSuccess("¡Datos de tarjeta regenerados con éxito!");
      await fetchCards();
    } catch (err) {
      showError("Error al regenerar la tarjeta.");
    } finally {
      setActionLoading(false);
    }
  };

  // Guardar Límites
  const handleSaveLimits = async (e) => {
    e.preventDefault();
    if (!selectedCard) return;
    setActionLoading(true);
    try {
      await axios.patch(
        `http://localhost:8080/api/cards/${selectedCard.id}/limits`,
        {
          dailyLimit: parseFloat(editDailyLimit) || selectedCard.dailyLimit,
          monthlyLimit: parseFloat(editMonthlyLimit) || selectedCard.monthlyLimit,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setShowLimitsModal(false);
      showSuccess("Límites de gasto actualizados.");
      await fetchCards();
    } catch (err) {
      showError("Error al actualizar los límites.");
    } finally {
      setActionLoading(false);
    }
  };

  // Cambiar PIN
  const handleSavePin = async (e) => {
    e.preventDefault();
    if (!selectedCard) return;
    if (!/^\d{4}$/.test(editPin)) {
      showError("El PIN debe tener exactamente 4 dígitos numéricos.");
      return;
    }
    if (editPin !== editPinConfirm) {
      showError("Los PINs ingresados no coinciden.");
      return;
    }
    setActionLoading(true);
    try {
      await axios.patch(
        `http://localhost:8080/api/cards/${selectedCard.id}/pin`,
        { pin: editPin },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setShowPinModal(false);
      setEditPin("");
      setEditPinConfirm("");
      showSuccess("PIN actualizado exitosamente.");
      await fetchCards();
    } catch (err) {
      showError("Error al actualizar el PIN.");
    } finally {
      setActionLoading(false);
    }
  };

  // Eliminar Tarjeta
  const handleDeleteCard = async () => {
    if (!selectedCard) return;
    setActionLoading(true);
    try {
      await axios.delete(`http://localhost:8080/api/cards/${selectedCard.id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setShowDeleteModal(false);
      showSuccess("Tarjeta eliminada permanentemente.");
      await fetchCards();
    } catch (err) {
      showError("No se pudo eliminar la tarjeta.");
    } finally {
      setActionLoading(false);
    }
  };

  const formatCardNum = (num, reveal) => {
    if (!num) return "•••• •••• •••• ••••";
    const cleaned = num.replace(/\s+/g, "");
    if (reveal) {
      return cleaned.replace(/(.{4})/g, "$1 ").trim();
    }
    const last4 = cleaned.slice(-4);
    return `•••• •••• •••• ${last4}`;
  };

  const formatExpiry = (expiryDate) => {
    if (!expiryDate) return "12/28";
    const parts = expiryDate.split("-");
    if (parts.length >= 2) {
      return `${parts[1]}/${parts[0].slice(-2)}`;
    }
    return expiryDate;
  };

  return (
    <ClientLayout
      active="cards"
      title="Tarjetas y Medios de Pago"
      subtitle="Gestiona tus tarjetas físicas, virtuales y desechables para compras seguras"
    >
      {/* Notificaciones de éxito / error */}
      {feedbackSuccess && (
        <div className="alert-banner success" role="alert" style={{ marginBottom: "16px" }}>
          <CheckCircle2 size={20} />
          <span>{feedbackSuccess}</span>
        </div>
      )}
      {feedbackError && (
        <div className="alert-banner error" role="alert" style={{ marginBottom: "16px" }}>
          <AlertCircle size={20} />
          <span>{feedbackError}</span>
        </div>
      )}

      {/* Métricas Globales de Tarjetas */}
      <div className="account-metrics-grid" style={{ marginBottom: "24px" }}>
        <MetricCard
          title="Tarjetas Emitidas"
          value={`${cards.length}`}
          badge={`${cards.filter((c) => c.status === "ACTIVE").length} activas`}
          icon={CreditCard}
          accent="primary"
        />
        <MetricCard
          title="Tarjetas Virtuales"
          value={`${
            cards.filter((c) => c.type === "VIRTUAL" || c.type === "DISPOSABLE")
              .length
          }`}
          badge="Compras seguras online"
          icon={Globe}
          accent="emerald"
        />
        <MetricCard
          title="Tarjetas Físicas"
          value={`${cards.filter((c) => c.type === "PHYSICAL").length}`}
          badge="Para pagos presenciales"
          icon={Shield}
          accent="cyan"
        />
        <MetricCard
          title="Tarjetas Bloqueadas"
          value={`${cards.filter((c) => c.status === "BLOCKED").length}`}
          badge="Protección preventiva"
          icon={Lock}
          accent="amber"
        />
      </div>

      <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: "16px" }}>
        <button
          className="new-tx-btn"
          onClick={() => setShowCreateModal(true)}
          aria-label="Solicitar nueva tarjeta"
        >
          <Plus
            size={18}
            style={{
              display: "inline",
              verticalAlign: "middle",
              marginRight: "4px",
            }}
          />
          Nueva Tarjeta
        </button>
      </div>

        {loading ? (
          <div className="cards-loading">
            <RefreshCw className="spin" size={32} />
            <p>Cargando tus tarjetas...</p>
          </div>
        ) : cards.length === 0 ? (
          /* Estado vacío */
          <section className="cards-empty-state">
            <div className="empty-icon-wrap">
              <CreditCard size={48} />
            </div>
            <h2>Aún no tienes tarjetas activas</h2>
            <p>
              Genera tu primera tarjeta virtual al instante para realizar compras por internet con total protección y control de límites.
            </p>
            <button className="btn btn-primary btn-lg" onClick={() => setShowCreateModal(true)}>
              <Sparkles size={18} /> Crear mi primera tarjeta virtual
            </button>
          </section>
        ) : (
          <div className="cards-layout-grid">
            {/* Columna Izquierda: Vista Previa 3D y Controles de la Tarjeta Seleccionada */}
            <div className="card-preview-column">
              {/* Tarjeta Visual */}
              <div
                className={`realistic-card ${selectedCard?.color || "obsidian"} ${
                  selectedCard?.status === "FROZEN" ? "card-frozen" : ""
                }`}
              >
                <div className="card-glare" />
                <div className="card-top-row">
                  <div className="card-chip-container">
                    <div className="card-chip" />
                    <svg className="contactless-icon" viewBox="0 0 24 24" width="22" height="22">
                      <path
                        fill="currentColor"
                        d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z"
                        opacity="0.2"
                      />
                      <path
                        fill="currentColor"
                        d="M14.5 9.5c.83 0 1.5.67 1.5 1.5s-.67 1.5-1.5 1.5-1.5-.67-1.5-1.5.67-1.5 1.5-1.5zm-3 0c.83 0 1.5.67 1.5 1.5s-.67 1.5-1.5 1.5-1.5-.67-1.5-1.5.67-1.5 1.5-1.5z"
                      />
                    </svg>
                  </div>
                  <div className="card-type-badge">
                    {selectedCard?.cardType === "DISPOSABLE" ? (
                      <span className="badge-disposable"><Zap size={13} /> DESECHABLE</span>
                    ) : selectedCard?.cardType === "PHYSICAL" ? (
                      <span className="badge-physical">FÍSICA</span>
                    ) : (
                      <span className="badge-virtual">VIRTUAL</span>
                    )}
                  </div>
                </div>

                {/* Número de Tarjeta */}
                <div className="card-number-row">
                  <span className="card-number-text">
                    {formatCardNum(selectedCard?.cardNumber, showNumbers)}
                  </span>
                  <button
                    type="button"
                    className="btn-reveal-num"
                    onClick={() => setShowNumbers(!showNumbers)}
                    aria-label={showNumbers ? "Ocultar número" : "Ver número completo"}
                    title={showNumbers ? "Ocultar número" : "Ver número completo"}
                  >
                    {showNumbers ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>

                {/* Datos inferiores */}
                <div className="card-bottom-row">
                  <div className="card-holder-info">
                    <span className="card-info-label">TITULAR</span>
                    <span className="card-info-val">
                      {selectedCard?.cardHolder || "NEO CARDHOLDER"}
                    </span>
                  </div>
                  <div className="card-expiry-info">
                    <span className="card-info-label">EXPIRA</span>
                    <span className="card-info-val">
                      {formatExpiry(selectedCard?.expiryDate)}
                    </span>
                  </div>
                  <div className="card-cvv-info">
                    <span className="card-info-label">CVV</span>
                    <span className="card-info-val">
                      {showNumbers ? selectedCard?.cvv || "•••" : "•••"}
                    </span>
                  </div>
                </div>

                {/* Overlay si está congelada */}
                {selectedCard?.status === "FROZEN" && (
                  <div className="card-frozen-overlay">
                    <Lock size={32} />
                    <span>Tarjeta Bloqueada</span>
                  </div>
                )}
              </div>

              {/* Barra de Acciones Rápidas */}
              <div className="card-quick-actions">
                <button
                  type="button"
                  className={`quick-action-btn ${selectedCard?.status === "FROZEN" ? "btn-unfreeze" : "btn-freeze"}`}
                  onClick={handleToggleFreeze}
                  disabled={actionLoading}
                >
                  {selectedCard?.status === "FROZEN" ? (
                    <>
                      <Unlock size={18} />
                      <span>Descongelar</span>
                    </>
                  ) : (
                    <>
                      <Lock size={18} />
                      <span>Congelar</span>
                    </>
                  )}
                </button>

                <button
                  type="button"
                  className="quick-action-btn"
                  onClick={() => {
                    setEditDailyLimit(selectedCard?.dailyLimit || "500");
                    setEditMonthlyLimit(selectedCard?.monthlyLimit || "2000");
                    setShowLimitsModal(true);
                  }}
                  disabled={actionLoading}
                >
                  <Sliders size={18} />
                  <span>Límites</span>
                </button>

                <button
                  type="button"
                  className="quick-action-btn"
                  onClick={() => {
                    setEditPin("");
                    setEditPinConfirm("");
                    setShowPinModal(true);
                  }}
                  disabled={actionLoading}
                >
                  <Key size={18} />
                  <span>PIN</span>
                </button>

                {selectedCard?.cardType === "DISPOSABLE" && (
                  <button
                    type="button"
                    className="quick-action-btn btn-regenerate"
                    onClick={handleRegenerate}
                    disabled={actionLoading}
                    title="Generar nuevos números tras su uso"
                  >
                    <RefreshCw size={18} />
                    <span>Renovar</span>
                  </button>
                )}

                <button
                  type="button"
                  className="quick-action-btn btn-delete"
                  onClick={() => setShowDeleteModal(true)}
                  disabled={actionLoading}
                >
                  <Trash2 size={18} />
                  <span>Eliminar</span>
                </button>
              </div>

              {/* Interruptores de Seguridad */}
              <div className="card-security-toggles">
                <div className="security-toggle-item">
                  <div className="toggle-info">
                    <Globe size={20} className="toggle-icon" />
                    <div>
                      <strong>Compras por Internet</strong>
                      <p>Habilita o restringe transacciones en comercios online y pasarelas de pago.</p>
                    </div>
                  </div>
                  <label className="switch">
                    <input
                      type="checkbox"
                      checked={Boolean(selectedCard?.onlinePaymentsEnabled)}
                      onChange={handleToggleOnline}
                      disabled={actionLoading}
                    />
                    <span className="slider round" />
                  </label>
                </div>
              </div>
            </div>

            {/* Columna Derecha: Lista y Detalles de Tarjetas */}
            <div className="card-details-column">
              <div className="card-list-header">
                <h3>Tus Tarjetas ({cards.length})</h3>
                <span className="card-count-hint">Haz clic en una tarjeta para seleccionarla</span>
              </div>

              <div className="cards-thumbnails-list">
                {(Array.isArray(cards) ? cards : []).map((c) => {
                  const isSelected = c.id === selectedCard?.id;
                  return (
                    <button
                      key={c.id}
                      type="button"
                      className={`card-thumbnail-item ${isSelected ? "selected" : ""} ${c.color || "obsidian"}`}
                      onClick={() => setSelectedCardId(c.id)}
                    >
                      <div className="thumbnail-top">
                        <span className="thumbnail-type">
                          {c.cardType === "DISPOSABLE" ? "Desechable" : c.cardType === "PHYSICAL" ? "Física" : "Virtual"}
                        </span>
                        <span className={`thumbnail-status ${c.status.toLowerCase()}`}>
                          {c.status === "ACTIVE" ? "Activa" : "Congelada"}
                        </span>
                      </div>
                      <div className="thumbnail-number">
                        •••• {c.cardNumber ? c.cardNumber.slice(-4) : "••••"}
                      </div>
                      <div className="thumbnail-bottom">
                        <span>Límite diario: ${Number(c.dailyLimit || 0).toLocaleString()}</span>
                        <span>Expira: {formatExpiry(c.expiryDate)}</span>
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Resumen de Límites de la Tarjeta Seleccionada */}
              {selectedCard && (
                <div className="card-limits-card">
                  <h4>Límites y Parámetros Activos</h4>
                  <div className="limits-metric-row">
                    <div className="limit-box">
                      <span className="limit-label">Límite Diario</span>
                      <strong className="limit-val">${Number(selectedCard.dailyLimit || 0).toLocaleString()} USD</strong>
                    </div>
                    <div className="limit-box">
                      <span className="limit-label">Límite Mensual</span>
                      <strong className="limit-val">${Number(selectedCard.monthlyLimit || 0).toLocaleString()} USD</strong>
                    </div>
                    <div className="limit-box">
                      <span className="limit-label">Compras Online</span>
                      <strong className="limit-val">
                        {selectedCard.onlinePaymentsEnabled ? "Permitidas" : "Bloqueadas"}
                      </strong>
                    </div>
                  </div>

                  <div className="security-notice-box">
                    <Shield size={20} className="shield-icon" />
                    <div>
                      <strong>Protección Antifraude NEO Shield</strong>
                      <p>
                        Todas tus transacciones están protegidas con encriptación de nivel bancario y verificación biométrica o 2FA.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Modal: Solicitar Nueva Tarjeta */}
        {showCreateModal && (
          <div className="modal-overlay" onClick={() => setShowCreateModal(false)}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <h2>Emitir Nueva Tarjeta</h2>
              <p className="modal-desc">
                Elige el formato de tarjeta que mejor se adapte a tus hábitos de compra.
              </p>

              <form onSubmit={handleCreateCard}>
                {/* Tipo de Tarjeta */}
                <div className="form-group">
                  <label className="form-label">Tipo de Tarjeta</label>
                  <div className="card-type-picker">
                    <button
                      type="button"
                      className={`type-option ${newCardType === "VIRTUAL" ? "active" : ""}`}
                      onClick={() => setNewCardType("VIRTUAL")}
                    >
                      <CreditCard size={20} />
                      <strong>Virtual</strong>
                      <span>Uso continuo para suscripciones y compras</span>
                    </button>

                    <button
                      type="button"
                      className={`type-option ${newCardType === "DISPOSABLE" ? "active" : ""}`}
                      onClick={() => setNewCardType("DISPOSABLE")}
                    >
                      <Zap size={20} />
                      <strong>Desechable</strong>
                      <span>Autodestructible o renovable tras una compra</span>
                    </button>

                    <button
                      type="button"
                      className={`type-option ${newCardType === "PHYSICAL" ? "active" : ""}`}
                      onClick={() => setNewCardType("PHYSICAL")}
                    >
                      <Shield size={20} />
                      <strong>Física</strong>
                      <span>Tarjeta con chip NFC para compras presenciales</span>
                    </button>
                  </div>
                </div>

                {/* Color de la Tarjeta */}
                <div className="form-group">
                  <label className="form-label">Color y Estilo</label>
                  <div className="color-palette-picker">
                    {[
                      { id: "obsidian", name: "Obsidiana", bg: "#1e293b" },
                      { id: "emerald", name: "Esmeralda", bg: "#065f46" },
                      { id: "cyan", name: "Cyan Neón", bg: "#0284c7" },
                      { id: "ocean", name: "Azul Océano", bg: "#1e3a8a" },
                    ].map((c) => (
                      <button
                        key={c.id}
                        type="button"
                        className={`color-chip ${newCardColor === c.id ? "active" : ""}`}
                        style={{ backgroundColor: c.bg }}
                        onClick={() => setNewCardColor(c.id)}
                        title={c.name}
                      />
                    ))}
                  </div>
                </div>

                {/* Nombre en la tarjeta */}
                <div className="form-group">
                  <label className="form-label" htmlFor="cardHolderInput">
                    Nombre del Titular (Opcional)
                  </label>
                  <input
                    id="cardHolderInput"
                    type="text"
                    className="form-control"
                    placeholder="Ej. JUAN PÉREZ"
                    value={newCardHolder}
                    onChange={(e) => setNewCardHolder(e.target.value)}
                  />
                </div>

                <div className="form-row-2">
                  <div className="form-group">
                    <label className="form-label" htmlFor="dailyLimitInput">
                      Límite Diario ($ USD / S/. PEN)
                    </label>
                    <input
                      id="dailyLimitInput"
                      type="number"
                      min="10"
                      max="100000"
                      className="form-control"
                      value={newCardDaily}
                      onChange={(e) => setNewCardDaily(e.target.value)}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label" htmlFor="monthlyLimitInput">
                      Límite Mensual ($ USD / S/. PEN)
                    </label>
                    <input
                      id="monthlyLimitInput"
                      type="number"
                      min="50"
                      max="500000"
                      className="form-control"
                      value={newCardMonthly}
                      onChange={(e) => setNewCardMonthly(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="pinInput">
                    PIN de Seguridad (4 dígitos)
                  </label>
                  <input
                    id="pinInput"
                    type="password"
                    maxLength={4}
                    pattern="\d{4}"
                    className="form-control"
                    value={newCardPin}
                    onChange={(e) => setNewCardPin(e.target.value)}
                    required
                  />
                </div>

                <div className="modal-actions">
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => setShowCreateModal(false)}
                  >
                    Cancelar
                  </button>
                  <button type="submit" className="btn btn-primary" disabled={actionLoading}>
                    {actionLoading ? "Emitiendo..." : "Confirmar Emisión"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Modal: Editar Límites */}
        {showLimitsModal && (
          <div className="modal-overlay" onClick={() => setShowLimitsModal(false)}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <h2>Configurar Límites de Gasto</h2>
              <p className="modal-desc">
                Ajusta los topes de consumo autorizados para la tarjeta terminada en *
                {selectedCard?.cardNumber?.slice(-4)}.
              </p>

              <form onSubmit={handleSaveLimits}>
                <div className="form-group">
                  <label className="form-label" htmlFor="editDaily">Límite Diario ($ USD / S/. PEN)</label>
                  <input
                    id="editDaily"
                    type="number"
                    min="10"
                    step="10"
                    className="form-control"
                    value={editDailyLimit}
                    onChange={(e) => setEditDailyLimit(e.target.value)}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="editMonthly">Límite Mensual ($ USD / S/. PEN)</label>
                  <input
                    id="editMonthly"
                    type="number"
                    min="50"
                    step="50"
                    className="form-control"
                    value={editMonthlyLimit}
                    onChange={(e) => setEditMonthlyLimit(e.target.value)}
                    required
                  />
                </div>

                <div className="modal-actions">
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => setShowLimitsModal(false)}
                  >
                    Cancelar
                  </button>
                  <button type="submit" className="btn btn-primary" disabled={actionLoading}>
                    {actionLoading ? "Guardando..." : "Guardar Límites"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Modal: Cambiar PIN */}
        {showPinModal && (
          <div className="modal-overlay" onClick={() => setShowPinModal(false)}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <h2>Cambiar PIN de Tarjeta</h2>
              <p className="modal-desc">
                Define un nuevo código PIN de 4 dígitos para retiros en cajeros y autorizaciones físicas.
              </p>

              <form onSubmit={handleSavePin}>
                <div className="form-group">
                  <label className="form-label" htmlFor="newPinInput">Nuevo PIN (4 dígitos)</label>
                  <input
                    id="newPinInput"
                    type="password"
                    maxLength={4}
                    pattern="\d{4}"
                    className="form-control"
                    placeholder="••••"
                    value={editPin}
                    onChange={(e) => setEditPin(e.target.value)}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="confirmPinInput">Confirmar Nuevo PIN</label>
                  <input
                    id="confirmPinInput"
                    type="password"
                    maxLength={4}
                    pattern="\d{4}"
                    className="form-control"
                    placeholder="••••"
                    value={editPinConfirm}
                    onChange={(e) => setEditPinConfirm(e.target.value)}
                    required
                  />
                </div>

                <div className="modal-actions">
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => setShowPinModal(false)}
                  >
                    Cancelar
                  </button>
                  <button type="submit" className="btn btn-primary" disabled={actionLoading}>
                    {actionLoading ? "Actualizando..." : "Confirmar PIN"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Modal: Confirmar Eliminación */}
        {showDeleteModal && (
          <div className="modal-overlay" onClick={() => setShowDeleteModal(false)}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <h2>¿Eliminar Tarjeta?</h2>
              <p className="modal-desc">
                Esta acción cancelará permanentemente la tarjeta terminada en *
                {selectedCard?.cardNumber?.slice(-4)}. Cualquier cobro futuro recurrente será rechazado.
              </p>

              <div className="modal-actions">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setShowDeleteModal(false)}
                >
                  Volver
                </button>
                <button
                  type="button"
                  className="btn btn-danger"
                  onClick={handleDeleteCard}
                  disabled={actionLoading}
                >
                  {actionLoading ? "Eliminando..." : "Sí, Eliminar Tarjeta"}
                </button>
              </div>
            </div>
          </div>
        )}
    </ClientLayout>
  );
}
