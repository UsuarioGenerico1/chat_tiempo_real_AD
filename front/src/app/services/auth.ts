import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class Auth {
  private http = inject(HttpClient);
  private url = 'http://localhost:3000/api';

  currentUser = signal<any>(this.getSavedUser());

  private getSavedUser(): any {
    const user = localStorage.getItem('chat_user');
    return user ? JSON.parse(user) : null;
  }

  // Método rápido para obtener el token guardado en cualquier parte de la app
  getToken(): string | null {
    return localStorage.getItem('chat_token');
  }

  register(userData: any): Observable<any> {
    return this.http.post(`${this.url}/register`, userData);
  }

  login(credentials: any): Observable<any> {
    return this.http.post(`${this.url}/login`, credentials);
  }

  // Modificamos este método para que acepte y guarde el token
  setCurrentUser(user: any, token: string | null) {
    this.currentUser.set(user);
    if (user && token) {
      localStorage.setItem('chat_user', JSON.stringify(user));
      localStorage.setItem('chat_token', token); // <-- Guardamos el token físico
    } else {
      localStorage.removeItem('chat_user');
      localStorage.removeItem('chat_token'); // <-- Limpiamos el token al salir
    }
  }

  logout() {
    this.setCurrentUser(null, null);
  }
}