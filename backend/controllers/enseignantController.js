const Enseignant = require('../models/enseignantModel');

exports.getAllEnseignants = async (req, res) => {
  try {
    const { page, limit, search } = req.query;
    const result = await Enseignant.findAll(page, limit, search);
    
    res.status(200).json({ success: true, ...result });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
};

exports.createEnseignant = async (req, res) => {
  try {
    const result = await Enseignant.create(req.body);
    res.status(201).json({ success: true, message: 'Enseignant créé avec succès', data: result });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
};
