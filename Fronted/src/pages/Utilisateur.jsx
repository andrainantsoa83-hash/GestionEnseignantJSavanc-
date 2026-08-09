import { useState, useEffect } from 'react';
import axios from 'axios';
import { MdSearch, MdAdd, MdEdit, MdDelete, MdClose, MdSecurity, MdLockReset, MdBlock } from 'react-icons/md';

const Utilisateur = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [utilisateurs, setUtilisateurs] = useState([]);
  const [ciscos, setCiscos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [currentUserRole, setCurrentUserRole] = useState('');
  
  const [formData, setFormData] = useState({
    id: null,
    nom: '',
    code_service: '',
    password: '',
    role: 'AGENT_STATISTIQUE',
    cisco_id: '',
    statut: 'Actif'
  });

  const roles = [
    'DIRECTEUR_DREN',
    'CHEF_SERVICE_PROGRAMMATION',
    'CHEF_ADMINISTRATION',
    'AGENT_STATISTIQUE'
  ];

  const fetchUtilisateurs = async () => {
    try {
      const token = localStorage.getItem('token');
      const config = { headers: { Authorization: `Bearer ${token}` } };
      const res = await axios.get('https://gestionenseignantjsavanc.onrender.com/api/utilisateurs', config);
      if (res.data.success) setUtilisateurs(res.data.data || []);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCiscos = async () => {
    try {
      const res = await axios.get('https://gestionenseignantjsavanc.onrender.com/api/ciscos');
      if (res.data.success) setCiscos(res.data.data || []);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    setCurrentUserRole(user.role || '');
    
    // Only fetch if authorized
    if (user.role === 'DIRECTEUR_DREN') {
      fetchUtilisateurs();
      fetchCiscos();
    } else {
      setLoading(false);
    }
  }, []);

  if (currentUserRole !== 'DIRECTEUR_DREN') {
    return (
      <div className="page-container" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
        <div style={{ textAlign: 'center', color: '#dc2626' }}>
          <MdBlock size={64} style={{ margin: '0 auto' }} />
          <h2>Accès Interdit</h2>
          <p>Vous n'avez pas les droits nécessaires pour accéder à cette page.</p>
        </div>
      </div>
    );
  }

  const filtered = utilisateurs.filter(u => 
    (u.nom && u.nom.toLowerCase().includes(searchTerm.toLowerCase())) || 
    (u.code_service && u.code_service.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (u.role && u.role.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const handleOpenModal = (user = null) => {
    if (user) {
      setIsEditing(true);
      setFormData({
        id: user.id,
        nom: user.nom || '',
        code_service: user.code_service || '',
        password: '',
        role: user.role || 'AGENT_STATISTIQUE',
        cisco_id: user.cisco_id || '',
        statut: user.statut || 'Actif'
      });
    } else {
      setIsEditing(false);
      setFormData({ id: null, nom: '', code_service: '', password: '', role: 'AGENT_STATISTIQUE', cisco_id: '', statut: 'Actif' });
    }
    setIsModalOpen(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      const config = { headers: { Authorization: `Bearer ${token}` } };
      
      const payload = { ...formData };
      if (payload.cisco_id === '') payload.cisco_id = null;

      if (isEditing) {
        if (!payload.password) delete payload.password; 
        await axios.put(`https://gestionenseignantjsavanc.onrender.com/api/utilisateurs/${formData.id}`, payload, config);
        
        // If password is provided during edit, we update it specifically
        if (payload.password) {
          await axios.put(`https://gestionenseignantjsavanc.onrender.com/api/utilisateurs/${formData.id}/password`, { password: payload.password }, config);
        }
      } else {
        await axios.post('https://gestionenseignantjsavanc.onrender.com/api/utilisateurs', payload, config);
      }
      setIsModalOpen(false);
      fetchUtilisateurs();
    } catch (error) {
      alert(error.response?.data?.message || "Erreur lors de l'enregistrement de l'utilisateur.");
    }
  };

  const handleDelete = async (id) => {
    if(window.confirm('Voulez-vous vraiment supprimer définitivement cet utilisateur ?')) {
      try {
        const token = localStorage.getItem('token');
        const config = { headers: { Authorization: `Bearer ${token}` } };
        await axios.delete(`https://gestionenseignantjsavanc.onrender.com/api/utilisateurs/${id}`, config);
        fetchUtilisateurs();
      } catch (error) {
        alert("Erreur lors de la suppression.");
      }
    }
  };

  const handleToggleStatus = async (id, currentStatus) => {
    const newStatus = currentStatus === 'Actif' ? 'Inactif' : 'Actif';
    if(window.confirm(`Voulez-vous vraiment ${newStatus === 'Actif' ? 'activer' : 'désactiver'} cet utilisateur ?`)) {
      try {
        const token = localStorage.getItem('token');
        const config = { headers: { Authorization: `Bearer ${token}` } };
        await axios.put(`https://gestionenseignantjsavanc.onrender.com/api/utilisateurs/${id}/statut`, { statut: newStatus }, config);
        fetchUtilisateurs();
      } catch (error) {
        alert("Erreur lors du changement de statut.");
      }
    }
  };

  if (loading) return <div className="page-container"><div className="loading">Chargement...</div></div>;

  return (
    <div className="page-container">
      <div className="page-header" style={{ marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ backgroundColor: '#1E3A8A', padding: '10px', borderRadius: '8px', display: 'flex' }}>
            <MdSecurity size={24} color="#FFFFFF" />
          </div>
          <h2 style={{ color: '#1E3A8A', margin: 0, fontSize: '24px', fontWeight: 'bold' }}>Gestion des Utilisateurs</h2>
        </div>
        <button 
          onClick={() => handleOpenModal()}
          style={{ 
            backgroundColor: '#1E3A8A', 
            color: '#FFFFFF', 
            border: 'none', 
            padding: '10px 16px', 
            borderRadius: '6px', 
            display: 'flex', 
            alignItems: 'center', 
            gap: '8px',
            cursor: 'pointer',
            fontWeight: '600'
          }}
        >
          <MdAdd size={20} /> Ajouter Utilisateur
        </button>
      </div>

      <div style={{ backgroundColor: '#FFFFFF', padding: '16px', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '10px' }}>
        <MdSearch size={22} color="#9CA3AF" />
        <input 
          type="text" 
          placeholder="Rechercher par nom, rôle ou code service..." 
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{ border: 'none', outline: 'none', width: '100%', fontSize: '15px', color: '#374151' }}
        />
      </div>

      <div style={{ backgroundColor: '#FFFFFF', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ backgroundColor: '#F3F4F6', color: '#374151', fontSize: '14px', borderBottom: '1px solid #E5E7EB' }}>
              <th style={{ padding: '14px 16px', fontWeight: '600' }}>Nom</th>
              <th style={{ padding: '14px 16px', fontWeight: '600' }}>Code Service</th>
              <th style={{ padding: '14px 16px', fontWeight: '600' }}>Rôle</th>
              <th style={{ padding: '14px 16px', fontWeight: '600' }}>Cisco</th>
              <th style={{ padding: '14px 16px', fontWeight: '600' }}>Date Création</th>
              <th style={{ padding: '14px 16px', fontWeight: '600' }}>Statut</th>
              <th style={{ padding: '14px 16px', fontWeight: '600', textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((item) => (
              <tr key={item.id} style={{ borderBottom: '1px solid #F3F4F6', color: '#374151', fontSize: '14px' }}>
                <td style={{ padding: '14px 16px', fontWeight: '500' }}>{item.nom}</td>
                <td style={{ padding: '14px 16px' }}>{item.code_service}</td>
                <td style={{ padding: '14px 16px' }}>
                  <span style={{ backgroundColor: '#F3F4F6', color: '#1E3A8A', padding: '4px 8px', borderRadius: '4px', fontSize: '12px', fontWeight: '600' }}>
                    {item.role.replace(/_/g, ' ')}
                  </span>
                </td>
                <td style={{ padding: '14px 16px' }}>
                  {item.cisco_id ? (ciscos.find(c => c.id === item.cisco_id)?.nom_cisco || item.cisco_id) : '-'}
                </td>
                <td style={{ padding: '14px 16px', color: '#6B7280' }}>
                  {item.created_at ? new Date(item.created_at).toLocaleDateString('fr-FR') : '-'}
                </td>
                <td style={{ padding: '14px 16px' }}>
                  <span style={{ 
                    backgroundColor: item.statut === 'Actif' ? '#DEF7EC' : '#FEE2E2', 
                    color: item.statut === 'Actif' ? '#046C4E' : '#9B1C1C', 
                    padding: '4px 8px', 
                    borderRadius: '4px', 
                    fontSize: '12px', 
                    fontWeight: '600' 
                  }}>
                    {item.statut || 'Actif'}
                  </span>
                </td>
                <td style={{ padding: '14px 16px', textAlign: 'right' }}>
                  <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                    <button 
                      title={item.statut === 'Actif' ? "Désactiver" : "Activer"} 
                      onClick={() => handleToggleStatus(item.id, item.statut || 'Actif')}
                      style={{ background: 'none', border: 'none', cursor: 'pointer', color: item.statut === 'Actif' ? '#F59E0B' : '#10B981' }}
                    >
                      {item.statut === 'Actif' ? <MdBlock size={20} /> : <MdSecurity size={20} />}
                    </button>
                    <button title="Modifier" onClick={() => handleOpenModal(item)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#1E3A8A' }}>
                      <MdEdit size={20} />
                    </button>
                    <button title="Supprimer" onClick={() => handleDelete(item.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#EF4444' }}>
                      <MdDelete size={20} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr><td colSpan="7" style={{ padding: '24px', textAlign: 'center', color: '#6B7280' }}>Aucun utilisateur trouvé.</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {isModalOpen && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(30, 58, 138, 0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50 }}>
          <div style={{ backgroundColor: '#FFFFFF', borderRadius: '8px', width: '100%', maxWidth: '500px', overflow: 'hidden', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)' }}>
            <div style={{ padding: '20px 24px', borderBottom: '1px solid #E5E7EB', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ margin: 0, color: '#1E3A8A', fontSize: '18px', fontWeight: 'bold' }}>{isEditing ? 'Modifier l\'utilisateur' : 'Ajouter un utilisateur'}</h3>
              <button onClick={() => setIsModalOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#6B7280' }}>
                <MdClose size={24} />
              </button>
            </div>
            
            <form onSubmit={handleSave} style={{ padding: '24px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <label style={{ fontSize: '14px', fontWeight: '600', color: '#374151' }}>Nom complet</label>
                  <input type="text" required value={formData.nom} onChange={e => setFormData({...formData, nom: e.target.value})} style={{ padding: '10px 12px', border: '1px solid #D1D5DB', borderRadius: '6px', fontSize: '14px', outline: 'none' }} placeholder="Ex: Rakoto Jean" />
                </div>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <label style={{ fontSize: '14px', fontWeight: '600', color: '#374151' }}>Code Service</label>
                  <input type="text" required value={formData.code_service} onChange={e => setFormData({...formData, code_service: e.target.value})} style={{ padding: '10px 12px', border: '1px solid #D1D5DB', borderRadius: '6px', fontSize: '14px', outline: 'none' }} placeholder="Ex: PROG-01" />
                </div>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <label style={{ fontSize: '14px', fontWeight: '600', color: '#374151' }}>
                    {isEditing ? 'Réinitialiser le mot de passe' : 'Mot de passe temporaire'}
                  </label>
                  <input type="password" required={!isEditing} value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} style={{ padding: '10px 12px', border: '1px solid #D1D5DB', borderRadius: '6px', fontSize: '14px', outline: 'none' }} placeholder={isEditing ? "(Laisser vide pour ne pas modifier)" : "Saisissez un mot de passe"} />
                </div>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <label style={{ fontSize: '14px', fontWeight: '600', color: '#374151' }}>Rôle</label>
                  <select required value={formData.role} onChange={e => setFormData({...formData, role: e.target.value})} style={{ padding: '10px 12px', border: '1px solid #D1D5DB', borderRadius: '6px', fontSize: '14px', outline: 'none', backgroundColor: '#FFFFFF' }}>
                    {roles.map(r => <option key={r} value={r}>{r.replace(/_/g, ' ')}</option>)}
                  </select>
                </div>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <label style={{ fontSize: '14px', fontWeight: '600', color: '#374151' }}>Cisco de rattachement (Facultatif)</label>
                  <select value={formData.cisco_id} onChange={e => setFormData({...formData, cisco_id: e.target.value})} style={{ padding: '10px 12px', border: '1px solid #D1D5DB', borderRadius: '6px', fontSize: '14px', outline: 'none', backgroundColor: '#FFFFFF' }}>
                    <option value="">Aucun (Accès DREN global)</option>
                    {ciscos.map(c => <option key={c.id} value={c.id}>{c.nom_cisco}</option>)}
                  </select>
                </div>

              </div>
              
              <div style={{ marginTop: '30px', display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
                <button type="button" onClick={() => setIsModalOpen(false)} style={{ padding: '10px 16px', backgroundColor: '#F3F4F6', color: '#374151', border: 'none', borderRadius: '6px', fontWeight: '600', cursor: 'pointer' }}>Annuler</button>
                <button type="submit" style={{ padding: '10px 16px', backgroundColor: '#1E3A8A', color: '#FFFFFF', border: 'none', borderRadius: '6px', fontWeight: '600', cursor: 'pointer' }}>Enregistrer</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Utilisateur;
