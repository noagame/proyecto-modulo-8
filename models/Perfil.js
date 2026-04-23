const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

/**
 * Modelo Perfil
 * Relación 1:1 con Usuario.
 */
const Perfil = sequelize.define('Perfil', {
    bio: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    avatarUrl: {
        type: DataTypes.STRING,
        allowNull: true,
        validate: {
            isUrl: { msg: 'El avatarUrl debe ser una URL válida.' }
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
    tableName: 'perfiles',
    timestamps: true
});

module.exports = Perfil;
