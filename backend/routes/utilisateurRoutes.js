const express = require('express');
const router = express.Router();
const utilisateurController = require('../controllers/utilisateurController');
const { verifyToken, authorizeRoles } = require('../middlewares/authMiddleware');

// === Self-Service (accessible à tout utilisateur connecté) ===
router.get('/me', verifyToken, utilisateurController.getMe);
router.put('/me', verifyToken, utilisateurController.updateMe);

// === Historique d'activité (Audit Trail) ===
// Réservé au Directeur ou à un Super Admin
router.get('/logs', verifyToken, authorizeRoles('DIRECTEUR_DREN'), utilisateurController.getLogs);

// === CRUD Standard Utilisateurs ===
router.get('/', verifyToken, authorizeRoles('DIRECTEUR_DREN'), utilisateurController.getAllUtilisateurs);
router.post('/', verifyToken, authorizeRoles('DIRECTEUR_DREN'), utilisateurController.createUtilisateur);
router.get('/:id', verifyToken, authorizeRoles('DIRECTEUR_DREN'), utilisateurController.getUtilisateurById);
router.put('/:id', verifyToken, authorizeRoles('DIRECTEUR_DREN'), utilisateurController.updateUtilisateur);
router.delete('/:id', verifyToken, authorizeRoles('DIRECTEUR_DREN'), utilisateurController.deleteUtilisateur);

module.exports = router;
