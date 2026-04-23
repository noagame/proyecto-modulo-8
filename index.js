// Requiere el Framework Express
const express = require('express');
// Requiere dotenv para variables de entorno
require('dotenv').config();
// Instancia de la aplicación Express
const app = express();
// Importación del módulo de loggin
const logger = require('./utils/logger');
// Importación de rutas
const router = require('./routes/router');
// Impotación de middlewares
const logginMiddleware = require('./middlewares/logginMiddleware');
const errorMiddleware = require('./middlewares/errorMiddleware');
// Importación de la conexión a base de datos
const { connectDB } = require('./config/database');
// Importar modelos para registrar asociaciones y ejecutar sync
require('./models');

// Definir el puerto desde variables de entorno o usa el puerto 3000
const PORT = process.env.PORT || 3000;

// Middleware para parsear JSON en el body de las peticiones
app.use(express.json());

// Middleware para servir archivos estáticos de la carpeta /public
app.use(express.static('public'));
// Middleware para servir imágenes subidas desde la carpeta /uploads
app.use('/uploads', express.static('uploads'));
app.use(logginMiddleware);

// Uso de router principal
app.use(router);

// Manejo de Rutas no encontradas 404
app.use((req, res) => {
    logger.registrarError(`Ruta no encontrada: ${req.path}`);
    res.status(404).json({
        status: 'error',
        message: 'Ruta no encontrada',
        data: { path: req.path, method: req.method, timestamp: new Date() }
    });
});

// Manejo de errores
app.use(errorMiddleware);

// Conectar a la base de datos y luego iniciar el servidor
connectDB().then(() => {
    app.listen(PORT, () => {
        // Registrar el inicio del servidor
        logger.registrarAcceso(`Servidor iniciado en el puerto ${PORT}`);

        console.log(`Servidor en http://localhost:${PORT}
        Rutas disponibles:
            - GET  http://localhost:${PORT}/
            - GET  http://localhost:${PORT}/status
            - POST http://localhost:${PORT}/api/auth/register
            - POST http://localhost:${PORT}/api/auth/login
            - POST http://localhost:${PORT}/api/usuarios
            - GET  http://localhost:${PORT}/api/usuarios
            - POST http://localhost:${PORT}/api/posts
            - GET  http://localhost:${PORT}/api/posts
            - POST http://localhost:${PORT}/api/upload/avatar`);
    });
});

