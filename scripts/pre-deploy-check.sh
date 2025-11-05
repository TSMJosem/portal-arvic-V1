#!/bin/bash

# Script de verificación pre-despliegue
# Ejecutar con: bash scripts/pre-deploy-check.sh

echo "🔍 Verificando configuración para despliegue..."
echo ""

# Colores
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Contador de problemas
ISSUES=0

# 1. Verificar que existe .env
echo -n "📄 Verificando archivo .env... "
if [ -f .env ]; then
    echo -e "${GREEN}✓${NC}"
else
    echo -e "${RED}✗${NC} No existe .env (cópialo desde .env.example)"
    ISSUES=$((ISSUES+1))
fi

# 2. Verificar que .env está en .gitignore
echo -n "🔒 Verificando que .env esté en .gitignore... "
if grep -q "^\.env$" .gitignore 2>/dev/null; then
    echo -e "${GREEN}✓${NC}"
else
    echo -e "${RED}✗${NC} .env NO está en .gitignore (¡PELIGRO!)"
    ISSUES=$((ISSUES+1))
fi

# 3. Verificar que existe node_modules
echo -n "📦 Verificando node_modules... "
if [ -d node_modules ]; then
    echo -e "${GREEN}✓${NC}"
else
    echo -e "${YELLOW}⚠${NC} node_modules no existe (ejecuta: npm install)"
    ISSUES=$((ISSUES+1))
fi

# 4. Verificar que existe vercel.json
echo -n "⚙️  Verificando vercel.json... "
if [ -f vercel.json ]; then
    echo -e "${GREEN}✓${NC}"
else
    echo -e "${RED}✗${NC} vercel.json no existe"
    ISSUES=$((ISSUES+1))
fi

# 5. Verificar variables en .env
if [ -f .env ]; then
    echo -n "🔑 Verificando MONGODB_URI en .env... "
    if grep -q "^MONGODB_URI=" .env; then
        echo -e "${GREEN}✓${NC}"
    else
        echo -e "${RED}✗${NC} MONGODB_URI no configurado"
        ISSUES=$((ISSUES+1))
    fi
    
    echo -n "🔑 Verificando JWT_SECRET en .env... "
    if grep -q "^JWT_SECRET=" .env; then
        echo -e "${GREEN}✓${NC}"
    else
        echo -e "${RED}✗${NC} JWT_SECRET no configurado"
        ISSUES=$((ISSUES+1))
    fi
fi

# 6. Verificar que no hay archivos grandes en git
echo -n "📏 Verificando archivos grandes en git... "
LARGE_FILES=$(find . -type f -size +10M 2>/dev/null | grep -v node_modules | grep -v .git | wc -l | tr -d ' ')
if [ "$LARGE_FILES" -eq 0 ]; then
    echo -e "${GREEN}✓${NC}"
else
    echo -e "${YELLOW}⚠${NC} Hay $LARGE_FILES archivo(s) mayor(es) a 10MB"
fi

# 7. Verificar estructura de carpetas
echo -n "📁 Verificando estructura de carpetas... "
REQUIRED_DIRS=("api" "admin" "consultor" "js" "css")
MISSING_DIRS=0
for dir in "${REQUIRED_DIRS[@]}"; do
    if [ ! -d "$dir" ]; then
        MISSING_DIRS=$((MISSING_DIRS+1))
    fi
done

if [ $MISSING_DIRS -eq 0 ]; then
    echo -e "${GREEN}✓${NC}"
else
    echo -e "${RED}✗${NC} Faltan $MISSING_DIRS carpeta(s) requerida(s)"
    ISSUES=$((ISSUES+1))
fi

# Resumen
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
if [ $ISSUES -eq 0 ]; then
    echo -e "${GREEN}✅ Todo listo para desplegar${NC}"
    echo ""
    echo "Próximos pasos:"
    echo "1. Commit y push a tu repositorio"
    echo "2. Conecta el repo en Vercel"
    echo "3. Configura las variables de entorno en Vercel"
    echo "4. Deploy!"
else
    echo -e "${RED}❌ Se encontraron $ISSUES problema(s)${NC}"
    echo ""
    echo "Por favor corrige los problemas antes de desplegar."
fi
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
