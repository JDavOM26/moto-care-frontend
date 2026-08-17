import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';

// Angular Material Modules
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

// Services and Models
import { ProviderService } from 'src/app/core/services/inventory/provider.service';
import { ConfirmDialogService } from 'src/app/core/services/confirm-dialog.service';

@Component({
  selector: 'app-add-provider',
  standalone: true,
  imports: [
    CommonModule, 
    ReactiveFormsModule, 
    RouterModule,
    MatFormFieldModule, 
    MatInputModule, 
    MatButtonModule, 
    MatIconModule
  ],
  templateUrl: './add-provider.html'
})
export class AddProviderComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly providerService = inject(ProviderService);
  private readonly dialogService = inject(ConfirmDialogService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  public providerGroup!: FormGroup;
  public isEditMode = false;
  private providerId?: number;

  ngOnInit() {
    this.initForm();
    this.checkEditMode();
  }

  private initForm() {
    this.providerGroup = this.fb.group({
      name: ['', [Validators.required, Validators.maxLength(100)]],
      contactName: ['', [Validators.required, Validators.maxLength(100)]],
      phone: ['', [Validators.required, Validators.maxLength(20)]],
      email: ['', [Validators.email, Validators.maxLength(100)]]
    });
  }

  private checkEditMode() {
    const idParam = this.route.snapshot.paramMap.get('id');
    if (idParam) {
      this.isEditMode = true;
      this.providerId = Number(idParam);
      this.loadProviderData();
    }
  }

  private loadProviderData() {
    this.providerService.getProviderById(this.providerId!).subscribe({
      next: (res) => {
        if (res && res.code === 200 && res.recordset) {
          const provider = res.recordset;
          this.providerGroup.patchValue({
            name: provider.name,
            contactName: provider.contactName,
            phone: provider.phone,
            email: provider.email
          });
        }
      },
      error: (err) => {
        console.error(err);
        this.dialogService.toastError('Error al cargar los datos del proveedor');
        this.router.navigate(['/ventas/inventario/providers']);
      }
    });
  }

  public saveProvider() {
    if (this.providerGroup.invalid) {
      this.dialogService.toastError('Por favor, complete todos los campos obligatorios correctamente.');
      return;
    }

    const payload = {
      ...this.providerGroup.value,
      ...(this.isEditMode ? { id: this.providerId } : {})
    };

    this.providerService.saveProvider(payload).subscribe({
      next: () => {
        this.dialogService.toastSuccess(this.isEditMode ? 'Proveedor actualizado exitosamente' : 'Proveedor creado exitosamente');
        this.router.navigate(['/ventas/inventario/providers']);
      },
      error: (err) => {
        console.error(err);
        this.dialogService.toastError(this.isEditMode ? 'Error al actualizar el proveedor.' : 'Error al crear el proveedor.');
      }
    });
  }
}
