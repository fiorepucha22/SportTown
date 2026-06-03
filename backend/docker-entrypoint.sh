#!/bin/sh
# Solo desarrollo Docker — en producción usar Nginx + PHP-FPM (ver DESPLIEGUE_VPS.md)
set -e

echo "Esperando a la base de datos..."
until nc -z "$DB_HOST" "$DB_PORT"; do
  sleep 1
done

echo "Base de datos disponible"

php artisan key:generate --force || true
php artisan migrate || true

exec php artisan serve --host=0.0.0.0 --port=8000


