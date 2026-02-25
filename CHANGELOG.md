# Changelog

Todos los cambios de este proyecto se documentarán en este archivo siguiendo el formato de [Keep a Changelog](https://keepachangelog.com/es-ES/1.1.0/) y este proyecto adhiere a [Semantic Versioning](https://semver.org/lang/es/).

## [Unreleased]

## [0.1.1] - 2026-02-25
### Added
- Landing pública de una sola página en `/` con secciones Inicio, Características, Precio y FAQ.
- Componente reutilizable de navbar fija con enlaces de scroll y botón **ACCESO** hacia `/api/auth/login`.
- Route Handler `GET /api/auth/login` que construye y redirige al flujo de autorización de Keycloak con variables de entorno.
- Route Handler `GET /api/auth/callback` preparado para recibir `code` y `state`, con marcadores para intercambio seguro de tokens.
- Documentación técnica del cambio en `docs/saas-foundation-landing-and-bff.md`.

### Changed
- Estilos globales para habilitar scroll suave y base visual alineada con la landing.
- Metadatos de aplicación en `layout.tsx` con información del producto.

[Unreleased]: https://github.com/example/sotium-front/compare/v0.1.1...HEAD
[0.1.1]: https://github.com/example/sotium-front/releases/tag/v0.1.1
