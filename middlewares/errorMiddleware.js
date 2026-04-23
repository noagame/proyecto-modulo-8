const { ValidationError, UniqueConstraintError } = require('sequelize');
const apiResponse = require('../utils/apiResponse');

/**
 * Middleware centralizado de manejo de errores.
 * Usa apiResponse para estandarizar el formato: { status, message, data }.
 */
module.exports = (e, req, res, next) => {
    const timestamp = new Date().toISOString();

    // ── Errores de validación de Sequelize (400) ──────────────────────────────
    if (e instanceof ValidationError) {
        const detalles = e.errors.map(err => err.message);
        return apiResponse.error(
            res,
            'Error de validación.',
            { detalles, timestamp, path: req.path },
            400
        );
    }

    // ── Error de restricción de unicidad (409 Conflict) ───────────────────────
    if (e instanceof UniqueConstraintError) {
        const detalles = e.errors.map(err => err.message);
        return apiResponse.error(
            res,
            'El recurso ya existe.',
            { detalles, timestamp, path: req.path },
            409
        );
    }

    // ── Errores genéricos ─────────────────────────────────────────────────────
    console.error(`[${timestamp}] ERROR: ${e.message}`);

    return apiResponse.error(
        res,
        e.message || 'Error interno del servidor.',
        { timestamp, path: req.path },
        e.status || 500
    );
};