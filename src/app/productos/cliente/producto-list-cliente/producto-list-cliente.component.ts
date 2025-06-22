import { Component, OnInit, OnDestroy } from '@angular/core';
import { ProductosService } from 'src/app/core/services/productos.service';
import { Producto } from 'src/app/modals/Producto.model';
import { MatDialog } from '@angular/material/dialog';
import { ProductoDetailModalComponent } from '../producto-detail-modal/producto-detail-modal.component';
import { CarritoService } from 'src/app/core/services/carrito.service';
import swall from 'sweetalert2';
import { ActivatedRoute, Router } from '@angular/router';
import { PedidoService } from 'src/app/core/services/Pedido.service';
import { PedidoRequest } from 'src/app/modals/PedidoRequest.model';

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
    private carritoService: CarritoService,
    private route: ActivatedRoute,
    private router: Router,
    private pedidoService: PedidoService
  ) {}

  ngOnInit() {
    this.cargarProductos();
    this.verificarEstadoPago();

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

  verificarEstadoPago() {
    console.log('Verificando estado de pago de Mercado Pago...');
    this.route.queryParams.subscribe(params => {
      const status = params['status'];
      const paymentId = params['payment_id'];
      console.log('Parámetros de URL recibidos:', params);

      if (status === 'approved' && paymentId) {
        console.log('Pago aprobado. Procesando el pedido pendiente...');
        const pedidoPendienteString = sessionStorage.getItem('pedidoPendiente');

        if (pedidoPendienteString) {
          console.log('Se encontró un pedido pendiente en sessionStorage.');
          const pedidoRequest: PedidoRequest = JSON.parse(pedidoPendienteString);

          // Actualizamos el estado del pedido a 'PAGADO'
          pedidoRequest.pedido.estado = 'PENDIENTE';
          pedidoRequest.pedido.observaciones = `Pago aprobado mediante Mercado Pago. ID de pago: ${paymentId}`;
          console.log('Pedido actualizado, listo para enviar al backend:', pedidoRequest);

          // Guardamos el pedido final en la base de datos
          this.pedidoService.crearPedidoConDetalles(pedidoRequest).subscribe({
            next: (pedidoGuardado) => {
              console.log('Pedido guardado exitosamente en el backend:', pedidoGuardado);
              swall.fire(
                '¡Pago Exitoso!',
                'Tu compra ha sido procesada y registrada correctamente.',
                'success'
              );
              // Limpiamos todo para evitar duplicados
              console.log('Limpiando el carrito y el sessionStorage.');
              sessionStorage.removeItem('pedidoPendiente');
              this.carritoService.limpiarCarrito();

              // Limpiamos los parámetros de la URL para que no se reprocese al recargar
              this.router.navigate([], {
                relativeTo: this.route,
                queryParams: {},
                replaceUrl: true
              });
            },
            error: (err) => {
              console.error('Error al guardar el pedido en el backend:', err);
              swall.fire(
                'Error Crítico',
                'Tu pago fue aprobado pero hubo un error al registrar tu pedido. Por favor, contacta a soporte con el ID de pago: ' + paymentId,
                'error'
              );
              // Aunque hubo un error, es mejor limpiar el session storage para no intentar de nuevo con datos viejos.
              sessionStorage.removeItem('pedidoPendiente');
            }
          });
        } else {
            console.warn('Pago aprobado, pero no se encontró ningún pedido pendiente en sessionStorage. El usuario podría haber limpiado la caché o recargado la página indebidamente.');
        }
      } else if (status) {
        // Manejar otros estados (pending, failure, etc.)
        console.warn(`El pago no fue aprobado. Estado: ${status}.`);
        swall.fire(
            'Pago no completado',
            `El estado de tu pago es: '${status}'. Si ya pagaste, puede que esté pendiente de aprobación. Si no, puedes intentarlo de nuevo desde el carrito.`,
            'warning'
          );
        // Limpiamos el pedido de sessionStorage para evitar procesar un pedido fallido
        sessionStorage.removeItem('pedidoPendiente');
        // Limpiamos la URL
        this.router.navigate([], {
          relativeTo: this.route,
          queryParams: {},
          replaceUrl: true
        });
      } else {
        console.log('No se encontraron parámetros de estado de pago en la URL. Flujo normal.');
      }
    });
  }
}
