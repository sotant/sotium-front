# OIDC login step 1: inicio del flujo desde el BFF

## Por qué se realizó este cambio
Este cambio inicia el flujo OIDC desde el BFF para mantener la integración con Keycloak del lado servidor y evitar que la UI maneje detalles sensibles del protocolo.

También se incorpora PKCE + `state` desde el primer paso:
- `state` protege contra CSRF al vincular la respuesta del proveedor con la solicitud original.
- PKCE protege el Authorization Code frente a interceptación durante el intercambio posterior.

Se mantiene `openid-client` como dependencia principal porque ofrece discovery OIDC robusto y estandarizado, evitando endpoints hardcodeados y preparando una base confiable para validaciones futuras en el callback.

Además, se añadió una ruta de fallback para discovery con `.well-known/openid-configuration` en escenarios de desarrollo donde `openid-client` no esté instalado correctamente, evitando romper el build local.

## Qué se modificó
- `src/app/api/auth/login/route.ts`
  - Implementa `GET /api/auth/login`.
  - Valida variables de entorno requeridas.
  - Ejecuta discovery OIDC vía helper del BFF.
  - Genera `state`, `code_verifier` y `code_challenge`.
  - Guarda cookies temporales `httpOnly`.
  - Redirige con `302` al authorization endpoint con parámetros OIDC + PKCE.
- `src/app/lib/auth/oidcClient.ts`
  - Encapsula discovery OIDC y lectura segura de envs.
  - Prioriza `openid-client` y aplica fallback de discovery estándar si falta el módulo en entorno local.
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
- **Resiliencia local**: se evita el fallo de build por ausencia de `openid-client` en instalaciones incompletas.
- **Alcance**: no se implementa callback, sesión ni persistencia de tokens en esta etapa.
