# Alineación arquitectónica FSD + BFF

## Por qué

El proyecto necesitaba una estructura más alineada con Feature-Sliced Design para separar responsabilidades de UI, composición de páginas, lógica de entidades y frontera BFF. Además, era necesario centralizar explícitamente la comunicación BFF→Java para reforzar la regla de que el frontend solo consume `/api/...` interno.

## Qué se modificó

- Se reorganizó la UI en capas FSD dentro de `src/`:
  - `pages`: composición de landing y dashboard.
  - `widgets`: navegación y bloques visuales reutilizables.
  - `features`: render del resumen de identidad.
  - `entities`: modelo y normalización de identidad.
  - `shared`: utilidades de fetch y configuración interna.
- Se movió la lógica de integración BFF en `src/bff/`:
  - Cliente HTTP centralizado en `src/bff/clients/java.client.ts`.
  - Mappers dedicados en `src/bff/mappers/*`.
  - Servicios de orquestación en `src/bff/services/*`.
- `GET /api/bff/me` ahora delega la obtención y mapeo de identidad al servicio BFF.
- `GET /api/auth/registrations/callback` ahora usa el servicio de onboarding en `src/bff/services/onboarding.service.ts`.
- Se eliminaron componentes legacy fuera de la estructura FSD para evitar duplicidad.

## Impacto

- Mejor separación por capas y dirección de dependencias más clara.
- BFF más consistente: llamadas a Java centralizadas y mapeadas.
- Seguridad mantenida: tokens siguen gestionados del lado servidor y en cookies `httpOnly`.
