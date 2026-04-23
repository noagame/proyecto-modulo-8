const { sequelize, Usuario, Perfil } = require('../models');
const apiResponse = require('../utils/apiResponse');
const logger = require('../utils/logger');

/**
 * POST /api/usuarios
 * Crea un Usuario y su Perfil en una misma transacción (7.5).
 */
exports.crear = async (req, res, next) => {
    const t = await sequelize.transaction();
    try {
        const { nombre, email, password, bio, avatarUrl } = req.body;

        const usuario = await Usuario.create(
            { nombre, email, password },
            { transaction: t }
        );

        await Perfil.create(
            { bio: bio || null, avatarUrl: avatarUrl || null, usuarioId: usuario.id },
            { transaction: t }
        );

        await t.commit();

        return apiResponse.success(
            res,
            'Usuario y perfil creados correctamente.',
            { usuario },
            201
        );
    } catch (error) {
        await t.rollback();
        logger.registrarError(`Error al crear usuario: ${error.message}`);
        next(error);
    }
};

/**
 * GET /api/usuarios
 * Devuelve todos los usuarios con su perfil asociado.
 */
exports.listar = async (req, res, next) => {
    try {
        const usuarios = await Usuario.findAll({
            include: [{ model: Perfil }]
        });
        return apiResponse.success(res, 'Lista de usuarios.', { usuarios });
    } catch (error) {
        next(error);
    }
};

/**
 * GET /api/usuarios/:id
 * Devuelve un usuario por su ID con perfil.
 */
exports.obtenerPorId = async (req, res, next) => {
    try {
        const usuario = await Usuario.findByPk(req.params.id, {
            include: [{ model: Perfil }]
        });
        if (!usuario) {
            return apiResponse.error(res, 'Usuario no encontrado.', null, 404);
        }
        return apiResponse.success(res, 'Usuario encontrado.', { usuario });
    } catch (error) {
        next(error);
    }
};

/**
 * PUT /api/usuarios/:id
 * Actualiza los datos de un usuario.
 */
exports.actualizar = async (req, res, next) => {
    try {
        const usuario = await Usuario.findByPk(req.params.id);
        if (!usuario) {
            return apiResponse.error(res, 'Usuario no encontrado.', null, 404);
        }
        await usuario.update(req.body);
        return apiResponse.success(res, 'Usuario actualizado.', { usuario });
    } catch (error) {
        next(error);
    }
};

/**
 * DELETE /api/usuarios/:id
 * Elimina un usuario (y su perfil por CASCADE).
 */
exports.eliminar = async (req, res, next) => {
    try {
        const usuario = await Usuario.findByPk(req.params.id);
        if (!usuario) {
            return apiResponse.error(res, 'Usuario no encontrado.', null, 404);
        }
        await usuario.destroy();
        return apiResponse.success(res, 'Usuario eliminado correctamente.');
    } catch (error) {
        next(error);
    }
};

