# Logout completo en BFF + Keycloak

## Por qué se realizó este cambio
El logout se implementa en dos fases para garantizar cierre de sesión consistente:
1. **Local (BFF)**: se destruye inmediatamente la sesión `bff_session`.
2. **Proveedor (Keycloak)**: se redirige al `end_session_endpoint` para cerrar sesión centralizada.

Esto evita que un fallo puntual en Keycloak deje una sesión local activa.

## Flujo
1. Usuario pulsa **Logout** en el dashboard.
2. El formulario envía un `POST` nativo del navegador a `/api/auth/logout`.
3. `POST/GET /api/auth/logout`:
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


## Ajuste de implementación
Se reemplazó el uso de Server Action para logout por un `POST` directo del navegador hacia `/api/auth/logout`.

Esto evita encadenados de redirect internos de actions/fetch y mejora la fiabilidad del borrado de cookies antes del salto cross-origin a Keycloak.


## Incidencia corregida: cookies vacías visibles tras logout
Se ajustó el endpoint de logout para enviar cabeceras de **borrado duro** en la respuesta de redirect (`delete` + `maxAge=0` + `expires` pasado), en lugar de depender de vaciado previo en contexto interno.

Con este ajuste, `bff_session`, `oidc_state` y `oidc_code_verifier` deben eliminarse del navegador en lugar de quedar como cookies vacías visibles.
