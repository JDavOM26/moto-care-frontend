import { Component, inject, signal, OnInit } from '@angular/core';
import { WorkOrderService } from 'src/app/core/services/workshop/word-order.service';

import { TableColumn } from 'src/app/shared/custom-table/models/table.models';
import { TableColumnDefDirective } from 'src/app/shared/custom-table/directives/table-column.directive';
import { CustomTableComponent } from 'src/app/shared/custom-table/custom-table';
import { WorkOrderProjection } from 'src/app/core/models/reception.models';
import { DatePipe, CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-work-orders',
  standalone: true,
  imports: [CustomTableComponent, TableColumnDefDirective, MatIconModule, MatButtonModule, CommonModule, RouterLink],
  templateUrl: './work-orders.html',
  styleUrl: './work-orders.scss'
})
export class WorkOrdersComponent implements OnInit {
  private readonly _workOrderService = inject(WorkOrderService);

  public orders = signal<WorkOrderProjection[]>([]);
  public totalElements = signal<number>(0);
  public currentPage = signal<number>(0);
  public pageSize = signal<number>(10);

  public tableColumns: TableColumn[] = [
    { key: 'id', label: 'ID', width: '5%' },
    { key: 'plate', label: 'Placa', width: '10%' },
    { key: 'customerName', label: 'Cliente', width: '20%' },
    { key: 'motorcycleModel', label: 'Moto', width: '15%' },
    { key: 'statusName', label: 'Estado', width: '15%' },
    { key: 'promisedDate', label: 'F. Promesa', width: '10%' },
    { key: 'technicianName', label: 'Técnico', width: '15%' },
    { key: 'actions', label: 'Acciones', width: '10%' }
  ];

  ngOnInit() {
    this.loadOrders(this.currentPage(), this.pageSize());
  }

  public loadOrders(page: number, size: number) {
    this._workOrderService.getAllOrders({ page, size }).subscribe({
      next: (res) => {
        if (res && res.code === 200) {
          this.orders.set(res.recordset.content);
          this.totalElements.set(res.recordset.totalElements);
        }
      },
      error: (err) => console.error('Error loading work orders', err)
    });
  }

  public onChangeStatus() {

  }
}
