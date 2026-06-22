const Etablissement = require('../models/etablissementModel');
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
      const codeEtab = row['code_etab'] || row['Code Etab'] || row['code'] || '';
      const nomEtab = row['nom_etab'] || row['Nom Etab'] || row['nom'] || '';
      const typeEtab = row['type'] || row['Type'] || '';
      const nomZap = row['nom_zap'] || row['Nom Zap'] || row['zap'] || row['Zap'] || '';

      if (!nomEtab || !nomZap) continue;

      // Chercher l'ID de la ZAP correspondante et ses infos parents
      const [zaps] = await db.query('SELECT id, commune_id, cisco_id FROM zap WHERE nom_zap = ?', [nomZap]);
      if (zaps.length === 0) continue; 

      const zap_id = zaps[0].id;
      const commune_id = zaps[0].commune_id;
      const cisco_id = zaps[0].cisco_id;

      await Etablissement.create({
        nom_etablissement: nomEtab,
        code_etablissement: codeEtab,
        type_etablissement: typeEtab,
        zap_id: zap_id,
        commune_id: commune_id,
        cisco_id: cisco_id
      });
      successCount++;
    }

    res.status(200).json({ success: true, message: `${successCount} Établissements importés avec succès !` });
  } catch (error) {
    console.error("Erreur import Excel Etablissement:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getAllEtablissements = async (req, res) => {
  try {
    const { page = 1, limit = 5, search, id_zap, id_commune } = req.query;
    const result = await Etablissement.findAll(page, limit, search, id_zap, id_commune);
    res.status(200).json({ success: true, ...result });
  } catch (error) { res.status(500).json({ success: false }); }
};

exports.getEtablissementById = async (req, res) => {
  try {
    const etablissement = await Etablissement.findById(req.params.id);
    if (!etablissement) return res.status(404).json({ success: false });
    res.status(200).json({ success: true, data: etablissement });
  } catch (error) { res.status(500).json({ success: false }); }
};

exports.createEtablissement = async (req, res) => {
  try {
    const id = await Etablissement.create(req.body);
    res.status(201).json({ success: true, id });
  } catch (error) { res.status(500).json({ success: false }); }
};

exports.updateEtablissement = async (req, res) => {
  try {
    const affected = await Etablissement.update(req.params.id, req.body);
    if (affected === 0) return res.status(404).json({ success: false });
    res.status(200).json({ success: true });
  } catch (error) { res.status(500).json({ success: false }); }
};

exports.deleteEtablissement = async (req, res) => {
  try {
    const affected = await Etablissement.delete(req.params.id);
    if (affected === 0) return res.status(404).json({ success: false });
    res.status(200).json({ success: true });
  } catch (error) { res.status(500).json({ success: false }); }
};

exports.getStatistiques = async (req, res) => {
  try {
    const stats = await Etablissement.getStatistiques(req.params.id);
    res.status(200).json({ success: true, data: stats });
  } catch (error) { res.status(500).json({ success: false }); }
};

exports.getBesoinRecrutement = async (req, res) => {
  try {
    const besoin = await Etablissement.getBesoinRecrutement(req.params.id);
    res.status(200).json({ success: true, data: besoin });
  } catch (error) { res.status(500).json({ success: false }); }
};
