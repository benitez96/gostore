# GoStore - Instalador para Linux

Este documento describe cómo instalar y configurar GoStore en un sistema Linux Mint (o compatible con Ubuntu/Debian).

## 📋 Contenido

- [Requisitos del Sistema](#-requisitos-del-sistema)
- [Instalación Automática](#-instalación-automática)
- [Instalación Manual](#-instalación-manual)
- [Configuración](#-configuración)
- [Gestión del Servicio](#-gestión-del-servicio)
- [Troubleshooting](#-troubleshooting)
- [Desinstalación](#-desinstalación)

## 🔧 Requisitos del Sistema

### Sistema Operativo
- Linux Mint 20+ (recomendado)
- Ubuntu 20.04+ 
- Debian 11+
- Otras distribuciones basadas en Debian

### Hardware Mínimo
- CPU: 1 core, 1 GHz
- RAM: 512 MB disponible
- Almacenamiento: 2 GB libres
- Red: Conexión a internet para la instalación

### Software Requerido
El instalador puede instalar automáticamente estas dependencias:
- **Node.js** (v16 o superior)
- **Go** (v1.19 o superior)
- **Git**
- **OpenSSL**

## 🚀 Instalación Automática

### Método Rápido (Recomendado)

1. **Descargar o clonar el repositorio:**
   ```bash
   git clone https://github.com/benitez96/gostore.git
   cd gostore
   ```

2. **Ejecutar el instalador principal:**
   ```bash
   sudo ./install-gostore.sh
   ```

   El instalador realizará automáticamente:
   - ✅ Verificación del sistema
   - ✅ Instalación de dependencias faltantes
   - ✅ Construcción del frontend y backend
   - ✅ Creación de directorios del sistema
   - ✅ Configuración del usuario del sistema
   - ✅ Instalación del servicio systemd
   - ✅ Configuración de permisos

3. **Iniciar el servicio:**
   ```bash
   sudo systemctl start gostore
   sudo systemctl enable gostore
   ```

4. **Verificar la instalación:**
   ```bash
   sudo systemctl status gostore
   ```

5. **Acceder a la aplicación:**
   Abrir navegador en: http://localhost:8080

## 🔨 Instalación Manual

Si prefieres más control sobre el proceso:

### 1. Construir el Frontend
```bash
chmod +x scripts/build-frontend.sh
./scripts/build-frontend.sh
```

### 2. Construir el Backend
```bash
chmod +x scripts/build-backend.sh
./scripts/build-backend.sh
```

### 3. Instalar la Aplicación
```bash
chmod +x scripts/install.sh
sudo ./scripts/install.sh
```

### 4. Crear el Servicio
```bash
chmod +x scripts/create-service.sh
sudo ./scripts/create-service.sh
```

## ⚙️ Configuración

### Archivo de Configuración
La configuración se encuentra en: `/etc/gostore/gostore.env`

```bash
# Configuración de GoStore
ENVIRONMENT=production
PORT=8080
STATIC_DIR=/opt/gostore/static
DB_PATH=/opt/gostore/data/gostore.db
JWT_SECRET_KEY=tu-clave-secreta-generada-automaticamente

# Configuración de logs
LOG_LEVEL=info
LOG_FILE=/var/log/gostore/gostore.log

# Configuración adicional
FRONTEND_URL=
```

### Editar Configuración
```bash
sudo nano /etc/gostore/gostore.env

# Reiniciar servicio después de cambios
sudo systemctl restart gostore
```

### Configuración del Puerto
Para cambiar el puerto (ejemplo: 3000):
```bash
sudo nano /etc/gostore/gostore.env
# Cambiar: PORT=3000

sudo systemctl restart gostore
```

## 🔄 Gestión del Servicio

### Usando systemctl (Método Estándar)
```bash
# Iniciar servicio
sudo systemctl start gostore

# Detener servicio
sudo systemctl stop gostore

# Reiniciar servicio
sudo systemctl restart gostore

# Ver estado
sudo systemctl status gostore

# Habilitar inicio automático
sudo systemctl enable gostore

# Deshabilitar inicio automático
sudo systemctl disable gostore

# Ver logs
sudo journalctl -u gostore -f
```

### Usando el Script de Gestión
Un script dedicado está disponible para facilitar la administración:

```bash
# Hacer ejecutable
chmod +x scripts/manage-gostore.sh

# Ver ayuda
sudo ./scripts/manage-gostore.sh help

# Comandos disponibles:
sudo ./scripts/manage-gostore.sh start      # Iniciar
sudo ./scripts/manage-gostore.sh stop       # Detener
sudo ./scripts/manage-gostore.sh restart    # Reiniciar
sudo ./scripts/manage-gostore.sh status     # Estado
sudo ./scripts/manage-gostore.sh logs       # Logs en vivo
sudo ./scripts/manage-gostore.sh config     # Editar configuración
sudo ./scripts/manage-gostore.sh backup     # Crear backup
sudo ./scripts/manage-gostore.sh restore    # Restaurar backup
sudo ./scripts/manage-gostore.sh health     # Verificar salud
sudo ./scripts/manage-gostore.sh info       # Información del sistema
```

## 📁 Estructura de Directorios

Después de la instalación:

```
/opt/gostore/                 # Directorio principal
├── bin/
│   ├── gostore-server        # Binario del servidor
│   └── start-gostore.sh      # Script de inicio
├── static/                   # Archivos del frontend
├── data/                     # Base de datos SQLite
├── templates/                # Plantillas PDF
├── migrations/               # Migraciones de DB
└── backups/                  # Backups automáticos

/etc/gostore/                 # Configuración
└── gostore.env               # Variables de entorno

/var/log/gostore/             # Logs
└── gostore.log               # Archivo de log

/etc/systemd/system/          # Servicio systemd
└── gostore.service           # Definición del servicio
```

## 🔍 Troubleshooting

### El servicio no inicia
```bash
# Ver logs detallados
sudo journalctl -u gostore --no-pager

# Verificar configuración
sudo ./scripts/manage-gostore.sh health

# Verificar permisos
sudo ls -la /opt/gostore/
sudo ls -la /etc/gostore/
```

### Error de puerto en uso
```bash
# Ver qué proceso usa el puerto 8080
sudo ss -tlnp | grep 8080
sudo lsof -i :8080

# Cambiar puerto en configuración
sudo nano /etc/gostore/gostore.env
# PORT=3000
sudo systemctl restart gostore
```

### Problemas de permisos
```bash
# Corregir permisos
sudo chown -R gostore:gostore /opt/gostore/
sudo chown -R gostore:gostore /var/log/gostore/
sudo chmod +x /opt/gostore/bin/gostore-server
```

### Base de datos corrupta
```bash
# Crear backup de la DB actual
sudo cp /opt/gostore/data/gostore.db /opt/gostore/data/gostore.db.backup

# Restaurar desde backup
sudo ./scripts/manage-gostore.sh restore

# O reinicializar (perderás datos)
sudo rm /opt/gostore/data/gostore.db
sudo systemctl restart gostore
```

### Frontend no carga
```bash
# Verificar archivos estáticos
sudo ls -la /opt/gostore/static/

# Reconstruir frontend
./scripts/build-frontend.sh
sudo cp -r server/static/* /opt/gostore/static/
sudo systemctl restart gostore
```

### Logs útiles
```bash
# Logs del servicio
sudo journalctl -u gostore -f

# Logs del sistema
sudo tail -f /var/log/gostore/gostore.log

# Logs de systemd
sudo journalctl --since today

# Estado detallado del servicio
sudo systemctl status gostore -l
```

## 📦 Backup y Restauración

### Crear Backup Automático
```bash
sudo ./scripts/manage-gostore.sh backup
```

### Crear Backup Manual
```bash
# Backup de base de datos
sudo cp /opt/gostore/data/gostore.db ~/gostore_backup_$(date +%Y%m%d).db

# Backup completo
sudo tar -czf ~/gostore_full_backup_$(date +%Y%m%d).tar.gz /opt/gostore/ /etc/gostore/
```

### Restaurar Backup
```bash
# Usando el script
sudo ./scripts/manage-gostore.sh restore

# Manual
sudo systemctl stop gostore
sudo cp ~/gostore_backup_20240101.db /opt/gostore/data/gostore.db
sudo chown gostore:gostore /opt/gostore/data/gostore.db
sudo systemctl start gostore
```

## 🔄 Actualización

### Actualización Automática
```bash
# Desde el directorio del código fuente
sudo ./scripts/manage-gostore.sh update
```

### Actualización Manual
```bash
# 1. Crear backup
sudo ./scripts/manage-gostore.sh backup

# 2. Detener servicio
sudo systemctl stop gostore

# 3. Construir nueva versión
./scripts/build-backend.sh
./scripts/build-frontend.sh

# 4. Copiar archivos
sudo cp build/gostore-server /opt/gostore/bin/
sudo rm -rf /opt/gostore/static/*
sudo cp -r server/static/* /opt/gostore/static/

# 5. Reiniciar servicio
sudo systemctl start gostore
```

## 🗑️ Desinstalación

### Desinstalación Completa
```bash
# Detener y deshabilitar servicio
sudo systemctl stop gostore
sudo systemctl disable gostore

# Eliminar servicio
sudo rm /etc/systemd/system/gostore.service
sudo systemctl daemon-reload

# Eliminar archivos
sudo rm -rf /opt/gostore/
sudo rm -rf /etc/gostore/
sudo rm -rf /var/log/gostore/

# Eliminar usuario del sistema
sudo userdel -r gostore 2>/dev/null || true
sudo groupdel gostore 2>/dev/null || true

echo "GoStore completamente desinstalado"
```

### Desinstalación Conservando Datos
```bash
# Crear backup antes de desinstalar
sudo ./scripts/manage-gostore.sh backup

# Detener servicio pero conservar datos
sudo systemctl stop gostore
sudo systemctl disable gostore
sudo rm /etc/systemd/system/gostore.service

# Solo eliminar binarios (conserva configuración y datos)
sudo rm -rf /opt/gostore/bin/
sudo rm -rf /opt/gostore/static/
```

## 📞 Soporte

### Información del Sistema
```bash
sudo ./scripts/manage-gostore.sh info
sudo ./scripts/manage-gostore.sh health
```

### Comandos de Diagnóstico
```bash
# Verificar sistema
sudo systemctl status gostore
sudo journalctl -u gostore --no-pager -n 50

# Verificar red
sudo ss -tlnp | grep 8080
curl -I http://localhost:8080

# Verificar archivos
sudo ls -la /opt/gostore/
sudo ls -la /etc/gostore/
sudo du -sh /opt/gostore/
```

### Archivos de Log Importantes
- `/var/log/gostore/gostore.log` - Logs de la aplicación
- `sudo journalctl -u gostore` - Logs del servicio systemd
- `/var/log/syslog` - Logs del sistema

## 🎯 URLs de Acceso

Una vez instalado y funcionando:
- **Frontend Principal:** http://localhost:8080
- **API REST:** http://localhost:8080/api
- **Estado del API:** http://localhost:8080/api (JSON response)

## 📄 Licencia

Este proyecto está bajo la licencia especificada en el repositorio principal.

---

**¿Necesitas ayuda?** Revisa la sección de troubleshooting o crea un issue en el repositorio de GitHub. 