import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private baseUrl = `https://habit-tracker-api-mqws.onrender.com/api/auth`;

  constructor(private http: HttpClient) {}

  register(payload: any) {
    return this.http.post(`${this.baseUrl}/register`, payload);
  }

  login(payload: any) {
    return this.http.post(`${this.baseUrl}/login`, payload);
  }

  saveToken(token: string) {
    localStorage.setItem('token', token);
  }

  getToken() {
    return localStorage.getItem('token');
  }

  isLoggedIn(): boolean {
    return !!this.getToken();
  }

  logout() {
    localStorage.removeItem('token');
  }
}