import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import baseUrl from 'src/app/helpers';

@Injectable({ providedIn: 'root' })
export class MercadoPagoService {
    
  private apiUrl = `${baseUrl}/api/mercadopago`;

  constructor(private http: HttpClient) {}

  crearPreferencia(datos: any): Observable<any> {
    const headers = new HttpHeaders().set('Content-Type', 'application/json');
    return this.http.post(`${this.apiUrl}/crear-preferencia`, datos, { headers });
  }
}
