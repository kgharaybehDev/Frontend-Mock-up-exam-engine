# ProExam – Proposed Angular Project Structure

```
FE_ExamSimulator/
├── .angular/                       # Angular CLI cache (generated)
├── .vscode/                        # Workspace settings
│   ├── extensions.json
│   └── settings.json
├── node_modules/                   # Dependencies (generated)
├── public/                         # Static assets (favicon, etc.)
├── src/
│   ├── app/
│   │   ├── app.config.ts           # Application config (providers, routing mode)
│   │   ├── app.routes.ts           # Root routes (lazy-loading feature shells)
│   │   ├── app.component.ts        # Root component (shell with router-outlet)
│   │   │
│   │   ├── core/                   # Singleton services, guards, interceptors
│   │   │   ├── guards/             # Functional route guards (auth, role)
│   │   │   │   ├── auth.guard.ts
│   │   │   │   ├── role.guard.ts
│   │   │   │   └── exam-in-progress.guard.ts
│   │   │   ├── interceptors/       # HTTP interceptors
│   │   │   │   ├── auth.interceptor.ts
│   │   │   │   ├── error.interceptor.ts
│   │   │   │   └── loading.interceptor.ts
│   │   │   ├── services/           # App-wide singleton services
│   │   │   │   ├── auth.service.ts
│   │   │   │   ├── exam-engine.service.ts
│   │   │   │   ├── timer.service.ts
│   │   │   │   └── theme.service.ts
│   │   │   ├── tokens/             # Injection tokens
│   │   │   │   └── api-url.token.ts
│   │   │   └── models/             # Core domain models & interfaces
│   │   │       ├── user.model.ts
│   │   │       ├── exam.model.ts
│   │   │       ├── question.model.ts
│   │   │       ├── result.model.ts
│   │   │       └── pagination.model.ts
│   │   │
│   │   ├── shared/                 # Reusable UI components, pipes, directives
│   │   │   ├── components/         # Dumb / presentational components
│   │   │   │   ├── button/
│   │   │   │   ├── card/
│   │   │   │   ├── modal/
│   │   │   │   ├── spinner/
│   │   │   │   ├── progress-bar/
│   │   │   │   └── timer-display/
│   │   │   ├── layouts/            # Layout wrappers
│   │   │   │   ├── auth-layout/    # Centered card layout for login/register
│   │   │   │   └── dashboard-layout/ # Sidebar + header + outlet
│   │   │   ├── directives/         # Reusable attribute directives
│   │   │   │   ├── highlight.directive.ts
│   │   │   │   └── tooltip.directive.ts
│   │   │   ├── pipes/              # Pure pipes
│   │   │   │   ├── time-format.pipe.ts
│   │   │   │   ├── question-status.pipe.ts
│   │   │   │   └── safe-html.pipe.ts
│   │   │   └── forms/              # Shared form components
│   │   │       ├── input-field/
│   │   │       ├── select-field/
│   │   │       └── form-errors/
│   │   │
│   │   ├── features/               # Feature modules (lazy-loaded)
│   │   │   │
│   │   │   ├── auth/               # Authentication & Registration
│   │   │   │   ├── login/
│   │   │   │   ├── register/
│   │   │   │   ├── forgot-password/
│   │   │   │   └── auth.routes.ts
│   │   │   │
│   │   │   ├── candidate/          # Candidate Dashboard
│   │   │   │   ├── dashboard/           # Home — stats, upcoming exams
│   │   │   │   ├── exam-list/           # Browsable list of available exams
│   │   │   │   ├── exam-results/        # History of past attempts
│   │   │   │   ├── profile/             # Edit personal info
│   │   │   │   └── candidate.routes.ts
│   │   │   │
│   │   │   ├── expert/             # Expert / Instructor Panel
│   │   │   │   ├── dashboard/           # Overview & quick actions
│   │   │   │   ├── question-bank/       # CRUD for questions
│   │   │   │   │   ├── question-list/
│   │   │   │   │   ├── question-editor/
│   │   │   │   │   └── question-preview/
│   │   │   │   ├── exam-builder/        # Create/edit exams
│   │   │   │   │   ├── exam-editor/
│   │   │   │   │   └── exam-publish/
│   │   │   │   ├── candidate-results/   # Review candidate performance
│   │   │   │   ├── grading/             # Manual grading (essays)
│   │   │   │   └── expert.routes.ts
│   │   │   │
│   │   │   ├── admin/              # System Administration
│   │   │   │   ├── dashboard/           # System-wide metrics
│   │   │   │   ├── user-management/     # CRUD users, roles
│   │   │   │   ├── category-manager/    # Manage exam categories/topics
│   │   │   │   ├── system-config/       # Global settings
│   │   │   │   ├── logs-viewer/         # Audit logs
│   │   │   │   └── admin.routes.ts
│   │   │   │
│   │   │   └── exam-engine/        # The core exam-taking experience
│   │   │       ├── exam-session/        # Active exam state machine
│   │   │       │   ├── exam-session.component.ts
│   │   │       │   ├── exam-session.service.ts
│   │   │       │   └── exam-session.store.ts
│   │   │       ├── question-renderer/   # Dynamic question display
│   │   │       │   ├── question-renderer.component.ts
│   │   │       │   ├── mcq-question/    # Multiple choice
│   │   │       │   ├── hotspot-question/# Image hotspot
│   │   │       │   ├── drag-drop-question/
│   │   │       │   └── essay-question/
│   │   │       ├── navigation/          # Question palette, progress
│   │   │       ├── timer/               # Countdown widget
│   │   │       ├── review-screen/       # End-of-exam review
│   │   │       └── exam-engine.routes.ts
│   │   │
│   │   ├── not-found/              # 404 page
│   │   │   └── not-found.component.ts
│   │   │
│   │   └── styles/                 # Global style utilities
│   │       ├── _variables.scss         # CSS custom properties / tokens
│   │       ├── _reset.scss
│   │       ├── _typography.scss
│   │       └── _utilities.scss
│   │
│   ├── assets/                    # Images, icons, fonts
│   │   ├── images/
│   │   ├── icons/
│   │   └── fonts/
│   │
│   ├── index.html                 # Main HTML entry
│   ├── main.ts                    # Browser bootstrap
│   └── styles.scss                # Global stylesheet entry (imports variables, reset, etc.)
│
├── angular.json                   # Angular CLI config
├── package.json
├── tsconfig.json
├── tsconfig.app.json
├── tsconfig.spec.json
└── .gitignore
```
