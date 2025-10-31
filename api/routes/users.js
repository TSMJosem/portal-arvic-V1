const express = require('express');
const router = express.Router();
const User = require('../models/User');

// GET todos los usuarios
router.get('/', async (req, res) => {
  try {
    const users = await User.find().select('-password');
    res.json({ success: true, data: users });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// GET usuario por ID
router.get('/:id', async (req, res) => {
  try {
    const user = await User.findOne({ id: req.params.id }).select('-password');
    if (!user) {
      return res.status(404).json({ success: false, message: 'Usuario no encontrado' });
    }
    res.json({ success: true, data: user });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// POST crear usuario
router.post('/', async (req, res) => {
  try {
    const userData = req.body;
    
    // Generar ID único si no viene
    if (!userData.id) {
      userData.id = `user_${Date.now()}`;
    }

    const user = new User(userData);
    await user.save();

    const userResponse = user.toObject();
    delete userResponse.password;

    res.status(201).json({ 
      success: true, 
      message: 'Usuario creado exitosamente',
      data: userResponse 
    });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

// PUT actualizar usuario
router.put('/:id', async (req, res) => {
  try {
    const updates = req.body;
    
    // Si se actualiza la contraseña, necesita re-hash
    if (updates.password) {
      const user = await User.findOne({ id: req.params.id });
      user.password = updates.password;
      await user.save();
      
      const userResponse = user.toObject();
      delete userResponse.password;
      
      return res.json({ 
        success: true, 
        message: 'Usuario actualizado exitosamente',
        data: userResponse 
      });
    }

    // Actualización normal sin contraseña
    const user = await User.findOneAndUpdate(
      { id: req.params.id },
      { ...updates, updatedAt: new Date() },
      { new: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({ success: false, message: 'Usuario no encontrado' });
    }

    res.json({ 
      success: true, 
      message: 'Usuario actualizado exitosamente',
      data: user 
    });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

// DELETE eliminar usuario
router.delete('/:id', async (req, res) => {
  try {
    const user = await User.findOneAndDelete({ id: req.params.id });
    if (!user) {
      return res.status(404).json({ success: false, message: 'Usuario no encontrado' });
    }
    res.json({ success: true, message: 'Usuario eliminado exitosamente' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
