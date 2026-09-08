import { useState, useEffect, useRef } from "react";
import { Bell, CheckCheck } from "lucide-react";
import axios from "axios";

export default function NotificationBell() {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showNotifications, setShowNotifications] = useState(false);
  const dropdownRef = useRef(null);

  const token = localStorage.getItem("token");

  useEffect(() => {
    if (!token) return;

    const fetchNotifications = async () => {
      try {
        const res = await axios.get("http://localhost:8080/api/notifications", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setNotifications(res.data || []);
        setUnreadCount((res.data || []).filter((n) => !n.read).length);
      } catch (err) {
        console.error("Error al obtener notificaciones:", err);
      }
    };

    fetchNotifications();
    const interval = setInterval(fetchNotifications, 10000);
    return () => clearInterval(interval);
  }, [token]);

  // Cerrar el dropdown al hacer clic fuera
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowNotifications(false);
      }
    };
    if (showNotifications) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [showNotifications]);

  const handleBellClick = () => {
    const nextState = !showNotifications;
    setShowNotifications(nextState);

    if (nextState && unreadCount > 0) {
      notifications.forEach((n) => {
        if (!n.read) {
          axios
            .patch(
              `http://localhost:8080/api/notifications/${n.id}/read`,
              {},
              { headers: { Authorization: `Bearer ${token}` } }
            )
            .catch((e) => console.error("Error al marcar como leída:", e));
        }
      });
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
      setUnreadCount(0);
    }
  };

  return (
    <div className="notification-container" ref={dropdownRef}>
      <button
        type="button"
        className="notification-wrapper"
        onClick={handleBellClick}
        aria-label={`Notificaciones ${unreadCount > 0 ? `(${unreadCount} no leídas)` : ""}`}
        aria-expanded={showNotifications}
      >
        <Bell className="notif-icon" size={20} />
        {unreadCount > 0 && (
          <span className="notif-badge">{unreadCount > 9 ? "9+" : unreadCount}</span>
        )}
      </button>

      {showNotifications && (
        <div className="notifications-dropdown" role="dialog" aria-label="Lista de notificaciones">
          <div className="notifications-header">
            <span className="notifications-title">Notificaciones</span>
            {unreadCount === 0 && (
              <span className="notifications-subtitle">
                <CheckCheck size={14} /> Al día
              </span>
            )}
          </div>

          <div className="notifications-list">
            {notifications.length === 0 ? (
              <div className="no-notifications">
                <p>No tienes notificaciones por el momento.</p>
              </div>
            ) : (
              notifications.map((n) => (
                <div
                  key={n.id}
                  className={`notification-item ${n.read ? "read" : "unread"}`}
                >
                  <div className="notification-content">
                    <p className="notification-message">{n.message}</p>
                    {n.timestamp && (
                      <span className="notification-time">
                        {new Date(n.timestamp).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                    )}
                  </div>
                  {!n.read && <span className="notification-unread-dot" />}
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
