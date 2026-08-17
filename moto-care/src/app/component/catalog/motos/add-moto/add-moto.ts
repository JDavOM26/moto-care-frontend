import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';


import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';


import { MotorcycleService } from 'src/app/core/services/vehicle/motorcycle.service';
import { ConfirmDialogService } from 'src/app/core/services/confirm-dialog.service';
import { VehicleCatalogService } from 'src/app/core/services/vehicle/vehicle-catalog.service';
import { Model, Color, Brand } from '@models';

@Component({
  selector: 'app-add-moto',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatSelectModule
  ],
  templateUrl: './add-moto.html'
})
export class AddMotoComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly motorcycleService = inject(MotorcycleService);
  private readonly vehicleCatalogService = inject(VehicleCatalogService);
  private readonly dialogService = inject(ConfirmDialogService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  public motoGroup!: FormGroup;
  public brands = signal<Brand[]>([]);
  public models = signal<Model[]>([]);
  public colors = signal<Color[]>([]);

  public isEditMode = false;
  private motoId?: number;
  private isSettingValue = false;

  ngOnInit() {
    this.initForm();
    this.loadCatalogs();
    this.checkEditMode();
  }

  private initForm() {
    this.motoGroup = this.fb.group({
      licensePlate: ['', [Validators.required, Validators.maxLength(15)]],
      vinChassis: ['', [Validators.required, Validators.maxLength(30)]],
      engineNumber: ['', [Validators.required, Validators.maxLength(30)]],
      brandId: [null, [Validators.required]],
      modelId: [{ value: null, disabled: true }, [Validators.required]],
      colorId: [null, [Validators.required]]
    });

    this.motoGroup.get('brandId')?.valueChanges.subscribe(brandId => {
      if (brandId) {
        this.loadModels(brandId);
        this.motoGroup.get('modelId')?.enable();
      } else {
        this.models.set([]);
        this.motoGroup.get('modelId')?.disable();
      }
      if (!this.isSettingValue) {
        this.motoGroup.get('modelId')?.setValue(null);
      }
    });
  }

  private loadCatalogs() {
    this.vehicleCatalogService.getAllBrands().subscribe(res => {
      if (res?.recordset) this.brands.set(res.recordset);
    });
    this.vehicleCatalogService.getAllColors().subscribe(res => {
      if (res?.recordset) this.colors.set(res.recordset);
    });
  }

  private loadModels(brandId: number) {
    this.vehicleCatalogService.getModelsByIdBrand(brandId).subscribe(res => {
      if (res?.recordset) this.models.set(res.recordset);
    });
  }

  private checkEditMode() {
    const idParam = this.route.snapshot.paramMap.get('id');
    if (idParam) {
      this.isEditMode = true;
      this.motoId = Number(idParam);
      this.loadMotoData();
    }
  }

  private loadMotoData() {
    this.motorcycleService.getMotorcycleById(this.motoId!).subscribe({
      next: (res) => {
        if (res && res.code === 200 && res.recordset) {
          const moto = res.recordset;

          this.isSettingValue = true;

          this.motoGroup.patchValue({
            licensePlate: moto.licensePlate,
            vinChassis: (moto as any).vinChassis || moto.vinChasis,
            engineNumber: moto.engineNumber,
            colorId: moto.colorId,
            brandId: moto.brandId,
            modelId: moto.modelId
          });

          this.isSettingValue = false;
        }
      },
      error: (err) => {
        console.error(err);
        this.dialogService.toastError('Error al cargar los datos de la motocicleta');
        this.router.navigate(['/catalogos/motos']);
      }
    });
  }

  public saveMoto() {
    if (this.motoGroup.invalid) {
      this.dialogService.toastError('Por favor, complete todos los campos obligatorios correctamente.');
      return;
    }

    const payload = {
      ...this.motoGroup.value,
      ...(this.isEditMode ? { id: this.motoId } : {})
    };

    this.motorcycleService.createMotorcycle(payload).subscribe({
      next: () => {
        this.dialogService.toastSuccess(this.isEditMode ? 'Motocicleta actualizada exitosamente' : 'Motocicleta agregada exitosamente');
        this.router.navigate(['/catalogos/motos']);
      },
      error: (err) => {
        console.error(err);
        this.dialogService.toastError(this.isEditMode ? 'Error al actualizar la motocicleta.' : 'Error al crear la motocicleta.');
      }
    });
  }
}
