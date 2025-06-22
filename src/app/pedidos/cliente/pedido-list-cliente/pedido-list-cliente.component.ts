import { Component, OnInit, OnDestroy } from '@angular/core';
import { PedidoService } from 'src/app/core/services/Pedido.service';
import { TokenService } from 'src/app/core/services/token.service';
import { Pedido } from 'src/app/modals/Pedido.models';
import swall from 'sweetalert2';
import { MatDialog } from '@angular/material/dialog';
import { PedidoDetailModalComponent } from '../pedido-detail-modal/pedido-detail-modal.component';
import { Subscription } from 'rxjs';

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
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
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
