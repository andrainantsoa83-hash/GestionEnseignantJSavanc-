const db = require('../config/db');

class Utilisateur {
  static async findAll() {
    const [rows] = await db.query('SELECT id, nom, role, code_service, cisco_id FROM utilisateurs');
    return rows;
  }

  static async findById(id) {
    const [rows] = await db.query('SELECT id, nom, role, code_service, cisco_id FROM utilisateurs WHERE id = ?', [id]);
    return rows[0];
  }

  static async create(data) {
    const { nom, role, code_service, password_hash, cisco_id } = data;
    const [result] = await db.query(
      'INSERT INTO utilisateurs (nom, role, code_service, password_hash, cisco_id) VALUES (?, ?, ?, ?, ?)',
      [nom, role, code_service, password_hash, cisco_id]
    );
    return result.insertId;
  }

  static async update(id, data) {
    const { nom, role, code_service, cisco_id } = data;
    const [result] = await db.query(
      'UPDATE utilisateurs SET nom = ?, role = ?, code_service = ?, cisco_id = ? WHERE id = ?',
      [nom, role, code_service, cisco_id, id]
    );
    return result.affectedRows;
  }

  static async updatePassword(id, password_hash) {
    const [result] = await db.query('UPDATE utilisateurs SET password_hash = ? WHERE id = ?', [password_hash, id]);
    return result.affectedRows;
  }

  static async delete(id) {
    const [result] = await db.query('DELETE FROM utilisateurs WHERE id = ?', [id]);
    return result.affectedRows;
  }
}

module.exports = Utilisateur;
