# 🤝 Guía de Colaboración - Portal ARVIC

## 👋 Bienvenido al Proyecto

Este documento te guiará para comenzar a trabajar en el Portal ARVIC.

---

## 📥 Setup Inicial (Solo primera vez)

### 1️⃣ Clonar el Repositorio

```bash
git clone https://github.com/TSMJosem/portal-arvic-V1.git
cd portal-arvic-V1
```

---

### 2️⃣ Instalar Dependencias

```bash
npm install
```

---

### 3️⃣ Configurar Variables de Entorno

```bash
# Copiar el archivo de ejemplo
cp .env.example .env
```

Abre el archivo `.env` y configura:

```bash
MONGODB_URI=mongodb+srv://portalarvic:Portal123456@portal-arvic-cluster.nljgq6k.mongodb.net/arvic-preview?retryWrites=true&w=majority
JWT_SECRET=pedir_a_jose
NODE_ENV=development
PORT=3000
```

> ⚠️ **Importante:** Pide a Jose el `JWT_SECRET` actual.

---

### 4️⃣ Probar que Todo Funciona

```bash
npm run dev
```

Abre: http://localhost:3000

Deberías ver el portal funcionando. ✅

---

## 🔄 Flujo de Trabajo Diario

### 📌 Regla de Oro:
**NUNCA hagas push directo a `main`**. Siempre usa tu rama de trabajo.

---

### Paso 1️⃣: Actualizar tu Código

Antes de empezar a trabajar, asegúrate de tener los últimos cambios:

```bash
git checkout main
git pull origin main
```

---

### Paso 2️⃣: Ir a tu Rama de Trabajo

```bash
# Si es la primera vez, crea la rama:
git checkout -b testing

# Si ya existe, solo cámbiate a ella:
git checkout testing
```

---

### Paso 3️⃣: Traer Cambios de Main a tu Rama

```bash
git merge main
```

Esto trae los cambios que Jose haya hecho.

---

### Paso 4️⃣: Hacer tus Cambios

Edita los archivos que necesites...

---

### Paso 5️⃣: Guardar tus Cambios

```bash
git add .
git commit -m "Descripción clara de lo que hiciste"
```

**Ejemplo de buenos mensajes:**
```bash
git commit -m "Agregar validación de email en login"
git commit -m "Corregir cálculo de tarifario"
git commit -m "Mejorar diseño del dashboard de consultor"
```

---

### Paso 6️⃣: Subir tus Cambios

```bash
git push origin testing
```

---

### Paso 7️⃣: Vercel Crea Preview Automáticamente

Después del push, Vercel te dará un link como:

```
https://portal-arvic-git-testing-josems-projects.vercel.app
```

**Este link:**
- ✅ Usa la base de datos `arvic-preview` (datos de prueba)
- ✅ NO afecta producción
- ✅ Puedes probarlo como usuario normal
- ✅ Puedes compartirlo con Jose para que lo revise

---

### Paso 8️⃣: Crear Pull Request

1. Ve a: https://github.com/TSMJosem/portal-arvic-V1
2. Verás un banner amarillo que dice: **"testing had recent pushes"**
3. Click en **"Compare & pull request"**
4. Llena la descripción:
   - ¿Qué cambios hiciste?
   - ¿Qué funcionalidad agregaste o corregiste?
   - ¿Hay algo que Jose deba saber?
5. Click en **"Create pull request"**

---

### Paso 9️⃣: Esperar Aprobación

Jose recibirá la notificación y:
- Revisará tu código
- Probará en el link de preview
- Te puede pedir cambios o aprobar

---

### Paso 🔟: Después del Merge

Una vez que Jose apruebe y haga merge:
- ✅ Tus cambios van a producción automáticamente
- ✅ La rama `testing` sigue existiendo para futuros cambios
- ✅ Puedes seguir trabajando en ella

---

## 📚 Comandos de Referencia Rápida

```bash
# ═══════════════════════════════════════════════════════
# CADA VEZ QUE VAYAS A TRABAJAR
# ═══════════════════════════════════════════════════════

# 1. Actualizar main
git checkout main
git pull origin main

# 2. Ir a tu rama
git checkout testing

# 3. Traer cambios de main
git merge main

# 4. Hacer cambios...

# 5. Guardar y subir
git add .
git commit -m "Descripción del cambio"
git push origin testing

# 6. Crear Pull Request en GitHub

# ═══════════════════════════════════════════════════════
# SI HAY CONFLICTOS AL HACER MERGE
# ═══════════════════════════════════════════════════════

# Git te dirá qué archivos tienen conflicto
# Abre esos archivos y verás:

<<<<<<< HEAD
// Tu código
=======
// Código de Jose
>>>>>>> main

# Edita manualmente para combinar ambos
# Después:
git add .
git commit -m "Resolver conflictos de merge"
git push origin testing

# ═══════════════════════════════════════════════════════
# PROBAR LOCALMENTE
# ═══════════════════════════════════════════════════════

npm run dev
# Abre http://localhost:3000

# ═══════════════════════════════════════════════════════
# VER ESTADO DE TU CÓDIGO
# ═══════════════════════════════════════════════════════

git status              # Ver qué archivos cambiaron
git log --oneline      # Ver historial de commits
git diff               # Ver cambios sin guardar
```

---

## 🌐 URLs Importantes

| URL | Para qué |
|-----|----------|
| https://portal-arvic.vercel.app | Producción (usuarios reales) |
| https://portal-arvic-git-testing-josem.vercel.app | Tu preview (datos de prueba) |
| http://localhost:3000 | Desarrollo local |
| https://github.com/TSMJosem/portal-arvic-V1 | Repositorio en GitHub |
| https://cloud.mongodb.com | MongoDB Atlas |

---

## 🗄️ Bases de Datos

| Base de datos | Cuándo se usa | Qué contiene |
|---------------|---------------|--------------|
| `arvic-production` | Producción (main) | Datos reales de clientes |
| `arvic-preview` | Preview (testing branch) | Datos de prueba |
| `arvic-preview` | Desarrollo local (tu .env) | Datos de prueba |

---

## ❓ Preguntas Frecuentes

### ¿Puedo hacer push a main?
❌ **No.** La rama `main` está protegida. Solo mediante Pull Requests aprobados por Jose.

### ¿Cuántos commits puedo hacer antes del Pull Request?
✅ Los que necesites. Puedes hacer muchos commits y después crear un solo Pull Request.

### ¿Qué pasa si Jose hace cambios mientras yo trabajo?
Trae sus cambios a tu rama:
```bash
git checkout main
git pull origin main
git checkout testing
git merge main
```

### ¿Puedo probar localmente antes de subir?
✅ Sí, siempre:
```bash
npm run dev
```

### ¿Los datos de prueba que creo en preview afectan producción?
❌ No. Preview usa `arvic-preview` (base de datos separada).

### ¿Puedo crear múltiples Pull Requests?
✅ Sí, pero es mejor terminar uno antes de empezar otro (para evitar conflictos).

---

## 🆘 En Caso de Problemas

### Error: "Updates were rejected"
Significa que necesitas traer cambios de Jose:
```bash
git pull origin testing
```

### Error: "Merge conflicts"
Git te dirá qué archivos tienen conflicto. Ábrelos, resuélvelos manualmente y:
```bash
git add .
git commit -m "Resolver conflictos"
```

### No puedo hacer push a main
✅ Correcto, debes usar tu rama `testing`.

### Olvidé en qué rama estoy
```bash
git branch
# La rama con * es en la que estás
```

---

## 📞 Contacto

Si tienes dudas, contacta a Jose.

---

**¡Bienvenido al equipo! 🚀**
