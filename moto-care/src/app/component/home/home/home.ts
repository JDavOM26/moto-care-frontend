import { Component, OnInit, OnDestroy } from '@angular/core';
import { SocketService } from '../../../core/services/socket.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-home',
  imports: [],
  templateUrl: './home.html',
  styleUrl: './home.scss',
})
export class Home implements OnInit, OnDestroy {
  respuestaBackend = '';
  private subscription!: Subscription;

  constructor(private socketService: SocketService) {}

  ngOnInit() {
    this.socketService.connect();

    this.subscription = this.socketService.greetings$.subscribe((mensaje: string) => {
      this.respuestaBackend = mensaje;
      console.log('Mensaje recibido:', mensaje);
    });
  }

  enviarSaludo() {
    this.socketService.sendGreeting('Mundo desde el componente Home de Angular!');
  }

  ngOnDestroy() {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
    this.socketService.disconnect();
  }
}
