const fs = require('fs');
const path = require('path');
const pdfMake = require('pdfmake/build/pdfmake');
const vfsFonts = require('pdfmake/build/vfs_fonts');

// Configurar fuentes
pdfMake.vfs = vfsFonts.pdfMake ? vfsFonts.pdfMake.vfs : vfsFonts;

// Simular entorno de navegador completo
global.window = { pdfMake };
global.document = {
  addEventListener: () => {},
  getElementById: () => null,
  querySelector: () => null
};

// Importar el exporter
require('../js/arvic-pdf-exporter.js');

// Datos de muestra
const sampleData = {
  pagoGeneral: [
    { consultorName: 'Juan Pérez', companyName: 'ACME Corp', moduleName: 'Nómina', 
      costoConsultor: 5000, costoCliente: 8000, margen: 3000, margenPorcentaje: 37.5 },
    { consultorName: 'María García', companyName: 'TechCo', moduleName: 'Facturación',
      costoConsultor: 6000, costoCliente: 9000, margen: 3000, margenPorcentaje: 33.3 }
  ],
  
  pagoConsultor: [
    { companyName: 'ACME Corp', moduleName: 'Nómina',
      costoConsultor: 5000, costoCliente: 8000, margen: 3000, margenPorcentaje: 37.5 },
    { companyName: 'TechCo', moduleName: 'RH',
      costoConsultor: 4500, costoCliente: 7000, margen: 2500, margenPorcentaje: 35.7 }
  ],
  
  clienteSoporte: [
    { consultorName: 'Ana López', supportName: 'Soporte Premium', moduleName: 'Contabilidad',
      origen: 'Soporte', costoConsultor: 4000, costoCliente: 6500, margen: 2500, margenPorcentaje: 38.5 }
  ],
  
  proyectoGeneral: [
    { consultorName: 'Pedro Sánchez', companyName: 'GlobalTech', projectName: 'ERP',
      moduleName: 'Finanzas', origen: 'Proyecto', costoConsultor: 7000, costoCliente: 11000,
      margen: 4000, margenPorcentaje: 36.4 }
  ],
  
  proyectoCliente: [
    { consultorName: 'Roberto Torres', projectName: 'CRM', moduleName: 'Ventas',
      origen: 'Proyecto', costoConsultor: 6500, costoCliente: 10000, margen: 3500, margenPorcentaje: 35.0 }
  ],
  
  proyectoConsultor: [
    { companyName: 'MegaCorp', projectName: 'Portal Web', moduleName: 'Desarrollo',
      costoConsultor: 5500, costoCliente: 8500, margen: 3000, margenPorcentaje: 35.3 }
  ]
};

async function generarReportesPrueba() {
  const outputDir = path.join(__dirname, '../test-reportes');
  
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }
  
  console.log('🚀 Generando reportes de prueba...\n');
  
  const exporter = window.arvicPDFExporter;
  
  const reportes = [
    { name: '1-pago-general', method: 'generatePagoGeneralPDF', args: [sampleData.pagoGeneral] },
    { name: '2-pago-consultor', method: 'generatePagoConsultorPDF', args: [sampleData.pagoConsultor, 'Juan Pérez'] },
    { name: '3-cliente-soporte', method: 'generateClienteSoportePDF', args: [sampleData.clienteSoporte, 'ACME Corp'] },
    { name: '4-proyecto-general', method: 'generateProyectoGeneralPDF', args: [sampleData.proyectoGeneral] },
    { name: '5-proyecto-cliente', method: 'generateProyectoClientePDF', args: [sampleData.proyectoCliente, 'GlobalTech'] },
    { name: '6-proyecto-consultor', method: 'generateProyectoConsultorPDF', args: [sampleData.proyectoConsultor, 'Laura Martínez'] }
  ];
  
  for (const reporte of reportes) {
    console.log(`📄 Generando ${reporte.name}...`);
    await generarPDF(exporter, reporte.method, reporte.args, path.join(outputDir, `${reporte.name}.pdf`));
  }
  
  console.log('\n✅ Reportes generados en:', outputDir);
  console.log('\n📁 Archivos:');
  reportes.forEach(r => console.log(`   - ${r.name}.pdf`));
}

function generarPDF(exporter, methodName, args, outputPath) {
  return new Promise((resolve, reject) => {
    try {
      const pdfDocGenerator = exporter[methodName](...args);
      pdfDocGenerator.getBuffer((buffer) => {
        fs.writeFileSync(outputPath, buffer);
        resolve();
      });
    } catch (error) {
      reject(error);
    }
  });
}

generarReportesPrueba()
  .then(() => console.log('\n🎉 Completado'))
  .catch(console.error);