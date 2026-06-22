import { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { MdSearch, MdAdd, MdEdit, MdDelete, MdClose, MdUpload } from 'react-icons/md';
import './Cisco.css';

const Enseignant = () => {
  const fileInputRef = useRef(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [enseignants, setEnseignants] = useState([]);
  const [etablissements, setEtablissements] = useState([]);
  const [loading, setLoading] = useState(true);

  const [showModal, setShowModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({ 
    id: null, 
    code_enseignant: '', 
    nom_enseignant: '', 
    sexe: 'M', 
    statut: 'Fonctionnaire', 
    etablissement_id: '',
    zap_id: '',
    commune_id: '',
    cisco_id: ''
  });

  const fetchEnseignants = async () => {
    try {
      const response = await axios.get('http://localhost:3000/api/enseignants');
      if (response.data.success) setEnseignants(response.data.data || []);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const fetchEtablissements = async () => {
    try {
      const res = await axios.get('http://localhost:3000/api/etablissements');
      if (res.data.success) setEtablissements(res.data.data || []);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    fetchEnseignants();
    fetchEtablissements();
  }, []);

  const handleOpenModal = (item = null) => {
    if (item) {
      setIsEditing(true);
      setFormData({ 
        id: item.id, 
        code_enseignant: item.code_enseignant || item.matricule || '',
        nom_enseignant: item.nom_enseignant || item.nom || '',
        sexe: item.sexe || 'M',
        statut: item.statut || 'Fonctionnaire',
        etablissement_id: item.etablissement_id || '',
        zap_id: item.zap_id || '',
        commune_id: item.commune_id || '',
        cisco_id: item.cisco_id || ''
      });
    } else {
      setIsEditing(false);
      setFormData({ 
        id: null, 
        code_enseignant: '', 
        nom_enseignant: '', 
        sexe: 'M', 
        statut: 'Fonctionnaire', 
        etablissement_id: '',
        zap_id: '',
        commune_id: '',
        cisco_id: ''
      });
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
      if (finalFormData.etablissement_id) {
        const selectedEtab = etablissements.find(et => et.id === parseInt(finalFormData.etablissement_id));
        if (selectedEtab) {
          finalFormData.zap_id = selectedEtab.zap_id;
          finalFormData.commune_id = selectedEtab.commune_id;
          finalFormData.cisco_id = selectedEtab.cisco_id;
        }
      }

      if (isEditing) {
        await axios.put(`http://localhost:3000/api/enseignants/${formData.id}`, finalFormData);
      } else {
        await axios.post('http://localhost:3000/api/enseignants', finalFormData);
      }
      handleCloseModal();
      fetchEnseignants();
    } catch (error) {
      console.error(error);
      alert("Erreur");
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Voulez-vous vraiment supprimer cet enseignant ?")) {
      try {
        await axios.delete(`http://localhost:3000/api/enseignants/${id}`);
        fetchEnseignants();
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
        const response = await axios.post('http://localhost:3000/api/enseignants/import', { fileBase64: base64 });
        alert(response.data.message);
        fetchEnseignants();
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

  const filtered = enseignants.filter(e => {
    const nom = e.nom_enseignant || e.nom || '';
    const code = e.code_enseignant || e.matricule || '';
    return nom.toLowerCase().includes(searchTerm.toLowerCase()) || 
           code.toLowerCase().includes(searchTerm.toLowerCase());
  });

  if (loading) return <div className="page-container"><div className="loading">Chargement...</div></div>;

  return (
    <div className="page-container">
      <div className="page-header">
        <h2>Gestion des Enseignants</h2>
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
            <MdAdd size={20} /> Nouvel Enseignant
          </button>
        </div>
      </div>

      <div className="search-bar">
        <MdSearch size={24} className="search-icon" />
        <input 
          type="text" 
          placeholder="Rechercher par nom ou matricule..." 
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <div className="table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>Matricule / Code</th>
              <th>Nom Enseignant</th>
              <th>Sexe</th>
              <th>Statut</th>
              <th>Établissement</th>
              <th>ZAP</th>
              <th>Commune</th>
              <th>CISCO</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((item) => (
              <tr key={item.id}>
                <td>{item.code_enseignant || item.matricule || '-'}</td>
                <td>{item.nom_enseignant || item.nom}</td>
                <td>{item.sexe}</td>
                <td><span className={`badge ${item.statut?.includes('Fonctionnaire') ? 'badge-primary' : 'badge-secondary'}`}>{item.statut}</span></td>
                <td>{item.nom_etablissement || '-'}</td>
                <td>{item.nom_zap || '-'}</td>
                <td>{item.nom_commune || '-'}</td>
                <td>{item.nom_cisco || '-'}</td>
                <td>
                  <div className="actions">
                    <button className="btn-action edit" onClick={() => handleOpenModal(item)} title="Modifier"><MdEdit /></button>
                    <button className="btn-action delete" onClick={() => handleDelete(item.id)} title="Supprimer"><MdDelete /></button>
                  </div>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr><td colSpan="9" className="text-center">Aucun enseignant.</td></tr>
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
                <label>Code Enseignant (Matricule)</label>
                <input type="text" className="form-control" value={formData.code_enseignant} onChange={(e) => setFormData({...formData, code_enseignant: e.target.value})} />
              </div>
              <div className="form-group">
                <label>Nom</label>
                <input type="text" className="form-control" required value={formData.nom_enseignant} onChange={(e) => setFormData({...formData, nom_enseignant: e.target.value})} />
              </div>
              <div className="form-group">
                <label>Sexe</label>
                <select className="form-control" value={formData.sexe} onChange={(e) => setFormData({...formData, sexe: e.target.value})}>
                  <option value="M">Masculin</option>
                  <option value="F">Féminin</option>
                </select>
              </div>
              <div className="form-group">
                <label>Statut</label>
                <select className="form-control" value={formData.statut} onChange={(e) => setFormData({...formData, statut: e.target.value})}>
                  <option value="Fonctionnaire">Fonctionnaire</option>
                  <option value="Contractuel">Contractuel</option>
                  <option value="FRAM sub">FRAM sub.</option>
                  <option value="FRAM non sub">FRAM non sub.</option>
                  <option value="Autre">Autre</option>
                </select>
              </div>
              <div className="form-group">
                <label>Établissement</label>
                <select className="form-control" required value={formData.etablissement_id} onChange={(e) => setFormData({...formData, etablissement_id: e.target.value})}>
                  <option value="">-- Établissement --</option>
                  {etablissements.map(et => <option key={et.id} value={et.id}>{et.nom_etablissement || et.nom}</option>)}
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

export default Enseignant;
