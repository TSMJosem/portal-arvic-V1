const mongoose = require('mongoose');

// ========== COMPANY ==========
const companySchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
  isActive: { type: Boolean, default: true }
});

// ========== PROJECT ==========
const projectSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  description: String,
  createdAt: { type: Date, default: Date.now },
  isActive: { type: Boolean, default: true }
});

// ========== SUPPORT ==========
const supportSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  description: String,
  createdAt: { type: Date, default: Date.now },
  isActive: { type: Boolean, default: true }
});

// ========== MODULE ==========
const moduleSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  description: String,
  createdAt: { type: Date, default: Date.now },
  isActive: { type: Boolean, default: true }
});

// ========== ASSIGNMENT ==========
const assignmentSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  userId: { type: String, required: true },
  companyId: { type: String, required: true },
  supportId: { type: String, required: true },
  moduleId: { type: String, required: true },
  tarifaConsultor: { type: Number, default: 0 },
  tarifaCliente: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now },
  isActive: { type: Boolean, default: true }
});

// ========== PROJECT ASSIGNMENT ==========
const projectAssignmentSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  consultorId: { type: String, required: true },
  companyId: { type: String, required: true },
  projectId: { type: String, required: true },
  moduleId: { type: String, required: true },
  tarifaConsultor: { type: Number, default: 0 },
  tarifaCliente: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now },
  isActive: { type: Boolean, default: true }
});

// ========== TASK ASSIGNMENT ========== ⭐ NUEVO
const taskAssignmentSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  consultorId: { type: String, required: true },
  companyId: { type: String, required: true },
  linkedSupportId: { type: String, required: false }, // ⭐ OPCIONAL - null para tareas independientes
  moduleId: { type: String, required: true },
  descripcion: { type: String, default: '' },
  tarifaConsultor: { type: Number, default: 0 },
  tarifaCliente: { type: Number, default: 0 },
  isActive: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// ========== REPORT ==========
const reportSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  userId: { type: String, required: true },
  assignmentId: { type: String, required: true },
  assignmentType: { type: String, enum: ['support', 'project', 'task'], required: true }, // ⭐ AGREGADO 'task'
  companyId: { type: String, required: true },
  supportId: String,
  projectId: String,
  moduleId: { type: String, required: true },
  description: { type: String, required: true },
  hours: { type: Number, required: true },
  date: { type: Date, required: true },
  status: { 
    type: String, 
    enum: ['Pendiente', 'Aprobado', 'Rechazado', 'Resubmitted'],
    default: 'Pendiente'
  },
  feedback: String,
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
  resubmittedAt: Date
});

// ========== TARIFARIO ==========
const tarifarioSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  assignmentId: { type: String, required: true },
  consultorId: { type: String, required: true },
  consultorNombre: { type: String, required: true },
  companyId: { type: String, required: true },
  companyName: { type: String, required: true },
  supportId: String,
  supportName: String,
  projectId: String,
  projectName: String,
  moduleId: { type: String, required: true },
  moduleName: { type: String, required: true },
  costoConsultor: { type: Number, required: true },
  costoCliente: { type: Number, required: true },
  margen: { type: Number, required: true },
  margenPorcentaje: { type: Number, required: true },
  tipo: { type: String, enum: ['support', 'project', 'task'], required: true }, // ⭐ AGREGADO 'task'
  descripcionTarea: String, // ⭐ NUEVO - para tareas
  fechaCreacion: { type: Date, default: Date.now }
});

// Exportar todos los modelos
module.exports = {
  Company: mongoose.model('Company', companySchema),
  Project: mongoose.model('Project', projectSchema),
  Support: mongoose.model('Support', supportSchema),
  Module: mongoose.model('Module', moduleSchema),
  Assignment: mongoose.model('Assignment', assignmentSchema),
  ProjectAssignment: mongoose.model('ProjectAssignment', projectAssignmentSchema),
  TaskAssignment: mongoose.model('TaskAssignment', taskAssignmentSchema), // ⭐ NUEVO
  Report: mongoose.model('Report', reportSchema),
  Tarifario: mongoose.model('Tarifario', tarifarioSchema)
};