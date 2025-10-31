const express = require('express');
const router = express.Router();
const { Assignment, ProjectAssignment } = require('../models');

// Asignaciones de soporte
router.get('/', async (req, res) => {
  try {
    const assignments = await Assignment.find();
    res.json({ success: true, data: assignments });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

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

router.put('/:id', async (req, res) => {
  try {
    const assignment = await Assignment.findOneAndUpdate({ id: req.params.id }, req.body, { new: true });
    if (!assignment) return res.status(404).json({ success: false, message: 'Asignación no encontrada' });
    res.json({ success: true, message: 'Asignación actualizada', data: assignment });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const assignment = await Assignment.findOneAndDelete({ id: req.params.id });
    if (!assignment) return res.status(404).json({ success: false, message: 'Asignación no encontrada' });
    res.json({ success: true, message: 'Asignación eliminada' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Asignaciones de proyecto
router.get('/projects', async (req, res) => {
  try {
    const projectAssignments = await ProjectAssignment.find();
    res.json({ success: true, data: projectAssignments });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

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

router.put('/projects/:id', async (req, res) => {
  try {
    const projectAssignment = await ProjectAssignment.findOneAndUpdate({ id: req.params.id }, req.body, { new: true });
    if (!projectAssignment) return res.status(404).json({ success: false, message: 'Asignación de proyecto no encontrada' });
    res.json({ success: true, message: 'Asignación de proyecto actualizada', data: projectAssignment });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

router.delete('/projects/:id', async (req, res) => {
  try {
    const projectAssignment = await ProjectAssignment.findOneAndDelete({ id: req.params.id });
    if (!projectAssignment) return res.status(404).json({ success: false, message: 'Asignación de proyecto no encontrada' });
    res.json({ success: true, message: 'Asignación de proyecto eliminada' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
