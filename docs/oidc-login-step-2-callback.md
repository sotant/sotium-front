# OIDC login step 2: callback, token exchange y sesión BFF

## Por qué se realizó este cambio
Esta etapa completa el flujo iniciado en `/api/auth/login` para que el BFF procese el callback de Keycloak, valide la integridad de la solicitud y cree una sesión segura del lado servidor.

El objetivo es mantener los tokens fuera del código cliente y consolidar la autenticación en la capa BFF.

## Qué se modificó
- `src/app/api/auth/callback/route.ts`
  - Implementa `GET /api/auth/callback`.
  - Valida `code` y `state` del callback.
  - Valida cookies transitorias (`oidc_state`, `oidc_code_verifier`).
  - Verifica coincidencia de `state` para mitigar CSRF/login mix-up.
  - Intercambia el authorization code por tokens usando `openid-client`.
  - Crea sesión BFF en cookie `httpOnly`.
  - Elimina cookies transitorias y redirige a `/dashboard`.
- `src/app/lib/auth/session.ts`
  - Añade helpers de sesión BFF (`setBffSession`, `getBffSession`, `clearBffSession`).
  - Define `BFF_SESSION_COOKIE` y el tipo `BffSession`.

## Flujo resultante (Login → Callback → Sesión)
1. Usuario inicia login en `/api/auth/login`.
2. Keycloak autentica y redirige a `/api/auth/callback?code=...&state=...`.
3. El callback valida `state` contra cookie transitoria.
4. El BFF usa `code_verifier` (PKCE) para intercambio seguro de tokens.
5. El BFF persiste tokens en cookie `bff_session` `httpOnly`.
6. Se limpian cookies transitorias y se redirige a `/dashboard`.

## Qué contiene la sesión BFF
- `accessToken`
- `refreshToken` (si existe)
- `expiresAt` (epoch en ms)

La sesión se serializa como JSON en cookie `httpOnly`, con `sameSite=lax`, `path=/`, `secure` solo en producción y `maxAge` derivado de `expiresAt`.

## Riesgos mitigados
- **CSRF/login mix-up**: validación estricta de `state`.
- **Code interception**: uso de PKCE (`code_verifier`) en el callback.
- **Exposición de tokens al frontend**: tokens no se retornan en JSON ni se exponen a JavaScript cliente.
- **Reutilización de valores transitorios**: limpieza de cookies temporales tras completar callback.

## Qué queda pendiente
- Refresh token automático.
- Logout.
- Middleware de protección de rutas.
- Integración con `/api/identity/me`.


## Incidencia corregida
Se corrigió un error en el callback donde `client.callback(...)` no recibía `state` en el objeto `checks`.
En `openid-client`, el `state` debe validarse explícitamente en `checks`; de lo contrario puede aparecer `TypeError: checks.state argument is missing`.

Esto era un problema de **código** (uso incorrecto de la API), no de configuración de Keycloak.


## Incidencia adicional corregida
Cuando Keycloak envía el parámetro `iss` en el callback, `openid-client` espera recibirlo también en los parámetros entregados a `client.callback(...)`.

Se corrigió el handler para reenviar `iss` (si está presente), permitiendo la validación de issuer y evitando el error `RPError: iss missing from the response`.

Esta incidencia también era de **código** (parámetros incompletos enviados a `openid-client`), no de configuración de credenciales en Keycloak.
