const db = require('../config/db');

class Etablissement {
  static async findAll(page = 1, limit = 5, search = '', id_zap = null, id_commune = null) {
    const offset = (page - 1) * limit;
    let query = 'SELECT * FROM etablissements WHERE 1=1';
    let countQuery = 'SELECT COUNT(*) as total FROM etablissements WHERE 1=1';
    const params = [];

    if (search) {
      query += ' AND nom LIKE ?';
      countQuery += ' AND nom LIKE ?';
      params.push(`%${search}%`);
    }

    if (id_zap) {
      query += ' AND id_zap = ?';
      countQuery += ' AND id_zap = ?';
      params.push(id_zap);
    }
    
    if (id_commune) {
      query += ' AND id_commune = ?';
      countQuery += ' AND id_commune = ?';
      params.push(id_commune);
    }

    query += ' LIMIT ? OFFSET ?';
    const [rows] = await db.query(query, [...params, parseInt(limit), parseInt(offset)]);
    const [countRows] = await db.query(countQuery, params);

    return { data: rows, total: countRows[0].total, page: parseInt(page), limit: parseInt(limit) };
  }

  static async findById(id) {
    const [rows] = await db.query('SELECT * FROM etablissements WHERE id = ?', [id]);
    return rows[0];
  }

  static async create(data) {
    const { nom, id_zap, id_commune } = data;
    const [result] = await db.query('INSERT INTO etablissements (nom, id_zap, id_commune) VALUES (?, ?, ?)', [nom, id_zap, id_commune]);
    return result.insertId;
  }

  static async update(id, data) {
    const { nom, id_zap, id_commune } = data;
    const [result] = await db.query('UPDATE etablissements SET nom = ?, id_zap = ?, id_commune = ? WHERE id = ?', [nom, id_zap, id_commune, id]);
    return result.affectedRows;
  }

  static async delete(id) {
    const [result] = await db.query('DELETE FROM etablissements WHERE id = ?', [id]);
    return result.affectedRows;
  }

  static async getStatistiques(id) {
    const query = 'SELECT statut, COUNT(*) as count FROM enseignants WHERE id_etablissement = ? GROUP BY statut';
    const [rows] = await db.query(query, [id]);
    const totalQuery = 'SELECT COUNT(*) as total FROM enseignants WHERE id_etablissement = ?';
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
      FROM enseignants WHERE id_etablissement = ?
    `;
    const [rows] = await db.query(query, [id]);
    return rows[0];
  }
}

module.exports = Etablissement;
