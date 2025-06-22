import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ClienteListComponent } from './cliente-list/cliente-list.component';
import { ClienteDetalleModalComponent } from './cliente-detalle-modal/cliente-detalle-modal.component';


@NgModule({
  declarations: [
    ClienteListComponent,
    ClienteDetalleModalComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule
  ],
  exports: [
    ClienteListComponent
  ]
})
export class ClientesModule { } 