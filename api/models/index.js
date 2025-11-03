const mongoose = require('mongoose');

// Exportar todos los modelos
module.exports = {
  Report: mongoose.model('Report', reportSchema),
};