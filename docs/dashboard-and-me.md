# Dashboard protegido y endpoint BFF `/api/bff/me`

## Por qué se realizó este cambio
Se necesitaba proteger la experiencia de dashboard para usuarios autenticados y consolidar el patrón BFF para datos de identidad.

Con este enfoque, la UI nunca consume el backend externo directamente: todo pasa por route handlers internos (`app/api/**`) que controlan autenticación, tokens y normalización.

## Flujo completo
1. Usuario navega a `/dashboard`.
2. `middleware.ts` comprueba la cookie `bff_session`.
   - Sin sesión: redirección a `/`.
   - Con sesión: permite continuar.
3. El Server Component de dashboard llama a `/api/bff/me` con `fetch` interno y `cache: no-store`.
4. `/api/bff/me` lee sesión httpOnly, extrae `accessToken` y llama al backend:
   - `GET {BACKEND_BASE_URL}/api/identity/me`
   - `Authorization: Bearer <accessToken>`
5. El BFF normaliza la respuesta a `IdentityMeDto` y la devuelve al dashboard.

## Seguridad aplicada
- **Cookie httpOnly** de sesión: los tokens no son accesibles desde JavaScript del navegador.
- **Middleware**: bloqueo temprano para navegación de usuarios no autenticados.
- **Defensa en profundidad**: `/api/bff/me` vuelve a validar sesión y responde `401` si falta.
- **`cache: no-store`**: evita datos de identidad obsoletos o cruzados entre usuarios.
- **Separación BFF**: el token solo se usa en el servidor al llamar al backend externo.

## Qué valida el BFF
- Presencia de sesión válida (`bff_session`).
- Estado de respuesta del backend (`401/403`, `5xx`, etc.).
- Contrato de respuesta esperado (`sub`, `email`, `authorities`, `academyId`) antes de exponer datos a la UI.

## Cómo probar
1. Sin login:
   - Abrir `/dashboard`.
   - Verificar redirección a `/`.
2. Con login válido:
   - Autenticarse con Keycloak.
   - Abrir `/dashboard` y verificar render con datos de identidad.
3. Probar endpoint BFF:
   - Sin sesión: `GET /api/bff/me` debe responder `401`.
   - Con sesión: `GET /api/bff/me` debe responder `200` con JSON tipado.
4. Verificar en Network/DevTools que la UI no llama a `BACKEND_BASE_URL` directamente.
