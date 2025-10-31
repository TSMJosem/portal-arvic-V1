const express = require('express');
const router = express.Router();
const { Report } = require('../models');

router.get('/', async (req, res) => {
  try {
    const { userId, status } = req.query;
    let query = {};
    if (userId) query.userId = userId;
    if (status) query.status = status;
    
    const reports = await Report.find(query);
    res.json({ success: true, data: reports });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const report = await Report.findOne({ id: req.params.id });
    if (!report) return res.status(404).json({ success: false, message: 'Reporte no encontrado' });
    res.json({ success: true, data: report });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.post('/', async (req, res) => {
  try {
    const data = req.body;
    if (!data.id) data.id = `report_${Date.now()}`;
    const report = new Report(data);
    await report.save();
    res.status(201).json({ success: true, message: 'Reporte creado', data: report });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const updates = { ...req.body, updatedAt: new Date() };
    const report = await Report.findOneAndUpdate({ id: req.params.id }, updates, { new: true });
    if (!report) return res.status(404).json({ success: false, message: 'Reporte no encontrado' });
    res.json({ success: true, message: 'Reporte actualizado', data: report });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const report = await Report.findOneAndDelete({ id: req.params.id });
    if (!report) return res.status(404).json({ success: false, message: 'Reporte no encontrado' });
    res.json({ success: true, message: 'Reporte eliminado' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
