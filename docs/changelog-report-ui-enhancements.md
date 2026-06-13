# Changelog: Exam Report UI Enhancements

## Overview

This document tracks all UI fixes, data binding corrections, styling changes, and new analytics integrations applied to the `ExamReportComponent` and related modules. The work focused on fixing visual inconsistencies, aligning the frontend with updated backend DTOs, and integrating rich analytics from the report API endpoints.

---

## UI & Styling Fixes

### QuestionNavigatorComponent — Pastel Color Palette

The navigator button colors were switched from heavy `-600` saturation shades to soft pastel classes to match the rest of the application's design language.

**Before (high-contrast):**

| State | Classes |
|---|---|
| correct / answered | `bg-emerald-600 text-white` |
| incorrect | `bg-red-600 text-white` |
| unanswered | `bg-gray-200 text-gray-700 border border-gray-300` |

**After (pastel):**

| State | Classes |
|---|---|
| correct / answered | `bg-emerald-100 text-emerald-800 border border-emerald-300` |
| incorrect | `bg-red-50 text-red-700 border border-red-300` |
| unanswered | `bg-gray-100 text-gray-700 border border-gray-200 hover:bg-gray-200` |
| current | `bg-blue-600 text-white ring-2 ring-blue-600` (unchanged) |

The legend swatches in `question-navigator.component.html` were updated to match:

| Legend entry | Swatch classes |
|---|---|
| Answered / Correct | `bg-emerald-100 border border-emerald-300` |
| Incorrect | `bg-red-50 border border-red-300` |
| Unanswered | `bg-gray-100 border border-gray-200` |
| Flagged | `text-red-600` SVG icon (unchanged) |

**Files affected:**
- `src/app/features/exam-engine/components/question-navigator/question-navigator.component.ts` — `btnClass()` color map
- `src/app/features/exam-engine/components/question-navigator/question-navigator.component.html` — legend swatch classes

---

## Architectural: DRY Navigator Refactor

### Inline Navigator Deleted / Replaced

The `ExamReportComponent` previously contained a duplicate inline navigator — 55+ lines of manual grid rendering with its own color logic and `questionCache` map. This violated DRY and caused color/behavior divergence from the session navigator.

**Change:** The inline navigator was removed entirely and replaced with the shared `<app-question-navigator>` component.

**Integration:**
- `ExamReportComponent` now injects `ExamProgressService` and calls `loadProgress(attemptId)` in `ngOnInit` (line 81 of the component TS).
- The sidebar template uses `<app-question-navigator [currentIndex]="..." (navigate)="..." />`.
- Index conversion: navigator emits 0-based array indices; `navigateToQuestion` receives `$event + 1` (1-based `orderIndex`).
- Orphaned code removed: `questionCache`, `navGridTotal`, `currentPageQuestions`, `updateCache()`, `questionStatus()`.

**Files affected:**
- `src/app/features/exam-engine/exam-report/exam-report.component.ts` — injected `ExamProgressService`, removed orphaned signals/methods
- `src/app/features/exam-engine/exam-report/exam-report.component.html` — replaced inline grid with `<app-question-navigator>`

### QuestionStatusPipe Extended

The pipe type and label map were extended to support the new `'correct'` and `'incorrect'` style values emitted by the navigator's `navItems` computed.

**Files affected:**
- `src/app/shared/pipes/question-status.pipe.ts` — added `correct` → `'Correct'` and `incorrect` → `'Incorrect'` labels

---

## Data Binding Corrections

### Topic Performance Table

The table was restructured with explicit column headers and fractional display:

| Column | Header | Binding | Notes |
|---|---|---|---|
| 1 | Topic Name | `topic.topicName` | — |
| 2 | Correct Answers | `topic.correctCount` | — |
| 3 | Total Questions | `topic.totalQuestions` | Relies on backend sending the field |
| 4 | Percentage | `topic.correctCount / topic.totalQuestions (topic.scorePercent%)` | Fraction + percentage in parentheses |

**Column headers updated from:** `Topic` / `Correct` / `Total` / `Score`
**To:** `Topic Name` / `Correct Answers` / `Total Questions` / `Percentage`

**Files affected:**
- `src/app/features/exam-engine/exam-report/exam-report.component.html` — table headers, fractional display in percentage cell
- `src/app/core/models/report.model.ts` — `TopicBreakdownDto` shape (unchanged, already had all fields)

---

## New Analytics Integration

### Model Updates (`report.model.ts`)

The DTOs were extended to match the updated backend response:

```typescript
// New interface
export interface DifficultyBreakdownDto {
  level: number;
  levelName: string;
  correctCount: number;
  totalQuestions: number;
  scorePercent: number;
}

// Fields added to ExamReportDto
avgTimeCorrectAnswersSeconds: number;
avgTimeIncorrectAnswersSeconds: number;
difficultyBreakdowns: DifficultyBreakdownDto[];

// Fields added to QuestionDetailDto
difficultyLevel: number;
attachments: AttemptAttachmentDto[];  // imported from attempt.model.ts
```

**Files affected:**
- `src/app/core/models/report.model.ts` — new DTO + extended existing DTOs

### Performance Overview — Average Time Split

The single "Avg Time/Q" metric tile was split into two tiles:

| Tile | Binding | Color |
|---|---|---|
| Avg Time (Correct) | `formattedAvgTimeCorrect()` | `text-emerald-600` |
| Avg Time (Incorrect) | `formattedAvgTimeIncorrect()` | `text-red-600` |

The computed formatters use the same `MM:SS` format as other time metrics. The grid layout was changed from `md:grid-cols-4` to `md:grid-cols-5` to accommodate the 5 tiles (Score, Total Time, Avg Time Correct, Avg Time Incorrect, Flagged).

**Files affected:**
- `src/app/features/exam-engine/exam-report/exam-report.component.ts` — added `formattedAvgTimeCorrect` and `formattedAvgTimeIncorrect` computeds
- `src/app/features/exam-engine/exam-report/exam-report.component.html` — replaced tile HTML, updated grid class

### Difficulty Performance Section

A new card section was added below Topic Performance, conditionally rendered when `report()?.difficultyBreakdowns?.length > 0`:

**Table structure:**

| Column | Binding |
|---|---|
| Level | `d.levelName` |
| Correct | `d.correctCount` |
| Total | `d.totalQuestions` |
| Score | `d.correctCount / d.totalQuestions (d.scorePercent%)` with `scoreColor()` |

**Files affected:**
- `src/app/features/exam-engine/exam-report/exam-report.component.html` — new `<app-card>` with `<table>`

### Difficulty Badges in Question Review

Each collapsed question row now includes a difficulty badge after the Flagged badge:

```typescript
difficultyLabel(level: number): string {
  if (level === 1) return 'Easy';
  if (level === 2) return 'Medium';
  if (level === 3) return 'Hard';
  return `Level ${level}`;
}

difficultyColor(level: number): string {
  if (level === 1) return 'bg-emerald-100 text-emerald-700';   // Easy → green
  if (level === 2) return 'bg-amber-100 text-amber-700';       // Medium → amber
  if (level === 3) return 'bg-red-100 text-red-700';           // Hard → red
  return 'bg-gray-100 text-gray-600';
}
```

The badge renders as an inline pill matching the style of the Correct/Incorrect/Flagged badges.

**Files affected:**
- `src/app/features/exam-engine/exam-report/exam-report.component.ts` — added `difficultyLabel()` and `difficultyColor()` methods
- `src/app/features/exam-engine/exam-report/exam-report.component.html` — added badge element in collapsed question row

---

## Attachments Handling

### Expanded Question Detail View

The expanded detail view for each question now renders explicit `attachments[]` from the API, matching the design used in the active session's `question-card.component.html`.

**Logic placed after the options list and before the time/topic row:**

```html
@if (q.attachments.length > 0) {
  <div class="space-y-3">
    @for (att of q.attachments; track att.filePathUrl) {
      @if (att.fileType === 'image') {
        <img [src]="att.filePathUrl" [alt]="att.altText || 'Question attachment'"
             class="max-w-full rounded-lg border border-gray-200" />
      } @else if (att.fileType === 'audio') {
        <audio controls class="w-full" [attr.aria-label]="...">
          <source [src]="att.filePathUrl" />
        </audio>
      }
    }
  </div>
}
```

**Supported attachment types:**
- **Image** (`fileType === 'image'`): Rendered as an `<img>` element with `max-w-full` and a light border.
- **Audio** (`fileType === 'audio'`): Rendered as an `<audio>` element with native controls.

The `AttachmentsDto` model is re-used from `attempt.model.ts`:

```typescript
export interface AttemptAttachmentDto {
  filePathUrl: string;
  fileType: string;
  displayOrder: number;
  altText: string;
  languageCode: string;
}
```

**Files affected:**
- `src/app/features/exam-engine/exam-report/exam-report.component.html` — attachment rendering block in expanded view
- `src/app/core/models/report.model.ts` — added `attachments: AttemptAttachmentDto[]` to `QuestionDetailDto`

---

## File Summary

| File | Change |
|---|---|
| `src/app/core/models/report.model.ts` | Added `DifficultyBreakdownDto`, extended `ExamReportDto` and `QuestionDetailDto` with new fields |
| `src/app/shared/pipes/question-status.pipe.ts` | Extended type and labels for `'correct'` / `'incorrect'` |
| `src/app/features/exam-engine/components/question-navigator/question-navigator.component.ts` | Updated `btnClass()` to pastel colors; `navItems` discriminates Correct/Incorrect/Answered |
| `src/app/features/exam-engine/components/question-navigator/question-navigator.component.html` | Updated legend swatches to pastel colors |
| `src/app/features/exam-engine/exam-report/exam-report.component.ts` | Injected `ExamProgressService`; added avg-time-correct/incorrect computeds; added `difficultyLabel()`/`difficultyColor()`; removed orphaned code |
| `src/app/features/exam-engine/exam-report/exam-report.component.html` | Replaced inline navigator; split avg time tile; added Difficulty Performance section; added difficulty badge; added attachment rendering |
