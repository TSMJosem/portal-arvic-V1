const express = require('express');
const router = express.Router();
const User = require('../models/User');
const jwt = require('jsonwebtoken'); 

// GET todos los usuarios
router.get('/', async (req, res) => {
  try {
    const users = await User.find().select('-password');
    res.json({ success: true, data: users });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// ✅ Endpoint DEDICADO para obtener contraseñas (solo validación)
router.get('/passwords', async (req, res) => {
  try {
    // Solo admin puede acceder
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ success: false, message: 'No autorizado' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    if (decoded.role !== 'admin') {
      return res.status(403).json({ 
        success: false, 
        message: 'Solo administradores pueden validar contraseñas' 
      });
    }

    // Solo devolver userId y password (mínimo necesario)
    const users = await User.find({}, 'userId password');
    const passwords = users
      .filter(u => u.password)
      .map(u => ({ userId: u.userId, password: u.password }));

    res.json({ success: true, data: passwords });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// ✅ GET individual SIN password de nuevo (más seguro)
router.get('/:id', async (req, res) => {
  try {
    const user = await User.findOne({ userId: req.params.id })
      .select('-password');  // ← Volver a excluir password
    
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
    
    console.log('📥 Datos recibidos para crear usuario:', userData);
    
    // Validar campos requeridos
    if (!userData.userId) {
      return res.status(400).json({ 
        success: false, 
        message: 'El campo userId es requerido' 
      });
    }

    if (!userData.password) {
      return res.status(400).json({ 
        success: false, 
        message: 'El campo password es requerido' 
      });
    }

    // Verificar que no exista el usuario
    const existingUser = await User.findOne({ 
      $or: [
        { userId: userData.userId },
        { email: userData.email }
      ]
    });

    if (existingUser) {
      return res.status(400).json({ 
        success: false, 
        message: 'El usuario o email ya existe' 
      });
    }

    // Crear usuario
    const user = new User(userData);
    await user.save();

    const userResponse = user.toObject();
    delete userResponse.password;

    console.log('✅ Usuario creado:', userResponse);

    res.status(201).json({ 
      success: true, 
      message: 'Usuario creado exitosamente',
      data: userResponse 
    });
  } catch (error) {
    console.error('❌ Error creando usuario:', error);
    res.status(400).json({ 
      success: false, 
      message: error.message || 'Error al crear usuario' 
    });
  }
});

// PUT actualizar usuario
router.put('/:id', async (req, res) => {
  try {
    const updates = req.body;
    
    console.log('📝 Actualizando usuario:', req.params.id, updates);
    
    // Si se actualiza la contraseña, necesita re-hash
    if (updates.password) {
      const user = await User.findOne({ userId: req.params.id });  // ✅ userId
      
      if (!user) {
        return res.status(404).json({ success: false, message: 'Usuario no encontrado' });
      }
      
      user.password = updates.password;
      
      // Actualizar otros campos si vienen
      if (updates.name) user.name = updates.name;
      if (updates.email) user.email = updates.email;
      if (updates.role) user.role = updates.role;
      if (updates.isActive !== undefined) user.isActive = updates.isActive;
      
      user.updatedAt = new Date();
      await user.save();
      
      const userResponse = user.toObject();
      delete userResponse.password;
      
      console.log('✅ Usuario actualizado con nueva contraseña');
      
      return res.json({ 
        success: true, 
        message: 'Usuario actualizado exitosamente',
        data: userResponse 
      });
    }

    // Actualización normal sin contraseña
    const user = await User.findOneAndUpdate(
      { userId: req.params.id },  // ✅ userId
      { ...updates, updatedAt: new Date() },
      { new: true, runValidators: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({ success: false, message: 'Usuario no encontrado' });
    }

    console.log('✅ Usuario actualizado');

    res.json({ 
      success: true, 
      message: 'Usuario actualizado exitosamente',
      data: user 
    });
  } catch (error) {
    console.error('❌ Error actualizando usuario:', error);
    res.status(400).json({ 
      success: false, 
      message: error.message || 'Error al actualizar usuario' 
    });
  }
});

// DELETE eliminar usuario
router.delete('/:id', async (req, res) => {
  try {
    console.log('🗑️ Eliminando usuario:', req.params.id);
    
    const user = await User.findOneAndDelete({ userId: req.params.id });  // ✅ userId
    
    if (!user) {
      return res.status(404).json({ success: false, message: 'Usuario no encontrado' });
    }
    
    console.log('✅ Usuario eliminado');
    
    res.json({ 
      success: true, 
      message: 'Usuario eliminado exitosamente' 
    });
  } catch (error) {
    console.error('❌ Error eliminando usuario:', error);
    res.status(500).json({ 
      success: false, 
      message: error.message || 'Error al eliminar usuario' 
    });
  }
});

module.exports = router;