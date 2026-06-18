# AGENTS.md — Frontend ProExam

## Project
- **Name**: Frontend-Mock-up-exam-engine (ProExam)
- **Path**: `/home/user/Downloads/projects/Frontend-Mock-up-exam-engine`
- **Backend**: `/home/user/Downloads/projects/Backend-Mock-up-exam-engine` (API at `/api/v1/`)

## Tech Stack
- Angular 19 standalone, `provideExperimentalZonelessChangeDetection()` — no NgModule, no zone.js
- Signals (`signal()`, `computed()`, `input()`, `output()`, `model()`) for state
- New control flow only: `@if`/`@else`, `@for`/`@empty`, `@switch`/`@case`, `@let`
- `inject()` for DI — never constructor injection
- Tailwind SCSS with `@layer components` for reusable UI patterns
- Typed reactive forms via `NonNullableFormBuilder`
- `Resource` API (`httpResource` / `rxResource`) preferred over raw `HttpClient.subscribe()`
- Interceptors: auth, error, loading (all functional)

## Domain Services (replacing AdminApiService — DELETED)
Core services at `src/app/core/services/`:
- `question.service.ts` — Question CRUD, toggle, attachments
- `topic.service.ts` — Topic CRUD, toggle
- `test-bank.service.ts` — TestBank CRUD, toggle
- `grading.service.ts` — Attempt listing, grading submission
- `exam.service.ts` — Published exam listing/detail
- `auth.service.ts` — Authentication
- `profile.service.ts` — User profile
- `dashboard.service.ts` — Dashboard stats
- `exam-progress.service.ts` — Exam session progress + localStorage persistence

All API responses wrapped in `ApiResponse<T>` via `src/app/core/models/api-response.model.ts`.

## Roles
- **Admin**: Full access, sidebar layout (`/admin/...`)
- **Expert**: Top nav layout (`/expert/...`), blue Tailwind palette
- **Candidate**: `/candidate/...`
- **Auth**: `/auth/login`, `/auth/register`

## Expert Feature (B-028, Sprint 10)
- Layout: `src/app/features/expert/layout/expert-layout.component.ts` — top nav only
- Routes: `src/app/features/expert/expert.routes.ts` — layout parent with 13 child routes
- Pages: dashboard, topics (list/create/edit/detail), questions (list/editor/preview), exams (editor/publish), results, grading

## Coding Rules (from RULES.md)
1. Signals primary state — no zone.js
2. `@if`/`@for`/`@switch` only — never `*ngIf`/`*ngFor`/`*ngSwitch`
3. Standalone components — never NgModule
4. `inject()` only — never constructor DI
5. `Resource` API preferred over raw HttpClient
6. `class="..."` + `[class.modifier]` — never `[class]="..."` dynamic override
7. Unique generated IDs for label-input pairs (accessibility)
8. Exam progress persisted to localStorage

## UI Design (Expert)
- Blue palette: blue-600 primary, blue-50 background, blue-800 hover/active
- Top navigation (NOT sidebar)
- Reusable components via `@layer components` in `styles.scss`
- Design system skill at `.opencode/skills/ui-ux-pro-max/`

## Skills to Use
- `brainstorming` — before any creative/architectural work
- `writing-plans` — before multi-step implementation
- `subagent-driven-development` — executing independent tasks
- `dispatching-parallel-agents` — parallel independent work
- `test-driven-development` — RED/GREEN/REFACTOR for all features
- `ui-ux-pro-max` — for UI design decisions
- `requesting-code-review` — after each task before merge
- `verification-before-completion` — before claiming any work done
- `finishing-a-development-branch` — at sprint completion

## Critical: Always Read These First
Before writing any code, ALWAYS read:
1. `RULES.md` — Angular 19 strict rules
2. `llms-full.txt` — UI best practices
3. `src/app/core/models/` — existing model types
4. This `AGENTS.md` — project context

## Backend API Contract
- Prefix: `/api/v1/`
- Auth: JWT Bearer, roles: Admin/Expert/Candidate
- Response shape: `{ success, data, error, correlationId }`
- Pagination: `{ items, totalCount, page, pageSize }`
- 201 Created, 204 NoContent, errors as ProblemDetails
