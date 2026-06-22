const Commune = require('../models/communeModel');
const db = require('../config/db');
const xlsx = require('xlsx');

exports.importExcel = async (req, res) => {
  try {
    const { fileBase64 } = req.body;
    if (!fileBase64) return res.status(400).json({ success: false, message: 'Aucun fichier' });

    // Décoder le base64
    const buffer = Buffer.from(fileBase64.split(',')[1] || fileBase64, 'base64');
    const workbook = xlsx.read(buffer, { type: 'buffer' });
    const sheetName = workbook.SheetNames[0];
    const data = xlsx.utils.sheet_to_json(workbook.Sheets[sheetName]);

    let successCount = 0;
    
    // Parcourir chaque ligne du fichier Excel
    for (const row of data) {
      const nomCommune = row['nom_commune'] || row['Nom Commune'] || row['nom'];
      const codeCommune = row['code_commune'] || row['Code Commune'] || row['code'] || '';
      const nomCisco = row['nom_cisco'] || row['Nom Cisco'] || row['cisco'] || row['Cisco'];

      if (!nomCommune || !nomCisco) continue;

      // Chercher l'ID du Cisco correspondant
      const [ciscos] = await db.query('SELECT id FROM cisco WHERE nom_cisco = ?', [nomCisco]);
      if (ciscos.length === 0) continue; // Cisco introuvable, on ignore la ligne

      const cisco_id = ciscos[0].id;

      // Créer la commune
      await Commune.create({
        nom_commune: nomCommune,
        code_commune: codeCommune,
        cisco_id: cisco_id
      });
      successCount++;
    }

    res.status(200).json({ success: true, message: `${successCount} communes importées avec succès !` });
  } catch (error) {
    console.error("Erreur import Excel:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getAllCommunes = async (req, res) => {
  try {
    const { page = 1, limit = 5, search, cisco_id } = req.query;
    // Permet la rétro-compatibilité si le front envoie id_cisco
    const idCisco = cisco_id || req.query.id_cisco;
    const result = await Commune.findAll(page, limit, search, idCisco);
    res.status(200).json({ success: true, ...result });
  } catch (error) { res.status(500).json({ success: false }); }
};

exports.getCommuneById = async (req, res) => {
  try {
    const commune = await Commune.findById(req.params.id);
    if (!commune) return res.status(404).json({ success: false });
    res.status(200).json({ success: true, data: commune });
  } catch (error) { res.status(500).json({ success: false }); }
};

exports.createCommune = async (req, res) => {
  try {
    const dataToSave = { 
      nom_commune: req.body.nom_commune || req.body.nom,
      code_commune: req.body.code_commune || '',
      cisco_id: req.body.cisco_id || req.body.id_cisco
    };
    const id = await Commune.create(dataToSave);
    res.status(201).json({ success: true, id });
  } catch (error) { 
    console.error("Error createCommune:", error);
    res.status(500).json({ success: false, message: error.message }); 
  }
};

exports.updateCommune = async (req, res) => {
  try {
    const dataToSave = { 
      nom_commune: req.body.nom_commune || req.body.nom,
      code_commune: req.body.code_commune,
      cisco_id: req.body.cisco_id || req.body.id_cisco
    };
    const affected = await Commune.update(req.params.id, dataToSave);
    if (affected === 0) return res.status(404).json({ success: false });
    res.status(200).json({ success: true });
  } catch (error) { res.status(500).json({ success: false }); }
};

exports.deleteCommune = async (req, res) => {
  try {
    const affected = await Commune.delete(req.params.id);
    if (affected === 0) return res.status(404).json({ success: false });
    res.status(200).json({ success: true });
  } catch (error) { res.status(500).json({ success: false }); }
};

exports.getStatistiques = async (req, res) => {
  try {
    const stats = await Commune.getStatistiques(req.params.id);
    res.status(200).json({ success: true, data: stats });
  } catch (error) { res.status(500).json({ success: false }); }
};

exports.getBesoinRecrutement = async (req, res) => {
  try {
    const besoin = await Commune.getBesoinRecrutement(req.params.id);
    res.status(200).json({ success: true, data: besoin });
  } catch (error) { res.status(500).json({ success: false }); }
};

exports.getResume = async (req, res) => {
  try {
    const resume = await Commune.getResume(req.params.id);
    res.status(200).json({ success: true, data: resume });
  } catch (error) { res.status(500).json({ success: false }); }
};
