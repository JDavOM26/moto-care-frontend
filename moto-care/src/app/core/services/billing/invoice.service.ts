import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { ApiResponse, Invoice, InvoiceRequest, Page, PageableRequest, PaymentRequest } from '@models';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';


@Injectable({
    providedIn: 'root'
})

export class InvoiceService {

    private readonly http = inject(HttpClient);
    private readonly url = environment.apiUrl;

    public createInvoice(invoice: InvoiceRequest): Observable<ApiResponse<Invoice>> {
        return this.http.post<ApiResponse<Invoice>>(`${this.url}/invoices`, invoice);
    }

    public getInvoices(pageable?: PageableRequest): Observable<ApiResponse<Page<Invoice>>> {
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

        return this.http.get<ApiResponse<Page<Invoice>>>(`${this.url}/invoices`, { params });
    }

    public getInvoiceById(id: number): Observable<ApiResponse<Invoice>> {
        return this.http.get<ApiResponse<Invoice>>(`${this.url}/invoices/${id}`);
    }

    public registerPayment(idInvoice: number, payment: PaymentRequest): Observable<ApiResponse<Invoice>> {
        return this.http.post<ApiResponse<Invoice>>(`${this.url}/invoices/${idInvoice}/payment`, payment);
    }
}