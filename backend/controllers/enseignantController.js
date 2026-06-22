const Enseignant = require('../models/enseignantModel');
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
      const codeEnseignant = row['code_enseignant'] || row['Code Enseignant'] || row['matricule'] || row['Matricule'] || '';
      const nomEnseignant = row['nom_enseignant'] || row['Nom Enseignant'] || row['nom'] || row['Nom'] || '';
      const sexe = row['sexe'] || row['Sexe'] || '';
      const statut = row['statut'] || row['Statut'] || '';
      const nomEtab = row['nom_etablissement'] || row['Nom Etablissement'] || row['etablissement'] || row['Etablissement'] || '';

      if (!nomEnseignant || !nomEtab) continue;

      // Chercher l'ID de l'établissement correspondant
      const [etabs] = await db.query('SELECT id, zap_id, commune_id, cisco_id FROM etablissement WHERE nom_etablissement = ?', [nomEtab]);
      if (etabs.length === 0) continue; 

      const etablissement_id = etabs[0].id;
      const zap_id = etabs[0].zap_id;
      const commune_id = etabs[0].commune_id;
      const cisco_id = etabs[0].cisco_id;

      await Enseignant.create({
        code_enseignant: codeEnseignant,
        nom_enseignant: nomEnseignant,
        sexe: sexe,
        statut: statut,
        etablissement_id: etablissement_id,
        zap_id: zap_id,
        commune_id: commune_id,
        cisco_id: cisco_id
      });
      successCount++;
    }

    res.status(200).json({ success: true, message: `${successCount} Enseignants importés avec succès !` });
  } catch (error) {
    console.error("Erreur import Excel Enseignant:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getAllEnseignants = async (req, res) => {
  try {
    const { page, limit, search } = req.query;
    const result = await Enseignant.findAll(page, limit, search);
    
    res.status(200).json({ success: true, ...result });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
};

exports.createEnseignant = async (req, res) => {
  try {
    const result = await Enseignant.create(req.body);
    res.status(201).json({ success: true, message: 'Enseignant créé avec succès', data: result });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
};
