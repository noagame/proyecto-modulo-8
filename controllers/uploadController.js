/**
 * controllers/uploadController.js
 * Sub-tarea 8.3 — Subida de imagen de avatar.
 */

const { Perfil } = require('../models');
const apiResponse = require('../utils/apiResponse');
const logger = require('../utils/logger');

/**
 * POST /api/upload/avatar
 * Recibe el archivo (procesado por uploadMiddleware) y actualiza
 * el campo avatarUrl en el Perfil del usuario autenticado.
 */
exports.subirAvatar = async (req, res, next) => {
    try {
        if (!req.file) {
            return apiResponse.error(res, 'No se proporcionó ningún archivo.', null, 400);
        }

        // Construir URL relativa accesible desde el servidor
        const avatarUrl = `/uploads/${req.file.filename}`;

        // Actualizar el perfil del usuario autenticado
        const [filas] = await Perfil.update(
            { avatarUrl },
            { where: { usuarioId: req.usuario.id } }
        );

        if (filas === 0) {
            return apiResponse.error(
                res,
                'No se encontró el perfil del usuario.',
                null,
                404
            );
        }

        logger.registrarAcceso(
            `Avatar actualizado para usuario ${req.usuario.id}: ${avatarUrl}`
        );

        return apiResponse.success(res, 'Avatar actualizado correctamente.', { avatarUrl });
    } catch (error) {
        logger.registrarError(`Error al subir avatar: ${error.message}`);
        next(error);
    }
};
