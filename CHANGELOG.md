# Changelog

Todos los cambios de este proyecto se documentarán en este archivo siguiendo el formato de [Keep a Changelog](https://keepachangelog.com/es-ES/1.1.0/).

## [Unreleased]

## [0.1.5] - 2026-02-25

### Changed
- Flujo post-login actualizado para redirigir a `/dashboard` en lugar de `/me`.
- Home pública ahora redirige a `/dashboard` cuando detecta sesión activa.
- Se movió la vista protegida con datos de usuario y sidebar de logout a la nueva ruta `/dashboard`.

### Added
- Ruta de compatibilidad `/me` que redirige a `/dashboard` para evitar enlaces rotos.

## [0.1.4] - 2026-02-25

### Fixed
- Redirecciones post-login y de error de sesión ajustadas para usar el origen real de la request y evitar desalineación de host/cookies entre `localhost` y `127.0.0.1`.
- Flujo de sesión autenticada corregido para que el usuario llegue consistentemente a `/me` tras login cuando la cookie se emite en el mismo host.

### Changed
- Página `/me` marcada como dinámica (`force-dynamic`) para evitar evaluación estática temprana de variables de entorno durante build.

## [0.1.3] - 2026-02-25

### Changed
- Home `/` ahora funciona como entrada pública estricta y redirige automáticamente a `/me` cuando existe sesión activa.
- Página protegida `/me` rediseñada con barra lateral izquierda (base de menú futuro) con opción `Logout`.
- Vista de `/me` enfocada en mostrar los datos de identidad obtenidos desde backend a través de `/api/bff/me`.

## [0.1.2] - 2026-02-25

### Added
- Flujo completo de autenticación OIDC en BFF: login con PKCE/state/nonce, callback con intercambio de código y logout con RP-Initiated Logout.
- Endpoint BFF `GET /api/bff/me` que usa sesión server-side, hace refresh de token silencioso y consume `GET /api/identity/me` en backend.
- Página protegida `/me` que muestra la respuesta de identidad vía BFF y expone logout.
- Utilidades server-side para cifrado de cookies, manejo de sesión, PKCE, endpoints OIDC y consumo del backend.
- Variables de entorno de referencia para Keycloak, backend y sesión en `.env.example`.
- Documentación técnica en `/docs/keycloak-bff-flow.md`.

### Changed
- Home `/` ahora distingue entre visitante sin sesión y usuario autenticado con acceso directo a `/me`.
- Navbar pública actualizada para mostrar botón `Login` o `Logout` según estado de sesión.

### Removed
- Scaffold inicial de autenticación sin intercambio real de tokens.

## [0.1.1] - 2026-02-25

### Added
- Landing page pública en `/` con navegación fija, scroll suave y secciones de Inicio, Características, Precio y FAQ.
- Componente reutilizable de navbar con acceso directo al flujo de autenticación del BFF en `/api/auth/login`.
- Route Handlers del BFF para inicio de login OAuth2/OIDC y callback de autorización en `/app/api/auth/**`.
- Utilidad de configuración y construcción segura de URL de autorización de Keycloak desde variables de entorno.
- Documento técnico en `/docs` describiendo el cambio, motivación e impacto arquitectónico.

### Changed
- Metadatos base y estilos globales para reflejar el branding inicial SaaS y comportamiento de scroll suave.
