import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MainLayoutComponent } from './layout/main-layout/main-layout.component';
import { HeaderComponent } from './layout/header/header.component';
import { SidebarComponent } from './layout/sidebar/sidebar.component';
import { FooterComponent } from './layout/footer/footer.component';
import { ChatWidgetComponent } from './chat-widget/chat-widget.component';
import { FormsModule } from '@angular/forms';
import { AuthModule } from '../auth/auth.module';
@NgModule({
  declarations: [
    MainLayoutComponent,
    HeaderComponent,
    SidebarComponent,
    FooterComponent,
    ChatWidgetComponent
  ],
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    AuthModule
  
  ],
  exports: [
    MainLayoutComponent,
    HeaderComponent,
    SidebarComponent,
    FooterComponent,
    ChatWidgetComponent,
    
  ]
})
export class SharedModule { }
