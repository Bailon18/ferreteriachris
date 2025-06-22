import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { CarritoComponent } from './cliente/carrito/carrito.component';
import { PedidoListClienteComponent } from './cliente/pedido-list-cliente/pedido-list-cliente.component';


const routes: Routes = [
  {
    path: 'carrito',
    component: CarritoComponent
  },
  {
    path: 'pedidos',
    component: PedidoListClienteComponent
  },
  { path: '', redirectTo: 'pedidos', pathMatch: 'full' }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class PedidosRoutingModule { } 