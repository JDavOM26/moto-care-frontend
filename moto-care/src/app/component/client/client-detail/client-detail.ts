import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { Client, PageableRequest, WorkOrderProjection } from '@models';
import { ClientService } from '../../../core/services/people/client.service';
import { WorkOrderService } from '../../../core/services/workshop/word-order.service';

@Component({
  selector: 'app-client-detail',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatIconModule,
    MatDividerModule
  ],
  templateUrl: './client-detail.html',
  styleUrl: './client-detail.scss'
})
export class ClientDetailComponent implements OnInit {

  private readonly _route = inject(ActivatedRoute);
  private readonly _router = inject(Router);
  private readonly _clientService = inject(ClientService);
  private readonly _workOrderService = inject(WorkOrderService);

  public client = signal<Client | null>(null);
  public workOrders = signal<WorkOrderProjection[]>([]);
  public isLoading = signal<boolean>(true);
  
  public totalElements = signal<number>(0);
  public totalPages = signal<number>(0);
  public currentPage = signal<number>(0);

  ngOnInit(): void {
    const idParam = this._route.snapshot.paramMap.get('id');
    if (idParam) {
      const clientId = parseInt(idParam, 10);
      this.loadClientData(clientId);
      this.loadClientOrders(clientId);
    } else {
      this.goBack();
    }
  }

  private loadClientData(clientId: number): void {
    this._clientService.getClientById(clientId).subscribe({
      next: (response) => {
        this.client.set(response.recordset);
      },
      error: (err) => {
        console.error('Error loading client', err);
        this.goBack();
      }
    });
  }

  private loadClientOrders(clientId: number, page: number = 0): void {
    const pageable: PageableRequest = {
      page: page,
      size: 10,
      sort: ['createdDate,desc']
    };

    this._workOrderService.getOrdersByClientId(clientId, pageable).subscribe({
      next: (response) => {
        this.workOrders.set(response.recordset.content);
        this.totalElements.set(response.recordset.totalElements);
        this.totalPages.set(response.recordset.totalPages);
        this.currentPage.set(response.recordset.number);
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error('Error loading work orders', err);
        this.isLoading.set(false);
      }
    });
  }

  public goToOrder(orderId: number): void {
    this._router.navigate(['/work-orders', orderId, 'detail']);
  }

  public goBack(): void {
    this._router.navigate(['/clients']);
  }

  public getStatusClass(statusName: string | undefined): string {
    if (!statusName) return 'bg-slate-100 text-slate-700 border-slate-200';
    
    const status = statusName.toLowerCase();
    if (status.includes('progreso')) return 'bg-blue-100 text-blue-700 border-blue-200';
    if (status.includes('listo') || status.includes('entregado')) return 'bg-green-100 text-green-700 border-green-200';
    if (status.includes('diagnostico')) return 'bg-orange-100 text-orange-700 border-orange-200';
    if (status.includes('recepcionado')) return 'bg-purple-100 text-purple-700 border-purple-200';
    
    return 'bg-slate-100 text-slate-700 border-slate-200';
  }
}
