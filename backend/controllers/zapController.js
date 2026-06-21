const Zap = require('../models/zapModel');

exports.getAllZaps = async (req, res) => {
  try {
    const { page = 1, limit = 5, search, id_commune, id_cisco } = req.query;
    const result = await Zap.findAll(page, limit, search, id_commune, id_cisco);
    res.status(200).json({ success: true, ...result });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
};

exports.getZapById = async (req, res) => {
  try {
    const zap = await Zap.findById(req.params.id);
    if (!zap) return res.status(404).json({ success: false, message: 'ZAP non trouvée' });
    res.status(200).json({ success: true, data: zap });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
};

exports.createZap = async (req, res) => {
  try {
    const id = await Zap.create(req.body);
    res.status(201).json({ success: true, message: 'ZAP créée', id });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
};

exports.updateZap = async (req, res) => {
  try {
    const affected = await Zap.update(req.params.id, req.body);
    if (affected === 0) return res.status(404).json({ success: false, message: 'ZAP non trouvée' });
    res.status(200).json({ success: true, message: 'ZAP mise à jour' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
};

exports.deleteZap = async (req, res) => {
  try {
    const affected = await Zap.delete(req.params.id);
    if (affected === 0) return res.status(404).json({ success: false, message: 'ZAP non trouvée' });
    res.status(200).json({ success: true, message: 'ZAP supprimée' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
};

exports.getStatistiques = async (req, res) => {
  try {
    const stats = await Zap.getStatistiques(req.params.id);
    res.status(200).json({ success: true, data: stats });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
};

exports.getBesoinRecrutement = async (req, res) => {
  try {
    const besoin = await Zap.getBesoinRecrutement(req.params.id);
    res.status(200).json({ success: true, data: besoin });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
};

exports.getResume = async (req, res) => {
  try {
    const resume = await Zap.getResume(req.params.id);
    res.status(200).json({ success: true, data: resume });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
};
