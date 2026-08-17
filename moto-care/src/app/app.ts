import { Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { LoaderComponent } from './shared/loading-screen/loader';
import { LoaderService } from './core/services/common/loader.service';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, LoaderComponent],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {
  loaderService = inject(LoaderService);
}
