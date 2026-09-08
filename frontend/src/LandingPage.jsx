import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import {
  ArrowRight,
  ShieldCheck,
  Zap,
  Lock,
  Sparkles,
  CreditCard,
  PiggyBank,
  Coins,
  BarChart3,
  CheckCircle2,
  TrendingUp,
  Smartphone,
  Fingerprint,
  Layers,
  Calculator,
  Wifi,
} from "lucide-react";
import "./LandingPage.css";

export default function LandingPage() {
  const navigate = useNavigate();

  // Estado del Simulador Interactivo de Bóveda de Ahorro
  const [monthlyDeposit, setMonthlyDeposit] = useState(250);
  const [years, setYears] = useState(3);

  // Cálculo de interés compuesto (4.85% APY NeoBank vs 0.2% APY tradicional)
  const apyNeo = 0.0485;
  const apyTrad = 0.002;
  const totalMonths = years * 12;
  const totalSaved = monthlyDeposit * totalMonths;

  const calculateTotal = (rate) => {
    const monthlyRate = rate / 12;
    let balance = 0;
    for (let i = 0; i < totalMonths; i++) {
      balance = (balance + monthlyDeposit) * (1 + monthlyRate);
    }
    return Math.round(balance);
  };

  const neoBankTotal = calculateTotal(apyNeo);
  const traditionalTotal = calculateTotal(apyTrad);
  const netEarnings = neoBankTotal - totalSaved;

  return (
    <div className="landing-page">
      {/* Barra de Navegación Flotante con Glassmorphism */}
      <header className="landing-navbar-wrapper">
        <div className="landing-navbar">
          <Link to="/" className="landing-brand-link" aria-label="NeoBank Inicio">
            <div className="landing-logo-container">
              <img
                src="/logo_trimmed.png"
                alt="NeoBank Logo Institucional"
                className="landing-logo"
              />
            </div>
          </Link>

          <nav className="landing-nav-menu" aria-label="Secciones principales">
            <a href="#features" className="nav-menu-item">Servicios</a>
            <a href="#simulator" className="nav-menu-item">Simulador Bóveda</a>
            <a href="#security" className="nav-menu-item">Seguridad</a>
          </nav>

          <div className="landing-nav-links" aria-label="Acceso de usuarios">
            <button
              type="button"
              className="landing-nav-btn login-btn"
              onClick={() => navigate("/login")}
            >
              Iniciar Sesión
            </button>
            <button
              type="button"
              className="landing-nav-btn register-btn"
              onClick={() => navigate("/register")}
            >
              <span>Crear Cuenta</span>
              <ArrowRight size={15} />
            </button>
          </div>
        </div>
      </header>

      {/* Hero Principal con CSS Grid Ajustado (2 Columnas Sólidas) */}
      <section className="landing-hero-section">
        <div className="landing-container">
          <div className="landing-hero-grid">
            {/* Columna Izquierda: Mensaje y Llamados a la Acción */}
            <div className="landing-hero-content">
              <div className="landing-badge">
                <span className="landing-badge-pulse" />
                <Sparkles size={14} className="landing-badge-icon" />
                <span>Banca Digital Inteligente · APY 4.85%</span>
              </div>

              <h1 className="landing-title">
                El futuro de tus finanzas,{" "}
                <span className="landing-title-highlight">sin fricción y neutral</span>.
              </h1>

              <p className="landing-subtitle">
                Cuentas multidivisa, tarjetas virtuales instantáneas con CVV dinámico,
                bóvedas de alto rendimiento y custodia institucional de criptoactivos en una plataforma transparente.
              </p>

              <div className="landing-cta-row">
                <button
                  type="button"
                  className="get-started-btn"
                  onClick={() => navigate("/register")}
                >
                  <span>Abrir mi cuenta gratis</span>
                  <ArrowRight size={18} className="cta-arrow-icon" />
                </button>
                <button
                  type="button"
                  className="secondary-cta-btn"
                  onClick={() => navigate("/login")}
                >
                  Acceso Clientes
                </button>
              </div>

              {/* Franja de Credenciales Rápidas */}
              <div className="landing-features-strip">
                <div className="feature-pill">
                  <ShieldCheck size={16} className="feature-icon" />
                  <span>Cifrado SSL 256-bit</span>
                </div>
                <div className="feature-pill">
                  <Zap size={16} className="feature-icon" />
                  <span>Transferencias SEPA &lt; 3s</span>
                </div>
                <div className="feature-pill">
                  <CheckCircle2 size={16} className="feature-icon" />
                  <span>0 € Mantenimiento</span>
                </div>
              </div>
            </div>

            {/* Columna Derecha: Ilustración 3D y Notificaciones Flotantes Integradas */}
            <div className="landing-hero-media-wrapper">
              <div className="hero-media-container">
                <div className="hero-ambient-glow" />
                
                <img
                  src="/moneybag.png"
                  alt="NeoBank Activos Digitales"
                  className="money-bag"
                />

                {/* Tarjeta Flotante 1: Notificación de Rendimiento */}
                <div className="floating-metric-card metric-card-top">
                  <div className="metric-icon-wrap yield">
                    <TrendingUp size={16} />
                  </div>
                  <div className="metric-text-wrap">
                    <span className="metric-label">Bóveda de Ahorro</span>
                    <span className="metric-value">+4.85% APY Diario</span>
                  </div>
                </div>

                {/* Tarjeta Flotante 2: Notificación de Tarjeta Segura */}
                <div className="floating-metric-card metric-card-bottom">
                  <div className="metric-icon-wrap secure">
                    <ShieldCheck size={16} />
                  </div>
                  <div className="metric-text-wrap">
                    <span className="metric-label">Tarjeta Virtual Activa</span>
                    <span className="metric-value">CVV Dinámico Protegido</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Franja de Métricas Institucionales (Grid 4 Columnas) */}
      <section className="landing-stats-section" aria-label="Métricas institucionales">
        <div className="landing-container">
          <div className="stats-grid">
            <div className="stat-card">
              <span className="stat-number">+150.000</span>
              <span className="stat-title">Usuarios Activos</span>
              <span className="stat-desc">En toda Europa y Latinoamérica</span>
            </div>
            <div className="stat-card">
              <span className="stat-number">0 €</span>
              <span className="stat-title">Comisiones Ocultas</span>
              <span className="stat-desc">Sin costos de apertura ni custodia</span>
            </div>
            <div className="stat-card">
              <span className="stat-number">&lt; 3 seg</span>
              <span className="stat-title">Liquidación Inmediata</span>
              <span className="stat-desc">Transferencias bancarias instantáneas</span>
            </div>
            <div className="stat-card">
              <span className="stat-number">99.99%</span>
              <span className="stat-title">Disponibilidad 24/7</span>
              <span className="stat-desc">Infraestructura bancaria de alta resiliencia</span>
            </div>
          </div>
        </div>
      </section>

      {/* Bento Grid: El Ecosistema NeoBank (Grid 12 Columnas: 7+5 / 5+7 Simétrico) */}
      <section id="features" className="landing-bento-section">
        <div className="landing-container">
          <div className="section-header-center">
            <span className="section-eyebrow">SERVICIOS DE ÉLITE</span>
            <h2 className="section-main-title">Diseñado para la velocidad y la soberanía financiera</h2>
            <p className="section-sub-desc">
              Todas tus necesidades financieras integradas en una cuadrícula unificada, ágil y ultra segura.
            </p>
          </div>

          <div className="bento-grid">
            {/* Bento Card 1: Tarjetas Débito y Virtuales (Columna span 7) */}
            <div className="bento-card bento-card-tarjetas">
              <div className="bento-card-glow" />
              <div className="bento-card-inner-split">
                <div className="bento-card-text">
                  <div className="bento-icon-badge">
                    <CreditCard size={22} />
                  </div>
                  <h3 className="bento-title">Tarjetas Físicas & Virtuales Desechables</h3>
                  <p className="bento-desc">
                    Genera tarjetas virtuales al instante para compras protegidas en línea con CVV dinámico y compatibilidad directa con Apple Pay y Google Wallet.
                  </p>
                  <ul className="bento-checklist">
                    <li><CheckCircle2 size={15} className="check-icon" /> Congelación de tarjeta en 1 toque</li>
                    <li><CheckCircle2 size={15} className="check-icon" /> Pagos globales en +30 divisas sin sobrecosto</li>
                    <li><CheckCircle2 size={15} className="check-icon" /> Notificaciones de cargo en tiempo real</li>
                  </ul>
                </div>

                {/* Tarjeta de Débito Física Renderizada con Alta Fidelidad */}
                <div className="bento-card-visual-card">
                  <div className="neo-physical-card">
                    <div className="neo-card-header">
                      <span className="neo-card-brand">NEO<span className="brand-accent">BANK</span></span>
                      <Wifi size={18} className="neo-contactless-icon" />
                    </div>
                    <div className="neo-card-chip">
                      <div className="chip-lines" />
                    </div>
                    <div className="neo-card-number">
                      •••• &nbsp; •••• &nbsp; •••• &nbsp; 8842
                    </div>
                    <div className="neo-card-footer">
                      <div className="neo-card-holder">
                        <span className="holder-label">TITULAR</span>
                        <span className="holder-name">ALEXANDER R.</span>
                      </div>
                      <div className="neo-card-expiry">
                        <span className="holder-label">VENCE</span>
                        <span className="expiry-val">11/29</span>
                      </div>
                      <img src="/mc.png" alt="Mastercard" className="neo-mc-logo" />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Bento Card 2: Bóvedas de Ahorro (Columna span 5) */}
            <div className="bento-card bento-card-bovedas">
              <div className="bento-card-glow" />
              <div className="bento-icon-badge">
                <PiggyBank size={22} />
              </div>
              <h3 className="bento-title">Bóvedas de Alto Rendimiento</h3>
              <p className="bento-desc">
                Multiplica tu capital con una tasa del 4.85% APY sin bloqueos forzados. Liquidez completa las 24 horas y abono diario automático.
              </p>
              
              <div className="vault-highlight-widget">
                <div className="vault-rate-row">
                  <div>
                    <span className="vault-rate-label">Tasa Anual Efectiva</span>
                    <div className="vault-rate-val">4.85% <span className="vault-unit">TAE</span></div>
                  </div>
                  <span className="vault-live-pill">Liquidación Diaria</span>
                </div>
                <div className="vault-progress-track">
                  <div className="vault-progress-fill" style={{ width: "88%" }} />
                </div>
                <span className="vault-footnote">+€148.50 acreditados a clientes este mes</span>
              </div>
            </div>

            {/* Bento Card 3: Criptomonedas & Web3 (Columna span 5) */}
            <div className="bento-card bento-card-crypto">
              <div className="bento-card-glow" />
              <div className="bento-icon-badge">
                <Coins size={22} />
              </div>
              <h3 className="bento-title">Criptoactivos & Finanzas Web3</h3>
              <p className="bento-desc">
                Compra, intercambia y custodia Bitcoin, Ethereum y Solana con cotizaciones interbancarias y almacenamiento institucional en frío.
              </p>
              
              <div className="crypto-ticker-list">
                <div className="crypto-ticker-item">
                  <div className="crypto-asset-info">
                    <span className="crypto-symbol-badge btc">BTC</span>
                    <span className="crypto-name">Bitcoin</span>
                  </div>
                  <div className="crypto-price-info">
                    <span className="crypto-price">€64,280.00</span>
                    <span className="crypto-trend positive">+3.42%</span>
                  </div>
                </div>
                <div className="crypto-ticker-item">
                  <div className="crypto-asset-info">
                    <span className="crypto-symbol-badge eth">ETH</span>
                    <span className="crypto-name">Ethereum</span>
                  </div>
                  <div className="crypto-price-info">
                    <span className="crypto-price">€3,490.50</span>
                    <span className="crypto-trend positive">+2.15%</span>
                  </div>
                </div>
                <div className="crypto-ticker-item">
                  <div className="crypto-asset-info">
                    <span className="crypto-symbol-badge sol">SOL</span>
                    <span className="crypto-name">Solana</span>
                  </div>
                  <div className="crypto-price-info">
                    <span className="crypto-price">€148.20</span>
                    <span className="crypto-trend positive">+5.80%</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Bento Card 4: Analíticas y Presupuesto (Columna span 7) */}
            <div className="bento-card bento-card-analytics">
              <div className="bento-card-glow" />
              <div className="bento-card-inner-split">
                <div className="bento-card-text">
                  <div className="bento-icon-badge">
                    <BarChart3 size={22} />
                  </div>
                  <h3 className="bento-title">Analítica Predictiva y Control Inteligente</h3>
                  <p className="bento-desc">
                    Nuestra IA categoriza automáticamente tus transacciones, proyecta gastos recurrentes y te asiste para maximizar tu ahorro mes a mes.
                  </p>
                  <div className="analytics-summary-tag">
                    <span className="tag-label">Ahorro Promedio Estimado:</span>
                    <span className="tag-value">+18% mensual</span>
                  </div>
                </div>

                <div className="bento-analytics-chart-wrapper">
                  <div className="analytics-preview-bars">
                    <div className="analytics-bar-item">
                      <div className="bar-fill bar-1" style={{ height: "65%" }}></div>
                      <span>Servicios</span>
                    </div>
                    <div className="analytics-bar-item">
                      <div className="bar-fill bar-2" style={{ height: "85%" }}></div>
                      <span>Ahorros</span>
                    </div>
                    <div className="analytics-bar-item">
                      <div className="bar-fill bar-3" style={{ height: "45%" }}></div>
                      <span>Ocio</span>
                    </div>
                    <div className="analytics-bar-item">
                      <div className="bar-fill bar-4" style={{ height: "92%" }}></div>
                      <span>Inversión</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Simulador Interactivo de Bóvedas de Ahorro (Grid 2 Columnas Sólidas) */}
      <section id="simulator" className="landing-simulator-section">
        <div className="landing-container">
          <div className="simulator-container">
            <div className="simulator-header">
              <div className="simulator-badge">
                <Calculator size={14} />
                <span>SIMULADOR DE RENDIMIENTO INTERACTIVO</span>
              </div>
              <h2 className="simulator-title">Descubre cuánto crecerá tu capital</h2>
              <p className="simulator-subtitle">
                Compara el rendimiento de nuestras Bóvedas Inteligentes frente a las cuentas de depósito tradicionales.
              </p>
            </div>

            <div className="simulator-card-body">
              {/* Columna Izquierda: Controles Interactivos */}
              <div className="simulator-controls">
                <div className="control-group">
                  <div className="control-label-row">
                    <label htmlFor="deposit-slider">Aporte Mensual:</label>
                    <span className="control-live-value">{monthlyDeposit.toLocaleString()} € / mes</span>
                  </div>
                  <input
                    id="deposit-slider"
                    type="range"
                    min="50"
                    max="2000"
                    step="50"
                    value={monthlyDeposit}
                    onChange={(e) => setMonthlyDeposit(Number(e.target.value))}
                    className="simulator-slider"
                  />
                  <div className="slider-ticks">
                    <span>50 €</span>
                    <span>1.000 €</span>
                    <span>2.000 €</span>
                  </div>
                </div>

                <div className="control-group">
                  <label className="term-label">Plazo de Inversión:</label>
                  <div className="term-selector-btns">
                    {[1, 3, 5].map((t) => (
                      <button
                        key={t}
                        type="button"
                        className={`term-btn ${years === t ? "active" : ""}`}
                        onClick={() => setYears(t)}
                      >
                        {t} {t === 1 ? "Año" : "Años"}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="simulator-disclaimer">
                  <ShieldCheck size={16} className="disclaimer-icon" />
                  <span>Rentabilidad no bloqueante con acreditación diaria de rendimientos y liquidez instantánea.</span>
                </div>
              </div>

              {/* Columna Derecha: Resultados Comparativos en Grid */}
              <div className="simulator-results">
                <div className="result-main-card">
                  <span className="result-eyebrow">TOTAL PROYECTADO EN NEOBANK</span>
                  <span className="result-big-number">{neoBankTotal.toLocaleString()} €</span>
                  <div className="result-earnings-tag">
                    <TrendingUp size={16} />
                    <span>+{netEarnings.toLocaleString()} € de ganancia estimada (4.85% APY)</span>
                  </div>
                </div>

                <div className="result-comparison-row">
                  <div className="comparison-box bank-neo">
                    <span className="comp-label">Bóveda NeoBank (4.85%)</span>
                    <span className="comp-val">{neoBankTotal.toLocaleString()} €</span>
                    <div className="comp-bar-track">
                      <div className="comp-bar-fill neo-fill" style={{ width: "100%" }}></div>
                    </div>
                  </div>

                  <div className="comparison-box bank-trad">
                    <span className="comp-label">Banca Tradicional (0.20%)</span>
                    <span className="comp-val">{traditionalTotal.toLocaleString()} €</span>
                    <div className="comp-bar-track">
                      <div
                        className="comp-bar-fill trad-fill"
                        style={{ width: `${Math.round((traditionalTotal / neoBankTotal) * 100)}%` }}
                      ></div>
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  className="simulator-cta-btn"
                  onClick={() => navigate("/register")}
                >
                  <span>Comenzar a Ahorrar</span>
                  <ArrowRight size={16} />
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Sección de Seguridad Institucional (Grid 3 Columnas Simétricas) */}
      <section id="security" className="landing-security-section">
        <div className="landing-container">
          <div className="security-inner-box">
            <div className="security-header-block">
              <div className="security-badge">
                <Lock size={14} />
                <span>SEGURIDAD GRADO BANCARIO</span>
              </div>
              <h2 className="security-title">Tu patrimonio protegido bajo los más altos estándares</h2>
              <p className="security-desc">
                Implementamos protocolos criptográficos de última generación, autenticación biométrica y custodia segregada de activos bajo los estándares regulatorios europeos más estrictos.
              </p>
            </div>

            <div className="security-points-grid">
              <div className="sec-point-item">
                <Fingerprint size={24} className="sec-icon" />
                <div>
                  <h4>Autenticación Biométrica & FIDO2</h4>
                  <p>Acceso seguro mediante FaceID, huella dactilar o llaves físicas de hardware.</p>
                </div>
              </div>
              <div className="sec-point-item">
                <Smartphone size={24} className="sec-icon" />
                <div>
                  <h4>Control de Dispositivos & 2FA Dinámico</h4>
                  <p>Notificaciones push de verificación para transacciones sospechosas y bloqueo en 1 clic.</p>
                </div>
              </div>
              <div className="sec-point-item">
                <Layers size={24} className="sec-icon" />
                <div>
                  <h4>Cuentas Segregadas & FGD €100.000</h4>
                  <p>Tus fondos están permanentemente custodiados en entidades reguladas independientes.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Banner de Llamada a la Acción (Pre-Footer CTA) */}
      <section className="landing-cta-banner-section">
        <div className="landing-container">
          <div className="landing-cta-banner">
            <div className="cta-banner-glow" />
            <div className="cta-banner-content">
              <h2 className="cta-banner-title">Empieza hoy mismo tu nueva vida financiera</h2>
              <p className="cta-banner-subtitle">
                Abre tu cuenta bancaria digital en menos de 2 minutos. Sin trámites presenciales ni papeleos.
              </p>
              <div className="cta-banner-buttons">
                <button
                  type="button"
                  className="banner-primary-btn"
                  onClick={() => navigate("/register")}
                >
                  <span>Abrir Cuenta Personal Gratis</span>
                  <ArrowRight size={18} />
                </button>
                <button
                  type="button"
                  className="banner-secondary-btn"
                  onClick={() => navigate("/login")}
                >
                  Acceder a Banca Online
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Pie de Página Corporativo Completo (Grid 4 Columnas) */}
      <footer className="landing-footer-complete">
        <div className="landing-container">
          <div className="footer-top-grid">
            <div className="footer-brand-column">
              <img src="/logo_trimmed.png" alt="NeoBank" className="footer-logo" />
              <p className="footer-brand-desc">
                Banca digital de nueva generación diseñada para personas y empresas que demandan libertad, transparencia y tecnología sin fronteras.
              </p>
              <div className="footer-status-pill">
                <span className="status-dot-green" />
                <span>Sistemas 100% operativos</span>
              </div>
            </div>

            <div className="footer-links-column">
              <span className="footer-col-title">Servicios</span>
              <Link to="/register">Cuentas Personales</Link>
              <Link to="/register">Tarjetas Virtuales</Link>
              <Link to="/register">Bóvedas de Ahorro</Link>
              <Link to="/register">Criptomonedas</Link>
            </div>

            <div className="footer-links-column">
              <span className="footer-col-title">Seguridad & Legal</span>
              <a href="#security">Protocolos de Seguridad</a>
              <a href="#security">Cifrado de Extremo a Extremo</a>
              <Link to="/login">Términos de Servicio</Link>
              <Link to="/login">Política de Privacidad</Link>
            </div>

            <div className="footer-links-column">
              <span className="footer-col-title">NeoBank</span>
              <a href="#features">Acerca de nosotros</a>
              <a href="#simulator">Simulador Financiero</a>
              <Link to="/login">Portal de Clientes</Link>
              <Link to="/admin">Consola de Control</Link>
            </div>
          </div>

          <div className="footer-bottom-bar">
            <span>&copy; {new Date().getFullYear()} NEO Bank Financial Inc. Todos los derechos reservados.</span>
            <div className="footer-badges">
              <ShieldCheck size={14} className="footer-secure-icon" />
              <span>Plataforma financiera con cifrado institucional SSL de 256 bits</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}