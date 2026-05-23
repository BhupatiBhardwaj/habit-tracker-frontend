import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { ReportService } from '../../core/services/report.service';
import { HabitReportDetail, ReportEntry } from '../../core/models/habit.models';
import { getUtcTodayString } from '../../core/utils/date.util';

export interface HeatmapCell {
  date: string;
  level: number;
  inRange: boolean;
  title: string;
}

@Component({
  selector: 'app-report-detail',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './report-detail.html',
  styleUrl: './reports.css'
})
export class ReportDetailComponent implements OnInit {

  detail: HabitReportDetail | null = null;
  loading = false;
  habitId = 0;
  fromDate = '';
  toDate = getUtcTodayString();
  heatmapWeeks: HeatmapCell[][] = [];
  heatmapMonthLabels: { label: string; weekIndex: number }[] = [];

  private readonly monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

  constructor(
    private route: ActivatedRoute,
    private reportService: ReportService
  ) {}

  ngOnInit(): void {
    this.habitId = Number(this.route.snapshot.paramMap.get('id'));
    const fromQuery = this.route.snapshot.queryParamMap.get('from');
    const toQuery = this.route.snapshot.queryParamMap.get('to');

    if (fromQuery) {
      this.fromDate = fromQuery;
    } else {
      const monthAgo = new Date();
      monthAgo.setUTCDate(monthAgo.getUTCDate() - 365);
      this.fromDate = monthAgo.toISOString().slice(0, 10);
    }

    this.toDate = toQuery ?? getUtcTodayString();
    this.loadDetail();
  }

  loadDetail(): void {
    this.loading = true;
    this.reportService.getHabitDetail(this.habitId, this.fromDate, this.toDate).subscribe({
      next: (raw) => {
        this.detail = this.normalizeDetail(raw);
        this.buildHeatmap(this.detail.entries, this.fromDate, this.toDate);
        this.loading = false;
      },
      error: () => {
        this.loading = false;
      }
    });
  }

  frequencyLabel(): string {
    if (!this.detail) return '';
    switch (this.detail.frequencyType) {
      case 2:
        return 'Weekly';
      case 3:
        return 'Monthly';
      default:
        return 'Daily';
    }
  }

  private normalizeDetail(raw: any): HabitReportDetail {
    const entries = (raw.entries ?? raw.Entries ?? []).map((e: any) => ({
      id: e.id ?? e.Id,
      entryDate: e.entryDate ?? e.EntryDate,
      timeLog: e.timeLog ?? e.TimeLog,
      isDone: e.isDone ?? e.IsDone,
      quantityLog: e.quantityLog ?? e.QuantityLog,
      points: e.points ?? e.Points ?? 0
    }));

    return {
      habitId: raw.habitId ?? raw.HabitId,
      name: raw.name ?? raw.Name,
      frequencyType: raw.frequencyType ?? raw.FrequencyType,
      targetCount: raw.targetCount ?? raw.TargetCount,
      actualCount: raw.actualCount ?? raw.ActualCount,
      expectedCount: raw.expectedCount ?? raw.ExpectedCount,
      completionPercent: raw.completionPercent ?? raw.CompletionPercent,
      totalPoints: raw.totalPoints ?? raw.TotalPoints,
      currentStreak: raw.currentStreak ?? raw.CurrentStreak,
      entries
    };
  }

  private buildHeatmap(entries: ReportEntry[], from: string, to: string): void {
    const rangeStart = this.parseUtcDate(from);
    const rangeEnd = this.parseUtcDate(to);

    const pointsByDay = new Map<string, number>();
    for (const entry of entries) {
      const day = String(entry.entryDate).slice(0, 10);
      const pts = Number(entry.points) || 0;
      pointsByDay.set(day, (pointsByDay.get(day) ?? 0) + pts);
    }

    const maxPoints = Math.max(0, ...pointsByDay.values());

    const gridStart = new Date(rangeStart);
    gridStart.setUTCDate(gridStart.getUTCDate() - gridStart.getUTCDay());

    const gridEnd = new Date(rangeEnd);
    if (gridEnd.getUTCDay() !== 6) {
      gridEnd.setUTCDate(gridEnd.getUTCDate() + (6 - gridEnd.getUTCDay()));
    }

    const weeks: HeatmapCell[][] = [];
    const monthLabels: { label: string; weekIndex: number }[] = [];
    let lastMonth = -1;
    let cursor = new Date(gridStart);

    while (cursor <= gridEnd) {
      const week: HeatmapCell[] = [];

      for (let day = 0; day < 7; day++) {
        const dateStr = cursor.toISOString().slice(0, 10);
        const inRange = cursor >= rangeStart && cursor <= rangeEnd;
        const points = pointsByDay.get(dateStr) ?? 0;
        const level = inRange ? this.levelForPoints(points, maxPoints) : -1;

        week.push({
          date: dateStr,
          level,
          inRange,
          title: inRange
            ? `${dateStr}: ${points > 0 ? points + ' pts' : 'No log'}`
            : dateStr
        });

        cursor.setUTCDate(cursor.getUTCDate() + 1);
      }

      const labelDay = week.find(c => c.inRange)?.date ?? week[0].date;
      const month = this.parseUtcDate(labelDay).getUTCMonth();
      const hasRangeDay = week.some(c => c.inRange);
      if (hasRangeDay && month !== lastMonth) {
        monthLabels.push({ label: this.monthNames[month], weekIndex: weeks.length });
        lastMonth = month;
      }

      weeks.push(week);
    }

    this.heatmapWeeks = weeks;
    this.heatmapMonthLabels = monthLabels;
  }

  private levelForPoints(points: number, max: number): number {
    if (points <= 0) return 0;
    if (max <= 0) return 1;
    const ratio = points / max;
    if (ratio >= 0.75) return 4;
    if (ratio >= 0.5) return 3;
    if (ratio >= 0.25) return 2;
    return 1;
  }

  private parseUtcDate(dateStr: string): Date {
    const [y, m, d] = dateStr.split('-').map(Number);
    return new Date(Date.UTC(y, m - 1, d));
  }
}
