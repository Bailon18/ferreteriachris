import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { HttpClientModule } from '@angular/common/http';
import { ReactiveFormsModule } from '@angular/forms';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { AuthModule } from './auth/auth.module';
import { SharedModule } from './shared/shared.module';
import { CoreModule } from './core/core.module';
import { MainLayoutComponent } from './shared/layout/main-layout/main-layout.component';
import { FormsModule } from '@angular/forms';
import { ClienteListComponent } from './clientes/cliente-list/cliente-list.component';
import { ClienteDetalleModalComponent } from './clientes/cliente-detalle-modal/cliente-detalle-modal.component';
import { PedidoListComponent } from './pedidos/gestion/pedido-list/pedido-list.component';
import { PedidoDetailModalComponent } from './pedidos/cliente/pedido-detail-modal/pedido-detail-modal.component';
import { EstadisticaComponent } from './estadistica/estadistica.component';
@NgModule({
  declarations: [
    AppComponent,
    ClienteListComponent,
    ClienteDetalleModalComponent,
    PedidoDetailModalComponent,
    EstadisticaComponent
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    HttpClientModule,
    AppRoutingModule,
    AuthModule,
    SharedModule,
    CoreModule,
    FormsModule,
    ReactiveFormsModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
