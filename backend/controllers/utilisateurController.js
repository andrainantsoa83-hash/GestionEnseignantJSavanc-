const Utilisateur = require('../models/utilisateurModel');
const ActivityLog = require('../models/activityLogModel');
const bcrypt = require('bcryptjs');

const VALID_ROLES = [
  'DIRECTEUR_DREN', 
  'CHEF_SERVICE_PROGRAMMATION', 
  'CHEF_ADMINISTRATION', 
  'AGENT_STATISTIQUE'
];

exports.getMe = async (req, res) => {
  try {
    const utilisateur = await Utilisateur.findById(req.user.id);
    if (!utilisateur) return res.status(404).json({ success: false, message: 'Utilisateur non trouvé' });
    res.status(200).json({ success: true, data: utilisateur });
  } catch (error) {
    console.error('Erreur getMe:', error);
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
};

exports.updateMe = async (req, res) => {
  try {
    const { nom, password } = req.body;
    
    if (password) {
      const salt = await bcrypt.genSalt(10);
      const password_hash = await bcrypt.hash(password, salt);
      await Utilisateur.updatePassword(req.user.id, password_hash);
    }

    const currentUser = await Utilisateur.findById(req.user.id);
    
    const affected = await Utilisateur.update(req.user.id, {
      nom: nom || currentUser.nom,
      role: currentUser.role,
      code_service: currentUser.code_service,
      cisco_id: currentUser.cisco_id,
      statut: currentUser.statut
    });

    res.status(200).json({ success: true, message: 'Profil mis à jour avec succès' });
  } catch (error) {
    console.error('Erreur updateMe:', error);
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
};

exports.getLogs = async (req, res) => {
  try {
    const logs = await ActivityLog.findAll();
    res.status(200).json({ success: true, data: logs });
  } catch (error) {
    console.error('Erreur getLogs:', error);
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
};

exports.getAllUtilisateurs = async (req, res) => {
  try {
    const utilisateurs = await Utilisateur.findAll();
    res.status(200).json({ success: true, data: utilisateurs });
  } catch (error) {
    console.error('Erreur:', error);
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
};

exports.getUtilisateurById = async (req, res) => {
  try {
    const utilisateur = await Utilisateur.findById(req.params.id);
    if (!utilisateur) return res.status(404).json({ success: false, message: 'Utilisateur non trouvé' });
    res.status(200).json({ success: true, data: utilisateur });
  } catch (error) {
    console.error('Erreur:', error);
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
};

exports.createUtilisateur = async (req, res) => {
  try {
    let { nom, role, code_service, password, cisco_id } = req.body;
    
    if (!VALID_ROLES.includes(role)) {
      return res.status(400).json({ success: false, message: 'Rôle invalide' });
    }

    if (!password) {
      return res.status(400).json({ success: false, message: 'Mot de passe requis' });
    }

    const salt = await bcrypt.genSalt(10);
    const password_hash = await bcrypt.hash(password, salt);

    const dataToSave = { nom, role, code_service, password_hash, cisco_id };
    const id = await Utilisateur.create(dataToSave);

    await ActivityLog.create({
      user_id: req.user.id,
      action: `Création de l'utilisateur ${nom} (${role})`,
      entity_type: 'UTILISATEUR',
      entity_id: id,
      ip_address: req.ip
    });

    res.status(201).json({ success: true, message: 'Utilisateur créé', data: { id, nom, role } });
  } catch (error) {
    console.error('Erreur:', error);
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
};

exports.updateUtilisateur = async (req, res) => {
  try {
    const { nom, role, code_service, cisco_id } = req.body;

    if (role && !VALID_ROLES.includes(role)) {
      return res.status(400).json({ success: false, message: 'Rôle invalide' });
    }

    const currentUser = await Utilisateur.findById(req.params.id);
    if(!currentUser) return res.status(404).json({ success: false, message: 'Utilisateur non trouvé' });

    const dataToUpdate = { 
      nom, 
      role, 
      code_service, 
      cisco_id, 
      statut: currentUser.statut 
    };

    const affected = await Utilisateur.update(req.params.id, dataToUpdate);

    await ActivityLog.create({
      user_id: req.user.id,
      action: `Modification de l'utilisateur ${nom}`,
      entity_type: 'UTILISATEUR',
      entity_id: req.params.id,
      ip_address: req.ip
    });
    
    res.status(200).json({ success: true, message: 'Utilisateur mis à jour' });
  } catch (error) {
    console.error('Erreur:', error);
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
};

exports.updatePassword = async (req, res) => {
  try {
    const { password } = req.body;
    if (!password) return res.status(400).json({ success: false, message: 'Nouveau mot de passe requis' });

    const salt = await bcrypt.genSalt(10);
    const password_hash = await bcrypt.hash(password, salt);
    await Utilisateur.updatePassword(req.params.id, password_hash);

    await ActivityLog.create({
      user_id: req.user.id,
      action: `Réinitialisation du mot de passe de l'utilisateur ID: ${req.params.id}`,
      entity_type: 'UTILISATEUR',
      entity_id: req.params.id,
      ip_address: req.ip
    });

    res.status(200).json({ success: true, message: 'Mot de passe réinitialisé' });
  } catch (error) {
    console.error('Erreur:', error);
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
};

exports.updateStatut = async (req, res) => {
  try {
    const { statut } = req.body;
    await Utilisateur.updateStatut(req.params.id, statut);

    await ActivityLog.create({
      user_id: req.user.id,
      action: `${statut === 'Actif' ? 'Activation' : 'Désactivation'} de l'utilisateur ID: ${req.params.id}`,
      entity_type: 'UTILISATEUR',
      entity_id: req.params.id,
      ip_address: req.ip
    });

    res.status(200).json({ success: true, message: 'Statut mis à jour' });
  } catch (error) {
    console.error('Erreur:', error);
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
};

exports.deleteUtilisateur = async (req, res) => {
  try {
    const affected = await Utilisateur.delete(req.params.id);
    if (affected === 0) return res.status(404).json({ success: false, message: 'Utilisateur non trouvé' });

    await ActivityLog.create({
      user_id: req.user.id,
      action: `Suppression de l'utilisateur ID: ${req.params.id}`,
      entity_type: 'UTILISATEUR',
      entity_id: req.params.id,
      ip_address: req.ip
    });

    res.status(200).json({ success: true, message: 'Utilisateur supprimé' });
  } catch (error) {
    console.error('Erreur:', error);
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
};
