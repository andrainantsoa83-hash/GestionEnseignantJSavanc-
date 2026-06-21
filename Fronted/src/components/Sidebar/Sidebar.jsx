import { NavLink, useNavigate } from 'react-router-dom';
import { 
  MdDashboard, 
  MdBusiness, 
  MdLocationCity, 
  MdMap, 
  MdSchool, 
  MdPerson, 
  MdPeople,
  MdAccountCircle,
  MdLogout
} from 'react-icons/md';
import './Sidebar.css';

const Sidebar = ({ isOpen }) => {
  const navigate = useNavigate();
  
  const menuItems = [
    { path: '/dashboard', name: 'Dashboard', icon: <MdDashboard /> },
    { path: '/cisco', name: 'Cisco', icon: <MdBusiness /> },
    { path: '/commune', name: 'Commune', icon: <MdLocationCity /> },
    { path: '/zap', name: 'ZAP', icon: <MdMap /> },
    { path: '/etablissement', name: 'Établissement', icon: <MdSchool /> },
    { path: '/enseignant', name: 'Enseignant', icon: <MdPerson /> },
    { path: '/utilisateur', name: 'Historique', icon: <MdPeople /> },
    { path: '/profil', name: 'Mon Profil', icon: <MdAccountCircle /> }
  ];

  const handleLogout = () => {
    navigate('/login');
  };

  return (
    <aside className={`sidebar ${isOpen ? 'open' : ''}`}>
      <div className="sidebar-header">
        <h2>DREN HAUTE MATSIATRA</h2>
      </div>
      <nav className="sidebar-nav">
        <ul>
          {menuItems.map((item, index) => (
            <li key={index}>
              <NavLink 
                to={item.path} 
                className={({ isActive }) => isActive ? 'active' : ''}
              >
                <span className="icon">{item.icon}</span>
                <span className="text">{item.name}</span>
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>
      <div className="logout-container">
        <button className="logout-btn" onClick={handleLogout}>
          <span className="icon"><MdLogout /></span>
          <span className="text">Déconnexion</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
