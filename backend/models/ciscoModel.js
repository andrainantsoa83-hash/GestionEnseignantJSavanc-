const db = require('../config/db');

class Cisco {
  static async findAll(page = 1, limit = 5, search = '') {
    const offset = (page - 1) * limit;
    let query = 'SELECT * FROM cisco WHERE 1=1';
    let countQuery = 'SELECT COUNT(*) as total FROM cisco WHERE 1=1';
    const params = [];

    if (search) {
      query += ' AND nom_cisco LIKE ?';
      countQuery += ' AND nom_cisco LIKE ?';
      params.push(`%${search}%`);
    }

    query += ' LIMIT ? OFFSET ?';
    const [rows] = await db.query(query, [...params, parseInt(limit), parseInt(offset)]);
    const [countRows] = await db.query(countQuery, params);

    return { data: rows, total: countRows[0].total, page: parseInt(page), limit: parseInt(limit) };
  }

  static async findById(id) {
    const [rows] = await db.query('SELECT * FROM cisco WHERE id = ?', [id]);
    return rows[0];
  }

  static async create(data) {
    const { nom_cisco, code_cisco } = data;
    const [result] = await db.query('INSERT INTO cisco (nom_cisco, code_cisco) VALUES (?, ?)', [nom_cisco, code_cisco]);
    return result.insertId;
  }

  static async update(id, data) {
    const { nom_cisco, code_cisco } = data;
    const [result] = await db.query('UPDATE cisco SET nom_cisco = ?, code_cisco = ? WHERE id = ?', [nom_cisco, code_cisco, id]);
    return result.affectedRows;
  }

  static async delete(id) {
    const [result] = await db.query('DELETE FROM cisco WHERE id = ?', [id]);
    return result.affectedRows;
  }

  static async getStatistiques(id) {
    const query = 'SELECT statut, COUNT(*) as count FROM enseignant WHERE cisco_id = ? GROUP BY statut';
    const [rows] = await db.query(query, [id]);
    const totalQuery = 'SELECT COUNT(*) as total FROM enseignant WHERE cisco_id = ?';
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
      FROM enseignant WHERE cisco_id = ?
    `;
    const [rows] = await db.query(query, [id]);
    return rows[0];
  }

  // NOUVEAU: Résumé des totaux (Communes, Zaps, Etablissements, Enseignants)
  static async getResume(id) {
    const [communes] = await db.query('SELECT COUNT(*) as total FROM commune WHERE cisco_id = ?', [id]);
    const [zaps] = await db.query('SELECT COUNT(*) as total FROM zap WHERE cisco_id = ?', [id]);
    const [etabs] = await db.query('SELECT COUNT(*) as total FROM etablissement WHERE cisco_id = ?', [id]);
    const [enseignants] = await db.query('SELECT COUNT(*) as total FROM enseignant WHERE cisco_id = ?', [id]);

    return {
      total_communes: communes[0].total,
      total_zaps: zaps[0].total,
      total_etablissements: etabs[0].total,
      total_enseignants: enseignants[0].total
    };
  }
}

module.exports = Cisco;
