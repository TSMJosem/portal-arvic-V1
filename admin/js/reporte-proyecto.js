/**
 * === REPORTE: PROYECTO ===
 * Implementación del reporte de proyecto específico
 * siguiendo el patrón de previsualización editable existente
 */

// === VARIABLES GLOBALES ===
let selectedProjectId = null;
let currentReporteProyectoData = [];

// === CONFIGURACIÓN Y CARGA DE DATOS ===
function loadReporteProyectoConfiguration() {
    console.log('📋 Cargando configuración de Reporte Proyecto...');
    
    // Primero verificar si hay un proyecto seleccionado
    const projectSelect = document.getElementById('projectSelector');
    if (!projectSelect || !projectSelect.value) {
        showProjectSelector();
        return;
    }
    
    selectedProjectId = projectSelect.value;
    
    try {
        // Obtener datos de la base de datos
        const projectAssignments = window.PortalDB.getProjectAssignments();
        const users = window.PortalDB.getUsers();
        const companies = window.PortalDB.getCompanies();
        const modules = window.PortalDB.getModules();
        const projects = window.PortalDB.getProjects();
        const reports = window.PortalDB.getReports();

        // Verificar que el proyecto existe
        const selectedProject = projects[selectedProjectId];
        if (!selectedProject) {
            window.NotificationUtils.error('Proyecto no encontrado');
            return [];
        }

        // Construir datos del reporte SOLO para el proyecto seleccionado
        const reportData = [];
        
        // Recorrer asignaciones de proyecto activas del proyecto específico
        Object.values(projectAssignments).forEach(assignment => {
            if (!assignment.isActive || assignment.projectId !== selectedProjectId) return;
            
            const consultor = users[assignment.consultorId];
            const company = companies[assignment.companyId];
            const module = modules[assignment.moduleId];
            
            if (!consultor || !company || !module) return;
            
            // Buscar reportes aprobados para esta asignación
            const consultorReports = Object.values(reports).filter(report => 
                report.consultorId === assignment.consultorId &&
                report.companyId === assignment.companyId &&
                report.moduleId === assignment.moduleId &&
                report.status === 'approved'
            );

            // Calcular horas totales
            const totalHours = consultorReports.reduce((sum, report) => 
                sum + (parseFloat(report.hours) || 0), 0
            );

            // Crear entrada del reporte
            const reportEntry = {
                idEmpresa: company.id,
                consultor: consultor.name,
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
            reportData.push(
                {
                    idEmpresa: '0001',
                    consultor: 'Juan Pérez García',
                    modulo: 'SD',
                    tiempo: 25,
                    tarifa: 850,
                    total: 21250,
                    _consultorId: '0001',
                    _companyId: '0001',
                    _moduleId: 'SD',
                    _projectId: selectedProjectId
                },
                {
                    idEmpresa: '0002',
                    consultor: 'María Elena Rodríguez',
                    modulo: 'FI',
                    tiempo: 30,
                    tarifa: 850,
                    total: 25500,
                    _consultorId: '0002',
                    _companyId: '0002',
                    _moduleId: 'FI',
                    _projectId: selectedProjectId
                }
            );
        }
        
        // Guardar datos globalmente para usar en generación
        currentReporteProyectoData = reportData;
        
        // Mostrar tabla editable
        displayReporteProyectoTable(reportData);
        
        return reportData;
        
    } catch (error) {
        console.error('❌ Error cargando configuración:', error);
        window.NotificationUtils.error('Error cargando datos del reporte');
        return [];
    }
}

// === MOSTRAR SELECTOR DE PROYECTO ===
function showProjectSelector() {
    const container = document.getElementById('reportPreviewContainerProyecto');
    if (!container) {
        console.error('❌ Contenedor no encontrado');
        return;
    }
    
    const projects = window.PortalDB.getProjects();
    const activeProjects = Object.values(projects).filter(p => p.isActive);
    
    if (activeProjects.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <div class="empty-state-icon">📋</div>
                <div class="empty-state-title">No hay proyectos</div>
                <div class="empty-state-desc">Cree al menos un proyecto para generar este reporte</div>
            </div>
        `;
        return;
    }
    
    let projectOptions = '';
    activeProjects.forEach(project => {
        projectOptions += `<option value="${project.id}">${project.name}</option>`;
    });
    
    container.innerHTML = `
        <div class="report-preview-section">
            <div class="section-header">
                <h3 class="section-title">📋 Seleccionar Proyecto</h3>
                <p class="section-description">Elija el proyecto para generar el reporte detallado.</p>
            </div>
            
            <div class="form-group" style="max-width: 400px; margin: 0 auto;">
                <label for="projectSelector">Proyecto:</label>
                <select id="projectSelector" class="form-control" onchange="onProjectSelected()">
                    <option value="">-- Seleccione un proyecto --</option>
                    ${projectOptions}
                </select>
            </div>
        </div>
    `;
}

// === MANEJAR SELECCIÓN DE PROYECTO ===
function onProjectSelected() {
    const projectSelect = document.getElementById('projectSelector');
    if (projectSelect && projectSelect.value) {
        selectedProjectId = projectSelect.value;
        loadReporteProyectoConfiguration();
    }
}

// === MOSTRAR TABLA EDITABLE ===
function displayReporteProyectoTable(data) {
    const container = document.getElementById('reportPreviewContainerProyecto');
    if (!container) {
        console.error('❌ Contenedor de vista previa no encontrado');
        return;
    }
    
    const projects = window.PortalDB.getProjects();
    const selectedProject = projects[selectedProjectId];
    const projectName = selectedProject ? selectedProject.name : 'Proyecto Desconocido';
    
    let html = `
        <div class="report-preview-section">
            <div class="section-header">
                <h3 class="section-title">📋 Vista Previa: Reporte Proyecto</h3>
                <p class="section-description">Edite las horas y tarifas según sea necesario.</p>
            </div>
            
            <div class="project-header" style="background: #f1f5f9; padding: 15px; margin-bottom: 20px; border-radius: 8px; border-left: 4px solid #1e3a8a;">
                <h4 style="color: #1e3a8a; margin: 0;">Proyecto: ${projectName}</h4>
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
                <td>${row.idEmpresa}</td>
                <td>${row.consultor}</td>
                <td>${row.modulo}</td>
                <td class="editable-cell">
                    <input type="number" 
                           class="editable-input" 
                           value="${row.tiempo}" 
                           step="0.5" 
                           min="0"
                           onchange="updateReporteProyectoRow(${index}, 'tiempo', this.value)">
                </td>
                <td class="editable-cell currency">
                    <input type="number" 
                           class="editable-input currency-input" 
                           value="${row.tarifa}" 
                           step="50" 
                           min="0"
                           onchange="updateReporteProyectoRow(${index}, 'tarifa', this.value)">
                </td>
                <td class="currency">${window.NumberUtils ? window.NumberUtils.formatCurrency(row.total) : row.total.toLocaleString()}</td>
            </tr>
        `;
    });
    
    // Agregar fila de totales
    const totalHours = calculateReporteProyectoTotalHours(data);
    const totalAmount = calculateReporteProyectoGrandTotal(data);
    
    html += `
            <tr class="totals-row">
                <td colspan="3"><strong>TOTAL PROYECTO</strong></td>
                <td class="currency"><strong>${totalHours.toFixed(1)}</strong></td>
                <td></td>
                <td class="currency"><strong>${window.NumberUtils ? window.NumberUtils.formatCurrency(totalAmount) : totalAmount.toLocaleString()}</strong></td>
            </tr>
        </tbody>
    </table>
</div>

<div class="report-actions">
    <button type="button" class="btn btn-secondary" onclick="resetReporteProyectoData()">
        🔄 Restaurar Datos
    </button>
    <button type="button" class="btn btn-success" onclick="generateReporteProyectoReport()">
        📊 Generar Excel
    </button>
</div>
</div>
    `;
    
    container.innerHTML = html;
    
    // Agregar estilos si no existen
    addReporteProyectoStyles();
}

// === ACTUALIZAR FILA ===
function updateReporteProyectoRow(index, field, value) {
    if (!currentReporteProyectoData[index]) return;
    
    const numValue = parseFloat(value) || 0;
    currentReporteProyectoData[index][field] = numValue;
    
    // Recalcular total
    currentReporteProyectoData[index].total = 
        currentReporteProyectoData[index].tiempo * currentReporteProyectoData[index].tarifa;
    
    // Actualizar tabla
    displayReporteProyectoTable(currentReporteProyectoData);
}

// === FUNCIONES DE CÁLCULO ===
function calculateReporteProyectoTotalHours(data) {
    return data.reduce((sum, row) => sum + (parseFloat(row.tiempo) || 0), 0);
}

function calculateReporteProyectoGrandTotal(data) {
    return data.reduce((sum, row) => sum + (parseFloat(row.total) || 0), 0);
}

// === RESTAURAR DATOS ORIGINALES ===
function resetReporteProyectoData() {
    if (confirm('¿Está seguro de que desea restaurar los datos originales? Se perderán todos los cambios.')) {
        loadReporteProyectoConfiguration();
        window.NotificationUtils.success('Datos restaurados correctamente');
    }
}

// === GENERAR REPORTE EXCEL ===
function generateReporteProyectoReport() {
    if (!currentReporteProyectoData || currentReporteProyectoData.length === 0) {
        window.NotificationUtils.error('No hay datos para generar el reporte');
        return;
    }
    
    if (!selectedProjectId) {
        window.NotificationUtils.error('No hay proyecto seleccionado');
        return;
    }
    
    try {
        console.log('📊 Generando reporte Excel: Reporte Proyecto...');
        
        // Obtener nombre del proyecto
        const projects = window.PortalDB.getProjects();
        const projectName = projects[selectedProjectId]?.name || 'Proyecto Desconocido';
        
        // Preparar datos para Excel
        const excelData = [
            [], // Fila vacía
            [], // Fila vacía
            [`Proyecto: ${projectName}`], // Proyecto
            ['ID Empresa', 'Consultor', 'Modulo', 'TIEMPO', 'TARIFA de Modulo', 'TOTAL'] // Headers
        ];
        
        // Agregar datos de filas
        currentReporteProyectoData.forEach(row => {
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
            'TOTAL PROYECTO',
            '',
            '',
            calculateReporteProyectoTotalHours(currentReporteProyectoData),
            '',
            calculateReporteProyectoGrandTotal(currentReporteProyectoData)
        ]);
        
        // Crear libro Excel
        const wb = window.XLSX.utils.book_new();
        const ws = window.XLSX.utils.aoa_to_sheet(excelData);
        
        // Configurar anchos de columna
        ws['!cols'] = [
            { width: 12 }, // ID Empresa
            { width: 25 }, // Consultor
            { width: 15 }, // Módulo
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
                if (col === 5 && row > 3) { // Columna TOTAL
                    ws[cellAddress].z = '"$"#,##0.00';
                }
                
                // Formato para números en columna TARIFA
                if (col === 4 && row > 3) { // Columna TARIFA
                    ws[cellAddress].z = '"$"#,##0.00';
                }
                
                // Formato para horas en columna TIEMPO
                if (col === 3 && row > 3) { // Columna TIEMPO
                    ws[cellAddress].z = '#,##0.0';
                }
            }
        }
        
        // Agregar hoja al libro
        window.XLSX.utils.book_append_sheet(wb, ws, 'Reporte Proyecto');
        
        // Generar nombre de archivo
        const timestamp = new Date().toISOString().slice(0, 19).replace(/:/g, '-');
        const fileName = `Reporte_Proyecto_${projectName.replace(/\s+/g, '_')}_${timestamp}.xlsx`;
        
        // Descargar archivo
        window.XLSX.writeFile(wb, fileName);
        
        // Registrar actividad
        if (window.AuthSys && window.AuthSys.logActivity) {
            window.AuthSys.logActivity(
                'report_generated',
                `Reporte generado: ${fileName}`,
                { 
                    reportType: 'reporte_proyecto',
                    fileName: fileName,
                    projectId: selectedProjectId,
                    projectName: projectName,
                    recordCount: currentReporteProyectoData.length,
                    totalHours: calculateReporteProyectoTotalHours(currentReporteProyectoData),
                    totalAmount: calculateReporteProyectoGrandTotal(currentReporteProyectoData)
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
function addReporteProyectoStyles() {
    if (document.getElementById('reporteProyectoStyles')) return;
    
    const styles = `
        <style id="reporteProyectoStyles">
            .report-preview-section {
                background: white;
                border-radius: 8px;
                padding: 20px;
                box-shadow: 0 2px 10px rgba(0,0,0,0.1);
                margin: 20px 0;
            }
            
            .section-header {
                margin-bottom: 20px;
                text-align: center;
            }
            
            .section-title {
                color: var(--primary-color, #1e3a8a);
                font-size: 1.4rem;
                font-weight: 600;
                margin-bottom: 8px;
            }
            
            .section-description {
                color: var(--gray-600, #475569);
                font-size: 0.9rem;
            }
            
            .report-table {
                width: 100%;
                border-collapse: collapse;
                margin: 20px 0;
            }
            
            .report-table th {
                background: var(--gray-100, #f3f4f6);
                color: var(--gray-700, #374151);
                font-weight: 600;
                padding: 12px 8px;
                text-align: left;
                border: 1px solid var(--gray-300, #d1d5db);
                font-size: 0.85rem;
            }
            
            .report-table td {
                padding: 10px 8px;
                border: 1px solid var(--gray-200, #e5e7eb);
                font-size: 0.85rem;
            }
            
            .report-table tr:nth-child(even) {
                background: var(--gray-50, #f9fafb);
            }
            
            .report-table tr:hover {
                background: var(--blue-50, #eff6ff);
            }
            
            .editable-input {
                border: none;
                background: transparent;
                width: 100%;
                padding: 4px 8px;
                font-size: 0.85rem;
                border-radius: 4px;
                transition: all 0.2s ease;
            }
            
            .editable-input:hover {
                background: var(--gray-100, #f3f4f6);
            }
            
            .editable-input:focus {
                outline: none;
                background: white;
                border: 2px solid var(--primary-color, #3b82f6);
            }
            
            .currency {
                text-align: right;
                font-weight: 500;
                color: var(--green-600, #059669);
            }
            
            .currency-input {
                text-align: right;
            }
            
            .totals-row {
                background: var(--blue-50, #eff6ff) !important;
                font-weight: 700;
                color: var(--primary-color, #1e3a8a);
            }
            
            .totals-row td {
                border-top: 2px solid var(--primary-color, #3b82f6);
            }
            
            .report-actions {
                display: flex;
                gap: 15px;
                justify-content: center;
                margin-top: 20px;
                padding-top: 20px;
                border-top: 1px solid var(--gray-200, #e5e7eb);
            }
            
            .btn {
                padding: 10px 20px;
                border: none;
                border-radius: 6px;
                font-weight: 500;
                cursor: pointer;
                transition: all 0.3s ease;
                font-size: 0.9rem;
            }
            
            .btn-secondary {
                background: var(--gray-500, #6b7280);
                color: white;
            }
            
            .btn-secondary:hover {
                background: var(--gray-600, #4b5563);
                transform: translateY(-2px);
            }
            
            .btn-success {
                background: var(--green-600, #059669);
                color: white;
            }
            
            .btn-success:hover {
                background: var(--green-700, #047857);
                transform: translateY(-2px);
            }
        </style>
    `;
    
    document.head.insertAdjacentHTML('beforeend', styles);
}

// === EXPORTAR FUNCIONES GLOBALMENTE ===
if (typeof window !== 'undefined') {
    window.ReporteProyectoReport = {
        load: loadReporteProyectoConfiguration,
        generate: generateReporteProyectoReport,
        reset: resetReporteProyectoData,
        updateRow: updateReporteProyectoRow,
        showSelector: showProjectSelector,
        onProjectSelected: onProjectSelected,
        calculateTotalHours: calculateReporteProyectoTotalHours,
        calculateGrandTotal: calculateReporteProyectoGrandTotal
    };
}

// Exportar funciones inmediatamente
window.showProjectSelector = showProjectSelector;
window.onProjectSelected = onProjectSelected;
window.loadReporteProyectoConfiguration = loadReporteProyectoConfiguration;
window.updateReporteProyectoRow = updateReporteProyectoRow;
window.resetReporteProyectoData = resetReporteProyectoData;
window.generateReporteProyectoReport = generateReporteProyectoReport;

console.log('✅ Reporte Proyecto inicializado correctamente');