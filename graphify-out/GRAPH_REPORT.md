# Graph Report - proyecto-fitness  (2026-10-13)

## Corpus Check
- 177 files · ~67,366 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 3 file(s) not represented in the graph (top: .example 1, (none) 1, .css 1)

## Summary
- 989 nodes · 4216 edges · 43 communities (35 shown, 8 thin omitted)
- Extraction: 99% EXTRACTED · 1% INFERRED · 0% AMBIGUOUS · INFERRED: 23 edges (avg confidence: 0.84)
- Token cost: 124,354 input · 0 output

## Community Hubs (Navigation)
- App Pages & Routes
- Entry Actions & Validation
- Habit & Settings Actions
- App Shell & Toasts
- Package Dependencies
- Tournaments & Standings
- Auth & Onboarding
- History & Domain Context
- Habit Icons & Search
- Weekly Date Ranges
- Date Utilities & Insights
- Form Inputs & Sheets
- Session Crypto & Env
- Tournament Views
- Settings Page UI
- Avatar & Flame UI
- Points & Punctuality
- Root Layout & PWA
- Profile Creation
- Expandable & Progress UI
- Buttons & Error Page
- TypeScript Config
- README Product Concepts
- Access & App Layout
- Profile Analysis Types
- Streak & Celebration
- Navigation
- Filter Chips & Tabs
- Domain Tests
- Input Fields
- Loading States
- Charts & Geometry
- Habit Evaluation
- App Icons Generation
- Graphify Workflow
- App Icon Artwork
- Proxy Middleware
- Session Start Hook
- Vercel Config
- PostCSS Config

## God Nodes (most connected - your core abstractions)
1. `cn()` - 121 edges
2. `react` - 65 edges
3. `db()` - 60 edges
4. `Card()` - 56 edges
5. `lucide-react` - 55 edges
6. `next` - 53 edges
7. `Button` - 49 edges
8. `addDays()` - 47 edges
9. `CardHeader()` - 46 edges
10. `unwrap()` - 43 edges

## Surprising Connections (you probably didn't know these)
- `AppError()` --calls--> `Button`  [EXTRACTED]
  app/(app)/error.tsx → components/ui/Button.tsx
- `CardioCard()` --indirect_call--> `weekdayLetter()`  [INFERRED]
  features/cardio/CardioCard.tsx → lib/dates.ts
- `submit()` --indirect_call--> `weight()`  [INFERRED]
  features/entries/forms.tsx → tests/helpers.ts
- `scheduleLabel()` --indirect_call--> `weekdayLetter()`  [INFERRED]
  features/habits/HabitManager.tsx → lib/dates.ts
- `WeightInput` --references--> `WeightUnit`  [EXTRACTED]
  services/entries.ts → types/db.ts

## Import Cycles
- None detected.

## Hyperedges (group relationships)
- **History-derived scoring (streak, league, tournaments)** — readme_streak_rule, readme_monthly_league, readme_tournaments, readme_anti_cheat [EXTRACTED 1.00]
- **graphify agent workflow** — _claude_claude_graphify_skill, claude_graphify_knowledge_graph, claude_graphify_query_path_explain, claude_graphify_update [INFERRED 0.85]

## Communities (43 total, 8 thin omitted)

### Community 0 - "App Pages & Routes"
Cohesion: 0.06
Nodes (92): CardioPage(), metadata, TABS, asCompare(), CompliancePage(), metadata, ACTIVITY_TABS, metadata (+84 more)

### Community 1 - "Entry Actions & Validation"
Cohesion: 0.08
Nodes (44): deleteSchema, removeCustomType(), saveCardio(), saveNote(), saveWeight(), saveWorkout(), typeSchema, REST_WORKOUT_TYPE (+36 more)

### Community 2 - "Habit & Settings Actions"
Cohesion: 0.14
Nodes (40): logHabit(), removeHabit(), reorderHabitsAction(), saveHabit(), toggleHabitActive(), submit(), completeOnboarding(), markCelebrationSeen() (+32 more)

### Community 3 - "App Shell & Toasts"
Cohesion: 0.08
Nodes (31): AppShell(), Shortcuts(), icons, ToastApi, ToastContext, ToastItem, ToastProvider(), ToastTone (+23 more)

### Community 4 - "Package Dependencies"
Cohesion: 0.05
Nodes (39): eslintConfig, dependencies, lucide-react, next, react, react-dom, server-only, @supabase/supabase-js (+31 more)

### Community 5 - "Tournaments & Standings"
Cohesion: 0.11
Nodes (38): minDate(), Standing, ChallengeAward, ChallengeDef, ChallengeMetric, ChallengeRule, computeChallenges(), daysLeft() (+30 more)

### Community 6 - "Auth & Onboarding"
Cohesion: 0.13
Nodes (32): metadata, OnboardingPage(), changePassword(), delay(), logout(), passwordSchema, setupPassword(), submitPassword() (+24 more)

### Community 7 - "History & Domain Context"
Cohesion: 0.20
Nodes (28): Tab, WeightHistoryRow, ContextInput, DomainContext, AdherenceInput, GoalsInput, CardioEntryRow, CardioMode (+20 more)

### Community 8 - "Habit Icons & Search"
Cohesion: 0.11
Nodes (26): HabitIcon(), ICONS, Highlight(), normalize(), SearchList(), move(), onKeyDown(), ChoiceButton() (+18 more)

### Community 9 - "Weekly Date Ranges"
Cohesion: 0.19
Nodes (28): HabitDayRow, addDays(), dateRange(), endOfWeek(), maxDate(), startOfWeek(), weekDays(), evaluateDay() (+20 more)

### Community 10 - "Date Utilities & Insights"
Cohesion: 0.12
Nodes (27): diffDays(), endOfMonth(), formatLongDate(), fromUTC(), isISODate(), isoWeekday(), MONTH_LONG, MONTH_SHORT (+19 more)

### Community 11 - "Form Inputs & Sheets"
Cohesion: 0.18
Nodes (24): IconButton, NumberStepper(), TextArea, Sheet(), useAppProfile(), deleteEntries(), DateChooser(), CardioForm() (+16 more)

### Community 12 - "Session Crypto & Env"
Cohesion: 0.13
Nodes (22): fingerprint(), PARAMS, sign(), verifySignature(), getServerEnv(), missingEnv(), ACCESS_COOKIE, AccessToken (+14 more)

### Community 13 - "Tournament Views"
Cohesion: 0.13
Nodes (27): generateMetadata(), MEDALS, TournamentPage(), EntityChip(), finish(), cap(), ChallengeList(), days() (+19 more)

### Community 14 - "Settings Page UI"
Cohesion: 0.26
Nodes (20): metadata, SettingsPage(), Button, SectionTitle(), SegmentedControl(), LeagueOptInCard(), useAction(), CustomTypesCard() (+12 more)

### Community 15 - "Avatar & Flame UI"
Cohesion: 0.21
Nodes (18): Avatar(), Divider(), Flame(), FlameState, SPARKS, Odometer(), cellClass(), Last7() (+10 more)

### Community 16 - "Points & Punctuality"
Cohesion: 0.16
Nodes (21): startOfMonth(), buildContext(), groupByDate(), formatters, isPunctual(), leagueContext(), localDateOf(), periodAdherence() (+13 more)

### Community 17 - "Root Layout & PWA"
Cohesion: 0.11
Nodes (16): inter, metadata, RootLayout(), viewport, ServiceWorker(), APP_NAME, AVATAR_EMOJIS, DEFAULT_ADHERENCE_WEIGHTS (+8 more)

### Community 18 - "Profile Creation"
Cohesion: 0.18
Nodes (18): metadata, NewProfilePage(), unlockProfile(), createProfileAction(), deleteProfileAction(), seedDemoAction(), updateProfileAction(), CreateProfile() (+10 more)

### Community 19 - "Expandable & Progress UI"
Cohesion: 0.20
Nodes (17): Chevron(), Collapse(), DetailRail(), Expandable(), Base(), dayStatusMeta, habitStatusMeta, StatusPill() (+9 more)

### Community 20 - "Buttons & Error Page"
Cohesion: 0.14
Nodes (15): AppError(), buttonClass(), ButtonProps, IconButtonProps, LinkButton(), Size, sizes, Variant (+7 more)

### Community 21 - "TypeScript Config"
Cohesion: 0.11
Nodes (18): compilerOptions, allowJs, esModuleInterop, incremental, isolatedModules, jsx, lib, module (+10 more)

### Community 22 - "README Product Concepts"
Cohesion: 0.14
Nodes (13): Beautiful UI design language (Shane Levine, MIT), Champions format (regular phase + Final + bronze), Constancia - Proyecto Fitness webapp, Event habits (Ayuno, Taraweeh), Group habits (Fajr, Entrenar, Leer Coran), Monthly league (/liga) points, Offline PWA with local sync queue, Palmares (league_titles + tournament_trophies) (+5 more)

### Community 23 - "Access & App Layout"
Cohesion: 0.29
Nodes (12): AccessPage(), metadata, AppLayout(), Home(), metadata, ProfilesPage(), SetupScreen(), hasAccess (+4 more)

### Community 24 - "Profile Analysis Types"
Cohesion: 0.21
Nodes (16): DEFAULT_CARDIO_TYPES, DEFAULT_WORKOUT_TYPES, ISODate, DayPoints, ProfileAnalysis, buildAppProfile(), isActiveToday(), League (+8 more)

### Community 25 - "Streak & Celebration"
Cohesion: 0.22
Nodes (13): metadata, StreakPage(), Celebration(), CelebrationData, COLORS, COPY, DayDot(), StreakCard() (+5 more)

### Community 26 - "Navigation"
Cohesion: 0.24
Nodes (12): MobileNavigation(), FOOTER_NAV, isActive(), MOBILE_NAV, NavItem, PRIMARY_NAV, SECONDARY_NAV, ProfileSwitcher() (+4 more)

### Community 27 - "Filter Chips & Tabs"
Cohesion: 0.24
Nodes (9): FilterChip(), FilterChips(), FilterOption, SegmentOption, subscribe(), useIsClient(), useSlidingIndicator(), ClassValue (+1 more)

### Community 28 - "Domain Tests"
Cohesion: 0.26
Nodes (9): submit(), vitest, cardio(), ctx(), habit(), log(), weight(), workout() (+1 more)

### Community 29 - "Input Fields"
Cohesion: 0.33
Nodes (10): Field(), Select, Switch(), TextInput, WeekdayPicker(), HabitForm(), KINDS, ProfileForm() (+2 more)

### Community 30 - "Loading States"
Cohesion: 0.24
Nodes (10): Loading(), chevron, LoaderGrid(), LoadingLabel(), orbit, ORBIT_ORDER, PATTERNS, useElapsed() (+2 more)

### Community 31 - "Charts & Geometry"
Cohesion: 0.30
Nodes (8): extent(), monotonePath(), Pt, LineChart(), LinePoint, CompareBars(), Sparkline(), useElementWidth()

### Community 32 - "Habit Evaluation"
Cohesion: 0.27
Nodes (11): logKey(), ACTIVITY_LINKED_KINDS, countsForStreak(), DEFAULT_TARGETS, evaluateHabit(), fmtQty(), isScheduled(), scheduleFor() (+3 more)

### Community 33 - "App Icons Generation"
Cohesion: 0.33
Nodes (5): AppleIcon(), contentType, size, GET(), renderAppIcon()

### Community 35 - "App Icon Artwork"
Cohesion: 0.50
Nodes (4): App Icon (flame on dark rounded square), Dark Rounded Square Background (#0d0e11, rx=8), Fitness Energy / Calorie-Burn Branding, Flame Glyph (orange #F0A25A outer, cream #FBD9A8 inner)

## Knowledge Gaps
- **14 isolated node(s):** `PATH`, `@tailwindcss/postcss`, `@types/node`, `@types/react`, `@types/react-dom` (+9 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 237 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **8 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `next` connect `App Pages & Routes` to `Habit & Settings Actions`, `App Shell & Toasts`, `Package Dependencies`, `Tournaments & Standings`, `Auth & Onboarding`, `Habit Icons & Search`, `Weekly Date Ranges`, `Session Crypto & Env`, `Tournament Views`, `Settings Page UI`, `Avatar & Flame UI`, `Root Layout & PWA`, `Profile Creation`, `Buttons & Error Page`, `Access & App Layout`, `Profile Analysis Types`, `Streak & Celebration`, `Navigation`, `Filter Chips & Tabs`, `Loading States`, `App Icons Generation`, `Proxy Middleware`?**
  _High betweenness centrality (0.088) - this node is a cross-community bridge._
- **What connects `PATH`, `@tailwindcss/postcss`, `@types/node` to the rest of the system?**
  _14 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `App Pages & Routes` be split into smaller, more focused modules?**
  _Cohesion score 0.06310562015503876 - nodes in this community are weakly interconnected._
- **Why does `cn()` connect `Avatar & Flame UI` to `App Pages & Routes`, `App Shell & Toasts`, `Auth & Onboarding`, `Habit Icons & Search`, `Date Utilities & Insights`, `Form Inputs & Sheets`, `Tournament Views`, `Settings Page UI`, `Profile Creation`, `Expandable & Progress UI`, `Buttons & Error Page`, `Streak & Celebration`, `Navigation`, `Filter Chips & Tabs`, `Input Fields`, `Loading States`, `Charts & Geometry`?**
  _High betweenness centrality (0.080) - this node is a cross-community bridge._
- **Should `Entry Actions & Validation` be split into smaller, more focused modules?**
  _Cohesion score 0.07678075855689177 - nodes in this community are weakly interconnected._
- **Why does `react` connect `Filter Chips & Tabs` to `App Pages & Routes`, `App Shell & Toasts`, `Package Dependencies`, `Tournaments & Standings`, `Auth & Onboarding`, `History & Domain Context`, `Habit Icons & Search`, `Weekly Date Ranges`, `Form Inputs & Sheets`, `Session Crypto & Env`, `Settings Page UI`, `Avatar & Flame UI`, `Root Layout & PWA`, `Profile Creation`, `Expandable & Progress UI`, `Buttons & Error Page`, `Access & App Layout`, `Profile Analysis Types`, `Streak & Celebration`, `Navigation`, `Input Fields`, `Loading States`, `Charts & Geometry`?**
  _High betweenness centrality (0.075) - this node is a cross-community bridge._
- **Should `Habit & Settings Actions` be split into smaller, more focused modules?**
  _Cohesion score 0.13623188405797101 - nodes in this community are weakly interconnected._