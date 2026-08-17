import { Component, inject, input, OnChanges, OnInit, output, signal, SimpleChanges } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators, FormControl } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { StockResponseDto } from 'src/app/core/models/stock.models';
import { ProviderLookup, ItemCategoryLookup } from 'src/app/core/models';
import { StockService } from 'src/app/core/services/inventory/stock.service';
import { ProviderService } from 'src/app/core/services/inventory/provider.service';
import { ItemCategoryService } from 'src/app/core/services/billing/item-category.service';
import { debounceTime, distinctUntilChanged, catchError, of } from 'rxjs';
import { ConfirmDialogService } from 'src/app/core/services/confirm-dialog.service';

@Component({
  selector: 'app-new-item-drawer',
  imports: [MatIconModule, ReactiveFormsModule, MatSelectModule],
  templateUrl: './new-item-drawer.html',
  styleUrl: './new-item-drawer.scss',
})
export class NewItemDrawer implements OnChanges, OnInit {

  public isOpen = input<boolean>(false);
  public itemToEdit = input<StockResponseDto | null>(null);
  public closed = output<void>();
  public title = signal<string>("Nuevo Producto");

  private readonly _stockService = inject(StockService);
  private readonly _providerService = inject(ProviderService);
  private readonly _itemCategoryService = inject(ItemCategoryService);
  private readonly _confirmDialogService = inject(ConfirmDialogService)

  private readonly _fb = inject(FormBuilder);
  public myForm!: FormGroup;

  public supplierSearchControl = new FormControl<string | ProviderLookup>('');
  public providers = signal<ProviderLookup[]>([]);

  public categorySearchControl = new FormControl<string | ItemCategoryLookup>('');
  public categories = signal<ItemCategoryLookup[]>([]);

  ngOnInit(): void {
    this.loadCategories();
    this.loadProviders();

    this.myForm = this._fb.group({
      itemName: ['', [Validators.required]],
      sku: ['', [Validators.required, Validators.maxLength(50)]],
      purchasePrice: [null, [Validators.required, Validators.min(0)]],
      salesPrice: [null, [Validators.required, Validators.min(0)]],
      availableQuantity: [0, [Validators.required, Validators.min(0)]],
      maximumStock: [5, [Validators.required, Validators.min(1)]],
      minimumStock: [null, [Validators.min(1)]],
      idSupplier: [null],
      idCategory: [null],
      physicalLocation: ['', [Validators.maxLength(100)]]


    });

    this.supplierSearchControl.valueChanges
      .pipe(
        debounceTime(300),
        distinctUntilChanged()
      )
      .subscribe((value) => {
        const searchStr = typeof value === 'string' ? value : value?.name || '';
        this.loadProviders(searchStr);
      });

    this.categorySearchControl.valueChanges
      .pipe(
        debounceTime(300),
        distinctUntilChanged()
      )
      .subscribe((value) => {
        const searchStr = typeof value === 'string' ? value : value?.name || '';
        this.loadCategories(searchStr);
      });
  }

  public loadProviders(searchStr: string = '') {
    this._providerService.getProvidersLookup(searchStr).pipe(
      catchError(() => of({ recordset: [] as ProviderLookup[] }))
    ).subscribe((res: any) => {
      this.providers.set(res.recordset || []);
    });
  }

  public loadCategories(searchStr: string = '') {
    this._itemCategoryService.getItemCategoriesLookup(searchStr).pipe(
      catchError(() => of({ recordset: [] as ItemCategoryLookup[] }))
    ).subscribe((res: any) => {
      this.categories.set(res.recordset || []);
    });
  }


  public displayProvider(provider?: ProviderLookup): string {
    return provider ? provider.name : '';
  }

  public onSelectOpened(isOpen: boolean) {
    if (isOpen) {
      this.supplierSearchControl.setValue('', { emitEvent: true });
    }
  }

  public onCategorySelectOpened(isOpen: boolean) {
    if (isOpen) {
      this.categorySearchControl.setValue('', { emitEvent: true });
    }
  }

  public clearProvider(): void {
    this.supplierSearchControl.setValue('');
    this.myForm.patchValue({ idSupplier: null });
  }


  ngOnChanges(changes: SimpleChanges) {
    if (changes['isOpen']?.currentValue) {
      this.loadProviders();
      this.loadCategories();
    }

    if (this.myForm) {
      if (this.itemToEdit()) {
        this.title.set("Editar Producto");
        this.myForm.patchValue({
          itemName: this.itemToEdit()?.itemName,
          salesPrice: this.itemToEdit()?.salesPrice,
          purchasePrice: this.itemToEdit()?.purchasePrice,
          availableQuantity: this.itemToEdit()?.availableQuantity,
          sku: this.itemToEdit()?.sku,
          maximumStock: this.itemToEdit()?.maximumStock,
          minimumStock: this.itemToEdit()?.minimumStock,
          physicalLocation: this.itemToEdit()?.physicalLocation,
          idSupplier: this.itemToEdit()?.idSupplier || null,
          idCategory: this.itemToEdit()?.idCategory || null
        });

        this.myForm.get('availableQuantity')?.disable();

        if (this.itemToEdit()?.idSupplier) {
        } else {
          this.supplierSearchControl.setValue('');
        }

        if (this.itemToEdit()?.idCategory) {
        } else {
          this.categorySearchControl.setValue('');
        }

      } else {
        this.myForm.get('availableQuantity')?.enable();
        this.myForm.reset({ availableQuantity: 0 });
        this.supplierSearchControl.setValue('');
        this.categorySearchControl.setValue('');
      }
    }
  }

  public save(): void {
    if (this.myForm.invalid) {
      this.myForm.markAllAsTouched();
      this._confirmDialogService.toastError('Por favor, completa todos los campos requeridos correctamente.');
      return;
    }

    if (this.itemToEdit()) {
      this._confirmDialogService.confirm(
        'Actualizar Producto',
        '¿Estás seguro de que quieres actualizar este producto?'
      ).then((result) => {
        if (result.isConfirmed) {
          const payload = { ...this.myForm.getRawValue(), id: this.itemToEdit()?.id };
          this._stockService.updateStock(payload).subscribe({
            next: () => {
              this._confirmDialogService.toastSuccess('Producto actualizado exitosamente');
              this.closed.emit();
              this.myForm.reset();
            },
            error: (err) => {
              console.error('Error al actualizar:', err);
              this._confirmDialogService.toastError('Error al actualizar el producto.');
            }
          });
        } else {
          return;
        }
      });
    } else {
      this._stockService.createStock(this.myForm.getRawValue()).subscribe({
        next: () => {
          this._confirmDialogService.toastSuccess('Producto creado exitosamente');
          this.closed.emit();
          this.myForm.reset();
        },
        error: (err) => {
          console.error('Error al crear:', err);
          this._confirmDialogService.toastError('Error al crear el producto.');
        }
      });
    }
  }

  public async close(): Promise<void> {
    if (this.myForm.dirty) {
      const result = await this._confirmDialogService.confirm(
        'Descartar Cambios',
        'Tienes cambios sin guardar. ¿Estás seguro de que quieres cerrar el formulario?'
      );

      if (result.isDenied || !result.isConfirmed) {
        return;
      }
    }

    this.closed.emit();
  }
}
