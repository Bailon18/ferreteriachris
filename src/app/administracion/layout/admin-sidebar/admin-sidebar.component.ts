import { Component } from '@angular/core';
import { TokenService } from 'src/app/core/services/token.service';

@Component({
  selector: 'app-admin-sidebar',
  templateUrl: './admin-sidebar.component.html',
  styleUrls: ['./admin-sidebar.component.css']
})
export class AdminSidebarComponent {
  collapsed = false;

  constructor(public tokenService: TokenService) {}

  toggleSidebar() {
    this.collapsed = !this.collapsed;
  }
}
