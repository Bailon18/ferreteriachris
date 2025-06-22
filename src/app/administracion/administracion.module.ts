import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { AdministracionRoutingModule } from './administracion-routing.module';
import { AdministracionComponent } from './administracion.component';
import { AdminHeaderComponent } from './layout/admin-header/admin-header.component';
import { AdminSidebarComponent } from './layout/admin-sidebar/admin-sidebar.component';
import { AdminFooterComponent } from './layout/admin-footer/admin-footer.component';

@NgModule({
  declarations: [
    AdministracionComponent,
    AdminHeaderComponent,
    AdminSidebarComponent,
    AdminFooterComponent

  ],
  imports: [
    CommonModule,
    AdministracionRoutingModule
  ]
})
export class AdministracionModule { }
