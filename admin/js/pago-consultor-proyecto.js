// =====================================================
// PAGO CONSULTOR (PROYECTO) - SISTEMA MIGRADO MODERNO
// =====================================================
// Migrado desde admin.js (sistema problemático)
// Basado en pago-consultor-general.js (sistema funcional)
// Fecha: Agosto 2025

console.log('🚀 Inicializando Pago Consultor (Proyecto) - Sistema Modernizado...');

// === VARIABLES GLOBALES ===
window.currentPagosProyectoData = null;

// === FUNCIÓN PRINCIPAL DE CARGA ===
function loadPagosProyectoConfiguration() {
    try {
        console.log('📊 Cargando configuración de Pago Consultor (Proyecto)...');
        
        // Obtener datos filtrados (similar al sistema original)
        const filteredReports = getFilteredReports(
            'pagosTimeFilter', 
            'pagosStartDate', 
            'pagosEndDate'
        );
        
        const reportData = processActividadesData(filteredReports);
        
        if (reportData.length === 0) {
            window.NotificationUtils.warning('No hay datos para el período seleccionado');
            return [];
        }
        
        // MIGRACIÓN: Convertir estructura problemática a funcional
        const modernizedData = reportData.map((row, index) => ({
            // Datos originales (mantenidos)
            idConsultor: row.idConsultor,
            consultor: row.nombreConsultor,     // ← normalizado
            cliente: row.cliente,
            proyecto: row.proyecto || row.soporte, // ← adaptado para proyecto
            
            // Datos normalizados (patrón funcional)
            tiempo: parseFloat(row.horasTotales) || 0,    // ← era horasAjustadas
            tarifa: 500,                                   // ← tarifa por defecto
            total: (parseFloat(row.horasTotales) || 0) * 500,
            
            // Metadatos para trazabilidad
            _originalHours: row.horasTotales,
            _consultorId: row.idConsultor,
            _projectId: row.proyecto || row.soporte,
            _rowIndex: index
        }));
        
        // Guardar datos globalmente (patrón funcional)
        window.currentPagosProyectoData = modernizedData;
        
        // Mostrar tabla editable moderna
        displayPagosProyectoTable(modernizedData);
        
        return modernizedData;
        
    } catch (error) {
        console.error('❌ Error cargando configuración:', error);
        window.NotificationUtils.error('Error cargando datos del reporte');
        return [];
    }
}

// === MOSTRAR TABLA EDITABLE MODERNA ===
function displayPagosProyectoTable(data) {
    const container = document.getElementById('reportPreviewContainer');
    if (!container) {
        console.error('❌ Contenedor de vista previa no encontrado');
        return;
    }
    
    let html = `
        <div class="report-preview-section">
            <div class="section-header">
                <h3 class="section-title">💼 Vista Previa: Pago Consultor (Proyecto)</h3>
                <p class="section-description">Edite las horas y tarifas según sea necesario. Los totales se actualizan automáticamente.</p>
            </div>
            
            <div class="table-container">
                <table class="editable-table">
                    <thead>
                        <tr>
                            <th>ID Consultor</th>
                            <th>Nombre Consultor</th>
                            <th>Cliente</th>
                            <th>Proyecto</th>
                            <th>Horas Ajustadas</th>
                            <th>Tarifa por Hora ($)</th>
                            <th>Total ($)</th>
                        </tr>
                    </thead>
                    <tbody>`;
    
    data.forEach((row, index) => {
        html += `
            <tr>
                <td>${row.idConsultor}</td>
                <td class="consultor-name">${row.consultor}</td>
                <td class="cliente-name">${row.cliente}</td>
                <td class="proyecto-name">${row.proyecto}</td>
                <td>
                    <input type="number" 
                           class="editable-input tiempo-input" 
                           value="${row.tiempo}" 
                           min="0" 
                           step="0.1"
                           onchange="updatePagosProyectoRow(${index}, 'tiempo', this.value)"
                           title="Ajustar horas trabajadas">
                </td>
                <td>
                    <input type="number" 
                           class="editable-input tarifa-input" 
                           value="${row.tarifa}" 
                           min="0" 
                           step="10"
                           onchange="updatePagosProyectoRow(${index}, 'tarifa', this.value)"
                           title="Ajustar tarifa por hora">
                </td>
                <td class="total-cell" id="totalProyecto-${index}">
                    $${window.NumberUtils ? window.NumberUtils.formatCurrency(row.total) : row.total.toLocaleString()}
                </td>
            </tr>`;
    });
    
    html += `
                    </tbody>
                    <tfoot>
                        <tr class="summary-row">
                            <td colspan="4"><strong>TOTAL GENERAL</strong></td>
                            <td class="summary-cell" id="totalHorasProyecto"><strong>${calculateTotalHoursProyecto(data)} hrs</strong></td>
                            <td class="summary-cell">-</td>
                            <td class="summary-cell" id="totalGeneralProyecto">
                                <strong>$${window.NumberUtils ? window.NumberUtils.formatCurrency(calculateGrandTotalProyecto(data)) : calculateGrandTotalProyecto(data).toLocaleString()}</strong>
                            </td>
                        </tr>
                    </tfoot>
                </table>
            </div>
            
            <div class="report-actions">
                <button class="btn btn-primary" onclick="generatePagosProyectoReport()">
                    📊 Generar Reporte Excel
                </button>
                <button class="btn btn-secondary" onclick="resetPagosProyectoData()">
                    🔄 Restaurar Datos Originales
                </button>
            </div>
        </div>`;
    
    container.innerHTML = html;
    
    // Aplicar estilos específicos
    addPagosProyectoStyles();
}

// === ACTUALIZAR FILA INDIVIDUAL (FUNCIÓN MIGRADA Y MEJORADA) ===
function updatePagosProyectoRow(rowIndex, field, value) {
    // ✅ VALIDACIÓN ROBUSTA (esto es lo que faltaba en el sistema original)
    if (!window.currentPagosProyectoData || !window.currentPagosProyectoData[rowIndex]) {
        console.error('❌ Datos no encontrados para actualizar');
        window.NotificationUtils.error('Error: Datos no encontrados para actualizar');
        return;
    }
    
    // Validar valor numérico
    const numValue = parseFloat(value) || 0;
    if (numValue < 0) {
        window.NotificationUtils.warning('El valor no puede ser negativo');
        return;
    }
    
    // Actualizar valor en la estructura de datos
    window.currentPagosProyectoData[rowIndex][field] = numValue;
    
    // Recalcular total de la fila automáticamente
    const row = window.currentPagosProyectoData[rowIndex];
    const tiempo = parseFloat(row.tiempo) || 0;
    const tarifa = parseFloat(row.tarifa) || 0;
    const total = tiempo * tarifa;
    
    window.currentPagosProyectoData[rowIndex].total = total;
    
    // Actualizar total en la interfaz
    const totalCell = document.getElementById(`totalProyecto-${rowIndex}`);
    if (totalCell) {
        totalCell.textContent = `$${window.NumberUtils ? window.NumberUtils.formatCurrency(total) : total.toLocaleString()}`;
    }
    
    // Actualizar totales generales
    updatePagosProyectoSummary();
    
    console.log(`✅ Fila ${rowIndex} actualizada: ${field} = ${numValue}`);
}

// === ACTUALIZAR RESUMEN ===
function updatePagosProyectoSummary() {
    if (!window.currentPagosProyectoData) return;
    
    const totalHoras = calculateTotalHoursProyecto(window.currentPagosProyectoData);
    const totalGeneral = calculateGrandTotalProyecto(window.currentPagosProyectoData);
    
    // Actualizar totales en la interfaz
    const totalHorasCell = document.getElementById('totalHorasProyecto');
    const totalGeneralCell = document.getElementById('totalGeneralProyecto');
    
    if (totalHorasCell) {
        totalHorasCell.innerHTML = `<strong>${totalHoras} hrs</strong>`;
    }
    
    if (totalGeneralCell) {
        totalGeneralCell.innerHTML = `<strong>$${window.NumberUtils ? window.NumberUtils.formatCurrency(totalGeneral) : totalGeneral.toLocaleString()}</strong>`;
    }
}

// === FUNCIONES DE CÁLCULO ===
function calculateTotalHoursProyecto(data) {
    return data.reduce((sum, row) => sum + (parseFloat(row.tiempo) || 0), 0);
}

function calculateGrandTotalProyecto(data) {
    return data.reduce((sum, row) => sum + (parseFloat(row.total) || 0), 0);
}

// === RESTAURAR DATOS ORIGINALES ===
function resetPagosProyectoData() {
    if (confirm('¿Está seguro de que desea restaurar los datos originales? Se perderán todos los cambios.')) {
        loadPagosProyectoConfiguration();
        window.NotificationUtils.success('Datos restaurados correctamente');
    }
}

// === GENERAR REPORTE EXCEL (MODERNIZADO) ===
function generatePagosProyectoReport() {
    if (!window.currentPagosProyectoData || window.currentPagosProyectoData.length === 0) {
        window.NotificationUtils.warning('No hay datos para generar el reporte');
        return;
    }
    
    try {
        console.log('📊 Generando reporte Excel: Pago Consultor (Proyecto)...');
        
        // Preparar datos para Excel
        const excelData = [
            [], // Fila vacía
            ['REPORTE DE PAGO A CONSULTOR - PROYECTO'], // Título
            [], // Fila vacía
            ['ID Consultor', 'Nombre Consultor', 'Cliente', 'Proyecto', 'HORAS AJUSTADAS', 'TARIFA por Hora', 'TOTAL'] // Headers
        ];
        
        // Agregar datos de filas
        window.currentPagosProyectoData.forEach(row => {
            excelData.push([
                row.idConsultor,
                row.consultor,
                row.cliente,
                row.proyecto,
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
            calculateTotalHoursProyecto(window.currentPagosProyectoData),
            '',
            calculateGrandTotalProyecto(window.currentPagosProyectoData)
        ]);
        
        // Crear libro Excel
        const wb = window.XLSX.utils.book_new();
        const ws = window.XLSX.utils.aoa_to_sheet(excelData);
        
        // Configurar anchos de columna
        ws['!cols'] = [
            { width: 12 }, // ID Consultor
            { width: 25 }, // Nombre Consultor
            { width: 20 }, // Cliente
            { width: 20 }, // Proyecto
            { width: 15 }, // HORAS
            { width: 15 }, // TARIFA
            { width: 15 }  // TOTAL
        ];
        
        // Agregar worksheet al workbook
        window.XLSX.utils.book_append_sheet(wb, ws, "PAGO CONSULTORES PROYECTO");
        
        // Generar archivo Excel
        const today = new Date();
        const fileName = `PAGO_CONSULTORES_PROYECTO_${today.getFullYear()}-${(today.getMonth()+1).toString().padStart(2,'0')}-${today.getDate().toString().padStart(2,'0')}.xlsx`;
        
        window.XLSX.writeFile(wb, fileName);
        
        // Registrar actividad
        if (window.AuthSys && window.AuthSys.logActivity) {
            window.AuthSys.logActivity(
                'report_generated',
                `Reporte generado: ${fileName}`,
                { 
                    reportType: 'pago_consultor_proyecto',
                    fileName: fileName,
                    recordCount: window.currentPagosProyectoData.length,
                    totalHours: calculateTotalHoursProyecto(window.currentPagosProyectoData),
                    totalAmount: calculateGrandTotalProyecto(window.currentPagosProyectoData)
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

// === ESTILOS ESPECÍFICOS MODERNOS ===
function addPagosProyectoStyles() {
    // Verificar si ya existen los estilos
    if (document.getElementById('pagosProyectoStyles')) return;
    
    const styles = `
        <style id="pagosProyectoStyles">
            /* Estilos específicos para Pago Consultor Proyecto */
            .report-preview-section {
                background: white;
                border-radius: 12px;
                padding: 24px;
                box-shadow: 0 4px 20px rgba(0,0,0,0.1);
                margin: 20px 0;
                border: 1px solid #e2e8f0;
            }
            
            .section-header {
                margin-bottom: 24px;
                text-align: center;
                padding-bottom: 16px;
                border-bottom: 2px solid #f1f5f9;
            }
            
            .section-title {
                color: #1e40af;
                font-size: 1.5rem;
                font-weight: 700;
                margin-bottom: 8px;
                display: flex;
                align-items: center;
                justify-content: center;
                gap: 8px;
            }
            
            .section-description {
                color: #64748b;
                font-size: 0.95rem;
                line-height: 1.5;
            }
            
            .table-container {
                overflow-x: auto;
                margin-bottom: 24px;
                border: 1px solid #e2e8f0;
                border-radius: 8px;
                background: white;
            }
            
            .editable-table {
                width: 100%;
                border-collapse: collapse;
                font-size: 0.9rem;
            }
            
            .editable-table th {
                background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
                color: white;
                padding: 12px 8px;
                text-align: left;
                font-weight: 600;
                font-size: 0.85rem;
                text-transform: uppercase;
                letter-spacing: 0.5px;
            }
            
            .editable-table td {
                padding: 12px 8px;
                border-bottom: 1px solid #f1f5f9;
                vertical-align: middle;
            }
            
            .editable-table tbody tr:hover {
                background-color: #f8fafc;
                transition: background-color 0.2s ease;
            }
            
            .editable-input {
                width: 100%;
                padding: 8px 12px;
                border: 2px solid #e2e8f0;
                border-radius: 6px;
                background: white;
                font-size: 0.9rem;
                transition: all 0.2s ease;
            }
            
            .editable-input:focus {
                outline: none;
                border-color: #3b82f6;
                box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
            }
            
            .editable-input:hover {
                border-color: #93c5fd;
            }
            
            .tiempo-input {
                background: #fef3c7;
                border-color: #fbbf24;
            }
            
            .tarifa-input {
                background: #dcfce7;
                border-color: #22c55e;
            }
            
            .total-cell {
                font-weight: 600;
                color: #059669;
                background: #f0fdf4;
                text-align: right;
            }
            
            .summary-row {
                background: linear-gradient(135deg, #f1f5f9 0%, #e2e8f0 100%);
                font-weight: 700;
            }
            
            .summary-row td {
                border-top: 2px solid #3b82f6;
                padding: 16px 8px;
            }
            
            .summary-cell {
                text-align: right;
                font-size: 1.1rem;
            }
            
            .report-actions {
                display: flex;
                gap: 12px;
                justify-content: center;
                flex-wrap: wrap;
                margin-top: 24px;
            }
            
            .btn {
                padding: 12px 24px;
                border: none;
                border-radius: 8px;
                font-weight: 600;
                font-size: 0.9rem;
                cursor: pointer;
                transition: all 0.2s ease;
                display: flex;
                align-items: center;
                gap: 8px;
                text-transform: uppercase;
                letter-spacing: 0.5px;
            }
            
            .btn-primary {
                background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
                color: white;
                box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
            }
            
            .btn-primary:hover {
                transform: translateY(-2px);
                box-shadow: 0 6px 16px rgba(59, 130, 246, 0.4);
            }
            
            .btn-secondary {
                background: linear-gradient(135deg, #6b7280 0%, #4b5563 100%);
                color: white;
                box-shadow: 0 4px 12px rgba(107, 114, 128, 0.3);
            }
            
            .btn-secondary:hover {
                transform: translateY(-2px);
                box-shadow: 0 6px 16px rgba(107, 114, 128, 0.4);
            }
            
            .consultor-name, .cliente-name, .proyecto-name {
                font-weight: 500;
                color: #374151;
            }
            
            /* Responsive Design */
            @media (max-width: 768px) {
                .editable-table {
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
function addPagosProyectoToReportTypes() {
    const reportTypeSelect = document.getElementById('reportTypeSelect');
    if (reportTypeSelect && !document.querySelector('option[value="pago_consultor_proyecto"]')) {
        const option = document.createElement('option');
        option.value = 'pago_consultor_proyecto';
        option.textContent = '💼 Pago Consultor (Proyecto) - MODERNIZADO';
        reportTypeSelect.appendChild(option);
    }
}

// === INICIALIZACIÓN ===
document.addEventListener('DOMContentLoaded', function() {
    // Agregar al sistema de reportes si existe
    if (typeof addCustomReportType === 'function') {
        addCustomReportType('pago_consultor_proyecto', '💼 Pago Consultor (Proyecto) - MODERNIZADO', loadPagosProyectoConfiguration);
    }
    
    // Agregar listener para cambios en el dropdown
    const reportTypeSelect = document.getElementById('reportTypeSelect');
    if (reportTypeSelect) {
        reportTypeSelect.addEventListener('change', function() {
            if (this.value === 'pago_consultor_proyecto') {
                loadPagosProyectoConfiguration();
            }
        });
        addPagosProyectoToReportTypes();
    }
});

// Exponer funciones globalmente para uso en el panel de administración
if (typeof window !== 'undefined') {
    window.PagosProyectoReport = {
        load: loadPagosProyectoConfiguration,
        generate: generatePagosProyectoReport,
        reset: resetPagosProyectoData,
        updateRow: updatePagosProyectoRow,
        calculateTotalHours: calculateTotalHoursProyecto,
        calculateGrandTotal: calculateGrandTotalProyecto
    };
    
    // Exponer funciones individuales (compatibilidad)
    window.loadPagosProyectoConfiguration = loadPagosProyectoConfiguration;
    window.generatePagosProyectoReport = generatePagosProyectoReport;
    window.updatePagosProyectoRow = updatePagosProyectoRow;
    window.resetPagosProyectoData = resetPagosProyectoData;
}

console.log('✅ Pago Consultor (Proyecto) - Sistema Modernizado inicializado correctamente');
console.log('🔧 Funciones disponibles: loadPagosProyectoConfiguration, updatePagosProyectoRow, generatePagosProyectoReport');
console.log('💡 Problema de "Cannot set properties of undefined" solucionado con validaciones robustas');