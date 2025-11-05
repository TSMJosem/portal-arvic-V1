# 🚀 Guía de Despliegue - Portal ARVIC

## 📋 Prerequisitos

- Node.js 18+ instalado
- Cuenta de MongoDB Atlas
- Cuenta de Vercel (para producción)

---

## 🔧 Configuración Local (Desarrollo)

### 1. Instalar dependencias
```bash
npm install
```

### 2. Configurar variables de entorno
```bash
# Copiar el archivo de ejemplo
cp .env.example .env

# Editar .env con tus valores reales
# MONGODB_URI, JWT_SECRET, etc.
```

### 3. Iniciar servidor de desarrollo
```bash
npm run dev
```

El servidor estará disponible en: `http://localhost:3000`

---

## 🌍 Despliegue a Producción (Vercel)

### Opción 1: Despliegue desde Vercel Dashboard

1. **Conectar repositorio**
   - Ve a [vercel.com](https://vercel.com)
   - Click en "New Project"
   - Importa tu repositorio de GitHub

2. **Configurar variables de entorno**
   - En Settings → Environment Variables
   - Agrega todas las variables de `.env`:
     - `MONGODB_URI`
     - `JWT_SECRET` (genera uno NUEVO para producción)
     - `NODE_ENV` = `production`

3. **Deploy**
   - Vercel detectará automáticamente la configuración de `vercel.json`
   - El despliegue se hará automáticamente

### Opción 2: Despliegue desde CLI

```bash
# Instalar Vercel CLI
npm i -g vercel

# Login
vercel login

# Primer despliegue (te hará preguntas)
vercel

# Despliegues subsecuentes
vercel --prod
```

---

## 🔐 Variables de Entorno para Producción

**⚠️ IMPORTANTE:** NO uses los mismos valores que en desarrollo.

### Variables requeridas en Vercel:

| Variable | Descripción | Ejemplo |
|----------|-------------|---------|
| `MONGODB_URI` | Conexión a MongoDB Atlas | `mongodb+srv://user:pass@cluster...` |
| `JWT_SECRET` | Secret para JWT (DIFERENTE al de dev) | `7e87715a68d0b18f...` |
| `NODE_ENV` | Entorno de ejecución | `production` |
| `PORT` | Puerto (opcional, Vercel lo asigna) | `3000` |

### Generar JWT_SECRET para producción:
```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

---

## 📁 Estructura del Proyecto

```
portal-arvic-V1/
├── api/                    # Backend (Express + MongoDB)
│   ├── index.js           # Servidor principal
│   ├── models/            # Modelos de Mongoose
│   └── routes/            # Rutas del API
├── admin/                 # Panel de administrador
├── consultor/             # Panel de consultor
├── js/                    # Frontend JavaScript
│   └── databaseMongoDB.js # Cliente del API
├── css/                   # Estilos
├── .env                   # Variables locales (NO subir a Git)
├── .env.example          # Plantilla de variables
├── vercel.json           # Configuración de Vercel
└── package.json          # Dependencias
```

---

## ✅ Checklist antes de Desplegar

- [ ] Todas las dependencias están en `package.json`
- [ ] `.env` está en `.gitignore`
- [ ] Variables de entorno configuradas en Vercel
- [ ] JWT_SECRET diferente en producción
- [ ] MongoDB Atlas permite conexiones desde Vercel (IP: `0.0.0.0/0`)
- [ ] Probado localmente con `npm run dev`

---

## 🐛 Solución de Problemas

### Error: "Cannot connect to MongoDB"
- Verifica que MongoDB Atlas permita conexiones desde `0.0.0.0/0`
- Revisa que `MONGODB_URI` esté correctamente configurado en Vercel

### Error: "JWT malformed"
- Asegúrate de que `JWT_SECRET` esté configurado en Vercel
- Verifica que sea el mismo secret en todas las instancias

### Error: "API not found"
- Revisa que `vercel.json` esté en la raíz del proyecto
- Verifica que las rutas en `vercel.json` estén correctas

---

## 📞 Soporte

Para más información, consulta la documentación de:
- [Vercel Docs](https://vercel.com/docs)
- [MongoDB Atlas](https://www.mongodb.com/docs/atlas/)
- [Express.js](https://expressjs.com/)
