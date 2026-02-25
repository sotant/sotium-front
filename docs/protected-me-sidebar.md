# Ajuste UX post-login: área protegida con barra lateral en `/me`

## Por qué se hizo este cambio

Se necesitaba que, después del login, el usuario no volviera a la home pública sino que aterrizara en una pantalla protegida específica con estructura de aplicación (sidebar), dejando la landing únicamente como entrada pública.

## Qué se modificó

- Se actualizó `/` para que redirija automáticamente a `/me` cuando detecta sesión activa.
- Se rediseñó `/me` con una barra lateral izquierda que servirá como base del menú futuro.
- En la barra lateral se dejó, por ahora, una única acción: `Logout`.
- Se mantuvo la carga de datos de identidad desde backend pasando por `/api/bff/me`.

## Impacto relevante

- **UX**: flujo más claro entre zona pública y zona autenticada.
- **Arquitectura**: se mantiene el patrón BFF, sin llamadas directas del navegador al backend.
- **Seguridad**: el logout sigue ejecutando cierre local en BFF y RP logout en Keycloak, finalizando en home pública.
