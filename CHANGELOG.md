# Changelog

Todos los cambios de este proyecto se documentarán en este archivo siguiendo el formato de [Keep a Changelog](https://keepachangelog.com/es-ES/1.1.0/).

## [Unreleased]

## [0.2.0] - 2026-02-25

### Added
- Flujo OIDC completo con Keycloak en el BFF: login con PKCE, callback, sesión y logout RP-Initiated.
- Endpoint BFF `/api/bff/me` que aplica refresh server-side y delega en backend `/api/identity/me` usando bearer token.
- UI mínima en `/` y `/me` para estado autenticado/no autenticado, visualización de identidad y acciones de login/logout.
- Documentación técnica del cambio en `docs/bff-keycloak-login-logout.md`.
- Archivo `.env.example` con variables requeridas para entorno local.
