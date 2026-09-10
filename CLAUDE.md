# YatiñaCapibara — App móvil para aprender aymara

App tipo Duolingo para aprender **aymara** desde español, con mascota capibara.
Proyecto de la materia Aplicaciones Móviles 1 (UPDS). Alcance cerrado: 5 niveles,
no más. Vida útil planeada: **1 mes** (dura lo que la materia). Ver `docs/TASKS.md`
Fase 15 para el apagado ordenado al terminar.

## Stack (NO cambiar ni agregar dependencias sin preguntar)

- Expo SDK (managed) + React Native + TypeScript **strict**
- expo-router (file-based routing)
- Supabase: Auth (email + verificación), Postgres, Edge Functions.
  **Storage de Supabase NO se usa** — todo audio/imagen/video va empaquetado
  como asset local del app (ver `docs/DESIGN.md` §Assets).
- `@supabase/supabase-js` + `@tanstack/react-query` (server state)
- `zustand` (solo estado de UI de la sesión de lección)
- `expo-audio` (reproducir pronunciación), `expo-video` (loop del capibara
  cargando), `expo-speech` (fallback TTS), `expo-secure-store`.
  **`expo-av` está deprecado y retirado desde el SDK 55 — no usarlo.**
- `react-native-reanimated` (micro-interacciones, ver `docs/DESIGN.md`)
- `lucide-react-native` (iconos utilitarios de línea)
- Estilos: `StyleSheet` de React Native + tokens en `src/theme/`. NO NativeWind, NO styled-components.

## Comandos

```bash
npm run start          # expo start
npm run typecheck      # tsc --noEmit  (correr SIEMPRE antes de dar una tarea por terminada)
npm run lint           # eslint
npx supabase db reset  # aplica migraciones + seed en local
npx supabase db push   # aplica migraciones al proyecto remoto
```

## Estructura

```
app/                # rutas expo-router — en la RAÍZ, no dentro de src/
  (auth)/
  (tabs)/
  lesson/
  exam/
  _layout.tsx
src/
  components/     # UI reutilizable (sin lógica de datos)
  features/       # lesson/, exam/, translator/, tutor/, profile/
  services/       # llamadas a Supabase (única capa que habla con la BD)
  hooks/          # react-query hooks
  theme/          # colores, tipografía, espaciado
  lib/            # supabase.ts, normalize.ts
  types/database.ts   # GENERADO por supabase gen types. NUNCA editar a mano.
assets/
  images/mascot/  # los 12 PNG del capibara, ya entregados
  images/vocabulary/
  audio/
  video/
supabase/
  migrations/     # SQL versionado
  functions/      # Edge Functions (proxy de IA)
docs/             # especificación del proyecto
```

## Reglas duras

1. **La fuente de verdad del modelo de datos es `docs/DATABASE.md` y `supabase/migrations/`.**
   Nunca inventes tablas, columnas o enums. Si necesitas un campo que no existe,
   PARA y proponme una migración nueva antes de escribir código de app.
2. **Nunca escribas SQL suelto desde la app.** Todo acceso pasa por `src/services/*.ts`
   usando el cliente de Supabase con tipos de `src/types/database.ts`.
3. **Ninguna API key de IA vive en el cliente.** Toda llamada a un LLM (incluido
   Google Translate) pasa por una Edge Function en `supabase/functions/`. Si te
   pido meter una key en la app, recuérdame esta regla.
4. **No inventes vocabulario aymara.** Todo término nuevo sale de `docs/CONTENIDO.md`.
   Si falta una palabra, deja `TODO: verificar` y avísame. Una traducción inventada
   es un error de contenido, no de código.
5. **Un cambio = un alcance.** No refactorices archivos que no te pedí tocar.
   No agregues features "de yapa" (ligas, temas oscuros, ranking) que no estén en `docs/SPEC.md`.
   El ranking global está pensado para el futuro (`docs/DATABASE.md` §Preparado
   para el futuro) pero **no se implementa** en este proyecto.
6. **No repitas el patrón visual de Duolingo.** Colores, forma de botones, camino
   de niveles e iconografía siguen `docs/DESIGN.md`, no los valores por defecto
   que "parecen bien". Un hex literal fuera de `src/theme/` es un error.
7. **Si algo es ambiguo, pregunta antes de codear.** Prefiero una pregunta a 300 líneas que hay que botar.
8. Antes de decir que terminaste: corre `npm run typecheck` y reporta el resultado real.

## Idioma

- Código, nombres de variables, tipos y comentarios: **inglés**.
- Textos visibles en la app (UI), mensajes de error al usuario y `docs/`: **español**.
- Nunca traduzcas los identificadores de la BD.

## Documentación (leer solo cuando sea relevante — no cargues todo)

- `docs/SPEC.md` — alcance funcional, pantallas, reglas de negocio
- `docs/DATABASE.md` — modelo de datos y contratos de las funciones RPC
- `docs/CONTENIDO.md` — currícula de los 5 niveles y vocabulario semilla
- `docs/IA.md` — dónde y cómo se usa IA, contrato de las Edge Functions
- `docs/DESIGN.md` — identidad visual, mascota, componentes distintivos, assets
- `docs/TASKS.md` — plan de fases; marca `[x]` al completar una tarea

Guía de ejecución para el humano (no la necesitas tú, pero puede citarte texto
de ahí): `EJECUCION.md` en la raíz del repo.

## Estado del proyecto

Fase actual: ver el primer `[ ]` sin marcar en `docs/TASKS.md`.
