import React, { useEffect } from "react";
import Sidebar from "./Sidebar";
import ClientHeader from "./ClientHeader";
import { getTheme, applyThemeToDOM } from "./themeManager";
import "./Dashboard.css";
import "./LightMode.css";

export default function ClientLayout({
  children,
  active,
  title,
  subtitle,
  actions,
  className = "",
  contentBox = true,
}) {
  useEffect(() => {
    // Asegurar que el tema esté aplicado al montar
    applyThemeToDOM(getTheme());
  }, []);

  return (
    <div className="client-layout-root">
      <Sidebar active={active} />
      <div className="client-layout-main">
        <ClientHeader title={title} subtitle={subtitle} actions={actions} />
        <main className="client-layout-scroll-area">
          <div className={contentBox ? `client-content-box ${className}` : className}>
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
