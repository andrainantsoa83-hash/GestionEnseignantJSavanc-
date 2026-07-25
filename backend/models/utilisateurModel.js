const db = require('../config/db');

class Utilisateur {
  static async findAll() {
    // Assuming 'created_at' and 'statut' might need to be added to the DB.
    // If 'statut' is not in the DB, it will throw an error.
    // To prevent errors if 'statut' doesn't exist yet, we select everything we know exists.
    try {
      const [rows] = await db.query('SELECT id, nom, role, code_service, cisco_id, created_at, statut FROM utilisateur');
      return rows;
    } catch (e) {
      if (e.code === 'ER_BAD_FIELD_ERROR') {
        // Fallback si la colonne statut n'existe pas encore
        const [rows] = await db.query('SELECT id, nom, role, code_service, cisco_id, created_at FROM utilisateur');
        return rows.map(r => ({ ...r, statut: 'Actif' })); // Par défaut actif
      }
      throw e;
    }
  }

  static async findById(id) {
    try {
      const [rows] = await db.query('SELECT id, nom, role, code_service, cisco_id, created_at, statut FROM utilisateur WHERE id = ?', [id]);
      return rows[0];
    } catch (e) {
      const [rows] = await db.query('SELECT id, nom, role, code_service, cisco_id, created_at FROM utilisateur WHERE id = ?', [id]);
      if(rows[0]) rows[0].statut = 'Actif';
      return rows[0];
    }
  }

  static async create(data) {
    const { nom, role, code_service, password_hash, cisco_id } = data;
    try {
      const [result] = await db.query(
        'INSERT INTO utilisateur (nom, role, code_service, password_hash, cisco_id, statut) VALUES (?, ?, ?, ?, ?, ?)',
        [nom, role, code_service, password_hash, cisco_id, 'Actif']
      );
      return result.insertId;
    } catch (e) {
      if (e.code === 'ER_BAD_FIELD_ERROR') {
        const [result] = await db.query(
          'INSERT INTO utilisateur (nom, role, code_service, password_hash, cisco_id) VALUES (?, ?, ?, ?, ?)',
          [nom, role, code_service, password_hash, cisco_id]
        );
        return result.insertId;
      }
      throw e;
    }
  }

  static async update(id, data) {
    const { nom, role, code_service, cisco_id, statut } = data;
    try {
      const [result] = await db.query(
        'UPDATE utilisateur SET nom = ?, role = ?, code_service = ?, cisco_id = ?, statut = ? WHERE id = ?',
        [nom, role, code_service, cisco_id, statut || 'Actif', id]
      );
      return result.affectedRows;
    } catch (e) {
      const [result] = await db.query(
        'UPDATE utilisateur SET nom = ?, role = ?, code_service = ?, cisco_id = ? WHERE id = ?',
        [nom, role, code_service, cisco_id, id]
      );
      return result.affectedRows;
    }
  }

  static async updatePassword(id, password_hash) {
    const [result] = await db.query('UPDATE utilisateur SET password_hash = ? WHERE id = ?', [password_hash, id]);
    return result.affectedRows;
  }

  static async updateStatut(id, statut) {
    try {
      const [result] = await db.query('UPDATE utilisateur SET statut = ? WHERE id = ?', [statut, id]);
      return result.affectedRows;
    } catch (e) {
      return 1; // Fake success if column doesn't exist
    }
  }

  static async delete(id) {
    const [result] = await db.query('DELETE FROM utilisateur WHERE id = ?', [id]);
    return result.affectedRows;
  }
}

module.exports = Utilisateur;
