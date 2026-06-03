# Importar instalacionesdep.sql a la Base de Datos Docker

## Método 1: Importación Directa (Recomendado)

Desde la raíz del proyecto, ejecuta:

```bash
docker-compose exec -T db mysql -u root -pfiore instalacionesdep < instalacionesdep.sql
```

O si prefieres que te pida la contraseña:

```bash
docker-compose exec -T db mysql -u root -p instalacionesdep < instalacionesdep.sql
# Cuando te pida la contraseña, escribe: fiore
```

## Método 2: Copiar el archivo al contenedor primero

1. **Copiar el archivo al contenedor:**
   ```bash
   docker cp instalacionesdep.sql $(docker-compose ps -q db):/tmp/instalacionesdep.sql
   ```

2. **Importar desde dentro del contenedor:**
   ```bash
   docker-compose exec db mysql -u root -pfiore instalacionesdep < /tmp/instalacionesdep.sql
   ```

   O entrando al contenedor:
   ```bash
   docker-compose exec db bash
   mysql -u root -pfiore instalacionesdep < /tmp/instalacionesdep.sql
   exit
   ```

## Método 3: Desde dentro del contenedor (si ya estás dentro)

Si ya estás dentro del contenedor (`docker-compose exec db bash`):

1. **Copiar el archivo primero** (desde otra terminal):
   ```bash
   docker cp instalacionesdep.sql $(docker-compose ps -q db):/tmp/
   ```

2. **Dentro del contenedor, importar:**
   ```bash
   mysql -u root -pfiore instalacionesdep < /tmp/instalacionesdep.sql
   ```

## Método 4: Usando un volumen temporal

Puedes modificar `docker-compose.yaml` para montar el archivo SQL:

```yaml
db:
  volumes:
    - db_data:/var/lib/mysql
    - ./instalacionesdep.sql:/tmp/instalacionesdep.sql  # Añadir esta línea
```

Luego importar:
```bash
docker-compose exec db mysql -u root -pfiore instalacionesdep < /tmp/instalacionesdep.sql
```

## Verificar la importación

Después de importar, verifica que las tablas se hayan creado:

```bash
docker-compose exec db mysql -u root -pfiore instalacionesdep -e "SHOW TABLES;"
```

O ver el contenido de una tabla:

```bash
docker-compose exec db mysql -u root -pfiore instalacionesdep -e "SELECT COUNT(*) FROM users;"
```

## ⚠️ Nota Importante

Si ya tienes tablas creadas por las migraciones de Laravel, el archivo SQL podría intentar crear las mismas tablas y causar errores. En ese caso:

1. **Opción A:** Eliminar las tablas existentes primero:
   ```bash
   docker-compose exec db mysql -u root -pfiore instalacionesdep -e "DROP DATABASE instalacionesdep; CREATE DATABASE instalacionesdep;"
   docker-compose exec -T db mysql -u root -pfiore instalacionesdep < instalacionesdep.sql
   ```

2. **Opción B:** Importar solo los datos (si el SQL tiene INSERT):
   - Edita el SQL para eliminar los CREATE TABLE
   - O usa `--force` para ignorar errores:
   ```bash
   docker-compose exec -T db mysql -u root -pfiore instalacionesdep --force < instalacionesdep.sql
   ```

