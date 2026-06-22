const Stats = require('../models/statsModel');
const db = require('../config/db');
const PdfService = require('../services/pdfService');

exports.generateCiscoReportPdf = async (req, res) => {
  try {
    const ciscoId = req.params.id;

    if (!ciscoId || isNaN(ciscoId)) {
      return res.status(400).json({ success: false, message: 'ID Cisco invalide' });
    }

    // 1. Récupérer le nom du Cisco
    const [ciscoRows] = await db.query('SELECT nom_cisco FROM cisco WHERE id = ?', [ciscoId]);
    if (ciscoRows.length === 0) {
      return res.status(404).json({ success: false, message: 'Cisco introuvable' });
    }
    const ciscoName = ciscoRows[0].nom_cisco;

    // 2. Récupérer les statistiques hiérarchiques Cisco -> Communes
    const statsHierarchiques = await Stats.getCiscoCommuneStats(ciscoId);

    // 3. Préparer les données pour le PDF
    const reportData = {
      cisco_nom: statsHierarchiques.cisco,
      date_generation: new Date().toLocaleDateString('fr-FR', { 
        year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit'
      }),
      communes: statsHierarchiques.communes
    };

    // 4. Configurer les en-têtes HTTP pour le téléchargement
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=Rapport_Cisco_${ciscoName.replace(/\s+/g, '_')}.pdf`);

    // 5. Générer le PDF
    await PdfService.buildCiscoReport(reportData, res);

  } catch (error) {
    console.error('Erreur lors de la génération du PDF Cisco:', error);
    if (!res.headersSent) {
      res.status(500).json({ success: false, message: 'Erreur lors de la génération du PDF' });
    }
  }
};
