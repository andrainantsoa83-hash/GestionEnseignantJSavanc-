const express = require('express');
const router = express.Router();
const reportController = require('../controllers/reportController');

// Route GET pour générer un rapport PDF officiel pour un Cisco
// URL: GET /api/report/cisco/:id/pdf
router.get('/cisco/:id/pdf', reportController.generateCiscoReportPdf);

module.exports = router;
