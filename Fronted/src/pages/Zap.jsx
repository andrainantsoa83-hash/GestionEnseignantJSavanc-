import { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { MdSearch, MdAdd, MdVisibility, MdEdit, MdDelete, MdClose, MdUpload } from 'react-icons/md';
import './Cisco.css'; 

const Zap = () => {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [zaps, setZaps] = useState([]);
  const [communes, setCommunes] = useState([]);
  const [ciscos, setCiscos] = useState([]);
  const [loading, setLoading] = useState(true);

  // States pour le formulaire
  const [showModal, setShowModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({ id: null, nom_zap: '', code_zap: '', commune_id: '', cisco_id: '' });

  const fetchZaps = async () => {
    try {
      const response = await axios.get('http://localhost:3000/api/zaps');
      if (response.data.success) {
        setZaps(response.data.data || []);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCommunesAndCiscos = async () => {
    try {
      const [resCommunes, resCiscos] = await Promise.all([
        axios.get('http://localhost:3000/api/communes'),
        axios.get('http://localhost:3000/api/ciscos')
      ]);
      if (resCommunes.data.success) setCommunes(resCommunes.data.data || []);
      if (resCiscos.data.success) setCiscos(resCiscos.data.data || []);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    fetchZaps();
    fetchCommunesAndCiscos();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleOpenModal = (zap = null) => {
    if (zap) {
      setIsEditing(true);
      setFormData({ 
        id: zap.id, 
        nom_zap: zap.nom_zap || zap.nom || '',
        code_zap: zap.code_zap || zap.code || '',
        commune_id: zap.commune_id || '',
        cisco_id: zap.cisco_id || ''
      });
    } else {
      setIsEditing(false);
      setFormData({ id: null, nom_zap: '', code_zap: '', commune_id: '', cisco_id: '' });
    }
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setFormData({ id: null, nom_zap: '', code_zap: '', commune_id: '', cisco_id: '' });
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      // Trouver la commune pour avoir le bon cisco_id si l'utilisateur ne l'a pas choisi
      let finalFormData = { ...formData };
      if (finalFormData.commune_id && !finalFormData.cisco_id) {
        const comm = communes.find(c => c.id === parseInt(finalFormData.commune_id));
        if (comm) finalFormData.cisco_id = comm.cisco_id;
      }

      if (isEditing) {
        await axios.put(`http://localhost:3000/api/zaps/${formData.id}`, finalFormData);
      } else {
        await axios.post('http://localhost:3000/api/zaps', finalFormData);
      }
      handleCloseModal();
      fetchZaps();
    } catch (error) {
      console.error("Erreur lors de la sauvegarde:", error);
      alert("Erreur lors de l'enregistrement");
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Voulez-vous vraiment supprimer cette ZAP ?")) {
      try {
        await axios.delete(`http://localhost:3000/api/zaps/${id}`);
        fetchZaps();
      } catch (error) {
        console.error("Erreur lors de la suppression:", error);
        alert("Erreur lors de la suppression");
      }
    }
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      const base64 = event.target.result;
      try {
        setLoading(true);
        const response = await axios.post('http://localhost:3000/api/zaps/import', { fileBase64: base64 });
        alert(response.data.message);
        fetchZaps();
      } catch (error) {
        console.error("Erreur d'importation", error);
        alert("Erreur lors de l'importation");
      } finally {
        setLoading(false);
        if (fileInputRef.current) fileInputRef.current.value = '';
      }
    };
    reader.readAsDataURL(file);
  };

  const filtered = zaps.filter(z => {
    const nom = z.nom_zap || z.nom || '';
    const code = z.code_zap || z.code || '';
    return nom.toLowerCase().includes(searchTerm.toLowerCase()) || 
           code.toLowerCase().includes(searchTerm.toLowerCase());
  });

  if (loading) {
    return <div className="page-container"><div className="loading">Chargement...</div></div>;
  }

  return (
    <div className="page-container">
      <div className="page-header">
        <h2>Gestion des ZAP</h2>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button className="btn btn-secondary" onClick={(e) => { e.preventDefault(); fileInputRef.current?.click(); }}>
            <MdUpload size={20} /> Importer Excel
          </button>
          <input 
            type="file" 
            accept=".xlsx, .xls" 
            ref={fileInputRef} 
            style={{ display: 'none' }} 
            onChange={handleFileUpload}
          />
          <button className="btn btn-primary" onClick={() => handleOpenModal()}>
            <MdAdd size={20} /> Nouvelle ZAP
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
              <th>Code ZAP</th>
              <th>Nom ZAP</th>
              <th>Commune</th>
              <th>CISCO</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((item) => (
              <tr key={item.id}>
                <td>{item.code_zap || item.code || '-'}</td>
                <td>{item.nom_zap || item.nom}</td>
                <td>{item.nom_commune || '-'}</td>
                <td>{item.nom_cisco || '-'}</td>
                <td>
                  <div className="actions">
                    <button className="btn-action view" onClick={() => navigate(`/zap/${item.id}`)} title="Voir"><MdVisibility /></button>
                    <button className="btn-action edit" title="Modifier" onClick={() => handleOpenModal(item)}><MdEdit /></button>
                    <button className="btn-action delete" title="Supprimer" onClick={() => handleDelete(item.id)}><MdDelete /></button>
                  </div>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr><td colSpan="5" className="text-center">Aucune ZAP trouvée.</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {/* MODAL */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3>{isEditing ? 'Modifier la ZAP' : 'Ajouter une nouvelle ZAP'}</h3>
              <button className="btn-close" onClick={handleCloseModal}><MdClose size={24} /></button>
            </div>
            <form onSubmit={handleSave}>
              <div className="form-group">
                <label>Code ZAP</label>
                <input 
                  type="text" 
                  className="form-control"
                  required
                  value={formData.code_zap}
                  onChange={(e) => setFormData({...formData, code_zap: e.target.value})}
                />
              </div>
              <div className="form-group">
                <label>Nom de la ZAP</label>
                <input 
                  type="text" 
                  className="form-control"
                  required
                  value={formData.nom_zap}
                  onChange={(e) => setFormData({...formData, nom_zap: e.target.value})}
                />
              </div>
              <div className="form-group">
                <label>Commune de rattachement</label>
                <select 
                  className="form-control"
                  required
                  value={formData.commune_id}
                  onChange={(e) => {
                    const c_id = e.target.value;
                    const comm = communes.find(c => c.id === parseInt(c_id));
                    setFormData({
                      ...formData, 
                      commune_id: c_id,
                      cisco_id: comm ? comm.cisco_id : formData.cisco_id
                    });
                  }}
                >
                  <option value="">-- Sélectionner une Commune --</option>
                  {communes.map(c => (
                    <option key={c.id} value={c.id}>{c.nom_commune || c.nom}</option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label>CISCO</label>
                <select 
                  className="form-control"
                  required
                  value={formData.cisco_id}
                  onChange={(e) => setFormData({...formData, cisco_id: e.target.value})}
                >
                  <option value="">-- Sélectionner un CISCO --</option>
                  {ciscos.map(c => (
                    <option key={c.id} value={c.id}>{c.nom_cisco || c.nom}</option>
                  ))}
                </select>
              </div>
              <div className="modal-actions" style={{ marginTop: '20px', display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                <button type="button" className="btn btn-secondary" onClick={handleCloseModal}>Annuler</button>
                <button type="submit" className="btn btn-primary">{isEditing ? 'Mettre à jour' : 'Enregistrer'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Zap;
