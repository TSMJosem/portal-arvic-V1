const express = require('express');
const router = express.Router();
const Assignment = require('../models/Assignment');

// GET todas las asignaciones
router.get('/', async (req, res) => {
  try {
    const assignments = await Assignment.find();
    res.json({ success: true, data: assignments });
  } catch (error) {
    console.error('❌ Error obteniendo asignaciones:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// GET asignación por ID
router.get('/:id', async (req, res) => {
  try {
    const assignment = await Assignment.findOne({ assignmentId: req.params.id });
    if (!assignment) {
      return res.status(404).json({ success: false, message: 'Asignación no encontrada' });
    }
    res.json({ success: true, data: assignment });
  } catch (error) {
    console.error('❌ Error obteniendo asignación:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// POST crear asignación
router.post('/', async (req, res) => {
  try {
    const assignmentData = req.body;
    
    console.log('📥 Datos recibidos para crear asignación:', assignmentData);
    
    if (!assignmentData.assignmentId) {
      return res.status(400).json({ 
        success: false, 
        message: 'El campo assignmentId es requerido' 
      });
    }

    const existingAssignment = await Assignment.findOne({ assignmentId: assignmentData.assignmentId });
    
    if (existingAssignment) {
      return res.status(400).json({ 
        success: false, 
        message: 'Ya existe una asignación con ese ID' 
      });
    }

    const assignment = new Assignment(assignmentData);
    await assignment.save();

    console.log('✅ Asignación creada:', assignment.assignmentId);

    res.status(201).json({ 
      success: true, 
      message: 'Asignación creada exitosamente',
      data: assignment 
    });
  } catch (error) {
    console.error('❌ Error creando asignación:', error);
    res.status(400).json({ 
      success: false, 
      message: error.message || 'Error al crear asignación' 
    });
  }
});

// PUT actualizar asignación
router.put('/:id', async (req, res) => {
  try {
    const updates = req.body;
    
    console.log('📝 Actualizando asignación:', req.params.id, updates);
    
    const assignment = await Assignment.findOneAndUpdate(
      { assignmentId: req.params.id },
      updates,
      { new: true, runValidators: true }
    );

    if (!assignment) {
      return res.status(404).json({ success: false, message: 'Asignación no encontrada' });
    }

    console.log('✅ Asignación actualizada');

    res.json({ 
      success: true, 
      message: 'Asignación actualizada exitosamente',
      data: assignment 
    });
  } catch (error) {
    console.error('❌ Error actualizando asignación:', error);
    res.status(400).json({ 
      success: false, 
      message: error.message || 'Error al actualizar asignación' 
    });
  }
});

// DELETE eliminar asignación
router.delete('/:id', async (req, res) => {
  try {
    console.log('🗑️ Eliminando asignación:', req.params.id);
    
    const assignment = await Assignment.findOneAndDelete({ assignmentId: req.params.id });
    
    if (!assignment) {
      return res.status(404).json({ success: false, message: 'Asignación no encontrada' });
    }
    
    console.log('✅ Asignación eliminada');
    
    res.json({ 
      success: true, 
      message: 'Asignación eliminada exitosamente' 
    });
  } catch (error) {
    console.error('❌ Error eliminando asignación:', error);
    res.status(500).json({ 
      success: false, 
      message: error.message || 'Error al eliminar asignación' 
    });
  }
});

module.exports = router;