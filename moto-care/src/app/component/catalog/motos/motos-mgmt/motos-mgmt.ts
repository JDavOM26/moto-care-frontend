import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';
import { CustomTableComponent } from 'src/app/shared/custom-table/custom-table';
import { TableColumnDefDirective } from 'src/app/shared/custom-table/directives/table-column.directive';
import { TableColumn } from 'src/app/shared/custom-table/models/table.models';
import { MotorcycleService } from 'src/app/core/services/vehicle/motorcycle.service';
import { Motorcycle } from '@models';
import { ConfirmDialogService } from 'src/app/core/services/confirm-dialog.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-motos-mgmt',
  standalone: true,
  imports: [CommonModule, CustomTableComponent, TableColumnDefDirective, MatIconModule, MatButtonModule, MatTooltipModule],
  templateUrl: './motos-mgmt.html'
})
export class MotosMgmtComponent implements OnInit {
  private readonly motorcycleService = inject(MotorcycleService);
  private readonly confirmDialogService = inject(ConfirmDialogService);
  private readonly router = inject(Router);

  public motorcycles = signal<Motorcycle[]>([]);
  public totalElements = signal<number>(0);
  public currentPage = signal<number>(0);
  public pageSize = signal<number>(10);

  public tableColumns: TableColumn[] = [
    { key: 'id', label: 'ID', width: '5%' },
    { key: 'licensePlate', label: 'Placa', width: '15%' },
    { key: 'brandName', label: 'Marca', width: '15%' },
    { key: 'modelName', label: 'Modelo', width: '25%' },
    { key: 'vinChassis', label: 'Chasis', width: '15%' },
    { key: 'engineNumber', label: 'Motor', width: '15%' },
    { key: 'actions', label: 'Acciones', width: '10%' }
  ];

  ngOnInit() {
    this.loadMotorcycles(this.currentPage(), this.pageSize());
  }

  public loadMotorcycles(page: number, size: number) {
    this.motorcycleService.getMotorcycles({ page, size }).subscribe({
      next: (res) => {
        if (res && res.code === 200) {
          this.motorcycles.set(res.recordset.content);
          this.totalElements.set(res.recordset.totalElements);
        }
      },
      error: (err) => console.error('Error loading motorcycles', err)
    });
  }
  
  public onPageChange(page: number) {
    this.currentPage.set(page);
    this.loadMotorcycles(page, this.pageSize());
  }

  public openAddMotoDialog() {
    this.router.navigate(['/catalogos/motos/add']);
  }

  public editMoto(moto: Motorcycle) {
    this.router.navigate([`/catalogos/motos/${moto.id}/edit`]);
  }

}
