import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { LogEntryPayload, TodayDashboard } from '../models/habit.models';

export interface TodayHabit {
  habitId: number;
  name: string;
  typeId: number;
  frequencyType?: number;
  targetCount?: number;
  currentProgress?: number;
  isCompletedToday?: boolean;
  isPeriodMet?: boolean;
  pointsPerUnit?: number;
  entryId?: number;
  timeLog?: number;
  isDone?: boolean;
  quantityLog?: number;
  points?: number;
}

@Injectable({
  providedIn: 'root'
})
export class EntryService {

  private baseUrl = `${environment.apiUrl}/Entry`;

  constructor(private http: HttpClient) {}

  getTodayDashboard(date?: string) {
    if (date) {
      return this.http.get<TodayDashboard>(`${this.baseUrl}/Today`, { params: { date } });
    }
    return this.http.get<TodayDashboard>(`${this.baseUrl}/Today`);
  }

  getByDate(date?: string) {
    if (date) {
      return this.http.get<TodayHabit[]>(`${this.baseUrl}/GetByDate`, { params: { date } });
    }
    return this.http.get<TodayHabit[]>(`${this.baseUrl}/GetByDate`);
  }

  logEntry(payload: LogEntryPayload) {
    return this.http.post<TodayHabit>(`${this.baseUrl}/Log`, payload);
  }

  deleteEntry(entryId: number) {
    return this.http.delete(`${this.baseUrl}/${entryId}`);
  }
}
