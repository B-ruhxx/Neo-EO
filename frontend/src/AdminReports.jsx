import { useState, useEffect } from "react";
import axios from "axios";
import {
  Download,
  Search,
  UserCheck,
  Landmark,
  Users,
  ShieldCheck,
  RefreshCw,
  Clock,
  FileSpreadsheet,
} from "lucide-react";
import AdminLayout from "./AdminLayout";
import { Pagination } from "./components";
import "./Admin.css";

export default function AdminReports() {
  const [userId, setUserId] = useState("");
  const [report, setReport] = useState(null);
  const [auditLogs, setAuditLogs] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [actionFilter, setActionFilter] = useState("ALL");
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [exportingFull, setExportingFull] = useState(false);
  const [exportingUser, setExportingUser] = useState(false);

  const token = localStorage.getItem("adminToken") || localStorage.getItem("token");

  const getHeaders = () => ({
    Authorization: `Bearer ${token}`,
  });

  const fetchData = async () => {
    try {
      setLoading(true);
      const [reportRes, logsRes] = await Promise.all([
        axios.get("http://localhost:8080/api/admin/reports", { headers: getHeaders() }),
        axios.get("http://localhost:8080/api/audit-logs", { headers: getHeaders() }),
      ]);
      setReport(reportRes.data);
      setAuditLogs(logsRes.data || []);
    } catch (err) {
      console.error("Error al cargar reportes y logs:", err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchData();
  };

  const exportFullReport = async () => {
    setExportingFull(true);
    try {
      const res = await axios.get("http://localhost:8080/api/admin/reports/export", {
        headers: getHeaders(),
        responseType: "blob",
      });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", "reporte_institucional_neobank.csv");
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      console.error("Fallo al exportar reporte completo", err);
      alert("Error al generar el reporte CSV institucional.");
    } finally {
      setExportingFull(false);
    }
  };

  const exportUserReport = async () => {
    if (!userId.trim()) {
      alert("Por favor ingresa un ID numérico de usuario (ej. 1)");
      return;
    }
    setExportingUser(true);
    try {
      const res = await axios.get(
        `http://localhost:8080/api/admin/reports/user/${userId.trim()}/export`,
        {
          headers: getHeaders(),
          responseType: "blob",
        }
      );
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `extracto_usuario_${userId.trim()}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      console.error("Error al exportar reporte de usuario", err);
      alert("No se encontró al usuario con ID " + userId);
    } finally {
      setExportingUser(false);
    }
  };

  // Filtrado de logs
  const filteredLogs = auditLogs.filter((log) => {
    const matchesAction = actionFilter === "ALL" ? true : (log.action && log.action.includes(actionFilter));
    const term = searchTerm.toLowerCase().trim();
    if (!term) return matchesAction;

    const matchesSearch =
      (log.action && log.action.toLowerCase().includes(term)) ||
      (log.performedBy && log.performedBy.toLowerCase().includes(term)) ||
      (log.description && log.description.toLowerCase().includes(term));

    return matchesAction && matchesSearch;
  });

  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;
  useEffect(() => {
    setCurrentPage(1);
  }, [actionFilter, searchTerm]);

  const totalItems = filteredLogs.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = Math.min(startIndex + pageSize, totalItems);
  const paginatedLogs = filteredLogs.slice(startIndex, endIndex);

  return (
    <AdminLayout>
      {/* Encabezado */}
      <div className="admin-header-row">
        <div>
          <h1>Centro de Reportes y Auditoría</h1>
          <p>
            Generación de extractos ejecutivos, balances institucionales y trazabilidad del sistema en tiempo real.
          </p>
        </div>

        <div className="admin-header-actions">
          <button className="quick-link-btn" onClick={handleRefresh} disabled={refreshing}>
            <RefreshCw className={`icon ${refreshing ? "spin" : ""}`} />{" "}
            {refreshing ? "Sincronizando..." : "Actualizar"}
          </button>
        </div>
      </div>

      {/* 3 Métricas Resumen */}
      <div className="admin-kpi-grid">
        <div className="kpi-card">
          <div className="kpi-header">
            <span>Titulares de Cuenta</span>
            <div className="kpi-icon-wrapper info">
              <Users className="icon" />
            </div>
          </div>
          <div className="kpi-value">{report?.totalUsers ?? 0}</div>
          <div className="kpi-footer">
            <span className="kpi-badge neutral">Base de clientes auditada</span>
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-header">
            <span>Balance Global en Custodia</span>
            <div className="kpi-icon-wrapper success">
              <Landmark className="icon" />
            </div>
          </div>
          <div className="kpi-value">
            ${Number(report?.totalBalance || 0).toLocaleString("es-ES", { minimumFractionDigits: 2 })}
          </div>
          <div className="kpi-footer">
            <span className="kpi-badge positive">Saldo consolidado</span>
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-header">
            <span>Eventos Auditados</span>
            <div className="kpi-icon-wrapper warning">
              <ShieldCheck className="icon" />
            </div>
          </div>
          <div className="kpi-value">{auditLogs.length}</div>
          <div className="kpi-footer">
            <span className="kpi-badge neutral">Registros de trazabilidad</span>
          </div>
        </div>
      </div>

      {/* Herramientas de Exportación (Grid de 2 Tarjetas) */}
      <div className="report-export-grid">
        {/* Tarjeta A: Reporte Global */}
        <div className="report-card">
          <div className="report-card-top">
            <div className="report-card-header">
              <div className="report-icon-box">
                <FileSpreadsheet className="icon" />
              </div>
              <span className="report-card-title">Extracto Institucional Global</span>
            </div>
            <p className="report-card-desc">
              Descarga un archivo CSV estructurado con las métricas consolidadas del banco, balances globales y volumetría agregada por tipo de transacción.
            </p>
          </div>

          <button
            className="btn btn-primary"
            onClick={exportFullReport}
            disabled={exportingFull}
            style={{ width: "100%", marginTop: "var(--space-3)" }}
          >
            <Download size={16} /> {exportingFull ? "Generando CSV..." : "Descargar Reporte CSV"}
          </button>
        </div>

        {/* Tarjeta B: Reporte de Usuario */}
        <div className="report-card">
          <div className="report-card-top">
            <div className="report-card-header">
              <div className="report-icon-box" style={{ backgroundColor: "var(--success-subtle)", color: "var(--success)" }}>
                <UserCheck className="icon" />
              </div>
              <span className="report-card-title">Extracto Individual por Cliente</span>
            </div>
            <p className="report-card-desc">
              Genera el extracto contable específico de un cliente, incluyendo su estado de cuenta, saldo actual y el histórico completo de movimientos.
            </p>
          </div>

          <div className="report-input-group">
            <input
              type="number"
              className="report-input"
              placeholder="Ingresar ID de Usuario (ej. 1)..."
              value={userId}
              onChange={(e) => setUserId(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") exportUserReport();
              }}
            />
            <button
              className="btn btn-secondary"
              onClick={exportUserReport}
              disabled={exportingUser}
              style={{ flexShrink: 0 }}
            >
              <Download size={16} /> {exportingUser ? "Descargando..." : "Exportar"}
            </button>
          </div>
        </div>
      </div>

      {/* Registro de Auditoría en Vivo */}
      <div className="admin-content-box">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "var(--space-3)", marginBottom: "var(--space-4)" }}>
          <div>
            <h2 style={{ fontSize: "var(--text-md)", fontWeight: 600, color: "var(--text-primary)" }}>
              Registro de Auditoría del Sistema (Audit Trail)
            </h2>
            <span style={{ fontSize: "var(--text-xs)", color: "var(--text-muted)" }}>
              Trazabilidad inmutable de ajustes de balance, autorizaciones y eventos del sistema
            </span>
          </div>

          <div style={{ position: "relative", minWidth: 260 }}>
            <Search style={{ position: "absolute", left: 12, top: 11, width: 16, height: 16, color: "var(--text-muted)" }} />
            <input
              type="text"
              placeholder="Filtrar por acción, email o motivo..."
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

        {/* Pestañas de Filtrado de Auditoría */}
        <div style={{ display: "flex", gap: "var(--space-2)", marginBottom: "var(--space-4)", flexWrap: "wrap" }}>
          {[
            { id: "ALL", label: `Todos (${auditLogs.length})` },
            { id: "ADJUSTMENT", label: "Ajustes de Balance" },
            { id: "SECURITY", label: "Seguridad" },
            { id: "SYSTEM", label: "Sistema" },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              className={`filter-tab-btn ${actionFilter === tab.id ? "active" : ""}`}
              onClick={() => setActionFilter(tab.id)}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tabla de Logs */}
        <div className="table-responsive">
          {loading ? (
            <div style={{ padding: "var(--space-8)", textAlign: "center", color: "var(--text-muted)" }}>
              Cargando eventos de auditoría...
            </div>
          ) : filteredLogs.length === 0 ? (
            <div style={{ padding: "var(--space-8)", textAlign: "center", color: "var(--text-muted)" }}>
              <Clock style={{ width: 32, height: 32, margin: "0 auto var(--space-2)", opacity: 0.5 }} />
              No se encontraron registros de auditoría para la búsqueda.
            </div>
          ) : (
            <table className="admin-table">
              <thead>
                <tr>
                  <th style={{ width: 180 }}>Fecha / Hora</th>
                  <th style={{ width: 160 }}>Acción</th>
                  <th style={{ width: 220 }}>Responsable</th>
                  <th>Descripción / Justificación</th>
                </tr>
              </thead>
              <tbody>
                {paginatedLogs.map((log, index) => (
                  <tr key={log.id || index}>
                    <td style={{ whiteSpace: "nowrap", color: "var(--text-muted)", fontSize: "var(--text-xs)" }}>
                      {log.timeStamp || log.timestamp
                        ? new Date(log.timeStamp || log.timestamp).toLocaleString("es-ES")
                        : "—"}
                    </td>
                    <td>
                      <span
                        className="status-badge admin"
                        style={{
                          textTransform: "uppercase",
                          letterSpacing: "0.5px",
                        }}
                      >
                        {log.action}
                      </span>
                    </td>
                    <td>
                      <span style={{ fontWeight: 600, color: "var(--text-primary)", fontSize: "var(--text-xs)" }}>
                        {log.performedBy}
                      </span>
                    </td>
                    <td style={{ color: "var(--text-secondary)", fontSize: "var(--text-xs)" }}>
                      {log.description}
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
          itemLabel="eventos de auditoría"
        />
      </div>
    </AdminLayout>
  );
}
