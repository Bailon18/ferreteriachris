import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import baseUrl from '../../helpers';

@Injectable({ providedIn: 'root' })
export class ClienteService {

  constructor(private http: HttpClient) {}

  // Obtener clientes paginados
  getClientes(page: number = 0, size: number = 5): Observable<any> {
    return this.http.get(`${baseUrl}/api/clientes?page=${page}&size=${size}`);
  }

  // Obtener cliente por ID
  getClientePorId(id: number): Observable<any> {
    return this.http.get(`${baseUrl}/api/clientes/${id}`);
  }

  // Verifica si el correo ya existe en cliente 
  existeCorreo(correo: string): Observable<boolean> {
    return this.http.get<boolean>(`${baseUrl}/api/clientes/exists-correo`, { params: { correo } });
  }

  // Verifica si el documento ya existe
  existeDocumento(documentoIdentidad: string): Observable<boolean> {
    return this.http.get<boolean>(`${baseUrl}/api/clientes/exists-documento`, { params: { documentoIdentidad } });
  }

  // Agrega un nuevo cliente
  agregarCliente(cliente: any): Observable<any> {
    console.log(cliente);
    return this.http.post(`${baseUrl}/api/clientes`, cliente);
  }

  // Login de cliente: el backend espera { username: correo, password }
  login(loginUser: { correo: string, password: string }): Observable<any> {
    // El backend espera 'username' como campo, así que lo mapeamos
    const body = { username: loginUser.correo, password: loginUser.password };
    return this.http.post(`${baseUrl}/api/clientes/login`, body);
  }

  // total de clientes
  getTotalClientes(): Observable<number> {
    return this.http.get<number>(`${baseUrl}/api/clientes/all`);
  }

  // Obtener todos los clientes sin paginación
  getClientesAll(): Observable<any[]> {
    return this.http.get<any[]>(`${baseUrl}/api/clientes/list`);
  }
} 