# Implementación de login/logout con Keycloak y patrón BFF

## Por qué se realizó este cambio
Se necesitaba un flujo completo de autenticación OIDC con Keycloak donde el frontend no gestione tokens y todo el intercambio de credenciales ocurra exclusivamente en el BFF de Next.js.

Además, se detectó un problema de sesión tras el callback: para algunos tokens de Keycloak, el tamaño total superaba límites prácticos de cookie, por lo que el estado autenticado no persistía correctamente.

## Qué se modificó
- Se implementaron rutas BFF para login (`/api/auth/login`), callback (`/api/auth/callback`), logout (`/api/auth/logout`) y consumo seguro de identidad (`/api/bff/me`).
- Se agregó una capa `lib` para configuración de entorno, utilidades OIDC, sesión y cliente backend.
- Se cambió el almacenamiento de sesión:
  - Antes: tokens cifrados dentro de la cookie.
  - Ahora: cookie HttpOnly con `session_id` + almacenamiento server-side en memoria para `access_token`, `refresh_token`, `id_token`, `expires_at`.
- Se mantiene cookie transitoria OIDC cifrada para `state`, `nonce` y `code_verifier`.
- Se renovó la UI mínima de `/` y `/me` para mostrar estado de sesión, JSON de identidad y acciones de login/logout.
- Se añadió `.env.example` con variables necesarias para ejecutar en local.

## Impacto
- Arquitectura: se refuerza el patrón BFF como única frontera con Keycloak y backend.
- Seguridad: los tokens se mantienen exclusivamente server-side y la cookie del navegador solo contiene identificador de sesión HttpOnly.
- UX: se corrige la persistencia de sesión tras login, permitiendo llegar a `/me` y recuperar datos de `/api/identity/me` vía BFF.
