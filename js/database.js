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
        this.setupDefaultSupports(); // Cambiar de setupDefaultTasks
        this.setupDefaultModules();
        this.setupDefaultAssignments();
        this.setupDefaultReports();
        this.setData('initialized', true);
        this.setData('user_counter', 3);
        this.setData('company_counter', 4);
        this.setData('project_counter', 4);
        this.setData('support_counter', 4); // Cambiar de task_counter
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
                status: 'En Progreso',
                createdAt: new Date().toISOString(),
                isActive: true
            },
            '0002': {
                id: '0002',
                name: 'Portal Web Corporativo',
                description: 'Desarrollo de sitio web institucional con CMS',
                status: 'En Progreso',
                createdAt: new Date().toISOString(),
                isActive: true
            },
            '0003': {
                id: '0003',
                name: 'App Móvil de Ventas',
                description: 'Aplicación móvil para gestión de ventas y clientes',
                status: 'Planificación',
                createdAt: new Date().toISOString(),
                isActive: true
            }
        };
        this.setData('projects', defaultProjects);
    }

    etupDefaultSupports() {
    const defaultSupports = {
        '0001': {
            id: '0001',
            name: 'Soporte técnico sistema ERP',
            description: 'Soporte para configuración y resolución de problemas del ERP',
            status: 'Activo',
            priority: 'Alta',
            type: 'Técnico',
            createdAt: new Date(Date.now() - 86400000 * 7).toISOString(),
            isActive: true
        },
        '0002': {
            id: '0002',
            name: 'Soporte funcional módulo ventas',
            description: 'Apoyo en el uso y configuración del módulo de ventas',
            status: 'Activo',
            priority: 'Media',
            type: 'Funcional',
            createdAt: new Date(Date.now() - 86400000 * 3).toISOString(),
            isActive: true
        },
        '0003': {
            id: '0003',
            name: 'Mantenimiento preventivo sistema',
            description: 'Revisión y mantenimiento del sistema completo',
            status: 'Activo',
            priority: 'Baja',
            type: 'Mantenimiento',
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
                category: 'Backend',
                status: 'Completado',
                createdAt: new Date(Date.now() - 86400000 * 10).toISOString(),
                isActive: true
            },
            '0002': {
                id: '0002',
                name: 'Panel de Administración',
                description: 'Interfaz para gestión de usuarios y configuración',
                category: 'Frontend',
                status: 'En Desarrollo',
                createdAt: new Date(Date.now() - 86400000 * 5).toISOString(),
                isActive: true
            },
            '0003': {
                id: '0003',
                name: 'API de Reportes',
                description: 'Endpoints para creación y gestión de reportes',
                category: 'API',
                status: 'Planificación',
                createdAt: new Date().toISOString(),
                isActive: true
            }
        };
        this.setData('modules', defaultModules);
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
            status: projectData.status || 'Planificación',
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
        status: supportData.status || 'Activo',
        priority: supportData.priority || 'Media',
        type: supportData.type || 'Técnico',
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
            category: moduleData.category || 'Otros',
            status: moduleData.status || 'Planificación',
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
    const assignments = this.getAssignments();
    const assignmentId = `assign_${Date.now()}`;
    
    // Verificar que existan todas las entidades
    const user = this.getUser(assignmentData.userId);
    const company = this.getCompany(assignmentData.companyId);
    const support = this.getSupport(assignmentData.supportId); // Cambiar de taskId
    const module = this.getModule(assignmentData.moduleId);
    
    if (!user || !company || !support || !module) {
        return { success: false, message: 'Una o más entidades no existen' };
    }
    
    // Verificar si ya existe una asignación igual
    const existingAssignment = Object.values(assignments).find(a => 
        a.userId === assignmentData.userId &&
        a.companyId === assignmentData.companyId &&
        a.supportId === assignmentData.supportId && // Cambiar de taskId
        a.moduleId === assignmentData.moduleId &&
        a.isActive
    );
    
    if (existingAssignment) {
        return { success: false, message: 'Ya existe una asignación idéntica para este usuario' };
    }
    
    const newAssignment = {
        id: assignmentId,
        userId: assignmentData.userId,
        companyId: assignmentData.companyId,
        supportId: assignmentData.supportId, // Cambiar de taskId
        moduleId: assignmentData.moduleId,
        createdAt: new Date().toISOString(),
        isActive: true
    };
    
    assignments[assignmentId] = newAssignment;
    this.setData('assignments', assignments);
    
    return { success: true, assignment: newAssignment };
}



    deleteAssignment(assignmentId) {
        const assignments = this.getAssignments();
        const assignment = assignments[assignmentId];
        
        if (!assignment) {
            return { success: false, message: 'Asignación no encontrada' };
        }
        
        // Remover asignación del usuario
        const user = this.getUser(assignment.userId);
        if (user) {
            this.updateUser(assignment.userId, {
                assignedCompany: null,
                assignedProject: null
            });
        }
        
        delete assignments[assignmentId];
        this.setData('assignments', assignments);
        
        return { success: true, message: 'Asignación eliminada correctamente' };
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
    
    const assignment = this.getAssignment(reportData.assignmentId);
    if (!assignment) {
        return { success: false, message: 'La asignación especificada no existe' };
    }
    
    // VALIDAR que el usuario coincide con el de la asignación
    if (reportData.userId !== assignment.userId) {
        return { success: false, message: 'El usuario no coincide con la asignación' };
    }
    
    const newReport = {
        id: reportId,
        userId: reportData.userId,
        assignmentId: reportData.assignmentId, // CAMPO OBLIGATORIO
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
            rejectedReports: Object.values(reports).filter(r => r.status === 'Rechazado').length,
            completedTasks: Object.values(tasks).filter(t => t.status === 'Completada').length,
            pendingTasks: Object.values(tasks).filter(t => t.status === 'Pendiente').length,
            inProgressTasks: Object.values(tasks).filter(t => t.status === 'En Progreso').length,
            completedModules: Object.values(modules).filter(m => m.status === 'Completado').length,
            inDevelopmentModules: Object.values(modules).filter(m => m.status === 'En Desarrollo').length,
            plannedModules: Object.values(modules).filter(m => m.status === 'Planificación').length
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
            
            if (criteria.category) {
                matches = matches && module.category === criteria.category;
            }
            
            if (criteria.status) {
                matches = matches && module.status === criteria.status;
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
        
        const validCategories = ['Frontend', 'Backend', 'Base de Datos', 'API', 'Integración', 'Otros'];
        if (moduleData.category && !validCategories.includes(moduleData.category)) {
            errors.push('Categoría no válida');
        }
        
        const validStatuses = ['Planificación', 'En Desarrollo', 'Completado'];
        if (moduleData.status && !validStatuses.includes(moduleData.status)) {
            errors.push('Estado del módulo no válido');
        }
        
        return {
            isValid: errors.length === 0,
            errors: errors
        };
    }

    // === REPORTES AVANZADOS ===
    getModulesByCategory() {
        const modules = Object.values(this.getModules());
        const grouped = {};
        
        modules.forEach(module => {
            if (!grouped[module.category]) {
                grouped[module.category] = [];
            }
            grouped[module.category].push(module);
        });
        
        return grouped;
    }

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
        
        // Calcular métricas de tareas
        const totalTasks = tasks.length;
        const completedTasks = tasks.filter(t => t.status === 'Completada').length;
        const taskCompletionRate = totalTasks > 0 ? (completedTasks / totalTasks * 100).toFixed(1) : 0;
        
        // Tareas por prioridad
        const tasksByPriority = {
            alta: tasks.filter(t => t.priority === 'Alta').length,
            media: tasks.filter(t => t.priority === 'Media').length,
            baja: tasks.filter(t => t.priority === 'Baja').length
        };
        
        // Calcular métricas de módulos
        const totalModules = modules.length;
        const completedModules = modules.filter(m => m.status === 'Completado').length;
        const moduleCompletionRate = totalModules > 0 ? (completedModules / totalModules * 100).toFixed(1) : 0;
        
        // Módulos por categoría
        const modulesByCategory = {
            frontend: modules.filter(m => m.category === 'Frontend').length,
            backend: modules.filter(m => m.category === 'Backend').length,
            database: modules.filter(m => m.category === 'Base de Datos').length,
            api: modules.filter(m => m.category === 'API').length,
            integration: modules.filter(m => m.category === 'Integración').length,
            others: modules.filter(m => m.category === 'Otros').length
        };
        
        // Métricas de reportes
        const totalReports = reports.length;
        const approvedReports = reports.filter(r => r.status === 'Aprobado').length;
        const reportApprovalRate = totalReports > 0 ? (approvedReports / totalReports * 100).toFixed(1) : 0;
        
        return {
            tasks: {
                total: totalTasks,
                completed: completedTasks,
                completionRate: taskCompletionRate,
                byPriority: tasksByPriority
            },
            modules: {
                total: totalModules,
                completed: completedModules,
                completionRate: moduleCompletionRate,
                byCategory: modulesByCategory
            },
            reports: {
                total: totalReports,
                approved: approvedReports,
                approvalRate: reportApprovalRate
            },
            generatedAt: new Date().toISOString()
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
        const assignments = Object.values(this.getAssignments());
        return assignments
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
}

// Crear instancia global de la base de datos
window.PortalDB = new PortalDatabase();

// Exportar para uso en módulos si es necesario
if (typeof module !== 'undefined' && module.exports) {
    module.exports = PortalDatabase;
}

console.log('✅ Sistema de Base de Datos Portal ARVIC inicializado correctamente');