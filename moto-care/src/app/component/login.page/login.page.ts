import { Component, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatIconModule } from '@angular/material/icon';
import { SecurityService } from '../../core/services/auth/security.service';


@Component({
  selector: 'app-login.page',
  imports: [
    FormsModule,
    MatInputModule,
    MatFormFieldModule,
    MatButtonModule,
    MatCheckboxModule,
    MatIconModule
  ],
  templateUrl: './login.page.html',
  styleUrl: './login.page.scss',
})
export class LoginPage {
  username = signal('');
  password = signal('');
  error = signal('');

  constructor(
    private readonly securityService: SecurityService,
    private readonly router: Router
  ) { }

  onLogin(): void {
    this.error.set('');

    if (!this.username() || !this.password()) {
      this.error.set('Por favor, ingresa tu usuario y contraseña.');
      return;
    }

    this.securityService.authenticate({
      username: this.username(),
      password: this.password()
    }).subscribe({
      next: () => {
        const role = this.securityService.userRole();
        if (role === 'ROLE_ADMINISTRADOR') {
          this.router.navigate(['/dashboards']);
        } else if (role === 'ROLE_MECANICO' || role === 'ROLE_TECNICO') {
          this.router.navigate(['/work-orders']);
        } else {
          this.router.navigate(['/profile']);
        }
      },
      error: (err: any) => {
        console.error('Login error:', err);
        this.error.set('Credenciales incorrectas o error en el servidor.');
      }
    });
  }
}
