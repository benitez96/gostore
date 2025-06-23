FROM debian:bookworm-slim

# Instalar wkhtmltopdf y dependencias
RUN apt-get update && apt-get install -y \
    wkhtmltopdf \
    fonts-freefont-ttf \
    && rm -rf /var/lib/apt/lists/*

# Crear usuario sin privilegios
RUN groupadd -g 1000 appuser && \
    useradd -u 1000 -g appuser -s /bin/bash -m appuser

# Configurar variable de entorno para eliminar warning
ENV XDG_RUNTIME_DIR=/tmp/runtime-appuser

USER appuser

WORKDIR /tmp 