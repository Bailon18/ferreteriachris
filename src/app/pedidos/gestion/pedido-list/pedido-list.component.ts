import { Component, OnInit } from '@angular/core';
import { PedidoService } from 'src/app/core/services/Pedido.service';
import { TokenService } from 'src/app/core/services/token.service';
import swall from 'sweetalert2';
import { UsuarioService } from 'src/app/core/services/usuario.service';

const ESTADOS = ['PENDIENTE', 'EN_PROCESO', 'PREPARADO', 'ENTREGADO', 'CANCELADO'];

@Component({
  selector: 'app-pedido-list',
  templateUrl: './pedido-list.component.html',
  styleUrls: ['./pedido-list.component.css']
})
export class PedidoListComponent implements OnInit {
  pedidos: any[] = [];
  totalItems: number = 0;
  pageSize: number = 5;
  pageIndex: number = 0;
  cargando = false;
  esAdmin = false;
  vendedorId: number | null = null;
  estadoFiltro: string | null = null;
  estados = ESTADOS;
  mostrarModal = false;
  pedidoSeleccionadoId: number | null = null;
  fechaInicio: string | null = null;
  fechaFin: string | null = null;
  vendedores: any[] = [];
  vendedorFiltro: number | null = null;

  constructor(
    private pedidoService: PedidoService,
    private tokenService: TokenService,
    private usuarioService: UsuarioService
  ) {}

  ngOnInit(): void {
    this.esAdmin = this.tokenService.isAdmin2();
    console.log('esAdmin:', this.esAdmin);
    console.log('roles:', this.tokenService.getAuthorities());
    if (!this.esAdmin) {
      this.vendedorId = this.tokenService.getIdUser();
    } else {
      this.usuarioService.getVendedores().subscribe(res => {
        this.vendedores = res;
        console.log('vendedores:', this.vendedores);
      });
    }
    const hoy = new Date();
    const yyyy = hoy.getFullYear();
    const mm = String(hoy.getMonth() + 1).padStart(2, '0');
    const dd = String(hoy.getDate()).padStart(2, '0');
    const hoyStr = `${yyyy}-${mm}-${dd}`;
    this.fechaInicio = hoyStr;
    this.fechaFin = hoyStr;
    this.cargarPedidos(0, this.pageSize);
  }

  formatearFecha(fecha: string, fin: boolean = false): string {
    return fecha ? `${fecha} ${fin ? '23:59:59' : '00:00:00'}` : '';
  }

  cargarPedidos(pageIndex: number, pageSize: number) {
    this.cargando = true;
    let estado = this.estadoFiltro;
    let vendedorId = this.esAdmin ? this.vendedorFiltro : this.vendedorId;
    let inicio = this.fechaInicio ? this.formatearFecha(this.fechaInicio, false) : null;
    let fin = this.fechaFin ? this.formatearFecha(this.fechaFin, true) : null;

    // Si no hay ningún filtro, usa el método original
    if (!estado && !inicio && !fin && !vendedorId) {
      if (this.esAdmin) {
        this.pedidoService.getPedidos(pageIndex, pageSize).subscribe(this.handleResponse(pageIndex, pageSize));
      } else if (this.vendedorId) {
        this.pedidoService.getPedidosByVendedor(this.vendedorId, pageIndex, pageSize).subscribe(this.handleResponse(pageIndex, pageSize));
      }
      return;
    }

    this.pedidoService.filtrarPedidos(
      estado,
      vendedorId,
      inicio,
      fin,
      pageIndex,
      pageSize
    ).subscribe(this.handleResponse(pageIndex, pageSize));
  }

  handleResponse(pageIndex: number, pageSize: number) {
    return {
      next: (res: any) => {
        if (res && Array.isArray(res.content) && res.content.length > 0) {
          this.pedidos = res.content;
          this.totalItems = res.totalElements || 0;
        } else {
          this.pedidos = [];
          this.totalItems = 0;
        }
        this.pageSize = pageSize;
        this.pageIndex = pageIndex;
        this.cargando = false;
      },
      error: (err: any)  => {
        this.pedidos = [];
        this.totalItems = 0;
        this.cargando = false;
        swall.fire({
          icon: 'error',
          title: 'Error',
          text: 'No se pudieron cargar los pedidos.',
          confirmButtonColor: '#d33'
        });
      }
    };
  }

  onPageChange(page: number) {
    this.cargarPedidos(page, this.pageSize);
  }

  onEstadoChange(estado: string | null) {
    this.estadoFiltro = estado;
    this.pageIndex = 0;
    this.cargarPedidos(0, this.pageSize);
  }

  onFiltrarPorFecha() {
    this.pageIndex = 0;
    this.cargarPedidos(0, this.pageSize);
  }

  limpiarFiltroFecha() {
    this.fechaInicio = null;
    this.fechaFin = null;
    this.cargarPedidos(0, this.pageSize);
  }

  get totalPages(): number {
    return Math.ceil(this.totalItems / this.pageSize);
  }

  abrirModalDetalle(pedidoId: number) {
    this.pedidoSeleccionadoId = pedidoId;
    this.mostrarModal = true;
  }

  cerrarModal() {
    this.mostrarModal = false;
    this.pedidoSeleccionadoId = null;
  }

  pedidoActualizado() {
    this.cargarPedidos(this.pageIndex, this.pageSize);
    this.cerrarModal();
  }

  onVendedorChange() {
    this.pageIndex = 0;
    this.cargarPedidos(0, this.pageSize);
  }
}
