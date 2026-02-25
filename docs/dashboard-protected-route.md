# Migración del área autenticada a `/dashboard`

## Por qué se hizo este cambio

Se requería que, tras login exitoso, el usuario llegara a una pantalla protegida llamada `/dashboard` (en lugar de permanecer en home o usar `/me`) para separar de forma clara la zona pública de la zona autenticada.

## Qué se modificó

- El callback OIDC ahora redirige a `/dashboard` al crear sesión.
- La home pública redirige automáticamente a `/dashboard` cuando detecta sesión activa.
- Se creó/ajustó la página protegida `src/app/dashboard/page.tsx` con:
  - Sidebar izquierda (base de menú futuro)
  - Botón `Logout`
  - Visualización de datos obtenidos desde backend vía `/api/bff/me`
- Se dejó `src/app/me/page.tsx` como ruta de compatibilidad que redirige a `/dashboard`.

## Impacto relevante

- **UX**: el usuario autenticado aterriza siempre en un dashboard dedicado.
- **Seguridad**: se mantiene el patrón BFF (sin llamadas del navegador al backend directo).
- **Compatibilidad**: enlaces antiguos a `/me` no se rompen gracias a redirección interna.
