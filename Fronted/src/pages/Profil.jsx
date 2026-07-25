import { useState, useEffect } from 'react';
import { MdAccountCircle } from 'react-icons/md';

const Profil = () => {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  return (
    <div className="page-container">
      <div className="page-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <MdAccountCircle size={32} color="#1e293b" />
          <h2>Mon Profil</h2>
        </div>
      </div>
      <div className="summary-section" style={{ maxWidth: '600px', margin: '0 auto', textAlign: 'center', padding: '40px 20px' }}>
        <div style={{ background: '#f1f5f9', width: '100px', height: '100px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
          <MdAccountCircle size={80} color="#1e293b" />
        </div>
        <h3 style={{ fontSize: '24px', marginBottom: '5px' }}>{user?.nom || 'Utilisateur'}</h3>
        <p style={{ color: '#38bdf8', fontWeight: 'bold', fontSize: '16px', marginBottom: '20px' }}>
          {user?.role || 'Rôle'}
        </p>
        
        <div style={{ background: '#f8fafc', padding: '20px', borderRadius: '8px', textAlign: 'left' }}>
          <div style={{ marginBottom: '15px' }}>
            <label style={{ display: 'block', color: '#64748b', fontSize: '14px', marginBottom: '5px' }}>Code Service (Identifiant)</label>
            <div style={{ fontWeight: '500', color: '#1e293b', fontSize: '16px' }}>{user?.code_service || 'N/A'}</div>
          </div>
          
          <div style={{ marginBottom: '15px' }}>
            <label style={{ display: 'block', color: '#64748b', fontSize: '14px', marginBottom: '5px' }}>CISCO de rattachement</label>
            <div style={{ fontWeight: '500', color: '#1e293b', fontSize: '16px' }}>
              {user?.cisco_id ? `ID Cisco: ${user.cisco_id}` : 'Accès Global (Tous les CISCO)'}
            </div>
          </div>
        </div>

        <div style={{ marginTop: '30px', padding: '15px', background: '#fffbeb', color: '#f59e0b', borderRadius: '8px', fontSize: '14px' }}>
          <strong>Note de sécurité :</strong> Seul un Administrateur (Directeur ou Chef de Service) est autorisé à modifier vos données personnelles ou réinitialiser votre mot de passe depuis la page "Gestion des Utilisateurs".
        </div>
      </div>
    </div>
  );
};

export default Profil;
