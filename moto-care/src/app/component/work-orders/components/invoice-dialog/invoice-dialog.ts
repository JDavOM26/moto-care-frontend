import { Component, inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-invoice-dialog',
  imports: [CommonModule, ReactiveFormsModule, MatDialogModule, MatButtonModule, MatFormFieldModule, MatInputModule, MatSelectModule],
  templateUrl: './invoice-dialog.html',
})
export class InvoiceDialog implements OnInit {
  private readonly _fb = inject(FormBuilder);
  public dialogRef = inject(MatDialogRef<InvoiceDialog>);
  public data = inject(MAT_DIALOG_DATA);

  public invoiceForm: FormGroup;
  public totalEstimated: number = 0;

  constructor() {
    this.invoiceForm = this._fb.group({
      idMethodPayment: [1, Validators.required],
      paymentReference: [''],
      amountReceived: [0, [Validators.required, Validators.min(0)]],
      note: ['']
    });
  }

  ngOnInit() {
    if (this.data && this.data.totalEstimated) {
      this.totalEstimated = this.data.totalEstimated;
      this.invoiceForm.patchValue({ amountReceived: this.totalEstimated });
    }
  }

  onCancel(): void {
    this.dialogRef.close();
  }

  onSubmit(): void {
    if (this.invoiceForm.valid && this.invoiceForm.get('amountReceived')?.value >= this.totalEstimated) {
      this.dialogRef.close(this.invoiceForm.value);
    }
  }
}
