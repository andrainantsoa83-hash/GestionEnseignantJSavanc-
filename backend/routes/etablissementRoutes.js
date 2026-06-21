const express = require('express');
const router = express.Router();
const etablissementController = require('../controllers/etablissementController');

router.get('/', etablissementController.getAllEtablissements);
router.post('/', etablissementController.createEtablissement);
router.get('/:id', etablissementController.getEtablissementById);
router.put('/:id', etablissementController.updateEtablissement);
router.delete('/:id', etablissementController.deleteEtablissement);
router.get('/:id/statistiques', etablissementController.getStatistiques);
router.get('/recrutement/:id', etablissementController.getBesoinRecrutement);

module.exports = router;
