import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import axios from "axios";
import Sidebar from "./Sidebar";
import NotificationBell from "./NotificationBell";
import "./Dashboard.css";
import "./Account.css";
import "./LightMode.css";

export default function EditProfile() {
  const navigate = useNavigate();

  const [darkMode, setDarkMode] = useState(true);

  const [user, setUser] = useState({
    firstName: "Carlos",
    lastName: "Mendoza",
    email: "carlos.mendoza@ejemplo.com",
    password: "mySecret123",
    phoneNumber: "+51 987 654 321",
    address: "Av. Javier Prado Este 2465, San Borja",
    city: "Lima",
    postalCode: "15036",
    country: "Perú",
  });

  useEffect(() => {
    const saved = localStorage.getItem("theme");
    if (saved === "light") setDarkMode(false);
  }, []);

  useEffect(() => {
    localStorage.setItem("theme", darkMode ? "dark" : "light");
  }, [darkMode]);

  useEffect(() => {
    const fetchUser = async () => {
      const token = localStorage.getItem("token");
      if (!token) return;

      try {
        const res = await axios.get("http://localhost:8080/api/auth/me", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setUser(res.data);
      } catch (err) {
        console.error("Failed to fetch user data:", err);
      }
    };

    fetchUser();
  }, []);

  const handleChange = (e) => {
    setUser({ ...user, [e.target.name]: e.target.value });
  };

  const handleSave = async () => {
    const token = localStorage.getItem("token");
    if (!token) return;

    try {
      const res = await axios.put("http://localhost:8080/api/auth/me", user, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      localStorage.setItem("user", JSON.stringify(res.data));
      navigate("/account");
    } catch (err) {
      console.error("Error updating profile:", err);
      alert("No se pudo actualizar el perfil. Por favor intenta de nuevo.");
    }
  };

  return (
    <div className={`dashboard ${darkMode ? "" : "light-mode"}`}>
      <Sidebar active="account" />

      <div className="main">
        <header className="header">
          <div className="header-right">
            <NotificationBell />
          </div>
        </header>

        <main className="content">
          <div className="content-box account-container">
            <h1 className="account-title">Editar Perfil</h1>

            <div className="account-card">
              {(() => {
                const fieldPlaceholders = {
                  firstName: "Carlos",
                  lastName: "Mendoza",
                  email: "carlos.mendoza@ejemplo.com",
                  password: "••••••••",
                  phoneNumber: "+51 987 654 321",
                  address: "Av. Javier Prado Este 2465, San Borja",
                  city: "Lima",
                  postalCode: "15036",
                  country: "Perú",
                };
                return [
                  { label: "Nombre", key: "firstName" },
                  { label: "Apellido", key: "lastName" },
                  { label: "Correo Electrónico", key: "email" },
                  { label: "Contraseña", key: "password" },
                  { label: "Número de Teléfono", key: "phoneNumber" },
                  { label: "Dirección", key: "address" },
                  { label: "Ciudad", key: "city" },
                  { label: "Código Postal", key: "postalCode" },
                  { label: "País", key: "country" },
                ].map((field) => (
                  <div className="account-field" key={field.key}>
                    <label>{field.label}:</label>
                    <input
                      type={field.key === "password" ? "password" : "text"}
                      name={field.key}
                      value={user[field.key] || ""}
                      onChange={handleChange}
                      placeholder={fieldPlaceholders[field.key] || ""}
                      className="edit-input"
                      required={["firstName", "lastName", "email", "password"].includes(field.key)}
                    />
                  </div>
                ));
              })()}

              <div className="form-actions">
                <button className="edit-btn" onClick={handleSave}>
                  Guardar Cambios
                </button>
                <button
                  className="cancel-btn"
                  onClick={() => navigate("/account")}
                  type="button"
                >
                  Cancelar
                </button>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
