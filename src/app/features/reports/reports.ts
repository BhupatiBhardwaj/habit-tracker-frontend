import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ReportService } from '../../core/services/report.service';
import { HabitReportSummary, ReportsSummary } from '../../core/models/habit.models';
import { getUtcTodayString } from '../../core/utils/date.util';

@Component({
  selector: 'app-reports',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './reports.html',
  styleUrl: './reports.css'
})
export class ReportsComponent implements OnInit {

  summary: ReportsSummary | null = null;
  loading = false;
  fromDate = '';
  toDate = getUtcTodayString();
  Math = Math;

  constructor(
    private reportService: ReportService,
    private router: Router
  ) {}

  ngOnInit(): void {
    const today = new Date();
    const monthAgo = new Date(today);
    monthAgo.setUTCDate(monthAgo.getUTCDate() - 30);
    this.fromDate = monthAgo.toISOString().slice(0, 10);
    this.loadSummary();
  }

  get habitCount(): number {
    return this.summary?.habits.length ?? 0;
  }

  get avgCompletion(): number {
    const habits = this.summary?.habits ?? [];
    if (habits.length === 0) return 0;
    const sum = habits.reduce((a, h) => a + h.completionPercent, 0);
    return Math.round(sum / habits.length);
  }

  get totalPoints(): number {
    return (this.summary?.habits ?? []).reduce((a, h) => a + h.totalPoints, 0);
  }

  get onTrackCount(): number {
    return (this.summary?.habits ?? []).filter(h => h.completionPercent >= 80).length;
  }

  loadSummary(): void {
    this.loading = true;
    this.reportService.getSummary(this.fromDate, this.toDate).subscribe({
      next: (raw) => {
        this.summary = this.normalizeSummary(raw);
        this.loading = false;
      },
      error: () => {
        this.loading = false;
      }
    });
  }

  frequencyLabel(h: HabitReportSummary): string {
    switch (h.frequencyType) {
      case 2:
        return 'Weekly';
      case 3:
        return 'Monthly';
      default:
        return 'Daily';
    }
  }

  ringDash(percent: number): string {
    const r = 36;
    const circumference = 2 * Math.PI * r;
    const filled = (Math.min(percent, 100) / 100) * circumference;
    return `${filled} ${circumference}`;
  }

  progressTone(percent: number): string {
    if (percent >= 100) return 'tone-great';
    if (percent >= 70) return 'tone-good';
    if (percent >= 40) return 'tone-mid';
    return 'tone-low';
  }

  openDetail(habitId: number): void {
    this.router.navigate(['/reports', habitId], {
      queryParams: { from: this.fromDate, to: this.toDate }
    });
  }

  private normalizeSummary(raw: any): ReportsSummary {
    const habits = (raw.habits ?? raw.Habits ?? []).map((h: any) => this.normalizeHabit(h));
    return {
      from: raw.from ?? raw.From,
      to: raw.to ?? raw.To,
      habits
    };
  }

  private normalizeHabit(h: any): HabitReportSummary {
    return {
      habitId: h.habitId ?? h.HabitId,
      name: h.name ?? h.Name,
      frequencyType: h.frequencyType ?? h.FrequencyType,
      targetCount: h.targetCount ?? h.TargetCount,
      actualCount: h.actualCount ?? h.ActualCount,
      expectedCount: h.expectedCount ?? h.ExpectedCount,
      completionPercent: h.completionPercent ?? h.CompletionPercent,
      totalPoints: h.totalPoints ?? h.TotalPoints,
      currentStreak: h.currentStreak ?? h.CurrentStreak
    };
  }
}
