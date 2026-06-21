const db = require('../config/db');

class Commune {
  static async findAll(page = 1, limit = 5, search = '', id_cisco = null) {
    const offset = (page - 1) * limit;
    let query = 'SELECT * FROM communes WHERE 1=1';
    let countQuery = 'SELECT COUNT(*) as total FROM communes WHERE 1=1';
    const params = [];

    if (search) {
      query += ' AND nom LIKE ?';
      countQuery += ' AND nom LIKE ?';
      params.push(`%${search}%`);
    }

    if (id_cisco) {
      query += ' AND id_cisco = ?';
      countQuery += ' AND id_cisco = ?';
      params.push(id_cisco);
    }

    query += ' LIMIT ? OFFSET ?';
    const [rows] = await db.query(query, [...params, parseInt(limit), parseInt(offset)]);
    const [countRows] = await db.query(countQuery, params);

    return { data: rows, total: countRows[0].total, page: parseInt(page), limit: parseInt(limit) };
  }

  static async findById(id) {
    const [rows] = await db.query('SELECT * FROM communes WHERE id = ?', [id]);
    return rows[0];
  }

  static async create(data) {
    const { nom, id_cisco } = data;
    const [result] = await db.query('INSERT INTO communes (nom, id_cisco) VALUES (?, ?)', [nom, id_cisco]);
    return result.insertId;
  }

  static async update(id, data) {
    const { nom, id_cisco } = data;
    const [result] = await db.query('UPDATE communes SET nom = ?, id_cisco = ? WHERE id = ?', [nom, id_cisco, id]);
    return result.affectedRows;
  }

  static async delete(id) {
    const [result] = await db.query('DELETE FROM communes WHERE id = ?', [id]);
    return result.affectedRows;
  }

  static async getStatistiques(id) {
    const query = 'SELECT statut, COUNT(*) as count FROM enseignants WHERE id_commune = ? GROUP BY statut';
    const [rows] = await db.query(query, [id]);
    const totalQuery = 'SELECT COUNT(*) as total FROM enseignants WHERE id_commune = ?';
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
      FROM enseignants WHERE id_commune = ?
    `;
    const [rows] = await db.query(query, [id]);
    return rows[0];
  }

  // NOUVEAU: Résumé des totaux (Zaps, Etablissements, Enseignants) pour la Commune
  static async getResume(id) {
    const [zaps] = await db.query('SELECT COUNT(*) as total FROM zaps WHERE id_commune = ?', [id]);
    const [etabs] = await db.query('SELECT COUNT(*) as total FROM etablissements WHERE id_commune = ?', [id]);
    const [enseignants] = await db.query('SELECT COUNT(*) as total FROM enseignants WHERE id_commune = ?', [id]);

    return {
      total_zaps: zaps[0].total,
      total_etablissements: etabs[0].total,
      total_enseignants: enseignants[0].total
    };
  }
}

module.exports = Commune;
