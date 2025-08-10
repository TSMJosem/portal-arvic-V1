/**
 * === REPORTE: PROYECTO (CLIENTE) ===
 * Implementación del reporte de proyectos orientado al cliente
 * Agrupa datos por módulos para presentación externa
 */

// === VARIABLES GLOBALES ==
let selectedClientIdCliente = null; 
let selectedProjectIdCliente = null;
let currentReporteProyectoClienteData = [];

// === CONFIGURACIÓN Y CARGA DE DATOS ===
function loadReporteProyectoClienteConfiguration() {
    console.log('🏢 Cargando configuración de Reporte Proyecto (Cliente)...');
    
    // Verificar selecciones
    const clientSelect = document.getElementById('clientSelector');
    const projectFilter = document.getElementById('projectFilter');
    
    if (!clientSelect || !clientSelect.value) {
        showClientSelector();
        return;
    }
    
    selectedClientIdCliente = clientSelect.value;  // ACTUALIZADO
    selectedProjectIdCliente = projectFilter && projectFilter.value ? projectFilter.value : null;  // ACTUALIZADO
    
    try {
        // Obtener datos de la base de datos
        const projectAssignments = window.PortalDB.getProjectAssignments();
        const users = window.PortalDB.getUsers();
        const companies = window.PortalDB.getCompanies();
        const modules = window.PortalDB.getModules();
        const projects = window.PortalDB.getProjects();
        const reports = window.PortalDB.getReports();

        // Verificar que el cliente existe
        const selectedClient = companies[selectedClientIdCliente];
        if (!selectedClient) {
            window.NotificationUtils.error('Cliente no encontrado');
            return [];
        }

        // Filtrar asignaciones por cliente
        let clientAssignments = Object.values(projectAssignments).filter(assignment => 
            assignment.isActive && assignment.companyId === selectedClientId
        );

        // Filtrar por proyecto específico si está seleccionado
        if (selectedProjectIdCliente) {
            clientAssignments = clientAssignments.filter(assignment => 
                assignment.projectId === selectedProjectIdCliente
            );
        }

        // Construir datos del reporte agrupados por módulos
        const moduleGroups = {};
        
        clientAssignments.forEach(assignment => {
            const consultor = users[assignment.consultorId];
            const project = projects[assignment.projectId];
            const module = modules[assignment.moduleId];
            
            if (!consultor || !project || !module) return;
            
            // Crear clave única por proyecto + módulo
            const groupKey = `${assignment.projectId}_${assignment.moduleId}`;
            
            if (!moduleGroups[groupKey]) {
                moduleGroups[groupKey] = {
                    proyecto: project.name,
                    modulo: module.name,
                    tiempo: 0,
                    tarifa: 850, // Tarifa base editable
                    total: 0,
                    // Datos de referencia
                    _projectId: assignment.projectId,
                    _moduleId: assignment.moduleId,
                    _companyId: assignment.companyId
                };
            }
            
            // Obtener reportes filtrados por fecha
            const filteredReports = getFilteredReportsByDate(
                'reporteProyectoClienteTimeFilter',
                'reporteProyectoClienteStartDate', 
                'reporteProyectoClienteEndDate'
            );

            // Buscar reportes aprobados para esta asignación específica
            const consultorReports = filteredReports.filter(report => 
                report.consultorId === assignment.consultorId &&
                report.companyId === assignment.companyId &&
                report.moduleId === assignment.moduleId &&
                report.status === 'approved'
            );

            // Sumar horas de este consultor al grupo del módulo
            const consultorHours = consultorReports.reduce((sum, report) => 
                sum + (parseFloat(report.hours) || 0), 0
            );
            
            moduleGroups[groupKey].tiempo += consultorHours;
        });

        // Convertir a array y calcular totales
        const reportData = Object.values(moduleGroups).map(group => {
            group.total = group.tiempo * group.tarifa;
            return group;
        });

        // Si no hay datos reales, agregar datos de ejemplo para testing
        if (reportData.length === 0) {
            const clientName = selectedClient.name;
            reportData.push(
                {
                    proyecto: 'Sistema de Gestión Empresarial',
                    modulo: 'SD (Sales & Distribution)',
                    tiempo: 43.5,
                    tarifa: 850,
                    total: 36975,
                    _projectId: '0001',
                    _moduleId: 'SD',
                    _companyId: selectedClientIdCliente
                },
                {
                    proyecto: 'Sistema de Gestión Empresarial',
                    modulo: 'FI (Financial Accounting)',
                    tiempo: 38.0,
                    tarifa: 850,
                    total: 32300,
                    _projectId: '0001',
                    _moduleId: 'FI',
                    _companyId: selectedClientIdCliente
                },
                {
                    proyecto: 'Portal Web Corporativo',
                    modulo: 'Frontend Development',
                    tiempo: 35.0,
                    tarifa: 750,
                    total: 26250,
                    _projectId: '0002',
                    _moduleId: 'Frontend',
                    _companyId: selectedClientIdCliente
                }
            );
        }
        
        // Guardar datos globalmente
        currentReporteProyectoClienteData = reportData;
        
        // Mostrar tabla editable
        displayReporteProyectoClienteTable(reportData);
        
        return reportData;
        
    } catch (error) {
        console.error('❌ Error cargando configuración:', error);
        window.NotificationUtils.error('Error cargando datos del reporte');
        return [];
    }
}

// === MOSTRAR SELECTOR DE CLIENTE ===
function showClientSelector() {
    const container = document.getElementById('reportPreviewContainerProyectoCliente');
    if (!container) {
        console.error('❌ Contenedor no encontrado');
        return;
    }
    
    const companies = window.PortalDB.getCompanies();
    const activeCompanies = Object.values(companies).filter(c => c.isActive);
    
    if (activeCompanies.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <div class="empty-state-icon">🏢</div>
                <div class="empty-state-title">No hay empresas</div>
                <div class="empty-state-desc">Registre al menos una empresa cliente para generar este reporte</div>
            </div>
        `;
        return;
    }
    
    let clientOptions = '';
    activeCompanies.forEach(company => {
        clientOptions += `<option value="${company.id}">${company.name}</option>`;
    });
    
    container.innerHTML = `
        <div class="report-preview-section">
            <div class="section-header">
                <h3 class="section-title">🏢 Seleccionar Cliente</h3>
                <p class="section-description">Elija el cliente para generar el reporte de proyectos.</p>
            </div>
            
            <div class="selector-grid">
                <div class="form-group">
                    <label for="clientSelector">Cliente/Empresa:</label>
                    <select id="clientSelector" class="form-control" onchange="onClientSelected()">
                        <option value="">-- Seleccione un cliente --</option>
                        ${clientOptions}
                    </select>
                </div>
                
                <div class="form-group">
                    <label for="projectFilter">Filtrar Proyecto:</label>
                    <select id="projectFilter" class="form-control" onchange="onProjectFilterChanged()" disabled>
                        <option value="">-- Primero seleccione cliente --</option>
                    </select>
                </div>
            </div>
            
            <div class="form-group" style="text-align: center; margin-top: 20px;">
                <button type="button" class="btn btn-primary" onclick="loadReporteProyectoClienteConfiguration()" id="generateClientReportBtn" disabled>
                    🏢 Generar Reporte Cliente
                </button>
            </div>
        </div>
    `;
}

// === MANEJAR SELECCIÓN DE CLIENTE ===
function onClientSelected() {
    const clientSelect = document.getElementById('clientSelector');
    const projectFilter = document.getElementById('projectFilter');
    const generateBtn = document.getElementById('generateClientReportBtn');
    
    selectedClientIdCliente = clientSelect.value;
    
    if (!selectedClientIdCliente) {
        projectFilter.disabled = true;
        projectFilter.innerHTML = '<option value="">-- Primero seleccione cliente --</option>';
        generateBtn.disabled = true;
        return;
    }
    
    // Cargar proyectos del cliente
    loadClientProjects();
    generateBtn.disabled = false;
}

// === CARGAR PROYECTOS DEL CLIENTE ===
function loadClientProjects() {
    const projectFilter = document.getElementById('projectFilter');
    if (!projectFilter || !selectedClientIdCliente) return;
    
    const projectAssignments = window.PortalDB.getProjectAssignments();
    const projects = window.PortalDB.getProjects();
    
    // Encontrar proyectos únicos del cliente
    const clientProjectIds = new Set();
    Object.values(projectAssignments).forEach(assignment => {
        if (assignment.isActive && assignment.companyId === selectedClientIdCliente) {
            clientProjectIds.add(assignment.projectId);
        }
    });
    
    // Llenar dropdown de proyectos
    projectFilter.innerHTML = '<option value="">Todos los proyectos</option>';
    projectFilter.disabled = false;
    
    clientProjectIds.forEach(projectId => {
        const project = projects[projectId];
        if (project && project.isActive) {
            projectFilter.innerHTML += `<option value="${projectId}">${project.name}</option>`;
        }
    });
}

// === MANEJAR FILTRO DE PROYECTO ===
function onProjectFilterChanged() {
    const projectFilter = document.getElementById('projectFilter');
    selectedProjectIdCliente = projectFilter.value || null;
}

// === MOSTRAR TABLA EDITABLE ===
function displayReporteProyectoClienteTable(data) {
   const container = document.getElementById('reportPreviewContainerProyectoCliente');
    if (!container) {
        console.error('❌ Contenedor de vista previa no encontrado');
        return;
    }
    
    const companies = window.PortalDB.getCompanies();
    const projects = window.PortalDB.getProjects();
    const selectedClient = companies[selectedClientIdCliente];
    const clientName = selectedClient ? selectedClient.name : 'Cliente Desconocido';
    
    // Determinar alcance
    let projectScope = 'Todos los proyectos activos';
    if (selectedProjectIdCliente) {
        const selectedProject = projects[selectedProjectIdCliente];
        projectScope = selectedProject ? selectedProject.name : 'Proyecto Desconocido';
    }
    
    let html = `
        <div class="report-preview-section">
            <div class="section-header">
                <h3 class="section-title">🏢 Vista Cliente: Reporte de Proyectos</h3>
                <p class="section-description">Reporte preparado para presentación al cliente.</p>
            </div>
            
            <div class="client-header">
                <h4 style="color: #059669; margin: 0 0 8px 0; font-size: 1.3rem;">Cliente: ${clientName}</h4>
                <p style="color: #064e3b; margin: 0; font-size: 0.95rem;">Alcance: ${projectScope}</p>
            </div>
            
            <div class="filter-info">
                📋 ${selectedProjectIdCliente ? 'Mostrando módulos del proyecto seleccionado' : 'Mostrando todos los proyectos del cliente agrupados por módulos'}
            </div>
            
            <div class="table-responsive">
                <table class="report-table">
                    <thead>
                        <tr>
                            <th>Proyecto</th>
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
                <td class="project-name" style="font-weight: 600; color: #1e40af;">${row.proyecto}</td>
                <td class="module-name" style="font-weight: 500; color: #374151;">${row.modulo}</td>
                <td class="editable-cell hours">
                    <input type="number" 
                           class="editable-input" 
                           value="${row.tiempo}" 
                           step="0.5" 
                           min="0"
                           onchange="updateReporteProyectoClienteRow(${index}, 'tiempo', this.value)">
                </td>
                <td class="editable-cell currency">
                    <input type="number" 
                           class="editable-input currency-input" 
                           value="${row.tarifa}" 
                           step="50" 
                           min="0"
                           onchange="updateReporteProyectoClienteRow(${index}, 'tarifa', this.value)">
                </td>
                <td class="currency">${window.NumberUtils ? window.NumberUtils.formatCurrency(row.total) : row.total.toLocaleString()}</td>
            </tr>
        `;
    });
    
    // Agregar fila de totales
    const totalHours = calculateReporteProyectoClienteTotalHours(data);
    const totalAmount = calculateReporteProyectoClienteGrandTotal(data);
    
    html += `
            <tr class="totals-row">
                <td colspan="2"><strong>TOTAL GENERAL</strong></td>
                <td class="hours"><strong>${totalHours.toFixed(1)}</strong></td>
                <td></td>
                <td class="currency"><strong>${window.NumberUtils ? window.NumberUtils.formatCurrency(totalAmount) : totalAmount.toLocaleString()}</strong></td>
            </tr>
        </tbody>
    </table>
</div>

<div class="report-actions">
    <button type="button" class="btn btn-secondary" onclick="resetReporteProyectoClienteData()">
        🔄 Restaurar Datos
    </button>
    <button type="button" class="btn btn-success" onclick="generateReporteProyectoClienteReport()">
        📊 Generar Excel Cliente
    </button>
</div>
</div>
    `;
    
    container.innerHTML = html;
    
    // Agregar estilos si no existen
    addReporteProyectoClienteStyles();
}

// === ACTUALIZAR FILA ===
function updateReporteProyectoClienteRow(index, field, value) {
    if (!currentReporteProyectoClienteData[index]) return;
    
    const numValue = parseFloat(value) || 0;
    currentReporteProyectoClienteData[index][field] = numValue;
    
    // Recalcular total
    currentReporteProyectoClienteData[index].total = 
        currentReporteProyectoClienteData[index].tiempo * currentReporteProyectoClienteData[index].tarifa;
    
    // Actualizar tabla
    displayReporteProyectoClienteTable(currentReporteProyectoClienteData);
}

// === FUNCIONES DE CÁLCULO ===
function calculateReporteProyectoClienteTotalHours(data) {
    return data.reduce((sum, row) => sum + (parseFloat(row.tiempo) || 0), 0);
}

function calculateReporteProyectoClienteGrandTotal(data) {
    return data.reduce((sum, row) => sum + (parseFloat(row.total) || 0), 0);
}

// === RESTAURAR DATOS ORIGINALES ===
function resetReporteProyectoClienteData() {
    if (confirm('¿Está seguro de que desea restaurar los datos originales? Se perderán todos los cambios.')) {
        loadReporteProyectoClienteConfiguration();
        window.NotificationUtils.success('Datos restaurados correctamente');
    }
}

// === GENERAR REPORTE EXCEL ===
function generateReporteProyectoClienteReport() {
    if (!currentReporteProyectoClienteData || currentReporteProyectoClienteData.length === 0) {
        window.NotificationUtils.error('No hay datos para generar el reporte');
        return;
    }
    
    if (!selectedClientIdCliente) {
        window.NotificationUtils.error('No hay cliente seleccionado');
        return;
    }
    
    try {
        console.log('📊 Generando reporte Excel: Reporte Proyecto (Cliente)...');
        
        // Obtener nombre del cliente
        const companies = window.PortalDB.getCompanies();
        const projects = window.PortalDB.getProjects();
        const clientName = companies[selectedClientIdCliente]?.name || 'Cliente Desconocido';
        
        // Determinar alcance
        let projectScope = 'Todos los proyectos';
        if (selectedProjectIdCliente) {
            const selectedProject = projects[selectedProjectIdCliente];
            projectScope = selectedProject ? selectedProject.name : 'Proyecto Desconocido';
        }
        
        // Preparar datos para Excel
        const excelData = [
            [], // Fila vacía
            [`Cliente: ${clientName}`], // Cliente
            [`Alcance: ${projectScope}`], // Alcance
            [], // Fila vacía
            ['Proyecto', 'Modulo', 'TIEMPO', 'TARIFA de Modulo', 'TOTAL'] // Headers
        ];
        
        // Agregar datos de filas
        currentReporteProyectoClienteData.forEach(row => {
            excelData.push([
                row.proyecto,
                row.modulo,
                parseFloat(row.tiempo) || 0,
                parseFloat(row.tarifa) || 0,
                parseFloat(row.total) || 0
            ]);
        });
        
        // Agregar fila de totales
        excelData.push([]);
        excelData.push([
            'TOTAL GENERAL',
            '',
            calculateReporteProyectoClienteTotalHours(currentReporteProyectoClienteData),
            '',
            calculateReporteProyectoClienteGrandTotal(currentReporteProyectoClienteData)
        ]);
        
        // Crear libro Excel
        const wb = window.XLSX.utils.book_new();
        const ws = window.XLSX.utils.aoa_to_sheet(excelData);
        
        // Configurar anchos de columna
        ws['!cols'] = [
            { width: 25 }, // Proyecto
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
                if (col === 4 && row > 4) { // Columna TOTAL
                    ws[cellAddress].z = '"$"#,##0.00';
                }
                
                // Formato para números en columna TARIFA
                if (col === 3 && row > 4) { // Columna TARIFA
                    ws[cellAddress].z = '"$"#,##0.00';
                }
                
                // Formato para horas en columna TIEMPO
                if (col === 2 && row > 4) { // Columna TIEMPO
                    ws[cellAddress].z = '#,##0.0';
                }
            }
        }
        
        // Agregar hoja al libro
        window.XLSX.utils.book_append_sheet(wb, ws, 'Reporte Cliente');
        
        // Generar nombre de archivo
        const timestamp = new Date().toISOString().slice(0, 19).replace(/:/g, '-');
        const scopeText = selectedProjectIdCliente ? projects[selectedProjectIdCliente]?.name.replace(/\s+/g, '_') : 'Todos_Proyectos';
        const fileName = `Rep_Proyecto_Cliente_${clientName.replace(/\s+/g, '_')}_${scopeText}_${timestamp}.xlsx`;
        
        // Descargar archivo
        window.XLSX.writeFile(wb, fileName);
        
        // Registrar actividad
        if (window.AuthSys && window.AuthSys.logActivity) {
            window.AuthSys.logActivity(
                'report_generated',
                `Reporte generado: ${fileName}`,
                { 
                    reportType: 'reporte_proyecto_cliente',
                    fileName: fileName,
                    clientId: selectedClientIdCliente,
                    clientName: clientName,
                    projectId: selectedProjectIdCliente,
                    projectScope: projectScope,
                    recordCount: currentReporteProyectoClienteData.length,
                    totalHours: calculateReporteProyectoClienteTotalHours(currentReporteProyectoClienteData),
                    totalAmount: calculateReporteProyectoClienteGrandTotal(currentReporteProyectoClienteData)
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
function addReporteProyectoClienteStyles() {
    if (document.getElementById('reporteProyectoClienteStyles')) return;
    
    const styles = `
        <style id="reporteProyectoClienteStyles">
            .selector-grid {
                display: grid;
                grid-template-columns: 1fr 1fr;
                gap: 20px;
                margin-bottom: 20px;
            }
            
            @media (max-width: 768px) {
                .selector-grid {
                    grid-template-columns: 1fr;
                }
            }
            
            .client-header {
                background: #f0fdf4;
                padding: 20px;
                margin-bottom: 20px;
                border-radius: 8px;
                border-left: 4px solid #059669;
            }
            
            .filter-info {
                background: #fef3c7;
                border-left: 4px solid #f59e0b;
                padding: 12px 15px;
                border-radius: 8px;
                margin-bottom: 20px;
                font-size: 0.9rem;
                color: #92400e;
            }
            
            .project-name {
                font-weight: 600;
                color: #1e40af;
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
    window.ReporteProyectoClienteReport = {
        load: loadReporteProyectoClienteConfiguration,
        generate: generateReporteProyectoClienteReport,
        reset: resetReporteProyectoClienteData,
        updateRow: updateReporteProyectoClienteRow,
        showSelector: showClientSelector,
        onClientSelected: onClientSelected,
        onProjectFilterChanged: onProjectFilterChanged,
        calculateTotalHours: calculateReporteProyectoClienteTotalHours,
        calculateGrandTotal: calculateReporteProyectoClienteGrandTotal
    };
}

// Función de prueba
function testClienteFunction() {
    console.log('🔍 Función de prueba ejecutada');
    console.log('loadReporteProyectoClienteConfiguration existe:', typeof loadReporteProyectoClienteConfiguration);
    
    if (typeof loadReporteProyectoClienteConfiguration === 'function') {
        loadReporteProyectoClienteConfiguration();
    } else {
        alert('❌ Error: La función no está disponible. Revisa la consola.');
    }
}

// Exportar también la función de prueba
window.testClienteFunction = testClienteFunction;

// Exportar funciones inmediatamente
window.showClientSelector = showClientSelector;
window.onClientSelected = onClientSelected;
window.onProjectFilterChanged = onProjectFilterChanged;
window.loadReporteProyectoClienteConfiguration = loadReporteProyectoClienteConfiguration;  // ESTA LÍNEA ES CLAVE
window.updateReporteProyectoClienteRow = updateReporteProyectoClienteRow;
window.resetReporteProyectoClienteData = resetReporteProyectoClienteData;
window.generateReporteProyectoClienteReport = generateReporteProyectoClienteReport;

console.log('✅ Reporte Proyecto (Cliente) inicializado correctamente');