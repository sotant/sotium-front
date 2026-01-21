# AGENTS.md

Este documento define cómo deben trabajar los **agentes de inteligencia artificial** dentro de este repositorio. Su objetivo es garantizar consistencia, calidad técnica y alineación arquitectónica en un proyecto **Next.js 16 / React 19 / TypeScript / Tailwind 4** que contiene **Frontend** y **BFF (Backend For Frontend)**.

## Prioridad de instrucciones

En caso de conflicto, los agentes DEBEN seguir este orden:

1. AGENTS.md (este archivo)
2. Instrucciones explícitas del usuario en la conversación actual
3. Código y comentarios existentes en el repositorio
4. Defaults del framework o buenas prácticas generales

Si existe un conflicto → **DETENERSE Y PREGUNTAR**.

## Reglas de comportamiento para agentes

Los agentes DEBEN:
- Hacer cambios mínimos e incrementales
- Evitar refactors especulativos
- No introducir features no solicitadas

Los agentes NO deben:
- Adivinar reglas de negocio
- “Completar” integraciones futuras

---

## 1. Contexto del proyecto

- **Nombre**: sotium-front
- **Stack principal**:
  - Next.js 16 (App Router)
  - React 19
  - TypeScript 5
  - Tailwind CSS 4
- **Arquitectura**:
  - Frontend (UI, UX, estado, navegación)
  - BFF (API interna usando Route Handlers / Server Actions)
- **Objetivo**:
  - Aplicación escalable, mantenible y optimizada para SSR/RSC
  - Separación clara entre UI, dominio y acceso a datos

Los agentes deben asumir que este proyecto **usa el App Router por defecto** y prioriza **Server Components**.

---

## 2. Principios obligatorios

Todos los agentes **DEBEN** seguir estos principios:

- **KISS**: soluciones simples antes que complejas
- **DRY**: no duplicar lógica ni configuraciones
- **SOLID**: especialmente SRP y DIP
- **Type-safety primero**: evitar `any`, preferir tipos explícitos
- **Server-first**: preferir Server Components y Server Actions
- **Zero/low-dependency**: no añadir librerías externas sin justificación

---

## 3. Convenciones generales

### 3.1 Lenguaje
- Código, comentarios y commits: **inglés**
- Documentación funcional (README, AGENTS, ADR): **español**, consistente

### 3.2 Estructura esperada
/app
/app/(public)
/app/(protected)
/app/api -> Route Handlers (BFF)
/app/actions -> Server Actions
/app/components -> UI reutilizable
/app/lib -> dominio, servicios, adapters
/app/types -> tipos compartidos


> Los agentes no deben crear carpetas nuevas sin justificarlo.

---

## 4. Frontend (UI)

### 4.1 React

- Usar **function components** exclusivamente
- No usar `forwardRef`
- Usar `ref` como prop directamente en componentes funcionales
- No usar `useEffect` para sincronizar estado derivado
- No duplicar estado que puede derivarse de props o datos del servidor
- Preferir formularios HTML + Actions antes que handlers manuales
- No usar librerías de estado global salvo necesidad justificada
- Usar `<Suspense>` para:
  - Carga de datos
  - UI progresiva
  - Streaming SSR
- No implementar loaders manuales si Suspense cubre el caso
- Preferir:
  - `use` para promesas
  - `useOptimistic`, `useActionState` cuando aplique

### 4.2 Server vs Client Components

- Por defecto: **Server Component**
- Marcar explícitamente `"use client"` solo si:
  - Hay interacción directa (onClick, onChange)
  - Se usa estado local o hooks de cliente

### 4.3 React Actions

- Preferir Actions sobre handlers `onSubmit` tradicionales
- Usar `<form action={action}>` siempre que sea posible
- Usar `useActionState` para manejar estado y errores
- Usar `useFormStatus` en componentes de UI reutilizables
- No manejar loading states manuales si la Action ya expone `pending`

---

## 5. BFF (Backend For Frontend)
El BFF es la ÚNICA frontera entre el frontend y sistemas externos.

Los agentes DEBEN asumir que:
- El frontend nunca habla directamente con servicios externos
- Keycloak, Spring Boot u otros backends NO son accesibles desde componentes
- Toda integración futura pasa por Route Handlers o Server Actions
- El BFF es responsable de:
  - Autenticación
  - Autorización
  - Normalización de datos
  - Adaptación de contratos externos


### 5.1 Route Handlers

- Ubicación: `app/api/**/route.ts`
- Usar `GET`, `POST`, etc. explícitos
- No acceder directamente a APIs externas desde componentes UI

### 5.2 Server Actions

- Ubicación: `app/actions/**`
- Declarar siempre `"use server"`
- Tratar cada acción como **endpoint público**
- Validar input (type-safe, sin librerías si es posible)
- Nunca confiar en datos provenientes del cliente
- Revalidar permisos y contexto en cada Action

---

## 6. TypeScript

- No usar `any`
- `unknown` solo permitido en fronteras (input, parsing, APIs) y debe ser narrowed explícitamente
- Preferir `satisfies` para objetos de configuración
- Preferir funciones puras y tipos inmutables
- No usar clases salvo para:
  - Errores
  - Casos excepcionales muy justificados
- `strict: true` asumido
- Tipos compartidos en `/types`
- Preferir:
  - `type` sobre `interface` (salvo extensión)
  - Uniones discriminadas
- No usar enums clásicos (usar `as const`)

---

## 7. Next.js (App Router)

- Asumir App Router en todo el proyecto
- Los Server Components pueden ser `async` por defecto
- Los Client Components NO deben ser `async`
- APIs request-bound (`cookies`, `headers`, `params`) son async
- Usar `fetch` nativo de Next.js (no axios)
- Declarar explícitamente:
  - `cache: 'no-store'`
  - `revalidate`
  - `dynamic = 'force-dynamic' | 'force-static'`
- No usar `getServerSideProps` ni `getStaticProps`
- No usar Pages Router
- No asumir caching por defecto
- Todo fetch debe ser explícito respecto a cache y revalidación
- Usar `next/navigation` en lugar de APIs legacy

---

## 8. Tailwind CSS 4

- Usar Tailwind como sistema de estilos principal
- No usar styled-components, CSS-in-JS ni Sass
- Preferir utilidades antes que abstraer clases prematuramente
- Usar container queries cuando aplique
- No usar clases arbitrarias salvo necesidad real
- Tema y tokens definidos vía CSS-first (`@theme`)
- No crear componentes solo para agrupar clases
- Extraer componentes solo cuando hay lógica o semántica clara

---

## 9. Anti-patrones prohibidos

Los agentes NO deben:

- Usar Redux, Zustand u otros stores globales sin aprobación
- Hacer data fetching en Client Components
- Acceder directamente a APIs externas desde la UI
- Duplicar lógica entre Route Handlers y Server Actions
- Introducir librerías para problemas resueltos nativamente
- Usar `useEffect` como reemplazo de arquitectura
- Usar Client Components para lógica de dominio
- Reimplementar patrones de SPA clásicas (Redux, services en el cliente)

---

## 10. Documentación, versionado y changelog

### 10.1 Documentación obligatoria

- Todo cambio realizado por un agente DEBE documentarse
- La documentación DEBE vivir en la carpeta `/docs`
- El formato de documentación DEBE ser Markdown (`.md`)
- Cada documento debe:
  - Explicar el **por qué** del cambio
  - Describir brevemente el **qué** se ha modificado
  - Indicar cualquier impacto relevante (arquitectura, API, UI, etc.)

Los agentes NO deben:
- Documentar cambios fuera de `/docs`
- Omitir documentación de cambios no triviales

---

### 10.2 Versionado del proyecto

- **Cada cambio en el código** DEBE incrementar la versión en `package.json`
- El versionado DEBE seguir **Semantic Versioning (SemVer)**:
  - `MAJOR`: cambios incompatibles
  - `MINOR`: cambios compatibles que añaden funcionalidad
  - `PATCH`: correcciones compatibles

Los agentes DEBEN:
- Decidir explícitamente qué tipo de bump aplicar
- Reflejar ese cambio de versión en el commit correspondiente

---

### 10.3 CHANGELOG

- Todo cambio DEBE reflejarse en `CHANGELOG.md`
- El formato DEBE seguir estrictamente:
  https://keepachangelog.com/es-ES/1.1.0/

Reglas obligatorias:
- Usar secciones estándar (`Added`, `Changed`, `Fixed`, `Removed`, etc.)
- Mantener una sección `Unreleased`
- Asociar cada versión con su número y fecha
- No mezclar cambios de distintas versiones

Los agentes NO deben:
- Modificar versiones antiguas del changelog
- Omitir entradas relevantes
- Inventar cambios no realizados

---

## Regla final

Ante cualquier ambigüedad, inconsistencia o duda:

> DETENTE. PREGUNTA. NO ASUMAS.
