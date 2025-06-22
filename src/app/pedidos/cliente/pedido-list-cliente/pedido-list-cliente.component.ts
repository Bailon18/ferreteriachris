import { Component, OnInit, OnDestroy } from '@angular/core';
import { PedidoService } from 'src/app/core/services/Pedido.service';
import { TokenService } from 'src/app/core/services/token.service';
import { Pedido } from 'src/app/modals/Pedido.models';
import swall from 'sweetalert2';
import { MatDialog } from '@angular/material/dialog';
import { PedidoDetailModalComponent } from '../pedido-detail-modal/pedido-detail-modal.component';
import { Subscription } from 'rxjs';
import { ActivatedRoute, Router } from '@angular/router';
import { PedidoRequest } from 'src/app/modals/PedidoRequest.model';
import { CarritoService } from 'src/app/core/services/carrito.service';

@Component({
  selector: 'app-pedido-list-cliente',
  templateUrl: './pedido-list-cliente.component.html',
  styleUrls: ['./pedido-list-cliente.component.css']
})
export class PedidoListClienteComponent implements OnInit, OnDestroy {
  pedidos: Pedido[] = [];
  totalItems: number = 0;
  pageSize: number = 5;
  pageIndex: number = 0;
  private authSub?: Subscription;

  constructor(
    private pedidoService: PedidoService,
    private tokenService: TokenService,
    private dialog: MatDialog,
    private route: ActivatedRoute,
    private router: Router,
    private carritoService: CarritoService
  ) {}

  ngOnInit(): void {
    this.verificarEstadoPago(); // Primero verificamos el pago
    // Suscribirse a los cambios de autenticación
    this.authSub = this.tokenService.authStatus$.subscribe(isLogged => {
      if (isLogged) {
        this.cargarPedidos(0, this.pageSize);
      } else {
        this.pedidos = [];
        this.totalItems = 0;
      }
    });

    // Cargar pedidos si ya está logueado al iniciar
    if (this.tokenService.isLogged()) {
      this.cargarPedidos(0, this.pageSize);
    }
  }

  verificarEstadoPago() {
    this.route.queryParams.subscribe(params => {
      const status = params['status'];
      const paymentId = params['payment_id'];

      if (status === 'approved' && paymentId) {
        const pedidoPendienteString = sessionStorage.getItem('pedidoPendiente');

        if (pedidoPendienteString) {
          const pedidoRequest: PedidoRequest = JSON.parse(pedidoPendienteString);

          // Lo ponemos como PENDIENTE para que el vendedor lo gestione, ya no 'PAGADO' directamente
          pedidoRequest.pedido.estado = 'PENDIENTE'; 
          pedidoRequest.pedido.observaciones = `Pago aprobado por Mercado Pago. ID: ${paymentId}`;

          this.pedidoService.crearPedidoConDetalles(pedidoRequest).subscribe({
            next: (pedidoGuardado) => {
              swall.fire(
                '¡Pago Exitoso!',
                'Tu compra se registró correctamente. Puedes verla en esta lista.',
                'success'
              );
              sessionStorage.removeItem('pedidoPendiente');
              this.carritoService.limpiarCarrito();

              // Limpiamos los parámetros de la URL y recargamos los pedidos
              this.router.navigate([], {
                relativeTo: this.route,
                queryParams: {},
                replaceUrl: true
              }).then(() => this.cargarPedidos(0, this.pageSize)); // Recargamos la lista
            },
            error: (err) => {
              swall.fire(
                'Error Crítico',
                'Tu pago fue aprobado pero hubo un error al registrar tu pedido. Contacta a soporte con el ID: ' + paymentId,
                'error'
              );
              sessionStorage.removeItem('pedidoPendiente');
            }
          });
        }
      } else if (status) {
        swall.fire(
          'Pago no completado',
          `Estado: '${status}'. Intenta de nuevo desde el carrito.`,
          'warning'
        );
        sessionStorage.removeItem('pedidoPendiente');
        this.router.navigate([], {
          relativeTo: this.route,
          queryParams: {},
          replaceUrl: true
        });
      }
    });
  }

  cargarPedidos(pageIndex: number, pageSize: number) {
    const clienteId = this.tokenService.getIdUser();
    if (!clienteId) {
      this.pedidos = [];
      this.totalItems = 0;
      return;
    }
    swall.fire({
      title: "Cargando...",
      html: "Por favor espere mientras se cargan los pedidos.",
      allowOutsideClick: false,
      didOpen: () => { swall.showLoading(); }
    });

    this.pedidoService.getPedidosByCliente(clienteId, pageIndex, pageSize).subscribe({
      next: res => {
        if (res && Array.isArray(res.content) && res.content.length > 0) {
          this.pedidos = res.content;
          this.totalItems = res.totalElements || 0;
        } else {
          this.pedidos = [];
          this.totalItems = 0;
        }
        this.pageSize = pageSize;
        this.pageIndex = pageIndex;
        swall.close();
      },
      error: err => {
        this.pedidos = [];
        this.totalItems = 0;
        swall.close();
      }
    });
  }

  onPageChange(page: number) {
    this.cargarPedidos(page, this.pageSize);
  }

  get totalPages(): number {
    return Math.ceil(this.totalItems / this.pageSize);
  }

  verDetalle(pedido: Pedido) {
    this.dialog.open(PedidoDetailModalComponent, {
      width: '700px',
      data: pedido
    });
  }

  ngOnDestroy(): void {
    this.authSub?.unsubscribe();
  }
}
