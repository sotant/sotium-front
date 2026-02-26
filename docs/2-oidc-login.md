# OIDC login step 1: inicio del flujo desde el BFF

## Por qué se realizó este cambio
Este cambio inicia el flujo OIDC desde el BFF para mantener la integración con Keycloak del lado servidor y evitar que la UI maneje detalles sensibles del protocolo.

También se incorpora PKCE + `state` desde el primer paso:
- `state` protege contra CSRF al vincular la respuesta del proveedor con la solicitud original.
- PKCE protege el Authorization Code frente a interceptación durante el intercambio posterior.

Se añade `openid-client` porque ofrece discovery OIDC robusto y estandarizado, evitando endpoints hardcodeados y preparando una base confiable para validaciones futuras en el callback.

## Qué se modificó
- `src/app/api/auth/login/route.ts`
  - Implementa `GET /api/auth/login`.
  - Valida variables de entorno requeridas.
  - Ejecuta discovery OIDC vía `openid-client`.
  - Genera `state`, `code_verifier` y `code_challenge`.
  - Guarda cookies temporales `httpOnly`.
  - Redirige con `302` al authorization endpoint con parámetros OIDC + PKCE.
- `src/app/lib/auth/oidcClient.ts`
  - Encapsula discovery OIDC y lectura segura de envs.
- `src/app/lib/auth/oidcCookies.ts`
  - Centraliza creación y limpieza de cookies transitorias para `state` y `code_verifier`.

## Cómo probar
1. Configurar `.env.local` con:
   - `KEYCLOAK_ISSUER`
   - `KEYCLOAK_CLIENT_ID`
   - `KEYCLOAK_REDIRECT_URI`
2. Ejecutar la app en desarrollo.
3. Hacer `GET /api/auth/login`.
4. Verificar:
   - Respuesta `302`.
   - Header `Location` apuntando al authorization endpoint de Keycloak.
   - Query params presentes: `client_id`, `redirect_uri`, `response_type=code`, `scope=openid email profile`, `state`, `code_challenge`, `code_challenge_method=S256`.
   - Cookies `oidc_state` y `oidc_code_verifier` con `httpOnly`, `sameSite=lax`, `path=/`, `maxAge=300`.

## Impacto
- **Arquitectura**: el login OIDC queda correctamente iniciado desde el BFF.
- **Seguridad**: se incorporan controles base (`state` + PKCE + cookies `httpOnly`) desde el primer paso del flujo.
- **Alcance**: no se implementa callback, sesión ni persistencia de tokens en esta etapa.
