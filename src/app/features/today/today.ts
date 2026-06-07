import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';
import { EntryService } from '../../core/services/entry.service';
import { TodayDashboard, TodayHabitCard } from '../../core/models/habit.models';
import { getUtcTodayString } from '../../core/utils/date.util';
import { AppIconComponent } from '../../core/components/app-icon';
import { AuthService } from '../../core/services/auth.service';
import {Router} from '@angular/router';

@Component({
  selector: 'app-today',
  standalone: true,
  imports: [CommonModule, FormsModule, AppIconComponent],
  templateUrl: './today.html',
  styleUrl: './today.css'
})

export class TodayComponent implements OnInit {

  @ViewChild('logDialog') logDialog!: ElementRef<HTMLDialogElement>;
  @ViewChild('errorDialog') errorDialog!: ElementRef<HTMLDialogElement>;
  
  dashboard: TodayDashboard = {
    dailyPending: [],
    weeklyProgress: [],
    monthlyProgress: [],
    completedToday: []
  };

  loading = false;
  logging = false;
  showCompleted = true;
  selectedDate = getUtcTodayString();
  errorMessage = '';
  logTarget: TodayHabitCard | null = null;
  editingEntryId: number | null = null;
  logTimeHours: number | null = null;
  logQuantity: number | null = null;

  constructor(
    private entryService: EntryService,
    private authService: AuthService,
    private router: Router) {}

  ngOnInit(): void {
    this.loadDashboard();
  }

  logout(): void {
    this.authService.logout();

    this.router.navigate(['/login']);

  }

  get isToday(): boolean {
    return this.selectedDate === getUtcTodayString();
  }

  get dayTotalPoints(): number {
    return this.dashboard.completedToday.reduce((sum, c) => sum + (Number(c.points) || 0), 0);
  }

  onDateChange(): void {
    this.loadDashboard();
  }

  loadDashboard(): void {
    this.loading = true;
    this.entryService.getTodayDashboard(this.selectedDate).subscribe({
      next: (response) => {
        this.dashboard = this.normalizeDashboard(response);
        this.loading = false;
      },

      error: () => {
        this.loading = false;
      }
    });
  }

  onLogCard(card: TodayHabitCard): void {
    if (this.logging) return;

    if (card.isCompletedToday) {
      this.openEditDialog(card);
      return;
    }

    if (card.typeId === 2) {
      this.submitLog(card, { isDone: true });
      return;
    }

    this.openNewLogDialog(card);
  }

  openEditDialog(card: TodayHabitCard): void {
    this.logTarget = card;
    this.editingEntryId = card.todayEntryId ?? null;
    this.logTimeHours = card.timeLog ?? null;
    this.logQuantity = card.quantityLog ?? null;
    this.logDialog.nativeElement.showModal();
  }

  openNewLogDialog(card: TodayHabitCard): void {
    this.logTarget = card;
    this.editingEntryId = null;
    this.logTimeHours = card.timeLog ?? null;
    this.logQuantity = card.quantityLog ?? null;
    this.logDialog.nativeElement.showModal();
  }

  closeLogDialog(): void {
    this.logDialog.nativeElement.close();
    this.logTarget = null;
    this.editingEntryId = null;
  }

  confirmLogDialog(): void {
    if (!this.logTarget) return;

    if (this.logTarget.typeId === 1) {
      this.submitLog(this.logTarget, { timeLog: this.logTimeHours ?? 0 });
    } else if (this.logTarget.typeId === 2) {
      this.submitLog(this.logTarget, { isDone: true });
    } else if (this.logTarget.typeId === 3) {
      this.submitLog(this.logTarget, { quantityLog: this.logQuantity ?? 0 });
    }

    this.closeLogDialog();
  }

  onDeleteEntry(card: TodayHabitCard, event: Event): void {
    event.stopPropagation();
    if (!card.todayEntryId || this.logging) return;
    if (!confirm(`Remove log for "${card.name}" on this day?`)) return;

    this.logging = true;

    this.entryService.deleteEntry(card.todayEntryId).subscribe({
      next: () => {
        this.logging = false;
        this.loadDashboard();
      },

       error: () => {
        this.logging = false;
      }
    });
  }



  private submitLog(card: TodayHabitCard, fields: { isDone?: boolean; timeLog?: number; quantityLog?: number }): void {

    this.logging = true;

    this.entryService.logEntry({

      habitId: card.habitId,

      entryId: this.editingEntryId ?? undefined,

      entryDate: this.selectedDate,

      ...fields

    }).subscribe({

      next: () => {

        this.logging = false;

        this.editingEntryId = null;

        this.loadDashboard();

      },

      error: (err: HttpErrorResponse) => {

        this.logging = false;

        this.editingEntryId = null;

        if (err.status === 409) {

          this.errorMessage = err.error?.message ?? err.error?.Message ??

            'You already logged today\'s entry, either update it or first remove it to add again.';

          this.errorDialog.nativeElement.showModal();

        }

      }

    });

  }



  closeErrorDialog(): void {

    this.errorDialog.nativeElement.close();

    this.errorMessage = '';

  }



  progressLabel(card: TodayHabitCard): string {

    if (card.frequencyType === 2) {

      return `${card.currentProgress}/${card.targetCount} this week`;

    }

    if (card.frequencyType === 3) {

      return `${card.currentProgress}/${card.targetCount} this month`;

    }

    return '';

  }



  logButtonLabel(card: TodayHabitCard): string {

    if (card.isCompletedToday) return 'Edit';

    if (card.typeId === 2) return 'Mark done';

    return 'Log';

  }



  formatCompletedValue(card: TodayHabitCard): string {

    switch (card.typeId) {

      case 1:

        return card.timeLog != null ? `${card.timeLog} hr` : 'Logged';

      case 2:

        return 'Done';

      case 3:

        return card.quantityLog != null ? String(card.quantityLog) : 'Logged';

      default:

        return 'Logged';

    }

  }



  private normalizeDashboard(raw: any): TodayDashboard {

    const mapList = (list: any[]) => (list ?? []).map(c => this.normalizeCard(c));

    return {

      dailyPending: mapList(raw.dailyPending ?? raw.DailyPending),

      weeklyProgress: mapList(raw.weeklyProgress ?? raw.WeeklyProgress),

      monthlyProgress: mapList(raw.monthlyProgress ?? raw.MonthlyProgress),

      completedToday: mapList(raw.completedToday ?? raw.CompletedToday)

    };

  }



  private normalizeCard(c: any): TodayHabitCard {

    return {

      habitId: c.habitId ?? c.HabitId,

      name: c.name ?? c.Name,

      typeId: c.typeId ?? c.TypeId,

      frequencyType: c.frequencyType ?? c.FrequencyType,

      targetCount: c.targetCount ?? c.TargetCount,

      currentProgress: c.currentProgress ?? c.CurrentProgress,

      isCompletedToday: c.isCompletedToday ?? c.IsCompletedToday,

      isPeriodMet: c.isPeriodMet ?? c.IsPeriodMet,

      pointsPerUnit: c.pointsPerUnit ?? c.PointsPerUnit,

      todayEntryId: c.todayEntryId ?? c.TodayEntryId,

      timeLog: c.timeLog ?? c.TimeLog,

      isDone: c.isDone ?? c.IsDone,

      quantityLog: c.quantityLog ?? c.QuantityLog,

      points: c.points ?? c.Points,
      isHabitDeleted: c.isHabitDeleted,
      isGood: c.isGood,

    };

  }

}


