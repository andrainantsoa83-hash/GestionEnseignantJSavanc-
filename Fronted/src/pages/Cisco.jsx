import { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { MdSearch, MdAdd, MdVisibility, MdEdit, MdDelete } from 'react-icons/md';
import './Cisco.css';

const Cisco = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [ciscos, setCiscos] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCiscos = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/cisco');
        if (response.data.success) {
          setCiscos(response.data.data || []);
        }
      } catch (error) {
        console.error("Erreur lors de la récupération des CISCO:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchCiscos();
  }, []);

  const filteredCiscos = ciscos.filter(c => 
    (c.nom && c.nom.toLowerCase().includes(searchTerm.toLowerCase())) || 
    (c.code && c.code.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  if (loading) {
    return <div className="page-container"><div className="loading">Chargement des CISCO...</div></div>;
  }

  return (
    <div className="page-container">
      <div className="page-header">
        <h2>Gestion des CISCO</h2>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button className="btn btn-secondary">
            Importer Excel
          </button>
          <button className="btn btn-primary">
            <MdAdd size={20} /> Nouveau Cisco
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
              <th>Code Cisco</th>
              <th>Nom Cisco</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredCiscos.map((cisco) => (
              <tr key={cisco.id}>
                <td>{cisco.code}</td>
                <td>{cisco.nom}</td>
                <td>
                  <div className="actions">
                    <button 
                      className="btn-action view" 
                      onClick={() => navigate(`/cisco/${cisco.id}`)}
                      title="Voir"
                    >
                      <MdVisibility />
                    </button>
                    <button className="btn-action edit" title="Modifier">
                      <MdEdit />
                    </button>
                    <button className="btn-action delete" title="Supprimer">
                      <MdDelete />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {filteredCiscos.length === 0 && (
              <tr>
                <td colSpan="3" className="text-center">Aucun Cisco trouvé.</td>
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

export default Cisco;
