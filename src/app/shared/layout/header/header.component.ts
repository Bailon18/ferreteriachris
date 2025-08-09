import { Component, OnInit, OnDestroy } from '@angular/core';
import swall from 'sweetalert2';
import { TokenService } from 'src/app/core/services/token.service';
import { Subscription } from 'rxjs';
import { CarritoService } from 'src/app/core/services/carrito.service';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent implements OnInit, OnDestroy {
  carritoCantidad: number = 0;
  mostrarLoginModal: boolean = false;
  isLoggedIn: boolean = false;
  isAdmin: boolean = false;
  userName: string = '';
  userRole: string = '';
  private authSubscription!: Subscription;
  private carritoSub!: Subscription;

  constructor(private tokenService: TokenService, private carritoService: CarritoService) {}

  ngOnInit() {
    this.checkLoginStatus();
    this.authSubscription = this.tokenService.authStatus$.subscribe(() => {
      this.checkLoginStatus();
    });
    this.carritoCantidad = this.carritoService.getCantidadTotal();
    this.carritoSub = this.carritoService.cantidad$.subscribe(cant => {
      this.carritoCantidad = cant;
    });
  }

  ngOnDestroy() {
    if (this.authSubscription) {
      this.authSubscription.unsubscribe();
    }
    if (this.carritoSub) {
      this.carritoSub.unsubscribe();
    }
  }

  checkLoginStatus() {
    this.isLoggedIn = this.tokenService.isLogged();
    if (this.isLoggedIn) {
      const userName = this.tokenService.getUserName();
      this.userName = userName || '';
      const authorities = this.tokenService.getAuthorities();
      this.userRole = authorities.length > 0 ? authorities[0] : '';
      this.isAdmin = this.tokenService.isAdmin2();
    } else {
      this.userName = '';
      this.userRole = '';
      this.isAdmin = false;
    }
  }

  logout() {
    this.tokenService.logOut();
  }

  agregarAlCarrito() {
    this.carritoCantidad++;
  }

  quitarDelCarrito() {
    if (this.carritoCantidad > 0) this.carritoCantidad--;
  }

  abrirLoginModal() {
    this.mostrarLoginModal = true;
  }

  cerrarLoginModal() {
    this.mostrarLoginModal = false;
  }

  mostrarAlertaPersonalizada(
    mensaje: string,
    titulo: string = '¡Éxito!',
    icono: 'success' | 'error' | 'info' | 'warning' = 'success'
  ) {
    swall.fire({
      icon: icono,
      title: titulo,
      text: mensaje,
      confirmButtonColor: '#1976d2'
    });
  }
}
