#!/bin/bash

# Script principal de instalación de GoStore
# Este script instala la aplicación en /opt/gostore y la configura para producción

set -e  # Salir en caso de error

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"

# Configuración de la instalación
INSTALL_DIR="/opt/gostore"
APP_USER="gostore"
APP_GROUP="gostore"
DB_DIR="$INSTALL_DIR/data"
LOGS_DIR="/var/log/gostore"
CONFIG_DIR="/etc/gostore"

echo "🚀 Instalador de GoStore para Linux"
echo "======================================="
echo ""

# Verificar que se ejecuta como root
if [ "$EUID" -ne 0 ]; then
    echo "❌ Este script debe ejecutarse como root (usa sudo)"
    exit 1
fi

echo "📋 Configuración de la instalación:"
echo "   📁 Directorio de instalación: $INSTALL_DIR"
echo "   👤 Usuario de la aplicación: $APP_USER"
echo "   👥 Grupo de la aplicación: $APP_GROUP"
echo "   🗃️  Directorio de base de datos: $DB_DIR"
echo "   📄 Directorio de logs: $LOGS_DIR"
echo "   ⚙️  Directorio de configuración: $CONFIG_DIR"
echo ""

read -p "¿Continuar con la instalación? (y/N): " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "❌ Instalación cancelada"
    exit 0
fi

echo "🔧 Iniciando instalación..."

# 1. Crear usuario y grupo del sistema
echo "👤 Creando usuario del sistema..."
if ! id "$APP_USER" &>/dev/null; then
    groupadd --system "$APP_GROUP"
    useradd --system --gid "$APP_GROUP" --home-dir "$INSTALL_DIR" --shell /usr/sbin/nologin "$APP_USER"
    echo "✅ Usuario $APP_USER creado"
else
    echo "✅ Usuario $APP_USER ya existe"
fi

# 2. Crear directorios
echo "📁 Creando directorios..."
mkdir -p "$INSTALL_DIR"/{bin,static,data,templates,migrations}
mkdir -p "$LOGS_DIR"
mkdir -p "$CONFIG_DIR"

echo "✅ Directorios creados"

# 3. Verificar y construir la aplicación
echo "🏗️  Construyendo aplicación..."

# Ejecutar script de construcción del backend
if [ -f "$SCRIPT_DIR/build-backend.sh" ]; then
    echo "🔨 Construyendo backend..."
    bash "$SCRIPT_DIR/build-backend.sh"
else
    echo "❌ Error: No se encontró el script build-backend.sh"
    exit 1
fi

# Ejecutar script de construcción del frontend
if [ -f "$SCRIPT_DIR/build-frontend.sh" ]; then
    echo "🔨 Construyendo frontend..."
    bash "$SCRIPT_DIR/build-frontend.sh"
else
    echo "❌ Error: No se encontró el script build-frontend.sh"
    exit 1
fi

# 4. Copiar archivos de la aplicación
echo "📋 Copiando archivos de la aplicación..."

# Copiar binario del servidor
if [ -f "$PROJECT_ROOT/build/gostore-server" ]; then
    cp "$PROJECT_ROOT/build/gostore-server" "$INSTALL_DIR/bin/"
    chmod +x "$INSTALL_DIR/bin/gostore-server"
    echo "✅ Binario del servidor copiado"
else
    echo "❌ Error: No se encontró el binario del servidor"
    exit 1
fi

# Copiar archivos estáticos del frontend
if [ -d "$PROJECT_ROOT/server/static" ]; then
    cp -r "$PROJECT_ROOT/server/static"/* "$INSTALL_DIR/static/"
    echo "✅ Archivos estáticos del frontend copiados"
else
    echo "❌ Error: No se encontraron los archivos estáticos del frontend"
    exit 1
fi

# Copiar migrations si existen
if [ -d "$PROJECT_ROOT/build/migrations" ]; then
    cp -r "$PROJECT_ROOT/build/migrations"/* "$INSTALL_DIR/migrations/"
    echo "✅ Migrations copiadas"
fi

# Copiar templates si existen
if [ -d "$PROJECT_ROOT/build/templates" ]; then
    cp -r "$PROJECT_ROOT/build/templates"/* "$INSTALL_DIR/templates/"
    echo "✅ Templates copiadas"
fi

# 5. Crear archivo de configuración
echo "⚙️  Creando configuración..."
cat > "$CONFIG_DIR/gostore.env" << EOF
# Configuración de GoStore
ENVIRONMENT=production
PORT=8080
STATIC_DIR=$INSTALL_DIR/static
DB_PATH=$DB_DIR/gostore.db
JWT_SECRET_KEY=$(openssl rand -base64 32)

# Configuración de logs
LOG_LEVEL=info
LOG_FILE=$LOGS_DIR/gostore.log

# Configuración adicional
FRONTEND_URL=
EOF

echo "✅ Archivo de configuración creado en $CONFIG_DIR/gostore.env"

# 6. Configurar permisos
echo "🔐 Configurando permisos..."
chown -R "$APP_USER:$APP_GROUP" "$INSTALL_DIR"
chown -R "$APP_USER:$APP_GROUP" "$LOGS_DIR"
chown -R root:root "$CONFIG_DIR"
chmod 640 "$CONFIG_DIR/gostore.env"
chmod 755 "$INSTALL_DIR/bin/gostore-server"

echo "✅ Permisos configurados"

# 7. Crear script de inicio
echo "📜 Creando script de inicio..."
cat > "$INSTALL_DIR/bin/start-gostore.sh" << EOF
#!/bin/bash
# Script de inicio para GoStore

# Cargar variables de entorno
source $CONFIG_DIR/gostore.env

# Cambiar al directorio de la aplicación
cd $INSTALL_DIR

# Iniciar la aplicación
exec ./bin/gostore-server
EOF

chmod +x "$INSTALL_DIR/bin/start-gostore.sh"
chown "$APP_USER:$APP_GROUP" "$INSTALL_DIR/bin/start-gostore.sh"

echo "✅ Script de inicio creado"

# 8. Instalar servicio systemd
echo "🔄 Instalando servicio systemd..."
if [ -f "$SCRIPT_DIR/create-service.sh" ]; then
    bash "$SCRIPT_DIR/create-service.sh"
else
    echo "❌ Advertencia: No se encontró el script create-service.sh"
fi

echo ""
echo "🎉 ¡Instalación completada exitosamente!"
echo ""
echo "📋 Resumen de la instalación:"
echo "   📁 Aplicación instalada en: $INSTALL_DIR"
echo "   ⚙️  Configuración en: $CONFIG_DIR/gostore.env"
echo "   📄 Logs en: $LOGS_DIR"
echo "   👤 Usuario del sistema: $APP_USER"
echo ""
echo "🔧 Próximos pasos:"
echo "   1. Editar la configuración si es necesario: $CONFIG_DIR/gostore.env"
echo "   2. Iniciar el servicio: sudo systemctl start gostore"
echo "   3. Habilitar inicio automático: sudo systemctl enable gostore"
echo "   4. Verificar estado: sudo systemctl status gostore"
echo ""
echo "🌐 Una vez iniciado, la aplicación estará disponible en:"
echo "   http://localhost:8080"
echo ""
echo "📄 Para ver los logs: sudo journalctl -u gostore -f" 