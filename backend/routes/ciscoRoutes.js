const express = require('express');
const router = express.Router();
const ciscoController = require('../controllers/ciscoController');

router.get('/', ciscoController.getAllCiscos);
router.post('/', ciscoController.createCisco);
router.post('/import', ciscoController.importExcel);
router.get('/:id', ciscoController.getCiscoById);
router.put('/:id', ciscoController.updateCisco);
router.delete('/:id', ciscoController.deleteCisco);
router.get('/:id/statistiques', ciscoController.getStatistiques);
router.get('/:id/resume', ciscoController.getResume);
router.get('/recrutement/:id', ciscoController.getBesoinRecrutement);

module.exports = router;
