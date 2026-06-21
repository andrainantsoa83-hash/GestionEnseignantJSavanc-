const xlsx = require('xlsx');
const path = require('path');
const db = require('../config/db');

async function findOrCreate(tableName, conditions, insertData) {
  const keys = Object.keys(conditions);
  const values = Object.values(conditions);
  
  const whereClause = keys.map(k => `${k} = ?`).join(' AND ');
  const selectQuery = `SELECT id FROM ${tableName} WHERE ${whereClause} LIMIT 1`;
  
  const [rows] = await db.query(selectQuery, values);
  
  if (rows.length > 0) {
    return rows[0].id;
  } else {
    const insertKeys = Object.keys(insertData);
    const insertValues = Object.values(insertData);
    const placeholders = insertKeys.map(() => '?').join(', ');
    
    const insertQuery = `INSERT INTO ${tableName} (${insertKeys.join(', ')}) VALUES (${placeholders})`;
    const [result] = await db.query(insertQuery, insertValues);
    return result.insertId;
  }
}

async function importData(filePath) {
  console.log(`Début de l'importation depuis : ${filePath}`);
  
  try {
    const workbook = xlsx.readFile(filePath);
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    const data = xlsx.utils.sheet_to_json(sheet);
    
    console.log(`${data.length} lignes trouvées dans le fichier.`);

    const connection = await db.getConnection();
    await connection.beginTransaction();

    try {
      for (let i = 0; i < data.length; i++) {
        const row = data[i];
        
        const nomCisco = row['CISCO'] || row['Cisco'] || row['cisco'];
        const nomCommune = row['COMMUNE'] || row['Commune'] || row['commune'];
        const nomZap = row['ZAP'] || row['Zap'] || row['zap'];
        const nomEtablissement = row['ETABLISSEMENT'] || row['Etablissement'] || row['etablissement'];
        const nomEnseignant = row['NOM_ENSEIGNANT'] || row['Nom'] || row['nom'] || '';
        const prenomEnseignant = row['PRENOM_ENSEIGNANT'] || row['Prenom'] || row['prenom'] || '';
        const statut = row['STATUT'] || row['Statut'] || row['statut'] || 'autre';

        if (!nomCisco || !nomCommune || !nomZap || !nomEtablissement || !nomEnseignant) {
          continue;
        }

        const idCisco = await findOrCreate('ciscos', { nom: nomCisco }, { nom: nomCisco });
        const idCommune = await findOrCreate('communes', { nom: nomCommune, id_cisco: idCisco }, { nom: nomCommune, id_cisco: idCisco });
        const idZap = await findOrCreate('zaps', { nom: nomZap, id_commune: idCommune }, { nom: nomZap, id_commune: idCommune, id_cisco: idCisco });
        const idEtablissement = await findOrCreate('etablissements', { nom: nomEtablissement, id_zap: idZap }, { nom: nomEtablissement, id_zap: idZap, id_commune: idCommune });
        
        await findOrCreate(
          'enseignants',
          { nom: nomEnseignant, prenom: prenomEnseignant, id_etablissement: idEtablissement },
          { nom: nomEnseignant, prenom: prenomEnseignant, statut: statut, id_etablissement: idEtablissement, id_zap: idZap, id_commune: idCommune, id_cisco: idCisco }
        );
      }

      await connection.commit();
      console.log('Importation réussie !');
    } catch (err) {
      await connection.rollback();
      throw err;
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error("Erreur lors de l'importation :", error.message);
  }
  process.exit(0);
}

const fileArg = process.argv[2];
if (!fileArg) {
  process.exit(1);
}

const absolutePath = path.resolve(fileArg);
importData(absolutePath);
