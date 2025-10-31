const express = require('express');
const router = express.Router();
const { Assignment, ProjectAssignment, TaskAssignment } = require('../models');

// ============================================================================
// ASIGNACIONES DE SOPORTE
// ============================================================================

// Obtener todas las asignaciones de soporte
router.get('/', async (req, res) => {
  try {
    const assignments = await Assignment.find();
    res.json({ success: true, data: assignments });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Crear asignación de soporte
router.post('/', async (req, res) => {
  try {
    const data = req.body;
    if (!data.id) data.id = `assign_${Date.now()}`;
    const assignment = new Assignment(data);
    await assignment.save();
    res.status(201).json({ success: true, message: 'Asignación creada', data: assignment });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

// Actualizar asignación de soporte
router.put('/:id', async (req, res) => {
  try {
    const assignment = await Assignment.findOneAndUpdate({ id: req.params.id }, req.body, { new: true });
    if (!assignment) return res.status(404).json({ success: false, message: 'Asignación no encontrada' });
    res.json({ success: true, message: 'Asignación actualizada', data: assignment });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

// Eliminar asignación de soporte
router.delete('/:id', async (req, res) => {
  try {
    const assignment = await Assignment.findOneAndDelete({ id: req.params.id });
    if (!assignment) return res.status(404).json({ success: false, message: 'Asignación no encontrada' });
    res.json({ success: true, message: 'Asignación eliminada' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// ============================================================================
// ASIGNACIONES DE PROYECTO
// ============================================================================

// Obtener todas las asignaciones de proyecto
router.get('/projects', async (req, res) => {
  try {
    const projectAssignments = await ProjectAssignment.find();
    res.json({ success: true, data: projectAssignments });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Crear asignación de proyecto
router.post('/projects', async (req, res) => {
  try {
    const data = req.body;
    if (!data.id) data.id = `proj_assign_${Date.now()}`;
    const projectAssignment = new ProjectAssignment(data);
    await projectAssignment.save();
    res.status(201).json({ success: true, message: 'Asignación de proyecto creada', data: projectAssignment });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

// Actualizar asignación de proyecto
router.put('/projects/:id', async (req, res) => {
  try {
    const projectAssignment = await ProjectAssignment.findOneAndUpdate({ id: req.params.id }, req.body, { new: true });
    if (!projectAssignment) return res.status(404).json({ success: false, message: 'Asignación de proyecto no encontrada' });
    res.json({ success: true, message: 'Asignación de proyecto actualizada', data: projectAssignment });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

// Eliminar asignación de proyecto
router.delete('/projects/:id', async (req, res) => {
  try {
    const projectAssignment = await ProjectAssignment.findOneAndDelete({ id: req.params.id });
    if (!projectAssignment) return res.status(404).json({ success: false, message: 'Asignación de proyecto no encontrada' });
    res.json({ success: true, message: 'Asignación de proyecto eliminada' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// ============================================================================
// ASIGNACIONES DE TAREAS ⭐ NUEVO
// ============================================================================

// Obtener todas las tareas
router.get('/tasks', async (req, res) => {
  try {
    const tasks = await TaskAssignment.find();
    res.json({ success: true, data: tasks });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Obtener tareas por soporte
router.get('/tasks/by-support/:supportId', async (req, res) => {
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

// Obtener tareas independientes (sin soporte vinculado)
router.get('/tasks/independent', async (req, res) => {
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

// Obtener una tarea por ID
router.get('/tasks/:id', async (req, res) => {
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

// Crear nueva tarea
router.post('/tasks', async (req, res) => {
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

// Actualizar tarea
router.put('/tasks/:id', async (req, res) => {
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

// Desactivar tarea (soft delete)
router.delete('/tasks/:id', async (req, res) => {
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