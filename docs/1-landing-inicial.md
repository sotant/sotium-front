# Tarea 1: Bootstrap del frontend y landing page inicial

## Por qué se realizó este cambio
Se necesitaba reemplazar el contenido por defecto de Next.js por una base funcional de la aplicación Sotium, incluyendo una landing page navegable con scroll suave entre secciones y un punto de entrada visible hacia el flujo de login futuro.

## Qué se modificó
- Se creó una navegación superior sticky para la landing con anclas a `#hero`, `#features`, `#documentation` y `#pricing`.
- Se implementó una sección reutilizable para mantener el layout y la presentación consistente en cada bloque de la página.
- Se actualizó la home para renderizar cuatro secciones con contenido de ejemplo y altura suficiente para validar el desplazamiento.
- Se habilitó scroll suave a nivel global vía CSS.
- Se ajustaron metadatos de la app al contexto de Sotium.
- Se añadió la carpeta `src/lib` para dejar preparada la estructura base del proyecto.

## Impacto
- **UI**: nueva landing page funcional en `/` con navegación sticky y scroll suave.
- **Arquitectura**: estructura inicial de componentes reutilizables para landing bajo `src/components/landing`.
- **BFF/Auth**: solo se enlaza a `/api/auth/login` como placeholder; no se implementó autenticación ni endpoints.
