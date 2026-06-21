const ActivityLog = require('../models/activityLogModel');

const logActivity = async (req, res, next) => {
  // On s'intéresse uniquement aux requêtes qui modifient la donnée
  const method = req.method;
  if (['POST', 'PUT', 'DELETE'].includes(method)) {
    
    // On doit s'assurer de récupérer l'événement après la réponse pour avoir les bons status
    res.on('finish', async () => {
      // Si la requête a échoué (4xx, 5xx), on ne logge pas forcément ou on logge avec un statut 'echoué'
      // Ici, on va loguer toutes les tentatives ayant abouti à un succès ou la simple intention
      
      const user_id = req.user ? req.user.id : null;
      if (!user_id) return; // Si pas d'utilisateur, on ignore

      const action = method;
      
      // Essayer de deviner l'entité via l'URL (ex: /api/enseignants -> enseignants)
      const pathParts = req.originalUrl.split('?')[0].split('/');
      let entity_type = pathParts[2] || 'inconnu'; 
      let entity_id = req.params.id || req.body.id || null;

      // Nettoyer les routes avec des paramètres (ex: /api/enseignants/5 -> enseignants)
      if (pathParts.length > 3 && !isNaN(pathParts[3])) {
         entity_type = pathParts[2];
         entity_id = pathParts[3];
      }

      const ip_address = req.headers['x-forwarded-for'] || req.socket.remoteAddress;

      try {
        await ActivityLog.create({
          user_id,
          action,
          entity_type,
          entity_id,
          ip_address
        });
      } catch (error) {
        console.error('Erreur lors de la journalisation (Audit Log):', error);
      }
    });
  }
  
  next();
};

module.exports = logActivity;
