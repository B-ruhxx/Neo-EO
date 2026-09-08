import { Link } from "react-router-dom";
import { useState, useEffect } from "react";
import {
  ArrowDownLeft,
  ArrowUpRight,
  Send,
  AlertCircle,
  X,
  RotateCcw,
  Copy,
  Check,
  Eye,
  EyeOff,
  ExternalLink,
  ShieldCheck,
  Wallet,
  TrendingUp,
  TrendingDown,
  PiggyBank,
  MoreHorizontal,
  Zap,
  CreditCard,
} from "lucide-react";
import ClientLayout from "./ClientLayout";
import MetricCard from "./components/MetricCard";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
import "./Dashboard.css";
import "./LightMode.css";

export default function Dashboard() {
  const [transactions, setTransactions] = useState([]);
  const [chartData, setChartData] = useState([]);
  const [balance, setBalance] = useState(0);
  const [cards, setCards] = useState([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showCardBack, setShowCardBack] = useState(false);
  const [selectedCardIndex, setSelectedCardIndex] = useState(null);
  const [cvc, setCvc] = useState("");
  const [isCardFlipped, setIsCardFlipped] = useState(true);
  const [showFullCardNumber, setShowFullCardNumber] = useState(false);
  const [copiedField, setCopiedField] = useState(null);
  const [vaults, setVaults] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);

  const token = localStorage.getItem("token");
  const user = JSON.parse(localStorage.getItem("user"));

  const copyToClipboard = (text, field) => {
    if (!text) return;
    navigator.clipboard.writeText(String(text));
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  };

  useEffect(() => {
    if (!user || !token) return;

    fetch(`http://localhost:8080/api/transactions/user/${user.id}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => {
        if (!res.ok) return [];
        return res.json();
      })
      .then((data) => {
        const list = Array.isArray(data) ? data : [];
        const sorted = list
          .map((tx) => ({
            ...tx,
            date: tx.timestamp
              ? new Date(tx.timestamp).toLocaleString()
              : "No date available",
            timestampValue: tx.timestamp ? new Date(tx.timestamp).getTime() : 0,
          }))
          .sort((a, b) => b.timestampValue - a.timestampValue);

        setTransactions(sorted.slice(0, 4));

        const today = new Date().toISOString().split("T")[0];
        const todaysSpending = sorted.filter((tx) => {
          const txDate = tx.timestamp
            ? new Date(tx.timestamp).toISOString().split("T")[0]
            : "";
          return (
            txDate === today &&
            (tx.type?.toUpperCase() === "WITHDRAWAL" ||
              tx.type?.toUpperCase() === "TRANSFER")
          );
        });

        let chartPoints = todaysSpending.map((tx) => ({
          time: new Date(tx.timestamp).toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          }),
          amount: Number(tx.amount),
        }));

        if (chartPoints.length === 1) {
          chartPoints.push({
            ...chartPoints[0],
            time: chartPoints[0].time + " ",
          });
        }

        setChartData(chartPoints);
      })
      .catch((err) => {
        console.error("Error fetching transactions:", err);
        setTransactions([]);
      });

    fetch("http://localhost:8080/api/auth/me", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => {
        if (!res.ok) return null;
        return res.json();
      })
      .then((data) => {
        if (data) {
          setCurrentUser(data);
          if (typeof data.balance === "number") {
            setBalance(data.balance);
          }
        }
      })
      .catch((err) => console.error("Error fetching balance:", err));

    fetch("http://localhost:8080/api/vaults", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => {
        if (!res.ok) return [];
        return res.json();
      })
      .then((data) => setVaults(Array.isArray(data) ? data : []))
      .catch((err) => {
        console.error("Error fetching vaults:", err);
        setVaults([]);
      });

    fetch("http://localhost:8080/api/cards", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => {
        if (!res.ok) return [];
        return res.json();
      })
      .then((data) => setCards(Array.isArray(data) ? data : []))
      .catch((err) => {
        console.error("Error fetching cards:", err);
        setCards([]);
      });
  }, [token, user]);

  const confirmNewCard = () => {
    fetch("http://localhost:8080/api/cards", {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => {
        if (!res.ok) throw new Error("Status " + res.status);
        return res.json();
      })
      .then((newCard) => {
        setCards((prev) => [...(Array.isArray(prev) ? prev : []), newCard]);
        setShowAddModal(false);
      })
      .catch((err) => console.error("Error creating card:", err));
  };

  const cardColors = [
    "linear-gradient(135deg, #090d16, #1e293b)",
    "linear-gradient(135deg, #0f172a, #0284c7)",
    "linear-gradient(135deg, #115e59, #10b981)",
  ];

  const cardList = Array.isArray(cards) ? cards : [];
  const selectedCard =
    selectedCardIndex !== null && cardList[selectedCardIndex]
      ? cardList[selectedCardIndex]
      : null;

  return (
    <ClientLayout
      active="dashboard"
      title="Panel Principal"
      subtitle="Resumen de tu actividad financiera y movimientos en tiempo real"
    >
      {currentUser?.status === "FROZEN" && (
              <div
                style={{
                  backgroundColor: "rgba(239, 68, 68, 0.15)",
                  border: "1px solid #ef4444",
                  color: "#fca5a5",
                  padding: "12px 18px",
                  borderRadius: "12px",
                  marginBottom: "20px",
                  fontSize: "0.95rem",
                  display: "flex",
                  alignItems: "center",
                  gap: "10px",
                }}
              >
                <AlertCircle size={20} />
                <span>
                  <strong>Cuenta Congelada:</strong> Tu cuenta bancaria ha sido
                  restringida por administración. Operaciones financieras suspendidas.
                </span>
              </div>
            )}

            {/* Métricas Resumen Superiores Glassmorphism */}
            <div className="account-metrics-grid" style={{ marginBottom: "24px" }}>
              <MetricCard
                title="Saldo Disponible"
                value={`$${(typeof balance === "number" ? balance : 0).toLocaleString("en-US", {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}`}
                badge="Cuenta Principal"
                badgeType="info"
                icon={Wallet}
                accent="primary"
                subtitle="Tu dinero, siempre disponible"
                action={
                  <button className="metric-card-action-btn" aria-label="Opciones de saldo" type="button">
                    <MoreHorizontal size={16} />
                  </button>
                }
                graphic={
                  <svg className="kpi-graphic wave-graphic" width="70" height="32" viewBox="0 0 70 32" fill="none" aria-hidden="true">
                    <path d="M0 24 C 16 8, 32 30, 48 14 C 56 6, 64 12, 70 8" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" opacity="0.35" />
                    <path d="M0 28 C 16 16, 32 26, 48 18 C 56 12, 64 18, 70 14" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" opacity="0.2" />
                  </svg>
                }
              />

              <MetricCard
                title="Ingresos Recientes"
                value={`+$${(Array.isArray(transactions) ? transactions : [])
                  .filter((t) => t.type?.toLowerCase() === "deposit")
                  .reduce((sum, t) => sum + Number(t.amount || 0), 0)
                  .toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
                badge={`${(Array.isArray(transactions) ? transactions : []).filter((t) => t.type?.toLowerCase() === "deposit").length} depósitos`}
                badgeType="success"
                icon={TrendingUp}
                accent="emerald"
                subtitle="Entradas registradas"
                action={
                  <button className="metric-card-action-btn" aria-label="Opciones de ingresos" type="button">
                    <MoreHorizontal size={16} />
                  </button>
                }
                graphic={
                  <svg className="kpi-graphic bars-graphic green" width="44" height="26" viewBox="0 0 44 26" fill="none" aria-hidden="true">
                    <rect x="2" y="16" width="5" height="10" rx="2" fill="#10b981" fillOpacity="0.35" />
                    <rect x="12" y="10" width="5" height="16" rx="2" fill="#10b981" fillOpacity="0.55" />
                    <rect x="22" y="4" width="5" height="22" rx="2" fill="#10b981" fillOpacity="0.8" />
                    <rect x="32" y="8" width="5" height="18" rx="2" fill="#10b981" />
                  </svg>
                }
              />

              <MetricCard
                title="Gastos & Retiros"
                value={`-$${(Array.isArray(transactions) ? transactions : [])
                  .filter((t) => t.type?.toLowerCase() === "withdrawal" || t.type?.toLowerCase() === "transfer")
                  .reduce((sum, t) => sum + Number(t.amount || 0), 0)
                  .toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
                badge={`${(Array.isArray(transactions) ? transactions : []).filter((t) => t.type?.toLowerCase() === "withdrawal").length} salidas`}
                badgeType="warning"
                icon={TrendingDown}
                accent="amber"
                subtitle="Salidas y transferencias"
                action={
                  <button className="metric-card-action-btn" aria-label="Opciones de retiros" type="button">
                    <MoreHorizontal size={16} />
                  </button>
                }
                graphic={
                  <svg className="kpi-graphic bars-graphic red" width="44" height="26" viewBox="0 0 44 26" fill="none" aria-hidden="true">
                    <rect x="2" y="16" width="5" height="10" rx="2" fill="#ef4444" fillOpacity="0.35" />
                    <rect x="12" y="8" width="5" height="18" rx="2" fill="#ef4444" fillOpacity="0.55" />
                    <rect x="22" y="14" width="5" height="12" rx="2" fill="#ef4444" fillOpacity="0.8" />
                    <rect x="32" y="6" width="5" height="20" rx="2" fill="#ef4444" />
                  </svg>
                }
              />

              <MetricCard
                title="Ahorro en Bóvedas"
                value={`$${(Array.isArray(vaults) ? vaults : [])
                  .reduce((sum, v) => sum + Number(v.currentAmount || 0), 0)
                  .toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
                badge={`${(Array.isArray(vaults) ? vaults : []).length} metas`}
                badgeType="info"
                icon={PiggyBank}
                accent="cyan"
                subtitle="Fondos asegurados"
                graphicType="bars-cyan"
              />
            </div>

            <div className="dashboard-layout">
              <div className="left-side">
                <div className="transactions">
                  <h2>
                    <span>Transacciones Recientes</span>
                    <Link to="/transactions" className="dashboard-section-link">
                      Ver todas →
                    </Link>
                  </h2>
                  <div className="transactions-list">
                    {(Array.isArray(transactions) ? transactions : []).length === 0 ? (
                      <div className="tx-empty-state">
                        <Wallet size={30} className="tx-empty-icon" />
                        <p className="tx-empty-title">Sin movimientos recientes</p>
                        <span className="tx-empty-subtitle">Tus operaciones de depósito o transferencias se reflejarán aquí</span>
                      </div>
                    ) : (
                      (Array.isArray(transactions) ? transactions : []).map((tx, index) => (
                        <div key={index} className="transaction-row">
                          <div className="tx-left">
                            {tx.type?.toLowerCase() === "deposit" && (
                              <ArrowDownLeft className="tx-icon deposit" />
                            )}
                            {tx.type?.toLowerCase() === "withdrawal" && (
                              <ArrowUpRight className="tx-icon withdrawal" />
                            )}
                            {tx.type?.toLowerCase() === "transfer" && (
                              <Send className="tx-icon transfer" />
                            )}
                            <div className="tx-details">
                              <h4>
                                {tx.description ||
                                  (tx.type === "DEPOSIT"
                                    ? "Depósito recibido"
                                    : tx.type === "WITHDRAWAL"
                                    ? "Retiro de fondos"
                                    : "Transferencia")}
                              </h4>
                              <span className="tx-date">{tx.date}</span>
                            </div>
                          </div>
                          <div className="tx-right">
                            <span
                              className={`tx-amount ${
                                tx.type?.toLowerCase() === "deposit"
                                  ? "positive"
                                  : "negative"
                              }`}
                            >
                              {tx.type?.toLowerCase() === "deposit" ? "+" : "-"}$
                              {Number(tx.amount).toFixed(2)}
                            </span>
                            <span className="tx-menu">⋯</span>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                <div className="virtualCards">
                  <div className="virtual-cards-header">
                    <h2 className="vcH2" style={{ margin: 0 }}>Tarjetas Virtuales</h2>
                    <Link to="/cards" className="dashboard-section-link">
                      Administrar →
                    </Link>
                  </div>
                  <div className="cards-carousel">
                    {cardList.map((card, index) => (
                      <div
                        key={card.id || index}
                        className="virtual-card"
                        style={{
                          background: cardColors[index % cardColors.length],
                        }}
                        onClick={() => {
                          setCvc(card.cvv);
                          setSelectedCardIndex(index);
                          setIsCardFlipped(true);
                          setShowFullCardNumber(false);
                          setShowCardBack(true);
                        }}
                      >
                        <img
                          src="/tx.png"
                          alt="Chip de tarjeta"
                          className="card-chip-img"
                        />
                        <div className="card-number">
                          {card.cardNumber.match(/.{1,4}/g).join(" ")}
                        </div>
                        <div className="card-info">
                          <div>
                            <span className="label">TITULAR</span>
                            <h4>{user?.firstName + " " + user?.lastName}</h4>
                            <span>
                              Vence:{" "}
                              {new Date(card.expiryDate).toLocaleDateString(
                                "es-ES",
                                {
                                  month: "2-digit",
                                  year: "2-digit",
                                }
                              )}
                            </span>
                          </div>
                          <img
                            src="/mc.png"
                            alt="Logo Mastercard"
                            className="card-logo-img"
                          />
                        </div>
                      </div>
                    ))}

                    <div
                      className="virtual-card add-card"
                      onClick={() => setShowAddModal(true)}
                    >
                      <div className="plus-sign">+</div>
                      <p>Agregar Tarjeta</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="right-side">
                <div className="chart-box">
                  <h2>
                    <span>Gastos de Hoy</span>
                    <span style={{ fontSize: "var(--text-xs)", color: "var(--text-muted)", fontWeight: 400 }}>
                      Retiros y envíos
                    </span>
                  </h2>
                  {chartData.length > 0 ? (
                    <ResponsiveContainer width="100%" height={210}>
                      <LineChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.06)" />
                        <XAxis dataKey="time" stroke="#64748b" fontSize={11} />
                        <YAxis stroke="#64748b" fontSize={11} />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: "#0b0f19",
                            border: "1px solid rgba(255, 255, 255, 0.1)",
                            borderRadius: "8px",
                            color: "#fff",
                            fontSize: "12px",
                          }}
                          formatter={(value) => [`$${Number(value).toFixed(2)} USD`, "Gasto"]}
                        />
                        <Line
                          type="monotone"
                          dataKey="amount"
                          stroke="#38bdf8"
                          strokeWidth={2.5}
                          dot={{ r: 3, fill: "#38bdf8" }}
                          activeDot={{ r: 5, fill: "#38bdf8" }}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="chart-placeholder">
                      <TrendingUp size={28} className="chart-placeholder-icon" />
                      <p>Sin gastos registrados hoy</p>
                      <span>Tus consumos diarios generarán la curva de gastos</span>
                    </div>
                  )}
                </div>

                <div className="available-cards">
                  <h2>
                    <span>Mis Bóvedas de Ahorro</span>
                    <Link to="/vaults" className="dashboard-section-link">
                      Ver todas →
                    </Link>
                  </h2>
                  {vaults.length === 0 ? (
                    <p style={{ color: "var(--text-muted)", fontSize: "0.85rem", marginTop: "10px" }}>
                      No tienes bóvedas activas.{" "}
                      <Link to="/vaults" style={{ color: "#38bdf8", fontWeight: 500 }}>
                        Crear una
                      </Link>
                    </p>
                  ) : (
                    <div
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        gap: "10px",
                        marginTop: "10px",
                      }}
                    >
                      {(Array.isArray(vaults) ? vaults : []).slice(0, 2).map((v) => {
                        const cur = Number(v.currentAmount || 0);
                        const tar = Number(v.targetAmount || 1);
                        const pct = Math.min(
                          100,
                          Math.round(
                            v.progressPercentage ?? (cur / tar) * 100
                          )
                        );
                        return (
                          <div
                            key={v.id}
                            style={{
                              background: "rgba(255, 255, 255, 0.03)",
                              border: "1px solid rgba(255, 255, 255, 0.06)",
                              padding: "10px 14px",
                              borderRadius: "10px",
                            }}
                          >
                            <div
                              style={{
                                display: "flex",
                                justifyContent: "space-between",
                                marginBottom: "4px",
                              }}
                            >
                              <span
                                style={{ fontWeight: 600, fontSize: "0.9rem" }}
                              >
                                {v.name}
                              </span>
                              <span
                                style={{
                                  color: "#10b981",
                                  fontSize: "0.85rem",
                                  fontWeight: "bold",
                                }}
                              >
                                ${cur.toFixed(2)} / ${tar.toFixed(2)}
                              </span>
                            </div>
                            <div
                              style={{
                                height: "6px",
                                background: "rgba(255, 255, 255, 0.08)",
                                borderRadius: "3px",
                                overflow: "hidden",
                              }}
                            >
                              <div
                                style={{
                                  width: `${pct}%`,
                                  height: "100%",
                                  background:
                                    "linear-gradient(90deg, #38bdf8, #10b981)",
                                }}
                              />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

                <div className="quick-actions-card">
                  <h2>Acciones Rápidas</h2>
                  <div className="quick-actions-grid">
                    <Link to="/transactions" className="quick-action-btn">
                      <div className="quick-action-icon send">
                        <Send size={16} />
                      </div>
                      <div className="quick-action-labels">
                        <strong>Transferir</strong>
                        <span>Envío inmediato</span>
                      </div>
                    </Link>

                    <Link to="/bills" className="quick-action-btn">
                      <div className="quick-action-icon pay">
                        <Zap size={16} />
                      </div>
                      <div className="quick-action-labels">
                        <strong>Pagar Servicios</strong>
                        <span>Facturas y débitos</span>
                      </div>
                    </Link>

                    <Link to="/loans" className="quick-action-btn">
                      <div className="quick-action-icon credit">
                        <CreditCard size={16} />
                      </div>
                      <div className="quick-action-labels">
                        <strong>Simular Crédito</strong>
                        <span>Tasa fija 12% anual</span>
                      </div>
                    </Link>

                    <Link to="/vaults" className="quick-action-btn">
                      <div className="quick-action-icon vault">
                        <PiggyBank size={16} />
                      </div>
                      <div className="quick-action-labels">
                        <strong>Nueva Bóveda</strong>
                        <span>Ahorro programado</span>
                      </div>
                    </Link>
                  </div>
                </div>
              </div>
            </div>

      {showAddModal && (
        <div className="modal-overlay" onClick={() => setShowAddModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2>¿Generar una nueva tarjeta virtual?</h2>
            <p className="modal-desc">
              Se emitirá una nueva tarjeta virtual protegida al instante para tus compras en línea.
            </p>
            <div className="modal-actions">
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => setShowAddModal(false)}
              >
                Cancelar
              </button>
              <button
                type="button"
                className="btn btn-primary"
                onClick={confirmNewCard}
              >
                Generar Tarjeta
              </button>
            </div>
          </div>
        </div>
      )}

      {showCardBack && selectedCard && (
        <div className="modal-overlay" onClick={() => setShowCardBack(false)}>
          <div
            className="modal-content card-detail-modal"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="card-detail-header">
              <div>
                <h2>Detalles de Tarjeta</h2>
                <p className="modal-desc">
                  Información para compras seguras en internet
                </p>
              </div>
              <button
                type="button"
                className="modal-close-btn"
                onClick={() => setShowCardBack(false)}
                aria-label="Cerrar"
              >
                <X size={20} />
              </button>
            </div>

            {/* Vista Previa 3D con Giro Interactivo */}
            <div className="card-preview-container">
              <div
                className={`card-3d-flipper ${isCardFlipped ? "flipped" : ""}`}
                onClick={() => setIsCardFlipped(!isCardFlipped)}
                title="Haz clic para voltear la tarjeta"
              >
                {/* Frente */}
                <div
                  className="card-face front"
                  style={{
                    background: cardColors[selectedCardIndex % cardColors.length],
                  }}
                >
                  <div className="card-face-top">
                    <img
                      src="/tx.png"
                      alt="Chip"
                      className="card-chip-img"
                    />
                    <span className="card-type-tag">
                      {selectedCard.cardType === "DISPOSABLE"
                        ? "DESECHABLE"
                        : selectedCard.cardType === "PHYSICAL"
                        ? "FÍSICA"
                        : "VIRTUAL"}
                    </span>
                  </div>

                  <div className="card-face-number">
                    {showFullCardNumber
                      ? selectedCard.cardNumber?.match(/.{1,4}/g)?.join(" ")
                      : `•••• •••• •••• ${selectedCard.cardNumber?.slice(-4)}`}
                  </div>

                  <div className="card-face-bottom">
                    <div>
                      <span className="label">TITULAR</span>
                      <h4>{user?.firstName + " " + user?.lastName}</h4>
                      <span className="card-exp">
                        VENCE:{" "}
                        {new Date(selectedCard.expiryDate).toLocaleDateString(
                          "es-ES",
                          { month: "2-digit", year: "2-digit" }
                        )}
                      </span>
                    </div>
                    <img
                      src="/mc.png"
                      alt="Mastercard"
                      className="card-logo-img"
                    />
                  </div>
                </div>

                {/* Reverso */}
                <div
                  className="card-face back"
                  style={{
                    background: cardColors[selectedCardIndex % cardColors.length],
                  }}
                >
                  <div className="card-back-magnetic-strip" />

                  <div className="card-back-body">
                    <div className="card-back-signature-row">
                      <div className="card-signature-panel">
                        <span className="signature-watermark">FIRMA AUTORIZADA</span>
                      </div>
                      <div className="card-cvc-box">
                        <span className="cvc-small-label">CVC</span>
                        <span className="cvc-number">{selectedCard.cvv || cvc}</span>
                      </div>
                    </div>

                    <p className="card-back-disclaimer">
                      Tarjeta digital emitida por NeoBank. Para uso exclusivo del titular autorizado.
                      Mantén siempre tu código CVC protegido.
                    </p>

                    <div className="card-back-footer">
                      <div className="card-security-badge">
                        <ShieldCheck size={14} /> NeoShield 256-bit
                      </div>
                      <img
                        src="/mc.png"
                        alt="Mastercard"
                        className="card-logo-img-mini"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Botón Voltear */}
              <button
                type="button"
                className="card-flip-btn"
                onClick={() => setIsCardFlipped(!isCardFlipped)}
              >
                <RotateCcw size={15} />
                <span>{isCardFlipped ? "Ver Frente de la Tarjeta" : "Ver Reverso (CVC)"}</span>
              </button>
            </div>

            {/* Datos copiables */}
            <div className="card-info-grid">
              <div className="card-info-row full-width">
                <span className="info-label">Número de Tarjeta</span>
                <div className="info-val-wrap">
                  <span className="info-mono">
                    {showFullCardNumber
                      ? selectedCard.cardNumber?.match(/.{1,4}/g)?.join(" ")
                      : `•••• •••• •••• ${selectedCard.cardNumber?.slice(-4)}`}
                  </span>
                  <div className="info-actions">
                    <button
                      type="button"
                      className="copy-mini-btn"
                      onClick={() => setShowFullCardNumber(!showFullCardNumber)}
                      title={showFullCardNumber ? "Ocultar número" : "Mostrar número completo"}
                    >
                      {showFullCardNumber ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                    <button
                      type="button"
                      className={`copy-mini-btn ${copiedField === "number" ? "copied" : ""}`}
                      onClick={() => copyToClipboard(selectedCard.cardNumber, "number")}
                      title="Copiar número"
                    >
                      {copiedField === "number" ? <Check size={16} /> : <Copy size={16} />}
                    </button>
                  </div>
                </div>
              </div>

              <div className="card-info-row">
                <span className="info-label">Fecha de Vencimiento</span>
                <div className="info-val-wrap">
                  <span className="info-mono">
                    {new Date(selectedCard.expiryDate).toLocaleDateString(
                      "es-ES",
                      { month: "2-digit", year: "2-digit" }
                    )}
                  </span>
                </div>
              </div>

              <div className="card-info-row">
                <span className="info-label">Código de Seguridad (CVC)</span>
                <div className="info-val-wrap">
                  <span className="info-mono cvc-highlight">{selectedCard.cvv || cvc}</span>
                  <button
                    type="button"
                    className={`copy-mini-btn ${copiedField === "cvc" ? "copied" : ""}`}
                    onClick={() => copyToClipboard(selectedCard.cvv || cvc, "cvc")}
                    title="Copiar CVC"
                  >
                    {copiedField === "cvc" ? <Check size={16} /> : <Copy size={16} />}
                  </button>
                </div>
              </div>
            </div>

            {/* Acciones */}
            <div className="card-modal-footer">
              <Link
                to="/cards"
                className="btn btn-secondary"
                onClick={() => setShowCardBack(false)}
              >
                <ExternalLink size={16} /> Gestionar en Tarjetas
              </Link>
              <button
                type="button"
                className="btn btn-primary"
                onClick={() => setShowCardBack(false)}
              >
                Listo
              </button>
            </div>
          </div>
        </div>
      )}
    </ClientLayout>
  );
}
