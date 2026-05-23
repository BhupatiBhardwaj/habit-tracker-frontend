import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { HabitReportDetail, ReportsSummary } from '../models/habit.models';

@Injectable({
  providedIn: 'root'
})
export class ReportService {

  private baseUrl = `${environment.apiUrl}/Reports`;

  constructor(private http: HttpClient) {}

  getSummary(from?: string, to?: string) {
    const params: Record<string, string> = {};
    if (from) params['from'] = from;
    if (to) params['to'] = to;
    return this.http.get<ReportsSummary>(`${this.baseUrl}/Summary`, { params });
  }

  getHabitDetail(habitId: number, from?: string, to?: string) {
    const params: Record<string, string> = {};
    if (from) params['from'] = from;
    if (to) params['to'] = to;
    return this.http.get<HabitReportDetail>(`${this.baseUrl}/Habit/${habitId}`, { params });
  }
}
