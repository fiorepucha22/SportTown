#!/bin/bash

# Script para actualizar .env para Docker
ENV_FILE="./server/.env"

if [ ! -f "$ENV_FILE" ]; then
    echo "Error: No se encontró el archivo .env en ./server/.env"
    exit 1
fi

echo "Actualizando .env para Docker..."

# Actualizar DB_CONNECTION
sed -i 's/^DB_CONNECTION=.*/DB_CONNECTION=mariadb/' "$ENV_FILE"

# Actualizar DB_HOST
sed -i 's/^DB_HOST=.*/DB_HOST=db/' "$ENV_FILE"

# Actualizar DB_PASSWORD
sed -i 's/^DB_PASSWORD=.*/DB_PASSWORD=fiore/' "$ENV_FILE"

# Asegurar que DB_DATABASE esté correcto
sed -i 's/^DB_DATABASE=.*/DB_DATABASE=instalacionesdep/' "$ENV_FILE"

# Asegurar que DB_USERNAME esté correcto
sed -i 's/^DB_USERNAME=.*/DB_USERNAME=root/' "$ENV_FILE"

echo "✅ .env actualizado correctamente para Docker"
echo ""
echo "Verifica que estas líneas estén correctas:"
grep "^DB_" "$ENV_FILE"

