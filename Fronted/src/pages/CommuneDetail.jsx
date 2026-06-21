import { useNavigate } from 'react-router-dom';
import { MdArrowBack, MdLocationCity, MdSchool, MdPerson, MdWarning, MdMap, MdAssignment } from 'react-icons/md';

const CommuneDetail = () => {
  const navigate = useNavigate();

  const communeData = {
    nom: 'Commune Analakely',
    stats: {
      etablissements: 80,
      enseignants: 1200,
      zap: 5,
      besoinRecrutement: 45
    },
    zaps: [
      { id: 1, nom: 'ZAP Analakely Centre', etablissements: 15, enseignants: 300, besoin: 12 },
      { id: 2, nom: 'ZAP Analakely Nord', etablissements: 20, enseignants: 400, besoin: 18 }
    ]
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <div className="header-title">
          <button className="btn-icon" onClick={() => navigate('/commune')} title="Retour">
            <MdArrowBack size={24} />
          </button>
          <h2>Détail : {communeData.nom}</h2>
        </div>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon" style={{ backgroundColor: '#0ea5e9', color: 'white' }}><MdMap size={24} /></div>
          <div className="stat-info">
            <span className="stat-value">{communeData.stats.zap}</span>
            <span className="stat-label">Total ZAP</span>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{ backgroundColor: '#3b82f6', color: 'white' }}><MdSchool size={24} /></div>
          <div className="stat-info">
            <span className="stat-value">{communeData.stats.etablissements}</span>
            <span className="stat-label">Établissements</span>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon bg-green"><MdPerson size={24} /></div>
          <div className="stat-info">
            <span className="stat-value">{communeData.stats.enseignants}</span>
            <span className="stat-label">Total Enseignants</span>
          </div>
        </div>
        <div className="stat-card highlight">
          <div className="stat-icon bg-red"><MdWarning size={24} color="white" /></div>
          <div className="stat-info">
            <span className="stat-value text-red">{communeData.stats.besoinRecrutement}</span>
            <span className="stat-label">Besoin Recrutement</span>
          </div>
        </div>
      </div>

      <div className="summary-section mt-4">
        <h3>Rapport statistique des ZAP de la Commune</h3>
        <div className="table-responsive">
          <table className="data-table">
            <thead>
              <tr>
                <th>Nom ZAP</th>
                <th>Total Établissements</th>
                <th>Total Enseignants</th>
                <th>Besoin recrutement</th>
              </tr>
            </thead>
            <tbody>
              {communeData.zaps.map((z) => (
                <tr key={z.id}>
                  <td>{z.nom}</td>
                  <td>{z.etablissements}</td>
                  <td>{z.enseignants}</td>
                  <td><span className="text-red font-bold">{z.besoin}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default CommuneDetail;
