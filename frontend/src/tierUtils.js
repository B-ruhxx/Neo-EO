/**
 * ==========================================================================
 * GESTIÓN CENTRALIZADA DE NIVELES DE CLIENTE (TIERS / MEMBRESÍAS)
 * ==========================================================================
 * Permite calcular de forma reactiva y consistente el nivel del usuario
 * basado en su patrimonio/balance o asignación administrativa.
 */

export const TIERS = {
  SILVER: {
    id: "SILVER",
    name: "Nivel Plata",
    label: "Cliente Silver",
    shortName: "SILVER",
    minBalance: 0,
    maxBalance: 2499.99,
    color: "#94a3b8",
    accentColor: "#cbd5e1",
    bgSubtle: "rgba(148, 163, 184, 0.12)",
    borderColor: "rgba(148, 163, 184, 0.3)",
    cashback: "0.5%",
    perks: [
      "1 Tarjeta virtual internacional gratuita",
      "Transferencias locales sin comisiones",
      "Soporte estándar por chat",
      "Bóvedas de ahorro básicas"
    ]
  },
  GOLD: {
    id: "GOLD",
    name: "Nivel Oro",
    label: "Cliente Gold",
    shortName: "GOLD",
    minBalance: 2500,
    maxBalance: 9999.99,
    color: "#f59e0b",
    accentColor: "#fbbf24",
    bgSubtle: "rgba(245, 158, 11, 0.12)",
    borderColor: "rgba(245, 158, 11, 0.35)",
    cashback: "1.0%",
    perks: [
      "Hasta 3 Tarjetas virtuales con límites personalizados",
      "Cashback del 1.0% en compras comerciales",
      "Transferencias bancarias prioritarias",
      "Soporte 24/7 preferencial"
    ]
  },
  PLATINUM: {
    id: "PLATINUM",
    name: "Nivel Platino",
    label: "Cliente Platinum",
    shortName: "PLATINO",
    minBalance: 10000,
    maxBalance: 49999.99,
    color: "#38bdf8",
    accentColor: "#6366f1",
    bgSubtle: "rgba(56, 189, 248, 0.14)",
    borderColor: "rgba(56, 189, 248, 0.4)",
    cashback: "2.0%",
    perks: [
      "Tarjetas virtuales ilimitadas + Tarjeta física metálica",
      "Cashback del 2.0% en todas las compras",
      "Seguro de viaje y protección contra fraudes extendida",
      "Cero comisiones en conversión de divisas internacionales",
      "Analíticas patrimoniales y reportes fiscales avanzados"
    ]
  },
  DIAMOND: {
    id: "DIAMOND",
    name: "Nivel Diamante",
    label: "Cliente Diamond Elite",
    shortName: "DIAMANTE",
    minBalance: 50000,
    maxBalance: Infinity,
    color: "#c084fc",
    accentColor: "#ec4899",
    bgSubtle: "rgba(192, 132, 252, 0.15)",
    borderColor: "rgba(192, 132, 252, 0.4)",
    cashback: "3.0%",
    perks: [
      "Asesor patrimonial y concierge privado 24/7",
      "Cashback exclusivo del 3.0%",
      "Límites de retiro y crédito ultra ampliados",
      "Acceso VIP ilimitado a salas de aeropuerto (LoungeKey)",
      "Inversiones privadas y trading institucional con cero spread"
    ]
  }
};

/**
 * Determina el tier del usuario a partir de su balance numérico o su objeto usuario.
 * @param {Object|number} userOrBalance 
 * @returns {Object} Tier con metadatos y porcentaje de avance al siguiente nivel
 */
export function getUserTier(userOrBalance) {
  let balance = 0;
  if (typeof userOrBalance === "number") {
    balance = userOrBalance;
  } else if (userOrBalance && typeof userOrBalance === "object") {
    balance = parseFloat(userOrBalance.balance) || 0;
  }

  let currentTier = TIERS.SILVER;
  let nextTier = TIERS.GOLD;

  if (balance >= TIERS.DIAMOND.minBalance) {
    currentTier = TIERS.DIAMOND;
    nextTier = null;
  } else if (balance >= TIERS.PLATINUM.minBalance) {
    currentTier = TIERS.PLATINUM;
    nextTier = TIERS.DIAMOND;
  } else if (balance >= TIERS.GOLD.minBalance) {
    currentTier = TIERS.GOLD;
    nextTier = TIERS.PLATINUM;
  } else {
    currentTier = TIERS.SILVER;
    nextTier = TIERS.GOLD;
  }

  // Calcular progreso porcentual hacia el próximo nivel
  let progressPercent = 100;
  let remainingAmount = 0;

  if (nextTier) {
    const range = nextTier.minBalance - currentTier.minBalance;
    const currentOverBase = Math.max(0, balance - currentTier.minBalance);
    progressPercent = Math.min(100, Math.max(0, Math.round((currentOverBase / range) * 100)));
    remainingAmount = Math.max(0, nextTier.minBalance - balance);
  }

  return {
    ...currentTier,
    balance,
    nextTier,
    progressPercent,
    remainingAmount
  };
}
