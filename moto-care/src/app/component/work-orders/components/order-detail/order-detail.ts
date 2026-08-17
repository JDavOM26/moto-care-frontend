import { Component, inject, signal, computed, Input, OnInit } from '@angular/core';
import { WorkOrderDetails, WorkOrderProjection, WorkOrderStatusHistoryDto } from '@models';
import { CommonModule } from '@angular/common';
import { MatDividerModule } from '@angular/material/divider';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { AddItemDialog } from '../add-item-dialog/add-item-dialog';
import { InvoiceDialog } from '../invoice-dialog/invoice-dialog';
import { WorkOrderService } from 'src/app/core/services/workshop/word-order.service';
import { WorkOrderDetailsService } from 'src/app/core/services/workshop/word-order-details.service';
import { ConfirmDialogService } from 'src/app/core/services/confirm-dialog.service';
import { InvoiceService } from 'src/app/core/services/billing/invoice.service';

@Component({
  selector: 'app-order-detail',
  imports: [CommonModule, MatDividerModule, MatFormFieldModule, MatSelectModule, MatButtonModule, MatIconModule, MatDialogModule],
  templateUrl: './order-detail.html',
  styleUrl: './order-detail.scss',
})
export class OrderDetail implements OnInit {

  @Input({ alias: 'id' }) orderId!: number;
  private dialog = inject(MatDialog);
  private _workOrderService = inject(WorkOrderService);
  private _workOrderDetailsService = inject(WorkOrderDetailsService);
  private _confirmDialogService = inject(ConfirmDialogService);
  private _invoiceService = inject(InvoiceService);
  public order = signal<WorkOrderProjection | null>(null);
  public orderDetails = signal<WorkOrderDetails[]>([]);
  public orderHistory = signal<WorkOrderStatusHistoryDto[]>([]);

  public totalLabor = computed(() => {
    return (this.orderDetails() || [])
      .filter(d => d.itemType === 'SERVICE')
      .reduce((total, detail) => total + (detail.subtotal || ((detail.amount || detail.quantity || 0) * detail.unitPrice)), 0);
  });

  public totalParts = computed(() => {
    return (this.orderDetails() || [])
      .filter(d => d.itemType === 'PART' || d.itemType == null)
      .reduce((total, detail) => total + (detail.subtotal || ((detail.amount || detail.quantity || 0) * detail.unitPrice)), 0);
  });

  public orderTotal = computed(() => {
    return this.totalLabor() + this.totalParts();
  });

  public showDiagnosis(): void {
    const diagnosis = this.order()?.clientDiagnosis || 'No se proporcionó diagnóstico del cliente.';
    this._confirmDialogService.infoDialog('Diagnóstico Cliente', diagnosis);
  }

  ngOnInit() {
    console.log('Cargando detalles de la orden:', this.orderId);
    this._workOrderService.getOrderById(this.orderId).subscribe({
      next: (res) => {
        if (res && res.code === 200) {
          this.order.set(res.recordset);
        }
      },
      error: (err) => console.error('Error al cargar la orden:', err)
    });
    this.loadOrderDetails();
    this.loadOrderHistory();
  }

  public loadOrderHistory() {
    this._workOrderService.getOrderStatusHistory(this.orderId).subscribe({
      next: (res) => {
        if (res && res.code === 200) {
          this.orderHistory.set(res.recordset || []);
        } else {
          this.orderHistory.set([]);
        }
      },
      error: (err) => {
        console.error('Error al cargar el historial:', err);
        this.orderHistory.set([]);
      }
    });
  }

  public loadOrderDetails() {
    this._workOrderDetailsService.getOrderDetailsById(this.orderId).subscribe({
      next: (res) => {
        console.log('Respuesta de order details:', res);
        if (res && res.code === 200) {
          this.orderDetails.set(res.recordset || []);
        } else {
          this.orderDetails.set([]);
        }
      },
      error: (err) => {
        console.error('Error al cargar los detalles:', err);
        this.orderDetails.set([]);
      }
    });
  }

  public openAddItemDialog(): void {
    const dialogRef = this.dialog.open(AddItemDialog, {
      width: '450px',
      disableClose: true
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        console.log('Nuevo item a agregar:', result);
        const detail: WorkOrderDetails = {
          idItem: result.isManual ? null : (result.inventoryItemId || null),
          quantity: result.quantity,
          unitPrice: result.unitPrice,
          description: result.description,
          observation: result.observation,
          itemType: result.type === 'servicio' ? 'SERVICE' : 'PART'
        };

        this._workOrderDetailsService.addDetailToOrder(this.orderId, detail).subscribe({
          next: (res) => {
            console.log('Respuesta al agregar item:', res);
            if (res && (res.code === 200 || res.code === 201)) {
              this._confirmDialogService.toastSuccess('Ítem añadido exitosamente');
              this.loadOrderDetails();
            }
          },
          error: (err) => {
            console.error('Error al guardar el item:', err);
            this._confirmDialogService.toastError('Error al añadir el ítem');
          }
        });
      }
    });
  }

  public editDetail(detail: WorkOrderDetails): void {
    const dialogRef = this.dialog.open(AddItemDialog, {
      width: '450px',
      disableClose: true,
      data: { isEdit: true, detail: detail }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        const updatedDetail: WorkOrderDetails = {
          idItem: result.isManual ? null : (result.inventoryItemId || null),
          quantity: result.quantity,
          unitPrice: result.unitPrice,
          description: result.description,
          observation: result.observation,
          itemType: result.type === 'servicio' ? 'SERVICE' : 'PART'
        };

        this._workOrderDetailsService.updateDetailInOrder(this.orderId, detail.id!, updatedDetail).subscribe({
          next: (res) => {
            if (res && res.code === 200) {
              this._confirmDialogService.toastSuccess('Ítem actualizado exitosamente');
              this.loadOrderDetails();
            }
          },
          error: (err) => {
            console.error('Error al actualizar el item:', err);
            this._confirmDialogService.toastError('Error al actualizar el ítem');
          }
        });
      }
    });
  }

  public workflowStates = [
    { id: 1, name: 'Pendiente', icon: 'pending_actions', color: '#94a3b8' },
    { id: 2, name: 'En Diagnóstico', icon: 'search', color: '#3b82f6' },
    { id: 3, name: 'En Espera de Repuestos', icon: 'hourglass_empty', color: '#f97316' },
    { id: 4, name: 'En Reparación', icon: 'build', color: '#f59e0b' },
    { id: 5, name: 'Listo para Entrega', icon: 'check_circle', color: '#10b981' },
    { id: 6, name: 'Entregado', icon: 'done_all', color: '#059669' }
  ];

  public get currentStatusIndex(): number {
    const currentId = this.order()?.idStatus;
    if (currentId) {
      return this.workflowStates.findIndex(s => s.id === currentId);
    }
    const currentName = this.order()?.statusName?.trim();
    return this.workflowStates.findIndex(s => s.name.trim() === currentName);
  }

  public get isOrderClosed(): boolean {
    const status = this.order()?.statusName;
    return status === 'Entregado' || status === 'Cancelado';
  }

  public esSiguientePaso(id: number): boolean {
    const currentIdx = this.currentStatusIndex;
    const targetIdx = this.workflowStates.findIndex(s => s.id === id);
    return targetIdx === currentIdx + 1;
  }

  public avanzarEstado(id: number): void {
    const estadoDestino = this.workflowStates.find(s => s.id === id)?.name || 'Siguiente estado';
    this._confirmDialogService.prompt(
      'Actualizar Estado',
      `¿Deseas agregar una observación al cambiar a "${estadoDestino}"? (Opcional)`,
      'Escribe tu observación aquí...'
    ).then((result) => {
      if (result.isConfirmed) {
        const observation = result.value || undefined;
        this._workOrderService.updateOrderStatus(this.orderId, id, observation).subscribe({
          next: (res) => {
            if (res && res.code === 200) {
              this._confirmDialogService.toastSuccess('Estado actualizado');
              this.loadOrderDetails();
              this.loadOrderHistory();
              this._workOrderService.getOrderById(this.orderId).subscribe({
                next: (orderRes) => {
                  if (orderRes && orderRes.code === 200) {
                    this.order.set(orderRes.recordset);
                  }
                }
              });
            }
          },
          error: (err) => {
            console.error('Error al actualizar estado:', err);
            this._confirmDialogService.toastError('Error al actualizar estado');
          }
        });
      }
    });
  }

  public cancelOrder(): void {
    this._confirmDialogService.confirm(
      '¿Cancelar Orden?',
      '¿Estás seguro de que deseas cancelar esta orden? El inventario será liberado.'
    ).then((result) => {
      if (result.isConfirmed) {
        this._workOrderService.cancelOrder(this.orderId).subscribe({
          next: (msg) => {
            this._confirmDialogService.toastSuccess('Orden cancelada exitosamente');
            this.loadOrderDetails();
          },
          error: (err) => {
            console.error('Error al cancelar la orden:', err);
            this._confirmDialogService.toastError('Error al cancelar la orden');
          }
        });
      }
    });
  }

  public removeDetail(detailId: number): void {
    if (!detailId) return;
    this._workOrderDetailsService.removeDetailFromOrder(this.orderId, detailId).subscribe({
      next: (res) => {
        if (res && res.code === 200) {
          this._confirmDialogService.toastSuccess('Ítem eliminado exitosamente');
          this.loadOrderDetails();
        }
      },
      error: (err) => {
        console.error('Error al eliminar el item:', err);
        this._confirmDialogService.toastError('Error al eliminar el ítem');
      }
    });
  }

  public openInvoiceDialog(): void {
    const dialogRef = this.dialog.open(InvoiceDialog, {
      width: '450px',
      disableClose: true,
      data: { totalEstimated: this.orderTotal() }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        const invoiceReq = {
          idOrder: this.orderId,
          ...result
        };
        this._workOrderService.closeAndInvoiceOrder(this.orderId, invoiceReq).subscribe({
          next: (res) => {
            if (res && res.code === 200 || res?.code === 201) {
              this._confirmDialogService.toastSuccess('Orden facturada y cerrada exitosamente');
              this.loadOrderDetails();
            }
          },
          error: (err) => {
            console.error('Error al facturar la orden:', err);
            this._confirmDialogService.toastError('Error al facturar la orden');
          }
        });
      }
    });
  }
}
