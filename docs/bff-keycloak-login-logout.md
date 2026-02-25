# Implementación de login/logout con Keycloak y patrón BFF

## Por qué se realizó este cambio
Se necesitaba un flujo completo de autenticación OIDC con Keycloak donde el frontend no gestione tokens y todo el intercambio de credenciales ocurra exclusivamente en el BFF de Next.js.

Además, se detectó un problema de sesión tras el callback: para algunos tokens de Keycloak, el tamaño total superaba límites prácticos de cookie, por lo que el estado autenticado no persistía correctamente.

Posteriormente, se detectó un problema de logout con Keycloak (`Invalid redirect uri`) y una necesidad de mejorar legibilidad en UI.

Finalmente, se reportó un error de hidratación en carga inicial. Como mitigación, se eliminó la dependencia de `next/font/google` en el layout para evitar variabilidad por descarga de fuentes en SSR/CSR en entorno local restringido.

## Qué se modificó
- Se implementaron rutas BFF para login (`/api/auth/login`), callback (`/api/auth/callback`), logout (`/api/auth/logout`) y consumo seguro de identidad (`/api/bff/me`).
- Se agregó una capa `lib` para configuración de entorno, utilidades OIDC, sesión y cliente backend.
- Se cambió el almacenamiento de sesión:
  - Antes: tokens cifrados dentro de la cookie.
  - Ahora: cookie HttpOnly con `session_id` + almacenamiento server-side en memoria para `access_token`, `refresh_token`, `id_token`, `expires_at`.
- Se mantiene cookie transitoria OIDC cifrada para `state`, `nonce` y `code_verifier`.
- Se ajustó la construcción de `post_logout_redirect_uri` para usar `APP_BASE_URL` normalizada sin barra final.
- Se forzó texto en negro en `/` y `/me` para asegurar contraste correcto del contenido.
- Se eliminó `next/font/google` del `layout` y se usaron fuentes de sistema en `globals.css`.
- Se añadió `.env.example` con variables necesarias para ejecutar en local.

## Impacto
- Arquitectura: se refuerza el patrón BFF como única frontera con Keycloak y backend.
- Seguridad: los tokens se mantienen exclusivamente server-side y la cookie del navegador solo contiene identificador de sesión HttpOnly.
- UX: se corrige la persistencia de sesión tras login, se mejora compatibilidad de logout con Keycloak y se mejora legibilidad visual de datos en pantalla.
- Estabilidad SSR/CSR: se reduce probabilidad de mismatch de hidratación asociado a carga externa de fuentes.
