const express = require('express');
const router = express.Router();
const Report = require('../models/Report');

// GET todos los reportes
router.get('/', async (req, res) => {
  try {
    const reports = await Report.find().sort({ date: -1 });
    res.json({ success: true, data: reports });
  } catch (error) {
    console.error('❌ Error obteniendo reportes:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// GET reporte por ID
router.get('/:id', async (req, res) => {
  try {
    const report = await Report.findOne({ reportId: req.params.id });
    if (!report) {
      return res.status(404).json({ success: false, message: 'Reporte no encontrado' });
    }
    res.json({ success: true, data: report });
  } catch (error) {
    console.error('❌ Error obteniendo reporte:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// GET reportes por usuario
router.get('/user/:userId', async (req, res) => {
  try {
    const reports = await Report.find({ userId: req.params.userId }).sort({ date: -1 });
    res.json({ success: true, data: reports });
  } catch (error) {
    console.error('❌ Error obteniendo reportes del usuario:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// GET reportes por compañía
router.get('/company/:companyId', async (req, res) => {
  try {
    const reports = await Report.find({ companyId: req.params.companyId }).sort({ date: -1 });
    res.json({ success: true, data: reports });
  } catch (error) {
    console.error('❌ Error obteniendo reportes de la compañía:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// POST crear reporte
router.post('/', async (req, res) => {
  try {
    const reportData = req.body;
    
    console.log('📥 Datos recibidos para crear reporte:', reportData);
    
    if (!reportData.reportId) {
      return res.status(400).json({ 
        success: false, 
        message: 'El campo reportId es requerido' 
      });
    }

    const existingReport = await Report.findOne({ reportId: reportData.reportId });
    
    if (existingReport) {
      return res.status(400).json({ 
        success: false, 
        message: 'Ya existe un reporte con ese ID' 
      });
    }

    const report = new Report(reportData);
    await report.save();

    console.log('✅ Reporte creado:', report.reportId);

    res.status(201).json({ 
      success: true, 
      message: 'Reporte creado exitosamente',
      data: report 
    });
  } catch (error) {
    console.error('❌ Error creando reporte:', error);
    res.status(400).json({ 
      success: false, 
      message: error.message || 'Error al crear reporte' 
    });
  }
});

// PUT actualizar reporte
router.put('/:id', async (req, res) => {
  try {
    const updates = req.body;
    updates.updatedAt = new Date();
    
    // Si el reporte se está resubmitiendo, actualizar fecha
    if (updates.status === 'Resubmitted') {
      updates.resubmittedAt = new Date();
    }
    
    console.log('📝 Actualizando reporte:', req.params.id, updates);
    
    const report = await Report.findOneAndUpdate(
      { reportId: req.params.id },
      updates,
      { new: true, runValidators: true }
    );

    if (!report) {
      return res.status(404).json({ success: false, message: 'Reporte no encontrado' });
    }

    console.log('✅ Reporte actualizado');

    res.json({ 
      success: true, 
      message: 'Reporte actualizado exitosamente',
      data: report 
    });
  } catch (error) {
    console.error('❌ Error actualizando reporte:', error);
    res.status(400).json({ 
      success: false, 
      message: error.message || 'Error al actualizar reporte' 
    });
  }
});

// DELETE eliminar reporte
router.delete('/:id', async (req, res) => {
  try {
    console.log('🗑️ Eliminando reporte:', req.params.id);
    
    const report = await Report.findOneAndDelete({ reportId: req.params.id });
    
    if (!report) {
      return res.status(404).json({ success: false, message: 'Reporte no encontrado' });
    }
    
    console.log('✅ Reporte eliminado');
    
    res.json({ 
      success: true, 
      message: 'Reporte eliminado exitosamente' 
    });
  } catch (error) {
    console.error('❌ Error eliminando reporte:', error);
    res.status(500).json({ 
      success: false, 
      message: error.message || 'Error al eliminar reporte' 
    });
  }
});

module.exports = router;