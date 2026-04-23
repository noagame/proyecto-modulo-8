const { Post, Usuario } = require('../models');
const apiResponse = require('../utils/apiResponse');

/**
 * POST /api/posts
 * Crea un nuevo post asociado a un usuario.
 */
exports.crear = async (req, res, next) => {
    try {
        const { titulo, contenido, usuarioId } = req.body;

        // Verificar que el usuario existe
        const usuario = await Usuario.findByPk(usuarioId);
        if (!usuario) {
            return apiResponse.error(res, 'El usuario especificado no existe.', null, 404);
        }

        const post = await Post.create({ titulo, contenido, usuarioId });
        return apiResponse.success(res, 'Post creado correctamente.', { post }, 201);
    } catch (error) {
        next(error);
    }
};

/**
 * GET /api/posts
 * Devuelve todos los posts con el usuario autor.
 */
exports.listar = async (req, res, next) => {
    try {
        const posts = await Post.findAll({
            include: [{ model: Usuario, attributes: ['id', 'nombre', 'email'] }]
        });
        return apiResponse.success(res, 'Lista de posts.', { posts });
    } catch (error) {
        next(error);
    }
};

/**
 * GET /api/posts/:id
 * Devuelve un post por su ID.
 */
exports.obtenerPorId = async (req, res, next) => {
    try {
        const post = await Post.findByPk(req.params.id, {
            include: [{ model: Usuario, attributes: ['id', 'nombre', 'email'] }]
        });
        if (!post) {
            return apiResponse.error(res, 'Post no encontrado.', null, 404);
        }
        return apiResponse.success(res, 'Post encontrado.', { post });
    } catch (error) {
        next(error);
    }
};

/**
 * PUT /api/posts/:id
 * Actualiza los datos de un post.
 */
exports.actualizar = async (req, res, next) => {
    try {
        const post = await Post.findByPk(req.params.id);
        if (!post) {
            return apiResponse.error(res, 'Post no encontrado.', null, 404);
        }
        await post.update(req.body);
        return apiResponse.success(res, 'Post actualizado.', { post });
    } catch (error) {
        next(error);
    }
};

/**
 * DELETE /api/posts/:id
 * Elimina un post.
 */
exports.eliminar = async (req, res, next) => {
    try {
        const post = await Post.findByPk(req.params.id);
        if (!post) {
            return apiResponse.error(res, 'Post no encontrado.', null, 404);
        }
        await post.destroy();
        return apiResponse.success(res, 'Post eliminado correctamente.');
    } catch (error) {
        next(error);
    }
};

