import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MdLock } from 'react-icons/md';

const Login = () => {
  const [nom, setNom] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleLogin = (e) => {
    e.preventDefault();
    if(nom && password) {
      navigate('/dashboard');
    }
  };

  return (
    <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#f1f5f9' }}>
      <div style={{ background: 'white', padding: '40px', borderRadius: '12px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)', width: '100%', maxWidth: '400px' }}>
        <div style={{ textAlign: 'center', marginBottom: '30px' }}>
          <div style={{ background: '#eff6ff', width: '64px', height: '64px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
            <MdLock size={32} color="#3b82f6" />
          </div>
          <h2 style={{ color: '#1e293b', margin: 0 }}>DREN HAUTE MATSIATRA</h2>
          <p style={{ color: '#64748b', marginTop: '8px' }}>Connexion sécurisée</p>
        </div>
        
        <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <label style={{ fontSize: '14px', fontWeight: '500', color: '#334155' }}>Nom d'utilisateur</label>
            <input 
              type="text" 
              required
              value={nom}
              onChange={e => setNom(e.target.value)}
              style={{ padding: '12px', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '15px', width: '100%' }}
            />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <label style={{ fontSize: '14px', fontWeight: '500', color: '#334155' }}>Mot de passe</label>
            <input 
              type="password" 
              required
              value={password}
              onChange={e => setPassword(e.target.value)}
              style={{ padding: '12px', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '15px', width: '100%' }}
            />
          </div>
          <button 
            type="submit" 
            style={{ padding: '12px', background: '#3b82f6', color: 'white', border: 'none', borderRadius: '6px', fontSize: '16px', fontWeight: '500', cursor: 'pointer', marginTop: '10px' }}
          >
            Se connecter
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;
