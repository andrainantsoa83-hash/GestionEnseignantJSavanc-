const Cisco = require('../models/ciscoModel');
const xlsx = require('xlsx');
const db = require('../config/db'); // Utilisation directe du pool pour les transactions

exports.importExcel = async (req, res) => {
  let connection;
  try {
    const { fileBase64 } = req.body;
    if (!fileBase64) return res.status(400).json({ success: false, message: 'Aucun fichier' });

    // 1. Lire et parser le fichier Excel (ETAPE 1)
    const buffer = Buffer.from(fileBase64.split(',')[1] || fileBase64, 'base64');
    const workbook = xlsx.read(buffer, { type: 'buffer' });
    const sheetName = workbook.SheetNames[0];
    const rawData = xlsx.utils.sheet_to_json(workbook.Sheets[sheetName]);

    // 2. Validation & Nettoyage (ETAPE 2)
    const validRows = [];
    for (const row of rawData) {
      const codeCisco = (row['code_cisco'] || row['Code Cisco'] || row['code'] || '').toString().trim();
      const nomCisco = (row['nom_cisco'] || row['Nom Cisco'] || row['nom'] || '').toString().trim();

      if (codeCisco && nomCisco) {
        validRows.push({ code_cisco: codeCisco, nom_cisco: nomCisco });
      }
    }

    if (validRows.length === 0) {
      return res.status(200).json({ success: true, message: 'Aucune donnée valide trouvée dans le fichier.' });
    }

    // 3. Déduplication interne Excel (ETAPE 3)
    const uniqueRows = [];
    const seenCodes = new Set();
    for (const row of validRows) {
      if (!seenCodes.has(row.code_cisco)) {
        seenCodes.add(row.code_cisco);
        uniqueRows.push(row);
      }
    }

    // 4. Récupérer l'existant en base pour éviter les doublons (ETAPE 4)
    const [existingRecords] = await db.query('SELECT code_cisco FROM cisco');
    const existingCodes = new Set(existingRecords.map(r => r.code_cisco));

    // 5. Filtrer uniquement les NOUVELLES données (ETAPE 5)
    const newDataToInsert = uniqueRows.filter(row => !existingCodes.has(row.code_cisco));

    if (newDataToInsert.length === 0) {
      return res.status(200).json({ success: true, message: 'Toutes les données du fichier existent déjà dans la base.' });
    }

    // 6. Bulk Insert avec Transaction (ETAPE 6 & 7 & 8)
    connection = await db.getConnection();
    await connection.beginTransaction();

    const insertQuery = 'INSERT INTO cisco (code_cisco, nom_cisco) VALUES ?';
    const valuesParams = newDataToInsert.map(r => [r.code_cisco, r.nom_cisco]);

    await connection.query(insertQuery, [valuesParams]);

    await connection.commit(); // Validation

    res.status(200).json({ 
      success: true, 
      message: `${newDataToInsert.length} CISCO importés avec succès ! (${validRows.length - newDataToInsert.length} ignorés car existants)`
    });

  } catch (error) {
    if (connection) await connection.rollback(); // Annulation en cas d'erreur
    console.error("Erreur import Excel CISCO (Transaction Annulée):", error);
    res.status(500).json({ success: false, message: 'Erreur lors de l\'importation. Opération annulée.' });
  } finally {
    if (connection) connection.release(); // Libération de la connexion (ETAPE 10)
  }
};

exports.getAllCiscos = async (req, res) => {
  try {
    const { page = 1, limit = 500, search } = req.query; 
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
