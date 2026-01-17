const express = require('express');
const router = express.Router();
const TaskAssignment = require('../models/TaskAssignment');

const Tarifario = require('../models/Tarifario'); // ← Agregar al inicio del archivo
const Company = require('../models/Company');
const Support = require('../models/Support');
const Module = require('../models/Module');
const User = require('../models/User');

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
    console.log('📝 Creando asignación de tarea:', req.body);
    
    // Crear asignación
    const taskAssignment = new TaskAssignment(req.body);
    await taskAssignment.save();
    
    console.log('✅ Asignación de tarea creada:', taskAssignment.taskAssignmentId);
    
    // ✅ NUEVO: Obtener datos relacionados para tarifario
    const [user, company, support, module] = await Promise.all([
      User.findOne({ userId: taskAssignment.consultorId }),
      Company.findOne({ companyId: taskAssignment.companyId }),
      Support.findOne({ supportId: taskAssignment.linkedSupportId }),
      Module.findOne({ moduleId: taskAssignment.moduleId })
    ]);
    
    // ✅ NUEVO: Crear entrada en tarifario automáticamente
    const margen = (taskAssignment.tarifaCliente || 0) - (taskAssignment.tarifaConsultor || 0);
    const margenPorcentaje = taskAssignment.tarifaCliente > 0 
      ? ((margen / taskAssignment.tarifaCliente) * 100).toFixed(2)
      : 0;
    
    const tarifario = new Tarifario({
      tarifarioId: `tarifa_${taskAssignment.taskAssignmentId}`,
      assignmentId: taskAssignment.taskAssignmentId,
      consultorId: taskAssignment.consultorId,
      consultorNombre: user ? user.name : 'Desconocido',
      companyId: taskAssignment.companyId,
      companyName: company ? company.name : 'Desconocido',
      supportId: taskAssignment.linkedSupportId,
      supportName: support ? support.name : 'Soporte vinculado',
      projectId: null,
      projectName: null,
      moduleId: taskAssignment.moduleId,
      moduleName: module ? module.name : 'Desconocido',
      costoConsultor: taskAssignment.tarifaConsultor || 0,
      costoCliente: taskAssignment.tarifaCliente || 0,
      margen: margen,
      margenPorcentaje: parseFloat(margenPorcentaje),
      tipo: 'task',
      descripcionTarea: taskAssignment.descripcion || null,
      isActive: true
    });
    
    await tarifario.save();
    console.log('✅ Tarifario de tarea creado:', tarifario.tarifarioId);
    
    res.status(201).json({ 
      success: true, 
      message: 'Asignación de tarea y tarifario creados exitosamente',
      data: taskAssignment 
    });
  } catch (error) {
    console.error('❌ Error creando asignación de tarea:', error);
    res.status(400).json({ 
      success: false, 
      message: error.message 
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