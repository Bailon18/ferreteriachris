import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProductoListClienteComponent } from './cliente/producto-list-cliente/producto-list-cliente.component';
import { ProductoCardComponent } from './cliente/producto-card/producto-card.component';
import { ProductoDetailModalComponent } from './cliente/producto-detail-modal/producto-detail-modal.component';
import { ProductoListAdminComponent } from './admin/producto-list-admin/producto-list-admin.component';
import { ProductoFormModalComponent } from './admin/producto-form-modal/producto-form-modal.component';
import { ProductosRoutingModule } from './productos-routing.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatDialogModule } from '@angular/material/dialog';
@NgModule({
  declarations: [
    ProductoListClienteComponent,
    ProductoCardComponent,
    ProductoDetailModalComponent,
    ProductoListAdminComponent,
    ProductoFormModalComponent
  ],
  imports: [
    CommonModule,
    ProductosRoutingModule,
    FormsModule,
    MatDialogModule,
    ReactiveFormsModule
  ]
})
export class ProductosModule { }
