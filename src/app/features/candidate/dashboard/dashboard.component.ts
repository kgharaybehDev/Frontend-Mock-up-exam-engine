import { Component, inject, OnInit } from '@angular/core';
import { DatePipe } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { DashboardService, type DashboardStats } from '../../../core/services/dashboard.service';
import { ExamService } from '../../../core/services/exam.service';
import { DashboardCardComponent } from '../../../shared/components/dashboard-card/dashboard-card.component';
import { CardComponent } from '../../../shared/components/card/card.component';
import { ButtonComponent } from '../../../shared/components/button/button.component';

@Component({
  selector: 'app-candidate-dashboard',
  standalone: true,
  imports: [DashboardCardComponent, CardComponent, ButtonComponent, DatePipe, RouterLink],
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
  readonly catalogLoading = this.dashboardService.catalogLoading;
  readonly attemptsLoading = this.dashboardService.attemptsLoading;

  readonly statCards = [
    { label: 'Exams Taken', key: 'totalExamsTaken' as const, color: 'bg-blue-50 text-blue-600' },
    { label: 'Avg Score', key: 'averageScore' as const, suffix: '%', color: 'bg-emerald-50 text-emerald-600' },
    { label: 'Passed', key: 'passedExams' as const, color: 'bg-violet-50 text-violet-600' },
    { label: 'Available Exams', key: 'totalExams' as const, color: 'bg-amber-50 text-amber-600' },
  ];

  ngOnInit() {
    const catalogSub = this.dashboardService.getExamCatalog().subscribe({
      next: (res) => {
        if (res.success && res.data) {
          this.dashboardService.examCatalog.set(res.data.items);
        }
        this.dashboardService.catalogLoading.set(false);
      },
      error: () => this.dashboardService.catalogLoading.set(false),
    });

    const attemptsSub = this.dashboardService.getMyAttempts().subscribe({
      next: (res) => {
        if (res.success && res.data) {
          this.dashboardService.recentAttempts.set(res.data.items ?? []);
        }
        this.dashboardService.attemptsLoading.set(false);
      },
      error: () => this.dashboardService.attemptsLoading.set(false),
    });
  }

  getCardValue(stats: DashboardStats, key: string): number | null {
    if (key === 'averageScore' && stats.averageScore === 0 && this.recentAttempts().length === 0) return null;
    return stats[key as keyof DashboardStats] as number;
  }

  getCardIcon(key: string): string {
    return key;
  }

  statusClass(status: string): string {
    switch (status) {
      case 'completed': return 'bg-emerald-100 text-emerald-800';
      case 'in-progress': return 'bg-amber-100 text-amber-800';
      case 'failed': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-600';
    }
  }

  statusLabel(status: string): string {
    switch (status) {
      case 'completed': return 'Passed';
      case 'in-progress': return 'In Progress';
      case 'failed': return 'Failed';
      default: return status;
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
