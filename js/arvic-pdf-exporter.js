// ===================================================================
// SISTEMA DE EXPORTACIÓN PDF ARVIC - VERSIÓN FINAL COMPLETA
// Replica EXACTAMENTE el diseño de la imagen de referencia objetivo
// ===================================================================

/**
 * COLORES CORPORATIVOS ARVIC 
 */
const ARVIC_COLORS = {
    primary: '#1976D2',      // Azul principal de los headers
    secondary: '#2196F3', 
    light: '#E3F2FD',       // Azul muy claro para filas alternadas
    dark: '#0D47A1',
    gray: '#666666',
    lightGray: '#F5F5F5',   // Gris para filas alternadas
    white: '#FFFFFF',
    black: '#000000',
    textGray: '#555555'     // Para texto general
};

/**
 * CONFIGURACIÓN PDF OPTIMIZADA
 */
const PDF_CONFIG = {
    margin: 20,
    headerHeight: 95,       // Más espacio para header completo con metadata
    logoSize: 40,
    titleFontSize: 18,
    subtitleFontSize: 12,
    headerFontSize: 10,
    dataFontSize: 10,       // Aumentado de 9 a 10
    metadataFontSize: 9,    // Aumentado de 8 a 9
    lineHeight: 14,         // Aumentado de 12 a 14
    pageFormat: 'a4',
    orientation: 'landscape'
};

/**
 * CLASE PRINCIPAL - EXPORTADOR PDF ARVIC CORREGIDO
 */
class ARVICPDFExporter {
    constructor() {
        this.loadJsPDF();
    }

    /**
     * Cargar jsPDF si no está disponible
     */
    async loadJsPDF() {
        if (typeof window.jspdf === 'undefined') {
            const script = document.createElement('script');
            script.src = 'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js';
            document.head.appendChild(script);
            
            return new Promise((resolve) => {
                script.onload = () => {
                    this.jsPDF = window.jspdf.jsPDF;
                    resolve();
                };
            });
        } else {
            this.jsPDF = window.jspdf.jsPDF;
        }
    }

    /**
     * FUNCIÓN PRINCIPAL - Exportar datos a PDF
     */
    async exportToPDF(config, data, headers, metadata = {}) {
        await this.loadJsPDF();
        
        console.log('🎯 Iniciando exportación PDF:', {
            reportType: config.reportType,
            dataCount: data.length,
            headers: headers,
            metadata: metadata
        });
        
        const doc = new this.jsPDF({
            orientation: 'landscape',
            unit: 'mm',
            format: 'a4'
        });

        // Configurar documento
        this.setupDocument(doc, config);
        
        // Añadir header completo (logo + título + metadata)
        this.addCompleteHeader(doc, config, metadata);
        
        // Añadir tabla con datos
        this.addDataTable(doc, data, headers, config);
        
        // Añadir footer
        this.addFooter(doc);
        
        // Generar nombre de archivo y descargar
        const fileName = this.generateFileName(config.reportType, metadata);
        doc.save(fileName);
        
        // Notificación de éxito
        if (window.NotificationUtils) {
            window.NotificationUtils.success(`PDF generado exitosamente: ${fileName}`);
        }
        
        return fileName;
    }

    /**
     * Configurar propiedades del documento
     */
    setupDocument(doc, config) {
        doc.setProperties({
            title: `${config.title} - ARVIC`,
            subject: 'Reporte generado automáticamente',
            author: 'Sistema ARVIC',
            creator: 'Portal Administrativo ARVIC'
        });
    }

    /**
     * Añadir header completo (espaciado ultra-compacto como imagen objetivo)
     */
    addCompleteHeader(doc, config, metadata) {
        const pageWidth = doc.internal.pageSize.getWidth();
        
        // === LOGO REAL DE ARVIC (lado izquierdo) ===
        this.addARVICLogo(doc, 25, 22); // Subido de 25 a 22
        
        // === TÍTULO PRINCIPAL (centro) ===
        const titleText = this.getTitleByReportType(config.reportType);
        doc.setTextColor(ARVIC_COLORS.primary);
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(PDF_CONFIG.titleFontSize);
        doc.text(titleText, pageWidth / 2, 30, { align: 'center' }); // Subido de 35 a 30
        
        // Subtítulo empresa (mucho más cerca del título)
        doc.setTextColor(ARVIC_COLORS.textGray);
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(PDF_CONFIG.subtitleFontSize);
        doc.text('GRUPO IT ARVIC', pageWidth / 2, 40, { align: 'center' }); // Subido de 47 a 40
        
        // === LÍNEA SEPARADORA (mucho más cerca del subtítulo) ===
        doc.setDrawColor(ARVIC_COLORS.primary);
        doc.setLineWidth(0.8);
        doc.line(PDF_CONFIG.margin, 48, pageWidth - PDF_CONFIG.margin, 48); // Subido de 55 a 48
        
        // === METADATA COMPLETA (muy cerca de la línea) ===
        this.addCompleteMetadataSection(doc, metadata, 52); // Subido de 62 a 52
    }

    /**
     * Añadir logo real de ARVIC (replicando el diseño exacto)
     */
    addARVICLogo(doc, x, y) {
        // Círculo azul con la "A"
        doc.setFillColor(ARVIC_COLORS.primary);
        doc.circle(x, y, 15, 'F');
        
        // Letra "A" en blanco
        doc.setTextColor(ARVIC_COLORS.white);
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(20);
        doc.text('A', x, y + 5, { align: 'center' });
        
        // Texto "GRUPO IT" y "ARVIC"
        doc.setTextColor(ARVIC_COLORS.black);
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(8);
        doc.text('GRUPO IT', x + 20, y - 5);
        
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(16);
        doc.text('ARVIC', x + 20, y + 8);
    }

    /**
     * Obtener título según tipo de reporte
     */
    getTitleByReportType(reportType) {
        const titles = {
            'pago-consultor-general': 'REPORTE GENERAL DE PAGOS',
            'pago-consultor-especifico': 'REPORTE DE PAGO A CONSULTOR',
            'cliente-soporte': 'REPORTE DE SOPORTE AL CLIENTE',
            'remanente': 'REPORTE REMANENTE',
            'proyecto-general': 'REPORTE GENERAL DE PROYECTOS',
            'proyecto-cliente': 'REPORTE DE PROYECTO',
            'proyecto-consultor': 'REPORTE DE CONSULTOR - PROYECTOS'
        };
        
        return titles[reportType] || 'REPORTE ARVIC';
    }

    /**
     * Añadir sección de metadata completa (espaciado mínimo)
     */
    addCompleteMetadataSection(doc, metadata, startY) {
        const pageWidth = doc.internal.pageSize.getWidth();
        let yPos = startY;
        
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(PDF_CONFIG.metadataFontSize);
        doc.setTextColor(ARVIC_COLORS.textGray);
        
        // === LADO IZQUIERDO ===
        const clienteText = (metadata.cliente && metadata.cliente !== 'Todos los clientes') 
            ? `Cliente: ${metadata.cliente}` 
            : 'Cliente: N/A';
        doc.text(clienteText, PDF_CONFIG.margin, yPos);
        
        // Consultor (espaciado ultra-mínimo)
        const consultorText = (metadata.consultor && metadata.consultor !== 'Todos los consultores') 
            ? `Consultor: ${metadata.consultor}` 
            : 'Consultor: N/A';
        doc.text(consultorText, PDF_CONFIG.margin, yPos + 4); // Reducido de 6 a 4
        
        // === LADO DERECHO ===
        const fecha = new Date().toLocaleDateString('es-MX', {
            day: 'numeric',
            month: 'long',
            year: 'numeric'
        });
        doc.text(`Generado: ${fecha}`, pageWidth - PDF_CONFIG.margin, yPos, { align: 'right' });
        
        const periodoText = (metadata.mes && metadata.mes !== 'Todos los períodos') 
            ? `Período: ${metadata.mes}` 
            : 'Período: N/A';
        doc.text(periodoText, pageWidth - PDF_CONFIG.margin, yPos + 4, { align: 'right' }); // Reducido de 6 a 4
    }

    /**
     * Añadir tabla de datos con mejor separación entre totales y mensaje
     */
    addDataTable(doc, data, headers, config) {
        const startY = PDF_CONFIG.headerHeight + 1;
        const pageWidth = doc.internal.pageSize.getWidth();
        const tableWidth = pageWidth - (PDF_CONFIG.margin * 2);
        
        // Calcular anchos de columna según el tipo de reporte
        const columnWidths = this.calculateOptimalColumnWidths(headers, tableWidth, config.reportType);
        
        console.log('📊 Configuración de tabla:', {
            headers: headers,
            columnWidths: columnWidths,
            dataLength: data.length
        });
        
        // Dibujar headers de la tabla
        this.drawTableHeaders(doc, headers, columnWidths, startY);
        
        // Dibujar filas de datos
        let currentY = startY + 10;
        const rowHeight = 14; 
        
        data.forEach((row, index) => {
            // Verificar si necesitamos nueva página
            if (currentY > doc.internal.pageSize.getHeight() - 80) {
                doc.addPage();
                currentY = 30;
                this.drawTableHeaders(doc, headers, columnWidths, currentY);
                currentY += 10;
            }
            
            this.drawDataRow(doc, row, headers, columnWidths, currentY, index, config.reportType);
            currentY += rowHeight;
        });
        
        // Añadir totales SEPARADOS
        if (config.showTotals && data.length > 0) {
            currentY += 10;
            const totalsY = currentY;
            this.addSeparatedTotals(doc, data, pageWidth, totalsY);
            
            // Mensaje MÁS SEPARADO de los totales (aumentado de 22 a 35)
            const messageY = totalsY + 35; // Más espacio para que no se vea saturado
            doc.setFont('helvetica', 'italic');
            doc.setFontSize(9); 
            doc.setTextColor(ARVIC_COLORS.black); 
            doc.text('* Totales calculados con valores modificados en vista previa', 
                     pageWidth - PDF_CONFIG.margin, messageY, { align: 'right' });
        }
    }

    /**
     * Añadir totales separados (replicando diseño exacto de imagen 1)
     */
    addSeparatedTotals(doc, data, pageWidth, y) {
        // Calcular totales
        const totalHours = data.reduce((sum, row) => {
            return sum + parseFloat(row.editedTime || row.tiempo || row.hours || 0);
        }, 0);
        
        const totalAmount = data.reduce((sum, row) => {
            return sum + parseFloat(row.editedTotal || row.total || 0);
        }, 0);
        
        // Configurar texto para totales (aumentar tamaño de fuente)
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(13); // Aumentado de 12 a 13
        doc.setTextColor(ARVIC_COLORS.primary);
        
        // Total Horas (alineado a la derecha)
        doc.text(`Total Horas: ${totalHours.toFixed(1)} hrs`, 
                 pageWidth - PDF_CONFIG.margin, y, { align: 'right' });
        
        // Total Monto (alineado a la derecha, con más espacio)
        doc.text(`Total Monto: ${totalAmount.toLocaleString('es-MX', { minimumFractionDigits: 2 })}`, 
                 pageWidth - PDF_CONFIG.margin, y + 18, { align: 'right' });
    }

    /**
     * Calcular anchos de columna optimizados según tipo de reporte
     */
    calculateOptimalColumnWidths(headers, tableWidth, reportType) {
        const columnCount = headers.length;
        
        switch (reportType) {
            case 'pago-consultor-general':
            case 'pago-consultor-especifico':
                // 7 columnas: ID, Consultor, Soporte, Módulo, Tiempo, Tarifa, Total
                return [
                    tableWidth * 0.08, // ID Empresa (más estrecho)
                    tableWidth * 0.15, // Consultor
                    tableWidth * 0.25, // Soporte (más ancho, texto largo)
                    tableWidth * 0.20, // Módulo
                    tableWidth * 0.10, // Tiempo
                    tableWidth * 0.10, // Tarifa
                    tableWidth * 0.12  // Total
                ];
                
            case 'cliente-soporte':
                // 5 columnas: Soporte, Módulo, Tiempo, Tarifa, Total
                return [
                    tableWidth * 0.35, // Soporte
                    tableWidth * 0.25, // Módulo
                    tableWidth * 0.15, // Tiempo
                    tableWidth * 0.15, // Tarifa
                    tableWidth * 0.10  // Total
                ];
                
            case 'proyecto-cliente':
                // 4 columnas: Módulo, Tiempo, Tarifa, Total
                return [
                    tableWidth * 0.40, // Módulo (más ancho)
                    tableWidth * 0.20, // Tiempo
                    tableWidth * 0.20, // Tarifa
                    tableWidth * 0.20  // Total
                ];
                
            case 'remanente':
                // Estructura especial semanal - se maneja por separado
                const totalWidth = tableWidth * 0.15;
                const weekWidth = (tableWidth - totalWidth) / 4;
                return [totalWidth, weekWidth, weekWidth, weekWidth, weekWidth];
                
            default:
                // Distribución equitativa para otros reportes
                const standardWidth = tableWidth / columnCount;
                return Array(columnCount).fill(standardWidth);
        }
    }

    /**
     * Dibujar headers de tabla (con bordes más sutiles y consistentes)
     */
    drawTableHeaders(doc, headers, columnWidths, y) {
        let currentX = PDF_CONFIG.margin;
        
        headers.forEach((header, index) => {
            const width = columnWidths[index];
            
            // Fondo azul corporativo
            doc.setFillColor(ARVIC_COLORS.primary);
            doc.rect(currentX, y, width, 12, 'F');
            
            // Bordes sutiles (más delgados y grises)
            doc.setLineWidth(0.2);
            doc.setDrawColor(200, 200, 200); // Gris claro
            doc.rect(currentX, y, width, 12);
            
            // Texto del header (corregir "TARIFA de Modulo" a solo "TARIFA")
            doc.setFont('helvetica', 'bold');
            doc.setFontSize(PDF_CONFIG.headerFontSize);
            doc.setTextColor(ARVIC_COLORS.white);
            
            let headerText = header.toString();
            if (headerText === 'TARIFA de Modulo') {
                headerText = 'TARIFA';
            }
            
            const textWidth = doc.getTextWidth(headerText);
            const centerX = currentX + (width / 2) - (textWidth / 2);
            
            doc.text(headerText, centerX, y + 8);
            
            currentX += width;
        });
    }

    /**
     * Dibujar fila de datos (con bordes sutiles y consistentes con headers)
     */
    drawDataRow(doc, rowData, headers, columnWidths, y, rowIndex, reportType) {
        let currentX = PDF_CONFIG.margin;
        const rowHeight = 14; 
        
        // Fondo alternado (replicando el diseño de referencia)
        if (rowIndex % 2 === 0) {
            doc.setFillColor(ARVIC_COLORS.lightGray);
            doc.rect(PDF_CONFIG.margin, y, columnWidths.reduce((a, b) => a + b, 0), rowHeight, 'F');
        }
        
        // Configurar texto para datos
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(PDF_CONFIG.dataFontSize);
        doc.setTextColor(ARVIC_COLORS.black);
        
        headers.forEach((header, index) => {
            const width = columnWidths[index];
            let cellValue = this.getCellValue(rowData, header, reportType);
            
            // Dibujar bordes de celda (más sutiles, igual que headers)
            doc.setLineWidth(0.2);
            doc.setDrawColor(200, 200, 200); // Gris claro consistente
            doc.rect(currentX, y, width, rowHeight);
            
            // Determinar alineación
            const alignment = this.getCellAlignment(header);
            let textX = currentX + 4; // Margen izquierdo por defecto
            
            if (alignment === 'center') {
                textX = currentX + (width / 2);
            } else if (alignment === 'right') {
                textX = currentX + width - 4; // Margen derecho
            }
            
            // Dibujar texto
            doc.text(cellValue.toString(), textX, y + 9, { align: alignment });
            
            currentX += width;
        });
    }

    /**
     * Obtener valor de celda con mapeo correcto según el tipo de reporte
     */
    getCellValue(rowData, header, reportType) {
        switch (header) {
            case 'ID Empresa':
                return rowData.idEmpresa || rowData.empresaId || 'N/A';
                
            case 'Consultor':
                return rowData.consultor || rowData.consultorName || 'N/A';
                
            case 'Soporte':
                return rowData.soporte || rowData.soporteName || rowData.supportName || 'N/A';
                
            case 'Modulo':
                return rowData.modulo || rowData.moduloName || rowData.moduleName || 'N/A';
                
            case 'TIEMPO':
                const tiempo = rowData.editedTime || rowData.tiempo || rowData.hours || 0;
                return `${parseFloat(tiempo).toFixed(1)} hrs`;
                
            case 'TARIFA de Modulo':
                const tarifa = rowData.editedTariff || rowData.tarifa || rowData.rate || 0;
                return `$${parseFloat(tarifa).toLocaleString('es-MX')}`;
                
            case 'TOTAL':
                const total = rowData.editedTotal || rowData.total || 0;
                return `$${parseFloat(total).toLocaleString('es-MX', { minimumFractionDigits: 2 })}`;
                
            default:
                // Intentar mapeo genérico
                return rowData[header] || rowData[header.toLowerCase()] || '';
        }
    }

    /**
     * Determinar alineación de celda (actualizado para nuevo header)
     */
    getCellAlignment(header) {
        const rightAligned = ['TIEMPO', 'TARIFA de Modulo', 'TARIFA', 'TOTAL'];
        const centerAligned = ['ID Empresa'];
        
        if (rightAligned.includes(header)) return 'right';
        if (centerAligned.includes(header)) return 'center';
        return 'left';
    }

    /**
     * Añadir footer (replicando diseño exacto del objetivo)
     */
    addFooter(doc) {
        const pageHeight = doc.internal.pageSize.getHeight();
        const pageWidth = doc.internal.pageSize.getWidth();
        const footerY = pageHeight - 25;
        
        // Línea separadora azul (más gruesa como en el objetivo)
        doc.setDrawColor(ARVIC_COLORS.primary);
        doc.setLineWidth(1.2); // Aumentado de 0.8 a 1.2 para que coincida con el objetivo
        doc.line(PDF_CONFIG.margin, footerY - 10, pageWidth - PDF_CONFIG.margin, footerY - 10);
        
        // Texto del footer (arriba de la línea)
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(8);
        doc.setTextColor(ARVIC_COLORS.textGray);
        
        // Lado izquierdo - Sistema
        doc.text('GRUPO IT ARVIC - Sistema de Gestión Empresarial', PDF_CONFIG.margin, footerY - 3);
        
        // Lado derecho - Documento generado automáticamente
        const currentDate = new Date().toLocaleDateString('es-MX', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        });
        const currentTime = new Date().toLocaleTimeString('es-MX', {
            hour: '2-digit',
            minute: '2-digit',
            hour12: true
        });
        doc.text(`Documento generado automáticamente - ${currentDate}, ${currentTime}`, 
                 pageWidth - PDF_CONFIG.margin, footerY - 3, { align: 'right' });
        
        // Número de página (CENTRADO y DEBAJO de la línea azul)
        const pageNumber = doc.internal.getCurrentPageInfo().pageNumber;
        doc.text(`Página ${pageNumber}`, pageWidth / 2, footerY + 3, { align: 'center' }); // Ajustado posición
    }

    /**
     * Generar nombre de archivo
     */
    generateFileName(reportType, metadata) {
        const date = new Date();
        const dateStr = date.toISOString().split('T')[0];
        const timeStr = date.toTimeString().split(' ')[0].replace(/:/g, '');
        
        const reportNames = {
            'pago-consultor-general': 'ReportePagoGeneral',
            'pago-consultor-especifico': 'ReportePagoConsultor',
            'cliente-soporte': 'ReporteSoporteCliente',
            'remanente': 'ReporteRemanente',
            'proyecto-general': 'ReporteProyectoGeneral',
            'proyecto-cliente': 'ReporteProyectoCliente',
            'proyecto-consultor': 'ReporteProyectoConsultor'
        };
        
        const baseName = reportNames[reportType] || 'ReporteARVIC';
        return `${baseName}_${dateStr}_${timeStr}.pdf`;
    }
}

// ===================================================================
// INTEGRACIÓN CON LA INTERFAZ EXISTENTE (PARTE CRÍTICA RESTAURADA)
// ===================================================================

// Crear instancia global
window.arvicPDFExporter = new ARVICPDFExporter();

/**
 * FUNCIÓN PRINCIPAL - Exportar reporte actual a PDF
 */
async function exportCurrentReportToPDF() {
    try {
        console.log('🚀 Iniciando exportación PDF del reporte actual...');
        
        // Validar que hay datos para exportar
        if (!currentReportType || !editablePreviewData || Object.keys(editablePreviewData).length === 0) {
            throw new Error('No hay datos disponibles para exportar');
        }
        
        // Mostrar indicador de carga en el botón
        const pdfButton = document.getElementById('exportPDFBtn');
        if (pdfButton) {
            pdfButton.classList.add('loading');
            pdfButton.disabled = true;
        }
        
        // Preparar configuración
        const report = ARVIC_REPORTS[currentReportType];
        const config = {
            title: report.name || 'Reporte ARVIC',
            reportType: currentReportType,
            showTotals: true
        };
        
        // Preparar datos - convertir objeto a array
        const data = Object.values(editablePreviewData);
        
        // Preparar headers
        const headers = report.structure || ['ID', 'Descripción', 'Valor'];
        
        // Preparar metadata
        const metadata = prepareMetadataForPDF();
        
        console.log('📋 Datos preparados:', {
            config: config,
            dataCount: data.length,
            headers: headers,
            metadata: metadata
        });
        
        // Exportar PDF
        await window.arvicPDFExporter.exportToPDF(config, data, headers, metadata);
        
    } catch (error) {
        console.error('❌ Error en exportación PDF:', error);
        if (window.NotificationUtils) {
            window.NotificationUtils.error(`Error al generar PDF: ${error.message}`);
        } else {
            alert(`Error al generar PDF: ${error.message}`);
        }
    } finally {
        // Restaurar botón
        const pdfButton = document.getElementById('exportPDFBtn');
        if (pdfButton) {
            pdfButton.classList.remove('loading');
            pdfButton.disabled = false;
        }
    }
}

/**
 * Preparar metadata del reporte actual
 */
function prepareMetadataForPDF() {
    const metadata = {};
    
    // Obtener información de los filtros activos
    const clientFilter = document.getElementById('clientFilter');
    const consultantFilter = document.getElementById('consultantFilter');
    const supportFilter = document.getElementById('supportTypeFilter');
    const monthFilter = document.getElementById('monthFilter');
    
    if (clientFilter?.selectedOptions[0] && clientFilter.selectedOptions[0].value !== '') {
        metadata.cliente = clientFilter.selectedOptions[0].text;
    }
    
    if (consultantFilter?.selectedOptions[0] && consultantFilter.selectedOptions[0].value !== '') {
        metadata.consultor = consultantFilter.selectedOptions[0].text;
    }
    
    if (supportFilter?.selectedOptions[0] && supportFilter.selectedOptions[0].value !== '') {
        metadata.soporte = supportFilter.selectedOptions[0].text;
    }
    
    if (monthFilter?.selectedOptions[0] && monthFilter.selectedOptions[0].value !== '') {
        metadata.mes = monthFilter.selectedOptions[0].text;
    }
    
    return metadata;
}

// ===================================================================
// FUNCIONES DE INTEGRACIÓN CON LA INTERFAZ (RESTAURADAS)
// ===================================================================

/**
 * Añadir botón PDF al panel de configuración existente
 */
function addPDFButtonToConfigPanel() {
    // Buscar el contenedor de botones existente
    const buttonContainer = document.querySelector('.config-actions');
    
    if (buttonContainer) {
        // Verificar si el botón ya existe
        if (document.getElementById('exportPDFBtn')) {
            return; // Ya existe, no crear duplicado
        }
        
        // Crear botón PDF
        const pdfButton = document.createElement('button');
        pdfButton.className = 'btn btn-info btn-pdf';
        pdfButton.id = 'exportPDFBtn';
        pdfButton.innerHTML = '<span class="btn-icon">📄 Exportar PDF</span>';
        pdfButton.onclick = exportCurrentReportToPDF;
        pdfButton.disabled = true; // Inicialmente deshabilitado
        
        // Insertar después del botón de Excel
        const excelButton = document.getElementById('generateBtn');
        if (excelButton) {
            excelButton.parentNode.insertBefore(pdfButton, excelButton.nextSibling);
        } else {
            buttonContainer.appendChild(pdfButton);
        }
        
        console.log('✅ Botón PDF añadido al panel de configuración');
    }
}

/**
 * Actualizar estado del botón PDF (habilitar/deshabilitar)
 */
function updatePDFButtonState(enabled) {
    const pdfButton = document.getElementById('exportPDFBtn');
    if (pdfButton) {
        pdfButton.disabled = !enabled;
        console.log(`🔄 Botón PDF ${enabled ? 'habilitado' : 'deshabilitado'}`);
    }
}

// ===================================================================
// HOOKS PARA INTEGRACIÓN AUTOMÁTICA (CRÍTICOS PARA EL FUNCIONAMIENTO)
// ===================================================================

/**
 * Hook en la función de configuración existente
 */
const originalShowConfigPanel = window.showConfigPanel;
if (originalShowConfigPanel) {
    window.showConfigPanel = function(...args) {
        const result = originalShowConfigPanel.apply(this, args);
        setTimeout(addPDFButtonToConfigPanel, 100); // Añadir botón después de crear panel
        return result;
    };
}

/**
 * Hook en la validación de filtros existente
 */
const originalValidateRequiredFilters = window.validateRequiredFilters;
if (originalValidateRequiredFilters) {
    window.validateRequiredFilters = function(...args) {
        const result = originalValidateRequiredFilters.apply(this, args);
        
        // Obtener estado actual de los botones
        const generateBtn = document.getElementById('generateBtn');
        const enabled = generateBtn && !generateBtn.disabled;
        
        // Actualizar botón PDF
        updatePDFButtonState(enabled);
        
        return result;
    };
}

/**
 * Hook en la generación de vista previa
 */
const originalGenerateReportPreview = window.generateReportPreview;
if (originalGenerateReportPreview) {
    window.generateReportPreview = function(...args) {
        const result = originalGenerateReportPreview.apply(this, args);
        
        // Habilitar botón PDF después de vista previa exitosa
        setTimeout(() => {
            const previewPanel = document.getElementById('reportPreviewPanel');
            if (previewPanel && previewPanel.innerHTML.trim() !== '') {
                updatePDFButtonState(true);
                console.log('✅ Vista previa generada - Botón PDF habilitado');
            }
        }, 500);
        
        return result;
    };
}

// ===================================================================
// FUNCIONES GLOBALES Y DE UTILIDAD
// ===================================================================

/**
 * Función para exportar cualquier tabla HTML a PDF
 * Útil para casos especiales o futuras expansiones
 */
async function exportTableToPDF(tableElement, title = 'Reporte ARVIC', metadata = {}) {
    if (!tableElement) return;
    
    const headers = Array.from(tableElement.querySelectorAll('thead th')).map(th => th.textContent.trim());
    const rows = Array.from(tableElement.querySelectorAll('tbody tr')).map(tr => 
        Array.from(tr.querySelectorAll('td')).map(td => td.textContent.trim())
    );
    
    const config = {
        title: title,
        reportType: 'custom',
        showTotals: false
    };
    
    await window.arvicPDFExporter.exportToPDF(config, rows, headers, metadata);
}

// ===================================================================
// EXPORTAR FUNCIONES GLOBALMENTE
// ===================================================================

// Funciones principales
window.exportCurrentReportToPDF = exportCurrentReportToPDF;
window.exportTableToPDF = exportTableToPDF;
window.addPDFButtonToConfigPanel = addPDFButtonToConfigPanel;
window.updatePDFButtonState = updatePDFButtonState;

// ===================================================================
// INICIALIZACIÓN
// ===================================================================

// Inicialización automática
document.addEventListener('DOMContentLoaded', function() {
    console.log('✅ Sistema de exportación PDF ARVIC cargado exitosamente');
    
    // Verificar si ya existe un panel de configuración visible
    const configPanel = document.getElementById('reportConfigPanel');
    if (configPanel && configPanel.style.display !== 'none') {
        addPDFButtonToConfigPanel();
    }
    
    // Verificar integración con funciones existentes
    setTimeout(() => {
        if (typeof validateRequiredFilters !== 'function') {
            console.warn('⚠️  Función validateRequiredFilters no encontrada - integración parcial');
        }
        
        if (typeof generateReportPreview !== 'function') {
            console.warn('⚠️  Función generateReportPreview no encontrada - integración parcial');
        }
        
        console.log('🔗 Verificación de integración completada');
    }, 1000);
});

console.log('📄 ARVIC PDF Exporter v3.0 - Sistema completo con diseño exacto iniciado exitosamente');