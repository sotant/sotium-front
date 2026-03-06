# 13. Refresh de token tras asignar OWNER en registro

## Por qué
Después del registro, el backend rechazaba el `access_token` al consultar `/api/identity/me` porque el token inicial no incluía todavía el rol `OWNER` recién asignado en Keycloak.

## Qué se modificó
- En `GET /api/auth/registrations/callback` se añadió lógica para refrescar tokens (`refresh_token`) inmediatamente después de asignar el rol `OWNER`.
- La sesión BFF ahora se crea con el `TokenSet` refrescado (si existe) para que el siguiente acceso a `/dashboard` use un `access_token` con claims actualizados.

## Impacto
- Se reduce el riesgo de fallo inmediato al cargar dashboard tras el registro exitoso.
- El BFF sigue gestionando tokens solo en servidor y mantiene el flujo OIDC existente.
