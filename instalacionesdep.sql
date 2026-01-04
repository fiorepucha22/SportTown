-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Servidor: 127.0.0.1
-- Tiempo de generación: 01-01-2026 a las 20:21:55
-- Versión del servidor: 10.4.32-MariaDB
-- Versión de PHP: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Base de datos: `instalacionesdep`
--

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `cache`
--

CREATE TABLE `cache` (
  `key` varchar(255) NOT NULL,
  `value` mediumtext NOT NULL,
  `expiration` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `cache_locks`
--

CREATE TABLE `cache_locks` (
  `key` varchar(255) NOT NULL,
  `owner` varchar(255) NOT NULL,
  `expiration` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `failed_jobs`
--

CREATE TABLE `failed_jobs` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `uuid` varchar(255) NOT NULL,
  `connection` text NOT NULL,
  `queue` text NOT NULL,
  `payload` longtext NOT NULL,
  `exception` longtext NOT NULL,
  `failed_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `instalaciones`
--

CREATE TABLE `instalaciones` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `nombre` varchar(255) NOT NULL,
  `tipo` varchar(255) NOT NULL,
  `descripcion` text DEFAULT NULL,
  `ubicacion` varchar(255) DEFAULT NULL,
  `precio_por_hora` decimal(8,2) NOT NULL,
  `imagen_url` varchar(255) DEFAULT NULL,
  `activa` tinyint(1) NOT NULL DEFAULT 1,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Volcado de datos para la tabla `instalaciones`
--

INSERT INTO `instalaciones` (`id`, `nombre`, `tipo`, `descripcion`, `ubicacion`, `precio_por_hora`, `imagen_url`, `activa`, `created_at`, `updated_at`) VALUES
(1, 'Pista de Pádel 1', 'padel', 'Pista cubierta con iluminación LED.', 'Zona Norte', 12.00, NULL, 1, '2025-12-29 13:48:42', '2025-12-29 13:48:42'),
(2, 'Pista de Pádel 2', 'padel', 'Pista exterior, perfecta para tardes.', 'Zona Norte', 10.00, NULL, 1, '2025-12-29 13:48:42', '2025-12-29 13:48:42'),
(3, 'Pista de Tenis Central', 'tenis', 'Superficie rápida, con grada.', 'Zona Centro', 15.00, NULL, 1, '2025-12-29 13:48:42', '2025-12-29 13:48:42'),
(4, 'Campo Fútbol Sala', 'futbol_sala', 'Pabellón climatizado, marcadores digitales.', 'Pabellón 1', 28.00, NULL, 1, '2025-12-29 13:48:42', '2025-12-29 13:48:42'),
(5, 'Piscina Cubierta', 'piscina', 'Calles de nado, vestuarios renovados.', 'Edificio Principal', 8.00, NULL, 1, '2025-12-29 13:48:42', '2025-12-29 13:48:42'),
(6, 'Gimnasio Funcional', 'gimnasio', 'Zona de fuerza, cardio y clases.', 'Planta 2', 6.50, NULL, 1, '2025-12-29 13:48:42', '2025-12-29 13:48:42');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `jobs`
--

CREATE TABLE `jobs` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `queue` varchar(255) NOT NULL,
  `payload` longtext NOT NULL,
  `attempts` tinyint(3) UNSIGNED NOT NULL,
  `reserved_at` int(10) UNSIGNED DEFAULT NULL,
  `available_at` int(10) UNSIGNED NOT NULL,
  `created_at` int(10) UNSIGNED NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `job_batches`
--

CREATE TABLE `job_batches` (
  `id` varchar(255) NOT NULL,
  `name` varchar(255) NOT NULL,
  `total_jobs` int(11) NOT NULL,
  `pending_jobs` int(11) NOT NULL,
  `failed_jobs` int(11) NOT NULL,
  `failed_job_ids` longtext NOT NULL,
  `options` mediumtext DEFAULT NULL,
  `cancelled_at` int(11) DEFAULT NULL,
  `created_at` int(11) NOT NULL,
  `finished_at` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `migrations`
--

CREATE TABLE `migrations` (
  `id` int(10) UNSIGNED NOT NULL,
  `migration` varchar(255) NOT NULL,
  `batch` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Volcado de datos para la tabla `migrations`
--

INSERT INTO `migrations` (`id`, `migration`, `batch`) VALUES
(1, '0001_01_01_000000_create_users_table', 1),
(2, '0001_01_01_000001_create_cache_table', 1),
(3, '0001_01_01_000002_create_jobs_table', 1),
(4, '2025_12_15_000003_add_api_token_to_users_table', 1),
(5, '2025_12_15_000004_create_instalaciones_table', 1),
(6, '2025_12_15_000005_create_reservas_table', 1),
(7, '2025_12_15_000006_create_torneos_table', 1),
(8, '2025_12_29_142609_add_is_admin_to_users_table', 1),
(9, '2025_12_29_145625_create_torneo_user_table', 2),
(10, '2025_12_30_150209_add_socio_fields_to_users_table', 3),
(11, '2025_12_30_150953_add_suscripcion_cancelada_to_users_table', 4);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `password_reset_tokens`
--

CREATE TABLE `password_reset_tokens` (
  `email` varchar(255) NOT NULL,
  `token` varchar(255) NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `reservas`
--

CREATE TABLE `reservas` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `instalacion_id` bigint(20) UNSIGNED NOT NULL,
  `user_id` bigint(20) UNSIGNED DEFAULT NULL,
  `fecha` date NOT NULL,
  `hora_inicio` time NOT NULL,
  `hora_fin` time NOT NULL,
  `precio_total` decimal(8,2) NOT NULL,
  `estado` varchar(255) NOT NULL DEFAULT 'pendiente',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `sessions`
--

CREATE TABLE `sessions` (
  `id` varchar(255) NOT NULL,
  `user_id` bigint(20) UNSIGNED DEFAULT NULL,
  `ip_address` varchar(45) DEFAULT NULL,
  `user_agent` text DEFAULT NULL,
  `payload` longtext NOT NULL,
  `last_activity` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `torneos`
--

CREATE TABLE `torneos` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `nombre` varchar(255) NOT NULL,
  `deporte` varchar(255) NOT NULL,
  `categoria` varchar(255) DEFAULT NULL,
  `fecha_inicio` date NOT NULL,
  `fecha_fin` date NOT NULL,
  `provincia` varchar(255) NOT NULL,
  `ciudad` varchar(255) NOT NULL,
  `sede` varchar(255) DEFAULT NULL,
  `descripcion` text DEFAULT NULL,
  `cupo` int(10) UNSIGNED NOT NULL DEFAULT 16,
  `inscritos` int(10) UNSIGNED NOT NULL DEFAULT 0,
  `estado` varchar(255) NOT NULL DEFAULT 'abierto',
  `activo` tinyint(1) NOT NULL DEFAULT 1,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Volcado de datos para la tabla `torneos`
--

INSERT INTO `torneos` (`id`, `nombre`, `deporte`, `categoria`, `fecha_inicio`, `fecha_fin`, `provincia`, `ciudad`, `sede`, `descripcion`, `cupo`, `inscritos`, `estado`, `activo`, `created_at`, `updated_at`) VALUES
(1, 'Open Pádel Valencia', 'padel', 'mixto', '2026-01-08', '2026-01-10', 'Valencia', 'València', 'Polideportivo Municipal', 'Torneo amateur abierto. Plazas limitadas.', 32, 12, 'abierto', 1, '2025-12-29 13:48:42', '2025-12-30 13:33:03'),
(2, 'Circuito Tenis Alicante', 'tenis', 'masculino', '2026-01-16', '2026-01-19', 'Alicante', 'Alicante', 'Club de Tenis Costa Blanca', 'Fase de grupos + eliminatorias. Nivel intermedio.', 24, 1, 'abierto', 1, '2025-12-29 13:48:42', '2025-12-29 14:12:34'),
(3, 'Liga Fútbol Sala Castellón', 'futbol_sala', 'mixto', '2026-01-05', '2026-02-07', 'Castellón', 'Castelló de la Plana', 'Pabellón Central', 'Liga por jornadas. Equipos de 10-12 jugadores.', 12, 0, 'abierto', 1, '2025-12-29 13:48:42', '2025-12-30 13:43:03'),
(4, 'Torneo Express Pádel (Alicante)', 'padel', 'femenino', '2026-01-01', '2026-01-01', 'Alicante', 'Elche', 'Centro Deportivo Elx', 'Formato rápido en un solo día. Premios para finalistas.', 16, 0, 'abierto', 1, '2025-12-29 13:48:42', '2025-12-30 13:43:05');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `torneo_user`
--

CREATE TABLE `torneo_user` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `torneo_id` bigint(20) UNSIGNED NOT NULL,
  `user_id` bigint(20) UNSIGNED NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `users`
--

CREATE TABLE `users` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `name` varchar(255) NOT NULL,
  `email` varchar(255) NOT NULL,
  `email_verified_at` timestamp NULL DEFAULT NULL,
  `password` varchar(255) NOT NULL,
  `remember_token` varchar(100) DEFAULT NULL,
  `api_token` varchar(80) DEFAULT NULL,
  `is_admin` tinyint(1) NOT NULL DEFAULT 0,
  `es_socio` tinyint(1) NOT NULL DEFAULT 0,
  `fecha_inicio_socio` date DEFAULT NULL,
  `fecha_fin_socio` date DEFAULT NULL,
  `suscripcion_cancelada` tinyint(1) NOT NULL DEFAULT 0,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Volcado de datos para la tabla `users`
--

INSERT INTO `users` (`id`, `name`, `email`, `email_verified_at`, `password`, `remember_token`, `api_token`, `is_admin`, `es_socio`, `fecha_inicio_socio`, `fecha_fin_socio`, `suscripcion_cancelada`, `created_at`, `updated_at`) VALUES
(2, 'Administrador', 'admin@sporttown.com', NULL, '$2y$12$2klU4S4BtpW3IfiVnMHcQe50.1SGanQfEV/s2KmX7m4G.H9ZuMVja', NULL, NULL, 1, 0, NULL, NULL, 0, '2025-12-29 13:48:42', '2026-01-01 18:16:31');

--
-- Índices para tablas volcadas
--

--
-- Indices de la tabla `cache`
--
ALTER TABLE `cache`
  ADD PRIMARY KEY (`key`);

--
-- Indices de la tabla `cache_locks`
--
ALTER TABLE `cache_locks`
  ADD PRIMARY KEY (`key`);

--
-- Indices de la tabla `failed_jobs`
--
ALTER TABLE `failed_jobs`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `failed_jobs_uuid_unique` (`uuid`);

--
-- Indices de la tabla `instalaciones`
--
ALTER TABLE `instalaciones`
  ADD PRIMARY KEY (`id`),
  ADD KEY `instalaciones_tipo_index` (`tipo`),
  ADD KEY `instalaciones_activa_index` (`activa`);

--
-- Indices de la tabla `jobs`
--
ALTER TABLE `jobs`
  ADD PRIMARY KEY (`id`),
  ADD KEY `jobs_queue_index` (`queue`);

--
-- Indices de la tabla `job_batches`
--
ALTER TABLE `job_batches`
  ADD PRIMARY KEY (`id`);

--
-- Indices de la tabla `migrations`
--
ALTER TABLE `migrations`
  ADD PRIMARY KEY (`id`);

--
-- Indices de la tabla `password_reset_tokens`
--
ALTER TABLE `password_reset_tokens`
  ADD PRIMARY KEY (`email`);

--
-- Indices de la tabla `reservas`
--
ALTER TABLE `reservas`
  ADD PRIMARY KEY (`id`),
  ADD KEY `reservas_user_id_foreign` (`user_id`),
  ADD KEY `reservas_instalacion_id_fecha_index` (`instalacion_id`,`fecha`),
  ADD KEY `reservas_estado_index` (`estado`);

--
-- Indices de la tabla `sessions`
--
ALTER TABLE `sessions`
  ADD PRIMARY KEY (`id`),
  ADD KEY `sessions_user_id_index` (`user_id`),
  ADD KEY `sessions_last_activity_index` (`last_activity`);

--
-- Indices de la tabla `torneos`
--
ALTER TABLE `torneos`
  ADD PRIMARY KEY (`id`),
  ADD KEY `torneos_deporte_index` (`deporte`),
  ADD KEY `torneos_categoria_index` (`categoria`),
  ADD KEY `torneos_fecha_inicio_index` (`fecha_inicio`),
  ADD KEY `torneos_fecha_fin_index` (`fecha_fin`),
  ADD KEY `torneos_provincia_index` (`provincia`),
  ADD KEY `torneos_ciudad_index` (`ciudad`),
  ADD KEY `torneos_estado_index` (`estado`),
  ADD KEY `torneos_activo_index` (`activo`);

--
-- Indices de la tabla `torneo_user`
--
ALTER TABLE `torneo_user`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `torneo_user_torneo_id_user_id_unique` (`torneo_id`,`user_id`),
  ADD KEY `torneo_user_user_id_foreign` (`user_id`);

--
-- Indices de la tabla `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `users_email_unique` (`email`),
  ADD UNIQUE KEY `users_api_token_unique` (`api_token`);

--
-- AUTO_INCREMENT de las tablas volcadas
--

--
-- AUTO_INCREMENT de la tabla `failed_jobs`
--
ALTER TABLE `failed_jobs`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `instalaciones`
--
ALTER TABLE `instalaciones`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT de la tabla `jobs`
--
ALTER TABLE `jobs`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `migrations`
--
ALTER TABLE `migrations`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=12;

--
-- AUTO_INCREMENT de la tabla `reservas`
--
ALTER TABLE `reservas`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT de la tabla `torneos`
--
ALTER TABLE `torneos`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT de la tabla `torneo_user`
--
ALTER TABLE `torneo_user`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=17;

--
-- AUTO_INCREMENT de la tabla `users`
--
ALTER TABLE `users`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- Restricciones para tablas volcadas
--

--
-- Filtros para la tabla `reservas`
--
ALTER TABLE `reservas`
  ADD CONSTRAINT `reservas_instalacion_id_foreign` FOREIGN KEY (`instalacion_id`) REFERENCES `instalaciones` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `reservas_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL;

--
-- Filtros para la tabla `torneo_user`
--
ALTER TABLE `torneo_user`
  ADD CONSTRAINT `torneo_user_torneo_id_foreign` FOREIGN KEY (`torneo_id`) REFERENCES `torneos` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `torneo_user_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
