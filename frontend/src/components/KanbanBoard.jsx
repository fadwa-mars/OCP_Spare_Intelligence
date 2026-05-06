// src/components/KanbanBoard.jsx
import React, { useState } from 'react';
import '../styles/design-system.css';

/**
 * Props :
 *  - columns : Array<{ id, title, color, items: Array<{ id, title, content, metadata }> }>
 *  - onDragEnd : func (itemId, sourceCol, targetCol) - appelé après drag & drop
 *  - onEditItem : func (item) - ouvre modal de modification
 *  - onDeleteItem : func (item) - ouvre confirm dialog puis suppression
 *  - onViewDetails : func (item) - ouvre modal de visualisation (optionnel)
 *  - showAddButton : bool - affiche bouton "+" dans chaque colonne
 *  - onAddItem : func (colId) - ouvre modal de création
 */
export default function KanbanBoard({
  columns: initialColumns,
  onDragEnd,
  onEditItem,
  onDeleteItem,
  onViewDetails,
  showAddButton = false,
  onAddItem,
}) {
  const [columns, setColumns] = useState(initialColumns);
  const [draggedItem, setDraggedItem] = useState(null);

  // Drag & Drop
  const handleDragStart = (e, item, colId) => {
    setDraggedItem({ item, sourceCol: colId });
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', '');
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e, targetColId) => {
    e.preventDefault();
    if (!draggedItem) return;

    const { item, sourceCol } = draggedItem;

    // Mise à jour locale
    const newColumns = columns.map((col) => {
      if (col.id === sourceCol) {
        return { ...col, items: col.items.filter((i) => i.id !== item.id) };
      }
      if (col.id === targetColId) {
        return { ...col, items: [...col.items, { ...item, status: targetColId }] };
      }
      return col;
    });

    setColumns(newColumns);
    onDragEnd?.(item.id, sourceCol, targetColId);
    setDraggedItem(null);
  };

  // Gestionnaires d'événements
  const handleCardClick = (item) => {
    if (onViewDetails) {
      onViewDetails(item);
    }
  };

  const handleEditClick = (e, item) => {
    e.stopPropagation();
    onEditItem?.(item);
  };

  const handleDeleteClick = (e, item) => {
    e.stopPropagation();
    onDeleteItem?.(item);
  };

  return (
    <div className="kanban-wrapper">
      <div className="kanban-board">
        {columns.map((col) => (
          <div
            key={col.id}
            className="kanban-col"
            onDragOver={handleDragOver}
            onDrop={(e) => handleDrop(e, col.id)}
          >
            {/* En-tête de colonne */}
            <div className="kanban-col-header" style={{ borderColor: col.color }}>
              <div className="kanban-col-header-left">
                <h3>{col.title}</h3>
                <span className="kanban-count">{col.items.length}</span>
              </div>
              {showAddButton && (
                <button
                  className="kanban-col-add"
                  onClick={() => onAddItem?.(col.id)}
                  aria-label="Ajouter une carte"
                  title="Ajouter"
                >
                  <span className="material-symbols-outlined">add</span>
                </button>
              )}
            </div>

            {/* Liste des cartes */}
            <div className="kanban-items">
              {col.items.length === 0 ? (
                <div className="kanban-empty">
                  <span className="material-symbols-outlined">inbox</span>
                  <p>Aucun élément</p>
                </div>
              ) : (
                col.items.map((item) => (
                  <div
                    key={item.id}
                    className="kanban-card"
                    draggable
                    onDragStart={(e) => handleDragStart(e, item, col.id)}
                  >
                    <div className="kanban-card-header">
                      <div
                        className="kanban-card-title"
                        onClick={() => handleCardClick(item)}
                        title="Cliquer pour voir les détails"
                      >
                        {item.title}
                      </div>
                      <div className="kanban-card-actions">
                        <button
                          className="kanban-card-btn kanban-card-edit"
                          onClick={(e) => handleEditClick(e, item)}
                          aria-label="Modifier"
                          title="Modifier"
                        >
                          <span className="material-symbols-outlined">edit</span>
                        </button>
                        <button
                          className="kanban-card-btn kanban-card-delete"
                          onClick={(e) => handleDeleteClick(e, item)}
                          aria-label="Supprimer"
                          title="Supprimer"
                        >
                          <span className="material-symbols-outlined">delete</span>
                        </button>
                      </div>
                    </div>

                    <div
                      className="kanban-card-content"
                      onClick={() => handleCardClick(item)}
                    >
                      {item.content}
                    </div>

                    {item.metadata && Object.keys(item.metadata).length > 0 && (
                      <div className="kanban-card-meta">
                        {Object.entries(item.metadata).map(([key, val]) => (
                          <span key={key} className="kanban-meta-tag">
                            <span className="meta-key">{key}:</span> {val}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}