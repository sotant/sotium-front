# Changelog

Todos los cambios de este proyecto se documentarán en este archivo siguiendo el formato de [Keep a Changelog](https://keepachangelog.com/es-ES/1.1.0/).

## [Unreleased]

## [0.1.11] - 2026-02-26
### Fixed
- Dashboard SSR ahora reenvía explícitamente el header `cookie` al consumir `/api/bff/me`, evitando respuestas `401` por falta de `bff_session` en la llamada interna server-to-server.

### Changed
- Versionado del proyecto a `0.1.11`.
- Documentación de dashboard actualizada con el diagnóstico de la incidencia de cookies en SSR.

## [0.1.10] - 2026-02-26
### Added
- Protección de `/dashboard` y `/api/bff/*` con middleware basado en presencia de cookie `bff_session`.
- Endpoint BFF `GET /api/bff/me` que usa sesión httpOnly y consulta backend `/api/identity/me` con `Authorization: Bearer`.
- Página SSR `app/(protected)/dashboard/page.tsx` con consumo exclusivo de `/api/bff/me`.
- Componente `DashboardNavbar` y tipo compartido `IdentityMeDto`.
- Helper server `getBaseUrl()` para construir URL absoluta en Server Components.
- Documentación técnica en `docs/dashboard-and-me.md`.

### Changed
- Versionado del proyecto a `0.1.10`.

## [0.1.9] - 2026-02-26
### Fixed
- Reversión de la estrategia híbrida público/confidencial en callback OIDC.
- `KEYCLOAK_CLIENT_SECRET` ahora se valida y centraliza en `app/lib/auth/oidcClient.ts`.
- El callback usa siempre `client_secret_basic`, alineado con comunicación confidencial hacia Keycloak.

### Changed
- Versionado del proyecto a `0.1.9`.
- Documentación del callback actualizada para reflejar modo confidencial obligatorio.

## [0.1.8] - 2026-02-26
### Fixed
- Corrección en `GET /api/auth/callback`: selección explícita del método de autenticación del cliente OIDC para soportar clientes públicos (`token_endpoint_auth_method=none`) y confidenciales (`client_secret_basic` con `KEYCLOAK_CLIENT_SECRET`).
- Se evita el error `client_secret_basic client authentication method requires a client_secret` en el intercambio de tokens.

### Changed
- Versionado del proyecto a `0.1.8`.
- Documentación del callback actualizada con guía de configuración público/confidencial en Keycloak.

## [0.1.7] - 2026-02-26
### Fixed
- Corrección en `GET /api/auth/callback`: ahora se reenvía el parámetro `iss` (cuando llega desde Keycloak) a `client.callback(...)`, evitando el error `RPError: iss missing from the response`.

### Changed
- Versionado del proyecto a `0.1.7`.
- Documentación del callback actualizada con diagnóstico de la validación de `iss`.

## [0.1.6] - 2026-02-26
### Fixed
- Corrección en `GET /api/auth/callback`: `openid-client` ahora recibe `state` en el objeto `checks` durante `client.callback(...)`, evitando el error `TypeError: checks.state argument is missing`.

### Changed
- Versionado del proyecto a `0.1.6`.
- Documentación del callback actualizada con diagnóstico de la incidencia.

## [0.1.5] - 2026-02-26
### Added
- Endpoint `GET /api/auth/callback` para validar `state`, intercambiar `code` por tokens y redirigir a `/dashboard`.
- Helper `src/app/lib/auth/session.ts` para crear, leer y limpiar sesión BFF en cookie `httpOnly`.
- Documentación del paso de callback OIDC en `docs/oidc-login-step-2-callback.md`.

### Changed
- Versionado del proyecto a `0.1.5`.

## [0.1.4] - 2026-02-26
### Fixed
- Reversión del fallback de discovery OIDC para volver al uso directo de `openid-client`, ya que la dependencia fue instalada correctamente en el entorno.

### Changed
- Versionado del proyecto a `0.1.4`.
- Documentación de OIDC actualizada para reflejar que el discovery depende de `openid-client`.

## [0.1.3] - 2026-02-26
### Fixed
- Error de build `Module not found: Can't resolve 'openid-client'` al iniciar el flujo de login.
- Helper de discovery OIDC ahora prioriza `openid-client` y usa fallback estándar `.well-known/openid-configuration` en entornos locales con instalación incompleta.

### Changed
- Versionado del proyecto a `0.1.3`.
- Documentación de OIDC actualizada para incluir el comportamiento de fallback y diagnóstico del error.

## [0.1.2] - 2026-02-26
### Added
- Endpoint `GET /api/auth/login` en BFF para iniciar Authorization Code + PKCE con discovery OIDC.
- Helpers `oidcClient` y `oidcCookies` para encapsular discovery y manejo de cookies transitorias.
- Documentación técnica de este paso en `docs/oidc-login-step-1.md`.
- Dependencia `openid-client` para discovery OIDC robusto y base de validaciones futuras.

### Changed
- Versionado del proyecto a `0.1.2`.

## [0.1.1] - 2026-02-26
### Added
- Landing page inicial en `/` con cuatro secciones (`hero`, `features`, `documentation`, `pricing`) y contenido base.
- Componentes `LandingNavbar` y `LandingSection` en `src/components/landing`.
- Documentación del cambio en `docs/task-1-frontend-bootstrap.md`.
- Carpeta `src/lib` inicial con `.gitkeep` para mantener estructura base.

### Changed
- Estilos globales para habilitar scroll suave y ajustar fondo/tipografía base.
- Metadatos de la aplicación para reflejar el proyecto Sotium.
