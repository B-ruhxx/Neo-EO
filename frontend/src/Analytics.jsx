import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import {
  PieChart as PieChartIcon,
  TrendingUp,
  DollarSign,
  AlertTriangle,
  CheckCircle2,
  AlertCircle,
  Plus,
  RefreshCw,
  Utensils,
  Car,
  Zap,
  Film,
  ShoppingBag,
  Activity,
  Briefcase,
  HelpCircle,
  GraduationCap,
  MoreHorizontal,
} from "lucide-react";
import MetricCard from "./components/MetricCard";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts";
import ClientLayout from "./ClientLayout";
import "./Dashboard.css";
import "./Analytics.css";
import "./LightMode.css";

const CATEGORY_META = {
  FOOD: { label: "Alimentación", icon: Utensils, color: "#10b981" },
  TRANSPORT: { label: "Transporte", icon: Car, color: "#3b82f6" },
  UTILITIES: { label: "Servicios Básicos", icon: Zap, color: "#f59e0b" },
  SERVICES: { label: "Servicios y Facturas", icon: Briefcase, color: "#8b5cf6" },
  ENTERTAINMENT: { label: "Entretenimiento", icon: Film, color: "#ec4899" },
  SHOPPING: { label: "Compras", icon: ShoppingBag, color: "#06b6d4" },
  HEALTH: { label: "Salud", icon: Activity, color: "#ef4444" },
  EDUCATION: { label: "Educación", icon: GraduationCap, color: "#6366f1" },
  OTHER: { label: "Otros", icon: HelpCircle, color: "#64748b" },
};

export default function Analytics() {
  const navigate = useNavigate();
  const [spendingCategories, setSpendingCategories] = useState([]);
  const [monthlyTrend, setMonthlyTrend] = useState([]);
  const [budgets, setBudgets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [darkMode, setDarkMode] = useState(true);

  // Filtros
  const currentDate = new Date();
  const [selectedMonth, setSelectedMonth] = useState(currentDate.getMonth() + 1);
  const selectedYear = currentDate.getFullYear();

  // Modal Presupuesto
  const [showBudgetModal, setShowBudgetModal] = useState(false);
  const [budgetCategory, setBudgetCategory] = useState("FOOD");
  const [budgetLimit, setBudgetLimit] = useState("");
  const [actionLoading, setActionLoading] = useState(false);

  // Feedback
  const [feedbackSuccess, setFeedbackSuccess] = useState("");
  const [feedbackError, setFeedbackError] = useState("");

  const token = localStorage.getItem("token");

  useEffect(() => {
    const saved = localStorage.getItem("theme");
    if (saved === "light") setDarkMode(false);
  }, []);

  const fetchData = async () => {
    if (!token) {
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      const [catRes, trendRes, budgetRes] = await Promise.all([
        axios.get("http://localhost:8080/api/analytics/spending-by-category", {
          params: { month: selectedMonth, year: selectedYear },
          headers: { Authorization: `Bearer ${token}` },
        }),
        axios.get("http://localhost:8080/api/analytics/monthly-trend", {
          headers: { Authorization: `Bearer ${token}` },
        }),
        axios.get("http://localhost:8080/api/budgets", {
          params: { month: selectedMonth, year: selectedYear },
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);

      setSpendingCategories(catRes.data || []);
      setMonthlyTrend(trendRes.data || []);
      setBudgets(budgetRes.data || []);
    } catch (err) {
      console.error("Error al cargar analíticas:", err);
      setFeedbackError("No se pudieron cargar los datos de analítica.");
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
  }, [token, selectedMonth, selectedYear]);

  const showSuccess = (msg) => {
    setFeedbackSuccess(msg);
    setTimeout(() => setFeedbackSuccess(""), 4000);
  };

  const showError = (msg) => {
    setFeedbackError(msg);
    setTimeout(() => setFeedbackError(""), 5000);
  };

  // Guardar Presupuesto
  const handleSaveBudget = async (e) => {
    e.preventDefault();
    if (!budgetLimit || parseFloat(budgetLimit) <= 0) {
      showError("Por favor ingresa un límite válido mayor a 0.");
      return;
    }

    setActionLoading(true);
    try {
      await axios.post(
        "http://localhost:8080/api/budgets",
        {
          category: budgetCategory,
          monthlyLimit: parseFloat(budgetLimit),
          month: selectedMonth,
          year: selectedYear,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setShowBudgetModal(false);
      setBudgetLimit("");
      showSuccess("Presupuesto guardado correctamente.");
      await fetchData();
    } catch (err) {
      showError(err.response?.data?.message || "Error al guardar el presupuesto.");
    } finally {
      setActionLoading(false);
    }
  };

  // Totales calculados
  const totalSpent = spendingCategories.reduce(
    (acc, curr) => acc + (Number(curr.totalSpent) || 0),
    0
  );

  const totalBudget = budgets.reduce(
    (acc, curr) => acc + (Number(curr.monthlyLimit) || 0),
    0
  );

  const globalPercentage =
    totalBudget > 0 ? Math.round((totalSpent / totalBudget) * 100) : null;

  // Formato para gráfico de Dona
  const pieData = spendingCategories
    .filter((c) => Number(c.totalSpent) > 0)
    .map((c) => ({
      name: CATEGORY_META[c.category]?.label || c.category,
      value: Number(c.totalSpent),
      color: CATEGORY_META[c.category]?.color || "#64748b",
      categoryKey: c.category,
    }));

  // Categoría top
  const topCategory = spendingCategories.reduce((prev, curr) => {
    return Number(curr.totalSpent) > Number(prev.totalSpent || 0) ? curr : prev;
  }, {});

  const monthsList = [
    { num: 1, name: "Enero" },
    { num: 2, name: "Febrero" },
    { num: 3, name: "Marzo" },
    { num: 4, name: "Abril" },
    { num: 5, name: "Mayo" },
    { num: 6, name: "Junio" },
    { num: 7, name: "Julio" },
    { num: 8, name: "Agosto" },
    { num: 9, name: "Septiembre" },
    { num: 10, name: "Octubre" },
    { num: 11, name: "Noviembre" },
    { num: 12, name: "Diciembre" },
  ];

  return (
    <ClientLayout
      active="analytics"
      title="Analíticas y Presupuestos"
      subtitle="Monitorea tus gastos mensuales, optimiza tu consumo y define presupuestos por categoría"
    >
            {/* Header */}
            <div className="view-header">
              <div>
                <h2>Analíticas y Presupuestos</h2>
                <p className="subtitle">
                  Monitorea tus gastos mensuales, optimiza tu consumo y define presupuestos por categoría.
                </p>
              </div>

              <div className="header-actions">
                {/* Selector de Mes */}
                <div className="analytics-month-picker">
                  <select
                    className="select-custom"
                    value={selectedMonth}
                    onChange={(e) => setSelectedMonth(Number(e.target.value))}
                    aria-label="Seleccionar mes"
                  >
                    {monthsList.map((m) => (
                      <option key={m.num} value={m.num}>
                        {m.name} {selectedYear}
                      </option>
                    ))}
                  </select>
                </div>

                <button
                  className="btn btn-primary"
                  onClick={() => {
                    setBudgetLimit("");
                    setShowBudgetModal(true);
                  }}
                  aria-label="Fijar presupuesto"
                >
                  <Plus size={18} /> Fijar Presupuesto
                </button>
              </div>
            </div>

        {/* Notificaciones */}
        {feedbackSuccess && (
          <div className="alert-banner success" role="alert">
            <CheckCircle2 size={20} />
            <span>{feedbackSuccess}</span>
          </div>
        )}
        {feedbackError && (
          <div className="alert-banner error" role="alert">
            <AlertCircle size={20} />
            <span>{feedbackError}</span>
          </div>
        )}

        {loading ? (
          <div className="analytics-loading">
            <RefreshCw className="spin" size={32} />
            <p>Cargando información financiera...</p>
          </div>
        ) : (
          <>
            {/* Tarjetas de Métricas Resumen Glassmorphism */}
            <section className="account-metrics-grid" aria-label="Métricas clave de gastos">
              <MetricCard
                title="Gasto Total del Mes"
                value={`$${totalSpent.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
                badge="Mensual"
                badgeType="warning"
                icon={DollarSign}
                accent="amber"
                subtitle="Consumo acumulado"
                action={
                  <button className="metric-card-action-btn" aria-label="Opciones" type="button">
                    <MoreHorizontal size={16} />
                  </button>
                }
              />

              <MetricCard
                title="Presupuesto Asignado"
                value={totalBudget > 0 ? `$${totalBudget.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : "Sin definir"}
                badge="Límite"
                badgeType="info"
                icon={PieChartIcon}
                accent="primary"
                subtitle="Presupuesto global"
                action={
                  <button className="metric-card-action-btn" aria-label="Opciones" type="button">
                    <MoreHorizontal size={16} />
                  </button>
                }
              />

              <MetricCard
                title="% Presupuesto Consumido"
                value={globalPercentage !== null ? `${globalPercentage}%` : "0%"}
                badge={globalPercentage && globalPercentage > 90 ? "Alerta" : "Normal"}
                badgeType={globalPercentage && globalPercentage > 90 ? "warning" : "success"}
                icon={TrendingUp}
                accent={globalPercentage && globalPercentage > 90 ? "amber" : "emerald"}
                subtitle="Capacidad utilizada"
                action={
                  <button className="metric-card-action-btn" aria-label="Opciones" type="button">
                    <MoreHorizontal size={16} />
                  </button>
                }
              />

              <MetricCard
                title="Mayor Categoría"
                value={topCategory?.category ? (CATEGORY_META[topCategory.category]?.label || topCategory.category) : "Sin gastos"}
                badge="Top Gasto"
                badgeType="warning"
                icon={AlertTriangle}
                accent="amber"
                subtitle="Rubro con más consumo"
                action={
                  <button className="metric-card-action-btn" aria-label="Opciones" type="button">
                    <MoreHorizontal size={16} />
                  </button>
                }
              />
            </section>

            {/* Gráficos: Distribución y Tendencia */}
            <section className="analytics-charts-grid">
              {/* Gráfico 1: Dona por Categorías */}
              <div className="chart-box">
                <div className="chart-header">
                  <h3>Distribución de Gastos</h3>
                  <span className="chart-subtitle">Mes actual por categoría</span>
                </div>

                <div className="chart-content pie-container">
                  {pieData.length === 0 ? (
                    <div className="chart-empty">
                      <p>No se registraron gastos en este periodo.</p>
                    </div>
                  ) : (
                    <ResponsiveContainer width="100%" height={260}>
                      <PieChart>
                        <Pie
                          data={pieData}
                          cx="50%"
                          cy="50%"
                          innerRadius={65}
                          outerRadius={95}
                          paddingAngle={4}
                          dataKey="value"
                        >
                          {pieData.map((entry, idx) => (
                            <Cell key={`cell-${idx}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip
                          formatter={(val) => `$${Number(val).toLocaleString(undefined, { minimumFractionDigits: 2 })}`}
                          contentStyle={{
                            backgroundColor: darkMode ? "#0f172a" : "#ffffff",
                            borderColor: darkMode ? "#334155" : "#e2e8f0",
                            borderRadius: "8px",
                            color: darkMode ? "#f8fafc" : "#0f172a",
                          }}
                        />
                        <Legend iconType="circle" />
                      </PieChart>
                    </ResponsiveContainer>
                  )}
                </div>
              </div>

              {/* Gráfico 2: Tendencia Mensual (Ingresos vs Gastos) */}
              <div className="chart-box">
                <div className="chart-header">
                  <h3>Tendencia Semestral</h3>
                  <span className="chart-subtitle">Comparativa de Ingresos y Gastos (Últimos 6 meses)</span>
                </div>

                <div className="chart-content bar-container">
                  {monthlyTrend.length === 0 ? (
                    <div className="chart-empty">
                      <p>Aún no hay suficiente historial transaccional.</p>
                    </div>
                  ) : (
                    <ResponsiveContainer width="100%" height={260}>
                      <BarChart data={monthlyTrend} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke={darkMode ? "#1e293b" : "#e2e8f0"} />
                        <XAxis dataKey="month" stroke={darkMode ? "#94a3b8" : "#64748b"} />
                        <YAxis stroke={darkMode ? "#94a3b8" : "#64748b"} />
                        <Tooltip
                          formatter={(val) => `$${Number(val).toLocaleString(undefined, { minimumFractionDigits: 2 })}`}
                          contentStyle={{
                            backgroundColor: darkMode ? "#0f172a" : "#ffffff",
                            borderColor: darkMode ? "#334155" : "#e2e8f0",
                            borderRadius: "8px",
                            color: darkMode ? "#f8fafc" : "#0f172a",
                          }}
                        />
                        <Legend />
                        <Bar dataKey="income" name="Ingresos" fill="#10b981" radius={[4, 4, 0, 0]} />
                        <Bar dataKey="expense" name="Gastos" fill="#ef4444" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  )}
                </div>
              </div>
            </section>

            {/* Sección de Presupuestos por Categoría con Barras de Progreso */}
            <section className="category-budgets-section">
              <div className="section-header-row">
                <div>
                  <h3>Presupuestos por Categoría</h3>
                  <p className="subtitle">
                    Controla tus topes de consumo para cada rubro y evita sobregiros antes de fin de mes.
                  </p>
                </div>
              </div>

              <div className="category-budget-list">
                {spendingCategories.map((item) => {
                  const meta = CATEGORY_META[item.category] || CATEGORY_META.OTHER;
                  const Icon = meta.icon;
                  const spent = Number(item.totalSpent) || 0;
                  const limit = Number(item.budgetLimit) || 0;
                  const pct = limit > 0 ? Math.min(Math.round((spent / limit) * 100), 100) : 0;
                  const isOverBudget = limit > 0 && spent > limit;
                  const isNearBudget = limit > 0 && pct >= 80 && !isOverBudget;

                  return (
                    <div key={item.category} className="budget-row-card">
                      <div className="category-meta-col">
                        <div className="category-icon-circle" style={{ backgroundColor: `${meta.color}20`, color: meta.color }}>
                          <Icon size={20} />
                        </div>
                        <div>
                          <strong className="category-name">{meta.label}</strong>
                          <span className="category-tx-count">{item.transactionCount || 0} movimientos</span>
                        </div>
                      </div>

                      <div className="budget-progress-col">
                        <div className="budget-numbers-row">
                          <span>
                            Gastado: <strong>${spent.toLocaleString(undefined, { minimumFractionDigits: 2 })}</strong>
                          </span>
                          <span>
                            Límite: <strong>{limit > 0 ? `$${limit.toLocaleString(undefined, { minimumFractionDigits: 2 })}` : "No asignado"}</strong>
                          </span>
                        </div>

                        <div className="budget-progress-track">
                          <div
                            className={`budget-progress-bar ${isOverBudget ? "danger" : isNearBudget ? "warning" : "normal"}`}
                            style={{
                              width: limit > 0 ? `${pct}%` : "0%",
                              backgroundColor: isOverBudget ? "#ef4444" : isNearBudget ? "#f59e0b" : meta.color,
                            }}
                          />
                        </div>

                        {isOverBudget && (
                          <span className="budget-alert-tag danger">
                            <AlertCircle size={14} /> ¡Presupuesto superado por ${(spent - limit).toLocaleString(undefined, { minimumFractionDigits: 2 })}!
                          </span>
                        )}
                        {isNearBudget && (
                          <span className="budget-alert-tag warning">
                            <AlertTriangle size={14} /> Alerta: Has consumido el {pct}% de este presupuesto.
                          </span>
                        )}
                      </div>

                      <div className="budget-action-col">
                        <button
                          type="button"
                          className="btn btn-secondary btn-sm"
                          onClick={() => {
                            setBudgetCategory(item.category);
                            setBudgetLimit(limit > 0 ? String(limit) : "");
                            setShowBudgetModal(true);
                          }}
                        >
                          {limit > 0 ? "Ajustar" : "Asignar"}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>
          </>
        )}

        {/* Modal: Fijar / Ajustar Presupuesto */}
        {showBudgetModal && (
          <div className="modal-overlay" onClick={() => setShowBudgetModal(false)}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <h2>Asignar Presupuesto Mensual</h2>
              <p className="modal-desc">
                Establece el monto máximo que deseas gastar en esta categoría para el periodo seleccionado.
              </p>

              <form onSubmit={handleSaveBudget}>
                <div className="form-group">
                  <label className="form-label" htmlFor="selectBudgetCat">Categoría</label>
                  <select
                    id="selectBudgetCat"
                    className="form-control"
                    value={budgetCategory}
                    onChange={(e) => setBudgetCategory(e.target.value)}
                  >
                    {Object.keys(CATEGORY_META).map((key) => (
                      <option key={key} value={key}>
                        {CATEGORY_META[key].label}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="budgetLimitInput">Límite Mensual ($ USD)</label>
                  <input
                    id="budgetLimitInput"
                    type="number"
                    min="10"
                    step="10"
                    className="form-control"
                    placeholder="Ej. 300.00"
                    value={budgetLimit}
                    onChange={(e) => setBudgetLimit(e.target.value)}
                    required
                  />
                </div>

                <div className="modal-actions">
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => setShowBudgetModal(false)}
                  >
                    Cancelar
                  </button>
                  <button type="submit" className="btn btn-primary" disabled={actionLoading}>
                    {actionLoading ? "Guardando..." : "Guardar Presupuesto"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
    </ClientLayout>
  );
}
