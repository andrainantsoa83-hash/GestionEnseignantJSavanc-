const Cisco = require('../models/ciscoModel');
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
      const codeCisco = row['code_cisco'] || row['Code Cisco'] || row['code'] || '';
      const nomCisco = row['nom_cisco'] || row['Nom Cisco'] || row['nom'] || '';

      if (!nomCisco) continue;

      await Cisco.create({
        nom_cisco: nomCisco,
        code_cisco: codeCisco
      });
      successCount++;
    }

    res.status(200).json({ success: true, message: `${successCount} CISCO importés avec succès !` });
  } catch (error) {
    console.error("Erreur import Excel CISCO:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getAllCiscos = async (req, res) => {
  try {
    const { page = 1, limit = 500, search } = req.query; // Increase limit to show all
    const result = await Cisco.findAll(page, limit, search);
    res.status(200).json({ success: true, ...result });
  } catch (error) { 
    console.error("Erreur getAllCiscos:", error);
    res.status(500).json({ success: false, message: error.message }); 
  }
};

exports.getCiscoById = async (req, res) => {
  try {
    const cisco = await Cisco.findById(req.params.id);
    if (!cisco) return res.status(404).json({ success: false });
    res.status(200).json({ success: true, data: cisco });
  } catch (error) { res.status(500).json({ success: false }); }
};

exports.createCisco = async (req, res) => {
  try {
    const dataToSave = { 
      nom_cisco: req.body.nom_cisco || req.body.nom,
      code_cisco: req.body.code_cisco
    };
    const id = await Cisco.create(dataToSave);
    res.status(201).json({ success: true, id });
  } catch (error) { res.status(500).json({ success: false }); }
};

exports.updateCisco = async (req, res) => {
  try {
    const dataToSave = { 
      nom_cisco: req.body.nom_cisco || req.body.nom,
      code_cisco: req.body.code_cisco
    };
    const affected = await Cisco.update(req.params.id, dataToSave);
    if (affected === 0) return res.status(404).json({ success: false });
    res.status(200).json({ success: true });
  } catch (error) { res.status(500).json({ success: false }); }
};

exports.deleteCisco = async (req, res) => {
  try {
    const affected = await Cisco.delete(req.params.id);
    if (affected === 0) return res.status(404).json({ success: false });
    res.status(200).json({ success: true });
  } catch (error) { res.status(500).json({ success: false }); }
};

exports.getStatistiques = async (req, res) => {
  try {
    const stats = await Cisco.getStatistiques(req.params.id);
    res.status(200).json({ success: true, data: stats });
  } catch (error) { res.status(500).json({ success: false }); }
};

exports.getBesoinRecrutement = async (req, res) => {
  try {
    const besoin = await Cisco.getBesoinRecrutement(req.params.id);
    res.status(200).json({ success: true, data: besoin });
  } catch (error) { res.status(500).json({ success: false }); }
};

exports.getResume = async (req, res) => {
  try {
    const resume = await Cisco.getResume(req.params.id);
    res.status(200).json({ success: true, data: resume });
  } catch (error) { res.status(500).json({ success: false }); }
};
