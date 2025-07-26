/**
 * === LÓGICA DE LA PÁGINA DE LOGIN ===
 * Maneja el formulario de inicio de sesión y redirecciones
 */

document.addEventListener('DOMContentLoaded', function() {
    // Verificar si ya hay una sesión activa
    if (window.AuthSys.isAuthenticated()) {
        redirectToUserDashboard();
        return;
    }

    initializeLoginForm();
    setupEventListeners();
});

function initializeLoginForm() {
    const form = document.getElementById('loginForm');
    const userTypeSelect = document.getElementById('userType');
    const userIdInput = document.getElementById('userId');
    const passwordInput = document.getElementById('password');

    // Limpiar formulario
    form.reset();
    hideMessages();

    // Auto-focus en el primer campo
    userTypeSelect.focus();
}

function setupEventListeners() {
    const form = document.getElementById('loginForm');
    
    // Manejar envío del formulario
    form.addEventListener('submit', handleLogin);
    
    // Enter key navigation (simplificado)
    setupKeyboardNavigation();
}


function setupKeyboardNavigation() {
    const inputs = ['userId', 'password'];
    
    inputs.forEach((inputId, index) => {
        const input = document.getElementById(inputId);
        
        input.addEventListener('keydown', function(e) {
            if (e.key === 'Enter') {
                e.preventDefault();
                
                if (index < inputs.length - 1) {
                    document.getElementById(inputs[index + 1]).focus();
                } else {
                    document.getElementById('loginForm').requestSubmit();
                }
            }
        });
    });
}

async function handleLogin(e) {
    e.preventDefault();
    
    const submitButton = document.querySelector('.login-btn');
    const userId = document.getElementById('userId').value.trim();
    const password = document.getElementById('password').value;
    
    // Limpiar mensajes anteriores
    hideMessages();
    
    // Validaciones básicas
    if (!userId || !password) {
        showError('Usuario y contraseña son requeridos');
        return;
    }
    
    // Mostrar estado de carga
    showLoadingState(submitButton, true);
    
    try {
        // ✅ LOGIN SIMPLIFICADO - sin parámetro userType
        const result = await window.AuthSys.login(userId, password);
        
        if (result.success) {
            showSuccess(`¡Bienvenido ${result.user.name}! Redirigiendo...`);
            
            setTimeout(() => {
                redirectToUserDashboard(result.user);
            }, 1500);
            
        } else {
            showError(result.message);
            showLoadingState(submitButton, false);
            
            // Focus en el campo apropiado
            if (result.message.includes('Usuario') || result.message.includes('usuario')) {
                document.getElementById('userId').focus();
            } else {
                document.getElementById('password').focus();
            }
        }
        
    } catch (error) {
        console.error('Login error:', error);
        showError('Error interno del sistema. Intente nuevamente.');
        showLoadingState(submitButton, false);
    }
}

// ✅ SIMPLIFICAR validateLoginForm() en login.js
function validateLoginForm(userId, password) {
    if (!userId) {
        showError('El usuario es requerido');
        document.getElementById('userId').focus();
        return false;
    }
    
    if (!password) {
        showError('La contraseña es requerida');
        document.getElementById('password').focus();
        return false;
    }
    
    return true;
}

function validateLoginForm(userType, userId, password) {
    // Validar tipo de usuario
    if (!userType) {
        showError('Por favor, seleccione un tipo de usuario');
        document.getElementById('userType').focus();
        return false;
    }
    
    // Validar ID de usuario
    const userIdValidation = window.AuthSys.validateUserId(userId);
    if (!userIdValidation.valid) {
        showError(userIdValidation.message);
        document.getElementById('userId').focus();
        return false;
    }
    
    // Validar contraseña
    const passwordValidation = window.AuthSys.validatePassword(password);
    if (!passwordValidation.valid) {
        showError(passwordValidation.message);
        document.getElementById('password').focus();
        return false;
    }
    
    // Validación específica por tipo de usuario
    if (userType === 'admin' && userId !== 'admin') {
        showError('Para acceso de administrador, use el usuario "admin"');
        document.getElementById('userId').focus();
        return false;
    }
    
    if (userType === 'consultor' && userId === 'admin') {
        showError('El usuario "admin" no puede acceder como consultor');
        document.getElementById('userId').focus();
        return false;
    }
    
    return true;
}

function redirectToUserDashboard(user = null) {
    const currentUser = user || window.AuthSys.getCurrentUser();
    
    if (!currentUser) {
        showError('Error: No se pudo determinar el tipo de usuario');
        return;
    }
    
    // Redireccionar según el rol
    switch(currentUser.role) {
        case 'admin':
            window.location.href = 'admin/dashboard.html';
            break;
        case 'consultor':
            window.location.href = 'consultor/dashboard.html';
            break;
        default:
            showError('Tipo de usuario no válido');
            break;
    }
}

function showLoadingState(button, isLoading) {
    if (isLoading) {
        button.classList.add('loading');
        button.disabled = true;
        button.innerHTML = '<span>Iniciando sesión...</span>';
    } else {
        button.classList.remove('loading');
        button.disabled = false;
        button.innerHTML = 'Iniciar Sesión';
    }
}

function showError(message) {
    const errorDiv = document.getElementById('errorMessage');
    if (errorDiv) {
        errorDiv.textContent = message;
        errorDiv.style.display = 'block';
        errorDiv.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        
        // Auto-hide después de 5 segundos
        setTimeout(() => {
            errorDiv.style.display = 'none';
        }, 5000);
    }
}

function showSuccess(message) {
    const successDiv = document.getElementById('successMessage');
    if (successDiv) {
        successDiv.textContent = message;
        successDiv.style.display = 'block';
        successDiv.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
}

function hideMessages() {
    const errorDiv = document.getElementById('errorMessage');
    const successDiv = document.getElementById('successMessage');
    
    if (errorDiv) errorDiv.style.display = 'none';
    if (successDiv) successDiv.style.display = 'none';
}

// === FUNCIONES DE UTILIDAD ===

// Detectar si el usuario viene de un logout
function checkLogoutMessage() {
    const urlParams = new URLSearchParams(window.location.search);
    const logoutMessage = urlParams.get('logout');
    
    if (logoutMessage === 'success') {
        showSuccess('Sesión cerrada correctamente');
        // Limpiar URL
        window.history.replaceState({}, document.title, window.location.pathname);
    }
}

// Verificar si hay mensajes en el localStorage
function checkStoredMessages() {
    const storedMessage = localStorage.getItem('login_message');
    const storedType = localStorage.getItem('login_message_type');
    
    if (storedMessage && storedType) {
        if (storedType === 'error') {
            showError(storedMessage);
        } else if (storedType === 'success') {
            showSuccess(storedMessage);
        }
        
        // Limpiar mensajes almacenados
        localStorage.removeItem('login_message');
        localStorage.removeItem('login_message_type');
    }
}

// Prevenir el envío del formulario con Enter en campos específicos
function preventFormSubmissionOnSpecificKeys() {
    const form = document.getElementById('loginForm');
    
    form.addEventListener('keydown', function(e) {
        // Prevenir envío accidental con Ctrl+Enter o similar
        if (e.ctrlKey && e.key === 'Enter') {
            e.preventDefault();
        }
    });
}

// Función para manejar errores de conexión
function handleConnectionError() {
    showError('Error de conexión. Verifique su conexión a internet e intente nuevamente.');
}

// Auto-completar último usuario usado (opcional)
function loadLastUser() {
    const lastUserId = localStorage.getItem('arvic_last_user_id');
    const lastUserType = localStorage.getItem('arvic_last_user_type');
    
    if (lastUserId && lastUserType) {
        document.getElementById('userType').value = lastUserType;
        document.getElementById('userId').value = lastUserId;
        
        // Focus en contraseña ya que usuario ya está lleno
        document.getElementById('password').focus();
    }
}

function saveLastUser(userId, userType) {
    localStorage.setItem('arvic_last_user_id', userId);
    localStorage.setItem('arvic_last_user_type', userType);
}

// === INICIALIZACIÓN ADICIONAL ===

// Ejecutar verificaciones adicionales cuando la página esté lista
document.addEventListener('DOMContentLoaded', function() {
    checkLogoutMessage();
    checkStoredMessages();
    preventFormSubmissionOnSpecificKeys();
    
    // Cargar último usuario solo si no hay sesión activa
    if (!window.AuthSys.isAuthenticated()) {
        loadLastUser();
    }
});

// Guardar último usuario al hacer login exitoso
const originalHandleLogin = handleLogin;
handleLogin = async function(e) {
    const result = await originalHandleLogin(e);
    
    // Si el login fue exitoso, guardar el último usuario
    const userId = document.getElementById('userId').value.trim();
    const userType = document.getElementById('userType').value.trim();
    
    if (userId && userType) {
        saveLastUser(userId, userType);
    }
    
    return result;
};

// === MANEJO DE ERRORES GLOBALES ===

// Capturar errores no manejados
window.addEventListener('error', function(e) {
    console.error('Error no manejado:', e.error);
    showError('Se produjo un error inesperado. Por favor, recargue la página.');
});

// Capturar promesas rechazadas no manejadas
window.addEventListener('unhandledrejection', function(e) {
    console.error('Promesa rechazada no manejada:', e.reason);
    showError('Error de conexión o procesamiento. Intente nuevamente.');
    e.preventDefault();
});

// === ACCESIBILIDAD ===

// Mejorar accesibilidad con navegación por teclado
document.addEventListener('keydown', function(e) {
    // Escape para limpiar mensajes
    if (e.key === 'Escape') {
        hideMessages();
    }
    
    // F5 para refresh con confirmación si hay datos en el formulario
    if (e.key === 'F5') {
        const form = document.getElementById('loginForm');
        const formData = new FormData(form);
        let hasData = false;
        
        for (let [key, value] of formData.entries()) {
            if (value.trim()) {
                hasData = true;
                break;
            }
        }
        
        if (hasData) {
            if (!confirm('¿Está seguro de recargar la página? Se perderán los datos ingresados.')) {
                e.preventDefault();
            }
        }
    }
});