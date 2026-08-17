import { Component, input, output } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatMenuModule } from '@angular/material/menu';
import { SecurityService } from '../../core/services/auth/security.service';
import { MatDivider } from '@angular/material/divider';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [MatIconModule, MatButtonModule, MatTooltipModule, MatMenuModule, RouterModule, MatDivider],
  templateUrl: './navbar.html',
  styleUrl: './navbar.scss',
})
export class Navbar {
  public sidenavCollapsed = input.required<boolean>();
  public toggleSidenav = output<void>();

  constructor(
    public readonly securityService: SecurityService,
    private readonly router: Router
  ) { }

  onToggle(): void {
    this.toggleSidenav.emit();
  }

  logout(): void {
    this.securityService.logout();
    this.router.navigate(['/login']);
  }

  public notifications = [
    { title: 'Nueva Orden', message: 'Se ha creado la orden OT-1234', time: 'Hace 5 min', unread: true },
    { title: 'Inventario Bajo', message: 'El filtro de aceite está por agotarse', time: 'Hace 1 hora', unread: false },
    { title: 'Actualización', message: 'El cliente aprobó la cotización', time: 'Hace 2 horas', unread: false }
  ];
}
