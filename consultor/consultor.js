/**
 * === PANEL DE CONSULTOR SIMPLIFICADO ===
 * Solo maneja asignaciones y reportes de horas
 */

// Variables globales
let currentUser = null;
let userAssignments = [];
let currentAssignmentId = null;
let isInitialized = false;

// === MANEJO DE ERRORES ===
function showError(message) {
    console.error('Error:', message);
    const errorContainer = document.getElementById('errorContainer');
    const errorText = document.getElementById('errorText');
    
    if (errorContainer && errorText) {
        errorText.textContent = message;
        errorContainer.style.display = 'block';
        
        setTimeout(() => {
            hideError();
        }, 5000);
    } else {
        alert('Error: ' + message);
    }
}

function hideError() {
    const errorContainer = document.getElementById('errorContainer');
    if (errorContainer) {
        errorContainer.style.display = 'none';
    }
}

function hideLoadingSpinner() {
    const spinner = document.getElementById('loadingSpinner');
    const mainContent = document.getElementById('mainContent');
    
    if (spinner) {
        spinner.style.display = 'none';
    }
    if (mainContent) {
        mainContent.style.display = 'block';
    }
}

// === VERIFICACIÓN DE DEPENDENCIAS ===
function checkDependencies() {
    const requiredObjects = ['PortalDB', 'AuthSys', 'NotificationUtils', 'DateUtils', 'ModalUtils'];
    const missing = [];
    
    for (const obj of requiredObjects) {
        if (!window[obj]) {
            missing.push(obj);
        }
    }
    
    if (missing.length > 0) {
        showError(`Faltan dependencias: ${missing.join(', ')}. Por favor verifica que todos los archivos JS estén cargados.`);
        return false;
    }
    
    return true;
}

// === INICIALIZACIÓN ===
document.addEventListener('DOMContentLoaded', function() {
    console.log('🚀 Iniciando panel de consultor simplificado...');
    
    try {
        let retries = 0;
        const maxRetries = 10;
        
        const checkAndInit = () => {
            if (checkDependencies()) {
                initializeConsultor();
            } else {
                retries++;
                if (retries < maxRetries) {
                    console.log(`Reintentando carga de dependencias (${retries}/${maxRetries})...`);
                    setTimeout(checkAndInit, 500);
                } else {
                    showError('Error crítico: No se pudieron cargar las dependencias necesarias. Recarga la página.');
                }
            }
        };
        
        checkAndInit();
        
    } catch (error) {
        console.error('Error durante la inicialización:', error);
        showError('Error durante la inicialización: ' + error.message);
    }
});

function initializeConsultor() {
    try {
        console.log('✅ Dependencias cargadas, verificando autenticación...');
        
        // Verificar autenticación
        if (!window.AuthSys || !window.AuthSys.isAuthenticated()) {
            console.error('❌ Usuario no autenticado');
            showError('Sesión no válida. Redirigiendo al login...');
            setTimeout(() => {
                window.location.href = '../index.html';
            }, 2000);
            return;
        }
        
        currentUser = window.AuthSys.getCurrentUser();
        
        if (!currentUser) {
            console.error('❌ No se pudo obtener información del usuario');
            showError('Error al obtener información del usuario');
            return;
        }
        
        if (currentUser.role !== 'consultor') {
            console.error('❌ Usuario no es consultor:', currentUser.role);
            showError('Acceso denegado: No tienes permisos de consultor');
            setTimeout(() => {
                window.AuthSys.logout();
            }, 2000);
            return;
        }
        
        console.log('✅ Usuario autenticado como consultor:', currentUser.name);
        
        // Inicializar panel
        setupConsultorPanel();
        setupEventListeners();
        loadUserAssignments();
        
        hideLoadingSpinner();
        isInitialized = true;
        
        console.log('🎉 Panel de consultor inicializado correctamente');
        
    } catch (error) {
        console.error('Error en initializeConsultor:', error);
        showError('Error de inicialización: ' + error.message);
    }
}

function setupConsultorPanel() {
    try {
        // Actualizar información del usuario
        const userNameElement = document.getElementById('consultorUserName');
        const userNameDisplay = document.getElementById('userNameDisplay');
        const userIdDisplay = document.getElementById('userIdDisplay');
        
        if (userNameElement) {
            userNameElement.textContent = currentUser.name;
        }
        if (userNameDisplay) {
            userNameDisplay.textContent = currentUser.name;
        }
        if (userIdDisplay) {
            userIdDisplay.textContent = currentUser.id;
        }
        
        // Configurar fecha actual en el modal
        const reportDateElement = document.getElementById('reportDate');
        if (reportDateElement) {
            const today = new Date().toISOString().split('T')[0];
            reportDateElement.value = today;
        }
        
        if (window.NotificationUtils) {
            window.NotificationUtils.success(`¡Bienvenido ${currentUser.name}!`, 3000);
        }
        
    } catch (error) {
        console.error('Error en setupConsultorPanel:', error);
        showError('Error al configurar panel: ' + error.message);
    }

    setTimeout(() => {
        updateRejectedReportsSection();
    }, 1000);
}

function setupEventListeners() {
    try {
        // Formulario de reportes
        const reportForm = document.getElementById('reportForm');
        if (reportForm) {
            reportForm.addEventListener('submit', handleCreateReport);
        }
        
        // Auto-refresh cada 30 segundos
        setInterval(() => {
            if (isInitialized) {
                loadUserAssignments();
            }
        }, 30000);
        
    } catch (error) {
        console.error('Error en setupEventListeners:', error);
        showError('Error al configurar eventos: ' + error.message);
    }
}

// === GESTIÓN DE ASIGNACIONES ===
function loadUserAssignments() {
    try {
        if (!currentUser || !window.PortalDB) {
            return;
        }
        
        console.log('🔄 Cargando asignaciones para usuario:', currentUser.id);
        
        // 🟦 OBTENER ASIGNACIONES DE SOPORTE
        const supportAssignments = window.PortalDB.getUserAssignments(currentUser.id);
        
        // 🟩 OBTENER ASIGNACIONES DE PROYECTO
        const allProjectAssignments = window.PortalDB.getProjectAssignments ? 
            Object.values(window.PortalDB.getProjectAssignments()) : [];
        const projectAssignments = allProjectAssignments.filter(assignment => 
            assignment.consultorId === currentUser.id && assignment.isActive
        );
        
        // Combinar ambos tipos en el array global
        userAssignments = [
            ...supportAssignments.map(a => ({...a, assignmentType: 'support'})),
            ...projectAssignments.map(a => ({...a, assignmentType: 'project'}))
        ];
        
        console.log(`📊 Encontradas: ${supportAssignments.length} asignaciones de soporte, ${projectAssignments.length} asignaciones de proyecto`);
        
        updateAssignmentsList();
        updateAssignmentsCount();
        
    } catch (error) {
        console.error('Error en loadUserAssignments:', error);
        showError('Error al cargar asignaciones: ' + error.message);
    }

    setTimeout(() => {
        updateRejectedReportsSection();
    }, 500);
}

function updateAssignmentsList() {
    try {
        const container = document.getElementById('assignmentsList');
        if (!container) return;
        
        if (userAssignments.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <div class="empty-state-icon">🎯</div>
                    <div class="empty-state-title">No hay asignaciones</div>
                    <div class="empty-state-desc">Las asignaciones del administrador aparecerán aquí</div>
                </div>
            `;
            return;
        }
        
        container.innerHTML = '';
        
        userAssignments.forEach(assignment => {
            const assignmentDiv = document.createElement('div');
            assignmentDiv.className = `assignment-card ${assignment.assignmentType}-assignment`;
            
            // Diferenciar entre soporte y proyecto
            if (assignment.assignmentType === 'support') {
                // 🟦 ASIGNACIÓN DE SOPORTE
                const company = window.PortalDB.getCompany(assignment.companyId);
                const support = window.PortalDB.getSupport(assignment.supportId);
                const module = window.PortalDB.getModule(assignment.moduleId);
                
                // Obtener reportes de esta asignación
                const assignmentReports = window.PortalDB.getReportsByAssignment(assignment.id);
                const totalHours = assignmentReports.reduce((sum, r) => sum + (parseFloat(r.hours) || 0), 0);
                
                assignmentDiv.innerHTML = `
                    <div class="assignment-header">
                        <h3 style="margin: 0; color: #2c3e50;">
                            🏢 ${company?.name || 'Empresa no encontrada'}
                            <span class="assignment-type-badge support-badge">📞 SOPORTE</span>
                        </h3>
                        <span class="assignment-id">${assignment.id.slice(-6)}</span>
                    </div>
                    
                    <div class="assignment-details">
                        <p><strong>📞 Soporte:</strong> ${support?.name || 'Soporte no encontrado'}</p>
                        <p><strong>🧩 Módulo:</strong> ${module?.name || 'Módulo no encontrado'}</p>
                        <p><strong>📊 Reportes:</strong> ${assignmentReports.length} reportes | <strong>⏰ Total:</strong> ${totalHours.toFixed(1)} hrs</p>
                        <p><small>📅 Asignado: ${window.DateUtils.formatDate(assignment.createdAt)}</small></p>
                    </div>
                    
                    <div class="assignment-actions">
                        <button class="btn btn-primary" onclick="openCreateReportModal('${assignment.id}')">
                            📝 Crear Ticket
                        </button>
                        <button class="btn btn-secondary" onclick="viewAssignmentReports('${assignment.id}')">
                            📊 Ver Ticket (${assignmentReports.length})
                        </button>
                    </div>
                `;
            } else {
                // 🟩 ASIGNACIÓN DE PROYECTO
                const company = window.PortalDB.getCompany(assignment.companyId);
                const project = window.PortalDB.getProject(assignment.projectId);
                const module = window.PortalDB.getModule(assignment.moduleId);
                
                // Obtener reportes de esta asignación de proyecto
                const assignmentReports = window.PortalDB.getReportsByAssignment(assignment.id);
                const totalHours = assignmentReports.reduce((sum, r) => sum + (parseFloat(r.hours) || 0), 0);
                
                assignmentDiv.innerHTML = `
                    <div class="assignment-header">
                        <h3 style="margin: 0; color: #2c3e50;">
                            🏢 ${company?.name || 'Empresa no encontrada'}
                            <span class="assignment-type-badge project-badge">🎯 PROYECTO</span>
                        </h3>
                        <span class="assignment-id">${assignment.id.slice(-8)}</span>
                    </div>
                    
                    <div class="assignment-details">
                        <p><strong>🎯 Proyecto:</strong> ${project?.name || 'Proyecto no encontrado'}</p>
                        <p><strong>🧩 Módulo:</strong> ${module?.name || 'Módulo no encontrado'}</p>
                        <p><strong>📊 Reportes:</strong> ${assignmentReports.length} reportes | <strong>⏰ Total:</strong> ${totalHours.toFixed(1)} hrs</p>
                        <p><small>📅 Asignado: ${window.DateUtils.formatDate(assignment.createdAt)}</small></p>
                    </div>
                    
                    <div class="assignment-actions">
                        <button class="btn btn-success" onclick="openProjectReportModal('${assignment.id}')">
                            📝 Crear Ticket
                        </button>
                        <button class="btn btn-secondary" onclick="viewAssignmentReports('${assignment.id}')">
                            📊 Ver Tickets (${assignmentReports.length})
                        </button>
                        <button class="btn btn-info" onclick="viewProjectDetails('${assignment.id}')">
                            ℹ️ Detalles del Proyecto
                        </button>
                    </div>
                `;
            }
            
            container.appendChild(assignmentDiv);
        });
        
    } catch (error) {
        console.error('Error en updateAssignmentsList:', error);
        container.innerHTML = `
            <div class="error-state">
                <div class="error-icon">⚠️</div>
                <div class="error-title">Error al cargar asignaciones</div>
                <div class="error-desc">Por favor, recarga la página</div>
            </div>
        `;
    }
}

function updateAssignmentsCount() {
    try {
        const countElement = document.getElementById('assignmentsCount');
        if (countElement) {
            countElement.textContent = userAssignments.length;
        }
    } catch (error) {
        console.error('Error en updateAssignmentsCount:', error);
    }
}

// === GESTIÓN DE REPORTES ===
function openCreateReportModal(assignmentId) {
    try {
        currentAssignmentId = assignmentId;
        const assignment = userAssignments.find(a => a.id === assignmentId);
        
        if (!assignment) {
            showError('Asignación no encontrada');
            return;
        }
        
        const company = window.PortalDB.getCompany(assignment.companyId);
        const module = window.PortalDB.getModule(assignment.moduleId);
        
        // NUEVO: Llenar información del empleado
        const employeeDisplay = document.getElementById('employeeDisplay');
        if (employeeDisplay) {
            employeeDisplay.innerHTML = `${currentUser.name} (ID: ${currentUser.id})`;
        }
        
        // Mostrar información de la asignación seleccionada (ACTUALIZADO)
        const assignmentInfoElement = document.getElementById('selectedAssignmentInfo');
        if (assignmentInfoElement) {
            let assignmentDetails = '';
            
            if (assignment.assignmentType === 'project') {
                const project = window.PortalDB.getProject(assignment.projectId);
                assignmentDetails = `
                    <h4>🎯 Proyecto</h4>
                    <p><strong>Empresa:</strong> ${company?.name || 'No encontrada'}</p>
                    <p><strong>Proyecto:</strong> ${project?.name || 'No encontrado'}</p>
                    <p><strong>Módulo:</strong> ${module?.name || 'No encontrado'}</p>
                `;
            } else {
                const support = window.PortalDB.getSupport(assignment.supportId);
                assignmentDetails = `
                    <h4>📞 Soporte</h4>
                    <p><strong>Empresa:</strong> ${company?.name || 'No encontrada'}</p>
                    <p><strong>Soporte:</strong> ${support?.name || 'No encontrado'}</p>
                    <p><strong>Módulo:</strong> ${module?.name || 'No encontrado'}</p>
                `;
            }
            
            assignmentInfoElement.innerHTML = assignmentDetails;
        }
        
        // Limpiar formulario y configurar fecha
        document.getElementById('reportForm').reset();
        const today = new Date().toISOString().split('T')[0];
        document.getElementById('reportDate').value = today;
        
        // Abrir modal
        openModal('createReportModal');
        
    } catch (error) {
        console.error('Error en openCreateReportModal:', error);
        showError('Error al abrir modal de ticket: ' + error.message);
    }
}

function getAssignmentDisplayInfo(assignmentId) {
    let assignmentInfo = {
        assignment: null,
        company: null,
        assignmentType: null,
        specificInfo: null, // soporte o proyecto
        module: null,
        displayData: null
    };
    
    try {
        // 1️⃣ BUSCAR EN ASIGNACIONES DE SOPORTE PRIMERO
        const supportAssignment = window.PortalDB.getAssignment(assignmentId);
        if (supportAssignment) {
            assignmentInfo.assignment = supportAssignment;
            assignmentInfo.company = window.PortalDB.getCompany(supportAssignment.companyId);
            assignmentInfo.specificInfo = window.PortalDB.getSupport(supportAssignment.supportId);
            assignmentInfo.module = window.PortalDB.getModule(supportAssignment.moduleId);
            assignmentInfo.assignmentType = 'support';
            
            // Datos para mostrar (igual que en tu dashboard)
            assignmentInfo.displayData = {
                typeIcon: '📞',
                typeName: 'SOPORTE',
                typeClass: 'support-badge',
                mainTitle: assignmentInfo.specificInfo?.name || 'Soporte no encontrado',
                companyName: assignmentInfo.company?.name || 'Empresa no encontrada',
                moduleName: assignmentInfo.module?.name || 'Módulo no encontrado'
            };
        } else {
            // 2️⃣ SI NO SE ENCUENTRA, BUSCAR EN ASIGNACIONES DE PROYECTO
            const projectAssignment = window.PortalDB.getProjectAssignment(assignmentId);
            if (projectAssignment) {
                assignmentInfo.assignment = projectAssignment;
                assignmentInfo.company = window.PortalDB.getCompany(projectAssignment.companyId);
                assignmentInfo.specificInfo = window.PortalDB.getProject(projectAssignment.projectId);
                assignmentInfo.module = window.PortalDB.getModule(projectAssignment.moduleId);
                assignmentInfo.assignmentType = 'project';
                
                // Datos para mostrar (igual que en tu dashboard)
                assignmentInfo.displayData = {
                    typeIcon: '📋',
                    typeName: 'PROYECTO',
                    typeClass: 'project-badge',
                    mainTitle: assignmentInfo.specificInfo?.name || 'Proyecto no encontrado',
                    companyName: assignmentInfo.company?.name || 'Empresa no encontrada',
                    moduleName: assignmentInfo.module?.name || 'Módulo no encontrado'
                };
            }
        }
    } catch (error) {
        console.error('Error obteniendo información de asignación:', error);
    }
    
    return assignmentInfo;
}

function handleCreateReport(event) {
    event.preventDefault();
    
    try {
        const modal = event.target.closest('.modal');
        const isEditing = modal?.dataset.isEditing === 'true';
        const editingReportId = modal?.dataset.editingReportId;
        
        // Obtener datos del formulario
        const formData = {
            title: document.getElementById('reportTitle')?.value?.trim(),
            description: document.getElementById('reportDescription')?.value?.trim(),
            hours: parseFloat(document.getElementById('reportHours')?.value),
            reportDate: document.getElementById('reportDate')?.value
        };
        
        // Validaciones comunes
        if (!formData.title || !formData.description || !formData.hours || !formData.reportDate) {
            showError('Todos los campos son obligatorios');
            return;
        }
        
        if (formData.hours <= 0 || formData.hours > 24) {
            showError('Las horas deben estar entre 0.5 y 24');
            return;
        }
        
        if (isEditing && editingReportId) {
            // ============================================================================
            // MODO EDICIÓN: SOLO GUARDAR CAMBIOS, NO REENVIAR
            // ============================================================================
            console.log('Guardando cambios en reporte rechazado:', editingReportId);
            
            const result = editRejectedReport(editingReportId, {
                title: formData.title,
                description: formData.description,
                hours: formData.hours,
                date: formData.reportDate
            });
            
            if (result.success) {
                // Limpiar modo edición
                cleanupEditingMode(modal);
                
                // Cerrar modal
                closeModal('createReportModal');
                
                // Mostrar mensaje específico para edición
                if (window.NotificationUtils) {
                    window.NotificationUtils.success('✏️ Cambios guardados. Puedes reenviar el ticket cuando estés listo.');
                }
                
                // Actualizar vistas
                setTimeout(() => {
                    loadUserAssignments();
                    if (typeof updateRejectedReportsSection === 'function') {
                        updateRejectedReportsSection();
                    }
                }, 500);
            }
            
        } else {
            // ============================================================================
            // MODO CREACIÓN: CREAR REPORTE NUEVO NORMAL
            // ============================================================================
            
            if (!currentAssignmentId) {
                showError('No se ha seleccionado una asignación');
                return;
            }
            
            const reportData = {
                userId: currentUser.id,
                assignmentId: currentAssignmentId,
                title: formData.title,
                description: formData.description,
                hours: formData.hours,
                reportDate: formData.reportDate
            };
            
            console.log('Creando reporte nuevo:', reportData);
            
            const result = window.PortalDB.createReport(reportData);
            
            if (result.success) {
                if (window.NotificationUtils) {
                    window.NotificationUtils.success('¡Ticket creado exitosamente!');
                }
                
                closeModal('createReportModal');
                loadUserAssignments();
                
                if (typeof updateRejectedReportsSection === 'function') {
                    updateRejectedReportsSection();
                }
            } else {
                showError('Error al crear ticket: ' + result.message);
            }
        }
        
    } catch (error) {
        console.error('Error en handleCreateReport:', error);
        showError('Error al procesar ticket: ' + error.message);
    }
}

function cleanupEditingMode(modal) {
    if (!modal) return;
    
    try {
        // Limpiar marcadores de edición
        modal.dataset.isEditing = 'false';
        modal.dataset.editingReportId = '';
        
        // Restaurar título original
        const modalTitle = modal.querySelector('.modal-title');
        if (modalTitle) {
            modalTitle.textContent = '📝 Crear Ticket de Horas';
        }
        
        // Restaurar botón original
        const submitButton = modal.querySelector('button[type="submit"]');
        if (submitButton) {
            submitButton.innerHTML = '📤 Enviar Ticket';
            submitButton.style.background = '';
            submitButton.style.borderColor = '';
            submitButton.classList.remove('editing-mode');
        }
        
        // Remover contenedores de edición
        const infoContainer = modal.querySelector('.editing-info');
        if (infoContainer) {
            infoContainer.remove();
        }
        
        const feedbackContainer = modal.querySelector('.rejection-feedback');
        if (feedbackContainer) {
            feedbackContainer.remove();
        }
        
    } catch (error) {
        console.error('Error limpiando modo edición:', error);
    }
}

function viewAssignmentReports(assignmentId) {
    try {
        const assignment = userAssignments.find(a => a.id === assignmentId);
        if (!assignment) {
            showError('Asignación no encontrada');
            return;
        }
        
        const company = window.PortalDB.getCompany(assignment.companyId);
        const module = window.PortalDB.getModule(assignment.moduleId);
        
        const reports = window.PortalDB.getReportsByAssignment(assignmentId);
        
        // Mostrar información de la asignación
        const assignmentInfoElement = document.getElementById('assignmentReportsInfo');
        if (assignmentInfoElement) {
            let assignmentDetails = '';
            
            // 🔄 DETECTAR TIPO DE ASIGNACIÓN Y MOSTRAR INFORMACIÓN CORRECTA
            if (assignment.assignmentType === 'project') {
                // 🟩 ASIGNACIÓN DE PROYECTO
                const project = window.PortalDB.getProject(assignment.projectId);
                assignmentDetails = `
                    <div class="assignment-info-display">
                        <h4>📋 Información de la Asignación</h4>
                        <p><strong>🏢 Empresa:</strong> ${company?.name || 'No encontrada'}</p>
                        <p><strong>🎯 Proyecto:</strong> ${project?.name || 'No encontrado'}</p>
                        <p><strong>🧩 Módulo:</strong> ${module?.name || 'No encontrado'}</p>
                        <p><strong>📝 Descripción:</strong> ${project?.description || 'Sin descripción'}</p>
                    </div>
                `;
            } else {
                // 🟦 ASIGNACIÓN DE SOPORTE
                const support = window.PortalDB.getSupport(assignment.supportId);
                assignmentDetails = `
                    <div class="assignment-info-display">
                        <h4>📋 Información de la Asignación</h4>
                        <p><strong>🏢 Empresa:</strong> ${company?.name || 'No encontrada'}</p>
                        <p><strong>📞 Soporte:</strong> ${support?.name || 'No encontrado'}</p>
                        <p><strong>🧩 Módulo:</strong> ${module?.name || 'No encontrado'}</p>
                        <p><strong>🔧 Tipo:</strong> ${support?.type || 'No especificado'}</p>
                        <p><strong>⚡ Prioridad:</strong> ${support?.priority || 'No definida'}</p>
                    </div>
                `;
            }
            
            assignmentInfoElement.innerHTML = assignmentDetails;
        }
        
        // Mostrar lista de reportes
        const reportsListElement = document.getElementById('reportsList');
        if (reportsListElement) {
            if (reports.length === 0) {
                reportsListElement.innerHTML = `
                    <div class="empty-state">
                        <div class="empty-state-icon">📄</div>
                        <div class="empty-state-title">No hay Tickets</div>
                        <div class="empty-state-desc">No has creado tickets para esta asignación</div>
                    </div>
                `;
            } else {
                reportsListElement.innerHTML = '<h4>📊 Tickets Enviados</h4>';
                
                // Ordenar reportes por fecha (más recientes primero)
                const sortedReports = reports.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
                
                sortedReports.forEach(report => {
                    const reportDiv = document.createElement('div');
                    reportDiv.className = 'report-item';
                    reportDiv.innerHTML = `
                        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
                            <h5 style="margin: 0; color: #2c3e50;">${report.title}</h5>
                            <span class="report-status status-${report.status.toLowerCase()}">${report.status}</span>
                        </div>
                        <p style="margin: 5px 0; color: #666; font-size: 0.9em;">
                            <strong>⏰ Horas:</strong> ${report.hours}h | 
                            <strong>📅 Fecha:</strong> ${window.DateUtils.formatDate(report.reportDate)} |
                            <strong>📤 Enviado:</strong> ${window.DateUtils.formatDateTime(report.createdAt)}
                        </p>
                        <p style="margin: 10px 0 0 0; color: #555; font-size: 0.9em; line-height: 1.4;">
                            ${report.description}
                        </p>
                        ${report.feedback ? `
                            <div style="background: #fff5f5; padding: 10px; border-radius: 6px; border-left: 3px solid #e74c3c; margin-top: 10px;">
                                <strong style="color: #e74c3c;">Comentarios de revisión:</strong>
                                <p style="margin: 5px 0 0 0; color: #666;">${report.feedback}</p>
                            </div>
                        ` : ''}
                    `;
                    reportsListElement.appendChild(reportDiv);
                });
            }
        }
        
        if (window.ModalUtils) {
            window.ModalUtils.open('viewReportsModal');
        }
        
    } catch (error) {
        console.error('Error en viewAssignmentReports:', error);
        showError('Error al ver reportes: ' + error.message);
    }
}

// === UTILIDADES MEJORADAS PARA MODALES ===
function closeModal(modalId) {
    try {
        const modal = document.getElementById(modalId);
        if (modal) {
            // Animación de salida
            modal.style.animation = 'fadeOut 0.3s ease';
            
            setTimeout(() => {
                modal.style.display = 'none';
                modal.style.animation = '';
                
                // Restaurar scroll del body
                document.body.style.overflow = 'auto';
                
                // Limpiar formularios
                const forms = modal.querySelectorAll('form');
                forms.forEach(form => form.reset());
            }, 300);
        }
        
        // Limpiar variables de estado
        if (modalId === 'createReportModal') {
            currentAssignmentId = null;
        }
        
    } catch (error) {
        console.error('Error en closeModal:', error);
    }
}

// Función mejorada para abrir modales
function openModal(modalId) {
    try {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.style.display = 'block';
            
            // Prevenir scroll del body cuando el modal está abierto
            document.body.style.overflow = 'hidden';
            
            // Focus en el primer input del modal
            const firstInput = modal.querySelector('input, select, textarea');
            if (firstInput) {
                setTimeout(() => firstInput.focus(), 100);
            }
        }
    } catch (error) {
        console.error('Error en openModal:', error);
    }
}

function logout() {
    try {
        if (confirm('¿Está seguro de cerrar sesión?')) {
            if (window.AuthSys) {
                window.AuthSys.logout();
            } else {
                window.location.href = '../index.html';
            }
        }
    } catch (error) {
        console.error('Error en logout:', error);
        window.location.href = '../index.html';
    }
}

// === FUNCIONES AUXILIARES PARA PROYECTOS ===
function openProjectReportModal(projectAssignmentId) {
    console.log('Abriendo modal de reporte para proyecto:', projectAssignmentId);
    // ✅ CORRECTO: Usar la función que realmente existe
    openCreateReportModal(projectAssignmentId);
}

function viewProjectDetails(projectAssignmentId) {
    const assignment = userAssignments.find(a => a.id === projectAssignmentId);
    if (!assignment) {
        window.NotificationUtils.error('No se encontró la asignación del proyecto');
        return;
    }
    
    const project = window.PortalDB.getProject(assignment.projectId);
    const company = window.PortalDB.getCompany(assignment.companyId);
    const module = window.PortalDB.getModule(assignment.moduleId);
    
    const details = `
🎯 DETALLES DEL PROYECTO
════════════════════════════
📋 Proyecto: ${project?.name || 'No encontrado'}
🏢 Cliente: ${company?.name || 'No encontrado'}  
🧩 Módulo: ${module?.name || 'No encontrado'}
📝 Descripción: ${project?.description || 'Sin descripción'}
📅 Fecha de asignación: ${window.DateUtils.formatDate(assignment.createdAt)}
🆔 ID de asignación: ${assignment.id}
    `;
    
    // Crear un modal personalizado o usar notificación
    if (window.ModalUtils && window.ModalUtils.showInfo) {
        window.ModalUtils.showInfo('Detalles del Proyecto', details);
    } else {
        alert(details);
    }
}

// === ACTUALIZAR CONTADOR EN SIDEBAR ===
function updateAssignmentsCount() {
    const badge = document.getElementById('assignmentsCount');
    if (badge) {
        badge.textContent = userAssignments.length;
    }
}

// ============================================================================
// SISTEMA DE REPORTES RECHAZADOS
// ============================================================================

/**
 * Cargar reportes rechazados del usuario actual
 */
function loadRejectedReports() {
    try {
        if (!currentUser || !window.PortalDB) {
            console.error('Usuario no autenticado o PortalDB no disponible');
            return [];
        }
        
        // Obtener todos los reportes del usuario
        const allReports = window.PortalDB.getReportsByUser ? 
                          window.PortalDB.getReportsByUser(currentUser.id) : 
                          Object.values(window.PortalDB.getReports()).filter(r => r.userId === currentUser.id);
        
        // Filtrar solo los rechazados
        const rejectedReports = allReports.filter(report => report.status === 'Rechazado');
        
        console.log(`📄 Reportes rechazados encontrados: ${rejectedReports.length}`);
        console.log('📋 Reportes rechazados:', rejectedReports);
        
        return rejectedReports;
    } catch (error) {
        console.error('Error cargando reportes rechazados:', error);
        return [];
    }
}

/**
 * Editar un reporte rechazado
 */
function editRejectedReport(reportId, updateData) {
    try {
        if (!currentUser || !window.PortalDB) {
            throw new Error('Usuario no autenticado o PortalDB no disponible');
        }
        
        const reports = window.PortalDB.getReports();
        const report = reports[reportId];
        
        if (!report) {
            throw new Error('Reporte no encontrado');
        }
        
        if (report.userId !== currentUser.id) {
            throw new Error('No tienes permisos para editar este reporte');
        }
        
        if (report.status !== 'Rechazado') {
            throw new Error('Solo se pueden editar reportes rechazados');
        }
        
        // Validaciones
        if (!updateData.title || !updateData.description || !updateData.hours || !updateData.date) {
            throw new Error('Todos los campos son obligatorios');
        }
        
        if (updateData.hours < 0.5 || updateData.hours > 24) {
            throw new Error('Las horas deben estar entre 0.5 y 24');
        }
        
        // IMPORTANTE: Solo actualizar datos, mantener status "Rechazado"
        const result = window.PortalDB.updateReport(reportId, {
            ...updateData,
            // NO cambiar el status aquí, eso lo hace resubmitReport
            updatedAt: new Date().toISOString()
        });
        
        if (result.success) {
            console.log('Cambios guardados en reporte rechazado:', reportId);
            return result;
        } else {
            throw new Error(result.message);
        }
        
    } catch (error) {
        console.error('Error editando reporte:', error);
        return { success: false, message: error.message };
    }
}

/**
 * Reenviar un reporte rechazado
 */
function resubmitRejectedReport(reportId, updateData = {}) {
    try {
        if (!currentUser || !window.PortalDB) {
            throw new Error('Usuario no autenticado o PortalDB no disponible');
        }
        
        // Validar que el reporte pertenece al usuario actual
        const reports = window.PortalDB.getReports();
        const report = reports[reportId];
        
        if (!report) {
            throw new Error('Ticket no encontrado');
        }
        
        if (report.userId !== currentUser.id) {
            throw new Error('No tienes permisos para reenviar este ticket');
        }
        
        // Reenviar reporte
        const result = window.PortalDB.resubmitReport(reportId, updateData);
        
        if (result.success) {
            if (window.NotificationUtils) {
                window.NotificationUtils.success('Ticket reenviado al administrador para revisión');
            }
            
            // Actualizar la vista si existe
            if (typeof loadUserAssignments === 'function') {
                loadUserAssignments();
            }
            
            return result;
        } else {
            throw new Error(result.message);
        }
        
    } catch (error) {
        console.error('Error reenviando reporte:', error);
        if (window.NotificationUtils) {
            window.NotificationUtils.error('Error: ' + error.message);
        }
        return { success: false, message: error.message };
    }
}

/**
 * Abrir modal para editar reporte rechazado
 */
function openEditRejectedReportModal(reportId) {
    try {
        const reports = window.PortalDB.getReports();
        const report = reports[reportId];
        
        if (!report) {
            if (window.NotificationUtils) {
                window.NotificationUtils.error('Ticket no encontrado');
            } else {
                showError('Ticket no encontrado');
            }
            return;
        }
        
        // Pre-llenar formulario
        document.getElementById('reportTitle').value = report.title;
        document.getElementById('reportDescription').value = report.description;
        document.getElementById('reportHours').value = report.hours;
        document.getElementById('reportDate').value = report.reportDate || report.date;
        
        // NUEVO: Llenar información del empleado
        const employeeDisplay = document.getElementById('employeeDisplay');
        if (employeeDisplay) {
            employeeDisplay.innerHTML = `${currentUser.name} (ID: ${currentUser.id})`;
        }
        
        // NUEVO: Mostrar información de asignación para reportes rechazados
        const assignmentInfo = getAssignmentDisplayInfo(report.assignmentId);
        const assignmentInfoElement = document.getElementById('selectedAssignmentInfo');
        
        if (assignmentInfoElement && assignmentInfo.displayData) {
            const displayData = assignmentInfo.displayData;
            assignmentInfoElement.innerHTML = `
                <h4>${assignmentInfo.assignmentType === 'support' ? '📞 Soporte' : '🎯 Proyecto'}</h4>
                <p><strong>Empresa:</strong> ${displayData.companyName}</p>
                <p><strong>${assignmentInfo.assignmentType === 'support' ? 'Soporte:' : 'Proyecto:'}</strong> ${displayData.mainTitle}</p>
                <p><strong>Módulo:</strong> ${displayData.moduleName}</p>
            `;
        }
        
        // Marcar como edición
        const modal = document.getElementById('createReportModal');
        if (modal) {
            modal.dataset.editingReportId = reportId;
            modal.dataset.isEditing = 'true';
            
            // Cambiar título del modal
            const modalTitle = modal.querySelector('.modal-title');
            if (modalTitle) {
                modalTitle.textContent = '✏️ Editar Ticket Rechazado';
            }
            
            // Modificar botón de submit
            const submitButton = modal.querySelector('.btn-submit');
            if (submitButton) {
                submitButton.innerHTML = '💾 Guardar Cambios';
                submitButton.style.background = '#ffa502';
            }
            
            // Agregar información de edición
            let infoContainer = modal.querySelector('.editing-info');
            if (!infoContainer) {
                infoContainer = document.createElement('div');
                infoContainer.className = 'editing-info';
                const modalBody = modal.querySelector('.modal-body');
                if (modalBody) {
                    modalBody.insertBefore(infoContainer, modalBody.firstChild);
                }
            }
            
            infoContainer.innerHTML = `
                <h4>ℹ️ Modo de Edición</h4>
                <p>Puedes modificar los datos del reporte. Al guardar los cambios, el reporte seguirá en estado "Rechazado". Después podrás usar el botón "🔄 Reenviar" para enviarlo al administrador.</p>
            `;
            
            // Mostrar feedback de rechazo
            let feedbackContainer = modal.querySelector('.rejection-feedback');
            if (!feedbackContainer) {
                feedbackContainer = document.createElement('div');
                feedbackContainer.className = 'rejection-feedback';
                const modalBody = modal.querySelector('.modal-body');
                if (modalBody && infoContainer.nextSibling) {
                    modalBody.insertBefore(feedbackContainer, infoContainer.nextSibling);
                }
            }
            
            feedbackContainer.innerHTML = `
                <strong>💬 Comentarios del Administrador:</strong><br>
                <span>${report.feedback || 'Sin comentarios'}</span>
            `;
            
            // Abrir modal
            openModal('createReportModal');
        }
        
    } catch (error) {
        console.error('Error abriendo modal de edición:', error);
        showError('Error al abrir editor de ticket: ' + error.message);
    }
}

/**
 * Reenvío rápido de reporte sin edición
 */
function quickResubmitReport(reportId) {
    // Confirmación más clara
    if (!confirm('¿Estás seguro de que quieres reenviar este ticket al administrador para nueva revisión?\n\nEl reporte cambiará de estado "Rechazado" a "Pendiente".')) {
        return;
    }
    
    const result = resubmitRejectedReport(reportId);
    
    if (result.success) {
        // Mensaje más claro
        if (window.NotificationUtils) {
            window.NotificationUtils.success('🔄 Reporte reenviado exitosamente. El administrador lo revisará nuevamente.');
        }
        
        // Actualizar la vista
        setTimeout(() => {
            if (typeof loadUserAssignments === 'function') {
                loadUserAssignments();
            }
            if (typeof updateRejectedReportsSection === 'function') {
                updateRejectedReportsSection();
            }
        }, 500);
    }
}

/**
 * Actualizar la sección de reportes rechazados en la vista
 */
function updateRejectedReportsSection() {
    try {
        const container = document.getElementById('rejectedReportsSection');
        if (!container) {
            console.log('Container rejectedReportsSection no encontrado');
            return;
        }
        
        const rejectedReports = loadRejectedReports();
        
        if (rejectedReports.length === 0) {
            container.innerHTML = `
                <div class="section-header" style="margin-bottom: 20px; text-align: center;">
                    <h3 style="color: #2ed573; margin-bottom: 10px;">
                        🎉 ¡Excelente trabajo!
                    </h3>
                    <p style="color: #666;">
                        No tienes tickets rechazados actualmente.
                    </p>
                </div>
            `;
            return;
        }
        
        container.innerHTML = `
            <div class="section-header" style="margin-bottom: 20px;">
                <h3 style="color: #ff4757; margin-bottom: 10px;">
                    ❌ Tickets Rechazados (${rejectedReports.length})
                </h3>
                <p style="color: #666; margin-bottom: 20px;">
                    Estos tickets fueron rechazados por el administrador. Tienen el mismo formato que tus asignaciones normales, solo que aparecen marcados como rechazados.
                </p>
            </div>
            
            <div class="rejected-reports-grid" style="display: grid; grid-template-columns: repeat(auto-fill, minmax(350px, 1fr)); gap: 20px;">
                ${rejectedReports.map(report => renderRejectedReportCard(report)).join('')}
            </div>
        `;
        
        console.log('✅ Sección de reportes rechazados actualizada');
        
    } catch (error) {
        console.error('Error en updateRejectedReportsSection:', error);
    }
}

/**
 * Renderizar tarjeta de reporte rechazado
 */
function renderRejectedReportCard(report) {
    // Obtener información completa de la asignación
    const assignmentInfo = getAssignmentDisplayInfo(report.assignmentId);
    const displayData = assignmentInfo.displayData;
    
    // Si no se encuentra la asignación, mostrar datos básicos
    if (!displayData) {
        return `
            <div class="report-card rejected-report" style="
                background: white; 
                border: 1px solid #e1e8ed; 
                border-left: 4px solid #ff4757;
                border-radius: 8px; 
                padding: 20px; 
                box-shadow: 0 2px 8px rgba(0,0,0,0.1);
            ">
                <div class="report-header" style="margin-bottom: 15px;">
                    <h4 style="color: #2c3e50; margin-bottom: 8px;">${report.title || 'Título no disponible'}</h4>
                    <div style="display: flex; gap: 15px; font-size: 0.9em; color: #7f8c8d;">
                        <span>📅 ${formatReportDate(report)}</span>
                        <span style="background: #ff4757; color: white; padding: 2px 8px; border-radius: 12px;">⏰ ${report.hours || 0}h</span>
                    </div>
                </div>
                
                <div class="assignment-info" style="background: #f8f9fa; padding: 12px; border-radius: 6px; margin-bottom: 15px;">
                    <strong>⚠️ Asignación:</strong> No encontrada<br>
                    <strong>📄 ID:</strong> ${report.assignmentId}
                </div>
                
                ${renderRejectionFeedback(report)}
                ${renderReportActions(report.id)}
            </div>
        `;
    }
    
    // Renderizar tarjeta con EXACTAMENTE el mismo formato que el dashboard
    return `
        <div class="report-card rejected-report assignment-card ${assignmentInfo.assignmentType}-assignment" style="
            background: white; 
            border: 1px solid #e1e8ed; 
            border-left: 4px solid #ff4757;
            border-radius: 8px; 
            padding: 20px; 
            box-shadow: 0 2px 8px rgba(0,0,0,0.1);
            position: relative;
        ">
            <!-- Status de Rechazado -->
            <div style="position: absolute; top: 10px; right: 15px; background: #ff4757; color: white; padding: 4px 8px; border-radius: 12px; font-size: 0.8em; font-weight: bold;">
                ❌ RECHAZADO
            </div>
            
            <!-- Header igual que en dashboard -->
            <div class="assignment-header" style="margin-bottom: 15px; margin-top: 20px;">
                <h3 style="margin: 0; color: #2c3e50; display: flex; align-items: center; gap: 10px;">
                    🏢 ${displayData.companyName}
                    <span class="assignment-type-badge ${displayData.typeClass}" style="
                        display: inline-block; padding: 4px 8px; border-radius: 12px; 
                        font-size: 0.75em; font-weight: bold; text-transform: uppercase;
                        background: ${assignmentInfo.assignmentType === 'support' ? '#3498db' : '#e74c3c'};
                        color: white;
                    ">
                        ${displayData.typeIcon} ${displayData.typeName}
                    </span>
                </h3>
            </div>
            
            <!-- Detalles de la asignación (igual que dashboard) -->
            <div class="assignment-details" style="margin-bottom: 15px;">
                <p><strong>${assignmentInfo.assignmentType === 'support' ? '📞 Soporte:' : '🎯 Proyecto:'}</strong> ${displayData.mainTitle}</p>
                <p><strong>🧩 Módulo:</strong> ${displayData.moduleName}</p>
                <p><strong>📄 Ticket:</strong> ${report.title}</p>
                <p><strong>⏰ Horas:</strong> ${report.hours || 0} hrs | <strong>📅 Fecha:</strong> ${formatReportDate(report)}</p>
            </div>
            
            <!-- Feedback de rechazo -->
            ${renderRejectionFeedback(report)}
            
            <!-- Acciones -->
            ${renderReportActions(report.id)}
        </div>
    `;
}

function formatReportDate(report) {
    try {
        if (report.reportDate) {
            return new Date(report.reportDate).toLocaleDateString('es-ES');
        } else if (report.date) {
            return new Date(report.date).toLocaleDateString('es-ES');
        } else if (report.createdAt) {
            return new Date(report.createdAt).toLocaleDateString('es-ES');
        }
        return 'Fecha no disponible';
    } catch (error) {
        return 'Fecha inválida';
    }
}

function renderRejectionFeedback(report) {
    if (!report.feedback) {
        return '';
    }
    
    return `
        <div class="rejection-feedback" style="
            background: #ffe3e3; 
            border: 1px solid #ff4757; 
            border-radius: 6px; 
            padding: 12px; 
            margin-bottom: 15px;
        ">
            <strong style="color: #ff4757;">💬 Comentarios del Administrador:</strong><br>
            <span style="color: #721c24;">${report.feedback}</span>
        </div>
    `;
}

function renderReportActions(reportId) {
    return `
        <div class="assignment-actions report-actions" style="display: flex; gap: 10px; justify-content: flex-end; margin-top: 15px;">
            <button class="btn btn-primary" onclick="openEditRejectedReportModal('${reportId}')" style="
                background: #ffa502; 
                color: white; 
                border: none; 
                padding: 8px 16px; 
                border-radius: 6px; 
                cursor: pointer;
            ">
                ✏️ Editar
            </button>
            <button class="btn btn-secondary" onclick="quickResubmitReport('${reportId}')" style="
                background: #2ed573; 
                color: white; 
                border: none; 
                padding: 8px 16px; 
                border-radius: 6px; 
                cursor: pointer;
            ">
                🔄 Reenviar
            </button>
        </div>
    `;
}

// Exportar nuevas funciones
window.getAssignmentDisplayInfo = getAssignmentDisplayInfo;
window.renderRejectedReportCard = renderRejectedReportCard;
window.updateRejectedReportsSection = updateRejectedReportsSection;
window.formatReportDate = formatReportDate;

// Exportar funciones globalmente
window.loadRejectedReports = loadRejectedReports;
window.editRejectedReport = editRejectedReport;
window.resubmitRejectedReport = resubmitRejectedReport;
window.openEditRejectedReportModal = openEditRejectedReportModal;
window.quickResubmitReport = quickResubmitReport;
window.cleanupEditingMode = cleanupEditingMode;

// === FUNCIONES EXPORTADAS GLOBALMENTE ===
window.openCreateReportModal = openCreateReportModal;
window.viewAssignmentReports = viewAssignmentReports;
window.closeModal = closeModal;
window.logout = logout;
window.hideError = hideError;

window.openProjectReportModal = openProjectReportModal;
window.viewProjectDetails = viewProjectDetails;

console.log('✅ Funciones del consultor exportadas globalmente');