/**
 * === REPORTE: REMANENTE ===
 * Implementación del reporte matricial de horas remanentes por módulo
 * Estructura compleja con vista semanal mensual
 */

// === VARIABLES GLOBALES ===
let selectedPeriodRemanente = null;
let selectedFilterTypeRemanente = null;
let selectedFilterValueRemanente = null;
let currentRemanenteData = null;

// === CONFIGURACIÓN Y CARGA DE DATOS ===
function loadRemanenteConfiguration() {
    console.log('📊 Cargando configuración de Reporte Remanente...');
    
    // Verificar selecciones
    const periodInput = document.getElementById('periodSelector');
    const filterTypeSelect = document.getElementById('filterTypeSelector');
    const filterValueSelect = document.getElementById('filterValueSelector');
    
    if (!periodInput || !periodInput.value) {
        showRemanenteSelector();
        return;
    }
    
    if (!filterTypeSelect || !filterTypeSelect.value) {
        window.NotificationUtils.error('Por favor seleccione el tipo de filtro');
        return;
    }
    
    if (!filterValueSelect || !filterValueSelect.value) {
        window.NotificationUtils.error('Por favor seleccione el valor del filtro');
        return;
    }
    
    // Guardar selecciones
    const [year, month] = periodInput.value.split('-');
    const daysInMonth = new Date(year, month, 0).getDate();
    const weeks = daysInMonth <= 28 ? 4 : 5;
    
    selectedPeriodRemanente = {
        year: parseInt(year),
        month: parseInt(month),
        daysInMonth: daysInMonth,
        weeks: weeks
    };
    
    selectedFilterTypeRemanente = filterTypeSelect.value;
    selectedFilterValueRemanente = filterValueSelect.value;
    
    try {
        // Obtener datos de la base de datos
        const projectAssignments = window.PortalDB.getProjectAssignments();
        const assignments = window.PortalDB.getAssignments();
        const users = window.PortalDB.getUsers();
        const companies = window.PortalDB.getCompanies();
        const modules = window.PortalDB.getModules();
        const supports = window.PortalDB.getSupports();
        const reports = window.PortalDB.getReports();

        // Determinar qué asignaciones usar según el filtro
        let relevantAssignments = [];
        
        if (selectedFilterTypeRemanente === 'soporte') {
            // Usar asignaciones regulares filtradas por soporte
            relevantAssignments = Object.values(assignments).filter(assignment => 
                assignment.isActive && assignment.supportId === selectedFilterValueRemanente
            );
        } else if (selectedFilterTypeRemanente === 'cliente') {
            // Usar asignaciones de proyecto filtradas por cliente
            relevantAssignments = Object.values(projectAssignments).filter(assignment => 
                assignment.isActive && assignment.companyId === selectedFilterValueRemanente
            );
        }

        // Construir datos matriciales por módulos
        const moduleGroups = {};
        
        relevantAssignments.forEach(assignment => {
            const module = modules[assignment.moduleId];
            if (!module) return;
            
            const moduleKey = assignment.moduleId;
            
            if (!moduleGroups[moduleKey]) {
                moduleGroups[moduleKey] = {
                    name: module.name,
                    totalHours: 0,
                    weeks: {}
                };
                
                // Inicializar todas las semanas
                for (let week = 1; week <= 5; week++) {
                    moduleGroups[moduleKey].weeks[week] = {
                        modulo: module.name,
                        tiempo: 0,
                        tarifa: getModuleTariff(module.name),
                        total: 0
                    };
                }
            }
            
            // Buscar reportes del período para esta asignación
            const periodReports = Object.values(reports).filter(report => {
                if (report.status !== 'approved') return false;
                
                // Verificar que corresponda a esta asignación
                const matchesAssignment = 
                    (selectedFilterTypeRemanente === 'soporte' && 
                     report.consultorId === assignment.userId &&
                     report.companyId === assignment.companyId &&
                     report.moduleId === assignment.moduleId) ||
                    (selectedFilterTypeRemanente === 'cliente' &&
                     report.consultorId === assignment.consultorId &&
                     report.companyId === assignment.companyId &&
                     report.moduleId === assignment.moduleId);
                
                if (!matchesAssignment) return false;
                
                // Verificar que esté en el período seleccionado
                const reportDate = new Date(report.reportDate || report.createdAt);
                return reportDate.getFullYear() === selectedPeriodRemanente.year &&
                       reportDate.getMonth() + 1 === selectedPeriodRemanente.month;
            });
            
            // Distribuir horas por semanas
            periodReports.forEach(report => {
                const reportDate = new Date(report.reportDate || report.createdAt);
                const dayOfMonth = reportDate.getDate();
                const weekNumber = Math.ceil(dayOfMonth / 7);
                const validWeek = Math.min(weekNumber, selectedPeriodRemanente.weeks);
                
                const hours = parseFloat(report.hours) || 0;
                moduleGroups[moduleKey].weeks[validWeek].tiempo += hours;
            });
        });

        // Calcular totales y ajustar datos
        Object.keys(moduleGroups).forEach(moduleKey => {
            const module = moduleGroups[moduleKey];
            
            // Calcular total de horas del módulo
            module.totalHours = Object.values(module.weeks)
                .reduce((sum, week) => sum + (parseFloat(week.tiempo) || 0), 0);
            
            // Recalcular totales de cada semana
            Object.keys(module.weeks).forEach(weekNum => {
                const week = module.weeks[weekNum];
                week.total = week.tiempo * week.tarifa;
            });
        });

        // Si no hay datos reales, agregar datos de ejemplo
        if (Object.keys(moduleGroups).length === 0) {
            moduleGroups['SD'] = createExampleModule('SD', 850);
            moduleGroups['FI'] = createExampleModule('FI', 850);
            moduleGroups['MM'] = createExampleModule('MM', 850);
            moduleGroups['ABAP1'] = createExampleModule('ABAP1', 650);
            moduleGroups['EWM'] = createExampleModule('EWM', 850);
        }

        // Crear estructura del reporte
        currentRemanenteData = {
            period: selectedPeriodRemanente,
            filterType: selectedFilterTypeRemanente,
            filterId: selectedFilterValueRemanente,
            modules: moduleGroups
        };
        
        // Mostrar matriz editable
        displayRemanenteMatrix(currentRemanenteData);
        
        return currentRemanenteData;
        
    } catch (error) {
        console.error('❌ Error cargando configuración:', error);
        window.NotificationUtils.error('Error cargando datos del reporte');
        return null;
    }
}

// === CREAR MÓDULO DE EJEMPLO ===
function createExampleModule(moduleName, tarifa) {
    const baseHours = [15, 20, 30, 25, 5]; // Distribución ejemplo por semana
    const module = {
        name: moduleName,
        totalHours: 0,
        weeks: {}
    };
    
    for (let week = 1; week <= 5; week++) {
        const tiempo = week <= selectedPeriodRemanente.weeks ? baseHours[week - 1] : 0;
        module.weeks[week] = {
            modulo: moduleName,
            tiempo: tiempo,
            tarifa: tarifa,
            total: tiempo * tarifa
        };
    }
    
    module.totalHours = Object.values(module.weeks)
        .reduce((sum, week) => sum + week.tiempo, 0);
    
    return module;
}

// === OBTENER TARIFA DEL MÓDULO ===
function getModuleTariff(moduleName) {
    // Tarifas especiales por módulo
    const specialTariffs = {
        'ABAP1': 650,
        'ABAP2': 650,
        'Basis': 1000
    };
    
    return specialTariffs[moduleName] || 850; // Tarifa por defecto
}

// === MOSTRAR SELECTOR ===
function showRemanenteSelector() {
    const container = document.getElementById('reportPreviewContainerRemanente');
    if (!container) {
        console.error('❌ Contenedor no encontrado');
        return;
    }
    
    // Obtener opciones de filtro
    const companies = window.PortalDB.getCompanies();
    const supports = window.PortalDB.getSupports();
    
    const activeCompanies = Object.values(companies).filter(c => c.isActive);
    const activeSupports = Object.values(supports).filter(s => s.isActive);
    
    // Generar opciones
    let companyOptions = '';
    activeCompanies.forEach(company => {
        companyOptions += `<option value="${company.id}">${company.name}</option>`;
    });
    
    let supportOptions = '';
    activeSupports.forEach(support => {
        supportOptions += `<option value="${support.id}">${support.name}</option>`;
    });
    
    // Obtener fecha actual para el input month
    const now = new Date();
    const currentMonth = `${now.getFullYear()}-${(now.getMonth() + 1).toString().padStart(2, '0')}`;
    
    container.innerHTML = `
        <div class="report-preview-section">
            <div class="section-header">
                <h3 class="section-title">📊 Configurar Reporte Remanente</h3>
                <p class="section-description">Configure el período y filtros para generar el reporte matricial.</p>
            </div>
            
            <div class="selector-grid-remanente">
                <div class="form-group">
                    <label for="periodSelector">Período (Mes/Año):</label>
                    <input type="month" id="periodSelector" class="form-control" value="${currentMonth}" onchange="onPeriodSelectedRemanente()">
                </div>
                
                <div class="form-group">
                    <label for="filterTypeSelector">Filtrar por:</label>
                    <select id="filterTypeSelector" class="form-control" onchange="onFilterTypeSelectedRemanente()">
                        <option value="">-- Seleccione tipo --</option>
                        <option value="soporte">Por Soporte</option>
                        <option value="cliente">Por Cliente</option>
                    </select>
                </div>
                
                <div class="form-group">
                    <label for="filterValueSelector">Seleccionar:</label>
                    <select id="filterValueSelector" class="form-control" onchange="onFilterValueSelectedRemanente()" disabled>
                        <option value="">-- Primero seleccione tipo --</option>
                    </select>
                </div>
            </div>
            
            <div id="periodInfo" class="period-info" style="display: none;">
                <!-- Información del período se mostrará aquí -->
            </div>
            
            <div class="form-group" style="text-align: center; margin-top: 20px;">
                <button type="button" class="btn btn-primary" onclick="loadRemanenteConfiguration()" id="generateRemanenteBtn" disabled>
                    📊 Generar Reporte Remanente
                </button>
            </div>
        </div>
        
        <!-- Datos ocultos para JavaScript -->
        <script type="application/json" id="companyOptionsData">${companyOptions}</script>
        <script type="application/json" id="supportOptionsData">${supportOptions}</script>
    `;
}

// === MANEJAR SELECCIÓN DE PERÍODO ===
function onPeriodSelectedRemanente() {
    const periodInput = document.getElementById('periodSelector');
    if (!periodInput.value) return;
    
    const [year, month] = periodInput.value.split('-');
    const daysInMonth = new Date(year, month, 0).getDate();
    const weeks = daysInMonth <= 28 ? 4 : 5;
    
    const monthNames = [
        'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
        'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
    ];
    
    const periodInfo = document.getElementById('periodInfo');
    if (periodInfo) {
        const weeksText = weeks === 4 ? 
            `${monthNames[month-1]} tiene ${daysInMonth} días = 4 semanas completas` :
            `${monthNames[month-1]} tiene ${daysInMonth} días = 5 semanas (4 completas + 1 parcial de ${daysInMonth - 28} días)`;
        
        periodInfo.innerHTML = `
            <div class="alert alert-info">
                📅 <strong>${weeksText}</strong>
            </div>
        `;
        periodInfo.style.display = 'block';
    }
    
    updateGenerateButtonState();
}

// === MANEJAR SELECCIÓN DE TIPO DE FILTRO ===
function onFilterTypeSelectedRemanente() {
    const filterTypeSelect = document.getElementById('filterTypeSelector');
    const filterValueSelect = document.getElementById('filterValueSelector');
    
    const filterType = filterTypeSelect.value;
    
    if (!filterType) {
        filterValueSelect.disabled = true;
        filterValueSelect.innerHTML = '<option value="">-- Primero seleccione tipo --</option>';
        updateGenerateButtonState();
        return;
    }
    
    filterValueSelect.disabled = false;
    
    if (filterType === 'soporte') {
        const supports = window.PortalDB.getSupports();
        const activeSupports = Object.values(supports).filter(s => s.isActive);
        
        let options = '<option value="">-- Seleccione soporte --</option>';
        activeSupports.forEach(support => {
            options += `<option value="${support.id}">${support.name}</option>`;
        });
        filterValueSelect.innerHTML = options;
        
    } else if (filterType === 'cliente') {
        const companies = window.PortalDB.getCompanies();
        const activeCompanies = Object.values(companies).filter(c => c.isActive);
        
        let options = '<option value="">-- Seleccione cliente --</option>';
        activeCompanies.forEach(company => {
            options += `<option value="${company.id}">${company.name}</option>`;
        });
        filterValueSelect.innerHTML = options;
    }
    
    updateGenerateButtonState();
}

// === MANEJAR SELECCIÓN DE VALOR DE FILTRO ===
function onFilterValueSelectedRemanente() {
    updateGenerateButtonState();
}

// === ACTUALIZAR ESTADO DEL BOTÓN ===
function updateGenerateButtonState() {
    const periodInput = document.getElementById('periodSelector');
    const filterTypeSelect = document.getElementById('filterTypeSelector');
    const filterValueSelect = document.getElementById('filterValueSelector');
    const generateBtn = document.getElementById('generateRemanenteBtn');
    
    if (generateBtn) {
        const canGenerate = periodInput?.value && 
                           filterTypeSelect?.value && 
                           filterValueSelect?.value;
        
        generateBtn.disabled = !canGenerate;
    }
}

// === MOSTRAR MATRIZ EDITABLE ===
function displayRemanenteMatrix(data) {
    const container = document.getElementById('reportPreviewContainerRemanente');
    if (!container) {
        console.error('❌ Contenedor de vista previa no encontrado');
        return;
    }
    
    const monthNames = [
        'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
        'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
    ];
    
    const period = data.period;
    const filterType = data.filterType;
    
    // Obtener nombre del filtro
    let filterName = 'Desconocido';
    if (filterType === 'soporte') {
        const supports = window.PortalDB.getSupports();
        filterName = supports[data.filterId]?.name || 'Soporte Desconocido';
    } else if (filterType === 'cliente') {
        const companies = window.PortalDB.getCompanies();
        filterName = companies[data.filterId]?.name || 'Cliente Desconocido';
    }
    
    const weeksText = period.weeks === 4 ? 
        `${monthNames[period.month-1]} tiene ${period.daysInMonth} días = 4 semanas completas` :
        `${monthNames[period.month-1]} tiene ${period.daysInMonth} días = 5 semanas (4 completas + 1 parcial de ${period.daysInMonth - 28} días)`;
    
    let html = `
        <div class="report-preview-section">
            <div class="section-header">
                <h3 class="section-title">📊 Vista Previa: Reporte Remanente</h3>
                <p class="section-description">Matriz semanal editable de horas remanentes por módulo.</p>
            </div>
            
            <div class="period-header-remanente">
                <h4 style="color: #dc2626; margin: 0 0 8px 0; font-size: 1.3rem;">Período: ${monthNames[period.month-1]} ${period.year}</h4>
                <p style="color: #991b1b; margin: 0; font-size: 0.95rem;">Filtro: ${filterType === 'soporte' ? 'Por Soporte' : 'Por Cliente'} - ${filterName}</p>
            </div>
            
            <div class="weeks-info-remanente">
                📅 ${weeksText}
            </div>
            
            <div class="complexity-note-remanente">
                ⚡ <strong>Reporte Complejo:</strong> Este es el reporte más complejo del sistema con estructura matricial. Todas las celdas de tiempo y tarifa son editables. Los totales se recalculan automáticamente.
            </div>
            
            <div class="matrix-container-remanente">
                <table class="matrix-table">
                    <thead>
                        <tr>
                            <th class="total-header">Total de Horas</th>
                            ${generateWeekHeaders(period.weeks)}
                        </tr>
                        <tr>
                            <th></th>
                            ${generateSubHeaders(period.weeks)}
                        </tr>
                    </thead>
                    <tbody id="matrixTableBodyRemanente">
                        ${generateMatrixRows(data)}
                    </tbody>
                </table>
            </div>
            
            <div class="report-actions">
                <button type="button" class="btn btn-secondary" onclick="resetRemanenteData()">
                    🔄 Restaurar Datos
                </button>
                <button type="button" class="btn btn-success" onclick="generateRemanenteReport()">
                    📊 Generar Excel Matricial
                </button>
            </div>
        </div>
    `;
    
    container.innerHTML = html;
    
    // Agregar estilos si no existen
    addRemanenteStyles();
}

// === GENERAR HEADERS DE SEMANAS ===
function generateWeekHeaders(totalWeeks) {
    let html = '';
    for (let week = 1; week <= 5; week++) {
        if (week <= totalWeeks) {
            html += `<th class="week-header" colspan="4">SEMANA ${week}</th>`;
        } else {
            html += `<th class="empty-week-header" colspan="4">-</th>`;
        }
    }
    return html;
}

// === GENERAR SUB-HEADERS ===
function generateSubHeaders(totalWeeks) {
    let html = '';
    for (let week = 1; week <= 5; week++) {
        if (week <= totalWeeks) {
            html += `
                <th>MÓDULO</th>
                <th>TIEMPO</th>
                <th>TARIFA</th>
                <th>TOTAL</th>
            `;
        } else {
            html += `
                <th class="empty-week">-</th>
                <th class="empty-week">-</th>
                <th class="empty-week">-</th>
                <th class="empty-week">-</th>
            `;
        }
    }
    return html;
}

// === GENERAR FILAS DE LA MATRIZ ===
function generateMatrixRows(data) {
    const modules = data.modules;
    const totalWeeks = data.period.weeks;
    let html = '';
    
    // Filas de módulos
    Object.keys(modules).forEach((moduleKey, moduleIndex) => {
        const module = modules[moduleKey];
        
        html += '<tr>';
        
        // Primera columna: Total de horas
        html += `<td class="total-hours">${module.totalHours.toFixed(1)}</td>`;
        
        // Columnas para cada semana
        for (let week = 1; week <= 5; week++) {
            const weekData = module.weeks[week];
            const isEmptyWeek = week > totalWeeks;
            
            if (isEmptyWeek) {
                html += `
                    <td class="empty-week">-</td>
                    <td class="empty-week">-</td>
                    <td class="empty-week">-</td>
                    <td class="empty-week">-</td>
                `;
            } else {
                html += `
                    <td class="module-name">${weekData.modulo}</td>
                    <td class="hours">
                        <input type="number" 
                               class="editable-input" 
                               value="${weekData.tiempo}" 
                               step="0.5" 
                               min="0"
                               onchange="updateMatrixCell('${moduleKey}', ${week}, 'tiempo', this.value)">
                    </td>
                    <td class="currency">
                        <input type="number" 
                               class="editable-input" 
                               value="${weekData.tarifa}" 
                               step="50" 
                               min="0"
                               onchange="updateMatrixCell('${moduleKey}', ${week}, 'tarifa', this.value)">
                    </td>
                    <td class="currency">${window.NumberUtils ? window.NumberUtils.formatCurrency(weekData.total) : ('$' + weekData.total.toLocaleString())}</td>
                `;
            }
        }
        
        html += '</tr>';
    });
    
    // Fila de totales
    html += '<tr class="totals-row">';
    html += '<td><strong>TOTALES</strong></td>';
    
    for (let week = 1; week <= 5; week++) {
        const isEmptyWeek = week > totalWeeks;
        
        if (isEmptyWeek) {
            html += `
                <td class="empty-week">-</td>
                <td class="empty-week">-</td>
                <td class="empty-week">-</td>
                <td class="empty-week">-</td>
            `;
        } else {
            const weekTotals = calculateWeekTotals(week, modules);
            html += `
                <td></td>
                <td class="hours"><strong>${weekTotals.tiempo.toFixed(1)}</strong></td>
                <td></td>
                <td class="currency"><strong>${window.NumberUtils ? window.NumberUtils.formatCurrency(weekTotals.total) : ('$' + weekTotals.total.toLocaleString())}</strong></td>
            `;
        }
    }
    
    html += '</tr>';
    
    return html;
}

// === ACTUALIZAR CELDA DE LA MATRIZ ===
function updateMatrixCell(moduleKey, week, field, value) {
    if (!currentRemanenteData || !currentRemanenteData.modules[moduleKey]) return;
    
    const numValue = parseFloat(value) || 0;
    currentRemanenteData.modules[moduleKey].weeks[week][field] = numValue;
    
    // Recalcular total de la celda
    const weekData = currentRemanenteData.modules[moduleKey].weeks[week];
    weekData.total = weekData.tiempo * weekData.tarifa;
    
    // Recalcular total del módulo
    currentRemanenteData.modules[moduleKey].totalHours = 
        Object.values(currentRemanenteData.modules[moduleKey].weeks)
            .reduce((sum, w) => sum + (parseFloat(w.tiempo) || 0), 0);
    
    // Actualizar toda la matriz
    displayRemanenteMatrix(currentRemanenteData);
}

// === CALCULAR TOTALES POR SEMANA ===
function calculateWeekTotals(week, modules) {
    let totalTiempo = 0;
    let totalAmount = 0;
    
    Object.keys(modules).forEach(moduleKey => {
        const weekData = modules[moduleKey].weeks[week];
        totalTiempo += parseFloat(weekData.tiempo) || 0;
        totalAmount += parseFloat(weekData.total) || 0;
    });
    
    return { tiempo: totalTiempo, total: totalAmount };
}

// === RESTAURAR DATOS ORIGINALES ===
function resetRemanenteData() {
    if (confirm('¿Está seguro de que desea restaurar los datos originales? Se perderán todos los cambios.')) {
        loadRemanenteConfiguration();
        window.NotificationUtils.success('Datos restaurados correctamente');
    }
}

// === GENERAR REPORTE EXCEL ===
function generateRemanenteReport() {
    if (!currentRemanenteData) {
        window.NotificationUtils.error('No hay datos para generar el reporte');
        return;
    }
    
    try {
        console.log('📊 Generando reporte Excel: Reporte Remanente...');
        
        const monthNames = [
            'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
            'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
        ];
        
        const period = currentRemanenteData.period;
        const filterType = currentRemanenteData.filterType;
        
        // Obtener nombre del filtro
        let filterName = 'Desconocido';
        if (filterType === 'soporte') {
            const supports = window.PortalDB.getSupports();
            filterName = supports[currentRemanenteData.filterId]?.name || 'Soporte Desconocido';
        } else if (filterType === 'cliente') {
            const companies = window.PortalDB.getCompanies();
            filterName = companies[currentRemanenteData.filterId]?.name || 'Cliente Desconocido';
        }
        
        // Preparar datos para Excel - estructura matricial
        const excelData = [];

// Fila 1: Headers de semanas CON SEPARADORES
const weekHeaders = ['Total de Horas'];
for (let week = 1; week <= period.weeks; week++) {
    weekHeaders.push(`SEMANA ${week}`, '', '', '');
    // Agregar columna separadora entre semanas (excepto la última)
    if (week < period.weeks) {
        weekHeaders.push(''); // Columna separadora
    }
}
excelData.push(weekHeaders);

// Fila 2: Sub-headers CON SEPARADORES
const subHeaders = [''];
for (let week = 1; week <= period.weeks; week++) {
    subHeaders.push('MODULO', 'TIEMPO', 'TARIFA', 'TOTAL');
    // Agregar columna separadora entre semanas (excepto la última)
    if (week < period.weeks) {
        subHeaders.push(''); // Columna separadora
    }
}
excelData.push(subHeaders);

// Filas de datos por módulo CON SEPARADORES
Object.keys(currentRemanenteData.modules).forEach(moduleKey => {
    const module = currentRemanenteData.modules[moduleKey];
    const row = [module.totalHours];
    
    for (let week = 1; week <= period.weeks; week++) {
        const weekData = module.weeks[week];
        row.push(
            weekData.modulo,
            weekData.tiempo,
            weekData.tarifa,
            weekData.total
        );
        // Agregar columna separadora entre semanas (excepto la última)
        if (week < period.weeks) {
            row.push(''); // Columna separadora
        }
    }
    
    excelData.push(row);
});

// Fila de totales CON SEPARADORES
const totalsRow = ['TOTALES'];
for (let week = 1; week <= period.weeks; week++) {
    const weekTotals = calculateWeekTotals(week, currentRemanenteData.modules);
    totalsRow.push('', weekTotals.tiempo, '', weekTotals.total);
    // Agregar columna separadora entre semanas (excepto la última)
    if (week < period.weeks) {
        totalsRow.push(''); // Columna separadora
    }
}
excelData.push(totalsRow);
        
        // Crear libro Excel
        const wb = window.XLSX.utils.book_new();
        const ws = window.XLSX.utils.aoa_to_sheet(excelData);
        
        // Configurar anchos de columna
            const colWidths = [{ width: 15 }]; // Total de Horas
        for (let week = 1; week <= period.weeks; week++) {
            colWidths.push(
                { width: 12 }, // MODULO
                { width: 10 }, // TIEMPO
                { width: 12 }, // TARIFA
                { width: 12 }  // TOTAL
            );
            // Agregar ancho para columna separadora (excepto la última semana)
            if (week < period.weeks) {
                colWidths.push({ width: 3 }); // Columna separadora estrecha
            }
        }
        ws['!cols'] = colWidths;
        
        // Merge cells para headers de semanas
    const merges = [];
for (let week = 1; week <= period.weeks; week++) {
    const startCol = 1 + (week - 1) * 5; // 4 columnas de datos + 1 separador
    const endCol = startCol + 3; // 4 columnas de datos
    merges.push({
        s: { r: 0, c: startCol },
        e: { r: 0, c: endCol }
    });
}
ws['!merges'] = merges;

// Aplicar estilos y bordes a cada semana
const range = window.XLSX.utils.decode_range(ws['!ref']);

// Aplicar bordes grupales a cada semana
for (let week = 1; week <= period.weeks; week++) {
    const startCol = 1 + (week - 1) * 5; // 4 columnas + 1 separador
    const endCol = startCol + 3; // 4 columnas de datos
    
    // Aplicar bordes gruesos alrededor de cada semana
    for (let row = 0; row <= range.e.r; row++) {
        for (let col = startCol; col <= endCol; col++) {
            const cellAddress = window.XLSX.utils.encode_cell({ r: row, c: col });
            if (!ws[cellAddress]) ws[cellAddress] = { v: '', t: 's' };
            
            // Crear objeto de estilo si no existe
            if (!ws[cellAddress].s) ws[cellAddress].s = {};
            
            // Aplicar bordes
            ws[cellAddress].s.border = {
                top: { 
                    style: col === startCol && row === 0 ? "thick" : "thin", 
                    color: { rgb: "000000" } 
                },
                bottom: { 
                    style: col === startCol && row === range.e.r ? "thick" : "thin", 
                    color: { rgb: "000000" } 
                },
                left: { 
                    style: col === startCol ? "thick" : "thin", 
                    color: { rgb: "000000" } 
                },
                right: { 
                    style: col === endCol ? "thick" : "thin", 
                    color: { rgb: "000000" } 
                }
            };
            
            // Aplicar color de fondo a headers
            if (row === 0) {
                ws[cellAddress].s.fill = { bgColor: { rgb: "FFEEEE" } }; // Fondo rosado claro
                ws[cellAddress].s.font = { bold: true, color: { rgb: "CC0000" } }; // Texto rojo
            } else if (row === 1) {
                ws[cellAddress].s.fill = { bgColor: { rgb: "FFF8F8" } }; // Fondo muy claro
                ws[cellAddress].s.font = { bold: true };
            }
            
            // Centrar texto en headers
            if (row <= 1) {
                ws[cellAddress].s.alignment = { horizontal: "center", vertical: "center" };
            }
        }
    }
}

// Estilizar columnas separadoras
for (let week = 1; week < period.weeks; week++) {
    const separatorCol = 1 + week * 5 - 1; // Columna separadora
    
    for (let row = 0; row <= range.e.r; row++) {
        const cellAddress = window.XLSX.utils.encode_cell({ r: row, c: separatorCol });
        if (!ws[cellAddress]) ws[cellAddress] = { v: '', t: 's' };
        
        // Dar color gris claro a las columnas separadoras
        ws[cellAddress].s = {
            fill: { bgColor: { rgb: "F5F5F5" } },
            border: {
                left: { style: "thin", color: { rgb: "CCCCCC" } },
                right: { style: "thin", color: { rgb: "CCCCCC" } }
            }
        };
    }
}

// Estilizar la columna de totales
for (let row = 0; row <= range.e.r; row++) {
    const cellAddress = window.XLSX.utils.encode_cell({ r: row, c: 0 });
    if (ws[cellAddress]) {
        if (!ws[cellAddress].s) ws[cellAddress].s = {};
        ws[cellAddress].s.fill = { bgColor: { rgb: "E6F3FF" } }; // Fondo azul claro
        ws[cellAddress].s.font = { bold: true };
        ws[cellAddress].s.alignment = { horizontal: "center", vertical: "center" };
    }
}
        
        // Agregar hoja al libro
        window.XLSX.utils.book_append_sheet(wb, ws, 'Reporte Remanente');
        
        // Generar nombre de archivo
        const timestamp = new Date().toISOString().slice(0, 19).replace(/:/g, '-');
        const fileName = `Reporte_Remanente_${monthNames[period.month-1]}_${period.year}_${filterType}_${timestamp}.xlsx`;
       
       // Descargar archivo
       window.XLSX.writeFile(wb, fileName);
       
       // Registrar actividad
       if (window.AuthSys && window.AuthSys.logActivity) {
           window.AuthSys.logActivity(
               'report_generated',
               `Reporte generado: ${fileName}`,
               { 
                   reportType: 'reporte_remanente',
                   fileName: fileName,
                   period: `${monthNames[period.month-1]} ${period.year}`,
                   filterType: filterType,
                   filterId: currentRemanenteData.filterId,
                   filterName: filterName,
                   weeks: period.weeks,
                   moduleCount: Object.keys(currentRemanenteData.modules).length,
                   totalHours: Object.values(currentRemanenteData.modules)
                       .reduce((sum, module) => sum + module.totalHours, 0)
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
function addRemanenteStyles() {
   if (document.getElementById('remanenteStyles')) return;
   
   const styles = `
       <style id="remanenteStyles">
           .selector-grid-remanente {
               display: grid;
               grid-template-columns: 1fr 1fr 1fr;
               gap: 20px;
               margin-bottom: 20px;
           }
           
           @media (max-width: 768px) {
               .selector-grid-remanente {
                   grid-template-columns: 1fr;
               }
           }
           
           .period-header-remanente {
               background: #fef2f2;
               padding: 20px;
               margin-bottom: 20px;
               border-radius: 8px;
               border-left: 4px solid #dc2626;
           }
           
           .weeks-info-remanente {
               background: #fbbf24;
               color: #92400e;
               padding: 12px 15px;
               border-radius: 8px;
               margin-bottom: 20px;
               font-size: 0.9rem;
               font-weight: 500;
           }
           
           .complexity-note-remanente {
               background: #f0f9ff;
               border-left: 4px solid #0284c7;
               padding: 15px;
               border-radius: 8px;
               margin-bottom: 20px;
               font-size: 0.9rem;
               color: #0369a1;
           }
           
           .matrix-container-remanente {
               overflow-x: auto;
               border-radius: 8px;
               border: 1px solid #e2e8f0;
               margin-bottom: 20px;
           }
           
           .matrix-table {
               width: 100%;
               border-collapse: collapse;
               background: white;
               min-width: 1000px;
           }
           
           .matrix-table th {
               background: #fef2f2;
               color: #374151;
               font-weight: 600;
               padding: 12px 8px;
               text-align: center;
               border: 1px solid #e5e7eb;
               font-size: 12px;
           }
           
           .matrix-table .week-header {
               background: #fee2e2;
               color: #dc2626;
               font-weight: 700;
               font-size: 13px;
           }
           
           .matrix-table .total-header {
               background: #dc2626;
               color: white;
               font-weight: 700;
           }
           
           .matrix-table .empty-week-header {
               background: #f3f4f6;
               color: #9ca3af;
           }
           
           .matrix-table td {
               padding: 8px 6px;
               border: 1px solid #e5e7eb;
               text-align: center;
               font-size: 12px;
           }
           
           .matrix-table tr:nth-child(even) {
               background: #f9fafb;
           }
           
           .matrix-table tr:hover {
               background: #fef2f2;
           }
           
           .editable-input {
               border: none;
               background: transparent;
               font-size: 12px;
               padding: 4px;
               border-radius: 4px;
               transition: all 0.2s ease;
               width: 100%;
               text-align: center;
           }
           
           .editable-input:hover {
               background: #f3f4f6;
           }
           
           .editable-input:focus {
               outline: none;
               background: white;
               border: 2px solid #dc2626;
           }
           
           .currency {
               text-align: right;
               font-weight: 500;
               color: #dc2626;
           }
           
           .hours {
               text-align: center;
               font-weight: 500;
           }
           
           .module-name {
               font-weight: 600;
               color: #374151;
               text-align: left;
               padding-left: 12px;
           }
           
           .total-hours {
               font-weight: 700;
               color: #dc2626;
               background: #fef2f2;
           }
           
           .totals-row {
               background: #fee2e2 !important;
               font-weight: 700;
               color: #dc2626;
           }
           
           .totals-row td {
               border-top: 2px solid #dc2626;
           }
           
           .empty-week {
               background: #f3f4f6 !important;
               color: #9ca3af;
           }
           
           .period-info {
               margin-bottom: 20px;
           }
           
           .alert {
               padding: 12px 15px;
               border-radius: 8px;
               margin-bottom: 15px;
           }
           
           .alert-info {
               background: #dbeafe;
               border-left: 4px solid #3b82f6;
               color: #1e40af;
           }
       </style>
   `;
   
   document.head.insertAdjacentHTML('beforeend', styles);
}

// === EXPORTAR FUNCIONES GLOBALMENTE ===
if (typeof window !== 'undefined') {
   window.RemanenteReport = {
       load: loadRemanenteConfiguration,
       generate: generateRemanenteReport,
       reset: resetRemanenteData,
       showSelector: showRemanenteSelector,
       updateMatrixCell: updateMatrixCell,
       calculateWeekTotals: calculateWeekTotals
   };
}

// Exportar funciones inmediatamente
window.showRemanenteSelector = showRemanenteSelector;
window.loadRemanenteConfiguration = loadRemanenteConfiguration;
window.onPeriodSelectedRemanente = onPeriodSelectedRemanente;
window.onFilterTypeSelectedRemanente = onFilterTypeSelectedRemanente;
window.onFilterValueSelectedRemanente = onFilterValueSelectedRemanente;
window.updateMatrixCell = updateMatrixCell;
window.resetRemanenteData = resetRemanenteData;
window.generateRemanenteReport = generateRemanenteReport;

console.log('✅ Reporte Remanente inicializado correctamente');