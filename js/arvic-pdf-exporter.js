// ===================================================================
// SISTEMA DE EXPORTACIÓN PDF REUTILIZABLE - PORTAL ARVIC
// ===================================================================

/**
 * COLORES CORPORATIVOS ARVIC 
 */
const ARVIC_COLORS = {
    primary: '#1976D2',
    secondary: '#2196F3', 
    light: '#4FC3F7',
    dark: '#0D47A1',
    gray: '#666666',
    lightGray: '#F5F5F5',
    white: '#FFFFFF'
};

/**
 * CONFIGURACIÓN PDF PREDETERMINADA
 */
const PDF_CONFIG = {
    margin: 20,
    headerHeight: 60,
    logoSize: 45,
    titleFontSize: 16,
    headerFontSize: 10,
    dataFontSize: 9,
    lineHeight: 1.2,
    pageFormat: 'a4',
    orientation: 'landscape' // landscape para más columnas
};

/**
 * CLASE PRINCIPAL - EXPORTADOR PDF ARVIC
 * Funcionalidad reutilizable que se adapta automáticamente a cualquier estructura
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
     * @param {Object} config - Configuración del reporte
     * @param {Array} data - Datos del reporte  
     * @param {Array} headers - Headers/columnas
     * @param {Object} metadata - Información adicional (cliente, consultor, etc.)
     */
    async exportToPDF(config, data, headers, metadata = {}) {
        await this.loadJsPDF();
        
        const doc = new this.jsPDF({
            orientation: this.determineOrientation(headers.length),
            unit: 'mm',
            format: 'a4'
        });

        // Configurar documento
        this.setupDocument(doc);
        
        // Añadir logo y header
        this.addHeader(doc, config.title, metadata);
        
        // Determinar estructura y añadir tabla
        this.addTable(doc, data, headers, config);
        
        // Añadir footer
        this.addFooter(doc);
        
        // Generar nombre de archivo
        const fileName = this.generateFileName(config.reportType, metadata);
        
        // Descargar
        doc.save(fileName);
        
        // Notificación
        window.NotificationUtils?.success(`PDF generado: ${fileName}`);
        
        return fileName;
    }

    /**
     * Configurar propiedades del documento
     */
    setupDocument(doc) {
        doc.setProperties({
            title: 'Reporte ARVIC',
            subject: 'Reporte generado automáticamente',
            author: 'Sistema ARVIC',
            creator: 'Portal Administrativo ARVIC'
        });
    }

    /**
     * Determinar orientación según número de columnas
     */
    determineOrientation(columnCount) {
        return columnCount > 5 ? 'landscape' : 'portrait';
    }

    /**
     * Añadir header con logo y información
     */
    addHeader(doc, title, metadata) {
        const pageWidth = doc.internal.pageSize.getWidth();
        
        // LOGO ARVIC (recreación vectorial)
        this.drawARVICLogo(doc, PDF_CONFIG.margin, PDF_CONFIG.margin);
        
        // TÍTULO PRINCIPAL
        doc.setFontSize(PDF_CONFIG.titleFontSize);
        doc.setTextColor(ARVIC_COLORS.primary);
        doc.setFont('helvetica', 'bold');
        doc.text(title.toUpperCase(), pageWidth / 2, PDF_CONFIG.margin + 15, { align: 'center' });
        
        // INFORMACIÓN ADICIONAL
        this.addMetadataInfo(doc, metadata, pageWidth);
        
        // LÍNEA SEPARADORA
        doc.setLineWidth(0.5);
        doc.setDrawColor(ARVIC_COLORS.primary);
        doc.line(PDF_CONFIG.margin, PDF_CONFIG.headerHeight, pageWidth - PDF_CONFIG.margin, PDF_CONFIG.headerHeight);
    }

    /**
     * Dibujar logo ARVIC (versión vectorial exacta)
     */
    drawARVICLogo(doc, x, y) {
        const logoSize = PDF_CONFIG.logoSize;
        
        // Círculo base con gradiente simulado
        doc.setFillColor(ARVIC_COLORS.secondary);
        doc.circle(x + logoSize/2, y + logoSize/2, logoSize/2, 'F');
        
        // Sombra del círculo
        doc.setFillColor(ARVIC_COLORS.dark);
        doc.circle(x + logoSize/2 + 1, y + logoSize/2 + 1, logoSize/2, 'F');
        doc.setFillColor(ARVIC_COLORS.secondary);
        doc.circle(x + logoSize/2, y + logoSize/2, logoSize/2, 'F');
        
        // Letra "A" en blanco
        doc.setFontSize(24);
        doc.setTextColor(ARVIC_COLORS.white);
        doc.setFont('helvetica', 'bold');
        doc.text('A', x + logoSize/2, y + logoSize/2 + 3, { align: 'center' });
        
        // Texto "GRUPO IT ARVIC"
        doc.setFontSize(8);
        doc.setTextColor(ARVIC_COLORS.gray);
        doc.setFont('helvetica', 'normal');
        doc.text('GRUPO IT', x + logoSize + 5, y + 15);
        
        doc.setFontSize(14);
        doc.setTextColor(ARVIC_COLORS.primary);
        doc.setFont('helvetica', 'bold');
        doc.text('ARVIC', x + logoSize + 5, y + 28);
    }

    /**
     * Añadir información de metadata
     */
    addMetadataInfo(doc, metadata, pageWidth) {
        doc.setFontSize(PDF_CONFIG.headerFontSize);
        doc.setTextColor(ARVIC_COLORS.gray);
        doc.setFont('helvetica', 'normal');
        
        let yPos = PDF_CONFIG.margin + 25;
        
        // Información en dos columnas
        if (metadata.cliente) {
            doc.text(`Cliente: ${metadata.cliente}`, PDF_CONFIG.margin, yPos);
        }
        if (metadata.consultor) {
            doc.text(`Consultor: ${metadata.consultor}`, pageWidth - 80, yPos);
        }
        
        yPos += 8;
        if (metadata.soporte) {
            doc.text(`Soporte: ${metadata.soporte}`, PDF_CONFIG.margin, yPos);
        }
        if (metadata.mes) {
            doc.text(`Período: ${metadata.mes}`, pageWidth - 80, yPos);
        }
        
        // Fecha de generación
        yPos += 8;
        const fecha = new Date().toLocaleDateString('es-MX', {
            year: 'numeric',
            month: 'long', 
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
        doc.text(`Generado: ${fecha}`, PDF_CONFIG.margin, yPos);
    }

    /**
     * Añadir tabla principal con datos
     */
    addTable(doc, data, headers, config) {
        const startY = PDF_CONFIG.headerHeight + 10;
        const pageWidth = doc.internal.pageSize.getWidth();
        const tableWidth = pageWidth - (PDF_CONFIG.margin * 2);
        
        // Calcular anchos de columna dinámicamente
        const columnWidths = this.calculateColumnWidths(headers, tableWidth, config.reportType);
        
        // Headers de la tabla
        this.drawTableHeaders(doc, headers, columnWidths, startY);
        
        // Datos de la tabla
        let currentY = startY + 15;
        const lineHeight = 8;
        
        data.forEach((row, index) => {
            // Verificar si necesitamos nueva página
            if (currentY > doc.internal.pageSize.getHeight() - 30) {
                doc.addPage();
                currentY = PDF_CONFIG.margin + 10;
                this.drawTableHeaders(doc, headers, columnWidths, currentY);
                currentY += 15;
            }
            
            this.drawTableRow(doc, row, headers, columnWidths, currentY, index % 2 === 0);
            currentY += lineHeight;
        });
        
        // Fila de totales si aplica
        if (config.showTotals && data.length > 0) {
            this.drawTotalsRow(doc, data, headers, columnWidths, currentY);
        }
    }

    /**
     * Calcular anchos de columna según tipo de reporte
     */
    calculateColumnWidths(headers, tableWidth, reportType) {
        const columnCount = headers.length;
        
        switch (reportType) {
            case 'remanente':
                // Estructura especial para semanas
                const totalHorasWidth = 25;
                const remainingWidth = tableWidth - totalHorasWidth;
                const weekWidth = remainingWidth / (columnCount - 1);
                return [totalHorasWidth, ...Array(columnCount - 1).fill(weekWidth)];
                
            case 'cliente-soporte':
            case 'proyecto-cliente':
                // Estructura simplificada
                return [
                    tableWidth * 0.35, // Soporte/Módulo
                    tableWidth * 0.15, // Tiempo  
                    tableWidth * 0.25, // Tarifa
                    tableWidth * 0.25  // Total
                ];
                
            default:
                // Distribución estándar
                const standardWidth = tableWidth / columnCount;
                return Array(columnCount).fill(standardWidth);
        }
    }

    /**
     * Dibujar headers de tabla con estilo corporativo
     */
    drawTableHeaders(doc, headers, columnWidths, y) {
        let currentX = PDF_CONFIG.margin;
        
        headers.forEach((header, index) => {
            const width = columnWidths[index];
            
            // Fondo del header con color corporativo
            doc.setFillColor(ARVIC_COLORS.primary);
            doc.rect(currentX, y, width, 12, 'F');
            
            // Borde
            doc.setLineWidth(0.2);
            doc.setDrawColor(ARVIC_COLORS.white);
            doc.rect(currentX, y, width, 12);
            
            // Texto del header
            doc.setFontSize(PDF_CONFIG.headerFontSize);
            doc.setTextColor(ARVIC_COLORS.white);
            doc.setFont('helvetica', 'bold');
            
            const text = header.toString().toUpperCase();
            const textWidth = doc.getTextWidth(text);
            const centerX = currentX + (width / 2) - (textWidth / 2);
            
            doc.text(text, centerX, y + 8);
            
            currentX += width;
        });
    }

    /**
     * Dibujar fila de datos
     */
    drawTableRow(doc, rowData, headers, columnWidths, y, isEven) {
        let currentX = PDF_CONFIG.margin;
        
        // Fondo alternado
        if (isEven) {
            doc.setFillColor(ARVIC_COLORS.lightGray);
            doc.rect(PDF_CONFIG.margin, y, columnWidths.reduce((a, b) => a + b, 0), 8, 'F');
        }
        
        headers.forEach((header, index) => {
            const width = columnWidths[index];
            let cellValue = '';
            
            // Obtener valor de la celda
            if (typeof rowData === 'object' && rowData !== null) {
                cellValue = this.getCellValue(rowData, header, index);
            } else if (Array.isArray(rowData)) {
                cellValue = rowData[index] || '';
            }
            
            // Formatear valor
            cellValue = this.formatCellValue(cellValue, header);
            
            // Dibujar texto
            doc.setFontSize(PDF_CONFIG.dataFontSize);
            doc.setTextColor(ARVIC_COLORS.gray);
            doc.setFont('helvetica', 'normal');
            
            // Alineación según tipo de contenido
            const alignment = this.getCellAlignment(header, cellValue);
            let textX = currentX + 2;
            
            if (alignment === 'center') {
                textX = currentX + (width / 2);
            } else if (alignment === 'right') {
                textX = currentX + width - 2;
            }
            
            doc.text(cellValue.toString(), textX, y + 6, { align: alignment });
            
            // Borde de celda
            doc.setLineWidth(0.1);
            doc.setDrawColor(ARVIC_COLORS.gray);
            doc.rect(currentX, y, width, 8);
            
            currentX += width;
        });
    }

    /**
     * Obtener valor de celda desde objeto de datos
     */
    getCellValue(rowData, header, index) {
        // Mapeo de headers a propiedades de datos
        const headerMappings = {
            'ID EMPRESA': 'idEmpresa',
            'CONSULTOR': 'consultor', 
            'SOPORTE': 'soporte',
            'MODULO': 'modulo',
            'TIEMPO': 'editedTime',
            'TARIFA DE MODULO': 'editedTariff',
            'TOTAL': 'editedTotal',
            'CLIENTE': 'cliente',
            'PROYECTO': 'proyecto'
        };
        
        const key = headerMappings[header.toUpperCase()] || 
                   header.toLowerCase().replace(/ /g, '');
                   
        return rowData[key] || rowData[header] || '';
    }

    /**
     * Formatear valor de celda
     */
    formatCellValue(value, header) {
        if (value === null || value === undefined) return '';
        
        const upperHeader = header.toUpperCase();
        
        // Formateo numérico para campos monetarios
        if (upperHeader.includes('TOTAL') || upperHeader.includes('TARIFA')) {
            const num = parseFloat(value);
            if (!isNaN(num)) {
                return `$${num.toLocaleString('es-MX', {minimumFractionDigits: 2})}`;
            }
        }
        
        // Formateo para tiempo/horas
        if (upperHeader.includes('TIEMPO') || upperHeader.includes('HORAS')) {
            const num = parseFloat(value);
            if (!isNaN(num)) {
                return `${num.toFixed(1)} hrs`;
            }
        }
        
        return value.toString();
    }

    /**
     * Determinar alineación de texto
     */
    getCellAlignment(header, value) {
        const upperHeader = header.toUpperCase();
        
        if (upperHeader.includes('TOTAL') || 
            upperHeader.includes('TARIFA') || 
            upperHeader.includes('TIEMPO')) {
            return 'right';
        }
        
        return 'left';
    }

    /**
     * Dibujar fila de totales
     */
    drawTotalsRow(doc, data, headers, columnWidths, y) {
        let currentX = PDF_CONFIG.margin;
        
        // Fondo especial para totales
        doc.setFillColor(ARVIC_COLORS.light);
        doc.rect(PDF_CONFIG.margin, y, columnWidths.reduce((a, b) => a + b, 0), 10, 'F');
        
        headers.forEach((header, index) => {
            const width = columnWidths[index];
            let cellValue = '';
            
            if (index === 0) {
                cellValue = 'TOTALES';
            } else if (header.toUpperCase().includes('TIEMPO')) {
                const total = data.reduce((sum, row) => {
                    const time = parseFloat(row.editedTime || row.tiempo || 0);
                    return sum + time;
                }, 0);
                cellValue = `${total.toFixed(1)} hrs`;
            } else if (header.toUpperCase().includes('TOTAL')) {
                const total = data.reduce((sum, row) => {
                    const amount = parseFloat(row.editedTotal || row.total || 0);
                    return sum + amount;
                }, 0);
                cellValue = `$${total.toLocaleString('es-MX', {minimumFractionDigits: 2})}`;
            } else {
                cellValue = '-';
            }
            
            // Texto de totales
            doc.setFontSize(PDF_CONFIG.headerFontSize);
            doc.setTextColor(ARVIC_COLORS.dark);
            doc.setFont('helvetica', 'bold');
            
            const alignment = this.getCellAlignment(header, cellValue);
            let textX = currentX + 2;
            
            if (alignment === 'center') {
                textX = currentX + (width / 2);
            } else if (alignment === 'right') {
                textX = currentX + width - 2;
            }
            
            doc.text(cellValue, textX, y + 7, { align: alignment });
            
            // Borde
            doc.setLineWidth(0.3);
            doc.setDrawColor(ARVIC_COLORS.primary);
            doc.rect(currentX, y, width, 10);
            
            currentX += width;
        });
    }

    /**
     * Añadir footer
     */
    addFooter(doc) {
        const pageCount = doc.internal.getNumberOfPages();
        
        for (let i = 1; i <= pageCount; i++) {
            doc.setPage(i);
            
            const pageHeight = doc.internal.pageSize.getHeight();
            const pageWidth = doc.internal.pageSize.getWidth();
            
            // Línea superior del footer
            doc.setLineWidth(0.2);
            doc.setDrawColor(ARVIC_COLORS.gray);
            doc.line(PDF_CONFIG.margin, pageHeight - 20, pageWidth - PDF_CONFIG.margin, pageHeight - 20);
            
            // Texto del footer
            doc.setFontSize(8);
            doc.setTextColor(ARVIC_COLORS.gray);
            doc.setFont('helvetica', 'normal');
            
            // Información de la empresa
            doc.text('GRUPO IT ARVIC - Sistema de Reportes', PDF_CONFIG.margin, pageHeight - 12);
            
            // Número de página
            doc.text(`Página ${i} de ${pageCount}`, pageWidth - PDF_CONFIG.margin, pageHeight - 12, { align: 'right' });
        }
    }

    /**
     * Generar nombre de archivo
     */
    generateFileName(reportType, metadata) {
        const date = new Date();
        const dateStr = date.toISOString().split('T')[0].replace(/-/g, '');
        const timeStr = date.toTimeString().split(' ')[0].replace(/:/g, '');
        
        let baseName = 'Reporte_ARVIC';
        
        if (reportType) {
            baseName = reportType.replace(/-/g, '_').toUpperCase();
        }
        
        return `${baseName}_${dateStr}_${timeStr}.pdf`;
    }
}

// ===================================================================
// INTEGRACIÓN CON EL SISTEMA EXISTENTE
// ===================================================================

/**
 * Instancia global del exportador
 */
window.arvicPDFExporter = new ARVICPDFExporter();

/**
 * FUNCIÓN DE EXPORTACIÓN PRINCIPAL
 * Se integra directamente con el sistema existente
 */
async function exportCurrentReportToPDF() {
    if (!currentReportType || !editablePreviewData || Object.keys(editablePreviewData).length === 0) {
        window.NotificationUtils?.error('No hay datos para exportar a PDF');
        return;
    }

    try {
        // Preparar configuración del reporte
        const reportConfig = prepareReportConfigForPDF();
        
        // Preparar datos
        const tableData = prepareDataForPDF();
        
        // Preparar headers
        const tableHeaders = prepareHeadersForPDF();
        
        // Preparar metadata
        const metadata = prepareMetadataForPDF();
        
        // Exportar
        await window.arvicPDFExporter.exportToPDF(
            reportConfig,
            tableData,
            tableHeaders,
            metadata
        );
        
    } catch (error) {
        console.error('❌ Error exportando PDF:', error);
        window.NotificationUtils?.error('Error al generar PDF: ' + error.message);
    }
}

/**
 * Preparar configuración del reporte actual
 */
function prepareReportConfigForPDF() {
    const report = ARVIC_REPORTS[currentReportType];
    
    return {
        title: report.title || 'Reporte ARVIC',
        reportType: currentReportType,
        showTotals: true
    };
}

/**
 * Preparar datos del reporte actual para PDF
 */
function prepareDataForPDF() {
    return Object.values(editablePreviewData);
}

/**
 * Preparar headers del reporte actual para PDF
 */
function prepareHeadersForPDF() {
    const report = ARVIC_REPORTS[currentReportType];
    return report.structure || ['ID', 'Descripción', 'Valor'];
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
    
    if (clientFilter?.selectedOptions[0]) {
        metadata.cliente = clientFilter.selectedOptions[0].text;
    }
    
    if (consultantFilter?.selectedOptions[0]) {
        metadata.consultor = consultantFilter.selectedOptions[0].text;
    }
    
    if (supportFilter?.selectedOptions[0]) {
        metadata.soporte = supportFilter.selectedOptions[0].text;
    }
    
    if (monthFilter?.selectedOptions[0]) {
        metadata.mes = monthFilter.selectedOptions[0].text;
    }
    
    return metadata;
}

// ===================================================================
// MODIFICACIÓN DE LA INTERFAZ EXISTENTE
// ===================================================================

/**
 * Añadir botón PDF al panel de configuración existente
 * Se ejecuta cuando se crea el panel de configuración
 */
function addPDFButtonToConfigPanel() {
    // Buscar el contenedor de botones existente
    const buttonContainer = document.querySelector('.config-actions');
    
    if (buttonContainer) {
        // Crear botón PDF
        const pdfButton = document.createElement('button');
        pdfButton.className = 'btn btn-info';
        pdfButton.id = 'exportPDFBtn';
        pdfButton.innerHTML = '📄 Exportar PDF';
        pdfButton.onclick = exportCurrentReportToPDF;
        pdfButton.disabled = true; // Inicialmente deshabilitado
        
        // Insertar después del botón de Excel
        const excelButton = document.getElementById('generateBtn');
        if (excelButton) {
            excelButton.parentNode.insertBefore(pdfButton, excelButton.nextSibling);
        } else {
            buttonContainer.appendChild(pdfButton);
        }
    }
}

/**
 * Habilitar/deshabilitar botón PDF junto con otros botones
 * Modificar funciones existentes de validación
 */
function updatePDFButtonState(enabled) {
    const pdfButton = document.getElementById('exportPDFBtn');
    if (pdfButton) {
        pdfButton.disabled = !enabled;
    }
}

// ===================================================================
// HOOKS PARA INTEGRACIÓN AUTOMÁTICA
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
            }
        }, 500);
        
        return result;
    };
}

// ===================================================================
// FUNCIONES DE UTILIDAD ADICIONALES
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

/**
 * Función para previsualizar PDF (opcional)
 * Genera PDF en blob para mostrar en modal
 */
async function previewPDFInModal() {
    // Implementación futura si se requiere preview antes de descargar
    console.log('Preview PDF - Funcionalidad disponible para implementar');
}

// ===================================================================
// EXPORTAR FUNCIONES GLOBALMENTE
// ===================================================================

// Funciones principales
window.exportCurrentReportToPDF = exportCurrentReportToPDF;
window.exportTableToPDF = exportTableToPDF;
window.addPDFButtonToConfigPanel = addPDFButtonToConfigPanel;
window.updatePDFButtonState = updatePDFButtonState;

// Inicialización automática
document.addEventListener('DOMContentLoaded', function() {
    console.log('✅ Sistema de exportación PDF ARVIC cargado exitosamente');
    
    // Verificar si ya existe un panel de configuración
    const configPanel = document.getElementById('reportConfigPanel');
    if (configPanel && configPanel.style.display !== 'none') {
        addPDFButtonToConfigPanel();
    }
});

console.log('📄 ARVIC PDF Exporter v1.0 - Sistema de exportación PDF reutilizable iniciado');