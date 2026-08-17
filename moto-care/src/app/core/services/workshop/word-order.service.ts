import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { ApiResponse, Page, PageableRequest, ReceptionStatsDto, WorkOrderProjection, InvoiceRequest, WorkOrderStatusHistoryDto } from '@models';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({
    providedIn: 'root'
})
export class WorkOrderService {
    private readonly http = inject(HttpClient);
    private readonly url = `${environment.apiUrl}/orders`;

    public getReceptionStats(): Observable<ApiResponse<ReceptionStatsDto>> {
        return this.http.get<ApiResponse<ReceptionStatsDto>>(`${this.url}/dashboard/stats`);
    }

    public getAllOrders(pageable?: PageableRequest): Observable<ApiResponse<Page<WorkOrderProjection>>> {
        let params = new HttpParams();
        if (pageable) {
            params = params.set('page', pageable.page.toString());
            params = params.set('size', pageable.size.toString());
            if (pageable.sort && pageable.sort.length > 0) {
                pageable.sort.forEach(s => {
                    params = params.append('sort', s);
                });
            }
        }
        return this.http.get<ApiResponse<Page<WorkOrderProjection>>>(`${this.url}`, { params });
    }

    public getOrderById(id: number): Observable<ApiResponse<WorkOrderProjection>> {
        return this.http.get<ApiResponse<WorkOrderProjection>>(`${this.url}/${id}`);
    }

    public updateOrderStatus(id: number, idOrderStatus: number, observation?: string): Observable<ApiResponse<any>> {
        return this.http.patch<ApiResponse<any>>(`${this.url}/${id}/status`, { idOrderStatus, observation });
    }

    public closeAndInvoiceOrder(id: number, invoiceReq: InvoiceRequest): Observable<ApiResponse<any>> {
        return this.http.patch<ApiResponse<any>>(`${this.url}/${id}/close`, invoiceReq);
    }

    public cancelOrder(id: number): Observable<any> {
        return this.http.post(`${this.url}/${id}/cancel`, null, { responseType: 'text' });
    }

    public getOrdersByClientId(clientId: number, pageable?: PageableRequest): Observable<ApiResponse<Page<WorkOrderProjection>>> {
        let params = new HttpParams();
        if (pageable) {
            params = params.set('page', pageable.page.toString());
            params = params.set('size', pageable.size.toString());
            if (pageable.sort && pageable.sort.length > 0) {
                pageable.sort.forEach(s => {
                    params = params.append('sort', s);
                });
            }
        }
        return this.http.get<ApiResponse<Page<WorkOrderProjection>>>(`${this.url}/client/${clientId}`, { params });
    }

    public getOrderStatusHistory(workOrderId: number): Observable<ApiResponse<WorkOrderStatusHistoryDto[]>> {
        return this.http.get<ApiResponse<WorkOrderStatusHistoryDto[]>>(`${environment.apiUrl}/order-statuses/history/${workOrderId}`);
    }
}