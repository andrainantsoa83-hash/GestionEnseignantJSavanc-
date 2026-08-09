import { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { MdSearch, MdAdd, MdVisibility, MdEdit, MdDelete, MdClose, MdUpload, MdChevronLeft, MdChevronRight } from 'react-icons/md';
import './Cisco.css'; // Uses the same CSS for table and modals

const Commune = () => {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [communes, setCommunes] = useState([]);
  const [ciscos, setCiscos] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const limit = 10; // 10 communes par page

  // States pour le formulaire
  const [showModal, setShowModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({ id: null, nom_commune: '', cisco_id: '' });

  const fetchCommunes = async (page = 1) => {
    try {
      // On passe page et limit à l'API
      const response = await axios.get(`https://gestionenseignantjsavanc.onrender.com/api/communes?page=${page}&limit=${limit}`);
      if (response.data.success) {
        setCommunes(response.data.data || []);
        setCurrentPage(response.data.page || 1);
        setTotalPages(Math.ceil((response.data.total || 0) / limit) || 1);
      }
    } catch (error) {
      console.error("Erreur lors de la récupération des Communes:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCiscos = async () => {
    try {
      const response = await axios.get('https://gestionenseignantjsavanc.onrender.com/api/ciscos');
      if (response.data.success) {
        setCiscos(response.data.data || []);
      }
    } catch (error) { console.error(error); }
  };

  useEffect(() => {
    fetchCommunes(currentPage);
    fetchCiscos();
  }, [currentPage]);

  const handleOpenModal = (commune = null) => {
    if (commune) {
      setIsEditing(true);
      setFormData({ 
        id: commune.id, 
        nom_commune: commune.nom_commune || commune.nom || '',
        cisco_id: commune.cisco_id || ''
      });
    } else {
      setIsEditing(false);
      setFormData({ id: null, nom_commune: '', cisco_id: '' });
    }
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setFormData({ id: null, nom_commune: '', cisco_id: '' });
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      if (isEditing) {
        await axios.put(`https://gestionenseignantjsavanc.onrender.com/api/communes/${formData.id}`, formData);
      } else {
        await axios.post('https://gestionenseignantjsavanc.onrender.com/api/communes', formData);
      }
      handleCloseModal();
      fetchCommunes(currentPage);
    } catch (error) {
      console.error("Erreur lors de la sauvegarde:", error);
      alert("Erreur lors de l'enregistrement");
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Voulez-vous vraiment supprimer cette Commune ?")) {
      try {
        await axios.delete(`https://gestionenseignantjsavanc.onrender.com/api/communes/${id}`);
        fetchCommunes(currentPage);
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
        const response = await axios.post('https://gestionenseignantjsavanc.onrender.com/api/communes/import', { fileBase64: base64 });
        alert(response.data.message);
        fetchCommunes(1); // Rafraîchir à la page 1
      } catch (error) {
        console.error("Erreur d'importation", error);
        alert("Erreur lors de l'importation");
      } finally {
        setLoading(false);
        // Réinitialiser le champ file
        if (fileInputRef.current) fileInputRef.current.value = '';
      }
    };
    reader.readAsDataURL(file);
  };

  // Filtrage local en plus de la pagination serveur (si besoin)
  const filtered = communes.filter(c => {
    const nom = c.nom_commune || c.nom || '';
    return nom.toLowerCase().includes(searchTerm.toLowerCase());
  });

  const handlePrevPage = () => {
    if (currentPage > 1) setCurrentPage(currentPage - 1);
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) setCurrentPage(currentPage + 1);
  };

  if (loading) {
    return <div className="page-container"><div className="loading">Chargement...</div></div>;
  }

  return (
    <div className="page-container">
      <div className="page-header">
        <h2>Gestion des Communes</h2>
        <div style={{ display: 'flex', gap: '10px' }}>
          {/* Faux bouton qui clique sur le vrai input file */}
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
            <MdAdd size={20} /> Nouvelle Commune
          </button>
        </div>
      </div>

      <div className="search-bar">
        <MdSearch size={24} className="search-icon" />
        <input 
          type="text" 
          placeholder="Rechercher par nom de commune..." 
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <div className="table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>Nom Commune</th>
              <th>CISCO</th>
              <th>Total Établissements</th>
              <th>Total ZAP</th>
              <th>Total Enseignants</th>
              <th>Besoin</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((item) => (
              <tr key={item.id}>
                <td>{item.nom_commune || item.nom}</td>
                <td>{item.nom_cisco || '-'}</td>
                <td>{item.total_etablissements || 0}</td>
                <td>{item.total_zaps || 0}</td>
                <td>{item.total_enseignants || 0}</td>
                <td><span className="text-red">{item.besoin_recrutement || 0}</span></td>
                <td>
                  <div className="actions">
                    <button className="btn-action view" onClick={() => navigate(`/commune/${item.id}`)} title="Voir"><MdVisibility /></button>
                    <button className="btn-action edit" title="Modifier" onClick={() => handleOpenModal(item)}><MdEdit /></button>
                    <button className="btn-action delete" title="Supprimer" onClick={() => handleDelete(item.id)}><MdDelete /></button>
                  </div>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr><td colSpan="7" className="text-center">Aucune commune trouvée à cette page.</td></tr>
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
              onClick={handlePrevPage} 
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
              onClick={handleNextPage} 
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
              <h3>{isEditing ? 'Modifier la Commune' : 'Ajouter une nouvelle Commune'}</h3>
              <button className="btn-close" onClick={handleCloseModal}><MdClose size={24} /></button>
            </div>
            <form onSubmit={handleSave}>
              <div className="form-group">
                <label>Nom de la Commune</label>
                <input 
                  type="text" 
                  className="form-control"
                  required
                  value={formData.nom_commune}
                  onChange={(e) => setFormData({...formData, nom_commune: e.target.value})}
                />
              </div>
              <div className="form-group">
                <label>CISCO de rattachement</label>
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

export default Commune;
