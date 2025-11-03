const express = require('express');
const router = express.Router();
const ProjectAssignment = require('../models/ProjectAssignment');

// GET todas las asignaciones de proyecto
router.get('/', async (req, res) => {
  try {
    const projectAssignments = await ProjectAssignment.find();
    res.json({ success: true, data: projectAssignments });
  } catch (error) {
    console.error('❌ Error obteniendo asignaciones de proyecto:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// GET asignación de proyecto por ID
router.get('/:id', async (req, res) => {
  try {
    const projectAssignment = await ProjectAssignment.findOne({ projectAssignmentId: req.params.id });
    if (!projectAssignment) {
      return res.status(404).json({ success: false, message: 'Asignación de proyecto no encontrada' });
    }
    res.json({ success: true, data: projectAssignment });
  } catch (error) {
    console.error('❌ Error obteniendo asignación de proyecto:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// POST crear asignación de proyecto
router.post('/', async (req, res) => {
  try {
    const projectAssignmentData = req.body;
    
    console.log('📥 Datos recibidos para crear asignación de proyecto:', projectAssignmentData);
    
    if (!projectAssignmentData.projectAssignmentId) {
      return res.status(400).json({ 
        success: false, 
        message: 'El campo projectAssignmentId es requerido' 
      });
    }

    const existingProjectAssignment = await ProjectAssignment.findOne({ 
      projectAssignmentId: projectAssignmentData.projectAssignmentId 
    });
    
    if (existingProjectAssignment) {
      return res.status(400).json({ 
        success: false, 
        message: 'Ya existe una asignación de proyecto con ese ID' 
      });
    }

    const projectAssignment = new ProjectAssignment(projectAssignmentData);
    await projectAssignment.save();

    console.log('✅ Asignación de proyecto creada:', projectAssignment.projectAssignmentId);

    res.status(201).json({ 
      success: true, 
      message: 'Asignación de proyecto creada exitosamente',
      data: projectAssignment 
    });
  } catch (error) {
    console.error('❌ Error creando asignación de proyecto:', error);
    res.status(400).json({ 
      success: false, 
      message: error.message || 'Error al crear asignación de proyecto' 
    });
  }
});

// PUT actualizar asignación de proyecto
router.put('/:id', async (req, res) => {
  try {
    const updates = req.body;
    
    console.log('📝 Actualizando asignación de proyecto:', req.params.id, updates);
    
    const projectAssignment = await ProjectAssignment.findOneAndUpdate(
      { projectAssignmentId: req.params.id },
      updates,
      { new: true, runValidators: true }
    );

    if (!projectAssignment) {
      return res.status(404).json({ success: false, message: 'Asignación de proyecto no encontrada' });
    }

    console.log('✅ Asignación de proyecto actualizada');

    res.json({ 
      success: true, 
      message: 'Asignación de proyecto actualizada exitosamente',
      data: projectAssignment 
    });
  } catch (error) {
    console.error('❌ Error actualizando asignación de proyecto:', error);
    res.status(400).json({ 
      success: false, 
      message: error.message || 'Error al actualizar asignación de proyecto' 
    });
  }
});

// DELETE eliminar asignación de proyecto
router.delete('/:id', async (req, res) => {
  try {
    console.log('🗑️ Eliminando asignación de proyecto:', req.params.id);
    
    const projectAssignment = await ProjectAssignment.findOneAndDelete({ 
      projectAssignmentId: req.params.id 
    });
    
    if (!projectAssignment) {
      return res.status(404).json({ success: false, message: 'Asignación de proyecto no encontrada' });
    }
    
    console.log('✅ Asignación de proyecto eliminada');
    
    res.json({ 
      success: true, 
      message: 'Asignación de proyecto eliminada exitosamente' 
    });
  } catch (error) {
    console.error('❌ Error eliminando asignación de proyecto:', error);
    res.status(500).json({ 
      success: false, 
      message: error.message || 'Error al eliminar asignación de proyecto' 
    });
  }
});

module.exports = router;