# 11. Flujo post-registro: asignar OWNER o borrar usuario según onboarding

## Por qué
El onboarding del backend dejó de devolver un booleano y ahora devuelve un objeto con `academyId` y `status`. A partir de este contrato se necesitaba controlar el estado final del usuario en Keycloak:
- `COMPLETED` => asignar rol `OWNER`.
- cualquier otro estado => eliminar usuario en Keycloak.

## Qué se modificó
- Se actualizó `GET /api/auth/registrations/callback` para:
  - parsear y validar el nuevo contrato `{ academyId, status }`,
  - extraer `sub` del `id_token` como `userId` de Keycloak,
  - asignar rol realm `OWNER` cuando `status === COMPLETED`,
  - borrar el usuario cuando `status !== COMPLETED`,
  - redirigir a home con query params detallados (`registrationStatus`, `registrationAction`, `academyId`).
- Se creó `src/app/lib/auth/keycloakAdmin.ts` para encapsular llamadas administrativas de Keycloak:
  - obtener token admin (`client_credentials`),
  - leer rol realm,
  - asignar role mapping,
  - borrar usuario.
- Se actualizó la UX de home para mostrar alertas con estado detallado en lugar de `true/false`.

## Impacto
- El BFF mantiene la frontera de seguridad y evita exponer tokens al frontend.
- El flujo de registro tiene resultado explícito y consistente con la regla de negocio.
- El usuario no queda en estado ambiguo cuando onboarding no completa.
