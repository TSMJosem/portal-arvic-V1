# 🚀 Guía Completa de Despliegue en Vercel

## 📋 Pre-requisitos

- [ ] Cuenta de Vercel (https://vercel.com)
- [ ] MongoDB Atlas configurado con IP 0.0.0.0/0 permitida
- [ ] Variables de entorno preparadas (.env local funcionando)

---

## 🔧 Paso 1: Preparar Variables de Entorno

### Variables que necesitas en Vercel:

```bash
MONGODB_URI=mongodb+srv://usuario:password@cluster.mongodb.net/nombre-bd
JWT_SECRET=tu_jwt_secret_super_seguro
NODE_ENV=production
```

> ⚠️ **IMPORTANTE**: Copia estas variables de tu archivo `.env` local, pero **NO SUBAS** el archivo `.env` a Git.

---

## 🌐 Paso 2: Desplegar en Vercel

### Opción A: Desde la Terminal (Recomendado)

```bash
# 1. Instalar Vercel CLI (si no lo tienes)
npm i -g vercel

# 2. Ir a la raíz del proyecto
cd /Users/josemhernandez/Documents/Proyecto_Arvic/portal-arvic-V1

# 3. Login en Vercel
vercel login

# 4. Desplegar (primera vez)
vercel

# Responde las preguntas:
# - Set up and deploy? Y
# - Which scope? Tu cuenta personal
# - Link to existing project? N (si es nuevo)
# - What's your project's name? portal-arvic
# - In which directory is your code located? ./
# - Want to override the settings? N

# 5. Para producción (después de probar)
vercel --prod
```

### Opción B: Desde GitHub (Automático)

```bash
# 1. Crear repositorio en GitHub
# 2. Subir el código (sin .env):
git add .
git commit -m "Preparar para despliegue en Vercel"
git push origin main

# 3. En Vercel Dashboard:
# - New Project → Import Git Repository
# - Seleccionar tu repo
# - Vercel detectará automáticamente la configuración
```

---

## ⚙️ Paso 3: Configurar Variables de Entorno en Vercel

### Desde Vercel Dashboard:

1. Ve a tu proyecto en https://vercel.com/dashboard
2. Clic en **Settings**
3. Clic en **Environment Variables**
4. Agrega cada variable:

| Name | Value | Environment |
|------|-------|-------------|
| `MONGODB_URI` | `mongodb+srv://...` | Production, Preview, Development |
| `JWT_SECRET` | `tu_secret_de_.env` | Production, Preview, Development |
| `NODE_ENV` | `production` | Production |

5. Clic en **Save**
6. **Redeploy** el proyecto para aplicar los cambios

---

## 🧪 Paso 4: Verificar el Despliegue

### 4.1 Health Check

```bash
# Vercel te dará una URL como:
# https://portal-arvic.vercel.app

# Prueba el health check:
curl https://portal-arvic.vercel.app/api/health
```

Deberías ver:
```json
{
  "status": "ok",
  "message": "API funcionando correctamente",
  "timestamp": "...",
  "mongodb": "connected"
}
```

### 4.2 Probar Login

Visita:
```
https://portal-arvic.vercel.app
```

Intenta hacer login con las credenciales del admin.

---

## 🔍 Cómo Funciona en Vercel

### Arquitectura Serverless

```
Usuario hace request a:
https://portal-arvic.vercel.app/api/users
         ↓
Vercel recibe el request
         ↓
Lee vercel.json → Ruta /api/* → api/index.js
         ↓
Ejecuta la función serverless (api/index.js)
         ↓
Se conecta a MongoDB Atlas (con MONGODB_URI del Dashboard)
         ↓
Express maneja la ruta /api/users
         ↓
Responde con los datos
         ↓
Función se apaga (no queda corriendo)
```

### Diferencias con Desarrollo Local

| Aspecto | Desarrollo Local | Producción Vercel |
|---------|------------------|-------------------|
| **Servidor** | Corriendo 24/7 | Solo al recibir request |
| **Variables** | Desde `.env` local | Desde Dashboard Vercel |
| **Puerto** | 3000 (o el que definas) | Sin puerto (HTTPS directo) |
| **Inicio** | `npm run dev` manual | Automático con cada deploy |
| **Logs** | En tu terminal | En Vercel Dashboard → Logs |

---

## 🐛 Troubleshooting

### ❌ Error: "Cannot connect to MongoDB"

**Solución:**
1. Ve a MongoDB Atlas → Network Access
2. Verifica que `0.0.0.0/0` está permitido
3. Verifica que `MONGODB_URI` en Vercel es correcta
4. Redeploy el proyecto

### ❌ Error: "window is not defined"

**Causa:** Código de frontend en el backend.

**Solución:** 
- Asegúrate de que `api/index.js` no importe archivos de frontend
- Revisa que no haya código como `window`, `document`, etc.

### ❌ Error: "Module not found"

**Solución:**
```bash
# Verifica que todas las dependencias están en package.json
npm install
vercel --prod
```

### 📊 Ver Logs en Tiempo Real

```bash
# Desde la terminal:
vercel logs

# O en el Dashboard:
# Proyecto → Deployments → Clic en el deployment → Runtime Logs
```

---

## 🎯 Checklist Final

Antes de declarar el proyecto listo:

- [ ] Health check responde correctamente
- [ ] Login funciona desde la URL de Vercel
- [ ] Usuarios se cargan en el admin
- [ ] Proyectos se cargan en el admin
- [ ] Tareas se crean y listan correctamente
- [ ] Asignaciones funcionan
- [ ] Tarifario calcula correctamente
- [ ] Panel de consultor funciona
- [ ] MongoDB Atlas muestra las colecciones con datos

---

## 🔄 Actualizar el Proyecto

Cuando hagas cambios:

```bash
# 1. Hacer los cambios en local
# 2. Probar con npm run dev
# 3. Commit y push (si usas Git)
git add .
git commit -m "Descripción del cambio"
git push

# 4. Vercel auto-desplegará (si conectaste GitHub)
# O manualmente:
vercel --prod
```

---

## 📚 Recursos Útiles

- **Vercel Docs**: https://vercel.com/docs
- **Vercel Serverless Functions**: https://vercel.com/docs/functions
- **MongoDB Atlas**: https://www.mongodb.com/docs/atlas/
- **Dashboard Vercel**: https://vercel.com/dashboard

---

## 🆘 Soporte

Si algo falla:
1. Revisa los logs en Vercel Dashboard
2. Verifica las variables de entorno
3. Prueba localmente primero
4. Compara con esta guía

---

**Última actualización:** Enero 2025
