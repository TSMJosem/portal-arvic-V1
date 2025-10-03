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

const ARVIC_LOGO_URL = '../images/Logo-Grupo-IT-Arvic-22.png';

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

const PDF_CONFIG_OPTIMIZED = {
    ...PDF_CONFIG, // Mantener configuración existente
    dataFontSize: 9,     // Reducido de 10 a 9 para más contenido
    headerFontSize: 10,  // Reducido de 11 a 10
    margin: 15,          // Reducido de 20 a 15 para más espacio
    headerHeight: 45     // Reducido de 50 a 45
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
        
        console.log('🎯 Iniciando exportación PDF optimizada:', {
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
        
        // Añadir tabla con datos (ya incluye footers en cada página)
        this.addDataTable(doc, data, headers, config);
        
        // NOTA: No llamar addFooter aquí porque ya se llama en addDataTable
        
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
        this.addARVICLogo(doc, 25, 22);
        
        // === TÍTULO PRINCIPAL (centro) ===
        const titleText = this.getTitleByReportType(config.reportType);
        doc.setTextColor(ARVIC_COLORS.primary);
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(PDF_CONFIG.titleFontSize);
        doc.text(titleText, pageWidth / 2, 30, { align: 'center' });
        
        // Subtítulo empresa
        doc.setTextColor(ARVIC_COLORS.textGray);
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(PDF_CONFIG.subtitleFontSize);
        doc.text('GRUPO IT ARVIC', pageWidth / 2, 40, { align: 'center' });
        
        // === LÍNEA SEPARADORA ===
        doc.setDrawColor(ARVIC_COLORS.primary);
        doc.setLineWidth(0.8);
        doc.line(PDF_CONFIG.margin, 48, pageWidth - PDF_CONFIG.margin, 48);
        
        // === METADATA COMPLETA (pasando reportType) ===
        this.addCompleteMetadataSection(doc, metadata, 52, config.reportType);
    }

    addSimpleLogoFallback(doc, x, y) {
        // Círculo azul
        doc.setFillColor(ARVIC_COLORS.primary);
        doc.circle(x, y, 15, 'F');
        
        // Letra "A" blanca
        doc.setTextColor(ARVIC_COLORS.white);
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(20);
        doc.text('A', x, y + 5, { align: 'center' });
        
        // Texto al lado
        doc.setTextColor(ARVIC_COLORS.black);
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(8);
        doc.text('GRUPO IT', x + 20, y - 5);
        
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(16);
        doc.text('ARVIC', x + 20, y + 8);
    }

    /**
     * Añadir logo real de ARVIC (replicando el diseño exacto)
     */
    addARVICLogo(doc, x, y) {
        try {
            // El logo completo incluye el círculo + texto
            // Tamaño ajustado para que se vea bien (puedes modificar el ancho/alto)
            const logoWidth = 70;  
            const logoHeight = 27; 
            
            doc.addImage(
                ARVIC_LOGO_URL, 
                'PNG', 
                x - 10,           // Posición X (ajusta si necesitas)
                y - 10,           // Posición Y (ajusta si necesitas)
                logoWidth, 
                logoHeight
            );
        } catch (error) {
            console.error('❌ Error cargando logo:', error);
            // Fallback: usar logo simple si falla
            this.addSimpleLogoFallback(doc, x, y);
        }
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
    addCompleteMetadataSection(doc, metadata, startY, reportType) {
        const pageWidth = doc.internal.pageSize.getWidth();
        let yPos = startY;
        
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(PDF_CONFIG.metadataFontSize);
        doc.setTextColor(ARVIC_COLORS.textGray);
        
        // Determinar qué información mostrar según el tipo de reporte
        const shouldShowCliente = this.shouldShowClienteInfo(reportType, metadata);
        const shouldShowConsultor = this.shouldShowConsultorInfo(reportType, metadata);
        
        let leftSideLines = [];
        
        // === LADO IZQUIERDO (información de filtros) ===
        
        // Cliente (solo si debe mostrarse)
        if (shouldShowCliente) {
            const clienteText = (metadata.cliente && metadata.cliente !== 'Todos los clientes') 
                ? `Cliente: ${metadata.cliente}` 
                : 'Cliente: N/A';
            leftSideLines.push(clienteText);
        }
        
        // Consultor (solo si debe mostrarse)  
        if (shouldShowConsultor) {
            const consultorText = (metadata.consultor && metadata.consultor !== 'Todos los consultores') 
                ? `Consultor: ${metadata.consultor}` 
                : 'Consultor: N/A';
            leftSideLines.push(consultorText);
        }
        
        // Dibujar líneas del lado izquierdo
        leftSideLines.forEach((line, index) => {
            doc.text(line, PDF_CONFIG.margin, yPos + (index * 4));
        });
        
        // === LADO DERECHO ===
        const fecha = new Date().toLocaleDateString('es-MX', {
            day: 'numeric',
            month: 'long',
            year: 'numeric'
        });
        doc.text(`Generado: ${fecha}`, pageWidth - PDF_CONFIG.margin, yPos, { align: 'right' });
        
        // Período (con texto mejorado)
        const periodoText = (metadata.mes && metadata.mes !== 'Todos los períodos') 
            ? `Período: ${metadata.mes}` 
            : 'Período: No seleccionado'; // CAMBIADO: ya no dice "N/A"
        doc.text(periodoText, pageWidth - PDF_CONFIG.margin, yPos + 4, { align: 'right' });
    }

    /**
     * NUEVA FUNCIÓN: Determinar si mostrar información de Cliente
     */
    shouldShowClienteInfo(reportType, metadata) {
        // Reportes que NO deben mostrar "Cliente N/A":
        const reportesOmitirCliente = [
            'pago-consultor-general',    // Reporte General de Pagos
            'pago-consultor-especifico', // Reporte De Pago A Consultor  
            'proyecto-general',          // Reporte General de Proyectos
            'proyecto-consultor'         // Reporte De Consultor - Proyectos
        ];
        
        // Si es un reporte que debe omitir cliente Y no hay cliente seleccionado, no mostrar
        if (reportesOmitirCliente.includes(reportType)) {
            // Solo mostrar si hay un cliente específico seleccionado
            return metadata.cliente && metadata.cliente !== 'Todos los clientes';
        }
        
        // Para otros reportes, mostrar siempre
        return true;
    }

    /**
     * NUEVA FUNCIÓN: Determinar si mostrar información de Consultor
     */
    shouldShowConsultorInfo(reportType, metadata) {
        // Reportes que NO deben mostrar "Consultor N/A":
        const reportesOmitirConsultor = [
            'pago-consultor-general',  // Reporte General de Pagos
            'cliente-soporte',         // Reporte De Soporte Al Cliente
            'proyecto-general',        // Reporte General de Proyectos  
            'proyecto-cliente'         // Reporte De Proyecto (Cliente)
        ];
        
        // Si es un reporte que debe omitir consultor Y no hay consultor seleccionado, no mostrar
        if (reportesOmitirConsultor.includes(reportType)) {
            // Solo mostrar si hay un consultor específico seleccionado
            return metadata.consultor && metadata.consultor !== 'Todos los consultores';
        }
        
        // Para otros reportes, mostrar siempre
        return true;
    }

    /**
     * Añadir tabla de datos con mejor separación entre totales y mensaje
     */
    addDataTable(doc, data, headers, config) {
        const startY = PDF_CONFIG.headerHeight + 1;
        const pageWidth = doc.internal.pageSize.getWidth();
        const tableWidth = pageWidth - (PDF_CONFIG.margin * 2);
        
        console.log('📊 addDataTable:', {
            reportType: config.reportType,
            dataLength: data.length,
            headers: headers
        });
        
        // 🔧 TRANSFORMAR DATOS SI ES REMANENTE
        let processedData = data;
        let processedHeaders = headers;
        
        if (config.reportType === 'remanente') {
            console.log('📊 Usando estructura jerárquica completa para remanente');
            
            const bottomMargin = 50;

            // 1. Extraer datos editables
            extraerDatosEditablesCorrectos();
            
            // 2. Transformar datos (ahora retorna { soportes: [], proyectos: [] })
            const transformed = this.transformRemanenteDataForPDF(window.editablePreviewData || {});
            
            console.log('📊 Datos transformados:', {
                soportes: transformed.soportes?.length || 0,
                proyectos: transformed.proyectos?.length || 0
            });
            
            console.log('📁 Array de proyectos después de transformación:', transformed.proyectos);

            // 3. Generar reporte multi-página con AMBAS secciones
            this.generateRemanenteMultiPageReport(doc, transformed.soportes, config, startY, transformed.proyectos);
            
            return;
        }
        
        // Calcular anchos de columna
        const columnWidths = this.calculateOptimalColumnWidths(processedHeaders, tableWidth, config.reportType);
        
        console.log('📊 Configuración final:', {
            headers: processedHeaders,
            columnWidths: columnWidths,
            dataLength: processedData.length
        });
        
        // Dibujar headers
        this.drawTableHeaders(doc, processedHeaders, columnWidths, startY);
        
        // Dibujar filas
        let currentY = startY + 12;
        const bottomMargin = 50;
        
        processedData.forEach((row, index) => {
            // Calcular altura necesaria
            const estimatedHeight = config.reportType === 'remanente' ? 18 : 14;
            
            // Verificar nueva página
            if (currentY + estimatedHeight > doc.internal.pageSize.getHeight() - bottomMargin) {
                this.addFooter(doc);
                doc.addPage();
                currentY = 30;
                this.drawTableHeaders(doc, processedHeaders, columnWidths, currentY);
                currentY += 12;
            }
            
            // Dibujar fila según tipo
            let actualHeight;
            if (config.reportType === 'remanente') {
                actualHeight = this.drawRemanenteDataRow(doc, row, processedHeaders, columnWidths, currentY, index);
            } else {
                actualHeight = this.drawDataRow(doc, row, processedHeaders, columnWidths, currentY, index, config.reportType);
            }
            
            currentY += actualHeight + 1;
        });
        
        // Añadir totales
        if (config.showTotals && processedData.length > 0) {
            currentY += 10;
            
            if (currentY + 30 > doc.internal.pageSize.getHeight() - bottomMargin) {
                this.addFooter(doc);
                doc.addPage();
                currentY = 30;
            }
            
            this.addSeparatedTotals(doc, processedData, pageWidth, currentY, config.reportType);
            
            const messageY = currentY + 25;
            doc.setFont('helvetica', 'italic');
            doc.setFontSize(8);
            doc.setTextColor(ARVIC_COLORS.black);
            doc.text('* Totales calculados con valores modificados en vista previa', 
                    pageWidth - PDF_CONFIG.margin, messageY, { align: 'right' });
        }
        
        // Footer final
        this.addFooter(doc);
    }

    /**
     * NUEVA FUNCIÓN: Estimar altura de fila antes de dibujarla
     */
    estimateRowHeight(doc, rowData, headers, columnWidths, reportType) {
        let maxLines = 1;
        
        headers.forEach((header, index) => {
            const width = columnWidths[index];
            let cellValue = this.getCellValue(rowData, header, reportType);
            const lines = this.splitTextToFitWidth(doc, cellValue.toString(), width - 8);
            
            if (lines.length > maxLines) {
                maxLines = lines.length;
            }
        });
        
        return Math.max(14, maxLines * 4); // 12mm mínimo, 4mm por línea adicional
    }

    /**
     * Añadir totales separados (replicando diseño exacto de imagen 1)
     */
    addSeparatedTotals(doc, data, pageWidth, y, reportType) {
        let totalHours = 0;
        let totalAmount = 0;
        
        // 🔧 CÁLCULO ESPECIAL PARA REPORTE REMANENTE
        if (reportType === 'remanente') {
            console.log('📊 Calculando totales para reporte remanente');
            
            data.forEach(row => {
                // Sumar total de horas de cada módulo
                totalHours += parseFloat(row.totalHoras || 0);
                
                // Sumar totales de todas las semanas
                const semanaKeys = Object.keys(row).filter(key => key.startsWith('semana'));
                semanaKeys.forEach(semanaKey => {
                    if (row[semanaKey] && row[semanaKey].total) {
                        totalAmount += parseFloat(row[semanaKey].total || 0);
                    }
                });
            });
            
            console.log(`📊 Totales remanente calculados: ${totalHours} hrs, $${totalAmount}`);
        } else {
            // 📋 CÁLCULO NORMAL PARA OTROS REPORTES
            totalHours = data.reduce((sum, row) => {
                return sum + parseFloat(row.editedTime || row.tiempo || row.hours || 0);
            }, 0);
            
            totalAmount = data.reduce((sum, row) => {
                return sum + parseFloat(row.editedTotal || row.total || 0);
            }, 0);
        }
        
        // Dibujar totales
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(13);
        doc.setTextColor(ARVIC_COLORS.primary);
        
        doc.text(`Total Horas: ${totalHours.toFixed(1)} hrs`, 
                pageWidth - PDF_CONFIG.margin, y, { align: 'right' });
        
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
                return [
                    tableWidth * 0.08, tableWidth * 0.15, tableWidth * 0.25, 
                    tableWidth * 0.20, tableWidth * 0.10, tableWidth * 0.10, tableWidth * 0.12
                ];
                
            case 'cliente-soporte':
                return [
                    tableWidth * 0.35, tableWidth * 0.25, tableWidth * 0.15, 
                    tableWidth * 0.15, tableWidth * 0.10
                ];
                
            case 'proyecto-cliente':
                return [
                    tableWidth * 0.40, tableWidth * 0.20, tableWidth * 0.20, tableWidth * 0.20
                ];
                
            case 'remanente':
                console.log('📊 Calculando anchos para 5 semanas');
                
                const totalColumnWidth = tableWidth * 0.15;
                const weekAreaWidth = tableWidth * 0.85;
                const numberOfWeeks = 5;  // FIJO: siempre 5 semanas
                const weekColumnWidth = weekAreaWidth / numberOfWeeks;
                const subColumnWidth = weekColumnWidth / 4;
                
                const widths = [totalColumnWidth];
                
                // 5 semanas × 4 subcolomnas = 20 columnas adicionales
                for (let semana = 1; semana <= numberOfWeeks; semana++) {
                    widths.push(subColumnWidth, subColumnWidth, subColumnWidth, subColumnWidth);
                }
                
                console.log(`📊 Anchos calculados para ${numberOfWeeks} semanas`);
                return widths;
                
            default:
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
     * NUEVA FUNCIÓN: Dividir texto para que quepa en el ancho especificado
     */
    splitTextToFitWidth(doc, text, maxWidth) {
        if (!text || text === 'N/A') return [text];
        
        const words = text.toString().split(' ');
        const lines = [];
        let currentLine = '';
        
        for (let word of words) {
            const testLine = currentLine ? `${currentLine} ${word}` : word;
            const testWidth = doc.getTextWidth(testLine);
            
            if (testWidth <= maxWidth) {
                currentLine = testLine;
            } else {
                if (currentLine) {
                    lines.push(currentLine);
                    currentLine = word;
                } else {
                    // Palabra muy larga, dividir por caracteres
                    lines.push(...this.splitLongWord(doc, word, maxWidth));
                    currentLine = '';
                }
            }
        }
        
        if (currentLine) {
            lines.push(currentLine);
        }
        
        return lines.length > 0 ? lines : [text];
    }

    /**
     * Dibujar fila de datos (con bordes sutiles y consistentes con headers)
     */
    drawDataRow(doc, rowData, headers, columnWidths, y, rowIndex, reportType) {
        let currentX = PDF_CONFIG.margin;
        const baseRowHeight = 14; // Altura base de fila (mínima)
        
        // Calcular la altura real necesaria para esta fila
        let maxTextHeight = baseRowHeight;
        const cellTexts = [];
        
        // Pre-procesar todos los textos para calcular altura necesaria
        headers.forEach((header, index) => {
            const width = columnWidths[index];
            let cellValue = this.getCellValue(rowData, header, reportType);
            
            // Verificar si el texto necesita ser dividido
            const lines = this.splitTextToFitWidth(doc, cellValue.toString(), width - 8); // 8mm de padding
            cellTexts[index] = lines;
            
            // Calcular altura necesaria
            const textHeight = lines.length * 4; // 4mm por línea
            if (textHeight > maxTextHeight) {
                maxTextHeight = textHeight;
            }
        });
        
        // Asegurar altura mínima
        const finalRowHeight = Math.max(maxTextHeight, baseRowHeight);
        
        // Fondo alternado
        if (rowIndex % 2 === 0) {
            doc.setFillColor(ARVIC_COLORS.lightGray);
            doc.rect(PDF_CONFIG.margin, y, columnWidths.reduce((a, b) => a + b, 0), finalRowHeight, 'F');
        }
        
        // Dibujar celdas y textos
        headers.forEach((header, index) => {
            const width = columnWidths[index];
            const lines = cellTexts[index];
            
            // Dibujar bordes de celda
            doc.setLineWidth(0.2);
            doc.setDrawColor(200, 200, 200);
            doc.rect(currentX, y, width, finalRowHeight);
            
            // Configurar texto
            doc.setFont('helvetica', 'normal');
            doc.setFontSize(PDF_CONFIG.dataFontSize);
            doc.setTextColor(ARVIC_COLORS.black);
            
            // Determinar alineación
            const alignment = this.getCellAlignment(header);
            
            // Dibujar cada línea de texto
            lines.forEach((line, lineIndex) => {
                let textX = currentX + 4; // Margen izquierdo por defecto
                
                if (alignment === 'center') {
                    textX = currentX + (width / 2);
                } else if (alignment === 'right') {
                    textX = currentX + width - 4;
                }
                
                const textY = y + 8 + (lineIndex * 4); // Espaciado entre líneas
                doc.text(line, textX, textY, { align: alignment });
            });
            
            currentX += width;
        });
        
        return finalRowHeight; // Retornar la altura real usada
    }

    /**
     * NUEVA FUNCIÓN: Dividir palabras muy largas por caracteres
     */
    splitLongWord(doc, word, maxWidth) {
        const lines = [];
        let currentPart = '';
        
        for (let char of word) {
            const testPart = currentPart + char;
            const testWidth = doc.getTextWidth(testPart);
            
            if (testWidth <= maxWidth) {
                currentPart = testPart;
            } else {
                if (currentPart) {
                    lines.push(currentPart);
                }
                currentPart = char;
            }
        }
        
        if (currentPart) {
            lines.push(currentPart);
        }
        
        return lines;
    }

    /**
     * Obtener valor de celda con mapeo correcto según el tipo de reporte
     */
    getCellValue(rowData, header, reportType) {
        console.log(`🔍 getCellValue - Header: "${header}", ReportType: "${reportType}"`);
        
        // 🔧 MANEJO ESPECIAL PARA REPORTE REMANENTE
        if (reportType === 'remanente') {
            console.log('📊 Procesando celda de reporte remanente:', header);
            
            if (header === 'Total de Horas') {
                const totalHoras = rowData.totalHoras || 0;
                return `${parseFloat(totalHoras).toFixed(1)} hrs`;
            }
            
            // Para subcolomnas de semana (MODULO, TIEMPO, TARIFA, TOTAL)
            if (header === 'MODULO') {
                // Determinar qué semana basándose en la posición en headers
                // Esto se maneja de forma diferente - ver drawDataRow corregida
                return header; // Placeholder, se maneja en drawDataRow
            }
            
            if (header === 'TIEMPO') {
                return header; // Placeholder, se maneja en drawDataRow
            }
            
            if (header === 'TARIFA') {
                return header; // Placeholder, se maneja en drawDataRow
            }
            
            if (header === 'TOTAL') {
                return header; // Placeholder, se maneja en drawDataRow
            }
            
            return rowData[header] || '';
        }
        
        // 📋 MANEJO NORMAL PARA OTROS REPORTES
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

    /**
     * FUNCIÓN NUEVA: Transformar datos de remanente para estructura de PDF
     * Convierte la estructura anidada en estructura plana como la vista previa
     */
    transformRemanenteDataForPDF(editableData) {
        console.log('🔄 Transformando datos separando soportes y proyectos...');
        
        if (!editableData || Object.keys(editableData).length === 0) {
            return { soportes: [], proyectos: [] };
        }
        
        const soporteData = [];
        const proyectoData = [];
        
        Object.values(editableData).forEach((row, index) => {
            if (!row || typeof row !== 'object') return;
            
            // Filtrar fila de totales
            if (row['posicion_0'] === 'TOTALES') return;
            
            console.log(`Fila ${index}: type="${row.type}", projectName="${row.projectName}"`);

            // ✅ SEPARAR POR TIPO
            if (row.type === 'project') {
                console.log(`✅ Procesando proyecto en transformación:`, {
                    projectName: row.projectName,
                    moduleName: row.moduleName,
                    totalHours: row.totalHours,
                    tarifa: row.editedTariff,
                    total: row.editedTotal,
                    todasLasKeys: Object.keys(row)
                });

                // Es un proyecto - solo tiene totales
                proyectoData.push({
                    projectName: row.projectName || 'Proyecto Sin Nombre',
                    moduleName: row.moduleName || 'Módulo Sin Nombre',
                    totalHours: parseFloat(row.totalHours || row.editedTime || 0),
                    tarifa: parseFloat(row.editedTariff || row.tarifa || 0),        
                    total: parseFloat(row.editedTotal || row.total || 0)            
                });
            } else {
                // Es un soporte - tiene estructura de semanas
                const flatRow = {
                    totalHoras: parseFloat(row['posicion_0'] || row.totalHoras || 0)
                };
                
                // Mapear semanas (solo para soportes)
                for (let semana = 1; semana <= 5; semana++) {
                    const baseIndex = (semana - 1) * 4 + 1;
                    
                    const modulo = row[`posicion_${baseIndex}`] || '-';
                    const tiempo = row[`posicion_${baseIndex + 1}`] || '0.0';
                    const tarifa = row[`posicion_${baseIndex + 2}`] || '$0';
                    const total = row[`posicion_${baseIndex + 3}`] || '$0.00';
                    
                    flatRow[`modulo${semana}`] = modulo;
                    flatRow[`tiempo${semana}`] = tiempo === '' ? '0.0' : tiempo;
                    flatRow[`tarifa${semana}`] = tarifa === '' ? '$0' : tarifa;
                    flatRow[`total${semana}`] = total;
                }
                
                soporteData.push(flatRow);
            }
        });
        
        console.log(`✅ Transformación completa:`, {
            soportes: soporteData.length,
            proyectos: proyectoData.length
        });
        
        return {
            soportes: soporteData,
            proyectos: proyectoData
        };
    }

    /**
     * FUNCIÓN NUEVA: drawDataRow especializada para remanente
     */
    drawRemanenteDataRow(doc, rowData, headers, columnWidths, y, rowIndex) {
        let currentX = PDF_CONFIG.margin;
        const rowHeight = 18; // Altura fija más generosa para remanente
        
        // Fondo alternado
        if (rowIndex % 2 === 0) {
            doc.setFillColor(ARVIC_COLORS.lightGray);
            doc.rect(PDF_CONFIG.margin, y, columnWidths.reduce((a, b) => a + b, 0), rowHeight, 'F');
        }
        
        // Configurar texto
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(8); // Fuente más pequeña para más datos
        doc.setTextColor(ARVIC_COLORS.black);
        
        let headerIndex = 0;
        
        // Primera columna: Total de Horas
        const totalHoras = parseFloat(rowData.totalHoras || 0).toFixed(1);
        
        doc.setLineWidth(0.2);
        doc.setDrawColor(200, 200, 200);
        doc.rect(currentX, y, columnWidths[0], rowHeight);
        
        doc.setFont('helvetica', 'bold');
        doc.text(`${totalHoras} hrs`, currentX + columnWidths[0]/2, y + rowHeight/2 + 2, { align: 'center' });
        
        currentX += columnWidths[0];
        headerIndex++;
        
        // Detectar número de semanas
        const remainingHeaders = headers.length - 1;
        const numberOfWeeks = remainingHeaders / 4;
        
        // Dibujar datos para cada semana
        for (let semana = 1; semana <= numberOfWeeks; semana++) {
            doc.setFont('helvetica', 'normal');
            
            // MODULO
            const modulo = rowData[`modulo${semana}`] || '-';
            doc.rect(currentX, y, columnWidths[headerIndex], rowHeight);
            doc.text(modulo, currentX + 2, y + rowHeight/2 + 2);
            currentX += columnWidths[headerIndex];
            headerIndex++;
            
            // TIEMPO
            const tiempo = parseFloat(rowData[`tiempo${semana}`] || 0).toFixed(1);
            doc.rect(currentX, y, columnWidths[headerIndex], rowHeight);
            doc.text(`${tiempo} hrs`, currentX + columnWidths[headerIndex]/2, y + rowHeight/2 + 2, { align: 'center' });
            currentX += columnWidths[headerIndex];
            headerIndex++;
            
            // TARIFA
            const tarifa = parseFloat(rowData[`tarifa${semana}`] || 0);
            doc.rect(currentX, y, columnWidths[headerIndex], rowHeight);
            doc.text(`$${tarifa.toLocaleString('es-MX')}`, currentX + columnWidths[headerIndex]/2, y + rowHeight/2 + 2, { align: 'center' });
            currentX += columnWidths[headerIndex];
            headerIndex++;
            
            // TOTAL
            const total = parseFloat(rowData[`total${semana}`] || 0);
            doc.rect(currentX, y, columnWidths[headerIndex], rowHeight);
            doc.setFont('helvetica', 'bold');
            doc.text(`$${total.toLocaleString('es-MX')}`, currentX + columnWidths[headerIndex]/2, y + rowHeight/2 + 2, { align: 'center' });
            doc.setFont('helvetica', 'normal');
            currentX += columnWidths[headerIndex];
            headerIndex++;
        }
        
        return rowHeight;
    }

    /**
     * NUEVA FUNCIÓN: Generar reporte remanente en múltiples páginas
     * Página 1: Total + Semanas 1-2
     * Página 2: Total + Semanas 3-4  
     * Página 3: Total + Semana 5 + Totales
     */
    generateRemanenteMultiPageReport(doc, soporteData, config, startY, proyectoData = []) {
        console.log('📄 Generando reporte en 3 páginas...');
        console.log('🔍 DEBUG - generateRemanenteMultiPageReport iniciado');
        console.log('📊 Soportes recibidos:', soporteData.length);
        console.log('📁 Proyectos recibidos:', proyectoData.length);
        console.log('📁 Datos de proyectos:', proyectoData);
        
        const pageWidth = doc.internal.pageSize.getWidth();
        const tableWidth = pageWidth - (PDF_CONFIG.margin * 2);
        const bottomMargin = 50;
        
        // Definición de páginas
        const pages = [
            { pageNum: 1, weeks: [1, 2], title: 'Semanas 1-2' },
            { pageNum: 2, weeks: [3, 4], title: 'Semanas 3-4' },
            { pageNum: 3, weeks: [5], title: 'Semana 5' }
        ];
        
        // Generar cada página
        pages.forEach((pageConfig, pageIndex) => {
            if (pageIndex > 0) {
                doc.addPage();
                this.addCompleteHeader(doc, config, config.metadata || {});
            }
            
            console.log(`📄 Generando página ${pageConfig.pageNum}: ${pageConfig.title}`);
            
            // Calcular anchos de columna para esta página
            const numWeeks = pageConfig.weeks.length;
            const columnWidths = this.calculateRemanenteColumnWidths(tableWidth, numWeeks);
            
            // Generar estructura de headers
            const headerStructure = {
                totalWeeks: numWeeks,
                weeks: pageConfig.weeks,
                pageNum: pageConfig.pageNum,
                totalPages: pages.length
            };
            
            // Dibujar headers
            const headerHeight = this.drawRemanenteHeadersMultiPage(
                doc, 
                headerStructure, 
                columnWidths, 
                startY
            );
            
            // Dibujar filas de datos
            let currentY = startY + headerHeight + 2;

            soporteData.forEach((row, rowIndex) => {
                // Verificar si necesitamos nueva página (solo si hay muchas filas)
                if (currentY + 18 > doc.internal.pageSize.getHeight() - bottomMargin) {
                    this.addFooter(doc);
                    doc.addPage();
                    this.addCompleteHeader(doc, config, config.metadata || {});
                    currentY = startY;
                    
                    // Re-dibujar headers
                    this.drawRemanenteHeadersMultiPage(
                        doc, 
                        headerStructure, 
                        columnWidths, 
                        currentY
                    );
                    currentY += headerHeight + 2;
                }
                
                // Dibujar fila con solo las semanas de esta página
                this.drawRemanenteDataRowMultiPage(
                    doc, 
                    row, 
                    pageConfig.weeks, 
                    columnWidths, 
                    currentY, 
                    rowIndex
                );
                
                currentY += 15;
            });
            
            // Si es la última página, agregar totales
            if (pageConfig.pageNum === pages.length) {
                currentY += 10;
                
                if (currentY + 40 > doc.internal.pageSize.getHeight() - bottomMargin) {
                    this.addFooter(doc);
                    doc.addPage();
                    currentY = 30;
                }
            }
            
            // Agregar footer con número de página
            this.addFooterWithPageNumber(doc, pageConfig.pageNum, pages.length);

            // Si es la última página, agregar totales Y proyectos
            if (pageConfig.pageNum === pages.length) {
                console.log('✅ Última página detectada');
                currentY += 10;
                
                if (currentY + 40 > doc.internal.pageSize.getHeight() - bottomMargin) {
                    this.addFooter(doc);
                    doc.addPage();
                    currentY = 30;
                }
                
                this.addRemanenteTotals(doc, soporteData, pageWidth, currentY);
                console.log('✅ Totales de soportes dibujados');
                
                // Verificar proyectos
                console.log('🔍 Verificando proyectos...');
                console.log('proyectoData:', proyectoData);
                console.log('proyectoData existe?', !!proyectoData);
                console.log('proyectoData.length:', proyectoData?.length);
                
                if (proyectoData && proyectoData.length > 0) {
                    console.log('✅ ENTRANDO a dibujar sección de proyectos');
                    currentY += 50;
                    
                    if (currentY + 60 > doc.internal.pageSize.getHeight() - bottomMargin) {
                        this.addFooter(doc);
                        doc.addPage();
                        this.addCompleteHeader(doc, config, config.metadata || {});
                        currentY = startY;
                    }
                    
                    this.drawProyectosSection(doc, proyectoData, pageWidth, currentY);
                    console.log('✅ Sección de proyectos dibujada');
                } else {
                    console.log('❌ NO se dibuja sección de proyectos porque:');
                    console.log('   - proyectoData es null/undefined?', !proyectoData);
                    console.log('   - proyectoData está vacío?', proyectoData?.length === 0);
                }
            }
        });
    }

    /**
     * Calcular anchos de columna para remanente según número de semanas
     */
    calculateRemanenteColumnWidths(tableWidth, numWeeks) {
        const totalColumnWidth = tableWidth * 0.18; // 18% para Total de Horas
        const weekAreaWidth = tableWidth * 0.82;    // 82% para las semanas
        const weekColumnWidth = weekAreaWidth / numWeeks;
        const subColumnWidth = weekColumnWidth / 4; // 4 subcolomnas por semana
        
        const widths = [totalColumnWidth];
        
        // Agregar anchos para cada semana (4 subcolomnas por semana)
        for (let i = 0; i < numWeeks; i++) {
            widths.push(subColumnWidth, subColumnWidth, subColumnWidth, subColumnWidth);
        }
        
        console.log(`📏 Anchos calculados para ${numWeeks} semanas:`, widths);
        return widths;
    }

    /**
     * Dibujar headers jerárquicos para páginas específicas
     */
    drawRemanenteHeadersMultiPage(doc, headerStructure, columnWidths, y) {
        let currentX = PDF_CONFIG.margin;
        const mainHeaderHeight = 12;
        const subHeaderHeight = 10;
        
        const totalColumnWidth = columnWidths[0];
        const remainingWidth = columnWidths.slice(1).reduce((a, b) => a + b, 0);
        const weekColumnWidth = remainingWidth / headerStructure.totalWeeks;
        
        // Configurar fuente
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(10);
        doc.setTextColor(255, 255, 255);
        
        // Columna "Total de Horas"
        doc.setFillColor(25, 118, 210);
        doc.rect(currentX, y, totalColumnWidth, mainHeaderHeight + subHeaderHeight, 'F');
        doc.rect(currentX, y, totalColumnWidth, mainHeaderHeight + subHeaderHeight);
        doc.text('Total de Horas', currentX + totalColumnWidth/2, y + (mainHeaderHeight + subHeaderHeight)/2 + 3, { align: 'center' });
        currentX += totalColumnWidth;
        
        // Headers de semanas (solo las de esta página)
        headerStructure.weeks.forEach(weekNum => {
            doc.setFillColor(25, 118, 210);
            doc.rect(currentX, y, weekColumnWidth, mainHeaderHeight, 'F');
            doc.rect(currentX, y, weekColumnWidth, mainHeaderHeight);
            doc.text(`Semana ${weekNum}`, currentX + weekColumnWidth/2, y + mainHeaderHeight/2 + 3, { align: 'center' });
            
            const subColumnWidth = weekColumnWidth / 4;
            let subX = currentX;
            
            ['MODULO', 'TIEMPO', 'TARIFA', 'TOTAL'].forEach(subHeader => {
                doc.setFillColor(33, 150, 243);
                doc.rect(subX, y + mainHeaderHeight, subColumnWidth, subHeaderHeight, 'F');
                doc.rect(subX, y + mainHeaderHeight, subColumnWidth, subHeaderHeight);
                
                doc.setFontSize(8);
                doc.text(subHeader, subX + subColumnWidth/2, y + mainHeaderHeight + subHeaderHeight/2 + 2, { align: 'center' });
                
                subX += subColumnWidth;
            });
            
            currentX += weekColumnWidth;
        });
        
        return mainHeaderHeight + subHeaderHeight;
    }

    /**
     * Dibujar fila de datos con solo las semanas especificadas
     */
    drawRemanenteDataRowMultiPage(doc, rowData, weeks, columnWidths, y, rowIndex) {
        let currentX = PDF_CONFIG.margin;
        const rowHeight = 15;
        
        // Fondo alternado
        if (rowIndex % 2 === 0) {
            doc.setFillColor(ARVIC_COLORS.lightGray);
            doc.rect(PDF_CONFIG.margin, y, columnWidths.reduce((a, b) => a + b, 0), rowHeight, 'F');
        }
        
        // Configurar texto
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(9);
        doc.setTextColor(ARVIC_COLORS.black);
        doc.setLineWidth(0.2);
        doc.setDrawColor(200, 200, 200);
        
        let columnIndex = 0;
        
        // Columna 1: Total de Horas
        const totalHoras = parseFloat(rowData.totalHoras || 0).toFixed(1);
        doc.rect(currentX, y, columnWidths[columnIndex], rowHeight);
        doc.setFont('helvetica', 'bold');
        doc.text(`${totalHoras} hrs`, currentX + columnWidths[columnIndex]/2, y + rowHeight/2 + 2, { align: 'center' });
        doc.setFont('helvetica', 'normal');
        currentX += columnWidths[columnIndex++];
        
        // Datos de las semanas especificadas
        weeks.forEach(semana => {
            // MODULO
            const modulo = rowData[`modulo${semana}`] || '-';
            doc.rect(currentX, y, columnWidths[columnIndex], rowHeight);
            doc.setFontSize(8);
            doc.text(modulo, currentX + columnWidths[columnIndex]/2, y + rowHeight/2 + 2, { align: 'center' });
            doc.setFontSize(9);
            currentX += columnWidths[columnIndex++];
            
            // TIEMPO
            const tiempo = rowData[`tiempo${semana}`] || '0.0';
            doc.rect(currentX, y, columnWidths[columnIndex], rowHeight);
            doc.text(tiempo === '0.0' ? '-' : `${tiempo}h`, currentX + columnWidths[columnIndex]/2, y + rowHeight/2 + 2, { align: 'center' });
            currentX += columnWidths[columnIndex++];
            
            // TARIFA
            const tarifa = rowData[`tarifa${semana}`] || '$0';
            doc.rect(currentX, y, columnWidths[columnIndex], rowHeight);
            doc.text(tarifa === '$0' ? '-' : tarifa, currentX + columnWidths[columnIndex]/2, y + rowHeight/2 + 2, { align: 'center' });
            currentX += columnWidths[columnIndex++];
            
            // TOTAL
            const total = rowData[`total${semana}`] || '$0.00';
            doc.rect(currentX, y, columnWidths[columnIndex], rowHeight);
            doc.setFont('helvetica', 'bold');
            doc.setTextColor(0, 100, 0);
            doc.text(total, currentX + columnWidths[columnIndex]/2, y + rowHeight/2 + 2, { align: 'center' });
            doc.setTextColor(0, 0, 0);
            doc.setFont('helvetica', 'normal');
            currentX += columnWidths[columnIndex++];
        });
        
        return rowHeight;
    }

    /**
     * Agregar totales consolidados al final del reporte
     */
    addRemanenteTotals(doc, data, pageWidth, y) {
        console.log('📊 Calculando totales consolidados...');
        
        let totalHoras = 0;
        let totalMonto = 0;
        
        data.forEach(row => {
            totalHoras += parseFloat(row.totalHoras || 0);
            
            // Sumar totales de todas las semanas
            for (let semana = 1; semana <= 5; semana++) {
                const total = row[`total${semana}`] || '$0.00';
                const numericTotal = parseFloat(total.replace(/[$,]/g, ''));
                totalMonto += numericTotal;
            }
        });
        
        // Dibujar sección de totales
        doc.setDrawColor(25, 118, 210);
        doc.setLineWidth(0.5);
        doc.line(PDF_CONFIG.margin, y, pageWidth - PDF_CONFIG.margin, y);
        
        y += 8;
        
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(13);
        doc.setTextColor(ARVIC_COLORS.primary);
        
        doc.text(`Total Horas: ${totalHoras.toFixed(1)} hrs`, 
                pageWidth - PDF_CONFIG.margin, y, { align: 'right' });
        
        doc.text(`Total Monto: $${totalMonto.toLocaleString('es-MX', { minimumFractionDigits: 2 })}`, 
                pageWidth - PDF_CONFIG.margin, y + 10, { align: 'right' });
        
        console.log(`✅ Totales: ${totalHoras.toFixed(1)} hrs, $${totalMonto.toFixed(2)}`);
    }

    /**
     * Agregar footer con número de página
     */
    addFooterWithPageNumber(doc, currentPage, totalPages) {
        const pageHeight = doc.internal.pageSize.getHeight();
        const pageWidth = doc.internal.pageSize.getWidth();
        const footerY = pageHeight - 15;
        
        // Línea divisoria
        doc.setDrawColor(25, 118, 210);
        doc.setLineWidth(0.5);
        doc.line(PDF_CONFIG.margin, footerY - 5, pageWidth - PDF_CONFIG.margin, footerY - 5);
        
        // Texto del footer
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(9);
        doc.setTextColor(100, 100, 100);
        
        doc.text('GRUPO IT ARVIC - Sistema de Gestión Empresarial', 
                PDF_CONFIG.margin, footerY);
        
        const currentDate = new Date().toLocaleDateString('es-MX', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
        
        doc.text(`Documento generado automáticamente - ${currentDate}`, 
                PDF_CONFIG.margin, footerY + 6);
        
        // Número de página
        doc.setFont('helvetica', 'bold');
        doc.text(`Página ${currentPage} de ${totalPages}`, 
                pageWidth - PDF_CONFIG.margin, footerY, { align: 'right' });
    }

    /**
     * NUEVA FUNCIÓN: Dibujar sección de proyectos en el PDF
     */
    drawProyectosSection(doc, proyectoData, pageWidth, startY) {    
        console.log('🎨 EJECUTANDO drawProyectosSection');
        console.log('📁 proyectoData recibido:', proyectoData);
        console.log('📏 pageWidth:', pageWidth);
        console.log('📍 startY:', startY);

        proyectoData.forEach((proyecto, i) => {
            console.log(`Proyecto ${i}:`, {
                projectName: proyecto.projectName,
                moduleName: proyecto.moduleName,
                totalHours: proyecto.totalHours,
                tarifa: proyecto.tarifa,
                total: proyecto.total
            });
        });
        
        if (!proyectoData || proyectoData.length === 0) {
            console.error('❌ proyectoData está vacío en drawProyectosSection');
            return;
        }

        console.log('📁 Dibujando sección de proyectos:', proyectoData.length);
        
        let currentY = startY;
        const margin = PDF_CONFIG.margin;
        const tableWidth = pageWidth - (margin * 2);
        
        // Título de sección
        doc.setFillColor(25, 118, 210);
        doc.rect(margin, currentY, tableWidth, 10, 'F');
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(12);
        doc.setTextColor(255, 255, 255);
        doc.text('PROYECTOS DEL CLIENTE', margin + 5, currentY + 7);
        currentY += 12;
        
        // Headers de tabla de proyectos
        const colWidths = [
            tableWidth * 0.30,  // Proyecto
            tableWidth * 0.30,  // Módulo
            tableWidth * 0.15,  // Total Horas
            tableWidth * 0.10,  // Tarifa
            tableWidth * 0.15   // Total
        ];
        
        doc.setFillColor(33, 150, 243);
        let currentX = margin;
        
        const headers = ['Proyecto', 'Módulo', 'Total Horas', 'Tarifa', 'Total'];
        headers.forEach((header, index) => {
            // 1. Dibujar fondo azul
            doc.setFillColor(33, 150, 243);
            doc.rect(currentX, currentY, colWidths[index], 10, 'F');
            
            // 2. Dibujar borde
            doc.setDrawColor(33, 150, 243);
            doc.setLineWidth(0.5);
            doc.rect(currentX, currentY, colWidths[index], 10);
            
            // 3. Configurar texto DENTRO del loop (no antes)
            doc.setFont('helvetica', 'bold');
            doc.setFontSize(9);
            doc.setTextColor(255, 255, 255);  // Blanco
            
            // 4. Dibujar texto
            const textX = currentX + colWidths[index]/2;
            const textY = currentY + 7;
            doc.text(header, textX, textY, { align: 'center' });
            
            console.log(`Header "${header}" dibujado en (${textX}, ${textY})`);
            
            currentX += colWidths[index];
        });

        // 5. CRÍTICO: Resetear colores antes de continuar
        doc.setTextColor(0, 0, 0);  // Negro para datos
        doc.setDrawColor(200, 200, 200);  // Gris para bordes de datos
        doc.setLineWidth(0.2);

        currentY += 10;
        
        // Agrupar por proyecto
        const projectGroups = {};
        proyectoData.forEach(row => {
            const projectKey = row.projectName;
            if (!projectGroups[projectKey]) {
                projectGroups[projectKey] = [];
            }
            projectGroups[projectKey].push(row);
        });
        
        // Dibujar datos por proyecto
        doc.setTextColor(0, 0, 0);
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(9);
        
        let totalProjectHours = 0;
        let totalProjectAmount = 0;
        
        Object.entries(projectGroups).forEach(([projectName, modules]) => {
            modules.forEach((row, index) => {
                // Fondo alternado
                if (index % 2 === 0) {
                    doc.setFillColor(245, 245, 245);
                    doc.rect(margin, currentY, tableWidth, 8, 'F');
                }
                
                currentX = margin;
                
                // Proyecto (solo en primera fila del grupo)
                doc.setFont('helvetica', index === 0 ? 'bold' : 'normal');
                doc.rect(currentX, currentY, colWidths[0], 8);
                if (index === 0) {
                    doc.text(projectName, currentX + 2, currentY + 5.5);
                }
                currentX += colWidths[0];
                
                // Módulo
                doc.setFont('helvetica', 'normal');
                doc.rect(currentX, currentY, colWidths[1], 8);
                doc.text(row.moduleName, currentX + 2, currentY + 5.5);
                currentX += colWidths[1];

                // Total Horas
                doc.rect(currentX, currentY, colWidths[2], 8);
                doc.text(`${row.totalHours.toFixed(1)} hrs`, currentX + colWidths[2]/2, currentY + 5.5, { align: 'center' });
                currentX += colWidths[2];

                // Tarifa
                doc.rect(currentX, currentY, colWidths[3], 8);
                doc.text(`$${row.tarifa.toLocaleString('es-MX')}`, currentX + colWidths[3]/2, currentY + 5.5, { align: 'center' });
                currentX += colWidths[3];

                // Total
                doc.rect(currentX, currentY, colWidths[4], 8);
                doc.setFont('helvetica', 'bold');
                doc.setTextColor(0, 100, 0);
                doc.text(`$${row.total.toLocaleString('es-MX', { minimumFractionDigits: 2 })}`, currentX + colWidths[4]/2, currentY + 5.5, { align: 'center' });
                doc.setTextColor(0, 0, 0);
                doc.setFont('helvetica', 'normal');
                
                totalProjectHours += row.totalHours;
                totalProjectAmount += row.total;
                
                currentY += 8;
            });
        });
        
        // Totales de proyectos
        currentY += 2;
        doc.setFillColor(220, 220, 220);
        doc.rect(margin, currentY, tableWidth, 10, 'F');
        doc.rect(margin, currentY, tableWidth, 10);
        
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(10);
        doc.setTextColor(0, 0, 0);
        
        currentX = margin;
        doc.text('TOTAL PROYECTOS', currentX + 5, currentY + 7);
        currentX += colWidths[0] + colWidths[1];
        doc.text(`${totalProjectHours.toFixed(1)} hrs`, currentX + colWidths[2]/2, currentY + 7, { align: 'center' });
        currentX += colWidths[2] + colWidths[3];
        doc.text(`$${totalProjectAmount.toLocaleString('es-MX', { minimumFractionDigits: 2 })}`, currentX + colWidths[4]/2, currentY + 7, { align: 'center' });
        
        console.log(`✅ Sección de proyectos dibujada: ${proyectoData.length} módulos, $${totalProjectAmount.toFixed(2)}`);
    }
}

/**
 * FUNCIONES NUEVAS PARA REMANENTE
 */

// Función 1: Extraer datos editables correctos
/**
 * Extraer datos editables correctos PRESERVANDO proyectos
 */
function extraerDatosEditablesCorrectos() {
    console.log('🔧 Extrayendo datos con input.value (preservando proyectos)...');
    
    const tabla = document.querySelector('#reportPreviewPanel table');
    if (!tabla) return null;
    
    // 1. GUARDAR proyectos existentes antes de sobrescribir
    const proyectosExistentes = [];
    if (editablePreviewData) {
        Object.values(editablePreviewData).forEach(row => {
            if (row.type === 'project') {
                proyectosExistentes.push(row);
            }
        });
    }
    
    console.log(`💾 Proyectos guardados antes de extraer: ${proyectosExistentes.length}`);
    console.log('📁 Proyectos encontrados:', proyectosExistentes);
    
    // 2. EXTRAER datos de la tabla (solo soportes visibles)
    const filas = Array.from(tabla.querySelectorAll('tbody tr'));
    const datosCorrectos = {};
    
    filas.forEach((fila, filaIndex) => {
        const celdas = Array.from(fila.querySelectorAll('td'));
        const objeto = {};
        
        celdas.forEach((celda, celdaIndex) => {
            const input = celda.querySelector('input');
            let valor = input ? input.value : celda.textContent.trim();
            objeto[`posicion_${celdaIndex}`] = valor;
        });
        
        datosCorrectos[filaIndex] = objeto;
    });
    
    // 3. RE-AGREGAR proyectos al final
    let siguienteIndice = Object.keys(datosCorrectos).length;
    proyectosExistentes.forEach(proyecto => {
        datosCorrectos[siguienteIndice] = proyecto;
        siguienteIndice++;
    });
    
    console.log(`✅ Datos finales: ${Object.keys(datosCorrectos).length} filas (${proyectosExistentes.length} proyectos preservados)`);
    
    window.editablePreviewData = datosCorrectos;
    return datosCorrectos;
}

// Función 2: Generar headers jerárquicos
ARVICPDFExporter.prototype.generateRemanenteHeaders = function(editableData) {
    console.log('📋 Generando headers jerárquicos para 5 semanas...');
    
    const headerStructure = {
        totalWeeks: 5,
        mainHeaders: ['Total de Horas'],
        subHeaders: ['Total de Horas']
    };
    
    for (let semana = 1; semana <= 5; semana++) {
        headerStructure.mainHeaders.push(`Semana ${semana}`);
        headerStructure.subHeaders.push('MODULO', 'TIEMPO', 'TARIFA', 'TOTAL');
    }
    
    return headerStructure;
};

// Función 3: Dibujar headers jerárquicos
ARVICPDFExporter.prototype.drawRemanenteHeaders = function(doc, headerStructure, columnWidths, y) {
    let currentX = 20;
    const mainHeaderHeight = 12;
    const subHeaderHeight = 10;
    
    const totalColumnWidth = columnWidths[0];
    const remainingWidth = columnWidths.slice(1).reduce((a, b) => a + b, 0);
    const weekColumnWidth = remainingWidth / headerStructure.totalWeeks;
    
    // Headers principales
    doc.setFillColor(25, 118, 210);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.setTextColor(255, 255, 255);
    
    // Total de Horas
    doc.rect(currentX, y, totalColumnWidth, mainHeaderHeight + subHeaderHeight, 'F');
    doc.rect(currentX, y, totalColumnWidth, mainHeaderHeight + subHeaderHeight);
    doc.text('Total de Horas', currentX + totalColumnWidth/2, y + (mainHeaderHeight + subHeaderHeight)/2 + 3, { align: 'center' });
    currentX += totalColumnWidth;
    
    // Headers de semanas
    for (let semana = 1; semana <= headerStructure.totalWeeks; semana++) {
        doc.setFillColor(25, 118, 210);
        doc.rect(currentX, y, weekColumnWidth, mainHeaderHeight, 'F');
        doc.rect(currentX, y, weekColumnWidth, mainHeaderHeight);
        doc.text(`Semana ${semana}`, currentX + weekColumnWidth/2, y + mainHeaderHeight/2 + 3, { align: 'center' });
        
        const subColumnWidth = weekColumnWidth / 4;
        let subX = currentX;
        
        ['MODULO', 'TIEMPO', 'TARIFA', 'TOTAL'].forEach(subHeader => {
            doc.setFillColor(33, 150, 243);
            doc.rect(subX, y + mainHeaderHeight, subColumnWidth, subHeaderHeight, 'F');
            doc.rect(subX, y + mainHeaderHeight, subColumnWidth, subHeaderHeight);
            
            doc.setFontSize(8);
            doc.text(subHeader, subX + subColumnWidth/2, y + mainHeaderHeight + subHeaderHeight/2 + 2, { align: 'center' });
            
            subX += subColumnWidth;
        });
        
        currentX += weekColumnWidth;
    }
    
    return mainHeaderHeight + subHeaderHeight;
};

// Función 4: Dibujar filas de datos para remanente
ARVICPDFExporter.prototype.drawRemanenteDataRow = function(doc, rowData, headers, columnWidths, y, rowIndex) {
    let currentX = 20;
    const rowHeight = 18;
    
    if (rowIndex % 2 === 0) {
        doc.setFillColor(245, 245, 245);
        doc.rect(20, y, columnWidths.reduce((a, b) => a + b, 0), rowHeight, 'F');
    }
    
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(0, 0, 0);
    
    // Total de Horas
    const totalHoras = parseFloat(rowData.totalHoras || 0).toFixed(1);
    doc.rect(currentX, y, columnWidths[0], rowHeight);
    doc.setFont('helvetica', 'bold');
    doc.text(`${totalHoras} hrs`, currentX + columnWidths[0]/2, y + rowHeight/2 + 2, { align: 'center' });
    currentX += columnWidths[0];
    
    let columnIndex = 1;
    doc.setFont('helvetica', 'normal');
    
    for (let semana = 1; semana <= 5; semana++) {
        // MODULO
        const modulo = rowData[`modulo${semana}`] || '-';
        doc.rect(currentX, y, columnWidths[columnIndex], rowHeight);
        if (modulo !== '-' && modulo !== '') {
            doc.setFontSize(7);
            doc.text(modulo, currentX + 1, y + rowHeight/2 + 2);
            doc.setFontSize(8);
        } else {
            doc.text('-', currentX + columnWidths[columnIndex]/2, y + rowHeight/2 + 2, { align: 'center' });
        }
        currentX += columnWidths[columnIndex++];
        
        // TIEMPO
        const tiempo = rowData[`tiempo${semana}`] || '0.0';
        doc.rect(currentX, y, columnWidths[columnIndex], rowHeight);
        doc.text(tiempo === '0.0' ? '-' : `${tiempo}h`, currentX + columnWidths[columnIndex]/2, y + rowHeight/2 + 2, { align: 'center' });
        currentX += columnWidths[columnIndex++];
        
        // TARIFA
        const tarifa = rowData[`tarifa${semana}`] || '$0';
        doc.rect(currentX, y, columnWidths[columnIndex], rowHeight);
        doc.text(tarifa === '$0' ? '-' : `$${tarifa}`, currentX + columnWidths[columnIndex]/2, y + rowHeight/2 + 2, { align: 'center' });
        currentX += columnWidths[columnIndex++];
        
        // TOTAL
        const total = rowData[`total${semana}`] || '$0.00';
        doc.rect(currentX, y, columnWidths[columnIndex], rowHeight);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(0, 100, 0);
        doc.text(total, currentX + columnWidths[columnIndex]/2, y + rowHeight/2 + 2, { align: 'center' });
        doc.setTextColor(0, 0, 0);
        doc.setFont('helvetica', 'normal');
        currentX += columnWidths[columnIndex++];
    }
    
    return rowHeight;
};

// Crear instancia global
window.arvicPDFExporter = new ARVICPDFExporter();

/**
 * FUNCIÓN PRINCIPAL - Exportar reporte actual a PDF
 */
async function exportCurrentReportToPDF() {
    try {
        console.log('🚀 Iniciando exportación PDF del reporte actual...');
        
        // Validar que hay datos para exportar - VERSIÓN CORREGIDA
        const reportType = window.currentReportType || currentReportType;
        const previewData = window.editablePreviewData || editablePreviewData;

        console.log('🔍 Verificando datos:', {
            reportType: reportType,
            previewDataKeys: Object.keys(previewData || {}),
            globalCurrentReportType: window.currentReportType,
            globalEditablePreviewData: window.editablePreviewData
        });

        if (!reportType || !previewData || Object.keys(previewData).length === 0) {
            throw new Error('No hay datos disponibles para exportar. Asegúrate de generar la vista previa primero.');
        }
        
        // Mostrar indicador de carga en el botón
        const pdfButton = document.getElementById('exportPDFBtn');
        if (pdfButton) {
            pdfButton.classList.add('loading');
            pdfButton.disabled = true;
        }
        
        // Preparar configuración
        const report = ARVIC_REPORTS[reportType];
        const config = {
            title: report.name || 'Reporte ARVIC',
            reportType: currentReportType,
            showTotals: true
        };
        
        // Preparar datos - convertir objeto a array
        const data = Object.values(previewData);
        
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

// Función auxiliar para verificar cuántas filas caben por página
function calculateMaxRowsPerPage() {
    const pageHeight = 210; // A4 landscape
    const usableHeight = pageHeight - PDF_CONFIG_OPTIMIZED.headerHeight - 50; // 50 para footer
    const averageRowHeight = 12; // Altura promedio por fila
    
    return Math.floor(usableHeight / averageRowHeight);
}

console.log(`📋 Filas estimadas por página: ${calculateMaxRowsPerPage()}`);

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

function debugRemanenteData() {
    console.log('🔍 DEBUGGING - Estructura de datos remanente');
    
    if (!editablePreviewData || Object.keys(editablePreviewData).length === 0) {
        console.error('❌ No hay datos en editablePreviewData');
        return;
    }
    
    const firstRow = Object.values(editablePreviewData)[0];
    console.log('📊 Primera fila de datos:', firstRow);
    
    // Verificar estructura de semanas
    const semanaKeys = Object.keys(firstRow).filter(key => key.startsWith('semana'));
    console.log('📅 Semanas encontradas:', semanaKeys);
    
    semanaKeys.forEach(semanaKey => {
        console.log(`📅 ${semanaKey}:`, firstRow[semanaKey]);
    });
    
    // Verificar total de horas
    console.log('📊 Total de horas:', firstRow.totalHoras);
    
    return {
        totalRows: Object.keys(editablePreviewData).length,
        semanas: semanaKeys.length,
        estructura: firstRow
    };
}

function debugRemanenteStructure() {
    console.log('🔍 DEBUGGING COMPLETO - Estructura Remanente');
    
    if (!window.editablePreviewData) {
        console.error('❌ No hay editablePreviewData disponible');
        return;
    }
    
    const data = window.editablePreviewData;
    const firstRow = Object.values(data)[0];
    
    console.log('📊 Primera fila completa:', firstRow);
    
    if (firstRow && firstRow.monthStructure) {
        console.log('📅 Estructura de mes:', firstRow.monthStructure);
        
        const semanaKeys = Object.keys(firstRow).filter(key => key.startsWith('semana'));
        console.log('📅 Semanas encontradas:', semanaKeys);
        
        semanaKeys.forEach(key => {
            console.log(`📅 ${key}:`, firstRow[key]);
        });
        
        // Probar transformación
        const transformed = transformRemanenteDataForPDF(data);
        console.log('🔄 Resultado de transformación:', transformed);
        
        return {
            originalData: Object.keys(data).length,
            semanas: semanaKeys.length,
            transformedHeaders: transformed.headers.length,
            transformedData: transformed.data.length
        };
    } else {
        console.error('❌ No se encontró monthStructure en los datos');
        return null;
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

// Funciones principales
window.exportCurrentReportToPDF = exportCurrentReportToPDF;
window.exportTableToPDF = exportTableToPDF;
window.addPDFButtonToConfigPanel = addPDFButtonToConfigPanel;
window.updatePDFButtonState = updatePDFButtonState;
window.debugRemanenteData = debugRemanenteData;
window.debugRemanenteStructure = debugRemanenteStructure;

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