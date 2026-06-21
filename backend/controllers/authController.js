const db = require('../config/db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

exports.login = async (req, res) => {
  try {
    const { nom, password } = req.body;

    if (!nom || !password) {
      return res.status(400).json({ success: false, message: 'Nom et mot de passe requis' });
    }

    // 1. Chercher l'utilisateur par nom
    const [rows] = await db.query('SELECT * FROM utilisateurs WHERE nom = ?', [nom]);
    
    if (rows.length === 0) {
      return res.status(401).json({ success: false, message: 'Identifiants incorrects' });
    }

    const utilisateur = rows[0];

    // 2. Comparer le mot de passe
    const isMatch = await bcrypt.compare(password, utilisateur.password_hash);
    
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Identifiants incorrects' });
    }

    // 3. Générer le token JWT
    const secret = process.env.JWT_SECRET || 'secret_dren_2026';
    const payload = {
      id: utilisateur.id,
      role: utilisateur.role,
      cisco_id: utilisateur.cisco_id
    };

    const token = jwt.sign(payload, secret, { expiresIn: '1d' });

    // 4. Retourner le résultat avec le token et les infos
    res.status(200).json({
      success: true,
      message: 'Connexion réussie',
      token,
      utilisateur: {
        id: utilisateur.id,
        nom: utilisateur.nom,
        role: utilisateur.role,
        code_service: utilisateur.code_service,
        cisco_id: utilisateur.cisco_id
      }
    });

  } catch (error) {
    console.error('Erreur login:', error);
    res.status(500).json({ success: false, message: 'Erreur serveur interne' });
  }
};
