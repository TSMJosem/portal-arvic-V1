/**
 * Script de Seed para Pruebas de Reportes PDF
 *
 * Puebla la base de datos con datos suficientes para probar los 7 tipos de reportes:
 * 1. pago-consultor-general    - Reporte General de Pagos
 * 2. pago-consultor-especifico - Reporte de Pago a Consultor
 * 3. cliente-soporte           - Reporte de Soporte al Cliente
 * 4. remanente                 - Reporte Remanente (semanal)
 * 5. proyecto-general          - Reporte General de Proyectos
 * 6. proyecto-cliente          - Reporte de Proyecto (Cliente)
 * 7. proyecto-consultor        - Reporte de Consultor - Proyectos
 *
 * Uso: node scripts/test-reportes.js [--clean]
 *   --clean  Elimina los datos de prueba antes de insertar
 */

const mongoose = require('mongoose');
require('dotenv').config();

// Modelos
const User = require('../api/models/User');
const Company = require('../api/models/Company');
const Support = require('../api/models/Support');
const Project = require('../api/models/Project');
const Module = require('../api/models/Module');
const Assignment = require('../api/models/Assignment');
const ProjectAssignment = require('../api/models/ProjectAssignment');
const Tarifario = require('../api/models/Tarifario');
const Report = require('../api/models/Report');

// Prefijo para identificar datos de prueba
const TEST_PREFIX = 'TEST';

// ═══════════════════════════════════════════════════════════════
// DATOS DE PRUEBA
// ═══════════════════════════════════════════════════════════════

const consultores = [
  { userId: `${TEST_PREFIX}_USR001`, name: 'Carlos García López', email: 'carlos.garcia@test.com', password: 'test123', role: 'consultor' },
  { userId: `${TEST_PREFIX}_USR002`, name: 'María Fernández Ruiz', email: 'maria.fernandez@test.com', password: 'test123', role: 'consultor' },
  { userId: `${TEST_PREFIX}_USR003`, name: 'Roberto Sánchez Díaz', email: 'roberto.sanchez@test.com', password: 'test123', role: 'consultor' },
];

const empresas = [
  { companyId: `${TEST_PREFIX}_EMP001`, name: 'Grupo Industrial Monterrey', description: 'Cliente industrial del norte' },
  { companyId: `${TEST_PREFIX}_EMP002`, name: 'Tecnología Avanzada SA', description: 'Empresa de tecnología' },
  { companyId: `${TEST_PREFIX}_EMP003`, name: 'Servicios Financieros MX', description: 'Sector financiero' },
];

const soportes = [
  { supportId: `${TEST_PREFIX}_SUP001`, name: 'Soporte SAP FI', description: 'Soporte módulo financiero SAP' },
  { supportId: `${TEST_PREFIX}_SUP002`, name: 'Soporte SAP MM', description: 'Soporte módulo materiales SAP' },
  { supportId: `${TEST_PREFIX}_SUP003`, name: 'Soporte SAP SD', description: 'Soporte módulo ventas SAP' },
];

const proyectos = [
  { projectId: `${TEST_PREFIX}_PRJ001`, name: 'Migración SAP S/4HANA', description: 'Migración a nueva versión' },
  { projectId: `${TEST_PREFIX}_PRJ002`, name: 'Implementación CRM', description: 'Nuevo sistema CRM' },
  { projectId: `${TEST_PREFIX}_PRJ003`, name: 'Automatización Reportes', description: 'Automatización de reportes financieros' },
];

const modulos = [
  { moduleId: `${TEST_PREFIX}_MOD001`, name: 'FI - Contabilidad Financiera', description: 'Módulo de contabilidad' },
  { moduleId: `${TEST_PREFIX}_MOD002`, name: 'MM - Gestión de Materiales', description: 'Módulo de materiales' },
  { moduleId: `${TEST_PREFIX}_MOD003`, name: 'SD - Ventas y Distribución', description: 'Módulo de ventas' },
  { moduleId: `${TEST_PREFIX}_MOD004`, name: 'CO - Controlling', description: 'Módulo de controlling' },
  { moduleId: `${TEST_PREFIX}_MOD005`, name: 'PP - Planificación de Producción', description: 'Módulo de producción' },
];

// ═══════════════════════════════════════════════════════════════
// ASIGNACIONES DE SOPORTE
// ═══════════════════════════════════════════════════════════════

const asignacionesSoporte = [
  // Carlos -> Grupo Industrial -> Soporte FI -> Módulos FI y CO
  { assignmentId: `${TEST_PREFIX}_ASG001`, userId: `${TEST_PREFIX}_USR001`, companyId: `${TEST_PREFIX}_EMP001`, supportId: `${TEST_PREFIX}_SUP001`, moduleId: `${TEST_PREFIX}_MOD001`, tarifaConsultor: 350, tarifaCliente: 500 },
  { assignmentId: `${TEST_PREFIX}_ASG002`, userId: `${TEST_PREFIX}_USR001`, companyId: `${TEST_PREFIX}_EMP001`, supportId: `${TEST_PREFIX}_SUP001`, moduleId: `${TEST_PREFIX}_MOD004`, tarifaConsultor: 350, tarifaCliente: 500 },
  // María -> Tecnología Avanzada -> Soporte MM -> Módulo MM
  { assignmentId: `${TEST_PREFIX}_ASG003`, userId: `${TEST_PREFIX}_USR002`, companyId: `${TEST_PREFIX}_EMP002`, supportId: `${TEST_PREFIX}_SUP002`, moduleId: `${TEST_PREFIX}_MOD002`, tarifaConsultor: 400, tarifaCliente: 600 },
  // Roberto -> Servicios Financieros -> Soporte SD -> Módulo SD
  { assignmentId: `${TEST_PREFIX}_ASG004`, userId: `${TEST_PREFIX}_USR003`, companyId: `${TEST_PREFIX}_EMP003`, supportId: `${TEST_PREFIX}_SUP003`, moduleId: `${TEST_PREFIX}_MOD003`, tarifaConsultor: 375, tarifaCliente: 550 },
  // María -> Grupo Industrial -> Soporte FI -> Módulo FI (cross-company)
  { assignmentId: `${TEST_PREFIX}_ASG005`, userId: `${TEST_PREFIX}_USR002`, companyId: `${TEST_PREFIX}_EMP001`, supportId: `${TEST_PREFIX}_SUP001`, moduleId: `${TEST_PREFIX}_MOD001`, tarifaConsultor: 400, tarifaCliente: 600 },
];

// ═══════════════════════════════════════════════════════════════
// ASIGNACIONES DE PROYECTO
// ═══════════════════════════════════════════════════════════════

const asignacionesProyecto = [
  // Carlos -> Grupo Industrial -> Migración S/4HANA -> FI
  { projectAssignmentId: `${TEST_PREFIX}_PASG001`, consultorId: `${TEST_PREFIX}_USR001`, companyId: `${TEST_PREFIX}_EMP001`, projectId: `${TEST_PREFIX}_PRJ001`, moduleId: `${TEST_PREFIX}_MOD001`, tarifaConsultor: 450, tarifaCliente: 700 },
  // María -> Tecnología Avanzada -> CRM -> MM
  { projectAssignmentId: `${TEST_PREFIX}_PASG002`, consultorId: `${TEST_PREFIX}_USR002`, companyId: `${TEST_PREFIX}_EMP002`, projectId: `${TEST_PREFIX}_PRJ002`, moduleId: `${TEST_PREFIX}_MOD002`, tarifaConsultor: 500, tarifaCliente: 750 },
  // Roberto -> Servicios Financieros -> Automatización -> SD y PP
  { projectAssignmentId: `${TEST_PREFIX}_PASG003`, consultorId: `${TEST_PREFIX}_USR003`, companyId: `${TEST_PREFIX}_EMP003`, projectId: `${TEST_PREFIX}_PRJ003`, moduleId: `${TEST_PREFIX}_MOD003`, tarifaConsultor: 425, tarifaCliente: 650 },
  { projectAssignmentId: `${TEST_PREFIX}_PASG004`, consultorId: `${TEST_PREFIX}_USR003`, companyId: `${TEST_PREFIX}_EMP003`, projectId: `${TEST_PREFIX}_PRJ003`, moduleId: `${TEST_PREFIX}_MOD005`, tarifaConsultor: 425, tarifaCliente: 650 },
  // Carlos -> Tecnología Avanzada -> CRM -> CO (cross-company)
  { projectAssignmentId: `${TEST_PREFIX}_PASG005`, consultorId: `${TEST_PREFIX}_USR001`, companyId: `${TEST_PREFIX}_EMP002`, projectId: `${TEST_PREFIX}_PRJ002`, moduleId: `${TEST_PREFIX}_MOD004`, tarifaConsultor: 450, tarifaCliente: 700 },
];

// ═══════════════════════════════════════════════════════════���═══
// GENERACIÓN DE REPORTES
// ═══════════════════════════════════════════════════════════════

function generarFechasSemana(year, month, weekNum) {
  // Generar fechas distribuidas en la semana indicada del mes
  const firstDay = new Date(year, month - 1, 1);
  const startDay = (weekNum - 1) * 7 + 1;
  const dates = [];
  for (let i = 0; i < 3; i++) { // 3 reportes por semana
    const day = Math.min(startDay + i * 2, 28); // no pasar del 28
    dates.push(new Date(year, month - 1, day));
  }
  return dates;
}

function generarReportes() {
  const reportes = [];
  let reportCounter = 1;
  const year = 2026;
  const month = 2; // Febrero 2026 (mes actual)

  const descripciones = {
    support: [
      'Configuración de cuentas contables en SAP FI',
      'Resolución de error en registro de facturas',
      'Ajuste de parámetros de centro de costos',
      'Soporte en cierre mensual contable',
      'Corrección de asientos de reclasificación',
      'Revisión de flujo de aprobación de pagos',
      'Actualización de catálogo de materiales',
      'Configuración de estrategia de liberación MM',
      'Ajuste de condiciones de precio en SD',
      'Soporte en proceso de facturación electrónica',
      'Revisión de reportes de inventario',
      'Configuración de datos maestros de clientes',
      'Resolución de inconsistencias en CO-PA',
      'Ajuste de variantes de planificación',
      'Soporte en conciliación bancaria automática',
    ],
    project: [
      'Análisis de gaps para migración S/4HANA',
      'Diseño de arquitectura de datos maestros',
      'Desarrollo de interfaces de integración CRM',
      'Migración de datos históricos financieros',
      'Configuración de flujos de trabajo automatizados',
      'Desarrollo de reportes personalizados ALV',
      'Pruebas unitarias del módulo de facturación',
      'Capacitación usuarios clave módulo FI',
      'Diseño de dashboards ejecutivos',
      'Optimización de procesos de compras',
      'Desarrollo de extensiones FIORI',
      'Pruebas de integración entre módulos',
      'Documentación técnica de desarrollos',
      'Configuración de alertas automáticas',
      'Validación de migración de saldos contables',
    ],
  };

  const statuses = ['Aprobado', 'Aprobado', 'Aprobado', 'Aprobado', 'Pendiente', 'Rechazado'];

  // --- REPORTES DE SOPORTE ---
  // Distribuir reportes en 5 semanas para cubrir el reporte remanente
  for (let week = 1; week <= 5; week++) {
    const fechas = generarFechasSemana(year, month, week);

    for (const asg of asignacionesSoporte) {
      for (const fecha of fechas) {
        const descIdx = (reportCounter - 1) % descripciones.support.length;
        const statusIdx = (reportCounter - 1) % statuses.length;
        const hours = [1, 1.5, 2, 2.5, 3, 4][reportCounter % 6];

        reportes.push({
          reportId: `${TEST_PREFIX}_RPT${String(reportCounter).padStart(4, '0')}`,
          userId: asg.userId,
          assignmentId: asg.assignmentId,
          assignmentType: 'support',
          companyId: asg.companyId,
          supportId: asg.supportId,
          projectId: null,
          moduleId: asg.moduleId,
          title: `Soporte - ${descripciones.support[descIdx].substring(0, 40)}`,
          description: descripciones.support[descIdx],
          hours: hours,
          date: fecha,
          status: statuses[statusIdx],
          feedback: statuses[statusIdx] === 'Rechazado' ? 'Falta detalle en la descripción del trabajo realizado. Favor de agregar más información.' : null,
          createdAt: fecha,
          updatedAt: fecha,
        });
        reportCounter++;
      }
    }
  }

  // --- REPORTES DE PROYECTO ---
  for (let week = 1; week <= 5; week++) {
    const fechas = generarFechasSemana(year, month, week);

    for (const asg of asignacionesProyecto) {
      for (const fecha of fechas) {
        const descIdx = (reportCounter - 1) % descripciones.project.length;
        const statusIdx = (reportCounter - 1) % statuses.length;
        const hours = [2, 3, 4, 5, 6, 8][reportCounter % 6];

        reportes.push({
          reportId: `${TEST_PREFIX}_RPT${String(reportCounter).padStart(4, '0')}`,
          userId: asg.consultorId,
          assignmentId: asg.projectAssignmentId,
          assignmentType: 'project',
          companyId: asg.companyId,
          supportId: null,
          projectId: asg.projectId,
          moduleId: asg.moduleId,
          title: `Proyecto - ${descripciones.project[descIdx].substring(0, 40)}`,
          description: descripciones.project[descIdx],
          hours: hours,
          date: fecha,
          status: statuses[statusIdx],
          feedback: statuses[statusIdx] === 'Rechazado' ? 'Las horas reportadas no coinciden con el plan de trabajo. Favor de revisar.' : null,
          createdAt: fecha,
          updatedAt: fecha,
        });
        reportCounter++;
      }
    }
  }

  return reportes;
}

// ═══════════════════════════════════════════════════════════════
// GENERACIÓN DE TARIFARIO
// ═══════════════════════════════════════════════════════════════

function generarTarifario() {
  const tarifario = [];
  let counter = 1;

  // Tarifario para asignaciones de soporte
  for (const asg of asignacionesSoporte) {
    const consultor = consultores.find(c => c.userId === asg.userId);
    const empresa = empresas.find(e => e.companyId === asg.companyId);
    const soporte = soportes.find(s => s.supportId === asg.supportId);
    const modulo = modulos.find(m => m.moduleId === asg.moduleId);
    const margen = asg.tarifaCliente - asg.tarifaConsultor;
    const margenPct = asg.tarifaCliente > 0 ? ((margen / asg.tarifaCliente) * 100) : 0;

    tarifario.push({
      tarifarioId: `${TEST_PREFIX}_TAR${String(counter).padStart(4, '0')}`,
      assignmentId: asg.assignmentId,
      consultorId: asg.userId,
      consultorNombre: consultor.name,
      companyId: asg.companyId,
      companyName: empresa.name,
      supportId: asg.supportId,
      supportName: soporte.name,
      projectId: null,
      projectName: null,
      moduleId: asg.moduleId,
      moduleName: modulo.name,
      costoConsultor: asg.tarifaConsultor,
      costoCliente: asg.tarifaCliente,
      margen: margen,
      margenPorcentaje: Math.round(margenPct * 100) / 100,
      tipo: 'support',
      isActive: true,
    });
    counter++;
  }

  // Tarifario para asignaciones de proyecto
  for (const asg of asignacionesProyecto) {
    const consultor = consultores.find(c => c.userId === asg.consultorId);
    const empresa = empresas.find(e => e.companyId === asg.companyId);
    const proyecto = proyectos.find(p => p.projectId === asg.projectId);
    const modulo = modulos.find(m => m.moduleId === asg.moduleId);
    const margen = asg.tarifaCliente - asg.tarifaConsultor;
    const margenPct = asg.tarifaCliente > 0 ? ((margen / asg.tarifaCliente) * 100) : 0;

    tarifario.push({
      tarifarioId: `${TEST_PREFIX}_TAR${String(counter).padStart(4, '0')}`,
      assignmentId: asg.projectAssignmentId,
      consultorId: asg.consultorId,
      consultorNombre: consultor.name,
      companyId: asg.companyId,
      companyName: empresa.name,
      supportId: null,
      supportName: null,
      projectId: asg.projectId,
      projectName: proyecto.name,
      moduleId: asg.moduleId,
      moduleName: modulo.name,
      costoConsultor: asg.tarifaConsultor,
      costoCliente: asg.tarifaCliente,
      margen: margen,
      margenPorcentaje: Math.round(margenPct * 100) / 100,
      tipo: 'project',
      isActive: true,
    });
    counter++;
  }

  return tarifario;
}

// ═══════════════════════════════════════════════════════════════
// EJECUCIÓN PRINCIPAL
// ═══════════════════════════════════════════════════════════════

async function limpiarDatosPrueba() {
  console.log('🧹 Limpiando datos de prueba existentes...');
  const testRegex = new RegExp(`^${TEST_PREFIX}_`);

  const results = await Promise.all([
    Report.deleteMany({ reportId: testRegex }),
    Tarifario.deleteMany({ tarifarioId: testRegex }),
    Assignment.deleteMany({ assignmentId: testRegex }),
    ProjectAssignment.deleteMany({ projectAssignmentId: testRegex }),
    User.deleteMany({ userId: testRegex }),
    Company.deleteMany({ companyId: testRegex }),
    Support.deleteMany({ supportId: testRegex }),
    Project.deleteMany({ projectId: testRegex }),
    Module.deleteMany({ moduleId: testRegex }),
  ]);

  const labels = ['Reportes', 'Tarifario', 'Asig. Soporte', 'Asig. Proyecto', 'Usuarios', 'Empresas', 'Soportes', 'Proyectos', 'Módulos'];
  results.forEach((r, i) => {
    if (r.deletedCount > 0) console.log(`   Eliminados: ${r.deletedCount} ${labels[i]}`);
  });
  console.log('   Limpieza completada.\n');
}

async function insertarDatos() {
  console.log('📦 Insertando datos de prueba...\n');

  // 1. Usuarios (consultores)
  console.log('👥 Insertando consultores...');
  for (const c of consultores) {
    await User.findOneAndUpdate({ userId: c.userId }, c, { upsert: true, new: true });
  }
  console.log(`   ${consultores.length} consultores insertados`);

  // 2. Empresas
  console.log('🏢 Insertando empresas...');
  for (const e of empresas) {
    await Company.findOneAndUpdate({ companyId: e.companyId }, e, { upsert: true, new: true });
  }
  console.log(`   ${empresas.length} empresas insertadas`);

  // 3. Tipos de soporte
  console.log('🛠️  Insertando tipos de soporte...');
  for (const s of soportes) {
    await Support.findOneAndUpdate({ supportId: s.supportId }, s, { upsert: true, new: true });
  }
  console.log(`   ${soportes.length} soportes insertados`);

  // 4. Proyectos
  console.log('📁 Insertando proyectos...');
  for (const p of proyectos) {
    await Project.findOneAndUpdate({ projectId: p.projectId }, p, { upsert: true, new: true });
  }
  console.log(`   ${proyectos.length} proyectos insertados`);

  // 5. Módulos
  console.log('📋 Insertando módulos...');
  for (const m of modulos) {
    await Module.findOneAndUpdate({ moduleId: m.moduleId }, m, { upsert: true, new: true });
  }
  console.log(`   ${modulos.length} módulos insertados`);

  // 6. Asignaciones de soporte
  console.log('🔗 Insertando asignaciones de soporte...');
  for (const a of asignacionesSoporte) {
    await Assignment.findOneAndUpdate({ assignmentId: a.assignmentId }, a, { upsert: true, new: true });
  }
  console.log(`   ${asignacionesSoporte.length} asignaciones de soporte insertadas`);

  // 7. Asignaciones de proyecto
  console.log('🔗 Insertando asignaciones de proyecto...');
  for (const a of asignacionesProyecto) {
    await ProjectAssignment.findOneAndUpdate({ projectAssignmentId: a.projectAssignmentId }, a, { upsert: true, new: true });
  }
  console.log(`   ${asignacionesProyecto.length} asignaciones de proyecto insertadas`);

  // 8. Tarifario
  const tarifario = generarTarifario();
  console.log('💰 Insertando tarifario...');
  for (const t of tarifario) {
    await Tarifario.findOneAndUpdate({ tarifarioId: t.tarifarioId }, t, { upsert: true, new: true });
  }
  console.log(`   ${tarifario.length} registros de tarifario insertados`);

  // 9. Reportes
  const reportes = generarReportes();
  console.log('📝 Insertando reportes...');
  for (const r of reportes) {
    await Report.findOneAndUpdate({ reportId: r.reportId }, r, { upsert: true, new: true });
  }
  console.log(`   ${reportes.length} reportes insertados`);

  return { reportes, tarifario };
}

function imprimirResumen(reportes) {
  console.log('\n═══════════════════════════════════════════════════════');
  console.log('  RESUMEN DE DATOS PARA PRUEBAS DE REPORTES PDF');
  console.log('═══════════════════════════════════════════════════════\n');

  const soporteReports = reportes.filter(r => r.assignmentType === 'support');
  const proyectoReports = reportes.filter(r => r.assignmentType === 'project');
  const aprobados = reportes.filter(r => r.status === 'Aprobado');
  const pendientes = reportes.filter(r => r.status === 'Pendiente');
  const rechazados = reportes.filter(r => r.status === 'Rechazado');

  console.log(`  Total de reportes: ${reportes.length}`);
  console.log(`    - Soporte:  ${soporteReports.length}`);
  console.log(`    - Proyecto: ${proyectoReports.length}`);
  console.log(`    - Aprobados:  ${aprobados.length}`);
  console.log(`    - Pendientes: ${pendientes.length}`);
  console.log(`    - Rechazados: ${rechazados.length}`);

  console.log('\n  FILTROS SUGERIDOS PARA CADA REPORTE:');
  console.log('  ─────────────────────────────────────────────────────');

  console.log('\n  1. Pago Consultor General');
  console.log('     Rango: Feb 2026 | Soporte: Soporte SAP FI');

  console.log('\n  2. Pago Consultor Específico');
  console.log('     Consultor: Carlos García López | Soporte: Soporte SAP FI');

  console.log('\n  3. Cliente Soporte');
  console.log('     Cliente: Grupo Industrial Monterrey | Soporte: Soporte SAP FI');

  console.log('\n  4. Remanente');
  console.log('     Cliente: Grupo Industrial Monterrey | Mes: Febrero 2026');

  console.log('\n  5. Proyecto General');
  console.log('     Rango: Feb 2026 | Proyecto: Migración SAP S/4HANA');

  console.log('\n  6. Proyecto Cliente');
  console.log('     Cliente: Tecnología Avanzada SA | Proyecto: Implementación CRM');

  console.log('\n  7. Proyecto Consultor');
  console.log('     Consultor: Roberto Sánchez Díaz | Proyecto: Automatización Reportes');

  console.log('\n═══════════════════════════════════════════════════════');
  console.log('  CREDENCIALES DE PRUEBA');
  console.log('═══════════════════════════════════════════════════════');
  for (const c of consultores) {
    console.log(`  ${c.name}: ${c.email} / ${c.password}`);
  }
  console.log('\n  Para limpiar datos: node scripts/test-reportes.js --clean');
  console.log('═══════════════════════════════════════════════════════\n');
}

async function main() {
  const cleanOnly = process.argv.includes('--clean');

  try {
    console.log('\n🔄 Conectando a MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Conectado a MongoDB\n');

    // Siempre limpiar primero para evitar duplicados
    await limpiarDatosPrueba();

    if (cleanOnly) {
      console.log('✅ Datos de prueba eliminados exitosamente.');
      await mongoose.disconnect();
      process.exit(0);
    }

    const { reportes } = await insertarDatos();
    imprimirResumen(reportes);

    console.log('✅ Seed completado exitosamente.\n');
    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Error:', error.message);
    console.error(error.stack);
    await mongoose.disconnect();
    process.exit(1);
  }
}

main();
