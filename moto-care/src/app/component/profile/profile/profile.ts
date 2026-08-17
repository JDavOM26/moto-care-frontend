import { Component, inject } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatDividerModule } from '@angular/material/divider';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { SecurityService } from '../../../core/services/auth/security.service';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [
    MatCardModule,
    MatIconModule,
    MatButtonModule,
    MatDividerModule,
    MatFormFieldModule,
    MatInputModule
  ],
  templateUrl: './profile.html',
  styleUrl: './profile.scss'
})
export class Profile {
  public readonly securityService = inject(SecurityService);

  public user = this.securityService.currentUser;
}

