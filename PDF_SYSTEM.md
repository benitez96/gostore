# Sistema de Generación de PDFs

Este sistema permite generar comprobantes de pago en PDF de forma segura usando contenedores Docker aislados.

## Arquitectura

```
[ App Go (Local) ]
    ↳ genera HTML → ejecuta wkhtmltopdf (contenedor efímero)
    ↳ sirve el PDF final al cliente
```

### Contenedores

- **wkhtmltopdf**: Convierte HTML a PDF
  - Imagen: `gostore-wkhtmltopdf` (Debian + wkhtmltopdf)
  - Ejecución: Contenedor efímero (`docker run --rm`)
  - Seguridad: Usuario sin privilegios, sin red, solo acceso a /tmp
  - Flags soportados: `--disable-javascript`, `--disable-local-file-access`

## Instalación y Uso

### 1. Construir la imagen de wkhtmltopdf

```bash
docker compose build wkhtmltopdf
```

### 2. Usar el endpoint de generación

```bash
curl -X POST http://localhost:8080/api/pdf/generate-receipt \
  -H "Content-Type: application/json" \
  -d '{"payment_id": "1"}' \
  --output comprobante.pdf
```

## Endpoints

### POST /api/pdf/generate-receipt

Genera un comprobante de pago en PDF.

**Request:**
```json
{
  "payment_id": "1"
}
```

**Response:**
- Content-Type: `application/pdf`
- Archivo PDF descargable

## Seguridad

- **Contenedor efímero**: Se crea y destruye automáticamente
- **Usuario sin privilegios**: Ejecuta como usuario 1000:1000
- **Sin acceso a red**: `--network none`
- **JavaScript deshabilitado**: `--disable-javascript`
- **Sin acceso a archivos locales**: `--disable-local-file-access`
- **Archivos temporales**: Solo en `/tmp` del host

## Desarrollo

### Estructura de archivos

```
server/
├── internal/
│   └── services/
│       └── pdf/
│           └── service.go          # Servicio principal
└── cmd/
    └── api/
        └── handlers/
            └── pdf/
                ├── handler.go      # Handler principal
                └── generate_receipt.go  # Endpoint de generación

docker/
└── wkhtmltopdf/
    └── Dockerfile                  # Imagen de wkhtmltopdf
```

### Personalización

Para modificar el template del comprobante, edita la función `generateHTML` en `service.go`.

### Agregar nuevos tipos de PDF

1. Crear nueva función en `service.go`
2. Agregar nuevo handler en `cmd/api/handlers/pdf/`
3. Registrar la ruta en `main.go`

## Troubleshooting

### wkhtmltopdf no funciona

```bash
# Verificar que la imagen esté construida
docker images | grep gostore-wkhtmltopdf

# Reconstruir la imagen
docker compose build wkhtmltopdf
```

### Error de permisos

```bash
# Verificar que el directorio /tmp tenga permisos correctos
ls -la /tmp
```

### Error de docker run

```bash
# Verificar que docker esté instalado y funcionando
docker --version

# Probar el comando manualmente
docker run --rm -v /tmp:/tmp --user 1000:1000 --network none gostore-wkhtmltopdf wkhtmltopdf --help
``` 