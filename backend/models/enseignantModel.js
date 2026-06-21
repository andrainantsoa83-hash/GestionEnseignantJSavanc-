const db = require('../config/db');

class Enseignant {
  static async findAll(page = 1, limit = 10, search = '') {
    const offset = (page - 1) * limit;
    let query = 'SELECT * FROM enseignants';
    let countQuery = 'SELECT COUNT(*) as total FROM enseignants';
    const params = [];

    if (search) {
      query += ' WHERE nom LIKE ? OR prenom LIKE ?';
      countQuery += ' WHERE nom LIKE ? OR prenom LIKE ?';
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

  static async create(enseignantData) {
    const { nom, prenom, matiere } = enseignantData;
    const [result] = await db.query(
      'INSERT INTO enseignants (nom, prenom, matiere) VALUES (?, ?, ?)',
      [nom, prenom, matiere]
    );
    return result;
  }
  static async findById(id) {
    const [rows] = await db.query('SELECT * FROM enseignants WHERE id = ?', [id]);
    return rows[0];
  }

  static async update(id, enseignantData) {
    const { nom, prenom, matiere, statut, id_etablissement, id_zap, id_commune, id_cisco } = enseignantData;
    const [result] = await db.query(
      'UPDATE enseignants SET nom=?, prenom=?, matiere=?, statut=?, id_etablissement=?, id_zap=?, id_commune=?, id_cisco=? WHERE id=?',
      [nom, prenom, matiere, statut, id_etablissement, id_zap, id_commune, id_cisco, id]
    );
    return result.affectedRows;
  }

  static async delete(id) {
    const [result] = await db.query('DELETE FROM enseignants WHERE id = ?', [id]);
    return result.affectedRows;
  }
}

module.exports = Enseignant;
