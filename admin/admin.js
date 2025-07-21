/// === GESTIÓN DE ASIGNACIONES ===
function createAssignment() {
    const userId = document.getElementById('assignUser').value;
    const companyId = document.getElementById('assignCompany').value;
    const projectId = document.getElementById('assignProject').value;
    const taskId = document.getElementById('assignTask').value;
    const moduleId = document.getElementById('assignModule').value;
    
    if (!userId || !companyId || !projectId || !taskId || !moduleId) {
        window.NotificationUtils.error('Todos los campos son requeridos para crear una asignación');
        return;
    }

    const assignmentData = {
        userId: userId,
        companyId: companyId,
        projectId: projectId,
        taskId: taskId,
        moduleId: moduleId
    };

    const result = window.PortalDB.createAssignment(assignmentData);
    
    if (result.success) {
        const user = currentData.users[userId];
        const company = currentData.companies[companyId];
        const project = currentData.projects[projectId];
        const task = currentData.tasks[taskId];
        const module = currentData.modules[moduleId];
        
        window.NotificationUtils.success(
            `Asignación creada: ${user.name} → ${company.name} (${project.name} - ${task.name} - ${module.name})`
        );
        
        // Limpiar formulario
        document.getElementById('assignUser').value = '';
        document.getElementById('assignCompany').value = '';
        document.getElementById('assignProject').value = '';
        document.getElementById('assignTask').value = '';
        document.getElementById('assignModule').value = '';
        
        loadAllData();
    } else {
        window.NotificationUtils.error('Error al crear asignación: ' + result.message);
    }
}

function deleteAssignment(assignmentId) {
    if (!confirm('¿Está seguro de eliminar esta asignación?')) {
        return;
    }

    const result = window.PortalDB.deleteAssignment(assignmentId);
    
    if (result.success) {
        window.NotificationUtils.success('Asignación eliminada correctamente');
        loadAllData();
    } else {
        window.NotificationUtils.error('Error al eliminar asignación: ' + result.message);
    }
}

// === CARGA Y ACTUALIZACIÓN DE DATOS ===
function loadAllData() {
    currentData.users = window.PortalDB.getUsers();
    currentData.companies = window.PortalDB.getCompanies();
    currentData.projects = window.PortalDB.getProjects();
    currentData.assignments = window.PortalDB.getAssignments();
    currentData.tasks = window.PortalDB.getTasks() || {};
    currentData.modules = window.PortalDB.getModules() || {};
    currentData.reports = window.PortalDB.getReports() || {};
    
    updateUI();
}

function updateUI() {
    //updateStats();
    updateSidebarCounts();
    updateCurrentSectionData();
    updateDropdowns();
}

function updateCurrentSectionData() {
    switch(currentSection) {
        case 'usuarios':
            updateUsersList();
            break;
        case 'empresas':
            updateCompaniesList();
            break;
        case 'proyectos':
            updateProjectsList();
            break;
        case 'tareas':
            updateTasksList();
            break;
        case 'modulos':
            updateModulesList();
            break;
        case 'lista-asignaciones':
        case 'asignaciones-recientes':
            updateAssignmentsList();
            break;
        case 'reportes-pendientes':
            updateReportsList();
            break;
        case 'reportes-aprobados':
             updateApprovedReportsList();
            break;
    }
}

function updateStats() {
    /*
    const stats = window.PortalDB.getStats();

    document.getElementById('usersCount').textContent = stats.totalUsers;
    document.getElementById('companiesCount').textContent = stats.totalCompanies;
    document.getElementById('projectsCount').textContent = stats.totalProjects;
    document.getElementById('assignmentsCount').textContent = stats.totalAssignments;
    */
}

function updateSidebarCounts() {
    const consultorUsers = Object.values(currentData.users).filter(user => 
        user.role === 'consultor' && user.isActive !== false
    );
    const companies = Object.values(currentData.companies);
    const projects = Object.values(currentData.projects);
    const assignments = Object.values(currentData.assignments).filter(a => a.isActive);
    const tasks = Object.values(currentData.tasks);
    const modules = Object.values(currentData.modules);
    const reports = Object.values(currentData.reports);

    // Calcular contadores específicos
    const pendingReports = reports.filter(r => r.status === 'Pendiente');
    const approvedReports = reports.filter(r => r.status === 'Aprobado');

    // Actualizar contadores en el sidebar
    const generatedReports = Object.values(window.PortalDB.getGeneratedReports());
    const sidebarElements = {
    'sidebarUsersCount': consultorUsers.length,
    'sidebarCompaniesCount': companies.length,
    'sidebarProjectsCount': projects.length,
    'sidebarTasksCount': tasks.length,
    'sidebarModulesCount': modules.length,
    'sidebarAssignmentsCount': assignments.length,
    'sidebarReportsCount': pendingReports.length,
    'sidebarApprovedReportsCount': approvedReports.length,
    'sidebarGeneratedReportsCount': generatedReports.length
    };

    Object.entries(sidebarElements).forEach(([elementId, count]) => {
        const element = document.getElementById(elementId);
        if (element) {
            element.textContent = count;
            console.log(`✅ Actualizado ${elementId}: ${count}`);
        } else {
            console.warn(`⚠️ Elemento no encontrado: ${elementId}`);
        }
    });

    // Debug específico para reportes aprobados
    console.log('🔍 Debug reportes aprobados:', {
        totalReports: reports.length,
        pendingReports: pendingReports.length,
        approvedReports: approvedReports.length,
        approvedElement: !!document.getElementById('sidebarApprovedReportsCount')
    });
}

function updateApprovedReportsList() {
    const approvedReportsTableBody = document.getElementById('approvedReportsTableBody');
    const timeFilter = document.getElementById('timeFilter');
    const customDateRange = document.getElementById('customDateRange');
    const startDate = document.getElementById('startDate');
    const endDate = document.getElementById('endDate');
    const filterInfo = document.getElementById('filterInfo');
    
    if (!approvedReportsTableBody) return;
    
    // Mostrar/ocultar rango personalizado
    if (timeFilter && customDateRange) {
        if (timeFilter.value === 'custom') {
            customDateRange.style.display = 'flex';
        } else {
            customDateRange.style.display = 'none';
        }
    }
    
    const reports = Object.values(currentData.reports);
    const approvedReports = reports.filter(r => r.status === 'Aprobado');
    
    // Filtrar reportes por fecha
    let filteredReports = [];
    const now = new Date();
    let filterText = '';
    
    if (timeFilter) {
        switch(timeFilter.value) {
            case 'week':
                const startOfWeek = new Date(now);
                startOfWeek.setDate(now.getDate() - now.getDay()); // Domingo
                startOfWeek.setHours(0, 0, 0, 0);
                
                const endOfWeek = new Date(startOfWeek);
                endOfWeek.setDate(startOfWeek.getDate() + 6); // Sábado
                endOfWeek.setHours(23, 59, 59, 999);
                
                filteredReports = approvedReports.filter(report => {
                    const reportDate = new Date(report.createdAt);
                    return reportDate >= startOfWeek && reportDate <= endOfWeek;
                });
                
                filterText = `Esta semana (${window.DateUtils.formatDate(startOfWeek)} - ${window.DateUtils.formatDate(endOfWeek)})`;
                break;
                
            case 'month':
                const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
                const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
                endOfMonth.setHours(23, 59, 59, 999);
                
                filteredReports = approvedReports.filter(report => {
                    const reportDate = new Date(report.createdAt);
                    return reportDate >= startOfMonth && reportDate <= endOfMonth;
                });
                
                const monthNames = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
                    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
                filterText = `${monthNames[now.getMonth()]} ${now.getFullYear()}`;
                break;
                
            case 'custom':
                if (startDate && endDate && startDate.value && endDate.value) {
                    const customStart = new Date(startDate.value);
                    customStart.setHours(0, 0, 0, 0);
                    
                    const customEnd = new Date(endDate.value);
                    customEnd.setHours(23, 59, 59, 999);
                    
                    filteredReports = approvedReports.filter(report => {
                        const reportDate = new Date(report.createdAt);
                        return reportDate >= customStart && reportDate <= customEnd;
                    });
                    
                    filterText = `${window.DateUtils.formatDate(customStart)} - ${window.DateUtils.formatDate(customEnd)}`;
                } else {
                    filteredReports = approvedReports;
                    filterText = 'Rango personalizado (seleccione fechas)';
                }
                break;
                
            default: // 'all'
                filteredReports = approvedReports;
                filterText = 'Todas las fechas';
                break;
        }
    } else {
        filteredReports = approvedReports;
        filterText = 'Esta semana';
    }
    
    // Actualizar texto informativo
    if (filterInfo) {
        filterInfo.textContent = `Mostrando: ${filterText}`;
    }
    
    if (filteredReports.length === 0) {
        approvedReportsTableBody.innerHTML = `
            <tr>
                <td colspan="8" class="empty-table-message">
                    <div class="empty-state">
                        <div class="empty-state-icon">✅</div>
                        <div class="empty-state-title">No hay reportes aprobados</div>
                        <div class="empty-state-desc">No se encontraron reportes aprobados en el período seleccionado</div>
                    </div>
                </td>
            </tr>
        `;
        return;
    }
    
    // *** CAMBIO PRINCIPAL: Agrupar por ASIGNACIÓN, no por usuario ***
    const assignmentSummary = {};
    
    filteredReports.forEach(report => {
        const user = currentData.users[report.userId];
        
        // Determinar la asignación específica del reporte
        let assignment = null;
        if (report.assignmentId) {
            // Nuevo sistema: reporte vinculado a asignación específica
            assignment = currentData.assignments[report.assignmentId];
        } else {
            // Sistema legado: buscar primera asignación activa del usuario
            assignment = Object.values(currentData.assignments).find(a => 
                a.userId === report.userId && a.isActive
            );
        }
        
        if (user && assignment) {
            // Usar assignmentId como clave única para agrupar
            const key = assignment.id;
            
            if (!assignmentSummary[key]) {
                const company = currentData.companies[assignment.companyId];
                const project = currentData.projects[assignment.projectId];
                const task = currentData.tasks[assignment.taskId];
                const module = currentData.modules[assignment.moduleId];
                
                assignmentSummary[key] = {
                    assignmentId: assignment.id,
                    consultantId: user.id,
                    consultantName: user.name,
                    companyId: assignment.companyId,
                    companyName: company ? company.name : 'No asignado',
                    projectName: project ? project.name : 'No asignado',
                    taskName: task ? task.name : 'No asignada',
                    moduleName: module ? module.name : 'No asignado',
                    totalHours: 0
                };
            }
            
            // Acumular horas por asignación específica
            assignmentSummary[key].totalHours += parseFloat(report.hours || 0);
        }
    });
    
    // Generar tabla agrupada por asignación
    approvedReportsTableBody.innerHTML = '';
    Object.values(assignmentSummary).forEach(summary => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td><span class="consultant-id">${summary.consultantId}</span></td>
            <td><span class="consultant-name">${summary.consultantName}</span></td>
            <td><span class="consultant-id">${summary.companyId}</span></td>
            <td><span class="company-name">${summary.companyName}</span></td>
            <td><span class="project-name">${summary.projectName}</span></td>
            <td>${summary.taskName}</td>
            <td>${summary.moduleName}</td>
            <td><span class="hours-reported">${summary.totalHours.toFixed(1)} hrs</span></td>
        `;
        approvedReportsTableBody.appendChild(row);
    });
}
function updateCompaniesList() {
    const container = document.getElementById('companiesList');
    const companies = Object.values(currentData.companies);
    
    if (companies.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <div class="empty-state-icon">🏢</div>
                <div class="empty-state-title">No hay empresas</div>
                <div class="empty-state-desc">Registre la primera empresa cliente</div>
            </div>
        `;
        return;
    }
    
    container.innerHTML = '';
    companies.forEach(company => {
        const companyDiv = document.createElement('div');
        companyDiv.className = 'item hover-lift';
        companyDiv.innerHTML = `
            <div>
                <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 5px;">
                    <span class="item-id">${company.id}</span>
                    <strong>${company.name}</strong>
                </div>
                <small style="color: #666;">
                    📅 Registrada: ${window.DateUtils.formatDate(company.createdAt)}
                    ${company.description ? `<br>📝 ${window.TextUtils.truncate(company.description, 60)}` : ''}
                </small>
            </div>
            <button class="delete-btn" onclick="deleteCompany('${company.id}')" title="Eliminar empresa">
                🗑️
            </button>
        `;
        container.appendChild(companyDiv);
    });
}

// === FUNCIONES FALTANTES QUE NECESITAS AGREGAR A TU ADMIN.JS ===

// Agregar estas funciones DESPUÉS de la función updateCompaniesList()

function updateProjectsList() {
    const container = document.getElementById('projectsList');
    const projects = Object.values(currentData.projects);
    
    if (projects.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <div class="empty-state-icon">📋</div>
                <div class="empty-state-title">No hay proyectos</div>
                <div class="empty-state-desc">Cree el primer proyecto</div>
            </div>
        `;
        return;
    }
    
    container.innerHTML = '';
    projects.forEach(project => {
        const projectDiv = document.createElement('div');
        projectDiv.className = 'item hover-lift';
        
        // Determinar color del estado
        const statusColors = {
            'Planificación': '#f39c12',
            'En Progreso': '#3498db',
            'En Pausa': '#e67e22',
            'Completado': '#27ae60'
        };
        
        projectDiv.innerHTML = `
            <div>
                <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 5px;">
                    <span class="item-id">${project.id}</span>
                    <strong>${project.name}</strong>
                    <span class="custom-badge" style="background: ${statusColors[project.status]}20; color: ${statusColors[project.status]}; border: 1px solid ${statusColors[project.status]};">
                        ${project.status}
                    </span>
                </div>
                <small style="color: #666;">
                    📅 Creado: ${window.DateUtils.formatDate(project.createdAt)}
                    ${project.description ? `<br>📝 ${window.TextUtils.truncate(project.description, 60)}` : ''}
                </small>
            </div>
            <button class="delete-btn" onclick="deleteProject('${project.id}')" title="Eliminar proyecto">
                🗑️
            </button>
        `;
        container.appendChild(projectDiv);
    });
}

function updateTasksList() {
    const container = document.getElementById('tasksList');
    const tasks = Object.values(currentData.tasks);
    
    if (tasks.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <div class="empty-state-icon">✅</div>
                <div class="empty-state-title">No hay tareas</div>
                <div class="empty-state-desc">Cree la primera tarea</div>
            </div>
        `;
        return;
    }
    
    container.innerHTML = '';
    tasks.forEach(task => {
        const taskDiv = document.createElement('div');
        taskDiv.className = 'item hover-lift';
        
        // Determinar colores según estado y prioridad
        const statusColors = {
            'Pendiente': '#f39c12',
            'En Progreso': '#3498db',
            'Completada': '#27ae60'
        };
        
        const priorityColors = {
            'Baja': '#95a5a6',
            'Media': '#f39c12',
            'Alta': '#e74c3c'
        };
        
        taskDiv.innerHTML = `
            <div>
                <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 5px;">
                    <span class="item-id">${task.id}</span>
                    <strong>${task.name}</strong>
                    <span class="custom-badge" style="background: ${statusColors[task.status]}20; color: ${statusColors[task.status]}; border: 1px solid ${statusColors[task.status]};">
                        ${task.status}
                    </span>
                    ${task.priority ? `
                        <span class="custom-badge" style="background: ${priorityColors[task.priority]}20; color: ${priorityColors[task.priority]}; border: 1px solid ${priorityColors[task.priority]}; font-size: 11px;">
                            ${task.priority}
                        </span>
                    ` : ''}
                </div>
                <small style="color: #666;">
                    📅 Creada: ${window.DateUtils.formatDate(task.createdAt)}
                    ${task.description ? `<br>📝 ${window.TextUtils.truncate(task.description, 60)}` : ''}
                </small>
            </div>
            <button class="delete-btn" onclick="deleteTask('${task.id}')" title="Eliminar tarea">
                🗑️
            </button>
        `;
        container.appendChild(taskDiv);
    });
}

function updateModulesList() {
    const container = document.getElementById('modulesList');
    const modules = Object.values(currentData.modules);
    
    if (modules.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <div class="empty-state-icon">🧩</div>
                <div class="empty-state-title">No hay módulos</div>
                <div class="empty-state-desc">Cree el primer módulo</div>
            </div>
        `;
        return;
    }
    
    container.innerHTML = '';
    modules.forEach(module => {
        const moduleDiv = document.createElement('div');
        moduleDiv.className = 'item hover-lift';
        
        // Determinar colores por categoría y estado
        const categoryColors = {
            'Frontend': '#e74c3c',
            'Backend': '#3498db',
            'Base de Datos': '#9b59b6',
            'API': '#f39c12',
            'Integración': '#1abc9c',
            'Otros': '#95a5a6'
        };
        
        const statusColors = {
            'Planificación': '#f39c12',
            'En Desarrollo': '#3498db',
            'Completado': '#27ae60'
        };
        
        moduleDiv.innerHTML = `
            <div>
                <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 5px;">
                    <span class="item-id">${module.id}</span>
                    <strong>${module.name}</strong>
                    <span class="custom-badge" style="background: ${categoryColors[module.category]}20; color: ${categoryColors[module.category]}; border: 1px solid ${categoryColors[module.category]};">
                        ${module.category}
                    </span>
                    ${module.status ? `
                        <span class="custom-badge" style="background: ${statusColors[module.status]}20; color: ${statusColors[module.status]}; border: 1px solid ${statusColors[module.status]}; font-size: 11px;">
                            ${module.status}
                        </span>
                    ` : ''}
                </div>
                <small style="color: #666;">
                    📅 Creado: ${window.DateUtils.formatDate(module.createdAt)}
                    ${module.description ? `<br>📝 ${window.TextUtils.truncate(module.description, 60)}` : ''}
                </small>
            </div>
            <button class="delete-btn" onclick="deleteModule('${module.id}')" title="Eliminar módulo">
                🗑️
            </button>
        `;
        container.appendChild(moduleDiv);
    });
}

function updateAssignmentsList() {
    const container = document.getElementById('assignmentsList');
    const recentContainer = document.getElementById('recentAssignments');
    const assignments = Object.values(currentData.assignments);
    
    // Actualizar lista completa de asignaciones
    if (container) {
        if (assignments.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <div class="empty-state-icon">🔗</div>
                    <div class="empty-state-title">No hay asignaciones</div>
                    <div class="empty-state-desc">Las asignaciones creadas aparecerán en esta lista</div>
                </div>
            `;
        } else {
            container.innerHTML = '';
            assignments.forEach(assignment => {
                const user = currentData.users[assignment.userId];
                const company = currentData.companies[assignment.companyId];
                const project = currentData.projects[assignment.projectId];
                const task = currentData.tasks[assignment.taskId];
                const module = currentData.modules[assignment.moduleId];
                
                if (user && company && project && task && module) {
                    const assignmentDiv = document.createElement('div');
                    assignmentDiv.className = 'item hover-lift';
                    assignmentDiv.innerHTML = `
                        <div>
                            <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 5px;">
                                <span class="item-id">${assignment.id.slice(-6)}</span>
                                <strong>${user.name}</strong>
                                <span class="custom-badge badge-info">Asignado</span>
                            </div>
                            <small style="color: #666;">
                                🏢 ${company.name} | 📋 ${project.name}<br>
                                ✅ ${task.name} | 🧩 ${module.name}<br>
                                📅 ${window.DateUtils.formatDate(assignment.createdAt)}
                            </small>
                        </div>
                        <button class="delete-btn" onclick="deleteAssignment('${assignment.id}')" title="Eliminar asignación">
                            🗑️
                        </button>
                    `;
                    container.appendChild(assignmentDiv);
                }
            });
        }
    }
    
    // Actualizar asignaciones recientes (últimas 5)
    if (recentContainer) {
        const recentAssignments = assignments
            .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
            .slice(0, 5);
            
        if (recentAssignments.length === 0) {
            recentContainer.innerHTML = `
                <div class="empty-state">
                    <div class="empty-state-icon">🎯</div>
                    <div class="empty-state-title">Sin asignaciones</div>
                    <div class="empty-state-desc">Las asignaciones recientes aparecerán aquí</div>
                </div>
            `;
        } else {
            recentContainer.innerHTML = '';
            recentAssignments.forEach(assignment => {
                const user = currentData.users[assignment.userId];
                const company = currentData.companies[assignment.companyId];
                const project = currentData.projects[assignment.projectId];
                
                if (user && company && project) {
                    const assignmentDiv = document.createElement('div');
                    assignmentDiv.className = 'item hover-lift';
                    assignmentDiv.innerHTML = `
                        <div>
                            <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 5px;">
                                <strong>${user.name}</strong>
                                <span class="custom-badge badge-success">
                                    ${window.DateUtils.formatRelativeTime(assignment.createdAt)}
                                </span>
                            </div>
                            <small style="color: #666;">
                                🏢 ${company.name} | 📋 ${project.name}
                            </small>
                        </div>
                    `;
                    recentContainer.appendChild(assignmentDiv);
                }
            });
        }
    }
}

function updateReportsList() {
    const allContainer = document.getElementById('allReportsList');
    const pendingContainer = document.getElementById('pendingReportsList');
    const reportsTableBody = document.getElementById('reportsTableBody');
    
    // CAMBIO PRINCIPAL: Mostrar todos los reportes pendientes
    const allReports = Object.values(currentData.reports);
    const pendingReports = allReports.filter(r => r.status === 'Pendiente');
    
    // Actualizar tabla de reportes pendientes
    if (reportsTableBody) {
        if (pendingReports.length === 0) {
            reportsTableBody.innerHTML = `
                <tr>
                    <td colspan="10" class="empty-table-message">
                        <div class="empty-state">
                            <div class="empty-state-icon">📄</div>
                            <div class="empty-state-title">No hay reportes pendientes</div>
                            <div class="empty-state-desc">Los reportes pendientes aparecerán aquí para su revisión</div>
                        </div>
                    </td>
                </tr>
            `;
        } else {
            reportsTableBody.innerHTML = '';
            pendingReports.forEach(report => {
                const user = currentData.users[report.userId];
                
                // BUSCAR la asignación específica del reporte
                let assignment = null;
                let company = null;
                let project = null;
                let task = null;
                let module = null;
                
                if (report.assignmentId) {
                    // Nuevo sistema: reporte vinculado a asignación específica
                    assignment = currentData.assignments[report.assignmentId];
                    if (assignment) {
                        company = currentData.companies[assignment.companyId];
                        project = currentData.projects[assignment.projectId];
                        task = currentData.tasks[assignment.taskId];
                        module = currentData.modules[assignment.moduleId];
                    }
                } else {
                    // Sistema legado: buscar primera asignación del usuario
                    assignment = Object.values(currentData.assignments).find(a => a.userId === report.userId && a.isActive);
                    if (assignment) {
                        company = currentData.companies[assignment.companyId];
                        project = currentData.projects[assignment.projectId];
                        task = currentData.tasks[assignment.taskId];
                        module = currentData.modules[assignment.moduleId];
                    }
                }
                
                if (user) {
                    const row = document.createElement('tr');
                    row.innerHTML = `
                        <td><span class="consultant-id">${user.id}</span></td>
                        <td><span class="consultant-name">${user.name}</span></td>
                        <td><span class="company-name">${company ? company.name : 'Sin asignación'}</span></td>
                        <td><span class="project-name">${project ? project.name : 'Sin asignación'}</span></td>
                        <td>${task ? task.name : 'Sin tarea'}</td>
                        <td>${module ? module.name : 'Sin módulo'}</td>
                        <td><span class="hours-reported">${report.hours || '0'} hrs</span></td>
                        <td><span class="report-date">${window.DateUtils.formatDate(report.createdAt)}</span></td>
                        <td>
                            <span class="status-badge status-${report.status.toLowerCase()}">
                                ${report.status}
                            </span>
                        </td>
                        <td>
                            <div class="action-buttons">
                                <button class="action-btn btn-approve" onclick="approveReport('${report.id}')" title="Aprobar reporte">
                                    ✅ Aprobar
                                </button>
                                <button class="action-btn btn-reject" onclick="rejectReport('${report.id}')" title="Rechazar reporte">
                                    ❌ Rechazar
                                </button>
                                <button class="action-btn btn-view" onclick="viewReport('${report.id}')" title="Ver detalles">
                                    👁️ Ver
                                </button>
                            </div>
                        </td>
                    `;
                    reportsTableBody.appendChild(row);
                }
            });
        }
    }
    
    // Resto de la funcionalidad para otros contenedores (mantener igual)
    if (allContainer) {
        if (pendingReports.length === 0) {
            allContainer.innerHTML = `
                <div class="empty-state">
                    <div class="empty-state-icon">📄</div>
                    <div class="empty-state-title">No hay reportes pendientes</div>
                    <div class="empty-state-desc">Los reportes pendientes aparecerán aquí</div>
                </div>
            `;
        } else {
            allContainer.innerHTML = '';
            pendingReports.forEach(report => {
                const user = currentData.users[report.userId];
                if (user) {
                    const reportDiv = document.createElement('div');
                    reportDiv.className = 'item hover-lift';
                    
                    reportDiv.innerHTML = `
                        <div>
                            <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 5px;">
                                <strong>${report.title}</strong>
                                <span class="custom-badge badge-warning">
                                    ⏳ Pendiente
                                </span>
                            </div>
                            <small style="color: #666;">
                                👤 ${user.name} | 📅 ${window.DateUtils.formatDate(report.createdAt)}
                                ${report.reportType ? `| 📊 ${report.reportType}` : ''}
                                ${report.hours ? `| ⏰ ${report.hours} hrs` : ''}
                            </small>
                        </div>
                        <span class="custom-badge badge-info">
                            ${window.DateUtils.formatRelativeTime(report.createdAt)}
                        </span>
                    `;
                    allContainer.appendChild(reportDiv);
                }
            });
        }
    }
    
    // Reportes pendientes (contenedor específico)
    if (pendingContainer) {
        if (pendingReports.length === 0) {
            pendingContainer.innerHTML = `
                <div class="empty-state">
                    <div class="empty-state-icon">✅</div>
                    <div class="empty-state-title">No hay reportes pendientes</div>
                    <div class="empty-state-desc">Todos los reportes han sido revisados</div>
                </div>
            `;
        } else {
            pendingContainer.innerHTML = '';
            pendingReports.forEach(report => {
                const user = currentData.users[report.userId];
                if (user) {
                    const reportDiv = document.createElement('div');
                    reportDiv.className = 'item hover-lift';
                    reportDiv.innerHTML = `
                        <div>
                            <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 5px;">
                                <strong>${report.title}</strong>
                                <span class="custom-badge badge-warning">
                                    ⏳ Pendiente
                                </span>
                            </div>
                            <small style="color: #666;">
                                👤 ${user.name} | 📅 ${window.DateUtils.formatDate(report.createdAt)}
                                ${report.reportType ? `| 📊 ${report.reportType}` : ''}
                                ${report.hours ? `| ⏰ ${report.hours} hrs` : ''}
                            </small>
                        </div>
                        <div style="display: flex; gap: 5px;">
                            <button class="btn btn-success" onclick="approveReport('${report.id}')" title="Aprobar reporte" style="padding: 4px 8px; font-size: 12px;">
                                ✅
                            </button>
                            <button class="btn btn-danger" onclick="rejectReport('${report.id}')" title="Rechazar reporte" style="padding: 4px 8px; font-size: 12px;">
                                ❌
                            </button>
                        </div>
                    `;
                    pendingContainer.appendChild(reportDiv);
                }
            });
        }
    }
}

function updateApprovedReportsList() {
    const approvedReportsTableBody = document.getElementById('approvedReportsTableBody');
    const timeFilter = document.getElementById('timeFilter');
    const customDateRange = document.getElementById('customDateRange');
    const startDate = document.getElementById('startDate');
    const endDate = document.getElementById('endDate');
    const filterInfo = document.getElementById('filterInfo');
    
    if (!approvedReportsTableBody) return;
    
    // Mostrar/ocultar rango personalizado
    if (timeFilter && customDateRange) {
        if (timeFilter.value === 'custom') {
            customDateRange.style.display = 'flex';
        } else {
            customDateRange.style.display = 'none';
        }
    }
    
    const reports = Object.values(currentData.reports);
    const approvedReports = reports.filter(r => r.status === 'Aprobado');
    
    // Filtrar reportes por fecha
    let filteredReports = [];
    const now = new Date();
    let filterText = '';
    
    if (timeFilter) {
        switch(timeFilter.value) {
            case 'week':
                const startOfWeek = new Date(now);
                startOfWeek.setDate(now.getDate() - now.getDay()); // Domingo
                startOfWeek.setHours(0, 0, 0, 0);
                
                const endOfWeek = new Date(startOfWeek);
                endOfWeek.setDate(startOfWeek.getDate() + 6); // Sábado
                endOfWeek.setHours(23, 59, 59, 999);
                
                filteredReports = approvedReports.filter(report => {
                    const reportDate = new Date(report.createdAt);
                    return reportDate >= startOfWeek && reportDate <= endOfWeek;
                });
                
                filterText = `Esta semana (${window.DateUtils.formatDate(startOfWeek)} - ${window.DateUtils.formatDate(endOfWeek)})`;
                break;
                
            case 'month':
                const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
                const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
                endOfMonth.setHours(23, 59, 59, 999);
                
                filteredReports = approvedReports.filter(report => {
                    const reportDate = new Date(report.createdAt);
                    return reportDate >= startOfMonth && reportDate <= endOfMonth;
                });
                
                const monthNames = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
                    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
                filterText = `${monthNames[now.getMonth()]} ${now.getFullYear()}`;
                break;
                
            case 'custom':
                if (startDate && endDate && startDate.value && endDate.value) {
                    const customStart = new Date(startDate.value);
                    customStart.setHours(0, 0, 0, 0);
                    
                    const customEnd = new Date(endDate.value);
                    customEnd.setHours(23, 59, 59, 999);
                    
                    filteredReports = approvedReports.filter(report => {
                        const reportDate = new Date(report.createdAt);
                        return reportDate >= customStart && reportDate <= customEnd;
                    });
                    
                    filterText = `${window.DateUtils.formatDate(customStart)} - ${window.DateUtils.formatDate(customEnd)}`;
                } else {
                    filteredReports = approvedReports;
                    filterText = 'Rango personalizado (seleccione fechas)';
                }
                break;
                
            default: // 'all'
                filteredReports = approvedReports;
                filterText = 'Todas las fechas';
                break;
        }
    } else {
        filteredReports = approvedReports;
        filterText = 'Esta semana';
    }
    
    // Actualizar texto informativo
    if (filterInfo) {
        filterInfo.textContent = `Mostrando: ${filterText}`;
    }
    
    if (filteredReports.length === 0) {
        approvedReportsTableBody.innerHTML = `
            <tr>
                <td colspan="8" class="empty-table-message">
                    <div class="empty-state">
                        <div class="empty-state-icon">✅</div>
                        <div class="empty-state-title">No hay reportes aprobados</div>
                        <div class="empty-state-desc">No se encontraron reportes aprobados en el período seleccionado</div>
                    </div>
                </td>
            </tr>
        `;
        return;
    }
    
    // *** CAMBIO PRINCIPAL: Agrupar por ASIGNACIÓN, no por usuario ***
    const assignmentSummary = {};
    
    filteredReports.forEach(report => {
        const user = currentData.users[report.userId];
        
        // Determinar la asignación específica del reporte
        let assignment = null;
        if (report.assignmentId) {
            // Nuevo sistema: reporte vinculado a asignación específica
            assignment = currentData.assignments[report.assignmentId];
        } else {
            // Sistema legado: buscar primera asignación activa del usuario
            assignment = Object.values(currentData.assignments).find(a => 
                a.userId === report.userId && a.isActive
            );
        }
        
        if (user && assignment) {
            // Usar assignmentId como clave única para agrupar
            const key = assignment.id;
            
            if (!assignmentSummary[key]) {
                const company = currentData.companies[assignment.companyId];
                const project = currentData.projects[assignment.projectId];
                const task = currentData.tasks[assignment.taskId];
                const module = currentData.modules[assignment.moduleId];
                
                assignmentSummary[key] = {
                    assignmentId: assignment.id,
                    consultantId: user.id,
                    consultantName: user.name,
                    companyId: assignment.companyId,
                    companyName: company ? company.name : 'No asignado',
                    projectName: project ? project.name : 'No asignado',
                    taskName: task ? task.name : 'No asignada',
                    moduleName: module ? module.name : 'No asignado',
                    totalHours: 0
                };
            }
            
            // Acumular horas por asignación específica
            assignmentSummary[key].totalHours += parseFloat(report.hours || 0);
        }
    });
    
    // Generar tabla agrupada por asignación
    approvedReportsTableBody.innerHTML = '';
    Object.values(assignmentSummary).forEach(summary => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td><span class="consultant-id">${summary.consultantId}</span></td>
            <td><span class="consultant-name">${summary.consultantName}</span></td>
            <td><span class="consultant-id">${summary.companyId}</span></td>
            <td><span class="company-name">${summary.companyName}</span></td>
            <td><span class="project-name">${summary.projectName}</span></td>
            <td>${summary.taskName}</td>
            <td>${summary.moduleName}</td>
            <td><span class="hours-reported">${summary.totalHours.toFixed(1)} hrs</span></td>
        `;
        approvedReportsTableBody.appendChild(row);
    });
}


function approveReport(reportId) {
    const result = window.PortalDB.updateReport(reportId, { status: 'Aprobado' });
    if (result.success) {
        window.NotificationUtils.success('Reporte aprobado');
        loadAllData();
        
        // AGREGAR ESTA LÍNEA:
        updateSidebarCounts();
    }
}

function rejectReport(reportId) {
    const feedback = prompt('Comentarios de rechazo (opcional):');
    const result = window.PortalDB.updateReport(reportId, { 
        status: 'Rechazado',
        feedback: feedback || 'Sin comentarios'
    });
    if (result.success) {
        window.NotificationUtils.success('Reporte rechazado');
        loadAllData();
        
        // AGREGAR ESTA LÍNEA:
        updateSidebarCounts();
    }
}

function updateDropdowns() {
    // Dropdown de usuarios - mostrar también los que ya tienen asignaciones
    const userSelect = document.getElementById('assignUser');
    if (userSelect) {
        userSelect.innerHTML = '<option value="">Seleccionar usuario</option>';
        
        Object.values(currentData.users).forEach(user => {
            if (user.role === 'consultor' && user.isActive !== false) {
                const option = document.createElement('option');
                option.value = user.id;
                
                // Mostrar cuántas asignaciones tiene
                const userAssignments = Object.values(currentData.assignments).filter(a => 
                    a.userId === user.id && a.isActive
                );
                
                option.textContent = `${user.name} (${user.id})`;
                if (userAssignments.length > 0) {
                    option.textContent += ` - ${userAssignments.length} asignación(es)`;
                }
                
                userSelect.appendChild(option);
            }
        });
    }

    // Dropdown de empresas
    const companySelect = document.getElementById('assignCompany');
    if (companySelect) {
        companySelect.innerHTML = '<option value="">Seleccionar empresa</option>';
        
        Object.values(currentData.companies).forEach(company => {
            const option = document.createElement('option');
            option.value = company.id;
            option.textContent = `${company.name} (${company.id})`;
            companySelect.appendChild(option);
        });
    }

    // Dropdown de proyectos
    const projectSelect = document.getElementById('assignProject');
    if (projectSelect) {
        projectSelect.innerHTML = '<option value="">Seleccionar proyecto</option>';
        
        Object.values(currentData.projects).forEach(project => {
            const option = document.createElement('option');
            option.value = project.id;
            option.textContent = `${project.name} (${project.id})`;
            projectSelect.appendChild(option);
        });
    }

    // Dropdown de tareas
    const taskSelect = document.getElementById('assignTask');
    if (taskSelect) {
        taskSelect.innerHTML = '<option value="">Seleccionar Tarea</option>';
        
        Object.values(currentData.tasks).forEach(task => {
            const option = document.createElement('option');
            option.value = task.id;
            option.textContent = `${task.name} (${task.id})`;
            taskSelect.appendChild(option);
        });
    }

    // Dropdown de módulos
    const moduleSelect = document.getElementById('assignModule');
    if (moduleSelect) {
        moduleSelect.innerHTML = '<option value="">Seleccionar Módulo</option>';
        
        Object.values(currentData.modules).forEach(module => {
            const option = document.createElement('option');
            option.value = module.id;
            option.textContent = `${module.name} (${module.id})`;
            moduleSelect.appendChild(option);
        });
    }
}

// === GESTIÓN DE MODALES ===
function openUserModal() {
    document.getElementById('userName').focus();
    window.ModalUtils.open('userModal');
}

function openCompanyModal() {
    document.getElementById('companyName').focus();
    window.ModalUtils.open('companyModal');
}

function openProjectModal() {
    document.getElementById('projectName').focus();
    window.ModalUtils.open('projectModal');
}

function openTaskModal() {
    document.getElementById('taskName').focus();
    window.ModalUtils.open('taskModal');
}

function openModuleModal() {
    document.getElementById('moduleName').focus();
    window.ModalUtils.open('moduleModal');
}

function closeModal(modalId) {
    window.ModalUtils.close(modalId);
}

function closeAllModals() {
    window.ModalUtils.closeAll();
}

// === FUNCIONES DE UTILIDAD ===
function logout() {
    if (confirm('¿Está seguro de cerrar sesión?')) {
        window.AuthSys.logout();
    }
}

function exportData() {
    try {
        const data = window.PortalDB.exportData();
        const blob = new Blob([data], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        
        const a = document.createElement('a');
        a.href = url;
        a.download = `arvic-backup-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        window.NotificationUtils.success('Datos exportados correctamente');
    } catch (error) {
        window.NotificationUtils.error('Error al exportar datos: ' + error.message);
    }
}

function importData() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    
    input.onchange = function(e) {
        const file = e.target.files[0];
        if (!file) return;
        
        const reader = new FileReader();
        reader.onload = function(e) {
            try {
                const result = window.PortalDB.importData(e.target.result);
                if (result.success) {
                    window.NotificationUtils.success('Datos importados correctamente');
                    loadAllData();
                } else {
                    window.NotificationUtils.error('Error al importar: ' + result.message);
                }
            } catch (error) {
                window.NotificationUtils.error('Archivo inválido');
            }
        };
        reader.readAsText(file);
    };
    
    input.click();
}

function generateAdminReport() {
    const stats = window.PortalDB.getStats();
    const activities = window.AuthSys.getRecentActivities(20);
    
    const reportData = {
        generatedAt: new Date().toISOString(),
        generatedBy: window.AuthSys.getCurrentUser().name,
        statistics: stats,
        recentActivities: activities,
        totalUsers: Object.keys(currentData.users).length,
        totalCompanies: Object.keys(currentData.companies).length,
        totalProjects: Object.keys(currentData.projects).length,
        totalTasks: Object.keys(currentData.tasks).length,
        totalModules: Object.keys(currentData.modules).length,
        totalAssignments: Object.keys(currentData.assignments).length,
        totalReports: Object.keys(currentData.reports).length
    };
    
    // Crear reporte HTML
    const reportHTML = `
        <div style="font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px;">
            <h1 style="color: #2c3e50; text-align: center; margin-bottom: 30px;">
                📊 Reporte Administrativo - Portal ARVIC
            </h1>
            <p style="text-align: center; color: #666; margin-bottom: 40px;">
                Generado el ${window.DateUtils.formatDateTime(reportData.generatedAt)}<br>
                Por: ${reportData.generatedBy}
            </p>
            
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(120px, 1fr)); gap: 15px; margin-bottom: 40px;">
                <div style="background: #3498db; color: white; padding: 20px; border-radius: 8px; text-align: center;">
                    <h2 style="margin: 0; font-size: 2em;">${reportData.totalUsers}</h2>
                    <p style="margin: 5px 0 0;">Usuarios</p>
                </div>
                <div style="background: #2ecc71; color: white; padding: 20px; border-radius: 8px; text-align: center;">
                    <h2 style="margin: 0; font-size: 2em;">${reportData.totalCompanies}</h2>
                    <p style="margin: 5px 0 0;">Empresas</p>
                </div>
                <div style="background: #f39c12; color: white; padding: 20px; border-radius: 8px; text-align: center;">
                    <h2 style="margin: 0; font-size: 2em;">${reportData.totalProjects}</h2>
                    <p style="margin: 5px 0 0;">Proyectos</p>
                </div>
                <div style="background: #e74c3c; color: white; padding: 20px; border-radius: 8px; text-align: center;">
                    <h2 style="margin: 0; font-size: 2em;">${reportData.totalTasks}</h2>
                    <p style="margin: 5px 0 0;">Tareas</p>
                </div>
                <div style="background: #9b59b6; color: white; padding: 20px; border-radius: 8px; text-align: center;">
                    <h2 style="margin: 0; font-size: 2em;">${reportData.totalModules}</h2>
                    <p style="margin: 5px 0 0;">Módulos</p>
                </div>
                <div style="background: #1abc9c; color: white; padding: 20px; border-radius: 8px; text-align: center;">
                    <h2 style="margin: 0; font-size: 2em;">${reportData.totalAssignments}</h2>
                    <p style="margin: 5px 0 0;">Asignaciones</p>
                </div>
            </div>
            
            <h3 style="color: #2c3e50; border-bottom: 2px solid #3498db; padding-bottom: 10px;">
                🔄 Actividad Reciente
            </h3>
            <div style="background: #f8f9fa; padding: 20px; border-radius: 8px;">
                ${activities.length > 0 ? 
                    activities.map(activity => `
                        <div style="margin-bottom: 10px; padding: 10px; background: white; border-left: 4px solid #3498db; border-radius: 4px;">
                            <strong>${activity.description}</strong><br>
                            <small style="color: #666;">
                                Usuario: ${activity.userId} | 
                                ${window.DateUtils.formatDateTime(activity.timestamp)}
                            </small>
                        </div>
                    `).join('') : 
                    '<p style="color: #666; text-align: center;">No hay actividad reciente</p>'
                }
            </div>
        </div>
    `;
    
    // Abrir en nueva ventana para imprimir
    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
        <!DOCTYPE html>
        <html>
        <head>
            <title>Reporte Administrativo - Portal ARVIC</title>
            <style>
                @media print {
                    body { margin: 0; }
                    .no-print { display: none; }
                }
            </style>
        </head>
        <body>
            ${reportHTML}
            <div class="no-print" style="text-align: center; margin-top: 30px;">
                <button onclick="window.print()" style="padding: 10px 20px; background: #3498db; color: white; border: none; border-radius: 5px; cursor: pointer;">
                    🖨️ Imprimir Reporte
                </button>
                <button onclick="window.close()" style="padding: 10px 20px; background: #95a5a6; color: white; border: none; border-radius: 5px; cursor: pointer; margin-left: 10px;">
                    ❌ Cerrar
                </button>
            </div>
        </body>
        </html>
    `);
    printWindow.document.close();
}

// === FUNCIONES EXPORTADAS GLOBALMENTE ===
window.showSection = showSection;
window.openUserModal = openUserModal;
window.openCompanyModal = openCompanyModal;
window.openProjectModal = openProjectModal;
window.openTaskModal = openTaskModal;
window.openModuleModal = openModuleModal;
window.closeModal = closeModal;
window.deleteUser = deleteUser;
window.deleteCompany = deleteCompany;
window.deleteProject = deleteProject;
window.deleteTask = deleteTask;
window.deleteModule = deleteModule;
window.createAssignment = createAssignment;
window.deleteAssignment = deleteAssignment;
window.approveReport = approveReport;
window.rejectReport = rejectReport;
window.logout = logout;
window.exportData = exportData;
window.importData = importData;
window.generateAdminReport = generateAdminReport;
window.viewReport = viewReport;
window.updateApprovedReportsList = updateApprovedReportsList;
window.updateProjectsList = updateProjectsList;
window.updateTasksList = updateTasksList;
window.updateModulesList = updateModulesList;
window.updateAssignmentsList = updateAssignmentsList;
window.updateUsersList = updateUsersList;
window.viewUserAssignments = viewUserAssignments;
window.updateGeneratedReportsList = updateGeneratedReportsList;
window.refreshGeneratedReportsList = refreshGeneratedReportsList;
window.deleteGeneratedReportFromHistory = deleteGeneratedReportFromHistory;

console.log('✅ Funciones del administrador exportadas globalmente');/**


 * === LÓGICA DEL PANEL DE ADMINISTRADOR REORGANIZADO ===
 * Maneja todas las funciones administrativas del portal con sidebar
 */

// Variables globales
let currentData = {
    users: {},
    companies: {},
    projects: {},
    assignments: {},
    tasks: {},
    modules: {},
    reports: {}
};

let currentSection = 'usuarios';

// Inicialización
document.addEventListener('DOMContentLoaded', function() {
    // Verificar autenticación de administrador
    if (!window.AuthSys.requireAdmin()) {
        return;
    }

    initializeAdminPanel();
    setupEventListeners();
    setupSidebarNavigation();
    loadAllData();
});

// === INICIALIZACIÓN ===
function initializeAdminPanel() {
    const currentUser = window.AuthSys.getCurrentUser();
    if (currentUser) {
        // Usar nombre fijo para el administrador
        document.getElementById('adminUserName').textContent = 'Hector Perez';
    }

    // Mostrar mensaje de bienvenida
    window.NotificationUtils.success('Bienvenido al panel de administración', 3000);
}

function setupEventListeners() {
    // Formularios
    document.getElementById('userForm').addEventListener('submit', handleCreateUser);
    document.getElementById('companyForm').addEventListener('submit', handleCreateCompany);
    document.getElementById('projectForm').addEventListener('submit', handleCreateProject);
    document.getElementById('taskForm').addEventListener('submit', handleCreateTask);
    document.getElementById('moduleForm').addEventListener('submit', handleCreateModule);

    // Cerrar modales con ESC
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            closeAllModals();
        }
    });

    // Auto-actualización cada 30 segundos
    setInterval(loadAllData, 30000);
}

function setupSidebarNavigation() {
    // Agregar listeners a todos los elementos del sidebar
    document.querySelectorAll('.sidebar-menu-item').forEach(item => {
        const section = item.getAttribute('data-section');
        if (section) {
            item.addEventListener('click', () => {
                showSection(section);
            });
        }
    });
}

// === NAVEGACIÓN DE SECCIONES ===
function showSection(sectionName) {
    currentSection = sectionName;
    
    // Ocultar todas las secciones
    document.querySelectorAll('.content-section').forEach(section => {
        section.classList.remove('active');
    });

    // Mostrar sección seleccionada
    const targetSection = document.getElementById(`${sectionName}-section`);
    if (targetSection) {
        targetSection.classList.add('active');
    }

    // Actualizar navegación activa en el sidebar
    updateActiveSidebarItem(sectionName);

    // Cargar datos específicos de la sección si es necesario
    loadSectionData(sectionName);
}

function updateActiveSidebarItem(activeSection) {
    document.querySelectorAll('.sidebar-menu-item').forEach(item => {
        item.classList.remove('active');
        if (item.getAttribute('data-section') === activeSection) {
            item.classList.add('active');
        }
    });
}

function loadSectionData(sectionName) {
    switch(sectionName) {
        case 'usuarios':
            updateUsersList();
            break;
        case 'empresas':
            updateCompaniesList();
            break;
        case 'proyectos':
            updateProjectsList();
            break;
        case 'tareas':
            updateTasksList();
            break;
        case 'modulos':
            updateModulesList();
            break;
        case 'lista-asignaciones':
        case 'asignaciones-recientes':
            updateAssignmentsList();
            break;
        case 'reportes-pendientes':
            updateReportsList();
            break;
        case 'reportes-aprobados':
            updateApprovedReportsList();
           break;
        case 'generar-reporte':
         // Reiniciar configuración de reportes
          selectedReportType = null;
          currentReportData = [];
          tariffConfiguration = {};
    
         // Limpiar selecciones
        document.querySelectorAll('.report-type-card').forEach(card => {
        card.classList.remove('selected');
    });
    
        // Ocultar todas las configuraciones
        const actividadesConfig = document.getElementById('actividades-config');
        const pagosConfig = document.getElementById('pagos-config');
        const actividadesPreview = document.getElementById('actividadesPreview');
        const pagosConfiguration = document.getElementById('pagosConfiguration');
    
        if (actividadesConfig) actividadesConfig.style.display = 'none';
        if (pagosConfig) pagosConfig.style.display = 'none';
        if (actividadesPreview) actividadesPreview.style.display = 'none';
        if (pagosConfiguration) pagosConfiguration.style.display = 'none';
          break;
        case 'historial-reportes':
         updateGeneratedReportsList();
        break;
    }
}

// === GESTIÓN DE USUARIOS ===
function handleCreateUser(e) {
    e.preventDefault();
    
    const name = document.getElementById('userName').value.trim();
    const email = document.getElementById('userEmail').value.trim();
    
    if (!name) {
        window.NotificationUtils.error('El nombre es requerido');
        return;
    }

    const userData = {
        name: name,
        email: email,
        role: 'consultor'
    };

    const result = window.PortalDB.createUser(userData);
    
    if (result.success) {
        window.NotificationUtils.success(
            `Usuario creado exitosamente!\nID: ${result.user.id}\nContraseña: ${result.user.password}`,
            8000
        );
        
        showUserCredentials(result.user);
        
        closeModal('userModal');
        document.getElementById('userForm').reset();
        loadAllData();
    } else {
        window.NotificationUtils.error('Error al crear usuario: ' + result.message);
    }
}

function showUserCredentials(user) {
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.style.display = 'block';
    modal.innerHTML = `
        <div class="modal-content">
            <div class="modal-header">
                <h2 class="modal-title">✅ Usuario Creado Exitosamente</h2>
                <button class="close" onclick="this.closest('.modal').remove()">&times;</button>
            </div>
            <div class="p-3">
                <div class="message message-success">
                    <strong>Credenciales del nuevo usuario:</strong>
                </div>
                <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 15px 0;">
                    <p><strong>Nombre:</strong> ${user.name}</p>
                    <p><strong>ID de Usuario:</strong> <code style="background: #e9ecef; padding: 4px 8px; border-radius: 4px;">${user.id}</code></p>
                    <p><strong>Contraseña Temporal:</strong> <code style="background: #e9ecef; padding: 4px 8px; border-radius: 4px;">${user.password}</code></p>
                    ${user.email ? `<p><strong>Email:</strong> ${user.email}</p>` : ''}
                </div>
                <div class="message message-warning">
                    <strong>Importante:</strong> Comparta estas credenciales de forma segura con el usuario.
                </div>
                <button class="btn btn-primary" onclick="this.closest('.modal').remove()">Entendido</button>
            </div>
        </div>
    `;
    document.body.appendChild(modal);
}

function deleteUser(userId) {
    if (!confirm('¿Está seguro de eliminar este usuario? Esta acción eliminará también todas sus asignaciones.')) {
        return;
    }

    const result = window.PortalDB.deleteUser(userId);
    
    if (result.success) {
        window.NotificationUtils.success('Usuario eliminado correctamente');
        loadAllData();
    } else {
        window.NotificationUtils.error('Error al eliminar usuario: ' + result.message);
    }
}

// === GESTIÓN DE EMPRESAS ===
function handleCreateCompany(e) {
    e.preventDefault();
    
    const name = document.getElementById('companyName').value.trim();
    const description = document.getElementById('companyDescription').value.trim();
    
    if (!name) {
        window.NotificationUtils.error('El nombre de la empresa es requerido');
        return;
    }

    const companyData = { name: name, description: description };
    const result = window.PortalDB.createCompany(companyData);
    
    if (result.success) {
        window.NotificationUtils.success(`Empresa "${name}" registrada con ID: ${result.company.id}`);
        closeModal('companyModal');
        document.getElementById('companyForm').reset();
        loadAllData();
    } else {
        window.NotificationUtils.error('Error al registrar empresa: ' + result.message);
    }
}

function deleteCompany(companyId) {
    if (!confirm('¿Está seguro de eliminar esta empresa? Se eliminarán también todas las asignaciones relacionadas.')) {
        return;
    }

    const result = window.PortalDB.deleteCompany(companyId);
    
    if (result.success) {
        window.NotificationUtils.success('Empresa eliminada correctamente');
        loadAllData();
    } else {
        window.NotificationUtils.error('Error al eliminar empresa: ' + result.message);
    }
}

// === GESTIÓN DE PROYECTOS ===
function handleCreateProject(e) {
    e.preventDefault();
    
    const name = document.getElementById('projectName').value.trim();
    const description = document.getElementById('projectDescription').value.trim();
    const status = document.getElementById('projectStatus').value;
    
    if (!name) {
        window.NotificationUtils.error('El nombre del proyecto es requerido');
        return;
    }

    const projectData = { name: name, description: description, status: status };
    const result = window.PortalDB.createProject(projectData);
    
    if (result.success) {
        window.NotificationUtils.success(`Proyecto "${name}" creado con ID: ${result.project.id}`);
        closeModal('projectModal');
        document.getElementById('projectForm').reset();
        loadAllData();
    } else {
        window.NotificationUtils.error('Error al crear proyecto: ' + result.message);
    }
}

function deleteProject(projectId) {
    if (!confirm('¿Está seguro de eliminar este proyecto? Se eliminarán también todas las asignaciones relacionadas.')) {
        return;
    }

    const result = window.PortalDB.deleteProject(projectId);
    
    if (result.success) {
        window.NotificationUtils.success('Proyecto eliminado correctamente');
        loadAllData();
    } else {
        window.NotificationUtils.error('Error al eliminar proyecto: ' + result.message);
    }
}

// === GESTIÓN DE TAREAS ===
function handleCreateTask(e) {
    e.preventDefault();
    
    const name = document.getElementById('taskName').value.trim();
    const description = document.getElementById('taskDescription').value.trim();
    
    if (!name) {
        window.NotificationUtils.error('El nombre de la tarea es requerido');
        return;
    }

    const taskData = {
        name: name,
        description: description
    };

    const result = window.PortalDB.createTask(taskData);
    
    if (result.success) {
        window.NotificationUtils.success(`Tarea "${name}" creada exitosamente`);
        closeModal('taskModal');
        document.getElementById('taskForm').reset();
        loadAllData();
    } else {
        window.NotificationUtils.error('Error al crear tarea: ' + result.message);
    }
}

function deleteTask(taskId) {
    if (!confirm('¿Está seguro de eliminar esta tarea?')) {
        return;
    }

    const result = window.PortalDB.deleteTask(taskId);
    
    if (result.success) {
        window.NotificationUtils.success('Tarea eliminada correctamente');
        loadAllData();
    } else {
        window.NotificationUtils.error('Error al eliminar tarea: ' + result.message);
    }
}

// === GESTIÓN DE MÓDULOS ===
function handleCreateModule(e) {
    e.preventDefault();
    
    const name = document.getElementById('moduleName').value.trim();
    const description = document.getElementById('moduleDescription').value.trim();
    
    if (!name) {
        window.NotificationUtils.error('El nombre del módulo es requerido');
        return;
    }

    const moduleData = {
        name: name,
        description: description
    };

    const result = window.PortalDB.createModule(moduleData);
    
    if (result.success) {
        window.NotificationUtils.success(`Módulo "${name}" creado exitosamente`);
        closeModal('moduleModal');
        document.getElementById('moduleForm').reset();
        loadAllData();
    } else {
        window.NotificationUtils.error('Error al crear módulo: ' + result.message);
    }
}

function deleteModule(moduleId) {
    if (!confirm('¿Está seguro de eliminar este módulo?')) {
        return;
    }

    const result = window.PortalDB.deleteModule(moduleId);
    
    if (result.success) {
        window.NotificationUtils.success('Módulo eliminado correctamente');
        loadAllData();
    } else {
        window.NotificationUtils.error('Error al eliminar módulo: ' + result.message);
    }
}

// Nueva función para ver detalles del reporte
function viewReport(reportId) {
    const report = currentData.reports[reportId];
    if (!report) return;
    
    const user = currentData.users[report.userId];
    const assignment = Object.values(currentData.assignments).find(a => a.userId === report.userId);
    
    let assignmentInfo = 'Sin asignación';
    if (assignment) {
        const company = currentData.companies[assignment.companyId];
        const project = currentData.projects[assignment.projectId];
        const task = currentData.tasks[assignment.taskId];
        const module = currentData.modules[assignment.moduleId];
        
        assignmentInfo = `
            <strong>Empresa:</strong> ${company ? company.name : 'No asignada'}<br>
            <strong>Proyecto:</strong> ${project ? project.name : 'No asignado'}<br>
            <strong>Tarea:</strong> ${task ? task.name : 'No asignada'}<br>
            <strong>Módulo:</strong> ${module ? module.name : 'No asignado'}
        `;
    }
    
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.style.display = 'block';
    modal.innerHTML = `
        <div class="modal-content">
            <div class="modal-header">
                <h2 class="modal-title">📄 Detalles del Reporte</h2>
                <button class="close" onclick="this.closest('.modal').remove()">&times;</button>
            </div>
            <div class="p-3">
                <div style="margin-bottom: 20px;">
                    <h3>${report.title}</h3>
                    <p><strong>Consultor:</strong> ${user ? user.name : 'Usuario no encontrado'} (${report.userId})</p>
                    <p><strong>Estado:</strong> <span class="status-badge status-${report.status.toLowerCase()}">${report.status}</span></p>
                    <p><strong>Horas Reportadas:</strong> ${report.hours || '0'} horas</p>
                    <p><strong>Fecha de Creación:</strong> ${window.DateUtils.formatDateTime(report.createdAt)}</p>
                </div>
                
                <div style="margin-bottom: 20px;">
                    <h4>Información de Asignación:</h4>
                    <div style="background: #f8f9fa; padding: 15px; border-radius: 8px;">
                        ${assignmentInfo}
                    </div>
                </div>
                
                ${report.description ? `
                    <div style="margin-bottom: 20px;">
                        <h4>Descripción del Trabajo:</h4>
                        <div style="background: #f8f9fa; padding: 15px; border-radius: 8px;">
                            ${report.description}
                        </div>
                    </div>
                ` : ''}
                
                ${report.feedback ? `
                    <div style="margin-bottom: 20px;">
                        <h4>Comentarios de Revisión:</h4>
                        <div style="background: #fff3cd; padding: 15px; border-radius: 8px; border-left: 4px solid #ffc107;">
                            ${report.feedback}
                        </div>
                    </div>
                ` : ''}
                
                <div style="text-align: center;">
                    <button class="btn btn-secondary" onclick="this.closest('.modal').remove()">Cerrar</button>
                </div>
            </div>
        </div>
    `;
    document.body.appendChild(modal);
}

// === AGREGAR ESTAS NUEVAS FUNCIONES AL FINAL DE admin.js ===
// Copiar y pegar estas funciones al final del archivo admin.js

// Nueva función para ver todas las asignaciones de un usuario
function viewUserAssignments(userId) {
    const user = currentData.users[userId];
    const userAssignments = Object.values(currentData.assignments).filter(a => 
        a.userId === userId && a.isActive
    );
    
    if (!user) return;
    
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.style.display = 'block';
    modal.innerHTML = `
        <div class="modal-content">
            <div class="modal-header">
                <h2 class="modal-title">🎯 Asignaciones de ${user.name}</h2>
                <button class="close" onclick="this.closest('.modal').remove()">&times;</button>
            </div>
            <div class="p-3">
                ${userAssignments.length === 0 ? 
                    '<p>No hay asignaciones activas para este usuario</p>' : 
                    `<div class="assignments-list">
                        ${userAssignments.map(assignment => {
                            const company = currentData.companies[assignment.companyId];
                            const project = currentData.projects[assignment.projectId];
                            const task = currentData.tasks[assignment.taskId];
                            const module = currentData.modules[assignment.moduleId];
                            
                            // Calcular reportes y horas para esta asignación
                            const assignmentReports = Object.values(currentData.reports).filter(r => 
                                r.assignmentId === assignment.id || (r.userId === userId && !r.assignmentId)
                            );
                            const totalHours = assignmentReports.reduce((sum, r) => sum + (parseFloat(r.hours) || 0), 0);
                            
                            return `
                                <div class="assignment-detail-card">
                                    <div class="assignment-detail-header">
                                        <h4>🏢 ${company?.name || 'Empresa no encontrada'}</h4>
                                        <span class="assignment-id">ID: ${assignment.id.slice(-6)}</span>
                                    </div>
                                    <div class="assignment-detail-body">
                                        <p><strong>📋 Proyecto:</strong> ${project?.name || 'Proyecto no encontrado'}</p>
                                        <p><strong>✅ Tarea:</strong> ${task?.name || 'Tarea no encontrada'}</p>
                                        <p><strong>🧩 Módulo:</strong> ${module?.name || 'Módulo no encontrado'}</p>
                                        <p><strong>📊 Reportes:</strong> ${assignmentReports.length} reportes</p>
                                        <p><strong>⏰ Horas Total:</strong> <span class="total-hours-highlight">${totalHours.toFixed(1)} hrs</span></p>
                                        <p><small>📅 Asignado: ${window.DateUtils.formatDate(assignment.createdAt)}</small></p>
                                    </div>
                                    <div class="assignment-actions">
                                        <button class="btn btn-sm btn-danger" onclick="deleteAssignment('${assignment.id}'); this.closest('.modal').remove(); loadAllData();">
                                            🗑️ Eliminar Asignación
                                        </button>
                                    </div>
                                </div>
                            `;
                        }).join('')}
                    </div>`
                }
                <div style="text-align: center; margin-top: 20px;">
                    <button class="btn btn-secondary" onclick="this.closest('.modal').remove()">Cerrar</button>
                </div>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
}

// Modificar la función updateDropdowns para mostrar usuarios con múltiples asignaciones
function updateDropdowns() {
    // Dropdown de usuarios - mostrar también los que ya tienen asignaciones
    const userSelect = document.getElementById('assignUser');
    userSelect.innerHTML = '<option value="">Seleccionar usuario</option>';
    
    Object.values(currentData.users).forEach(user => {
        if (user.role === 'consultor' && user.isActive !== false) {
            const option = document.createElement('option');
            option.value = user.id;
            
            // Mostrar cuántas asignaciones tiene
            const userAssignments = Object.values(currentData.assignments).filter(a => 
                a.userId === user.id && a.isActive
            );
            
            option.textContent = `${user.name} (${user.id})`;
            if (userAssignments.length > 0) {
                option.textContent += ` - ${userAssignments.length} asignación(es)`;
            }
            
            userSelect.appendChild(option);
        }
    });

    // Dropdown de empresas
    const companySelect = document.getElementById('assignCompany');
    companySelect.innerHTML = '<option value="">Seleccionar empresa</option>';
    
    Object.values(currentData.companies).forEach(company => {
        const option = document.createElement('option');
        option.value = company.id;
        option.textContent = `${company.name} (${company.id})`;
        companySelect.appendChild(option);
    });

    // Dropdown de proyectos
    const projectSelect = document.getElementById('assignProject');
    projectSelect.innerHTML = '<option value="">Seleccionar proyecto</option>';
    
    Object.values(currentData.projects).forEach(project => {
        const option = document.createElement('option');
        option.value = project.id;
        option.textContent = `${project.name} (${project.id})`;
        projectSelect.appendChild(option);
    });

    // Dropdown de tareas
    const taskSelect = document.getElementById('assignTask');
    if (taskSelect) {
        taskSelect.innerHTML = '<option value="">Seleccionar Tarea</option>';
        
        Object.values(currentData.tasks).forEach(task => {
            const option = document.createElement('option');
            option.value = task.id;
            option.textContent = `${task.name} (${task.id})`;
            taskSelect.appendChild(option);
        });
    }

    // Dropdown de módulos
    const moduleSelect = document.getElementById('assignModule');
    if (moduleSelect) {
        moduleSelect.innerHTML = '<option value="">Seleccionar Módulo</option>';
        
        Object.values(currentData.modules).forEach(module => {
            const option = document.createElement('option');
            option.value = module.id;
            option.textContent = `${module.name} (${module.id})`;
            moduleSelect.appendChild(option);
        });
    }
}

// Modificar la función createAssignment para permitir múltiples asignaciones
function createAssignment() {
    const userId = document.getElementById('assignUser').value;
    const companyId = document.getElementById('assignCompany').value;
    const projectId = document.getElementById('assignProject').value;
    const taskId = document.getElementById('assignTask').value;
    const moduleId = document.getElementById('assignModule').value;
    
    if (!userId || !companyId || !projectId || !taskId || !moduleId) {
        window.NotificationUtils.error('Todos los campos son requeridos para crear una asignación');
        return;
    }

    const assignmentData = {
        userId: userId,
        companyId: companyId,
        projectId: projectId,
        taskId: taskId,
        moduleId: moduleId
    };

    const result = window.PortalDB.createAssignment(assignmentData);
    
    if (result.success) {
        const user = currentData.users[userId];
        const company = currentData.companies[companyId];
        const project = currentData.projects[projectId];
        const task = currentData.tasks[taskId];
        const module = currentData.modules[moduleId];
        
        window.NotificationUtils.success(
            `✅ Nueva asignación creada: ${user.name} → ${company.name} (${project.name} - ${task.name} - ${module.name})`
        );
        
        // Limpiar formulario
        document.getElementById('assignUser').value = '';
        document.getElementById('assignCompany').value = '';
        document.getElementById('assignProject').value = '';
        document.getElementById('assignTask').value = '';
        document.getElementById('assignModule').value = '';
        
        loadAllData();
    } else {
        window.NotificationUtils.error('Error al crear asignación: ' + result.message);
    }
}

function updateUsersList() {
    const container = document.getElementById('usersList');
    if (!container) return;
    
    const users = Object.values(currentData.users);
    const consultorUsers = users.filter(user => user.role === 'consultor' && user.isActive !== false);
    
    if (consultorUsers.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <div class="empty-state-icon">👤</div>
                <div class="empty-state-title">No hay usuarios</div>
                <div class="empty-state-desc">Cree el primer usuario consultor</div>
            </div>
        `;
        return;
    }
    
    container.innerHTML = '';
    consultorUsers.forEach(user => {
        // Obtener asignaciones del usuario
        const userAssignments = Object.values(currentData.assignments).filter(a => 
            a.userId === user.id && a.isActive
        );
        
        const userDiv = document.createElement('div');
        userDiv.className = 'item hover-lift';
        userDiv.innerHTML = `
            <div>
                <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 5px;">
                    <span class="item-id">${user.id}</span>
                    <strong>${user.name}</strong>
                    ${userAssignments.length > 1 ? 
                        `<span class="custom-badge badge-info">Múltiple (${userAssignments.length})</span>` : 
                        userAssignments.length === 1 ? 
                        `<span class="custom-badge badge-success">Asignado</span>` : 
                        `<span class="custom-badge badge-warning">Sin asignar</span>`
                    }
                </div>
                <div class="user-assignment-info">
                    <small style="color: #666;">
                        📅 Registrado: ${window.DateUtils.formatDate(user.createdAt)}
                        ${user.email ? `<br>📧 ${user.email}` : ''}
                        <br>🔑 Contraseña: <strong style="color: #e74c3c;">${user.password}</strong>
                    </small>
                    ${userAssignments.length > 0 ? `
                        <div class="user-assignment-count">
                            📊 ${userAssignments.length} asignación(es) activa(s)
                        </div>
                    ` : ''}
                </div>
                ${userAssignments.length > 1 ? `
                    <button class="btn-sm btn-info" onclick="viewUserAssignments('${user.id}')" style="margin-top: 5px;">
                        👁️ Ver Asignaciones (${userAssignments.length})
                    </button>
                ` : ''}
            </div>
            <div style="display: flex; flex-direction: column; gap: 5px;">
                <button class="delete-btn" onclick="deleteUser('${user.id}')" title="Eliminar usuario">
                    🗑️
                </button>
            </div>
        `;
        container.appendChild(userDiv);
    });
}

// === FUNCIONES PARA GENERACIÓN DE REPORTES ===

// Variables globales para reportes
let selectedReportType = null;
let currentReportData = [];
let tariffConfiguration = {};

// Función para seleccionar tipo de reporte
function selectReportType(type) {
    selectedReportType = type;
    
    // Limpiar selecciones anteriores
    document.querySelectorAll('.report-type-card').forEach(card => {
        card.classList.remove('selected');
    });
    
    // Marcar como seleccionado
    event.target.closest('.report-type-card').classList.add('selected');
    
    // Ocultar todas las configuraciones
    document.getElementById('actividades-config').style.display = 'none';
    document.getElementById('pagos-config').style.display = 'none';
    
    // Mostrar configuración correspondiente
    if (type === 'actividades') {
        document.getElementById('actividades-config').style.display = 'block';
        setupActividadesTimeFilter();
    } else if (type === 'pagos') {
        document.getElementById('pagos-config').style.display = 'block';
        setupPagosTimeFilter();
    }
}

// Configurar filtros de tiempo para actividades
function setupActividadesTimeFilter() {
    const timeFilter = document.getElementById('actividadesTimeFilter');
    const customDateRange = document.getElementById('actividadesCustomDateRange');
    
    timeFilter.addEventListener('change', function() {
        if (this.value === 'custom') {
            customDateRange.style.display = 'block';
        } else {
            customDateRange.style.display = 'none';
        }
    });
}

// Configurar filtros de tiempo para pagos
function setupPagosTimeFilter() {
    const timeFilter = document.getElementById('pagosTimeFilter');
    const customDateRange = document.getElementById('pagosCustomDateRange');
    
    timeFilter.addEventListener('change', function() {
        if (this.value === 'custom') {
            customDateRange.style.display = 'block';
        } else {
            customDateRange.style.display = 'none';
        }
    });
}

// Obtener reportes filtrados por fecha
function getFilteredReports(timeFilterId, startDateId, endDateId) {
    const timeFilter = document.getElementById(timeFilterId);
    const startDate = document.getElementById(startDateId);
    const endDate = document.getElementById(endDateId);
    
    const reports = Object.values(currentData.reports);
    const approvedReports = reports.filter(r => r.status === 'Aprobado');
    
    let filteredReports = [];
    const now = new Date();
    
    switch(timeFilter.value) {
        case 'week':
            const startOfWeek = new Date(now);
            startOfWeek.setDate(now.getDate() - now.getDay());
            startOfWeek.setHours(0, 0, 0, 0);
            
            const endOfWeek = new Date(startOfWeek);
            endOfWeek.setDate(startOfWeek.getDate() + 6);
            endOfWeek.setHours(23, 59, 59, 999);
            
            filteredReports = approvedReports.filter(report => {
                const reportDate = new Date(report.createdAt);
                return reportDate >= startOfWeek && reportDate <= endOfWeek;
            });
            break;
            
        case 'month':
            const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
            const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
            endOfMonth.setHours(23, 59, 59, 999);
            
            filteredReports = approvedReports.filter(report => {
                const reportDate = new Date(report.createdAt);
                return reportDate >= startOfMonth && reportDate <= endOfMonth;
            });
            break;
            
        case 'custom':
            if (startDate && endDate && startDate.value && endDate.value) {
                const customStart = new Date(startDate.value);
                customStart.setHours(0, 0, 0, 0);
                
                const customEnd = new Date(endDate.value);
                customEnd.setHours(23, 59, 59, 999);
                
                filteredReports = approvedReports.filter(report => {
                    const reportDate = new Date(report.createdAt);
                    return reportDate >= customStart && reportDate <= customEnd;
                });
            } else {
                filteredReports = approvedReports;
            }
            break;
            
        default: // 'all'
            filteredReports = approvedReports;
            break;
    }
    
    return filteredReports;
}

// Procesar datos para reporte de actividades
function processActividadesData(filteredReports) {
    const assignmentSummary = {};
    
    filteredReports.forEach(report => {
        const user = currentData.users[report.userId];
        
        let assignment = null;
        if (report.assignmentId) {
            assignment = currentData.assignments[report.assignmentId];
        } else {
            assignment = Object.values(currentData.assignments).find(a => 
                a.userId === report.userId && a.isActive
            );
        }
        
        if (user && assignment) {
            const key = assignment.id;
            
            if (!assignmentSummary[key]) {
                const company = currentData.companies[assignment.companyId];
                const project = currentData.projects[assignment.projectId];
                const task = currentData.tasks[assignment.taskId];
                const module = currentData.modules[assignment.moduleId];
                
                assignmentSummary[key] = {
                    idConsultor: user.id,
                    nombreConsultor: user.name,
                    idCliente: assignment.companyId,
                    cliente: company ? company.name : 'No asignado',
                    proyecto: project ? project.name : 'No asignado',
                    tarea: task ? task.name : 'No asignada',
                    modulo: module ? module.name : 'No asignado',
                    horasTotales: 0
                };
            }
            
            assignmentSummary[key].horasTotales += parseFloat(report.hours || 0);
        }
    });
    
    return Object.values(assignmentSummary);
}

// Vista previa del reporte de actividades
function previewActividadesReport() {
    const filteredReports = getFilteredReports(
        'actividadesTimeFilter', 
        'actividadesStartDate', 
        'actividadesEndDate'
    );
    
    const reportData = processActividadesData(filteredReports);
    currentReportData = reportData;
    
    const previewContainer = document.getElementById('actividadesPreview');
    const previewBody = document.getElementById('actividadesPreviewBody');
    
    previewBody.innerHTML = '';
    
    if (reportData.length === 0) {
        previewBody.innerHTML = `
            <tr>
                <td colspan="8" style="text-align: center; padding: 20px; color: #666;">
                    No hay datos para mostrar en el período seleccionado
                </td>
            </tr>
        `;
    } else {
        reportData.forEach(row => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${row.idConsultor}</td>
                <td>${row.nombreConsultor}</td>
                <td>${row.idCliente}</td>
                <td>${row.cliente}</td>
                <td>${row.proyecto}</td>
                <td>${row.tarea}</td>
                <td>${row.modulo}</td>
                <td>${row.horasTotales.toFixed(1)}</td>
            `;
            previewBody.appendChild(tr);
        });
    }
    
    previewContainer.style.display = 'block';
    previewContainer.scrollIntoView({ behavior: 'smooth' });
}

// === FUNCIÓN PARA GENERAR REPORTE DE ACTIVIDADES CON DISEÑO Y LOGO ===
function generateActividadesReport() {
    if (!currentReportData || currentReportData.length === 0) {
        window.NotificationUtils.error('No hay datos para generar el reporte. Primero haga una vista previa.');
        return;
    }
    
    try {
        // Crear workbook
        const wb = XLSX.utils.book_new();
        
        // Obtener fechas del filtro
        const timeFilter = document.getElementById('actividadesTimeFilter');
        let startDateFormatted = '';
        let endDateFormatted = '';
        
        if (timeFilter) {
            const today = new Date();
            
            switch(timeFilter.value) {
                case 'week':
                    const startOfWeek = new Date(today);
                    startOfWeek.setDate(today.getDate() - today.getDay());
                    const endOfWeek = new Date(startOfWeek);
                    endOfWeek.setDate(startOfWeek.getDate() + 6);
                    
                    startDateFormatted = startOfWeek.toLocaleDateString('es-ES');
                    endDateFormatted = endOfWeek.toLocaleDateString('es-ES');
                    break;
                    
                case 'month':
                    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
                    const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);
                    
                    startDateFormatted = startOfMonth.toLocaleDateString('es-ES');
                    endDateFormatted = endOfMonth.toLocaleDateString('es-ES');
                    break;
                    
                case 'custom':
                    const startDate = document.getElementById('actividadesStartDate');
                    const endDate = document.getElementById('actividadesEndDate');
                    if (startDate && endDate && startDate.value && endDate.value) {
                        const customStart = new Date(startDate.value);
                        const customEnd = new Date(endDate.value);
                        startDateFormatted = customStart.toLocaleDateString('es-ES');
                        endDateFormatted = customEnd.toLocaleDateString('es-ES');
                    }
                    break;
                    
                default:
                    startDateFormatted = new Date().toLocaleDateString('es-ES');
                    endDateFormatted = new Date().toLocaleDateString('es-ES');
                    break;
            }
        }
        
        // Crear datos para Excel
        const wsData = [];
        
        // Fila 1: Header con logo y título
        const headerRow = Array(15).fill('');
        headerRow[0] = ''; // Espacio para logo
        headerRow[7] = 'REPORTE DE ACTIVIDADES';
        wsData.push(headerRow);
        
        // Filas 2-4: Espaciado
        for (let i = 0; i < 3; i++) {
            wsData.push(Array(15).fill(''));
        }
        
        // Fila 5: Información del consultor
        const consultorRow = Array(15).fill('');
        consultorRow[1] = 'NOMBRE:';
        consultorRow[3] = 'ID 001 Hèctor Pèrez';
        consultorRow[11] = startDateFormatted;
        consultorRow[13] = endDateFormatted;
        wsData.push(consultorRow);
        
        // Fila 6: Espaciado
        wsData.push(Array(15).fill(''));
        
        // Fila 7: Información del proyecto
        const projectRow = Array(15).fill('');
        if (currentReportData.length > 0) {
            projectRow[1] = 'PROYECTO:';
            projectRow[3] = currentReportData[0].proyecto;
            projectRow[8] = 'CLIENTE';
            projectRow[10] = currentReportData[0].cliente;
        }
        wsData.push(projectRow);
        
        // Fila 8: Headers de la tabla
        const tableHeaders = [
            'ID CLIENTE',
            'ID PROYECTO', 
            'MODULO',
            'TICKET',
            'FECHA',
            'ACTIVIDAD',
            'HORAS pago consultor',
            'LIDER',
            'Horas A cobrar a Cliente'
        ];
        
        const headerTableRow = Array(15).fill('');
        headerTableRow[0] = tableHeaders[0];
        headerTableRow[1] = tableHeaders[1];
        headerTableRow[2] = tableHeaders[2];
        headerTableRow[3] = tableHeaders[3];
        headerTableRow[4] = tableHeaders[4];
        headerTableRow[5] = tableHeaders[5];
        headerTableRow[6] = tableHeaders[6];
        headerTableRow[7] = tableHeaders[7];
        headerTableRow[8] = tableHeaders[8];
        wsData.push(headerTableRow);
        
        // Agregar datos de actividades
        currentReportData.forEach(row => {
            const dataRow = Array(15).fill('');
            dataRow[0] = `${row.idCliente} CLIENTE ${row.cliente.toUpperCase()}`;
            dataRow[1] = `${row.idConsultor} ${row.proyecto.toUpperCase()}`;
            dataRow[2] = row.modulo || 'MM';
            dataRow[3] = ''; // TICKET vacío
            dataRow[4] = new Date().toLocaleDateString('es-ES');
            dataRow[5] = `Actividades realizadas en ${row.tarea} - ${row.modulo}`;
            dataRow[6] = row.horasTotales;
            dataRow[7] = ''; // LIDER vacío
            dataRow[8] = row.horasTotales;
            wsData.push(dataRow);
        });
        
        // Agregar filas vacías para completar el formato
        for (let i = 0; i < 10; i++) {
            const emptyRow = Array(15).fill('');
            if (i === 0) {
                const totalHours = currentReportData.reduce((sum, row) => sum + row.horasTotales, 0);
                emptyRow[6] = totalHours;
                emptyRow[8] = totalHours;
            }
            wsData.push(emptyRow);
        }
        
        // Crear worksheet
        const ws = XLSX.utils.aoa_to_sheet(wsData);
        
        // Configurar anchos de columna
        ws['!cols'] = [
            {wch: 20}, // ID CLIENTE
            {wch: 20}, // ID PROYECTO
            {wch: 10}, // MODULO
            {wch: 10}, // TICKET
            {wch: 12}, // FECHA
            {wch: 60}, // ACTIVIDAD
            {wch: 18}, // HORAS pago consultor
            {wch: 10}, // LIDER
            {wch: 20}, // Horas A cobrar a Cliente
            {wch: 8}, {wch: 8}, {wch: 12}, {wch: 8}, {wch: 12}, {wch: 8}
        ];
        
        // Aplicar estilos al worksheet
        const range = XLSX.utils.decode_range(ws['!ref']);
        
        // Estilo para el título principal
        const titleCell = 'H1';
        if (!ws[titleCell]) ws[titleCell] = {};
        ws[titleCell].s = {
            font: { bold: true, sz: 16, color: { rgb: "000000" } },
            alignment: { horizontal: "center", vertical: "center" },
            fill: { bgColor: { indexed: 22 } }
        };
        
        // Estilo para los headers de la tabla (fila 8)
        for (let col = 0; col < 9; col++) {
            const cellRef = XLSX.utils.encode_cell({r: 7, c: col});
            if (!ws[cellRef]) ws[cellRef] = {};
            ws[cellRef].s = {
                font: { bold: true, color: { rgb: "FFFFFF" } },
                fill: { bgColor: { rgb: "4472C4" } },
                alignment: { horizontal: "center", vertical: "center" },
                border: {
                    top: { style: "thin", color: { rgb: "000000" } },
                    bottom: { style: "thin", color: { rgb: "000000" } },
                    left: { style: "thin", color: { rgb: "000000" } },
                    right: { style: "thin", color: { rgb: "000000" } }
                }
            };
        }
        
        // Estilo para las celdas de datos
        for (let row = 8; row < wsData.length; row++) {
            for (let col = 0; col < 9; col++) {
                const cellRef = XLSX.utils.encode_cell({r: row, c: col});
                if (!ws[cellRef]) ws[cellRef] = {};
                ws[cellRef].s = {
                    border: {
                        top: { style: "thin", color: { rgb: "000000" } },
                        bottom: { style: "thin", color: { rgb: "000000" } },
                        left: { style: "thin", color: { rgb: "000000" } },
                        right: { style: "thin", color: { rgb: "000000" } }
                    },
                    alignment: { vertical: "center" }
                };
                
                // Alternar colores de fila
                if (row % 2 === 0) {
                    ws[cellRef].s.fill = { bgColor: { rgb: "F2F2F2" } };
                }
            }
        }
        
        // Configurar merge cells para el título
        ws['!merges'] = [
            { s: { r: 0, c: 6 }, e: { r: 0, c: 10 } } // Merge título
        ];
        
        // Agregar worksheet al workbook
        XLSX.utils.book_append_sheet(wb, ws, "REPORTE DE ACTIVIDADES");
        
        // Generar archivo Excel
        const today = new Date();
        const fileName = `REPORTE_ACTIVIDADES_HPEREZ_${today.getFullYear()}-${(today.getMonth()+1).toString().padStart(2,'0')}.xlsx`;
        
        XLSX.writeFile(wb, fileName);

// Guardar en historial
const totalHours = currentReportData.reduce((sum, row) => sum + row.horasTotales, 0);
const reportData = {
    fileName: fileName,
    reportType: 'actividades',
    generatedBy: 'Hector Perez',
    dateRange: getDateRangeText('actividadesTimeFilter', 'actividadesStartDate', 'actividadesEndDate'),
    recordCount: currentReportData.length,
    totalHours: totalHours,
    totalAmount: 0
};

const saveResult = window.PortalDB.saveGeneratedReport(reportData);
if (saveResult.success) {
    updateSidebarCounts();
}

window.NotificationUtils.success(`Reporte de actividades generado: ${fileName}`);

    } catch (error) {
        console.error('Error generando reporte:', error);
        window.NotificationUtils.error('Error al generar el reporte de actividades');
    }
}

// Cargar configuración de pagos
function loadPagosConfiguration() {
    const filteredReports = getFilteredReports(
        'pagosTimeFilter', 
        'pagosStartDate', 
        'pagosEndDate'
    );
    
    const reportData = processActividadesData(filteredReports);
    
    if (reportData.length === 0) {
        window.NotificationUtils.warning('No hay datos para el período seleccionado');
        return;
    }
    
    // Mostrar configuración de tarifas
    document.getElementById('pagosConfiguration').style.display = 'block';
    
    const tbody = document.getElementById('tariffConfigBody');
    tbody.innerHTML = '';
    
    // Inicializar configuración de tarifas
    tariffConfiguration = {};
    
    reportData.forEach((row, index) => {
        const configId = `config_${index}`;
        tariffConfiguration[configId] = {
            ...row,
            horasAjustadas: row.horasTotales,
            tarifaPorHora: 500, // Tarifa por defecto
            total: row.horasTotales * 500
        };
        
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${row.idConsultor}</td>
            <td>${row.nombreConsultor}</td>
            <td>${row.cliente}</td>
            <td>${row.proyecto}</td>
            <td>${row.horasTotales.toFixed(1)}</td>
            <td>
                <input type="number" 
                       class="tariff-input hours" 
                       id="hours_${configId}" 
                       value="${row.horasTotales.toFixed(1)}" 
                       min="0" 
                       step="0.1"
                       onchange="updateTariffCalculation('${configId}')">
            </td>
            <td>
                <input type="number" 
                       class="tariff-input rate" 
                       id="rate_${configId}" 
                       value="500" 
                       min="0" 
                       step="10"
                       onchange="updateTariffCalculation('${configId}')">
            </td>
            <td class="total-cell" id="total_${configId}">${(row.horasTotales * 500).toFixed(2)}</td>
        `;
        tbody.appendChild(tr);
    });
    
    updateTotals();
    document.getElementById('pagosConfiguration').scrollIntoView({ behavior: 'smooth' });
}

// Actualizar cálculo de tarifas
function updateTariffCalculation(configId) {
    const hoursInput = document.getElementById(`hours_${configId}`);
    const rateInput = document.getElementById(`rate_${configId}`);
    const totalCell = document.getElementById(`total_${configId}`);
    
    const hours = parseFloat(hoursInput.value) || 0;
    const rate = parseFloat(rateInput.value) || 0;
    const total = hours * rate;
    
    // Actualizar configuración
    tariffConfiguration[configId].horasAjustadas = hours;
    tariffConfiguration[configId].tarifaPorHora = rate;
    tariffConfiguration[configId].total = total;
    
    // Actualizar celda de total
    totalCell.textContent = `${total.toFixed(2)}`;
    
    // Actualizar totales generales
    updateTotals();
}

// Actualizar totales generales
function updateTotals() {
    let totalHours = 0;
    let totalAmount = 0;
    
    Object.values(tariffConfiguration).forEach(config => {
        totalHours += config.horasAjustadas;
        totalAmount += config.total;
    });
    
    document.getElementById('totalHours').textContent = totalHours.toFixed(1);
    document.getElementById('totalAmount').textContent = totalAmount.toFixed(2);
}

// Restablecer tarifas a valores por defecto
function resetTariffs() {
    if (!confirm('¿Está seguro de restablecer todas las tarifas a los valores por defecto?')) {
        return;
    }
    
    Object.keys(tariffConfiguration).forEach(configId => {
        const config = tariffConfiguration[configId];
        config.horasAjustadas = config.horasTotales;
        config.tarifaPorHora = 500;
        config.total = config.horasTotales * 500;
        
        // Actualizar inputs
        document.getElementById(`hours_${configId}`).value = config.horasTotales.toFixed(1);
        document.getElementById(`rate_${configId}`).value = '500';
        document.getElementById(`total_${configId}`).textContent = `${config.total.toFixed(2)}`;
    });
    
    updateTotals();
    window.NotificationUtils.info('Tarifas restablecidas a valores por defecto');
}

// === FUNCIÓN PARA GENERAR REPORTE DE PAGOS CON DISEÑO Y LOGO ===
function generatePagosReport() {
    if (!tariffConfiguration || Object.keys(tariffConfiguration).length === 0) {
        window.NotificationUtils.error('No hay configuración de tarifas. Primero configure las tarifas.');
        return;
    }
    
    try {
        // Crear workbook
        const wb = XLSX.utils.book_new();
        
        // Obtener fechas del filtro
        const timeFilter = document.getElementById('pagosTimeFilter');
        let startDateFormatted = '';
        let endDateFormatted = '';
        
        if (timeFilter) {
            const today = new Date();
            
            switch(timeFilter.value) {
                case 'week':
                    const startOfWeek = new Date(today);
                    startOfWeek.setDate(today.getDate() - today.getDay());
                    const endOfWeek = new Date(startOfWeek);
                    endOfWeek.setDate(startOfWeek.getDate() + 6);
                    
                    startDateFormatted = startOfWeek.toLocaleDateString('es-ES');
                    endDateFormatted = endOfWeek.toLocaleDateString('es-ES');
                    break;
                    
                case 'month':
                    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
                    const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);
                    
                    startDateFormatted = startOfMonth.toLocaleDateString('es-ES');
                    endDateFormatted = endOfMonth.toLocaleDateString('es-ES');
                    break;
                    
                case 'custom':
                    const startDate = document.getElementById('pagosStartDate');
                    const endDate = document.getElementById('pagosEndDate');
                    if (startDate && endDate && startDate.value && endDate.value) {
                        const customStart = new Date(startDate.value);
                        const customEnd = new Date(endDate.value);
                        startDateFormatted = customStart.toLocaleDateString('es-ES');
                        endDateFormatted = customEnd.toLocaleDateString('es-ES');
                    }
                    break;
                    
                default:
                    startDateFormatted = new Date().toLocaleDateString('es-ES');
                    endDateFormatted = new Date().toLocaleDateString('es-ES');
                    break;
            }
        }
        
        // Crear datos para Excel
        const wsData = [];
        
        // Fila 1: Header con logo y título
        const headerRow = Array(12).fill('');
        headerRow[0] = ''; // Espacio para logo
        headerRow[5] = 'REPORTE DE PAGO CONSULTORES';
        wsData.push(headerRow);
        
        // Filas 2-4: Espaciado
        for (let i = 0; i < 3; i++) {
            wsData.push(Array(12).fill(''));
        }
        
        // Fila 5: Información del generador
        const generadorRow = Array(12).fill('');
        generadorRow[1] = 'GENERADO POR:';
        generadorRow[3] = 'ID 001 Hèctor Pèrez';
        generadorRow[8] = startDateFormatted;
        generadorRow[10] = endDateFormatted;
        wsData.push(generadorRow);
        
        // Fila 6: Espaciado
        wsData.push(Array(12).fill(''));
        
        // Fila 7: Información del período
        const periodoRow = Array(12).fill('');
        periodoRow[1] = 'PERÍODO:';
        periodoRow[3] = `${startDateFormatted} - ${endDateFormatted}`;
        wsData.push(periodoRow);
        
        // Fila 8: Headers de la tabla
        const tableHeaders = [
            'ID CONSULTOR',
            'NOMBRE CONSULTOR',
            'CLIENTE',
            'PROYECTO',
            'HORAS TRABAJADAS',
            'TARIFA POR HORA',
            'TOTAL A PAGAR'
        ];
        
        const headerTableRow = Array(12).fill('');
        headerTableRow[0] = tableHeaders[0];
        headerTableRow[1] = tableHeaders[1];
        headerTableRow[2] = tableHeaders[2];
        headerTableRow[3] = tableHeaders[3];
        headerTableRow[4] = tableHeaders[4];
        headerTableRow[5] = tableHeaders[5];
        headerTableRow[6] = tableHeaders[6];
        wsData.push(headerTableRow);
        
        let grandTotal = 0;
        
        // Agregar datos de pagos
        Object.values(tariffConfiguration).forEach(config => {
            const dataRow = Array(12).fill('');
            dataRow[0] = config.idConsultor;
            dataRow[1] = config.nombreConsultor;
            dataRow[2] = config.cliente;
            dataRow[3] = config.proyecto;
            dataRow[4] = config.horasAjustadas;
            dataRow[5] = `$${config.tarifaPorHora.toFixed(2)}`;
            dataRow[6] = `$${config.total.toFixed(2)}`;
            wsData.push(dataRow);
            grandTotal += config.total;
        });
        
        // Agregar filas vacías y total
        for (let i = 0; i < 5; i++) {
            const emptyRow = Array(12).fill('');
            if (i === 1) {
                emptyRow[5] = 'TOTAL GENERAL:';
                emptyRow[6] = `$${grandTotal.toFixed(2)}`;
            }
            wsData.push(emptyRow);
        }
        
        // Crear worksheet
        const ws = XLSX.utils.aoa_to_sheet(wsData);
        
        // Configurar anchos de columna
        ws['!cols'] = [
            {wch: 15}, // ID CONSULTOR
            {wch: 25}, // NOMBRE CONSULTOR
            {wch: 25}, // CLIENTE
            {wch: 20}, // PROYECTO
            {wch: 15}, // HORAS TRABAJADAS
            {wch: 15}, // TARIFA POR HORA
            {wch: 15}, // TOTAL A PAGAR
            {wch: 8}, {wch: 12}, {wch: 8}, {wch: 12}, {wch: 8}
        ];
        
        // Aplicar estilos al worksheet
        const range = XLSX.utils.decode_range(ws['!ref']);
        
        // Estilo para el título principal
        const titleCell = 'F1';
        if (!ws[titleCell]) ws[titleCell] = {};
        ws[titleCell].s = {
            font: { bold: true, sz: 16, color: { rgb: "000000" } },
            alignment: { horizontal: "center", vertical: "center" },
            fill: { bgColor: { indexed: 22 } }
        };
        
        // Estilo para los headers de la tabla (fila 8)
        for (let col = 0; col < 7; col++) {
            const cellRef = XLSX.utils.encode_cell({r: 7, c: col});
            if (!ws[cellRef]) ws[cellRef] = {};
            ws[cellRef].s = {
                font: { bold: true, color: { rgb: "FFFFFF" } },
                fill: { bgColor: { rgb: "4472C4" } },
                alignment: { horizontal: "center", vertical: "center" },
                border: {
                    top: { style: "thin", color: { rgb: "000000" } },
                    bottom: { style: "thin", color: { rgb: "000000" } },
                    left: { style: "thin", color: { rgb: "000000" } },
                    right: { style: "thin", color: { rgb: "000000" } }
                }
            };
        }
        
        // Estilo para las celdas de datos
        for (let row = 8; row < wsData.length; row++) {
            for (let col = 0; col < 7; col++) {
                const cellRef = XLSX.utils.encode_cell({r: row, c: col});
                if (!ws[cellRef]) ws[cellRef] = {};
                ws[cellRef].s = {
                    border: {
                        top: { style: "thin", color: { rgb: "000000" } },
                        bottom: { style: "thin", color: { rgb: "000000" } },
                        left: { style: "thin", color: { rgb: "000000" } },
                        right: { style: "thin", color: { rgb: "000000" } }
                    },
                    alignment: { vertical: "center" }
                };
                
                // Alternar colores de fila
                if (row % 2 === 0) {
                    ws[cellRef].s.fill = { bgColor: { rgb: "F2F2F2" } };
                }
            }
        }
        
        // Configurar merge cells para el título
        ws['!merges'] = [
            { s: { r: 0, c: 4 }, e: { r: 0, c: 8 } } // Merge título
        ];
        
        // Agregar worksheet al workbook
        XLSX.utils.book_append_sheet(wb, ws, "PAGO CONSULTORES");
        
        // Generar archivo Excel
        const today = new Date();
        const fileName = `PAGO_CONSULTORES_HPEREZ_${today.getFullYear()}-${(today.getMonth()+1).toString().padStart(2,'0')}.xlsx`;
        
       XLSX.writeFile(wb, fileName);

// Calcular totales y guardar en historial
let totalHours = 0;
Object.values(tariffConfiguration).forEach(config => {
    totalHours += config.horasAjustadas;
});

const reportData = {
    fileName: fileName,
    reportType: 'pagos',
    generatedBy: 'Hector Perez',
    dateRange: getDateRangeText('pagosTimeFilter', 'pagosStartDate', 'pagosEndDate'),
    recordCount: Object.keys(tariffConfiguration).length,
    totalHours: totalHours,
    totalAmount: grandTotal
};

const saveResult = window.PortalDB.saveGeneratedReport(reportData);
if (saveResult.success) {
    updateSidebarCounts();
}

window.NotificationUtils.success(`Reporte de pagos generado: ${fileName}`);

    } catch (error) {
        console.error('Error generando reporte de pagos:', error);
        window.NotificationUtils.error('Error al generar el reporte de pagos');
    }
}

// Funciones exportadas globalmente
window.selectReportType = selectReportType;
window.previewActividadesReport = previewActividadesReport;
window.generateActividadesReport = generateActividadesReport;
window.loadPagosConfiguration = loadPagosConfiguration;
window.updateTariffCalculation = updateTariffCalculation;
window.resetTariffs = resetTariffs;
window.generatePagosReport = generatePagosReport;

// === FUNCIONES PARA HISTORIAL DE REPORTES GENERADOS ===

function getDateRangeText(timeFilterId, startDateId, endDateId) {
    const timeFilter = document.getElementById(timeFilterId);
    if (!timeFilter) return 'No especificado';
    
    const today = new Date();
    
    switch(timeFilter.value) {
        case 'week':
            const startOfWeek = new Date(today);
            startOfWeek.setDate(today.getDate() - today.getDay());
            const endOfWeek = new Date(startOfWeek);
            endOfWeek.setDate(startOfWeek.getDate() + 6);
            return `${startOfWeek.toLocaleDateString('es-ES')} - ${endOfWeek.toLocaleDateString('es-ES')}`;
            
        case 'month':
            const monthNames = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
                'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
            return `${monthNames[today.getMonth()]} ${today.getFullYear()}`;
            
        case 'custom':
            const startDate = document.getElementById(startDateId);
            const endDate = document.getElementById(endDateId);
            if (startDate && endDate && startDate.value && endDate.value) {
                const customStart = new Date(startDate.value);
                const customEnd = new Date(endDate.value);
                return `${customStart.toLocaleDateString('es-ES')} - ${customEnd.toLocaleDateString('es-ES')}`;
            }
            return 'Rango personalizado';
            
        default:
            return 'Todas las fechas';
    }
}

function updateGeneratedReportsList() {
    const tableBody = document.getElementById('generatedReportsTableBody');
    const timeFilter = document.getElementById('historialTimeFilter');
    const typeFilter = document.getElementById('historialTypeFilter');
    const customDateRange = document.getElementById('historialCustomDateRange');
    const startDate = document.getElementById('historialStartDate');
    const endDate = document.getElementById('historialEndDate');
    const filterInfo = document.getElementById('historialFilterInfo');
    
    if (!tableBody) return;
    
    // Mostrar/ocultar rango personalizado
    if (timeFilter && customDateRange) {
        if (timeFilter.value === 'custom') {
            customDateRange.style.display = 'flex';
        } else {
            customDateRange.style.display = 'none';
        }
    }
    
    const allReports = Object.values(window.PortalDB.getGeneratedReports());
    let filteredReports = allReports;
    
    // Filtrar por fecha
    if (timeFilter) {
        const now = new Date();
        let filterText = '';
        
        switch(timeFilter.value) {
            case 'week':
                const startOfWeek = new Date(now);
                startOfWeek.setDate(now.getDate() - now.getDay());
                startOfWeek.setHours(0, 0, 0, 0);
                
                const endOfWeek = new Date(startOfWeek);
                endOfWeek.setDate(startOfWeek.getDate() + 6);
                endOfWeek.setHours(23, 59, 59, 999);
                
                filteredReports = filteredReports.filter(report => {
                    const reportDate = new Date(report.createdAt);
                    return reportDate >= startOfWeek && reportDate <= endOfWeek;
                });
                
                filterText = `Esta semana`;
                break;
                
            case 'month':
                const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
                const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
                endOfMonth.setHours(23, 59, 59, 999);
                
                filteredReports = filteredReports.filter(report => {
                    const reportDate = new Date(report.createdAt);
                    return reportDate >= startOfMonth && reportDate <= endOfMonth;
                });
                
                const monthNames = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
                    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
                filterText = `${monthNames[now.getMonth()]} ${now.getFullYear()}`;
                break;
                
            case 'custom':
                if (startDate && endDate && startDate.value && endDate.value) {
                    const customStart = new Date(startDate.value);
                    customStart.setHours(0, 0, 0, 0);
                    
                    const customEnd = new Date(endDate.value);
                    customEnd.setHours(23, 59, 59, 999);
                    
                    filteredReports = filteredReports.filter(report => {
                        const reportDate = new Date(report.createdAt);
                        return reportDate >= customStart && reportDate <= customEnd;
                    });
                    
                    filterText = `${customStart.toLocaleDateString('es-ES')} - ${customEnd.toLocaleDateString('es-ES')}`;
                } else {
                    filterText = 'Rango personalizado (seleccione fechas)';
                }
                break;
                
            default: // 'all'
                filterText = 'Todos los reportes';
                break;
        }
        
        // Actualizar texto informativo
        if (filterInfo) {
            filterInfo.textContent = `Mostrando: ${filterText}`;
        }
    }
    
    // Filtrar por tipo
    if (typeFilter && typeFilter.value !== 'all') {
        filteredReports = filteredReports.filter(report => report.reportType === typeFilter.value);
    }
    
    // Ordenar por fecha de creación (más recientes primero)
    filteredReports.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    
    // Generar tabla
    if (filteredReports.length === 0) {
        tableBody.innerHTML = `
            <tr>
                <td colspan="9" class="empty-table-message">
                    <div class="empty-state">
                        <div class="empty-state-icon">📊</div>
                        <div class="empty-state-title">No hay reportes generados</div>
                        <div class="empty-state-desc">No se encontraron reportes en el período y filtros seleccionados</div>
                    </div>
                </td>
            </tr>
        `;
    } else {
        tableBody.innerHTML = '';
        filteredReports.forEach(report => {
            const row = document.createElement('tr');
            
            // Determinar clase de descarga
            let downloadClass = 'zero';
            if (report.downloadCount > 5) downloadClass = 'high';
            else if (report.downloadCount > 0) downloadClass = '';
            
            row.innerHTML = `
                <td class="file-name-cell">${report.fileName}</td>
                <td class="report-type-cell">
                    <span class="report-type-${report.reportType}">
                        ${report.reportType === 'actividades' ? '📊 Actividades' : '💰 Pagos'}
                    </span>
                </td>
                <td class="period-cell">${report.dateRange}</td>
                <td class="records-count">${report.recordCount}</td>
                <td class="hours-total">${report.totalHours ? report.totalHours.toFixed(1) : '0'} hrs</td>
                <td class="amount-total">${report.totalAmount ? '$' + report.totalAmount.toFixed(2) : '-'}</td>
                <td>${window.DateUtils.formatDateTime(report.createdAt)}</td>
                <td>
                    <span class="download-count ${downloadClass}">${report.downloadCount}</span>
                </td>
                <td>
                    <div class="action-buttons">
                        <button class="action-btn btn-delete-report" onclick="deleteGeneratedReportFromHistory('${report.id}')" title="Eliminar del historial">
                            🗑️ Eliminar
                        </button>
                    </div>
                </td>
            `;
            tableBody.appendChild(row);
        });
    }
    
    // Actualizar estadísticas
    updateGeneratedReportsStats(allReports);
}

function updateGeneratedReportsStats(reports = null) {
    if (!reports) {
        reports = Object.values(window.PortalDB.getGeneratedReports());
    }
    
    const actividadReports = reports.filter(r => r.reportType === 'actividades');
    const pagoReports = reports.filter(r => r.reportType === 'pagos');
    const totalDownloads = reports.reduce((sum, r) => sum + (r.downloadCount || 0), 0);
    
    // Actualizar elementos del DOM
    const totalElement = document.getElementById('totalGeneratedReports');
    const actividadElement = document.getElementById('totalActividadReports');
    const pagoElement = document.getElementById('totalPagoReports');
    const downloadsElement = document.getElementById('totalDownloads');
    
    if (totalElement) totalElement.textContent = reports.length;
    if (actividadElement) actividadElement.textContent = actividadReports.length;
    if (pagoElement) pagoElement.textContent = pagoReports.length;
    if (downloadsElement) downloadsElement.textContent = totalDownloads;
}

function refreshGeneratedReportsList() {
    updateGeneratedReportsList();
    window.NotificationUtils.info('Lista actualizada');
}

function deleteGeneratedReportFromHistory(reportId) {
    if (!confirm('¿Está seguro de eliminar este reporte del historial? Esta acción no eliminará el archivo descargado.')) {
        return;
    }
    
    const result = window.PortalDB.deleteGeneratedReport(reportId);
    if (result.success) {
        window.NotificationUtils.success('Reporte eliminado del historial');
        updateGeneratedReportsList();
        updateSidebarCounts();
    } else {
        window.NotificationUtils.error('Error: ' + result.message);
    }
}

console.log('✅ Funciones de generación de reportes cargadas correctamente');