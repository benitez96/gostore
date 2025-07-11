#!/bin/bash

# Script para construir el backend de GoStore
# Este script compila el servidor Go para producción

set -e  # Salir en caso de error

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
SERVER_DIR="$PROJECT_ROOT/server"
BUILD_DIR="$PROJECT_ROOT/build"

echo "🏗️  Construyendo backend de GoStore..."
echo "📁 Directorio del proyecto: $PROJECT_ROOT"
echo "📁 Directorio del servidor: $SERVER_DIR"
echo "📁 Directorio de construcción: $BUILD_DIR"

# Verificar que existe el directorio del servidor
if [ ! -d "$SERVER_DIR" ]; then
    echo "❌ Error: No se encontró el directorio del servidor en $SERVER_DIR"
    exit 1
fi

# Verificar que existe go.mod
if [ ! -f "$SERVER_DIR/go.mod" ]; then
    echo "❌ Error: No se encontró go.mod en $SERVER_DIR"
    exit 1
fi

# Verificar que Go está instalado
if ! command -v go &> /dev/null; then
    echo "❌ Error: Go no está instalado. Por favor instala Go"
    exit 1
fi

# Mostrar versión de Go
echo "🐹 Versión de Go: $(go version)"

# Cambiar al directorio del servidor
cd "$SERVER_DIR"

echo "📦 Descargando dependencias de Go..."

# Descargar dependencias
go mod download
go mod tidy

echo "🔨 Construyendo servidor Go..."

# Crear directorio de construcción
mkdir -p "$BUILD_DIR"

# Variables de construcción
APP_NAME="gostore-server"
BUILD_TIME=$(date -u +"%Y-%m-%dT%H:%M:%SZ")
GIT_COMMIT=$(git rev-parse --short HEAD 2>/dev/null || echo "unknown")
VERSION="1.0.0"

# Flags de construcción para optimización
BUILD_FLAGS=(
    -ldflags="-s -w -X main.Version=$VERSION -X main.BuildTime=$BUILD_TIME -X main.GitCommit=$GIT_COMMIT"
    -trimpath
)

echo "🔧 Información de construcción:"
echo "   📦 Aplicación: $APP_NAME"
echo "   🏷️  Versión: $VERSION"
echo "   ⏰ Tiempo de construcción: $BUILD_TIME"
echo "   📝 Commit: $GIT_COMMIT"

# Construir para Linux AMD64 (arquitectura más común para servidores)
echo "🐧 Construyendo para Linux AMD64..."
GOOS=linux GOARCH=amd64 go build "${BUILD_FLAGS[@]}" -o "$BUILD_DIR/$APP_NAME" ./cmd/api

# Verificar que se construyó el binario
if [ ! -f "$BUILD_DIR/$APP_NAME" ]; then
    echo "❌ Error: No se generó el binario del servidor"
    exit 1
fi

# Hacer el binario ejecutable
chmod +x "$BUILD_DIR/$APP_NAME"

echo "✅ Backend construido exitosamente!"
echo "📁 Binario disponible en: $BUILD_DIR/$APP_NAME"

# Mostrar información del binario
echo ""
echo "📊 Información del binario:"
ls -lh "$BUILD_DIR/$APP_NAME"
file "$BUILD_DIR/$APP_NAME"

# Copiar archivos necesarios para la ejecución
echo ""
echo "📋 Copiando archivos necesarios..."

# Copiar migrations si existen
if [ -d "$SERVER_DIR/internal/repositories/db/migrations" ]; then
    echo "📄 Copiando migrations..."
    mkdir -p "$BUILD_DIR/migrations"
    cp -r "$SERVER_DIR/internal/repositories/db/migrations"/* "$BUILD_DIR/migrations/"
fi

# Copiar templates PDF si existen
if [ -d "$SERVER_DIR/internal/services/pdf/templates" ]; then
    echo "📄 Copiando templates PDF..."
    mkdir -p "$BUILD_DIR/templates"
    cp -r "$SERVER_DIR/internal/services/pdf/templates"/* "$BUILD_DIR/templates/"
fi

echo ""
echo "🎉 ¡Build del backend completado!" 