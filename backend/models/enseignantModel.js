const db = require('../config/db');

class Enseignant {
  static async findAll(page = 1, limit = 500, search = '') {
    const offset = (page - 1) * limit;
    let query = `
      SELECT e.*, et.nom_etablissement, z.nom_zap, c.nom_commune, ci.nom_cisco 
      FROM enseignant e
      LEFT JOIN etablissement et ON e.etablissement_id = et.id
      LEFT JOIN zap z ON e.zap_id = z.id
      LEFT JOIN commune c ON e.commune_id = c.id
      LEFT JOIN cisco ci ON e.cisco_id = ci.id
      WHERE 1=1
    `;
    let countQuery = 'SELECT COUNT(*) as total FROM enseignant e WHERE 1=1';
    const params = [];

    if (search) {
      query += ' AND (e.nom_enseignant LIKE ? OR e.code_enseignant LIKE ?)';
      countQuery += ' AND (e.nom_enseignant LIKE ? OR e.code_enseignant LIKE ?)';
      params.push(`%${search}%`, `%${search}%`);
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
    const [rows] = await db.query('SELECT * FROM enseignant WHERE id = ?', [id]);
    return rows[0];
  }

  static async create(data) {
    const { code_enseignant, nom_enseignant, sexe, statut, etablissement_id, zap_id, commune_id, cisco_id } = data;
    const [result] = await db.query(
      'INSERT INTO enseignant (code_enseignant, nom_enseignant, sexe, statut, etablissement_id, zap_id, commune_id, cisco_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [code_enseignant, nom_enseignant, sexe, statut, etablissement_id, zap_id, commune_id, cisco_id]
    );
    return result.insertId;
  }

  static async update(id, data) {
    const { code_enseignant, nom_enseignant, sexe, statut, etablissement_id, zap_id, commune_id, cisco_id } = data;
    const [result] = await db.query(
      'UPDATE enseignant SET code_enseignant=?, nom_enseignant=?, sexe=?, statut=?, etablissement_id=?, zap_id=?, commune_id=?, cisco_id=? WHERE id=?',
      [code_enseignant, nom_enseignant, sexe, statut, etablissement_id, zap_id, commune_id, cisco_id, id]
    );
    return result.affectedRows;
  }

  static async delete(id) {
    const [result] = await db.query('DELETE FROM enseignant WHERE id = ?', [id]);
    return result.affectedRows;
  }
}

module.exports = Enseignant;
