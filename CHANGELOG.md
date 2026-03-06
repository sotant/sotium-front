# Changelog

Todos los cambios de este proyecto se documentarán en este archivo siguiendo el formato de [Keep a Changelog](https://keepachangelog.com/es-ES/1.1.0/).

## [Unreleased]

## [0.1.5] - 2026-03-06
### Added
- Helper `src/app/lib/auth/keycloakAdmin.ts` para operaciones administrativas en Keycloak (token admin, lookup de rol realm, asignación de rol y borrado de usuario).
- Documento `docs/11-owner-role-or-user-delete-after-onboarding.md` con la explicación del flujo condicional post-registro.

### Changed
- `GET /api/auth/registrations/callback` ahora procesa onboarding con contrato `{ academyId, status }`, extrae `sub` como `userId`, asigna `OWNER` cuando `status=COMPLETED` y elimina el usuario cuando el estado no es `COMPLETED`.
- La home muestra resultado detallado del registro vía `registrationStatus`, `registrationAction` y `academyId`.

## [0.1.4] - 2026-03-06
### Fixed
- Corrección en `GET /api/auth/registrations` para normalizar el issuer con slash final antes de construir la URL de Keycloak registrations, evitando perder el segmento del realm cuando el issuer viene sin `/` al final.

### Added
- Documento `docs/10-fix-registration-issuer-trailing-slash.md` con el análisis y alcance del fix.

## [0.1.3] - 2026-03-06
### Added
- Documento `docs/9-prompt-agente-owner-or-delete.md` con un prompt detallado en formato Markdown para guiar a un agente de programación en la implementación del flujo condicional de rol `OWNER` o borrado de usuario en Keycloak.

## [0.1.2] - 2026-03-06
### Fixed
- Corrección en `GET /api/auth/registrations` para construir correctamente la URL de Keycloak registration conservando el segmento del realm (`/realms/...`).

## [0.1.1] - 2026-03-05
### Added
- Botón `Register` en la home para iniciar el flujo de registro OIDC vía BFF.
- Endpoint `GET /api/auth/registrations` para iniciar Authorization Code + PKCE apuntando al formulario de registro de Keycloak.
- Endpoint `GET /api/auth/registrations/callback` para validar callback OIDC, resolver email, ejecutar onboarding y redirigir a `/?registrationResult=true|false`.
- Componente cliente `RegistrationResultAlert` para mostrar el resultado del onboarding en un `alert` al volver a home.
- Helper `oidcAuthorization` para reutilizar la construcción de `state`, PKCE y URL de autorización.
- Documentación funcional del flujo de registro y onboarding en `/docs`.

### Changed
- Refactor mínimo del endpoint `GET /api/auth/login` para reutilizar helper compartido de autorización OIDC.

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
