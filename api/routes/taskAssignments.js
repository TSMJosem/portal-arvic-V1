const express = require('express');
const router = express.Router();
const { TaskAssignment } = require('../models');

// ============================================================================
// OBTENER TODAS LAS TAREAS
// ============================================================================
router.get('/', async (req, res) => {
  try {
    const tasks = await TaskAssignment.find();
    res.json({ success: true, data: tasks });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// ============================================================================
// OBTENER TAREAS POR SOPORTE
// ============================================================================
router.get('/by-support/:supportId', async (req, res) => {
  try {
    const tasks = await TaskAssignment.find({ 
      linkedSupportId: req.params.supportId,
      isActive: true 
    });
    res.json({ success: true, data: tasks });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// ============================================================================
// OBTENER TAREAS INDEPENDIENTES (sin soporte vinculado)
// ============================================================================
router.get('/independent', async (req, res) => {
  try {
    const tasks = await TaskAssignment.find({
      $or: [
        { linkedSupportId: null },
        { linkedSupportId: { $exists: false } },
        { linkedSupportId: '' }
      ],
      isActive: true
    });
    res.json({ success: true, data: tasks });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// ============================================================================
// OBTENER UNA TAREA POR ID
// ============================================================================
router.get('/:id', async (req, res) => {
  try {
    const task = await TaskAssignment.findOne({ id: req.params.id });
    if (!task) {
      return res.status(404).json({ success: false, message: 'Tarea no encontrada' });
    }
    res.json({ success: true, data: task });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// ============================================================================
// CREAR NUEVA TAREA
// ============================================================================
router.post('/', async (req, res) => {
  try {
    const data = req.body;
    if (!data.id) data.id = `task_${Date.now()}`;
    
    const task = new TaskAssignment(data);
    await task.save();
    
    res.status(201).json({ 
      success: true, 
      message: 'Tarea creada exitosamente', 
      data: task 
    });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

// ============================================================================
// ACTUALIZAR TAREA
// ============================================================================
router.put('/:id', async (req, res) => {
  try {
    const task = await TaskAssignment.findOneAndUpdate(
      { id: req.params.id }, 
      { ...req.body, updatedAt: Date.now() }, 
      { new: true }
    );
    
    if (!task) {
      return res.status(404).json({ success: false, message: 'Tarea no encontrada' });
    }
    
    res.json({ 
      success: true, 
      message: 'Tarea actualizada exitosamente', 
      data: task 
    });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

// ============================================================================
// DESACTIVAR TAREA (soft delete)
// ============================================================================
router.delete('/:id', async (req, res) => {
  try {
    const task = await TaskAssignment.findOneAndUpdate(
      { id: req.params.id },
      { isActive: false, updatedAt: Date.now() },
      { new: true }
    );
    
    if (!task) {
      return res.status(404).json({ success: false, message: 'Tarea no encontrada' });
    }
    
    res.json({ 
      success: true, 
      message: 'Tarea desactivada exitosamente' 
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;