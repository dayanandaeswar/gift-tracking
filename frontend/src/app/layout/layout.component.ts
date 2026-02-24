import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatListModule } from '@angular/material/list';
import { inject } from '@angular/core';
import { AuthService } from '../auth/auth.service';

@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [
    RouterModule, MatToolbarModule, MatButtonModule,
    MatIconModule, MatSidenavModule, MatListModule,
  ],
  template: `
    <mat-sidenav-container class="container">
      <mat-sidenav mode="side" opened class="sidenav">
        <div class="sidenav-header">
          <mat-icon>card_giftcard</mat-icon>
          <span>Gift Tracker</span>
        </div>
        <mat-nav-list>
          <a mat-list-item routerLink="/functions" routerLinkActive="active-link">
            <mat-icon matListItemIcon>event</mat-icon>
            <span matListItemTitle>Functions</span>
          </a>
          <a mat-list-item routerLink="/persons" routerLinkActive="active-link">
            <mat-icon matListItemIcon>people</mat-icon>
            <span matListItemTitle>Persons</span>
          </a>
        </mat-nav-list>
        <div class="sidenav-footer">
          <button mat-button class="logout-btn" (click)="logout()">
            <mat-icon>logout</mat-icon> Logout
          </button>
        </div>
      </mat-sidenav>
      <mat-sidenav-content>
        <router-outlet />
      </mat-sidenav-content>
    </mat-sidenav-container>
  `,
  styles: [`
    .container { height: 100vh; }
    .sidenav {
      width: 220px; background: #3f51b5; color: white;
      display: flex; flex-direction: column;
    }
    .sidenav-header {
      padding: 20px 16px; display: flex; align-items: center;
      gap: 10px; font-size: 18px; font-weight: bold;
      border-bottom: 1px solid rgba(255,255,255,0.2);
    }
    .sidenav-footer { margin-top: auto; padding: 16px; }
    .logout-btn { color: white; width: 100%; }
    .active-link { background: rgba(255,255,255,0.15) !important; }
    mat-list-item { color: white !important; }
  `],
})
export class LayoutComponent {
  private auth = inject(AuthService);
  logout() { this.auth.logout(); }
}
