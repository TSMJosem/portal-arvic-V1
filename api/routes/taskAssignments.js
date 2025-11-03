const express = require('express');
const router = express.Router();
const TaskAssignment = require('../models/TaskAssignment');

// GET todas las asignaciones de tarea
router.get('/', async (req, res) => {
  try {
    const taskAssignments = await TaskAssignment.find();
    res.json({ success: true, data: taskAssignments });
  } catch (error) {
    console.error('❌ Error obteniendo asignaciones de tarea:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// GET asignación de tarea por ID
router.get('/:id', async (req, res) => {
  try {
    const taskAssignment = await TaskAssignment.findOne({ taskAssignmentId: req.params.id });
    if (!taskAssignment) {
      return res.status(404).json({ success: false, message: 'Asignación de tarea no encontrada' });
    }
    res.json({ success: true, data: taskAssignment });
  } catch (error) {
    console.error('❌ Error obteniendo asignación de tarea:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// POST crear asignación de tarea
router.post('/', async (req, res) => {
  try {
    const taskAssignmentData = req.body;
    
    console.log('📥 Datos recibidos para crear asignación de tarea:', taskAssignmentData);
    
    if (!taskAssignmentData.taskAssignmentId) {
      return res.status(400).json({ 
        success: false, 
        message: 'El campo taskAssignmentId es requerido' 
      });
    }

    const existingTaskAssignment = await TaskAssignment.findOne({ 
      taskAssignmentId: taskAssignmentData.taskAssignmentId 
    });
    
    if (existingTaskAssignment) {
      return res.status(400).json({ 
        success: false, 
        message: 'Ya existe una asignación de tarea con ese ID' 
      });
    }

    const taskAssignment = new TaskAssignment(taskAssignmentData);
    await taskAssignment.save();

    console.log('✅ Asignación de tarea creada:', taskAssignment.taskAssignmentId);

    res.status(201).json({ 
      success: true, 
      message: 'Asignación de tarea creada exitosamente',
      data: taskAssignment 
    });
  } catch (error) {
    console.error('❌ Error creando asignación de tarea:', error);
    res.status(400).json({ 
      success: false, 
      message: error.message || 'Error al crear asignación de tarea' 
    });
  }
});

// PUT actualizar asignación de tarea
router.put('/:id', async (req, res) => {
  try {
    const updates = req.body;
    updates.updatedAt = new Date();
    
    console.log('📝 Actualizando asignación de tarea:', req.params.id, updates);
    
    const taskAssignment = await TaskAssignment.findOneAndUpdate(
      { taskAssignmentId: req.params.id },
      updates,
      { new: true, runValidators: true }
    );

    if (!taskAssignment) {
      return res.status(404).json({ success: false, message: 'Asignación de tarea no encontrada' });
    }

    console.log('✅ Asignación de tarea actualizada');

    res.json({ 
      success: true, 
      message: 'Asignación de tarea actualizada exitosamente',
      data: taskAssignment 
    });
  } catch (error) {
    console.error('❌ Error actualizando asignación de tarea:', error);
    res.status(400).json({ 
      success: false, 
      message: error.message || 'Error al actualizar asignación de tarea' 
    });
  }
});

// DELETE eliminar asignación de tarea
router.delete('/:id', async (req, res) => {
  try {
    console.log('🗑️ Eliminando asignación de tarea:', req.params.id);
    
    const taskAssignment = await TaskAssignment.findOneAndDelete({ 
      taskAssignmentId: req.params.id 
    });
    
    if (!taskAssignment) {
      return res.status(404).json({ success: false, message: 'Asignación de tarea no encontrada' });
    }
    
    console.log('✅ Asignación de tarea eliminada');
    
    res.json({ 
      success: true, 
      message: 'Asignación de tarea eliminada exitosamente' 
    });
  } catch (error) {
    console.error('❌ Error eliminando asignación de tarea:', error);
    res.status(500).json({ 
      success: false, 
      message: error.message || 'Error al eliminar asignación de tarea' 
    });
  }
});

module.exports = router;