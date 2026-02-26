# Changelog

Todos los cambios de este proyecto se documentarán en este archivo siguiendo el formato de [Keep a Changelog](https://keepachangelog.com/es-ES/1.1.0/).

## [Unreleased]

## [0.1.0] - 2026-02-26
### Added
- Landing page inicial en `/` con cuatro secciones (`hero`, `features`, `documentation`, `pricing`) y contenido base.
- Componentes `LandingNavbar` y `LandingSection` en `src/components/landing`.
- Endpoint `GET /api/auth/login` en BFF para iniciar Authorization Code + PKCE con discovery OIDC.
- Helpers `oidcClient` y `oidcCookies` para encapsular discovery y manejo de cookies transitorias.
- Dependencia `openid-client` para discovery OIDC robusto y base de validaciones futuras.
- Endpoint `GET /api/auth/callback` para validar `state`, intercambiar `code` por tokens y redirigir a `/dashboard`.
- Helper `src/app/lib/auth/session.ts` para crear, leer y limpiar sesión BFF en cookie `httpOnly`.
- Protección de `/dashboard` y `/api/bff/*` con middleware basado en presencia de cookie `bff_session`.
- Endpoint BFF `GET /api/bff/me` que usa sesión httpOnly y consulta backend `/api/identity/me` con `Authorization: Bearer`.
- Página SSR `app/(protected)/dashboard/page.tsx` con consumo exclusivo de `/api/bff/me`.
- Componente `DashboardNavbar` y tipo compartido `IdentityMeDto`.
- Helper server `getBaseUrl()` para construir URL absoluta en Server Components.
- Endpoint `POST /api/auth/logout` para limpiar sesión BFF, limpiar cookies OIDC transitorias y redirigir al logout de Keycloak.
- Botón Logout funcional en el navbar de dashboard usando `<form method="post" action="/api/auth/logout">`.

### Changed
- Estilos globales para habilitar scroll suave y ajustar fondo/tipografía base.
- Metadatos de la aplicación para reflejar el proyecto Sotium.
