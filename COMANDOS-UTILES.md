# 🛠️ Comandos Útiles - Vercel y MongoDB

## 📋 Comandos Pre-Despliegue

### Verificar que todo está listo
```bash
# Ejecutar script de verificación
./scripts/verificar-pre-deploy.sh

# Verificar que .env no está en git
git ls-files --error-unmatch .env

# Verificar dependencias instaladas
npm list --depth=0
```

### Probar en local antes de desplegar
```bash
# Iniciar servidor de desarrollo
npm run dev

# O directamente:
node api/index.js

# Probar health check
curl http://localhost:3000/api/health

# Ver logs en tiempo real (en otra terminal)
tail -f /dev/null  # No hay logs de archivo, se ven en la terminal donde corre npm run dev
```

---

## 🚀 Comandos de Despliegue en Vercel

### Primera vez (instalación de Vercel CLI)
```bash
# Instalar Vercel CLI globalmente
npm install -g vercel

# Verificar instalación
vercel --version

# Login en Vercel
vercel login
```

### Desplegar proyecto
```bash
# Despliegue de prueba (preview)
vercel

# Despliegue a producción
vercel --prod

# Despliegue con logs detallados
vercel --debug

# Forzar redespliegue (sin cambios)
vercel --prod --force
```

### Ver información del proyecto
```bash
# Ver detalles del proyecto actual
vercel ls

# Ver logs en tiempo real
vercel logs

# Ver logs de un deployment específico
vercel logs [deployment-url]

# Inspeccionar deployment
vercel inspect [deployment-url]
```

### Gestionar dominios
```bash
# Ver dominios configurados
vercel domains ls

# Agregar dominio personalizado
vercel domains add tu-dominio.com

# Verificar dominio
vercel domains verify tu-dominio.com

# Remover dominio
vercel domains rm tu-dominio.com
```

### Variables de entorno
```bash
# Listar variables de entorno (necesitas el Dashboard, no hay comando)
# Ve a: https://vercel.com/dashboard → Tu Proyecto → Settings → Environment Variables

# Ver variables de entorno de un deployment
vercel env ls

# Agregar variable de entorno desde CLI (menos seguro que Dashboard)
vercel env add NOMBRE_VARIABLE
```

### Eliminar deployments
```bash
# Eliminar deployment específico
vercel rm [deployment-url]

# Eliminar todos los deployments de preview
vercel rm --safe --yes

# Eliminar proyecto completo
vercel remove
```

---

## 🗄️ Comandos MongoDB Atlas

### Desde MongoDB Atlas Dashboard
```bash
# No hay comandos CLI directos para Atlas, pero puedes usar:

# Conectar con mongo shell
mongosh "mongodb+srv://cluster.mongodb.net/nombre-bd" --username usuario

# Backup manual (desde Atlas Dashboard)
# → Database → Backup → Take Snapshot

# Ver logs de conexión
# → Database → Monitoring → Metrics
```

### Desde MongoDB Compass (GUI)
```bash
# Abrir Compass y conectar con:
mongodb+srv://usuario:password@cluster.mongodb.net/nombre-bd

# Ventajas:
# - Ver colecciones gráficamente
# - Ejecutar queries sin código
# - Exportar/importar datos
```

### Verificar conexión desde terminal
```bash
# Usando curl para probar el endpoint
curl https://tu-proyecto.vercel.app/api/health

# Debería responder:
# {"status":"ok","mongodb":"connected","timestamp":"..."}

# Si mongodb no está "connected", hay un problema
```

---

## 🐛 Comandos de Debugging

### Ver errores en Vercel
```bash
# Ver logs en tiempo real
vercel logs --follow

# Ver solo errores
vercel logs | grep ERROR

# Ver logs de las últimas 24 horas
vercel logs --since 24h

# Ver logs de un deployment específico
vercel logs [deployment-url]
```

### Debugging local
```bash
# Ejecutar con más detalles
DEBUG=* node api/index.js

# Ver solo errores de MongoDB
DEBUG=mongoose:* node api/index.js

# Ver solo errores de Express
DEBUG=express:* node api/index.js
```

### Probar endpoints manualmente
```bash
# Health check
curl https://tu-proyecto.vercel.app/api/health

# Login (POST)
curl -X POST https://tu-proyecto.vercel.app/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@ejemplo.com","password":"tu_password"}'

# Obtener usuarios (GET con token)
curl https://tu-proyecto.vercel.app/api/users \
  -H "Authorization: Bearer TU_JWT_TOKEN"

# Crear usuario (POST con token)
curl -X POST https://tu-proyecto.vercel.app/api/users \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer TU_JWT_TOKEN" \
  -d '{"nombre":"Test","email":"test@test.com","role":"consultor"}'
```

---

## 🔄 Comandos Git (para despliegue automático)

### Setup inicial con GitHub
```bash
# Inicializar git (si no está inicializado)
git init

# Agregar remote de GitHub
git remote add origin https://github.com/tu-usuario/portal-arvic.git

# Verificar remote
git remote -v

# Primera subida
git add .
git commit -m "Initial commit para Vercel"
git push -u origin main
```

### Workflow de desarrollo
```bash
# Ver estado actual
git status

# Ver cambios
git diff

# Agregar cambios
git add .

# Commit
git commit -m "Descripción del cambio"

# Push a GitHub (dispara auto-deploy en Vercel)
git push

# Ver historial
git log --oneline

# Ver branches
git branch -a
```

### Trabajar con branches
```bash
# Crear branch de desarrollo
git checkout -b desarrollo

# Hacer cambios...
git add .
git commit -m "Nueva feature"

# Push branch (Vercel creará preview deployment)
git push origin desarrollo

# Mergear a main (cuando esté listo)
git checkout main
git merge desarrollo
git push  # Dispara deployment a producción
```

---

## 🧹 Comandos de Limpieza

### Limpiar node_modules
```bash
# Eliminar node_modules
rm -rf node_modules

# Reinstalar dependencias
npm install

# O con caché limpio
npm cache clean --force
npm install
```

### Limpiar caché de Vercel
```bash
# No hay comando directo, pero puedes:
# 1. En Dashboard → Settings → General → Delete Project
# 2. Volver a desplegar desde cero
```

### Limpiar índices duplicados en MongoDB
```bash
# Ejecutar script que creamos antes
node scripts/fix-task-assignments-index.js

# O manualmente con mongosh:
mongosh "mongodb+srv://..." --eval "
  use nombre-bd;
  db.taskassignments.dropIndex('taskId_1');
  db.taskassignments.createIndex({ taskAssignmentId: 1 }, { unique: true });
"
```

---

## 📊 Comandos de Monitoreo

### Ver uso de Vercel
```bash
# Ver estadísticas del proyecto
vercel stats

# Ver uso de bandwidth
vercel bandwidth

# Ver uso de build minutes
vercel build-minutes
```

### Verificar salud del sistema
```bash
# Health check de tu API
curl https://tu-proyecto.vercel.app/api/health

# Ver si MongoDB está respondiendo
curl https://tu-proyecto.vercel.app/api/health | grep mongodb

# Ver tiempo de respuesta
time curl https://tu-proyecto.vercel.app/api/health
```

---

## 🔐 Comandos de Seguridad

### Generar JWT secret
```bash
# Opción 1: Con Node.js
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"

# Opción 2: Con OpenSSL
openssl rand -hex 64

# Opción 3: Generar UUID
uuidgen | shasum -a 256 | cut -d ' ' -f1
```

### Verificar .env no está en Git
```bash
# Buscar .env en el repo
git ls-files | grep "\.env$"

# Si aparece, eliminarlo del historial:
git rm --cached .env
git commit -m "Remover .env del repositorio"
git push
```

### Verificar secretos expuestos
```bash
# Buscar posibles secretos en el código
grep -r "mongodb+srv://" ./ --exclude-dir=node_modules
grep -r "JWT_SECRET" ./ --exclude-dir=node_modules --exclude=".env*"

# Buscar hardcoded passwords
grep -ri "password.*=.*['\"]" ./ --exclude-dir=node_modules
```

---

## 🚨 Comandos de Emergencia

### Servidor local no se detiene
```bash
# Ver qué proceso usa el puerto 3000
lsof -i :3000

# Matar el proceso
lsof -i :3000 | grep LISTEN | awk '{print $2}' | xargs kill -9

# O todo en uno:
killall node
```

### Rollback en Vercel
```bash
# Ver deployments anteriores
vercel ls

# Promover deployment anterior a producción
vercel promote [deployment-url]

# O desde Dashboard:
# Deployments → Tres puntitos del deployment → Promote to Production
```

### MongoDB no conecta
```bash
# Probar conexión directa con mongosh
mongosh "mongodb+srv://usuario:password@cluster.mongodb.net/nombre-bd"

# Ver IP actual (para whitelist)
curl ifconfig.me

# Agregar IP en Atlas (si no usas 0.0.0.0/0)
# MongoDB Atlas → Network Access → Add IP Address
```

---

## 📝 Atajos Útiles

### Agregar al .zshrc o .bashrc
```bash
# Editar el archivo
nano ~/.zshrc  # o ~/.bashrc

# Agregar estos alias:
alias vdeploy="vercel --prod"
alias vlogs="vercel logs --follow"
alias vls="vercel ls"
alias dev="npm run dev"
alias prd="./scripts/verificar-pre-deploy.sh"

# Recargar configuración
source ~/.zshrc  # o source ~/.bashrc
```

Ahora puedes usar:
```bash
prd      # Pre-deploy check
vdeploy  # Deploy a producción
vlogs    # Ver logs en tiempo real
vls      # Listar deployments
dev      # npm run dev
```

---

## 📚 Referencias Rápidas

### URLs importantes
```bash
# Vercel Dashboard
https://vercel.com/dashboard

# MongoDB Atlas
https://cloud.mongodb.com

# Logs de Vercel
https://vercel.com/[tu-usuario]/[tu-proyecto]/deployments

# Variables de entorno
https://vercel.com/[tu-usuario]/[tu-proyecto]/settings/environment-variables
```

---

**Última actualización:** Enero 2025
