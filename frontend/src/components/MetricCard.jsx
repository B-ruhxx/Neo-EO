import React, { useId } from "react";
import { MoreHorizontal } from "lucide-react";

// 1. Gráfico de Onda Fluida (Liquid Balance / Capital)
export function FluidWaveGraphic({ color = "#38bdf8", idPrefix = "fw" }) {
  const uid = useId().replace(/:/g, "_");
  const gradId = `${idPrefix}-grad-${uid}`;
  return (
    <svg
      className="kpi-graphic wave-graphic"
      width="120"
      height="48"
      viewBox="0 0 120 48"
      fill="none"
      aria-hidden="true"
    >
      <defs>
        <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.32" />
          <stop offset="100%" stopColor={color} stopOpacity="0.0" />
        </linearGradient>
      </defs>
      <path
        d="M 0 36 C 25 18, 48 42, 74 20 C 94 6, 108 16, 120 12 L 120 48 L 0 48 Z"
        fill={`url(#${gradId})`}
      />
      <path
        d="M 0 36 C 25 18, 48 42, 74 20 C 94 6, 108 16, 120 12"
        stroke={color}
        strokeWidth="2.2"
        strokeLinecap="round"
      />
      <path
        d="M 0 42 C 28 26, 52 44, 78 28 C 96 18, 110 22, 120 18"
        stroke={color}
        strokeWidth="1.2"
        strokeDasharray="3 3"
        strokeOpacity="0.45"
      />
      <circle cx="120" cy="12" r="3.5" fill={color} />
      <circle cx="120" cy="12" r="1.5" fill="#ffffff" />
    </svg>
  );
}

// 2. Gráfico de Barras de Ingresos / Crecimiento (Income / Growth)
export function IncomeBarsGraphic({ color = "#10b981", idPrefix = "ib" }) {
  const uid = useId().replace(/:/g, "_");
  const gradId = `${idPrefix}-grad-${uid}`;
  return (
    <svg
      className="kpi-graphic bars-graphic"
      width="120"
      height="48"
      viewBox="0 0 120 48"
      fill="none"
      aria-hidden="true"
    >
      <defs>
        <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.9" />
          <stop offset="100%" stopColor={color} stopOpacity="0.25" />
        </linearGradient>
      </defs>
      <rect x="10" y="30" width="10" height="16" rx="3" fill={`url(#${gradId})`} opacity="0.4" />
      <rect x="28" y="24" width="10" height="22" rx="3" fill={`url(#${gradId})`} opacity="0.55" />
      <rect x="46" y="28" width="10" height="18" rx="3" fill={`url(#${gradId})`} opacity="0.7" />
      <rect x="64" y="16" width="10" height="30" rx="3" fill={`url(#${gradId})`} opacity="0.85" />
      <rect x="82" y="10" width="10" height="36" rx="3" fill={`url(#${gradId})`} opacity="0.95" />
      <rect x="100" y="4" width="10" height="42" rx="3" fill={color} />
      {/* Línea de tendencia ascendente */}
      <path
        d="M 15 28 Q 45 22 69 14 T 105 3"
        stroke="#ffffff"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeOpacity="0.8"
      />
      <circle cx="105" cy="3" r="3" fill="#ffffff" />
    </svg>
  );
}

// 3. Gráfico de Barras de Gastos / Salidas (Expenses / Outflows)
export function ExpenseBarsGraphic({ color = "#ef4444", idPrefix = "eb" }) {
  const uid = useId().replace(/:/g, "_");
  const gradId = `${idPrefix}-grad-${uid}`;
  return (
    <svg
      className="kpi-graphic bars-graphic"
      width="120"
      height="48"
      viewBox="0 0 120 48"
      fill="none"
      aria-hidden="true"
    >
      <defs>
        <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.9" />
          <stop offset="100%" stopColor={color} stopOpacity="0.2" />
        </linearGradient>
      </defs>
      <rect x="10" y="6" width="10" height="40" rx="3" fill={color} />
      <rect x="28" y="14" width="10" height="32" rx="3" fill={`url(#${gradId})`} opacity="0.88" />
      <rect x="46" y="12" width="10" height="34" rx="3" fill={`url(#${gradId})`} opacity="0.75" />
      <rect x="64" y="22" width="10" height="24" rx="3" fill={`url(#${gradId})`} opacity="0.6" />
      <rect x="82" y="28" width="10" height="18" rx="3" fill={`url(#${gradId})`} opacity="0.45" />
      <rect x="100" y="34" width="10" height="12" rx="3" fill={`url(#${gradId})`} opacity="0.3" />
      <path
        d="M 15 5 Q 55 18 105 33"
        stroke="#ffffff"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeOpacity="0.6"
        strokeDasharray="2 3"
      />
    </svg>
  );
}

// 4. Gráfico de Flujo de Transferencias (Transfers)
export function FlowTransferGraphic({ color = "#38bdf8", idPrefix = "tf" }) {
  const uid = useId().replace(/:/g, "_");
  const gradId = `${idPrefix}-grad-${uid}`;
  return (
    <svg
      className="kpi-graphic flow-graphic"
      width="120"
      height="48"
      viewBox="0 0 120 48"
      fill="none"
      aria-hidden="true"
    >
      <defs>
        <linearGradient id={gradId} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor={color} stopOpacity="0.2" />
          <stop offset="50%" stopColor={color} stopOpacity="0.95" />
          <stop offset="100%" stopColor={color} stopOpacity="0.3" />
        </linearGradient>
      </defs>
      <path
        d="M 4 24 C 30 6, 45 42, 70 24 C 95 6, 105 32, 116 24"
        stroke={`url(#${gradId})`}
        strokeWidth="2.5"
        strokeLinecap="round"
      />
      <circle cx="20" cy="17" r="3" fill={color} fillOpacity="0.5" />
      <circle cx="70" cy="24" r="5" fill={color} />
      <circle cx="70" cy="24" r="2" fill="#ffffff" />
      <circle cx="108" cy="22" r="3" fill={color} fillOpacity="0.6" />
      <path
        d="M 4 34 C 30 20, 50 36, 75 28 C 95 20, 105 32, 116 28"
        stroke={color}
        strokeWidth="1"
        strokeDasharray="3 3"
        strokeOpacity="0.3"
      />
    </svg>
  );
}

// 5. Gráfico de Arco de Seguridad (Security Gauge)
export function GaugeSecurityGraphic({ color = "#10b981", idPrefix = "sec" }) {
  const uid = useId().replace(/:/g, "_");
  const gradId = `${idPrefix}-arc-${uid}`;
  return (
    <svg
      className="kpi-graphic gauge-graphic"
      width="120"
      height="48"
      viewBox="0 0 120 48"
      fill="none"
      aria-hidden="true"
    >
      <defs>
        <linearGradient id={gradId} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#0284c7" />
          <stop offset="100%" stopColor={color} />
        </linearGradient>
      </defs>
      <path
        d="M 28 42 A 38 38 0 0 1 92 42"
        stroke="rgba(255, 255, 255, 0.1)"
        strokeWidth="5"
        strokeLinecap="round"
      />
      <path
        d="M 28 42 A 38 38 0 0 1 88 34"
        stroke={`url(#${gradId})`}
        strokeWidth="5"
        strokeLinecap="round"
      />
      <circle cx="60" cy="18" r="1.5" fill="#ffffff" opacity="0.6" />
      <circle cx="42" cy="24" r="1.5" fill="#ffffff" opacity="0.4" />
      <circle cx="78" cy="24" r="1.5" fill="#ffffff" opacity="0.4" />
      <circle cx="60" cy="38" r="4" fill={color} />
      <circle cx="60" cy="38" r="1.8" fill="#ffffff" />
      <circle cx="106" cy="16" r="6" stroke={color} strokeWidth="1.5" strokeDasharray="2 2" />
      <circle cx="106" cy="16" r="2.5" fill={color} />
    </svg>
  );
}

// 6. Gráfico de Tarjetas Isométricas (Cards Stack)
export function CardsStackGraphic({ color = "#38bdf8", idPrefix = "cs" }) {
  const uid = useId().replace(/:/g, "_");
  const card1Id = `${idPrefix}-c1-${uid}`;
  const card2Id = `${idPrefix}-c2-${uid}`;
  return (
    <svg
      className="kpi-graphic cards-graphic"
      width="120"
      height="48"
      viewBox="0 0 120 48"
      fill="none"
      aria-hidden="true"
    >
      <defs>
        <linearGradient id={card1Id} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.5" />
          <stop offset="100%" stopColor="#0284c7" stopOpacity="0.2" />
        </linearGradient>
        <linearGradient id={card2Id} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#ffffff" stopOpacity="0.2" />
          <stop offset="100%" stopColor="#38bdf8" stopOpacity="0.06" />
        </linearGradient>
      </defs>
      <rect
        x="24"
        y="6"
        width="56"
        height="34"
        rx="5"
        fill={`url(#${card2Id})`}
        stroke="rgba(255,255,255,0.15)"
        strokeWidth="1"
        transform="rotate(-5 24 6)"
      />
      <rect
        x="44"
        y="11"
        width="60"
        height="34"
        rx="5"
        fill={`url(#${card1Id})`}
        stroke={color}
        strokeWidth="1.2"
        strokeOpacity="0.75"
      />
      <rect x="52" y="17" width="9" height="7" rx="1.5" fill="#f59e0b" fillOpacity="0.85" />
      <line x1="66" y1="21" x2="90" y2="21" stroke="rgba(255,255,255,0.4)" strokeWidth="1.5" strokeLinecap="round" />
      <circle cx="94" cy="36" r="3.5" fill="rgba(255,255,255,0.3)" />
      <circle cx="89" cy="36" r="3.5" fill="rgba(255,255,255,0.2)" />
    </svg>
  );
}

// 7. Gráfico de Bóvedas de Ahorro (Vault Progress)
export function VaultProgressGraphic({ color = "#38bdf8", idPrefix = "vp" }) {
  const uid = useId().replace(/:/g, "_");
  const gradId = `${idPrefix}-grad-${uid}`;
  return (
    <svg
      className="kpi-graphic vault-graphic"
      width="120"
      height="48"
      viewBox="0 0 120 48"
      fill="none"
      aria-hidden="true"
    >
      <defs>
        <linearGradient id={gradId} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#0284c7" />
          <stop offset="100%" stopColor="#10b981" />
        </linearGradient>
      </defs>
      <circle cx="32" cy="24" r="16" stroke="rgba(255, 255, 255, 0.12)" strokeWidth="2.5" />
      <circle
        cx="32"
        cy="24"
        r="16"
        stroke={`url(#${gradId})`}
        strokeWidth="2.5"
        strokeDasharray="75 100"
        strokeLinecap="round"
      />
      <circle cx="32" cy="24" r="5" fill="#38bdf8" />
      <circle cx="32" cy="24" r="2" fill="#ffffff" />
      <line x1="58" y1="20" x2="114" y2="20" stroke="rgba(255,255,255,0.12)" strokeWidth="3" strokeLinecap="round" />
      <line x1="58" y1="20" x2="98" y2="20" stroke="#10b981" strokeWidth="3" strokeLinecap="round" />
      <line x1="58" y1="30" x2="114" y2="30" stroke="rgba(255,255,255,0.08)" strokeWidth="2" strokeLinecap="round" />
      <circle cx="98" cy="20" r="3" fill="#ffffff" />
    </svg>
  );
}

// 8. Gráfico de Red de Usuarios / Dispositivos (Network Users)
export function NetworkUsersGraphic({ color = "#38bdf8" }) {
  return (
    <svg
      className="kpi-graphic network-graphic"
      width="120"
      height="48"
      viewBox="0 0 120 48"
      fill="none"
      aria-hidden="true"
    >
      <line x1="16" y1="24" x2="48" y2="12" stroke="rgba(255,255,255,0.15)" strokeWidth="1.5" />
      <line x1="48" y1="12" x2="82" y2="26" stroke="rgba(255,255,255,0.15)" strokeWidth="1.5" />
      <line x1="48" y1="12" x2="108" y2="14" stroke="rgba(255,255,255,0.15)" strokeWidth="1.5" />
      <line x1="16" y1="24" x2="52" y2="36" stroke="rgba(255,255,255,0.15)" strokeWidth="1.5" />
      <line x1="52" y1="36" x2="82" y2="26" stroke="rgba(255,255,255,0.15)" strokeWidth="1.5" />
      <line x1="82" y1="26" x2="108" y2="38" stroke="rgba(255,255,255,0.15)" strokeWidth="1.5" />

      <circle cx="16" cy="24" r="4.5" fill="#0284c7" />
      <circle cx="16" cy="24" r="2" fill="#ffffff" />

      <circle cx="48" cy="12" r="5.5" fill={color} />
      <circle cx="48" cy="12" r="2.5" fill="#ffffff" />

      <circle cx="52" cy="36" r="4.5" fill="#0284c7" opacity="0.85" />

      <circle cx="82" cy="26" r="6.5" fill="#10b981" />
      <circle cx="82" cy="26" r="2.5" fill="#ffffff" />

      <circle cx="108" cy="14" r="4.5" fill={color} />
      <circle cx="108" cy="38" r="3.5" fill="#0284c7" opacity="0.75" />
    </svg>
  );
}

export default function MetricCard({
  title,
  value,
  subtitle,
  icon: Icon,
  accent = "primary",
  badge,
  badgeType = "success",
  action,
  showAction = false,
  onActionClick,
  graphic,
  graphicType,
  showGraphic = true,
  onClick,
  className = "",
  style = {},
}) {
  // Resolver micrográfico contextual ampliado de alto impacto
  let resolvedGraphic = graphic;
  if (!resolvedGraphic && showGraphic) {
    const t = (title || "").toLowerCase();
    const type =
      graphicType ||
      (t.includes("saldo") || t.includes("balance") || t.includes("capital") || t.includes("disponible")
        ? "wave"
        : t.includes("ingreso") || t.includes("depósito") || t.includes("ganancia") || t.includes("recaudo")
        ? "bars-income"
        : t.includes("gasto") || t.includes("retiro") || t.includes("salida") || t.includes("factura")
        ? "bars-expense"
        : t.includes("movimiento") || t.includes("transfer") || t.includes("transacción")
        ? "flow-transfer"
        : t.includes("seguridad") || t.includes("salud") || t.includes("riesgo") || t.includes("2fa") || t.includes("alerta")
        ? "gauge-security"
        : t.includes("tarjeta") || t.includes("plástico")
        ? "cards-stack"
        : t.includes("bóveda") || t.includes("ahorro") || t.includes("meta") || t.includes("préstamo") || t.includes("crédito")
        ? "vault-progress"
        : t.includes("usuario") || t.includes("cliente") || t.includes("dispositivo") || t.includes("sesión")
        ? "network-users"
        : accent === "emerald" || accent === "success"
        ? "bars-income"
        : accent === "ruby" || accent === "danger"
        ? "bars-expense"
        : accent === "amber" || accent === "warning"
        ? "bars-expense"
        : accent === "cyan" || accent === "info"
        ? "flow-transfer"
        : "wave");

    if (type === "wave") {
      resolvedGraphic = <FluidWaveGraphic color={accent === "emerald" ? "#10b981" : "#38bdf8"} />;
    } else if (type === "bars-income" || type === "income" || type === "bars-emerald") {
      resolvedGraphic = <IncomeBarsGraphic color="#10b981" />;
    } else if (type === "bars-expense" || type === "expense" || type === "bars-ruby") {
      resolvedGraphic = <ExpenseBarsGraphic color="#ef4444" />;
    } else if (type === "flow-transfer" || type === "transfer" || type === "bars-cyan") {
      resolvedGraphic = <FlowTransferGraphic color="#38bdf8" />;
    } else if (type === "gauge-security" || type === "security") {
      resolvedGraphic = <GaugeSecurityGraphic color="#10b981" />;
    } else if (type === "cards-stack" || type === "cards") {
      resolvedGraphic = <CardsStackGraphic color="#38bdf8" />;
    } else if (type === "vault-progress" || type === "vault") {
      resolvedGraphic = <VaultProgressGraphic color="#38bdf8" />;
    } else if (type === "network-users" || type === "users") {
      resolvedGraphic = <NetworkUsersGraphic color="#38bdf8" />;
    } else {
      resolvedGraphic = <FluidWaveGraphic color="#38bdf8" />;
    }
  }

  // Resolver botón de acción de 3 puntos opcional
  let resolvedAction = action;
  if (!resolvedAction && showAction) {
    resolvedAction = (
      <button
        className="metric-card-action-btn"
        aria-label={`Opciones de ${title || "métrica"}`}
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          if (onActionClick) onActionClick(e);
        }}
      >
        <MoreHorizontal size={16} />
      </button>
    );
  }

  return (
    <div
      className={`metric-card glass-card accent-${accent} ${onClick ? "clickable" : ""} ${className}`}
      onClick={onClick}
      style={style}
    >
      {/* Cabecera de la Tarjeta: Título a la izquierda e Ícono squircle a la derecha (según Referencia 2) */}
      <div className="metric-card-header">
        <span className="metric-card-title">{title}</span>
        <div className="metric-card-header-end">
          {badge && (
            <span className={`metric-card-badge badge-${badgeType}`}>{badge}</span>
          )}
          {resolvedAction && <div className="metric-card-action-wrap">{resolvedAction}</div>}
          {Icon && (
            <div className={`metric-card-icon-wrap icon-${accent}`}>
              <Icon size={19} className="metric-card-icon" />
            </div>
          )}
        </div>
      </div>

      {/* Cuerpo de la Tarjeta: Valor y subtítulo a la izquierda, SVG contextual ampliado a la derecha */}
      <div className="metric-card-body">
        <div className="metric-card-body-text">
          <div className="metric-card-value">{value}</div>
          {subtitle && <div className="metric-card-subtitle">{subtitle}</div>}
        </div>
        {resolvedGraphic && <div className="metric-card-graphic">{resolvedGraphic}</div>}
      </div>
    </div>
  );
}
