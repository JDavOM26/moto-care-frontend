import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { ApiResponse, Client, Motorcycle, Page, PageableRequest } from '@models';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({
    providedIn: 'root'
})

export class MotorcycleService {

    private readonly http = inject(HttpClient);
    private readonly url = environment.apiUrl;

    public getMotorcycles(pageable?: PageableRequest): Observable<ApiResponse<Page<Motorcycle>>> {
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

        return this.http.get<ApiResponse<Page<Motorcycle>>>(`${this.url}/motorcycles`, { params });
    }

    public createMotorcycle(motorcycle: Motorcycle): Observable<ApiResponse<Motorcycle>> {
        return this.http.post<ApiResponse<Motorcycle>>(`${this.url}/motorcycles`, motorcycle);
    }

    public getMotorcycleById(id: number): Observable<ApiResponse<Motorcycle>> {
        return this.http.get<ApiResponse<Motorcycle>>(`${this.url}/motorcycles/${id}`);
    }

    public searchExistence(plate: string, engineNumber: string, chassisNumber: string): Observable<ApiResponse<Motorcycle>> {
        let params = new HttpParams();
        params = params.set('plate', plate);
        params = params.set('engineNumber', engineNumber);
        params = params.set('chassisNumber', chassisNumber);
        return this.http.get<ApiResponse<Motorcycle>>(`${this.url}/motorcycles/search-existence`, { params });
    }
}