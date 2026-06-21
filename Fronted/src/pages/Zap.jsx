import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MdSearch, MdAdd, MdVisibility } from 'react-icons/md';
import './Cisco.css';

const Zap = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');

  const zaps = [
    { 
      id: 1, 
      code: 'ZAP01', 
      nom: 'ZAP Analakely', 
      totalEtablissements: 15,
      totalEnseignants: 300, 
      fonctionnaires: 150, 
      contractuels: 80, 
      framSub: 40, 
      framNonSub: 20, 
      autres: 10, 
      besoinRecrutement: 12 
    },
    { 
      id: 2, 
      code: 'ZAP02', 
      nom: 'ZAP Isotry', 
      totalEtablissements: 20,
      totalEnseignants: 400, 
      fonctionnaires: 200, 
      contractuels: 100, 
      framSub: 50, 
      framNonSub: 30, 
      autres: 20, 
      besoinRecrutement: 18 
    }
  ];

  const filtered = zaps.filter(c => 
    c.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.code.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="page-container">
      <div className="page-header">
        <h2>Gestion des ZAP</h2>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button className="btn btn-secondary">
            Importer Excel
          </button>
          <button className="btn btn-primary">
            <MdAdd size={20} /> Nouvelle ZAP
          </button>
        </div>
      </div>

      <div className="search-bar">
        <MdSearch size={24} className="search-icon" />
        <input 
          type="text" 
          placeholder="Rechercher par nom ou code..." 
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <div className="table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>Code ZAP</th>
              <th>Nom ZAP</th>
              <th>Total Établissements</th>
              <th>Total Enseignants</th>
              <th>Fonctionnaires</th>
              <th>Contractuels</th>
              <th>FRAM sub</th>
              <th>FRAM non sub</th>
              <th>Autres</th>
              <th>Besoin</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((item) => (
              <tr key={item.id}>
                <td>{item.code}</td>
                <td>{item.nom}</td>
                <td>{item.totalEtablissements}</td>
                <td>{item.totalEnseignants}</td>
                <td>{item.fonctionnaires}</td>
                <td>{item.contractuels}</td>
                <td>{item.framSub}</td>
                <td>{item.framNonSub}</td>
                <td>{item.autres}</td>
                <td><span className="text-red">{item.besoinRecrutement}</span></td>
                <td>
                  <button 
                    className="btn-action view" 
                    onClick={() => navigate(`/zap/${item.id}`)}
                    title="Voir"
                  >
                    <MdVisibility />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="pagination">
        <button className="btn-page" disabled>&lt; Précédent</button>
        <span className="page-info">Page 1 sur 1</span>
        <button className="btn-page" disabled>Suivant &gt;</button>
      </div>
    </div>
  );
};

export default Zap;
