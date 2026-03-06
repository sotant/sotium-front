# 10. Fix de URL de registro cuando el issuer no termina en `/`

## Por qué
Se detectó un fallo en el flujo de registro OIDC cuando `KEYCLOAK_ISSUER` (o el issuer descubierto) no terminaba con slash final.
En ese caso, `new URL("protocol/...", issuer)` eliminaba el último segmento del path (`sotium-staging`) y generaba una URL inválida sin realm.

## Qué se modificó
- Se añadió normalización del issuer en `GET /api/auth/registrations` para asegurar slash final en `pathname` antes de construir la URL de `registrations`.
- La URL final se construye con el issuer normalizado, preservando siempre el realm.

## Impacto
- El botón REGISTER redirige correctamente a:
  - `/realms/<realm>/protocol/openid-connect/registrations`
- Se evita dependencia frágil de formato en variables de entorno (`KEYCLOAK_ISSUER` con o sin slash final).
