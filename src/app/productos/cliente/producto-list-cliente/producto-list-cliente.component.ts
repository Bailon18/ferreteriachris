import { Component, OnInit, OnDestroy } from '@angular/core';
import { ProductosService } from 'src/app/core/services/productos.service';
import { Producto } from 'src/app/modals/Producto.model';
import { MatDialog } from '@angular/material/dialog';
import { ProductoDetailModalComponent } from '../producto-detail-modal/producto-detail-modal.component';
import { CarritoService } from 'src/app/core/services/carrito.service';
import swall from 'sweetalert2';

@Component({
  selector: 'app-producto-list-cliente',
  templateUrl: './producto-list-cliente.component.html',
  styleUrls: ['./producto-list-cliente.component.css']
})
export class ProductoListClienteComponent implements OnInit, OnDestroy {
  busqueda: string = '';
  marcaSeleccionada: number | '' = '';
  tipoSeleccionado: number | '' = '';
  colorSeleccionado: string = '';
  precioMin: number | null = null;
  precioMax: number | null = null;

  coloresUnicos: string[] = [];
  marcas: any[] = [];
  tiposPintura: any[] = [];
  productos: Producto[] = [];
  productosFiltrados: Producto[] = [];
  private refreshInterval: any;

  constructor(
    private productosService: ProductosService,
    private dialog: MatDialog,
    private carritoService: CarritoService
  ) {}

  ngOnInit() {
    this.cargarProductos();

    // Refresca productos cada 20 segundos
    this.refreshInterval = setInterval(() => {
      this.cargarProductos(true); // true para mantener los filtros
    }, 20000);

    this.productosService.getMarcas().subscribe(data => {
      this.marcas = data;
    });

    this.productosService.getTiposPintura().subscribe(data => {
      this.tiposPintura = data;
    });
  }

  ngOnDestroy() {
    if (this.refreshInterval) {
      clearInterval(this.refreshInterval);
    }
  }

  cargarProductos(mantenerFiltros: boolean = false) {
    this.productosService.getProductos().subscribe(data => {
      this.productos = data.filter(p => p.estaActivo === true);
      this.coloresUnicos = [...new Set(this.productos.map(p => p.color).filter(c => !!c))];
      if (mantenerFiltros) {
        this.filtrarProductos();
      } else {
        this.productosFiltrados = this.productos;
      }
    });
  }

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

  filtrarProductos() {
    const texto = (this.busqueda || '').trim().toLowerCase();

    // Si todos los filtros están en "Todos" o vacíos, muestra todos los productos activos
    const sinFiltros =
      !texto &&
      !this.marcaSeleccionada &&
      !this.tipoSeleccionado &&
      !this.colorSeleccionado &&
      (this.precioMin == null) &&
      (this.precioMax == null);

    if (sinFiltros) {
      this.productosFiltrados = this.productos;
      return;
    }

    // Si hay algún filtro, aplica el filtrado SOLO a productos activos
    this.productosFiltrados = this.productos.filter(p => {
      const coincideNombre = p.nombre.toLowerCase().includes(texto);
      const coincideMarca = this.marcaSeleccionada ? p.marca?.id === +this.marcaSeleccionada : true;
      const coincideTipo = this.tipoSeleccionado ? p.tipoPintura?.id === +this.tipoSeleccionado : true;
      const coincideColor = this.colorSeleccionado ? p.color === this.colorSeleccionado : true;
      const coincidePrecioMin = this.precioMin != null ? p.precioVentaGalon >= this.precioMin : true;
      const coincidePrecioMax = this.precioMax != null ? p.precioVentaGalon <= this.precioMax : true;
      return coincideNombre && coincideMarca && coincideTipo && coincideColor && coincidePrecioMin && coincidePrecioMax;
    });
  }

  limpiarFiltros() {
    this.marcaSeleccionada = '';
    this.tipoSeleccionado = '';
    this.colorSeleccionado = '';
    this.precioMin = null;
    this.precioMax = null;
    this.busqueda = '';
    this.productosFiltrados = this.productos;
  }

  abrirDetalle(producto: Producto) {
    this.dialog.open(ProductoDetailModalComponent, {
      width: '460px',
      data: producto
    });
  }
}
