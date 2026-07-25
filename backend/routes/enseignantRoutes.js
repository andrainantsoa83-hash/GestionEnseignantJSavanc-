const express = require('express');
const router = express.Router();
const enseignantController = require('../controllers/enseignantController');

router.get('/', enseignantController.getAllEnseignants);
router.post('/', enseignantController.createEnseignant);
router.post('/import', enseignantController.importExcel);
router.get('/:id', enseignantController.getEnseignantById);
router.put('/:id', enseignantController.updateEnseignant);
router.delete('/:id', enseignantController.deleteEnseignant);

module.exports = router;
