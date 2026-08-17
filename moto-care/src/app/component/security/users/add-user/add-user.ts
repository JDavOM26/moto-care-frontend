import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';

// Angular Material Modules
import { MatStepperModule } from '@angular/material/stepper';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { MatIconModule } from '@angular/material/icon';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';

// Services and Models
import { UserService } from 'src/app/core/services/security/user.service';
import { CatalogService } from 'src/app/core/services/common/catalog.service';
import { ConfirmDialogService } from 'src/app/core/services/confirm-dialog.service';
import { Area, Position, Role } from '@models';

@Component({
  selector: 'app-add-user',
  standalone: true,
  imports: [
    CommonModule, 
    ReactiveFormsModule, 
    RouterModule,
    MatStepperModule, 
    MatFormFieldModule, 
    MatInputModule, 
    MatButtonModule, 
    MatSelectModule,
    MatIconModule,
    MatDatepickerModule,
    MatNativeDateModule
  ],
  templateUrl: './add-user.html'
})
export class AddUserComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly userService = inject(UserService);
  private readonly catalogService = inject(CatalogService);
  private readonly dialogService = inject(ConfirmDialogService);
  private readonly router = inject(Router);

  // Catalogs
  public areas = signal<Area[]>([]);
  public positions = signal<Position[]>([]);
  public roles = signal<Role[]>([]);

  // Form Groups
  public personalGroup!: FormGroup;
  public jobGroup!: FormGroup;
  public accountGroup!: FormGroup;

  ngOnInit() {
    this.initForms();
    this.loadCatalogs();
  }

  private initForms() {
    this.personalGroup = this.fb.group({
      firstName: ['', [Validators.required, Validators.maxLength(50)]],
      lastName: ['', [Validators.required, Validators.maxLength(50)]],
      phoneNumber: ['', [Validators.maxLength(20)]],
      email: ['', [Validators.email, Validators.maxLength(100)]]
    });

    this.jobGroup = this.fb.group({
      idPosition: [null, [Validators.required]],
      idArea: [null, [Validators.required]],
      salary: [null, [Validators.required, Validators.min(0)]],
      hireDate: [new Date(), [Validators.required]]
    });

    this.accountGroup = this.fb.group({
      username: ['', [Validators.required, Validators.minLength(4), Validators.maxLength(50)]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      idRol: [null, [Validators.required]],
      secretQuestion: ['', [Validators.required, Validators.maxLength(100)]],
      secretAnswer: ['', [Validators.required, Validators.maxLength(100)]]
    });
  }

  private loadCatalogs() {
    this.catalogService.getAreas().subscribe(res => {
      if (res?.recordset) this.areas.set(res.recordset);
    });
    this.catalogService.getPositions().subscribe(res => {
      if (res?.recordset) this.positions.set(res.recordset);
    });
    this.catalogService.getRoles().subscribe(res => {
      if (res?.recordset) this.roles.set(res.recordset);
    });
  }

  public saveUser() {
    if (this.personalGroup.invalid || this.jobGroup.invalid || this.accountGroup.invalid) {
      this.dialogService.toastError('Por favor, complete todos los campos obligatorios correctamente.');
      return;
    }

    const payload = {
      ...this.personalGroup.value,
      ...this.jobGroup.value,
      ...this.accountGroup.value
    };

    // Format date specifically for backend if necessary
    if (payload.hireDate) {
      const d = new Date(payload.hireDate);
      payload.hireDate = d.toISOString().split('T')[0];
    }

    this.userService.createUser(payload).subscribe({
      next: () => {
        this.dialogService.toastSuccess('Usuario creado exitosamente');
        this.router.navigate(['/security/users']);
      },
      error: (err) => {
        console.error(err);
        this.dialogService.toastError('Error al crear el usuario. Verifique los datos.');
      }
    });
  }
}
