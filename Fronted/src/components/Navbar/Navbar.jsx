import { useState, useEffect } from 'react';
import { MdMenu, MdNotifications, MdAccountCircle } from 'react-icons/md';
import './Navbar.css';

const Navbar = ({ toggleSidebar }) => {
  const [showNotifications, setShowNotifications] = useState(false);
  const [user, setUser] = useState({ nom: 'Admin', role: '' });

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  return (
    <header className="navbar" style={{ position: 'relative' }}>
      <div className="navbar-left">
        <button className="menu-btn" onClick={toggleSidebar}>
          <MdMenu size={24} />
        </button>
      </div>
      <div className="navbar-right">
        
        <div style={{ position: 'relative' }}>
          <button 
            className="icon-btn" 
            onClick={() => setShowNotifications(!showNotifications)}
            title="Notifications"
          >
            <MdNotifications size={24} />
            <span style={{ 
              position: 'absolute', 
              top: '5px', 
              right: '5px', 
              width: '8px', 
              height: '8px', 
              backgroundColor: '#ef4444', 
              borderRadius: '50%' 
            }}></span>
          </button>
          
          {showNotifications && (
            <div style={{
              position: 'absolute',
              top: '40px',
              right: '0',
              backgroundColor: 'white',
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
              borderRadius: '8px',
              width: '280px',
              padding: '16px',
              zIndex: 100,
              border: '1px solid #e2e8f0'
            }}>
              <h3 style={{ margin: '0 0 12px 0', fontSize: '16px', color: '#1e293b', borderBottom: '1px solid #e2e8f0', paddingBottom: '8px' }}>
                Notifications
              </h3>
              <p style={{ margin: 0, fontSize: '14px', color: '#64748b', textAlign: 'center', padding: '10px 0' }}>
                Aucune nouvelle notification pour le moment.
              </p>
            </div>
          )}
        </div>

        <div className="user-profile" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <MdAccountCircle size={28} color="#1e293b" />
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <span style={{ fontSize: '14px', fontWeight: 'bold', color: '#1e293b' }}>{user.nom}</span>
            <span style={{ fontSize: '11px', color: '#64748b' }}>{user.role ? user.role.replace(/_/g, ' ') : ''}</span>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
