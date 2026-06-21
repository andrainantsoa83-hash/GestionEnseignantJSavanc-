import { useState } from 'react';
import { MdSearch, MdAdd, MdEdit, MdDelete, MdClose, MdSecurity } from 'react-icons/md';
import './Cisco.css';

const Utilisateur = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);

  const roles = [
    'DIRECTEUR_DREN',
    'CHEF_SERVICE_PROGRAMMATION',
    'CHEF_ADMINISTRATION',
    'AGENT_STATISTIQUE'
  ];

  const ciscos = ['CISCO 1', 'CISCO 2'];

  const [utilisateurs, setUtilisateurs] = useState([
    { id: 1, nom: 'Admin DREN', codeService: 'DIR-01', role: 'DIRECTEUR_DREN', cisco_id: 'N/A' },
    { id: 2, nom: 'Jean Dupont', codeService: 'PROG-05', role: 'CHEF_SERVICE_PROGRAMMATION', cisco_id: 'N/A' },
    { id: 3, nom: 'Agent Cisco', codeService: 'STAT-12', role: 'AGENT_STATISTIQUE', cisco_id: 'CISCO 1' }
  ]);

  const filtered = utilisateurs.filter(u => 
    u.nom.toLowerCase().includes(searchTerm.toLowerCase()) || 
    u.codeService.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleDelete = (id) => {
    if(window.confirm('Révoquer définitivement l\'accès de cet utilisateur ?')) {
      setUtilisateurs(utilisateurs.filter(u => u.id !== id));
    }
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <MdSecurity size={32} color="#3b82f6" />
          <h2>Historique & Accès</h2>
        </div>
        <button className="btn btn-primary" onClick={() => setIsModalOpen(true)}>
          <MdAdd size={20} /> Ajouter Utilisateur
        </button>
      </div>

      <div className="search-bar">
        <MdSearch size={24} className="search-icon" />
        <input 
          type="text" 
          placeholder="Rechercher par nom ou code service..." 
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <div className="table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>Nom</th>
              <th>Code Service</th>
              <th>Rôle</th>
              <th>Cisco de rattachement</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((item) => (
              <tr key={item.id}>
                <td>{item.nom}</td>
                <td>{item.codeService}</td>
                <td>
                  <span className="statut-item" style={{ backgroundColor: '#eff6ff', color: '#1e40af', padding: '4px 8px', borderRadius: '4px', fontSize: '12px', fontWeight: 'bold' }}>
                    {item.role}
                  </span>
                </td>
                <td>{item.cisco_id}</td>
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
              <h3>Ajouter / Modifier Utilisateur</h3>
              <button className="btn-close" onClick={() => setIsModalOpen(false)}>
                <MdClose size={24} />
              </button>
            </div>
            <div className="modal-body">
              <div className="form-group">
                <label>Nom complet</label>
                <input type="text" className="form-control" placeholder="Ex: Rakoto Jean" />
              </div>
              <div className="form-group">
                <label>Code Service</label>
                <input type="text" className="form-control" placeholder="Ex: SERV-01" />
              </div>
              <div className="form-group">
                <label>Mot de passe</label>
                <input type="password" className="form-control" placeholder="Sera crypté en base de données" />
              </div>
              <div className="form-group">
                <label>Rôle (Autorisations)</label>
                <select className="form-control">
                  <option value="">Sélectionner le rôle strict...</option>
                  {roles.map(r => <option key={r} value={r}>{r}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label>Cisco de rattachement (Optionnel)</label>
                <select className="form-control">
                  <option value="">Aucun (Accès global)</option>
                  {ciscos.map(c => <option key={c} value={c}>{c}</option>)}
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

export default Utilisateur;
