import { Component, OnInit } from '@angular/core';
import { ProductosService } from 'src/app/core/services/productos.service';
import swall from 'sweetalert2';

@Component({
  selector: 'app-producto-list-admin',
  templateUrl: './producto-list-admin.component.html',
  styleUrls: ['./producto-list-admin.component.css']
})
export class ProductoListAdminComponent implements OnInit {
  productos: any[] = [];
  totalItems: number = 0;
  pageSize: number = 5;
  pageIndex: number = 0;
  textoBuscar: string = '';

  marcas: any[] = [];
  tiposPintura: any[] = [];
  marcaSeleccionada: number | null = null;
  tipoSeleccionado: number | null = null;

  mostrarModal = false;
  productoAEditarId: number | null = null;

  stockMinimoCount: number = 0;
  mostrarWarningStockMinimo: boolean = false;
  mostrarSoloStockMinimo: boolean = false;

  constructor(private productosService: ProductosService) {}

  ngOnInit(): void {
    this.cargarMarcas();
    this.cargarTiposPintura();
    this.cargarProductos(0, this.pageSize);
    this.verificarStockMinimo();
  }

  cargarMarcas() {
    this.productosService.getMarcas().subscribe({
      next: res => this.marcas = res,
      error: () => this.marcas = []
    });
  }

  cargarTiposPintura() {
    this.productosService.getTiposPintura().subscribe({
      next: res => this.tiposPintura = res,
      error: () => this.tiposPintura = []
    });
  }

  verificarStockMinimo() {
    this.productosService.getCountProductosStockMinimo().subscribe({
      next: (count) => {
        this.stockMinimoCount = count;
        this.mostrarWarningStockMinimo = count > 0;
      },
      error: (err) => {
        console.error('Error al verificar stock mínimo:', err);
      }
    });
  }

  filtrarStockMinimo() {
    this.mostrarSoloStockMinimo = true;
    this.mostrarWarningStockMinimo = false;
    this.productosService.getProductosStockMinimo(this.pageIndex, this.pageSize).subscribe({
      next: (res) => {
        if (res && Array.isArray(res.content)) {
          this.productos = res.content;
          this.totalItems = res.totalElements || 0;
        }
      },
      error: (err) => {
        console.error('Error al cargar productos con stock mínimo:', err);
      }
    });
  }

  quitarFiltroStockMinimo() {
    this.mostrarSoloStockMinimo = false;
    this.cargarProductos(this.pageIndex, this.pageSize);
  }

  cargarProductos(pageIndex: number, pageSize: number) {
    if (this.mostrarSoloStockMinimo) {
      this.productosService.getProductosStockMinimo(pageIndex, pageSize).subscribe({
        next: res => {
          if (res && Array.isArray(res.content)) {
            this.productos = res.content;
            this.totalItems = res.totalElements || 0;
          }
          this.pageSize = pageSize;
          this.pageIndex = pageIndex;
          this.verificarStockMinimo();
        },
        error: err => {
          console.error('Error al cargar productos:', err);
        }
      });
    } else {
      swall.fire({
        title: "Cargando...",
        html: "Por favor espere mientras se cargan los productos.",
        allowOutsideClick: false,
        didOpen: () => { swall.showLoading(); }
      });

      let params: any = {
        page: pageIndex,
        size: pageSize
      };
      if (this.textoBuscar) params.textoBuscar = this.textoBuscar;
      if (this.marcaSeleccionada) params.marcaId = this.marcaSeleccionada;
      if (this.tipoSeleccionado) params.tipoId = this.tipoSeleccionado;

      this.productosService.filtrarProductosAvanzado(params).subscribe({
        next: res => {
          if (res && Array.isArray(res.content) && res.content.length > 0) {
            this.productos = res.content;
            this.totalItems = res.totalElements || 0;
          } else {
            this.productos = [];
            this.totalItems = 0;
          }
          this.pageSize = pageSize;
          this.pageIndex = pageIndex;
          swall.close();
          this.verificarStockMinimo();
        },
        error: err => {
          this.productos = [];
          this.totalItems = 0;
          swall.close();
          swall.fire({
            icon: 'error',
            title: 'Error',
            text: 'No se pudieron cargar los productos.',
            confirmButtonColor: '#d33'
          });
        }
      });
    }
  }

  onPageChange(page: number) {
    this.cargarProductos(page, this.pageSize);
  }

  onSearch() {
    this.pageIndex = 0;
    this.cargarProductos(0, this.pageSize);
  }

  onFiltrar() {
    this.pageIndex = 0;
    this.cargarProductos(0, this.pageSize);
  }

  abrirModalNuevoProducto() {
    this.productoAEditarId = null;
    this.mostrarModal = true;
  }

  abrirModalEditarProducto(producto: any) {
    this.productoAEditarId = producto.id;
    this.mostrarModal = true;
  }

  productoGuardadoExitoso() {
    this.cargarProductos(this.pageIndex, this.pageSize);
    this.mostrarModal = false;
    this.verificarStockMinimo();
  }

  cambiarEstadoProducto(producto: any) {
    const nuevoEstado = !producto.estaActivo;
    swall.fire({
      title: '¿Estás seguro?',
      text: `¿Deseas ${nuevoEstado ? 'activar' : 'bloquear'} este producto?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Sí, continuar',
      cancelButtonText: 'Cancelar'
    }).then((result) => {
      if (result.isConfirmed) {
        this.productosService.cambiarEstadoProducto(producto.id, nuevoEstado).subscribe({
          next: () => {
            this.cargarProductos(this.pageIndex, this.pageSize);
            swall.fire({
              icon: 'success',
              title: 'Estado actualizado',
              text: `El producto ha sido ${nuevoEstado ? 'activado' : 'bloqueado'} correctamente.`,
              confirmButtonColor: '#3085d6'
            });
          },
          error: (err) => {
            swall.fire({
              icon: 'error',
              title: 'Error',
              text: 'No se pudo actualizar el estado del producto.',
              confirmButtonColor: '#d33'
            });
          }
        });
      }
    });
  }

  get totalPages(): number {
    return Math.ceil(this.totalItems / this.pageSize);
  }

  limpiarFiltros() {
    this.textoBuscar = '';
    this.marcaSeleccionada = null;
    this.tipoSeleccionado = null;
    this.pageIndex = 0;
    this.cargarProductos(0, this.pageSize);
  }
}
