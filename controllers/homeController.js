const logger = require('../utils/logger');

/** 
 * Controlador GET /
*/
exports.getHome = (req, res) => {
    logger.registrarAcceso('GET /');
    res.send('<h1>Bienvenido al Servidor Backend</h1>');
};

/** 
 * Controlador para GET /status
*/
exports.getStatus = (req, res) => {
    logger.registrarAcceso('GET /status');
    res.json({
        status: 'Server running',
        timestamp: new Date(),
        message: 'El servidor está funcionando correctamente'
    });
};