/**
 * middlewares/authMiddleware.js
 * Sub-tarea 8.1 — Verificación de token JWT en el header Authorization.
 */

const jwt = require('jsonwebtoken');

/**
 * Middleware de autenticación JWT.
 * Espera: Authorization: Bearer <token>
 * Si el token es válido, adjunta el payload decodificado en req.usuario.
 * Si es inválido o ausente, crea un error con status 401 y lo pasa al errorMiddleware.
 */
module.exports = (req, res, next) => {
    const authHeader = req.headers['authorization'] || req.headers['Authorization'];

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        const error = new Error('Acceso no autorizado. Token no proporcionado.');
        error.status = 401;
        return next(error);
    }

    const token = authHeader.split(' ')[1];

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.usuario = decoded; // { id, email, iat, exp }
        next();
    } catch (err) {
        const error = new Error(
            err.name === 'TokenExpiredError'
                ? 'El token ha expirado.'
                : 'Token inválido.'
        );
        error.status = 401;
        next(error);
    }
};
