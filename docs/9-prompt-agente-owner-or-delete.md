# 9. Prompt detallado para agente: registro OIDC + onboarding con OWNER o borrado de usuario

## Objetivo
Implementar en el BFF el flujo de post-registro con la nueva respuesta del backend de onboarding.

### Regla de negocio obligatoria
- Si `status === "COMPLETED"` => asignar rol `OWNER` (realm role de Keycloak) al usuario recién registrado.
- Si `status !== "COMPLETED"` => borrar ese usuario en Keycloak.

---

## Contexto técnico del proyecto
- Stack: Next.js 16 (App Router), React 19, TypeScript 5, Tailwind 4.
- Arquitectura: Frontend + BFF.
- Restricción principal: el frontend no puede llamar directamente ni a Keycloak ni al backend de negocio.

---

## Alcance esperado
El agente debe modificar la implementación actual de:
- `GET /api/auth/registrations/callback`

y añadir capa de administración de Keycloak (server-side) para:
- asignar role mapping de realm al usuario,
- borrar usuario por `userId`.

---

## Restricciones de seguridad y arquitectura (obligatorias)
1. Mantener validación OIDC de callback (`code`, `state`, cookies transitorias, PKCE).
2. No exponer tokens al navegador.
3. No mover llamadas externas al frontend.
4. Mantener cookies `httpOnly`/`sameSite` actuales.
5. Usar `fetch` nativo (no axios).
6. Tipado estricto (`any` prohibido).

---

## Contrato nuevo de onboarding
La respuesta del backend deja de ser boolean y pasa a:

```json
{
  "academyId": "string | null",
  "status": "string"
}
```

### Requisito
Validar el payload en frontera (`unknown` + narrowing). Si la forma no es válida, tratar como error.

---

## Implementación requerida (paso a paso)

### Paso 1) Actualizar callback de registro al nuevo contrato
Archivo:
- `src/app/api/auth/registrations/callback/route.ts`

Tareas:
1. Sustituir parseo booleano de onboarding por parseo estructurado.
2. Definir tipos seguros (`OnboardingResult`, etc.).
3. Añadir normalizador type-safe:
   - `normalizeOnboardingResponse(payload: unknown): OnboardingResult | null`
4. Tratar respuesta no válida o `!ok` como fallo controlado.

---

### Paso 2) Extraer `sub` del usuario registrado
Archivo:
- `src/app/api/auth/registrations/callback/route.ts`

Tareas:
1. Leer claims desde `tokenSet.claims()`.
2. Validar `sub` como `string`.
3. Usar `sub` como `userId` para operaciones de Keycloak Admin API.
4. Si no existe `sub`, abortar rama IAM con estado de error.

---

### Paso 3) Crear helper de administración Keycloak
Archivo nuevo sugerido:
- `src/app/lib/auth/keycloakAdmin.ts`

Funciones mínimas:
1. `getKeycloakAdminAccessToken()`
2. `getRealmRoleByName(roleName: string)`
3. `assignRealmRoleToUser(userId: string, roleName: string)`
4. `deleteKeycloakUser(userId: string)`

Requisitos:
- token admin por `client_credentials` con cliente técnico,
- llamadas con `cache: "no-store"`,
- sin logs de secretos,
- manejo de errores HTTP explícito.

---

### Paso 4) Variables de entorno necesarias
Añadir soporte a:
- `KEYCLOAK_ADMIN_CLIENT_ID`
- `KEYCLOAK_ADMIN_CLIENT_SECRET`
- `KEYCLOAK_REALM` (opcional si se infiere del issuer)

Si faltan valores críticos, responder error 500 controlado.

---

### Paso 5) Aplicar regla de negocio OWNER o borrado
En callback, después de onboarding:
1. Si `status === "COMPLETED"`:
   - asignar rol `OWNER` al usuario (`userId=sub`).
2. Si `status !== "COMPLETED"`:
   - borrar usuario en Keycloak.

Comportamiento ante fallo IAM:
- No devolver éxito silencioso.
- Redirigir con resultado de error explícito.

---

### Paso 6) Ajustar UX de resultado en home
Archivos:
- `src/app/page.tsx`
- `src/app/components/landing/RegistrationResultAlert.tsx`

Cambiar de boolean a estado detallado mediante query params, por ejemplo:
- `registrationStatus`
- `registrationAction`
- `academyId` (opcional)

Mensajes mínimos:
- Completed + owner asignado.
- No completed + usuario eliminado.
- Error técnico.

---

### Paso 7) Mantener limpieza de cookies y orden seguro
- Limpiar cookies transitorias al finalizar procesamiento.
- Evitar estados ambiguos (éxito parcial).
- Mantener BFF como frontera única.

---

## Criterios de aceptación
1. Registro sigue funcionando de punta a punta.
2. Callback procesa `{ academyId, status }`.
3. `COMPLETED` asigna `OWNER`.
4. Estado distinto de `COMPLETED` elimina usuario.
5. Home muestra alert coherente con resultado.
6. Flujo login existente no se rompe.
7. Sin exposición de tokens al cliente.

---

## Validaciones recomendadas al ejecutar
1. Probar registro con caso `COMPLETED` y verificar role mapping en Keycloak.
2. Probar registro con caso no `COMPLETED` y verificar usuario eliminado en Keycloak.
3. Verificar redirecciones y alerts de home.
4. Ejecutar checks del proyecto (`lint/build`) si el entorno lo permite.

---

## Entregables del agente
1. Cambios de código en rutas/helpers indicados.
2. Actualización de documentación en `/docs`.
3. Actualización de `CHANGELOG.md`.
4. Bump de versión SemVer en `package.json` (y lockfile).
5. Resumen final con:
   - archivos tocados,
   - decisiones técnicas,
   - riesgos conocidos,
   - resultados de validación.
