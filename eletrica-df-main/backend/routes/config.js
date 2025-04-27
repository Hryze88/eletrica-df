
const express = require('express');
const router = express.Router();
const Config = require('../models/Config');

// GET - Pega as configurações globais
router.get('/', async (req, res) => {
  try {
    const config = await Config.findOne();
    res.json(config);
  } catch (err) {
    res.status(500).json({ message: 'Erro ao buscar config' });
  }
});

// PUT - Atualiza as configurações (usado pelo admin)
router.put('/', async (req, res) => {
  try {
    const updated = await Config.findOneAndUpdate({}, req.body, {
      new: true,
      upsert: true,
    });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: 'Erro ao atualizar config' });
  }
});

module.exports = router;
