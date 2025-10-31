const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const userSchema = new mongoose.Schema({
  id: String,
  name: String,
  email: String,
  password: String,
  role: String,
  isActive: Boolean,
  createdAt: Date
});

const User = mongoose.model('User', userSchema);

async function createAdmin() {
  try {
    console.log('🔄 Conectando a MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Conectado a MongoDB');

    // Verificar si ya existe admin
    const existingAdmin = await User.findOne({ id: 'admin' });
    if (existingAdmin) {
      console.log('⚠️  Usuario admin ya existe');
      await mongoose.disconnect();
      process.exit(0);
    }

    console.log('🔄 Creando usuario admin...');
    const hashedPassword = await bcrypt.hash('hperez1402.', 10);
    
    const admin = new User({
      id: 'admin',
      name: 'Administrador Principal',
      email: 'admin@arvic.com',
      password: hashedPassword,
      role: 'admin',
      isActive: true,
      createdAt: new Date()
    });

    await admin.save();
    console.log('✅ Usuario admin creado exitosamente');
    console.log('📧 Email: admin@arvic.com');
    console.log('🔑 ID: admin');
    console.log('🔐 Password: hperez1402.');
    
    await mongoose.disconnect();
    console.log('✅ Desconectado de MongoDB');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

createAdmin();
