const db = require('../config/db');

class Etablissement {
  static async findAll(page = 1, limit = 500, search = '', zap_id = null, commune_id = null) {
    const offset = (page - 1) * limit;
    let query = `
      SELECT 
        e.*, 
        z.nom_zap, 
        c.nom_commune, 
        ci.nom_cisco,
        (SELECT COUNT(*) FROM enseignant en WHERE en.etablissement_id = e.id) AS total_enseignants,
        (
          SELECT 
            COUNT(*) - COALESCE(SUM(CASE WHEN LOWER(statut) LIKE '%fonctionnaire%' THEN 1 ELSE 0 END), 0)
          FROM enseignant en WHERE en.etablissement_id = e.id
        ) AS besoin_recrutement
      FROM etablissement e
      LEFT JOIN zap z ON e.zap_id = z.id
      LEFT JOIN commune c ON e.commune_id = c.id
      LEFT JOIN cisco ci ON e.cisco_id = ci.id
      WHERE 1=1
    `;
    let countQuery = 'SELECT COUNT(*) as total FROM etablissement e WHERE 1=1';
    const params = [];

    if (search) {
      query += ' AND e.nom_etablissement LIKE ?';
      countQuery += ' AND e.nom_etablissement LIKE ?';
      params.push(`%${search}%`);
    }

    if (zap_id) {
      query += ' AND e.zap_id = ?';
      countQuery += ' AND e.zap_id = ?';
      params.push(zap_id);
    }
    
    if (commune_id) {
      query += ' AND e.commune_id = ?';
      countQuery += ' AND e.commune_id = ?';
      params.push(commune_id);
    }

    query += ' LIMIT ? OFFSET ?';
    const [rows] = await db.query(query, [...params, parseInt(limit), parseInt(offset)]);
    const [countRows] = await db.query(countQuery, params);

    return { data: rows, total: countRows[0].total, page: parseInt(page), limit: parseInt(limit) };
  }

  static async findById(id) {
    const [rows] = await db.query('SELECT * FROM etablissement WHERE id = ?', [id]);
    return rows[0];
  }

  static async create(data) {
    const { nom_etablissement, code_etablissement, type_etablissement, zap_id, commune_id, cisco_id } = data;
    const [result] = await db.query(
      'INSERT INTO etablissement (nom_etablissement, code_etablissement, type_etablissement, zap_id, commune_id, cisco_id) VALUES (?, ?, ?, ?, ?, ?)',
      [nom_etablissement, code_etablissement, type_etablissement, zap_id, commune_id, cisco_id]
    );
    return result.insertId;
  }

  static async update(id, data) {
    const { nom_etablissement, code_etablissement, type_etablissement, zap_id, commune_id, cisco_id } = data;
    const [result] = await db.query(
      'UPDATE etablissement SET nom_etablissement = ?, code_etablissement = ?, type_etablissement = ?, zap_id = ?, commune_id = ?, cisco_id = ? WHERE id = ?', 
      [nom_etablissement, code_etablissement, type_etablissement, zap_id, commune_id, cisco_id, id]
    );
    return result.affectedRows;
  }

  static async delete(id) {
    const [result] = await db.query('DELETE FROM etablissement WHERE id = ?', [id]);
    return result.affectedRows;
  }

  static async getStatistiques(id) {
    const query = 'SELECT statut, COUNT(*) as count FROM enseignant WHERE etablissement_id = ? GROUP BY statut';
    const [rows] = await db.query(query, [id]);
    const totalQuery = 'SELECT COUNT(*) as total FROM enseignant WHERE etablissement_id = ?';
    const [totalRows] = await db.query(totalQuery, [id]);
    return { total: totalRows[0].total, repartition: rows };
  }

  static async getBesoinRecrutement(id) {
    const query = `
      SELECT 
        SUM(CASE WHEN LOWER(statut) LIKE '%fonctionnaire%' THEN 1 ELSE 0 END) AS total_fonctionnaires,
        SUM(CASE WHEN LOWER(statut) NOT LIKE '%fonctionnaire%' THEN 1 ELSE 0 END) AS total_autres,
        (
          COUNT(*) - COALESCE(SUM(CASE WHEN LOWER(statut) LIKE '%fonctionnaire%' THEN 1 ELSE 0 END), 0)
        ) AS besoin_recrutement
      FROM enseignant WHERE etablissement_id = ?
    `;
    const [rows] = await db.query(query, [id]);
    return rows[0];
  }
}

module.exports = Etablissement;
