import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Producto } from 'src/app/modals/Producto.model';
import { CarritoService } from 'src/app/core/services/carrito.service';
import swall from 'sweetalert2';
import { Pedido } from 'src/app/modals/Pedido.models';
import { PedidoService } from 'src/app/core/services/Pedido.service';

@Component({
  selector: 'app-pedido-detail-modal',
  templateUrl: './pedido-detail-modal.component.html',
  styleUrls: ['./pedido-detail-modal.component.css']
})
export class PedidoDetailModalComponent implements OnInit{

  detalles: any[] = [];

  constructor(
    @Inject(MAT_DIALOG_DATA) public producto: Producto,
    @Inject(MAT_DIALOG_DATA) public pedido: Pedido,
    private pedidoService: PedidoService,
    private carritoService: CarritoService,
    private dialogRef: MatDialogRef<PedidoDetailModalComponent>
  ) {}

  agregarAlCarrito(producto: Producto) {
    this.carritoService.agregarProducto(producto);
    const carrito = this.carritoService.getCarrito();
    const item = carrito.find(i => i.producto.id === producto.id);
    const cantidad = item ? item.cantidad : 1;
    swall.fire({
      icon: 'success',
      title: '¡Agregado al carrito!',
      text: `${producto.nombre} seleccionado (${cantidad} ${cantidad === 1 ? 'unidad' : 'unidades'})`,
      timer: 2000,
      showConfirmButton: false,
      position: 'top-end',
      toast: true
    });
  }

  ngOnInit(): void {
    this.pedidoService.getDetallesByPedidoId(this.pedido.id!).subscribe({
      next: res => this.detalles = res,
      error: () => this.detalles = []
    });
  }

  cerrar() {
    this.dialogRef.close();
  }
}
