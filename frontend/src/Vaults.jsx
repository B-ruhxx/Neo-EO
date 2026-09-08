import { useState, useEffect } from "react";
import axios from "axios";
import {
  Plus,
  ArrowDownLeft,
  ArrowUpRight,
  Trash2,
  AlertCircle,
  CheckCircle2,
  PiggyBank,
  Wallet,
  Target,
  TrendingUp,
} from "lucide-react";
import ClientLayout from "./ClientLayout";
import MetricCard from "./MetricCard";
import Modal from "./Modal";
import "./Dashboard.css";
import "./Vaults.css";
import "./LightMode.css";

export default function Vaults() {
  const [vaults, setVaults] = useState([]);
  const [balance, setBalance] = useState(0);
  const [loading, setLoading] = useState(true);

  // Modales
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showDepositModal, setShowDepositModal] = useState(false);
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedVault, setSelectedVault] = useState(null);

  // Campos de formulario
  const [vaultName, setVaultName] = useState("");
  const [targetAmount, setTargetAmount] = useState("");
  const [actionAmount, setActionAmount] = useState("");
  const [modalError, setModalError] = useState("");
  const [feedbackSuccess, setFeedbackSuccess] = useState("");

  const token = localStorage.getItem("token");

  const fetchData = async () => {
    if (!token) return;
    try {
      setLoading(true);
      const [vaultsRes, userRes] = await Promise.all([
        axios.get("http://localhost:8080/api/vaults", {
          headers: { Authorization: `Bearer ${token}` },
        }),
        axios.get("http://localhost:8080/api/auth/me", {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);
      setVaults(vaultsRes.data || []);
      setBalance(userRes.data?.balance ?? 0);
    } catch (err) {
      console.error("Error al cargar bóvedas:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  // Crear nueva bóveda
  const handleCreateVault = async (e) => {
    e.preventDefault();
    setModalError("");

    if (!vaultName.trim()) {
      setModalError("El nombre de la bóveda es obligatorio.");
      return;
    }
    const parsedTarget = parseFloat(targetAmount);
    if (isNaN(parsedTarget) || parsedTarget <= 0) {
      setModalError("Ingresa una meta de ahorro válida mayor a 0.");
      return;
    }

    try {
      const res = await axios.post(
        "http://localhost:8080/api/vaults",
        {
          name: vaultName.trim(),
          targetAmount: parsedTarget,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setVaults((prev) => [...prev, res.data]);
      setShowCreateModal(false);
      setVaultName("");
      setTargetAmount("");
      showSuccess("¡Bóveda de ahorro creada con éxito!");
    } catch (err) {
      console.error("Error al crear bóveda:", err);
      setModalError(
        err.response?.data?.message || "No se pudo crear la bóveda de ahorro."
      );
    }
  };

  // Depositar en bóveda (mueve fondos del saldo principal)
  const handleDeposit = async () => {
    setModalError("");
    const parsed = parseFloat(actionAmount);
    if (isNaN(parsed) || parsed <= 0) {
      setModalError("Ingresa un monto válido mayor a 0.");
      return;
    }
    if (parsed > balance) {
      setModalError(
        `Saldo insuficiente. Tu saldo disponible es de $${balance.toLocaleString()} USD.`
      );
      return;
    }

    try {
      const res = await axios.post(
        `http://localhost:8080/api/vaults/${selectedVault.id}/deposit`,
        { amount: parsed },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setVaults((prev) =>
        prev.map((v) => (v.id === selectedVault.id ? res.data : v))
      );
      setBalance((prev) => prev - parsed);
      setShowDepositModal(false);
      setActionAmount("");
      setSelectedVault(null);
      showSuccess(
        `¡Depósito de $${parsed.toFixed(2)} USD transferido a la bóveda!`
      );
    } catch (err) {
      console.error("Error al depositar en bóveda:", err);
      setModalError(
        err.response?.data?.message || "Error al depositar en la bóveda."
      );
    }
  };

  // Retirar de bóveda (mueve fondos de vuelta al saldo principal)
  const handleWithdraw = async () => {
    setModalError("");
    const parsed = parseFloat(actionAmount);
    if (isNaN(parsed) || parsed <= 0) {
      setModalError("Ingresa un monto válido mayor a 0.");
      return;
    }
    if (parsed > Number(selectedVault.currentAmount)) {
      setModalError(
        `Monto supera los fondos en la bóveda ($${Number(
          selectedVault.currentAmount
        ).toFixed(2)} USD).`
      );
      return;
    }

    try {
      const res = await axios.post(
        `http://localhost:8080/api/vaults/${selectedVault.id}/withdraw`,
        { amount: parsed },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setVaults((prev) =>
        prev.map((v) => (v.id === selectedVault.id ? res.data : v))
      );
      setBalance((prev) => prev + parsed);
      setShowWithdrawModal(false);
      setActionAmount("");
      setSelectedVault(null);
      showSuccess(
        `¡Retiro de $${parsed.toFixed(2)} USD acreditado a tu saldo principal!`
      );
    } catch (err) {
      console.error("Error al retirar de bóveda:", err);
      setModalError(
        err.response?.data?.message || "Error al retirar de la bóveda."
      );
    }
  };

  // Eliminar bóveda (los fondos restantes se reembolsan automáticamente al balance principal)
  const handleDeleteVault = async () => {
    try {
      await axios.delete(
        `http://localhost:8080/api/vaults/${selectedVault.id}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // El backend reembolsa el currentAmount al balance principal
      const refundedAmount = Number(selectedVault.currentAmount || 0);
      setBalance((prev) => prev + refundedAmount);
      setVaults((prev) => prev.filter((v) => v.id !== selectedVault.id));
      setShowDeleteModal(false);
      setSelectedVault(null);
      showSuccess(
        refundedAmount > 0
          ? `Bóveda eliminada. Se reembolsaron $${refundedAmount.toFixed(
              2
            )} USD a tu saldo principal.`
          : "Bóveda eliminada correctamente."
      );
    } catch (err) {
      console.error("Error al eliminar bóveda:", err);
      alert("No se pudo eliminar la bóveda. Intenta de nuevo.");
    }
  };

  const showSuccess = (msg) => {
    setFeedbackSuccess(msg);
    setTimeout(() => setFeedbackSuccess(""), 4000);
  };

  const totalVaultsSavings = vaults.reduce(
    (acc, v) => acc + Number(v.currentAmount || 0),
    0
  );

  const totalTargetSavings = vaults.reduce(
    (acc, v) => acc + Number(v.targetAmount || 0),
    0
  );
  const globalProgress =
    totalTargetSavings > 0
      ? Math.min(100, Math.round((totalVaultsSavings / totalTargetSavings) * 100))
      : 0;

  return (
    <ClientLayout
      active="vaults"
      title="Bóvedas de Ahorro"
      subtitle="Separa dinero de tu cuenta principal para alcanzar tus metas financieras"
    >
      <div className="content-box vaults-container">
        {feedbackSuccess && (
          <div
            style={{
              background: "rgba(74, 222, 128, 0.15)",
              border: "1px solid #4ade80",
              color: "#86efac",
              padding: "12px 18px",
              borderRadius: "10px",
              display: "flex",
              alignItems: "center",
              gap: "8px",
              fontSize: "0.95rem",
              marginBottom: "20px",
            }}
          >
            <CheckCircle2 size={20} />
            <span>{feedbackSuccess}</span>
          </div>
        )}

        <div className="vaults-header" style={{ marginBottom: "20px" }}>
          <div>
            <h2>Mis Metas de Ahorro</h2>
            <p style={{ color: "#aaa", fontSize: "0.9rem", margin: "4px 0 0 0" }}>
              Crea bolsillos de ahorro independientes con rendimientos y metas visuales.
            </p>
          </div>

          <button
            className="new-tx-btn"
            onClick={() => {
              setModalError("");
              setShowCreateModal(true);
            }}
          >
            <Plus
              size={18}
              style={{
                display: "inline",
                verticalAlign: "middle",
                marginRight: "4px",
              }}
            />
            Nueva Bóveda
          </button>
        </div>

        {/* Resumen Superior con MetricCard compartido */}
        <div className="account-metrics-grid" style={{ marginBottom: "24px" }}>
          <MetricCard
            title="Total en Bóvedas"
            value={`$${totalVaultsSavings.toLocaleString("en-US", {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}`}
            badge={`${vaults.length} ${
              vaults.length === 1 ? "bóveda activa" : "bóvedas activas"
            }`}
            icon={PiggyBank}
            accent="emerald"
          />
          <MetricCard
            title="Saldo en Cuenta Principal"
            value={`$${balance.toLocaleString("en-US", {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}`}
            badge="Disponible para ahorrar"
            icon={Wallet}
            accent="cyan"
          />
          <MetricCard
            title="Meta Global Acumulada"
            value={`$${totalTargetSavings.toLocaleString("en-US", {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}`}
            badge={`${globalProgress}% alcanzado`}
            icon={Target}
            accent="primary"
          />
          <MetricCard
            title="Rendimiento Estimado"
            value="4.50% APY"
            badge="Interés compuesto"
            icon={TrendingUp}
            accent="info"
            subtitle="Generado automáticamente"
          />
        </div>

            {/* Grilla de Bóvedas */}
            {loading ? (
              <p>Cargando bóvedas de ahorro...</p>
            ) : vaults.length === 0 ? (
              <div className="empty-vaults">
                <PiggyBank size={48} style={{ color: "#38bdf8", marginBottom: "12px" }} />
                <h3>Aún no tienes bóvedas de ahorro creadas</h3>
                <p>Comienza una meta para vacaciones, emergencias o compras especiales.</p>
                <button
                  className="new-tx-btn"
                  style={{ marginTop: "16px" }}
                  onClick={() => setShowCreateModal(true)}
                >
                  Crear mi primera bóveda
                </button>
              </div>
            ) : (
              <div className="vaults-grid">
                {vaults.map((vault) => {
                  const current = Number(vault.currentAmount || 0);
                  const target = Number(vault.targetAmount || 1);
                  const progress = Math.min(
                    100,
                    Math.round(vault.progressPercentage ?? (current / target) * 100)
                  );

                  return (
                    <div key={vault.id} className="vault-card">
                      <div className="vault-card-header">
                        <div>
                          <h3 className="vault-name">{vault.name}</h3>
                          <div className="vault-date">
                            {vault.createdAt
                              ? `Creada el ${new Date(vault.createdAt).toLocaleDateString("es-ES")}`
                              : "Meta Activa"}
                          </div>
                        </div>
                        <button
                          className="vault-delete-btn"
                          title="Eliminar Bóveda"
                          onClick={() => {
                            setSelectedVault(vault);
                            setShowDeleteModal(true);
                          }}
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>

                      <div className="vault-amounts">
                        <div>
                          <span style={{ fontSize: "0.8rem", color: "#888", display: "block" }}>
                            Ahorrado:
                          </span>
                          <span className="vault-current">
                            ${current.toFixed(2)}
                          </span>
                        </div>
                        <div style={{ textAlign: "right" }}>
                          <span style={{ fontSize: "0.8rem", color: "#888", display: "block" }}>
                            Meta:
                          </span>
                          <span className="vault-target">
                            ${target.toFixed(2)} USD
                          </span>
                        </div>
                      </div>

                      <div className="vault-progress-wrap">
                        <div className="progress-bar-bg">
                          <div
                            className="progress-bar-fill"
                            style={{ width: `${progress}%` }}
                          />
                        </div>
                        <div className="progress-labels">
                          <span>Progreso</span>
                          <span>{progress}%</span>
                        </div>
                      </div>

                      <div className="vault-actions">
                        <button
                          className="vault-btn deposit"
                          onClick={() => {
                            setSelectedVault(vault);
                            setActionAmount("");
                            setModalError("");
                            setShowDepositModal(true);
                          }}
                        >
                          <ArrowDownLeft size={16} /> Depositar
                        </button>
                        <button
                          className="vault-btn withdraw"
                          disabled={current <= 0}
                          style={current <= 0 ? { opacity: 0.4, cursor: "not-allowed" } : {}}
                          onClick={() => {
                            setSelectedVault(vault);
                            setActionAmount("");
                            setModalError("");
                            setShowWithdrawModal(true);
                          }}
                        >
                          <ArrowUpRight size={16} /> Retirar
                        </button>
                      </div>
                    </div>
                  );
                })}

                <div
                  className="new-vault-card"
                  onClick={() => {
                    setModalError("");
                    setShowCreateModal(true);
                  }}
                >
                  <div className="new-vault-icon">+</div>
                  <span style={{ fontWeight: 600 }}>Crear Otra Bóveda</span>
                </div>
              </div>
            )}
      </div>

      {/* Modal: Crear Bóveda */}
      <Modal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        title="Nueva Bóveda de Ahorro"
        subtitle="Separa tus fondos con una meta financiera programada"
        icon={PiggyBank}
      >
        {modalError && (
          <div className="modal-error-box" style={{ marginBottom: "16px" }}>
            <AlertCircle
              size={16}
              style={{
                display: "inline",
                marginRight: "6px",
                verticalAlign: "middle",
              }}
            />
            {modalError}
          </div>
        )}

        <form onSubmit={handleCreateVault}>
          <label className="modal-label">Nombre de la Meta:</label>
          <input
            type="text"
            className="modal-input"
            placeholder="Ej. Vacaciones a Máncora, Fondo de Emergencia, Auto Nuevo"
            value={vaultName}
            onChange={(e) => setVaultName(e.target.value)}
            required
          />

          <label className="modal-label">Monto Meta Objetivo ($ USD / S/. PEN):</label>
          <input
            type="number"
            className="modal-input"
            placeholder="Ej. 1000.00"
            min="1"
            step="0.01"
            value={targetAmount}
            onChange={(e) => setTargetAmount(e.target.value)}
            required
          />

          <div className="modal-buttons" style={{ marginTop: "24px" }}>
            <button type="submit" className="modal-btn confirm">
              Crear Bóveda
            </button>
            <button
              type="button"
              className="modal-btn cancel"
              onClick={() => setShowCreateModal(false)}
            >
              Cancelar
            </button>
          </div>
        </form>
      </Modal>

      {/* Modal: Depositar en Bóveda */}
      <Modal
        isOpen={showDepositModal && !!selectedVault}
        onClose={() => setShowDepositModal(false)}
        title={`Depositar en ${selectedVault?.name || ""}`}
        subtitle={`Se debitará de tu saldo principal ($${balance.toFixed(2)} USD disponibles)`}
        icon={ArrowDownLeft}
      >
        {modalError && (
          <div className="modal-error-box" style={{ marginBottom: "16px" }}>
            <AlertCircle
              size={16}
              style={{
                display: "inline",
                marginRight: "6px",
                verticalAlign: "middle",
              }}
            />
            {modalError}
          </div>
        )}

        <label className="modal-label">Monto a Depositar ($ USD / S/. PEN):</label>
        <input
          type="number"
          className="modal-input"
          placeholder="Ej. 50.00"
          min="0.01"
          step="0.01"
          value={actionAmount}
          onChange={(e) => setActionAmount(e.target.value)}
        />

        <div className="modal-buttons" style={{ marginTop: "24px" }}>
          <button className="modal-btn confirm" onClick={handleDeposit}>
            Confirmar Depósito
          </button>
          <button
            className="modal-btn cancel"
            onClick={() => setShowDepositModal(false)}
          >
            Cancelar
          </button>
        </div>
      </Modal>

      {/* Modal: Retirar de Bóveda */}
      <Modal
        isOpen={showWithdrawModal && !!selectedVault}
        onClose={() => setShowWithdrawModal(false)}
        title={`Retirar de ${selectedVault?.name || ""}`}
        subtitle={`Fondos en bóveda: $${Number(selectedVault?.currentAmount || 0).toFixed(2)} USD. Se acreditarán al instante a tu saldo.`}
        icon={ArrowUpRight}
      >
        {modalError && (
          <div className="modal-error-box" style={{ marginBottom: "16px" }}>
            <AlertCircle
              size={16}
              style={{
                display: "inline",
                marginRight: "6px",
                verticalAlign: "middle",
              }}
            />
            {modalError}
          </div>
        )}

        <label className="modal-label">Monto a Retirar ($ USD / S/. PEN):</label>
        <input
          type="number"
          className="modal-input"
          placeholder="Ej. 25.00"
          min="0.01"
          step="0.01"
          value={actionAmount}
          onChange={(e) => setActionAmount(e.target.value)}
        />

        <div className="modal-buttons" style={{ marginTop: "24px" }}>
          <button className="modal-btn confirm" onClick={handleWithdraw}>
            Confirmar Retiro
          </button>
          <button
            className="modal-btn cancel"
            onClick={() => setShowWithdrawModal(false)}
          >
            Cancelar
          </button>
        </div>
      </Modal>

      {/* Modal: Confirmar Eliminación de Bóveda */}
      <Modal
        isOpen={showDeleteModal && !!selectedVault}
        onClose={() => setShowDeleteModal(false)}
        title={`¿Eliminar ${selectedVault?.name || ""}?`}
        subtitle="Confirma la cancelación de esta meta de ahorro"
        icon={Trash2}
      >
        <p
          style={{
            fontSize: "0.9rem",
            lineHeight: "1.5",
            color: "#ddd",
            marginBottom: "20px",
          }}
        >
          {Number(selectedVault?.currentAmount || 0) > 0 ? (
            <span>
              Los fondos acumulados de{" "}
              <strong style={{ color: "#4ade80" }}>
                ${Number(selectedVault?.currentAmount || 0).toFixed(2)} USD
              </strong>{" "}
              serán reembolsados automáticamente a tu saldo principal.
            </span>
          ) : (
            "Esta bóveda no tiene fondos acumulados y será eliminada permanentemente."
          )}
        </p>

        <div className="modal-buttons">
          <button
            className="modal-btn confirm"
            style={{ background: "#ef4444" }}
            onClick={handleDeleteVault}
          >
            Sí, Eliminar Bóveda
          </button>
          <button
            className="modal-btn cancel"
            onClick={() => setShowDeleteModal(false)}
          >
            Cancelar
          </button>
        </div>
      </Modal>
    </ClientLayout>
  );
}
