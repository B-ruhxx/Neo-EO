import { useState, useEffect } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import AdminLayout from "./AdminLayout";
import {
  Users,
  Landmark,
  TrendingUp,
  Activity,
  CheckCircle,
  RefreshCw,
  Database,
  ExternalLink,
} from "lucide-react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";
import { MetricCard, Pagination } from "./components";

const PIE_COLORS = ["#38bdf8", "#10b981", "#f59e0b"];

export default function AdminDashboard() {
  const token = localStorage.getItem("token");

  const [overview, setOverview] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [resolvingId, setResolvingId] = useState(null);

  const getHeaders = () => ({
    Authorization: `Bearer ${token}`,
  });

  const fetchOverviewData = async () => {
    if (!token) return;
    try {
      const res = await axios.get("http://localhost:8080/admin/overview", {
        headers: getHeaders(),
      });
      setOverview(res.data);
    } catch (err) {
      console.error("Error fetching overview, trying fallback endpoints:", err);
      try {
        const [balRes, usersRes, txRes] = await Promise.all([
          axios.get("http://localhost:8080/admin/total-balance", { headers: getHeaders() }),
          axios.get("http://localhost:8080/api/users", { headers: getHeaders() }),
          axios.get("http://localhost:8080/admin/recent-transactions?limit=10", { headers: getHeaders() }),
        ]);
        setOverview({
          kpis: {
            totalUsers: usersRes.data?.length || 0,
            activeUsers: usersRes.data?.filter((u) => u.status === "ACTIVE").length || 0,
            frozenUsers: usersRes.data?.filter((u) => u.status === "FROZEN").length || 0,
            totalDeposits: balRes.data || 0,
            totalLoansVolume: 0,
            activeLoansCount: 0,
            totalVaultSavings: 0,
            vaultsCount: 0,
            transactions24h: txRes.data?.length || 0,
            volume24h: 0,
            unresolvedIncidents: 0,
            openTickets: 0,
          },
          cashflow7Days: [],
          assetDistribution: [
            { name: "Depósitos", value: Number(balRes.data) || 0 },
            { name: "Bóvedas", value: 0 },
            { name: "Préstamos", value: 0 },
          ],
          transactionTypeBreakdown: [],
          recentIncidents: [],
          recentAuditLogs: [],
          recentTransactions: txRes.data || [],
        });
      } catch (fallbackErr) {
        console.error("Fallback error:", fallbackErr);
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchOverviewData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchOverviewData();
  };

  const handleResolveIncident = async (incidentId) => {
    if (!incidentId || resolvingId) return;
    setResolvingId(incidentId);
    try {
      await axios.patch(
        `http://localhost:8080/admin/security-incidents/${incidentId}/resolve`,
        { notes: "Resuelto mediante panel ejecutivo de supervisión" },
        { headers: getHeaders() }
      );
      setOverview((prev) => {
        if (!prev) return prev;
        const updatedIncidents = prev.recentIncidents.map((inc) =>
          inc.id === incidentId
            ? { ...inc, resolved: true, resolutionNotes: "Resuelto por administrador" }
            : inc
        );
        const updatedKpis = {
          ...prev.kpis,
          unresolvedIncidents: Math.max(0, (prev.kpis?.unresolvedIncidents || 1) - 1),
        };
        return { ...prev, recentIncidents: updatedIncidents, kpis: updatedKpis };
      });
    } catch (err) {
      console.error("Error al resolver incidente:", err);
      alert("No se pudo resolver el incidente.");
    } finally {
      setResolvingId(null);
    }
  };

  const kpis = overview?.kpis || {};
  const cashflow = overview?.cashflow7Days || [];
  const assets = overview?.assetDistribution || [];
  const typeBreakdown = overview?.transactionTypeBreakdown || [];
  const incidents = overview?.recentIncidents || [];
  const auditLogs = overview?.recentAuditLogs || [];

  const [auditPage, setAuditPage] = useState(1);
  const auditPageSize = 5;
  const totalAudit = auditLogs.length;
  const totalAuditPages = Math.max(1, Math.ceil(totalAudit / auditPageSize));
  const startAuditIdx = (auditPage - 1) * auditPageSize;
  const endAuditIdx = Math.min(startAuditIdx + auditPageSize, totalAudit);
  const paginatedAuditLogs = auditLogs.slice(startAuditIdx, endAuditIdx);

  if (loading && !overview) {
    return (
      <AdminLayout>
        <div style={{ padding: "var(--space-12)", textAlign: "center", color: "var(--text-muted)" }}>
          <RefreshCw className="icon spin" style={{ width: 32, height: 32, margin: "0 auto var(--space-4)", display: "block" }} />
          Cargando panel de control ejecutivo...
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="admin-header-row">
        <div>
          <h1>Panel de Control Ejecutivo</h1>
          <p>Supervisión financiera integral, análisis de liquidez y monitoreo de seguridad en tiempo real.</p>
        </div>

        <div className="admin-header-actions">
          <button className="quick-link-btn" onClick={handleRefresh} disabled={refreshing}>
            <RefreshCw className={`icon ${refreshing ? "spin" : ""}`} />{" "}
            {refreshing ? "Sincronizando..." : "Actualizar"}
          </button>
          <Link to="/admin/database" className="quick-link-btn">
            <Database className="icon" /> Explorador BD
          </Link>
          <a
            href="http://localhost:8080/h2-console"
            target="_blank"
            rel="noreferrer"
            className="quick-link-btn"
            title="Abrir Consola H2 nativa"
          >
            <ExternalLink className="icon" /> Consola H2
          </a>
        </div>
      </div>

      <div className="admin-kpi-grid">
        <MetricCard
          title="Usuarios Registrados"
          value={`${kpis.totalUsers ?? 0}`}
          badge={`${kpis.activeUsers ?? 0} activos`}
          badgeType="success"
          icon={Users}
          accent="primary"
          subtitle={Number(kpis.frozenUsers) > 0 ? `${kpis.frozenUsers} congelados` : "Base de clientes activa"}
          graphicType="wave"
        />

        <MetricCard
          title="Total Depósitos"
          value={`$${Number(kpis.totalDeposits || 0).toLocaleString("en-US", { minimumFractionDigits: 2 })}`}
          badge="Fondos líquidos"
          badgeType="success"
          icon={Landmark}
          accent="emerald"
          subtitle="En custodia de cuentas"
          graphicType="bars-emerald"
        />

        <MetricCard
          title="Cartera de Préstamos"
          value={`$${Number(kpis.totalLoansVolume || 0).toLocaleString("en-US", { minimumFractionDigits: 2 })}`}
          badge={`${kpis.activeLoansCount ?? 0} vigentes`}
          badgeType="warning"
          icon={TrendingUp}
          accent="amber"
          subtitle="Capital colocado"
          graphicType="bars-amber"
        />

        <MetricCard
          title="Volumen 24 Horas"
          value={`$${Number(kpis.volume24h || 0).toLocaleString("en-US", { minimumFractionDigits: 2 })}`}
          badge={`${kpis.transactions24h ?? 0} operaciones`}
          badgeType="info"
          icon={Activity}
          accent="cyan"
          subtitle="Actividad del día"
          graphicType="bars-cyan"
        />
      </div>

      <div className="admin-charts-grid">
        <div className="chart-card">
          <div className="chart-header">
            <div>
              <h2>Flujo Financiero Semanal</h2>
              <span>Depósitos vs Retiros vs Transferencias (Últimos 7 días)</span>
            </div>
          </div>
          <div className="chart-viewport">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={cashflow} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorDeposits" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
                  </linearGradient>
                  <linearGradient id="colorWithdrawals" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ef4444" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#ef4444" stopOpacity={0.0} />
                  </linearGradient>
                  <linearGradient id="colorTransfers" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#38bdf8" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#38bdf8" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                <XAxis dataKey="date" stroke="#94a3b8" fontSize={11} />
                <YAxis stroke="#94a3b8" fontSize={11} tickFormatter={(val) => `$${val}`} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#0f172a",
                    borderColor: "#334155",
                    borderRadius: "8px",
                    color: "#f8fafc",
                    fontSize: "12px",
                  }}
                  formatter={(val) => [`$${Number(val).toLocaleString()}`, ""]}
                />
                <Legend iconType="circle" wrapperStyle={{ fontSize: "12px", paddingTop: "8px" }} />
                <Area
                  type="monotone"
                  dataKey="deposits"
                  name="Depósitos"
                  stroke="#10b981"
                  fillOpacity={1}
                  fill="url(#colorDeposits)"
                  strokeWidth={2}
                />
                <Area
                  type="monotone"
                  dataKey="withdrawals"
                  name="Retiros"
                  stroke="#ef4444"
                  fillOpacity={1}
                  fill="url(#colorWithdrawals)"
                  strokeWidth={2}
                />
                <Area
                  type="monotone"
                  dataKey="transfers"
                  name="Transferencias"
                  stroke="#38bdf8"
                  fillOpacity={1}
                  fill="url(#colorTransfers)"
                  strokeWidth={2}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="chart-card">
          <div className="chart-header">
            <div>
              <h2>Distribución del Capital</h2>
              <span>Participación de activos</span>
            </div>
          </div>
          <div className="chart-viewport">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={assets}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={88}
                  paddingAngle={4}
                >
                  {assets.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#0f172a",
                    borderColor: "#334155",
                    borderRadius: "8px",
                    color: "#f8fafc",
                    fontSize: "12px",
                  }}
                  formatter={(val) => [`$${Number(val).toLocaleString()}`, ""]}
                />
                <Legend iconType="circle" wrapperStyle={{ fontSize: "11px", paddingTop: "6px" }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="admin-charts-grid">
        <div className="chart-card">
          <div className="chart-header">
            <div>
              <h2>Volumen Operativo por Tipo</h2>
              <span>Distribución cuantitativa de operaciones</span>
            </div>
          </div>
          <div className="chart-viewport">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={typeBreakdown} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                <XAxis dataKey="type" stroke="#94a3b8" fontSize={11} />
                <YAxis stroke="#94a3b8" fontSize={11} tickFormatter={(val) => `$${val}`} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#0f172a",
                    borderColor: "#334155",
                    borderRadius: "8px",
                    color: "#f8fafc",
                    fontSize: "12px",
                  }}
                  formatter={(val, name) => [
                    name === "volume" ? `$${Number(val).toLocaleString()}` : val,
                    name === "volume" ? "Volumen Total" : "Cantidad",
                  ]}
                />
                <Legend iconType="circle" wrapperStyle={{ fontSize: "12px" }} />
                <Bar dataKey="volume" name="Volumen ($)" fill="#38bdf8" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="chart-card">
          <div className="chart-header">
            <div>
              <h2>Alertas de Seguridad</h2>
              <span>Monitoreo de anomalías</span>
            </div>
            <Link
              to="/admin/database"
              style={{ fontSize: "var(--text-xs)", color: "var(--primary)", fontWeight: 600 }}
            >
              Ver todos →
            </Link>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-3)", overflowY: "auto", maxHeight: "280px" }}>
            {incidents.length === 0 ? (
              <div style={{ textAlign: "center", color: "var(--text-muted)", padding: "var(--space-6)" }}>
                <CheckCircle style={{ width: 32, height: 32, color: "var(--success)", margin: "0 auto var(--space-2)" }} />
                No hay incidentes de seguridad registrados.
              </div>
            ) : (
              incidents.map((inc) => (
                <div
                  key={inc.id}
                  style={{
                    padding: "var(--space-3)",
                    backgroundColor: "var(--bg-surface)",
                    borderRadius: "var(--radius-md)",
                    border: "1px solid var(--border-subtle)",
                    display: "flex",
                    flexDirection: "column",
                    gap: "var(--space-2)",
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span
                      className={`incident-badge ${
                        inc.severity === "HIGH" ? "high" : inc.severity === "MEDIUM" ? "medium" : "low"
                      }`}
                    >
                      {inc.severity}
                    </span>
                    <span style={{ fontSize: "11px", color: "var(--text-muted)" }}>
                      {inc.createdAt ? new Date(inc.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : ""}
                    </span>
                  </div>
                  <div style={{ fontSize: "var(--text-xs)", color: "var(--text-primary)", fontWeight: 500 }}>
                    {inc.description}
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 4 }}>
                    <span style={{ fontSize: "11px", color: "var(--text-muted)" }}>
                      Objetivo: {inc.targetUserEmail || "Sistema"}
                    </span>
                    {inc.resolved ? (
                      <span style={{ fontSize: "11px", color: "var(--success)", fontWeight: 600, display: "flex", alignItems: "center", gap: 3 }}>
                        <CheckCircle style={{ width: 12, height: 12 }} /> Resuelto
                      </span>
                    ) : (
                      <button
                        className="action-btn unfreeze"
                        onClick={() => handleResolveIncident(inc.id)}
                        disabled={resolvingId === inc.id}
                        style={{ height: 26, fontSize: "10px", padding: "0 8px" }}
                      >
                        {resolvingId === inc.id ? "Resolviendo..." : "Resolver"}
                      </button>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      <div className="admin-content-box">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "var(--space-4)" }}>
          <h2 style={{ fontSize: "var(--text-md)", fontWeight: 600, color: "var(--text-primary)" }}>
            Registro de Auditoría Reciente
          </h2>
          <span style={{ fontSize: "var(--text-xs)", color: "var(--text-muted)" }}>
            Trazabilidad y operaciones de superusuario
          </span>
        </div>

        <div className="table-responsive">
          <table className="admin-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Acción</th>
                <th>Ejecutado Por</th>
                <th>Descripción</th>
                <th>Fecha y Hora</th>
              </tr>
            </thead>
            <tbody>
              {auditLogs.length === 0 ? (
                <tr>
                  <td colSpan={5} style={{ textAlign: "center", color: "var(--text-muted)" }}>
                    No hay registros de auditoría disponibles.
                  </td>
                </tr>
              ) : (
                paginatedAuditLogs.map((log) => (
                  <tr key={log.id}>
                    <td>#{log.id}</td>
                    <td>
                      <span className="status-badge admin">{log.action}</span>
                    </td>
                    <td style={{ fontWeight: 500 }}>{log.performedBy}</td>
                    <td style={{ color: "var(--text-secondary)" }}>{log.description}</td>
                    <td style={{ color: "var(--text-muted)", fontSize: "var(--text-xs)", whiteSpace: "nowrap" }}>
                      {log.timeStamp ? new Date(log.timeStamp).toLocaleString() : "N/A"}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {totalAudit > auditPageSize && (
          <Pagination
            currentPage={auditPage}
            totalPages={totalAuditPages}
            totalItems={totalAudit}
            startIndex={startAuditIdx}
            endIndex={endAuditIdx}
            onPageChange={setAuditPage}
            itemLabel="registros de auditoría"
          />
        )}
      </div>
    </AdminLayout>
  );
}
