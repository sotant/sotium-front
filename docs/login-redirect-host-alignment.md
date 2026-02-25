# Corrección de redirección post-login por alineación de host/cookies

## Por qué se hizo este cambio

Se detectó un caso donde, tras login exitoso, el usuario podía volver a ver la home pública en vez de `/me`. La causa era la posible desalineación entre el host de la request real y el host configurado en redirecciones absolutas (por ejemplo `localhost` vs `127.0.0.1`), lo que impedía reutilizar la cookie de sesión en el destino.

## Qué se modificó

- `GET /api/auth/callback` ahora construye redirecciones a `/me` y errores usando el **origen de la request** (`new URL(request.url).origin`) en lugar de depender de un host fijo.
- `GET /api/bff/me` ahora aplica la misma estrategia para redirecciones de sesión expirada.
- Se marcó `/me` como ruta dinámica (`force-dynamic`) para mejorar la estabilidad del flujo en entornos locales y build.

## Impacto relevante

- **UX**: después de login, el usuario llega de forma consistente a la página protegida con sus datos.
- **Seguridad/sesión**: se reduce el riesgo de “cookie no encontrada” por cambios de host en redirecciones.
- **Arquitectura**: se mantiene intacto el patrón BFF y la separación entre zona pública (`/`) y zona autenticada (`/me`).
