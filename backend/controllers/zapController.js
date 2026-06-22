const Zap = require('../models/zapModel');
const db = require('../config/db');
const xlsx = require('xlsx');

exports.importExcel = async (req, res) => {
  try {
    const { fileBase64 } = req.body;
    if (!fileBase64) return res.status(400).json({ success: false, message: 'Aucun fichier' });

    const buffer = Buffer.from(fileBase64.split(',')[1] || fileBase64, 'base64');
    const workbook = xlsx.read(buffer, { type: 'buffer' });
    const sheetName = workbook.SheetNames[0];
    const data = xlsx.utils.sheet_to_json(workbook.Sheets[sheetName]);

    let successCount = 0;
    
    for (const row of data) {
      const codeZap = row['code_zap'] || row['Code Zap'] || row['code'] || '';
      const nomZap = row['nom_zap'] || row['Nom Zap'] || row['nom'] || '';
      const nomCommune = row['nom_commune'] || row['Nom Commune'] || row['commune'] || row['Commune'] || '';

      if (!nomZap || !nomCommune) continue;

      // Chercher l'ID de la commune correspondante et son cisco_id
      const [communes] = await db.query('SELECT id, cisco_id FROM commune WHERE nom_commune = ?', [nomCommune]);
      if (communes.length === 0) continue; 

      const commune_id = communes[0].id;
      const cisco_id = communes[0].cisco_id;

      await Zap.create({
        nom_zap: nomZap,
        code_zap: codeZap,
        commune_id: commune_id,
        cisco_id: cisco_id
      });
      successCount++;
    }

    res.status(200).json({ success: true, message: `${successCount} ZAP importées avec succès !` });
  } catch (error) {
    console.error("Erreur import Excel ZAP:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getAllZaps = async (req, res) => {
  try {
    const { page = 1, limit = 5, search, id_commune, id_cisco } = req.query;
    const result = await Zap.findAll(page, limit, search, id_commune, id_cisco);
    res.status(200).json({ success: true, ...result });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
};

exports.getZapById = async (req, res) => {
  try {
    const zap = await Zap.findById(req.params.id);
    if (!zap) return res.status(404).json({ success: false, message: 'ZAP non trouvée' });
    res.status(200).json({ success: true, data: zap });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
};

exports.createZap = async (req, res) => {
  try {
    const id = await Zap.create(req.body);
    res.status(201).json({ success: true, message: 'ZAP créée', id });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
};

exports.updateZap = async (req, res) => {
  try {
    const affected = await Zap.update(req.params.id, req.body);
    if (affected === 0) return res.status(404).json({ success: false, message: 'ZAP non trouvée' });
    res.status(200).json({ success: true, message: 'ZAP mise à jour' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
};

exports.deleteZap = async (req, res) => {
  try {
    const affected = await Zap.delete(req.params.id);
    if (affected === 0) return res.status(404).json({ success: false, message: 'ZAP non trouvée' });
    res.status(200).json({ success: true, message: 'ZAP supprimée' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
};

exports.getStatistiques = async (req, res) => {
  try {
    const stats = await Zap.getStatistiques(req.params.id);
    res.status(200).json({ success: true, data: stats });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
};

exports.getBesoinRecrutement = async (req, res) => {
  try {
    const besoin = await Zap.getBesoinRecrutement(req.params.id);
    res.status(200).json({ success: true, data: besoin });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
};

exports.getResume = async (req, res) => {
  try {
    const resume = await Zap.getResume(req.params.id);
    res.status(200).json({ success: true, data: resume });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
};
