# Base inicial SaaS: Landing pública + BFF de autenticación

## Por qué
Se necesitaba una base limpia para iniciar un SaaS de gestión de academias con una landing pública y un BFF mínimo para autenticación delegada en Keycloak, manteniendo seguridad y separación de responsabilidades desde el inicio.

## Qué se modificó
- Se reemplazó la página inicial por una landing de una sola página en `/`, con navbar fija y navegación por anclas hacia `Inicio`, `Características`, `Precio` y `FAQ`.
- Se creó un componente reutilizable de navbar en `src/app/components/navbar.tsx`.
- Se habilitó scroll suave global mediante `scroll-behavior: smooth`.
- Se implementó el endpoint BFF `GET /api/auth/login` para construir y redirigir de forma segura al flujo de autorización de Keycloak usando variables de entorno.
- Se implementó el endpoint BFF `GET /api/auth/callback` para recibir `code` y `state`, dejando explícitos los pasos de integración futura sin exponer datos sensibles.

## Impacto
- **UI**: existe una landing responsive y lista para evolución visual.
- **Arquitectura**: la autenticación queda centralizada en el BFF, evitando acoplar la UI con servicios externos.
- **Seguridad**: no se exponen secretos ni tokens; se trabaja exclusivamente con variables de entorno y puntos de integración controlados.
