// src/components/SelectableTable.jsx
import React from 'react';
import '../styles/design-system.css';

/**
 * Props :
 *  - columns : Array<{ key, label, align?, render? }>
 *  - data : Array<object>
 *  - keyField : string - clé unique (ex: 'id')
 *  - selectedIds : Array - IDs sélectionnés
 *  - onToggleSelect : func (id) - toggle sélection
 *  - onSelectAll : func (ids) - sélectionner tout
 *  - maxHeight : string - hauteur max (défaut: '500px')
 */
export default function SelectableTable({ 
  columns, 
  data, 
  keyField = 'id',
  selectedIds = [],
  onToggleSelect,
  onSelectAll,
  maxHeight = '500px'
}) {
  const allSelected = data.length > 0 && data.every(item => selectedIds.includes(item[keyField]));
  const someSelected = data.length > 0 && data.some(item => selectedIds.includes(item[keyField]));

  const handleSelectAll = () => {
    if (onSelectAll) {
      onSelectAll(allSelected ? [] : data.map(item => item[keyField]));
    }
  };

  return (
    <div style={{ maxHeight, overflowY: 'auto' }}>
      <table className="stock-table">
        <thead>
          <tr>
            <th style={{ width: '40px' }}>
              <input
                type="checkbox"
                checked={allSelected}
                ref={input => {
                  if (input) input.indeterminate = someSelected && !allSelected;
                }}
                onChange={handleSelectAll}
                style={{ width: '18px', height: '18px', cursor: 'pointer' }}
              />
            </th>
            {columns.map(col => (
              <th 
                key={col.key} 
                className={col.align === 'right' ? 'col-right' : col.align === 'center' ? 'col-center' : ''}
              >
                {col.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.length === 0 ? (
            <tr>
              <td colSpan={columns.length + 1} style={{ textAlign: 'center', padding: '32px', color: 'var(--color-text-secondary)' }}>
                Aucune donnée disponible
              </td>
            </tr>
          ) : (
            data.map(item => (
              <tr 
                key={item[keyField]} 
                onClick={() => onToggleSelect?.(item[keyField])}
                style={{ cursor: 'pointer' }}
              >
                <td onClick={(e) => e.stopPropagation()}>
                  <input
                    type="checkbox"
                    checked={selectedIds.includes(item[keyField])}
                    onChange={() => onToggleSelect?.(item[keyField])}
                    style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                  />
                </td>
                {columns.map(col => (
                  <td 
                    key={col.key}
                    className={[
                      col.type === 'code' ? 'col-code' : '',
                      col.align === 'right' ? 'col-right' : col.align === 'center' ? 'col-center' : ''
                    ].filter(Boolean).join(' ')}
                  >
                    {col.render ? col.render(item) : item[col.key]}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}