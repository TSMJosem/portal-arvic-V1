/**
 * Configuración de la API para Portal ARVIC
 * Este archivo detecta automáticamente si estás en desarrollo o producción
 */

const API_CONFIG = {
    production: {
        // ✅ URL de tu backend en Railway
        apiUrl: 'https://portal-arvic-backend-production.up.railway.app/api'
    },
    development: {
        // Para pruebas locales (si alguna vez lo necesitas)
        apiUrl: 'http://localhost:5000/api'
    }
};

// Detectar entorno automáticamente
const isProduction = window.location.hostname !== 'localhost' && 
                     window.location.hostname !== '127.0.0.1';

const API_BASE_URL = isProduction ? 
    API_CONFIG.production.apiUrl : 
    API_CONFIG.development.apiUrl;

// Hacer disponible globalmente para que otros archivos lo usen
window.API_BASE_URL = API_BASE_URL;

console.log('🌐 Entorno detectado:', isProduction ? 'PRODUCCIÓN' : 'DESARROLLO');
console.log('🔗 API URL configurada:', API_BASE_URL);
console.log('✅ Configuración de API cargada correctamente');