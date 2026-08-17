import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { ApiResponse, Page, PageableRequest, ReceptionStatsDto, WorkOrderDetails, WorkOrderProjection } from '@models';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({
    providedIn: 'root'
})
export class WorkOrderDetailsService {
    private readonly http = inject(HttpClient);
    private readonly url = `${environment.apiUrl}/orders`;


    public addDetailToOrder(orderId: number, detail: WorkOrderDetails): Observable<ApiResponse<WorkOrderDetails>> {
        return this.http.post<ApiResponse<WorkOrderDetails>>(`${this.url}/${orderId}/details`, detail);
    }

    public getOrderDetailsById(id: number): Observable<ApiResponse<WorkOrderDetails[]>> {
        return this.http.get<ApiResponse<WorkOrderDetails[]>>(`${this.url}/${id}/details`);
    }

    public removeDetailFromOrder(orderId: number, detaildId: number): Observable<ApiResponse<WorkOrderDetails>> {
        return this.http.delete<ApiResponse<WorkOrderDetails>>(`${this.url}/${orderId}/details/${detaildId}`);
    }

    public updateDetailInOrder(orderId: number, detailId: number, detail: WorkOrderDetails): Observable<ApiResponse<WorkOrderDetails>> {
        return this.http.put<ApiResponse<WorkOrderDetails>>(`${this.url}/${orderId}/details/${detailId}`, detail);
    }


}