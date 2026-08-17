import { Component, inject, OnInit } from '@angular/core';
import { MatDialogRef, MatDialogModule, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatTabsModule } from '@angular/material/tabs';
import { ReactiveFormsModule, FormBuilder, Validators, FormGroup } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { StockService } from 'src/app/core/services/inventory/stock.service';
import { StockResponseDto } from '@models';

@Component({
  selector: 'app-add-item-dialog',
  imports: [
    CommonModule,
    MatDialogModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatCheckboxModule,
    MatTabsModule,
    ReactiveFormsModule
  ],
  templateUrl: './add-item-dialog.html',
  styleUrl: './add-item-dialog.scss',
})
export class AddItemDialog implements OnInit {
  private dialogRef = inject(MatDialogRef<AddItemDialog>);
  public data: any = inject(MAT_DIALOG_DATA, { optional: true });
  private fb = inject(FormBuilder);
  private stockService = inject(StockService);
  public isEdit = false;
  public activeTabIndex = 0;

  public inventoryItems: StockResponseDto[] = [];

  public itemForm: FormGroup = this.fb.group({
    type: ['repuesto', Validators.required],
    isManual: [false],
    description: ['', Validators.required],
    observation: [''],
    inventoryItemId: [null],
    quantity: [1, [Validators.required, Validators.min(1)]],
    unitPrice: [0, [Validators.required, Validators.min(0)]]
  });

  ngOnInit() {
    this.isEdit = this.data?.isEdit || false;

    this.stockService.getCurrentStock(0, 100).subscribe({
      next: (response) => {
        if (response.recordset && response.recordset.content) {
          this.inventoryItems = response.recordset.content;
        }

        if (this.isEdit && this.data?.detail) {
          const detail = this.data.detail;
          const type = detail.itemType === 'SERVICE' ? 'servicio' : 'repuesto';
          const isManual = detail.itemType === 'SERVICE' || !detail.idItem;

          if (type === 'repuesto' && !isManual) this.activeTabIndex = 0;
          else if (type === 'servicio') this.activeTabIndex = 1;
          else this.activeTabIndex = 2;

          this.itemForm.patchValue({
            type: type,
            isManual: isManual,
            description: detail.description,
            observation: detail.observation,
            inventoryItemId: detail.idItem || null,
            quantity: detail.quantity || detail.amount || 1,
            unitPrice: detail.unitPrice
          });
        }
      }
    });

    this.itemForm.get('type')?.valueChanges.subscribe(() => this.updateValidators());
    this.itemForm.get('isManual')?.valueChanges.subscribe(() => this.updateValidators());

    this.itemForm.get('inventoryItemId')?.valueChanges.subscribe(id => {
      const item = this.inventoryItems.find(i => i.id === id);
      if (item) {
        const available = item.availableQuantity || 0;
        const reserved = item.reservedQuantity || 0;
        const netStock = available - reserved;

        let maxAllowed = netStock;
        let isOriginal = false;

        if (this.isEdit && this.data?.detail && this.data.detail.idItem === id) {
          const originalQuantity = this.data.detail.quantity || this.data.detail.amount || 0;
          maxAllowed = netStock + originalQuantity;
          isOriginal = true;
        }

        this.itemForm.patchValue({
          unitPrice: item.salesPrice || 0,
          description: item.itemName
        }, { emitEvent: false });

        if (maxAllowed <= 0) {
          this.itemForm.get('quantity')?.enable({ emitEvent: false });
          if (!isOriginal) {
            this.itemForm.get('quantity')?.setValue(0, { emitEvent: false });
          }
          this.itemForm.get('quantity')?.setValidators([Validators.required, Validators.max(maxAllowed)]);
        } else {
          this.itemForm.get('quantity')?.enable({ emitEvent: false });
          if (!isOriginal && this.itemForm.get('quantity')?.value === 0) {
            this.itemForm.get('quantity')?.setValue(1, { emitEvent: false });
          }
          this.itemForm.get('quantity')?.setValidators([Validators.required, Validators.min(1), Validators.max(maxAllowed)]);
        }
        this.itemForm.get('quantity')?.updateValueAndValidity({ emitEvent: false });
      }
    });
  }

  private updateValidators(): void {
    const type = this.itemForm.get('type')?.value;
    const isManual = this.itemForm.get('isManual')?.value;

    if (type === 'repuesto' && !isManual) {
      this.itemForm.get('inventoryItemId')?.setValidators([Validators.required]);
    } else {
      this.itemForm.get('inventoryItemId')?.clearValidators();
      this.itemForm.get('inventoryItemId')?.setValue(null, { emitEvent: false });
    }
    this.itemForm.get('inventoryItemId')?.updateValueAndValidity();
    this.itemForm.get('description')?.updateValueAndValidity();
  }

  public onCancel(): void {
    this.dialogRef.close();
  }

  public onSubmit(): void {
    if (this.itemForm.valid) {
      this.dialogRef.close(this.itemForm.value);
    }
  }

  public getSelectedNetStock(): number {
    const id = this.itemForm.get('inventoryItemId')?.value;
    const item = this.inventoryItems.find(i => i.id === id);
    if (!item) return 0;
    const available = item.availableQuantity || 0;
    const reserved = item.reservedQuantity || 0;
    let net = available - reserved;
    return net;
  }

  public isOriginalItem(item: StockResponseDto): boolean {
    return this.isEdit && this.data?.detail?.idItem === item.id;
  }

  public getSelectedNetStockForItem(item: StockResponseDto): number {
    const available = item.availableQuantity || 0;
    const reserved = item.reservedQuantity || 0;
    return available - reserved;
  }

  public onTabChange(index: number): void {
    if (this.isEdit) return;

    if (index === 0) {
      this.itemForm.patchValue({ type: 'repuesto', isManual: false });
    } else if (index === 1) {
      this.itemForm.patchValue({ type: 'servicio', isManual: true });
    } else if (index === 2) {
      this.itemForm.patchValue({ type: 'repuesto', isManual: true });
    }
  }
}
