# 🚀 Proyecto Backend — Módulo 8

> **API RESTful con autenticación JWT, protección de rutas y subida de archivos**
> Base tecnológica: Node.js · Express · Sequelize · PostgreSQL · bcryptjs · jsonwebtoken · Multer

---

## 📋 Tabla de contenidos

1. [Descripción](#descripción)
2. [Estructura del proyecto](#estructura-del-proyecto)
3. [Instalación y configuración](#instalación-y-configuración)
4. [Variables de entorno](#variables-de-entorno)
5. [Endpoints de la API](#endpoints-de-la-api)
6. [Formato estándar de respuestas](#formato-estándar-de-respuestas)
7. [Autenticación JWT — Cómo usarla](#autenticación-jwt--cómo-usarla)
8. [Resultados de pruebas](#resultados-de-pruebas)
9. [Observaciones y decisiones de diseño](#observaciones-y-decisiones-de-diseño)
10. [Tips de desarrollo](#tips-de-desarrollo)
11. [Errores comunes y soluciones](#errores-comunes-y-soluciones)

---

## Descripción

El Módulo 8 extiende el backend del Módulo 7 (persistencia con Sequelize/PostgreSQL) añadiendo:

- **Autenticación con JWT**: registro de usuarios con contraseña hasheada (`bcryptjs`) y login con firma de token (`jsonwebtoken`).
- **Protección de rutas**: middleware `authMiddleware` que verifica el `Bearer token` en el header `Authorization`.
- **Subida de archivos**: `multer` con validación de tipo MIME y límite de tamaño para avatares de usuario.
- **Respuestas estandarizadas**: helper `apiResponse` que unifica el formato `{ status, message, data }` en toda la API.

---

## Estructura del proyecto

```
proyecto-modulo-8/
├── config/
│   └── database.js          # Conexión Sequelize + PostgreSQL
├── controllers/
│   ├── authController.js    # register, login
│   ├── homeController.js    # GET /, GET /status
│   ├── postController.js    # CRUD posts
│   ├── uploadController.js  # POST /api/upload/avatar
│   └── usuarioController.js # CRUD usuarios
├── middlewares/
│   ├── authMiddleware.js    # Verifica JWT Bearer token
│   ├── errorMiddleware.js   # Manejo centralizado de errores
│   ├── logginMiddleware.js  # Log de peticiones
│   └── uploadMiddleware.js  # Multer (diskStorage, filtro MIME, 2 MB)
├── models/
│   ├── index.js             # Asociaciones + sync Sequelize
│   ├── Perfil.js            # Modelo Perfil (1:1 con Usuario)
│   ├── Post.js              # Modelo Post (1:N con Usuario)
│   └── Usuario.js           # Modelo Usuario
├── routes/
│   ├── authRoutes.js        # /api/auth/*
│   ├── postRoutes.js        # /api/posts/*
│   ├── router.js            # Router principal
│   ├── uploadRoutes.js      # /api/upload/*
│   └── usuarioRoutes.js     # /api/usuarios/*
├── uploads/                 # Archivos subidos (excluido de git)
├── utils/
│   ├── apiResponse.js       # Helper de respuestas estándar
│   └── logger.js            # Logger de accesos y errores
├── .env                     # Variables de entorno (excluido de git)
├── .gitignore
├── index.js                 # Entry point de la aplicación
└── package.json
```

---

## Instalación y configuración

```bash
# 1. Clonar el repositorio
git clone git@github.com:noagame/proyecto-modulo-8.git
cd proyecto-modulo-8

# 2. Instalar dependencias
npm install

# 3. Crear el archivo .env (ver sección siguiente)
cp .env.example .env   # o crear manualmente

# 4. Asegurarse de que PostgreSQL esté corriendo y la BD exista
createdb modulo7_db    # o el nombre que configures

# 5. Iniciar en modo desarrollo (nodemon + sync automático de tablas)
npm run dev

# 6. Iniciar en producción
npm start
```

> **Las tablas se crean automáticamente** cuando `NODE_ENV=development` gracias a `sequelize.sync({ alter: true })`.

---

## Variables de entorno

Crea un archivo `.env` en la raíz con el siguiente contenido:

```env
# Servidor
PORT=3000
NODE_ENV=development

# Base de datos PostgreSQL
DB_HOST=localhost
DB_PORT=5432
DB_NAME=modulo7_db
DB_USER=postgres
DB_PASSWORD="tu_password_aqui"

# Autenticación JWT
JWT_SECRET=tu_clave_secreta_muy_larga_y_aleatoria
JWT_EXPIRES_IN=24h
```

> ⚠️ **Nunca commitees el `.env` al repositorio.** Ya está en `.gitignore`.

---

## Endpoints de la API

### 🔓 Públicos (sin token)

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/` | Página de bienvenida |
| GET | `/status` | Estado del servidor |
| POST | `/api/auth/register` | Registro de nuevo usuario |
| POST | `/api/auth/login` | Login — devuelve JWT |
| GET | `/api/usuarios` | Listar todos los usuarios |
| GET | `/api/usuarios/:id` | Obtener usuario por ID |
| GET | `/api/posts` | Listar todos los posts |
| GET | `/api/posts/:id` | Obtener post por ID |

### 🔐 Protegidos (requieren `Authorization: Bearer <token>`)

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| PUT | `/api/usuarios/:id` | Actualizar usuario |
| DELETE | `/api/usuarios/:id` | Eliminar usuario |
| POST | `/api/posts` | Crear post |
| PUT | `/api/posts/:id` | Actualizar post |
| DELETE | `/api/posts/:id` | Eliminar post |
| POST | `/api/upload/avatar` | Subir avatar (campo: `avatar`) |

---

## Formato estándar de respuestas

Todas las respuestas siguen el mismo formato:

**Éxito:**
```json
{
  "status": "success",
  "message": "Descripción del resultado",
  "data": { ... }
}
```

**Error:**
```json
{
  "status": "error",
  "message": "Descripción del error",
  "data": null
}
```

---

## Autenticación JWT — Cómo usarla

### 1. Registrar un usuario

```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "nombre": "Juan Pérez",
    "email": "juan@ejemplo.com",
    "password": "MiContraseña123",
    "bio": "Desarrollador web"
  }'
```

Respuesta:
```json
{
  "status": "success",
  "message": "Usuario registrado correctamente.",
  "data": {
    "token": "eyJhbGci...",
    "usuario": { "id": 1, "nombre": "Juan Pérez", "email": "juan@ejemplo.com" }
  }
}
```

### 2. Hacer login

```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{ "email": "juan@ejemplo.com", "password": "MiContraseña123" }'
```

### 3. Usar el token en rutas protegidas

```bash
curl -X PUT http://localhost:3000/api/usuarios/1 \
  -H "Authorization: Bearer eyJhbGci..." \
  -H "Content-Type: application/json" \
  -d '{ "nombre": "Juan Actualizado" }'
```

### 4. Subir avatar

```bash
curl -X POST http://localhost:3000/api/upload/avatar \
  -H "Authorization: Bearer eyJhbGci..." \
  -F "avatar=@/ruta/a/imagen.png"
```

---

## Resultados de pruebas

Pruebas ejecutadas manualmente con `curl` sobre el servidor en `localhost:3000`.

| # | Prueba | Resultado | HTTP |
|---|--------|-----------|------|
| 1 | `POST /api/auth/register` — nuevo usuario | ✅ Token generado, usuario creado | 200 |
| 2 | `POST /api/auth/register` — email duplicado | ✅ Error 409 estandarizado | 409 |
| 3 | `POST /api/auth/login` — credenciales válidas | ✅ Token generado | 200 |
| 4 | `POST /api/auth/login` — password incorrecta | ✅ Error 401 "Credenciales inválidas" | 401 |
| 5 | `GET /api/usuarios` — público | ✅ Lista con perfil incluido | 200 |
| 6 | `GET /api/usuarios/1` — por ID | ✅ Usuario + Perfil | 200 |
| 7 | `PUT /api/usuarios/1` — sin token | ✅ Error 401 "Token no proporcionado" | 401 |
| 8 | `PUT /api/usuarios/1` — con token | ✅ Usuario actualizado | 200 |
| 9 | `POST /api/posts` — con token | ✅ Post creado | 201 |
| 10 | `GET /api/posts` — público | ✅ Posts con autor incluido | 200 |
| 11 | `DELETE /api/posts/1` — sin token | ✅ Error 401 bloqueado | 401 |
| 12 | `GET /api/noexiste` — ruta 404 | ✅ Error 404 estandarizado | 404 |
| 13 | `POST /api/upload/avatar` — PNG con token | ✅ Avatar guardado, perfil actualizado | 200 |
| 14 | `POST /api/upload/avatar` — tipo no permitido (PDF) | ✅ Error 415 bloqueado | 415 |
| 15 | Verificar `avatarUrl` en perfil tras upload | ✅ URL relativa almacenada | 200 |

**Todos los endpoints respondieron correctamente. 15/15 pruebas pasadas ✅**

---

## Observaciones y decisiones de diseño

### 🔍 `DB_PASS` vs `DB_PASSWORD` (bug corregido)
El archivo `config/database.js` usaba `process.env.DB_PASS` pero el `.env` definía `DB_PASSWORD`. Esto causaba que Sequelize recibiera `undefined` como contraseña, y el driver de PostgreSQL (`pg`) fallaba con el error:
```
SASL: SCRAM-SERVER-FIRST-MESSAGE: client password must be a string
```
**Corrección**: se unificó a `DB_PASSWORD` en `database.js`.

### 🔍 `dotenv` v17 y contraseñas numéricas
Con `dotenv` v17, valores como `DB_PASSWORD=1234` (solo dígitos) pueden leerse como `Number` en lugar de `String`. PostgreSQL/SASL requiere string obligatoriamente.
**Buena práctica**: siempre envuelve contraseñas en comillas: `DB_PASSWORD="1234"`.

### 🔍 Validación `isUrl` de Sequelize con `localhost`
El validador built-in `isUrl` de Sequelize utiliza internamente la librería `validator.js`, que **no acepta `localhost` como dominio válido** en URLs. Esto hacía que `http://localhost:3000/uploads/imagen.png` fuera rechazado.
**Corrección**: se reemplazó `isUrl` por una función de validación personalizada que acepta tanto rutas relativas (`/uploads/...`) como URLs absolutas (`http://` o `https://`).

### 🔍 Seguridad: `password` expuesto en GET /api/usuarios
El hash bcrypt del campo `password` se devuelve en los endpoints GET públicos. En producción, **debes excluirlo de las queries**:
```js
Usuario.findAll({ attributes: { exclude: ['password'] } })
```

### 🔍 Sin autorización por roles
El `authMiddleware` solo verifica que el token sea válido, pero **no verifica que el usuario autenticado sea el propietario** del recurso que modifica. Por ejemplo, el usuario 2 puede hacer PUT sobre `/api/usuarios/1` si tiene un token válido. En producción, agrega validación de pertenencia.

### 🔍 Sync automático (`alter: true`) en desarrollo
`sequelize.sync({ alter: true })` modifica la estructura de tablas existentes para que coincida con los modelos. Es útil en desarrollo pero **nunca debe usarse en producción** (puede causar pérdida de datos). En producción, usa migraciones con `sequelize-cli`.

---

## Tips de desarrollo

> 💡 **Renovar el token**: El token expira en `JWT_EXPIRES_IN` (por defecto 24h). Implementa un endpoint `/api/auth/refresh` o maneja la expiración en el cliente.

> 💡 **Probar con Thunder Client o Postman**: Importa las rutas y guarda el token como variable de entorno del workspace para no copiarlo manualmente en cada request.

> 💡 **NODE_ENV en producción**: Cambia `NODE_ENV=production` para desactivar el sync automático y el logging SQL de Sequelize.

> 💡 **Cambiar JWT_SECRET en producción**: La clave por defecto `tu_clave_secreta_muy_larga` es solo para desarrollo. Usa una cadena aleatoria de al menos 64 caracteres en producción:
> ```bash
> node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
> ```

> 💡 **Límite de tamaño de Multer**: El límite de 2 MB se aplica al archivo, no al multipart total. Si subes metadatos junto con el archivo, ajusta `limits.fieldSize` también.

> 💡 **Servir imágenes subidas**: Las imágenes en `uploads/` son accesibles directamente via:
> ```
> GET http://localhost:3000/uploads/usuario_1_1234567890.png
> ```
> Gracias a `app.use('/uploads', express.static('uploads'))` en `index.js`.

> 💡 **Logs de errores**: Los errores se registran en `logs/` (excluido de git). Revisa `logs/errores.log` para diagnosticar problemas en producción.

---

## Errores comunes y soluciones

### ❌ `SASL: client password must be a string`
**Causa**: `DB_PASSWORD` no está definida o es `undefined` en `process.env`.
**Solución**:
1. Verifica que el nombre de la variable en `.env` coincide con el que se usa en `config/database.js` (`DB_PASSWORD`).
2. Si el valor es numérico, envuélvelo en comillas: `DB_PASSWORD="1234"`.

---

### ❌ `relation "usuarios" does not exist`
**Causa**: Las tablas no han sido creadas en PostgreSQL.
**Solución**: Asegúrate de tener `NODE_ENV=development` en `.env` para que Sequelize ejecute `sync({ alter: true })` al iniciar.

---

### ❌ `JsonWebTokenError: invalid signature`
**Causa**: El token fue firmado con un `JWT_SECRET` diferente al actual (p. ej., se cambió la variable).
**Solución**: El usuario debe hacer login nuevamente para obtener un token válido.

---

### ❌ `TokenExpiredError: jwt expired`
**Causa**: El token superó el tiempo de `JWT_EXPIRES_IN`.
**Solución**: El usuario debe volver a hacer login. El mensaje de error del middleware es `"El token ha expirado."` con status 401.

---

### ❌ `MulterError: File too large`
**Causa**: El archivo supera el límite de 2 MB configurado en `uploadMiddleware.js`.
**Solución**: Comprime/redimensiona la imagen antes de subirla, o ajusta `limits.fileSize` en `uploadMiddleware.js`.

---

### ❌ `Tipo de archivo no permitido`
**Causa**: Se intentó subir un archivo con MIME type distinto a `image/jpeg`, `image/png` o `image/webp`.
**Solución**: Convierte la imagen al formato correcto. El error devuelve status `415 Unsupported Media Type`.

---

### ❌ Puerto 3000 en uso al iniciar
**Causa**: Otro proceso está usando el puerto.
**Solución**:
```bash
# Encontrar el proceso
lsof -i :3000
# Terminarlo
kill -9 <PID>
```
O cambia `PORT` en `.env`.

---

### ❌ `SequelizeUniqueConstraintError` al registrar
**Causa**: El email ya existe en la tabla `usuarios`.
**Comportamiento esperado**: El `authController.register` detecta esto **antes** de insertar y devuelve 409 con mensaje `"El email ya está registrado."` — sin depender del error de Sequelize.

---

## 📦 Dependencias

| Paquete | Versión | Uso |
|---------|---------|-----|
| `express` | ^5.x | Framework HTTP |
| `sequelize` | ^6.x | ORM PostgreSQL |
| `pg` + `pg-hstore` | ^8.x | Driver PostgreSQL |
| `bcryptjs` | ^2.x | Hash de contraseñas |
| `jsonwebtoken` | ^9.x | Firma y verificación JWT |
| `multer` | ^1.x | Subida de archivos |
| `dotenv` | ^17.x | Variables de entorno |
| `nodemon` | ^3.x | Recarga en desarrollo |

---

## 📁 Git

```bash
# Ramas
main  →  rama principal (producción)

# Historial de commits del Módulo 8
feat: implementar autenticación con registro, login y JWT
chore: agregar .gitignore (excluir node_modules, .env, logs, uploads)
feat: proteger rutas privadas con middleware de autenticación JWT
feat: configurar Multer para subida de imágenes con validación de tipo y tamaño
refactor: estandarizar respuestas API al formato {status, message, data}
fix: corregir DB_PASS→DB_PASSWORD, validación avatarUrl y URL relativa en uploadController
```

---

*Módulo 8 — Curso Backend Node.js · Fabián Del Villar · 2026*