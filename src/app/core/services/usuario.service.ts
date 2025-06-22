import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import baseUrl from '../../helpers';


@Injectable({ providedIn: 'root' })
export class UsuarioService {

  constructor(private http: HttpClient) {}


  // Login de usuario: el backend espera { username, password }
  login(loginUser: { correo: string, password: string }): Observable<any> {
    // El backend espera username y password directamente
    const body = { 
      username: loginUser.correo, 
      password: loginUser.password 
    };
    return this.http.post(`${baseUrl}/auth/login`, body);
  }

  // Obtener lista de usuarios paginada
  getUsuarios(page: number = 0, size: number = 5): Observable<any> {
    return this.http.get<any>(`${baseUrl}/api/user?page=${page}&size=${size}`);
  }

  // Filtrar usuarios
  filtrarUsuarios(textoBuscar: string, page: number = 0, size: number = 5): Observable<any> {
    return this.http.get<any>(`${baseUrl}/api/user/filtro?textoBuscar=${textoBuscar}&page=${page}&size=${size}`);
  }

  // Obtener usuarios por estado
  getUsuariosPorEstado(estado: boolean, page: number = 0, size: number = 5): Observable<any> {
    return this.http.get<any>(`${baseUrl}/api/user/estado?estado=${estado}&page=${page}&size=${size}`);
  }

  // Actualizar estado de usuario
  actualizarEstado(id: number, nuevoEstado: boolean): Observable<any> {
    return this.http.post(`${baseUrl}/api/user/${id}/${nuevoEstado}`, {});
  }

  crearUsuario(usuario: any): Observable<any> {
    return this.http.post(`${baseUrl}/auth/nuevo`, usuario);
  }

  // Valida si el correo ya existe
  existeCorreo(email: string) {
    return this.http.get<boolean>(`${baseUrl}/api/user/validarcorreo?correoElectronico=${email}`);
  }

  // Valida si el documento ya existe
  existeDocumento(document: string) {
    return this.http.get<boolean>(`${baseUrl}/api/user/validardocumento?documento=${document}`);
  }

  // Valida si el username ya existe
  existeUsername(username: string) {
    return this.http.get<boolean>(`${baseUrl}/api/user/validarUsername/${username}`);
  }

  getUsuarioPorId(id: number) {
    return this.http.get<any>(`${baseUrl}/api/user/${id}`);
  }

  getVendedores(): Observable<any[]> {
    return this.http.get<any[]>(`${baseUrl}/api/user/vendedores`);
  }

} 