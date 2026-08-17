import { Injectable } from '@angular/core';
import Swal, { SweetAlertResult } from 'sweetalert2';

@Injectable({ providedIn: 'root' })
export class ConfirmDialogService {

    confirm(title: string, text: string): Promise<SweetAlertResult> {
        return Swal.fire({
            title,
            text,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Confirmar',
            cancelButtonText: 'Cancelar',
        });
    }

    prompt(title: string, text: string, inputPlaceholder: string): Promise<SweetAlertResult> {
        return Swal.fire({
            title,
            text,
            input: 'textarea',
            inputPlaceholder,
            showCancelButton: true,
            confirmButtonText: 'Confirmar',
            cancelButtonText: 'Cancelar',
        });
    }

    delete(title: string = '¿Eliminar registro?'): Promise<SweetAlertResult> {
        return Swal.fire({
            title,
            text: 'Esta acción no se puede deshacer.',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Sí, eliminar',
            cancelButtonText: 'Cancelar',
            confirmButtonColor: '#e53935',
        });
    }

    infoDialog(title: string, text: string): Promise<SweetAlertResult> {
        return Swal.fire({
            title,
            text,
            icon: 'info',
            confirmButtonText: 'Cerrar'
        });
    }

    toastSuccess(title: string) {
        return Swal.fire({
            toast: true,
            position: 'top-end',
            icon: 'success',
            title,
            showConfirmButton: false,
            timer: 3000,
            timerProgressBar: true,
        });
    }

    toastError(title: string) {
        return Swal.fire({
            toast: true,
            position: 'top-end',
            icon: 'error',
            title,
            showConfirmButton: false,
            timer: 3000,
            timerProgressBar: true,
        });
    }
}