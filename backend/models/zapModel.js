const db = require('../config/db');

class Zap {
  static async findAll(page = 1, limit = 500, search = '', commune_id = null, cisco_id = null) {
    const offset = (page - 1) * limit;
    let query = `
      SELECT 
        z.*, 
        c.nom_commune, 
        ci.nom_cisco,
        (SELECT COUNT(*) FROM etablissement et WHERE et.zap_id = z.id) AS total_etablissements,
        (SELECT COUNT(*) FROM enseignant en WHERE en.zap_id = z.id) AS total_enseignants,
        (
          SELECT 
            COUNT(*) - COALESCE(SUM(CASE WHEN LOWER(statut) LIKE '%fonctionnaire%' THEN 1 ELSE 0 END), 0)
          FROM enseignant en WHERE en.zap_id = z.id
        ) AS besoin_recrutement
      FROM zap z
      LEFT JOIN commune c ON z.commune_id = c.id
      LEFT JOIN cisco ci ON z.cisco_id = ci.id
      WHERE 1=1
    `;
    let countQuery = 'SELECT COUNT(*) as total FROM zap z WHERE 1=1';
    const params = [];

    if (search) {
      query += ' AND z.nom_zap LIKE ?';
      countQuery += ' AND z.nom_zap LIKE ?';
      params.push(`%${search}%`);
    }

    if (commune_id) {
      query += ' AND z.commune_id = ?';
      countQuery += ' AND z.commune_id = ?';
      params.push(commune_id);
    }

    if (cisco_id) {
      query += ' AND z.cisco_id = ?';
      countQuery += ' AND z.cisco_id = ?';
      params.push(cisco_id);
    }

    query += ' LIMIT ? OFFSET ?';
    
    const [rows] = await db.query(query, [...params, parseInt(limit), parseInt(offset)]);
    const [countRows] = await db.query(countQuery, params);

    return {
      data: rows,
      total: countRows[0].total,
      page: parseInt(page),
      limit: parseInt(limit)
    };
  }

  static async findById(id) {
    const [rows] = await db.query('SELECT * FROM zap WHERE id = ?', [id]);
    return rows[0];
  }

  static async create(data) {
    const { nom_zap, code_zap, commune_id, cisco_id } = data;
    const [result] = await db.query(
      'INSERT INTO zap (nom_zap, code_zap, commune_id, cisco_id) VALUES (?, ?, ?, ?)',
      [nom_zap, code_zap, commune_id, cisco_id]
    );
    return result.insertId;
  }

  static async update(id, data) {
    const { nom_zap, code_zap, commune_id, cisco_id } = data;
    const [result] = await db.query(
      'UPDATE zap SET nom_zap = ?, code_zap = ?, commune_id = ?, cisco_id = ? WHERE id = ?',
      [nom_zap, code_zap, commune_id, cisco_id, id]
    );
    return result.affectedRows;
  }

  static async delete(id) {
    const [result] = await db.query('DELETE FROM zap WHERE id = ?', [id]);
    return result.affectedRows;
  }

  static async getStatistiques(id) {
    const query = `
      SELECT statut, COUNT(*) as count 
      FROM enseignant 
      WHERE zap_id = ? 
      GROUP BY statut
    `;
    const [rows] = await db.query(query, [id]);
    
    const totalQuery = 'SELECT COUNT(*) as total FROM enseignant WHERE zap_id = ?';
    const [totalRows] = await db.query(totalQuery, [id]);

    return {
      total: totalRows[0].total,
      repartition: rows
    };
  }

  static async getBesoinRecrutement(id) {
    const query = `
      SELECT 
        SUM(CASE WHEN LOWER(statut) LIKE '%fonctionnaire%' THEN 1 ELSE 0 END) AS total_fonctionnaires,
        SUM(CASE WHEN LOWER(statut) NOT LIKE '%fonctionnaire%' THEN 1 ELSE 0 END) AS total_autres,
        (
          COUNT(*) - COALESCE(SUM(CASE WHEN LOWER(statut) LIKE '%fonctionnaire%' THEN 1 ELSE 0 END), 0)
        ) AS besoin_recrutement
      FROM enseignant 
      WHERE zap_id = ?
    `;
    const [rows] = await db.query(query, [id]);
    return rows[0];
  }

  static async getResume(id) {
    const [etabs] = await db.query('SELECT COUNT(*) as total FROM etablissement WHERE zap_id = ?', [id]);
    const [enseignants] = await db.query('SELECT COUNT(*) as total FROM enseignant WHERE zap_id = ?', [id]);

    return {
      total_etablissements: etabs[0].total,
      total_enseignants: enseignants[0].total
    };
  }
}

module.exports = Zap;
