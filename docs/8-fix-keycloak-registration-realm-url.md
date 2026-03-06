# 8. Corrección de URL de registro Keycloak con realm

## Por qué
El flujo de `GET /api/auth/registrations` estaba generando una URL de registro inválida para Keycloak en entornos con realm, produciendo una ruta sin `/realms/<realm>` y devolviendo error de página no encontrada.

## Qué se modificó
- Se corrigió la construcción del endpoint de registro de Keycloak para preservar correctamente el path del issuer con realm.
- En concreto, el path de registro pasó de absoluto (`/protocol/...`) a relativo (`protocol/...`) para evitar que `new URL(...)` elimine el segmento `/realms/<realm>`.

## Impacto
- El botón REGISTER ahora redirige al formulario de registro correcto de Keycloak.
- No cambia la lógica de seguridad existente (`state`, PKCE, cookies transitorias y callback).
