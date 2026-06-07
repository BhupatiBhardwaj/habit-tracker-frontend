import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { Habit } from '../models/habit.models';

@Injectable({
  providedIn: 'root'
})
export class HabitService {

  private baseUrl = `${environment.apiUrl}/Habit`;

  constructor(private http: HttpClient) {}

  createHabit(payload: {
    name: string;
    categoryId: number;
    typeId: number;
    pointsPerUnit: number;
    frequencyType: number;
    targetCount: number;
    isGood: boolean;
  }) {
    return this.http.post(`${this.baseUrl}/CreateHabit`, payload);
  }

  updateHabit(payload: {
    id: number;
    name: string;
    categoryId: number;
    typeId: number;
    pointsPerUnit: number;
    frequencyType: number;
    targetCount: number;
    isGood: boolean;
  }) {
    return this.http.post(`${this.baseUrl}/UpdateHabit`, payload);
  }

  softDeleteHabit(id: number) {
    return this.http.post(`${this.baseUrl}/SoftDeleteHabit`, { id });
  }

  getHabits() {
    return this.http.get<Habit[]>(`${this.baseUrl}/GetAllHabits`);
  }
}
