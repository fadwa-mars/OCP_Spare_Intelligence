// src/pages/admin/Logs.jsx
import React, { useState } from 'react';
import PageLayout from '../../components/PageLayout';
import DataTable from '../../components/DataTable';
import Modal from '../../components/Modal';
import { Field, SelectField, FormButton } from '../../components/FormCard';
import { NAV_LINKS_BY_ROLE } from '../../constants/navLinks';
import '../../styles/design-system.css';

// Données mockées des logs
const LOGS_DATA = [
  { id: 1, date: '15/05/2024 08:30', user: 'Karim Mansouri', role: 'magasinier', action: 'Création', module: 'Stock', details: 'Ajout article SAP-10492', ip: '192.168.1.45', statut: 'Succès' },
  { id: 2, date: '15/05/2024 09:15', user: 'Amina Benali', role: 'acheteur', action: 'Modification', module: 'Commandes', details: 'Modification commande CMD-2024-001', ip: '192.168.1.23', statut: 'Succès' },
  { id: 3, date: '15/05/2024 09:45', user: 'Youssef El Fassi', role: 'pi', action: 'Suppression', module: 'Stock', details: 'Suppression alerte SAP-09211', ip: '192.168.1.67', statut: 'Succès' },
  { id: 4, date: '15/05/2024 10:00', user: 'Sara Admin', role: 'admin', action: 'Connexion', module: 'Auth', details: 'Connexion depuis nouvel appareil', ip: '192.168.1.89', statut: 'Succès' },
  { id: 5, date: '15/05/2024 10:30', user: 'Ali Fournisseur', role: 'fournisseur', action: 'Tentative', module: 'Offres', details: 'Tentative de soumission sans droits', ip: '192.168.1.12', statut: 'Échec' },
  { id: 6, date: '14/05/2024 14:20', user: 'Karim Mansouri', role: 'magasinier', action: 'Export', module: 'Stock', details: 'Export liste stock Excel', ip: '192.168.1.45', statut: 'Succès' },
  { id: 7, date: '14/05/2024 16:30', user: 'Mohammed Tazi', role: 'magasinier', action: 'Modification', module: 'Stock', details: 'Modification quantité SAP-28571', ip: '192.168.1.78', statut: 'Succès' },
  { id: 8, date: '13/05/2024 11:45', user: 'Fatima Zahra', role: 'acheteur', action: 'Création', module: 'Appels offres', details: 'Création AO-2024-008', ip: '192.168.1.34', statut: 'Succès' },
  { id: 9, date: '13/05/2024 09:00', user: 'Ali Fournisseur', role: 'fournisseur', action: 'Connexion', module: 'Auth', details: 'Connexion échouée (mot de passe)', ip: '192.168.1.12', statut: 'Échec' },
  { id: 10, date: '12/05/2024 15:20', user: 'Sara Admin', role: 'admin', action: 'Configuration', module: 'Admin', details: 'Modification permissions rôle acheteur', ip: '192.168.1.89', statut: 'Succès' },
  { id: 11, date: '12/05/2024 10:00', user: 'Youssef El Fassi', role: 'pi', action: 'Création', module: 'Seuils', details: 'Modification seuil SAP-44820', ip: '192.168.1.67', statut: 'Succès' },
  { id: 12, date: '11/05/2024 08:45', user: 'Amina Benali', role: 'acheteur', action: 'Validation', module: 'Demandes', details: 'Validation demande DA-2024-009', ip: '192.168.1.23', statut: 'Succès' },
];

const USERS = ['Tous', 'Karim Mansouri', 'Amina Benali', 'Youssef El Fassi', 'Sara Admin', 'Ali Fournisseur', 'Mohammed Tazi', 'Fatima Zahra'];
const ACTIONS = ['Toutes', 'Connexion', 'Création', 'Modification', 'Suppression', 'Export', 'Validation', 'Configuration', 'Tentative'];
const MODULES_LIST = ['Tous', 'Stock', 'Commandes', 'Auth', 'Offres', 'Appels offres', 'Admin', 'Seuils', 'Demandes'];

const COLUMNS = [
  { key: 'date', label: 'Date / Heure', type: 'text', align: 'left' },
  { key: 'user', label: 'Utilisateur', type: 'text', align: 'left' },
  { key: 'role', label: 'Rôle', type: 'badge', align: 'center' },
  { key: 'action', label: 'Action', type: 'badge', align: 'center' },
  { key: 'module', label: 'Module', type: 'badge', align: 'center' },
  { key: 'details', label: 'Détails', type: 'text', align: 'left', muted: true },
  { key: 'statut', label: 'Statut', type: 'badge', align: 'center' },
  { key: 'expand', label: '', type: 'action', align: 'center' },
];

const getRoleBadgeClass = (role) => {
  const map = { admin: 'badge--optimal', acheteur: 'badge--warning', magasinier: 'badge--info', pi: 'badge--info', fournisseur: 'badge--critical' };
  return map[role] || 'badge--info';
};

const getRoleLabel = (role) => {
  const map = { admin: 'Admin', acheteur: 'Acheteur', magasinier: 'Magasinier', pi: 'PI', fournisseur: 'Fournisseur' };
  return map[role] || role;
};

const getActionBadgeClass = (action) => {
  const map = { Connexion: 'badge--info', Création: 'badge--optimal', Modification: 'badge--warning', Suppression: 'badge--critical', Export: 'badge--info', Validation: 'badge--optimal', Configuration: 'badge--warning', Tentative: 'badge--critical' };
  return map[action] || 'badge--info';
};

const getModuleBadgeClass = (module) => {
  const map = { Stock: 'badge--optimal', Commandes: 'badge--warning', Auth: 'badge--info', Offres: 'badge--warning', 'Appels offres': 'badge--warning', Admin: 'badge--optimal', Seuils: 'badge--info', Demandes: 'badge--warning' };
  return map[module] || 'badge--info';
};

const getStatutBadgeClass = (statut) => {
  return statut === 'Succès' ? 'badge--optimal' : 'badge--critical';
};

export default function Logs() {
  const [activeNav, setActiveNav] = useState('Logs');
  const [search, setSearch] = useState('');
  const [filterUser, setFilterUser] = useState('Tous');
  const [filterAction, setFilterAction] = useState('Toutes');
  const [filterModule, setFilterModule] = useState('Tous');
  const [dateStart, setDateStart] = useState('');
  const [dateEnd, setDateEnd] = useState('');
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [selectedLog, setSelectedLog] = useState(null);

  // Filtrage des logs
  const filteredLogs = LOGS_DATA.filter(log => {
    let match = true;
    
    if (filterUser !== 'Tous' && log.user !== filterUser) match = false;
    if (filterAction !== 'Toutes' && log.action !== filterAction) match = false;
    if (filterModule !== 'Tous' && log.module !== filterModule) match = false;
    if (dateStart && log.date.split(' ')[0] < dateStart) match = false;
    if (dateEnd && log.date.split(' ')[0] > dateEnd) match = false;
    if (search && !log.details.toLowerCase().includes(search.toLowerCase()) && !log.user.toLowerCase().includes(search.toLowerCase())) match = false;
    
    return match;
  });

  const handleViewDetails = (row) => {
    setSelectedLog(row);
    setDetailModalOpen(true);
  };

  const handleExport = () => {
    console.log('Export logs Excel', filteredLogs);
    alert(`Export de ${filteredLogs.length} logs vers Excel`);
  };

  const handleResetFilters = () => {
    setFilterUser('Tous');
    setFilterAction('Toutes');
    setFilterModule('Tous');
    setDateStart('');
    setDateEnd('');
    setSearch('');
  };

  return (
    <PageLayout
      navLinks={NAV_LINKS_BY_ROLE.admin}
      activeNav={activeNav}
      onNavChange={setActiveNav}
      hero={{
        title: 'Logs système',
        subtitle: 'Consultez l\'historique complet des actions utilisateurs',
        ctaLabel: 'EXPORTER',
        ctaIcon: 'download',
        onCta: handleExport,
      }}
    >
      {/* Filtres */}
      <div className="logs-filters glass-card">
        <div className="logs-filters-row">
          <SelectField
            id="filterUser"
            label="Utilisateur"
            value={filterUser}
            onChange={(e) => setFilterUser(e.target.value)}
            options={USERS.map(u => ({ value: u, label: u }))}
          />
          <SelectField
            id="filterAction"
            label="Action"
            value={filterAction}
            onChange={(e) => setFilterAction(e.target.value)}
            options={ACTIONS.map(a => ({ value: a, label: a }))}
          />
          <SelectField
            id="filterModule"
            label="Module"
            value={filterModule}
            onChange={(e) => setFilterModule(e.target.value)}
            options={MODULES_LIST.map(m => ({ value: m, label: m }))}
          />
        </div>
        <div className="logs-filters-row">
          <Field
            id="dateStart"
            label="Date début"
            type="date"
            value={dateStart}
            onChange={(e) => setDateStart(e.target.value)}
          />
          <Field
            id="dateEnd"
            label="Date fin"
            type="date"
            value={dateEnd}
            onChange={(e) => setDateEnd(e.target.value)}
          />
          <div className="logs-filters-actions">
            <button className="export-btn" onClick={handleResetFilters}>RÉINITIALISER</button>
          </div>
        </div>
      </div>

      {/* Tableau des logs */}
      <div style={{ marginTop: 'var(--space-large)' }}>
        <DataTable
          columns={COLUMNS.map(col => ({
            ...col,
            render: col.key === 'role' ? (row) => (
              <span className={`badge ${getRoleBadgeClass(row.role)}`}>{getRoleLabel(row.role)}</span>
            ) : col.key === 'action' ? (row) => (
              <span className={`badge ${getActionBadgeClass(row.action)}`}>{row.action}</span>
            ) : col.key === 'module' ? (row) => (
              <span className={`badge ${getModuleBadgeClass(row.module)}`}>{row.module}</span>
            ) : col.key === 'statut' ? (row) => (
              <span className={`badge ${getStatutBadgeClass(row.statut)}`}>{row.statut}</span>
            ) : col.key === 'expand' ? (row) => (
              <button 
                className="row-action" 
                onClick={() => handleViewDetails(row)}
                style={{ opacity: 1 }}
              >
                <span className="material-symbols-outlined">visibility</span>
              </button>
            ) : undefined
          }))}
          data={filteredLogs}
          keyField="id"
          searchValue={search}
          onSearchChange={setSearch}
          searchPlaceholder="Rechercher par utilisateur ou détail..."
          totalCount={filteredLogs.length}
          pageSize={10}
        />
      </div>

      {/* Modal détails expandable */}
      <Modal
        isOpen={detailModalOpen}
        onClose={() => setDetailModalOpen(false)}
        title="Détails de l'action"
        size="md"
        actions={
          <FormButton label="FERMER" variant="secondary" onClick={() => setDetailModalOpen(false)} />
        }
      >
        {selectedLog && (
          <div className="log-details">
            <div className="log-detail-row">
              <div className="log-detail-label">Date / Heure</div>
              <div className="log-detail-value">{selectedLog.date}</div>
            </div>
            <div className="log-detail-row">
              <div className="log-detail-label">Utilisateur</div>
              <div className="log-detail-value">{selectedLog.user}</div>
            </div>
            <div className="log-detail-row">
              <div className="log-detail-label">Rôle</div>
              <div className="log-detail-value">{getRoleLabel(selectedLog.role)}</div>
            </div>
            <div className="log-detail-row">
              <div className="log-detail-label">Action</div>
              <div className="log-detail-value">
                <span className={`badge ${getActionBadgeClass(selectedLog.action)}`}>{selectedLog.action}</span>
              </div>
            </div>
            <div className="log-detail-row">
              <div className="log-detail-label">Module</div>
              <div className="log-detail-value">
                <span className={`badge ${getModuleBadgeClass(selectedLog.module)}`}>{selectedLog.module}</span>
              </div>
            </div>
            <div className="log-detail-row">
              <div className="log-detail-label">Détails</div>
              <div className="log-detail-value">{selectedLog.details}</div>
            </div>
            <div className="log-detail-row">
              <div className="log-detail-label">Adresse IP</div>
              <div className="log-detail-value">{selectedLog.ip}</div>
            </div>
            <div className="log-detail-row">
              <div className="log-detail-label">Statut</div>
              <div className="log-detail-value">
                <span className={`badge ${getStatutBadgeClass(selectedLog.statut)}`}>{selectedLog.statut}</span>
              </div>
            </div>
          </div>
        )}
      </Modal>
    </PageLayout>
  );
}