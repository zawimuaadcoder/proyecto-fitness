# Constancia · Proyecto Fitness

Webapp mobile-first para que un grupo haga seguimiento de **hábitos, rachas, entrenamiento, cardio y peso**.
La métrica principal no es el peso: es la constancia.

- 🔥 **Racha diaria** → motivación inmediata
- 🎯 **Cumplimiento semanal** → perspectiva

## Stack

Next.js 16 (App Router) · React 19 · TypeScript · Tailwind CSS 4 · Supabase (PostgreSQL) · Lucide · gráficos SVG propios · PWA instalable · Vercel.

## Puesta en marcha (Vercel + Supabase)

1. **Base de datos.** En Supabase → *SQL Editor*, ejecuta
   [`supabase/migrations/20261011000000_init.sql`](supabase/migrations/20261011000000_init.sql).
   Es idempotente y conserva la tabla `profiles` del prototipo anterior (los PIN en texto plano se
   convierten a hash automáticamente la primera vez que se usan). Después ejecuta, en orden, el resto de
   archivos de `supabase/migrations/` (limitador de intentos y liga).
2. **Variables en Vercel** (*Settings → Environment Variables*), ver [`.env.example`](.env.example):
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `SUPABASE_SECRET_KEY` **o** `SUPABASE_SERVICE_ROLE_KEY` (la integración Vercel↔Supabase ya la crea)
   - opcional: `SESSION_SECRET`, `APP_PASSWORD_HASH`
3. **Redeploy.** Al abrir la app por primera vez se pide definir la **contraseña del grupo**
   (se guarda como hash scrypt). Si prefieres fijarla por entorno: `npm run hash-password -- "tu contraseña"`
   y pega el resultado en `APP_PASSWORD_HASH`.
4. En la pantalla de perfiles puedes pulsar **«Crear perfiles demo»**: Alex (≈6 semanas de historial),
   Marta (PIN `1234`) y Leo (vacío → onboarding).

Si falta alguna variable o la migración, la app muestra una pantalla con las instrucciones en lugar de fallar.

### Local

```bash
cp .env.example .env.local   # rellena las variables
npm install
npm run dev
npm test        # lógica de rachas, semanas, peso y fechas
npm run lint && npm run typecheck
```

## Arquitectura

```
app/                 rutas (App Router)
  acceso/            contraseña de grupo (o configuración inicial)
  perfiles/          selector estilo Netflix, PIN, crear perfil
  onboarding/        asistente de 5 pasos
  (app)/             zona autenticada: hoy, progreso, entrenamiento, cardio,
                     hábitos, racha, cumplimiento, ajustes, perfil
components/
  ui/                Card, Button, Pills (Status/Value/Metric/Entity), FilterChips,
                     SegmentedControl, Expandable, Sheet, Toast, LoaderGrid,
                     SearchList, Odometer, WizardCard, ProgressRing/Bar…
  charts/            LineChart (tooltip táctil), Sparkline, MiniBars, CompareBars
  layout/            AppShell, Sidebar, MobileNavigation, ProfileSwitcher
features/            UI + server actions por dominio (habits, weight, workouts,
                     cardio, weekly, insights, streak, quick-add, offline, settings…)
lib/
  domain/            lógica PURA y testeada: hábitos, racha, semana, peso, insights
  server/            sesión firmada, scrypt, cliente Supabase (solo servidor)
  dates.ts           fechas de calendario sin dependencias de zona horaria
services/            acceso a datos y análisis por perfil
types/               tipos de BD y de dominio
supabase/migrations/ esquema SQL
tests/               Vitest
```

### Seguridad

- El navegador **nunca** habla con Supabase. Todas las lecturas/escrituras pasan por el servidor
  (Server Components + Server Actions) con la clave secreta, que nunca se expone.
- RLS activado en todas las tablas y privilegios revocados a `anon`/`authenticated`.
- Sesión en cookies `httpOnly` firmadas con HMAC: acceso de grupo (se invalida al cambiar la
  contraseña) + perfil desbloqueado (se invalida al cambiar el PIN).
- Contraseña de grupo y PIN almacenados solo como hash **scrypt**; bloqueo temporal del PIN tras 5 fallos.
- Cada consulta filtra por el `profile_id` de la sesión validada; entradas validadas con Zod.

### Reglas de negocio

- **Semana** = lunes → domingo. **Día** = zona horaria del perfil (no UTC).
- **Racha**: un día se completa al cumplir todos los hábitos obligatorios programados ese día. Días sin
  obligatorios o con descanso planificado (entreno «Descanso») no rompen ni suman. Un día cerrado con un
  obligatorio pendiente reinicia la racha. Siempre se **recalcula desde el historial**; `current_streak`,
  `longest_streak`, `weekly_summaries` y `streak_events` se guardan como caché/auditoría.
- **Cumplimiento semanal** = media ponderada (configurable) de hábitos obligatorios (%), entrenos/objetivo
  y cardio (días y/o minutos)/objetivo, cada parte topada al 100 %. **El peso no cuenta.**
- **Peso**: tendencia por media móvil de 7 días y medias semanales; el color es neutral salvo objetivo explícito.
- **Metas** versionadas por semana: cambiarlas no reescribe semanas pasadas.

### Liga mensual (`/liga`)

Competición amistosa por **constancia frente a los objetivos propios**, no por volumen. Los puntos se
calculan siempre desde el historial (`lib/domain/points.ts`), nunca se guardan a mano.

- **Puntos**: entreno 1 · cardio 1 · día con todos los hábitos obligatorios 1 → máximo 3/día.
- **Hábitos de grupo** (Fajr, Entrenar, Leer Corán): obligatorios para todos, todos los días, en ese orden y
  bloqueados (nadie puede editarlos, desactivarlos ni borrarlos). Valen **3 puntos cada uno**, fuera del tope
  diario (hasta +9/día). «Entrenar» se completa al registrar un entreno y puntúa aunque se supere el objetivo
  semanal; un descanso planificado no suma ni rompe. Definidos en `lib/domain/group-habits.ts`; los perfiles
  nuevos los reciben al terminar el onboarding. Migración:
  [`supabase/migrations/20261012010000_group_habits.sql`](supabase/migrations/20261012010000_group_habits.sql).
  Semana ISO cerrada con ≥ 80 % de cumplimiento: +2 (se apunta el domingo). Cada 7 días seguidos de racha: +1.
- Entrenos y cardio **por encima del objetivo semanal propio no suman**. Sin multiplicadores ni decimales.
- **El peso no cuenta** ni aparece en la clasificación.
- **Antitrampas**: solo puntúa lo registrado para hoy o ayer (`created_at` en la zona horaria del perfil;
  en hábitos, la última modificación). Los descansos planificados pueden apuntarse antes y no restan.
- **Liga** por mes natural; desempate por cumplimiento medio del mes. Al cerrar el mes, el campeón se guarda
  en `league_titles` (🏆 ×N). Los lunes, la tarjeta de cierre semanal muestra el ganador de la jornada y tu puesto.
- Ajuste por perfil **«Participar en la liga»** (por defecto sí). Migración:
  [`supabase/migrations/20261012000000_league.sql`](supabase/migrations/20261012000000_league.sql).

### Offline / PWA

Manifest + service worker (shell y páginas visitadas en caché). Los registros hechos sin conexión
(peso, entreno, cardio, notas, hábitos) se guardan en una cola local y se sincronizan al volver la red.
`localStorage` solo se usa para esa cola y preferencias (tema, último perfil, columnas visibles).

## Créditos de diseño

El lenguaje visual (tokens oklch, anillos de 1px, sombras en capas, botones y pills en píldora,
sidebar 224↔52 px, `GlideMenu`, loader 3×3 «drive/dots/orbit») sigue
[Beautiful UI](https://www.beautifului.dev) de Shane Levine — licencia MIT
([repositorio](https://github.com/slev12397/beautiful-ui)).
