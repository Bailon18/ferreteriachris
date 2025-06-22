import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CarritoComponent } from './cliente/carrito/carrito.component';
import { PedidoListClienteComponent } from './cliente/pedido-list-cliente/pedido-list-cliente.component';
import { PedidoListComponent } from './gestion/pedido-list/pedido-list.component';
import { PedidosRoutingModule } from './pedidos-routing.module';
import { PedidoDetailModalComponent } from './gestion/pedido-detail-modal/pedido-detail-modal.component';
import { FormsModule } from '@angular/forms';


@NgModule({
  declarations: [
    CarritoComponent,
    PedidoListClienteComponent,
    PedidoDetailModalComponent,
    PedidoListComponent
  ],
  imports: [
    CommonModule,
    PedidosRoutingModule,
    FormsModule
  ],
  exports: [
    PedidoListComponent
  ]
})
export class PedidosModule { }
