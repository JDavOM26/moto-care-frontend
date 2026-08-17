import { ChangeDetectionStrategy, Component, input, inject } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { CommonModule } from '@angular/common';
import { SecurityService } from '../../../core/services/auth/security.service';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'sidebar',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive, MatIconModule],
  templateUrl: './sidenav.html',
  styleUrl: './sidenav.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'relative h-full flex flex-col gap-6',
  },
})
export class Sidenav {
  public collapsed = input.required<boolean>();

  private readonly securityService = inject(SecurityService);
  public menus = this.securityService.menus;
}