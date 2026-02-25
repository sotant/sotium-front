# Corrección de flujo: sólo `/dashboard`, redirección dinámica y consumo BFF estable

## Por qué se hizo este cambio

Persistía un fallo donde, tras login, algunos usuarios terminaban en home en lugar de la zona protegida. Además, se pidió eliminar por completo `/me` y usar únicamente `/dashboard`.

## Qué se modificó

- Login OIDC ahora genera `redirect_uri` dinámica basada en el origen real de la request.
- Callback OIDC usa esa misma `redirect_uri` dinámica al intercambiar el `code` por tokens.
- Logout construye `post_logout_redirect_uri` con el origen real de request.
- `/dashboard` llama a `/api/bff/me` usando el mismo origen (host/protocolo) de la request entrante, evitando desalineación de cookies.
- Se eliminó la ruta `/me`; la única pantalla protegida es `/dashboard`.

## Impacto relevante

- **UX**: tras login exitoso, el usuario llega consistentemente a `/dashboard`.
- **Seguridad**: se mantiene modelo BFF; el backend Java se consume sólo desde `/api/bff/me`.
- **Mantenibilidad**: se simplifica navegación autenticada al tener una sola ruta protegida principal.
