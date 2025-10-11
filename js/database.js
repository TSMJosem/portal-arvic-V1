/**
 * === SISTEMA DE BASE DE DATOS PARA PORTAL ARVIC ACTUALIZADO ===
 * Maneja todos los datos del portal usando localStorage incluyendo tareas y módulos
 */

class PortalDatabase {
    constructor() {
        this.prefix = 'arvic_';
        this.initializeDefaultData();
    }

    // === INICIALIZACIÓN ===
    initializeDefaultData() {
    if (!this.getData('initialized')) {
        this.setupDefaultUsers();
        this.setupDefaultCompanies();
        this.setupDefaultProjects();
        this.setupDefaultSupports(); 
        this.setupDefaultModules();
        this.setupDefaultTarifario();
        this.setupDefaultAssignments();
        this.setupDefaultProjectAssignments();
        this.setupDefaultReports();
        this.setData('initialized', true);
        this.setData('user_counter', 3);
        this.setData('company_counter', 4);
        this.setData('project_counter', 4);
        this.setData('support_counter', 4);
        this.setData('module_counter', 4);
    }
}

    setupDefaultUsers() {
    console.log('🔄 Inicializando usuarios por defecto...');
    
    const defaultUsers = {
        'admin': {
            id: 'admin',
            name: 'Administrador Principal',
            email: 'admin@arvic.com',
            password: 'hperez1402.',
            role: 'admin',
            createdAt: new Date().toISOString(),
            isActive: true
        },
        '0001': {
            id: '0001',
            name: 'Juan Pérez García',
            email: 'juan.perez@arvic.com',
            password: 'cons0001.2024',
            role: 'consultor',
            createdAt: new Date().toISOString(),
            isActive: true,
            assignedCompany: '0001',
            assignedProject: '0001',
            reportType: 'Mensual'
        },
        '0002': {
            id: '0002',
            name: 'María Elena Rodríguez',
            email: 'maria.rodriguez@arvic.com',
            password: 'cons0002.1987',
            role: 'consultor',
            createdAt: new Date().toISOString(),
            isActive: true,
            assignedCompany: '0002',
            assignedProject: '0002',
            reportType: 'Semanal'
        }
    };
    
    this.setData('users', defaultUsers);
    console.log('✅ Usuarios creados:', Object.keys(defaultUsers));
    console.log('✅ Admin password:', defaultUsers.admin.password);
}

    generateUniquePassword(userId) {
    // Formato: "cons" + userId + "." + 4 dígitos aleatorios
    const randomNum = Math.floor(1000 + Math.random() * 9000);
    return `cons${userId}.${randomNum}`;
}

    setupDefaultCompanies() {
        const defaultCompanies = {
            '0001': {
                id: '0001',
                name: 'Tecnología Avanzada SA de CV',
                description: 'Empresa especializada en soluciones tecnológicas',
                createdAt: new Date().toISOString(),
                isActive: true
            },
            '0002': {
                id: '0002',
                name: 'Consultoría Digital SRL',
                description: 'Servicios de consultoría y transformación digital',
                createdAt: new Date().toISOString(),
                isActive: true
            },
            '0003': {
                id: '0003',
                name: 'Innovación Tech Corp',
                description: 'Desarrollo de software y aplicaciones móviles',
                createdAt: new Date().toISOString(),
                isActive: true
            }
        };
        this.setData('companies', defaultCompanies);
    }

    setupDefaultProjects() {
        const defaultProjects = {
            '0001': {
                id: '0001',
                name: 'Sistema de Gestión Empresarial',
                description: 'ERP completo para gestión de recursos empresariales',
                createdAt: new Date().toISOString(),
                isActive: true
            },
            '0002': {
                id: '0002',
                name: 'Portal Web Corporativo',
                description: 'Desarrollo de sitio web institucional con CMS',
                createdAt: new Date().toISOString(),
                isActive: true
            },
            '0003': {
                id: '0003',
                name: 'App Móvil de Ventas',
                description: 'Aplicación móvil para gestión de ventas y clientes',
                createdAt: new Date().toISOString(),
                isActive: true
            }
        };
        this.setData('projects', defaultProjects);
    }

    setupDefaultSupports() {
    const defaultSupports = {
        '0001': {
            id: '0001',
            name: 'Soporte técnico sistema ERP',
            description: 'Soporte para configuración y resolución de problemas del ERP',
            createdAt: new Date(Date.now() - 86400000 * 7).toISOString(),
            isActive: true
        },
        '0002': {
            id: '0002',
            name: 'Soporte funcional módulo ventas',
            description: 'Apoyo en el uso y configuración del módulo de ventas',
            createdAt: new Date(Date.now() - 86400000 * 3).toISOString(),
            isActive: true
        },
        '0003': {
            id: '0003',
            name: 'Mantenimiento preventivo sistema',
            description: 'Revisión y mantenimiento del sistema completo',
            createdAt: new Date().toISOString(),
            isActive: true
        }
    };
    this.setData('supports', defaultSupports);
}

    setupDefaultModules() {
        const defaultModules = {
            '0001': {
                id: '0001',
                name: 'Módulo de Autenticación',
                description: 'Manejo de login, logout y sesiones de usuario',
                status: 'Completado',
                createdAt: new Date(Date.now() - 86400000 * 10).toISOString(),
                isActive: true
            },
            '0002': {
                id: '0002',
                name: 'Panel de Administración',
                description: 'Interfaz para gestión de usuarios y configuración',
                status: 'En Desarrollo',
                createdAt: new Date(Date.now() - 86400000 * 5).toISOString(),
                isActive: true
            },
            '0003': {
                id: '0003',
                name: 'API de Reportes',
                description: 'Endpoints para creación y gestión de reportes',
                status: 'Planificación',
                createdAt: new Date().toISOString(),
                isActive: true
            }
        };
        this.setData('modules', defaultModules);
    }

        setupDefaultTarifario() {
        console.log('🔄 Inicializando tarifario...');
        
        // Inicializar con objeto vacío
        // Las entradas se crearán automáticamente al crear asignaciones
        this.setData('tarifario', {});
        
        console.log('✅ Tarifario inicializado');
    }

    setupDefaultAssignments() {
    const defaultAssignments = {
        'assign_001': {
            id: 'assign_001',
            userId: '0001',
            companyId: '0001',
            supportId: '0001', // Cambiar de taskId
            moduleId: '0001',
            createdAt: new Date(Date.now() - 86400000 * 5).toISOString(),
            isActive: true
        },
        'assign_002': {
            id: 'assign_002',
            userId: '0002',
            companyId: '0002',
            supportId: '0002', // Cambiar de taskId
            moduleId: '0002',
            createdAt: new Date(Date.now() - 86400000 * 3).toISOString(),
            isActive: true
        }
    };
    this.setData('assignments', defaultAssignments);
}

    setupDefaultReports() {
        const defaultReports = {
            'report_001': {
                id: 'report_001',
                userId: '0001',
                title: 'Reporte de Configuración de Base de Datos',
                description: 'Configuración inicial de la base de datos completada exitosamente. Se crearon todas las tablas necesarias.',
                hours: 8,
                reportDate: new Date(Date.now() - 86400000 * 2).toISOString(),
                status: 'Aprobado',
                createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
                updatedAt: new Date(Date.now() - 86400000 * 1).toISOString()
            },
            'report_002': {
                id: 'report_002',
                userId: '0002',
                title: 'Avance en Interfaz de Usuario',
                description: 'Diseño de mockups para las pantallas principales del sistema. Se completaron 5 pantallas.',
                hours: 6,
                reportDate: new Date(Date.now() - 86400000 * 1).toISOString(),
                status: 'Pendiente',
                createdAt: new Date(Date.now() - 86400000 * 1).toISOString(),
                updatedAt: new Date(Date.now() - 86400000 * 1).toISOString()
            }
        };
        this.setData('reports', defaultReports);
    }

    // === MÉTODOS GENERALES ===
    setData(key, data) {
        try {
            localStorage.setItem(this.prefix + key, JSON.stringify(data));
            return true;
        } catch (error) {
            console.error('Error saving data:', error);
            return false;
        }
    }

    getData(key) {
        try {
            const data = localStorage.getItem(this.prefix + key);
            return data ? JSON.parse(data) : null;
        } catch (error) {
            console.error('Error loading data:', error);
            return null;
        }
    }

    deleteData(key) {
        try {
            localStorage.removeItem(this.prefix + key);
            return true;
        } catch (error) {
            console.error('Error deleting data:', error);
            return false;
        }
    }

    clearAllData() {
        try {
            Object.keys(localStorage).forEach(key => {
                if (key.startsWith(this.prefix)) {
                    localStorage.removeItem(key);
                }
            });
            return true;
        } catch (error) {
            console.error('Error clearing data:', error);
            return false;
        }
    }

    // === GESTIÓN DE USUARIOS ===
    getUsers() {
        return this.getData('users') || {};
    }

    getUser(userId) {
        const users = this.getUsers();
        return users[userId] || null;
    }

    createUser(userData) {
    const users = this.getUsers();
    const counter = this.getData('user_counter') || 1;
    const userId = counter.toString().padStart(4, '0');
    
    // ✅ GENERAR contraseña única automáticamente
    const uniquePassword = this.generateUniquePassword(userId);
    
    const newUser = {
        id: userId,
        name: userData.name,
        email: userData.email || '',
        password: uniquePassword, // ✅ Contraseña única generada
        role: userData.role || 'consultor',
        createdAt: new Date().toISOString(),
        isActive: true
    };
    
    users[userId] = newUser;
    this.setData('users', users);
    this.setData('user_counter', counter + 1);
    
    return { success: true, user: newUser };
}

    updateUser(userId, updateData) {
        const users = this.getUsers();
        if (!users[userId]) {
            return { success: false, message: 'Usuario no encontrado' };
        }
        
        users[userId] = { ...users[userId], ...updateData };
        this.setData('users', users);
        
        return { success: true, user: users[userId] };
    }

    deleteUser(userId) {
    const users = this.getUsers();
    if (!users[userId]) {
        return { success: false, message: 'Usuario no encontrado' };
    }
    
    // Verificar si es el administrador
    if (userId === 'admin') {
        return { success: false, message: 'No se puede eliminar el usuario administrador' };
    }
    
    // Desactivar en lugar de eliminar para mantener integridad
    users[userId].isActive = false;
    users[userId].deletedAt = new Date().toISOString();
    this.setData('users', users);
    
    // Desactivar asignaciones relacionadas
    const assignments = this.getAssignments();
    Object.keys(assignments).forEach(assignmentId => {
        if (assignments[assignmentId].userId === userId) {
            assignments[assignmentId].isActive = false;
        }
    });
    this.setData('assignments', assignments);
    
    return { success: true, message: 'Usuario desactivado correctamente' };
}

    validateUser(userId, password) {
        const user = this.getUser(userId);
        if (!user) {
            return { success: false, message: 'Usuario no encontrado' };
        }
        
        if (user.password !== password) {
            return { success: false, message: 'Contraseña incorrecta' };
        }
        
        if (!user.isActive) {
            return { success: false, message: 'Usuario inactivo' };
        }
        
        return { success: true, user: user };
    }

    // === GESTIÓN DE EMPRESAS ===
    getCompanies() {
        return this.getData('companies') || {};
    }

    getCompany(companyId) {
        const companies = this.getCompanies();
        return companies[companyId] || null;
    }

    createCompany(companyData) {
        const companies = this.getCompanies();
        const counter = this.getData('company_counter') || 1;
        const companyId = counter.toString().padStart(4, '0');
        
        const newCompany = {
            id: companyId,
            name: companyData.name,
            description: companyData.description || '',
            createdAt: new Date().toISOString(),
            isActive: true
        };
        
        companies[companyId] = newCompany;
        this.setData('companies', companies);
        this.setData('company_counter', counter + 1);
        
        return { success: true, company: newCompany };
    }

    updateCompany(companyId, updateData) {
        const companies = this.getCompanies();
        if (!companies[companyId]) {
            return { success: false, message: 'Empresa no encontrada' };
        }
        
        companies[companyId] = { ...companies[companyId], ...updateData };
        this.setData('companies', companies);
        
        return { success: true, company: companies[companyId] };
    }

    deleteCompany(companyId) {
        const companies = this.getCompanies();
        if (!companies[companyId]) {
            return { success: false, message: 'Empresa no encontrada' };
        }
        
        delete companies[companyId];
        this.setData('companies', companies);
        
        // Eliminar asignaciones relacionadas
        this.deleteAssignmentsByCompany(companyId);
        
        return { success: true, message: 'Empresa eliminada correctamente' };
    }

    // === GESTIÓN DE PROYECTOS ===
    getProjects() {
        return this.getData('projects') || {};
    }

    getProject(projectId) {
        const projects = this.getProjects();
        return projects[projectId] || null;
    }

    createProject(projectData) {
        const projects = this.getProjects();
        const counter = this.getData('project_counter') || 1;
        const projectId = counter.toString().padStart(4, '0');
        
        const newProject = {
            id: projectId,
            name: projectData.name,
            description: projectData.description || '',
            createdAt: new Date().toISOString(),
            isActive: true
        };
        
        projects[projectId] = newProject;
        this.setData('projects', projects);
        this.setData('project_counter', counter + 1);
        
        return { success: true, project: newProject };
    }

    updateProject(projectId, updateData) {
        const projects = this.getProjects();
        if (!projects[projectId]) {
            return { success: false, message: 'Proyecto no encontrado' };
        }
        
        projects[projectId] = { ...projects[projectId], ...updateData };
        this.setData('projects', projects);
        
        return { success: true, project: projects[projectId] };
    }

    deleteProject(projectId) {
        const projects = this.getProjects();
        if (!projects[projectId]) {
            return { success: false, message: 'Proyecto no encontrado' };
        }
        
        delete projects[projectId];
        this.setData('projects', projects);
        
        // Eliminar asignaciones relacionadas
        this.deleteAssignmentsByProject(projectId);
        
        return { success: true, message: 'Proyecto eliminado correctamente' };
    }

    // === GESTIÓN DE TAREAS ===
    getSupports() {
    return this.getData('supports') || {};
}

getSupport(supportId) {
    const supports = this.getSupports();
    return supports[supportId] || null;
}

createSupport(supportData) {
    const supports = this.getSupports();
    const counter = this.getData('support_counter') || 1;
    const supportId = counter.toString().padStart(4, '0');
    
    const newSupport = {
        id: supportId,
        name: supportData.name,
        description: supportData.description || '',
        createdAt: new Date().toISOString(),
        isActive: true
    };
    
    supports[supportId] = newSupport;
    this.setData('supports', supports);
    this.setData('support_counter', counter + 1);
    
    return { success: true, support: newSupport };
}

updateSupport(supportId, updateData) {
    const supports = this.getSupports();
    if (!supports[supportId]) {
        return { success: false, message: 'Soporte no encontrado' };
    }
    
    supports[supportId] = { ...supports[supportId], ...updateData };
    this.setData('supports', supports);
    
    return { success: true, support: supports[supportId] };
}

deleteSupport(supportId) {
    const supports = this.getSupports();
    if (!supports[supportId]) {
        return { success: false, message: 'Soporte no encontrado' };
    }
    
    delete supports[supportId];
    this.setData('supports', supports);
    
    return { success: true, message: 'Soporte eliminado correctamente' };
}

    // === GESTIÓN DE MÓDULOS ===
    getModules() {
        return this.getData('modules') || {};
    }

    getModule(moduleId) {
        const modules = this.getModules();
        return modules[moduleId] || null;
    }

    createModule(moduleData) {
        const modules = this.getModules();
        const counter = this.getData('module_counter') || 1;
        const moduleId = counter.toString().padStart(4, '0');
        
        const newModule = {
            id: moduleId,
            name: moduleData.name,
            description: moduleData.description || '',
            createdAt: new Date().toISOString(),
            isActive: true
        };
        
        modules[moduleId] = newModule;
        this.setData('modules', modules);
        this.setData('module_counter', counter + 1);
        
        return { success: true, module: newModule };
    }

    updateModule(moduleId, updateData) {
        const modules = this.getModules();
        if (!modules[moduleId]) {
            return { success: false, message: 'Módulo no encontrado' };
        }
        
        modules[moduleId] = { ...modules[moduleId], ...updateData };
        this.setData('modules', modules);
        
        return { success: true, module: modules[moduleId] };
    }

    deleteModule(moduleId) {
        const modules = this.getModules();
        if (!modules[moduleId]) {
            return { success: false, message: 'Módulo no encontrado' };
        }
        
        delete modules[moduleId];
        this.setData('modules', modules);
        
        return { success: true, message: 'Módulo eliminado correctamente' };
    }

    // === GESTIÓN DE ASIGNACIONES ===
    getAssignments() {
        return this.getData('assignments') || {};
    }

    getAssignment(assignmentId) {
        const assignments = this.getAssignments();
        return assignments[assignmentId] || null;
    }

createAssignment(assignmentData) {
    try {
        const assignments = this.getData('assignments') || {};
        const assignmentId = `assign_${Date.now()}`;
        
        const assignment = {
            id: assignmentId,
            userId: assignmentData.userId,
            companyId: assignmentData.companyId,
            supportId: assignmentData.supportId,
            moduleId: assignmentData.moduleId,
            tarifaConsultor: parseFloat(assignmentData.tarifaConsultor) || 0,
            tarifaCliente: parseFloat(assignmentData.tarifaCliente) || 0,
            createdAt: new Date().toISOString()
        };
        
        assignments[assignmentId] = assignment;
        this.setData('assignments', assignments);
        
        console.log('✅ Asignación creada:', assignmentId);
        
        // CORRECCIÓN: Siempre crear entrada en tarifario si hay tarifas > 0
        const tieneConsultor = assignment.tarifaConsultor > 0;
        const tieneCliente = assignment.tarifaCliente > 0;
        
        if (tieneConsultor || tieneCliente) {
            console.log('💰 Creando entrada en tarifario con tarifas:', {
                consultor: assignment.tarifaConsultor,
                cliente: assignment.tarifaCliente
            });
            
            const tarifaResult = this.createTarifaEntry(assignment);
            
            if (tarifaResult.success) {
                console.log('✅ Entrada en tarifario creada:', tarifaResult.tarifaId);
            } else {
                console.error('❌ Error al crear entrada en tarifario:', tarifaResult.message);
            }
        } else {
            console.warn('⚠️ Asignación creada sin tarifas, no se agregó al tarifario');
        }
        
        return { success: true, assignmentId: assignmentId };
        
    } catch (error) {
        console.error('Error al crear asignación:', error);
        return { success: false, message: error.message };
    }
}



    deleteAssignment(assignmentId) {
        try {
            const assignments = this.getData('assignments') || {};
            
            if (assignments[assignmentId]) {
                delete assignments[assignmentId];
                this.setData('assignments', assignments);
                
                // También eliminar entrada de tarifario
                const tarifaId = `tarifa_${assignmentId}`;  // ← NUEVO BLOQUE
                this.deleteTarifaEntry(tarifaId);
                
                console.log('✅ Asignación eliminada:', assignmentId);
                return { success: true };
            }
            
            return { success: false, message: 'Asignación no encontrada' };
            
        } catch (error) {
            console.error('Error al eliminar asignación:', error);
            return { success: false, message: error.message };
        }
    }

    deleteAssignmentsByUser(userId) {
        const assignments = this.getAssignments();
        Object.keys(assignments).forEach(assignmentId => {
            if (assignments[assignmentId].userId === userId) {
                delete assignments[assignmentId];
            }
        });
        this.setData('assignments', assignments);
    }

    deleteAssignmentsByCompany(companyId) {
        const assignments = this.getAssignments();
        Object.keys(assignments).forEach(assignmentId => {
            if (assignments[assignmentId].companyId === companyId) {
                delete assignments[assignmentId];
            }
        });
        this.setData('assignments', assignments);
    }

    deleteAssignmentsByProject(projectId) {
        const assignments = this.getAssignments();
        Object.keys(assignments).forEach(assignmentId => {
            if (assignments[assignmentId].projectId === projectId) {
                delete assignments[assignmentId];
            }
        });
        this.setData('assignments', assignments);
    }


    // === GESTIÓN DE REPORTES ===
    getReports() {
        return this.getData('reports') || {};
    }

    getReportsByUser(userId) {
        const reports = this.getReports();
        return Object.values(reports).filter(report => report.userId === userId);
    }

    createReport(reportData) {
    const reports = this.getReports();
    const reportId = `report_${Date.now()}`;
    
    // VALIDAR que existe la asignación (OBLIGATORIO)
    if (!reportData.assignmentId) {
        return { success: false, message: 'El ID de asignación es requerido' };
    }
    
    // 🔄 BUSCAR LA ASIGNACIÓN EN AMBAS TABLAS (SOPORTES Y PROYECTOS)
    let assignment = null;
    let assignmentType = null;
    
    // Primero buscar en asignaciones de soporte
    assignment = this.getAssignment(reportData.assignmentId);
    if (assignment) {
        assignmentType = 'support';
    } else {
        // Si no se encuentra, buscar en asignaciones de proyecto
        assignment = this.getProjectAssignment ? this.getProjectAssignment(reportData.assignmentId) : null;
        if (assignment) {
            assignmentType = 'project';
        }
    }
    
    // Si no se encuentra en ninguna tabla
    if (!assignment) {
        return { success: false, message: 'La asignación especificada no existe' };
    }
    
    // 🔄 VALIDAR QUE EL USUARIO COINCIDE (DIFERENTES CAMPOS SEGÚN EL TIPO)
    let assignmentUserId = null;

    if (assignmentType === 'support') {
        assignmentUserId = assignment.userId;
    } else if (assignmentType === 'project') {
        assignmentUserId = assignment.consultorId; // En proyectos se llama 'consultorId'
    }
    
    if (reportData.userId !== assignmentUserId) {
        return { success: false, message: 'El usuario no coincide con la asignación' };
    }
    
    const newReport = {
        id: reportId,
        userId: reportData.userId,
        assignmentId: reportData.assignmentId, // CAMPO OBLIGATORIO
        assignmentType: assignmentType, // 🆕 AGREGAR TIPO DE ASIGNACIÓN
        title: reportData.title,
        description: reportData.description || '',
        hours: reportData.hours || 0,
        reportDate: reportData.reportDate || new Date().toISOString(),
        status: 'Pendiente',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
    };
    
    reports[reportId] = newReport;
    this.setData('reports', reports);
    
    return { success: true, report: newReport };
}

getUserAssignments(userId) {
    const assignments = this.getAssignments();
    return Object.values(assignments).filter(assignment => 
        assignment.userId === userId && assignment.isActive
    );
}

// 4. AGREGAR función para obtener reportes por asignación
getReportsByAssignment(assignmentId) {
    const reports = this.getReports();
    return Object.values(reports).filter(report => 
        report.assignmentId === assignmentId
    );
}

// 5. AGREGAR función para validar si un usuario puede crear reportes
canUserCreateReport(userId) {
    const assignments = this.getUserAssignments(userId);
    return assignments.length > 0;
}

    updateReport(reportId, updateData) {
        const reports = this.getReports();
        if (!reports[reportId]) {
            return { success: false, message: 'Reporte no encontrado' };
        }
        
        reports[reportId] = { 
            ...reports[reportId], 
            ...updateData,
            updatedAt: new Date().toISOString()
        };
        this.setData('reports', reports);
        
        return { success: true, report: reports[reportId] };
    }

    deleteReport(reportId) {
        const reports = this.getReports();
        if (!reports[reportId]) {
            return { success: false, message: 'Reporte no encontrado' };
        }
        
        delete reports[reportId];
        this.setData('reports', reports);
        
        return { success: true, message: 'Reporte eliminado correctamente' };
    }

    // === ESTADÍSTICAS ===
    getStats() {
        const users = this.getUsers();
        const companies = this.getCompanies();
        const projects = this.getProjects();
        const assignments = this.getAssignments();
        const reports = this.getReports();
        const tasks = this.getTasks();
        const modules = this.getModules();
        
        return {
            totalUsers: Object.keys(users).length - 1, // -1 para excluir admin
            totalCompanies: Object.keys(companies).length,
            totalProjects: Object.keys(projects).length,
            totalAssignments: Object.keys(assignments).length,
            totalReports: Object.keys(reports).length,
            totalTasks: Object.keys(tasks).length,
            totalModules: Object.keys(modules).length,
            activeUsers: Object.values(users).filter(u => u.isActive && u.role === 'consultor').length,
            pendingReports: Object.values(reports).filter(r => r.status === 'Pendiente').length,
            approvedReports: Object.values(reports).filter(r => r.status === 'Aprobado').length,
            rejectedReports: Object.values(reports).filter(r => r.status === 'Rechazado').length
        };
    }

    // === UTILIDADES ===
    generateId(type = 'general') {
        const timestamp = Date.now();
        const random = Math.floor(Math.random() * 1000);
        return `${type}_${timestamp}_${random}`;
    }

    exportData() {
        const data = {
            users: this.getUsers(),
            companies: this.getCompanies(),
            projects: this.getProjects(),
            assignments: this.getAssignments(),
            reports: this.getReports(),
            tasks: this.getTasks(),
            modules: this.getModules(),
            exportDate: new Date().toISOString(),
            version: '2.0'
        };
        return JSON.stringify(data, null, 2);
    }

    importData(jsonData) {
        try {
            const data = JSON.parse(jsonData);
            
            if (data.users) this.setData('users', data.users);
            if (data.companies) this.setData('companies', data.companies);
            if (data.projects) this.setData('projects', data.projects);
            if (data.assignments) this.setData('assignments', data.assignments);
            if (data.reports) this.setData('reports', data.reports);
            if (data.tasks) this.setData('tasks', data.tasks);
            if (data.modules) this.setData('modules', data.modules);
            
            return { success: true, message: 'Datos importados correctamente' };
        } catch (error) {
            return { success: false, message: 'Error al importar datos: ' + error.message };
        }
    }

    // === BÚSQUEDA Y FILTROS ===
    searchTasks(criteria) {
        const tasks = Object.values(this.getTasks());
        
        return tasks.filter(task => {
            let matches = true;
            
            if (criteria.name) {
                matches = matches && task.name.toLowerCase().includes(criteria.name.toLowerCase());
            }
            
            if (criteria.status) {
                matches = matches && task.status === criteria.status;
            }
            
            if (criteria.priority) {
                matches = matches && task.priority === criteria.priority;
            }
            
            return matches;
        });
    }

    searchModules(criteria) {
        const modules = Object.values(this.getModules());
        
        return modules.filter(module => {
            let matches = true;
            
            if (criteria.name) {
                matches = matches && module.name.toLowerCase().includes(criteria.name.toLowerCase());
            }
            return matches;
        });
    }

    // === VALIDACIONES ===
    validateTaskData(taskData) {
        const errors = [];
        
        if (!taskData.name || taskData.name.trim().length === 0) {
            errors.push('El nombre de la tarea es requerido');
        }
        
        if (taskData.name && taskData.name.length > 100) {
            errors.push('El nombre de la tarea no puede exceder 100 caracteres');
        }
        
        const validStatuses = ['Pendiente', 'En Progreso', 'Completada'];
        if (taskData.status && !validStatuses.includes(taskData.status)) {
            errors.push('Estado de tarea no válido');
        }
        
        const validPriorities = ['Baja', 'Media', 'Alta'];
        if (taskData.priority && !validPriorities.includes(taskData.priority)) {
            errors.push('Prioridad no válida');
        }
        
        return {
            isValid: errors.length === 0,
            errors: errors
        };
    }

    validateModuleData(moduleData) {
        const errors = [];
        
        if (!moduleData.name || moduleData.name.trim().length === 0) {
            errors.push('El nombre del módulo es requerido');
        }
        
        if (moduleData.name && moduleData.name.length > 100) {
            errors.push('El nombre del módulo no puede exceder 100 caracteres');
        }
        
        return {
            isValid: errors.length === 0,
            errors: errors
        };
    }

    // === REPORTES AVANZADOS ===

    getTasksByPriority() {
        const tasks = Object.values(this.getTasks());
        const grouped = {};
        
        tasks.forEach(task => {
            if (!grouped[task.priority]) {
                grouped[task.priority] = [];
            }
            grouped[task.priority].push(task);
        });
        
        return grouped;
    }

    // === MÉTRICAS Y ANALYTICS ===
    getProductivityMetrics() {
        const tasks = Object.values(this.getTasks());
        const modules = Object.values(this.getModules());
        const reports = Object.values(this.getReports());
        
        // Métricas de reportes
        const totalReports = reports.length;
        const approvedReports = reports.filter(r => r.status === 'Aprobado').length;
        const reportApprovalRate = totalReports > 0 ? (approvedReports / totalReports * 100).toFixed(1) : 0;
        
        return {
            totalModules: modules.length,
            totalTasks: tasks.length,
            totalReports: totalReports,
            reportApprovalRate: reportApprovalRate
        };
    }

    // === MANTENIMIENTO DE DATOS ===
    cleanupOldData(daysOld = 365) {
        const cutoffDate = new Date(Date.now() - (daysOld * 24 * 60 * 60 * 1000));
        
        // Limpiar reportes antiguos con estado "Rechazado"
        const reports = this.getReports();
        let cleanedReports = 0;
        
        Object.keys(reports).forEach(reportId => {
            const report = reports[reportId];
            const reportDate = new Date(report.createdAt);
            
            if (report.status === 'Rechazado' && reportDate < cutoffDate) {
                delete reports[reportId];
                cleanedReports++;
            }
        });
        
        if (cleanedReports > 0) {
            this.setData('reports', reports);
        }
        
        // Limpiar tareas completadas muy antiguas
        const tasks = this.getTasks();
        let cleanedTasks = 0;
        
        Object.keys(tasks).forEach(taskId => {
            const task = tasks[taskId];
            const taskDate = new Date(task.createdAt);
            
            if (task.status === 'Completada' && taskDate < cutoffDate) {
                delete tasks[taskId];
                cleanedTasks++;
            }
        });
        
        if (cleanedTasks > 0) {
            this.setData('tasks', tasks);
        }
        
        return {
            success: true,
            message: `Limpieza completada: ${cleanedReports} reportes y ${cleanedTasks} tareas eliminadas`
        };
    }

    // === BACKUP Y RESTAURACIÓN ===
    createBackup() {
        const backupData = {
            timestamp: new Date().toISOString(),
            data: {
                users: this.getUsers(),
                companies: this.getCompanies(),
                projects: this.getProjects(),
                assignments: this.getAssignments(),
                reports: this.getReports(),
                tasks: this.getTasks(),
                modules: this.getModules()
            },
            stats: this.getStats(),
            version: '2.0'
        };
        
        // Guardar backup en localStorage
        const backupKey = `backup_${Date.now()}`;
        this.setData(backupKey, backupData);
        
        return {
            success: true,
            backupKey: backupKey,
            message: 'Backup creado correctamente'
        };
    }

    listBackups() {
        const allKeys = Object.keys(localStorage);
        const backupKeys = allKeys.filter(key => key.startsWith(this.prefix + 'backup_'));
        
        const backups = backupKeys.map(key => {
            const backup = this.getData(key.replace(this.prefix, ''));
            return {
                key: key,
                timestamp: backup.timestamp,
                stats: backup.stats
            };
        });
        
        return backups.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    }

    restoreBackup(backupKey) {
        try {
            const backup = this.getData(backupKey.replace(this.prefix, ''));
            
            if (!backup || !backup.data) {
                return { success: false, message: 'Backup no válido' };
            }
            
            // Restaurar todos los datos
            Object.keys(backup.data).forEach(dataType => {
                this.setData(dataType, backup.data[dataType]);
            });
            
            return { success: true, message: 'Backup restaurado correctamente' };
        } catch (error) {
            return { success: false, message: 'Error al restaurar backup: ' + error.message };
        }
    }

    deleteBackup(backupKey) {
        return this.deleteData(backupKey.replace(this.prefix, ''));
    }

/**
 * Obtener reportes rechazados de un usuario específico
 */
getRejectedReports(userId) {
    const reports = this.getReports();
    return Object.values(reports).filter(report => 
        report.userId === userId && report.status === 'Rechazado'
    );
}

/**
 * Obtener reportes reenviados de un usuario específico
 */
getResubmittedReports(userId) {
    const reports = this.getReports();
    return Object.values(reports).filter(report => 
        report.userId === userId && report.status === 'Resubmitted'
    );
}

/**
 * Reenviar un reporte rechazado (cambiar estado a Pendiente)
 */
resubmitReport(reportId, updateData = {}) {
    const reports = this.getReports();
    if (!reports[reportId]) {
        return { success: false, message: 'Reporte no encontrado' };
    }
    
    if (reports[reportId].status !== 'Rechazado') {
        return { success: false, message: 'Solo se pueden reenviar reportes rechazados' };
    }
    
    reports[reportId] = { 
        ...reports[reportId], 
        ...updateData,
        status: 'Pendiente', // Cambiar de Rechazado a Pendiente
        resubmittedAt: new Date().toISOString(),
        feedback: '', // Limpiar feedback anterior
        updatedAt: new Date().toISOString()
    };
    
    this.setData('reports', reports);
    
    return { success: true, report: reports[reportId] };
}

/**
 * Obtener estadísticas de reportes por usuario
 */
getUserReportStats(userId) {
    const reports = Object.values(this.getReports()).filter(r => r.userId === userId);
    
    return {
        total: reports.length,
        pending: reports.filter(r => r.status === 'Pendiente').length,
        approved: reports.filter(r => r.status === 'Aprobado').length,
        rejected: reports.filter(r => r.status === 'Rechazado').length,
        resubmitted: reports.filter(r => r.status === 'Resubmitted').length
    };
}

    // === GESTIÓN DE REPORTES EXCEL GENERADOS ===
getGeneratedReports() {
    return this.getData('generated_reports') || {};
}

saveGeneratedReport(reportData) {
    const generatedReports = this.getGeneratedReports();
    const reportId = `excel_${Date.now()}`;
    
    const newGeneratedReport = {
        id: reportId,
        fileName: reportData.fileName,
        reportType: reportData.reportType, // 'actividades' o 'pagos'
        generatedBy: reportData.generatedBy || 'admin',
        dateRange: reportData.dateRange,
        recordCount: reportData.recordCount || 0,
        totalHours: reportData.totalHours || 0,
        totalAmount: reportData.totalAmount || 0,
        createdAt: new Date().toISOString(),
        downloadCount: 0
    };
    
    generatedReports[reportId] = newGeneratedReport;
    this.setData('generated_reports', generatedReports);
    
    return { success: true, report: newGeneratedReport };
}

incrementDownloadCount(reportId) {
    const generatedReports = this.getGeneratedReports();
    if (generatedReports[reportId]) {
        generatedReports[reportId].downloadCount++;
        generatedReports[reportId].lastDownload = new Date().toISOString();
        this.setData('generated_reports', generatedReports);
        return { success: true };
    }
    return { success: false, message: 'Reporte no encontrado' };
}

deleteGeneratedReport(reportId) {
    const generatedReports = this.getGeneratedReports();
    if (!generatedReports[reportId]) {
        return { success: false, message: 'Reporte no encontrado' };
    }
    
    delete generatedReports[reportId];
    this.setData('generated_reports', generatedReports);
    
    return { success: true, message: 'Reporte eliminado del historial' };
}

    // === FUNCIONES ESPECÍFICAS PARA EL ADMIN ===
    updateProjectsList() {
        const projects = Object.values(this.getProjects());
        return projects.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    }

    updateTasksList() {
        const tasks = Object.values(this.getTasks());
        return tasks.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    }

    updateModulesList() {
        const modules = Object.values(this.getModules());
        return modules.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    }

    updateAssignmentsList() {
        const assignments = Object.values(this.getAssignments());
        return assignments.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    }

    // === FUNCIONES AUXILIARES ===
    getRecentAssignments(limit = 5) {
        const supportAssignments = Object.values(this.getAssignments()).map(assignment => ({
            ...assignment,
            assignmentType: 'support'
        }));
        
        const projectAssignments = Object.values(this.getProjectAssignments()).map(assignment => ({
            ...assignment,
            assignmentType: 'project'
        }));
        
        const allAssignments = [...supportAssignments, ...projectAssignments];
        
        return allAssignments
            .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
            .slice(0, limit);
    }

    getUserAssignments(userId) {
        const assignments = Object.values(this.getAssignments());
        return assignments.filter(assignment => assignment.userId === userId);
    }

    getCompanyAssignments(companyId) {
        const assignments = Object.values(this.getAssignments());
        return assignments.filter(assignment => assignment.companyId === companyId);
    }

    getProjectAssignments(projectId) {
        const assignments = Object.values(this.getAssignments());
        return assignments.filter(assignment => assignment.projectId === projectId);
    }

    getUserProjectAssignments(consultorId) {
        const projectAssignments = Object.values(this.getProjectAssignments());
        return projectAssignments.filter(assignment => 
            assignment.consultorId === consultorId && assignment.isActive
        );
    }

    // === FUNCIONES DE RESET ===
    resetToDefaults() {
        this.clearAllData();
        this.initializeDefaultData();
        return { success: true, message: 'Sistema reiniciado a valores por defecto' };
    }

    // === FUNCIONES DE CONSISTENCIA ===
    checkDataConsistency() {
        const issues = [];
        
        // Verificar asignaciones huérfanas
        const assignments = Object.values(this.getAssignments());
        const users = this.getUsers();
        const companies = this.getCompanies();
        const projects = this.getProjects();
        const tasks = this.getTasks();
        const modules = this.getModules();
        
        assignments.forEach(assignment => {
            if (!users[assignment.userId]) {
                issues.push(`Asignación ${assignment.id} tiene usuario inexistente: ${assignment.userId}`);
            }
            if (!companies[assignment.companyId]) {
                issues.push(`Asignación ${assignment.id} tiene empresa inexistente: ${assignment.companyId}`);
            }
            if (!projects[assignment.projectId]) {
                issues.push(`Asignación ${assignment.id} tiene proyecto inexistente: ${assignment.projectId}`);
            }
            if (!tasks[assignment.taskId]) {
                issues.push(`Asignación ${assignment.id} tiene tarea inexistente: ${assignment.taskId}`);
            }
            if (!modules[assignment.moduleId]) {
                issues.push(`Asignación ${assignment.id} tiene módulo inexistente: ${assignment.moduleId}`);
            }
        });
        
        // Verificar reportes huérfanos
        const reports = Object.values(this.getReports());
        reports.forEach(report => {
            if (!users[report.userId]) {
                issues.push(`Reporte ${report.id} tiene usuario inexistente: ${report.userId}`);
            }
        });
        
        return {
            isConsistent: issues.length === 0,
            issues: issues,
            checkedAt: new Date().toISOString()
        };
    }

    // === FUNCIONES DE OPTIMIZACIÓN ===
    optimizeStorage() {
        // Compactar datos eliminando propiedades innecesarias
        const optimized = {
            users: 0,
            companies: 0,
            projects: 0,
            tasks: 0,
            modules: 0,
            assignments: 0,
            reports: 0
        };
        
        // Optimizar cada tipo de datos
        ['users', 'companies', 'projects', 'tasks', 'modules', 'assignments', 'reports'].forEach(dataType => {
            const data = this.getData(dataType);
            if (data) {
                // Contar registros antes
                const beforeCount = Object.keys(data).length;
                
                // Limpiar registros inactivos muy antiguos si aplica
                if (dataType === 'tasks' || dataType === 'modules') {
                    const cutoffDate = new Date(Date.now() - (90 * 24 * 60 * 60 * 1000)); // 90 días
                    Object.keys(data).forEach(id => {
                        const item = data[id];
                        if (!item.isActive && new Date(item.createdAt) < cutoffDate) {
                            delete data[id];
                        }
                    });
                }
                
                // Contar registros después
                const afterCount = Object.keys(data).length;
                optimized[dataType] = beforeCount - afterCount;
                
                // Guardar datos optimizados
                this.setData(dataType, data);
            }
        });
        
        return {
            success: true,
            message: 'Almacenamiento optimizado',
            optimized: optimized,
            optimizedAt: new Date().toISOString()
        };
    }

    setupDefaultProjectAssignments() {
        const defaultProjectAssignments = {
            'proj_assign_001': {
                id: 'proj_assign_001',
                projectId: '0001',
                consultorId: '0001',      // UN SOLO consultor
                companyId: '0001',
                moduleId: '0001',
                createdAt: new Date().toISOString(),
                isActive: true
            }
        };
        this.setData('project_assignments', defaultProjectAssignments);
    }

    getProjectAssignments() {
        return this.getData('project_assignments') || {};
    }

    getProjectAssignment(assignmentId) {
        const projectAssignments = this.getProjectAssignments();
        return projectAssignments[assignmentId] || null;
    }

createProjectAssignment(assignmentData) {
    try {
        const projectAssignments = this.getData('project_assignments') || {};
        const assignmentId = `proj_assign_${Date.now()}`;
        
        const assignment = {
            id: assignmentId,
            consultorId: assignmentData.consultorId,
            companyId: assignmentData.companyId,
            projectId: assignmentData.projectId,
            moduleId: assignmentData.moduleId,
            tarifaConsultor: parseFloat(assignmentData.tarifaConsultor) || 0,
            tarifaCliente: parseFloat(assignmentData.tarifaCliente) || 0,
            createdAt: new Date().toISOString()
        };
        
        projectAssignments[assignmentId] = assignment;
        this.setData('project_assignments', projectAssignments);
        
        console.log('✅ Asignación de proyecto creada:', assignmentId);
        
        // CORRECCIÓN: Siempre crear entrada en tarifario si hay tarifas > 0
        const tieneConsultor = assignment.tarifaConsultor > 0;
        const tieneCliente = assignment.tarifaCliente > 0;
        
        if (tieneConsultor || tieneCliente) {
            console.log('💰 Creando entrada en tarifario con tarifas:', {
                consultor: assignment.tarifaConsultor,
                cliente: assignment.tarifaCliente
            });
            
            const tarifaResult = this.createTarifaEntry(assignment);
            
            if (tarifaResult.success) {
                console.log('✅ Entrada en tarifario creada:', tarifaResult.tarifaId);
            } else {
                console.error('❌ Error al crear entrada en tarifario:', tarifaResult.message);
            }
        } else {
            console.warn('⚠️ Asignación de proyecto creada sin tarifas, no se agregó al tarifario');
        }
        
        return { success: true, assignmentId: assignmentId };
        
    } catch (error) {
        console.error('Error al crear asignación de proyecto:', error);
        return { success: false, message: error.message };
    }
}

    deleteProjectAssignment(assignmentId) {
    try {
        const projectAssignments = this.getData('project_assignments') || {};
        
        if (projectAssignments[assignmentId]) {
            delete projectAssignments[assignmentId];
            this.setData('project_assignments', projectAssignments);
            
            // También eliminar entrada de tarifario
            const tarifaId = `tarifa_${assignmentId}`;  // ← NUEVO BLOQUE
            this.deleteTarifaEntry(tarifaId);
            
            console.log('✅ Asignación de proyecto eliminada:', assignmentId);
            return { success: true };
        }
        
        return { success: false, message: 'Asignación no encontrada' };
        
    } catch (error) {
        console.error('Error al eliminar asignación de proyecto:', error);
        return { success: false, message: error.message };
    }
}

    // ===================================================================
// GESTIÓN DE TARIFARIO
// ===================================================================

/**
 * Crear entrada en tarifario para una asignación
 */
createTarifaEntry(assignmentData) {
    try {
        const tarifario = this.getData('tarifario') || {};
        
        // Generar ID único para la entrada de tarifario
        const tarifaId = `tarifa_${assignmentData.id}`;
        
        // Obtener información adicional
        const consultor = this.getUser(assignmentData.consultorId || assignmentData.userId);
        const cliente = this.getCompany(assignmentData.companyId);
        const modulo = this.getModule(assignmentData.moduleId);
        
        // Determinar tipo y trabajo
        let tipo, trabajoId, trabajoNombre;
        
        if (assignmentData.supportId) {
            tipo = 'soporte';
            const soporte = this.getSupport(assignmentData.supportId);
            trabajoId = assignmentData.supportId;
            trabajoNombre = soporte ? soporte.name : 'Desconocido';
        } else if (assignmentData.projectId) {
            tipo = 'proyecto';
            const proyecto = this.getProject(assignmentData.projectId);
            trabajoId = assignmentData.projectId;
            trabajoNombre = proyecto ? proyecto.name : 'Desconocido';
        }
        
        // Calcular margen
        const margen = (assignmentData.tarifaCliente || 0) - (assignmentData.tarifaConsultor || 0);
        
        // Crear entrada de tarifario
        const tarifaEntry = {
            id: tarifaId,
            
            // Campos principales (Tabla de Unión)
            modulo: modulo ? modulo.code || modulo.id : 'N/A',
            idAsignacion: assignmentData.id,
            costoConsultor: assignmentData.tarifaConsultor || 0,
            costoCliente: assignmentData.tarifaCliente || 0,
            
            // Campos adicionales para gestión
            tipo: tipo,
            moduloNombre: modulo ? modulo.name : 'Desconocido',
            consultorId: assignmentData.consultorId || assignmentData.userId,
            consultorNombre: consultor ? consultor.name : 'Desconocido',
            clienteId: assignmentData.companyId,
            clienteNombre: cliente ? cliente.name : 'Desconocido',
            trabajoId: trabajoId,
            trabajoNombre: trabajoNombre,
            margen: margen,
            fechaCreacion: assignmentData.createdAt || new Date().toISOString(),
            isActive: true
        };
        
        // Guardar en tarifario
        tarifario[tarifaId] = tarifaEntry;
        this.setData('tarifario', tarifario);
        
        console.log('✅ Entrada de tarifario creada:', tarifaId);
        
        return { success: true, tarifaId: tarifaId, data: tarifaEntry };
        
    } catch (error) {
        console.error('❌ Error al crear entrada de tarifario:', error);
        return { success: false, message: error.message };
    }
}

/**
 * Actualizar entrada de tarifario
 */
updateTarifaEntry(tarifaId, updates) {
    try {
        const tarifario = this.getData('tarifario') || {};
        
        if (!tarifario[tarifaId]) {
            return { success: false, message: 'Entrada de tarifario no encontrada' };
        }
        
        // Actualizar campos
        tarifario[tarifaId] = {
            ...tarifario[tarifaId],
            ...updates
        };
        
        // Recalcular margen si se actualizaron las tarifas
        if (updates.costoConsultor !== undefined || updates.costoCliente !== undefined) {
            tarifario[tarifaId].margen = tarifario[tarifaId].costoCliente - tarifario[tarifaId].costoConsultor;
        }
        
        this.setData('tarifario', tarifario);
        
        // También actualizar la asignación original
        const idAsignacion = tarifario[tarifaId].idAsignacion;
        if (updates.costoConsultor !== undefined || updates.costoCliente !== undefined) {
            this.updateAssignmentTarifas(idAsignacion, {
                tarifaConsultor: tarifario[tarifaId].costoConsultor,
                tarifaCliente: tarifario[tarifaId].costoCliente
            });
        }
        
        console.log('✅ Entrada de tarifario actualizada:', tarifaId);
        
        return { success: true, data: tarifario[tarifaId] };
        
    } catch (error) {
        console.error('❌ Error al actualizar entrada de tarifario:', error);
        return { success: false, message: error.message };
    }
}

/**
 * Actualizar tarifas de una asignación
 */
updateAssignmentTarifas(assignmentId, tarifas) {
    try {
        // Buscar en assignments (soporte)
        const assignments = this.getData('assignments') || {};
        if (assignments[assignmentId]) {
            assignments[assignmentId].tarifaConsultor = tarifas.tarifaConsultor;
            assignments[assignmentId].tarifaCliente = tarifas.tarifaCliente;
            this.setData('assignments', assignments);
            return { success: true };
        }
        
        // Buscar en project_assignments
        const projectAssignments = this.getData('project_assignments') || {};
        if (projectAssignments[assignmentId]) {
            projectAssignments[assignmentId].tarifaConsultor = tarifas.tarifaConsultor;
            projectAssignments[assignmentId].tarifaCliente = tarifas.tarifaCliente;
            this.setData('project_assignments', projectAssignments);
            return { success: true };
        }
        
        return { success: false, message: 'Asignación no encontrada' };
        
    } catch (error) {
        console.error('❌ Error al actualizar tarifas de asignación:', error);
        return { success: false, message: error.message };
    }
}

/**
 * Obtener todo el tarifario
 */
getTarifario() {
    return this.getData('tarifario') || {};
}

/**
 * Obtener entrada de tarifario por ID de asignación
 */
getTarifaByAssignment(assignmentId) {
    const tarifario = this.getData('tarifario') || {};
    const tarifaId = `tarifa_${assignmentId}`;
    return tarifario[tarifaId] || null;
}

/**
 * Eliminar entrada de tarifario
 */
deleteTarifaEntry(tarifaId) {
    try {
        const tarifario = this.getData('tarifario') || {};
        
        if (tarifario[tarifaId]) {
            delete tarifario[tarifaId];
            this.setData('tarifario', tarifario);
            console.log('✅ Entrada de tarifario eliminada:', tarifaId);
            return { success: true };
        }
        
        return { success: false, message: 'Entrada no encontrada' };
        
    } catch (error) {
        console.error('❌ Error al eliminar entrada de tarifario:', error);
        return { success: false, message: error.message };
    }
}

/**
 * Obtener tarifas por consultor
 */
getTarifasByConsultor(consultorId) {
    const tarifario = this.getData('tarifario') || {};
    return Object.values(tarifario).filter(t => t.consultorId === consultorId);
}

/**
 * Obtener resumen de consultores
 */
getConsultoresResumen() {
    const tarifario = this.getData('tarifario') || {};
    const consultores = {};
    
    // Agrupar por consultor
    Object.values(tarifario).forEach(tarifa => {
        const consultorId = tarifa.consultorId;
        
        if (!consultores[consultorId]) {
            consultores[consultorId] = {
                id: consultorId,
                nombre: tarifa.consultorNombre,
                totalAsignaciones: 0,
                modulos: new Set(),
                clientes: new Set(),
                promedioTarifa: 0,
                sumaTarifas: 0
            };
        }
        
        consultores[consultorId].totalAsignaciones++;
        consultores[consultorId].modulos.add(tarifa.moduloNombre);
        consultores[consultorId].clientes.add(tarifa.clienteNombre);
        consultores[consultorId].sumaTarifas += tarifa.costoConsultor;
    });
    
    // Calcular promedios y convertir Sets a Arrays
    Object.keys(consultores).forEach(id => {
        consultores[id].promedioTarifa = consultores[id].sumaTarifas / consultores[id].totalAsignaciones;
        consultores[id].modulos = Array.from(consultores[id].modulos).join(', ');
        consultores[id].clientes = Array.from(consultores[id].clientes).join(', ');
        delete consultores[id].sumaTarifas;
    });
    
    return consultores;
}

/**
 * Configurar tarifas para una asignación existente
 */
configurarTarifasAsignacion(assignmentId, tarifas) {
    try {
        // Actualizar asignación
        const updateResult = this.updateAssignmentTarifas(assignmentId, tarifas);
        
        if (!updateResult.success) {
            return updateResult;
        }
        
        // Obtener asignación actualizada
        let assignment = this.getAssignment(assignmentId);
        if (!assignment) {
            assignment = this.getProjectAssignment(assignmentId);
        }
        
        if (!assignment) {
            return { success: false, message: 'Asignación no encontrada' };
        }
        
        // Crear o actualizar entrada en tarifario
        const tarifaId = `tarifa_${assignmentId}`;
        const tarifario = this.getData('tarifario') || {};
        
        if (tarifario[tarifaId]) {
            // Ya existe, actualizar
            return this.updateTarifaEntry(tarifaId, {
                costoConsultor: tarifas.tarifaConsultor,
                costoCliente: tarifas.tarifaCliente
            });
        } else {
            // No existe, crear
            return this.createTarifaEntry(assignment);
        }
        
    } catch (error) {
        console.error('❌ Error al configurar tarifas:', error);
        return { success: false, message: error.message };
    }
}

}

// Crear instancia global de la base de datos
window.PortalDB = new PortalDatabase();

// Exportar para uso en módulos si es necesario
if (typeof module !== 'undefined' && module.exports) {
    module.exports = PortalDatabase;
}

console.log('✅ Sistema de Base de Datos Portal ARVIC inicializado correctamente');
