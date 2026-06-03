# ProExam Simulator — Execution Plan

## Understanding of the Architecture

**Domain:** A simulation platform for nursing license exams (QCHP / DHA / HAAD / Prometric).  
**Users:** Candidates (test takers), Experts (question/exam creators), Admins (system managers).  
**Role-based flow:** Auth → role-redirect → dashboard(s) → exam engine.

### Route Tree (from `frontend_design_plan.md`)

| Route               | Role     | Purpose                          |
|---------------------|----------|----------------------------------|
| `/auth/*`           | Public   | Login, register, forgot password |
| `/candidate/*`      | Candidate| Dashboard, exam list, results    |
| `/expert/*`         | Expert   | Question bank, exam builder      |
| `/admin/*`          | Admin    | User mgmt, categories, logs      |
| `/exam/*`           | Candidate| The live exam session            |

### Key Screen States (per `frontend_design_plan.md`)
- **Login**: email + password fields, validation, role-appropriate redirect.
- **Candidate Dashboard**: stats cards, upcoming exams list, quick-start.
- **Exam Engine**: question renderer, palette navigation, timer, controls.
- Each feature screen has loading, empty, error, and success substates.

### Core Data Models
- `User` (id, name, email, role, avatar)
- `Exam` (id, title, description, category, duration, passingScore, questionCount)
- `Question` (id, type[MCQ|Hotspot|DragDrop|Essay], stem, options, correctAnswer, explanation)
- `ExamAttempt` (id, userId, examId, startedAt, submittedAt, answers[], score, passed)

---

## Phases

### Phase 0 — Environment & Scaffolding
1. Create the Angular 19 workspace with `ng new` (zoneless, standalone, SCSS).
2. Install additional deps (Angular CDK, Angular Material if desired).
3. Set up linting (ESLint + Angular ESLint), Prettier configuration.
4. Create the folder structure as documented in `Angular_PROJECT_MAP.md`.
5. Set up global styles (`_variables.scss` with design tokens from `frontend_design_plan.md`).

### Phase 1 — Core Infrastructure
1. **Auth** — `AuthService`, `AuthGuard`, `AuthInterceptor` (token storage, refresh, redirect).
2. **Role Guard** — `RoleGuard` for route-level authorization.
3. **Theme Service** — CSS variable toggling (light/dark or brand customization).
4. **API Base** — `HttpClient` wrapper, error handling interceptor, loading interceptor.

### Phase 2 — Shared UI Library
1. Build reusable components (`ButtonComponent`, `CardComponent`, `ModalComponent`, `SpinnerComponent`, `ProgressBarComponent`, `TimerDisplayComponent`).
2. Build layout shells (`AuthLayoutComponent` (centered), `DashboardLayoutComponent` (sidebar + header)).
3. Build form primitives (`InputFieldComponent`, `SelectFieldComponent`, `FormErrorsComponent`).
4. Build shared pipes and directives.

### Phase 3 — Auth Feature (Public)
1. Login page (`LoginComponent`) — form, validation, API call, redirect.
2. Register page (`RegisterComponent`) — form with confirm password.
3. Forgot Password page — email input, success toast.

### Phase 4 — Candidate Feature
1. **Dashboard** — stats (completed exams, average score, upcoming), quick-start button.
2. **Exam List** — paginated table/cards with filters (category, status, date).
3. **Exam Results** — history table with score breakdown, pass/fail badge.
4. **Profile** — edit name, avatar, password form.

### Phase 5 — Expert Feature
1. **Dashboard** — metrics (questions created, exams published, active candidates).
2. **Question Bank** — list + CRUD editor with rich text / image upload.
   - MCQ, Hotspot, Drag & Drop, Essay editors.
3. **Exam Builder** — compose exam from question pool, set duration/passing score.
4. **Candidate Results** — view submissions, grade essays manually.
5. **Grading** — inline essay scoring interface.

### Phase 6 — Admin Feature
1. **Dashboard** — system-wide stats.
2. **User Management** — CRUD with role assignment, enable/disable.
3. **Category Manager** — tree CRUD for exam categories/topics.
4. **System Config** — global settings (passing threshold, time limits, etc.).
5. **Audit Logs** — paginated log viewer with filters.

### Phase 7 — Exam Engine (Core)
1. **Session State Machine** — `ExamSessionService` + signal-based store.
   - States: idle → loading → ready → in_progress → paused → reviewing → submitted → completed.
2. **Question Renderer** — dynamic component switch by question type.
3. **Navigation Palette** — grid of question numbers with status (unanswered/answered/review/hidden).
4. **Timer** — synchronized countdown with auto-submit on expiry.
5. **Review Screen** — final review before submission.
6. **Result Screen** — score, pass/fail, answer review with explanations.

### Phase 8 — Testing & Polish
1. Unit tests for core services and stores.
2. Component tests for shared components and key feature components.
3. E2E smoke tests for critical paths (login → start exam → submit → review).
4. Performance audit (lazy loading, change detection, bundle size).
5. Final polish (loading skeletons, empty states, error toasts, a11y).

---

## Clarification Questions

1. **UI Framework** — Should we use Angular Material for the component library, or build entirely custom components?
2. **Backend** — Is there an existing REST API we are connecting to, or will we stub/mock data initially?
3. **Authentication flow** — JWT with refresh tokens? OAuth2? Simple session cookie?
4. **Internationalization** — Is i18n needed (Arabic/English for the region)?
5. **Analog or Standalone** — The docs describe `@analogjs/router` as an alternative — should we use the standard Angular router or Analog file-based routing?
6. **State Management** — Is in-memory signal-based store sufficient, or do we need a persistent store (e.g., localStorage for exam progress)?
7. **Image handling** — For hotspot questions: will images be uploaded or referenced by URL?
