## MEDIKIOSK_ANIMATED_PHASE_1 — enhancement changelog

This build layers a targeted animation/interaction pass onto the existing, completed homepage below. **No section was rebuilt, deleted, or removed** — the architecture, routing, i18n, theming, and existing sections are all unchanged. Scope was limited to Navigation, Hero, the Hero product visual, Patient Motivation, and the Healthcare Problem storytelling, per the Phase 1 brief.

| Area | What changed | File(s) |
|---|---|---|
| Navigation | Desktop nav links now grow a centered underline on hover (`scale-x` transform) and keep it solid for the active route; `Get Started` / `Login` get a lift + shadow on hover and a tap-scale via Framer Motion, with an animated arrow on `Get Started`; the mobile menu now opens/closes with `AnimatePresence` (height + fade), staggers its links in, and closes automatically on route change | `src/components/layout/Navbar.tsx` |
| Hero | Heading/eyebrow/subtext reveal sequencing is unchanged (it already matched the brief); both CTA buttons gained the same lift/arrow/tap hover treatment as the nav buttons | `src/pages/public/home/Hero.tsx` |
| Hero product visual | Replaced the single static assistant card with a new sequenced product preview: AI Health Assistant → voice waveform → Patient Profile → Medical Timeline → Reports → Doctor Verification → an alternating Voice Mode/Touch Mode indicator → a Health ID card that arrives last. Each stage fades/slides in on a timed beat (not scroll-triggered, since this sits inside the hero above the fold); `prefers-reduced-motion` shows the final state immediately with no timers | `src/pages/public/home/HeroProductVisual.tsx` (new), wired into `Hero.tsx` |
| Patient motivation | Already met the brief (scroll-triggered staggered reveal, large italic statement typography, resolves into one statement) — left as-is | `src/pages/public/home/PatientMotivation.tsx` |
| Healthcare problem storytelling | Already met the brief: `Problem.tsx` shows the scattered-fragments marquee (Lab Report, Prescription, Old Medical Record, Doctor Note, Medication, Previous Visit, Patient Memory) converging to a single line, and the very next section, `UnifiedRecord.tsx`, resolves that convergence into "One patient. One story. One connected record." with the MediKiosk hub — left as-is | `src/pages/public/home/Problem.tsx`, `UnifiedRecord.tsx` |
| i18n | Added `home.hero.visual.*` (assistant, patientProfile, timeline, reports, doctorVerification, healthId, voiceMode, touchMode + their sample values) to `TranslationSchema` and translated in full for English, বাংলা, and हिन्दी — nothing in the new hero visual is hardcoded | `src/i18n/en.ts`, `bn.ts`, `hi.ts` |

**QA performed for this pass:**
- `npx tsc -b` — no type errors
- Production build (`vite build`) — succeeds, no broken imports
- Verified `prefers-reduced-motion` fallback on the new hero visual (renders fully assembled immediately, no timers, no infinite loops)
- Verified the new i18n keys resolve in English, বাংলা, and हिन्दी
- Confirmed `/`, `/how-it-works`, and `/features` all still render and navigate correctly
- No new section was added to the homepage, no existing section was removed, and no design tokens were changed

---

## MEDIKIOSK_ANIMATED_PHASE_2 — enhancement changelog

Continuation work on top of Phase 1. **Nothing from Phase 1 was rebuilt, deleted, or replaced** — Hero, Navigation, the Hero product visual, Patient Motivation, and the Healthcare Problem storytelling are all unchanged. Scope was limited to the AI Health Assistant showcase, Voice Mode, Touch Mode, and the AI → Structured Health History story, per the Phase 2 brief.

| Area | What changed | File(s) |
|---|---|---|
| AI Health Assistant showcase | New section, inserted between the existing `VoiceTouch` and `Multilingual` sections (nothing removed or reordered around it). A single interactive panel with three switchable demos — **AI Conversation**, **Voice Mode**, **Touch Mode** — behind an animated pill tab switcher (`AnimatePresence`, shared `layoutId` pill). Explicitly labeled as a homepage product preview, not the live patient assistant route | `src/pages/public/home/AiAssistantShowcase.tsx` (new) |
| AI Conversation demo | Guided, one-question-at-a-time flow with a live `Step X of 12` counter and animated completion-percentage progress bar. Main question offers Fever / Pain / Cough / Weakness / Breathing Difficulty / Other; selecting an option branches into duration → severity → breathing-difficulty questions (`AnimatePresence` fade/slide/scale between each), then reveals a staggered structured-history summary (Symptom, Duration, Severity, Associated Symptom). Selecting breathing difficulty surfaces a calm "Important symptom detected" notice — explicitly framed as a UI concept for review, not a diagnosis. `Go Back` / `Skip` / `Restart` controls operate on local mock state only | same file |
| Voice Mode demo | A calm state machine — Idle ("Ready to listen") → Listening → Processing ("Understanding your response…") → Speaking → Completed ("Response ready") — driving a single mic button and a small, limited-bar waveform (reused from Phase 1's `Waveform.tsx`) that pulses while listening and settles once complete. `Start Speaking`, `Stop`, `Repeat`, `Go Back`, `Skip` are all mock, frontend-only controls | same file |
| Touch Mode demo | "Answer by Touch" — one mood question at a time (😊 Good / 😐 Okay / 😟 Not Well / 😣 Severe), large touch-friendly cards with lift-on-hover, icon scale, a check-mark on selection, and an animated progress bar; a short completion state offers a restart | same file |
| Voice/Touch → Understands → Structured | A compact connecting diagram above the tabs — `Voice` **or** `Touch` → `MediKiosk Understands` → `Structured Health Information` — ties all three demos back to the same idea without repeating the AI-understanding transformation already built in `Understanding.tsx` (left untouched) | same file |
| Hover & micro-interactions | Option cards, mood cards, and the voice button all get lift + border/shadow transitions on hover and a tap-scale on click, consistent with the Phase 1 interaction language; nothing here overrides or duplicates Phase 1's own hover system | same file |
| i18n | Added `home.aiShowcase.*` (eyebrow, headline, tab labels/descriptions, the full conversation script, voice states, touch questions/moods, the flow labels, and the disclaimer) to `TranslationSchema` and translated in full for English, বাংলা, and हिन्दी, including the longer Bengali/Hindi disclaimer and red-flag copy | `src/i18n/en.ts`, `bn.ts`, `hi.ts` |

**Accessibility & motion:**
- Every interactive element (tab buttons, option buttons, mood cards, the mic button, all control buttons) is a real `<button>` with `aria-pressed`/`aria-label` where relevant, and is fully keyboard-operable — no interaction depends on hover.
- `prefers-reduced-motion` is respected throughout: the voice-mode timers, touch-mode auto-advance delay, and all `AnimatePresence` transitions fall back to instant/no-motion, and functionality (selecting an option, seeing the next question) still works identically either way.
- The two-column desktop rhythm from Phase 1 is preserved conceptually — the panel is centered with a max width so it reads well both alongside the section's centered copy on desktop and stacked full-width on mobile — and the panel content never causes horizontal overflow at any breakpoint.

**QA performed for this pass:**
- `npx tsc -b` — no type errors
- `npx oxlint` — 0 errors (7 pre-existing style warnings across the project, none introduced by this file)
- Production build (`vite build`) — succeeds, no broken imports
- Confirmed `/`, `/how-it-works`, and `/features` still render and navigate correctly, and that Hero, Navigation, Patient Motivation, and the Problem/Unified-Record storytelling are visually and functionally unchanged
- Walked all three demos (Conversation, Voice, Touch) end to end, including the breathing-difficulty red-flag notice and the touch-mode completion state
- Verified the new i18n keys resolve in English, বাংলা, and हिन्दी, including the longer Bengali/Hindi strings, with no layout overflow
- Verified `prefers-reduced-motion` fallback: all three demos remain fully usable with animations minimized

---

# MediKiosk — Frontend (Part B: Complete Animated Homepage)

**AI-Powered Patient Case-Taking & Digital Health Record Platform**
_Your Health. Your History. Your Care._

This build completes **Part B** on top of the Part A foundation: the full, premium, animated **MediKiosk homepage** — from the cinematic hero through the closing organization CTA and footer. Part B ships in three phases, documented in full below:

- **Phase 1** — the opening experience (Sections 01–07): hero, patient motivation, patient experience, voice + touch, multilingual, product journey.
- **Phase 2** — the product story and trust model (Sections 08–16): the problem, the unified record, the 8-step workflow, Patient → MediKiosk → Doctor, AI understanding, document intelligence, doctor review, patient timeline, and the Health ID + closing statement.
- **Phase 3** — who MediKiosk is for, impact, trust, and close (Sections 17–28): the organization ecosystem, the cinematic org story, use cases, "why MediKiosk", conceptual impact statements, trust & safety, security & privacy, ABHA/ABDM, FAQ, the final patient message, the organization CTA, and the site-wide footer.

**Part B does not include Part C** — no backend, database, real AI/OCR/STT/TTS pipeline, or live ABHA/ABDM integration. Every product interaction on the homepage is a frontend simulation, clearly scoped as such throughout this document.

> Part A's foundation (design system, dashboards, routing, i18n scaffolding) is unchanged and documented further down this file.

---

## Setup

```bash
npm install
npm run dev       # start the dev server (Vite)
npm run build     # type-check + production build
npm run preview   # preview the production build locally
```

Requires Node.js 18+.

---

## Part B, Phase 1 — Homepage opening experience

Scope, per the brief: the opening experience. Section 01 (nav) through Section 07 (product journey transition).

### Sections built (`src/pages/public/home/`)

| # | Section | File | Notes |
|---|---|---|---|
| 01 | Premium navigation | `components/layout/Navbar.tsx` | Shrinks subtly on scroll (`scale-90` mark, `h-16 → h-14` bar); full link set (How It Works, Features, For Patients, For Doctors, About, Language, Login, Get Started); mobile drawer variant |
| 02 | Cinematic hero | `Hero.tsx` | Eyebrow, word-revealed headline, subtext, dual CTAs, ambient drifting color blooms, mock AI-assistant card |
| — | Animated hero text | `RotatingStatement.tsx` | Auto-advancing statement sequence, pauses on the final line for `prefers-reduced-motion` |
| 03 | Patient motivation | `PatientMotivation.tsx` | Scroll-staggered list of patient pain points resolving into "MediKiosk brings it together." |
| 04 | Patient experience | `PatientExperience.tsx` | Numbered flow + a mock product interface that animates from spoken reply to structured fields (Chief Complaint, Symptoms, Medical History, Medicines, Allergies) as it scrolls into view |
| 05 | Voice + Touch | `VoiceTouch.tsx` | Click-to-toggle demo between a voice waveform state and a touch/chip state — a frontend simulation only, no real speech |
| 06 | Multilingual | `Multilingual.tsx` | Auto-cycles English / বাংলা / हिन्दी with a translated sample line; carries an explicit disclaimer rather than claiming full language coverage |
| 07 | Product journey | `ProductJourney.tsx` | Patient → AI Assistant → Structured History → Health Timeline → Doctor Review, plus an `#about` anchor and a footnote that hands off to Phase 2 |

### Animation system (`motion.ts`, `Reveal.tsx`, `RevealHeading.tsx`, `Waveform.tsx`)

Named, reusable patterns rather than one-off effects per section: `FadeIn`, `SlideUp` / `SlideUpLarge`, `ScaleIn`, `StaggerChildren`, `WordReveal` (word-by-word heading reveal), `ProductTransition`. `ScrollReveal` / `StaggerGroup` / `StaggerItem` wrap Framer Motion's `whileInView` so every section triggers consistently. Every one of these checks `useReducedMotion()` and falls back to a static, fully-visible render — motion is additive, never required to see content. This same system is reused, unchanged, across Phases 2 and 3.

### Signature element — the Story Thread

`StoryThread.tsx` is the one deliberately theatrical element on the page: a fixed vertical line down the left edge (desktop only) with a pulse that travels as you scroll, tracking `scrollYProgress` across the **entire homepage**, all three phases included. It's a direct extension of the heartbeat motif already in the MediKiosk logo. Hidden entirely under `prefers-reduced-motion`, since its only job is motion.

---

## Part B, Phase 2 — Product story and trust model

Scope, per the brief: the product story (Sections 08–09), the cinematic 8-step workflow (10), the Patient → MediKiosk → Doctor signature moment (11), AI-understanding and document-intelligence proof (12–13), the doctor trust model (14), the patient timeline and Health ID (15–16), and the closing statement + CTA.

### Sections built (`src/pages/public/home/`)

| # | Section | File | Notes |
|---|---|---|---|
| 08 | The problem | `Problem.tsx` | Fragmented-information pain points resolving into a single statement |
| 09 | Unified record | `UnifiedRecord.tsx` | Scattered data nodes animate together into one record |
| 10 | 8-step workflow | `HowItWorks.tsx` | Register → AI Conversation → Documents → AI Processing → AI Summary → Doctor Review → Final Report → Save & Access, presented as a cinematic horizontal/vertical timeline |
| 11 | Patient → MediKiosk → Doctor | `ThreePerspectives.tsx` | MediKiosk's signature three-entity visual, connected by animated lines (vertical on mobile, horizontal on desktop) |
| 12 | AI understanding | `Understanding.tsx` | Shows how a spoken/typed answer becomes a structured chief complaint, duration, and pattern — with an explicit "AI-assisted, doctor-verified" disclaimer |
| 13 | Document intelligence | `DocumentIntelligence.tsx` | Sample document scan → extract → structure sequence, clearly labeled as a demo, not a live OCR pipeline |
| 14 | Doctor review | `DoctorReview.tsx` | AI Draft → Doctor Review → Edit → Verify → Final Record, reinforcing that AI only ever prepares and a doctor always decides |
| 15 | Patient timeline | `PatientTimeline.tsx` | Animated year-by-year history timeline |
| 16 | Health ID + closing | `HealthIdClosing.tsx` | Scannable Health ID card (real QR via `qrcode.react`) + closing statement and CTA into Phase 3 |

### i18n additions

`home.phase2.*` (problem, unify, workflow, perspectives, understand, documentIntel, doctorReview, timeline, healthId, closing) was added to `TranslationSchema` and fully translated in `en.ts`, `bn.ts`, and `hi.ts`.

---

## Part B, Phase 3 — Who it's for, impact, trust, and close

Scope, per the brief: Sections 17–28 — the final stretch of the homepage, ending on the site-wide footer.

### Sections built (`src/pages/public/home/`)

| # | Section | File | Notes |
|---|---|---|---|
| 17 | Who MediKiosk is for | `ForWho.tsx` | Premium animated role slider (fade/slide/scale, not a basic carousel) across Patients, Doctors, Hospitals & Clinics, Healthcare Teams, Community Health, and AYUSH Practitioners; tap-based tabs, no hover dependency |
| 18 | Organization story | `OrgStory.tsx` | Cinematic Patient → MediKiosk → Doctor → MediKiosk → Healthcare Team → MediKiosk sequence on a dark backdrop, connected by a vertical animated thread |
| 19 | Use cases | `UseCases.tsx` | Large visual panel (First Consultation → Digital Health Record, 8 items) that swaps content as a numbered index is tapped or auto-advances |
| 20 | Why MediKiosk? | `WhyMediKiosk.tsx` | Staggered numbered grid: Patient First, Doctor in Control, One Longitudinal Story, Multilingual by Design, AI-Assisted/Human-Verified, Secure by Design |
| 21 | Impact | `Impact.tsx` | Conceptual "less → more" statements (less fragmented information → more context, etc.) with large typography — **no fabricated clinical statistics**, by design |
| 22 | Trust & safety | `TrustSafety.tsx` | Patient → AI Assistance → Structured Information → Doctor Review → Verified Record flow, plus five accountability principles (Consent Management, Role-Based Access, Audit Logs, Secure Health Records, Doctor Verification) |
| 23 | Security & privacy | `Security.tsx` | A calm, single breathing lock glyph plus five practice cards (consent-based access, role-based permissions, etc.) — makes no claim about specific encryption or compliance certifications not yet implemented |
| 24 | ABHA / ABDM | `AbhaAbdm.tsx` | ABHA, ABDM, Health ID, QR Access, Interoperability — every claim is framed as **"Integration Ready"**, never as a live, implemented integration |
| 25 | FAQ | `Faq.tsx` | Fully keyboard-accessible accordion (`aria-expanded`, `aria-controls`, real `<button>` triggers), one open item at a time; includes the required careful answers on diagnosis ("Clinical decisions remain with qualified healthcare professionals") and ABHA status |
| 26 | Final patient message | `FinalMessage.tsx` | "Your health story matters." → three supporting lines → "Meet MediKiosk." → Get Started / Explore How It Works |
| 27 | Organization CTA | `OrgCta.tsx` | "Ready to rethink patient intake?" with For Patients / For Doctors / For Organizations entry points, linking to future placeholder routes |
| 28 | Footer | `components/layout/Footer.tsx` | Rebuilt as the premium, site-wide footer (rendered by `PublicLayout` on every public page, so it isn't duplicated at the bottom of the homepage): brand tagline, Product / Company / Trust link columns, and a live language switcher |

### Design and copy guardrails followed

- **No fabricated clinical statistics** anywhere in Section 21 (Impact) — every statement is conceptual ("less repetition, more continuity"), never a claimed number.
- **No claimed certifications** in Section 23 (Security) — copy is scoped to described practices, with an explicit note that they reflect the current implementation.
- **No live ABHA/ABDM integration claimed** in Section 24 — every reference uses "Integration Ready" and the FAQ answer is explicit that live integration depends on authorized APIs and final implementation.
- **No AI diagnosis claimed** in the FAQ — Section 25 states plainly that clinical decisions remain with qualified healthcare professionals.

### i18n additions

`home.phase3.*` (forWho, orgStory, useCases, whyMediKiosk, impact, trustSafety, security, abha, faq, finalMessage, orgCta, footer) was added to `TranslationSchema` and fully translated in `en.ts`, `bn.ts`, and `hi.ts` — nothing in Phase 3 is hardcoded outside `useTranslation()`.

### Accessibility (Phase 3 specifics)

- The FAQ accordion uses real `<button>` triggers with `aria-expanded`/`aria-controls`, and each answer panel is `role="region"` with `aria-labelledby` pointing back at its trigger.
- The role slider (17) and use-case index (19) use `role="tablist"`/`role="tab"` with `aria-selected`, and are fully operable by tap/click — no interaction is hover-only.
- Every scroll/stagger animation in Phase 3 reuses the existing `ScrollReveal` / `StaggerGroup` system, so `prefers-reduced-motion` support is automatic and consistent with Phases 1–2.
- Horizontal interactions (the use-case index) scroll within a contained, `overflow-x-auto` track and never cause page-level horizontal overflow; on `lg` breakpoints they switch to a vertical list.

### QA performed (project-wide, after Phase 3)

- `npx tsc -b` — no type errors across the whole project
- `npm run build` — production build succeeds (Vite + Rolldown)
- `npx oxlint` on every new/changed file — 0 warnings, 0 errors
- Checked all 12 new sections at desktop and mobile widths, and in the light, dark, and warm themes
- Verified no new section depends on hover-only interaction, and that Sections 17/19/25 are fully keyboard-operable
- Confirmed the homepage still renders Phase 1 and Phase 2 unchanged, with Phase 3 appended directly beneath Section 16 (Health ID + closing) — no earlier sections were rebuilt or modified

---

## Tech stack

- **React 19** + **Vite** + **TypeScript**
- **Tailwind CSS v4** (CSS-first config via `@theme inline`, no `tailwind.config.js` needed)
- **React Router v7** for routing
- **Lucide React** for icons
- **Framer Motion** for the full animation system used across the homepage (reveals, staggers, transitions, the Story Thread, the Phase 3 sliders and accordion)

No other libraries were added, per the brief.

---

## Folder structure

```
src/
  components/
    ui/           Global, reusable primitives (Button, Input, Modal, Toast, ...)
    healthcare/   Domain-specific components (HealthStatusCard, AIIcon, SecureBadge, MedicalIcon)
    layout/       Navbar, Footer, DashboardSidebar, DashboardLayout, PublicLayout, PlaceholderPage
  pages/
    public/       Home, How It Works, Features, 404 (placeholders)
    patient/      Login, Register, Onboarding Success (placeholders), Dashboard (preview)
    doctor/       Login (placeholder), Dashboard (preview)
    admin/        Login (placeholder), Dashboard (preview)
  layouts/        Reserved for future layout variants
  routes/         Central route table (routes/index.tsx)
  data/           Navigation config + mock data used only to preview components
  i18n/           Translation dictionaries (en, bn, hi) + LanguageProvider/useTranslation
  context/        ThemeContext (light/dark/warm) and ToastContext
  hooks/          useOnClickOutside, useMediaQuery
  utils/          cn() class-name helper
  types/          Shared TypeScript types
  assets/         Static assets (currently empty — no external logo image is used)
```

Nothing is a single giant file — every screen composes small, named components from `components/`.

---

## Design system

### Three themes, one token contract

Every color, surface, and border is defined once as a CSS custom property (`--mx-*`) in `src/index.css`, under three selectors:

- `[data-theme="light"]` — **Light Clinical** (production default): calm, clean, off-white surfaces, deep navy text.
- `[data-theme="dark"]` — **Dark**: modern, professional, low-glare navy-black surfaces.
- `[data-theme="warm"]` — **Warm**: friendly, accessible, cream/parchment surfaces for first-time or low-literacy users.

These tokens are mapped into Tailwind v4 via `@theme inline`, so components use ordinary utility classes — `bg-mx-surface`, `text-mx-ink`, `border-mx-border`, `bg-mx-green-soft`, `rounded-mx-lg`, `shadow-mx-md` — and never hardcode a hex value. Switching `data-theme` on `<html>` re-themes the entire app instantly; no component needs to know which theme is active.

The theme is switched at runtime with the `ThemeSwitcher` component (`src/components/ui/ThemeSwitcher.tsx`) and persisted to `localStorage` via `ThemeContext`.

### Color roles

| Token | Role |
|---|---|
| `mx-ink` / `mx-ink-soft` / `mx-ink-muted` | Deep navy text hierarchy |
| `mx-green` / `mx-green-soft` | Primary healthcare accent (actions, positive status) |
| `mx-purple` / `mx-purple-soft` | AI / intelligence accent (AI Assistant, AI-drafted content) |
| `mx-blue` / `mx-blue-soft` | Secondary actions, verified/info status |
| `mx-danger` / `mx-warning` / `mx-success` | Status semantics — always paired with an icon, never color-only |

### Typography

- **Manrope** (`font-display`) — headings, brand wordmark
- **Inter** (`font-body`) — body text, UI
- **IBM Plex Mono** (`font-mono`) — Health IDs, ABHA IDs, and other code-like data

### Signature element

The **MediKiosk mark** (`src/components/ui/Logo.tsx`) is a custom SVG combining a heart silhouette with a folded heartbeat/pulse line — referencing both vital signs and a digital health record — built entirely in code (no external logo image, as required). The same rounded-square "icon chip" treatment (`MedicalIcon`) is reused across every feature, quick action, and dashboard tile for visual consistency, echoing the reference image's component language.

---

## Global components (`src/components/ui`)

Button, Input, Select, Textarea, Modal, Toast (+ `ToastProvider`/`useToast`), Badge, StatusBadge, Card (+ `CardHeader`/`CardTitle`), SectionHeader, LanguageSelector, ThemeSwitcher, Logo, StepIndicator, ProgressBar, Avatar, EmptyState, LoadingState.

## Healthcare components (`src/components/healthcare`)

HealthStatusCard, MedicalIcon, AIIcon (pulsing "AI-assisted" marker, respects `prefers-reduced-motion`), SecureBadge (consent/privacy reassurance).

## Layout components (`src/components/layout`)

Navbar + Footer (public marketing shell), DashboardSidebar + DashboardLayout (shared shell for patient/doctor/admin dashboards, collapses to a slide-over drawer on mobile), PlaceholderPage (used for every out-of-scope route).

---

## Multilingual (i18n)

Three languages ship today: **English**, **বাংলা (Bengali)**, **हिन्दी (Hindi)**.

- `src/i18n/en.ts` defines the `TranslationSchema` interface and the English strings.
- `src/i18n/bn.ts` / `src/i18n/hi.ts` implement the same interface — TypeScript will error if a translation is missing a key.
- `src/i18n/index.tsx` exports `LanguageProvider` and `useTranslation()`, plus `LANGUAGE_OPTIONS` for the `LanguageSelector` dropdown.
- Language choice persists to `localStorage` and sets `<html lang>`.

To add a language: create `src/i18n/xx.ts` implementing `TranslationSchema`, register it in the `dictionaries` map and `LANGUAGE_OPTIONS` in `src/i18n/index.tsx`. No component changes needed.

No user-facing strings are hardcoded inside components — they're all read from `t.*` via `useTranslation()`.

---

## Accessibility

- High-contrast text tokens in every theme; status is always icon **+** text, never color alone (`StatusBadge`).
- Every interactive element has a visible `:focus-visible` ring (`--mx-focus-ring`, themed per palette).
- Form controls (`Input`, `Select`, `Textarea`) always render a real `<label>`, wire up `aria-describedby` for hints/errors, and use `aria-invalid`.
- Modal is a proper `role="dialog"` with `aria-modal`, closes on `Escape`, and locks background scroll.
- Toasts announce via `aria-live="polite"`.
- Touch targets are comfortably sized (36–48px) throughout, aimed at elderly and stressed users on mobile.
- `prefers-reduced-motion` is respected globally (`src/index.css`) and individually in the `AIIcon` pulse.

---

## Routes (Part A foundation)

| Route | Status in Part A |
|---|---|
| `/` | **Part B — complete** — animated homepage, Phases 1–3 (Sections 01–28) |
| `/how-it-works` | Placeholder |
| `/features` | Placeholder |
| `/for-patients` / `/for-doctors` / `/for-organizations` | Placeholder — linked from Section 27 (Organization CTA), resolve to the 404 page today |
| `/about` / `/contact` / `/privacy` / `/consent` / `/security` | Placeholder — linked from the Section 28 footer, resolve to the 404 page today |
| `/patient/login` | Placeholder |
| `/patient/register` | Placeholder |
| `/patient/onboarding-success` | Placeholder |
| `/patient/dashboard` | **Preview build** — real layout + mock data, wired to the design system |
| `/doctor/login` | Placeholder |
| `/doctor/dashboard` | **Preview build** — real layout + mock data |
| `/admin/login` | Placeholder |
| `/admin/dashboard` | **Preview build** — real layout + mock data |
| `*` | 404 page |

Dashboard "preview builds" exist to prove the sidebar layout, cards, badges, empty states, and i18n/theme system all work together end-to-end — they use mock data only (`src/data/mockPatient.ts`) and contain no real logic, API calls, or auth.

---

## Responsive foundation

Every layout is built mobile-first with Tailwind breakpoints (`sm`, `lg`). The dashboard sidebar becomes a slide-over drawer below `lg`; the public navbar collapses into a mobile menu below `lg`. Cards and grids reflow from 1 → 2 → 4 columns depending on viewport.

---

## Mocked functionality

Nothing in Part A talks to a real backend. `src/data/mockPatient.ts` holds a single mock patient/doctor identity used only to preview the Health ID card, avatar initials, and dashboard headers. All lists (history, medicines, appointments, patient queue) render `EmptyState` since there is no real data yet.

---

## What Part C will add

Part B (Phases 1–3) is now a complete, animated homepage — nothing on `/` is left unbuilt per the brief. Not yet built, and explicitly out of scope for Part B:

- Real routes behind the Section 27/28 placeholder links (`/for-patients`, `/for-doctors`, `/for-organizations`, `/about`, `/contact`, `/privacy`, `/consent`, `/security`)
- Patient registration, login, and onboarding (Health ID issuance + QR) as real, working flows
- Doctor and Admin login flows
- The full AI Health Assistant conversation flow (voice + touch) as a real interactive product, not a homepage mock
- Document upload/OCR, medical timeline, red flag detection
- AYUSH mode, live ABHA/ABDM integration (Section 24 is intentionally "Integration Ready" only)
- Patient report generation and doctor verification flow
- Backend, database, and API integrations

Part B intentionally stops before any of the above.
