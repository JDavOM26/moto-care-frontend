import { Routes } from '@angular/router';
import { LoginPage } from './component/login.page/login.page';

export const routes: Routes = [
    { path: 'login', component: LoginPage },
    { path: '', redirectTo: '/login', pathMatch: 'full' },
    { path: '**', redirectTo: '/login' }
];
