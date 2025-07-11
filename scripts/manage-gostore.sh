#!/bin/bash

# Script de gestión de GoStore
# Utilidades para administrar la aplicación GoStore instalada

set -e

SERVICE_NAME="gostore"
INSTALL_DIR="/opt/gostore"
CONFIG_DIR="/etc/gostore"
LOGS_DIR="/var/log/gostore"

# Colores
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m'

print_success() { echo -e "${GREEN}$1${NC}"; }
print_error() { echo -e "${RED}$1${NC}"; }
print_warning() { echo -e "${YELLOW}$1${NC}"; }
print_info() { echo -e "${CYAN}$1${NC}"; }
print_step() { echo -e "${BLUE}$1${NC}"; }

# Función para mostrar ayuda
show_help() {
    echo "GoStore - Script de Gestión"
    echo "============================"
    echo ""
    echo "Uso: $0 [COMANDO]"
    echo ""
    echo "Comandos disponibles:"
    echo "  start       Iniciar el servicio GoStore"
    echo "  stop        Detener el servicio GoStore"
    echo "  restart     Reiniciar el servicio GoStore"
    echo "  status      Mostrar estado del servicio"
    echo "  logs        Mostrar logs en tiempo real"
    echo "  logs-tail   Mostrar últimas líneas de logs"
    echo "  enable      Habilitar inicio automático"
    echo "  disable     Deshabilitar inicio automático"
    echo "  config      Editar configuración"
    echo "  backup      Crear backup de la base de datos"
    echo "  restore     Restaurar backup de la base de datos"
    echo "  update      Actualizar la aplicación"
    echo "  info        Mostrar información del sistema"
    echo "  health      Verificar salud de la aplicación"
    echo "  help        Mostrar esta ayuda"
    echo ""
}

# Verificar si el servicio existe
check_service() {
    if ! systemctl list-unit-files | grep -q "$SERVICE_NAME.service"; then
        print_error "❌ El servicio $SERVICE_NAME no está instalado"
        print_info "   Ejecuta el instalador primero: sudo ./install-gostore.sh"
        exit 1
    fi
}

# Comandos del servicio
cmd_start() {
    print_step "🚀 Iniciando servicio GoStore..."
    systemctl start "$SERVICE_NAME"
    print_success "✅ Servicio iniciado"
    cmd_status
}

cmd_stop() {
    print_step "🛑 Deteniendo servicio GoStore..."
    systemctl stop "$SERVICE_NAME"
    print_success "✅ Servicio detenido"
}

cmd_restart() {
    print_step "🔄 Reiniciando servicio GoStore..."
    systemctl restart "$SERVICE_NAME"
    print_success "✅ Servicio reiniciado"
    cmd_status
}

cmd_status() {
    print_step "📊 Estado del servicio GoStore:"
    systemctl status "$SERVICE_NAME" --no-pager -l
}

cmd_logs() {
    print_step "📄 Logs en tiempo real (Ctrl+C para salir):"
    journalctl -u "$SERVICE_NAME" -f
}

cmd_logs_tail() {
    print_step "📄 Últimas líneas de logs:"
    journalctl -u "$SERVICE_NAME" --no-pager -n 50
}

cmd_enable() {
    print_step "✅ Habilitando inicio automático..."
    systemctl enable "$SERVICE_NAME"
    print_success "✅ Inicio automático habilitado"
}

cmd_disable() {
    print_step "❌ Deshabilitando inicio automático..."
    systemctl disable "$SERVICE_NAME"
    print_warning "⚠️  Inicio automático deshabilitado"
}

cmd_config() {
    print_step "⚙️  Abriendo configuración para edición..."
    if command -v nano &> /dev/null; then
        nano "$CONFIG_DIR/gostore.env"
    elif command -v vim &> /dev/null; then
        vim "$CONFIG_DIR/gostore.env"
    else
        print_error "❌ No se encontró editor (nano/vim)"
        print_info "   Edita manualmente: $CONFIG_DIR/gostore.env"
        return 1
    fi
    
    read -p "¿Reiniciar el servicio para aplicar cambios? (y/N): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        cmd_restart
    fi
}

cmd_backup() {
    print_step "💾 Creando backup de la base de datos..."
    
    BACKUP_DIR="$INSTALL_DIR/backups"
    mkdir -p "$BACKUP_DIR"
    
    TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
    BACKUP_FILE="$BACKUP_DIR/gostore_backup_$TIMESTAMP.db"
    
    if [ -f "$INSTALL_DIR/data/gostore.db" ]; then
        cp "$INSTALL_DIR/data/gostore.db" "$BACKUP_FILE"
        print_success "✅ Backup creado: $BACKUP_FILE"
        
        # Comprimir el backup
        gzip "$BACKUP_FILE"
        print_success "✅ Backup comprimido: $BACKUP_FILE.gz"
    else
        print_error "❌ No se encontró la base de datos"
    fi
}

cmd_restore() {
    print_step "🔄 Restaurando backup de la base de datos..."
    
    BACKUP_DIR="$INSTALL_DIR/backups"
    
    if [ ! -d "$BACKUP_DIR" ]; then
        print_error "❌ No se encontró el directorio de backups"
        return 1
    fi
    
    print_info "Backups disponibles:"
    ls -la "$BACKUP_DIR"/*.gz 2>/dev/null || {
        print_error "❌ No se encontraron backups"
        return 1
    }
    
    echo ""
    read -p "Ingresa el nombre del archivo de backup (sin ruta): " backup_file
    
    if [ -f "$BACKUP_DIR/$backup_file" ]; then
        print_warning "⚠️  Esto sobrescribirá la base de datos actual"
        read -p "¿Continuar? (y/N): " -n 1 -r
        echo
        if [[ $REPLY =~ ^[Yy]$ ]]; then
            cmd_stop
            
            # Crear backup de seguridad
            cp "$INSTALL_DIR/data/gostore.db" "$INSTALL_DIR/data/gostore.db.backup"
            
            # Restaurar
            if [[ "$backup_file" == *.gz ]]; then
                gunzip -c "$BACKUP_DIR/$backup_file" > "$INSTALL_DIR/data/gostore.db"
            else
                cp "$BACKUP_DIR/$backup_file" "$INSTALL_DIR/data/gostore.db"
            fi
            
            chown gostore:gostore "$INSTALL_DIR/data/gostore.db"
            
            cmd_start
            print_success "✅ Backup restaurado exitosamente"
        fi
    else
        print_error "❌ Archivo de backup no encontrado"
    fi
}

cmd_update() {
    print_step "🔄 Actualizando GoStore..."
    print_warning "⚠️  Esta función requiere que tengas el código fuente actualizado"
    
    read -p "¿Continuar con la actualización? (y/N): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        # Crear backup antes de actualizar
        cmd_backup
        
        # Detener servicio
        cmd_stop
        
        # Ejecutar scripts de construcción
        SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
        
        if [ -f "$SCRIPT_DIR/build-backend.sh" ]; then
            bash "$SCRIPT_DIR/build-backend.sh"
        fi
        
        if [ -f "$SCRIPT_DIR/build-frontend.sh" ]; then
            bash "$SCRIPT_DIR/build-frontend.sh"
        fi
        
        # Copiar nuevos archivos
        if [ -f "build/gostore-server" ]; then
            cp build/gostore-server "$INSTALL_DIR/bin/"
            chmod +x "$INSTALL_DIR/bin/gostore-server"
        fi
        
        if [ -d "server/static" ]; then
            rm -rf "$INSTALL_DIR/static"/*
            cp -r server/static/* "$INSTALL_DIR/static/"
        fi
        
        # Reiniciar servicio
        cmd_start
        print_success "✅ Actualización completada"
    fi
}

cmd_info() {
    print_step "📋 Información del sistema GoStore:"
    echo ""
    
    print_info "🔧 Servicio:"
    systemctl is-active "$SERVICE_NAME" >/dev/null && print_success "   Estado: Activo" || print_error "   Estado: Inactivo"
    systemctl is-enabled "$SERVICE_NAME" >/dev/null && print_success "   Inicio automático: Habilitado" || print_warning "   Inicio automático: Deshabilitado"
    
    echo ""
    print_info "📁 Directorios:"
    echo "   Instalación: $INSTALL_DIR"
    echo "   Configuración: $CONFIG_DIR"
    echo "   Logs: $LOGS_DIR"
    
    echo ""
    print_info "📊 Archivos:"
    [ -f "$INSTALL_DIR/bin/gostore-server" ] && echo "   ✅ Binario del servidor" || echo "   ❌ Binario del servidor"
    [ -d "$INSTALL_DIR/static" ] && echo "   ✅ Archivos estáticos" || echo "   ❌ Archivos estáticos"
    [ -f "$INSTALL_DIR/data/gostore.db" ] && echo "   ✅ Base de datos" || echo "   ❌ Base de datos"
    [ -f "$CONFIG_DIR/gostore.env" ] && echo "   ✅ Configuración" || echo "   ❌ Configuración"
    
    echo ""
    print_info "💾 Espacio en disco:"
    df -h "$INSTALL_DIR" | tail -1
    
    if [ -f "$INSTALL_DIR/data/gostore.db" ]; then
        echo ""
        print_info "🗃️  Tamaño de base de datos:"
        ls -lh "$INSTALL_DIR/data/gostore.db"
    fi
}

cmd_health() {
    print_step "🏥 Verificando salud de la aplicación..."
    
    # Verificar servicio
    if systemctl is-active "$SERVICE_NAME" >/dev/null; then
        print_success "✅ Servicio activo"
    else
        print_error "❌ Servicio inactivo"
        return 1
    fi
    
    # Verificar puerto
    if ss -tlnp | grep -q ":8080"; then
        print_success "✅ Puerto 8080 abierto"
    else
        print_error "❌ Puerto 8080 no disponible"
    fi
    
    # Verificar API
    if command -v curl &> /dev/null; then
        if curl -s -f http://localhost:8080/api >/dev/null; then
            print_success "✅ API respondiendo"
        else
            print_warning "⚠️  API no responde correctamente"
        fi
    fi
    
    # Verificar base de datos
    if [ -f "$INSTALL_DIR/data/gostore.db" ]; then
        print_success "✅ Base de datos existe"
    else
        print_error "❌ Base de datos no encontrada"
    fi
    
    print_success "🎉 Verificación de salud completada"
}

# Verificar permisos
if [ "$EUID" -ne 0 ]; then
    print_error "❌ Este script debe ejecutarse como root (usa sudo)"
    exit 1
fi

# Procesar comando
case "${1:-help}" in
    start)
        check_service
        cmd_start
        ;;
    stop)
        check_service
        cmd_stop
        ;;
    restart)
        check_service
        cmd_restart
        ;;
    status)
        check_service
        cmd_status
        ;;
    logs)
        check_service
        cmd_logs
        ;;
    logs-tail)
        check_service
        cmd_logs_tail
        ;;
    enable)
        check_service
        cmd_enable
        ;;
    disable)
        check_service
        cmd_disable
        ;;
    config)
        cmd_config
        ;;
    backup)
        cmd_backup
        ;;
    restore)
        cmd_restore
        ;;
    update)
        cmd_update
        ;;
    info)
        cmd_info
        ;;
    health)
        check_service
        cmd_health
        ;;
    help|--help|-h)
        show_help
        ;;
    *)
        print_error "❌ Comando desconocido: $1"
        echo ""
        show_help
        exit 1
        ;;
esac 