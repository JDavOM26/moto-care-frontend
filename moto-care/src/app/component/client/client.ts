import { Component, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { Client } from '@models';
import { ClientService } from 'src/app/core/services/people/client.service';
import { CustomTableComponent } from '../../shared/custom-table/custom-table';
import { TableColumnDefDirective } from '../../shared/custom-table/directives/table-column.directive';
import { TableColumn } from '../../shared/custom-table/models/table.models';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-client',
  standalone: true,
  imports: [CustomTableComponent, TableColumnDefDirective, MatButtonModule, MatIconModule],
  templateUrl: './client.html',
  styleUrl: './client.scss'
})
export class ClientComponent {

  public tableColumns: TableColumn[] = [
    { key: 'firstName', label: 'Nombre', width: '20%' },
    { key: 'lastName', label: 'Apellido', width: '20%' },
    { key: 'documentNumber', label: 'Documento', width: '20%' },
    { key: 'phoneNumber', label: 'Teléfono', width: '15%' },
    { key: 'email', label: 'Email', width: '25%' },
    { key: 'actions', label: 'Acciones', width: '10%' }
  ];

  private readonly _clientService = inject(ClientService);
  private readonly _router = inject(Router);

  public clients = signal<Client[]>([]);
  public totalElements = signal<number>(0);
  public totalPages = signal<number>(0);
  public currentPage = signal<number>(0);
  public pageSize = signal<number>(0);

  ngOnInit(): void {
    this.getClients();
  }

  private getClients(): void {
    this._clientService.getClients().subscribe({
      next: (response) => {
        this.clients.set(response.recordset.content);
        this.totalElements.set(response.recordset.totalElements);
        this.totalPages.set(response.recordset.totalPages);
        this.currentPage.set(response.recordset.number);
        this.pageSize.set(response.recordset.size);
      },
      error: (error) => {
        console.error(error);
      }
    });
  }

  public goToDetail(clientId: number): void {
    this._router.navigate(['/clients', clientId, 'detail']);
  }

}
