# Changelog

Todos los cambios de este proyecto se documentarán en este archivo siguiendo el formato de [Keep a Changelog](https://keepachangelog.com/es-ES/1.1.0/).

## [Unreleased]

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
