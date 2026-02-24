import {
  Component, ChangeDetectionStrategy,
  ChangeDetectorRef, inject,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { AuthService } from '../auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule, ReactiveFormsModule,
    MatCardModule, MatFormFieldModule,
    MatInputModule, MatButtonModule, MatIconModule,
  ],
  template: `
    <div class="login-wrapper">
      <mat-card class="login-card">
        <mat-card-header>
          <div class="login-logo">
            <mat-icon>card_giftcard</mat-icon>
            <h1>Gift Tracker</h1>
          </div>
        </mat-card-header>
        <mat-card-content>
          <form [formGroup]="form" (ngSubmit)="login()">
            <mat-form-field appearance="outline" class="w-full">
              <mat-label>Username</mat-label>
              <mat-icon matPrefix>person</mat-icon>
              <input matInput formControlName="username" autocomplete="username" />
            </mat-form-field>
            <mat-form-field appearance="outline" class="w-full">
              <mat-label>Password</mat-label>
              <mat-icon matPrefix>lock</mat-icon>
              <input matInput [type]="hide ? 'password' : 'text'"
                formControlName="password" autocomplete="current-password" />
              <button mat-icon-button matSuffix type="button" (click)="hide = !hide">
                <mat-icon>{{ hide ? 'visibility_off' : 'visibility' }}</mat-icon>
              </button>
            </mat-form-field>
            @if (error) {
              <p class="error-msg">{{ error }}</p>
            }
            <button mat-raised-button color="primary" type="submit"
              class="w-full login-btn" [disabled]="form.invalid">
              Sign In
            </button>
          </form>
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styles: [`
    .login-wrapper {
      min-height: 100vh; display: flex; align-items: center;
      justify-content: center;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    }
    .login-card { width: 400px; padding: 16px; border-radius: 12px; }
    .login-logo {
      display: flex; flex-direction: column;
      align-items: center; padding: 16px 0; width: 100%;
    }
    .login-logo mat-icon { font-size: 48px; height: 48px; width: 48px; color: #3f51b5; }
    .login-logo h1 { margin: 8px 0 0; color: #333; }
    .w-full { width: 100%; display: block; }
    .login-btn { height: 48px; font-size: 16px; margin-top: 8px; }
    .error-msg { color: #f44336; font-size: 14px; text-align: center; }
  `],
})
export class LoginComponent {
  private fb = inject(FormBuilder);
  private auth = inject(AuthService);
  private router = inject(Router);
  private cdr = inject(ChangeDetectorRef);

  form: FormGroup = this.fb.group({
    username: ['', Validators.required],
    password: ['', Validators.required],
  });

  error = '';
  hide = true;

  login() {
    if (this.form.invalid) return;
    this.error = '';
    const { username, password } = this.form.value;
    this.auth.login(username!, password!).subscribe({
      next: () => this.router.navigate(['/']),
      error: () => {
        this.error = 'Invalid username or password';
        this.cdr.markForCheck();
      },
    });
  }
}
