export const FREQUENCY_TYPES = [
  { id: 1, name: 'Daily' },
  { id: 2, name: 'Weekly' },
  { id: 3, name: 'Monthly' }
] as const;

export const HABIT_TYPES = [
  { id: 1, name: 'Time Logging' },
  { id: 2, name: 'Done' },
  { id: 3, name: 'Quantity Logging' }
] as const;

export interface Habit {
  id: number;
  userid: number;
  name: string;
  categoryid: number;
  typeid: number;
  isdeleted?: boolean;
  pointsperunit: number;
  frequencytype: number;
  targetcount: number;
}

export interface Category {
  id: number;
  userid: number;
  name: string;
}

export interface TodayHabitCard {
  habitId: number;
  name: string;
  typeId: number;
  frequencyType: number;
  targetCount: number;
  currentProgress: number;
  isCompletedToday: boolean;
  isPeriodMet: boolean;
  pointsPerUnit: number;
  todayEntryId?: number;
  timeLog?: number;
  isDone?: boolean;
  quantityLog?: number;
  points?: number;
}

export interface TodayDashboard {
  dailyPending: TodayHabitCard[];
  weeklyProgress: TodayHabitCard[];
  monthlyProgress: TodayHabitCard[];
  completedToday: TodayHabitCard[];
}

export interface LogEntryPayload {
  habitId: number;
  entryId?: number;
  entryDate?: string;
  timeLog?: number;
  isDone?: boolean;
  quantityLog?: number;
}

export interface HabitReportSummary {
  habitId: number;
  name: string;
  frequencyType: number;
  targetCount: number;
  actualCount: number;
  expectedCount: number;
  completionPercent: number;
  totalPoints: number;
  currentStreak: number;
}

export interface ReportsSummary {
  from: string;
  to: string;
  habits: HabitReportSummary[];
}

export interface HabitReportDetail extends HabitReportSummary {
  entries: ReportEntry[];
}

export interface ReportEntry {
  id: number;
  entryDate: string;
  timeLog?: number;
  isDone?: boolean;
  quantityLog?: number;
  points: number;
}
