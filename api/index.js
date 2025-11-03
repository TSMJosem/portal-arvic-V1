const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();
const User = require('./models/User');

const app = express();

// Middlewares
app.use(cors({
  origin: [
    'http://localhost:5500',
    'http://127.0.0.1:5500',
    'https://tsmjosem.github.io',
    'https://portalarvic-8fovmmmwa-josems-projects.vercel.app',
    'https://portalarvic-git-main-josems-projects.vercel.app'
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],  // 👈 Agrega esta línea
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Conectar a MongoDB
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log('✅ MongoDB conectado'))
.catch(err => console.error('❌ Error de conexión MongoDB:', err));

// 👇 AGREGA ESTE ENDPOINT TEMPORAL en api/index.js
app.post('/api/setup/reset-admin-password', async (req, res) => {
  try {
    const { newPassword } = req.body;
    
    if (!newPassword) {
      return res.status(400).json({ 
        success: false, 
        message: 'Se requiere nueva contraseña' 
      });
    }

    // Buscar el usuario admin
    const adminUser = await User.findOne({ id: 'admin' });
    
    if (!adminUser) {
      return res.status(404).json({ 
        success: false, 
        message: 'Usuario admin no encontrado' 
      });
    }

    // Actualizar contraseña (se hasheará automáticamente)
    adminUser.password = newPassword;
    await adminUser.save();

    res.json({ 
      success: true, 
      message: 'Contraseña actualizada exitosamente',
      newPassword: newPassword // Solo para referencia, eliminar en producción
    });
  } catch (error) {
    console.error('Error reseteando contraseña:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error actualizando contraseña' 
    });
  }
});

// Importar rutas
const authRoutes = require('./routes/auth');
const usersRoutes = require('./routes/users');
const companiesRoutes = require('./routes/companies');
const projectsRoutes = require('./routes/projects');
const supportsRoutes = require('./routes/supports');
const modulesRoutes = require('./routes/modules');
const assignmentsRoutes = require('./routes/assignments'); 
const projectAssignmentsRoutes = require('./routes/projectAssignments');
const taskAssignmentsRoutes = require('./routes/taskAssignments');  // ✅ NUEVO
const reportsRoutes = require('./routes/reports');
const tarifarioRoutes = require('./routes/tarifario');

// Usar rutas
app.use('/api/auth', authRoutes);
app.use('/api/users', usersRoutes);
app.use('/api/companies', companiesRoutes);
app.use('/api/projects', projectsRoutes);
app.use('/api/supports', supportsRoutes);
app.use('/api/modules', modulesRoutes);
app.use('/api/assignments', assignmentsRoutes); // Maneja /assignments, /assignments/projects, /assignments/tasks
app.use('/api/projectAssignments', projectAssignmentsRoutes);  // ✅ NUEVO
app.use('/api/taskAssignments', taskAssignmentsRoutes);  // ✅ NUEVO
app.use('/api/reports', reportsRoutes);
app.use('/api/tarifario', tarifarioRoutes);

// Ruta de prueba
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'API Portal ARVIC funcionando',
    timestamp: new Date().toISOString()
  });
});

// Manejo de errores
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({ 
    success: false, 
    message: 'Error interno del servidor',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// Iniciar servidor
const PORT = process.env.PORT || 3000;

// Solo exportar para Vercel, sino iniciar servidor local
if (require.main === module) {
  // Modo desarrollo local
  app.listen(PORT, () => {
    console.log(`🚀 Servidor corriendo en puerto ${PORT}`);
    console.log(`📡 Health check: http://localhost:${PORT}/api/health`);
  });
} else {
  // Exportar para Vercel
  module.exports = app;
}