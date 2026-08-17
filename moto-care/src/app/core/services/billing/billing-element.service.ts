import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { ApiResponse, BillingElement } from '@models';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';


@Injectable({
    providedIn: 'root'
})

export class BillingElementService {

    private readonly http = inject(HttpClient);
    private readonly url = environment.apiUrl;

    public createBillingElement(element: BillingElement): Observable<ApiResponse<number>> {
        return this.http.post<ApiResponse<number>>(`${this.url}/billing-elements`, element);
    }

    public getAllBillingElements(): Observable<ApiResponse<BillingElement[]>> {
        return this.http.get<ApiResponse<BillingElement[]>>(`${this.url}/billing-elements`);
    }

}