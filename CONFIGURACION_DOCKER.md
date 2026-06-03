# Configuración de .env para Docker

## ⚠️ Problema Actual

Tu archivo `server/.env` está configurado para desarrollo local sin Docker. Necesitas actualizarlo para que funcione con Docker.

## 🔧 Solución Rápida

Edita el archivo `server/.env` y cambia estas líneas:

### ANTES (incorrecto para Docker):
```env
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PASSWORD=
```

### DESPUÉS (correcto para Docker):
```env
DB_CONNECTION=mariadb
DB_HOST=db
DB_PASSWORD=fiore
```

## 📝 Configuración Completa para Docker

Asegúrate de que tu `server/.env` tenga estas líneas de base de datos:

```env
DB_CONNECTION=mariadb
DB_HOST=db
DB_PORT=3306
DB_DATABASE=instalacionesdep
DB_USERNAME=root
DB_PASSWORD=fiore
```

## 🚀 Pasos para Aplicar los Cambios

1. **Edita `server/.env`** y actualiza las líneas de base de datos como se muestra arriba

2. **Reinicia los contenedores:**
   ```bash
   docker-compose down
   docker-compose up --build
   ```

3. **Verifica que funcione:**
   - Frontend: http://localhost:3000
   - Backend: http://localhost:8000

## 🔍 ¿Por qué `DB_HOST=db`?

En Docker Compose, los servicios se comunican usando los **nombres de los servicios** definidos en `docker-compose.yaml`. 

- El servicio de base de datos se llama `db` en tu `docker-compose.yaml`
- Por lo tanto, Laravel debe conectarse a `db` (no a `127.0.0.1` o `localhost`)
- Docker resuelve automáticamente `db` al contenedor correcto

## 📋 Script Automático (Opcional)

Si estás en Linux/Mac, puedes usar el script `server/fix-env-docker.sh`:

```bash
chmod +x server/fix-env-docker.sh
./server/fix-env-docker.sh
```

## ⚡ Nota Importante

Aunque `docker-compose.yaml` define variables de entorno, Laravel lee primero el archivo `.env`, y esas variables tienen prioridad. Por eso es importante actualizar el `.env` directamente.

