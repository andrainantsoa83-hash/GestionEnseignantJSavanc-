const Commune = require('../models/communeModel');

exports.getAllCommunes = async (req, res) => {
  try {
    const { page = 1, limit = 5, search, id_cisco } = req.query;
    const result = await Commune.findAll(page, limit, search, id_cisco);
    res.status(200).json({ success: true, ...result });
  } catch (error) { res.status(500).json({ success: false }); }
};

exports.getCommuneById = async (req, res) => {
  try {
    const commune = await Commune.findById(req.params.id);
    if (!commune) return res.status(404).json({ success: false });
    res.status(200).json({ success: true, data: commune });
  } catch (error) { res.status(500).json({ success: false }); }
};

exports.createCommune = async (req, res) => {
  try {
    const id = await Commune.create(req.body);
    res.status(201).json({ success: true, id });
  } catch (error) { res.status(500).json({ success: false }); }
};

exports.updateCommune = async (req, res) => {
  try {
    const affected = await Commune.update(req.params.id, req.body);
    if (affected === 0) return res.status(404).json({ success: false });
    res.status(200).json({ success: true });
  } catch (error) { res.status(500).json({ success: false }); }
};

exports.deleteCommune = async (req, res) => {
  try {
    const affected = await Commune.delete(req.params.id);
    if (affected === 0) return res.status(404).json({ success: false });
    res.status(200).json({ success: true });
  } catch (error) { res.status(500).json({ success: false }); }
};

exports.getStatistiques = async (req, res) => {
  try {
    const stats = await Commune.getStatistiques(req.params.id);
    res.status(200).json({ success: true, data: stats });
  } catch (error) { res.status(500).json({ success: false }); }
};

exports.getBesoinRecrutement = async (req, res) => {
  try {
    const besoin = await Commune.getBesoinRecrutement(req.params.id);
    res.status(200).json({ success: true, data: besoin });
  } catch (error) { res.status(500).json({ success: false }); }
};

exports.getResume = async (req, res) => {
  try {
    const resume = await Commune.getResume(req.params.id);
    res.status(200).json({ success: true, data: resume });
  } catch (error) { res.status(500).json({ success: false }); }
};
