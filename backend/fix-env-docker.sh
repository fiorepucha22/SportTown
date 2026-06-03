#!/bin/sh
# Solo desarrollo con Docker Compose. En producción usar DB_HOST=127.0.0.1

ENV_FILE="./backend/.env"

if [ ! -f "$ENV_FILE" ]; then
    echo "Error: No se encontró $ENV_FILE (copia .env.example primero)"
    exit 1
fi

echo "Actualizando .env para Docker (desarrollo)..."

sed -i 's/^DB_HOST=.*/DB_HOST=db/' "$ENV_FILE"
sed -i 's/^APP_ENV=.*/APP_ENV=local/' "$ENV_FILE"
sed -i 's/^APP_DEBUG=.*/APP_DEBUG=true/' "$ENV_FILE"

echo "Listo. Producción en VPS: DB_HOST=127.0.0.1, APP_ENV=production, APP_DEBUG=false"
