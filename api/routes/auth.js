const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Login
router.post('/login', async (req, res) => {
  try {
    const { userId, password } = req.body;

    console.log('🔐 Intento de login:', { userId });

    if (!userId || !password) {
      return res.status(400).json({ 
        success: false, 
        message: 'Usuario y contraseña son requeridos' 
      });
    }

    // Buscar usuario por userId o email
    const user = await User.findOne({ 
      $or: [
        { userId: userId },      // ✅ Cambiado de 'id' a 'userId'
        { email: userId }
      ]
    });

    console.log('Usuario encontrado:', user ? 'SÍ' : 'NO');

    if (!user) {
      console.log('❌ Usuario no encontrado');
      return res.status(401).json({ 
        success: false, 
        message: 'Usuario o contraseña incorrectos' 
      });
    }

    // Verificar si el usuario está activo
    if (!user.isActive) {
      console.log('❌ Usuario inactivo');
      return res.status(401).json({ 
        success: false, 
        message: 'Usuario inactivo' 
      });
    }

    // Verificar contraseña
    console.log('🔍 Verificando contraseña...');
    const isPasswordValid = await user.comparePassword(password);
    
    console.log('Contraseña válida:', isPasswordValid ? 'SÍ' : 'NO');

    if (!isPasswordValid) {
      console.log('❌ Contraseña incorrecta');
      return res.status(401).json({ 
        success: false, 
        message: 'Usuario o contraseña incorrectos' 
      });
    }

    // Generar token JWT
    const token = jwt.sign(
      { 
        userId: user.userId,    // ✅ Cambiado de 'id' a 'userId'
        email: user.email,
        role: user.role 
      },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    console.log('✅ Login exitoso');

    res.json({
      success: true,
      message: 'Login exitoso',
      token,
      user: {
        userId: user.userId,    // ✅ Cambiado de 'id' a 'userId'
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    console.error('❌ Error en login:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error en el servidor' 
    });
  }
});

// Validar token
router.get('/validate', async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
      return res.status(401).json({ 
        success: false, 
        message: 'Token no proporcionado' 
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Buscar usuario por userId
    const user = await User.findOne({ userId: decoded.userId }).select('-password');  // ✅ Cambiado

    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: 'Usuario no encontrado' 
      });
    }

    res.json({
      success: true,
      user: {
        userId: user.userId,    // ✅ Cambiado
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    res.status(401).json({ 
      success: false, 
      message: 'Token inválido' 
    });
  }
});

module.exports = router;