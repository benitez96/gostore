#!/bin/bash

# Instalador principal de GoStore
# Este script ejecuta todo el proceso de instalación de forma automatizada

set -e  # Salir en caso de error

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
SCRIPTS_DIR="$SCRIPT_DIR/scripts"

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Función para imprimir con colores
print_step() {
    echo -e "${BLUE}$1${NC}"
}

print_success() {
    echo -e "${GREEN}$1${NC}"
}

print_warning() {
    echo -e "${YELLOW}$1${NC}"
}

print_error() {
    echo -e "${RED}$1${NC}"
}

print_info() {
    echo -e "${CYAN}$1${NC}"
}

# Banner de bienvenida
echo -e "${PURPLE}"
cat << "EOF"
  ____       ____  _                   
 / ___| ___ / ___|| |_ ___  _ __ ___   
| |  _ / _ \\___ \| __/ _ \| '__/ _ \  
| |_| | (_) |___) | || (_) | | |  __/  
 \____|\___/|____/ \__\___/|_|  \___|  
                                      
    Instalador para Linux Mint        
EOF
echo -e "${NC}"

echo ""
print_info "🚀 Instalador completo de GoStore para Linux"
print_info "=============================================="
echo ""

# Verificar que se ejecuta como root
if [ "$EUID" -ne 0 ]; then
    print_error "❌ Este script debe ejecutarse como root (usa sudo)"
    echo ""
    print_info "Uso: sudo ./install-gostore.sh"
    exit 1
fi

# Verificar distribución
print_step "🔍 Verificando sistema operativo..."
if [ -f /etc/os-release ]; then
    . /etc/os-release
    print_success "✅ Sistema detectado: $PRETTY_NAME"
    
    # Verificar si es compatible (Ubuntu/Debian/Mint)
    if [[ "$ID" != "ubuntu" && "$ID" != "debian" && "$ID" != "linuxmint" ]]; then
        print_warning "⚠️  Advertencia: Este instalador está optimizado para Ubuntu/Debian/Linux Mint"
        print_warning "   Puede funcionar en otras distribuciones, pero no está garantizado"
        echo ""
        read -p "¿Continuar de todos modos? (y/N): " -n 1 -r
        echo
        if [[ ! $REPLY =~ ^[Yy]$ ]]; then
            print_error "❌ Instalación cancelada"
            exit 0
        fi
    fi
else
    print_warning "⚠️  No se pudo detectar la distribución del sistema"
fi

echo ""

# Verificar herramientas necesarias
print_step "🔧 Verificando herramientas necesarias..."

MISSING_TOOLS=()

# Verificar Node.js
if ! command -v node &> /dev/null; then
    MISSING_TOOLS+=("Node.js")
else
    NODE_VERSION=$(node --version)
    print_success "✅ Node.js encontrado: $NODE_VERSION"
fi

# Verificar Go
if ! command -v go &> /dev/null; then
    MISSING_TOOLS+=("Go")
else
    GO_VERSION=$(go version)
    print_success "✅ Go encontrado: $GO_VERSION"
fi

# Verificar git
if ! command -v git &> /dev/null; then
    MISSING_TOOLS+=("Git")
else
    print_success "✅ Git encontrado"
fi

# Verificar openssl
if ! command -v openssl &> /dev/null; then
    MISSING_TOOLS+=("OpenSSL")
else
    print_success "✅ OpenSSL encontrado"
fi

# Si faltan herramientas, instalarlas o informar
if [ ${#MISSING_TOOLS[@]} -ne 0 ]; then
    print_warning "⚠️  Faltan las siguientes herramientas: ${MISSING_TOOLS[*]}"
    echo ""
    read -p "¿Intentar instalar las herramientas faltantes automáticamente? (y/N): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        print_step "📦 Actualizando lista de paquetes..."
        apt update
        
        for tool in "${MISSING_TOOLS[@]}"; do
            case $tool in
                "Node.js")
                    print_step "📦 Instalando Node.js..."
                    curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
                    apt-get install -y nodejs
                    ;;
                "Go")
                    print_step "📦 Instalando Go..."
                    apt-get install -y golang-go
                    ;;
                "Git")
                    print_step "📦 Instalando Git..."
                    apt-get install -y git
                    ;;
                "OpenSSL")
                    print_step "📦 Instalando OpenSSL..."
                    apt-get install -y openssl
                    ;;
            esac
        done
        print_success "✅ Herramientas instaladas"
    else
        print_error "❌ No se pueden continuar sin las herramientas necesarias"
        print_info "   Instala manualmente: ${MISSING_TOOLS[*]}"
        exit 1
    fi
fi

echo ""

# Verificar que existen los scripts necesarios
print_step "📋 Verificando scripts de instalación..."

REQUIRED_SCRIPTS=(
    "scripts/build-frontend.sh"
    "scripts/build-backend.sh"
    "scripts/install.sh"
    "scripts/create-service.sh"
)

for script in "${REQUIRED_SCRIPTS[@]}"; do
    if [ ! -f "$SCRIPT_DIR/$script" ]; then
        print_error "❌ Error: No se encontró el script $script"
        exit 1
    else
        print_success "✅ Script encontrado: $script"
    fi
done

echo ""

# Confirmar instalación
print_info "📋 La instalación realizará las siguientes acciones:"
echo "   1. 🏗️  Construir el frontend (React/TypeScript)"
echo "   2. 🏗️  Construir el backend (Go)"
echo "   3. 📁 Crear directorios en /opt/gostore"
echo "   4. 👤 Crear usuario del sistema 'gostore'"
echo "   5. 📋 Copiar archivos de la aplicación"
echo "   6. ⚙️  Configurar variables de entorno"
echo "   7. 🔄 Crear servicio systemd"
echo "   8. 🚀 Habilitar inicio automático"
echo ""
print_warning "⚠️  Esta instalación requiere permisos de administrador"
echo ""

read -p "¿Continuar con la instalación completa? (y/N): " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    print_error "❌ Instalación cancelada por el usuario"
    exit 0
fi

echo ""
print_step "🚀 Iniciando instalación completa..."
echo ""

# Ejecutar instalación
if [ -f "$SCRIPTS_DIR/install.sh" ]; then
    print_step "📦 Ejecutando instalación principal..."
    bash "$SCRIPTS_DIR/install.sh"
else
    print_error "❌ Error: No se encontró el script principal de instalación"
    exit 1
fi

echo ""
print_success "🎉 ¡Instalación de GoStore completada exitosamente!"
echo ""
print_info "📋 Resumen final:"
print_info "   📁 Aplicación instalada en: /opt/gostore"
print_info "   ⚙️  Configuración en: /etc/gostore/gostore.env"
print_info "   📄 Logs en: /var/log/gostore"
print_info "   🔄 Servicio systemd: gostore"
echo ""
print_step "🔧 Comandos útiles:"
print_info "   Iniciar servicio:    sudo systemctl start gostore"
print_info "   Ver estado:          sudo systemctl status gostore"
print_info "   Ver logs en vivo:    sudo journalctl -u gostore -f"
print_info "   Reiniciar servicio:  sudo systemctl restart gostore"
echo ""
print_step "🌐 Acceso a la aplicación:"
print_info "   URL: http://localhost:8080"
print_info "   API: http://localhost:8080/api"
echo ""
print_warning "🔧 Próximos pasos recomendados:"
print_info "   1. Revisar configuración: sudo nano /etc/gostore/gostore.env"
print_info "   2. Iniciar el servicio: sudo systemctl start gostore"
print_info "   3. Verificar que funciona: sudo systemctl status gostore"
print_info "   4. Abrir navegador en: http://localhost:8080"
echo ""
print_success "✨ ¡GoStore está listo para usar!" 