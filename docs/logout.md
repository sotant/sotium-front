# Logout completo en BFF + Keycloak

## Por qué se realizó este cambio
El logout se implementa en dos fases para garantizar cierre de sesión consistente:
1. **Local (BFF)**: se destruye inmediatamente la sesión `bff_session`.
2. **Proveedor (Keycloak)**: se redirige al `end_session_endpoint` para cerrar sesión centralizada.

Esto evita que un fallo puntual en Keycloak deje una sesión local activa.

## Flujo
1. Usuario pulsa **Logout** en el dashboard.
2. El formulario ejecuta `logoutAction` (Server Action).
3. La acción redirige a `/api/auth/logout`.
4. `POST/GET /api/auth/logout`:
   - limpia `bff_session`
   - limpia cookies OIDC transitorias
   - hace redirect al logout de Keycloak con `post_logout_redirect_uri`
5. Keycloak redirige de vuelta a `/`.

## ¿Qué pasa si `end_session_endpoint` no existe?
Si discovery no trae `end_session_endpoint`, el BFF hace fallback a `/`.
Esto mantiene seguridad porque la sesión local ya fue invalidada.

## Seguridad
- Logout local primero (defensa principal).
- Cookies de sesión y transitorias son removidas en servidor.
- No se exponen tokens en respuestas ni en cliente.

## Cómo probar
1. Iniciar sesión y entrar en `/dashboard`.
2. Pulsar **Logout**.
3. Verificar que terminas en `/`.
4. Intentar volver a `/dashboard`:
   - Debe redirigir a `/`.
5. Verificar en DevTools que `bff_session` desaparece.


## Incidencia corregida: `Missing parameters: id_token_hint`
Algunos setups de Keycloak exigen `id_token_hint` en el `end_session_endpoint`.

Para resolverlo, el callback ahora guarda `id_token` dentro de la sesión BFF (cookie httpOnly) y el endpoint de logout lo reenvía como `id_token_hint` cuando existe.

La sesión local se sigue invalidando siempre primero para mantener la garantía de logout local aunque falle el proveedor.


## Incidencia corregida: cookie `bff_session` persistente tras logout
Se reforzó el endpoint de logout para adjuntar explícitamente cabeceras `Set-Cookie` de borrado en la respuesta de redirect.

Con esto, el navegador recibe de forma inequívoca la invalidación de `bff_session` y cookies OIDC transitorias antes de continuar con el redirect a Keycloak o al fallback local.


## Refuerzo adicional de borrado de cookies
Se añadieron cabeceras de borrado con `expires` pasado y `maxAge=0` en la respuesta de redirect, publicando variantes `secure=true` y `secure=false`.

Esto mejora la compatibilidad cuando el entorno productivo está detrás de proxy/CDN y evita que una diferencia de flags impida eliminar `bff_session`.
