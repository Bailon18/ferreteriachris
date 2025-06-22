import { Component, OnInit } from '@angular/core';
import { CarritoService, ItemCarrito } from 'src/app/core/services/carrito.service';
import { TokenService } from 'src/app/core/services/token.service';
import swall from 'sweetalert2';
import { MatDialog } from '@angular/material/dialog';
import { AuthModalComponent } from 'src/app/auth/auth-modal/auth-modal.component';
import { PedidoService } from 'src/app/core/services/Pedido.service';
import { PedidoRequest } from 'src/app/modals/PedidoRequest.model';
import { Pedido } from 'src/app/modals/Pedido.models';
import { PedidoDetalle } from 'src/app/modals/PedidoDetalle.model';
import { MercadoPagoService } from 'src/app/core/services/MercadoPago.service';

@Component({
  selector: 'app-carrito',
  templateUrl: './carrito.component.html',
  styleUrls: ['./carrito.component.css']
})
export class CarritoComponent implements OnInit {
  carrito: ItemCarrito[] = [];
  fechaHora: Date = new Date();
  cliente: string = '';
  subtotal: number = 0;
  igv: number = 0;
  total: number = 0;

  constructor(
    private carritoService: CarritoService,
    private tokenService: TokenService,
    private dialog: MatDialog,
    private pedidoService: PedidoService,
    private mercadoPagoService: MercadoPagoService
  ) {}

  ngOnInit() {
    this.cargarCarrito();
    this.setCliente();
  }

  setCliente() {
    if (this.tokenService.isLogged()) {
      this.cliente = this.tokenService.getUserName() || 'Cliente no asignado';
    } else {
      this.cliente = 'Cliente no asignado';
    }
  }

  iniciarProcesoDePago() {
    // 1. Validar si el usuario está logueado
    if (!this.tokenService.isLogged()) {
      swall.fire({
        icon: 'warning',
        title: 'Debes iniciar sesión para completar el pago',
        text: 'Por favor, inicia sesión para continuar con tu compra.',
        confirmButtonText: 'Iniciar sesión',
        allowOutsideClick: false,
        allowEscapeKey: false,
        showCancelButton: false
      }).then(() => {
        const dialogRef = this.dialog.open(AuthModalComponent, {
          width: '500px'
        });
        dialogRef.componentInstance.close.subscribe(() => {
          dialogRef.close();
          this.setCliente();
        });
      });
      return;
    }

    // 2. Si está logueado, preparamos el pedido PERO NO LO GUARDAMOS AÚN
    const clienteId = this.tokenService.getIdUser() || 0;
    const pedido: Pedido = {
      cliente: { id: clienteId },
      fechaPedido: new Date().toISOString(),
      fechaActualizacion: new Date().toISOString(),
      subtotal: this.subtotal,
      igv: this.igv,
      total: this.total,
      estado: 'PENDIENTE', // El estado final se actualizará después del pago
      observaciones: 'Pedido pendiente de pago en Mercado Pago.'
    };

    const detalles: PedidoDetalle[] = this.carrito.map(item => ({
      producto: { id: item.producto.id },
      cantidad: item.cantidad,
      precioUnitario: item.precioUnitario,
      subtotal: item.subtotal
    }));

    const pedidoRequest: PedidoRequest = { pedido, detalles };

    // 3. Guardamos el pedido pendiente en sessionStorage para recuperarlo después del pago
    console.log('Guardando pedido pendiente en sessionStorage:', pedidoRequest);
    sessionStorage.setItem('pedidoPendiente', JSON.stringify(pedidoRequest));

    // 4. Creamos la preferencia de pago en Mercado Pago
    console.log('Creando preferencia de pago en Mercado Pago...');
    this.mercadoPagoService.crearPreferencia({
      items: [
        {
          title: 'Compra en Ferretería ' + new Date().getTime(),
          unit_price: this.total,
          quantity: 1
        }
      ]
    }).subscribe({
      next: (resp: any) => {
        // 5. Redirigimos al usuario a la página de pago
        console.log('Preferencia creada. Redirigiendo a:', resp.init_point);
        window.location.href = resp.init_point;
      },
      error: (err) => {
        console.error('Error al crear la preferencia de pago:', err);
        swall.fire({
          icon: 'error',
          title: 'Error de comunicación',
          text: 'No se pudo contactar a Mercado Pago. Intente nuevamente.',
          confirmButtonText: 'Aceptar'
        });
        // Limpiamos el pedido pendiente si falla la comunicación
        console.log('Limpiando pedido pendiente de sessionStorage debido a un error.');
        sessionStorage.removeItem('pedidoPendiente');
      }
    });
  }

  cargarCarrito() {
    this.carrito = this.carritoService.getCarrito();
    this.calcularTotales();
  }

  aumentar(item: ItemCarrito) {
    if (item.cantidad >= item.producto.stockTotal) {
      swall.fire({
        icon: 'warning',
        title: 'Stock insuficiente',
        text: `No puedes agregar más de ${item.producto.stockTotal} unidades de "${item.producto.nombre}" al carrito.`,
        timer: 2500,
        showConfirmButton: false,
        position: 'top-end',
        toast: true
      });
      return;
    }
    this.carritoService.agregarProducto(item.producto);
    this.cargarCarrito();
  }

  disminuir(item: ItemCarrito) {
    if (item.cantidad > 1) {
      this.carritoService.actualizarCantidad(item.producto.id, item.cantidad - 1);
      this.cargarCarrito();
    }
  }

  eliminar(item: ItemCarrito) {
    this.carritoService.eliminarProducto(item.producto.id);
    this.cargarCarrito();
  }

  calcularTotales() {
    this.subtotal = this.carrito.reduce((sum, item) => sum + item.subtotal, 0);
    this.igv = this.subtotal * 0.18;
    this.total = this.subtotal + this.igv;
  }

  limpiarCarrito() {
    this.carritoService.limpiarCarrito();
    this.carrito = [];
    this.subtotal = 0;
    this.igv = 0;
    this.total = 0;
    this.fechaHora = new Date();
  }

  PagarCompra(){
    this.iniciarProcesoDePago();
  }
}
