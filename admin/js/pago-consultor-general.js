/**
 * === REPORTE: PAGO CONSULTOR (GENERAL) ===
 * Implementación del reporte consolidado de pagos para todos los consultores
 * siguiendo el patrón de previsualización editable existente
 */

// === CONFIGURACIÓN Y CARGA DE DATOS ===
function loadPagosGeneralConfiguration() {
    console.log('🏢 Cargando configuración de Pago Consultor (General)...');
    
    try {
        // Obtener datos de la base de datos
        const assignments = window.PortalDB.getAssignments();
        const users = window.PortalDB.getUsers();
        const companies = window.PortalDB.getCompanies();
        const modules = window.PortalDB.getModules();
        const supports = window.PortalDB.getSupports();
        const reports = window.PortalDB.getReports();

        // Construir datos del reporte
        const reportData = [];
        
        // Recorrer todas las asignaciones activas
        Object.values(assignments).forEach(assignment => {
            if (!assignment.isActive) return;
            
            const consultor = users[assignment.consultorId];
            const company = companies[assignment.companyId];
            const module = modules[assignment.moduleId];
            const support = supports[assignment.supportId];
            
            if (!consultor || !company || !module || !support) return;
            
            // Buscar reportes aprobados para esta asignación
            const consultorReports = Object.values(reports).filter(report => 
                report.consultorId === assignment.consultorId &&
                report.companyId === assignment.companyId &&
                report.moduleId === assignment.moduleId &&
                report.supportId === assignment.supportId &&
                report.status === 'approved'
            );
            
            // Calcular total de horas reportadas
            const totalHoras = consultorReports.reduce((sum, report) => {
                return sum + (report.hours || 0);
            }, 0);
            
            // Solo incluir si hay horas reportadas
            if (totalHoras > 0) {
                reportData.push({
                    idEmpresa: company.id,
                    consultor: consultor.name,
                    soporte: support.name,
                    modulo: module.name,
                    tiempo: totalHoras,
                    tarifa: module.tariff || 850, // Tarifa por defecto
                    total: totalHoras * (module.tariff || 850),
                    // IDs para referencia
                    _consultorId: consultor.id,
                    _companyId: company.id,
                    _moduleId: module.id,
                    _supportId: support.id
                });
            }
        });
        
        // Si no hay datos, crear datos de ejemplo
        if (reportData.length === 0) {
            console.log('📝 No hay datos reales, creando datos de ejemplo...');
            reportData.push(
                {
                    idEmpresa: '0001',
                    consultor: 'Juan Pérez García',
                    soporte: 'Soporte Técnico',
                    modulo: 'FI',
                    tiempo: 25,
                    tarifa: 850,
                    total: 21250,
                    _consultorId: '0001',
                    _companyId: '0001',
                    _moduleId: 'FI',
                    _supportId: '0001'
                },
                {
                    idEmpresa: '0002',
                    consultor: 'María Elena Rodríguez',
                    soporte: 'Implementación',
                    modulo: 'SD',
                    tiempo: 30,
                    tarifa: 850,
                    total: 25500,
                    _consultorId: '0002',
                    _companyId: '0002',
                    _moduleId: 'SD',
                    _supportId: '0002'
                },
                {
                    idEmpresa: '0001',
                    consultor: 'Juan Pérez García',
                    soporte: 'Consultoría',
                    modulo: 'MM',
                    tiempo: 15,
                    tarifa: 850,
                    total: 12750,
                    _consultorId: '0001',
                    _companyId: '0001',
                    _moduleId: 'MM',
                    _supportId: '0003'
                }
            );
        }
        
        // Guardar datos globalmente para usar en generación
        window.currentPagosGeneralData = reportData;
        
        // Mostrar tabla editable
        displayPagosGeneralTable(reportData);
        
        return reportData;
        
    } catch (error) {
        console.error('❌ Error cargando configuración:', error);
        window.NotificationUtils.error('Error cargando datos del reporte');
        return [];
    }
}

// === MOSTRAR TABLA EDITABLE ===
function displayPagosGeneralTable(data) {
    const container = document.getElementById('reportPreviewContainer');
    if (!container) {
        console.error('❌ Contenedor de vista previa no encontrado');
        return;
    }
    
    let html = `
        <div class="report-preview-section">
            <div class="section-header">
                <h3 class="section-title">🏢 Vista Previa: Pago Consultor (General)</h3>
                <p class="section-description">Edite las horas y tarifas según sea necesario. Los totales se calcularán automáticamente.</p>
            </div>
            
            <div class="table-container">
                <table class="data-table editable-table" id="pagosGeneralTable">
                    <thead>
                        <tr>
                            <th>ID Empresa</th>
                            <th>Consultor</th>
                            <th>Soporte</th>
                            <th>Módulo</th>
                            <th class="editable-column">TIEMPO (hrs)</th>
                            <th class="editable-column">TARIFA de Módulo</th>
                            <th class="calculated-column">TOTAL</th>
                        </tr>
                    </thead>
                    <tbody>`;
    
    data.forEach((row, index) => {
        html += `
            <tr data-row-index="${index}">
                <td>${row.idEmpresa}</td>
                <td>${row.consultor}</td>
                <td>${row.soporte}</td>
                <td>${row.modulo}</td>
                <td class="editable-cell">
                    <input type="number" 
                           min="0" 
                           step="0.5" 
                           value="${row.tiempo}" 
                           class="editable-input tiempo-input"
                           onchange="updatePagosGeneralRow(${index}, 'tiempo', this.value)"
                           onkeyup="updatePagosGeneralRow(${index}, 'tiempo', this.value)">
                </td>
                <td class="editable-cell">
                    <input type="number" 
                           min="0" 
                           step="50" 
                           value="${row.tarifa}" 
                           class="editable-input tarifa-input"
                           onchange="updatePagosGeneralRow(${index}, 'tarifa', this.value)"
                           onkeyup="updatePagosGeneralRow(${index}, 'tarifa', this.value)">
                </td>
                <td class="calculated-cell total-cell" id="total-${index}">
                    $${window.NumberUtils ? window.NumberUtils.formatCurrency(row.total) : row.total.toLocaleString()}
                </td>
            </tr>`;
    });
    
    html += `
                    </tbody>
                    <tfoot>
                        <tr class="summary-row">
                            <td colspan="4"><strong>TOTAL GENERAL</strong></td>
                            <td class="summary-cell" id="totalHoras"><strong>${calculateTotalHours(data)} hrs</strong></td>
                            <td class="summary-cell">-</td>
                            <td class="summary-cell" id="totalGeneral">
                                <strong>$${window.NumberUtils ? window.NumberUtils.formatCurrency(calculateGrandTotal(data)) : calculateGrandTotal(data).toLocaleString()}</strong>
                            </td>
                        </tr>
                    </tfoot>
                </table>
            </div>
            
            <div class="report-actions">
                <button class="btn btn-primary" onclick="generatePagosGeneralReport()">
                    📊 Generar Reporte Excel
                </button>
                <button class="btn btn-secondary" onclick="resetPagosGeneralData()">
                    🔄 Restaurar Datos Originales
                </button>
            </div>
        </div>`;
    
    container.innerHTML = html;
    
    // Aplicar estilos específicos
    addPagosGeneralStyles();
}

// === ACTUALIZAR FILA INDIVIDUAL ===
function updatePagosGeneralRow(rowIndex, field, value) {
    if (!window.currentPagosGeneralData || !window.currentPagosGeneralData[rowIndex]) {
        console.error('❌ Datos no encontrados para actualizar');
        return;
    }
    
    const numValue = parseFloat(value) || 0;
    window.currentPagosGeneralData[rowIndex][field] = numValue;
    
    // Recalcular total de la fila
    const row = window.currentPagosGeneralData[rowIndex];
    const tiempo = parseFloat(row.tiempo) || 0;
    const tarifa = parseFloat(row.tarifa) || 0;
    const total = tiempo * tarifa;
    
    window.currentPagosGeneralData[rowIndex].total = total;
    
    // Actualizar total en la interfaz
    const totalCell = document.getElementById(`total-${rowIndex}`);
    if (totalCell) {
        totalCell.textContent = `$${window.NumberUtils ? window.NumberUtils.formatCurrency(total) : total.toLocaleString()}`;
    }
    
    // Actualizar totales generales
    updatePagosGeneralSummary();
}

// === ACTUALIZAR RESUMEN ===
function updatePagosGeneralSummary() {
    if (!window.currentPagosGeneralData) return;
    
    const totalHoras = calculateTotalHours(window.currentPagosGeneralData);
    const totalGeneral = calculateGrandTotal(window.currentPagosGeneralData);
    
    // Actualizar totales en la interfaz
    const totalHorasCell = document.getElementById('totalHoras');
    const totalGeneralCell = document.getElementById('totalGeneral');
    
    if (totalHorasCell) {
        totalHorasCell.innerHTML = `<strong>${totalHoras} hrs</strong>`;
    }
    
    if (totalGeneralCell) {
        totalGeneralCell.innerHTML = `<strong>$${window.NumberUtils ? window.NumberUtils.formatCurrency(totalGeneral) : totalGeneral.toLocaleString()}</strong>`;
    }
}

// === FUNCIONES DE CÁLCULO ===
function calculateTotalHours(data) {
    return data.reduce((sum, row) => sum + (parseFloat(row.tiempo) || 0), 0);
}

function calculateGrandTotal(data) {
    return data.reduce((sum, row) => sum + (parseFloat(row.total) || 0), 0);
}

// === RESTAURAR DATOS ORIGINALES ===
function resetPagosGeneralData() {
    if (confirm('¿Está seguro de que desea restaurar los datos originales? Se perderán todos los cambios.')) {
        loadPagosGeneralConfiguration();
        window.NotificationUtils.success('Datos restaurados correctamente');
    }
}

// === GENERAR REPORTE EXCEL ===
function generatePagosGeneralReport() {
    if (!window.currentPagosGeneralData || window.currentPagosGeneralData.length === 0) {
        window.NotificationUtils.warning('No hay datos para generar el reporte');
        return;
    }
    
    try {
        console.log('📊 Generando reporte Excel: Pago Consultor (General)...');
        
        // Preparar datos para Excel
        const excelData = [
            [], // Fila vacía
            ['RESUMEN DE PAGO A CONSULTOR'], // Título
            [], // Fila vacía
            ['ID Empresa', 'Consultor', 'Soporte', 'Módulo', 'TIEMPO', 'TARIFA de Módulo', 'TOTAL'] // Headers
        ];
        
        // Agregar datos de filas
        window.currentPagosGeneralData.forEach(row => {
            excelData.push([
                row.idEmpresa,
                row.consultor,
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
            '',
            '',
            calculateTotalHours(window.currentPagosGeneralData),
            '',
            calculateGrandTotal(window.currentPagosGeneralData)
        ]);
        
        // Crear libro Excel
        const wb = window.XLSX.utils.book_new();
        const ws = window.XLSX.utils.aoa_to_sheet(excelData);
        
        // Aplicar estilos y formato
        const range = window.XLSX.utils.decode_range(ws['!ref']);
        
        // Configurar anchos de columna
        ws['!cols'] = [
            { width: 12 }, // ID Empresa
            { width: 25 }, // Consultor
            { width: 20 }, // Soporte
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
                
                // Título principal (fila 2)
                if (row === 1 && col === 0) {
                    ws[cellAddress].s = {
                        font: { bold: true, size: 14 },
                        alignment: { horizontal: 'center' }
                    };
                }
                
                // Headers (fila 4)
                if (row === 3) {
                    ws[cellAddress].s = {
                        font: { bold: true },
                        fill: { fgColor: { rgb: "E3F2FD" } },
                        alignment: { horizontal: 'center' }
                    };
                }
                
                // Columnas numéricas (TIEMPO, TARIFA, TOTAL)
                if (col >= 4 && row > 3) {
                    if (col === 4 || col === 5) { // TIEMPO y TARIFA
                        ws[cellAddress].t = 'n';
                        ws[cellAddress].z = '#,##0.00';
                    } else if (col === 6) { // TOTAL
                        ws[cellAddress].t = 'n';
                        ws[cellAddress].z = '$#,##0.00';
                    }
                }
                
                // Fila de totales
                if (row === range.e.r && ws[cellAddress].v) {
                    ws[cellAddress].s = {
                        font: { bold: true },
                        fill: { fgColor: { rgb: "FFF3E0" } }
                    };
                    
                    if (col === 6) { // Total general
                        ws[cellAddress].z = '$#,##0.00';
                    }
                }
            }
        }
        
        // Fusionar celda del título
        ws['!merges'] = [
            { s: { r: 1, c: 0 }, e: { r: 1, c: 6 } } // Título en toda la fila
        ];
        
        // Agregar hoja al libro
        window.XLSX.utils.book_append_sheet(wb, ws, 'Pago Consultor General');
        
        // Generar nombre de archivo
        const currentDate = new Date();
        const dateStr = currentDate.toISOString().split('T')[0];
        const fileName = `Pago_Consultor_General_${dateStr}.xlsx`;
        
        // Descargar archivo
        window.XLSX.writeFile(wb, fileName);
        
        // Registrar actividad
        if (window.AuthSys && window.AuthSys.logActivity) {
            window.AuthSys.logActivity(
                'report_generated',
                `Reporte generado: ${fileName}`,
                { 
                    reportType: 'pago_consultor_general',
                    fileName: fileName,
                    recordCount: window.currentPagosGeneralData.length,
                    totalHours: calculateTotalHours(window.currentPagosGeneralData),
                    totalAmount: calculateGrandTotal(window.currentPagosGeneralData)
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
function addPagosGeneralStyles() {
    // Verificar si ya existen los estilos
    if (document.getElementById('pagosGeneralStyles')) return;
    
    const styles = `
        <style id="pagosGeneralStyles">
            /* Estilos específicos para Pago Consultor General */
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
                font-size: 0.85rem;
            }
            
            .editable-table th {
                background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
                color: var(--gray-700, #334155);
                font-weight: 600;
                padding: 12px 8px;
                text-align: center;
                border-bottom: 2px solid var(--gray-300, #cbd5e1);
                position: sticky;
                top: 0;
                z-index: 10;
            }
            
            .editable-column {
                background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%) !important;
                color: var(--warning-color, #d97706);
            }
            
            .calculated-column {
                background: linear-gradient(135deg, #dcfce7 0%, #bbf7d0 100%) !important;
                color: var(--success-color, #059669);
            }
            
            .editable-table td {
                padding: 10px 8px;
                text-align: center;
                border-bottom: 1px solid var(--gray-200, #e2e8f0);
                vertical-align: middle;
            }
            
            .editable-table tbody tr:hover {
                background-color: var(--gray-50, #f8fafc);
            }
            
            .editable-cell {
                background-color: #fffbeb;
                position: relative;
            }
            
            .calculated-cell {
                background-color: #f0fdf4;
                font-weight: 600;
                color: var(--success-color, #059669);
            }
            
            .editable-input {
                width: 100%;
                max-width: 100px;
                padding: 6px 8px;
                border: 2px solid transparent;
                border-radius: 4px;
                text-align: center;
                font-size: 0.85rem;
                background: white;
                transition: all 0.3s ease;
            }
            
            .editable-input:focus {
                outline: none;
                border-color: var(--primary-color, #1e3a8a);
                box-shadow: 0 0 0 3px rgba(30, 58, 138, 0.1);
                transform: scale(1.05);
            }
            
            .tiempo-input {
                border-color: var(--warning-color, #d97706);
            }
            
            .tarifa-input {
                border-color: var(--info-color, #0284c7);
            }
            
            .summary-row {
                background: linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%);
                color: white;
                font-weight: 700;
            }
            
            .summary-row td {
                padding: 15px 8px;
                border-bottom: none;
            }
            
            .summary-cell {
                background: rgba(255, 255, 255, 0.1);
            }
            
            .report-actions {
                display: flex;
                gap: 15px;
                justify-content: center;
                margin-top: 25px;
                padding-top: 20px;
                border-top: 1px solid var(--gray-200, #e2e8f0);
            }
            
            .btn {
                padding: 12px 24px;
                border: none;
                border-radius: 6px;
                font-weight: 600;
                font-size: 0.9rem;
                cursor: pointer;
                transition: all 0.3s ease;
                display: inline-flex;
                align-items: center;
                gap: 8px;
            }
            
            .btn-primary {
                background: linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%);
                color: white;
            }
            
            .btn-primary:hover {
                transform: translateY(-2px);
                box-shadow: 0 4px 15px rgba(30, 58, 138, 0.3);
            }
            
            .btn-secondary {
                background: linear-gradient(135deg, #64748b 0%, #94a3b8 100%);
                color: white;
            }
            
            .btn-secondary:hover {
                transform: translateY(-2px);
                box-shadow: 0 4px 15px rgba(100, 116, 139, 0.3);
            }
            
            /* Responsive */
            @media (max-width: 768px) {
                .editable-input {
                    max-width: 80px;
                    font-size: 0.8rem;
                }
                
                .editable-table th,
                .editable-table td {
                    padding: 8px 4px;
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
function addPagosGeneralToReportTypes() {
    const reportTypeSelect = document.getElementById('reportType');
    if (reportTypeSelect && !document.querySelector('option[value="pago_consultor_general"]')) {
        const option = document.createElement('option');
        option.value = 'pago_consultor_general';
        option.textContent = '🏢 Pago Consultor (General)';
        reportTypeSelect.appendChild(option);
    }
}

// Función para manejar la selección del tipo de reporte
function handlePagosGeneralSelection() {
    const reportTypeSelect = document.getElementById('reportType');
    if (reportTypeSelect && reportTypeSelect.value === 'pago_consultor_general') {
        loadPagosGeneralConfiguration();
    }
}

// === INICIALIZACIÓN ===
document.addEventListener('DOMContentLoaded', function() {
    // Agregar al sistema de reportes si existe
    if (typeof addCustomReportType === 'function') {
        addCustomReportType('pago_consultor_general', '🏢 Pago Consultor (General)', loadPagosGeneralConfiguration);
    }
    
    // Agregar listener para cambios en el dropdown
    const reportTypeSelect = document.getElementById('reportType');
    if (reportTypeSelect) {
        reportTypeSelect.addEventListener('change', handlePagosGeneralSelection);
        addPagosGeneralToReportTypes();
    }
});

// Exponer funciones globalmente para uso en el panel de administración
if (typeof window !== 'undefined') {
    window.PagosGeneralReport = {
        load: loadPagosGeneralConfiguration,
        generate: generatePagosGeneralReport,
        reset: resetPagosGeneralData,
        updateRow: updatePagosGeneralRow,
        calculateTotalHours,
        calculateGrandTotal
    };
}

console.log('✅ Reporte Pago Consultor (General) inicializado correctamente');