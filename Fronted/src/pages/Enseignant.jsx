import { useState } from 'react';
import { MdSearch, MdAdd, MdEdit, MdDelete, MdClose, MdPerson, MdWarning, MdAssignment } from 'react-icons/md';
import './Cisco.css';
import './Enseignant.css';

const Enseignant = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Pour les menus déroulants du modal uniquement
  const listCisco = ['CISCO 1', 'CISCO 2'];
  const listCommune = ['Commune A', 'Commune B'];
  const listZap = ['ZAP 1', 'ZAP 2'];
  const listEtab = ['EPP', 'CEG'];

  const [enseignants, setEnseignants] = useState([
    { id: 1, nom: 'Rakoto', prenom: 'Jean', matiere: 'Mathématiques', statut: 'Fonctionnaire', etablissement: 'EPP Analakely' },
    { id: 2, nom: 'Rasoa', prenom: 'Marie', matiere: 'Français', statut: 'Contractuel', etablissement: 'CEG Isotry' },
    { id: 3, nom: 'Rajaona', prenom: 'Paul', matiere: 'Physique', statut: 'FRAM sub', etablissement: 'CEG Isotry' },
  ]);

  const filtered = enseignants.filter(e => 
    e.nom.toLowerCase().includes(searchTerm.toLowerCase()) || 
    e.prenom.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleDelete = (id) => {
    if(window.confirm('Voulez-vous vraiment supprimer cet enseignant ?')) {
      setEnseignants(enseignants.filter(e => e.id !== id));
    }
  };

  const total = enseignants.length;
  const statuts = {
    fonctionnaires: enseignants.filter(e => e.statut === 'Fonctionnaire').length,
    contractuels: enseignants.filter(e => e.statut === 'Contractuel').length,
    framSub: enseignants.filter(e => e.statut === 'FRAM sub').length,
    framNonSub: enseignants.filter(e => e.statut === 'FRAM non sub').length,
  };
  const besoin = statuts.contractuels + statuts.framSub + statuts.framNonSub;

  return (
    <div className="page-container">
      <div className="page-header">
        <h2>Gestion des Enseignants</h2>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button className="btn btn-secondary">
            Importer Excel
          </button>
          <button className="btn btn-primary" onClick={() => setIsModalOpen(true)}>
            <MdAdd size={20} /> Ajouter Enseignant
          </button>
        </div>
      </div>

      <div className="stats-grid mb-4">
        <div className="stat-card">
          <div className="stat-icon bg-indigo"><MdPerson size={24} /></div>
          <div className="stat-info">
            <span className="stat-value">{total}</span>
            <span className="stat-label">Total Général</span>
          </div>
        </div>
        <div className="stat-card highlight">
          <div className="stat-icon bg-red"><MdWarning size={24} color="white" /></div>
          <div className="stat-info">
            <span className="stat-value text-red">{besoin}</span>
            <span className="stat-label">Besoin Recrutement</span>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon bg-blue"><MdAssignment size={24} /></div>
          <div className="stat-info">
            <span className="stat-value">{statuts.fonctionnaires}</span>
            <span className="stat-label">Fonctionnaires</span>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon bg-green"><MdAssignment size={24} /></div>
          <div className="stat-info">
            <span className="stat-value">{statuts.contractuels}</span>
            <span className="stat-label">Contractuels</span>
          </div>
        </div>
      </div>

      <div className="search-bar">
        <MdSearch size={24} className="search-icon" />
        <input 
          type="text" 
          placeholder="Rechercher par nom ou prénom..." 
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <div className="table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>Nom</th>
              <th>Prénom</th>
              <th>Matière</th>
              <th>Statut</th>
              <th>Établissement</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((item) => (
              <tr key={item.id}>
                <td>{item.nom}</td>
                <td>{item.prenom}</td>
                <td>{item.matiere}</td>
                <td>{item.statut}</td>
                <td>{item.etablissement}</td>
                <td>
                  <div className="actions">
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
              <h3>Ajouter Enseignant</h3>
              <button className="btn-close" onClick={() => setIsModalOpen(false)}>
                <MdClose size={24} />
              </button>
            </div>
            <div className="modal-body">
              <div className="form-group">
                <label>Nom</label>
                <input type="text" className="form-control" />
              </div>
              <div className="form-group">
                <label>Statut</label>
                <select className="form-control">
                  <option>Fonctionnaire</option>
                  <option>Contractuel</option>
                </select>
              </div>
              <div className="form-group">
                <label>Affectation - Cisco</label>
                <select className="form-control">
                  {listCisco.map((c, i) => <option key={i}>{c}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label>Affectation - Commune</label>
                <select className="form-control">
                  {listCommune.map((c, i) => <option key={i}>{c}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label>Affectation - ZAP</label>
                <select className="form-control">
                  {listZap.map((c, i) => <option key={i}>{c}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label>Affectation - Établissement</label>
                <select className="form-control">
                  {listEtab.map((c, i) => <option key={i}>{c}</option>)}
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
    </div>
  );
};

export default Enseignant;
