import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ProductoListClienteComponent } from './cliente/producto-list-cliente/producto-list-cliente.component';

const routes: Routes = [
  {
    path: '',
    component: ProductoListClienteComponent
  }
  // Aquí puedes agregar más rutas (admin, detalle, etc.) en el futuro
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ProductosRoutingModule { } 