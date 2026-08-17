import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { ApiResponse, Page, ProviderLookup, ProviderDto, ProviderRequestDto } from '@models';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { StockResponseDto } from '../../models/stock.models';

@Injectable({
    providedIn: 'root'
})

export class ProviderService {

    private readonly http = inject(HttpClient);
    private readonly url = environment.apiUrl;


    getProvidersLookup(search?: string): Observable<ApiResponse<ProviderLookup[]>> {
        let params = new HttpParams();

        if (search && search.trim() !== '') {
            params = params.set('search', search.trim());
        }
        return this.http.get<ApiResponse<ProviderLookup[]>>(`${this.url}/provider/lookup`, { params });
    }

    getProvidersList(params: { page: number; size: number; search?: string }): Observable<ApiResponse<Page<ProviderDto>>> {
        let httpParams = new HttpParams()
            .set('page', params.page)
            .set('size', params.size);
            
        if (params.search && params.search.trim() !== '') {
            httpParams = httpParams.set('search', params.search.trim());
        }
        
        return this.http.get<ApiResponse<Page<ProviderDto>>>(`${this.url}/provider`, { params: httpParams });
    }

    saveProvider(dto: ProviderRequestDto): Observable<ApiResponse<string>> {
        return this.http.post<ApiResponse<string>>(`${this.url}/provider`, dto);
    }

    getProviderById(id: number): Observable<ApiResponse<ProviderDto>> {
        return this.http.get<ApiResponse<ProviderDto>>(`${this.url}/provider/${id}`);
    }

}