const express = require('express');
const router = express.Router();
const enseignantController = require('../controllers/enseignantController');

// Route GET pour récupérer les enseignants
router.get('/', enseignantController.getAllEnseignants);

// Route POST pour créer un enseignant
router.post('/', enseignantController.createEnseignant);

module.exports = router;
