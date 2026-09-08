import { useState } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";
import { Mail, Lock, Eye, EyeOff, ShieldCheck, AlertCircle, ArrowRight, Loader2, ArrowLeft } from "lucide-react";
import "./auth.css";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const res = await axios.post("http://localhost:8080/api/auth/login", {
        email,
        password,
      });

      localStorage.setItem("token", res.data.jwtToken);
      localStorage.setItem("user", JSON.stringify(res.data.user));

      if (res.data.user.role === "ADMIN" || res.data.user.email === "admin@bank.com") {
        navigate("/admin");
      } else {
        navigate("/dashboard");
      }
    } catch (err) {
      setError("Correo electrónico o contraseña incorrectos. Por favor, verifica tus credenciales.");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-nav-top">
        <Link to="/" className="auth-back-btn">
          <ArrowLeft size={16} />
          <span>Volver al inicio</span>
        </Link>
      </div>

      <main className="auth-container">
        {/* Contenedor del Logotipo con realce visual y resplandor de marca */}
        <div className="auth-logo-showcase">
          <div className="auth-logo-halo" />
          <img
            className="auth-main-logo"
            src="/logo_trimmed.png"
            alt="NeoBank Logotipo Institucional"
          />
        </div>

        <div className="auth-header">
          <h1 className="auth-title">Iniciar Sesión</h1>
          <p className="auth-subtitle">Acceso seguro a tu plataforma financiera digital</p>
        </div>

        <form onSubmit={handleLogin} className="auth-form" noValidate>
          {error && (
            <div className="auth-error-banner" role="alert">
              <AlertCircle size={18} className="auth-error-icon" />
              <span>{error}</span>
            </div>
          )}

          <div className="auth-field">
            <label htmlFor="auth-email" className="auth-label">
              Correo Electrónico
            </label>
            <div className="auth-input-wrapper">
              <Mail size={18} className="auth-input-icon" />
              <input
                id="auth-email"
                type="email"
                name="email"
                autoComplete="email"
                placeholder="ejemplo@correo.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="auth-input"
                required
                disabled={isLoading}
              />
            </div>
          </div>

          <div className="auth-field">
            <div className="auth-label-row">
              <label htmlFor="auth-password" className="auth-label">
                Contraseña
              </label>
            </div>
            <div className="auth-input-wrapper">
              <Lock size={18} className="auth-input-icon" />
              <input
                id="auth-password"
                type={showPassword ? "text" : "password"}
                name="password"
                autoComplete="current-password"
                placeholder="••••••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="auth-input has-toggle"
                required
                disabled={isLoading}
              />
              <button
                type="button"
                className="auth-password-toggle"
                onClick={() => setShowPassword(!showPassword)}
                aria-label={showPassword ? "Ocultar contraseña" : "Ver contraseña"}
                tabIndex={0}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            className={`auth-submit-btn ${isLoading ? "is-loading" : ""}`}
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 size={18} className="auth-spinner" />
                <span>Autenticando...</span>
              </>
            ) : (
              <>
                <span>Acceder a mi cuenta</span>
                <ArrowRight size={18} className="auth-btn-arrow" />
              </>
            )}
          </button>

          <div className="auth-footer-nav">
            <span className="auth-register-prompt">¿Aún no tienes una cuenta bancaria?</span>
            <Link to="/register" className="auth-register-link">
              Crear cuenta personal
            </Link>
          </div>
        </form>

        <div className="auth-trust-badge">
          <ShieldCheck size={16} className="auth-trust-icon" />
          <span>Cifrado bancario de extremo a extremo SSL de 256 bits</span>
        </div>
      </main>
    </div>
  );
}
