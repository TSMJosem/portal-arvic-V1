const express = require('express');
const router = express.Router();
const { Tarifario } = require('../models');

router.get('/', async (req, res) => {
  try {
    const tarifario = await Tarifario.find();
    res.json({ success: true, data: tarifario });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.post('/', async (req, res) => {
  try {
    const data = req.body;
    if (!data.id) data.id = `tarifa_${Date.now()}`;
    const tarifa = new Tarifario(data);
    await tarifa.save();
    res.status(201).json({ success: true, message: 'Tarifa creada', data: tarifa });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const tarifa = await Tarifario.findOneAndUpdate({ id: req.params.id }, req.body, { new: true });
    if (!tarifa) return res.status(404).json({ success: false, message: 'Tarifa no encontrada' });
    res.json({ success: true, message: 'Tarifa actualizada', data: tarifa });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const tarifa = await Tarifario.findOneAndDelete({ id: req.params.id });
    if (!tarifa) return res.status(404).json({ success: false, message: 'Tarifa no encontrada' });
    res.json({ success: true, message: 'Tarifa eliminada' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
