const Etablissement = require('../models/etablissementModel');
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

    const [allZaps] = await db.query('SELECT id, nom_zap, commune_id, cisco_id FROM zap');
    const zapMap = new Map();
    for (const z of allZaps) {
      if (z.nom_zap) zapMap.set(z.nom_zap.trim().toLowerCase(), { id: z.id, commune_id: z.commune_id, cisco_id: z.cisco_id });
    }

    const validRows = [];
    for (let row of rawData) {
      // Normaliser les clés
      const normalizedRow = {};
      for (const key in row) {
        normalizedRow[key.toString().trim().toLowerCase()] = row[key];
      }

      const codeEtab = (normalizedRow['code_etablissement'] || normalizedRow['code etab'] || normalizedRow['code_etab'] || normalizedRow['code'] || '').toString().trim();
      const nomEtab = (normalizedRow['nom_etablissement'] || normalizedRow['nom etab'] || normalizedRow['nom_etab'] || normalizedRow['nom'] || '').toString().trim();
      const typeEtab = (normalizedRow['type_etablissement'] || normalizedRow['type'] || 'Public').toString().trim();
      const refZap = (normalizedRow['nom_zap'] || normalizedRow['nom zap'] || normalizedRow['zap'] || '').toString().trim().toLowerCase();

      if (!codeEtab || !nomEtab || !refZap) continue;

      const zapData = zapMap.get(refZap);
      if (!zapData) continue; 

      validRows.push({ 
        code_etablissement: codeEtab, 
        nom_etablissement: nomEtab, 
        type_etablissement: typeEtab,
        zap_id: zapData.id,
        commune_id: zapData.commune_id,
        cisco_id: zapData.cisco_id
      });
    }

    if (validRows.length === 0) {
      return res.status(200).json({ success: true, message: 'Aucune donnée valide trouvée ou ZAP introuvable.' });
    }

    const uniqueRows = [];
    const seenCodes = new Set();
    for (const row of validRows) {
      if (!seenCodes.has(row.code_etablissement)) {
        seenCodes.add(row.code_etablissement);
        uniqueRows.push(row);
      }
    }

    const [existingRecords] = await db.query('SELECT code_etablissement FROM etablissement');
    const existingCodes = new Set(existingRecords.map(r => r.code_etablissement));

    const newDataToInsert = uniqueRows.filter(row => !existingCodes.has(row.code_etablissement));

    if (newDataToInsert.length === 0) {
      return res.status(200).json({ success: true, message: 'Toutes les données du fichier existent déjà dans la base.' });
    }

    connection = await db.getConnection();
    await connection.beginTransaction();

    const insertQuery = 'INSERT INTO etablissement (code_etablissement, nom_etablissement, type_etablissement, zap_id, commune_id, cisco_id) VALUES ?';
    const valuesParams = newDataToInsert.map(r => [r.code_etablissement, r.nom_etablissement, r.type_etablissement, r.zap_id, r.commune_id, r.cisco_id]);

    await connection.query(insertQuery, [valuesParams]);
    await connection.commit();

    res.status(200).json({ 
      success: true, 
      message: `${newDataToInsert.length} Établissements importés avec succès ! (${validRows.length - newDataToInsert.length} ignorés)` 
    });

  } catch (error) {
    if (connection) await connection.rollback();
    console.error("Erreur import Excel Etab:", error);
    res.status(500).json({ success: false, message: 'Erreur lors de l\'importation. Opération annulée.' });
  } finally {
    if (connection) connection.release();
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
