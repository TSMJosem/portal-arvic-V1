const express = require('express');
const router = express.Router();
const Support = require('../models/Support');

router.get('/', async (req, res) => {
  try {
    const supports = await Support.find();
    res.json({ success: true, data: supports });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const support = await Support.findOne({ supportId: req.params.id });
    if (!support) return res.status(404).json({ success: false, message: 'Soporte no encontrado' });
    res.json({ success: true, data: support });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.post('/', async (req, res) => {
  try {
    const data = req.body;
    
    if (!data.supportId) {
      data.supportId = `SUP${Date.now()}`;
    }

    const support = new Support(data);
    await support.save();
    res.status(201).json({ success: true, message: 'Soporte creado', data: support });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const support = await Support.findOneAndUpdate(
      { supportId: req.params.id },
      req.body,
      { new: true }
    );

    if (!support) {
      return res.status(404).json({ success: false, message: 'Soporte no encontrado' });
    }

    res.json({ success: true, message: 'Soporte actualizado', data: support });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const support = await Support.findOneAndDelete({ supportId: req.params.id });
    if (!support) return res.status(404).json({ success: false, message: 'Soporte no encontrado' });
    res.json({ success: true, message: 'Soporte eliminado' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
