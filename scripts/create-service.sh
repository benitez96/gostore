#!/bin/bash

# Script para crear el servicio systemd de GoStore
# Este script configura GoStore como un servicio del sistema

set -e  # Salir en caso de error

# Configuración del servicio
SERVICE_NAME="gostore"
APP_USER="gostore"
APP_GROUP="gostore"
INSTALL_DIR="/opt/gostore"
CONFIG_DIR="/etc/gostore"
LOGS_DIR="/var/log/gostore"

echo "🔄 Configurando servicio systemd para GoStore..."

# Verificar que se ejecuta como root
if [ "$EUID" -ne 0 ]; then
    echo "❌ Este script debe ejecutarse como root (usa sudo)"
    exit 1
fi

# Verificar que existe el directorio de instalación
if [ ! -d "$INSTALL_DIR" ]; then
    echo "❌ Error: No se encontró el directorio de instalación $INSTALL_DIR"
    echo "   Ejecuta primero el script de instalación"
    exit 1
fi

# Verificar que existe el binario
if [ ! -f "$INSTALL_DIR/bin/gostore-server" ]; then
    echo "❌ Error: No se encontró el binario de GoStore"
    exit 1
fi

# Crear archivo del servicio systemd
echo "📄 Creando archivo de servicio systemd..."
cat > "/etc/systemd/system/$SERVICE_NAME.service" << EOF
[Unit]
Description=GoStore Application Server
Documentation=https://github.com/benitez96/gostore
After=network-online.target
Wants=network-online.target

[Service]
Type=simple
User=$APP_USER
Group=$APP_GROUP
WorkingDirectory=$INSTALL_DIR
ExecStart=$INSTALL_DIR/bin/start-gostore.sh
ExecReload=/bin/kill -HUP \$MAINPID
Restart=always
RestartSec=10
KillMode=mixed
KillSignal=SIGTERM
TimeoutStopSec=30

# Variables de entorno
Environment=ENVIRONMENT=production
EnvironmentFile=$CONFIG_DIR/gostore.env

# Configuración de seguridad
NoNewPrivileges=true
PrivateTmp=true
ProtectSystem=strict
ProtectHome=true
ReadWritePaths=$INSTALL_DIR/data $LOGS_DIR
RestrictSUIDSGID=true
RemoveIPC=true

# Configuración de recursos
LimitNOFILE=65536
LimitNPROC=32768

# Configuración de logging
StandardOutput=journal
StandardError=journal
SyslogIdentifier=$SERVICE_NAME

[Install]
WantedBy=multi-user.target
EOF

echo "✅ Archivo de servicio creado: /etc/systemd/system/$SERVICE_NAME.service"

# Recargar systemd para reconocer el nuevo servicio
echo "🔄 Recargando configuración de systemd..."
systemctl daemon-reload

# Habilitar el servicio para que inicie automáticamente
echo "🚀 Habilitando servicio para inicio automático..."
systemctl enable "$SERVICE_NAME"

echo "✅ Servicio systemd configurado exitosamente!"
echo ""
echo "📋 Comandos útiles para gestionar el servicio:"
echo "   🚀 Iniciar:          sudo systemctl start $SERVICE_NAME"
echo "   🛑 Detener:          sudo systemctl stop $SERVICE_NAME"
echo "   🔄 Reiniciar:        sudo systemctl restart $SERVICE_NAME"
echo "   📊 Estado:           sudo systemctl status $SERVICE_NAME"
echo "   📄 Logs:             sudo journalctl -u $SERVICE_NAME -f"
echo "   📄 Logs recientes:   sudo journalctl -u $SERVICE_NAME --since today"
echo "   ✅ Habilitar:        sudo systemctl enable $SERVICE_NAME"
echo "   ❌ Deshabilitar:     sudo systemctl disable $SERVICE_NAME"
echo ""
echo "🔧 Configuración del servicio:"
echo "   📄 Archivo de servicio: /etc/systemd/system/$SERVICE_NAME.service"
echo "   👤 Usuario: $APP_USER"
echo "   📁 Directorio de trabajo: $INSTALL_DIR"
echo "   ⚙️  Variables de entorno: $CONFIG_DIR/gostore.env"
echo ""
echo "🎯 El servicio se iniciará automáticamente al arrancar el sistema" 