import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private isAuthenticatedSubject = new BehaviorSubject<boolean>(false);
  isAuthenticated$ = this.isAuthenticatedSubject.asObservable();

  constructor() {
    // Verificar si hay un token almacenado al iniciar
    const token = localStorage.getItem('token');
    if (token) {
      this.isAuthenticatedSubject.next(true);
    }
  }

  login(credentials: { email: string, password: string }): Observable<boolean> {
    // Aquí irá la lógica de autenticación con el backend
    // Por ahora simulamos una autenticación exitosa
    this.isAuthenticatedSubject.next(true);
    localStorage.setItem('token', 'dummy-token');
    return this.isAuthenticated$;
  }

  logout(): void {
    this.isAuthenticatedSubject.next(false);
    localStorage.removeItem('token');
  }

  register(userData: any): Observable<boolean> {
    // Aquí irá la lógica de registro con el backend
    // Por ahora simulamos un registro exitoso
    return this.login({ email: userData.email, password: userData.password });
  }

  forgotPassword(email: string): Observable<boolean> {
    // Aquí irá la lógica de recuperación de contraseña
    return new Observable(observer => {
      observer.next(true);
      observer.complete();
    });
  }
} 