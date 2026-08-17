import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { ApiResponse, Client, Page, PageableRequest } from '@models';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({
    providedIn: 'root'
})

export class ClientService {

    private readonly http = inject(HttpClient);
    private readonly url = environment.apiUrl;

    public getClients(pageable?: PageableRequest): Observable<ApiResponse<Page<Client>>> {
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

        return this.http.get<ApiResponse<Page<Client>>>(`${this.url}/clients`, { params });
    }

    public createClient(client: Client): Observable<ApiResponse<Client>> {
        return this.http.post<ApiResponse<Client>>(`${this.url}/clients`, client);
    }

    public getClientByDocumentNumber(documentNumber: string): Observable<ApiResponse<Client>> {
        return this.http.get<ApiResponse<Client>>(`${this.url}/clients/document-number/${documentNumber}`);
    }

    public getClientById(id: number): Observable<ApiResponse<Client>> {
        return this.http.get<ApiResponse<Client>>(`${this.url}/clients/${id}`);
    }
}