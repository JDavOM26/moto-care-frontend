import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';
import { CustomTableComponent } from 'src/app/shared/custom-table/custom-table';
import { TableColumnDefDirective } from 'src/app/shared/custom-table/directives/table-column.directive';
import { TableColumn } from 'src/app/shared/custom-table/models/table.models';
import { ProviderService } from 'src/app/core/services/inventory/provider.service';
import { ProviderDto } from '@models';
import { ConfirmDialogService } from 'src/app/core/services/confirm-dialog.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-providers-mgmt',
  standalone: true,
  imports: [CommonModule, CustomTableComponent, TableColumnDefDirective, MatIconModule, MatButtonModule, MatTooltipModule],
  templateUrl: './providers-mgmt.html'
})
export class ProvidersMgmt implements OnInit {
  private readonly providerService = inject(ProviderService);
  private readonly confirmDialogService = inject(ConfirmDialogService);
  private readonly router = inject(Router);

  public providers = signal<ProviderDto[]>([]);
  public totalElements = signal<number>(0);
  public currentPage = signal<number>(0);
  public pageSize = signal<number>(10);
  public searchKeyword = signal<string>('');

  public tableColumns: TableColumn[] = [
    { key: 'id', label: 'ID', width: '5%' },
    { key: 'name', label: 'Nombre', width: '25%' },
    { key: 'contactName', label: 'Contacto', width: '25%' },
    { key: 'phone', label: 'Teléfono', width: '15%' },
    { key: 'email', label: 'Correo', width: '20%' },
    { key: 'actions', label: 'Acciones', width: '10%' }
  ];

  ngOnInit() {
    this.loadProviders(this.currentPage(), this.pageSize());
  }

  public loadProviders(page: number, size: number, search?: string) {
    this.providerService.getProvidersList({ page, size, search }).subscribe({
      next: (res) => {
        if (res && res.code === 200) {
          this.providers.set(res.recordset.content);
          this.totalElements.set(res.recordset.totalElements);
        }
      },
      error: (err) => console.error('Error loading providers', err)
    });
  }

  public onSearch(keyword: string) {
    this.searchKeyword.set(keyword);
    this.currentPage.set(0);
    this.loadProviders(0, this.pageSize(), keyword);
  }
  
  public onPageChange(page: number) {
    this.currentPage.set(page);
    this.loadProviders(page, this.pageSize(), this.searchKeyword());
  }

  public openAddProviderDialog() {
    this.router.navigate(['/ventas/inventario/providers/add']);
  }

  public editProvider(provider: ProviderDto) {
    this.router.navigate([`/ventas/inventario/providers/${provider.id}/edit`]);
  }

}
