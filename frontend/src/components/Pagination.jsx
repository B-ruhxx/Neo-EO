import React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

/**
 * Componente Reutilizable de Paginación para Tablas y Listados
 * Previene el desbordamiento vertical y el scroll infinito hacia abajo.
 */
export default function Pagination({
  currentPage = 1,
  totalItems = 0,
  pageSize = 6,
  onPageChange,
  className = "",
  itemLabel = "elementos",
  alwaysShow = false,
}) {
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const startIndex = totalItems > 0 ? (currentPage - 1) * pageSize + 1 : 0;
  const endIndex = Math.min(currentPage * pageSize, totalItems);

  // Si no hay elementos o solo hay 1 página y no se fuerza mostrar, podemos ocultar los botones
  if (totalItems === 0 || (totalPages <= 1 && !alwaysShow)) {
    return null;
  }

  // Generación de ventana numérica inteligente con elipsis
  const getPageNumbers = () => {
    if (totalPages <= 7) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }

    if (currentPage <= 4) {
      return [1, 2, 3, 4, 5, "...", totalPages];
    }

    if (currentPage >= totalPages - 3) {
      return [
        1,
        "...",
        totalPages - 4,
        totalPages - 3,
        totalPages - 2,
        totalPages - 1,
        totalPages,
      ];
    }

    return [
      1,
      "...",
      currentPage - 1,
      currentPage,
      currentPage + 1,
      "...",
      totalPages,
    ];
  };

  const pages = getPageNumbers();

  return (
    <div className={`app-pagination ${className}`} role="navigation" aria-label="Paginación">
      <div className="pagination-info">
        Mostrando{" "}
        <span className="pagination-highlight">
          {startIndex} - {endIndex}
        </span>{" "}
        de <span className="pagination-highlight">{totalItems}</span> {itemLabel}
      </div>

      <div className="pagination-controls">
        <button
          type="button"
          className="pagination-btn nav-prev"
          onClick={() => onPageChange(Math.max(1, currentPage - 1))}
          disabled={currentPage <= 1}
          aria-label="Página anterior"
        >
          <ChevronLeft size={16} />
        </button>

        {pages.map((p, idx) => {
          if (p === "...") {
            return (
              <span key={`ellipsis-${idx}`} className="pagination-ellipsis">
                …
              </span>
            );
          }

          const isCurrent = currentPage === p;
          return (
            <button
              key={`page-${p}`}
              type="button"
              className={`pagination-btn ${isCurrent ? "active" : ""}`}
              onClick={() => onPageChange(p)}
              aria-label={`Ir a página ${p}`}
              aria-current={isCurrent ? "page" : undefined}
            >
              {p}
            </button>
          );
        })}

        <button
          type="button"
          className="pagination-btn nav-next"
          onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
          disabled={currentPage >= totalPages}
          aria-label="Página siguiente"
        >
          <ChevronRight size={16} />
        </button>
      </div>
    </div>
  );
}
