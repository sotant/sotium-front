# Implementación de login/logout con Keycloak y patrón BFF

## Por qué se realizó este cambio
Se necesitaba un flujo completo de autenticación OIDC con Keycloak donde el frontend no gestione tokens y todo el intercambio de credenciales ocurra exclusivamente en el BFF de Next.js.

## Qué se modificó
- Se implementaron rutas BFF para login (`/api/auth/login`), callback (`/api/auth/callback`), logout (`/api/auth/logout`) y consumo seguro de identidad (`/api/bff/me`).
- Se agregó una capa `lib` para configuración de entorno, utilidades OIDC, sesión cifrada en cookie HttpOnly y cliente backend.
- Se renovó la UI mínima de `/` y `/me` para mostrar estado de sesión, JSON de identidad y acciones de login/logout.
- Se añadió `.env.example` con variables necesarias para ejecutar en local.

## Impacto
- Arquitectura: se refuerza el patrón BFF como única frontera con Keycloak y backend.
- Seguridad: los tokens se almacenan cifrados en cookie HttpOnly y solo se usan server-side.
- UX: se habilita login, sesión persistente, refresh silencioso en servidor y logout completo con RP-Initiated Logout.
