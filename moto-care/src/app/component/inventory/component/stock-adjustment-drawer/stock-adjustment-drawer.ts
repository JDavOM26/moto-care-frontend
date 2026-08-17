import { Component, inject, input, output, signal, SimpleChanges, OnChanges } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { StockResponseDto } from 'src/app/core/models/stock.models';
import { StockService } from 'src/app/core/services/inventory/stock.service';
import { ConfirmDialogService } from 'src/app/core/services/confirm-dialog.service';

@Component({
  selector: 'app-stock-adjustment-drawer',
  standalone: true,
  imports: [MatIconModule, ReactiveFormsModule, MatSelectModule],
  templateUrl: './stock-adjustment-drawer.html',
  styleUrl: './stock-adjustment-drawer.scss'
})
export class StockAdjustmentDrawer implements OnChanges {
  public isOpen = input<boolean>(false);
  public item = input<StockResponseDto | null>(null);
  public closed = output<void>();

  private readonly _stockService = inject(StockService);
  private readonly _confirmDialogService = inject(ConfirmDialogService);
  private readonly _fb = inject(FormBuilder);

  public myForm!: FormGroup;

  constructor() {
    this.myForm = this._fb.group({
      transactionType: ['ENTRADA', [Validators.required]],
      quantity: [null, [Validators.required, Validators.min(1)]],
      reason: ['', [Validators.required, Validators.minLength(3)]]
    });
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['isOpen'] && this.isOpen()) {
      this.myForm.reset({ transactionType: 'ENTRADA' });
    }
  }

  public save(): void {
    if (this.myForm.invalid) {
      this.myForm.markAllAsTouched();
      this._confirmDialogService.toastError('Por favor, completa todos los campos requeridos correctamente.');
      return;
    }

    const currentItem = this.item();
    if (!currentItem) return;

    this._confirmDialogService.confirm(
      'Registrar Movimiento',
      `¿Estás seguro de registrar este movimiento para ${currentItem.itemName}?`
    ).then((result) => {
      if (result.isConfirmed) {
        const payload = {
          idItem: currentItem.id,
          idCompany: 1,
          quantity: this.myForm.value.quantity,
          transactionType: this.myForm.value.transactionType,
          reason: this.myForm.value.reason
        };

        this._stockService.registerTransaction(payload).subscribe({
          next: () => {
            this._confirmDialogService.toastSuccess('Movimiento registrado exitosamente');
            this.closed.emit();
            this.myForm.reset();
          },
          error: (err) => {
            console.error('Error al registrar movimiento:', err);
            this._confirmDialogService.toastError('Error al registrar el movimiento.');
          }
        });
      }
    });
  }

  public async close(): Promise<void> {
    if (this.myForm.dirty) {
      const result = await this._confirmDialogService.confirm(
        'Descartar Cambios',
        'Tienes cambios sin guardar. ¿Estás seguro de que quieres cerrar?'
      );

      if (result.isDenied || !result.isConfirmed) {
        return;
      }
    }

    this.closed.emit();
  }
}
