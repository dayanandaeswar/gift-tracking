import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { BehaviorSubject, tap } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class AuthService {
    private TOKEN_KEY = 'gt_token';
    isLoggedIn$ = new BehaviorSubject<boolean>(this.hasToken());

    constructor(private http: HttpClient, private router: Router) { }

    login(username: string, password: string) {
        return this.http
            .post<{ access_token: string; user: any }>(
                `${environment.apiUrl}/auth/login`,
                { username, password },
            )
            .pipe(
                tap((res) => {
                    localStorage.setItem(this.TOKEN_KEY, res.access_token);
                    this.isLoggedIn$.next(true);
                }),
            );
    }

    logout() {
        localStorage.removeItem(this.TOKEN_KEY);
        this.isLoggedIn$.next(false);
        this.router.navigate(['/login']);
    }

    getToken() { return localStorage.getItem(this.TOKEN_KEY); }
    hasToken() { return !!localStorage.getItem(this.TOKEN_KEY); }
}
