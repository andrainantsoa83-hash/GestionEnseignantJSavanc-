const Etablissement = require('../models/etablissementModel');

exports.getAllEtablissements = async (req, res) => {
  try {
    const { page = 1, limit = 5, search, id_zap, id_commune } = req.query;
    const result = await Etablissement.findAll(page, limit, search, id_zap, id_commune);
    res.status(200).json({ success: true, ...result });
  } catch (error) { res.status(500).json({ success: false }); }
};

exports.getEtablissementById = async (req, res) => {
  try {
    const etablissement = await Etablissement.findById(req.params.id);
    if (!etablissement) return res.status(404).json({ success: false });
    res.status(200).json({ success: true, data: etablissement });
  } catch (error) { res.status(500).json({ success: false }); }
};

exports.createEtablissement = async (req, res) => {
  try {
    const id = await Etablissement.create(req.body);
    res.status(201).json({ success: true, id });
  } catch (error) { res.status(500).json({ success: false }); }
};

exports.updateEtablissement = async (req, res) => {
  try {
    const affected = await Etablissement.update(req.params.id, req.body);
    if (affected === 0) return res.status(404).json({ success: false });
    res.status(200).json({ success: true });
  } catch (error) { res.status(500).json({ success: false }); }
};

exports.deleteEtablissement = async (req, res) => {
  try {
    const affected = await Etablissement.delete(req.params.id);
    if (affected === 0) return res.status(404).json({ success: false });
    res.status(200).json({ success: true });
  } catch (error) { res.status(500).json({ success: false }); }
};

exports.getStatistiques = async (req, res) => {
  try {
    const stats = await Etablissement.getStatistiques(req.params.id);
    res.status(200).json({ success: true, data: stats });
  } catch (error) { res.status(500).json({ success: false }); }
};

exports.getBesoinRecrutement = async (req, res) => {
  try {
    const besoin = await Etablissement.getBesoinRecrutement(req.params.id);
    res.status(200).json({ success: true, data: besoin });
  } catch (error) { res.status(500).json({ success: false }); }
};
