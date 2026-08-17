import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Sidenav } from '../shared/sidenav/sidenav/sidenav';
import { Navbar } from '../shared/navbar/navbar';

@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [RouterOutlet, Sidenav, Navbar],
  templateUrl: './main-layout.html',
  styleUrl: './main-layout.scss',
})
export class MainLayout {
  public isCollapsed = signal(false);

  public toggleSidenav(): void {
    this.isCollapsed.update(state => !state);
  }
}
