/**
 * === REPORTE: PROYECTO (CONSULTOR) ===
 * Implementación del reporte de proyecto específico para consultor individual
 * Vista personal del trabajo del consultor en un proyecto
 */

// === VARIABLES GLOBALES ===
let selectedConsultorIdConsultor = null;
let selectedProjectIdConsultor = null;
let currentReporteProyectoConsultorData = [];

// === CONFIGURACIÓN Y CARGA DE DATOS ===
function loadReporteProyectoConsultorConfiguration() {
    console.log('👤 Cargando configuración de Reporte Proyecto (Consultor)...');
    
    // Verificar selecciones
    const consultorSelect = document.getElementById('consultorSelector');
    const projectSelect = document.getElementById('projectSelectorConsultor');
    
    if (!consultorSelect || !consultorSelect.value) {
        showConsultorSelector();
        return;
    }
    
    if (!projectSelect || !projectSelect.value) {
        window.NotificationUtils.error('Por favor seleccione un proyecto');
        return;
    }
    
    selectedConsultorIdConsultor = consultorSelect.value;
    selectedProjectIdConsultor = projectSelect.value;
    
    try {
        // Obtener datos de la base de datos
        const projectAssignments = window.PortalDB.getProjectAssignments();
        const users = window.PortalDB.getUsers();
        const companies = window.PortalDB.getCompanies();
        const modules = window.PortalDB.getModules();
        const projects = window.PortalDB.getProjects();
        const reports = window.PortalDB.getReports();

        // Verificar que el consultor y proyecto existen
        const selectedConsultor = users[selectedConsultorIdConsultor];
        const selectedProject = projects[selectedProjectIdConsultor];
        
        if (!selectedConsultor) {
            window.NotificationUtils.error('Consultor no encontrado');
            return [];
        }
        
        if (!selectedProject) {
            window.NotificationUtils.error('Proyecto no encontrado');
            return [];
        }

        // Filtrar asignaciones por consultor Y proyecto específicos
        const consultorProjectAssignments = Object.values(projectAssignments).filter(assignment => 
            assignment.isActive && 
            assignment.consultorId === selectedConsultorIdConsultor &&
            assignment.projectId === selectedProjectIdConsultor
        );

        // Construir datos del reporte para este consultor en este proyecto
        const reportData = [];
        
        consultorProjectAssignments.forEach(assignment => {
            const company = companies[assignment.companyId];
            const module = modules[assignment.moduleId];
            
            if (!company || !module) return;
            
            // Buscar reportes aprobados para esta asignación específica
            const consultorReports = Object.values(reports).filter(report => 
                report.consultorId === assignment.consultorId &&
                report.companyId === assignment.companyId &&
                report.moduleId === assignment.moduleId &&
                report.status === 'approved'
            );

            // Calcular horas totales para esta asignación
            const totalHours = consultorReports.reduce((sum, report) => 
                sum + (parseFloat(report.hours) || 0), 0
            );

            // Crear entrada del reporte
            const reportEntry = {
                idEmpresa: company.id,
                consultor: selectedConsultor.name,
                modulo: module.name,
                tiempo: totalHours || 0,
                tarifa: 850, // Tarifa base editable
                total: (totalHours || 0) * 850,
                // Datos de referencia
                _consultorId: assignment.consultorId,
                _companyId: assignment.companyId,
                _moduleId: assignment.moduleId,
                _projectId: assignment.projectId
            };

            reportData.push(reportEntry);
        });

        // Si no hay datos reales, agregar datos de ejemplo para testing
        if (reportData.length === 0) {
            const consultorName = selectedConsultor.name;
            const projectName = selectedProject.name;
            
            reportData.push(
                {
                    idEmpresa: '0001',
                    consultor: consultorName,
                    modulo: 'SD (Sales & Distribution)',
                    tiempo: 25.5,
                    tarifa: 850,
                    total: 21675,
                    _consultorId: selectedConsultorIdConsultor,
                    _companyId: '0001',
                    _moduleId: 'SD',
                    _projectId: selectedProjectIdConsultor
                },
                {
                    idEmpresa: '0001',
                    consultor: consultorName,
                    modulo: 'FI (Financial Accounting)',
                    tiempo: 18.0,
                    tarifa: 850,
                    total: 15300,
                    _consultorId: selectedConsultorIdConsultor,
                    _companyId: '0001',
                    _moduleId: 'FI',
                    _projectId: selectedProjectIdConsultor
                },
                {
                    idEmpresa: '0002',
                    consultor: consultorName,
                    modulo: 'MM (Materials Management)',
                    tiempo: 12.5,
                    tarifa: 850,
                    total: 10625,
                    _consultorId: selectedConsultorIdConsultor,
                    _companyId: '0002',
                    _moduleId: 'MM',
                    _projectId: selectedProjectIdConsultor
                }
            );
        }
        
        // Guardar datos globalmente
        currentReporteProyectoConsultorData = reportData;
        
        // Mostrar tabla editable
        displayReporteProyectoConsultorTable(reportData);
        
        return reportData;
        
    } catch (error) {
        console.error('❌ Error cargando configuración:', error);
        window.NotificationUtils.error('Error cargando datos del reporte');
        return [];
    }
}

// === MOSTRAR SELECTOR DE CONSULTOR ===
function showConsultorSelector() {
    const container = document.getElementById('reportPreviewContainerProyectoConsultor');
    if (!container) {
        console.error('❌ Contenedor no encontrado');
        return;
    }
    
    const users = window.PortalDB.getUsers();
    const consultores = Object.values(users).filter(user => 
        user.role === 'consultor' && user.isActive !== false
    );
    
    if (consultores.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <div class="empty-state-icon">👤</div>
                <div class="empty-state-title">No hay consultores</div>
                <div class="empty-state-desc">Registre al menos un consultor para generar este reporte</div>
            </div>
        `;
        return;
    }
    
    let consultorOptions = '';
    consultores.forEach(consultor => {
        consultorOptions += `<option value="${consultor.id}">${consultor.name} (ID: ${consultor.id})</option>`;
    });
    
    container.innerHTML = `
        <div class="report-preview-section">
            <div class="section-header">
                <h3 class="section-title">👤 Seleccionar Consultor y Proyecto</h3>
                <p class="section-description">Elija el consultor y el proyecto para generar el reporte personalizado.</p>
            </div>
            
            <div class="selector-grid">
                <div class="form-group">
                    <label for="consultorSelector">Consultor:</label>
                    <select id="consultorSelector" class="form-control" onchange="onConsultorSelectedConsultor()">
                        <option value="">-- Seleccione un consultor --</option>
                        ${consultorOptions}
                    </select>
                </div>
                
                <div class="form-group">
                    <label for="projectSelectorConsultor">Proyecto:</label>
                    <select id="projectSelectorConsultor" class="form-control" onchange="onProjectSelectedConsultor()" disabled>
                        <option value="">-- Primero seleccione consultor --</option>
                    </select>
                </div>
            </div>
            
            <div class="form-group" style="text-align: center; margin-top: 20px;">
                <button type="button" class="btn btn-primary" onclick="loadReporteProyectoConsultorConfiguration()" id="generateConsultorReportBtn" disabled>
                    👤 Generar Reporte Consultor
                </button>
            </div>
        </div>
    `;
}

// === MANEJAR SELECCIÓN DE CONSULTOR ===
function onConsultorSelectedConsultor() {
    const consultorSelect = document.getElementById('consultorSelector');
    const projectSelect = document.getElementById('projectSelectorConsultor');
    const generateBtn = document.getElementById('generateConsultorReportBtn');
    
    selectedConsultorIdConsultor = consultorSelect.value;
    
    if (!selectedConsultorIdConsultor) {
        projectSelect.disabled = true;
        projectSelect.innerHTML = '<option value="">-- Primero seleccione consultor --</option>';
        generateBtn.disabled = true;
        return;
    }
    
    // Cargar proyectos del consultor
    loadConsultorProjects();
    generateBtn.disabled = false;
}

// === CARGAR PROYECTOS DEL CONSULTOR ===
function loadConsultorProjects() {
    const projectSelect = document.getElementById('projectSelectorConsultor');
    if (!projectSelect || !selectedConsultorIdConsultor) return;
    
    const projectAssignments = window.PortalDB.getProjectAssignments();
    const projects = window.PortalDB.getProjects();
    
    // Encontrar proyectos únicos del consultor
    const consultorProjectIds = new Set();
    Object.values(projectAssignments).forEach(assignment => {
        if (assignment.isActive && assignment.consultorId === selectedConsultorIdConsultor) {
            consultorProjectIds.add(assignment.projectId);
        }
    });
    
    // Llenar dropdown de proyectos
    projectSelect.innerHTML = '<option value="">-- Seleccione un proyecto --</option>';
    projectSelect.disabled = false;
    
    consultorProjectIds.forEach(projectId => {
        const project = projects[projectId];
        if (project && project.isActive) {
            projectSelect.innerHTML += `<option value="${projectId}">${project.name}</option>`;
        }
    });
}

// === MANEJAR SELECCIÓN DE PROYECTO ===
function onProjectSelectedConsultor() {
    const projectSelect = document.getElementById('projectSelectorConsultor');
    selectedProjectIdConsultor = projectSelect.value || null;
}

// === MOSTRAR TABLA EDITABLE ===
function displayReporteProyectoConsultorTable(data) {
    const container = document.getElementById('reportPreviewContainerProyectoConsultor');
    if (!container) {
        console.error('❌ Contenedor de vista previa no encontrado');
        return;
    }
    
    const users = window.PortalDB.getUsers();
    const projects = window.PortalDB.getProjects();
    const selectedConsultor = users[selectedConsultorIdConsultor];
    const selectedProject = projects[selectedProjectIdConsultor];
    
    const consultorName = selectedConsultor ? selectedConsultor.name : 'Consultor Desconocido';
    const projectName = selectedProject ? selectedProject.name : 'Proyecto Desconocido';
    
    let html = `
        <div class="report-preview-section">
            <div class="section-header">
                <h3 class="section-title">👤 Vista Personal: Reporte de Proyecto</h3>
                <p class="section-description">Reporte individual del consultor en el proyecto seleccionado.</p>
            </div>
            
            <div class="consultor-header">
                <h4 style="color: #7c3aed; margin: 0 0 8px 0; font-size: 1.3rem;">Consultor: ${consultorName}</h4>
                <p style="color: #5b21b6; margin: 0; font-size: 0.95rem;">ID: ${selectedConsultorIdConsultor}</p>
            </div>
            
            <div class="project-info">
                <h4 style="color: #6d28d9; margin: 0 0 5px 0; font-size: 1.1rem;">Proyecto: ${projectName}</h4>
                <p style="color: #5b21b6; margin: 0; font-size: 0.9rem;">Trabajo individual del consultor en este proyecto</p>
            </div>
            
            <div class="personal-note">
                📋 <strong>Nota Personal:</strong> Este reporte muestra únicamente su participación en el proyecto seleccionado. Puede editar las horas reportadas y las tarifas antes de generar el reporte final.
            </div>
            
            <div class="table-responsive">
                <table class="report-table">
                    <thead>
                        <tr>
                            <th>ID Empresa</th>
                            <th>Consultor</th>
                            <th>Módulo</th>
                            <th>TIEMPO</th>
                            <th>TARIFA de Módulo</th>
                            <th>TOTAL</th>
                        </tr>
                    </thead>
                    <tbody>
    `;
    
    // Agregar filas de datos
    data.forEach((row, index) => {
        html += `
            <tr>
                <td class="company-id" style="font-weight: 500; color: #64748b; font-family: monospace;">${row.idEmpresa}</td>
                <td class="consultor-name" style="font-weight: 600; color: #7c3aed;">${row.consultor}</td>
                <td class="module-name" style="font-weight: 500; color: #374151;">${row.modulo}</td>
                <td class="editable-cell hours">
                    <input type="number" 
                           class="editable-input" 
                           value="${row.tiempo}" 
                           step="0.5" 
                           min="0"
                           onchange="updateReporteProyectoConsultorRow(${index}, 'tiempo', this.value)">
                </td>
                <td class="editable-cell currency">
                    <input type="number" 
                           class="editable-input currency-input" 
                           value="${row.tarifa}" 
                           step="50" 
                           min="0"
                           onchange="updateReporteProyectoConsultorRow(${index}, 'tarifa', this.value)">
                </td>
                <td class="currency">${window.NumberUtils ? window.NumberUtils.formatCurrency(row.total) : row.total.toLocaleString()}</td>
            </tr>
        `;
    });
    
    // Agregar fila de totales
    const totalHours = calculateReporteProyectoConsultorTotalHours(data);
    const totalAmount = calculateReporteProyectoConsultorGrandTotal(data);
    
    html += `
            <tr class="totals-row">
                <td colspan="3"><strong>TOTAL PERSONAL</strong></td>
                <td class="hours"><strong>${totalHours.toFixed(1)}</strong></td>
                <td></td>
                <td class="currency"><strong>${window.NumberUtils ? window.NumberUtils.formatCurrency(totalAmount) : totalAmount.toLocaleString()}</strong></td>
            </tr>
        </tbody>
    </table>
</div>

<div class="report-actions">
    <button type="button" class="btn btn-secondary" onclick="resetReporteProyectoConsultorData()">
        🔄 Restaurar Datos
    </button>
    <button type="button" class="btn btn-success" onclick="generateReporteProyectoConsultorReport()">
        📊 Generar Excel Personal
    </button>
</div>
</div>
    `;
    
    container.innerHTML = html;
    
    // Agregar estilos si no existen
    addReporteProyectoConsultorStyles();
}

// === ACTUALIZAR FILA ===
function updateReporteProyectoConsultorRow(index, field, value) {
    if (!currentReporteProyectoConsultorData[index]) return;
    
    const numValue = parseFloat(value) || 0;
    currentReporteProyectoConsultorData[index][field] = numValue;
    
    // Recalcular total
    currentReporteProyectoConsultorData[index].total = 
        currentReporteProyectoConsultorData[index].tiempo * currentReporteProyectoConsultorData[index].tarifa;
    
    // Actualizar tabla
    displayReporteProyectoConsultorTable(currentReporteProyectoConsultorData);
}

// === FUNCIONES DE CÁLCULO ===
function calculateReporteProyectoConsultorTotalHours(data) {
    return data.reduce((sum, row) => sum + (parseFloat(row.tiempo) || 0), 0);
}

function calculateReporteProyectoConsultorGrandTotal(data) {
    return data.reduce((sum, row) => sum + (parseFloat(row.total) || 0), 0);
}

// === RESTAURAR DATOS ORIGINALES ===
function resetReporteProyectoConsultorData() {
    if (confirm('¿Está seguro de que desea restaurar los datos originales? Se perderán todos los cambios.')) {
        loadReporteProyectoConsultorConfiguration();
        window.NotificationUtils.success('Datos restaurados correctamente');
    }
}

// === GENERAR REPORTE EXCEL ===
function generateReporteProyectoConsultorReport() {
    if (!currentReporteProyectoConsultorData || currentReporteProyectoConsultorData.length === 0) {
        window.NotificationUtils.error('No hay datos para generar el reporte');
        return;
    }
    
    if (!selectedConsultorIdConsultor || !selectedProjectIdConsultor) {
        window.NotificationUtils.error('No hay consultor o proyecto seleccionado');
        return;
    }
    
    try {
        console.log('📊 Generando reporte Excel: Reporte Proyecto (Consultor)...');
        
        // Obtener nombres
        const users = window.PortalDB.getUsers();
        const projects = window.PortalDB.getProjects();
        const consultorName = users[selectedConsultorIdConsultor]?.name || 'Consultor Desconocido';
        const projectName = projects[selectedProjectIdConsultor]?.name || 'Proyecto Desconocido';
        
        // Preparar datos para Excel
        const excelData = [
            [], // Fila vacía
            [`Proyecto: ${projectName}`], // Proyecto
            [`Consultor: ${consultorName}`], // Consultor
            [], // Fila vacía
            ['ID Empresa', 'Consultor', 'Modulo', 'TIEMPO', 'TARIFA de Modulo', 'TOTAL'] // Headers
        ];
        
        // Agregar datos de filas
        currentReporteProyectoConsultorData.forEach(row => {
            excelData.push([
                row.idEmpresa,
                row.consultor,
                row.modulo,
                parseFloat(row.tiempo) || 0,
                parseFloat(row.tarifa) || 0,
                parseFloat(row.total) || 0
            ]);
        });
        
        // Agregar fila de totales
        excelData.push([]);
        excelData.push([
            'TOTAL PERSONAL',
            '',
            '',
            calculateReporteProyectoConsultorTotalHours(currentReporteProyectoConsultorData),
            '',
            calculateReporteProyectoConsultorGrandTotal(currentReporteProyectoConsultorData)
        ]);
        
        // Crear libro Excel
        const wb = window.XLSX.utils.book_new();
        const ws = window.XLSX.utils.aoa_to_sheet(excelData);
        
        // Configurar anchos de columna
        ws['!cols'] = [
            { width: 12 }, // ID Empresa
            { width: 25 }, // Consultor
            { width: 25 }, // Módulo
            { width: 12 }, // TIEMPO
            { width: 18 }, // TARIFA
            { width: 15 }  // TOTAL
        ];
        
        // Aplicar formato a celdas específicas
        const range = window.XLSX.utils.decode_range(ws['!ref']);
        for (let row = range.s.r; row <= range.e.r; row++) {
            for (let col = range.s.c; col <= range.e.c; col++) {
                const cellAddress = window.XLSX.utils.encode_cell({ r: row, c: col });
                if (!ws[cellAddress]) continue;
                
                // Formato para números monetarios en columna TOTAL
                if (col === 5 && row > 4) { // Columna TOTAL
                    ws[cellAddress].z = '"$"#,##0.00';
                }
                
                // Formato para números en columna TARIFA
                if (col === 4 && row > 4) { // Columna TARIFA
                    ws[cellAddress].z = '"$"#,##0.00';
                }
                
                // Formato para horas en columna TIEMPO
                if (col === 3 && row > 4) { // Columna TIEMPO
                    ws[cellAddress].z = '#,##0.0';
                }
            }
        }
        
        // Agregar hoja al libro
        window.XLSX.utils.book_append_sheet(wb, ws, 'Reporte Consultor');
        
        // Generar nombre de archivo
        const timestamp = new Date().toISOString().slice(0, 19).replace(/:/g, '-');
        const fileName = `Rep_Proyecto_Consultor_${consultorName.replace(/\s+/g, '_')}_${projectName.replace(/\s+/g, '_')}_${timestamp}.xlsx`;
        
        // Descargar archivo
        window.XLSX.writeFile(wb, fileName);
        
        // Registrar actividad
        if (window.AuthSys && window.AuthSys.logActivity) {
            window.AuthSys.logActivity(
                'report_generated',
                `Reporte generado: ${fileName}`,
                { 
                    reportType: 'reporte_proyecto_consultor',
                    fileName: fileName,
                    consultorId: selectedConsultorIdConsultor,
                    consultorName: consultorName,
                    projectId: selectedProjectIdConsultor,
                    projectName: projectName,
                    recordCount: currentReporteProyectoConsultorData.length,
                    totalHours: calculateReporteProyectoConsultorTotalHours(currentReporteProyectoConsultorData),
                    totalAmount: calculateReporteProyectoConsultorGrandTotal(currentReporteProyectoConsultorData)
                }
            );
        }
        
        window.NotificationUtils.success(`Reporte generado exitosamente: ${fileName}`);
        
    } catch (error) {
        console.error('❌ Error generando reporte:', error);
        window.NotificationUtils.error('Error al generar el reporte Excel');
    }
}

// === AGREGAR ESTILOS ===
function addReporteProyectoConsultorStyles() {
    if (document.getElementById('reporteProyectoConsultorStyles')) return;
    
    const styles = `
        <style id="reporteProyectoConsultorStyles">
            .consultor-header {
                background: #faf5ff;
                padding: 20px;
                margin-bottom: 20px;
                border-radius: 8px;
                border-left: 4px solid #7c3aed;
            }
            
            .project-info {
                background: #ede9fe;
                padding: 15px;
                margin-bottom: 20px;
                border-radius: 8px;
                border-left: 4px solid #a855f7;
            }
            
            .personal-note {
                background: #fef3c7;
                border-left: 4px solid #f59e0b;
                padding: 15px;
                border-radius: 8px;
                margin-bottom: 20px;
                font-size: 0.9rem;
                color: #92400e;
            }
            
            .company-id {
                font-weight: 500;
                color: #64748b;
                font-family: monospace;
            }
            
            .consultor-name {
                font-weight: 600;
                color: #7c3aed;
            }
            
            .module-name {
                font-weight: 500;
                color: #374151;
            }
            
            .currency-input {
                text-align: right;
            }
        </style>
    `;
    
    document.head.insertAdjacentHTML('beforeend', styles);
}

// === EXPORTAR FUNCIONES GLOBALMENTE ===
if (typeof window !== 'undefined') {
    window.ReporteProyectoConsultorReport = {
        load: loadReporteProyectoConsultorConfiguration,
        generate: generateReporteProyectoConsultorReport,
        reset: resetReporteProyectoConsultorData,
        updateRow: updateReporteProyectoConsultorRow,
        showSelector: showConsultorSelector,
        onConsultorSelected: onConsultorSelectedConsultor,
        onProjectSelected: onProjectSelectedConsultor,
        calculateTotalHours: calculateReporteProyectoConsultorTotalHours,
        calculateGrandTotal: calculateReporteProyectoConsultorGrandTotal
    };
}

// Exportar funciones inmediatamente
window.showConsultorSelector = showConsultorSelector;
window.onConsultorSelectedConsultor = onConsultorSelectedConsultor;
window.onProjectSelectedConsultor = onProjectSelectedConsultor;
window.loadReporteProyectoConsultorConfiguration = loadReporteProyectoConsultorConfiguration;
window.updateReporteProyectoConsultorRow = updateReporteProyectoConsultorRow;
window.resetReporteProyectoConsultorData = resetReporteProyectoConsultorData;
window.generateReporteProyectoConsultorReport = generateReporteProyectoConsultorReport;

console.log('✅ Reporte Proyecto (Consultor) inicializado correctamente');