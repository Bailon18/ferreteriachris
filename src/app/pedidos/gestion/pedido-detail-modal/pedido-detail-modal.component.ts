import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { PedidoService } from 'src/app/core/services/Pedido.service';
import swall from 'sweetalert2';

const ESTADOS = ['PENDIENTE', 'EN_PROCESO', 'PREPARADO', 'ENTREGADO', 'CANCELADO'];

@Component({
  selector: 'app-pedido-detail-modal',
  templateUrl: './pedido-detail-modal.component.html',
  styleUrls: ['./pedido-detail-modal.component.css']
})
export class PedidoDetailModalComponent implements OnInit {
  @Input() pedidoId: number | null = null;
  @Output() pedidoActualizado = new EventEmitter<void>();
  @Output() cerrar = new EventEmitter<void>();

  pedido: any = null;
  detalles: any[] = [];
  cargando = false;
  estados = ESTADOS;
  productosPreparados: Set<number> = new Set();

  constructor(private pedidoService: PedidoService) {}

  ngOnInit(): void {
    if (this.pedidoId) {
      this.cargarPedido();
    }
  }

  cargarPedido() {
    this.cargando = true;
    this.pedidoService.getPedidoById(this.pedidoId!).subscribe({
      next: (pedido) => {
        this.pedido = pedido;
        this.cargarDetalles();
      },
      error: (err) => {
        this.cargando = false;
        swall.fire({
          icon: 'error',
          title: 'Error',
          text: 'No se pudo cargar el pedido.',
          confirmButtonColor: '#d33'
        });
      }
    });
  }

  cargarDetalles() {
    this.pedidoService.getDetallesByPedidoId(this.pedidoId!).subscribe({
      next: (detalles) => {
        this.detalles = detalles;
        this.cargando = false;
        if (this.pedido?.estado === 'PREPARADO' || this.pedido?.estado === 'ENTREGADO') {
          this.productosPreparados = new Set(this.detalles.map(det => det.id));
        } else {
          this.productosPreparados = new Set();
        }
      },
      error: (err) => {
        this.cargando = false;
        swall.fire({
          icon: 'error',
          title: 'Error',
          text: 'No se pudieron cargar los detalles del pedido.',
          confirmButtonColor: '#d33'
        });
      }
    });
  }

  cambiarEstado(nuevoEstado: string) {
    if (nuevoEstado === 'PREPARADO' && !this.todosProductosPreparados()) {
      swall.fire({
        icon: 'warning',
        title: 'Productos no preparados',
        text: 'Debes marcar todos los productos como preparados antes de cambiar el estado a PREPARADO.',
        confirmButtonColor: '#ffb300'
      });
      return;
    }
    swall.fire({
      title: '¿Estás seguro?',
      text: `¿Deseas cambiar el estado del pedido a ${nuevoEstado}?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Sí, cambiar',
      cancelButtonText: 'Cancelar'
    }).then((result) => {
      if (result.isConfirmed) {
        this.pedidoService.cambiarEstadoPedido(this.pedidoId!, nuevoEstado).subscribe({
          next: () => {
            this.pedido.estado = nuevoEstado;
            swall.fire({
              icon: 'success',
              title: 'Estado actualizado',
              text: 'El estado del pedido ha sido actualizado correctamente.',
              confirmButtonColor: '#3085d6'
            });
          },
          error: (err) => {
            swall.fire({
              icon: 'error',
              title: 'Error',
              text: 'No se pudo actualizar el estado del pedido.',
              confirmButtonColor: '#d33'
            });
          }
        });
      }
    });
  }

  todosProductosPreparados(): boolean {
    return this.detalles.length > 0 && this.detalles.every(det => this.productosPreparados.has(det.id));
  }

  toggleProductoPreparado(detalleId: number) {
    if (this.productosPreparados.has(detalleId)) {
      this.productosPreparados.delete(detalleId);
    } else {
      this.productosPreparados.add(detalleId);
    }
  }

  cerrarModal() {
    this.pedidoActualizado.emit();
    this.cerrar.emit();
  }

  puedeCambiarA(estado: string): boolean {
    if (this.pedido?.estado === 'PENDIENTE') {
      return estado === 'EN_PROCESO' || estado === 'CANCELADO';
    }
    if (this.pedido?.estado === 'EN_PROCESO') {
      if (estado === 'PREPARADO') {
        return this.todosProductosPreparados();
      }
      return estado === 'CANCELADO';
    }
    if (this.pedido?.estado === 'PREPARADO') {
      return estado === 'ENTREGADO' || estado === 'CANCELADO';
    }
    // Si ya está ENTREGADO o CANCELADO, no se puede cambiar a ningún otro estado
    return false;
  }

  getLabelCheck(): string {
    switch (this.pedido?.estado) {
      case 'EN_PROCESO':
        return 'Preparado';
      case 'PREPARADO':
        return 'Listo';
      case 'ENTREGADO':
        return 'Entregado';
      case 'CANCELADO':
        return 'No aplica';
      default:
        return 'Preparado';
    }
  }
}
