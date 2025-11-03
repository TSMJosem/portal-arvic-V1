const mongoose = require('mongoose');
const Report = require('./models/Report');
require('dotenv').config();  // ✅ AGREGAR ESTO

// ✅ Conectar usando la variable de entorno
mongoose.connect(process.env.MONGODB_URI)  // ✅ SIN las opciones deprecated
.then(() => console.log('✅ Conectado a MongoDB'))
.catch(err => {
    console.error('❌ Error conectando a MongoDB:', err);
    process.exit(1);
});

async function rejectTicket() {
    try {
        // 1. Buscar un ticket pendiente de soporte del usuario
        const report = await Report.findOne({
            userId: 'USR7481',
            assignmentType: 'support',
            status: 'Pendiente'
        });

        if (!report) {
            console.log('❌ No se encontró ningún ticket pendiente de soporte');
            
            // Mostrar todos los tickets del usuario para debug
            const allReports = await Report.find({ userId: 'USR7481' });
            console.log('\n📋 Todos tus tickets:');
            allReports.forEach(r => {
                console.log(`  - ${r.reportId} | ${r.title || 'Sin título'} | ${r.status} | ${r.assignmentType}`);
            });
            
            mongoose.connection.close();
            process.exit(1);
        }

        console.log('\n📋 Ticket encontrado:', report.reportId);
        console.log('   Título:', report.title || 'Sin título');
        console.log('   Descripción:', report.description.substring(0, 50) + '...');
        console.log('   Status actual:', report.status);
        console.log('   Tipo:', report.assignmentType);

        // 2. Rechazar el ticket
        report.status = 'Rechazado';
        report.feedback = `⚠️ El reporte necesita más información:

1. Especifica qué funcionalidades desarrollaste
2. Agrega capturas de pantalla del trabajo realizado
3. Detalla los cambios en el código

Por favor, edita el ticket y vuelve a enviarlo.`;
        report.updatedAt = new Date();

        await report.save();

        console.log('\n✅ Ticket rechazado exitosamente');
        console.log('   Nuevo status:', report.status);
        console.log('   Feedback agregado ✓');

        mongoose.connection.close();
        process.exit(0);

    } catch (error) {
        console.error('\n❌ Error:', error);
        mongoose.connection.close();
        process.exit(1);
    }
}

// Esperar a que MongoDB conecte antes de ejecutar
mongoose.connection.once('open', () => {
    console.log('🔄 Ejecutando script para rechazar ticket...\n');
    rejectTicket();
});