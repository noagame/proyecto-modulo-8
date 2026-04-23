const logger = require('../utils/logger');

/**
 * Middleware que registra todas las solicitudes HTTP
*/ 
module.exports = (req, res, next) => {
    const timestamp = new Date().toISOString();
    const metodo = req.method;
    const ruta = req.path;
    const ip = req.ip;

    console.log(`[${timestamp}] ${metodo} ${ruta} desde ${ip}`);
    
    next();
};