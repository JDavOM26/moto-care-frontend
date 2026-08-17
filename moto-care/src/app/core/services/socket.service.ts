import { Injectable } from '@angular/core';
import { Client, Message } from '@stomp/stompjs';
import { Subject } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class SocketService {
  private client: Client;
  public greetings$ = new Subject<string>();

  constructor() {
    this.client = new Client({
      brokerURL: 'ws://localhost:8080/gs-guide-websocket',
      reconnectDelay: 5000,
      heartbeatIncoming: 4000,
      heartbeatOutgoing: 4000,
    });

    this.client.onConnect = (frame) => {
      console.log('Conectado: ' + frame);

      this.client.subscribe('/topic/greetings', (message: Message) => {
        if (message.body) {
          this.greetings$.next(message.body);
        }
      });
    };

    this.client.onStompError = (frame) => {
      console.error('Error de STOMP: ' + frame.headers['message']);
      console.error('Detalles: ' + frame.body);
    };
  }

  public connect(): void {
    this.client.activate();
  }

  public disconnect(): void {
    this.client.deactivate();
  }

  public sendGreeting(message: string): void {
    this.client.publish({
      destination: '/app/hello',
      body: message
    });
  }
}