import { useState, useEffect } from "react";
import axios from "axios";
import {
  CheckCircle2,
  Check,
  XCircle,
  AlertCircle,
  Landmark,
  Clock,
  TrendingUp,
  RefreshCw,
  Search,
  FileText,
} from "lucide-react";
import AdminLayout from "./AdminLayout";
import { Pagination } from "./components";
import "./Admin.css";

export default function AdminLoans() {
  const [loans, setLoans] = useState([]);
  const [filterStatus, setFilterStatus] = useState("ALL");
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Modales
  const [showApproveModal, setShowApproveModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [selectedLoan, setSelectedLoan] = useState(null);
  const [adminNotes, setAdminNotes] = useState("");
  const [actionLoading, setActionLoading] = useState(false);

  // Feedback
  const [feedbackSuccess, setFeedbackSuccess] = useState("");
  const [feedbackError, setFeedbackError] = useState("");

  const token = localStorage.getItem("adminToken") || localStorage.getItem("token");

  const fetchLoans = async () => {
    try {
      setLoading(true);
      const res = await axios.get("http://localhost:8080/api/admin/loans", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setLoans(res.data || []);
    } catch (err) {
      console.error("Error al cargar solicitudes de préstamo:", err);
      setFeedbackError("No se pudieron cargar los préstamos.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchLoans();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchLoans();
  };

  const showSuccess = (msg) => {
    setFeedbackSuccess(msg);
    setTimeout(() => setFeedbackSuccess(""), 4000);
  };

  const showError = (msg) => {
    setFeedbackError(msg);
    setTimeout(() => setFeedbackError(""), 5000);
  };

  // Aprobar Préstamo
  const handleApprove = async (e) => {
    e.preventDefault();
    if (!selectedLoan) return;
    setActionLoading(true);
    try {
      await axios.patch(
        `http://localhost:8080/api/admin/loans/${selectedLoan.id}/approve`,
        { notes: adminNotes || "Aprobado y desembolsado por administración" },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setShowApproveModal(false);
      setAdminNotes("");
      showSuccess(
        `¡Préstamo #${selectedLoan.id} aprobado exitosamente! Fondos de $${Number(selectedLoan.amount).toLocaleString()} USD acreditados.`
      );
      await fetchLoans();
    } catch (err) {
      showError(err.response?.data?.message || "Error al aprobar el préstamo.");
    } finally {
      setActionLoading(false);
    }
  };

  // Rechazar Préstamo
  const handleReject = async (e) => {
    e.preventDefault();
    if (!selectedLoan) return;
    setActionLoading(true);
    try {
      await axios.patch(
        `http://localhost:8080/api/admin/loans/${selectedLoan.id}/reject`,
        { notes: adminNotes || "Rechazado tras evaluación crediticia" },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setShowRejectModal(false);
      setAdminNotes("");
      showSuccess(`Préstamo #${selectedLoan.id} rechazado.`);
      await fetchLoans();
    } catch (err) {
      showError(err.response?.data?.message || "Error al rechazar el préstamo.");
    } finally {
      setActionLoading(false);
    }
  };

  // Métricas
  const totalRequested = loans.reduce((acc, l) => acc + (Number(l.amount) || 0), 0);
  const pendingCount = loans.filter((l) => l.status === "PENDING").length;
  const approvedTotal = loans
    .filter((l) => l.status === "APPROVED" || l.status === "PAID")
    .reduce((acc, l) => acc + (Number(l.amount) || 0), 0);

  // Filtrado compuesto (estado + texto de búsqueda)
  const filteredLoans = loans.filter((l) => {
    const matchesStatus = filterStatus === "ALL" ? true : l.status === filterStatus;
    const term = searchTerm.toLowerCase().trim();
    if (!term) return matchesStatus;

    const matchesSearch =
      (l.userName && l.userName.toLowerCase().includes(term)) ||
      (l.userEmail && l.userEmail.toLowerCase().includes(term)) ||
      (l.purpose && l.purpose.toLowerCase().includes(term)) ||
      String(l.id).includes(term);

    return matchesStatus && matchesSearch;
  });

  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 8;
  useEffect(() => {
    setCurrentPage(1);
  }, [filterStatus, searchTerm]);

  const totalItems = filteredLoans.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = Math.min(startIndex + pageSize, totalItems);
  const paginatedLoans = filteredLoans.slice(startIndex, endIndex);

  return (
    <AdminLayout>
      {/* Encabezado */}
      <div className="admin-header-row">
        <div>
          <h1>Gestión de Créditos y Préstamos</h1>
          <p>
            Revisa solicitudes en espera, evalúa riesgos financieros y autoriza desembolsos directos al balance.
          </p>
        </div>

        <div className="admin-header-actions">
          <button className="quick-link-btn" onClick={handleRefresh} disabled={refreshing}>
            <RefreshCw className={`icon ${refreshing ? "spin" : ""}`} />{" "}
            {refreshing ? "Sincronizando..." : "Actualizar"}
          </button>
        </div>
      </div>

      {/* Alertas de Feedback */}
      {feedbackSuccess && (
        <div className="admin-alert success">
          <CheckCircle2 size={18} />
          <span>{feedbackSuccess}</span>
        </div>
      )}
      {feedbackError && (
        <div className="admin-alert error">
          <AlertCircle size={18} />
          <span>{feedbackError}</span>
        </div>
      )}

      {/* 3 Métricas Ejecutivas */}
      <div className="admin-kpi-grid">
        <div className="kpi-card">
          <div className="kpi-header">
            <span>Total en Solicitudes</span>
            <div className="kpi-icon-wrapper info">
              <Landmark className="icon" />
            </div>
          </div>
          <div className="kpi-value">${totalRequested.toLocaleString()} USD</div>
          <div className="kpi-footer">
            <span className="kpi-badge neutral">{loans.length} solicitudes totales</span>
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-header">
            <span>Pendientes de Aprobación</span>
            <div className={`kpi-icon-wrapper ${pendingCount > 0 ? "warning" : "success"}`}>
              <Clock className="icon" />
            </div>
          </div>
          <div className="kpi-value">{pendingCount}</div>
          <div className="kpi-footer">
            <span className={`kpi-badge ${pendingCount > 0 ? "alert" : "positive"}`}>
              {pendingCount > 0 ? "Requieren tu acción" : "Al día, sin pendientes"}
            </span>
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-header">
            <span>Capital Desembolsado</span>
            <div className="kpi-icon-wrapper success">
              <TrendingUp className="icon" />
            </div>
          </div>
          <div className="kpi-value">${approvedTotal.toLocaleString()} USD</div>
          <div className="kpi-footer">
            <span className="kpi-badge positive">Capital activo circulante</span>
          </div>
        </div>
      </div>

      {/* Contenedor Principal: Filtros + Búsqueda + Tabla */}
      <div className="admin-content-box">
        {/* Barra de Filtros y Búsqueda */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "var(--space-3)", marginBottom: "var(--space-4)" }}>
          <div className="admin-filter-tabs">
            {[
              { id: "ALL", label: `Todas (${loans.length})` },
              { id: "PENDING", label: `Pendientes (${pendingCount})` },
              { id: "APPROVED", label: "Aprobadas" },
              { id: "PAID", label: "Liquidadas" },
              { id: "REJECTED", label: "Rechazadas" },
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                className={`filter-tab-btn ${filterStatus === tab.id ? "active" : ""}`}
                onClick={() => setFilterStatus(tab.id)}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div style={{ position: "relative", minWidth: 240 }}>
            <Search style={{ position: "absolute", left: 12, top: 11, width: 16, height: 16, color: "var(--text-muted)" }} />
            <input
              type="text"
              placeholder="Buscar por usuario, email o motivo..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                width: "100%",
                padding: "8px 12px 8px 36px",
                backgroundColor: "var(--bg-input)",
                border: "1px solid var(--border-subtle)",
                borderRadius: "var(--radius-md)",
                color: "var(--text-primary)",
                fontSize: "var(--text-xs)",
                outline: "none",
              }}
            />
          </div>
        </div>

        {/* Tabla */}
        <div className="table-responsive">
          {loading ? (
            <div style={{ padding: "var(--space-8)", textAlign: "center", color: "var(--text-muted)" }}>
              Cargando solicitudes de crédito...
            </div>
          ) : filteredLoans.length === 0 ? (
            <div style={{ padding: "var(--space-8)", textAlign: "center", color: "var(--text-muted)" }}>
              <FileText style={{ width: 32, height: 32, margin: "0 auto var(--space-2)", opacity: 0.5 }} />
              No se encontraron préstamos para el filtro seleccionado.
            </div>
          ) : (
            <table className="admin-table">
              <thead>
                <tr>
                  <th style={{ width: 60 }}>ID</th>
                  <th>Solicitante</th>
                  <th>Monto Solicitado</th>
                  <th>Plazo</th>
                  <th>Cuota Mensual</th>
                  <th>Destino Declarado</th>
                  <th>Fecha</th>
                  <th>Estado</th>
                  <th style={{ textAlign: "right" }}>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {paginatedLoans.map((loan) => (
                  <tr key={loan.id}>
                    <td><strong>#{loan.id}</strong></td>
                    <td>
                      <div>
                        <div style={{ fontWeight: 600, color: "var(--text-primary)" }}>
                          {loan.userName || "Usuario"}
                        </div>
                        <div className="table-subtext">{loan.userEmail}</div>
                      </div>
                    </td>
                    <td>
                      <span style={{ fontWeight: 700, color: "var(--text-primary)", fontVariantNumeric: "tabular-nums" }}>
                        ${Number(loan.amount).toLocaleString()} USD
                      </span>
                    </td>
                    <td>{loan.termMonths} meses</td>
                    <td style={{ fontVariantNumeric: "tabular-nums" }}>
                      ${Number(loan.monthlyPayment).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </td>
                    <td>{loan.purpose || "Crédito Personal"}</td>
                    <td style={{ whiteSpace: "nowrap", color: "var(--text-muted)", fontSize: "var(--text-xs)" }}>
                      {loan.createdAt ? new Date(loan.createdAt).toLocaleDateString("es-ES") : "—"}
                    </td>
                    <td>
                      <span className={`status-pill ${loan.status.toLowerCase()}`}>
                        {loan.status === "APPROVED"
                          ? "Aprobado"
                          : loan.status === "PENDING"
                          ? "Pendiente"
                          : loan.status === "PAID"
                          ? "Liquidado"
                          : "Rechazado"}
                      </span>
                    </td>
                    <td style={{ textAlign: "right" }}>
                      {loan.status === "PENDING" ? (
                        <div className="table-actions-row" style={{ justifyContent: "flex-end" }}>
                          <button
                            type="button"
                            className="btn-action-approve"
                            onClick={() => {
                              setSelectedLoan(loan);
                              setAdminNotes("");
                              setShowApproveModal(true);
                            }}
                            title="Aprobar y desembolsar dinero a la cuenta del usuario"
                          >
                            <Check size={14} /> Aprobar
                          </button>
                          <button
                            type="button"
                            className="btn-action-reject"
                            onClick={() => {
                              setSelectedLoan(loan);
                              setAdminNotes("");
                              setShowRejectModal(true);
                            }}
                            title="Rechazar solicitud"
                          >
                            <XCircle size={14} /> Rechazar
                          </button>
                        </div>
                      ) : (
                        <span className="table-completed-text">Completado</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          totalItems={totalItems}
          startIndex={startIndex}
          endIndex={endIndex}
          onPageChange={setCurrentPage}
          itemLabel="solicitudes"
        />
      </div>

      {/* Modal: Aprobar Préstamo */}
      {showApproveModal && (
        <div className="modal-overlay" onClick={() => setShowApproveModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2>Aprobar Préstamo #{selectedLoan?.id}</h2>
            <p className="modal-desc">
              Al confirmar, el sistema acreditará automáticamente{" "}
              <strong>${Number(selectedLoan?.amount).toLocaleString()} USD</strong> al saldo de{" "}
              <strong>{selectedLoan?.userEmail}</strong> y generará la notificación bancaria correspondiente.
            </p>

            <form onSubmit={handleApprove}>
              <div className="form-group">
                <label className="form-label" htmlFor="adminNotesApprove">Notas de Aprobación (Opcional)</label>
                <textarea
                  id="adminNotesApprove"
                  className="form-control"
                  rows={3}
                  placeholder="Ej. Cumple con historial crediticio favorable. Desembolso inmediato autorizado."
                  value={adminNotes}
                  onChange={(e) => setAdminNotes(e.target.value)}
                />
              </div>

              <div className="modal-actions">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setShowApproveModal(false)}
                >
                  Cancelar
                </button>
                <button type="submit" className="btn btn-primary" disabled={actionLoading}>
                  {actionLoading ? "Aprobando..." : "Confirmar Aprobación y Desembolso"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Rechazar Préstamo */}
      {showRejectModal && (
        <div className="modal-overlay" onClick={() => setShowRejectModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2>Rechazar Préstamo #{selectedLoan?.id}</h2>
            <p className="modal-desc">
              Indica el motivo del rechazo para que el usuario conozca la resolución en su extracto.
            </p>

            <form onSubmit={handleReject}>
              <div className="form-group">
                <label className="form-label" htmlFor="adminNotesReject">Motivo del Rechazo</label>
                <textarea
                  id="adminNotesReject"
                  className="form-control"
                  rows={3}
                  placeholder="Ej. Capacidad de endeudamiento excedida para el plazo solicitado."
                  value={adminNotes}
                  onChange={(e) => setAdminNotes(e.target.value)}
                  required
                />
              </div>

              <div className="modal-actions">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setShowRejectModal(false)}
                >
                  Cancelar
                </button>
                <button type="submit" className="btn btn-danger" disabled={actionLoading}>
                  {actionLoading ? "Rechazando..." : "Confirmar Rechazo"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
