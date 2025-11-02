const express = require('express');
const router = express.Router();
const Company = require('../models/Company');

router.get('/', async (req, res) => {
  try {
    const companies = await Company.find();
    res.json({ success: true, data: companies });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const company = await Company.findOne({ companyId: req.params.id });
    if (!company) return res.status(404).json({ success: false, message: 'Empresa no encontrada' });
    res.json({ success: true, data: company });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.post('/', async (req, res) => {
  try {
    const data = req.body;
    if (!data.id) data.id = `company_${Date.now()}`;
    const company = new Company(data);
    await company.save();
    res.status(201).json({ success: true, message: 'Empresa creada', data: company });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const company = await Company.findOneAndUpdate({ id: req.params.id }, req.body, { new: true });
    if (!company) return res.status(404).json({ success: false, message: 'Empresa no encontrada' });
    res.json({ success: true, message: 'Empresa actualizada', data: company });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const company = await Company.findOneAndDelete({ id: req.params.id });
    if (!company) return res.status(404).json({ success: false, message: 'Empresa no encontrada' });
    res.json({ success: true, message: 'Empresa eliminada' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
