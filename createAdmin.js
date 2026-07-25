const bcrypt = require('./backend/node_modules/bcryptjs');
const db = require('./backend/config/db');

async function createAdmin() {
  try {
    const salt = await bcrypt.genSalt(10);
    const password_hash = await bcrypt.hash('admin123', salt);

    const query = `
      INSERT INTO utilisateur (nom, role, code_service, password_hash)
      VALUES (?, ?, ?, ?)
    `;
    
    await db.query(query, ['Admin Principal', 'DIRECTEUR_DREN', 'ADMIN-01', password_hash]);
    
    console.log('✅ Administrateur créé avec succès !');
    console.log('👉 Code Service : ADMIN-01');
    console.log('👉 Mot de passe : admin123');
    process.exit(0);
  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY') {
      console.log("⚠️ L'administrateur existe déjà.");
    } else {
      console.error('Erreur :', error);
    }
    process.exit(1);
  }
}

createAdmin();
