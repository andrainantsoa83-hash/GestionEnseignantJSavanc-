import { useState } from 'react';
import { MdSearch, MdAdd, MdEdit, MdDelete, MdClose, MdVisibility, MdPerson, MdWarning, MdAssignment } from 'react-icons/md';
import './Cisco.css';

const Etablissement = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCommune, setFilterCommune] = useState('');
  const [filterZap, setFilterZap] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [selectedEtab, setSelectedEtab] = useState(null);

  const communes = ['Commune A', 'Commune B'];
  const zaps = ['ZAP 1', 'ZAP 2'];

  const [etablissements, setEtablissements] = useState([
    { 
      id: 1, 
      code: 'ETAB001',
      nom: 'EPP Analakely', 
      type: 'EPP',
      zap_id: 'ZAP 1', 
      commune_id: 'Commune A', 
      cisco_id: 'CISCO 1',
      totalEnseignants: 18,
      fonctionnaires: 10, 
      contractuels: 5, 
      framSub: 2, 
      framNonSub: 1, 
      autres: 0,
      besoinRecrutement: 8
    },
    { 
      id: 2, 
      code: 'ETAB002',
      nom: 'CEG Isotry', 
      type: 'CEG',
      zap_id: 'ZAP 2', 
      commune_id: 'Commune B', 
      cisco_id: 'CISCO 1',
      totalEnseignants: 38,
      fonctionnaires: 20, 
      contractuels: 10, 
      framSub: 5, 
      framNonSub: 2, 
      autres: 1,
      besoinRecrutement: 18
    }
  ]);

  const filtered = etablissements.filter(e => {
    const matchNom = e.nom.toLowerCase().includes(searchTerm.toLowerCase());
    const matchCommune = filterCommune === '' || e.commune_id === filterCommune;
    const matchZap = filterZap === '' || e.zap_id === filterZap;
    return matchNom && matchCommune && matchZap;
  });

  const handleDelete = (id) => {
    if(window.confirm('Supprimer cet établissement ?')) {
      setEtablissements(etablissements.filter(e => e.id !== id));
    }
  };

  const handleVoir = (etab) => {
    setSelectedEtab(etab);
    setDetailModalOpen(true);
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <h2>Gestion des Établissements</h2>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button className="btn btn-secondary">
            Importer Excel
          </button>
          <button className="btn btn-primary" onClick={() => setIsModalOpen(true)}>
            <MdAdd size={20} /> Ajouter École
          </button>
        </div>
      </div>

      <div className="filters-container" style={{ display: 'flex', gap: '16px', marginBottom: '16px' }}>
        <div className="search-bar" style={{ flex: 1, margin: 0 }}>
          <MdSearch size={24} className="search-icon" />
          <input 
            type="text" 
            placeholder="Rechercher par nom..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <select className="form-control" value={filterCommune} onChange={e => setFilterCommune(e.target.value)}>
          <option value="">Toutes les Communes</option>
          {communes.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
        <select className="form-control" value={filterZap} onChange={e => setFilterZap(e.target.value)}>
          <option value="">Toutes les ZAP</option>
          {zaps.map(z => <option key={z} value={z}>{z}</option>)}
        </select>
      </div>

      <div className="table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>Code</th>
              <th>Nom</th>
              <th>Type</th>
              <th>Total Ens.</th>
              <th>Fonct.</th>
              <th>Contract.</th>
              <th>FRAM Sub</th>
              <th>FRAM Non Sub</th>
              <th>Autres</th>
              <th>Besoin</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.slice(0, 5).map((item) => (
              <tr key={item.id}>
                <td>{item.code}</td>
                <td>{item.nom}</td>
                <td>{item.type}</td>
                <td>{item.totalEnseignants}</td>
                <td>{item.fonctionnaires}</td>
                <td>{item.contractuels}</td>
                <td>{item.framSub}</td>
                <td>{item.framNonSub}</td>
                <td>{item.autres}</td>
                <td><span className="text-red">{item.besoinRecrutement}</span></td>
                <td>
                  <div className="actions">
                    <button className="btn-action view" title="Voir détails" onClick={() => handleVoir(item)}>
                      <MdVisibility />
                    </button>
                    <button className="btn-action edit" title="Modifier">
                      <MdEdit />
                    </button>
                    <button className="btn-action delete" title="Supprimer" onClick={() => handleDelete(item.id)}>
                      <MdDelete />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3>Ajouter / Modifier École</h3>
              <button className="btn-close" onClick={() => setIsModalOpen(false)}>
                <MdClose size={24} />
              </button>
            </div>
            <div className="modal-body">
              <div className="form-group">
                <label>Code</label>
                <input type="text" className="form-control" />
              </div>
              <div className="form-group">
                <label>Nom de l'école</label>
                <input type="text" className="form-control" />
              </div>
              <div className="form-group">
                <label>Type</label>
                <select className="form-control">
                  <option>EPP</option>
                  <option>CEG</option>
                  <option>Lycée</option>
                </select>
              </div>
              <div className="form-group">
                <label>Cisco</label>
                <select className="form-control">
                  <option>CISCO 1</option>
                </select>
              </div>
              <div className="form-group">
                <label>Commune</label>
                <select className="form-control">
                  {communes.map(c => <option key={c}>{c}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label>ZAP</label>
                <select className="form-control">
                  {zaps.map(z => <option key={z}>{z}</option>)}
                </select>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setIsModalOpen(false)}>Annuler</button>
              <button className="btn btn-primary" onClick={() => setIsModalOpen(false)}>Enregistrer</button>
            </div>
          </div>
        </div>
      )}

      {detailModalOpen && selectedEtab && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '800px' }}>
            <div className="modal-header">
              <h3>Statistiques : {selectedEtab.nom}</h3>
              <button className="btn-close" onClick={() => setDetailModalOpen(false)}>
                <MdClose size={24} />
              </button>
            </div>
            <div className="modal-body" style={{ background: '#f8fafc' }}>
              <div className="stats-grid">
                <div className="stat-card">
                  <div className="stat-icon bg-indigo"><MdPerson size={24} /></div>
                  <div className="stat-info">
                    <span className="stat-value">{selectedEtab.totalEnseignants}</span>
                    <span className="stat-label">Total Enseignants</span>
                  </div>
                </div>
                <div className="stat-card highlight">
                  <div className="stat-icon bg-red"><MdWarning size={24} color="white" /></div>
                  <div className="stat-info">
                    <span className="stat-value text-red">{selectedEtab.besoinRecrutement}</span>
                    <span className="stat-label">Besoin Recrutement</span>
                  </div>
                </div>
              </div>
              <div className="stats-grid mt-4">
                <div className="stat-card">
                  <div className="stat-icon bg-blue"><MdAssignment size={24} /></div>
                  <div className="stat-info">
                    <span className="stat-value">{selectedEtab.fonctionnaires}</span>
                    <span className="stat-label">Fonctionnaires</span>
                  </div>
                </div>
                <div className="stat-card">
                  <div className="stat-icon bg-green"><MdAssignment size={24} /></div>
                  <div className="stat-info">
                    <span className="stat-value">{selectedEtab.contractuels}</span>
                    <span className="stat-label">Contractuels</span>
                  </div>
                </div>
                <div className="stat-card">
                  <div className="stat-icon bg-yellow"><MdAssignment size={24} /></div>
                  <div className="stat-info">
                    <span className="stat-value">{selectedEtab.framSub}</span>
                    <span className="stat-label">FRAM sub</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="pagination">
        <button className="btn-page" disabled>&lt; Précédent</button>
        <span className="page-info">Page 1 sur 1</span>
        <button className="btn-page" disabled>Suivant &gt;</button>
      </div>
    </div>
  );
};

export default Etablissement;
