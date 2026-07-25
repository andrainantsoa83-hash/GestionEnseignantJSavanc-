const jwt = require('jsonwebtoken');

// Middleware 1: Vérification du Token JWT
exports.verifyToken = (req, res, next) => {
  // Récupérer le header Authorization
  const authHeader = req.headers['authorization'];
  
  if (!authHeader) {
    return res.status(403).json({ success: false, message: 'Aucun token fourni. Accès refusé.' });
  }

  // Le format est généralement "Bearer [token]"
  const token = authHeader.split(' ')[1];

  if (!token) {
    return res.status(403).json({ success: false, message: 'Format du token invalide.' });
  }

  const secret = process.env.JWT_SECRET || 'secret_dren_2026';

  try {
    // Vérifier et décoder le token
    const decoded = jwt.verify(token, secret);
    
    // Attacher les informations de l'utilisateur à la requête pour les middlewares suivants
    req.user = decoded;
    next();
  } catch (error) {
    console.error('Erreur JWT verification:', error.message);
    return res.status(401).json({ success: false, message: 'Token invalide ou expiré.' });
  }
};

// Middleware 2: Vérification des permissions (Rôles)
// On accepte un tableau des rôles autorisés pour la route courante
exports.authorizeRoles = (...allowedRoles) => {
  return (req, res, next) => {
    // Si l'utilisateur n'est pas identifié (verifyToken n'a pas été appelé avant)
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'Utilisateur non authentifié.' });
    }

    const userRole = req.user.role;

    // Le DIRECTEUR_DREN a un accès total à l'ensemble du système
    if (userRole === 'DIRECTEUR_DREN') {
      return next();
    }

    // Vérifier si le rôle de l'utilisateur est dans la liste des rôles autorisés
    if (!allowedRoles.includes(userRole)) {
      return res.status(403).json({ 
        success: false, 
        message: `Accès bloqué. Votre rôle (${userRole}) ne vous permet pas d'accéder à cette ressource.` 
      });
    }

    // Si tout est bon, on passe au middleware/contrôleur suivant
    next();
  };
};

/* 
EXEMPLES D'UTILISATION DANS VOS ROUTES :

1. Route Stats + PDF (Autorisée pour : PROGRAMMATION et DIRECTEUR)
router.get('/pdf', verifyToken, authorizeRoles('CHEF_SERVICE_PROGRAMMATION'), ...);

2. Route Gestion de données / CRUD (Autorisée pour : ADMINISTRATION et DIRECTEUR)
router.post('/enseignants', verifyToken, authorizeRoles('CHEF_ADMINISTRATION', 'AGENT_STATISTIQUE'), ...);

3. Route Lecture seule + Saisie (Autorisée pour : AGENT et ADMINISTRATION et DIRECTEUR)
router.get('/enseignants', verifyToken, authorizeRoles('AGENT_STATISTIQUE', 'CHEF_ADMINISTRATION', 'CHEF_SERVICE_PROGRAMMATION'), ...);
*/
