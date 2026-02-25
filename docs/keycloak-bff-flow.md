# Integración Login/Logout Keycloak con BFF y `/api/identity/me`

## Por qué se hizo este cambio

Se necesitaba pasar de un scaffold inicial a un flujo funcional y seguro de autenticación para MVP, asegurando que el navegador nunca gestione tokens y que el BFF sea la única frontera con Keycloak y el backend Java.

## Qué se modificó

- Se implementó login OIDC Authorization Code + PKCE en `GET /api/auth/login`.
- Se implementó callback en `GET /api/auth/callback` con validación de `state` y canje de `code` por tokens.
- Se implementó sesión server-side en cookie HttpOnly cifrada (14 días), con payload de `access_token`, `refresh_token`, `id_token` y `expires_at`.
- Se implementó refresh silencioso server-side en `GET /api/bff/me` cuando expira el access token.
- Se implementó logout completo en `GET /api/auth/logout`, borrando sesión BFF y redirigiendo a logout de Keycloak con `id_token_hint`.
- Se creó `/me` para visualizar los datos reales de identidad obtenidos desde backend vía BFF.
- Se actualizó la home pública para mostrar botón Login/Logout y estado básico de sesión.

## Impacto relevante

- **Seguridad**: tokens y secretos quedan completamente en servidor; no hay uso de localStorage/sessionStorage para autenticación.
- **Arquitectura**: se consolida el patrón BFF; el navegador llama solo `/api/*` internos.
- **Integración backend**: `/api/bff/me` añade `Authorization: Bearer <access_token>` server-side para consumir `/api/identity/me`.
- **Experiencia de usuario**: login y logout completos con redirecciones estándar OIDC.
