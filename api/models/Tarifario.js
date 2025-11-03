const mongoose = require('mongoose');

const tarifarioSchema = new mongoose.Schema({
  tarifarioId: {
    type: String,
    required: true,
    unique: true
  },
  assignmentId: {
    type: String,
    required: true
  },
  consultorId: {
    type: String,
    required: true
  },
  consultorNombre: {
    type: String,
    required: true
  },
  companyId: {
    type: String,
    required: true
  },
  companyName: {
    type: String,
    required: true
  },
  supportId: {
    type: String,
    required: false,
    default: null
  },
  supportName: {
    type: String,
    required: false,
    default: null
  },
  projectId: {
    type: String,
    required: false,
    default: null
  },
  projectName: {
    type: String,
    required: false,
    default: null
  },
  moduleId: {
    type: String,
    required: true
  },
  moduleName: {
    type: String,
    required: true
  },
  costoConsultor: {
    type: Number,
    required: true,
    default: 0
  },
  costoCliente: {
    type: Number,
    required: true,
    default: 0
  },
  margen: {
    type: Number,
    required: true,
    default: 0
  },
  margenPorcentaje: {
    type: Number,
    required: true,
    default: 0
  },
  tipo: {
    type: String,
    enum: ['support', 'project', 'task'],
    required: true
  },
  descripcionTarea: {
    type: String,
    required: false,
    default: null
  },
  isActive: {
    type: Boolean,
    default: true
  },
  fechaCreacion: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Tarifario', tarifarioSchema);