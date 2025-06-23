#!/bin/bash

echo "🚀 Iniciando servicios de PDF..."

# Detener contenedores existentes si los hay
echo "🛑 Deteniendo contenedores existentes..."
docker compose down

# Construir e iniciar los contenedores
echo "🔨 Construyendo e iniciando contenedores..."
docker compose up -d

# Esperar un momento para que los servicios estén listos
echo "⏳ Esperando que los servicios estén listos..."
sleep 5

# Verificar que los servicios estén funcionando
echo "🔍 Verificando servicios..."

# Verificar que el contenedor wkhtmltopdf esté funcionando
if docker ps | grep -q "wkhtmltopdf-service"; then
    echo "✅ wkhtmltopdf está funcionando"
else
    echo "❌ wkhtmltopdf no está funcionando"
fi

# Verificar que el contenedor pdfcpu esté funcionando
if docker ps | grep -q "pdfcpu-service"; then
    echo "✅ pdfcpu está funcionando"
else
    echo "❌ pdfcpu no está funcionando"
fi

echo "🎉 Servicios de PDF iniciados correctamente!"
echo ""
echo "📋 Información de los servicios:"
echo "   - wkhtmltopdf: Contenedor ejecutándose (sin puerto expuesto)"
echo "   - pdfcpu: Contenedor ejecutándose (sin puerto expuesto)"
echo ""
echo "💡 Para detener los servicios, ejecuta: docker compose down" 