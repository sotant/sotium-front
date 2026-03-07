# 15. Menú Users y listado de usuarios por academia

## Por qué

Se necesitaba habilitar el acceso al menú **Users** para usuarios autenticados y mostrar un listado SSR de usuarios de la academia configurada, manteniendo la arquitectura BFF como frontera única con el backend.

## Qué se cambió

- Se convirtió el item `Users` del `DashboardNavbar` en un enlace a `/users`.
- Se creó la ruta protegida `/users` con renderizado server-side.
- Se agregó el endpoint BFF `GET /api/bff/users`, que:
  - valida sesión BFF,
  - consume el backend Java con `POST /api/public/identity/register-user?academyId=<ACADEMY_ID>`,
  - normaliza la respuesta y la devuelve al frontend.
- Se añadió la entidad `User` y su normalizador para parsear de forma type-safe la lista recibida.
- Se extendió `middleware.ts` para proteger `/users` además de `/dashboard`.

## Impacto

- **UI**: ahora existe navegación real a Users y una pantalla con el listado de usuarios de academia.
- **Arquitectura**: se preserva el patrón FSD + BFF (la UI solo consume `/api/bff/users`).
- **Configuración**: el flujo depende de `ACADEMY_ID` en variables de entorno del servidor.
