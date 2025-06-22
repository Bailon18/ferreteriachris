import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Producto } from 'src/app/modals/Producto.model';
import { CarritoService } from 'src/app/core/services/carrito.service';
import swall from 'sweetalert2';

@Component({
  selector: 'app-producto-detail-modal',
  templateUrl: './producto-detail-modal.component.html',
  styleUrls: ['./producto-detail-modal.component.css']
})
export class ProductoDetailModalComponent {
  constructor(
    @Inject(MAT_DIALOG_DATA) public producto: Producto,
    private carritoService: CarritoService
  ) {}

  agregarAlCarrito(producto: Producto) {
    const carrito = this.carritoService.getCarrito();
    const item = carrito.find(i => i.producto.id === producto.id);
    const cantidadEnCarrito = item ? item.cantidad : 0;

    if (cantidadEnCarrito >= producto.stockTotal) {
      swall.fire({
        icon: 'warning',
        title: 'Stock insuficiente',
        text: `No puedes agregar más de ${producto.stockTotal} unidades de "${producto.nombre}" al carrito.`,
        timer: 2500,
        showConfirmButton: false,
        position: 'top-end',
        toast: true
      });
      return;
    }

    this.carritoService.agregarProducto(producto);
    const nuevaCantidad = cantidadEnCarrito + 1;
    swall.fire({
      icon: 'success',
      title: '¡Agregado al carrito!',
      text: `${producto.nombre} seleccionado (${nuevaCantidad} ${nuevaCantidad === 1 ? 'unidad' : 'unidades'})`,
      timer: 2000,
      showConfirmButton: false,
      position: 'top-end',
      toast: true
    });
  }
}
