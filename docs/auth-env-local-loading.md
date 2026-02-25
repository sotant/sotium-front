# Mejora de carga de variables de entorno para login BFF

## Por qué
Se detectó que, al usar variables en `.env.local`, el endpoint de login devolvía un error poco claro cuando faltaba alguna clave o el servidor no se había reiniciado.

## Qué se modificó
- Se agregó una utilidad de configuración en `src/app/lib/auth-env.ts` para validar y normalizar las variables requeridas de Keycloak.
- Se actualizó `GET /api/auth/login` para responder con JSON controlado cuando falten variables, indicando exactamente qué claves faltan y recordando reiniciar el servidor de Next.js.
- Se mantuvo la redirección segura al flujo OAuth de Keycloak cuando la configuración está completa.

## Impacto
- **DX**: diagnóstico inmediato de problemas de configuración en `.env.local`.
- **Seguridad**: no se exponen secretos, solo nombres de variables faltantes.
- **Arquitectura**: se centraliza validación de entorno para el BFF de autenticación.
