import { Routes } from '@angular/router';
import { authGuard } from './auth/auth.guard';

export const routes: Routes = [
    {
        path: 'login',
        loadComponent: () =>
            import('./auth/login/login.component').then(m => m.LoginComponent),
    },
    {
        path: '',
        canActivate: [authGuard],
        loadComponent: () =>
            import('./layout/layout.component').then(m => m.LayoutComponent),
        children: [
            { path: '', redirectTo: 'functions', pathMatch: 'full' },
            {
                path: 'functions',
                loadComponent: () =>
                    import('./functions/function-list/function-list.component')
                        .then(m => m.FunctionListComponent),
            },
            {
                path: 'functions/:id',
                loadComponent: () =>
                    import('./functions/function-detail/function-detail.component')
                        .then(m => m.FunctionDetailComponent),
            },
            {
                path: 'persons',
                loadComponent: () =>
                    import('./persons/person-list/person-list.component')
                        .then(m => m.PersonListComponent),
            },
            {
                path: 'persons/:id',
                loadComponent: () =>
                    import('./persons/person-detail/person-detail.component')
                        .then(m => m.PersonDetailComponent),
            },
        ],
    },
    { path: '**', redirectTo: '' },
];
