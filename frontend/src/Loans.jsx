import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import {
  Landmark,
  Calculator,
  DollarSign,
  CheckCircle2,
  AlertCircle,
  Clock,
  Check,
  RefreshCw,
  Sparkles,
  ShieldCheck,
} from "lucide-react";
import ClientLayout from "./ClientLayout";
import Pagination from "./components/Pagination";
import Modal from "./Modal";
import "./Dashboard.css";
import "./Loans.css";
import "./LightMode.css";

export default function Loans() {
  const navigate = useNavigate();
  const [loans, setLoans] = useState([]);
  const [balance, setBalance] = useState(0);
  const [loading, setLoading] = useState(true);

  // Simulador
  const [amount, setAmount] = useState(3000);
  const [termMonths, setTermMonths] = useState(12);
  const [purpose, setPurpose] = useState("Consolidación de Deudas");
  const [simulation, setSimulation] = useState(null);

  // Modales
  const [showApplyModal, setShowApplyModal] = useState(false);
  const [showPayModal, setShowPayModal] = useState(false);
  const [selectedLoan, setSelectedLoan] = useState(null);
  const [payAmount, setPayAmount] = useState("");

  // Feedback
  const [feedbackSuccess, setFeedbackSuccess] = useState("");
  const [feedbackError, setFeedbackError] = useState("");
  const [actionLoading, setActionLoading] = useState(false);

  // Filtros y Paginación de Préstamos
  const [loanStatusFilter, setLoanStatusFilter] = useState("ALL");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 4;

  const token = localStorage.getItem("token");

  // Simulación en tiempo real
  useEffect(() => {
    const p = Number(amount) || 0;
    const n = Number(termMonths) || 12;
    const annualRate = 12.0; // 12% annual
    const r = annualRate / 100 / 12;

    if (p > 0 && n > 0) {
      let monthly = 0;
      if (r > 0) {
        monthly = (p * (r * Math.pow(1 + r, n))) / (Math.pow(1 + r, n) - 1);
      } else {
        monthly = p / n;
      }
      const totalRepay = monthly * n;
      const totalInterest = totalRepay - p;

      setSimulation({
        monthlyPayment: Math.round(monthly * 100) / 100,
        totalRepayment: Math.round(totalRepay * 100) / 100,
        totalInterest: Math.round(totalInterest * 100) / 100,
        annualRate,
      });
    }
  }, [amount, termMonths]);

  const fetchData = async () => {
    if (!token) {
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      const [loansRes, userRes] = await Promise.all([
        axios.get("http://localhost:8080/api/loans", {
          headers: { Authorization: `Bearer ${token}` },
        }),
        axios.get("http://localhost:8080/api/auth/me", {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);
      setLoans(loansRes.data || []);
      setBalance(userRes.data?.balance ?? 0);
    } catch (err) {
      console.error("Error al cargar préstamos:", err);
      setFeedbackError("No se pudieron cargar los datos de préstamos.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!token) {
      navigate("/login");
      return;
    }
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  const showSuccess = (msg) => {
    setFeedbackSuccess(msg);
    setTimeout(() => setFeedbackSuccess(""), 4000);
  };

  const showError = (msg) => {
    setFeedbackError(msg);
    setTimeout(() => setFeedbackError(""), 5000);
  };

  // Solicitar Préstamo
  const handleApply = async (e) => {
    e.preventDefault();
    setActionLoading(true);
    setFeedbackError("");
    try {
      await axios.post(
        "http://localhost:8080/api/loans/apply",
        {
          amount: parseFloat(amount),
          termMonths: parseInt(termMonths),
          purpose,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setShowApplyModal(false);
      showSuccess("¡Solicitud enviada exitosamente! Está pendiente de aprobación por el equipo de crédito.");
      await fetchData();
    } catch (err) {
      showError(err.response?.data?.message || "Error al enviar la solicitud.");
    } finally {
      setActionLoading(false);
    }
  };

  // Pagar Cuota de Préstamo
  const handlePay = async (e) => {
    e.preventDefault();
    if (!selectedLoan) return;
    const paymentToApply = payAmount ? parseFloat(payAmount) : selectedLoan.monthlyPayment;
    if (balance < paymentToApply) {
      showError("Saldo insuficiente en tu cuenta bancaria para realizar este abono.");
      return;
    }

    setActionLoading(true);
    try {
      await axios.post(
        `http://localhost:8080/api/loans/${selectedLoan.id}/pay`,
        { amount: paymentToApply },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setShowPayModal(false);
      setPayAmount("");
      showSuccess("Abono procesado correctamente.");
      await fetchData();
    } catch (err) {
      showError(err.response?.data?.message || "Error al procesar el pago.");
    } finally {
      setActionLoading(false);
    }
  };

  const termsAvailable = [3, 6, 12, 18, 24, 36];

  const filteredLoans = loans.filter((l) => {
    if (loanStatusFilter === "ALL") return true;
    return l.status === loanStatusFilter;
  });
  const totalLoans = filteredLoans.length;
  const paginatedLoans = filteredLoans.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <ClientLayout
      active="loans"
      title="Préstamos y Créditos"
      subtitle="Simula tu crédito a tasa fija, solicita financiamiento en minutos y gestiona tus pagos"
    >
      {/* Notificaciones */}
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

        {/* Simulador Interactivo */}
        <section className="loan-simulator-card">
          <div className="simulator-header">
            <div className="sim-icon">
              <Calculator size={22} />
            </div>
            <div>
              <h2>Simulador de Préstamo Personal</h2>
              <p>Personaliza el monto y el plazo para calcular tu cuota mensual estimada.</p>
            </div>
          </div>

          <div className="simulator-body-grid">
            {/* Controles de Sliders */}
            <div className="simulator-controls">
              <div className="sim-control-group">
                <div className="sim-label-row">
                  <label htmlFor="amountSlider">¿Cuánto necesitas?</label>
                  <span className="sim-val-highlight">${Number(amount).toLocaleString()} USD</span>
                </div>
                <input
                  id="amountSlider"
                  type="range"
                  min="500"
                  max="20000"
                  step="100"
                  className="range-slider"
                  value={amount}
                  onChange={(e) => setAmount(Number(e.target.value))}
                />
                <div className="range-bounds">
                  <span>$500</span>
                  <span>$20,000</span>
                </div>
              </div>

              <div className="sim-control-group">
                <div className="sim-label-row">
                  <label htmlFor="termSelect">¿En qué plazo prefieres pagarlo?</label>
                  <span className="sim-val-highlight">{termMonths} Meses</span>
                </div>
                <div className="term-chips-list">
                  {termsAvailable.map((t) => (
                    <button
                      key={t}
                      type="button"
                      className={`term-chip ${termMonths === t ? "active" : ""}`}
                      onClick={() => setTermMonths(t)}
                    >
                      {t} meses
                    </button>
                  ))}
                </div>
              </div>

              <div className="sim-control-group">
                <label className="sim-label" htmlFor="purposeSelect">Destino del Crédito</label>
                <select
                  id="purposeSelect"
                  className="form-control select-custom"
                  value={purpose}
                  onChange={(e) => setPurpose(e.target.value)}
                >
                  <option value="Consolidación de Deudas">Consolidación de Deudas</option>
                  <option value="Negocio y Emprendimiento">Negocio y Emprendimiento</option>
                  <option value="Mejoras del Hogar">Mejoras del Hogar</option>
                  <option value="Educación o Cursos">Educación o Cursos</option>
                  <option value="Vehículo o Transporte">Vehículo o Transporte</option>
                  <option value="Emergencia Médica">Emergencia Médica</option>
                  <option value="Viajes y Turismo">Viajes y Turismo</option>
                  <option value="Otro">Otro Destino</option>
                </select>
              </div>
            </div>

            {/* Resultado de la Simulación */}
            <div className="simulator-result-box">
              <span className="result-tag">Tasa Fija Anual: 12.00%</span>
              <div className="monthly-payment-display">
                <span className="monthly-label">Tu Cuota Mensual Estimada</span>
                <span className="monthly-val">
                  ${simulation?.monthlyPayment?.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                </span>
                <span className="monthly-note">Incluye capital e intereses sin cargos ocultos</span>
              </div>

              <div className="simulation-breakdown">
                <div className="breakdown-item">
                  <span>Monto solicitado:</span>
                  <strong>${Number(amount).toLocaleString()} USD</strong>
                </div>
                <div className="breakdown-item">
                  <span>Plazo:</span>
                  <strong>{termMonths} cuotas mensuales</strong>
                </div>
                <div className="breakdown-item">
                  <span>Total de intereses:</span>
                  <strong>${simulation?.totalInterest?.toLocaleString(undefined, { minimumFractionDigits: 2 })} USD</strong>
                </div>
                <div className="breakdown-item total">
                  <span>Total a devolver:</span>
                  <strong>${simulation?.totalRepayment?.toLocaleString(undefined, { minimumFractionDigits: 2 })} USD</strong>
                </div>
              </div>

              <button
                type="button"
                className="btn btn-primary btn-block btn-lg"
                onClick={() => setShowApplyModal(true)}
              >
                <Sparkles size={18} /> Solicitar este Crédito
              </button>

              <div className="security-guarantee">
                <ShieldCheck size={16} />
                <span>Aprobación rápida y acreditación directa a tu balance.</span>
              </div>
            </div>
          </div>
        </section>

        {/* Sección de Mis Préstamos */}
        <section className="user-loans-section">
          <div className="section-header-row" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "12px", marginBottom: "16px" }}>
            <div>
              <h3>Historial y Préstamos Activos</h3>
              <p className="subtitle">Consulta el estado de tus solicitudes y abona cuotas pendientes.</p>
            </div>

            {loans.length > 0 && (
              <div className="segmented-tabs-wrapper" style={{ margin: 0 }}>
                {[
                  { id: "ALL", label: `Todos (${loans.length})` },
                  { id: "APPROVED", label: `Aprobados (${loans.filter((l) => l.status === "APPROVED").length})` },
                  { id: "PENDING", label: `En Evaluación (${loans.filter((l) => l.status === "PENDING").length})` },
                  { id: "PAID", label: `Liquidados (${loans.filter((l) => l.status === "PAID").length})` },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    type="button"
                    className={`segmented-tab-btn ${loanStatusFilter === tab.id ? "active" : ""}`}
                    onClick={() => {
                      setLoanStatusFilter(tab.id);
                      setCurrentPage(1);
                    }}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
            )}
          </div>

          {loading ? (
            <div className="loans-loading">
              <RefreshCw className="spin" size={32} />
              <p>Cargando información de créditos...</p>
            </div>
          ) : loans.length === 0 ? (
            <div className="loans-empty-card">
              <Landmark size={36} className="empty-icon" />
              <h4>No tienes solicitudes ni créditos registrados</h4>
              <p>Utiliza el simulador superior para solicitar financiamiento inmediato cuando lo necesites.</p>
            </div>
          ) : filteredLoans.length === 0 ? (
            <div className="loans-empty-card">
              <Landmark size={36} className="empty-icon" />
              <h4>No hay créditos en esta categoría</h4>
              <p>No se encontraron registros que coincidan con el filtro seleccionado.</p>
            </div>
          ) : (
            <>
              <div className="loans-cards-grid">
                {paginatedLoans.map((loan) => {
                  const total = Number(loan.totalRepayment) || 1;
                  const remaining = Number(loan.remainingBalance) || 0;
                  const paid = total - remaining;
                  const progressPct = Math.min(Math.round((paid / total) * 100), 100);

                  return (
                    <div key={loan.id} className="loan-item-card">
                      <div className="loan-card-top">
                        <div>
                          <div className="loan-id-badge">Préstamo #{loan.id}</div>
                          <h4 className="loan-purpose-title">{loan.purpose || "Crédito Personal"}</h4>
                        </div>

                        <span className={`loan-status-badge ${loan.status.toLowerCase()}`}>
                          {loan.status === "APPROVED"
                            ? "Aprobado"
                            : loan.status === "PENDING"
                            ? "En Evaluación"
                            : loan.status === "PAID"
                            ? "Liquidado"
                            : "Rechazado"}
                        </span>
                      </div>

                      <div className="loan-card-metrics">
                        <div>
                          <span className="card-m-label">Monto Solicitado</span>
                          <strong className="card-m-val">${Number(loan.amount).toLocaleString()} USD</strong>
                        </div>
                        <div>
                          <span className="card-m-label">Cuota Mensual</span>
                          <strong className="card-m-val">${Number(loan.monthlyPayment).toLocaleString()} USD</strong>
                        </div>
                        <div>
                          <span className="card-m-label">Saldo Pendiente</span>
                          <strong className="card-m-val highlight">
                            ${remaining.toLocaleString(undefined, { minimumFractionDigits: 2 })} USD
                          </strong>
                        </div>
                        <div>
                          <span className="card-m-label">Plazo</span>
                          <strong className="card-m-val">{loan.termMonths} Meses</strong>
                        </div>
                      </div>

                      {/* Barra de progreso de pago */}
                      <div className="loan-progress-wrap">
                        <div className="loan-progress-labels">
                          <span>Progreso de pago: {progressPct}%</span>
                          <span>Pagado: ${paid.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                        </div>
                        <div className="loan-progress-track">
                          <div
                            className="loan-progress-bar"
                            style={{ width: `${progressPct}%` }}
                          />
                        </div>
                      </div>

                      {loan.adminNotes && (
                        <div className="loan-admin-note">
                          <strong>Nota del Administrador:</strong> {loan.adminNotes}
                        </div>
                      )}

                      {/* Acciones */}
                      <div className="loan-card-actions">
                        {loan.status === "APPROVED" && remaining > 0 && (
                          <button
                            type="button"
                            className="btn btn-primary btn-sm"
                            onClick={() => {
                              setSelectedLoan(loan);
                              setPayAmount(String(loan.monthlyPayment));
                              setShowPayModal(true);
                            }}
                          >
                            <DollarSign size={16} /> Abonar a Cuota
                          </button>
                        )}
                        {loan.status === "PAID" && (
                          <span className="paid-badge-msg">
                            <Check size={16} /> Crédito totalmente saldado
                          </span>
                        )}
                        {loan.status === "PENDING" && (
                          <span className="pending-badge-msg">
                            <Clock size={16} /> Solicitud en revisión por el banco
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Paginación Reutilizable */}
              <Pagination
                currentPage={currentPage}
                totalItems={totalLoans}
                pageSize={itemsPerPage}
                onPageChange={setCurrentPage}
                itemLabel="préstamos"
                style={{ marginTop: "16px" }}
              />
            </>
          )}
        </section>

        {/* Modal: Confirmar Solicitud */}
        <Modal
          isOpen={showApplyModal}
          onClose={() => setShowApplyModal(false)}
          title="Confirmar Solicitud de Crédito"
          subtitle="Revisa los términos del préstamo antes de enviar tu solicitud para revisión"
          icon={Calculator}
          maxWidth="480px"
        >
          <div className="modal-summary-box" style={{ marginBottom: "20px" }}>
            <div className="summary-row">
              <span>Monto a recibir:</span>
              <strong>${Number(amount).toLocaleString()} USD</strong>
            </div>
            <div className="summary-row">
              <span>Plazo seleccionado:</span>
              <strong>{termMonths} meses</strong>
            </div>
            <div className="summary-row">
              <span>Cuota mensual:</span>
              <strong>
                $
                {simulation?.monthlyPayment?.toLocaleString(undefined, {
                  minimumFractionDigits: 2,
                })}{" "}
                USD
              </strong>
            </div>
            <div className="summary-row">
              <span>Total a devolver:</span>
              <strong>
                $
                {simulation?.totalRepayment?.toLocaleString(undefined, {
                  minimumFractionDigits: 2,
                })}{" "}
                USD
              </strong>
            </div>
            <div className="summary-row">
              <span>Destino:</span>
              <strong>{purpose}</strong>
            </div>
          </div>

          <div className="modal-actions" style={{ display: "flex", justifyContent: "flex-end", gap: "10px" }}>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => setShowApplyModal(false)}
            >
              Modificar
            </button>
            <button
              type="button"
              className="btn btn-primary"
              onClick={handleApply}
              disabled={actionLoading}
            >
              {actionLoading ? "Enviando..." : "Confirmar y Solicitar"}
            </button>
          </div>
        </Modal>

        {/* Modal: Abonar a Préstamo */}
        <Modal
          isOpen={showPayModal}
          onClose={() => setShowPayModal(false)}
          title={`Abonar a Préstamo #${selectedLoan?.id}`}
          subtitle="El monto se deducirá automáticamente del saldo de tu cuenta NeoBank"
          icon={Landmark}
          maxWidth="480px"
        >
          <div
            className="user-balance-callout"
            style={{
              background: "rgba(255,255,255,0.05)",
              padding: "12px 16px",
              borderRadius: "8px",
              display: "flex",
              justifyContent: "space-between",
              marginBottom: "16px",
            }}
          >
            <span style={{ color: "#aaa" }}>Tu saldo disponible:</span>
            <strong style={{ color: "#10b981" }}>
              ${Number(balance).toLocaleString(undefined, { minimumFractionDigits: 2 })} USD
            </strong>
          </div>

          <form onSubmit={handlePay}>
            <div className="form-group" style={{ marginBottom: "16px" }}>
              <label className="form-label" htmlFor="payAmountInput" style={{ display: "block", marginBottom: "6px", color: "#ddd" }}>
                Monto a pagar ($ USD / S/. PEN)
              </label>
              <input
                id="payAmountInput"
                type="number"
                min="1"
                step="0.01"
                placeholder="Ej. 250.00"
                max={selectedLoan?.remainingBalance}
                className="form-control"
                value={payAmount}
                onChange={(e) => setPayAmount(e.target.value)}
                required
                style={{ width: "100%", padding: "10px 12px", borderRadius: "8px" }}
              />
              <small className="form-hint" style={{ color: "#888", display: "block", marginTop: "6px" }}>
                Cuota recomendada: $
                {Number(selectedLoan?.monthlyPayment).toLocaleString(undefined, {
                  minimumFractionDigits: 2,
                })}{" "}
                | Saldo total: $
                {Number(selectedLoan?.remainingBalance).toLocaleString(undefined, {
                  minimumFractionDigits: 2,
                })}
              </small>
            </div>

            <div className="quick-pay-chips" style={{ display: "flex", gap: "8px", marginBottom: "20px" }}>
              <button
                type="button"
                className="btn btn-secondary btn-sm"
                onClick={() => setPayAmount(String(selectedLoan?.monthlyPayment))}
              >
                1 Cuota (${selectedLoan?.monthlyPayment})
              </button>
              <button
                type="button"
                className="btn btn-secondary btn-sm"
                onClick={() => setPayAmount(String(selectedLoan?.remainingBalance))}
              >
                Liquidar Todo ($
                {Number(selectedLoan?.remainingBalance).toLocaleString(undefined, {
                  minimumFractionDigits: 2,
                })}
                )
              </button>
            </div>

            <div className="modal-actions" style={{ display: "flex", justifyContent: "flex-end", gap: "10px" }}>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => setShowPayModal(false)}
              >
                Cancelar
              </button>
              <button type="submit" className="btn btn-primary" disabled={actionLoading}>
                {actionLoading ? "Procesando..." : "Confirmar Pago"}
              </button>
            </div>
          </form>
        </Modal>
    </ClientLayout>
  );
}
