// Módulo de registros
const fs = require('fs');
const path = require('path');

// Ruta del archivo de logs
const logPath = path.join(__dirname, '../logs/log.txt');

/**
 * Registra evento en el archivo de logs con formato estándar
 * @param {string} tipo - Tipo de evento: 'ACCESO', 'ERROR', 'INFO'
 * @param {string} mensaje - Mensaje a registrar
 */
exports.registrar = (tipo, mensaje) => {
    // Obtener fecha y hora actual
    const date = new Date();
    const fecha = date.toLocaleDateString('es-ES');
    const hora = date.toLocaleTimeString('es-ES');

    // Formateo
    const linea = `[${fecha} ${hora}]  [${tipo}] ${mensaje}\n`;

    // Añadir la línea al archivo
    fs.appendFile(logPath, linea, (e) => {
        if (e) {
            console.error('Error al escribir en logs:', e);
        } else {
            console.log(`Evento registrado ${tipo}`);
        }
    });
};
/** 
 * Registra un acceso a una ruta
 * @param {string} ruta - Ruta accedida
*/
exports.registrarAcceso = (ruta) => {
    this.registrar('ACCESO', `Ruta accedida: ${ruta}`);
};

/**
 * Registra un error
 * @param {string} e - Descripción del error
 */
exports.registrarError = (e) => {
    this.registrar('ERROR', e);
};

/** 
 * Registrar información general
 * @param {string} info - Información
*/
exports.registrarInfo = (info) => {
    this.registrar('INFO', info);
};
