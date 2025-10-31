# 🚀 Portal ARVIC - Guía de Deployment en Vercel

## 📋 Prerequisitos

- Cuenta en [Vercel](https://vercel.com)
- Cuenta en [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
- [Node.js](https://nodejs.org/) instalado (v18+)
- [Git](https://git-scm.com/) instalado
- Cuenta en [GitHub](https://github.com)

---

## 🔧 PASO 1: Configurar MongoDB Atlas

### 1.1 Crear Cluster
1. Ir a [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Crear un nuevo cluster (FREE tier funciona perfecto)
3. Esperar a que se provisione (2-3 minutos)

### 1.2 Configurar Acceso
1. **Database Access**: Create Database User
   - Username: `arvic-admin`
   - Password: (genera una segura, **guárdala**)
   - Built-in Role: `Atlas Admin`

2. **Network Access**: Add IP Address
   - Permitir acceso desde cualquier lugar: `0.0.0.0/0`
   - (Solo para desarrollo/demo. En producción usa IPs específicas)

### 1.3 Obtener Connection String
1. Click en **Connect** → **Connect your application**
2. Copiar el connection string:
   ```
   mongodb+srv://arvic-admin:<password>@cluster0.xxxxx.mongodb.net/
   ```
3. Reemplaza `<password>` con tu contraseña
4. Añade el nombre de la base de datos al final: `/portal-arvic`

**String final:**
```
mongodb+srv://arvic-admin:TU_PASSWORD@cluster0.xxxxx.mongodb.net/portal-arvic?retryWrites=true&w=majority
```

---

## 💾 PASO 2: Preparar el Proyecto

### 2.1 Estructura de Archivos

Tu proyecto debe tener esta estructura:

```
portal-arvic/
├── api/
│   ├── index.js
│   ├── models/
│   │   ├── User.js
│   │   └── index.js
│   └── routes/
│       ├── auth.js
│       ├── users.js
│       ├── companies.js
│       ├── projects.js
│       ├── supports.js
│       ├── modules.js
│       ├── assignments.js
│       ├── reports.js
│       └── tarifario.js
├── admin/
│   └── dashboard.html
├── consultor/
│   └── dashboard.html
├── css/
├── js/
│   ├── database-api.js  ← NUEVO (reemplaza database.js)
│   └── ...
├── images/
├── index.html
├── package.json
├── vercel.json
├── .env.example
├── .gitignore
└── README.md
```

### 2.2 Reemplazar database.js

**IMPORTANTE**: Debes reemplazar tu archivo `js/database.js` actual con `js/database-api.js`:

```bash
# En la raíz de tu proyecto
cp js/database-api.js js/database.js
```

O simplemente renombra:
```bash
mv js/database.js js/database-old.js
mv js/database-api.js js/database.js
```

### 2.3 Crear Usuario Administrador Inicial

Necesitas crear el usuario admin en MongoDB. Usa este script:

**Crear archivo `scripts/init-admin.js`:**
```javascript
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const userSchema = new mongoose.Schema({
  id: String,
  name: String,
  email: String,
  password: String,
  role: String,
  isActive: Boolean,
  createdAt: Date
});

const User = mongoose.model('User', userSchema);

async function createAdmin() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Conectado a MongoDB');

    const hashedPassword = await bcrypt.hash('hperez1402.', 10);
    
    const admin = new User({
      id: 'admin',
      name: 'Administrador Principal',
      email: 'admin@arvic.com',
      password: hashedPassword,
      role: 'admin',
      isActive: true,
      createdAt: new Date()
    });

    await admin.save();
    console.log('✅ Usuario admin creado exitosamente');
    
    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

createAdmin();
```

---

## 🌐 PASO 3: Deployment en Vercel

### Opción A: Deploy con GitHub (RECOMENDADO)

#### 3.1 Subir a GitHub

```bash
# 1. Inicializar Git (si no lo has hecho)
git init

# 2. Añadir archivos
git add .

# 3. Commit
git commit -m "Initial commit - Portal ARVIC con backend"

# 4. Crear repositorio en GitHub
# Ve a github.com y crea un nuevo repositorio llamado "portal-arvic"

# 5. Conectar y subir
git remote add origin https://github.com/TU-USUARIO/portal-arvic.git
git branch -M main
git push -u origin main
```

#### 3.2 Importar en Vercel

1. Ir a [vercel.com](https://vercel.com) → **Add New** → **Project**
2. Importar tu repositorio de GitHub
3. Configurar proyecto:
   - **Framework Preset**: Other
   - **Root Directory**: `./`
   - **Build Command**: (dejar vacío)
   - **Output Directory**: (dejar vacío)

#### 3.3 Configurar Variables de Entorno

En Vercel, ir a **Settings** → **Environment Variables**:

| Name | Value |
|------|-------|
| `MONGODB_URI` | `mongodb+srv://arvic-admin:TU_PASSWORD@cluster0.xxxxx.mongodb.net/portal-arvic?retryWrites=true&w=majority` |
| `JWT_SECRET` | Genera uno con: `node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"` |
| `NODE_ENV` | `production` |

**Aplicar a**: Production, Preview, y Development

#### 3.4 Deploy

Click en **Deploy** 🚀

Espera 2-3 minutos. Tu portal estará en:
```
https://portal-arvic.vercel.app
```

---

### Opción B: Deploy con Vercel CLI

```bash
# 1. Instalar Vercel CLI
npm i -g vercel

# 2. Login
vercel login

# 3. Crear .env local para testing
cp .env.example .env
# Editar .env con tus valores reales

# 4. Deploy a staging
vercel

# 5. Configurar variables de entorno en Vercel dashboard
# (mismo procedimiento que Opción A, paso 3.3)

# 6. Deploy a producción
vercel --prod
```

---

## 🔒 PASO 4: Crear Usuario Admin en MongoDB

**Desde tu computadora local:**

```bash
# 1. Instalar dependencias
npm install

# 2. Crear archivo .env con tu MONGODB_URI
echo "MONGODB_URI=mongodb+srv://..." > .env

# 3. Ejecutar script de inicialización
node scripts/init-admin.js
```

**Output esperado:**
```
✅ Conectado a MongoDB
✅ Usuario admin creado exitosamente
```

---

## 🎯 PASO 5: Configurar Dominio Personalizado (Opcional)

### 5.1 En Vercel

1. Ir a tu proyecto → **Settings** → **Domains**
2. Click en **Add Domain**
3. Ingresar tu dominio: `portal.arvic.com`

### 5.2 En tu proveedor DNS

Añadir estos registros:

**Para dominio principal:**
```
Tipo: A
Nombre: @
Valor: 76.76.21.21
```

**Para www:**
```
Tipo: CNAME
Nombre: www
Valor: cname.vercel-dns.com
```

**Esperar 5-30 minutos** para propagación DNS.

---

## ✅ PASO 6: Verificar Deployment

### 6.1 Test de API

Visita: `https://tu-dominio.vercel.app/api/health`

Deberías ver:
```json
{
  "status": "OK",
  "message": "API Portal ARVIC funcionando",
  "timestamp": "2025-10-31T..."
}
```

### 6.2 Test de Login

1. Ve a: `https://tu-dominio.vercel.app`
2. Login con:
   - Usuario: `admin`
   - Contraseña: `hperez1402.`

Si funciona, **¡deployment exitoso!** 🎉

---

## 🐛 Troubleshooting

### Error: "Cannot connect to MongoDB"
- Verifica que el string de conexión esté correcto
- Verifica que MongoDB Atlas permita conexiones desde `0.0.0.0/0`
- Revisa los logs en Vercel: Dashboard → tu proyecto → **Logs**

### Error: "API not responding"
- Verifica que `vercel.json` esté en la raíz
- Verifica que las variables de entorno estén configuradas
- Redeploy: `git push` o click en **Redeploy** en Vercel

### Login no funciona
- Verifica que ejecutaste el script `init-admin.js`
- Verifica que la contraseña sea exacta: `hperez1402.`
- Revisa MongoDB Atlas → Browse Collections → users

---

## 📱 Desarrollo Local

Para trabajar en local:

```bash
# 1. Instalar dependencias
npm install

# 2. Crear .env
cp .env.example .env
# Editar con tus valores

# 3. Iniciar servidor
npm run dev

# 4. Abrir navegador
open http://localhost:3000
```

---

## 📊 Monitoreo

### Logs en Vercel
Dashboard → tu proyecto → **Logs** → Filtrar por "Error"

### MongoDB Atlas Metrics
MongoDB Atlas → Cluster → **Metrics**

### Vercel Analytics (Opcional)
Dashboard → tu proyecto → **Analytics** → Habilitar

---

## 🔄 Actualización de Producción

```bash
# 1. Hacer cambios en tu código
# 2. Commit
git add .
git commit -m "Descripción del cambio"

# 3. Push a GitHub
git push origin main

# Vercel desplegará automáticamente 🚀
```

---

## 📚 Recursos

- [Documentación Vercel](https://vercel.com/docs)
- [MongoDB Atlas Docs](https://docs.atlas.mongodb.com/)
- [Express.js Guide](https://expressjs.com/en/guide/routing.html)

---

## 🆘 Soporte

Si tienes problemas:
1. Revisa los logs en Vercel
2. Verifica la consola del navegador (F12)
3. Prueba la conexión a MongoDB Atlas directamente

---

**¡Éxito con tu deployment! 🚀**
