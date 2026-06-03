# ProExam — Progress Snapshot

> **Commit:** `5005e70` — `feat: scaffolded project structure, core infrastructure, and API services`
> **Date:** 2026-06-04
> **Next action:** UI design refinement (break), then Phase 2: Shared UI Library

---

## What is Functional ✅

### Environment & Tooling
- Angular CLI 19.0.2 workspace with standalone components, SCSS, routing
- Zoneless change detection via `provideExperimentalZonelessChangeDetection()`
- Tailwind CSS v3 with PostCSS configured
- `@angular/localize` installed (ready for Arabic/English i18n)
- Full folder structure as per `Angular_PROJECT_MAP.md`

### Core Infrastructure
| Component | Status | Details |
|-----------|--------|---------|
| **Auth Service** | ✅ | `login`, `register`, `refresh`, `logout`, JWT + refresh token stored in localStorage, current user signal |
| **Auth Guard** | ✅ | Redirects unauthenticated users to `/auth/login` |
| **Role Guard** | ✅ | Factory that restricts routes by role(s) — used for Expert/Admin |
| **Auth Interceptor** | ✅ | Auto-attaches Bearer token; handles 401 → token refresh → retry |
| **Error Interceptor** | ✅ | Logs API errors to console |
| **Loading Interceptor** | ✅ | Exposes `isLoading` signal for global spinner cue |
| **API Base URL Token** | ✅ | Injection token for `API_BASE_URL`, configured via `environment.ts` |
| **Global Design Tokens** | ✅ | CSS custom properties in `_variables.scss` (colors, radii, shadows, fonts) |

### API DTOs (from Swagger)
| Domain | Models |
|--------|--------|
| Auth | `LoginRequestDto`, `LoginResponseDto`, `LoginUserDto`, `RegisterRequestDto`, `RegisterResponseDto`, `RefreshTokenRequestDto`, `RefreshTokenResponseDto`, `LogoutRequestDto` |
| User | `UserManagementDto`, `UpdateUserStatusDto`, `CandidateDto`, `UpdateCandidateDto`, `ExpertDto` |
| Exam | `ExamDto`, `ExamCompositionDto`, `ExamListItemDto`, `ExamDetailDto`, `ExamCompositionInfo`, `CreateExamDto` |
| Question | `QuestionDto`, `QuestionAttachmentDto`, `CreateQuestionDto`, `TestBankDto`, `TopicDto` |
| Attempt | `AttemptStartDto`, `AttemptResumeDto`, `AttemptQuestionDto`, `AttemptSubmitResultDto`, `AutosaveRequestDto`, `FlagRequestDto`, `SubmitFinalDto`, `AttemptSummaryDto`, `CandidateAttemptDto` |
| Payment | `PaymentDto`, `PaymentInitRequestDto`, `PaymentInitiateResultDto`, `CouponDto`, `CouponValidateResultDto`, `CreateCouponDto` |
| Admin | `AuditLogDto`, `NotificationDto`, `SendNotificationDto` |
| Generic | `ApiResponse<T>`, `PagedResult<T>` wrappers for all endpoints |

### Routing & Navigation
| Route | Guard | Features |
|-------|-------|----------|
| `/auth/*` | Public | Login, Register, Forgot Password |
| `/candidate/*` | Auth | Dashboard, Exam List, Results, Profile |
| `/expert/*` | Auth + Expert/Admin | Dashboard, Question Bank (CRUD), Exam Builder, Results, Grading |
| `/admin/*` | Auth + Admin | Dashboard, User Management, Categories, Config, Audit Logs |
| `/exam/*` | Auth | Exam Session |
| `/**` | — | 404 Not Found |

All routes use `loadComponent` / `loadChildren` for lazy chunking. Build verified — all chunks generated successfully.

### Layout Components
- `AuthLayoutComponent` — centered card layout for login/register pages
- `DashboardLayoutComponent` — sidebar + header shell for authenticated pages

### Placeholder Components
Every lazy-loaded route has a minimal placeholder component (renders a heading). These are ready to be fleshed out with real UI in subsequent phases.

---

## What is Pending ⏳

### Phase 2 — Shared UI Library
- Reusable components: `ButtonComponent`, `CardComponent`, `ModalComponent`, `SpinnerComponent`, `ProgressBarComponent`, `TimerDisplayComponent`
- Form primitives: `InputFieldComponent`, `SelectFieldComponent`, `FormErrorsComponent`
- Pipes: `TimeFormatPipe`, `QuestionStatusPipe`, `SafeHtmlPipe`
- Directives: `HighlightDirective`, `TooltipDirective`

### Phase 3 — Auth Feature
- Full login page with form validation, API call, role-based redirect
- Registration page with confirm password
- Forgot password flow

### Phase 4 — Candidate Feature
- Dashboard with stats cards, upcoming exams
- Exam list with pagination/filters
- Exam results history
- Profile editing

### Phase 5 — Expert Feature
- Question bank CRUD (MCQ, Hotspot, DragDrop, Essay)
- Exam builder with composition
- Candidate results review and essay grading

### Phase 6 — Admin Feature
- User management CRUD
- Category/topic manager
- System configuration
- Audit log viewer

### Phase 7 — Exam Engine (Core)
- Session state machine (idle → loading → in_progress → submitted)
- Dynamic question renderer per type
- Navigation palette with status tracking
- Synchronized timer with auto-submit
- Review screen and result display
- LocalStorage persistence for exam progress

### Phase 8 — Testing & Polish
- Unit tests for core services and stores
- Component tests for shared and feature components
- E2E smoke tests
- Performance audit and a11y polish

---

## Key Configuration
- **API Base URL:** `http://localhost:5038` (dev) / `https://api.proexam.com` (prod)
- **Auth:** JWT + Refresh Token (stored in `localStorage`)
- **State:** Signal-based in-memory + `localStorage` for exam progress persistence
- **i18n:** `@angular/localize` installed (Arabic/English), not yet configured
