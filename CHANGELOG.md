# Changelog

Todos los cambios de este proyecto se documentarán en este archivo siguiendo el formato de [Keep a Changelog](https://keepachangelog.com/es-ES/1.1.0/).

## [Unreleased]

## [0.2.1] - 2026-02-25

### Fixed
- Se reemplazó el almacenamiento de tokens en cookie por una sesión server-side en memoria con cookie HttpOnly de `session_id`, evitando pérdida de sesión por límite de tamaño de cookie durante el callback OIDC.
- Se mantuvo la cookie transitoria OIDC cifrada para `state`, `nonce` y `code_verifier` y se preservaron los flags de seguridad (`HttpOnly`, `SameSite=Lax`, `Secure` por entorno).

## [0.2.0] - 2026-02-25

### Added
- Flujo OIDC completo con Keycloak en el BFF: login con PKCE, callback, sesión y logout RP-Initiated.
- Endpoint BFF `/api/bff/me` que aplica refresh server-side y delega en backend `/api/identity/me` usando bearer token.
- UI mínima en `/` y `/me` para estado autenticado/no autenticado, visualización de identidad y acciones de login/logout.
- Documentación técnica del cambio en `docs/bff-keycloak-login-logout.md`.
- Archivo `.env.example` con variables requeridas para entorno local.
