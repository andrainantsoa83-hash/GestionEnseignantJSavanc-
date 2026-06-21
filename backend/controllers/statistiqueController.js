const Statistique = require('../models/statistiqueModel');

exports.getStatsByCisco = async (req, res) => {
  try {
    const { id } = req.params;
    const stats = await Statistique.getByCisco(id);
    
    res.status(200).json({
      success: true,
      data: stats
    });
  } catch (error) {
    console.error('Erreur lors de la récupération des statistiques:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur'
    });
  }
};

exports.getBesoinRecrutement = async (req, res) => {
  try {
    const { type, id } = req.params;
    
    // type doit être 'cisco', 'commune', 'zap' ou 'etablissement'
    const validTypes = ['cisco', 'commune', 'zap', 'etablissement'];
    if (!validTypes.includes(type.toLowerCase())) {
      return res.status(400).json({ success: false, message: 'Type invalide' });
    }

    const besoin = await Statistique.getBesoinRecrutement(type, id);
    
    res.status(200).json({
      success: true,
      data: besoin
    });
  } catch (error) {
    console.error('Erreur lors du calcul du besoin de recrutement:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur'
    });
  }
};
