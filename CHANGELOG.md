# Changelog

Todos los cambios de este proyecto se documentarán en este archivo siguiendo el formato de [Keep a Changelog](https://keepachangelog.com/es-ES/1.1.0/).

## [Unreleased]

## [0.1.1] - 2026-02-25

### Added
- Landing page pública en `/` con navegación fija, scroll suave y secciones de Inicio, Características, Precio y FAQ.
- Componente reutilizable de navbar con acceso directo al flujo de autenticación del BFF en `/api/auth/login`.
- Route Handlers del BFF para inicio de login OAuth2/OIDC y callback de autorización en `/app/api/auth/**`.
- Utilidad de configuración y construcción segura de URL de autorización de Keycloak desde variables de entorno.
- Documento técnico en `/docs` describiendo el cambio, motivación e impacto arquitectónico.

### Changed
- Metadatos base y estilos globales para reflejar el branding inicial SaaS y comportamiento de scroll suave.
