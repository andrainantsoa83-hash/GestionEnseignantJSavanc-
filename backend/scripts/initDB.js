const db = require('../config/db');

const initDB = async () => {
  try {
    const connection = await db.getConnection();
    
    console.log("Création des tables en cours...");

    const queries = [
      `CREATE TABLE IF NOT EXISTS cisco (
        id INT AUTO_INCREMENT PRIMARY KEY,
        nom VARCHAR(255) NOT NULL
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;`,
      
      `CREATE TABLE IF NOT EXISTS commune (
        id INT AUTO_INCREMENT PRIMARY KEY,
        nom VARCHAR(255) NOT NULL,
        id_cisco INT,
        FOREIGN KEY (id_cisco) REFERENCES ciscos(id) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;`,
      
      `CREATE TABLE IF NOT EXISTS zap (
        id INT AUTO_INCREMENT PRIMARY KEY,
        nom VARCHAR(255) NOT NULL,
        id_commune INT,
        id_cisco INT,
        FOREIGN KEY (id_commune) REFERENCES communes(id) ON DELETE CASCADE,
        FOREIGN KEY (id_cisco) REFERENCES ciscos(id) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;`,
      
      `CREATE TABLE IF NOT EXISTS etablissement (
        id INT AUTO_INCREMENT PRIMARY KEY,
        nom VARCHAR(255) NOT NULL,
        id_zap INT,
        id_commune INT,
        FOREIGN KEY (id_zap) REFERENCES zaps(id) ON DELETE CASCADE,
        FOREIGN KEY (id_commune) REFERENCES communes(id) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;`,
      
      `CREATE TABLE IF NOT EXISTS enseignant (
        id INT AUTO_INCREMENT PRIMARY KEY,
        nom VARCHAR(255) NOT NULL,
        prenom VARCHAR(255),
        matiere VARCHAR(255),
        statut VARCHAR(100) NOT NULL,
        id_etablissement INT,
        id_zap INT,
        id_commune INT,
        id_cisco INT,
        FOREIGN KEY (id_etablissement) REFERENCES etablissements(id) ON DELETE CASCADE,
        FOREIGN KEY (id_zap) REFERENCES zaps(id) ON DELETE CASCADE,
        FOREIGN KEY (id_commune) REFERENCES communes(id) ON DELETE CASCADE,
        FOREIGN KEY (id_cisco) REFERENCES ciscos(id) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;`,
      
      `CREATE TABLE IF NOT EXISTS utilisateur (
        id INT AUTO_INCREMENT PRIMARY KEY,
        nom VARCHAR(255) NOT NULL UNIQUE,
        role ENUM('DIRECTEUR_DREN', 'CHEF_SERVICE_PROGRAMMATION', 'CHEF_ADMINISTRATION', 'AGENT_STATISTIQUE') NOT NULL,
        code_service VARCHAR(100),
        password_hash VARCHAR(255) NOT NULL,
        cisco_id INT NULL,
        FOREIGN KEY (cisco_id) REFERENCES ciscos(id) ON DELETE SET NULL
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;`,
      
      `CREATE TABLE IF NOT EXISTS activity_log (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT,
        action VARCHAR(50) NOT NULL,
        entity_type VARCHAR(100) NOT NULL,
        entity_id INT,
        timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
        ip_address VARCHAR(45),
        FOREIGN KEY (user_id) REFERENCES utilisateurs(id) ON DELETE SET NULL
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;`
    ];

    for (let query of queries) {
      await connection.query(query);
    }

    console.log("✅ Toutes les tables ont été créées avec succès !");
    connection.release();
    process.exit(0);
  } catch (error) {
    console.error("❌ Erreur lors de la création des tables :", error.message);
    process.exit(1);
  }
};

initDB();
