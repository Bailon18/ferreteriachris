import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject } from 'rxjs';

const TOKEN_KEY = 'AuthToken';
const USERNAME_KEY = 'AuthUserName';
const AUTHORITIES_KEY = 'AuthAuthorities';
const USERID_KEY = 'UserId';

@Injectable({
  providedIn: 'root'
})
export class TokenService {
  private authStatus = new BehaviorSubject<boolean>(false);
  authStatus$ = this.authStatus.asObservable();

  roles: Array<string> = [];

  constructor(private router: Router) {
    // Inicializar el estado basado en si hay un token
    this.authStatus.next(this.isLogged());
  }

  setIdUser(iduser: number) {
    window.localStorage.removeItem(USERID_KEY);
    window.localStorage.setItem(USERID_KEY, iduser.toString());
  }

  getIdUser(): number | null {
    const iduserStr = window.localStorage.getItem(USERID_KEY);
    if (iduserStr !== null) {
      return parseInt(iduserStr, 10);
    }
    return null;
  }

  setUserName(userName: string): void {
    window.localStorage.removeItem(USERNAME_KEY);
    window.localStorage.setItem(USERNAME_KEY, userName);
  }

  setAuthorities(authorities: string[]): void {
    window.localStorage.removeItem(AUTHORITIES_KEY);
    window.localStorage.setItem(AUTHORITIES_KEY, JSON.stringify(authorities));
  }

  getAuthorities(): string[] {
    const authoritiesStr = localStorage.getItem(AUTHORITIES_KEY);
    if (authoritiesStr) {
      return JSON.parse(authoritiesStr);
    }
    return [];
  }

  public setToken(token: string): void {
    window.localStorage.removeItem(TOKEN_KEY);
    window.localStorage.setItem(TOKEN_KEY, token);
    this.authStatus.next(true);
  }

  public getToken(): string {
    const token = localStorage.getItem(TOKEN_KEY);
    return token ? token : '';
  }

  public isLogged(): boolean {
    return this.getToken() !== '';
  }

  public getUserName(): string | null {
    if (!this.isLogged()) {
      return null;
    }

    return localStorage.getItem(USERNAME_KEY);;
  }

  public isAdmin(): boolean {
    if (!this.isLogged()) {
      return false;
    }
    const token = this.getToken();
    const payload = token.split('.')[1];
    const payloadDecoded = atob(payload);
    const values = JSON.parse(payloadDecoded);
    const roles = values.roles;
    return roles.indexOf('ADMINISTRADOR') >= 0;
  }

  public isAdmin2(): boolean {
    return this.getAuthorities().includes('ADMINISTRADOR');
  }


  public logOut(): void {
    window.localStorage.clear();
    this.router.navigate(['/productos']);
    this.authStatus.next(false);
  }

  public loginSuccess(token: string, userName: string, authorities: string[], id: number): void {
    window.localStorage.setItem('AuthToken', token);
    window.localStorage.setItem('AuthUserName', userName);
    window.localStorage.setItem('AuthAuthorities', JSON.stringify(authorities));
    window.localStorage.setItem('UserId', id.toString());
    this.authStatus.next(true);
  }
}
