import React from "react";

export default function DynamicMountainsBg({ className = "" }) {
  return (
    <div className={`sidebar-mountains-container ${className}`} aria-hidden="true">
      <svg
        className="sidebar-mountains-svg"
        viewBox="0 0 320 300"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        preserveAspectRatio="xMidYMax slice"
      >
        <defs>
          {/* Resplandor ambiental atmosférico etéreo */}
          <radialGradient id="topoAmbientGlow" cx="50%" cy="30%" r="65%">
            <stop offset="0%" stopColor="var(--mtn-glow-1, #0ea5e9)" stopOpacity="0.22" />
            <stop offset="40%" stopColor="var(--mtn-glow-2, #0284c7)" stopOpacity="0.10" />
            <stop offset="75%" stopColor="var(--mtn-base-color, #07090e)" stopOpacity="0.02" />
            <stop offset="100%" stopColor="var(--mtn-base-color, #07090e)" stopOpacity="0" />
          </radialGradient>

          {/* Gradientes profundos para las capas topográficas */}
          <linearGradient id="waveLayer1Grad" x1="0" y1="40" x2="320" y2="300" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="var(--mtn-layer-1-start, #0c1626)" stopOpacity="0.85" />
            <stop offset="50%" stopColor="var(--mtn-layer-1-mid, #080e1a)" stopOpacity="0.95" />
            <stop offset="100%" stopColor="var(--mtn-base-color, #07090e)" stopOpacity="1" />
          </linearGradient>

          <linearGradient id="waveLayer2Grad" x1="0" y1="90" x2="320" y2="300" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="var(--mtn-layer-2-start, #0e1d33)" stopOpacity="0.9" />
            <stop offset="60%" stopColor="var(--mtn-layer-2-mid, #091222)" stopOpacity="0.98" />
            <stop offset="100%" stopColor="var(--mtn-base-color, #07090e)" stopOpacity="1" />
          </linearGradient>

          <linearGradient id="waveLayer3Grad" x1="0" y1="140" x2="320" y2="300" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="var(--mtn-layer-3-start, #13243d)" stopOpacity="0.95" />
            <stop offset="100%" stopColor="var(--mtn-base-color, #07090e)" stopOpacity="1" />
          </linearGradient>

          <linearGradient id="waveLayerFrontGrad" x1="0" y1="190" x2="320" y2="300" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="var(--mtn-layer-front-start, #162c4a)" stopOpacity="0.9" />
            <stop offset="100%" stopColor="var(--mtn-base-color, #07090e)" stopOpacity="1" />
          </linearGradient>

          {/* Resplandor lineal en las aristas de las crestas */}
          <linearGradient id="crestGlowCyan" x1="0" y1="0" x2="320" y2="0" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="var(--mtn-crest-cyan-start, #0284c7)" stopOpacity="0.1" />
            <stop offset="35%" stopColor="var(--mtn-crest-cyan-mid, #38bdf8)" stopOpacity="0.65" />
            <stop offset="70%" stopColor="#06b6d4" stopOpacity="0.45" />
            <stop offset="100%" stopColor="var(--mtn-crest-cyan-mid, #38bdf8)" stopOpacity="0.1" />
          </linearGradient>

          <linearGradient id="crestGlowEmerald" x1="0" y1="0" x2="320" y2="0" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#059669" stopOpacity="0.1" />
            <stop offset="50%" stopColor="var(--mtn-crest-emerald, #10b981)" stopOpacity="0.45" />
            <stop offset="100%" stopColor="#06b6d4" stopOpacity="0.15" />
          </linearGradient>

          {/* Niebla inferior para fusión perfecta con el footer */}
          <linearGradient id="bottomFadeGrad" x1="0" y1="200" x2="0" y2="300" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="var(--mtn-fade-bottom, #07090e)" stopOpacity="0" />
            <stop offset="75%" stopColor="var(--mtn-fade-bottom, #07090e)" stopOpacity="0.88" />
            <stop offset="100%" stopColor="var(--mtn-fade-bottom, #07090e)" stopOpacity="1" />
          </linearGradient>
        </defs>

        {/* Halo atmosférico dinámico */}
        <ellipse cx="160" cy="110" rx="150" ry="100" fill="url(#topoAmbientGlow)" className="mountain-aura" />

        {/* Capa 1: Cresta de fondo alta y suave */}
        <g className="wave-stratum-back">
          <path
            d="M-20 120 C 40 70, 110 85, 170 110 C 230 135, 280 90, 340 100 L 340 300 L -20 300 Z"
            fill="url(#waveLayer1Grad)"
          />
          <path
            d="M-20 120 C 40 70, 110 85, 170 110 C 230 135, 280 90, 340 100"
            stroke="url(#crestGlowCyan)"
            strokeWidth="1.25"
            strokeLinecap="round"
          />
        </g>

        {/* Capa 2: Ondas topográficas intermedias */}
        <g className="wave-stratum-mid">
          <path
            d="M-20 165 C 50 125, 130 170, 200 135 C 260 105, 300 145, 340 130 L 340 300 L -20 300 Z"
            fill="url(#waveLayer2Grad)"
          />
          <path
            d="M-20 165 C 50 125, 130 170, 200 135 C 260 105, 300 145, 340 130"
            stroke="var(--mtn-stroke-subtle, rgba(255, 255, 255, 0.12))"
            strokeWidth="0.85"
            strokeLinecap="round"
          />
        </g>

        {/* Capa 3: Relieve orgánico con resplandor verde/cyan */}
        <g className="wave-stratum-front">
          <path
            d="M-20 205 C 45 170, 105 180, 165 210 C 225 240, 275 175, 340 185 L 340 300 L -20 300 Z"
            fill="url(#waveLayer3Grad)"
          />
          <path
            d="M-20 205 C 45 170, 105 180, 165 210 C 225 240, 275 175, 340 185"
            stroke="url(#crestGlowEmerald)"
            strokeWidth="1.2"
            strokeLinecap="round"
          />
        </g>

        {/* Capa 4: Estrato inferior geométrico suave */}
        <g className="wave-stratum-base">
          <path
            d="M-20 240 C 70 215, 150 245, 220 220 C 270 200, 310 230, 340 225 L 340 300 L -20 300 Z"
            fill="url(#waveLayerFrontGrad)"
          />
          <path
            d="M-20 240 C 70 215, 150 245, 220 220 C 270 200, 310 230, 340 225"
            stroke="var(--mtn-stroke-cyan, rgba(56, 189, 248, 0.3))"
            strokeWidth="1"
            strokeLinecap="round"
          />
        </g>

        {/* Niebla inferior suave para acoplar al perfil de usuario */}
        <rect x="0" y="210" width="320" height="90" fill="url(#bottomFadeGrad)" />
      </svg>
    </div>
  );
}
