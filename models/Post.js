const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

/**
 * Modelo Post
 * Relación 1:N con Usuario.
 */
const Post = sequelize.define('Post', {
    titulo: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
            notEmpty: { msg: 'El título no puede estar vacío.' }
        }
    },
    contenido: {
        type: DataTypes.TEXT,
        allowNull: false,
        validate: {
            notEmpty: { msg: 'El contenido no puede estar vacío.' }
        }
    },
    // FK usuarioId — declarada explícitamente para claridad
    usuarioId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'usuarios',
            key: 'id'
        }
    }
}, {
    tableName: 'posts',
    timestamps: true
});

module.exports = Post;
