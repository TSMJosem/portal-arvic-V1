/**
 * ===== SISTEMA DINÁMICO DE EXPORTACIÓN EXCEL A PDF - ARVIC =====
 * 
 * Sistema completo para convertir reportes Excel a PDF de manera dinámica
 * con branding corporativo ARVIC, adaptable a cambios de estructura
 * 
 * Características:
 * - Detección automática de estructura de datos
 * - Logo ARVIC integrado en cada página  
 * - Colores corporativos en headers
 * - Adaptable a cambios de diseño
 * - Soporte para múltiples tipos de reporte
 * 
 * Autor: Sistema ARVIC Portal
 * Versión: 1.0
 */

// ===== CONFIGURACIÓN CORPORATIVA ARVIC =====
const ARVIC_BRANDING = {
    colors: {
        primary: '#1e3a8a',        // Azul corporativo principal  
        primaryDark: '#1e40af',    // Azul oscuro
        primaryLight: '#3b82f6',   // Azul claro
        accent: '#dc2626',         // Rojo corporativo
        success: '#059669',        // Verde éxito
        warning: '#d97706',        // Naranja advertencia
        
        // Gradientes del logo
        logoBlue1: '#4FC3F7',      // Azul claro gradiente
        logoBlue2: '#2196F3',      // Azul medio gradiente  
        logoBlue3: '#1976D2',      // Azul oscuro gradiente
        
        // Neutros
        gray100: '#f1f5f9',
        gray200: '#e2e8f0', 
        gray300: '#cbd5e1',
        gray600: '#475569',
        gray800: '#1e293b'
    },
    
    fonts: {
        primary: 'Inter, Arial, sans-serif',
        title: 'Arial Black, Helvetica, sans-serif',
        mono: 'Courier New, monospace'
    },
    
    logo: {
        text: 'GRUPO IT ARVIC',
        width: 120,
        height: 60
    },
    
    margins: {
        top: 80,
        bottom: 40, 
        left: 40,
        right: 40
    }
};

// ===== DETECTOR DINÁMICO DE ESTRUCTURA =====
class ExcelStructureDetector {
    /**
     * Analiza datos de Excel y detecta automáticamente la estructura
     */
    static analyzeStructure(data, reportType) {
        const analysis = {
            reportType: reportType,
            headers: [],
            dataRows: [],
            titleRows: [],
            totalRows: [],
            columnCount: 0,
            rowCount: 0,
            hasSubtotals: false,
            specialStructure: null
        };
        
        if (!data || !Array.isArray(data) || data.length === 0) {
            console.warn('⚠️ Datos vacíos o inválidos para análisis');
            return analysis;
        }
        
        console.log(`📊 Analizando estructura para reporte: ${reportType}`);
        
        // Detectar estructura especial para reportes complejos
        if (reportType === 'remanente') {
            return this.analyzeRemanenteStructure(data);
        }
        
        // Análisis general para otros tipos de reporte
        return this.analyzeGeneralStructure(data, reportType);
    }
    
    /**
     * Analiza estructura específica de reporte remanente (semanal)
     */
    static analyzeRemanenteStructure(data) {
        const analysis = {
            reportType: 'remanente',
            headers: [],
            dataRows: [],
            titleRows: [],
            totalRows: [],
            columnCount: 0,
            rowCount: data.length,
            hasSubtotals: true,
            specialStructure: 'weekly',
            weekCount: 0
        };
        
        // Buscar filas de título y headers
        for (let i = 0; i < data.length; i++) {
            const row = data[i];
            if (!row || row.length === 0) continue;
            
            const firstCell = String(row[0] || '').trim();
            const secondCell = String(row[1] || '').trim();
            
            // Detectar fila de título
            if (firstCell.includes('REPORTE REMANENTE') || secondCell.includes('REPORTE REMANENTE')) {
                analysis.titleRows.push({ index: i, data: row, type: 'main-title' });
                analysis.columnCount = Math.max(analysis.columnCount, row.length);
                continue;
            }
            
            // Detectar información del cliente/período
            if (firstCell.includes('Cliente:') || secondCell.includes('Cliente:')) {
                analysis.titleRows.push({ index: i, data: row, type: 'info' });
                continue;
            }
            
            // Detectar headers de semanas
            if (firstCell.includes('SEMANA') || row.some(cell => String(cell).includes('SEMANA'))) {
                analysis.headers.push({ index: i, data: row, type: 'week-header' });
                // Contar semanas
                const weekMatches = row.join(' ').match(/SEMANA \d+/g);
                if (weekMatches) {
                    analysis.weekCount = Math.max(analysis.weekCount, weekMatches.length);
                }
                continue;
            }
            
            // Detectar sub-headers (MODULO, TIEMPO, TARIFA, TOTAL)
            if (row.some(cell => String(cell).includes('MODULO') || String(cell).includes('TIEMPO'))) {
                analysis.headers.push({ index: i, data: row, type: 'sub-header' });
                analysis.columnCount = Math.max(analysis.columnCount, row.length);
                continue;
            }
            
            // Detectar filas de totales
            if (firstCell.includes('TOTAL') || row.some(cell => String(cell).includes('TOTAL'))) {
                analysis.totalRows.push({ index: i, data: row, type: 'total' });
                continue;
            }
            
            // Fila de datos si tiene números
            if (row.some(cell => !isNaN(parseFloat(cell)) && isFinite(cell))) {
                analysis.dataRows.push({ index: i, data: row });
            }
        }
        
        console.log(`📅 Estructura remanente detectada: ${analysis.weekCount} semanas, ${analysis.dataRows.length} filas de datos`);
        return analysis;
    }
    
    /**
     * Analiza estructura general para reportes estándar
     */
    static analyzeGeneralStructure(data, reportType) {
        const analysis = {
            reportType: reportType,
            headers: [],
            dataRows: [],
            titleRows: [],
            totalRows: [],
            columnCount: 0,
            rowCount: data.length,
            hasSubtotals: false,
            specialStructure: null
        };
        
        for (let i = 0; i < data.length; i++) {
            const row = data[i];
            if (!row || row.length === 0) continue;
            
            analysis.columnCount = Math.max(analysis.columnCount, row.length);
            const firstCell = String(row[0] || '').trim();
            
            // Detectar títulos
            if (this.isTitleRow(row, reportType)) {
                analysis.titleRows.push({ index: i, data: row, type: 'title' });
                continue;
            }
            
            // Detectar headers (columnas como ID Empresa, Consultor, etc.)
            if (this.isHeaderRow(row)) {
                analysis.headers.push({ index: i, data: row, type: 'header' });
                continue;
            }
            
            // Detectar totales
            if (firstCell.includes('TOTAL') || row.some(cell => String(cell).includes('TOTAL'))) {
                analysis.totalRows.push({ index: i, data: row, type: 'total' });
                continue;
            }
            
            // Fila de datos (contiene información numérica)
            if (this.isDataRow(row)) {
                analysis.dataRows.push({ index: i, data: row });
            }
        }
        
        console.log(`📋 Estructura ${reportType} detectada: ${analysis.headers.length} headers, ${analysis.dataRows.length} filas de datos`);
        return analysis;
    }
    
    /**
     * Determina si una fila es un título
     */
    static isTitleRow(row, reportType) {
        const text = row.join(' ').toUpperCase();
        
        const titleKeywords = [
            'RESUMEN DE PAGO', 'PAGO A CONSULTOR', 'CLIENTE:', 'PROYECTO:',
            'REPORTE', 'CONSULTOR:', 'SOPORTE:', 'ACTIVIDADES'
        ];
        
        return titleKeywords.some(keyword => text.includes(keyword));
    }
    
    /**
     * Determina si una fila contiene headers de columna
     */
    static isHeaderRow(row) {
        const text = row.join(' ').toUpperCase();
        
        const headerKeywords = [
            'ID EMPRESA', 'CONSULTOR', 'SOPORTE', 'MODULO', 'TIEMPO',
            'TARIFA', 'TOTAL', 'EMPRESA', 'PROYECTO'
        ];
        
        return headerKeywords.some(keyword => text.includes(keyword));
    }
    
    /**
     * Determina si una fila contiene datos
     */
    static isDataRow(row) {
        // Una fila de datos debe tener al menos un número y algún texto
        const hasNumber = row.some(cell => !isNaN(parseFloat(cell)) && isFinite(cell) && cell !== '');
        const hasText = row.some(cell => String(cell).trim().length > 0);
        
        return hasNumber && hasText;
    }
}

// ===== GENERADOR DINÁMICO DE PDF =====
class ARVICPDFGenerator {
    constructor() {
        // Verificar si jsPDF está disponible
        if (typeof window.jsPDF === 'undefined') {
            console.error('❌ jsPDF no está disponible. Incluye la librería jsPDF.');
            throw new Error('jsPDF library is required');
        }
        
        this.jsPDF = window.jsPDF;
        this.currentY = ARVIC_BRANDING.margins.top;
        this.pageHeight = 297; // A4 height en mm
        this.pageWidth = 210;  // A4 width en mm
        this.lineHeight = 6;
    }
    
    /**
     * Genera PDF desde datos de Excel con estructura dinámica
     */
    generatePDF(excelData, reportType, options = {}) {
        console.log('🚀 Iniciando generación de PDF dinámico ARVIC...');
        
        // Analizar estructura automáticamente
        const structure = ExcelStructureDetector.analyzeStructure(excelData, reportType);
        
        if (!structure || structure.dataRows.length === 0) {
            console.error('❌ No se pudo analizar la estructura o no hay datos');
            return null;
        }
        
        // Crear documento PDF
        const doc = new this.jsPDF('p', 'mm', 'a4');
        
        // Configurar fuentes y colores
        this.setupDocument(doc);
        
        // Agregar logo y header corporativo
        this.addARVICHeader(doc, reportType, options);
        
        // Generar contenido según estructura detectada
        this.generateContent(doc, structure, options);
        
        // Agregar footer corporativo
        this.addARVICFooter(doc);
        
        // Generar nombre de archivo
        const fileName = this.generateFileName(reportType, options);
        
        // Descargar PDF
        doc.save(fileName);
        
        console.log('✅ PDF generado exitosamente:', fileName);
        return fileName;
    }
    
    /**
     * Configura el documento PDF con estilos ARVIC
     */
    setupDocument(doc) {
        // Configurar metadatos
        doc.setProperties({
            title: 'Reporte GRUPO IT ARVIC',
            author: 'GRUPO IT ARVIC',
            creator: 'Portal ARVIC',
            keywords: 'reporte, arvic, excel, pdf'
        });
        
        // Reset posición inicial
        this.currentY = ARVIC_BRANDING.margins.top;
    }
    
    /**
     * Agrega header corporativo con logo ARVIC
     */
    addARVICHeader(doc, reportType, options) {
        const startY = 20;
        
        // === LOGO ARVIC (Recreación vectorial) ===
        // Círculo azul con gradiente
        const logoX = 20;
        const logoY = startY;
        const logoSize = 25;
        
        // Círculo base con color del gradiente
        doc.setFillColor(65, 195, 247); // Color base del gradiente
        doc.circle(logoX + logoSize/2, logoY + logoSize/2, logoSize/2, 'F');
        
        // Letra A en el centro
        doc.setFontSize(16);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(255, 255, 255); // Blanco
        doc.text('A', logoX + logoSize/2 - 3, logoY + logoSize/2 + 3);
        
        // Texto "GRUPO IT ARVIC"
        const textX = logoX + logoSize + 10;
        
        doc.setFontSize(8);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(136, 136, 136); // Gris
        doc.text('GRUPO IT', textX, logoY + 8);
        
        doc.setFontSize(18);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(25, 118, 210); // Azul corporativo
        doc.text('ARVIC', textX, logoY + 20);
        
        // === INFORMACIÓN DEL REPORTE ===
        const infoX = 130;
        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(71, 85, 105); // Gris oscuro
        
        // Título del reporte
        const reportName = this.getReportDisplayName(reportType);
        doc.setFont('helvetica', 'bold');
        doc.text(reportName, infoX, logoY + 8);
        
        // Fecha de generación
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(8);
        doc.text(`Generado: ${new Date().toLocaleDateString('es-ES')}`, infoX, logoY + 15);
        doc.text(`Hora: ${new Date().toLocaleTimeString('es-ES')}`, infoX, logoY + 20);
        
        // Línea separadora con color corporativo
        doc.setDrawColor(30, 58, 138); // Azul corporativo
        doc.setLineWidth(0.8);
        doc.line(20, startY + 30, 190, startY + 30);
        
        // Actualizar posición Y
        this.currentY = startY + 40;
    }
    
    /**
     * Genera contenido según estructura detectada
     */
    generateContent(doc, structure, options) {
        console.log('📄 Generando contenido con estructura:', structure.specialStructure || 'standard');
        
        // Generar según tipo de estructura
        if (structure.specialStructure === 'weekly') {
            this.generateWeeklyContent(doc, structure, options);
        } else {
            this.generateStandardContent(doc, structure, options);
        }
    }
    
    /**
     * Genera contenido para reportes con estructura semanal (remanente)
     */
    generateWeeklyContent(doc, structure, options) {
        // Agregar títulos informativos
        structure.titleRows.forEach(titleRow => {
            if (titleRow.type === 'info') {
                this.addInfoRow(doc, titleRow.data);
            }
        });
        
        this.currentY += 10; // Espacio después de info
        
        // Crear tabla dinámica para estructura semanal
        this.createWeeklyTable(doc, structure, options);
    }
    
    /**
     * Genera contenido para reportes con estructura estándar
     */
    generateStandardContent(doc, structure, options) {
        // Agregar títulos si existen
        structure.titleRows.forEach(titleRow => {
            this.addTitleRow(doc, titleRow.data, titleRow.type);
        });
        
        if (structure.titleRows.length > 0) {
            this.currentY += 8; // Espacio después de títulos
        }
        
        // Crear tabla estándar
        this.createStandardTable(doc, structure, options);
    }
    
    /**
     * Crea tabla con estructura semanal adaptativa
     */
    createWeeklyTable(doc, structure, options) {
        if (structure.headers.length === 0) {
            console.warn('⚠️ No hay headers para tabla semanal');
            return;
        }
        
        // Obtener headers principales
        const mainHeaders = structure.headers.find(h => h.type === 'week-header');
        const subHeaders = structure.headers.find(h => h.type === 'sub-header');
        
        if (!mainHeaders || !subHeaders) {
            console.warn('⚠️ Headers de semana incompletos');
            return;
        }
        
        // Configurar columnas dinámicamente
        const totalWidth = 170; // Ancho total disponible
        const firstColWidth = 30; // Columna "Total Horas"
        const weekWidth = (totalWidth - firstColWidth) / structure.weekCount;
        const subColWidth = weekWidth / 4; // MODULO, TIEMPO, TARIFA, TOTAL
        
        let startX = 20;
        
        // === HEADERS PRINCIPALES (SEMANAS) ===
        this.currentY += 5;
        doc.setFillColor(30, 58, 138); // Azul corporativo
        doc.setTextColor(255, 255, 255); // Texto blanco
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(9);
        
        // Primera columna
        doc.rect(startX, this.currentY, firstColWidth, 8, 'F');
        doc.text('Total Horas', startX + 2, this.currentY + 5);
        
        let currentX = startX + firstColWidth;
        
        // Columnas de semanas
        for (let week = 1; week <= structure.weekCount; week++) {
            doc.rect(currentX, this.currentY, weekWidth, 8, 'F');
            doc.text(`SEMANA ${week}`, currentX + weekWidth/2 - 10, this.currentY + 5);
            currentX += weekWidth;
        }
        
        this.currentY += 8;
        
        // === SUB-HEADERS ===
        doc.setFillColor(59, 130, 246); // Azul más claro
        
        // Primera columna vacía
        doc.rect(startX, this.currentY, firstColWidth, 6, 'F');
        
        currentX = startX + firstColWidth;
        
        // Sub-headers para cada semana
        for (let week = 1; week <= structure.weekCount; week++) {
            const subHeaders = ['MÓDULO', 'TIEMPO', 'TARIFA', 'TOTAL'];
            subHeaders.forEach((header, index) => {
                doc.rect(currentX + (index * subColWidth), this.currentY, subColWidth, 6, 'F');
                doc.setFontSize(7);
                doc.text(header, currentX + (index * subColWidth) + 1, this.currentY + 4);
            });
            currentX += weekWidth;
        }
        
        this.currentY += 6;
        
        // === FILAS DE DATOS ===
        doc.setTextColor(71, 85, 105); // Texto gris oscuro
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(8);
        
        structure.dataRows.forEach((dataRow, index) => {
            // Verificar espacio en página
            if (this.currentY > this.pageHeight - 40) {
                doc.addPage();
                this.addARVICHeader(doc, structure.reportType, options);
            }
            
            // Color alternado para filas
            if (index % 2 === 0) {
                doc.setFillColor(248, 250, 252); // Gris muy claro
                doc.rect(startX, this.currentY, totalWidth, 6, 'F');
            }
            
            // Dibujar datos de la fila
            this.drawWeeklyDataRow(doc, dataRow.data, startX, firstColWidth, weekWidth, subColWidth, structure.weekCount);
            this.currentY += 6;
        });
        
        // === TOTALES ===
        if (structure.totalRows.length > 0) {
            this.currentY += 5;
            doc.setFillColor(220, 38, 38); // Rojo corporativo
            doc.setTextColor(255, 255, 255);
            doc.setFont('helvetica', 'bold');
            
            structure.totalRows.forEach(totalRow => {
                doc.rect(startX, this.currentY, totalWidth, 8, 'F');
                doc.text('TOTALES', startX + 2, this.currentY + 5);
                // Agregar valores de totales...
                this.currentY += 8;
            });
        }
    }
    
    /**
     * Crea tabla con estructura estándar adaptativa
     */
    createStandardTable(doc, structure, options) {
        if (structure.headers.length === 0) {
            console.warn('⚠️ No hay headers para tabla estándar');
            return;
        }
        
        const headerRow = structure.headers[0];
        const columns = headerRow.data.filter(cell => cell && String(cell).trim() !== '');
        const columnCount = columns.length;
        
        // Calcular anchos de columna dinámicamente
        const totalWidth = 170;
        const columnWidth = totalWidth / columnCount;
        const startX = 20;
        
        // === HEADER ===
        doc.setFillColor(30, 58, 138); // Azul corporativo
        doc.setTextColor(255, 255, 255);
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(9);
        
        columns.forEach((header, index) => {
            const x = startX + (index * columnWidth);
            doc.rect(x, this.currentY, columnWidth, 8, 'F');
            
            // Ajustar texto al ancho de columna
            const text = String(header).substring(0, 15); // Limitar texto
            doc.text(text, x + 1, this.currentY + 5);
        });
        
        this.currentY += 8;
        
        // === FILAS DE DATOS ===
        doc.setTextColor(71, 85, 105);
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(8);
        
        structure.dataRows.forEach((dataRow, index) => {
            // Verificar espacio en página
            if (this.currentY > this.pageHeight - 40) {
                doc.addPage();
                this.addARVICHeader(doc, structure.reportType, options);
            }
            
            // Color alternado
            if (index % 2 === 0) {
                doc.setFillColor(248, 250, 252);
                doc.rect(startX, this.currentY, totalWidth, 6, 'F');
            }
            
            // Dibujar celdas de datos
            dataRow.data.slice(0, columnCount).forEach((cell, colIndex) => {
                const x = startX + (colIndex * columnWidth);
                const text = String(cell || '').substring(0, 20);
                
                // Formato especial para números
                if (!isNaN(parseFloat(cell)) && isFinite(cell)) {
                    doc.setFont('helvetica', 'bold');
                    if (cell > 1000) {
                        doc.text(`$${parseFloat(cell).toFixed(2)}`, x + 1, this.currentY + 4);
                    } else {
                        doc.text(parseFloat(cell).toFixed(2), x + 1, this.currentY + 4);
                    }
                    doc.setFont('helvetica', 'normal');
                } else {
                    doc.text(text, x + 1, this.currentY + 4);
                }
            });
            
            this.currentY += 6;
        });
        
        // === TOTALES ===
        if (structure.totalRows.length > 0) {
            this.currentY += 5;
            doc.setFillColor(220, 38, 38); // Rojo corporativo
            doc.setTextColor(255, 255, 255);
            doc.setFont('helvetica', 'bold');
            doc.setFontSize(9);
            
            structure.totalRows.forEach(totalRow => {
                doc.rect(startX, this.currentY, totalWidth, 8, 'F');
                
                totalRow.data.slice(0, columnCount).forEach((cell, colIndex) => {
                    const x = startX + (colIndex * columnWidth);
                    const text = String(cell || '');
                    
                    if (text.includes('TOTAL') || text.includes('Total')) {
                        doc.text(text, x + 1, this.currentY + 5);
                    } else if (!isNaN(parseFloat(cell)) && isFinite(cell)) {
                        doc.text(`$${parseFloat(cell).toFixed(2)}`, x + 1, this.currentY + 5);
                    }
                });
                
                this.currentY += 8;
            });
        }
    }
    
    /**
     * Dibuja una fila de datos para estructura semanal
     */
    drawWeeklyDataRow(doc, rowData, startX, firstColWidth, weekWidth, subColWidth, weekCount) {
        // Primera columna (total de horas)
        const totalHours = rowData[0] || '0';
        doc.text(String(totalHours), startX + 2, this.currentY + 4);
        
        let currentX = startX + firstColWidth;
        let dataIndex = 1;
        
        // Datos por semana
        for (let week = 1; week <= weekCount; week++) {
            for (let subCol = 0; subCol < 4; subCol++) {
                const cellData = rowData[dataIndex] || '';
                const x = currentX + (subCol * subColWidth);
                
                // Formato especial para números
                if (!isNaN(parseFloat(cellData)) && isFinite(cellData)) {
                    if (subCol === 2 || subCol === 3) { // TARIFA o TOTAL
                        doc.text(`$${parseFloat(cellData).toFixed(2)}`, x + 1, this.currentY + 4);
                    } else {
                        doc.text(parseFloat(cellData).toFixed(1), x + 1, this.currentY + 4);
                    }
                } else {
                    doc.text(String(cellData).substring(0, 8), x + 1, this.currentY + 4);
                }
                
                dataIndex++;
            }
            currentX += weekWidth;
        }
    }
    
    /**
     * Agrega fila informativa
     */
    addInfoRow(doc, rowData) {
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(10);
        doc.setTextColor(30, 58, 138);
        
        const infoText = rowData.join(' ').replace(/,+/g, ', ').trim();
        doc.text(infoText, 20, this.currentY);
        this.currentY += 6;
    }
    
    /**
     * Agrega fila de título
     */
    addTitleRow(doc, rowData, type) {
        if (type === 'title') {
            doc.setFont('helvetica', 'bold');
            doc.setFontSize(12);
            doc.setTextColor(220, 38, 38); // Rojo corporativo
            
            const title = rowData.join(' ').replace(/,+/g, '').trim();
            doc.text(title, 20, this.currentY);
            this.currentY += 8;
        }
    }
    
    /**
     * Agrega footer corporativo
     */
    addARVICFooter(doc) {
        const footerY = this.pageHeight - 20;
        
        // Línea separadora
        doc.setDrawColor(203, 213, 225);
        doc.setLineWidth(0.5);
        doc.line(20, footerY - 5, 190, footerY - 5);
        
        // Texto del footer
        doc.setFontSize(8);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(100, 116, 139);
        
        doc.text('GRUPO IT ARVIC - Portal de Gestión', 20, footerY);
        doc.text(`Página ${doc.internal.getNumberOfPages()}`, 150, footerY);
        doc.text(new Date().toLocaleDateString('es-ES'), 170, footerY);
    }
    
    /**
     * Genera nombre de archivo único
     */
    generateFileName(reportType, options) {
        const now = new Date();
        const dateStr = now.toISOString().slice(0, 10).replace(/-/g, '');
        const timeStr = now.toTimeString().slice(0, 5).replace(':', '');
        
        const reportNames = {
            'pago-consultor-general': 'PagoConsultor',
            'pago-consultor-especifico': 'PagoConsultorEsp',
            'cliente-soporte': 'ClienteSoporte',
            'remanente': 'Remanente',
            'proyecto-general': 'ProyectoGeneral',
            'proyecto-cliente': 'ProyectoCliente',
            'proyecto-consultor': 'ProyectoConsultor'
        };
        
        const baseName = reportNames[reportType] || 'Reporte';
        return `${baseName}_ARVIC_${dateStr}_${timeStr}.pdf`;
    }
    
    /**
     * Obtiene nombre legible del reporte
     */
    getReportDisplayName(reportType) {
        const displayNames = {
            'pago-consultor-general': 'Reporte de Pago a Consultor (General)',
            'pago-consultor-especifico': 'Reporte de Pago a Consultor',
            'cliente-soporte': 'Reporte de Cliente Soporte',
            'remanente': 'Reporte Remanente por Semanas',
            'proyecto-general': 'Reporte de Proyecto General',
            'proyecto-cliente': 'Reporte de Proyecto (Cliente)',
            'proyecto-consultor': 'Reporte de Proyecto (Consultor)'
        };
        
        return displayNames[reportType] || 'Reporte ARVIC';
    }
}

// ===== INTEGRACIÓN CON EL SISTEMA EXISTENTE =====

/**
 * Función principal para exportar Excel existente a PDF
 * Se integra con el sistema actual de reportes
 */
function exportExcelToPDF(reportType, options = {}) {
    console.log('🔄 Iniciando exportación Excel → PDF para:', reportType);
    
    try {
        // Verificar que existan datos editables del reporte actual
        if (!editablePreviewData || Object.keys(editablePreviewData).length === 0) {
            window.NotificationUtils?.error('No hay datos de reporte disponibles para exportar a PDF');
            return;
        }
        
        // Convertir datos editables a formato de array para análisis
        const excelData = convertEditableDataToExcelArray(editablePreviewData, reportType);
        
        if (!excelData || excelData.length === 0) {
            window.NotificationUtils?.error('Error al procesar los datos para PDF');
            return;
        }
        
        // Crear instancia del generador PDF
        const pdfGenerator = new ARVICPDFGenerator();
        
        // Generar PDF
        const fileName = pdfGenerator.generatePDF(excelData, reportType, options);
        
        if (fileName) {
            // Guardar en historial si la función existe
            if (typeof saveToReportHistory === 'function') {
                const reportData = calculateReportTotals(editablePreviewData);
                saveToReportHistory(fileName.replace('.pdf', ''), `${reportType}-pdf`, reportData.totalHours, reportData.totalAmount);
            }
            
            window.NotificationUtils?.success(`PDF generado exitosamente: ${fileName}`);
        }
        
    } catch (error) {
        console.error('❌ Error al generar PDF:', error);
        window.NotificationUtils?.error(`Error al generar PDF: ${error.message}`);
    }
}

/**
 * Convierte datos editables del portal a formato array para análisis
 */
function convertEditableDataToExcelArray(editableData, reportType) {
    console.log('🔧 Convirtiendo datos editables a array para:', reportType);
    
    const dataArray = [];
    
    // Agregar títulos según tipo de reporte
    const reportTitles = getReportTitles(reportType);
    reportTitles.forEach(title => dataArray.push(title));
    
    // Agregar headers según tipo de reporte  
    const headers = getReportHeaders(reportType);
    if (headers.length > 0) {
        dataArray.push(headers);
    }
    
    // Convertir datos editables a filas
    Object.values(editableData).forEach(row => {
        const dataRow = convertRowToArray(row, reportType);
        if (dataRow.length > 0) {
            dataArray.push(dataRow);
        }
    });
    
    // Agregar fila de totales si es necesario
    const totalsRow = calculateAndFormatTotals(editableData, reportType);
    if (totalsRow.length > 0) {
        dataArray.push(totalsRow);
    }
    
    console.log(`📊 Array generado con ${dataArray.length} filas para tipo: ${reportType}`);
    return dataArray;
}

/**
 * Obtiene títulos según tipo de reporte
 */
function getReportTitles(reportType) {
    const currentDate = new Date().toLocaleDateString('es-ES');
    
    switch (reportType) {
        case 'pago-consultor-general':
            return [['', '', '', 'RESUMEN DE PAGO A CONSULTOR', '', '', '']];
            
        case 'pago-consultor-especifico':
            const consultantName = document.getElementById('consultantFilter')?.selectedOptions[0]?.text || 'Consultor';
            return [
                ['', '', '', 'PAGO A CONSULTOR', '', '', ''],
                ['', `CONSULTOR: ${consultantName}`, '', '', '', '', '']
            ];
            
        case 'cliente-soporte':
            const clientName = document.getElementById('clientFilter')?.selectedOptions[0]?.text || 'Cliente';
            return [['', `Cliente: ${clientName}`, '', '', '']];
            
        case 'remanente':
            const month = document.getElementById('monthFilter')?.selectedOptions[0]?.text || 'Mes';
            const client = document.getElementById('clientFilter')?.selectedOptions[0]?.text || 'Cliente';
            const support = document.getElementById('supportTypeFilter')?.selectedOptions[0]?.text || 'Soporte';
            
            return [
                ['', '', '', 'REPORTE REMANENTE - SOPORTES', '', '', ''],
                ['', `Cliente: ${client}`, `Soporte: ${support}`, `Mes: ${month}`, '', '', '']
            ];
            
        default:
            return [['', '', `Reporte: ${reportType}`, '', '', '']];
    }
}

/**
 * Obtiene headers según tipo de reporte
 */
function getReportHeaders(reportType) {
    switch (reportType) {
        case 'pago-consultor-general':
        case 'pago-consultor-especifico':
            return ['ID Empresa', 'Consultor', 'Soporte', 'Módulo', 'TIEMPO', 'TARIFA de Módulo', 'TOTAL'];
            
        case 'cliente-soporte':
            return ['Soporte', 'Módulo', 'TIEMPO', 'TARIFA de Módulo', 'TOTAL'];
            
        case 'proyecto-general':
        case 'proyecto-consultor':
            return ['ID Empresa', 'Consultor', 'Módulo', 'TIEMPO', 'TARIFA de Módulo', 'TOTAL'];
            
        case 'proyecto-cliente':
            return ['Módulo', 'TIEMPO', 'TARIFA de Módulo', 'TOTAL'];
            
        case 'remanente':
            // Para remanente, la estructura es más compleja y se detecta dinámicamente
            return ['Total de Horas', 'SEMANA 1', 'SEMANA 2', 'SEMANA 3', 'SEMANA 4'];
            
        default:
            return [];
    }
}

/**
 * Convierte una fila de datos editables a array
 */
function convertRowToArray(row, reportType) {
    switch (reportType) {
        case 'pago-consultor-general':
        case 'pago-consultor-especifico':
            return [
                row.idEmpresa || 'N/A',
                row.consultor || 'N/A',
                row.soporte || 'N/A',
                row.modulo || 'N/A',
                parseFloat(row.editedTime || row.tiempo || 0),
                parseFloat(row.editedTariff || row.tarifa || 0),
                parseFloat(row.editedTotal || row.total || 0)
            ];
            
        case 'cliente-soporte':
            return [
                row.soporte || 'N/A',
                row.modulo || 'N/A',
                parseFloat(row.editedTime || row.tiempo || 0),
                parseFloat(row.editedTariff || row.tarifa || 0),
                parseFloat(row.editedTotal || row.total || 0)
            ];
            
        case 'proyecto-general':
        case 'proyecto-consultor':
            return [
                row.idEmpresa || 'N/A',
                row.consultor || 'N/A',
                row.modulo || 'N/A',
                parseFloat(row.editedTime || row.tiempo || 0),
                parseFloat(row.editedTariff || row.tarifa || 0),
                parseFloat(row.editedTotal || row.total || 0)
            ];
            
        case 'proyecto-cliente':
            return [
                row.modulo || 'N/A',
                parseFloat(row.editedTime || row.tiempo || 0),
                parseFloat(row.editedTariff || row.tarifa || 0),
                parseFloat(row.editedTotal || row.total || 0)
            ];
            
        case 'remanente':
            // Estructura semanal compleja - se maneja dinámicamente
            const weeklyData = [row.totalHoras || 0];
            
            // Agregar datos de cada semana si existen
            for (let week = 1; week <= 4; week++) {
                const semanaData = row[`semana${week}`];
                if (semanaData) {
                    weeklyData.push(
                        semanaData.modulo || '',
                        parseFloat(semanaData.tiempo || 0),
                        parseFloat(semanaData.tarifa || 0),
                        parseFloat(semanaData.total || 0)
                    );
                } else {
                    weeklyData.push('', 0, 0, 0);
                }
            }
            
            return weeklyData;
            
        default:
            return Object.values(row);
    }
}

/**
 * Calcula y formatea fila de totales
 */
function calculateAndFormatTotals(editableData, reportType) {
    const data = Object.values(editableData);
    let totalHours = 0;
    let totalAmount = 0;
    
    data.forEach(row => {
        totalHours += parseFloat(row.editedTime || row.tiempo || 0);
        totalAmount += parseFloat(row.editedTotal || row.total || 0);
    });
    
    switch (reportType) {
        case 'pago-consultor-general':
        case 'pago-consultor-especifico':
            return ['', '', '', 'TOTALES', totalHours, '', totalAmount];
            
        case 'cliente-soporte':
        case 'proyecto-cliente':
            return ['TOTALES', totalHours, '', totalAmount];
            
        case 'proyecto-general':
        case 'proyecto-consultor':
            return ['', '', 'TOTALES', totalHours, '', totalAmount];
            
        case 'remanente':
            return ['TOTAL GENERAL', totalHours, '', '', totalAmount];
            
        default:
            return ['TOTALES', totalHours, totalAmount];
    }
}

/**
 * Calcula totales de un reporte
 */
function calculateReportTotals(editableData) {
    const data = Object.values(editableData);
    
    return {
        recordCount: data.length,
        totalHours: data.reduce((sum, row) => sum + parseFloat(row.editedTime || row.tiempo || 0), 0),
        totalAmount: data.reduce((sum, row) => sum + parseFloat(row.editedTotal || row.total || 0), 0)
    };
}

// ===== FUNCIONES DE UTILIDAD PARA LA INTEGRACIÓN =====

/**
 * Agrega botón de exportar PDF a la interfaz existente
 */
function addPDFExportButton(reportType) {
    const buttonContainer = document.querySelector('.export-buttons') || document.querySelector('.action-buttons');
    
    if (!buttonContainer) {
        console.warn('⚠️ No se encontró contenedor para botón PDF');
        return;
    }
    
    // Verificar si ya existe el botón
    if (buttonContainer.querySelector('.pdf-export-btn')) {
        return;
    }
    
    const pdfButton = document.createElement('button');
    pdfButton.className = 'btn btn-primary pdf-export-btn';
    pdfButton.innerHTML = '📄 Exportar PDF';
    pdfButton.onclick = () => exportExcelToPDF(reportType);
    
    buttonContainer.appendChild(pdfButton);
}

/**
 * Inicializa el sistema de exportación PDF en el portal
 */
function initializePDFExportSystem() {
    console.log('🚀 Inicializando Sistema de Exportación PDF - ARVIC');
    
    // Verificar dependencias
    if (typeof window.jsPDF === 'undefined') {
        console.error('❌ jsPDF no está disponible. Agregue la siguiente línea al HTML:');
        console.error('<script src="https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js"></script>');
        return false;
    }
    
    // Agregar estilos CSS para botones PDF
    const pdfStyles = `
        .pdf-export-btn {
            background: linear-gradient(135deg, #dc2626, #b91c1c) !important;
            border: none !important;
            color: white !important;
            box-shadow: 0 4px 6px rgba(220, 38, 38, 0.3) !important;
            transition: all 0.3s ease !important;
        }
        
        .pdf-export-btn:hover {
            background: linear-gradient(135deg, #b91c1c, #991b1b) !important;
            transform: translateY(-2px) !important;
            box-shadow: 0 6px 12px rgba(220, 38, 38, 0.4) !important;
        }
        
        .export-section {
            background: linear-gradient(135deg, #f8fafc, #e2e8f0);
            border: 1px solid #cbd5e1;
            border-radius: 8px;
            padding: 20px;
            margin: 20px 0;
        }
        
        .export-section h3 {
            color: #1e3a8a;
            margin-bottom: 15px;
            font-weight: 600;
        }
    `;
    
    // Agregar estilos al documento
    const styleSheet = document.createElement('style');
    styleSheet.textContent = pdfStyles;
    document.head.appendChild(styleSheet);
    
    console.log('✅ Sistema de Exportación PDF inicializado correctamente');
    return true;
}

// ===== AUTO-INICIALIZACIÓN =====
if (typeof document !== 'undefined') {
    document.addEventListener('DOMContentLoaded', function() {
        // Esperar un poco para asegurar que otras librerías estén cargadas
        setTimeout(initializePDFExportSystem, 1000);
    });
}

// ===== EXPORTAR FUNCIONES GLOBALES =====
window.ARVICPDFGenerator = ARVICPDFGenerator;
window.exportExcelToPDF = exportExcelToPDF;
window.addPDFExportButton = addPDFExportButton;
window.initializePDFExportSystem = initializePDFExportSystem;

console.log('📋 Sistema Dinámico de Exportación Excel a PDF - ARVIC cargado exitosamente');