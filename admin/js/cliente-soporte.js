/**
 * === REPORTE: CLIENTE SOPORTE ===
 * Implementación del reporte de servicios de soporte para UN cliente específico
 * siguiendo el patrón de previsualización editable existente
 */

// === VARIABLES GLOBALES ===
let selectedClientId = null;
let currentClienteSoporteData = [];

// === CONFIGURACIÓN Y CARGA DE DATOS ===
function loadClienteSoporteConfiguration() {
    console.log('📞 Cargando configuración de Cliente Soporte...');
    
    // Primero verificar si hay un cliente seleccionado
    const clienteSelect = document.getElementById('clienteSelector');
    if (!clienteSelect || !clienteSelect.value) {
        showClienteSelector();
        return;
    }
    
    selectedClientId = clienteSelect.value;
    
    try {
        // Obtener datos de la base de datos
        const assignments = window.PortalDB.getAssignments();
        const users = window.PortalDB.getUsers();
        const companies = window.PortalDB.getCompanies();
        const modules = window.PortalDB.getModules();
        const supports = window.PortalDB.getSupports();
        const reports = window.PortalDB.getReports();

        // Verificar que el cliente existe
        const selectedCliente = companies[selectedClientId];
        if (!selectedCliente) {
            window.NotificationUtils.error('Cliente no encontrado');
            return [];
        }

        // Construir datos del reporte SOLO para el cliente seleccionado
        const reportData = [];
        
        // Recorrer asignaciones activas del cliente específico
        Object.values(assignments).forEach(assignment => {
            if (!assignment.isActive || assignment.companyId !== selectedClientId) return;
            
            const company = companies[assignment.companyId];
            const module = modules[assignment.moduleId];
            const support = supports[assignment.supportId];
            
            if (!company || !module || !support) return;
            
                // Obtener reportes filtrados por fecha
                const filteredReports = getFilteredReportsByDate(
                    'clienteSoporteTimeFilter',
                    'clienteSoporteStartDate', 
                    'clienteSoporteEndDate'
                );

                // Buscar reportes aprobados para esta asignación
                const consultorReports = filteredReports.filter(report =>
                    report.companyId === assignment.companyId &&
                    report.moduleId === assignment.moduleId &&
                    report.supportId === assignment.supportId &&
                    report.status === 'approved'
                );

                // 🛠️ CORRECCIÓN: Cambiar clienteReports por consultorReports
                const totalHours = consultorReports.reduce((sum, report) => sum + (report.hoursWorked || 0), 0);
                const totalAmount = totalHours * (assignment.hourlyRate || 0);

                // Solo agregar si hay horas trabajadas
                if (totalHours > 0) {
                    reportData.push({
                        soporte: support.nombre,
                        modulo: module.nombre,
                        tiempo: totalHours,
                        tarifa: assignment.hourlyRate || 0,
                        total: totalAmount,
                        _companyId: assignment.companyId,
                        _moduleId: assignment.moduleId,
                        _supportId: assignment.supportId
                    });
                }
        });
        
        // Ordenar por soporte y módulo
        reportData.sort((a, b) => {
            const soporteCompare = a.soporte.localeCompare(b.soporte);
            if (soporteCompare !== 0) return soporteCompare;
            return a.modulo.localeCompare(b.modulo);
        });
        
        // Si no hay datos reales, agregar datos de ejemplo para demo
        if (reportData.length === 0) {
            console.log('🔄 No hay datos reales, agregando datos de ejemplo...');
            reportData.push(
                {
                    soporte: 'Consultoría SAP SD',
                    modulo: 'SD',
                    tiempo: 40,
                    tarifa: 850,
                    total: 34000,
                    _companyId: selectedClientId,
                    _moduleId: 'SD',
                    _supportId: '0001'
                },
                {
                    soporte: 'Soporte Técnico FI',
                    modulo: 'FI',
                    tiempo: 25,
                    tarifa: 850,
                    total: 21250,
                    _companyId: selectedClientId,
                    _moduleId: 'FI',
                    _supportId: '0002'
                },
                {
                    soporte: 'Desarrollo ABAP',
                    modulo: 'ABAP',
                    tiempo: 60,
                    tarifa: 650,
                    total: 39000,
                    _companyId: selectedClientId,
                    _moduleId: 'ABAP',
                    _supportId: '0003'
                },
                {
                    soporte: 'Consultoría MM',
                    modulo: 'MM',
                    tiempo: 30,
                    tarifa: 850,
                    total: 25500,
                    _companyId: selectedClientId,
                    _moduleId: 'MM',
                    _supportId: '0004'
                }
            );
        }
        
        // Guardar datos globalmente para usar en generación
        window.currentClienteSoporteData = reportData;
        
        // Mostrar tabla editable
        displayClienteSoporteTable(reportData, selectedCliente.name);
        
        return reportData;
        
    } catch (error) {
        console.error('❌ Error cargando configuración:', error);
        window.NotificationUtils.error('Error cargando datos del reporte');
        return [];
    }
}

// === MOSTRAR SELECTOR DE CLIENTE ===
function showClienteSelector() {
    console.log('👤 Mostrando selector de cliente...');
    
    try {
        const companies = window.PortalDB.getCompanies();
        const activeClientes = Object.values(companies).filter(company => company.isActive);
        
        let html = `
            <div class="report-preview-section">
                <div class="section-header">
                    <h3 class="section-title">📞 Seleccionar Cliente</h3>
                    <p class="section-description">Seleccione un cliente para ver su reporte de soporte</p>
                </div>
                
                <div class="cliente-selector-container">
                    <div class="form-group">
                        <label for="clienteSelector">Cliente:</label>
                        <select id="clienteSelector" class="form-control">
                            <option value="">-- Seleccionar Cliente --</option>
        `;
        
        activeClientes.forEach(cliente => {
            html += `<option value="${cliente.id}">${cliente.name}</option>`;
        });
        
        html += `
                        </select>
                    </div>
                    
                    <div class="form-group" style="text-align: center; margin-top: 20px;">
                        <button type="button" class="btn btn-primary" onclick="handleClienteSelection()" disabled id="generateClienteReportBtn">
                            📊 Generar Reporte
                        </button>
                    </div>
                </div>
            </div>
        `;
        
        const container = document.getElementById('reportPreviewContainerSoporte');
        if (container) {
            container.innerHTML = html;
            
            // Agregar listener para habilitar botón
            const selector = document.getElementById('clienteSelector');
            const button = document.getElementById('generateClienteReportBtn');
            
            selector.addEventListener('change', function() {
                button.disabled = !this.value;
            });
        }
        
    } catch (error) {
        console.error('❌ Error mostrando selector de cliente:', error);
        window.NotificationUtils.error('Error cargando lista de clientes');
    }
}

// === MANEJAR SELECCIÓN DE CLIENTE ===
function handleClienteSelection() {
    const selector = document.getElementById('clienteSelector');
    if (selector && selector.value) {
        selectedClientId = selector.value;
        loadClienteSoporteConfiguration();
    }
}

// === MOSTRAR TABLA EDITABLE ===
function displayClienteSoporteTable(data, clienteNombre) {
    const container = document.getElementById('reportPreviewContainerSoporte');
    if (!container) {
        console.error('❌ Contenedor de vista previa no encontrado');
        return;
    }
    
    let html = `
        <div class="report-preview-section">
            <div class="section-header">
                <h3 class="section-title">📞 Vista Previa: Cliente Soporte</h3>
                <p class="section-description">Cliente: <strong>${clienteNombre}</strong> - Edite las horas y tarifas según sea necesario.</p>
            </div>
            
            <div class="table-container">
                <table class="editable-table">
                    <thead>
                        <tr>
                            <th>Soporte</th>
                            <th>Módulo</th>
                            <th>TIEMPO</th>
                            <th>TARIFA de Módulo</th>
                            <th>TOTAL</th>
                        </tr>
                    </thead>
                    <tbody>
    `;
    
    data.forEach((row, index) => {
        html += `
            <tr>
                <td>${row.soporte}</td>
                <td>${row.modulo}</td>
                <td>
                    <input type="number" 
                           class="form-control tiempo-input" 
                           value="${row.tiempo}" 
                           data-index="${index}"
                           min="0" 
                           step="0.5"
                           onchange="updateClienteSoporteRow(${index}, 'tiempo', this.value)">
                </td>
                <td>
                    <input type="number" 
                           class="form-control tarifa-input" 
                           value="${row.tarifa}" 
                           data-index="${index}"
                           min="0" 
                           step="50"
                           onchange="updateClienteSoporteRow(${index}, 'tarifa', this.value)">
                </td>
                <td class="total-cell" data-index="${index}">
                    ${window.NumberUtils ? window.NumberUtils.formatCurrency(row.total) : row.total.toLocaleString()}
                </td>
            </tr>
        `;
    });
    
    html += `
                    </tbody>
                    <tfoot>
                        <tr class="totals-row">
                            <td colspan="2"><strong>TOTAL GENERAL</strong></td>
                            <td class="total-horas"><strong>${calculateClienteTotalHours(data)}</strong></td>
                            <td></td>
                            <td class="gran-total"><strong id="granTotalDisplay"></strong></td>
                        </tr>
                    </tfoot>
                </table>
            </div>
            
            <div class="report-actions">
                <button type="button" class="btn btn-success" onclick="generateClienteSoporteReport()">
                    📄 Generar Excel
                </button>
                <button type="button" class="btn btn-secondary" onclick="resetClienteSoporteData()">
                    🔄 Restaurar Datos
                </button>
                <button type="button" class="btn btn-primary" onclick="showClienteSelector()">
                    👤 Cambiar Cliente
                </button>
            </div>
        </div>
    `;
    
    container.innerHTML = html;
    
    // Actualizar total general
    updateClienteGranTotal();
    
    // Agregar estilos específicos
    addClienteSoporteStyles();
    
    console.log('✅ Tabla editable mostrada correctamente');
}

// === ACTUALIZAR FILA ===
function updateClienteSoporteRow(index, field, value) {
    if (!window.currentClienteSoporteData || !window.currentClienteSoporteData[index]) {
        console.error('❌ Datos no encontrados para actualizar');
        return;
    }
    
    const numValue = parseFloat(value) || 0;
    window.currentClienteSoporteData[index][field] = numValue;
    
    // Recalcular total de la fila
    const row = window.currentClienteSoporteData[index];
    row.total = (parseFloat(row.tiempo) || 0) * (parseFloat(row.tarifa) || 0);
    
    // Actualizar celda de total
    const totalCell = document.querySelector(`.total-cell[data-index="${index}"]`);
    if (totalCell) {
        totalCell.textContent = window.NumberUtils ? 
            window.NumberUtils.formatCurrency(row.total) : row.total.toLocaleString();
    }
    
    // Actualizar totales generales
    updateClienteGranTotal();
    updateClienteTotalHours();
    
    console.log(`✅ Fila ${index} actualizada: ${field} = ${numValue}`);
}

// === ACTUALIZAR TOTAL GENERAL ===
function updateClienteGranTotal() {
    const totalGeneral = calculateClienteGrandTotal(window.currentClienteSoporteData);
    const granTotalDisplay = document.getElementById('granTotalDisplay');
    
    if (granTotalDisplay) {
        granTotalDisplay.textContent = window.NumberUtils ? 
            window.NumberUtils.formatCurrency(totalGeneral) : totalGeneral.toLocaleString();
    }
}

// === ACTUALIZAR TOTAL DE HORAS ===
function updateClienteTotalHours() {
    const totalHoras = calculateClienteTotalHours(window.currentClienteSoporteData);
    const totalHorasDisplay = document.querySelector('.total-horas strong');
    
    if (totalHorasDisplay) {
        totalHorasDisplay.textContent = `${totalHoras}`;
    }
}

// === FUNCIONES DE CÁLCULO ===
function calculateClienteTotalHours(data) {
    return data.reduce((sum, row) => sum + (parseFloat(row.tiempo) || 0), 0);
}

function calculateClienteGrandTotal(data) {
    return data.reduce((sum, row) => sum + (parseFloat(row.total) || 0), 0);
}

// === RESTAURAR DATOS ORIGINALES ===
function resetClienteSoporteData() {
    if (confirm('¿Está seguro de que desea restaurar los datos originales? Se perderán todos los cambios.')) {
        loadClienteSoporteConfiguration();
        window.NotificationUtils.success('Datos restaurados correctamente');
    }
}

// === GENERAR REPORTE EXCEL ===
function generateClienteSoporteReport() {
    if (!window.currentClienteSoporteData || window.currentClienteSoporteData.length === 0) {
        window.NotificationUtils.warning('No hay datos para generar el reporte');
        return;
    }
    
    if (!selectedClientId) {
        window.NotificationUtils.error('No hay cliente seleccionado');
        return;
    }
    
    try {
        console.log('📊 Generando reporte Excel: Cliente Soporte...');
        
        // Obtener nombre del cliente
        const companies = window.PortalDB.getCompanies();
        const clienteNombre = companies[selectedClientId]?.name || 'Cliente Desconocido';
        
        // Preparar datos para Excel
        const excelData = [
            [], // Fila vacía
            [], // Fila vacía
            [`Cliente: ${clienteNombre}`], // Cliente
            ['Soporte', 'Módulo', 'TIEMPO', 'TARIFA de Módulo', 'TOTAL'] // Headers
        ];
        
        // Agregar datos de filas
        window.currentClienteSoporteData.forEach(row => {
            excelData.push([
                row.soporte,
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
            calculateClienteTotalHours(window.currentClienteSoporteData),
            '',
            calculateClienteGrandTotal(window.currentClienteSoporteData)
        ]);
        
        // Crear libro Excel
        const wb = window.XLSX.utils.book_new();
        const ws = window.XLSX.utils.aoa_to_sheet(excelData);
        
        // Aplicar estilos y formato
        const range = window.XLSX.utils.decode_range(ws['!ref']);
        
        // Configurar anchos de columna
        ws['!cols'] = [
            { width: 25 }, // Soporte
            { width: 15 }, // Módulo
            { width: 12 }, // TIEMPO
            { width: 18 }, // TARIFA
            { width: 15 }  // TOTAL
        ];
        
        // Aplicar formato a celdas específicas
        for (let row = range.s.r; row <= range.e.r; row++) {
            for (let col = range.s.c; col <= range.e.c; col++) {
                const cellAddress = window.XLSX.utils.encode_cell({ r: row, c: col });
                if (!ws[cellAddress]) continue;
                
                // Formato para números monetarios en columna TOTAL
                if (col === 4 && row > 3) { // Columna TOTAL
                    ws[cellAddress].z = '"$"#,##0.00';
                }
                
                // Formato para números en columna TARIFA
                if (col === 3 && row > 3) { // Columna TARIFA
                    ws[cellAddress].z = '"$"#,##0.00';
                }
                
                // Formato para horas en columna TIEMPO
                if (col === 2 && row > 3) { // Columna TIEMPO
                    ws[cellAddress].z = '#,##0.0';
                }
            }
        }
        
        // Agregar hoja al libro
        window.XLSX.utils.book_append_sheet(wb, ws, 'Cliente Soporte');
        
        // Generar nombre de archivo
        const timestamp = new Date().toISOString().slice(0, 19).replace(/:/g, '-');
        const fileName = `Reporte_Cliente_Soporte_${clienteNombre.replace(/\s+/g, '_')}_${timestamp}.xlsx`;
        
        // Descargar archivo
        window.XLSX.writeFile(wb, fileName);
        
        // Registrar actividad
        if (window.AuthSys && window.AuthSys.logActivity) {
            window.AuthSys.logActivity(
                'report_generated',
                `Reporte generado: ${fileName}`,
                { 
                    reportType: 'cliente_soporte',
                    fileName: fileName,
                    clienteId: selectedClientId,
                    clienteNombre: clienteNombre,
                    recordCount: window.currentClienteSoporteData.length,
                    totalHours: calculateClienteTotalHours(window.currentClienteSoporteData),
                    totalAmount: calculateClienteGrandTotal(window.currentClienteSoporteData)
                }
            );
        }

        window.NotificationUtils.success(`Reporte generado: ${fileName}`);
        console.log('✅ Reporte Excel generado correctamente');
        
    } catch (error) {
        console.error('❌ Error generando reporte Excel:', error);
        window.NotificationUtils.error('Error generando reporte Excel');
    }
}

// === ESTILOS ESPECÍFICOS ===
function addClienteSoporteStyles() {
    // Verificar si ya existen los estilos
    if (document.getElementById('clienteSoporteStyles')) return;
    
    const styles = `
        <style id="clienteSoporteStyles">
            /* Estilos específicos para Cliente Soporte */
            .cliente-selector-container {
                max-width: 400px;
                margin: 0 auto;
                padding: 20px;
                background: var(--gray-50, #f8fafc);
                border-radius: 8px;
                border: 1px solid var(--gray-200, #e2e8f0);
            }
            
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
            
            .table-container {
                overflow-x: auto;
                margin-bottom: 20px;
                border: 1px solid var(--gray-300, #cbd5e1);
                border-radius: 6px;
            }
            
            .editable-table {
                width: 100%;
                border-collapse: collapse;
                font-size: 0.9rem;
            }
            
            .editable-table th,
            .editable-table td {
                padding: 12px 8px;
                text-align: left;
                border-bottom: 1px solid var(--gray-200, #e2e8f0);
            }
            
            .editable-table th {
                background-color: var(--gray-100, #f1f5f9);
                font-weight: 600;
                color: var(--gray-800, #1e293b);
                font-size: 0.85rem;
                text-transform: uppercase;
                letter-spacing: 0.5px;
            }
            
            .editable-table tbody tr:hover {
                background-color: var(--gray-50, #f8fafc);
            }
            
            .editable-table input.form-control {
                width: 100%;
                max-width: 100px;
                padding: 6px 8px;
                border: 1px solid var(--gray-300, #cbd5e1);
                border-radius: 4px;
                font-size: 0.9rem;
            }
            
            .editable-table input.form-control:focus {
                outline: none;
                border-color: var(--primary-color, #3b82f6);
                box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.1);
            }
            
            .total-cell {
                font-weight: 600;
                color: var(--green-600, #059669);
            }
            
            .totals-row {
                background-color: var(--gray-100, #f1f5f9);
                font-weight: 600;
            }
            
            .totals-row td {
                border-top: 2px solid var(--gray-400, #9ca3af);
                padding: 15px 8px;
            }
            
            .gran-total {
                color: var(--blue-600, #2563eb);
                font-size: 1.1rem;
            }
            
            .report-actions {
                display: flex;
                gap: 15px;
                justify-content: center;
                flex-wrap: wrap;
                margin-top: 20px;
            }
            
            .btn {
                padding: 10px 20px;
                border: none;
                border-radius: 6px;
                font-weight: 500;
                cursor: pointer;
                transition: all 0.2s ease;
                text-decoration: none;
                display: inline-flex;
                align-items: center;
                gap: 8px;
            }
            
            .btn-success {
                background-color: var(--green-600, #059669);
                color: white;
            }
            
            .btn-success:hover {
                background-color: var(--green-700, #047857);
            }
            
            .btn-secondary {
                background-color: var(--gray-500, #6b7280);
                color: white;
            }
            
            .btn-secondary:hover {
                background-color: var(--gray-600, #4b5563);
            }
            
            .btn-primary {
                background-color: var(--primary-color, #3b82f6);
                color: white;
            }
            
            .btn-primary:hover {
                background-color: var(--blue-700, #1d4ed8);
            }
            
            .btn:disabled {
                background-color: var(--gray-300, #cbd5e1);
                color: var(--gray-500, #6b7280);
                cursor: not-allowed;
            }
            
            /* Responsivo */
            @media (max-width: 768px) {
                .editable-table {
                    font-size: 0.8rem;
                }
                
                .editable-table th,
                .editable-table td {
                    padding: 8px 4px;
                }
                
                .editable-table input.form-control {
                    max-width: 80px;
                    font-size: 0.8rem;
                }
                
                .report-actions {
                    flex-direction: column;
                    align-items: center;
                }
                
                .btn {
                    width: 100%;
                    max-width: 300px;
                }
            }
        </style>
    `;
    
    document.head.insertAdjacentHTML('beforeend', styles);
}

// === INTEGRACIÓN CON EL SISTEMA EXISTENTE ===

// Función para agregar al dropdown de tipos de reporte
function addClienteSoporteToReportTypes() {
    const reportTypeSelect = document.getElementById('reportType');
    if (reportTypeSelect && !document.querySelector('option[value="cliente_soporte"]')) {
        const option = document.createElement('option');
        option.value = 'cliente_soporte';
        option.textContent = '📞 Cliente Soporte';
        reportTypeSelect.appendChild(option);
    }
}

// Función para manejar la selección del tipo de reporte
function handleClienteSoporteSelection() {
    const reportTypeSelect = document.getElementById('reportType');
    if (reportTypeSelect && reportTypeSelect.value === 'cliente_soporte') {
        loadClienteSoporteConfiguration();
    }
}

// === INICIALIZACIÓN ===
document.addEventListener('DOMContentLoaded', function() {
    // Agregar al sistema de reportes si existe
    if (typeof addCustomReportType === 'function') {
        addCustomReportType('cliente_soporte', '📞 Cliente Soporte', loadClienteSoporteConfiguration);
    }
    
    // Agregar listener para cambios en el dropdown
    const reportTypeSelect = document.getElementById('reportType');
    if (reportTypeSelect) {
        reportTypeSelect.addEventListener('change', handleClienteSoporteSelection);
        addClienteSoporteToReportTypes();
    }
});

// Exponer funciones globalmente para uso en el panel de administración
if (typeof window !== 'undefined') {
    window.ClienteSoporteReport = {
        load: loadClienteSoporteConfiguration,
        generate: generateClienteSoporteReport,
        reset: resetClienteSoporteData,
        showSelector: showClienteSelector,
        handleSelection: handleClienteSelection,
        updateRow: updateClienteSoporteRow,
        calculateTotalHours: calculateClienteTotalHours,
        calculateGrandTotal: calculateClienteGrandTotal
    };
}

console.log('✅ Reporte Cliente Soporte inicializado correctamente');