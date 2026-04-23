/**
 * utils/apiResponse.js
 * Helper centralizado para estandarizar el formato de respuestas API.
 * Formato: { status, message, data }
 */

const apiResponse = {
    /**
     * Respuesta de éxito.
     * @param {import('express').Response} res
     * @param {string}  message  - Mensaje descriptivo del resultado.
     * @param {*}       data     - Datos a devolver (objeto, array, null…).
     * @param {number}  [statusCode=200] - Código HTTP.
     */
    success(res, message, data = null, statusCode = 200) {
        return res.status(statusCode).json({
            status: 'success',
            message,
            data
        });
    },

    /**
     * Respuesta de error.
     * @param {import('express').Response} res
     * @param {string}  message  - Mensaje descriptivo del error.
     * @param {*}       [data]   - Detalles adicionales del error (opcional).
     * @param {number}  [statusCode=500] - Código HTTP.
     */
    error(res, message, data = null, statusCode = 500) {
        return res.status(statusCode).json({
            status: 'error',
            message,
            data
        });
    }
};

module.exports = apiResponse;
