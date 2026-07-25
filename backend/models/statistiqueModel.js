const db = require('../config/db');

class Statistique {
  // Stats générales par statut pour Cisco
  static async getByCisco(ciscoId) {
    const query = `
      SELECT statut, COUNT(*) as total 
      FROM enseignant 
      WHERE id_cisco = ? 
      GROUP BY statut
    `;
    const [rows] = await db.query(query, [ciscoId]);
    return rows;
  }

  // Calcul du besoin en recrutement (Cisco / Commune / ZAP)
  // Formule: Total fonctionnaires - (FRAM sub + FRAM non sub + contractuels + autres)
  static async getBesoinRecrutement(type, id) {
    const columnMap = {
      'cisco': 'id_cisco',
      'commune': 'id_commune',
      'zap': 'id_zap',
      'etablissement': 'id_etablissement'
    };
    
    const column = columnMap[type.toLowerCase()];
    if (!column) throw new Error("Type d'entité invalide");

    const query = `
      SELECT 
        SUM(CASE WHEN LOWER(statut) LIKE '%fonctionnaire%' THEN 1 ELSE 0 END) AS total_fonctionnaires,
        SUM(CASE WHEN LOWER(statut) NOT LIKE '%fonctionnaire%' THEN 1 ELSE 0 END) AS total_autres,
        (
          COUNT(*) - COALESCE(SUM(CASE WHEN LOWER(statut) LIKE '%fonctionnaire%' THEN 1 ELSE 0 END), 0)
        ) AS besoin_recrutement
      FROM enseignant 
      WHERE ${column} = ?
    `;
    
    const [rows] = await db.query(query, [id]);
    return rows[0];
  }
}

module.exports = Statistique;
