# ProExam Simulator — Frontend UX/UI Architecture & Design Plan

**Phase:** 5.0 — Design Planning  
**Target Stack:** Angular 18 (Standalone Components) + Tailwind CSS v4 + PrimeNG 18  
**Date:** 2026-06-03  

---

## 1. Target Audience & Design Psychology

### Primary Users
- **Nursing candidates** preparing for Prometric exams in **Qatar (QCHP)** and **UAE (DHA/HAAD)**.
- Age range: 22–40, diverse cultural backgrounds, non-native English speakers.
- High-stakes testing context — exams determine licensure eligibility.

### Design Psychology Principles

| Principle | Application |
|---|---|
| **Reduce cognitive load** | Clean layouts, generous whitespace, one primary action per screen. No competing CTAs. |
| **Lower exam anxiety** | Rounded corners (8–12px), warm neutrals, progress indicators, gentle micro-animations (e.g., pulsing timer when <5 min). |
| **Support long sessions** | Max content width 720px for reading, line-height 1.7, serif-free sans-serif (Inter), high contrast (WCAG AA min). |
| **Build trust** | Consistent iconography, clear system status (saved/unsaved), honest error messages with plain-language explanations. |
| **Reduce errors** | Large touch targets (min 44×44px), obvious form validation, confirmation dialogs for destructive actions. |
| **Mobile-first** | Every screen designed from 360px up; exam engine fully functional on phone viewport. |

### Typography

| Element | Face | Weight | Size Scale |
|---|---|---|---|
| Body | Inter | 400 | 14–16px |
| Headings | Inter | 600–700 | 18–32px |
| Code/Mono | JetBrains Mono | 400–500 | 13–14px |
| Timer digits | JetBrains Mono | 700 | 24–48px |

Line-height: 1.7 (body), 1.3 (headings). Letter-spacing: 0.01em (body), –0.02em (headings).

---

## 2. Design Token & Color Palette

### Light Mode (default)

| Token | Hex | Usage |
|---|---|---|
| `--color-primary` | `#0F6CBD` | Buttons, links, active nav |
| `--color-primary-hover` | `#0B5399` | Hover states |
| `--color-primary-light` | `#E8F0FE` | Selected rows, badges |
| `--color-secondary` | `#1E8449` | Success, correct answers, passed |
| `--color-accent` | `#E67E22` | Warnings, flagged items, pending |
| `--color-danger` | `#C0392B` | Errors, incorrect answers, failed |
| `--color-bg` | `#FAFBFC` | Page background |
| `--color-surface` | `#FFFFFF` | Cards, modals, sidebar |
| `--color-surface-hover` | `#F3F4F6` | Row hover, dropdown items |
| `--color-border` | `#D1D5DB` | Dividers, input borders |
| `--color-text-primary` | `#1F2937` | Body text |
| `--color-text-secondary` | `#6B7280` | Labels, meta, placeholders |
| `--color-text-inverse` | `#FFFFFF` | Text on primary buttons |

### Dark Mode

| Token | Hex |
|---|---|
| `--color-bg` | `#111827` |
| `--color-surface` | `#1F2937` |
| `--color-surface-hover` | `#374151` |
| `--color-border` | `#4B5563` |
| `--color-text-primary` | `#F9FAFB` |
| `--color-text-secondary` | `#9CA3AF` |

Primary and accent hues remain the same; only luminance shifts.

### Color Semantics by Context

| Context | Color |
|---|---|
| Correct answer | `--color-secondary` (#1E8449) |
| Incorrect answer | `--color-danger` (#C0392B) |
| Flagged question | `--color-accent` (#E67E22) |
| In-progress exam | `--color-primary` (#0F6CBD) |
| Expired/past due | `--color-danger` (#C0392B) |
| Draft (expert) | `--color-text-secondary` (#6B7280) |
| Published (expert) | `--color-secondary` (#1E8449) |
| Archived (expert) | `--color-accent` (#E67E22) |

### Responsive Breakpoints

| Name | Min Width | Target |
|---|---|---|
| `xs` | 0 | Mobile portrait |
| `sm` | 640px | Mobile landscape |
| `md` | 768px | Tablet |
| `lg` | 1024px | Desktop |
| `xl` | 1280px | Wide desktop |
| `2xl` | 1536px | Large monitors (exam engine only) |

---

## 3. Screen Mapping by Role

### 3A — Public / Auth (No Login Required)

| Screen | Endpoints | Description |
|---|---|---|
| Landing Page | — | Hero, feature cards, CTA → Register / Login |
| Login | `POST /api/auth/login` | Email + password form, "Forgot password?" link, social loading state |
| Register | `POST /api/auth/register` | Multi-step: account info → specialization → certification target |
| Forgot Password | `POST /api/auth/forgot-password` | Email input, success confirmation |
| Reset Password | `POST /api/auth/reset-password` | Token + new password form |
| Coupon Validation | `POST /api/coupons/validate` | Enter code → show discount preview before checkout |

### 3B — Candidate Dashboard (Authenticated)

| Screen | Endpoints | Description |
|---|---|---|
| Dashboard Home | `GET /api/exams` (filtered), `GET /api/attempts` (recent) | Overview cards: available exams, in-progress attempts, passed/failed stats |
| Available Exams | `GET /api/exams` | Filterable grid of published exams with price, duration, topics |
| Exam Details | `GET /api/exams/{id}` | Full info: description, topics breakdown, price, "Start Exam" CTA |
| Exam In-Progress | `GET /api/attempts/{id}`, `GET /api/attempts/{id}/current-question`, `POST /api/attempts/{id}/submit-answer`, `POST /api/attempts/{id}/flag` | **The Exam Engine — see Section 3D** |
| Exam Results | `GET /api/attempts/{id}/result`, `GET /api/reports/{id}` | Score card, pass/fail badge, topic breakdown chart, recommendation summary |
| Payment History | `GET /api/payments` | Table: date, exam, amount, coupon, status badges |
| Checkout | `POST /api/payments/checkout`, `POST /api/coupons/validate` | Order summary, coupon input, redirect to HyperPay |
| Payment Callback | `POST /api/payments/webhook`, `GET /api/payments/{id}/status` | Success/failure page after HyperPay redirect |
| Profile | `GET /api/candidates/profile`, `PUT /api/candidates/profile` | Edit name, specialization, certification target, country |
| Change Password | `PUT /api/auth/change-password` | Current + new password form |

### 3C — Expert Panel (Authenticated, Role: Expert)

| Screen | Endpoints | Description |
|---|---|---|
| Expert Dashboard | `GET /api/expert/stats` | Summary: my questions, my exams, pending feedback |
| Question Bank | `GET /api/questions`, `GET /api/questions/{id}`, `POST /api/questions`, `PUT /api/questions/{id}`, `DELETE /api/questions/{id}`, `PATCH /api/questions/{id}/toggle-active` | Filterable table → inline edit or full-page editor |
| Question Editor | (same endpoints) | Rich text editor for body, answer options, correct answer, explanation, difficulty, attachments |
| My Exams | `GET /api/exams` (filtered by expert) | Table of authored exams with status badges |
| Exam Editor | `GET /api/exams/{id}`, `PUT /api/exams/{id}`, `POST /api/exams`, `GET /api/topics` | Compose exam: title, description, duration, pass score, navigation type, select topics + question counts |
| Feedback Inbox | `GET /api/experts/{id}/feedback` | Read/edit feedback on questions |

### 3D — The Exam Engine Interface (Core Screen)

This is the **most critical screen** in the entire application. It must feel like a real Prometric exam.

```
┌──────────────────────────────────────────────────────────────┐
│  Header Bar                                                  │
│  ┌────────────────────────────────────────────────────────┐  │
│  │  ◄ Back/Exit    Exam: NCLEX-RN QBank    ⏱ 01:24:37   │  │
│  │  Progress: ████████░░░░░  12/40  (30%)                 │  │
│  └────────────────────────────────────────────────────────┘  │
│                                                              │
│  Question Area                                               │
│  ┌────────────────────────────────────────────────────────┐  │
│  │  Question 8 of 40                                       │  │
│  │                                                         │  │
│  │  A 35-year-old patient presents with chest pain and    │  │
│  │  diaphoresis... [question text body in Inter 16px,     │  │
│  │  line-height 1.7, max-width 720px]                     │  │
│  │                                                         │  │
│  │  ┌────────────────────────────────────────────────┐    │  │
│  │  │  ○  A. Myocardial infarction                   │    │  │
│  │  │  ○  B. Pulmonary embolism                      │    │  │
│  │  │  ○  C. Aortic dissection                       │    │  │
│  │  │  ○  D. Panic attack                            │    │  │
│  │  └────────────────────────────────────────────────┘    │  │
│  │                                                         │  │
│  │  [Flag for review ★]    [Clear selection]               │  │
│  └────────────────────────────────────────────────────────┘  │
│                                                              │
│  Footer Bar                                                  │
│  ┌────────────────────────────────────────────────────────┐  │
│  │  [◄ Previous]           [Question Palette ▼]   [Next ►]│  │
│  │  Autosaved ✓  (3s ago)                                │  │
│  └────────────────────────────────────────────────────────┘  │
└──────────────────────────────────────────────────────────────┘
```

#### Critical Features

| Feature | Implementation |
|---|---|
| **Timer** | Server-synced countdown. Pulsing red animation when <5 min. Auto-submit on 0. |
| **Progress bar** | Thin (4px), primary color, animated segments. Shows % complete. |
| **Question palette** | Slide-out drawer grid of 40 numbered squares. Green = answered, orange = flagged, gray = unanswered. Click to jump. |
| **Flag toggle** | Star icon, toggles `POST /api/attempts/{id}/flag`. Orange accent when active. |
| **Autosave indicator** | Green checkmark + "Saved Xs ago". Debounced 2s after last change. Connection-loss warning if no response >10s. |
| **Navigation type** | If `Free` — all questions accessible via palette. If `Linear` — no back, palette shows but locked to current and beyond. |
| **Timer sync** | Call `GET /api/attempts/{id}` every 30s to sync server-side remaining time (prevents client tampering). |
| **Mobile layout** | On xs/sm: header collapses, question palette becomes bottom sheet, prev/next move to bottom toolbar. Full exam playable on 360px screen. |

#### Mobile Exam Engine Layout (xs–sm)

```
┌─────────────────────┐
│ ⏱ 00:42:15   12/40 │  ← Compact header (no exam title)
├─────────────────────┤
│                     │
│  Question text...   │
│  (full width)       │
│                     │
│  ○ Option A         │
│  ○ Option B         │
│  ○ Option C         │
│  ○ Option D         │
│                     │
│ [Flag ★] [Clear]   │
├─────────────────────┤
│ [◄Prev] [Palette ▼] │  ← Bottom toolbar
│    [Next ►]  ✅    │
│ Autosaved ✓         │
└─────────────────────┘
```

### 3E — Admin Panel (Authenticated, Role: Admin)

| Screen | Endpoints | Description |
|---|---|---|
| Admin Dashboard | `GET /api/admin/stats`, `GET /api/admin/audit-logs` | System stats, recent audit log entries |
| User Management | `GET /api/admin/users`, `GET /api/admin/users/{id}`, `PUT /api/admin/users/{id}`, `DELETE /api/admin/users/{id}`, `PATCH /api/admin/users/{id}/status` | Table with search, filter by role/status, inline status toggle |
| User Detail | `GET /api/admin/users/{id}`, `GET /api/admin/users/{id}/attempts`, `GET /api/admin/users/{id}/payments` | Full profile view with activity history tabs |
| Coupon Management | `GET /api/coupons`, `POST /api/coupons`, `GET /api/coupons/{id}`, `PUT /api/coupons/{id}`, `DELETE /api/coupons/{id}`, `GET /api/coupons/{id}/usage` | CRUD table, usage tracking column, expiry warnings |
| Audit Log Viewer | `GET /api/admin/audit-logs` | Filterable table with date range, entity type, action type, user search |
| Bulk Notification | `POST /api/notifications/send-bulk` | Composer: select recipient filter (role / specific users), message text, preview count, confirm |
| Expert Management | `GET /api/admin/experts`, `PUT /api/admin/experts/{id}/verify`, `DELETE /api/admin/experts/{id}` | Verify qualifications, remove experts |

---

## 4. Responsiveness Strategy

### Grid System
- Use CSS Grid with `auto-fill` and `minmax()` for card layouts
- Exam engine: single-column at all breakpoints (linear reading layout)
- Dashboard: 1 col (xs), 2 col (md), 3 col (lg)
- Data tables: horizontal scroll on xs, stacked cards on xs (alternative)

### Component Adaptation

| Component | xs (<640) | md (768–1023) | lg (1024+) |
|---|---|---|---|
| Sidebar | Off-canvas drawer | Collapsible | Fixed |
| Question palette | Bottom sheet | Right slide-out | Right slide-out |
| Data table | Card list | Scrollable table | Full table |
| Header | Compact (timer only) | Full | Full |
| Modals | Full-screen | Centered panel | Centered panel |
| Buttons | Full-width stacked | Inline | Inline |

### Touch Optimization
- All interactive elements min 44×44px
- Inputs: min 48px height, 12px padding
- Swipe gestures on mobile: swipe left → next question, swipe right → previous
- Pull-to-refresh on dashboard only (disabled during exam)

---

## 5. AI-Driven Tools Integration Blueprint

### 5A — Core Exam Engine (v0.dev / shadcn)

Use this prompt in **v0.dev** to generate the React/Angular exam engine shell:

```
Generate a mobile-responsive exam engine UI component (Angular 18 standalone + Tailwind CSS v4).

Requirements:
- Single-column layout, max-width 720px, centered
- Top header bar: compact on mobile (shows only timer + question count), full on desktop (also shows exam title + progress bar)
- Progress bar: 4px height, animated segments, primary color #0F6CBD
- Timer: JetBrains Mono bold, 24px on desktop, 18px on mobile. Turn red and pulse when <5 minutes.
- Question area: numbered heading "Question X of Y", body text in Inter 16px line-height 1.7, four radio-button options with large touch targets (min 48px height)
- Below options: "Flag for review" star toggle (orange when active, gray when not) and "Clear selection" link
- Bottom bar: Previous/Next buttons (Previous disabled on first question, Next disabled on last), a "Question Palette" button that opens a slide-out grid showing question statuses (green=answered, orange=flagged, gray=unanswered)
- Autosave indicator: green checkmark with "Saved Xs ago" text, bottom left
- On mobile (max-width 640px): header collapses to just timer+count, bottom bar items fill full width, question palette becomes a bottom sheet (slide up from bottom)
- Use CSS Grid for layout, no JavaScript framework logic required (static HTML/CSS demo)
- Dark mode support via Tailwind dark: variant
- All interactive elements minimum 44×44px touch target
```

### 5B — Candidate Dashboard (Uizard / v0.dev)

```
Generate a candidate exam dashboard layout (Angular 18 + Tailwind CSS v4).

Sections:
1. Top stats bar: 4 cards in a row — "Available Exams" (blue), "In Progress" (orange), "Passed" (green), "Failed" (red). Each card has an icon, number, and label. On mobile, stack to 2 columns.
2. "Continue Where You Left Off" section: horizontal scrollable row of in-progress exam cards. Each card shows exam title, progress percentage bar, time remaining, and a "Resume" button. Card width 280px.
3. "Available Exams" section: grid of exam cards. 1 col on mobile, 2 col on tablet, 3 col on desktop. Each card has: exam title, description (truncated 2 lines), topic count, duration, price, and "Start Exam" button. Disabled if already purchased.
4. "Recent Results" section: table with columns: Date, Exam, Score, Pass/Fail badge, Action (View Report). On mobile, convert to stacked cards.

Color palette:
- Primary: #0F6CBD
- Secondary: #1E8449
- Accent: #E67E22
- Danger: #C0392B
- Background: #FAFBFC
- Card surface: #FFFFFF
- Text primary: #1F2937
- Text secondary: #6B7280

Typography: Inter font, body 14-16px, headings 18-24px.
Dark mode support via Tailwind dark: variant.
All interactive elements min 44×44px.
```

### 5C — Admin User Management Table (shadcn/ui / v0.dev)

```
Generate a data table component for admin user management with the following features:

- Angular 18 standalone component with Tailwind CSS v4
- Table columns: Name, Email, Role (badge: Candidate/Expert/Admin), Status (badge: Active/Disabled/Suspended), Last Login, Actions
- Search input above table that filters by name or email
- Role filter dropdown (All / Candidate / Expert / Admin)
- Status filter dropdown (All / Active / Disabled / Suspended)
- Sortable columns (click header to sort asc/desc, show arrow icon)
- Row actions dropdown: Edit, Change Status, Delete (with confirmation dialog)
- Pagination at bottom: "Showing 1-10 of 47" with page size selector (10/25/50)
- Responsive: on mobile (<768px), rows become stacked cards
- Color tokens: primary #0F6CBD, success #1E8449, warning #E67E22, danger #C0392B
- Dark mode via Tailwind dark: variant
- Empty state: illustration + "No users found" message
- Loading state: skeleton rows with shimmer animation
```

### 5D — Exam Results & Diagnostic Report

```
Generate an exam results/report page (Angular 18 + Tailwind CSS v4).

Layout:
1. Hero section: large pass/fail badge (green checkmark or red X), score percentage in large text (JetBrains Mono, 48px), "You passed!" or "You did not pass" text below.
2. Score breakdown horizontal bar: Correct (green), Incorrect (red), Unanswered (gray). Bar is full-width, segmented proportional to counts.
3. Topic breakdown: vertical list of topics. Each row: topic name, horizontal mini-bar showing correct/incorrect ratio, percentage text right-aligned.
4. Recommendations section: card with bullet list of weak topics to focus on, generated from report data.
5. Action buttons: "Retry Exam", "Review Questions", "Back to Dashboard".
6. On mobile: hero section compacts, bar charts full width, buttons stack full-width.

Colors: same palette as above (primary #0F6CBD, secondary #1E8449, accent #E67E22, danger #C0392B).
Dark mode support.
```

### 5E — Coupon Management CRUD (Admin)

```
Generate an admin coupon management page (Angular 18 + Tailwind CSS v4).

Features:
- Top toolbar: "Create Coupon" button (primary), search input
- Table columns: Code, Discount (e.g. "20%"), Type badge (Percentage/FixedAmount), Max Uses, Used, Expires (date with red text if expired), Status (Active/Expired), Actions
- Create/Edit modal form fields: Code (auto-generate button), Description, Discount Type (radio: Percentage / Fixed Amount), Discount Value, Max Total Uses, Max Uses Per Candidate, Expires At (date picker), Applicability (SiteWide / specific TestBank / specific Exam with autocomplete selector)
- After create, show the code prominently with "Copy to clipboard" button
- Row actions: Edit, View Usage, Delete
- Usage sub-table (expandable row or modal): User, Date, Exam, Discount Applied
- Responsive: cards on mobile
- Dark mode support
```

---

## 6. Design Token CSS Variables (Tailwind Config Reference)

```css
// tailwind.config.js or CSS custom properties
:root {
  --color-primary: #0F6CBD;
  --color-primary-hover: #0B5399;
  --color-primary-light: #E8F0FE;
  --color-secondary: #1E8449;
  --color-accent: #E67E22;
  --color-danger: #C0392B;
  --color-bg: #FAFBFC;
  --color-surface: #FFFFFF;
  --color-surface-hover: #F3F4F6;
  --color-border: #D1D5DB;
  --color-text-primary: #1F2937;
  --color-text-secondary: #6B7280;
  --color-text-inverse: #FFFFFF;
  --font-sans: 'Inter', system-ui, sans-serif;
  --font-mono: 'JetBrains Mono', monospace;
}
```

---

## 7. Route Structure (Angular)

```
/auth/login
/auth/register
/auth/forgot-password
/auth/reset-password

/dashboard                          → Candidate dashboard
/dashboard/exams                    → Available exams
/dashboard/exams/:id                → Exam detail / start
/dashboard/attempt/:id              → Exam engine (in-progress)
/dashboard/attempt/:id/result       → Exam result
/dashboard/attempt/:id/report       → Diagnostic report
/dashboard/payments                 → Payment history
/dashboard/checkout                 → Checkout page
/dashboard/payment/:id/status       → Payment status
/dashboard/profile                  → Candidate profile

/expert/dashboard                   → Expert dashboard
/expert/questions                   → Question bank
/expert/questions/new               → Question editor
/expert/questions/:id/edit          → Question editor
/expert/exams                       → My exams
/expert/exams/new                   → Exam editor
/expert/exams/:id/edit              → Exam editor
/expert/feedback                    → Feedback inbox

/admin/dashboard                    → Admin dashboard
/admin/users                        → User management
/admin/users/:id                    → User detail
/admin/coupons                      → Coupon management
/admin/audit-logs                   → Audit log viewer
/admin/notifications                → Bulk notification
/admin/experts                      → Expert management

/                                  → Redirect to /dashboard or landing
```

---

## 8. Key UX Flows

### Authentication Flow
```
Landing → Login → [JWT stored in HttpOnly cookie + in-memory] → Redirect to role-based dashboard
           Register → Email verification (future) → Redirect to login
```

### Exam Lifecycle Flow
```
Browse Exams → Select Exam → Payment (if paid) → Start Attempt →
[Exam Engine: iterate questions, autosave, flag, timer countdown] →
Submit (manual or timeout) → Result Screen → Diagnostic Report
```

### Coupon Checkout Flow
```
Checkout → Enter coupon code → POST /api/coupons/validate →
Show discount preview → Confirm → POST /api/payments/checkout →
Redirect to HyperPay → Callback → POST /api/payments/webhook →
Payment status page
```

---

## 9. Component Tree (High-Level)

```
AppComponent
├── PublicModule
│   ├── LandingPageComponent
│   ├── LoginComponent
│   ├── RegisterComponent
│   ├── ForgotPasswordComponent
│   └── ResetPasswordComponent
├── CandidateModule
│   ├── DashboardComponent
│   ├── AvailableExamsComponent
│   ├── ExamDetailComponent
│   ├── ExamEngineComponent        ← Core
│   │   ├── TimerComponent
│   │   ├── QuestionRendererComponent
│   │   ├── QuestionPaletteComponent
│   │   ├── FlagToggleComponent
│   │   └── AutosaveIndicatorComponent
│   ├── ExamResultComponent
│   ├── ReportComponent
│   ├── PaymentHistoryComponent
│   ├── CheckoutComponent
│   ├── PaymentStatusComponent
│   └── ProfileComponent
├── ExpertModule
│   ├── DashboardComponent
│   ├── QuestionBankComponent
│   ├── QuestionEditorComponent
│   ├── ExamListComponent
│   ├── ExamEditorComponent
│   └── FeedbackComponent
└── AdminModule
    ├── DashboardComponent
    ├── UserManagementComponent
    ├── UserDetailComponent
    ├── CouponManagementComponent
    ├── AuditLogComponent
    ├── BulkNotificationComponent
    └── ExpertManagementComponent

Shared:
├── SidebarComponent
├── HeaderComponent
├── DataTableComponent (reusable)
├── StatusBadgeComponent
├── ConfirmationDialogComponent
├── LoadingSkeletonComponent
├── EmptyStateComponent
└── ErrorBoundaryComponent
```

---

*End of Frontend Design Plan — waiting for your instruction to proceed.*
