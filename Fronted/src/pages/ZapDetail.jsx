import { useNavigate } from 'react-router-dom';
import { MdArrowBack, MdSchool, MdPerson, MdWarning, MdPictureAsPdf, MdAssignment } from 'react-icons/md';

const ZapDetail = () => {
  const navigate = useNavigate();

  const zapData = {
    nom: 'ZAP Analakely',
    stats: {
      etablissements: 15,
      enseignants: 300,
      besoinRecrutement: 12
    },
    repartition: {
      fonctionnaires: 150,
      contractuels: 80,
      framSub: 40,
      framNonSub: 20,
      autres: 10
    },
    etablissements: [
      { id: 1, nom: 'EPP Analakely', enseignants: 40, f: 20, c: 10, fs: 5, fns: 3, a: 2, besoin: 2 },
      { id: 2, nom: 'CEG Analakely', enseignants: 60, f: 30, c: 15, fs: 8, fns: 5, a: 2, besoin: 3 },
    ]
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <div className="header-title">
          <button className="btn-icon" onClick={() => navigate('/zap')} title="Retour">
            <MdArrowBack size={24} />
          </button>
          <h2>Détail : {zapData.nom}</h2>
        </div>
        <button className="btn btn-primary" style={{ backgroundColor: '#475569' }}>
          <MdPictureAsPdf size={20} /> Télécharger rapport ZAP
        </button>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon bg-blue-light"><MdSchool size={24} /></div>
          <div className="stat-info">
            <span className="stat-value">{zapData.stats.etablissements}</span>
            <span className="stat-label">Établissements</span>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon bg-blue"><MdPerson size={24} /></div>
          <div className="stat-info">
            <span className="stat-value">{zapData.stats.enseignants}</span>
            <span className="stat-label">Total Enseignants</span>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon bg-green"><MdAssignment size={24} /></div>
          <div className="stat-info">
            <span className="stat-value">{zapData.repartition.fonctionnaires}</span>
            <span className="stat-label">Fonctionnaires</span>
          </div>
        </div>
        <div className="stat-card highlight">
          <div className="stat-icon bg-red"><MdWarning size={24} color="white" /></div>
          <div className="stat-info">
            <span className="stat-value text-red">{zapData.stats.besoinRecrutement}</span>
            <span className="stat-label">Besoin Recrutement</span>
          </div>
        </div>
      </div>

      <div className="summary-section mt-4">
        <h3>Établissements</h3>
        <div className="table-responsive">
          <table className="data-table">
            <thead>
              <tr>
                <th>Nom établissement</th>
                <th>Total enseignants</th>
                <th>Fonct.</th>
                <th>Contract.</th>
                <th>FRAM sub</th>
                <th>FRAM non sub</th>
                <th>Autres</th>
                <th>Besoin</th>
              </tr>
            </thead>
            <tbody>
              {zapData.etablissements.map(etab => (
                <tr key={etab.id}>
                  <td>{etab.nom}</td>
                  <td>{etab.enseignants}</td>
                  <td>{etab.f}</td>
                  <td>{etab.c}</td>
                  <td>{etab.fs}</td>
                  <td>{etab.fns}</td>
                  <td>{etab.a}</td>
                  <td><span className="text-red">{etab.besoin}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ZapDetail;
