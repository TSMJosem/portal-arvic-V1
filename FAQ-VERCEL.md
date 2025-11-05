# ❓ Preguntas Frecuentes - Despliegue en Vercel

## 🤔 ¿Cómo funciona Vercel?

### Diferencia Principal: Serverless vs Servidor Tradicional

**Servidor Tradicional (como cuando ejecutas `npm run dev`):**
```
┌─────────────────────────────────────┐
│  Servidor corriendo 24/7            │
│  - Consume recursos constantemente  │
│  - Espera requests todo el tiempo   │
│  - Tú pagas por el tiempo activo    │
└─────────────────────────────────────┘
```

**Vercel Serverless:**
```
┌─────────────────────────────────────┐
│  Función dormida (no consume nada)  │
│         ↓                            │
│  Usuario hace request               │
│         ↓                            │
│  Función se activa                  │
│         ↓                            │
│  Procesa request                    │
│         ↓                            │
│  Responde                           │
│         ↓                            │
│  Función se duerme otra vez         │
└─────────────────────────────────────┘
```

**Ventajas:**
- ✅ Solo pagas por uso real
- ✅ Escala automáticamente (millones de requests sin problema)
- ✅ Sin servidores que mantener
- ✅ Despliegues automáticos desde Git

---

## 🔐 ¿Dónde van las variables de entorno?

### En Desarrollo Local:
```bash
# Archivo .env en la raíz del proyecto
MONGODB_URI=mongodb+srv://...
JWT_SECRET=mi_secreto_local
```

### En Producción (Vercel):
```
Vercel Dashboard → Settings → Environment Variables
├── MONGODB_URI = mongodb+srv://...
├── JWT_SECRET = mi_secreto_de_produccion
└── NODE_ENV = production
```

**¿Por qué no usar el archivo .env en Vercel?**
- ❌ El archivo `.env` está en `.gitignore` (no se sube)
- ❌ Sería inseguro subirlo a Git
- ✅ Vercel tiene su propio sistema seguro de variables

---

## 🚀 ¿Cómo se ejecuta mi código en Vercel?

### Tu código actual:

```javascript
// api/index.js
const app = express();

// ... rutas, middlewares, etc ...

if (require.main === module) {
  // 👇 ESTO se ejecuta en desarrollo local
  app.listen(3000, () => {
    console.log('Servidor en puerto 3000');
  });
} else {
  // 👇 ESTO se ejecuta en Vercel
  module.exports = app;
}
```

**En local:**
1. Ejecutas `npm run dev`
2. Node ejecuta `api/index.js` directamente
3. `require.main === module` es `true`
4. Se ejecuta `app.listen(3000)`
5. Servidor queda corriendo

**En Vercel:**
1. Vercel importa `api/index.js` como módulo
2. `require.main === module` es `false`
3. Se ejecuta `module.exports = app`
4. Vercel recibe el objeto `app` y lo envuelve en una función serverless
5. Cada request activa esa función

---

## 📡 ¿Cómo llegan las requests a mi backend?

### Configuración en `vercel.json`:

```json
{
  "routes": [
    {
      "src": "/api/(.*)",
      "dest": "/api/index.js"
    },
    {
      "src": "/(.*)",
      "dest": "/$1"
    }
  ]
}
```

**Flujo de una request:**

```
1. Usuario visita: https://portal-arvic.vercel.app/api/users
         ↓
2. Vercel recibe el request
         ↓
3. Lee vercel.json y encuentra: "/api/(.*)" → "/api/index.js"
         ↓
4. Ejecuta la función serverless de api/index.js
         ↓
5. Express procesa la ruta /api/users
         ↓
6. MongoDB responde con los datos
         ↓
7. Express devuelve JSON
         ↓
8. Vercel envía respuesta al usuario
         ↓
9. Función se apaga (hasta el próximo request)
```

---

## 🗄️ ¿Cómo se conecta a MongoDB?

### Conexión en `api/index.js`:

```javascript
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
```

**En desarrollo local:**
- Lee `MONGODB_URI` del archivo `.env`
- Se conecta a MongoDB Atlas
- La conexión persiste mientras el servidor corre

**En Vercel:**
- Lee `MONGODB_URI` de las variables de entorno del Dashboard
- Se conecta a MongoDB Atlas
- La conexión puede persistir entre múltiples requests (Vercel cachea conexiones)
- Si la función se apaga, la próxima request reconecta automáticamente

---

## 🌍 ¿Qué pasa con CORS?

### Configuración actual en `api/index.js`:

```javascript
app.use(cors({
  origin: [
    'http://localhost:5500',
    'http://localhost:3000',
    'https://portalarvic.vercel.app'  // 👈 Tu dominio de Vercel
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
```

**Importante:**
- Cuando despliegues, Vercel te dará una URL como `https://portal-arvic.vercel.app`
- **DEBES agregar esa URL** al array de `origin` antes de desplegar
- Si no lo haces, el frontend no podrá hacer requests al backend

---

## 📦 ¿Qué archivos se suben a Vercel?

### Tu `.vercelignore`:

```
node_modules      # ✅ Vercel instala sus propias dependencias
.env              # ✅ Usas variables del Dashboard
.DS_Store         # ✅ Archivos del sistema
scripts/          # ✅ Solo para desarrollo local
DEPLOYMENT.md     # ✅ Solo documentación
README.md         # ✅ Solo documentación
```

**Lo que SÍ se sube:**
- ✅ `api/` (tu backend)
- ✅ `admin/`, `consultor/`, `css/`, `js/`, `images/` (tu frontend)
- ✅ `package.json` (para instalar dependencias)
- ✅ `vercel.json` (configuración de despliegue)
- ✅ `index.html` (tu página principal)

---

## 🔄 ¿Cómo actualizo el proyecto en Vercel?

### Opción 1: Manual (desde terminal)

```bash
# Hacer cambios en local
# Probar con npm run dev
# Desplegar:
vercel --prod
```

### Opción 2: Automático (desde GitHub)

```bash
# Hacer cambios en local
git add .
git commit -m "Mejorar feature X"
git push

# Vercel detecta el push y despliega automáticamente
```

**Preview vs Production:**
- `vercel` (sin flags) → Crea un preview deployment (URL temporal)
- `vercel --prod` → Despliega a producción (URL principal)
- Push a `main` branch → Automáticamente a producción
- Push a otras branches → Preview deployment

---

## 🐛 ¿Cómo depuro errores en Vercel?

### 1. Logs en Dashboard

```
Vercel Dashboard → Tu Proyecto → Deployments → Clic en deployment
→ Runtime Logs (para ver errores de ejecución)
→ Build Logs (para ver errores de instalación)
```

### 2. Logs desde terminal

```bash
vercel logs
```

### 3. Health Check

Crea un endpoint simple:

```javascript
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    mongodb: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
    timestamp: new Date().toISOString()
  });
});
```

Prueba: `https://portal-arvic.vercel.app/api/health`

---

## 💰 ¿Cuánto cuesta Vercel?

### Plan Hobby (Gratis):
- ✅ 100 GB ancho de banda/mes
- ✅ 100 GB-hrs de ejecución/mes
- ✅ Dominios personalizados ilimitados
- ✅ HTTPS automático
- ✅ Despliegues ilimitados

**¿Es suficiente para tu proyecto?**
- Sí, para proyectos pequeños/medianos
- Para 1000 usuarios/día es más que suficiente

---

## 🔒 ¿Es seguro MongoDB Atlas con IP 0.0.0.0/0?

### ¿Por qué necesitas permitir 0.0.0.0/0?

Vercel usa **IPs dinámicas** (cambian con cada request), por eso necesitas:

```
MongoDB Atlas → Network Access → Add IP Address → 0.0.0.0/0
```

**¿Es seguro?**
- ✅ Sí, **PERO** necesitas:
  - Usuario/contraseña fuertes en MongoDB
  - JWT_SECRET fuerte
  - No compartir tu `MONGODB_URI`

**Alternativa más segura:**
- Usar MongoDB Atlas con Vercel Integration (conecta automáticamente)
- O usar un proxy/VPN con IP fija

---

## 🎯 ¿Qué debo hacer antes de desplegar?

### Checklist rápido:

```bash
# 1. Verificar que todo funciona en local
npm run dev
# Probar login, crear proyectos, tareas, etc.

# 2. Ejecutar script de verificación
./scripts/verificar-pre-deploy.sh

# 3. Verificar CORS
# Asegúrate de que la URL de Vercel esté en el array de origin

# 4. Copiar variables de entorno
# Ten a mano tu .env para copiar las variables al Dashboard de Vercel

# 5. Desplegar
vercel
```

---

## 📞 ¿Cómo sé si funcionó?

### Pruebas post-despliegue:

1. **Health check:**
   ```
   https://tu-proyecto.vercel.app/api/health
   → Debe responder: {"status": "ok", "mongodb": "connected"}
   ```

2. **Frontend:**
   ```
   https://tu-proyecto.vercel.app
   → Debe cargar tu index.html
   ```

3. **Login:**
   ```
   Intentar hacer login
   → Debe funcionar y redirigir al dashboard
   ```

4. **Dashboard:**
   ```
   Ver que carguen usuarios, proyectos, tareas
   → Todo debe funcionar igual que en local
   ```

---

## 🆘 Errores Comunes

### "Cannot connect to MongoDB"

**Causa:** Variables de entorno mal configuradas o IP no permitida.

**Solución:**
```bash
# 1. Verifica en Vercel Dashboard → Settings → Environment Variables
# 2. Verifica en MongoDB Atlas → Network Access → 0.0.0.0/0
# 3. Redespliega: vercel --prod
```

### "window is not defined"

**Causa:** Código de frontend en el backend.

**Solución:**
```bash
# Busca en api/index.js:
grep -r "window\|document\|localStorage" api/

# Elimina cualquier referencia a código de frontend
```

### "Module not found"

**Causa:** Dependencia faltante en `package.json`.

**Solución:**
```bash
# Instala la dependencia:
npm install nombre-del-modulo

# Redespliega:
vercel --prod
```

### "CORS error"

**Causa:** La URL de Vercel no está en el array de `origin`.

**Solución:**
```javascript
// api/index.js
app.use(cors({
  origin: [
    'http://localhost:5500',
    'https://tu-proyecto.vercel.app'  // 👈 Agrega tu URL de Vercel
  ]
}));
```

---

**Última actualización:** Enero 2025
