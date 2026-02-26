# Hardening de origen interno para dashboard SSR

## Por qué se realizó este cambio
La página de dashboard SSR reenviaba la cookie de sesión al llamar al BFF interno, pero construía la URL base usando headers de request (`Host` y `x-forwarded-proto`).

Cuando esos headers no están estrictamente normalizados por la infraestructura, ese patrón permite que un valor de `Host` manipulado desvíe la llamada server-to-server y exponga la cookie `bff_session` hacia un origen no confiable.

## Qué se modificó
1. Se reemplazó la construcción de URL basada en headers por una fuente confiable de servidor:
   - `INTERNAL_BASE_URL` en entorno configurado.
   - Fallback local en desarrollo a `http://127.0.0.1:${PORT || 3000}`.
2. En producción, si falta `INTERNAL_BASE_URL`, la aplicación falla de forma explícita para evitar defaults inseguros.
3. La llamada SSR de `/dashboard` sigue reenviando `cookie`, pero únicamente hacia ese origen interno confiable.

## Impacto
- **Seguridad**: se reduce el riesgo de filtración de cookies por inyección de `Host`.
- **Operación**: en producción ahora es obligatorio definir `INTERNAL_BASE_URL`.
- **Arquitectura**: se mantiene el patrón BFF server-first sin exponer tokens/cookies al cliente.

## Nota de despliegue
Configurar `INTERNAL_BASE_URL` al origen interno de la app (por ejemplo, URL privada del servicio o dominio interno controlado por infraestructura).
