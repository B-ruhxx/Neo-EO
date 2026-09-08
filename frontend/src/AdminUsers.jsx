import { useState, useEffect } from "react";
import axios from "axios";
import AdminLayout from "./AdminLayout";
import {
  Users,
  UserCheck,
  UserX,
  Search,
  RefreshCw,
  DollarSign,
} from "lucide-react";
import { Pagination } from "./components";
import "./Admin.css";

export default function AdminUsers() {
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);
  const [users, setUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("ALL");
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Estados para ajuste de saldo
  const [adjustAmount, setAdjustAmount] = useState("");
  const [adjustType, setAdjustType] = useState("CREDIT"); // CREDIT | DEBIT
  const [adjustReason, setAdjustReason] = useState("");
  const [adjustError, setAdjustError] = useState("");
  const [adjustLoading, setAdjustLoading] = useState(false);

  const token = localStorage.getItem("token");

  const fetchUsers = async () => {
    if (!token) return;
    try {
      setLoading(true);
      const res = await axios.get("http://localhost:8080/api/users", {
        headers: {
          Authorization: `Bearer ${token}`,
          "Cache-Control": "no-cache",
        },
      });
      setUsers(res.data || []);
    } catch (err) {
      console.error("Error al cargar usuarios:", err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchUsers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchUsers();
  };

  const openModal = (user, type) => {
    setSelectedUser(user);
    setModalType(type);
    setAdjustAmount("");
    setAdjustType("CREDIT");
    setAdjustReason("");
    setAdjustError("");
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setModalType(null);
    setSelectedUser(null);
    setAdjustError("");
  };

  const handleAction = async () => {
    if (!selectedUser) return;

    try {
      if (modalType === "freeze") {
        await axios.patch(
          `http://localhost:8080/api/users/${selectedUser.id}/freeze`,
          {},
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Cache-Control": "no-cache",
            },
          }
        );
        setUsers((prev) =>
          prev.map((u) =>
            u.id === selectedUser.id ? { ...u, status: "FROZEN" } : u
          )
        );
        closeModal();
      } else if (modalType === "unfreeze") {
        await axios.patch(
          `http://localhost:8080/api/users/${selectedUser.id}/unfreeze`,
          {},
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Cache-Control": "no-cache",
            },
          }
        );
        setUsers((prev) =>
          prev.map((u) =>
            u.id === selectedUser.id ? { ...u, status: "ACTIVE" } : u
          )
        );
        closeModal();
      } else if (modalType === "delete") {
        await axios.delete(
          `http://localhost:8080/api/users/${selectedUser.id}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Cache-Control": "no-cache",
            },
          }
        );
        setUsers((prev) => prev.filter((u) => u.id !== selectedUser.id));
        closeModal();
      } else if (modalType === "adjust") {
        if (!adjustAmount || Number(adjustAmount) <= 0) {
          setAdjustError("Por favor ingresa un monto válido mayor a 0.");
          return;
        }

        if (!adjustReason.trim()) {
          setAdjustError("El motivo es obligatorio para fines de auditoría.");
          return;
        }

        setAdjustLoading(true);
        setAdjustError("");

        const res = await axios.post(
          `http://localhost:8080/admin/users/${selectedUser.id}/adjust-balance`,
          {
            amount: parseFloat(adjustAmount),
            type: adjustType,
            reason: adjustReason.trim(),
          },
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Cache-Control": "no-cache",
            },
          }
        );

        setUsers((prev) =>
          prev.map((u) =>
            u.id === selectedUser.id ? { ...u, balance: res.data.balance } : u
          )
        );
        closeModal();
      }
    } catch (err) {
      console.error("Error al ejecutar acción sobre usuario:", err);
      const msg =
        err.response?.data?.message ||
        (typeof err.response?.data === "string" ? err.response?.data : null) ||
        "Error al realizar la operación.";
      setAdjustError(msg);
    } finally {
      setAdjustLoading(false);
    }
  };

  // Métricas
  const activeCount = users.filter((u) => u.status === "ACTIVE").length;
  const frozenCount = users.filter((u) => u.status === "FROZEN").length;

  // Filtrado
  const filteredUsers = users.filter((u) => {
    const matchesStatus = filterStatus === "ALL" ? true : u.status === filterStatus;
    const term = searchTerm.toLowerCase().trim();
    if (!term) return matchesStatus;

    const fullName = `${u.firstName || ""} ${u.lastName || ""}`.toLowerCase();
    const email = (u.email || "").toLowerCase();
    const matchesSearch = fullName.includes(term) || email.includes(term) || String(u.id).includes(term);

    return matchesStatus && matchesSearch;
  });

  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 8;
  useEffect(() => {
    setCurrentPage(1);
  }, [filterStatus, searchTerm]);

  const totalItems = filteredUsers.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = Math.min(startIndex + pageSize, totalItems);
  const paginatedUsers = filteredUsers.slice(startIndex, endIndex);

  return (
    <AdminLayout>
      {/* Encabezado */}
      <div className="admin-header-row">
        <div>
          <h1>Directorio y Control de Usuarios</h1>
          <p>
            Supervisión de titulares, verificación de identidades, auditoría de saldos y gestión de bloqueos preventivos.
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
            <span>Total Clientes</span>
            <div className="kpi-icon-wrapper info">
              <Users className="icon" />
            </div>
          </div>
          <div className="kpi-value">{users.length}</div>
          <div className="kpi-footer">
            <span className="kpi-badge neutral">Cuentas registradas</span>
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-header">
            <span>Usuarios Activos</span>
            <div className="kpi-icon-wrapper success">
              <UserCheck className="icon" />
            </div>
          </div>
          <div className="kpi-value">{activeCount}</div>
          <div className="kpi-footer">
            <span className="kpi-badge positive">Operativa regular</span>
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-header">
            <span>Cuentas Congeladas</span>
            <div className={`kpi-icon-wrapper ${frozenCount > 0 ? "danger" : "success"}`}>
              <UserX className="icon" />
            </div>
          </div>
          <div className="kpi-value">{frozenCount}</div>
          <div className="kpi-footer">
            <span className={`kpi-badge ${frozenCount > 0 ? "alert" : "positive"}`}>
              {frozenCount > 0 ? "Bloqueadas por seguridad" : "Sin bloqueos activos"}
            </span>
          </div>
        </div>
      </div>

      {/* Contenedor Principal: Filtros + Búsqueda + Tabla */}
      <div className="admin-content-box">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "var(--space-3)", marginBottom: "var(--space-4)" }}>
          <div className="admin-filter-tabs">
            {[
              { id: "ALL", label: `Todos (${users.length})` },
              { id: "ACTIVE", label: `Activos (${activeCount})` },
              { id: "FROZEN", label: `Congelados (${frozenCount})` },
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

          <div style={{ position: "relative", minWidth: 260 }}>
            <Search style={{ position: "absolute", left: 12, top: 11, width: 16, height: 16, color: "var(--text-muted)" }} />
            <input
              type="text"
              placeholder="Buscar por nombre, correo o ID..."
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

        <div className="table-responsive">
          {loading ? (
            <div style={{ padding: "var(--space-8)", textAlign: "center", color: "var(--text-muted)" }}>
              Cargando directorio de usuarios...
            </div>
          ) : filteredUsers.length === 0 ? (
            <div style={{ padding: "var(--space-8)", textAlign: "center", color: "var(--text-muted)" }}>
              No se encontraron usuarios para el filtro seleccionado.
            </div>
          ) : (
            <table className="admin-table">
              <thead>
                <tr>
                  <th style={{ width: 50 }}>ID</th>
                  <th>Titular</th>
                  <th>Correo Electrónico</th>
                  <th>Saldo en Cuenta</th>
                  <th>Estado</th>
                  <th style={{ textAlign: "right" }}>Acciones Administrativas</th>
                </tr>
              </thead>
              <tbody>
                {paginatedUsers.map((u) => {
                  const isFrozen = u.status === "FROZEN";
                  const initials = `${(u.firstName || "U")[0]}${(u.lastName || "")[0] || ""}`.toUpperCase();
                  return (
                    <tr key={u.id}>
                      <td style={{ color: "var(--text-muted)", fontSize: "var(--text-xs)" }}>#{u.id}</td>
                      <td>
                        <div style={{ display: "flex", alignItems: "center", gap: "var(--space-2)" }}>
                          <div
                            style={{
                              width: 32,
                              height: 32,
                              borderRadius: "50%",
                              background: "rgba(14, 165, 233, 0.15)",
                              color: "var(--primary)",
                              fontWeight: 700,
                              fontSize: "11px",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              border: "1px solid rgba(14, 165, 233, 0.25)",
                              flexShrink: 0,
                            }}
                          >
                            {initials}
                          </div>
                          <div>
                            <div style={{ fontWeight: 600, color: "var(--text-primary)" }}>
                              {u.firstName || ""} {u.lastName || ""}
                            </div>
                            <div className="table-subtext">{u.role}</div>
                          </div>
                        </div>
                      </td>
                      <td style={{ color: "var(--text-secondary)", fontSize: "var(--text-xs)" }}>{u.email}</td>
                      <td>
                        <span style={{ fontWeight: 700, color: "var(--success)", fontVariantNumeric: "tabular-nums" }}>
                          ${Number(u.balance ?? 0).toLocaleString("es-ES", { minimumFractionDigits: 2 })} USD
                        </span>
                      </td>
                      <td>
                        <span className={`status-pill ${isFrozen ? "rejected" : "approved"}`}>
                          {isFrozen ? "Congelado" : "Activo"}
                        </span>
                      </td>
                      <td style={{ textAlign: "right" }}>
                        <div style={{ display: "inline-flex", gap: "var(--space-2)", alignItems: "center" }}>
                          <button
                            type="button"
                            className="btn-action-approve"
                            style={{ backgroundColor: "var(--primary-subtle)", color: "var(--primary)", borderColor: "rgba(14, 165, 233, 0.3)" }}
                            onClick={() => openModal(u, "adjust")}
                            title="Ajustar saldo del usuario manualmente"
                          >
                            <DollarSign size={13} /> Ajustar
                          </button>
                          {u.status?.toUpperCase() === "ACTIVE" ? (
                            <button
                              type="button"
                              className="btn-action-reject"
                              onClick={() => openModal(u, "freeze")}
                              title="Congelar cuenta"
                            >
                              <UserX size={13} /> Congelar
                            </button>
                          ) : (
                            <button
                              type="button"
                              className="btn-action-approve"
                              onClick={() => openModal(u, "unfreeze")}
                              title="Descongelar cuenta"
                            >
                              <UserCheck size={13} /> Descongelar
                            </button>
                          )}
                          <button
                            type="button"
                            className="btn-action-reject"
                            style={{ opacity: 0.8 }}
                            onClick={() => openModal(u, "delete")}
                            title="Eliminar usuario"
                          >
                            Eliminar
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
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
          itemLabel="usuarios"
        />
      </div>

      {/* Modal: Ajustar Saldo o Acciones */}
      {showModal && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            {modalType === "adjust" ? (
              <div>
                <h2>Ajustar Saldo de Usuario</h2>
                <p className="modal-desc" style={{ marginTop: 4 }}>
                  Titular: <strong>{selectedUser.firstName} {selectedUser.lastName}</strong> ({selectedUser.email})
                </p>
                <p style={{ color: "var(--text-secondary)", fontSize: "var(--text-xs)", margin: "8px 0 16px" }}>
                  Saldo actual:{" "}
                  <strong style={{ color: "var(--success)" }}>
                    ${Number(selectedUser.balance ?? 0).toLocaleString("es-ES", { minimumFractionDigits: 2 })} USD
                  </strong>
                </p>

                {adjustError && (
                  <div className="admin-alert error" style={{ marginBottom: 12 }}>
                    <span>{adjustError}</span>
                  </div>
                )}

                <div className="form-group" style={{ marginBottom: 12 }}>
                  <label className="form-label">Tipo de Ajuste Contable:</label>
                  <div style={{ display: "flex", gap: "8px" }}>
                    <button
                      type="button"
                      className={`btn ${adjustType === "CREDIT" ? "btn-primary" : "btn-secondary"}`}
                      style={{ flex: 1, height: 38 }}
                      onClick={() => setAdjustType("CREDIT")}
                    >
                      + Acreditar (Sumar)
                    </button>
                    <button
                      type="button"
                      className={`btn ${adjustType === "DEBIT" ? "btn-danger" : "btn-secondary"}`}
                      style={{ flex: 1, height: 38 }}
                      onClick={() => setAdjustType("DEBIT")}
                    >
                      - Debitar (Restar)
                    </button>
                  </div>
                </div>

                <div className="form-group" style={{ marginBottom: 12 }}>
                  <label className="form-label">Monto ($ USD):</label>
                  <input
                    type="number"
                    className="form-control"
                    placeholder="Ej. 150.00"
                    min="0.01"
                    step="0.01"
                    value={adjustAmount}
                    onChange={(e) => setAdjustAmount(e.target.value)}
                  />
                </div>

                <div className="form-group" style={{ marginBottom: 16 }}>
                  <label className="form-label">Motivo de la Operación (Registro en Auditoría):</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Ej. Bonificación de bienvenida, Corrección contable"
                    value={adjustReason}
                    onChange={(e) => setAdjustReason(e.target.value)}
                  />
                </div>

                <div className="modal-actions">
                  <button type="button" className="btn btn-secondary" onClick={closeModal}>
                    Cancelar
                  </button>
                  <button
                    type="button"
                    className="btn btn-primary"
                    onClick={handleAction}
                    disabled={adjustLoading}
                  >
                    {adjustLoading ? "Procesando..." : "Confirmar Ajuste"}
                  </button>
                </div>
              </div>
            ) : (
              <div>
                <h2>
                  {modalType === "freeze"
                    ? `¿Congelar cuenta de ${selectedUser.email}?`
                    : modalType === "unfreeze"
                    ? `¿Descongelar cuenta de ${selectedUser.email}?`
                    : `¿Eliminar usuario ${selectedUser.email}?`}
                </h2>
                <p className="modal-desc" style={{ marginTop: 8 }}>
                  {modalType === "delete"
                    ? "Esta acción marcará al usuario como eliminado en la base de datos."
                    : modalType === "freeze"
                    ? "El usuario no podrá realizar transacciones ni movimientos hasta que sea descongelado."
                    : "El usuario recuperará el acceso regular a su cuenta y operaciones financieras."}
                </p>

                <div className="modal-actions" style={{ marginTop: 20 }}>
                  <button type="button" className="btn btn-secondary" onClick={closeModal}>
                    Cancelar
                  </button>
                  <button
                    type="button"
                    className={`btn ${modalType === "delete" ? "btn-danger" : "btn-primary"}`}
                    onClick={handleAction}
                  >
                    {modalType === "delete"
                      ? "Confirmar Eliminación"
                      : modalType === "freeze"
                      ? "Confirmar Congelación"
                      : "Confirmar Descongelación"}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
