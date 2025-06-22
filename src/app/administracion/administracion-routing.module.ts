import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AdministracionComponent } from './administracion.component';
import { UsuarioListComponent } from '../usuarios/usuario-list/usuario-list.component';
import { ProductoListAdminComponent } from '../productos/admin/producto-list-admin/producto-list-admin.component';
import { PedidoListComponent } from '../pedidos/gestion/pedido-list/pedido-list.component';
import { ClienteListComponent } from '../clientes/cliente-list/cliente-list.component';
import { EstadisticaComponent } from '../estadistica/estadistica.component';
import { AdminRedirectGuard } from '../shared/admin-redirect.guard';


const routes: Routes = [
  {
    path: '',
    component: AdministracionComponent,
    children: [
      { path: '', canActivate: [AdminRedirectGuard], component: AdministracionComponent },
      { path: 'usuarios', component: UsuarioListComponent },
      { path: 'productos', component: ProductoListAdminComponent },
      { path: 'pedidos', component: PedidoListComponent },
      { path: 'clientes', component: ClienteListComponent },
      { path: 'estadistica', component: EstadisticaComponent },
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AdministracionRoutingModule { }