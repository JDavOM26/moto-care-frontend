import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { CustomTableComponent } from 'src/app/shared/custom-table/custom-table';
import { TableColumnDefDirective } from 'src/app/shared/custom-table/directives/table-column.directive';
import { TableColumn } from 'src/app/shared/custom-table/models/table.models';
import { UserService, UserDto } from 'src/app/core/services/security/user.service';
import { ConfirmDialogService } from 'src/app/core/services/confirm-dialog.service';
import { Router } from '@angular/router';
import { MatTooltipModule } from '@angular/material/tooltip';

@Component({
  selector: 'app-users-mgmt',
  standalone: true,
  imports: [CommonModule, CustomTableComponent, TableColumnDefDirective, MatIconModule, MatButtonModule, MatSlideToggleModule, MatTooltipModule],
  templateUrl: './users-mgmt.html'
})
export class UsersMgmt implements OnInit {
  private readonly userService = inject(UserService);
  private readonly confirmDialogService = inject(ConfirmDialogService);
  private readonly router = inject(Router);

  public users = signal<UserDto[]>([]);
  public totalElements = signal<number>(0);
  public currentPage = signal<number>(0);
  public pageSize = signal<number>(10);

  public tableColumns: TableColumn[] = [
    { key: 'id', label: 'ID', width: '5%' },
    { key: 'username', label: 'Usuario', width: '20%' },
    { key: 'firstName', label: 'Nombre', width: '20%' },
    { key: 'lastName', label: 'Apellido', width: '20%' },
    { key: 'role', label: 'Rol', width: '15%' },
    { key: 'status', label: 'Estado', width: '10%' },
    { key: 'actions', label: 'Acciones', width: '10%' }
  ];

  ngOnInit() {
    this.loadUsers(this.currentPage(), this.pageSize());
  }

  public loadUsers(page: number, size: number) {
    this.userService.getAllUsers({ page, size }).subscribe({
      next: (res) => {
        if (res && res.code === 200) {
          this.users.set(res.recordset.content);
          this.totalElements.set(res.recordset.totalElements);
        }
      },
      error: (err) => console.error('Error loading users', err)
    });
  }

  public openAddUserDialog() {
    this.router.navigate(['/security/users/add']);
  }

  public editUser(user: UserDto) {
    this.confirmDialogService.infoDialog('Próximamente', 'Funcionalidad de editar usuario en construcción.');
  }

  public toggleUserStatus(user: UserDto) {
    if (user.id) {
      const action = user.status === 'Activo' ? 'desactivar' : 'activar';
      this.confirmDialogService.confirm(
        `¿Desea ${action} al usuario?`,
        `El usuario cambiará su estado a ${user.status === 'Activo' ? 'Inactivo' : 'Activo'}`
      ).then((result: any) => {
        if (result.isConfirmed) {
          this.userService.toggleUserStatus(user.id!).subscribe({
            next: () => {
              this.confirmDialogService.toastSuccess(`Usuario ${user.status === 'Activo' ? 'desactivado' : 'activado'} exitosamente`);
              this.loadUsers(this.currentPage(), this.pageSize());
            },
            error: (err) => {
              console.error('Error changing user status', err);
              this.confirmDialogService.toastError('Error al cambiar el estado del usuario');
            }
          });
        }
      });
    }
  }
}
