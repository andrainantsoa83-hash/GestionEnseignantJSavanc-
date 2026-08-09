import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import { MdArrowBack, MdLocationCity, MdMap, MdSchool, MdPerson, MdWarning, MdPictureAsPdf, MdSearch } from 'react-icons/md';
import './Cisco.css';

const CiscoDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  
  const [cisco, setCisco] = useState(null);
  const [stats, setStats] = useState(null);
  const [communesStats, setCommunesStats] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAllData = async () => {
      try {
        setLoading(true);
        // 1. Infos du Cisco
        const resCisco = await axios.get(`https://gestionenseignantjsavanc.onrender.com/api/ciscos/${id}`);
        if (resCisco.data.success) {
          setCisco(resCisco.data.data);
        }

        // 2. Résumé Global du Cisco (Communes, ZAP, Etablissements, Enseignants)
        const resResume = await axios.get(`https://gestionenseignantjsavanc.onrender.com/api/ciscos/${id}/resume`);
        
        // 3. Besoin de recrutement total du Cisco
        const resBesoin = await axios.get(`https://gestionenseignantjsavanc.onrender.com/api/ciscos/recrutement/${id}`);
        
        setStats({
          communes: resResume.data?.data?.total_communes || 0,
          zap: resResume.data?.data?.total_zaps || 0,
          etablissements: resResume.data?.data?.total_etablissements || 0,
          enseignants: resResume.data?.data?.total_enseignants || 0,
          besoinRecrutement: resBesoin.data?.data?.besoin_recrutement || 0
        });

        // 4. Statistiques des communes du Cisco
        const resCommunesStats = await axios.get(`https://gestionenseignantjsavanc.onrender.com/api/stats/cisco-commune/${id}`);
        if (resCommunesStats.data && resCommunesStats.data.communes) {
          setCommunesStats(resCommunesStats.data.communes);
        }
      } catch (error) {
        console.error("Erreur de récupération des détails:", error);
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchAllData();
  }, [id]);

  const handleDownloadPDF = async () => {
    try {
      // Ouvre l'URL du PDF dans un nouvel onglet, le navigateur gérera le téléchargement
      window.open(`https://gestionenseignantjsavanc.onrender.com/api/report/cisco/${id}/pdf`, '_blank');
    } catch (error) {
      console.error("Erreur lors du téléchargement du PDF:", error);
      alert("Erreur lors de la génération du rapport PDF.");
    }
  };

  const filteredCommunes = communesStats
    .filter(c => (c.nom_commune || '').toLowerCase().includes(searchTerm.toLowerCase()))
    .sort((a, b) => (a.nom_commune || '').localeCompare(b.nom_commune || ''));

  if (loading) {
    return <div className="page-container"><div className="loading">Chargement des détails du CISCO...</div></div>;
  }

  return (
    <div className="page-container">
      <div className="page-header">
        <div className="header-title">
          <button className="btn-icon" onClick={() => navigate('/cisco')} title="Retour">
            <MdArrowBack size={24} />
          </button>
          <h2>Détail : {cisco?.nom_cisco || cisco?.nom || 'CISCO Inconnu'}</h2>
        </div>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon bg-green"><MdLocationCity size={24} /></div>
          <div className="stat-info">
            <span className="stat-value">{stats?.communes}</span>
            <span className="stat-label">Communes</span>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon bg-yellow"><MdMap size={24} /></div>
          <div className="stat-info">
            <span className="stat-value">{stats?.zap}</span>
            <span className="stat-label">ZAP</span>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon bg-purple"><MdSchool size={24} /></div>
          <div className="stat-info">
            <span className="stat-value">{stats?.etablissements}</span>
            <span className="stat-label">Établissements</span>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon bg-indigo"><MdPerson size={24} /></div>
          <div className="stat-info">
            <span className="stat-value">{stats?.enseignants}</span>
            <span className="stat-label">Total Enseignants</span>
          </div>
        </div>
        <div className="stat-card highlight">
          <div className="stat-icon bg-red"><MdWarning size={24} color="white" /></div>
          <div className="stat-info">
            <span className="stat-value text-red">{stats?.besoinRecrutement}</span>
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
              {filteredCommunes.map((c, idx) => (
                <tr key={idx}>
                  <td>{c.nom_commune}</td>
                  <td>{c.fonctionnaire || 0}</td>
                  <td>{c.contractuel || 0}</td>
                  <td>{c.fram_sub || 0}</td>
                  <td>{c.fram_non_sub || 0}</td>
                  <td>{c.autres || 0}</td>
                  <td><strong>{c.total || 0}</strong></td>
                  <td><span className="text-red font-bold">{c.besoin_recrutement || 0}</span></td>
                </tr>
              ))}
              {filteredCommunes.length === 0 && (
                <tr>
                  <td colSpan="8" className="text-center">Aucune commune trouvée pour ce CISCO.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        
        <div style={{ marginTop: '30px', textAlign: 'center' }}>
          <button 
            className="btn btn-primary" 
            onClick={handleDownloadPDF}
            style={{ backgroundColor: '#1e293b', padding: '12px 24px', fontSize: '16px', display: 'inline-flex', alignItems: 'center' }}
          >
            <MdPictureAsPdf size={24} style={{ marginRight: '8px' }} /> Télécharger le rapport PDF
          </button>
        </div>
      </div>
    </div>
  );
};

export default CiscoDetail;
