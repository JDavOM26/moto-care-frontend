import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { InventoryMovementDto, StockResponseDto } from 'src/app/core/models/stock.models';
import { StockService } from 'src/app/core/services/inventory/stock.service';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatAutocompleteModule, MatAutocompleteSelectedEvent } from '@angular/material/autocomplete';
import { FormsModule, ReactiveFormsModule, FormControl } from '@angular/forms';
import { debounceTime, distinctUntilChanged } from 'rxjs';
import { CustomTableComponent } from 'src/app/shared/custom-table/custom-table';
import { TableColumnDefDirective } from 'src/app/shared/custom-table/directives/table-column.directive';
import { TableColumn } from 'src/app/shared/custom-table/models/table.models';


@Component({
  selector: 'app-kardex-page',
  standalone: true,
  imports: [
    CommonModule, MatIconModule, MatButtonModule,
    MatSelectModule, MatFormFieldModule, MatInputModule,
    MatAutocompleteModule, FormsModule, ReactiveFormsModule,
    CustomTableComponent, TableColumnDefDirective
  ],
  templateUrl: './kardex.html'
})
export class KardexComponent implements OnInit {
  //=============================
  //  @Services
  //=============================
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly location = inject(Location);
  private readonly _stockService = inject(StockService);

  //=============================
  //  @Signals
  //=============================
  public movements = signal<InventoryMovementDto[]>([]);
  public stockDetail = signal<StockResponseDto | null>(null);
  public isLoading = signal<boolean>(false);
  public itemName = signal<string>('');
  public filterType = signal<string>('TODOS');

  private itemId: number = 0;
  public movementTypes = ['TODOS', 'ENTRADA', 'SALIDA', 'AJUSTE'];

  public searchControl = new FormControl('');
  public searchResults = signal<StockResponseDto[]>([]);


  public tableColumns: TableColumn[] = [
    { key: 'movementDate', label: 'Fecha', width: '15%' },
    { key: 'movementType', label: 'Tipo', width: '15%' },
    { key: 'quantity', label: 'Cant.', width: '10%' },
    { key: 'resultingQuantity', label: 'Saldo', width: '10%' },
    { key: 'reason', label: 'Motivo', width: '35%' },
    { key: 'movementUser', label: 'Usuario', width: '15%' }
  ];



  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      const idParam = params.get('id');
      if (idParam) {
        this.itemId = +idParam;
        this.loadStockDetails();
        this.loadMovements();
      }
    });

    this.searchControl.valueChanges
      .pipe(
        debounceTime(300),
        distinctUntilChanged()
      )
      .subscribe((query) => {
        if (query && query.length > 2) {
          this._stockService.getCurrentStock(0, 10, query).subscribe(res => {
            if (res.recordset && res.recordset.content) {
              this.searchResults.set(res.recordset.content);
            }
          });
        } else {
          this.searchResults.set([]);
        }
      });
  }

  public loadStockDetails(): void {
    this._stockService.getStockById(this.itemId).subscribe({
      next: (res) => {
        if (res.recordset) {
          this.stockDetail.set(res.recordset);
          this.itemName.set(res.recordset.itemName || '');
        }
      },
      error: (err) => console.error('Error fetching stock details', err)
    });
  }

  public loadMovements(): void {
    this.isLoading.set(true);
    this._stockService.getMovements(this.itemId, 0, 10, this.filterType()).subscribe({
      next: (res: any) => {
        if (res.recordset && res.recordset.content) {
          this.movements.set(res.recordset.content);
        } else if (res.data && res.data.content) {
          this.movements.set(res.data.content);
        } else {
          this.movements.set([]);
        }
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error('Error fetching movements', err);
        this.isLoading.set(false);
      }
    });
  }

  public onFilterChange(type: string): void {
    this.filterType.set(type);
    this.loadMovements();
  }

  public onProductSelected(event: MatAutocompleteSelectedEvent): void {
    const selectedProduct = event.option.value as StockResponseDto;
    this.searchControl.setValue('');
    this.searchResults.set([]);
    this.router.navigate(['ventas/inventario/stock', selectedProduct.id, 'kardex']);
  }

  public displayFn(product?: StockResponseDto): string {
    return product ? product.itemName || '' : '';
  }

  public goBack(): void {
    this.location.back();
  }
}
