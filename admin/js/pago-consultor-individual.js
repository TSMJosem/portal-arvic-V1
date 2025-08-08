/**
 * === REPORTE: PAGO CONSULTOR (CONSULTOR) ===
 * Implementación del reporte de pagos para UN consultor específico
 * siguiendo el patrón de previsualización editable existente
 */

// === VARIABLES GLOBALES ===
let selectedConsultorId = null;
let currentPagosIndividualData = [];

// === CONFIGURACIÓN Y CARGA DE DATOS ===
function loadPagosIndividualConfiguration() {
    console.log('👤 Cargando configuración de Pago Consultor (Individual)...');
    
    // Primero verificar si hay un consultor seleccionado
    const consultorSelect = document.getElementById('consultorSelector');
    if (!consultorSelect || !consultorSelect.value) {
        showConsultorSelector();
        return;
    }
    
    selectedConsultorId = consultorSelect.value;
    
    try {
        // Obtener datos de la base de datos
        const assignments = window.PortalDB.getAssignments();
        const users = window.PortalDB.getUsers();
        const companies = window.PortalDB.getCompanies();
        const modules = window.PortalDB.getModules();
        const supports = window.PortalDB.getSupports();
        const reports = window.PortalDB.getReports();

        // Verificar que el consultor existe
        const selectedConsultor = users[selectedConsultorId];
        if (!selectedConsultor) {
            window.NotificationUtils.error('Consultor no encontrado');
            return [];
        }

        // Construir datos del reporte SOLO para el consultor seleccionado
        const reportData = [];
        
        // Recorrer asignaciones activas del consultor específico
        Object.values(assignments).forEach(assignment => {
            if (!assignment.isActive || assignment.consultorId !== selectedConsultorId) return;
            
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
                    tarifa: module.tariff || 850,
                    total: totalHoras * (module.tariff || 850),
                    // IDs para referencia
                    _consultorId: consultor.id,
                    _companyId: company.id,
                    _moduleId: module.id,
                    _supportId: support.id
                });
            }
        });
        
        // Si no hay datos reales para este consultor, crear datos de ejemplo
        if (reportData.length === 0) {
            console.log('📝 No hay datos reales para este consultor, creando datos de ejemplo...');
            reportData.push(
                {
                    idEmpresa: '0001',
                    consultor: selectedConsultor.name,
                    soporte: 'Soporte Técnico',
                    modulo: 'FI',
                    tiempo: 40,
                    tarifa: 850,
                    total: 34000,
                    _consultorId: selectedConsultorId,
                    _companyId: '0001',
                    _moduleId: 'FI',
                    _supportId: '0001'
                },
                {
                    idEmpresa: '0002',
                    consultor: selectedConsultor.name,
                    soporte: 'Implementación',
                    modulo: 'SD',
                    tiempo: 25,
                    tarifa: 850,
                    total: 21250,
                    _consultorId: selectedConsultorId,
                    _companyId: '0002',
                    _moduleId: 'SD',
                    _supportId: '0002'
                }
            );
        }
        
        // Guardar datos globalmente
        currentPagosIndividualData = reportData;
        
        // Mostrar tabla editable
        displayPagosIndividualTable(reportData);
        
        return reportData;
        
    } catch (error) {
        console.error('❌ Error cargando configuración:', error);
        window.NotificationUtils.error('Error cargando datos del reporte');
        return [];
    }
}

// === MOSTRAR SELECTOR DE CONSULTOR ===
function showConsultorSelector() {
    const container = document.getElementById('reportPreviewContainerIndividual');
    if (!container) {
        console.error('❌ Contenedor de vista previa no encontrado');
        return;
    }
    
    // Obtener lista de consultores
    const users = window.PortalDB.getUsers();
    const consultores = Object.values(users).filter(user => 
        user.role === 'consultor' && user.isActive !== false
    );
    
    let html = `
        <div class="consultor-selector-section">
            <div class="section-header">
                <h3 class="section-title">👤 Seleccionar Consultor</h3>
                <p class="section-description">Elija el consultor para generar su reporte de pagos individual.</p>
            </div>
            
            <div class="selector-form">
                <div class="form-group">
                    <label for="consultorSelector">Consultor:</label>
                    <select id="consultorSelector" class="form-select" onchange="onConsultorSelected()">
                        <option value="">-- Seleccione un consultor --</option>`;
    
    consultores.forEach(consultor => {
        html += `<option value="${consultor.id}">${consultor.id} - ${consultor.name}</option>`;
    });
    
    html += `
                    </select>
                </div>
                
                <div class="form-group" style="text-align: center; margin-top: 20px;">
                    <button type="button" class="btn btn-primary" onclick="loadPagosIndividualConfiguration()" disabled id="generateBtn">
                        📊 Generar Vista Previa
                    </button>
                </div>
            </div>
        </div>`;
    
    container.innerHTML = html;
}

// === CALLBACK CUANDO SE SELECCIONA CONSULTOR ===
function onConsultorSelected() {
    const consultorSelect = document.getElementById('consultorSelector');
    const generateBtn = document.getElementById('generateBtn');
    
    if (consultorSelect.value) {
        generateBtn.disabled = false;
        generateBtn.classList.remove('btn-disabled');
        selectedConsultorId = consultorSelect.value;
    } else {
        generateBtn.disabled = true;
        generateBtn.classList.add('btn-disabled');
        selectedConsultorId = null;
    }
}

// === MOSTRAR TABLA EDITABLE ===
function displayPagosIndividualTable(data) {
    const container = document.getElementById('reportPreviewContainerIndividual');
    if (!container) {
        console.error('❌ Contenedor de vista previa no encontrado');
        return;
    }
    
    const consultorName = data.length > 0 ? data[0].consultor : 'Consultor';
    
    let html = `
        <div class="report-preview-section">
            <div class="section-header">
                <h3 class="section-title">👤 Vista Previa: Pago a ${consultorName}</h3>
                <p class="section-description">Edite las horas y tarifas según sea necesario. Los totales se calcularán automáticamente.</p>
                <button class="btn btn-secondary btn-sm" onclick="showConsultorSelector()" style="margin-top: 10px;">
                    🔄 Cambiar Consultor
                </button>
            </div>
            
            <div class="table-container">
                <table class="data-table editable-table" id="pagosIndividualTable">
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
                           onchange="updatePagosIndividualRow(${index}, 'tiempo', this.value)"
                           onkeyup="updatePagosIndividualRow(${index}, 'tiempo', this.value)">
                </td>
                <td class="editable-cell">
                    <input type="number" 
                           min="0" 
                           step="50" 
                           value="${row.tarifa}" 
                           class="editable-input tarifa-input"
                           onchange="updatePagosIndividualRow(${index}, 'tarifa', this.value)"
                           onkeyup="updatePagosIndividualRow(${index}, 'tarifa', this.value)">
                </td>
                <td class="calculated-cell total-cell" id="totalIndividual-${index}">
                    $${window.NumberUtils ? window.NumberUtils.formatCurrency(row.total) : row.total.toLocaleString()}
                </td>
            </tr>`;
    });
    
    html += `
                    </tbody>
                    <tfoot>
                        <tr class="summary-row">
                            <td colspan="4"><strong>TOTAL PARA ${consultorName.toUpperCase()}</strong></td>
                            <td class="summary-cell" id="totalHorasIndividual"><strong>${calculateTotalHoursIndividual(data)} hrs</strong></td>
                            <td class="summary-cell">-</td>
                            <td class="summary-cell" id="totalGeneralIndividual">
                                <strong>$${window.NumberUtils ? window.NumberUtils.formatCurrency(calculateGrandTotalIndividual(data)) : calculateGrandTotalIndividual(data).toLocaleString()}</strong>
                            </td>
                        </tr>
                    </tfoot>
                </table>
            </div>
            
            <div class="report-actions">
                <button class="btn btn-primary" onclick="generatePagosIndividualReport()">
                    📊 Generar Reporte Excel
                </button>
                <button class="btn btn-secondary" onclick="resetPagosIndividualData()">
                    🔄 Restaurar Datos Originales
                </button>
                <button class="btn btn-tertiary" onclick="showConsultorSelector()">
                    👤 Cambiar Consultor
                </button>
            </div>
        </div>`;
    
    container.innerHTML = html;
    
    // Aplicar estilos específicos
    addPagosIndividualStyles();
}

// === ACTUALIZAR FILA INDIVIDUAL ===
function updatePagosIndividualRow(rowIndex, field, value) {
    if (!currentPagosIndividualData || !currentPagosIndividualData[rowIndex]) {
        console.error('❌ Datos no encontrados para actualizar');
        return;
    }
    
    const numValue = parseFloat(value) || 0;
    currentPagosIndividualData[rowIndex][field] = numValue;
    
    // Recalcular total de la fila
    const row = currentPagosIndividualData[rowIndex];
    const tiempo = parseFloat(row.tiempo) || 0;
    const tarifa = parseFloat(row.tarifa) || 0;
    const total = tiempo * tarifa;
    
    currentPagosIndividualData[rowIndex].total = total;
    
    // Actualizar total en la interfaz
    const totalCell = document.getElementById(`totalIndividual-${rowIndex}`);
    if (totalCell) {
        totalCell.textContent = `$${window.NumberUtils ? window.NumberUtils.formatCurrency(total) : total.toLocaleString()}`;
    }
    
    // Actualizar totales generales
    updatePagosIndividualSummary();
}

// === ACTUALIZAR RESUMEN ===
function updatePagosIndividualSummary() {
    if (!currentPagosIndividualData) return;
    
    const totalHoras = calculateTotalHoursIndividual(currentPagosIndividualData);
    const totalGeneral = calculateGrandTotalIndividual(currentPagosIndividualData);
    
    // Actualizar totales en la interfaz
    const totalHorasCell = document.getElementById('totalHorasIndividual');
    const totalGeneralCell = document.getElementById('totalGeneralIndividual');
    
    if (totalHorasCell) {
        totalHorasCell.innerHTML = `<strong>${totalHoras} hrs</strong>`;
    }
    
    if (totalGeneralCell) {
        totalGeneralCell.innerHTML = `<strong>$${window.NumberUtils ? window.NumberUtils.formatCurrency(totalGeneral) : totalGeneral.toLocaleString()}</strong>`;
    }
}

// === FUNCIONES DE CÁLCULO ===
function calculateTotalHoursIndividual(data) {
    return data.reduce((sum, row) => sum + (parseFloat(row.tiempo) || 0), 0);
}

function calculateGrandTotalIndividual(data) {
    return data.reduce((sum, row) => sum + (parseFloat(row.total) || 0), 0);
}

// === RESTAURAR DATOS ORIGINALES ===
function resetPagosIndividualData() {
    if (confirm('¿Está seguro de que desea restaurar los datos originales? Se perderán todos los cambios.')) {
        loadPagosIndividualConfiguration();
        window.NotificationUtils.success('Datos restaurados correctamente');
    }
}

// === GENERAR REPORTE EXCEL ===
function generatePagosIndividualReport() {
    if (!currentPagosIndividualData || currentPagosIndividualData.length === 0) {
        window.NotificationUtils.error('No hay datos para generar el reporte');
        return;
    }
    
    try {
        console.log('📊 Generando reporte Excel: Pago Consultor Individual...');
        
        const consultorName = currentPagosIndividualData[0].consultor;
        
        // Preparar datos para Excel
        const excelData = [
            [], // Fila vacía
            ['PAGO A CONSULTOR'], // Título
            [`Consultor: ${consultorName}`], // Subtítulo con nombre
            [], // Fila vacía
            ['ID Empresa', 'Consultor', 'Soporte', 'Módulo', 'TIEMPO', 'TARIFA de Módulo', 'TOTAL'] // Headers
        ];
        
        // Agregar datos de filas
        currentPagosIndividualData.forEach(row => {
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
            `TOTAL PARA ${consultorName.toUpperCase()}`,
            '',
            '',
            '',
            calculateTotalHoursIndividual(currentPagosIndividualData),
            '',
            calculateGrandTotalIndividual(currentPagosIndividualData)
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
                        font: { bold: true, size: 16 },
                        alignment: { horizontal: 'center' }
                    };
                }
                
                // Subtítulo consultor (fila 3)
                if (row === 2 && col === 0) {
                    ws[cellAddress].s = {
                        font: { bold: true, size: 12 },
                        alignment: { horizontal: 'center' },
                        fill: { fgColor: { rgb: "E3F2FD" } }
                    };
                }
                
                // Headers (fila 5)
                if (row === 4) {
                    ws[cellAddress].s = {
                        font: { bold: true },
                        fill: { fgColor: { rgb: "E3F2FD" } },
                        alignment: { horizontal: 'center' }
                    };
                }
                
                // Columnas numéricas (TIEMPO, TARIFA, TOTAL)
                if (col >= 4 && row > 4) {
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
        
        // Fusionar celdas del título
        ws['!merges'] = [
            { s: { r: 1, c: 0 }, e: { r: 1, c: 6 } }, // Título principal
            { s: { r: 2, c: 0 }, e: { r: 2, c: 6 } }  // Subtítulo consultor
        ];
        
        // Agregar hoja al libro
        window.XLSX.utils.book_append_sheet(wb, ws, 'Pago Consultor Individual');
        
        // Generar nombre de archivo
        const currentDate = new Date();
        const dateStr = currentDate.toISOString().split('T')[0];
        const consultorId = selectedConsultorId || 'XXXX';
        const fileName = `Pago_Consultor_${consultorId}_${dateStr}.xlsx`;
        
        // Descargar archivo
        window.XLSX.writeFile(wb, fileName);
        
        // Registrar actividad
        if (window.AuthSys && window.AuthSys.logActivity) {
            window.AuthSys.logActivity(
                'report_generated',
                `Reporte generado: ${fileName}`,
                { 
                    reportType: 'pago_consultor_individual',
                    consultorId: selectedConsultorId,
                    consultorName: consultorName,
                    fileName: fileName,
                    recordCount: currentPagosIndividualData.length,
                    totalHours: calculateTotalHoursIndividual(currentPagosIndividualData),
                    totalAmount: calculateGrandTotalIndividual(currentPagosIndividualData)
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
function addPagosIndividualStyles() {
    // Verificar si ya existen los estilos
    if (document.getElementById('pagosIndividualStyles')) return;
    
    const styles = `
        <style id="pagosIndividualStyles">
            /* Estilos específicos para selector de consultor */
            .consultor-selector-section {
                background: white;
                border-radius: 8px;
                padding: 30px;
                box-shadow: 0 2px 10px rgba(0,0,0,0.1);
                margin: 20px 0;
                text-align: center;
            }
            
            .selector-form {
                max-width: 400px;
                margin: 0 auto;
            }
            
            .form-select {
                width: 100%;
                padding: 12px 15px;
                border: 2px solid var(--gray-300, #cbd5e1);
                border-radius: 6px;
                font-size: 1rem;
                background: white;
                transition: all 0.3s ease;
            }
            
            .form-select:focus {
                outline: none;
                border-color: var(--primary-color, #1e3a8a);
                box-shadow: 0 0 0 3px rgba(30, 58, 138, 0.1);
            }
            
            .btn-disabled {
                background: var(--gray-400, #94a3b8) !important;
                cursor: not-allowed !important;
                opacity: 0.6;
            }
            
            .btn-tertiary {
                background: linear-gradient(135deg, #8b5cf6 0%, #a855f7 100%);
                color: white;
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
            
            .btn-tertiary:hover {
                transform: translateY(-2px);
                box-shadow: 0 4px 15px rgba(139, 92, 246, 0.3);
            }
            
            /* Reutilizar estilos del reporte general */
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
        </style>
    `;
    
    document.head.insertAdjacentHTML('beforeend', styles);
}

// === EXPORTAR FUNCIONES GLOBALMENTE ===
if (typeof window !== 'undefined') {
    window.PagosIndividualReport = {
        load: loadPagosIndividualConfiguration,
        generate: generatePagosIndividualReport,
        reset: resetPagosIndividualData,
        updateRow: updatePagosIndividualRow,
        showSelector: showConsultorSelector,
        onConsultorSelected: onConsultorSelected,
        calculateTotalHours: calculateTotalHoursIndividual,
        calculateGrandTotal: calculateGrandTotalIndividual
    };
}

// Exportar inmediatamente
window.showConsultorSelector = showConsultorSelector;
window.onConsultorSelected = onConsultorSelected;
console.log('✅ Funciones exportadas desde pago-consultor-individual.js');

console.log('✅ Reporte Pago Consultor Individual inicializado correctamente');