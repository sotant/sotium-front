# Base inicial de landing pública y BFF de autenticación

## Por qué se hizo este cambio

Se necesita una base funcional y segura para iniciar un SaaS de gestión de academias con Next.js App Router, separando claramente la UI pública y la frontera BFF para autenticación futura con Keycloak y backend Spring Boot.

## Qué se modificó

- Se reemplazó la página inicial por una landing pública de una sola página en la ruta `/`.
- Se añadió una navbar fija reutilizable con enlaces ancla y botón `ACCESO` apuntando a `/api/auth/login`.
- Se implementó `GET /api/auth/login` para redirigir al endpoint de autorización de Keycloak usando variables de entorno.
- Se implementó `GET /api/auth/callback` para recibir `code` y `state`, dejando explícitos los puntos pendientes del intercambio de tokens.
- Se añadió una utilidad en `src/app/lib/auth/keycloak.ts` para centralizar lectura de configuración y construcción de URL de autorización.
- Se actualizaron estilos globales y metadatos base del proyecto.

## Impacto relevante

- **Arquitectura**: refuerza el patrón BFF como único punto de integración con servicios externos.
- **Seguridad**: no se exponen secretos ni URLs reales en el código; toda configuración sensible queda en variables de entorno.
- **UI/UX**: queda habilitada una landing responsive, limpia y preparada para evolucionar sin romper la base SSR/RSC.
- **Integraciones futuras**: se deja preparado el callback para incorporar validación de estado, intercambio de tokens y sesión segura en servidor.
