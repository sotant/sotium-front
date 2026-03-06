# 12. Mostrar resultado de registro en dashboard en lugar de alert en home

## Por qué
Se requería cambiar la experiencia tras el callback de registro para evitar `alert(...)` en la home y mostrar el resultado directamente en `/dashboard`.

## Qué se modificó
- El callback de registro ahora redirige a `/dashboard` y mantiene los query params de resultado (`registrationStatus`, `registrationAction`, `academyId`).
- La home dejó de consumir esos query params y se eliminó el componente `RegistrationResultAlert`.
- El dashboard ahora lee los query params de registro y renderiza una tarjeta informativa con tres escenarios:
  - registro completado + OWNER asignado,
  - registro no completado + usuario eliminado,
  - error técnico.

## Impacto
- La notificación post-registro queda integrada en una pantalla autenticada y estable.
- Se elimina dependencia de `alert(...)` y se mejora la UX del flujo de onboarding.
