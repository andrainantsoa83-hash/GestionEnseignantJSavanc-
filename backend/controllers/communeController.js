const Commune = require('../models/communeModel');
const db = require('../config/db');
const xlsx = require('xlsx');

exports.importExcel = async (req, res) => {
  let connection;
  try {
    const { fileBase64 } = req.body;
    if (!fileBase64) return res.status(400).json({ success: false, message: 'Aucun fichier' });

    // 1. Lire et parser le fichier Excel (ETAPE 1)
    const buffer = Buffer.from(fileBase64.split(',')[1] || fileBase64, 'base64');
    const workbook = xlsx.read(buffer, { type: 'buffer' });
    let rawData = [];
    for (const sheetName of workbook.SheetNames) {
      const sheetData = xlsx.utils.sheet_to_json(workbook.Sheets[sheetName]);
      rawData = rawData.concat(sheetData);
    }

    // 2. Récupérer tous les CISCO existants pour matcher les noms (ETAPE 9)
    const [allCiscos] = await db.query('SELECT id, nom_cisco, code_cisco FROM cisco');
    const ciscoMap = new Map(); // Permet une recherche très rapide en mémoire O(1)
    for (const c of allCiscos) {
      if (c.nom_cisco) ciscoMap.set(c.nom_cisco.trim().toLowerCase(), c.id);
      if (c.code_cisco) ciscoMap.set(c.code_cisco.trim().toLowerCase(), c.id);
    }

    // 3. Validation & Nettoyage (ETAPE 2 & 9)
    const validRows = [];
    for (let row of rawData) {
      // Normaliser les clés
      const normalizedRow = {};
      for (const key in row) {
        normalizedRow[key.toString().trim().toLowerCase()] = row[key];
      }

      const codeCommune = (normalizedRow['code_commune'] || normalizedRow['code commune'] || normalizedRow['code'] || '').toString().trim();
      const nomCommune = (normalizedRow['nom_commune'] || normalizedRow['nom commune'] || normalizedRow['nom'] || '').toString().trim();
      const refCisco = (normalizedRow['nom_cisco'] || normalizedRow['nom cisco'] || normalizedRow['cisco'] || normalizedRow['code_cisco'] || '').toString().trim().toLowerCase();

      // Vérification des colonnes obligatoires
      if (!codeCommune || !nomCommune || !refCisco) continue;

      // Recherche de l'ID du Cisco en mémoire
      const cisco_id = ciscoMap.get(refCisco);
      if (!cisco_id) continue; // Si le Cisco n'existe pas, on ignore la ligne

      validRows.push({ code_commune: codeCommune, nom_commune: nomCommune, cisco_id });
    }

    if (validRows.length === 0) {
      return res.status(200).json({ success: true, message: 'Aucune donnée valide trouvée ou Cisco introuvable.' });
    }

    // 4. Déduplication interne Excel (ETAPE 3)
    const uniqueRows = [];
    const seenCodes = new Set();
    for (const row of validRows) {
      if (!seenCodes.has(row.code_commune)) {
        seenCodes.add(row.code_commune);
        uniqueRows.push(row);
      }
    }

    // 5. Récupérer l'existant en base pour éviter les doublons (ETAPE 4)
    const [existingRecords] = await db.query('SELECT code_commune FROM commune');
    const existingCodes = new Set(existingRecords.map(r => r.code_commune));

    // 6. Filtrer uniquement les NOUVELLES données (ETAPE 5)
    const newDataToInsert = uniqueRows.filter(row => !existingCodes.has(row.code_commune));

    if (newDataToInsert.length === 0) {
      return res.status(200).json({ success: true, message: 'Toutes les données du fichier existent déjà dans la base.' });
    }

    // 7. Bulk Insert avec Transaction (ETAPE 6 & 7 & 8)
    connection = await db.getConnection();
    await connection.beginTransaction();

    const insertQuery = 'INSERT INTO commune (code_commune, nom_commune, cisco_id) VALUES ?';
    const valuesParams = newDataToInsert.map(r => [r.code_commune, r.nom_commune, r.cisco_id]);

    await connection.query(insertQuery, [valuesParams]);

    await connection.commit();

    res.status(200).json({ 
      success: true, 
      message: `${newDataToInsert.length} Communes importées avec succès ! (${validRows.length - newDataToInsert.length} ignorées car existantes)` 
    });

  } catch (error) {
    if (connection) await connection.rollback();
    console.error("Erreur import Excel Commune (Transaction Annulée):", error);
    res.status(500).json({ success: false, message: 'Erreur lors de l\'importation. Opération annulée.' });
  } finally {
    if (connection) connection.release();
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
