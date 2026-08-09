import { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { MdSearch, MdAdd, MdVisibility, MdEdit, MdDelete, MdClose, MdUpload, MdChevronLeft, MdChevronRight } from 'react-icons/md';
import Select from 'react-select';
import './Cisco.css';

const Etablissement = () => {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [etablissements, setEtablissements] = useState([]);
  const [zaps, setZaps] = useState([]);
  const [loading, setLoading] = useState(true);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const limit = 10;

  const [showModal, setShowModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({ id: null, code_etablissement: '', nom_etablissement: '', type_etablissement: 'Public', zap_id: '', commune_id: '', cisco_id: '' });

  const fetchEtablissements = async (page = 1) => {
    try {
      const response = await axios.get(`https://gestionenseignantjsavanc.onrender.com/api/etablissements?page=${page}&limit=${limit}`);
      if (response.data.success) {
        setEtablissements(response.data.data || []);
        setCurrentPage(response.data.page || 1);
        setTotalPages(Math.ceil((response.data.total || 0) / limit) || 1);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const fetchZaps = async () => {
    try {
      // limit=10000 pour charger toutes les ZAPs dans le menu déroulant
      const res = await axios.get('https://gestionenseignantjsavanc.onrender.com/api/zaps?limit=10000');
      if (res.data.success) setZaps(res.data.data || []);
    } catch (error) { console.error(error); }
  };

  useEffect(() => {
    fetchEtablissements(currentPage);
    fetchZaps();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage]);

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
        await axios.put(`https://gestionenseignantjsavanc.onrender.com/api/etablissements/${formData.id}`, finalFormData);
      } else {
        await axios.post('https://gestionenseignantjsavanc.onrender.com/api/etablissements', finalFormData);
      }
      handleCloseModal();
      fetchEtablissements(currentPage);
    } catch (error) {
      console.error(error);
      alert("Erreur");
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Voulez-vous vraiment supprimer ?")) {
      try {
        await axios.delete(`https://gestionenseignantjsavanc.onrender.com/api/etablissements/${id}`);
        fetchEtablissements(currentPage);
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
        const response = await axios.post('https://gestionenseignantjsavanc.onrender.com/api/etablissements/import', { fileBase64: base64 });
        alert(response.data.message);
        fetchEtablissements(1);
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
              <th>Total Enseignants</th>
              <th>Besoin</th>
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
                <td>{item.total_enseignants || 0}</td>
                <td><span className="text-red">{item.besoin_recrutement || 0}</span></td>
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
              <tr><td colSpan="9" className="text-center">Aucun établissement.</td></tr>
            )}
          </tbody>
        </table>
        
        {/* Contrôles de pagination */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '15px 20px', borderTop: '1px solid #eee' }}>
          <div style={{ color: '#666', fontSize: '14px' }}>
            Page {currentPage} sur {totalPages}
          </div>
          <div style={{ display: 'flex', gap: '10px' }}>
            <button 
              onClick={() => { if(currentPage > 1) setCurrentPage(currentPage - 1); }} 
              disabled={currentPage === 1}
              style={{ 
                padding: '8px 12px', 
                border: '1px solid #ddd', 
                backgroundColor: currentPage === 1 ? '#f5f5f5' : 'white', 
                color: currentPage === 1 ? '#aaa' : '#333', 
                borderRadius: '4px', 
                cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
                display: 'flex', alignItems: 'center'
              }}
            >
              <MdChevronLeft size={20} /> Précédent
            </button>
            <button 
              onClick={() => { if(currentPage < totalPages) setCurrentPage(currentPage + 1); }} 
              disabled={currentPage >= totalPages}
              style={{ 
                padding: '8px 12px', 
                border: '1px solid #ddd', 
                backgroundColor: currentPage >= totalPages ? '#f5f5f5' : 'white', 
                color: currentPage >= totalPages ? '#aaa' : '#333', 
                borderRadius: '4px', 
                cursor: currentPage >= totalPages ? 'not-allowed' : 'pointer',
                display: 'flex', alignItems: 'center'
              }}
            >
              Suivant <MdChevronRight size={20} />
            </button>
          </div>
        </div>
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
                <label>ZAP de rattachement</label>
                <Select 
                  options={zaps.map(z => ({ value: z.id, label: z.nom_zap || z.nom }))}
                  value={formData.zap_id ? { value: formData.zap_id, label: zaps.find(z => z.id === parseInt(formData.zap_id))?.nom_zap || zaps.find(z => z.id === parseInt(formData.zap_id))?.nom } : null}
                  onChange={(selectedOption) => {
                    setFormData({...formData, zap_id: selectedOption ? selectedOption.value : ''});
                  }}
                  placeholder="Rechercher une ZAP..."
                  isClearable
                  required={!formData.zap_id}
                />
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
