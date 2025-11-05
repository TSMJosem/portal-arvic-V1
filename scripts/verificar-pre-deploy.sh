#!/bin/bash

# 🚀 Script de Verificación Pre-Despliegue
# Este script verifica que tu proyecto está listo para Vercel

echo "🔍 Verificando proyecto antes de desplegar a Vercel..."
echo ""

# Colores
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Contador de errores
ERRORS=0
WARNINGS=0

# 1. Verificar que existe vercel.json
echo -n "📄 Verificando vercel.json... "
if [ -f "vercel.json" ]; then
    echo -e "${GREEN}✓${NC}"
else
    echo -e "${RED}✗${NC}"
    echo "   ❌ No se encontró vercel.json"
    ERRORS=$((ERRORS + 1))
fi

# 2. Verificar que existe .vercelignore
echo -n "📄 Verificando .vercelignore... "
if [ -f ".vercelignore" ]; then
    echo -e "${GREEN}✓${NC}"
else
    echo -e "${YELLOW}⚠${NC}"
    echo "   ⚠️  No se encontró .vercelignore (opcional pero recomendado)"
    WARNINGS=$((WARNINGS + 1))
fi

# 3. Verificar que .env NO está en git
echo -n "🔒 Verificando que .env no esté en git... "
if git ls-files --error-unmatch .env 2>/dev/null; then
    echo -e "${RED}✗${NC}"
    echo "   ❌ PELIGRO: .env está en git. Ejecuta: git rm --cached .env"
    ERRORS=$((ERRORS + 1))
else
    echo -e "${GREEN}✓${NC}"
fi

# 4. Verificar que existe .gitignore
echo -n "📄 Verificando .gitignore... "
if [ -f ".gitignore" ]; then
    echo -e "${GREEN}✓${NC}"
    
    # Verificar que .env está en .gitignore
    echo -n "   Verificando que .env está en .gitignore... "
    if grep -q "^\.env$" .gitignore || grep -q "^.env" .gitignore; then
        echo -e "${GREEN}✓${NC}"
    else
        echo -e "${RED}✗${NC}"
        echo "   ❌ .env no está en .gitignore"
        ERRORS=$((ERRORS + 1))
    fi
else
    echo -e "${RED}✗${NC}"
    echo "   ❌ No se encontró .gitignore"
    ERRORS=$((ERRORS + 1))
fi

# 5. Verificar que existe package.json
echo -n "📦 Verificando package.json... "
if [ -f "package.json" ]; then
    echo -e "${GREEN}✓${NC}"
else
    echo -e "${RED}✗${NC}"
    echo "   ❌ No se encontró package.json"
    ERRORS=$((ERRORS + 1))
fi

# 6. Verificar que existe api/index.js
echo -n "🔧 Verificando api/index.js... "
if [ -f "api/index.js" ]; then
    echo -e "${GREEN}✓${NC}"
    
    # Verificar que exporta el app para Vercel
    echo -n "   Verificando que exporta module.exports... "
    if grep -q "module.exports = app" api/index.js; then
        echo -e "${GREEN}✓${NC}"
    else
        echo -e "${RED}✗${NC}"
        echo "   ❌ api/index.js no exporta el app para Vercel"
        ERRORS=$((ERRORS + 1))
    fi
else
    echo -e "${RED}✗${NC}"
    echo "   ❌ No se encontró api/index.js"
    ERRORS=$((ERRORS + 1))
fi

# 7. Verificar que existe .env local
echo -n "🔑 Verificando .env local... "
if [ -f ".env" ]; then
    echo -e "${GREEN}✓${NC}"
    
    # Verificar variables requeridas
    echo -n "   Verificando MONGODB_URI... "
    if grep -q "^MONGODB_URI=" .env; then
        echo -e "${GREEN}✓${NC}"
    else
        echo -e "${RED}✗${NC}"
        echo "   ❌ MONGODB_URI no está en .env"
        ERRORS=$((ERRORS + 1))
    fi
    
    echo -n "   Verificando JWT_SECRET... "
    if grep -q "^JWT_SECRET=" .env; then
        echo -e "${GREEN}✓${NC}"
    else
        echo -e "${RED}✗${NC}"
        echo "   ❌ JWT_SECRET no está en .env"
        ERRORS=$((ERRORS + 1))
    fi
else
    echo -e "${RED}✗${NC}"
    echo "   ❌ No se encontró .env (necesario para desarrollo local)"
    ERRORS=$((ERRORS + 1))
fi

# 8. Verificar que existe .env.example
echo -n "📝 Verificando .env.example... "
if [ -f ".env.example" ]; then
    echo -e "${GREEN}✓${NC}"
else
    echo -e "${YELLOW}⚠${NC}"
    echo "   ⚠️  No se encontró .env.example (recomendado para documentación)"
    WARNINGS=$((WARNINGS + 1))
fi

# 9. Verificar que node_modules existe
echo -n "📚 Verificando node_modules... "
if [ -d "node_modules" ]; then
    echo -e "${GREEN}✓${NC}"
else
    echo -e "${YELLOW}⚠${NC}"
    echo "   ⚠️  No se encontró node_modules. Ejecuta: npm install"
    WARNINGS=$((WARNINGS + 1))
fi

# 10. Verificar que no hay código de frontend en backend
echo -n "🚨 Verificando que no hay window/document en api/index.js... "
if grep -q "window\|document\|localStorage" api/index.js; then
    echo -e "${RED}✗${NC}"
    echo "   ❌ PELIGRO: Hay código de frontend en api/index.js"
    echo "   Esto causará errores en Vercel (window is not defined)"
    ERRORS=$((ERRORS + 1))
else
    echo -e "${GREEN}✓${NC}"
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Resumen
if [ $ERRORS -eq 0 ] && [ $WARNINGS -eq 0 ]; then
    echo -e "${GREEN}✅ ¡TODO CORRECTO! Proyecto listo para desplegar a Vercel${NC}"
    echo ""
    echo "Próximos pasos:"
    echo "1. Ejecuta: vercel"
    echo "2. Configura las variables de entorno en Vercel Dashboard"
    echo "3. Ejecuta: vercel --prod"
    echo ""
    exit 0
elif [ $ERRORS -eq 0 ]; then
    echo -e "${YELLOW}⚠️  Proyecto listo pero con advertencias${NC}"
    echo "   Advertencias encontradas: $WARNINGS"
    echo ""
    echo "Puedes desplegar, pero revisa las advertencias arriba."
    echo ""
    exit 0
else
    echo -e "${RED}❌ Proyecto NO listo para desplegar${NC}"
    echo "   Errores encontrados: $ERRORS"
    echo "   Advertencias: $WARNINGS"
    echo ""
    echo "Corrige los errores antes de desplegar."
    echo ""
    exit 1
fi
