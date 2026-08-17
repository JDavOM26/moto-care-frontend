import { Component, computed, inject, OnInit, Signal, signal } from '@angular/core';
import { FormBuilder, FormGroup, FormArray, ReactiveFormsModule, Validators } from '@angular/forms';
import { Brand, Color, Model, Motorcycle, ReceptionRequest, ReceptionStatsDto } from '@models';
import { ClientService } from 'src/app/core/services/people/client.service';
import { ReceptionService } from 'src/app/core/services/workshop/reception.service';
import { WorkOrderService } from 'src/app/core/services/workshop/word-order.service';
import { ConfirmDialogService } from 'src/app/core/services/confirm-dialog.service';
import { Router } from '@angular/router';

import { MatStepperModule } from '@angular/material/stepper';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatSelectModule } from '@angular/material/select';
import { MatIconModule } from '@angular/material/icon';
import { MotorcycleService } from 'src/app/core/services/vehicle/motorcycle.service';
import { VehicleCatalogService } from 'src/app/core/services/vehicle/vehicle-catalog.service';
import { toSignal } from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-vehicle-reception',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatStepperModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatSelectModule,
    MatIconModule
  ],
  templateUrl: './vehicle-reception.html',
  styleUrl: './vehicle-reception.scss'
})
export class VehicleReceptionComponent implements OnInit {

  private readonly _receptionService = inject(ReceptionService);
  private readonly _clientService = inject(ClientService);
  private readonly _fb = inject(FormBuilder);
  private readonly _motorcycleService = inject(MotorcycleService);
  private readonly _catalogService = inject(VehicleCatalogService);
  private readonly _workOrderService = inject(WorkOrderService);
  private readonly _confirmDialogService = inject(ConfirmDialogService);
  private readonly _router = inject(Router);

  public receptionForm: FormGroup;
  public formValues: Signal<any>;
  public colors = signal<Color[]>([]);
  public brands = signal<Brand[]>([]);
  public models = signal<Model[]>([]);
  public stats = signal<ReceptionStatsDto | null>(null);


  public selectedBrand = computed(() => {
    const brandId = this.formValues().motorcycle?.brandId;
    return this.brands().find(b => b.id === brandId);
  });


  public selectedModel = computed(() => {
    const modelId = this.formValues().motorcycle?.modelId;
    return this.models().find(m => m.id === modelId);
  });



  constructor() {
    this.receptionForm = this._fb.group({
      client: this._fb.group({
        idClient: [null],
        firstName: ['', [Validators.required, Validators.maxLength(50)]],
        lastName: ['', [Validators.required, Validators.maxLength(50)]],
        documentNumber: ['', [Validators.required, Validators.maxLength(20)]],
        emails: this._fb.array([
          this._fb.control('', [Validators.email])
        ]),
        phoneNumbers: this._fb.array([
          this._fb.control('', [Validators.required, Validators.maxLength(15)])
        ]),
        idDocumentType: [3, Validators.required]
      }),

      motorcycle: this._fb.group({
        id: [null],
        licensePlate: ['', [Validators.required, Validators.maxLength(15)]],
        vinChasis: ['', [Validators.required, Validators.maxLength(50)]],
        engineNumber: ['', [Validators.required, Validators.maxLength(50)]],
        modelId: [null, Validators.required],
        colorId: [null, Validators.required],
        brandId: [null, Validators.required]
      }),

      mileage: [null, [Validators.required, Validators.min(0)]],
      initialDiagnosis: ['', [Validators.required, Validators.maxLength(500)]],
      promisedDate: [null, Validators.required]
    });


    this.formValues = toSignal(this.receptionForm.valueChanges, {
      initialValue: this.receptionForm.value
    });
  }

  get emails(): FormArray {
    return (this.receptionForm.get('client') as FormGroup).get('emails') as FormArray;
  }

  addEmail() {
    this.emails.push(this._fb.control('', [Validators.email]));
  }

  removeEmail(index: number) {
    this.emails.removeAt(index);
  }

  get phoneNumbers(): FormArray {
    return (this.receptionForm.get('client') as FormGroup).get('phoneNumbers') as FormArray;
  }

  addPhoneNumber() {
    this.phoneNumbers.push(this._fb.control('', [Validators.required, Validators.maxLength(15)]));
  }

  removePhoneNumber(index: number) {
    this.phoneNumbers.removeAt(index);
  }

  public ngOnInit(): void {
    this.loadBrands();
    this.loadColors();
    this.loadStats();
  }

  private loadStats(): void {
    this._workOrderService.getReceptionStats().subscribe({
      next: (res) => {
        if (res && res.code === 200) {
          this.stats.set(res.recordset);
        }
      },
      error: (err) => console.error('Error loading stats', err)
    });
  }

  public onSubmit(): void {
    if (this.receptionForm.invalid) {
      this.receptionForm.markAllAsTouched();
      return;
    }
    this.saveReception();
  }

  private saveReception(): void {
    const clientData = this.receptionForm.get('client')?.value;
    const clientToSave = {
      ...clientData,
      email: clientData.emails ? clientData.emails.filter((e: string) => e).join(',') : '',
      phoneNumber: clientData.phoneNumbers ? clientData.phoneNumbers.filter((p: string) => p).join(',') : ''
    };
    delete clientToSave.emails;
    delete clientToSave.phoneNumbers;

    const reception: ReceptionRequest = {
      mileage: this.receptionForm.get('mileage')?.value,
      initialDiagnosis: this.receptionForm.get('initialDiagnosis')?.value,
      promisedDate: this.receptionForm.get('promisedDate')?.value,
      client: clientToSave,
      motorcycle: this.receptionForm.get('motorcycle')?.value
    };

    this._receptionService.receiveVehicle(reception).subscribe({
      next: (response) => {
        console.log('Recepción guardada exitosamente:', response);
        this._confirmDialogService.toastSuccess('Recepción guardada exitosamente');
        this._router.navigate(['/work-orders']);
      },
      error: (error) => {
        console.log('Error al guardar la recepción:', error);
        const errorMsg = error.error?.message || 'Error al guardar la recepción';
        this._confirmDialogService.toastError(errorMsg);
      }
    });
  }

  public searchMotorcycleExistence(): void {
    const motorcycle: Motorcycle = this.receptionForm.get('motorcycle')?.value;
    if (motorcycle) {
      this._motorcycleService.searchExistence(motorcycle.licensePlate, motorcycle.engineNumber, motorcycle.vinChasis).subscribe({
        next: (response) => {
          console.log('Motocicleta encontrada:', response);
          if (response.recordset) {

            this.receptionForm.get('motorcycle')?.patchValue(response.recordset);
          }
        },
        error: (error) => {
          console.log('Error al buscar la motocicleta:', error);
        }
      });
    }
  }

  public findClientByDocumentNumber(): void {
    const documentNumber = this.receptionForm.get('client.documentNumber')?.value;
    if (documentNumber) {
      this._clientService.getClientByDocumentNumber(documentNumber).subscribe({
        next: (response) => {
          console.log('Cliente encontrado:', response);
          if (response.recordset) {
            const client = response.recordset;

            if (client.email) {
              const emails = client.email.split(',').map((e: string) => e.trim());
              this.emails.clear();
              emails.forEach((e: string) => this.emails.push(this._fb.control(e, [Validators.email])));
            } else {
              this.emails.clear();
              this.emails.push(this._fb.control('', [Validators.email]));
            }

            if (client.phoneNumber) {
              const phones = client.phoneNumber.split(',').map((p: string) => p.trim());
              this.phoneNumbers.clear();
              phones.forEach((p: string) => this.phoneNumbers.push(this._fb.control(p, [Validators.required, Validators.maxLength(15)])));
            } else {
              this.phoneNumbers.clear();
              this.phoneNumbers.push(this._fb.control('', [Validators.required, Validators.maxLength(15)]));
            }


            this.receptionForm.get('client')?.patchValue({
              idClient: client.idClient,
              firstName: client.firstName,
              lastName: client.lastName,
              documentNumber: client.documentNumber,
              idDocumentType: client.idDocumentType,
            });
          }
        },
        error: (error) => {
          console.log('Error al buscar el cliente:', error);
        }
      });
    }
  }

  //==================================
  // Load catalogs
  // =================================

  private loadBrands(): void {
    this._catalogService.getAllBrands().subscribe({
      next: (response) => {
        this.brands.set(response.recordset);
      },
      error: (error) => {
        console.error(error);
      }
    });
  }

  private loadColors(): void {
    this._catalogService.getAllColors().subscribe({
      next: (response) => {
        this.colors.set(response.recordset);
      },
      error: (error) => {
        console.error(error);
      }
    });
  }

  public loadModelsByBrand(idBrand: number): void {
    this.models.set([]);
    this.receptionForm.get('motorcycle.modelId')?.setValue(null);

    this._catalogService.getModelsByIdBrand(idBrand).subscribe({
      next: (response) => {
        this.models.set(response.recordset);
      },
      error: (error) => {
        console.error(error);
      }
    });
  }



}
