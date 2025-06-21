# Configuración de Variables de Entorno

## Nombre de la Aplicación

Para configurar el nombre de la aplicación, crea un archivo `.env` en el directorio `client/` con el siguiente contenido:

```env
VITE_APP_NAME=TuNombreDeAplicacion
```

### Ejemplo:
```env
VITE_APP_NAME=MiTienda
```

### Notas:
- El nombre por defecto es "GoStore" si no se especifica la variable de entorno
- Las variables de entorno en Vite deben comenzar con `VITE_` para ser accesibles en el código del cliente
- Reinicia el servidor de desarrollo después de crear o modificar el archivo `.env` 