# Solución para Problemas de Codificación UTF-8 (Tildes)

## Problema
Las tildes y caracteres especiales se muestran como `??` (ejemplo: "P??del" en lugar de "Pádel").

## Solución

### Paso 1: Actualizar docker-compose.yaml
Ya está actualizado para usar `utf8mb4` por defecto. Reinicia los contenedores:

```powershell
docker-compose down
docker-compose up -d
```

### Paso 2: Convertir la base de datos existente

Si ya tienes datos, necesitas convertir la base de datos y las tablas:

```powershell
# Opción A: Importar el script SQL de conversión
Get-Content fix-utf8-database.sql | docker-compose exec -T db mysql -u root -pfiore instalacionesdep

# Opción B: Ejecutar comandos manualmente
docker-compose exec db mysql -u root -pfiore instalacionesdep -e "ALTER DATABASE instalacionesdep CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"
```

### Paso 3: Convertir todas las tablas

```powershell
# Ver todas las tablas
docker-compose exec db mysql -u root -pfiore instalacionesdep -e "SHOW TABLES;"

# Convertir cada tabla (ejemplo para instalaciones)
docker-compose exec db mysql -u root -pfiore instalacionesdep -e "ALTER TABLE instalaciones CONVERT TO CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"
```

### Paso 4: Reimportar los datos (si es necesario)

Si los datos ya están corruptos, elimina y vuelve a importar:

```powershell
# Eliminar y recrear
docker-compose exec db mysql -u root -pfiore -e "DROP DATABASE instalacionesdep; CREATE DATABASE instalacionesdep CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"

# Importar el SQL
Get-Content instalacionesdep.sql | docker-compose exec -T db mysql -u root -pfiore instalacionesdep
```

## Verificar la codificación

```powershell
# Verificar charset de la base de datos
docker-compose exec db mysql -u root -pfiore instalacionesdep -e "SELECT DEFAULT_CHARACTER_SET_NAME, DEFAULT_COLLATION_NAME FROM information_schema.SCHEMATA WHERE SCHEMA_NAME = 'instalacionesdep';"

# Verificar charset de una tabla
docker-compose exec db mysql -u root -pfiore instalacionesdep -e "SHOW CREATE TABLE instalaciones;"

# Ver datos con tildes
docker-compose exec db mysql -u root -pfiore instalacionesdep -e "SELECT nombre FROM instalaciones WHERE nombre LIKE '%á%' OR nombre LIKE '%é%' OR nombre LIKE '%í%' OR nombre LIKE '%ó%' OR nombre LIKE '%ú%';"
```

## Cambios realizados

1. ✅ `docker-compose.yaml`: Configurado MariaDB para usar utf8mb4 por defecto
2. ✅ `server/config/database.php`: Añadido `PDO::MYSQL_ATTR_INIT_COMMAND` para forzar utf8mb4 en la conexión
3. ✅ Script `fix-utf8-database.sql`: Para convertir tablas existentes

## Nota importante

Si los datos ya están guardados con codificación incorrecta, necesitarás:
1. Eliminar la base de datos
2. Recrearla con utf8mb4
3. Reimportar el SQL original (que debería tener los caracteres correctos)

