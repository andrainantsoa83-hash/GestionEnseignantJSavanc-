const Zap = require('../models/zapModel');
const db = require('../config/db');
const xlsx = require('xlsx');

exports.importExcel = async (req, res) => {
  let connection;
  try {
    const { fileBase64 } = req.body;
    if (!fileBase64) return res.status(400).json({ success: false, message: 'Aucun fichier' });

    const buffer = Buffer.from(fileBase64.split(',')[1] || fileBase64, 'base64');
    const workbook = xlsx.read(buffer, { type: 'buffer' });
    let rawData = [];
    for (const sheetName of workbook.SheetNames) {
      const sheetData = xlsx.utils.sheet_to_json(workbook.Sheets[sheetName]);
      rawData = rawData.concat(sheetData);
    }

    // Préchargement des communes
    const [allCommunes] = await db.query('SELECT id, nom_commune, cisco_id FROM commune');
    const communeMap = new Map();
    for (const c of allCommunes) {n
      
      if (c.nom_commune) communeMap.set(c.nom_commune.trim().toLowerCase(), { id: c.id, cisco_id: c.cisco_id });
    }

    const validRows = [];
    for (let row of rawData) {
      // Normaliser les clés (minuscules et sans espaces)
      const normalizedRow = {};
      for (const key in row) {
        normalizedRow[key.toString().trim().toLowerCase()] = row[key];
      }

      const codeZap = (normalizedRow['code_zap'] || normalizedRow['code zap'] || normalizedRow['code'] || '').toString().trim();
      const nomZap = (normalizedRow['nom_zap'] || normalizedRow['nom zap'] || normalizedRow['nom'] || '').toString().trim();
      const refCommune = (normalizedRow['nom_commune'] || normalizedRow['nom commune'] || normalizedRow['commune'] || '').toString().trim().toLowerCase();

      if (!codeZap || !nomZap || !refCommune) continue;

      const communeData = communeMap.get(refCommune);
      if (!communeData) continue; 

      validRows.push({ 
        code_zap: codeZap, 
        nom_zap: nomZap, 
        commune_id: communeData.id,
        cisco_id: communeData.cisco_id
      });
    }

    if (validRows.length === 0) {
      return res.status(200).json({ success: true, message: 'Aucune donnée valide trouvée ou Commune introuvable.' });
    }

    const uniqueRows = [];
    const seenCodes = new Set();
    for (const row of validRows) {
      if (!seenCodes.has(row.code_zap)) {
        seenCodes.add(row.code_zap);
        uniqueRows.push(row);
      }
    }

    const [existingRecords] = await db.query('SELECT code_zap FROM zap');
    const existingCodes = new Set(existingRecords.map(r => r.code_zap));

    const newDataToInsert = uniqueRows.filter(row => !existingCodes.has(row.code_zap));

    if (newDataToInsert.length === 0) {
      return res.status(200).json({ success: true, message: 'Toutes les données du fichier existent déjà dans la base.' });
    }

    connection = await db.getConnection();
    await connection.beginTransaction();

    const insertQuery = 'INSERT INTO zap (code_zap, nom_zap, commune_id, cisco_id) VALUES ?';
    const valuesParams = newDataToInsert.map(r => [r.code_zap, r.nom_zap, r.commune_id, r.cisco_id]);

    await connection.query(insertQuery, [valuesParams]);
    await connection.commit();

    res.status(200).json({ 
      success: true, 
      message: `${newDataToInsert.length} ZAP importées avec succès ! (${validRows.length - newDataToInsert.length} ignorées)` 
    });

  } catch (error) {
    if (connection) await connection.rollback();
    console.error("Erreur import Excel ZAP:", error);
    res.status(500).json({ success: false, message: 'Erreur lors de l\'importation. Opération annulée.' });
  } finally {
    if (connection) connection.release();
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
