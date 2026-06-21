import { useState, useEffect } from 'react';
import axios from 'axios';
import { MdSearch, MdAdd } from 'react-icons/md';
import './Cisco.css';

const Commune = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [communes, setCommunes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCommunes = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/commune');
        if (response.data.success) {
          setCommunes(response.data.data || []);
        }
      } catch (error) {
        console.error("Erreur lors de la récupération des Communes:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchCommunes();
  }, []);

  const filtered = communes.filter(c => 
    c.nom && c.nom.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return <div className="page-container"><div className="loading">Chargement des communes...</div></div>;
  }

  return (
    <div className="page-container">
      <div className="page-header">
        <h2>Gestion des Communes</h2>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button className="btn btn-secondary">
            Importer Excel
          </button>
          <button className="btn btn-primary">
            <MdAdd size={20} /> Nouvelle Commune
          </button>
        </div>
      </div>

      <div className="search-bar">
        <MdSearch size={24} className="search-icon" />
        <input 
          type="text" 
          placeholder="Rechercher par nom de commune..." 
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <div className="table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>Commune</th>
              <th>Total Établissements</th>
              <th>Total ZAP</th>
              <th>Total Enseignants</th>
              <th>Fonctionnaires</th>
              <th>Contractuels</th>
              <th>FRAM sub</th>
              <th>FRAM non sub</th>
              <th>Autres</th>
              <th>Besoin</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((item) => (
              <tr key={item.id}>
                <td>{item.nom}</td>
                <td>{item.totalEtablissements}</td>
                <td>{item.totalZap}</td>
                <td>{item.totalEnseignants}</td>
                <td>{item.fonctionnaires}</td>
                <td>{item.contractuels}</td>
                <td>{item.framSub}</td>
                <td>{item.framNonSub}</td>
                <td>{item.autres}</td>
                <td><span className="text-red">{item.besoinRecrutement}</span></td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan="10" className="text-center">Aucune commune trouvée.</td>
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
    </div>
  );
};

export default Commune;
