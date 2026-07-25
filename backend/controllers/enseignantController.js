const Enseignant = require('../models/enseignantModel');
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

    const [allEtabs] = await db.query('SELECT id, nom_etablissement, zap_id, commune_id, cisco_id FROM etablissement');
    const etabMap = new Map();
    for (const et of allEtabs) {
      if (et.nom_etablissement) etabMap.set(et.nom_etablissement.toLowerCase(), { 
        id: et.id, zap_id: et.zap_id, commune_id: et.commune_id, cisco_id: et.cisco_id 
      });
    }

    const validRows = [];
    for (let row of rawData) {
      // Normaliser les clés
      const normalizedRow = {};
      for (const key in row) {
        normalizedRow[key.toString().trim().toLowerCase()] = row[key];
      }

      const codeEnseignant = (normalizedRow['code_enseignant'] || normalizedRow['code enseignant'] || normalizedRow['matricule'] || normalizedRow['cin'] || '').toString().trim();
      const nomEnseignant = (normalizedRow['nom_enseignant'] || normalizedRow['nom enseignant'] || normalizedRow['nom'] || '').toString().trim();
      const sexe = (normalizedRow['sexe'] || 'M').toString().trim();
      const statut = (normalizedRow['statut'] || 'Autre').toString().trim();
      const refEtab = (normalizedRow['nom_etablissement'] || normalizedRow['nom etablissement'] || normalizedRow['etablissement'] || '').toString().trim().toLowerCase();

      // Pour l'enseignant, le code n'est pas forcément obligatoire s'il n'en a pas, mais c'est mieux s'il y est pour éviter les doublons.
      // Si aucun code/matricule/CIN n'est fourni, on peut générer un code temporaire ou l'ignorer selon la règle. Le prompt disait "seulement les enseignant qui n a pas code donc on va reste vide", on accepte donc vide.
      if (!nomEnseignant || !refEtab) continue;

      const etabData = etabMap.get(refEtab);
      if (!etabData) continue; 

      validRows.push({ 
        code_enseignant: codeEnseignant, 
        nom_enseignant: nomEnseignant, 
        sexe: sexe,
        statut: statut,
        etablissement_id: etabData.id,
        zap_id: etabData.zap_id,
        commune_id: etabData.commune_id,
        cisco_id: etabData.cisco_id
      });
    }

    if (validRows.length === 0) {
      return res.status(200).json({ success: true, message: 'Aucune donnée valide trouvée ou Établissement introuvable.' });
    }

    const uniqueRows = [];
    const seenCodes = new Set();
    // On déduplique uniquement ceux qui ONT un code. S'ils n'en ont pas, on les garde tous (risque de vrais doublons homonymes, mais c'est le métier).
    for (const row of validRows) {
      if (row.code_enseignant) {
        if (!seenCodes.has(row.code_enseignant)) {
          seenCodes.add(row.code_enseignant);
          uniqueRows.push(row);
        }
      } else {
        uniqueRows.push(row);
      }
    }

    const [existingRecords] = await db.query('SELECT code_enseignant FROM enseignant WHERE code_enseignant != "" AND code_enseignant IS NOT NULL');
    const existingCodes = new Set(existingRecords.map(r => r.code_enseignant));

    const newDataToInsert = uniqueRows.filter(row => !row.code_enseignant || !existingCodes.has(row.code_enseignant));

    if (newDataToInsert.length === 0) {
      return res.status(200).json({ success: true, message: 'Toutes les données avec code du fichier existent déjà dans la base.' });
    }

    connection = await db.getConnection();
    await connection.beginTransaction();

    const insertQuery = 'INSERT INTO enseignant (code_enseignant, nom_enseignant, sexe, statut, etablissement_id, zap_id, commune_id, cisco_id) VALUES ?';
    const valuesParams = newDataToInsert.map(r => [r.code_enseignant, r.nom_enseignant, r.sexe, r.statut, r.etablissement_id, r.zap_id, r.commune_id, r.cisco_id]);

    // MySQL permet le bulk insert jusqu'à plusieurs milliers de lignes sans problème
    // Pour des très gros fichiers (> 10000), il faudrait chunker par 5000, mais ici valuesParams suffit
    await connection.query(insertQuery, [valuesParams]);
    await connection.commit();

    res.status(200).json({ 
      success: true, 
      message: `${newDataToInsert.length} Enseignants importés avec succès ! (${validRows.length - newDataToInsert.length} ignorés)` 
    });

  } catch (error) {
    if (connection) await connection.rollback();
    console.error("Erreur import Excel Enseignant:", error);
    res.status(500).json({ success: false, message: 'Erreur lors de l\'importation. Opération annulée.' });
  } finally {
    if (connection) connection.release();
  }
};

exports.getAllEnseignants = async (req, res) => {
  try {
    const { page = 1, limit = 500, search } = req.query;
    const result = await Enseignant.findAll(page, limit, search);
    res.status(200).json({ success: true, ...result });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
};

exports.getEnseignantById = async (req, res) => {
  try {
    const enseignant = await Enseignant.findById(req.params.id);
    if (!enseignant) return res.status(404).json({ success: false, message: 'Enseignant non trouvé' });
    res.status(200).json({ success: true, data: enseignant });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
};

exports.createEnseignant = async (req, res) => {
  try {
    const id = await Enseignant.create(req.body);
    res.status(201).json({ success: true, message: 'Enseignant créé', id });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
};

exports.updateEnseignant = async (req, res) => {
  try {
    const affected = await Enseignant.update(req.params.id, req.body);
    if (affected === 0) return res.status(404).json({ success: false, message: 'Enseignant non trouvé' });
    res.status(200).json({ success: true, message: 'Enseignant mis à jour' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
};

exports.deleteEnseignant = async (req, res) => {
  try {
    const affected = await Enseignant.delete(req.params.id);
    if (affected === 0) return res.status(404).json({ success: false, message: 'Enseignant non trouvé' });
    res.status(200).json({ success: true, message: 'Enseignant supprimé' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
};
