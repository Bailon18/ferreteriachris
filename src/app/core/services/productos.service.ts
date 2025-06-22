import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Producto } from '../../modals/Producto.model';
import baseUrl from '../../helpers';

@Injectable({
  providedIn: 'root'
})
export class ProductosService {

  constructor(private http: HttpClient) {}

  getProductos(): Observable<Producto[]> {
    return this.http.get<Producto[]>(`${baseUrl}/api/productos/list`);
  }

  // Listar productos paginados
  getProductosPaginados(page: number = 0, size: number = 5): Observable<any> {
    return this.http.get<any>(`${baseUrl}/api/productos?page=${page}&size=${size}`);
  }

  // Buscar productos por texto
  filtrarProductos(textoBuscar: string, page: number = 0, size: number = 5): Observable<any> {
    return this.http.get<any>(`${baseUrl}/api/productos/filtro?textoBuscar=${textoBuscar}&page=${page}&size=${size}`);
  }

  // Eliminar producto
  eliminarProducto(id: number): Observable<any> {
    return this.http.delete(`${baseUrl}/api/productos/${id}`);
  }

  // --- Métodos para Marcas ---
  getMarcas(): Observable<any[]> {
    return this.http.get<any[]>(`${baseUrl}/api/marcas`);
  }

  getMarcaById(id: number): Observable<any> {
    return this.http.get<any>(`${baseUrl}/api/marcas/${id}`);
  }

  // --- Métodos para Tipos de Pintura ---
  getTiposPintura(): Observable<any[]> {
    return this.http.get<any[]>(`${baseUrl}/api/tipos-pintura`);
  }

  getTipoPinturaById(id: number): Observable<any> {
    return this.http.get<any>(`${baseUrl}/api/tipos-pintura/${id}`);
  }

  // Filtro avanzado (marca, tipo, texto, paginación)
  filtrarProductosAvanzado(params: any): Observable<any> {
    // Construye la query string
    const query = Object.keys(params)
      .map(k => encodeURIComponent(k) + '=' + encodeURIComponent(params[k]))
      .join('&');
    return this.http.get<any>(`${baseUrl}/api/productos/filtro-avanzado?${query}`);
  }

  crearOActualizarProducto(producto: any): Observable<any> {
    return this.http.post(`${baseUrl}/api/productos`, producto);
  }

  getProductoById(id: number): Observable<any> {
    return this.http.get<any>(`${baseUrl}/api/productos/${id}`);
  }

  getCountProductosStockMinimo(): Observable<number> {
    return this.http.get<number>(`${baseUrl}/api/productos/stock-minimo/count`);
  }

  getProductosStockMinimo(page: number = 0, size: number = 5): Observable<any> {
    return this.http.get<any>(`${baseUrl}/api/productos/stock-minimo?page=${page}&size=${size}`);
  }

  verificarProductoDuplicado(nombre: string, color: string, marcaId: number, tipoId: number, excludeId?: number): Observable<boolean> {
    let url = `${baseUrl}/api/productos/verificar-duplicado?nombre=${nombre}&color=${color}&marcaId=${marcaId}&tipoId=${tipoId}`;
    if (excludeId) {
      url += `&excludeId=${excludeId}`;
    }
    return this.http.get<boolean>(url);
  }

  cambiarEstadoProducto(id: number, estaActivo: boolean): Observable<any> {
    return this.http.patch(`${baseUrl}/api/productos/${id}/estado`, { estaActivo });
  }
}
