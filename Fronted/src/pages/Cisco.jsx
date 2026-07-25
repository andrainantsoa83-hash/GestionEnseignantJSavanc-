import { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { MdSearch, MdAdd, MdVisibility, MdEdit, MdDelete, MdClose, MdUpload } from 'react-icons/md';
import './Cisco.css';

const Cisco = () => {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [ciscos, setCiscos] = useState([]);
  const [loading, setLoading] = useState(true);

  // States pour le formulaire
  const [showModal, setShowModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({ id: null, code_cisco: '', nom_cisco: '' });

  const fetchCiscos = async () => {
    try {
      const response = await axios.get('http://localhost:3000/api/ciscos');
      if (response.data.success) {
        setCiscos(response.data.data || []);
      }
    } catch (error) {
      console.error("Erreur lors de la récupération des CISCO:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCiscos();
  }, []);

  const handleOpenModal = (cisco = null) => {
    if (cisco) {
      setIsEditing(true);
      setFormData({ 
        id: cisco.id, 
        code_cisco: cisco.code_cisco || cisco.code || '', 
        nom_cisco: cisco.nom_cisco || cisco.nom || '' 
      });
    } else {
      setIsEditing(false);
      setFormData({ id: null, code_cisco: '', nom_cisco: '' });
    }
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setFormData({ id: null, code_cisco: '', nom_cisco: '' });
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      if (isEditing) {
        await axios.put(`http://localhost:3000/api/ciscos/${formData.id}`, formData);
      } else {
        await axios.post('http://localhost:3000/api/ciscos', formData);
      }
      handleCloseModal();
      fetchCiscos(); // Rafraîchir la liste
    } catch (error) {
      console.error("Erreur lors de la sauvegarde:", error);
      alert("Erreur lors de l'enregistrement");
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Voulez-vous vraiment supprimer ce CISCO ?")) {
      try {
        await axios.delete(`http://localhost:3000/api/ciscos/${id}`);
        fetchCiscos(); // Rafraîchir la liste
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
        const response = await axios.post('http://localhost:3000/api/ciscos/import', { fileBase64: base64 });
        alert(response.data.message);
        fetchCiscos();
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

  const filteredCiscos = ciscos.filter(c => {
    const nom = c.nom_cisco || c.nom || '';
    const code = c.code_cisco || c.code || '';
    return nom.toLowerCase().includes(searchTerm.toLowerCase()) || 
           code.toLowerCase().includes(searchTerm.toLowerCase());
  });

  if (loading) {
    return <div className="page-container"><div className="loading">Chargement des CISCO...</div></div>;
  }

  return (
    <div className="page-container">
      <div className="page-header">
        <h2>Gestion des CISCO</h2>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button className="btn btn-secondary" onClick={() => fileInputRef.current.click()}>
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
            <MdAdd size={20} /> Nouveau Cisco
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
              <th>Code Cisco</th>
              <th>Nom Cisco</th>
              <th>Total Communes</th>
              <th>Total ZAP</th>
              <th>Total Établissements</th>
              <th>Total Enseignants</th>
              <th>Besoin</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredCiscos.map((cisco) => (
              <tr key={cisco.id}>
                <td>{cisco.code_cisco || cisco.code}</td>
                <td>{cisco.nom_cisco || cisco.nom}</td>
                <td>{cisco.total_communes || 0}</td>
                <td>{cisco.total_zaps || 0}</td>
                <td>{cisco.total_etablissements || 0}</td>
                <td>{cisco.total_enseignants || 0}</td>
                <td><span className="text-red">{cisco.besoin_recrutement || 0}</span></td>
                <td>
                  <div className="actions">
                    <button 
                      className="btn-action view" 
                      onClick={() => navigate(`/cisco/${cisco.id}`)}
                      title="Voir"
                    >
                      <MdVisibility />
                    </button>
                    <button 
                      className="btn-action edit" 
                      title="Modifier"
                      onClick={() => handleOpenModal(cisco)}
                    >
                      <MdEdit />
                    </button>
                    <button 
                      className="btn-action delete" 
                      title="Supprimer"
                      onClick={() => handleDelete(cisco.id)}
                    >
                      <MdDelete />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {filteredCiscos.length === 0 && (
              <tr>
                <td colSpan="8" className="text-center">Aucun Cisco trouvé.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="pagination">
        <button className="btn-page" disabled>&lt; Précédent</button>
        <span className="page-info">Page 1 sur 1</span>
        <button className="btn-page" disabled>Suivant &gt;</button>
      </div>

      {/* MODAL AJOUT/MODIFICATION */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3>{isEditing ? 'Modifier le Cisco' : 'Ajouter un nouveau Cisco'}</h3>
              <button className="btn-close" onClick={handleCloseModal}><MdClose size={24} /></button>
            </div>
            <form onSubmit={handleSave}>
              <div className="form-group">
                <label>Code CISCO</label>
                <input 
                  type="text" 
                  className="form-control"
                  required
                  value={formData.code_cisco}
                  onChange={(e) => setFormData({...formData, code_cisco: e.target.value})}
                />
              </div>
              <div className="form-group">
                <label>Nom CISCO</label>
                <input 
                  type="text" 
                  className="form-control"
                  required
                  value={formData.nom_cisco}
                  onChange={(e) => setFormData({...formData, nom_cisco: e.target.value})}
                />
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

export default Cisco;
