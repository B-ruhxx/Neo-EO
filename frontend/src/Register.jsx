import { useState } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";
import {
  User,
  Mail,
  Lock,
  Phone,
  Eye,
  EyeOff,
  ShieldCheck,
  AlertCircle,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  Loader2,
} from "lucide-react";
import "./Register.css";

export default function Register() {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [repeatPassword, setRepeatPassword] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showRepeatPassword, setShowRepeatPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (password !== repeatPassword) {
      setError("Las contraseñas no coinciden.");
      return;
    }

    if (password.length < 6) {
      setError("La contraseña debe tener al menos 6 caracteres.");
      return;
    }

    setIsLoading(true);

    try {
      const res = await axios.post("http://localhost:8080/api/auth/register", {
        firstName,
        lastName,
        email,
        password,
        phoneNumber,
      });

      localStorage.setItem("token", res.data.jwtToken);
      localStorage.setItem("user", JSON.stringify(res.data.user));

      setSuccess("¡Registro exitoso! Preparando tu cuenta bancaria...");
      setError("");

      setTimeout(() => navigate("/dashboard"), 1500);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Error en el registro. Por favor verifica tus datos e intenta nuevamente."
      );
      setSuccess("");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="register-page">
      <div className="register-nav-top">
        <Link to="/" className="register-back-btn">
          <ArrowLeft size={16} />
          <span>Volver al inicio</span>
        </Link>
      </div>

      <main className="register-container">
        {/* Contenedor del Logotipo con realce visual y resplandor de marca */}
        <div className="register-logo-showcase">
          <div className="register-logo-halo" />
          <img
            className="register-main-logo"
            src="/logo_trimmed.png"
            alt="NeoBank Logotipo Institucional"
          />
        </div>

        <div className="register-header">
          <h1 className="register-title">Crear Cuenta Personal</h1>
          <p className="register-subtitle">
            Abre tu cuenta bancaria digital en menos de 2 minutos
          </p>
        </div>

        <form onSubmit={handleRegister} className="register-form" noValidate>
          {error && (
            <div className="register-error-banner" role="alert">
              <AlertCircle size={18} className="register-alert-icon" />
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div className="register-success-banner" role="status">
              <CheckCircle2 size={18} className="register-success-icon" />
              <span>{success}</span>
            </div>
          )}

          {/* Fila Nombre y Apellido en Grid */}
          <div className="register-grid-row">
            <div className="register-field">
              <label htmlFor="register-firstname" className="register-label">
                Nombre
              </label>
              <div className="register-input-wrapper">
                <User size={18} className="register-input-icon" />
                <input
                  id="register-firstname"
                  type="text"
                  name="firstName"
                  autoComplete="given-name"
                  placeholder="Carlos"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  className="register-input"
                  required
                  disabled={isLoading}
                />
              </div>
            </div>

            <div className="register-field">
              <label htmlFor="register-lastname" className="register-label">
                Apellido
              </label>
              <div className="register-input-wrapper">
                <User size={18} className="register-input-icon" />
                <input
                  id="register-lastname"
                  type="text"
                  name="lastName"
                  autoComplete="family-name"
                  placeholder="Mendoza"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  className="register-input"
                  required
                  disabled={isLoading}
                />
              </div>
            </div>
          </div>

          <div className="register-field">
            <label htmlFor="register-email" className="register-label">
              Correo Electrónico
            </label>
            <div className="register-input-wrapper">
              <Mail size={18} className="register-input-icon" />
              <input
                id="register-email"
                type="email"
                name="email"
                autoComplete="email"
                placeholder="ejemplo@correo.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="register-input"
                required
                disabled={isLoading}
              />
            </div>
          </div>

          <div className="register-field">
            <label htmlFor="register-phone" className="register-label">
              Número de Teléfono <span className="register-optional">(opcional)</span>
            </label>
            <div className="register-input-wrapper">
              <Phone size={18} className="register-input-icon" />
              <input
                id="register-phone"
                type="tel"
                name="phone"
                autoComplete="tel"
                placeholder="+51 987 654 321"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                className="register-input"
                disabled={isLoading}
              />
            </div>
          </div>

          {/* Fila Contraseñas en Grid */}
          <div className="register-grid-row">
            <div className="register-field">
              <label htmlFor="register-password" className="register-label">
                Contraseña
              </label>
              <div className="register-input-wrapper">
                <Lock size={18} className="register-input-icon" />
                <input
                  id="register-password"
                  type={showPassword ? "text" : "password"}
                  name="password"
                  autoComplete="new-password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="register-input has-toggle"
                  required
                  disabled={isLoading}
                />
                <button
                  type="button"
                  className="register-password-toggle"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? "Ocultar contraseña" : "Ver contraseña"}
                  tabIndex={0}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <div className="register-field">
              <label htmlFor="register-repeat-password" className="register-label">
                Confirmar Contraseña
              </label>
              <div className="register-input-wrapper">
                <Lock size={18} className="register-input-icon" />
                <input
                  id="register-repeat-password"
                  type={showRepeatPassword ? "text" : "password"}
                  name="repeatPassword"
                  autoComplete="new-password"
                  placeholder="••••••••"
                  value={repeatPassword}
                  onChange={(e) => setRepeatPassword(e.target.value)}
                  className="register-input has-toggle"
                  required
                  disabled={isLoading}
                />
                <button
                  type="button"
                  className="register-password-toggle"
                  onClick={() => setShowRepeatPassword(!showRepeatPassword)}
                  aria-label={showRepeatPassword ? "Ocultar contraseña" : "Ver contraseña"}
                  tabIndex={0}
                >
                  {showRepeatPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>
          </div>

          <button
            type="submit"
            className={`register-submit-btn ${isLoading ? "is-loading" : ""}`}
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 size={18} className="register-spinner" />
                <span>Creando cuenta bancaria...</span>
              </>
            ) : (
              <>
                <span>Registrarme en NeoBank</span>
                <ArrowRight size={18} className="register-btn-arrow" />
              </>
            )}
          </button>

          <div className="register-footer-nav">
            <span className="register-login-prompt">¿Ya dispones de una cuenta activa?</span>
            <Link to="/login" className="register-login-link">
              Inicia sesión aquí
            </Link>
          </div>
        </form>

        <div className="register-trust-badge">
          <ShieldCheck size={16} className="register-trust-icon" />
          <span>Protección de fondos & cifrado bancario institucional SSL 256-bit</span>
        </div>
      </main>
    </div>
  );
}
