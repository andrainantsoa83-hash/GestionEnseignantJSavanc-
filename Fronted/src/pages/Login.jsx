import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { MdLockOutline, MdSecurity, MdWarningAmber } from 'react-icons/md';

const Login = () => {
  const [codeService, setCodeService] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    if(codeService && password) {
      try {
        setLoading(true);
        setError('');
        const res = await axios.post('http://localhost:3000/api/auth/login', {
          code_service: codeService,
          password: password
        });
        
        if (res.data.success) {
          localStorage.setItem('token', res.data.token);
          localStorage.setItem('user', JSON.stringify(res.data.utilisateur));
          navigate('/dashboard');
        }
      } catch (err) {
        setError('Code Service ou mot de passe incorrect.');
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <div style={{ 
      minHeight: '100vh', 
      display: 'flex', 
      backgroundColor: '#F3F4F6', // Gris clair
      fontFamily: '"Inter", "Segoe UI", Roboto, Helvetica, Arial, sans-serif'
    }}>
      
      {/* Colonne Gauche - Informations */}
      <div style={{ 
        flex: 1, 
        backgroundColor: '#1E3A8A', // Bleu foncé
        color: '#FFFFFF', // Blanc
        padding: '60px 40px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        position: 'relative',
        overflow: 'hidden'
      }}>
        {/* Décoration subtile */}
        <div style={{ position: 'absolute', top: '-10%', left: '-10%', width: '300px', height: '300px', borderRadius: '50%', backgroundColor: 'rgba(255,255,255,0.03)' }}></div>
        <div style={{ position: 'absolute', bottom: '-15%', right: '-10%', width: '400px', height: '400px', borderRadius: '50%', backgroundColor: 'rgba(255,255,255,0.03)' }}></div>

        <div style={{ maxWidth: '500px', margin: '0 auto', position: 'relative', zIndex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '30px' }}>
            <div style={{ 
              background: '#FFFFFF', 
              padding: '12px', 
              borderRadius: '8px', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
            }}>
              <MdSecurity size={36} color="#1E3A8A" />
            </div>
            <div>
              <h1 style={{ margin: 0, fontSize: '28px', fontWeight: 'bold', lineHeight: '1.2' }}>
                Système de Gestion des Statuts des Enseignants
              </h1>
              <h2 style={{ margin: '5px 0 0 0', fontSize: '18px', fontWeight: '500', opacity: 0.8 }}>
                DREN Haute Matsiatra
              </h2>
            </div>
          </div>

          <div style={{ 
            background: 'rgba(255, 255, 255, 0.1)', 
            borderLeft: '4px solid #FFFFFF', 
            padding: '24px', 
            borderRadius: '0 8px 8px 0',
            backdropFilter: 'blur(10px)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '15px', fontWeight: 'bold', fontSize: '16px' }}>
              <MdLockOutline size={22} />
              <span>Accès Restreint Intranet</span>
            </div>
            <p style={{ margin: '0 0 15px 0', fontSize: '15px', lineHeight: '1.6' }}>
              Cette application est exclusivement destinée au personnel autorisé de la DREN Haute Matsiatra.
            </p>
            <p style={{ margin: '0 0 10px 0', fontWeight: '600', fontSize: '15px' }}>Utilisateurs autorisés :</p>
            <ul style={{ margin: '0 0 20px 0', paddingLeft: '20px', fontSize: '15px', lineHeight: '1.8' }}>
              <li>Directeur DREN</li>
              <li>Chef du Service Programmation</li>
              <li>Chef Administration</li>
              <li>Agent Statistique</li>
            </ul>
            <p style={{ margin: 0, fontStyle: 'italic', opacity: 0.9, fontSize: '14px' }}>
              Connexion uniquement avec un Code Service et un Mot de passe.
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '30px', color: '#fca5a5', fontSize: '14px', fontWeight: '500' }}>
            <MdWarningAmber size={18} />
            <span>Toute tentative d'accès non autorisée est strictement interdite.</span>
          </div>
        </div>
      </div>

      {/* Colonne Droite - Formulaire */}
      <div style={{ 
        flex: 1, 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        padding: '40px'
      }}>
        <div style={{ 
          background: '#FFFFFF', // Blanc
          padding: '40px', 
          borderRadius: '12px', 
          boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.05), 0 8px 10px -6px rgba(0, 0, 0, 0.01)', 
          width: '100%', 
          maxWidth: '420px' 
        }}>
          
          <h3 style={{ color: '#1E3A8A', margin: '0 0 30px 0', fontSize: '24px', fontWeight: 'bold', textAlign: 'center' }}>
            Authentification
          </h3>
          
          {error && (
            <div style={{ 
              color: '#dc2626', // Rouge
              backgroundColor: '#fef2f2',
              borderLeft: '4px solid #ef4444',
              padding: '12px 16px',
              borderRadius: '4px',
              marginBottom: '25px', 
              fontWeight: '500',
              fontSize: '14px'
            }}>
              {error}
            </div>
          )}

          <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <label style={{ fontSize: '14px', fontWeight: '600', color: '#374151' }}>Code Service</label>
              <input 
                type="text" 
                required
                value={codeService}
                onChange={e => setCodeService(e.target.value)}
                style={{ 
                  padding: '12px 16px', 
                  border: '1px solid #d1d5db', 
                  borderRadius: '6px', 
                  fontSize: '15px', 
                  width: '100%', 
                  boxSizing: 'border-box',
                  backgroundColor: '#F3F4F6',
                  color: '#374151',
                  outline: 'none',
                  transition: 'border-color 0.2s, box-shadow 0.2s'
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = '#1E3A8A';
                  e.target.style.boxShadow = '0 0 0 3px rgba(30, 58, 138, 0.1)';
                  e.target.style.backgroundColor = '#FFFFFF';
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = '#d1d5db';
                  e.target.style.boxShadow = 'none';
                  e.target.style.backgroundColor = '#F3F4F6';
                }}
                placeholder="Saisissez votre code service"
              />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <label style={{ fontSize: '14px', fontWeight: '600', color: '#374151' }}>Mot de passe</label>
              <input 
                type="password" 
                required
                value={password}
                onChange={e => setPassword(e.target.value)}
                style={{ 
                  padding: '12px 16px', 
                  border: '1px solid #d1d5db', 
                  borderRadius: '6px', 
                  fontSize: '15px', 
                  width: '100%', 
                  boxSizing: 'border-box',
                  backgroundColor: '#F3F4F6',
                  color: '#374151',
                  outline: 'none',
                  transition: 'border-color 0.2s, box-shadow 0.2s'
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = '#1E3A8A';
                  e.target.style.boxShadow = '0 0 0 3px rgba(30, 58, 138, 0.1)';
                  e.target.style.backgroundColor = '#FFFFFF';
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = '#d1d5db';
                  e.target.style.boxShadow = 'none';
                  e.target.style.backgroundColor = '#F3F4F6';
                }}
                placeholder="••••••••"
              />
            </div>
            
            <button 
              type="submit" 
              disabled={loading}
              style={{ 
                padding: '14px', 
                background: '#1E3A8A', 
                color: '#FFFFFF', 
                border: 'none', 
                borderRadius: '6px', 
                fontSize: '16px', 
                fontWeight: '600', 
                cursor: loading ? 'not-allowed' : 'pointer', 
                marginTop: '10px',
                transition: 'background-color 0.2s, transform 0.1s',
                boxShadow: '0 4px 6px -1px rgba(30, 58, 138, 0.2)'
              }}
              onMouseOver={(e) => e.target.style.backgroundColor = '#172554'}
              onMouseOut={(e) => e.target.style.backgroundColor = '#1E3A8A'}
              onMouseDown={(e) => e.target.style.transform = 'scale(0.98)'}
              onMouseUp={(e) => e.target.style.transform = 'scale(1)'}
            >
              {loading ? 'Connexion en cours...' : 'Se connecter'}
            </button>
          </form>

          <div style={{ 
            marginTop: '40px', 
            color: '#9ca3af', 
            fontSize: '13px', 
            textAlign: 'center',
            borderTop: '1px solid #e5e7eb',
            paddingTop: '20px'
          }}>
            © DREN Haute Matsiatra<br/>Système d'information interne
          </div>

        </div>
      </div>
      
    </div>
  );
};

export default Login;
