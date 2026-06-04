import { Component, inject, OnInit } from '@angular/core';
import { DatePipe } from '@angular/common';
import { Router } from '@angular/router';
import { DashboardService } from '../../../core/services/dashboard.service';
import { ExamService } from '../../../core/services/exam.service';
import { CardComponent } from '../../../shared/components/card/card.component';
import { ButtonComponent } from '../../../shared/components/button/button.component';

@Component({
  selector: 'app-candidate-dashboard',
  standalone: true,
  imports: [CardComponent, ButtonComponent, DatePipe],
  templateUrl: './dashboard.component.html',
})
export class DashboardComponent implements OnInit {
  private readonly dashboardService = inject(DashboardService);
  private readonly examService = inject(ExamService);
  private readonly router = inject(Router);

  readonly examCatalog = this.dashboardService.examCatalog;
  readonly recentAttempts = this.dashboardService.recentAttempts;
  readonly stats = this.dashboardService.stats;
  readonly isLoading = this.dashboardService.isLoading;

  readonly statCards = [
    { label: 'Exams Taken', key: 'totalExamsTaken' as const, color: 'bg-blue-50 text-blue-600' },
    { label: 'Avg Score', key: 'averageScore' as const, suffix: '%', color: 'bg-emerald-50 text-emerald-600' },
    { label: 'Passed', key: 'passedExams' as const, color: 'bg-violet-50 text-violet-600' },
    { label: 'Available Exams', key: 'totalExams' as const, color: 'bg-amber-50 text-amber-600' },
  ];

  ngOnInit() {
    if (this.examCatalog().length === 0) {
      this.dashboardService.getExamCatalog().subscribe({
        next: (res) => {
          if (res.success && res.data) {
            this.dashboardService.examCatalog.set(res.data.items);
          }
          this.dashboardService.isLoading.set(false);
        },
        error: () => {
          this.dashboardService.isLoading.set(false);
        },
      });
    }
  }

  startExam(examId: string) {
    this.examService.startExam(examId).subscribe({
      next: (res) => {
        if (res.success && res.data) {
          this.examService.loadSessionFromStart(res.data);
          this.router.navigate(['/exam/session', res.data.attemptId]);
        }
      },
    });
  }
}
