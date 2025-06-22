import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { TokenService } from 'src/app/core/services/token.service';

@Injectable({
  providedIn: 'root'
})
export class AdminRedirectGuard implements CanActivate {
  constructor(private tokenService: TokenService, private router: Router) {}

  canActivate(): boolean {
    const roles = this.tokenService.getAuthorities();
    if (roles.includes('ADMINISTRADOR')) {
      this.router.navigate(['/administracion/usuarios']);
    } else if (roles.includes('VENDEDOR')) {
      this.router.navigate(['/administracion/pedidos']);
    } else {
      // Redirige a login o a una página de acceso denegado si no tiene rol válido
      this.router.navigate(['/productos']);
    }
    return false; // Evita que cargue el componente vacío
  }
}
