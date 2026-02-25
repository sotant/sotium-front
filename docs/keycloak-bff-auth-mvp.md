# Implementación MVP: Login/Logout con Keycloak vía BFF

## Por qué se realizó este cambio
Se necesitaba un flujo de autenticación seguro donde el navegador nunca gestione tokens OIDC directamente. El objetivo es que Next.js actúe como BFF, centralizando login, sesión, refresh y logout con Keycloak.

## Qué se modificó
- Se añadieron route handlers para login, callback, logout y `GET /api/bff/me`.
- Se implementó una sesión cifrada en cookie HttpOnly para almacenar tokens de forma server-side.
- Se incorporó refresh silencioso en el endpoint BFF cuando el access token está vencido.
- Se creó UI mínima en `/` y `/me` para login, visualización de identidad y logout.
- Se añadieron utilidades de entorno, OIDC, sesión y consumo de backend.

## Variables de entorno requeridas
Crear `.env.local` en la raíz del proyecto usando `.env.example` como base:

```bash
cp .env.example .env.local
```

Variables necesarias:

```env
KEYCLOAK_BASE_URL=http://localhost:8080
KEYCLOAK_REALM=sotium-staging
KEYCLOAK_CLIENT_ID=bff-web
KEYCLOAK_CLIENT_SECRET=replace-with-your-client-secret
APP_BASE_URL=http://localhost:3000
BACKEND_BASE_URL=http://localhost:8081
SESSION_SECRET=replace-with-a-long-random-secret
```

## Ejecución local
```bash
npm install
npm run dev
```

## Prueba manual recomendada
1. Visitar `http://localhost:3000/` y confirmar que aparece el botón **Login** si no hay sesión.
2. Pulsar **Login** y completar autenticación en Keycloak.
3. Confirmar redirección automática a `/me`.
4. Verificar que `/me` muestra el JSON de `GET /api/identity/me` obtenido por el BFF.
5. Pulsar **Logout** y confirmar vuelta a `/` sin sesión activa.

## Impacto relevante
- **Arquitectura**: ahora todo OIDC y consumo de backend autenticado pasa por BFF.
- **Seguridad**: los tokens y secretos quedan en servidor; el navegador solo usa `/api/*` interno.
- **UX**: home pública con estado de sesión y vista protegida `/me`.
