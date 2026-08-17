import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { SecurityService } from '../services/auth/security.service';
import { ConfirmDialogService } from '../services/confirm-dialog.service';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const securityService = inject(SecurityService);
  const confirmDialogService = inject(ConfirmDialogService);
  const router = inject(Router);

  const user = securityService.currentUser();

  if (user && user.token) {
    req = req.clone({
      setHeaders: {
        Authorization: `Bearer ${user.token}`
      }
    });
  }

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      if (error.status === 401 || error.status === 403) {
        confirmDialogService.toastError('Error de autenticación o permisos insuficientes.');
      }
      return throwError(() => error);
    })
  );
};
