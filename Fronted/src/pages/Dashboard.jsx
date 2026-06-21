import { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  MdBusiness, 
  MdLocationCity, 
  MdMap, 
  MdSchool, 
  MdPerson, 
  MdWarning
} from 'react-icons/md';
import { 
  PieChart, 
  Pie, 
  Cell, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from 'recharts';
import './Dashboard.css';

const Dashboard = () => {
  const [stats, setStats] = useState({
    cisco: 0,
    communes: 0,
    zap: 0,
    etablissements: 0,
    enseignants: 0,
    besoinRecrutement: 0
  });
  
  const [statutData, setStatutData] = useState([]);
  const [zoneData, setZoneData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/stats/global');
        if (response.data.success) {
          setStats(response.data.data.stats);
          setStatutData(response.data.data.statutData);
          setZoneData(response.data.data.zoneData);
        }
      } catch (error) {
        console.error("Erreur lors du chargement des données globales:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (loading) {
    return <div className="dashboard"><div className="loading">Chargement des statistiques...</div></div>;
  }

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h2>Tableau de Bord Global</h2>
        <p>Vue globale des données de la Direction Régionale de l'Éducation Nationale (DREN) HAUTE MATSIATRA</p>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon bg-blue"><MdBusiness size={24} /></div>
          <div className="stat-info">
            <span className="stat-value">{stats.cisco}</span>
            <span className="stat-label">Total CISCO</span>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon bg-green"><MdLocationCity size={24} /></div>
          <div className="stat-info">
            <span className="stat-value">{stats.communes}</span>
            <span className="stat-label">Total Communes</span>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon bg-yellow"><MdMap size={24} /></div>
          <div className="stat-info">
            <span className="stat-value">{stats.zap}</span>
            <span className="stat-label">Total ZAP</span>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon bg-purple"><MdSchool size={24} /></div>
          <div className="stat-info">
            <span className="stat-value">{stats.etablissements}</span>
            <span className="stat-label">Établissements</span>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon bg-indigo"><MdPerson size={24} /></div>
          <div className="stat-info">
            <span className="stat-value">{stats.enseignants}</span>
            <span className="stat-label">Total Enseignants</span>
          </div>
        </div>
        <div className="stat-card highlight">
          <div className="stat-icon bg-red"><MdWarning size={24} color="white" /></div>
          <div className="stat-info">
            <span className="stat-value text-red">{stats.besoinRecrutement}</span>
            <span className="stat-label">Besoin Recrutement</span>
          </div>
        </div>
      </div>

      <div className="charts-container">
        <div className="chart-card">
          <h3>Répartition des enseignants par statut</h3>
          <div className="statut-details">
            {statutData.map((item, index) => (
              <div key={index} className="statut-item">
                <span className="color-dot" style={{ backgroundColor: item.color }}></span>
                <span className="statut-name">{item.name}</span>
                <span className="statut-val">{item.value}</span>
              </div>
            ))}
          </div>
          <div className="chart-wrapper">
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={statutData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {statutData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="chart-card">
          <h3>Répartition par zone éducative</h3>
          <div className="chart-wrapper">
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={zoneData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="enseignants" fill="#3b82f6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="summary-section">
        <h3>Résumé général</h3>
        <div className="table-responsive">
          <table className="summary-table">
            <thead>
              <tr>
                <th>Indicateur</th>
                <th>Total</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Total CISCO</td>
                <td>{stats.cisco}</td>
              </tr>
              <tr>
                <td>Total Communes</td>
                <td>{stats.communes}</td>
              </tr>
              <tr>
                <td>Total ZAP</td>
                <td>{stats.zap}</td>
              </tr>
              <tr>
                <td>Total Établissements</td>
                <td>{stats.etablissements}</td>
              </tr>
              <tr>
                <td>Total Enseignants</td>
                <td>{stats.enseignants}</td>
              </tr>
              <tr className="row-highlight">
                <td>Total Besoin de recrutement</td>
                <td>{stats.besoinRecrutement}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
