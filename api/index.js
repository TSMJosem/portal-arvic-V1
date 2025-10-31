const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();

// Middlewares
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Conectar a MongoDB
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log('✅ MongoDB conectado'))
.catch(err => console.error('❌ Error de conexión MongoDB:', err));

// Importar rutas
const authRoutes = require('./routes/auth');
const usersRoutes = require('./routes/users');
const companiesRoutes = require('./routes/companies');
const projectsRoutes = require('./routes/projects');
const supportsRoutes = require('./routes/supports');
const modulesRoutes = require('./routes/modules');
const assignmentsRoutes = require('./routes/assignments'); // ⭐ Incluye: soportes, proyectos Y tareas
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

// Para Vercel
if (process.env.VERCEL) {
  module.exports = app;
} else {
  // Para desarrollo local
  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => {
    console.log(`🚀 Servidor corriendo en puerto ${PORT}`);
  });
}