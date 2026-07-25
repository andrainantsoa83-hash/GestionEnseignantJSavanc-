import { useState, useEffect } from 'react';
import axios from 'axios';
import { MdSearch, MdHistory } from 'react-icons/md';
import './Cisco.css';

const Historique = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        const token = localStorage.getItem('token');
        const config = { headers: { Authorization: `Bearer ${token}` } };
        // Si l'auth n'est pas encore stricte dans le backend, on appelle simplement l'API
        const res = await axios.get('http://localhost:3000/api/utilisateurs/logs', config);
        if (res.data.success) {
          setLogs(res.data.data || []);
        }
      } catch (error) {
        console.error("Erreur de récupération des logs", error);
      } finally {
        setLoading(false);
      }
    };
    fetchLogs();
  }, []);

  const filteredLogs = logs.filter(log => 
    (log.user_nom && log.user_nom.toLowerCase().includes(searchTerm.toLowerCase())) || 
    (log.action && log.action.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  if (loading) return <div className="page-container"><div className="loading">Chargement de l'historique...</div></div>;

  return (
    <div className="page-container">
      <div className="page-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <MdHistory size={32} color="#1e293b" />
          <h2>Journal d'Activité (Historique)</h2>
        </div>
      </div>

      <div className="search-bar">
        <MdSearch size={24} className="search-icon" />
        <input 
          type="text" 
          placeholder="Rechercher par nom d'utilisateur ou action..." 
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <div className="table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>Date et Heure</th>
              <th>Utilisateur</th>
              <th>Action Effectuée</th>
              <th>Adresse IP</th>
            </tr>
          </thead>
          <tbody>
            {filteredLogs.map((log) => (
              <tr key={log.id}>
                <td>{new Date(log.timestamp).toLocaleString('fr-FR')}</td>
                <td>{log.user_nom || 'Système'}</td>
                <td>
                  <span style={{ 
                    backgroundColor: log.action.includes('Connexion') ? '#dcfce7' : '#f1f5f9', 
                    color: log.action.includes('Connexion') ? '#166534' : '#1e293b', 
                    padding: '4px 8px', 
                    borderRadius: '4px', 
                    fontSize: '13px', 
                    fontWeight: 'bold' 
                  }}>
                    {log.action}
                  </span>
                </td>
                <td>{log.ip_address || '127.0.0.1'}</td>
              </tr>
            ))}
            {filteredLogs.length === 0 && (
              <tr><td colSpan="4" className="text-center">Aucun historique récent.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Historique;
