import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { PedidoRequest } from 'src/app/modals/PedidoRequest.model';
import { Observable } from 'rxjs';
import baseUrl from 'src/app/helpers';

@Injectable({ providedIn: 'root' })
export class PedidoService {

  constructor(private http: HttpClient) {}

  crearPedidoConDetalles(pedidoRequest: PedidoRequest): Observable<any> {
    return this.http.post(`${baseUrl}/api/pedidos`, pedidoRequest);
  }

  getPedidosByCliente(clienteId: number, page: number = 0, size: number = 5): Observable<any> {
    return this.http.get<any>(`${baseUrl}/api/pedidos/cliente/${clienteId}?page=${page}&size=${size}`);
  }

  getDetallesByPedidoId(pedidoId: number): Observable<any[]> {
    return this.http.get<any[]>(`${baseUrl}/api/pedido-detalle/pedido/${pedidoId}`);
  }

  // Listar todos los pedidos (para ADMINISTRADOR)
  getPedidos(page: number = 0, size: number = 5): Observable<any> {
    return this.http.get<any>(`${baseUrl}/api/pedidos?page=${page}&size=${size}`);
  }

  // Listar pedidos por vendedor (para VENDEDOR)
  getPedidosByVendedor(vendedorId: number, page: number = 0, size: number = 5): Observable<any> {
    return this.http.get<any>(`${baseUrl}/api/pedidos/vendedor/${vendedorId}?page=${page}&size=${size}`);
  }

  // Filtrar pedidos por estado (para admin o vendedor)
  getPedidosByEstado(estado: string, page: number = 0, size: number = 5, vendedorId?: number | null, esAdmin?: boolean): Observable<any> {
    if (esAdmin) {
      return this.http.get<any>(`${baseUrl}/api/pedidos/estado?estado=${estado}&page=${page}&size=${size}`);
    } else if (vendedorId) {
      return this.http.get<any>(`${baseUrl}/api/pedidos/vendedor/${vendedorId}?estado=${estado}&page=${page}&size=${size}`);
    }
    return this.http.get<any>(`${baseUrl}/api/pedidos/estado?estado=${estado}&page=${page}&size=${size}`);
  }

  // Cambiar estado de pedido
  cambiarEstadoPedido(pedidoId: number, nuevoEstado: string): Observable<any> {
    return this.http.post(`${baseUrl}/api/pedidos/${pedidoId}/cambiar-estado`, { estado: nuevoEstado });
  }

  // Obtener pedido por ID
  getPedidoById(pedidoId: number): Observable<any> {
    return this.http.get<any>(`${baseUrl}/api/pedidos/${pedidoId}`);
  }

  // Filtrar pedidos por fecha (admin)
  getPedidosByFecha(fechaInicio: string, fechaFin: string, page: number = 0, size: number = 5): Observable<any> {
    return this.http.get<any>(`${baseUrl}/api/pedidos/fecha?inicio=${fechaInicio}&fin=${fechaFin}&page=${page}&size=${size}`);
  }

  // Filtrar pedidos por vendedor y fecha
  getPedidosByVendedorAndFecha(vendedorId: number, fechaInicio: string, fechaFin: string, page: number = 0, size: number = 5): Observable<any> {
    return this.http.get<any>(`${baseUrl}/api/pedidos/vendedor-fecha?vendedorId=${vendedorId}&inicio=${fechaInicio}&fin=${fechaFin}&page=${page}&size=${size}`);
  }

  filtrarPedidos(
    estado: string | null,
    vendedorId: number | null,
    fechaInicio: string | null,
    fechaFin: string | null,
    page: number = 0,
    size: number = 5
  ): Observable<any> {
    let params = [];
    if (estado) params.push(`estado=${estado}`);
    if (vendedorId) params.push(`vendedorId=${vendedorId}`);
    if (fechaInicio) params.push(`inicio=${fechaInicio}`);
    if (fechaFin) params.push(`fin=${fechaFin}`);
    params.push(`page=${page}`);
    params.push(`size=${size}`);
    return this.http.get<any>(`${baseUrl}/api/pedidos/filtro?${params.join('&')}`);
  }


}
