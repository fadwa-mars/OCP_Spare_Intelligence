// src/components/DataTable.jsx
import React, { useState } from 'react';
import '../styles/design-system.css';

// ─── Helpers ──────────────────────────────────────────────────────────────────
function getQtyClass(qty, seuil) {
  if (qty === 0)   return 'qty-critical';
  if (qty < seuil) return 'qty-warning';
  return 'qty-optimal';
}

function getBadgeClass(etat) {
  const map = {
    Optimal:  'badge--optimal',
    Faible:   'badge--warning',
    Critique: 'badge--critical',
  };
  return map[etat] || 'badge--optimal';
}

// ─── Composant ────────────────────────────────────────────────────────────────
/**
 * Props :
 *  - columns : Array<{ key, label, align?, type? }>
 *      · key    : clé dans l'objet de données
 *      · label  : texte de l'en-tête
 *      · align  : 'left' | 'right' | 'center'  (défaut: 'left')
 *      · type   : 'text' | 'qty' | 'badge'  (défaut: 'text')
 *      · seuil  : clé de l'objet utilisée comme seuil (pour type='qty')
 *
 *  - data    : Array<object>  — tableau de données
 *  - keyField: string         — clé unique pour chaque ligne (ex: 'code')
 *
 *  - searchValue    : string  — valeur de recherche (contrôlé depuis parent)
 *  - onSearchChange : func    — callback(value)
 *  - searchPlaceholder : string
 *
 *  - totalCount : number  — total global pour la pagination
 *  - pageSize   : number  — lignes par page (défaut: 10)
 *
 *  - onExport   : func    — callback bouton export (optionnel)
 *  - onRowClick : func    — callback au clic sur une ligne (optionnel)
 */
export default function DataTable({
  columns       = [],
  data          = [],
  keyField      = 'id',
  searchValue   = '',
  onSearchChange,
  searchPlaceholder = 'Rechercher...',
  totalCount,
  pageSize      = 10,
  onExport,
  onRowClick,
}) {
  const [page, setPage] = useState(1);

  const total     = totalCount ?? data.length;
  const pageCount = Math.max(1, Math.ceil(total / pageSize));

  // ─── Rendu d'une cellule selon son type ───────────────────────────────────
  function renderCell(col, row) {
    const value = row[col.key];

    switch (col.type) {
      case 'qty':
        return (
          <span className={getQtyClass(value, row[col.seuil])}>
            {value}
          </span>
        );

      case 'badge':
        return (
          <span className={`badge ${getBadgeClass(value)}`}>
            {value}
          </span>
        );

      default:
        return value;
    }
  }

  // ─── Alignement ───────────────────────────────────────────────────────────
  function alignClass(align) {
    if (align === 'right')  return 'col-right';
    if (align === 'center') return 'col-center';
    return '';
  }

  // ─── Pages affichées ──────────────────────────────────────────────────────
  const visiblePages = [1, 2, 3].filter((p) => p <= pageCount);
  const showEllipsis = pageCount > 4;
  const showLast     = pageCount > 3;

  return (
    <>
      {/* Toolbar */}
      <div className="table-toolbar">
        <div className="search-wrapper">
          <span className="material-symbols-outlined">search</span>
          <input
            className="search-input"
            type="text"
            placeholder={searchPlaceholder}
            value={searchValue}
            onChange={(e) => {
              onSearchChange?.(e.target.value);
              setPage(1);
            }}
          />
        </div>

        {onExport && (
          <button className="export-btn" onClick={onExport}>
            <span className="material-symbols-outlined">download</span>
            EXPORTER EN EXCEL
          </button>
        )}
      </div>

      {/* Table */}
      <div className="glass-card">
        <div style={{ overflowX: 'auto' }}>
          <table className="stock-table">
            <thead>
              <tr>
                {columns.map((col) => (
                  <th key={col.key} className={alignClass(col.align)}>
                    {col.label}
                  </th>
                ))}
              </tr>
            </thead>

            <tbody>
              {data.length === 0 ? (
                <tr>
                  <td
                    colSpan={columns.length}
                    style={{
                      textAlign: 'center',
                      color: 'var(--color-text-secondary)',
                      padding: '32px',
                    }}
                  >
                    Aucun résultat trouvé.
                  </td>
                </tr>
              ) : (
                data.map((row) => (
                  <tr 
                    key={row[keyField]} 
                    onClick={() => onRowClick?.(row)}
                    style={{ cursor: onRowClick ? 'pointer' : 'default' }}
                  >
                    {columns.map((col) => (
                      <td
                        key={col.key}
                        className={[
                          alignClass(col.align),
                          col.type === 'code' ? 'col-code' : '',
                        ]
                          .filter(Boolean)
                          .join(' ')}
                        style={
                          col.muted
                            ? { color: 'var(--color-text-secondary)' }
                            : {}
                        }
                      >
                        {renderCell(col, row)}
                      </td>
                    ))}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="pagination">
          <span className="pagination__info">
            Affichage de {Math.min((page - 1) * pageSize + 1, total)} à{' '}
            {Math.min(page * pageSize, total)} sur {total}
          </span>

          <div className="pagination__controls">
            <button
              className="page-btn"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
            >
              <span className="material-symbols-outlined" style={{ fontSize: 18 }}>
                chevron_left
              </span>
            </button>

            {visiblePages.map((p) => (
              <button
                key={p}
                className={`page-btn ${page === p ? 'page-btn--active' : ''}`}
                onClick={() => setPage(p)}
              >
                {p}
              </button>
            ))}

            {showEllipsis && (
              <span className="pagination__dots">...</span>
            )}

            {showLast && (
              <button
                className={`page-btn ${page === pageCount ? 'page-btn--active' : ''}`}
                onClick={() => setPage(pageCount)}
              >
                {pageCount}
              </button>
            )}

            <button
              className="page-btn"
              onClick={() => setPage((p) => Math.min(pageCount, p + 1))}
              disabled={page === pageCount}
            >
              <span className="material-symbols-outlined" style={{ fontSize: 18 }}>
                chevron_right
              </span>
            </button>
          </div>
        </div>
      </div>
    </>
  );
}