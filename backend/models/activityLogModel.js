const db = require('../config/db');

class ActivityLog {
  static async create(logData) {
    const { user_id, action, entity_type, entity_id, ip_address } = logData;
    const query = `
      INSERT INTO activity_logs (user_id, action, entity_type, entity_id, ip_address) 
      VALUES (?, ?, ?, ?, ?)
    `;
    const [result] = await db.query(query, [user_id, action, entity_type, entity_id, ip_address]);
    return result.insertId;
  }

  static async findAll() {
    const query = `
      SELECT 
        l.id, 
        l.action, 
        l.entity_type, 
        l.entity_id, 
        l.timestamp, 
        l.ip_address,
        u.nom AS user_nom,
        u.role AS user_role
      FROM activity_logs l
      LEFT JOIN utilisateurs u ON l.user_id = u.id
      ORDER BY l.timestamp DESC
    `;
    const [rows] = await db.query(query);
    return rows;
  }
}

module.exports = ActivityLog;
