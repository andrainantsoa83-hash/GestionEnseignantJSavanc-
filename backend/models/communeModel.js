const db = require('../config/db');

class Commune {
  static async findAll(page = 1, limit = 500, search = '', cisco_id = null) {
    const offset = (page - 1) * limit;
    let query = `
      SELECT c.*, ci.nom_cisco 
      FROM commune c 
      LEFT JOIN cisco ci ON c.cisco_id = ci.id 
      WHERE 1=1
    `;
    let countQuery = 'SELECT COUNT(*) as total FROM commune c WHERE 1=1';
    const params = [];

    if (search) {
      query += ' AND c.nom_commune LIKE ?';
      countQuery += ' AND c.nom_commune LIKE ?';
      params.push(`%${search}%`);
    }

    if (cisco_id) {
      query += ' AND c.cisco_id = ?';
      countQuery += ' AND c.cisco_id = ?';
      params.push(cisco_id);
    }

    query += ' LIMIT ? OFFSET ?';
    const [rows] = await db.query(query, [...params, parseInt(limit), parseInt(offset)]);
    const [countRows] = await db.query(countQuery, params);

    return { data: rows, total: countRows[0].total, page: parseInt(page), limit: parseInt(limit) };
  }

  static async findById(id) {
    const [rows] = await db.query('SELECT * FROM commune WHERE id = ?', [id]);
    return rows[0];
  }

  static async create(data) {
    const { nom_commune, code_commune, cisco_id } = data;
    const [result] = await db.query('INSERT INTO commune (nom_commune, code_commune, cisco_id) VALUES (?, ?, ?)', [nom_commune, code_commune, cisco_id]);
    return result.insertId;
  }

  static async update(id, data) {
    const { nom_commune, code_commune, cisco_id } = data;
    const [result] = await db.query('UPDATE commune SET nom_commune = ?, code_commune = ?, cisco_id = ? WHERE id = ?', [nom_commune, code_commune, cisco_id, id]);
    return result.affectedRows;
  }

  static async delete(id) {
    const [result] = await db.query('DELETE FROM commune WHERE id = ?', [id]);
    return result.affectedRows;
  }

  static async getStatistiques(id) {
    const query = 'SELECT statut, COUNT(*) as count FROM enseignant WHERE commune_id = ? GROUP BY statut';
    const [rows] = await db.query(query, [id]);
    const totalQuery = 'SELECT COUNT(*) as total FROM enseignant WHERE commune_id = ?';
    const [totalRows] = await db.query(totalQuery, [id]);
    return { total: totalRows[0].total, repartition: rows };
  }

  static async getBesoinRecrutement(id) {
    const query = `
      SELECT 
        SUM(CASE WHEN LOWER(statut) LIKE '%fonctionnaire%' THEN 1 ELSE 0 END) AS total_fonctionnaires,
        SUM(CASE WHEN LOWER(statut) NOT LIKE '%fonctionnaire%' THEN 1 ELSE 0 END) AS total_autres,
        (
          SUM(CASE WHEN LOWER(statut) LIKE '%fonctionnaire%' THEN 1 ELSE 0 END) -
          SUM(CASE WHEN LOWER(statut) NOT LIKE '%fonctionnaire%' THEN 1 ELSE 0 END)
        ) AS besoin_recrutement
      FROM enseignant WHERE commune_id = ?
    `;
    const [rows] = await db.query(query, [id]);
    return rows[0];
  }

  // NOUVEAU: Résumé des totaux (Zaps, Etablissements, Enseignants) pour la Commune
  static async getResume(id) {
    const [zaps] = await db.query('SELECT COUNT(*) as total FROM zap WHERE commune_id = ?', [id]);
    const [etabs] = await db.query('SELECT COUNT(*) as total FROM etablissement WHERE commune_id = ?', [id]);
    const [enseignants] = await db.query('SELECT COUNT(*) as total FROM enseignant WHERE commune_id = ?', [id]);

    return {
      total_zaps: zaps[0].total,
      total_etablissements: etabs[0].total,
      total_enseignants: enseignants[0].total
    };
  }
}

module.exports = Commune;
