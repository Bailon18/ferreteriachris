import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import baseUrl from 'src/app/helpers';
import { ChangePasswordDTO } from 'src/app/auth/model/changePsswordDTO';
import { ApiResponsePassWord } from 'src/app/auth/model/responseapi';
import { User } from 'src/app/modals/usuario';

@Injectable({
  providedIn: 'root'
})
export class ChangePasswordService {

  constructor(private http: HttpClient) { }


  // Verifica si el correo ya existe en cliente 
  existeCorreoCliente(correo: string,): Observable<boolean> {
    return this.http.get<boolean>(`${baseUrl}/api/clientes/exists-correo-cliente`, { params: { correo } });
  }

  // Verifica si el correo ya existe en usuario
  existeCorreoUsuario(correoElectronico: string): Observable<any> {
    return this.http.get(`${baseUrl}/api/user/validarcorreo?correoElectronico=${correoElectronico}`, { observe: 'response' });
  }

 
  recuperarContrasena(correo: string, username: string): Observable<any> {
    const url = `${baseUrl}/email-password/send-email/${correo}/${username}`;
    return this.http.get(url, { headers: { 'Content-Type': 'application/json' }, observe: 'response' });
  }


  changePassword(dto: ChangePasswordDTO): Observable<ApiResponsePassWord> {
    return this.http.post<ApiResponsePassWord>(`${baseUrl}/email-password/change-password`, dto);
  }


}
