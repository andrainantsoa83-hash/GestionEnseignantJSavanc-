const Stats = require('../models/statsModel');

exports.getGlobalStats = async (req, res) => {
  try {
    const data = await Stats.getGlobalDashboardStats();
    res.status(200).json({ success: true, data });
  } catch (error) {
    console.error('Erreur global stats:', error);
    res.status(500).json({ success: false, message: 'Erreur serveur interne' });
  }
};

exports.getStats = async (req, res) => {
  try {
    const { type, id } = req.params;
    
    const validTypes = ['cisco', 'commune', 'zap', 'etablissement'];
    if (!validTypes.includes(type.toLowerCase())) {
      return res.status(400).json({ success: false, message: 'Type invalide' });
    }

    if (!id || isNaN(id)) {
      return res.status(400).json({ success: false, message: 'ID invalide' });
    }

    const data = await Stats.getStatsByType(type, id);
    res.status(200).json(data);
  } catch (error) {
    console.error('Erreur lors de la récupération des statistiques:', error);
    res.status(500).json({ success: false, message: 'Erreur serveur interne' });
  }
};

exports.getCiscoCommuneStats = async (req, res) => {
  try {
    const { cisco_id } = req.params;

    if (!cisco_id || isNaN(cisco_id)) {
      return res.status(400).json({ success: false, message: 'ID Cisco invalide' });
    }

    const data = await Stats.getCiscoCommuneStats(cisco_id);
    res.status(200).json(data);
  } catch (error) {
    console.error('Erreur Stats Cisco-Commune:', error);
    if (error.message === "Cisco introuvable") {
      return res.status(404).json({ success: false, message: error.message });
    }
    res.status(500).json({ success: false, message: 'Erreur serveur interne' });
  }
};
