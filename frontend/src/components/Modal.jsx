import React, { useEffect } from "react";
import { X } from "lucide-react";

export default function Modal({
  isOpen,
  onClose,
  title,
  subtitle,
  icon: Icon,
  children,
  footer,
  maxWidth = "520px",
}) {
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    if (isOpen) {
      document.body.style.overflow = "hidden";
      window.addEventListener("keydown", handleKeyDown);
    }
    return () => {
      document.body.style.overflow = "unset";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="shared-modal-overlay"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
    >
      <div
        className="shared-modal-container"
        style={{ maxWidth }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="shared-modal-header">
          <div className="shared-modal-header-left">
            {Icon && (
              <div className="shared-modal-icon-wrap">
                <Icon size={20} className="shared-modal-icon" />
              </div>
            )}
            <div>
              {title && <h3 className="shared-modal-title">{title}</h3>}
              {subtitle && <p className="shared-modal-subtitle">{subtitle}</p>}
            </div>
          </div>
          <button
            type="button"
            className="shared-modal-close-btn"
            onClick={onClose}
            aria-label="Cerrar modal"
          >
            <X size={18} />
          </button>
        </div>

        <div className="shared-modal-body">{children}</div>

        {footer && <div className="shared-modal-footer">{footer}</div>}
      </div>
    </div>
  );
}
