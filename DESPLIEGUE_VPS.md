# Informe de despliegue — Eventixs (React + Laravel) en VPS Ubuntu

Proyecto preparado para **Nginx + PHP 8.3-FPM + MySQL** en producción. Docker queda limitado a **desarrollo local** (`docker-compose.yaml`).

---

## 1. Archivos modificados

| Archivo | Cambio |
|---------|--------|
| `backend/.env.example` | Plantilla producción: `APP_ENV=production`, `APP_DEBUG=false`, `APP_URL=https://eventixs.es`, `DB_HOST=127.0.0.1`, MySQL, CORS |
| `backend/config/cors.php` | Orígenes desde `CORS_ALLOWED_ORIGINS` o `APP_URL` en producción; localhost en local |
| `backend/bootstrap/app.php` | `trustProxies` para HTTPS detrás de Nginx |
| `backend/fix-env-docker.sh` | Ruta `backend/.env`; solo dev Docker |
| `web/src/lib/api.ts` | Prefijo opcional `VITE_API_URL`; rutas relativas `/api` por defecto |
| `web/vite.config.ts` | `build.outDir: 'dist'`, proxy dev configurable |
| `web/env.example` | `VITE_API_URL` vacío en producción |
| `web/package.json` | `dev:server` apunta a `../backend` (artisan serve) |
| `web/nginx.conf` | Docker: proxy a servicio `api` (no `server`) |
| `docker-compose.yaml` | Servicios `api`/`frontend`, rutas `backend`/`web`, comentario solo-dev |
| `deploy/nginx-eventixs.conf.example` | **Nuevo** — plantilla Nginx producción |
| `DESPLIEGUE_VPS.md` | **Nuevo** — este informe |

### Archivos sin cambios relevantes (ya correctos)

- **`web/src/**`**: las peticiones ya usaban rutas relativas (`/api/...`); no había URLs hardcodeadas a localhost en el código fuente.
- **`backend/config/database.php`**: default `DB_HOST` ya era `127.0.0.1`.

### Docker (solo desarrollo, no producción)

- `backend/Dockerfile`, `backend/docker-entrypoint.sh`, `web/Dockerfile` — siguen usando `artisan serve` dentro del contenedor; **no usarlos en el VPS**.

---

## 2. Variables de entorno necesarias

### Backend — `backend/.env` (copiar desde `backend/.env.example`)

| Variable | Producción (VPS) |
|----------|------------------|
| `APP_KEY` | Generar con `php artisan key:generate` |
| `APP_ENV` | `production` |
| `APP_DEBUG` | `false` |
| `APP_URL` | `https://eventixs.es` |
| `DB_CONNECTION` | `mysql` |
| `DB_HOST` | `127.0.0.1` (**no** `db`) |
| `DB_PORT` | `3306` |
| `DB_DATABASE` | `instalacionesdep` (o el nombre creado en MySQL) |
| `DB_USERNAME` | Usuario MySQL del VPS |
| `DB_PASSWORD` | Contraseña MySQL |
| `DB_CHARSET` | `utf8mb4` |
| `DB_COLLATION` | `utf8mb4_unicode_ci` |
| `CORS_ALLOWED_ORIGINS` | `https://eventixs.es,https://www.eventixs.es` |
| `LOG_LEVEL` | `error` (recomendado) |

### Frontend — build en el VPS

| Variable | Producción |
|----------|------------|
| `VITE_API_URL` | **Vacío** o no definir (peticiones a `/api` en el mismo dominio) |

### Desarrollo local (opcional)

| Variable | Uso |
|----------|-----|
| `VITE_API_URL` | Vacío + proxy Vite, o `http://127.0.0.1:8000` sin proxy |
| `VITE_DEV_PROXY_TARGET` | Target del proxy Vite (default `http://127.0.0.1:8000`) |
| `DB_HOST=db` | Solo con `docker compose up` |

---

## 3. Posibles problemas en el despliegue

1. **`APP_KEY` vacío** — Laravel no arrancará correctamente; ejecutar `php artisan key:generate` una vez.
2. **Permisos** — `storage/` y `bootstrap/cache/` deben ser escribibles por `www-data`:
   `chown -R www-data:www-data storage bootstrap/cache && chmod -R 775 storage bootstrap/cache`
3. **MySQL / UTF-8** — Importar `instalacionesdep.sql` con charset `utf8mb4` (ver `fix-utf8-database.sql` si hay caracteres corruptos).
4. **HTTPS y URLs** — Sin `trustProxies` (ya añadido) Laravel podría generar URLs `http://`. Certificado SSL con Certbot recomendado.
5. **CORS** — Con frontend y API en `https://eventixs.es/api` **mismo origen**, el navegador no aplica CORS. Los orígenes configurados cubren `www` y entornos cruzados.
6. **`dist` no versionado** — Hay que ejecutar `npm run build` en el servidor o en CI y desplegar `web/dist`.
7. **Migraciones** — Si la BD viene del SQL dump, revisar si hace falta `php artisan migrate --force` sin duplicar tablas.
8. **Cola de trabajos** — `QUEUE_CONNECTION=database` implica ejecutar `php artisan queue:work` como servicio systemd si usas jobs.
9. **PHP 8.3 vs Dockerfile** — El Dockerfile de dev usa PHP 8.4-cli; en VPS usar **8.3-FPM** como indicaste.
10. **Rutas Nginx `/api`** — Debe pasar siempre por `backend/public/index.php`; usar la plantilla en `deploy/nginx-eventixs.conf.example`.
11. **Documentación antigua** — `CONFIGURACION_DOCKER.md`, `IMPORTAR_SQL.md` y `FIX_UTF8.md` siguen mencionando `server/`/`client/` y Docker; usar rutas `backend/` y `web/` y este documento para producción.

---

## 4. Comandos para producción (VPS Ubuntu)

Suponiendo el proyecto en `/var/www/eventixs`:

```bash
# 1. Código
cd /var/www/eventixs
git pull   # o subir archivos por rsync/scp

# 2. Backend Laravel
cd backend
cp .env.example .env
# Editar .env con credenciales MySQL reales y APP_KEY
nano .env

composer install --no-dev --optimize-autoloader
php artisan key:generate
php artisan migrate --force
php artisan config:cache
php artisan route:cache
php artisan view:cache

sudo chown -R www-data:www-data storage bootstrap/cache
sudo chmod -R 775 storage bootstrap/cache

# 3. Frontend React
cd ../web
npm ci
npm run build
# Salida en web/dist

# 4. Base de datos (si aún no está importada)
mysql -u USUARIO -p instalacionesdep < /var/www/eventixs/instalacionesdep.sql

# 5. Nginx
sudo cp /var/www/eventixs/deploy/nginx-eventixs.conf.example /etc/nginx/sites-available/eventixs
# Ajustar rutas y SSL en el archivo
sudo ln -sf /etc/nginx/sites-available/eventixs /etc/nginx/sites-enabled/
sudo nginx -t && sudo systemctl reload nginx

# 6. SSL (Let's Encrypt)
sudo certbot --nginx -d eventixs.es -d www.eventixs.es
```

### Verificación rápida

```bash
curl -s https://eventixs.es/api/ping
# Esperado: {"ok":true,"message":"pong",...}
```

### Desarrollo local (sin VPS)

```bash
# Terminal 1 — Laravel
cd backend && php artisan serve

# Terminal 2 — React (proxy /api → :8000)
cd web && npm run dev
```

### Docker (solo dev)

```bash
docker compose up --build
# Frontend: http://localhost:3000 — API proxy interno al servicio api:8000
```

---

## 5. Arquitectura en producción

```text
Usuario → Nginx (443)
            ├── /        → web/dist (React SPA)
            └── /api/*   → PHP-FPM → backend/public/index.php (Laravel)
MySQL ← 127.0.0.1:3306 ← Laravel (.env DB_HOST=127.0.0.1)
```

No se usa `docker-compose`, `artisan serve`, ni hostnames `db` / `server` en producción.
