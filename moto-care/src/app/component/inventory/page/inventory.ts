import { Component, inject, signal, OnInit } from '@angular/core';
import { CustomTableComponent } from '../../../shared/custom-table/custom-table';
import { TableColumnDefDirective } from '../../../shared/custom-table/directives/table-column.directive';
import { TableColumn } from '../../../shared/custom-table/models/table.models';
import { MatIconModule } from '@angular/material/icon';
import { StockService } from 'src/app/core/services/inventory/stock.service';
import { InventoryStatsDto, StockResponseDto } from 'src/app/core/models/stock.models';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { debounceTime, distinctUntilChanged, Subject, Subscription } from 'rxjs';
import { PageEvent } from '@angular/material/paginator';
import { NewItemDrawer } from '../component/new-item-drawer/new-item-drawer';
import { StockAdjustmentDrawer } from '../component/stock-adjustment-drawer/stock-adjustment-drawer';
import { Router } from '@angular/router';

@Component({
  selector: 'app-inventory',
  standalone: true,
  imports: [CustomTableComponent, TableColumnDefDirective, MatIconModule, MatFormFieldModule, MatInputModule, MatButtonModule,
    NewItemDrawer, StockAdjustmentDrawer
  ],
  templateUrl: './inventory.html',
  styleUrl: './inventory.scss'
})
export class InventoryComponent implements OnInit {

  public isDrawerOpen = signal<boolean>(false);
  public isAdjustmentDrawerOpen = signal<boolean>(false);
  public selectedItem = signal<StockResponseDto | null>(null);

  private readonly router = inject(Router);

  public tableColumns: TableColumn[] = [
    { key: 'itemName', label: 'Nombre', width: '20%' },
    { key: 'sku', label: 'SKU', width: '10%' },
    { key: 'availableQuantity', label: 'Cantidad', width: '5%' },
    { key: 'purchasePrice', label: 'Precio Compra', width: '10%' },
    { key: 'salesPrice', label: 'Precio Venta', width: '10%' },
    { key: 'physicalLocation', label: 'Ubicación Física', width: '10%' },
    { key: 'supplierName', label: 'Proveedor', width: '10%' },
    { key: 'actions', label: 'Acciones', width: '10%' }

  ];

  private readonly _stockService = inject(StockService);

  public searchQuery = signal<string>('');
  private _searchSubject = new Subject<string>();
  private _searchSubscription!: Subscription;

  public stats = signal<InventoryStatsDto>({ lowStock: 0, normal: 0, outOfStock: 0, totalStock: 0 });
  public inventories = signal<StockResponseDto[]>([]);
  public totalElements = signal<number>(0);
  public totalPages = signal<number>(0);
  public currentPage = signal<number>(0);
  public pageSize = signal<number>(10);

  ngOnInit() {
    this.loadCurrentStock(this.currentPage(), this.pageSize());
    this.loadStats();
    this._searchSubscription = this._searchSubject.pipe(
      debounceTime(350),
      distinctUntilChanged()
    ).subscribe((query) => {
      this.searchQuery.set(query);
      this.currentPage.set(0);
      this.loadCurrentStock(0, this.pageSize(), query);
    });
  }

  ngOnDestroy() {
    if (this._searchSubscription) {
      this._searchSubscription.unsubscribe();
    }
  }

  public onSearch(event: Event) {
    const input = event.target as HTMLInputElement;
    this._searchSubject.next(input.value);
  }

  public onPageChange(event: PageEvent) {
    this.currentPage.set(event.pageIndex);
    this.pageSize.set(event.pageSize);
    this.loadCurrentStock(event.pageIndex, event.pageSize, this.searchQuery());
  }

  private loadCurrentStock(page: number, size: number, query: string = '') {
    this._stockService.getCurrentStock(page, size, query).subscribe({
      next: (response) => {
        this.inventories.set(response.recordset.content);
        this.totalElements.set(response.recordset.totalElements);
        this.totalPages.set(response.recordset.totalPages);
        this.currentPage.set(response.recordset.pageable.pageNumber);
        this.pageSize.set(response.recordset.pageable.pageSize);
      },
      error: (error) => {
        console.error(error);
      }
    });
  }

  private loadStats() {
    this._stockService.getStats().subscribe({
      next: (response: any) => {
        this.stats.set(response.recordset);
      },
      error: (error: any) => {
        console.error(error);
      }
    });
  }

  public openCreateDrawer(): void {
    this.selectedItem.set(null);
    this.isDrawerOpen.set(true);
  }

  public openEditDrawer(item: StockResponseDto): void {
    this.selectedItem.set(item);
    this.isDrawerOpen.set(true);
  }

  public closeDrawer(): void {
    this.isDrawerOpen.set(false);
    this.selectedItem.set(null);
    this.loadCurrentStock(this.currentPage(), this.pageSize(), this.searchQuery());
  }

  public openAdjustmentDrawer(item: StockResponseDto): void {
    this.selectedItem.set(item);
    this.isAdjustmentDrawerOpen.set(true);
  }

  public closeAdjustmentDrawer(): void {
    this.isAdjustmentDrawerOpen.set(false);
    this.selectedItem.set(null);
    this.loadCurrentStock(this.currentPage(), this.pageSize(), this.searchQuery());
  }

  public openKardexDrawer(item: StockResponseDto): void {
    this.router.navigate(['ventas/inventario/stock', item.id, 'kardex'], {
      state: { itemName: item.itemName }
    });
  }

}
