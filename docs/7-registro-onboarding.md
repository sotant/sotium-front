# 7. Flujo de registro OIDC + onboarding de academia

## Por qué
Se necesitaba habilitar un flujo de alta de usuarios desde la home sin exponer integración directa con Keycloak ni con el backend desde el frontend. El objetivo era mantener el patrón BFF como frontera única y, tras el registro OIDC, ejecutar automáticamente el onboarding de academia mostrando el resultado al usuario.

## Qué se modificó
- Se añadió un botón `Register` en la navbar de la landing (`/`) con el mismo estilo que `Login`, apuntando a `GET /api/auth/registrations`.
- Se implementó `GET /api/auth/registrations` reutilizando la lógica de `state` + PKCE del login para redirigir a la pantalla de registro de Keycloak (`/protocol/openid-connect/registrations`).
- Se implementó `GET /api/auth/registrations/callback` con validación de `code` y `state`, intercambio de tokens, resolución del email (claims de `id_token` y fallback a `userinfo`), llamada a backend `POST /api/onboarding/academies` y redirección a `/?registrationResult=true|false`.
- Se añadió `RegistrationResultAlert` (Client Component) para mostrar un `alert(...)` en home cuando existe el query param `registrationResult`.
- Se extrajo helper `oidcAuthorization` para evitar duplicación entre login y registro en la construcción del request OIDC.

## Impacto
- **UI**: la home ahora expone dos CTAs (`Login` y `Register`).
- **BFF**: nuevo flujo completo de registro desacoplado del login existente.
- **Backend integration**: onboarding ejecutado desde BFF con body `{ name, email, phone }`.
- **Seguridad**: se mantiene el uso de cookies transitorias `httpOnly`, validación de `state`, y no se exponen tokens en cliente.
