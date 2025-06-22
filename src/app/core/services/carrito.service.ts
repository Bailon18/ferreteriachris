import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Producto } from 'src/app/modals/Producto.model';

export interface ItemCarrito {
  producto: Producto;
  cantidad: number;
  precioUnitario: number;
  subtotal: number;
}

@Injectable({ providedIn: 'root' })
export class CarritoService {
  private carritoKey = 'carrito';
  private cantidadSubject = new BehaviorSubject<number>(this.getCantidadTotal());
  cantidad$ = this.cantidadSubject.asObservable();

  getCarrito(): ItemCarrito[] {
    const data = localStorage.getItem(this.carritoKey);
    return data ? JSON.parse(data) : [];
  }

  public guardarCarrito(carrito: ItemCarrito[]) {
    localStorage.setItem(this.carritoKey, JSON.stringify(carrito));
    this.cantidadSubject.next(this.getCantidadTotal());
  }

  agregarProducto(producto: Producto) {
    const carrito = this.getCarrito();
    const idx = carrito.findIndex(item => item.producto.id === producto.id);
    if (idx > -1) {
      carrito[idx].cantidad += 1;
      carrito[idx].subtotal = carrito[idx].cantidad * carrito[idx].precioUnitario;
    } else {
      carrito.push({
        producto,
        cantidad: 1,
        precioUnitario: producto.precioVentaGalon,
        subtotal: producto.precioVentaGalon
      });
    }
    this.guardarCarrito(carrito);
  }

  public limpiarCarrito() {
    this.guardarCarrito([]);
  }


  getCantidadTotal(): number {
    const carrito = this.getCarrito();
    return carrito.reduce((sum, item) => sum + item.cantidad, 0);
  }

  actualizarCantidad(productoId: number, nuevaCantidad: number) {
    const carrito = this.getCarrito();
    const idx = carrito.findIndex(item => item.producto.id === productoId);
    if (idx > -1 && nuevaCantidad > 0) {
      carrito[idx].cantidad = nuevaCantidad;
      carrito[idx].subtotal = nuevaCantidad * carrito[idx].precioUnitario;
      this.guardarCarrito(carrito);
    }
  }

  eliminarProducto(productoId: number) {
    let carrito = this.getCarrito();
    carrito = carrito.filter(item => item.producto.id !== productoId);
    this.guardarCarrito(carrito);
  }
}