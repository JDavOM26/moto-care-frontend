import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule, DatePipe, CurrencyPipe } from '@angular/common';
import { RouterModule } from '@angular/router';


import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';



import { InvoiceService } from 'src/app/core/services/billing/invoice.service';
import { ConfirmDialogService } from 'src/app/core/services/confirm-dialog.service';
import { Invoice, PageableRequest } from '@models';
import { CustomTableComponent } from 'src/app/shared/custom-table/custom-table';
import { TableColumn } from 'src/app/shared/custom-table/models/table.models';

@Component({
  selector: 'app-invoices-history',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatButtonModule,
    MatIconModule,
    MatPaginatorModule,
    CustomTableComponent,
    DatePipe,
    CurrencyPipe
  ],
  templateUrl: './invoices-history.html'
})
export class InvoicesHistoryComponent implements OnInit {

  private readonly invoiceService = inject(InvoiceService);
  private readonly dialogService = inject(ConfirmDialogService);

  public invoices = signal<Invoice[]>([]);
  public totalElements = signal<number>(0);
  public pageSize = signal<number>(10);
  public currentPage = signal<number>(0);

  public tableColumns: TableColumn[] = [
    { key: 'invoiceNumber', label: 'N° Factura', width: '15%' },
    { key: 'emissionDate', label: 'Fecha Emisión', width: '15%' },
    { key: 'subtotal', label: 'Subtotal', width: '15%' },
    { key: 'iva', label: 'IVA', width: '15%' },
    { key: 'total', label: 'Total', width: '15%' },
    { key: 'idInvoiceStatus', label: 'Estado', width: '15%' },
    { key: 'actions', label: 'Acciones', width: '10%' }
  ];

  ngOnInit(): void {
    this.loadInvoices();
  }

  public loadInvoices(page: number = 0, size: number = 10) {
    const pageable: PageableRequest = {
      page,
      size,
      sort: ['emissionDate,desc']
    };

    this.invoiceService.getInvoices(pageable).subscribe({
      next: (res) => {
        if (res.code === 200 && res.recordset) {
          this.invoices.set(res.recordset.content);
          this.totalElements.set(res.recordset.totalElements);
          this.pageSize.set(size);
          this.currentPage.set(page);
        } else {
          this.invoices.set([]);
          this.totalElements.set(0);
        }
      },
      error: (err) => {
        console.error(err);
        this.dialogService.toastError('Error al cargar el historial de facturas');
        this.invoices.set([]);
        this.totalElements.set(0);
      }
    });
  }

  public onPageChange(event: PageEvent) {
    this.loadInvoices(event.pageIndex, event.pageSize);
  }

  public viewInvoiceDetails(invoice: Invoice) {
    this.dialogService.infoDialog('Próximamente', 'Detalles de factura en construcción.');
  }
}
