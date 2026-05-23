import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { Category } from '../models/habit.models';

@Injectable({
  providedIn: 'root'
})
export class CategoryService {

  private baseUrl = `${environment.apiUrl}/Habit`;

  constructor(private http: HttpClient) {}

  createCategory(payload: { name: string }) {
    return this.http.post(`${this.baseUrl}/CreateCategory`, payload);
  }

  updateCategory(payload: { id: number; name: string }) {
    return this.http.post(`${this.baseUrl}/UpdateCategory`, payload);
  }

  deleteCategory(id: number) {
    return this.http.post(`${this.baseUrl}/DeleteCategory`, { id });
  }

  getCategories() {
    return this.http.get<Category[]>(`${this.baseUrl}/GetAllCategories`);
  }
}
