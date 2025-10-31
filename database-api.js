/**
 * === SISTEMA DE BASE DE DATOS PARA PORTAL ARVIC CON API ===
 * Conecta con el backend en lugar de usar localStorage
 */

class PortalDatabase {
    constructor() {
        // URL del API - detecta automáticamente si es producción o desarrollo
        this.API_URL = window.location.hostname === 'localhost' 
            ? 'http://localhost:3000/api' 
            : '/api';
        
        this.token = localStorage.getItem('arvic_token') || null;
        console.log('✅ Sistema de Base de Datos conectado al API:', this.API_URL);
    }

    // === CONFIGURACIÓN DE HEADERS ===
    getHeaders() {
        const headers = {
            'Content-Type': 'application/json'
        };
        if (this.token) {
            headers['Authorization'] = `Bearer ${this.token}`;
        }
        return headers;
    }

    // === AUTENTICACIÓN ===
    async validateUser(userId, password) {
        try {
            const response = await fetch(`${this.API_URL}/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId, password })
            });

            const data = await response.json();
            
            if (data.success) {
                this.token = data.token;
                localStorage.setItem('arvic_token', data.token);
                return { success: true, user: data.user };
            }
            
            return { success: false, message: data.message };
        } catch (error) {
            console.error('Error en login:', error);
            return { success: false, message: 'Error de conexión' };
        }
    }

    // === USUARIOS ===
    async getUsers() {
        try {
            const response = await fetch(`${this.API_URL}/users`, {
                headers: this.getHeaders()
            });
            const data = await response.json();
            return data.success ? data.data : [];
        } catch (error) {
            console.error('Error obteniendo usuarios:', error);
            return [];
        }
    }

    async getUser(userId) {
        try {
            const response = await fetch(`${this.API_URL}/users/${userId}`, {
                headers: this.getHeaders()
            });
            const data = await response.json();
            return data.success ? data.data : null;
        } catch (error) {
            console.error('Error obteniendo usuario:', error);
            return null;
        }
    }

    async createUser(userData) {
        try {
            const response = await fetch(`${this.API_URL}/users`, {
                method: 'POST',
                headers: this.getHeaders(),
                body: JSON.stringify(userData)
            });
            return await response.json();
        } catch (error) {
            console.error('Error creando usuario:', error);
            return { success: false, message: 'Error de conexión' };
        }
    }

    async updateUser(userId, updates) {
        try {
            const response = await fetch(`${this.API_URL}/users/${userId}`, {
                method: 'PUT',
                headers: this.getHeaders(),
                body: JSON.stringify(updates)
            });
            return await response.json();
        } catch (error) {
            console.error('Error actualizando usuario:', error);
            return { success: false, message: 'Error de conexión' };
        }
    }

    async deleteUser(userId) {
        try {
            const response = await fetch(`${this.API_URL}/users/${userId}`, {
                method: 'DELETE',
                headers: this.getHeaders()
            });
            return await response.json();
        } catch (error) {
            console.error('Error eliminando usuario:', error);
            return { success: false, message: 'Error de conexión' };
        }
    }

    // === EMPRESAS ===
    async getCompanies() {
        try {
            const response = await fetch(`${this.API_URL}/companies`, {
                headers: this.getHeaders()
            });
            const data = await response.json();
            return data.success ? data.data : [];
        } catch (error) {
            console.error('Error obteniendo empresas:', error);
            return [];
        }
    }

    async getCompany(companyId) {
        try {
            const response = await fetch(`${this.API_URL}/companies/${companyId}`, {
                headers: this.getHeaders()
            });
            const data = await response.json();
            return data.success ? data.data : null;
        } catch (error) {
            console.error('Error obteniendo empresa:', error);
            return null;
        }
    }

    async createCompany(companyData) {
        try {
            const response = await fetch(`${this.API_URL}/companies`, {
                method: 'POST',
                headers: this.getHeaders(),
                body: JSON.stringify(companyData)
            });
            return await response.json();
        } catch (error) {
            return { success: false, message: 'Error de conexión' };
        }
    }

    async updateCompany(companyId, updates) {
        try {
            const response = await fetch(`${this.API_URL}/companies/${companyId}`, {
                method: 'PUT',
                headers: this.getHeaders(),
                body: JSON.stringify(updates)
            });
            return await response.json();
        } catch (error) {
            return { success: false, message: 'Error de conexión' };
        }
    }

    async deleteCompany(companyId) {
        try {
            const response = await fetch(`${this.API_URL}/companies/${companyId}`, {
                method: 'DELETE',
                headers: this.getHeaders()
            });
            return await response.json();
        } catch (error) {
            return { success: false, message: 'Error de conexión' };
        }
    }

    // === PROYECTOS, SOPORTES, MÓDULOS (mismo patrón) ===
    async getProjects() {
        try {
            const response = await fetch(`${this.API_URL}/projects`, { headers: this.getHeaders() });
            const data = await response.json();
            return data.success ? data.data : [];
        } catch (error) {
            return [];
        }
    }

    async createProject(projectData) {
        try {
            const response = await fetch(`${this.API_URL}/projects`, {
                method: 'POST',
                headers: this.getHeaders(),
                body: JSON.stringify(projectData)
            });
            return await response.json();
        } catch (error) {
            return { success: false, message: 'Error de conexión' };
        }
    }

    async getSupports() {
        try {
            const response = await fetch(`${this.API_URL}/supports`, { headers: this.getHeaders() });
            const data = await response.json();
            return data.success ? data.data : [];
        } catch (error) {
            return [];
        }
    }

    async createSupport(supportData) {
        try {
            const response = await fetch(`${this.API_URL}/supports`, {
                method: 'POST',
                headers: this.getHeaders(),
                body: JSON.stringify(supportData)
            });
            return await response.json();
        } catch (error) {
            return { success: false, message: 'Error de conexión' };
        }
    }

    async getModules() {
        try {
            const response = await fetch(`${this.API_URL}/modules`, { headers: this.getHeaders() });
            const data = await response.json();
            return data.success ? data.data : [];
        } catch (error) {
            return [];
        }
    }

    async createModule(moduleData) {
        try {
            const response = await fetch(`${this.API_URL}/modules`, {
                method: 'POST',
                headers: this.getHeaders(),
                body: JSON.stringify(moduleData)
            });
            return await response.json();
        } catch (error) {
            return { success: false, message: 'Error de conexión' };
        }
    }

    // === ASIGNACIONES ===
    async getAssignments() {
        try {
            const response = await fetch(`${this.API_URL}/assignments`, { headers: this.getHeaders() });
            const data = await response.json();
            return data.success ? data.data : [];
        } catch (error) {
            return [];
        }
    }

    async createAssignment(assignmentData) {
        try {
            const response = await fetch(`${this.API_URL}/assignments`, {
                method: 'POST',
                headers: this.getHeaders(),
                body: JSON.stringify(assignmentData)
            });
            return await response.json();
        } catch (error) {
            return { success: false, message: 'Error de conexión' };
        }
    }

    async getProjectAssignments() {
        try {
            const response = await fetch(`${this.API_URL}/assignments/projects`, { headers: this.getHeaders() });
            const data = await response.json();
            return data.success ? data.data : [];
        } catch (error) {
            return [];
        }
    }

    async createProjectAssignment(assignmentData) {
        try {
            const response = await fetch(`${this.API_URL}/assignments/projects`, {
                method: 'POST',
                headers: this.getHeaders(),
                body: JSON.stringify(assignmentData)
            });
            return await response.json();
        } catch (error) {
            return { success: false, message: 'Error de conexión' };
        }
    }

    // === REPORTES ===
    async getReports(userId = null) {
        try {
            const url = userId ? `${this.API_URL}/reports?userId=${userId}` : `${this.API_URL}/reports`;
            const response = await fetch(url, { headers: this.getHeaders() });
            const data = await response.json();
            return data.success ? data.data : [];
        } catch (error) {
            return [];
        }
    }

    async createReport(reportData) {
        try {
            const response = await fetch(`${this.API_URL}/reports`, {
                method: 'POST',
                headers: this.getHeaders(),
                body: JSON.stringify(reportData)
            });
            return await response.json();
        } catch (error) {
            return { success: false, message: 'Error de conexión' };
        }
    }

    async updateReport(reportId, updates) {
        try {
            const response = await fetch(`${this.API_URL}/reports/${reportId}`, {
                method: 'PUT',
                headers: this.getHeaders(),
                body: JSON.stringify(updates)
            });
            return await response.json();
        } catch (error) {
            return { success: false, message: 'Error de conexión' };
        }
    }

    // === TARIFARIO ===
    async getTarifario() {
        try {
            const response = await fetch(`${this.API_URL}/tarifario`, { headers: this.getHeaders() });
            const data = await response.json();
            return data.success ? data.data : [];
        } catch (error) {
            return [];
        }
    }

    async createTarifaEntry(tarifaData) {
        try {
            const response = await fetch(`${this.API_URL}/tarifario`, {
                method: 'POST',
                headers: this.getHeaders(),
                body: JSON.stringify(tarifaData)
            });
            return await response.json();
        } catch (error) {
            return { success: false, message: 'Error de conexión' };
        }
    }

    // === MÉTODOS DE COMPATIBILIDAD ===
    // Estos métodos mantienen compatibilidad con el código existente
    getProject(projectId) {
        return this.getProjects().then(projects => 
            projects.find(p => p.id === projectId) || null
        );
    }

    getSupport(supportId) {
        return this.getSupports().then(supports => 
            supports.find(s => s.id === supportId) || null
        );
    }

    getModule(moduleId) {
        return this.getModules().then(modules => 
            modules.find(m => m.id === moduleId) || null
        );
    }

    getAssignment(assignmentId) {
        return this.getAssignments().then(assignments => 
            assignments.find(a => a.id === assignmentId) || null
        );
    }

    getProjectAssignment(assignmentId) {
        return this.getProjectAssignments().then(assignments => 
            assignments.find(a => a.id === assignmentId) || null
        );
    }

    // === UTILITY ===
    logout() {
        this.token = null;
        localStorage.removeItem('arvic_token');
    }
}

// Crear instancia global
window.PortalDB = new PortalDatabase();

console.log('✅ Sistema de Base de Datos Portal ARVIC inicializado con API');
