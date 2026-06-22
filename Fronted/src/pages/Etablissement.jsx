import { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { MdSearch, MdAdd, MdVisibility, MdEdit, MdDelete, MdClose, MdUpload } from 'react-icons/md';
import './Cisco.css';

const Etablissement = () => {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [etablissements, setEtablissements] = useState([]);
  const [zaps, setZaps] = useState([]);
  const [loading, setLoading] = useState(true);

  const [showModal, setShowModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({ id: null, code_etablissement: '', nom_etablissement: '', type_etablissement: '', zap_id: '', commune_id: '', cisco_id: '' });

  const fetchEtablissements = async () => {
    try {
      const response = await axios.get('http://localhost:3000/api/etablissements');
      if (response.data.success) setEtablissements(response.data.data || []);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const fetchZaps = async () => {
    try {
      const res = await axios.get('http://localhost:3000/api/zaps');
      if (res.data.success) setZaps(res.data.data || []);
    } catch (error) { console.error(error); }
  };

  useEffect(() => {
    fetchEtablissements();
    fetchZaps();
  }, []);

  const handleOpenModal = (item = null) => {
    if (item) {
      setIsEditing(true);
      setFormData({ 
        id: item.id, 
        code_etablissement: item.code_etablissement || item.code || '',
        nom_etablissement: item.nom_etablissement || item.nom || '',
        type_etablissement: item.type_etablissement || item.type || 'Public',
        zap_id: item.zap_id || '',
        commune_id: item.commune_id || '',
        cisco_id: item.cisco_id || ''
      });
    } else {
      setIsEditing(false);
      setFormData({ id: null, code_etablissement: '', nom_etablissement: '', type_etablissement: 'Public', zap_id: '', commune_id: '', cisco_id: '' });
    }
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      let finalFormData = { ...formData };
      if (finalFormData.zap_id && (!finalFormData.commune_id || !finalFormData.cisco_id)) {
        const selectedZap = zaps.find(z => z.id === parseInt(finalFormData.zap_id));
        if (selectedZap) {
          finalFormData.commune_id = selectedZap.commune_id;
          finalFormData.cisco_id = selectedZap.cisco_id;
        }
      }

      if (isEditing) {
        await axios.put(`http://localhost:3000/api/etablissements/${formData.id}`, finalFormData);
      } else {
        await axios.post('http://localhost:3000/api/etablissements', finalFormData);
      }
      handleCloseModal();
      fetchEtablissements();
    } catch (error) {
      console.error(error);
      alert("Erreur");
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Voulez-vous vraiment supprimer ?")) {
      try {
        await axios.delete(`http://localhost:3000/api/etablissements/${id}`);
        fetchEtablissements();
      } catch (error) {
        alert("Erreur");
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
        const response = await axios.post('http://localhost:3000/api/etablissements/import', { fileBase64: base64 });
        alert(response.data.message);
        fetchEtablissements();
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

  const filtered = etablissements.filter(e => {
    const nom = e.nom_etablissement || e.nom || '';
    const code = e.code_etablissement || e.code || '';
    return nom.toLowerCase().includes(searchTerm.toLowerCase()) || 
           code.toLowerCase().includes(searchTerm.toLowerCase());
  });

  if (loading) return <div className="page-container"><div className="loading">Chargement...</div></div>;

  return (
    <div className="page-container">
      <div className="page-header">
        <h2>Gestion des Établissements</h2>
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
            <MdAdd size={20} /> Nouvel Établissement
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
              <th>Code</th>
              <th>Nom Établissement</th>
              <th>Type</th>
              <th>ZAP</th>
              <th>Commune</th>
              <th>CISCO</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((item) => (
              <tr key={item.id}>
                <td>{item.code_etablissement || item.code || '-'}</td>
                <td>{item.nom_etablissement || item.nom}</td>
                <td>{item.type_etablissement || item.type || '-'}</td>
                <td>{item.nom_zap || '-'}</td>
                <td>{item.nom_commune || '-'}</td>
                <td>{item.nom_cisco || '-'}</td>
                <td>
                  <div className="actions">
                    <button className="btn-action view" onClick={() => navigate(`/etablissement/${item.id}`)} title="Voir"><MdVisibility /></button>
                    <button className="btn-action edit" onClick={() => handleOpenModal(item)} title="Modifier"><MdEdit /></button>
                    <button className="btn-action delete" onClick={() => handleDelete(item.id)} title="Supprimer"><MdDelete /></button>
                  </div>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr><td colSpan="7" className="text-center">Aucun établissement.</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {/* MODAL */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3>{isEditing ? 'Modifier' : 'Ajouter'}</h3>
              <button className="btn-close" onClick={handleCloseModal}><MdClose size={24} /></button>
            </div>
            <form onSubmit={handleSave}>
              <div className="form-group">
                <label>Code Établissement</label>
                <input type="text" className="form-control" required value={formData.code_etablissement} onChange={(e) => setFormData({...formData, code_etablissement: e.target.value})} />
              </div>
              <div className="form-group">
                <label>Nom</label>
                <input type="text" className="form-control" required value={formData.nom_etablissement} onChange={(e) => setFormData({...formData, nom_etablissement: e.target.value})} />
              </div>
              <div className="form-group">
                <label>Type</label>
                <select className="form-control" value={formData.type_etablissement} onChange={(e) => setFormData({...formData, type_etablissement: e.target.value})}>
                  <option value="Public">Public</option>
                  <option value="Privé">Privé</option>
                </select>
              </div>
              <div className="form-group">
                <label>ZAP</label>
                <select className="form-control" required value={formData.zap_id} onChange={(e) => setFormData({...formData, zap_id: e.target.value})}>
                  <option value="">-- ZAP --</option>
                  {zaps.map(z => <option key={z.id} value={z.id}>{z.nom_zap || z.nom}</option>)}
                </select>
              </div>
              <div className="modal-actions" style={{ marginTop: '20px', display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                <button type="button" className="btn btn-secondary" onClick={handleCloseModal}>Annuler</button>
                <button type="submit" className="btn btn-primary">Enregistrer</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Etablissement;
