const Cisco = require('../models/ciscoModel');

exports.getAllCiscos = async (req, res) => {
  try {
    const { page = 1, limit = 5, search } = req.query;
    const result = await Cisco.findAll(page, limit, search);
    res.status(200).json({ success: true, ...result });
  } catch (error) { res.status(500).json({ success: false }); }
};

exports.getCiscoById = async (req, res) => {
  try {
    const cisco = await Cisco.findById(req.params.id);
    if (!cisco) return res.status(404).json({ success: false });
    res.status(200).json({ success: true, data: cisco });
  } catch (error) { res.status(500).json({ success: false }); }
};

exports.createCisco = async (req, res) => {
  try {
    const id = await Cisco.create(req.body);
    res.status(201).json({ success: true, id });
  } catch (error) { res.status(500).json({ success: false }); }
};

exports.updateCisco = async (req, res) => {
  try {
    const affected = await Cisco.update(req.params.id, req.body);
    if (affected === 0) return res.status(404).json({ success: false });
    res.status(200).json({ success: true });
  } catch (error) { res.status(500).json({ success: false }); }
};

exports.deleteCisco = async (req, res) => {
  try {
    const affected = await Cisco.delete(req.params.id);
    if (affected === 0) return res.status(404).json({ success: false });
    res.status(200).json({ success: true });
  } catch (error) { res.status(500).json({ success: false }); }
};

exports.getStatistiques = async (req, res) => {
  try {
    const stats = await Cisco.getStatistiques(req.params.id);
    res.status(200).json({ success: true, data: stats });
  } catch (error) { res.status(500).json({ success: false }); }
};

exports.getBesoinRecrutement = async (req, res) => {
  try {
    const besoin = await Cisco.getBesoinRecrutement(req.params.id);
    res.status(200).json({ success: true, data: besoin });
  } catch (error) { res.status(500).json({ success: false }); }
};

exports.getResume = async (req, res) => {
  try {
    const resume = await Cisco.getResume(req.params.id);
    res.status(200).json({ success: true, data: resume });
  } catch (error) { res.status(500).json({ success: false }); }
};
