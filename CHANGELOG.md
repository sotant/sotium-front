# Changelog

Todos los cambios de este proyecto se documentarán en este archivo siguiendo el formato de [Keep a Changelog](https://keepachangelog.com/es-ES/1.1.0/).

## [Unreleased]

## [0.2.0] - 2026-02-25
### Added
- Flujo OIDC completo en el BFF con rutas `/api/auth/login`, `/api/auth/callback`, `/api/auth/logout` y `/api/bff/me`.
- Gestión de sesión cifrada en cookie HttpOnly para almacenar tokens de manera server-side.
- Refresh silencioso server-side del access token usando refresh token.
- Pantallas mínimas `/` y `/me` para login, visualización de identidad y logout.
- Documentación técnica del cambio en `docs/keycloak-bff-auth-mvp.md`.

### Changed
- Metadata de la aplicación para reflejar el propósito real del proyecto.
- Versionado del paquete de `0.1.0` a `0.2.0` siguiendo SemVer (MINOR).
