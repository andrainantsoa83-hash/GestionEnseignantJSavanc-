const mysql = require('mysql2/promise');
require('dotenv').config();

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'statistique_enseignants',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Test connection
const testConnection = async () => {
  try {
    const connection = await pool.getConnection();
    console.log('Connecté à la base de données MySQL avec succès.');
    connection.release();
  } catch (error) {
    console.error('Erreur de connexion à la base de données:', error.message);
  }
};

testConnection();

module.exports = pool;
