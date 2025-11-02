const express = require('express');
const router = express.Router();
const Module = require('../models/Module');

router.get('/', async (req, res) => {
  try {
    const modules = await Module.find();
    res.json({ success: true, data: modules });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.post('/', async (req, res) => {
  try {
    const data = req.body;
    if (!data.id) data.id = `module_${Date.now()}`;
    const module = new Module(data);
    await module.save();
    res.status(201).json({ success: true, message: 'Módulo creado', data: module });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const module = await Module.findOneAndUpdate({ moduleId: req.params.id }, req.body, { new: true });
    if (!module) return res.status(404).json({ success: false, message: 'Módulo no encontrado' });
    res.json({ success: true, message: 'Módulo actualizado', data: module });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const module = await Module.findOneAndDelete({ id: req.params.id });
    if (!module) return res.status(404).json({ success: false, message: 'Módulo no encontrado' });
    res.json({ success: true, message: 'Módulo eliminado' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
