import { Component, OnInit, OnDestroy } from '@angular/core';
import { TokenService } from 'src/app/core/services/token.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-admin-header',
  templateUrl: './admin-header.component.html',
  styleUrls: ['./admin-header.component.css']
})
export class AdminHeaderComponent implements OnInit, OnDestroy {
  userName: string = '';
  userRole: string = '';
  private authSubscription!: Subscription;

  constructor(private tokenService: TokenService) {}

  ngOnInit() {
    this.checkLoginStatus();
    this.authSubscription = this.tokenService.authStatus$.subscribe(() => {
      this.checkLoginStatus();
    });
  }

  ngOnDestroy() {
    if (this.authSubscription) {
      this.authSubscription.unsubscribe();
    }
  }

  checkLoginStatus() {
    const userName = this.tokenService.getUserName();
    this.userName = userName || '';
    const authorities = this.tokenService.getAuthorities();
    this.userRole = authorities.length > 0 ? authorities[0] : '';
  }

  logout() {
    this.tokenService.logOut();
  }
}
