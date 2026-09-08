import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import {
  RefreshCcw,
  Search,
  X,
  Coins,
  TrendingUp,
  TrendingDown,
  DollarSign,
} from "lucide-react";
import ClientLayout from "./ClientLayout";
import MetricCard from "./MetricCard";
import Modal from "./Modal";
import { Pagination } from "./components";
import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";
import "./Dashboard.css";
import "./LightMode.css";
import "./Crypto.css";

const API = "http://localhost:8080";

const DEFAULT_COINS = [
  { id: "bitcoin", symbol: "BTC", name: "Bitcoin" },
  { id: "ethereum", symbol: "ETH", name: "Ethereum" },
  { id: "cardano", symbol: "ADA", name: "Cardano" },
  { id: "ripple", symbol: "XRP", name: "XRP" },
  { id: "dogecoin", symbol: "DOGE", name: "Dogecoin" },
];

const SYMBOL_TO_ID = {
  BTC: "bitcoin",
  ETH: "ethereum",
  ADA: "cardano",
  XRP: "ripple",
  DOGE: "dogecoin",
  XLM: "stellar",
  SAROS: "saros-finance",
};

const ID_TO_SYMBOL = {
  BITCOIN: "BTC",
  ETHEREUM: "ETH",
  CARDANO: "ADA",
  RIPPLE: "XRP",
  DOGECOIN: "DOGE",
  SOLANA: "SOL",
  STELLAR: "XLM",
  "SAROS-FINANCE": "SAROS",
};

const normalizeSymbol = (s) =>
  ID_TO_SYMBOL[(s || "").toUpperCase()] || (s || "").toUpperCase();

const FALLBACK_LOGOS = {
  BTC: "https://assets.coingecko.com/coins/images/1/large/bitcoin.png",
  ETH: "https://assets.coingecko.com/coins/images/279/large/ethereum.png",
  ADA: "https://assets.coingecko.com/coins/images/975/large/cardano.png",
  XRP: "https://assets.coingecko.com/coins/images/44/large/xrp-symbol-white-128.png",
  DOGE: "https://assets.coingecko.com/coins/images/5/large/dogecoin.png",
};


const PIE_COLORS = ["#22d3ee", "#60a5fa", "#7c3aed", "#ec4899", "#22c55e"];


export default function Crypto() {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");
  const auth = token ? { headers: { Authorization: `Bearer ${token}` } } : {};

  const [watchlist, setWatchlist] = useState(DEFAULT_COINS);
  const [logos, setLogos] = useState({});
  const [fiatBalance, setFiatBalance] = useState(0);
  const [tickers, setTickers] = useState([]);
  const [holdings, setHoldings] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loadingPrices, setLoadingPrices] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(null);

  const [ordersPage, setOrdersPage] = useState(1);
  const ordersPageSize = 6;
  const totalOrders = orders.length;
  const totalOrdersPages = Math.max(1, Math.ceil(totalOrders / ordersPageSize));
  const startOrderIdx = (ordersPage - 1) * ordersPageSize;
  const endOrderIdx = Math.min(startOrderIdx + ordersPageSize, totalOrders);
  const paginatedOrders = orders.slice(startOrderIdx, endOrderIdx);

  const [holdingsPage, setHoldingsPage] = useState(1);
  const holdingsPageSize = 5;


  const [searchText, setSearchText] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [searchOpen, setSearchOpen] = useState(false);
  const searchTimer = useRef();

  const [tradeOpen, setTradeOpen] = useState(false);
  const [tradeSide, setTradeSide] = useState("BUY");
  const [tradeSymbol, setTradeSymbol] = useState("BTC");
  const [tradeUsd, setTradeUsd] = useState("100");
  const [tradeMsg, setTradeMsg] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const railRef = useRef(null);

  useEffect(() => {
    if (!token) {
      navigate("/login");
      return;
    }
    (async () => {
      await Promise.all([loadMe(), loadHoldings(), loadOrders()]);
      await refreshPrices();
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  useEffect(() => {
    const id = setInterval(() => {
      refreshPrices();
    }, 30000);
    return () => clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [watchlist, holdings]);

  const loadMe = async () => {
    try {
      const r = await axios.get(`${API}/api/auth/me`, auth);
      setFiatBalance(r.data?.balance ?? 0);
    } catch (e) {
      console.error(e);
    }
  };

  const loadHoldings = async () => {
    try {
      const r = await axios.get(`${API}/api/crypto/me/holdings`, auth);
      const map = {};
      for (const h of r.data || []) {
        const sym = normalizeSymbol(h.symbol);
        const qty = Number(h.quantity || 0);
        map[sym] = (map[sym] || 0) + qty;
      }
      const rows = Object.entries(map).map(([symbol, quantity]) => ({
        symbol,
        quantity,
      }));
      setHoldings(rows);
      setLogos((prev) =>
        rows.reduce(
          (acc, r) => ({
            ...acc,
            [r.symbol]: acc[r.symbol] || FALLBACK_LOGOS[r.symbol],
          }),
          prev
        )
      );
    } catch (e) {
      console.error(e);
    }
  };

  const loadOrders = async () => {
    try {
      const r = await axios.get(`${API}/api/crypto/me/orders`, auth);
    const arr = (r.data || []).map((o) => ({
        id: o.id,
        symbol: normalizeSymbol(o.symbol),
        side: o.side,
        quantity: Number(o.quantity),
        price: Number(o.price),
        quoteAmount: Number(o.quoteAmount),
        status: o.status,
        createdAt: o.createdAt,
      }));
      setOrders(arr.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)));
    } catch (e) {
      console.error(e);
    }
  };

  const refreshPrices = async () => {
    try {
      setLoadingPrices(true);
      const params = new URLSearchParams();
      const idSet = new Set(watchlist.map((c) => c.id));
      holdings.forEach((h) => {
        const id = SYMBOL_TO_ID[h.symbol];
        if (id) idSet.add(id);
      });
      Array.from(idSet).forEach((id) => params.append("symbols", id));

      const r = await axios.get(`${API}/api/crypto/tickers`, { ...auth, params });
      const list = (r.data?.tickers || []).map((t) => ({
        symbol: String(t.symbol || "").toUpperCase(),
        price: Number(t.price),
        change24hPercent: Number(t.change24hPercent),
        high24h: Number(t.high24h),
        low24h: Number(t.low24h),
        image: t.image,
      }));
      setTickers(list);
      setLastUpdated(new Date());

      const next = { ...logos };
      for (const t of list) {
        if (t.image) next[t.symbol] = t.image;
      }
      for (const c of watchlist) {
        if (!next[c.symbol] && FALLBACK_LOGOS[c.symbol])
          next[c.symbol] = FALLBACK_LOGOS[c.symbol];
      }
      setLogos(next);
    } catch (e) {
      console.error("tickers failed", e);
      setTickers([]);
    } finally {
      setLoadingPrices(false);
    }
  };

  const priceBy = useMemo(
    () => Object.fromEntries(tickers.map((t) => [t.symbol, t.price])),
    [tickers]
  );

  const analytics = useMemo(() => {
    const avgCost = {};
    const position = {};
    for (const o of [...orders].sort(
      (a, b) => new Date(a.createdAt) - new Date(b.createdAt)
    )) {
      const s = o.symbol;
      position[s] = position[s] || 0;
      avgCost[s] = avgCost[s] || 0;
      if (o.side === "BUY") {
        const newQty = position[s] + o.quantity;
        const newCost =
          (position[s] * avgCost[s] + o.quoteAmount) / (newQty || 1);
        position[s] = newQty;
        avgCost[s] = newCost;
      } else if (o.side === "SELL") {
        position[s] = Math.max(0, position[s] - o.quantity);
        if (position[s] === 0) avgCost[s] = 0;
      }
    }

    const rows = holdings.map((h) => {
      const s = h.symbol;
      const qty = Number(h.quantity || 0);
      const cp = priceBy[s] ?? 0;
      const ac = avgCost[s] ?? 0;
      const mv = qty * cp;
      const upl = (cp - ac) * qty;
      const uplPct = ac > 0 ? ((cp - ac) / ac) * 100 : 0;
      return {
        symbol: s,
        qty,
        avgCost: ac,
        currentPrice: cp,
        marketValue: mv,
        upl,
        uplPct,
      };
    });

    const totalMV = rows.reduce((a, b) => a + b.marketValue, 0);
    const totalCost = rows.reduce((a, b) => a + b.avgCost * b.qty, 0);
    const totalUPL = totalMV - totalCost;
    const totalUPLPct = totalCost > 0 ? (totalUPL / totalCost) * 100 : 0;

    return { rows, totalMV, totalUPL, totalUPLPct };
  }, [holdings, orders, priceBy]);

  const totalPortfolioValue = useMemo(
    () => fiatBalance + analytics.totalMV,
    [fiatBalance, analytics.totalMV]
  );

  const totalHoldings = analytics.rows.length;
  const totalHoldingsPages = Math.max(1, Math.ceil(totalHoldings / holdingsPageSize));
  const startHoldingIdx = (holdingsPage - 1) * holdingsPageSize;
  const endHoldingIdx = Math.min(startHoldingIdx + holdingsPageSize, totalHoldings);
  const paginatedHoldings = analytics.rows.slice(startHoldingIdx, endHoldingIdx);


  const pieData = useMemo(() => {
    const arr = holdings
      .map((h) => ({
        name: h.symbol,
        value: (priceBy[h.symbol] || 0) * Number(h.quantity || 0),
      }))
      .filter((x) => x.value > 0);
    const total = arr.reduce((a, b) => a + b.value, 0) || 1;
    return arr.map((x) => ({ ...x, pct: (x.value / total) * 100 }));
  }, [holdings, priceBy]);

  const fmt = (n, d = 2) =>
    n === null || n === undefined
      ? "-"
      : Number(n).toLocaleString(undefined, { maximumFractionDigits: d });
  const changeClass = (n) => (Number(n) >= 0 ? "pos" : "neg");

  const openTrade = (symbol, side) => {
    setTradeSymbol(symbol);
    setTradeSide(side);
    setTradeUsd("100");
    setTradeMsg("");
    setTradeOpen(true);
  };

  const submitTrade = async () => {
    if (!tradeSymbol) return;
    const usd = parseFloat(tradeUsd);
    if (!(usd > 0)) {
      setTradeMsg("Enter an amount greater than 0");
      return;
    }
    if (usd < 0.01) {
      setTradeMsg("Minimum is $0.01");
      return;
    }
    const coinFromWatch = watchlist.find((c) => c.symbol === tradeSymbol);
    const symbolId =
      coinFromWatch?.id || SYMBOL_TO_ID[tradeSymbol] || tradeSymbol.toLowerCase();

    try {
      setSubmitting(true);
      setTradeMsg("");
      const r = await axios.post(
        `${API}/api/crypto/order`,
        { symbol: symbolId, side: tradeSide, quoteAmount: usd },
        auth
      );
      setTradeMsg(
        `${tradeSide} filled: ${r.data.quantity} ${r.data.symbol} @ $${fmt(
          r.data.price,
          2
        )}`
      );
      await Promise.all([loadMe(), loadHoldings(), loadOrders()]);
      await refreshPrices();
    } catch (e) {
      const m = e?.response?.data?.message || e?.message || "Order failed";
      setTradeMsg(m);
    } finally {
      setSubmitting(false);
    }
  };

  const runSearch = (val) => {
    const q = val;
    setSearchText(q);
    clearTimeout(searchTimer.current);
    if (!q.trim()) {
      setSearchResults([]);
      setSearchOpen(false);
      return;
    }
    searchTimer.current = setTimeout(async () => {
      try {
        setSearchOpen(true);
        const url = `https://api.coingecko.com/api/v3/search?query=${encodeURIComponent(
          q.trim()
        )}`;
        const r = await axios.get(url);
        const coins = (r.data?.coins || []).slice(0, 10).map((c) => ({
          id: c.id,
          symbol: (c.symbol || "").toUpperCase(),
          name: c.name,
          logo: c.large || c.thumb,
        }));
        setSearchResults(coins);
      } catch (e) {
        console.error("search failed", e);
        setSearchResults([]);
      }
    }, 250);
  };

  const pickSearchCoin = (coin) => {
    setWatchlist([{ id: coin.id, symbol: coin.symbol, name: coin.name }]);
    setLogos((prev) => ({ ...prev, [coin.symbol]: coin.logo }));
    setSearchOpen(false);
    setSearchText(coin.name);
    refreshPrices();
  };

  const resetWatchlist = () => {
    setWatchlist(DEFAULT_COINS);
    setSearchText("");
    setSearchResults([]);
    setSearchOpen(false);
    refreshPrices();
  };

  const CoinCard = ({ c }) => {
    const t = tickers.find((x) => x.symbol === c.symbol);
    const supported = Boolean(t);
    const price = t?.price ?? 0;
    const chg = t?.change24hPercent ?? 0;
    const imgFromTicker = t?.image;
    const logoUrl =
      imgFromTicker || logos[c.symbol] || FALLBACK_LOGOS[c.symbol] || "/coin.svg";
    return (
      <div className={`coin-card ${!supported ? "dim" : ""}`}>
        <div className="coin-head">
          <img
            className="coin-logo"
            src={logoUrl}
            alt={c.symbol}
            onError={(e) => {
              e.currentTarget.onerror = null;
              e.currentTarget.src = "/coin.svg";
            }}
          />
          <div className="coin-sym">
            <div className="coin-sym-top">{c.symbol}</div>
            <div className="coin-name">{c.name}</div>
          </div>
        </div>
        <div className="coin-price">${fmt(price, 2)}</div>
        <div className={`coin-chg ${changeClass(chg)}`}>
          {chg >= 0 ? "+" : ""}
          {fmt(chg, 2)}% Hoy
        </div>
        <div className="trade-actions">
          <div className="btn-row">
            <button
              className="btn-trade buy"
              disabled={!supported}
              onClick={() => openTrade(c.symbol, "BUY")}
            >
              Comprar
            </button>
            <button
              className="btn-trade sell"
              disabled={!supported}
              onClick={() => openTrade(c.symbol, "SELL")}
            >
              Vender
            </button>
          </div>
          {!supported && (
            <div className="hint" style={{ marginTop: 6, opacity: 0.7 }}>
              No disponible
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <ClientLayout
      active="crypto"
      title="Criptomonedas"
      subtitle="Compra, venta y custodia de criptoactivos en tiempo real"
    >
      <div className="crypto-box">
        {/* Métricas Globales de Cripto con MetricCard compartido */}
        <div className="account-metrics-grid" style={{ marginBottom: "24px" }}>
          <MetricCard
            title="Valor Total Cartera"
            value={`$${fmt(totalPortfolioValue, 2)}`}
            badge="Efectivo + Cripto"
            icon={Coins}
            accent="primary"
          />
          <MetricCard
            title="Ganancia / Pérdida"
            value={`$${fmt(analytics.totalUPL, 2)}`}
            badge={`${analytics.totalUPL >= 0 ? "+" : ""}${fmt(analytics.totalUPLPct, 2)}% PnL`}
            icon={analytics.totalUPL >= 0 ? TrendingUp : TrendingDown}
            accent={analytics.totalUPL >= 0 ? "emerald" : "amber"}
          />
          <MetricCard
            title="Saldo Disponible USD"
            value={`$${fmt(fiatBalance, 2)}`}
            badge="Listo para operar"
            icon={DollarSign}
            accent="cyan"
          />
          <MetricCard
            title="Órdenes Ejecutadas"
            value={`${orders.length}`}
            badge="Historial total"
            icon={RefreshCcw}
            accent="info"
          />
        </div>

        {/* Buscador y Actualización */}
        <div className="search-bar">
          <div
            className="search-input-wrap"
            onBlur={() => setTimeout(() => setSearchOpen(false), 150)}
          >
            <Search size={16} className="search-icon" />
            <input
              className="search-input"
              value={searchText}
              onChange={(e) => runSearch(e.target.value)}
              placeholder="Buscar moneda (ej. Bitcoin, ETH, XRP)"
              onFocus={() => searchText && setSearchOpen(true)}
            />
            {searchText && (
              <button
                type="button"
                className="search-clear-btn"
                onClick={resetWatchlist}
                aria-label="Limpiar búsqueda"
              >
                <X size={16} />
              </button>
            )}
            {searchOpen && searchResults.length > 0 && (
              <div className="search-dropdown">
                {searchResults.map((r) => (
                  <button
                    key={r.id}
                    type="button"
                    className="search-item"
                    onMouseDown={() => pickSearchCoin(r)}
                  >
                    <img
                      src={r.logo || "/coin.svg"}
                      alt={r.symbol}
                      className="search-logo"
                      onError={(e) => {
                        e.currentTarget.onerror = null;
                        e.currentTarget.src = "/coin.svg";
                      }}
                    />
                    <div className="search-meta">
                      <div className="search-name">{r.name}</div>
                      <div className="search-sym">{r.symbol}</div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
          <div className="updated-pill">
            <button
              type="button"
              className="btn-refresh"
              onClick={refreshPrices}
              disabled={loadingPrices}
            >
              <RefreshCcw size={14} className={loadingPrices ? "animate-spin" : ""} />
              {loadingPrices ? "Actualizando..." : "Actualizar"}
            </button>
            <span className="muted">
              {lastUpdated
                ? `Actualizado hace ${Math.max(
                    1,
                    Math.round((new Date() - lastUpdated) / 1000)
                  )}s`
                : ""}
            </span>
          </div>
        </div>

        {/* Mercado / Carousel de Criptomonedas */}
        <div>
          <div className="section-title">Mercado de Criptoactivos</div>
          <div className="carousel-wrap">
            <div className="cards rail five" ref={railRef}>
              {watchlist.map((c) => (
                <div key={c.symbol} className="card-slot">
                  <CoinCard c={c} />
                </div>
              ))}
              {watchlist.length === 0 && (
                <div className="empty" style={{ width: "100%", padding: "30px" }}>
                  <p style={{ margin: 0 }}>No hay monedas en seguimiento.</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Distribución del Portafolio y Resumen */}
        <div className="crypto-portfolio-grid">
          <div className="panel">
            <div className="panel-title" style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <Coins size={18} style={{ color: "var(--primary)" }} /> Distribución del Portafolio
            </div>
            {pieData.length > 0 ? (
              <div className="chart-container-wrap">
                <div style={{ width: "100%", height: 210 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={pieData}
                        dataKey="value"
                        nameKey="name"
                        innerRadius={65}
                        outerRadius={95}
                        paddingAngle={3}
                        stroke="none"
                      >
                        {pieData.map((_, i) => (
                          <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                        ))}
                      </Pie>
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="crypto-legend">
                  {pieData.map((p, i) => (
                    <div key={i} className="legend-item">
                      <span
                        className="dot"
                        style={{ background: PIE_COLORS[i % PIE_COLORS.length] }}
                      />
                      <span>{p.name}</span>
                      <span style={{ color: "var(--text-muted)" }}>{fmt(p.pct, 1)}%</span>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="empty" style={{ padding: "40px 20px" }}>
                <p style={{ margin: 0, fontWeight: 600 }}>Sin posiciones actualmente</p>
                <p style={{ margin: "6px 0 0", fontSize: "0.85rem", opacity: 0.8 }}>
                  Adquiere activos desde el mercado para visualizar la composición de tu cartera.
                </p>
              </div>
            )}
          </div>

          <div className="panel">
            <div className="panel-title" style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <TrendingUp size={18} style={{ color: "var(--primary)" }} /> Resumen de Custodia & Rendimiento
            </div>
            <div className="crypto-breakdown-container">
              <div className="crypto-breakdown-card">
                <span className="crypto-breakdown-label">Valor en Criptomonedas</span>
                <span className="crypto-breakdown-val">${fmt(analytics.totalMV, 2)}</span>
                <span className="crypto-breakdown-hint">Total activos custodiados</span>
              </div>
              <div className="crypto-breakdown-card">
                <span className="crypto-breakdown-label">Efectivo en Cuenta USD</span>
                <span className="crypto-breakdown-val">${fmt(fiatBalance, 2)}</span>
                <span className="crypto-breakdown-hint">Saldo libre para órdenes</span>
              </div>
              <div className="crypto-breakdown-card">
                <span className="crypto-breakdown-label">Rendimiento No Realizado</span>
                <span
                  className="crypto-breakdown-val"
                  style={{
                    color: analytics.totalUPL >= 0 ? "var(--success)" : "var(--danger)",
                  }}
                >
                  {analytics.totalUPL >= 0 ? "+" : ""}${fmt(analytics.totalUPL, 2)}
                </span>
                <span className="crypto-breakdown-hint">
                  {analytics.totalUPL >= 0 ? "+" : ""}{fmt(analytics.totalUPLPct, 2)}% sobre costo base
                </span>
              </div>
              <div className="crypto-breakdown-card">
                <span className="crypto-breakdown-label">Activos en Cartera</span>
                <span className="crypto-breakdown-val">{holdings.length} {holdings.length === 1 ? "moneda" : "monedas"}</span>
                <span className="crypto-breakdown-hint">Posiciones abiertas</span>
              </div>
            </div>
          </div>
        </div>

        {/* Tabla: Activos en Cartera */}
        <div className="panel">
          <div className="panel-title" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span>Activos en Cartera</span>
            <span style={{ fontSize: "0.8rem", color: "var(--text-muted)", fontWeight: 500 }}>
              {analytics.rows.length} {analytics.rows.length === 1 ? "posición" : "posiciones"}
            </span>
          </div>
          <div className="table-wrap">
            <table className="table">
              <thead>
                <tr>
                  <th>Símbolo</th>
                  <th>Cantidad</th>
                  <th>Precio Promedio</th>
                  <th>Precio Actual</th>
                  <th>Valor de Mercado</th>
                  <th>Rendimiento</th>
                  <th style={{ textAlign: "right" }}>Operar</th>
                </tr>
              </thead>
              <tbody>
                {paginatedHoldings.map((r) => (
                  <tr key={r.symbol}>
                    <td className="sym">
                      <img
                        className="coin-logo"
                        src={logos[r.symbol] || FALLBACK_LOGOS[r.symbol] || "/coin.svg"}
                        alt={r.symbol}
                        onError={(e) => {
                          e.currentTarget.onerror = null;
                          e.currentTarget.src = "/coin.svg";
                        }}
                      />
                      <div>
                        <div>{r.symbol}</div>
                      </div>
                    </td>
                    <td>{fmt(r.qty, 8)}</td>
                    <td>${fmt(r.avgCost, 2)}</td>
                    <td>${fmt(r.currentPrice, 2)}</td>
                    <td style={{ fontWeight: 700 }}>${fmt(r.marketValue, 2)}</td>
                    <td>
                      <span
                        style={{
                          color: r.upl >= 0 ? "var(--success)" : "var(--danger)",
                          fontWeight: 700,
                          fontSize: "0.85rem",
                        }}
                      >
                        {r.upl >= 0 ? "+" : ""}${fmt(r.upl, 2)} ({r.upl >= 0 ? "+" : ""}{fmt(r.uplPct, 2)}%)
                      </span>
                    </td>
                    <td style={{ textAlign: "right" }}>
                      <div style={{ display: "inline-flex", gap: "6px" }}>
                        <button
                          type="button"
                          className="btn-trade buy"
                          style={{ padding: "4px 10px", fontSize: "0.78rem", height: "30px" }}
                          onClick={() => openTrade(r.symbol, "BUY")}
                        >
                          Comprar
                        </button>
                        <button
                          type="button"
                          className="btn-trade sell"
                          style={{ padding: "4px 10px", fontSize: "0.78rem", height: "30px" }}
                          onClick={() => openTrade(r.symbol, "SELL")}
                        >
                          Vender
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {analytics.rows.length === 0 && (
                  <tr>
                    <td colSpan="7" className="empty">
                      No tienes activos en custodia actualmente
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          {totalHoldings > holdingsPageSize && (
            <div style={{ marginTop: "16px" }}>
              <Pagination
                currentPage={holdingsPage}
                totalPages={totalHoldingsPages}
                totalItems={totalHoldings}
                startIndex={startHoldingIdx}
                endIndex={endHoldingIdx}
                onPageChange={setHoldingsPage}
                itemLabel="posiciones"
              />
            </div>
          )}
        </div>

        {/* Tabla: Historial de Órdenes */}
        <div className="panel">
          <div className="panel-title" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span>Historial de Órdenes</span>
            <span style={{ fontSize: "0.8rem", color: "var(--text-muted)", fontWeight: 500 }}>
              {orders.length} {orders.length === 1 ? "orden" : "órdenes"}
            </span>
          </div>
          <div className="table-wrap">
            <table className="table">
              <thead>
                <tr>
                  <th>Fecha / Hora</th>
                  <th>Operación</th>
                  <th>Símbolo</th>
                  <th>Cantidad</th>
                  <th>Precio Unitario</th>
                  <th>Total USD</th>
                  <th>Estado</th>
                </tr>
              </thead>
              <tbody>
                {paginatedOrders.map((o) => (
                  <tr key={o.id}>
                    <td>{new Date(o.createdAt).toLocaleString()}</td>
                    <td>
                      <span className={`crypto-side-badge ${o.side.toLowerCase()}`}>
                        {o.side === "BUY" ? "Compra" : "Venta"}
                      </span>
                    </td>
                    <td style={{ fontWeight: 700 }}>{o.symbol}</td>
                    <td>{fmt(o.quantity, 8)}</td>
                    <td>${fmt(o.price, 2)}</td>
                    <td style={{ fontWeight: 700 }}>${fmt(o.quoteAmount, 2)}</td>
                    <td>
                      <span className={`crypto-status-badge ${String(o.status || "").toLowerCase()}`}>
                        {o.status || "FILLED"}
                      </span>
                    </td>
                  </tr>
                ))}
                {orders.length === 0 && (
                  <tr>
                    <td colSpan="7" className="empty">
                      Sin órdenes registradas en el historial
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          {orders.length > ordersPageSize && (
            <div style={{ marginTop: "16px" }}>
              <Pagination
                currentPage={ordersPage}
                totalPages={totalOrdersPages}
                totalItems={totalOrders}
                startIndex={startOrderIdx}
                endIndex={endOrderIdx}
                onPageChange={setOrdersPage}
                itemLabel="órdenes"
              />
            </div>
          )}
        </div>
      </div>

      {/* Modal Reutilizable para Trade de Cripto */}
      <Modal
        isOpen={tradeOpen}
        onClose={() => setTradeOpen(false)}
        title={`${tradeSide === "BUY" ? "Comprar" : "Vender"} ${tradeSymbol}`}
        subtitle="Ejecución de orden a precio de mercado instantánea"
        icon={Coins}
        maxWidth="460px"
        footer={
          <div style={{ display: "flex", gap: "10px", width: "100%", justifyContent: "flex-end" }}>
            <button
              type="button"
              className="modal-btn cancel"
              onClick={() => setTradeOpen(false)}
            >
              Cerrar
            </button>
            <button
              type="button"
              className={`btn-confirm-trade ${tradeSide.toLowerCase()}`}
              onClick={submitTrade}
              disabled={submitting}
            >
              {submitting
                ? "Procesando..."
                : tradeSide === "BUY"
                ? "Confirmar Compra"
                : "Confirmar Venta"}
            </button>
          </div>
        }
      >
        <div className="crypto-modal-body">
          <div>
            <label className="crypto-modal-label">
              Monto a operar (USD):
            </label>
            <input
              type="number"
              min="0.01"
              step="0.01"
              value={tradeUsd}
              onChange={(e) => setTradeUsd(e.target.value)}
              className="modal-input"
              placeholder="100.00"
            />
          </div>

          <div className="crypto-quick-chips">
            {[50, 100, 250, 500, 1000].map((amt) => (
              <button
                key={amt}
                type="button"
                className="crypto-chip"
                onClick={() => setTradeUsd(String(amt))}
              >
                ${amt}
              </button>
            ))}
          </div>

          <div className="crypto-estimates">
            <div className="crypto-estimate-row">
              <span className="crypto-estimate-label">Precio de Mercado:</span>
              <span className="crypto-estimate-val">${fmt(priceBy[tradeSymbol], 2)}</span>
            </div>
            <div className="crypto-estimate-row">
              <span className="crypto-estimate-label">Cantidad Estimada:</span>
              <span className="crypto-estimate-val accent">
                {fmt((Number(tradeUsd || 0) / (priceBy[tradeSymbol] || 1)) || 0, 8)} {tradeSymbol}
              </span>
            </div>
          </div>

          {tradeMsg && (
            <div
              className={`crypto-trade-alert ${
                tradeMsg.includes("filled") ? "success" : "error"
              }`}
            >
              {tradeMsg}
            </div>
          )}
        </div>
      </Modal>
    </ClientLayout>
  );
}
