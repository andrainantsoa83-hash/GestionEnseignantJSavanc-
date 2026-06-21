import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MdArrowBack, MdLocationCity, MdMap, MdSchool, MdPerson, MdWarning, MdPictureAsPdf, MdSearch } from 'react-icons/md';
import './Cisco.css';

const CiscoDetail = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');

  const ciscoData = {
    nom: 'CISCO Antananarivo Renivohitra',
    stats: {
      communes: 2,
      zap: 24,
      etablissements: 150,
      enseignants: 1650,
      besoinRecrutement: 60
    }
  };

  const communesStats = [
    { id: 1, nom: 'Commune Analakely', fonctionnaires: 600, contractuels: 300, framSub: 150, framNonSub: 100, autres: 50, totalEnseignants: 1200, besoinRecrutement: 45 },
    { id: 2, nom: 'Commune Isotry', fonctionnaires: 200, contractuels: 100, framSub: 80, framNonSub: 50, autres: 20, totalEnseignants: 450, besoinRecrutement: 15 }
  ];

  const filteredCommunes = communesStats
    .filter(c => c.nom.toLowerCase().includes(searchTerm.toLowerCase()))
    .sort((a, b) => a.nom.localeCompare(b.nom));

  return (
    <div className="page-container">
      <div className="page-header">
        <div className="header-title">
          <button className="btn-icon" onClick={() => navigate('/cisco')} title="Retour">
            <MdArrowBack size={24} />
          </button>
          <h2>Détail : {ciscoData.nom}</h2>
        </div>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon bg-green"><MdLocationCity size={24} /></div>
          <div className="stat-info">
            <span className="stat-value">{ciscoData.stats.communes}</span>
            <span className="stat-label">Communes</span>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon bg-yellow"><MdMap size={24} /></div>
          <div className="stat-info">
            <span className="stat-value">{ciscoData.stats.zap}</span>
            <span className="stat-label">ZAP</span>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon bg-purple"><MdSchool size={24} /></div>
          <div className="stat-info">
            <span className="stat-value">{ciscoData.stats.etablissements}</span>
            <span className="stat-label">Établissements</span>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon bg-indigo"><MdPerson size={24} /></div>
          <div className="stat-info">
            <span className="stat-value">{ciscoData.stats.enseignants}</span>
            <span className="stat-label">Total Enseignants</span>
          </div>
        </div>
        <div className="stat-card highlight">
          <div className="stat-icon bg-red"><MdWarning size={24} color="white" /></div>
          <div className="stat-info">
            <span className="stat-value text-red">{ciscoData.stats.besoinRecrutement}</span>
            <span className="stat-label">Besoin Recrutement</span>
          </div>
        </div>
      </div>

      <div className="summary-section mt-4">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '10px' }}>
          <h3>Rapport statistique des communes du Cisco</h3>
        </div>

        <div className="search-bar" style={{ marginBottom: '16px' }}>
          <MdSearch size={24} className="search-icon" />
          <input 
            type="text" 
            placeholder="Rechercher une commune..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="table-responsive">
          <table className="data-table">
            <thead>
              <tr>
                <th>Nom Commune</th>
                <th>Fonctionnaires</th>
                <th>Contractuels</th>
                <th>FRAM subventionnés</th>
                <th>FRAM non subventionnés</th>
                <th>Autres</th>
                <th>Total enseignants</th>
                <th>Besoin recrutement</th>
              </tr>
            </thead>
            <tbody>
              {filteredCommunes.map((c) => (
                <tr key={c.id}>
                  <td>{c.nom}</td>
                  <td>{c.fonctionnaires}</td>
                  <td>{c.contractuels}</td>
                  <td>{c.framSub}</td>
                  <td>{c.framNonSub}</td>
                  <td>{c.autres}</td>
                  <td><strong>{c.totalEnseignants}</strong></td>
                  <td><span className="text-red font-bold">{c.besoinRecrutement}</span></td>
                </tr>
              ))}
              {filteredCommunes.length === 0 && (
                <tr>
                  <td colSpan="8" className="text-center">Aucune commune trouvée.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        
        <div className="pagination">
          <button className="btn-page" disabled>&lt; Précédent</button>
          <span className="page-info">Page 1 sur 1</span>
          <button className="btn-page" disabled>Suivant &gt;</button>
        </div>
        
        <div style={{ marginTop: '20px', textAlign: 'center' }}>
          <button className="btn btn-primary" style={{ backgroundColor: '#475569', padding: '12px 24px', fontSize: '16px' }}>
            <MdPictureAsPdf size={24} style={{ marginRight: '8px' }} /> Générer le rapport PDF
          </button>
        </div>
      </div>
    </div>
  );
};

export default CiscoDetail;
