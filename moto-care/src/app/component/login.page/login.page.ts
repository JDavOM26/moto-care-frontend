import { Component } from '@angular/core';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-login.page',
  imports: [MatInputModule, MatFormFieldModule, MatButtonModule, MatCheckboxModule, MatIconModule],
  templateUrl: './login.page.html',
  styleUrl: './login.page.scss',
})
export class LoginPage { }
