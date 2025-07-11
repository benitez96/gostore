#!/bin/bash

# Script para construir el frontend de GoStore
# Este script compila el frontend React/TypeScript y lo prepara para producción

set -e  # Salir en caso de error

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
CLIENT_DIR="$PROJECT_ROOT/client"
SERVER_DIR="$PROJECT_ROOT/server"
STATIC_DIR="$SERVER_DIR/static"

echo "🏗️  Construyendo frontend de GoStore..."
echo "📁 Directorio del proyecto: $PROJECT_ROOT"
echo "📁 Directorio del cliente: $CLIENT_DIR"
echo "📁 Directorio estático de destino: $STATIC_DIR"

# Verificar que existe el directorio del cliente
if [ ! -d "$CLIENT_DIR" ]; then
    echo "❌ Error: No se encontró el directorio del cliente en $CLIENT_DIR"
    exit 1
fi

# Verificar que existe package.json
if [ ! -f "$CLIENT_DIR/package.json" ]; then
    echo "❌ Error: No se encontró package.json en $CLIENT_DIR"
    exit 1
fi

# Cambiar al directorio del cliente
cd "$CLIENT_DIR"

echo "📦 Verificando dependencias..."

# Verificar si existe node_modules, si no, instalar dependencias
if [ ! -d "node_modules" ]; then
    echo "📥 Instalando dependencias del frontend..."
    if command -v pnpm &> /dev/null; then
        echo "📦 Usando pnpm para instalar dependencias..."
        pnpm install
    elif command -v npm &> /dev/null; then
        echo "📦 Usando npm para instalar dependencias..."
        npm install
    else
        echo "❌ Error: No se encontró npm ni pnpm. Por favor instala Node.js"
        exit 1
    fi
else
    echo "✅ Dependencias ya instaladas"
fi

echo "🔨 Construyendo aplicación frontend..."

# Construir la aplicación
if command -v pnpm &> /dev/null; then
    echo "🔨 Usando pnpm para construir..."
    pnpm run build
elif command -v npm &> /dev/null; then
    echo "🔨 Usando npm para construir..."
    npm run build
else
    echo "❌ Error: No se encontró npm ni pnpm"
    exit 1
fi

# Verificar que se creó el directorio dist
if [ ! -d "dist" ]; then
    echo "❌ Error: No se generó el directorio dist. La construcción falló."
    exit 1
fi

echo "📁 Preparando directorio estático en el servidor..."

# Crear directorio estático en el servidor si no existe
mkdir -p "$STATIC_DIR"

# Limpiar directorio estático anterior si existe
if [ -d "$STATIC_DIR" ] && [ "$(ls -A $STATIC_DIR)" ]; then
    echo "🧹 Limpiando directorio estático anterior..."
    rm -rf "$STATIC_DIR"/*
fi

echo "📋 Copiando archivos construidos al directorio estático..."

# Copiar archivos construidos al directorio estático del servidor
cp -r dist/* "$STATIC_DIR/"

# Verificar que se copiaron los archivos
if [ ! -f "$STATIC_DIR/index.html" ]; then
    echo "❌ Error: No se encontró index.html en el directorio estático"
    exit 1
fi

echo "✅ Frontend construido exitosamente!"
echo "📁 Archivos estáticos disponibles en: $STATIC_DIR"
echo "🌐 El servidor Go ahora puede servir la aplicación frontend"

# Mostrar estadísticas del build
echo ""
echo "📊 Estadísticas del build:"
echo "📁 Directorio estático: $STATIC_DIR"
echo "📄 Archivos principales:"
ls -la "$STATIC_DIR" | head -10

echo ""
echo "🎉 ¡Build del frontend completado!" 