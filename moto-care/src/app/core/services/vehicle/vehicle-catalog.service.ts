import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { ApiResponse, Brand, Color, Model } from '@models';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({
    providedIn: 'root'
})
export class VehicleCatalogService {

    private readonly http = inject(HttpClient);
    private readonly url = `${environment.apiUrl}/motorcycle/catalog`;

    public getAllColors(): Observable<ApiResponse<Color[]>> {
        return this.http.get<ApiResponse<Color[]>>(`${this.url}/colors`);
    }

    public getAllBrands(): Observable<ApiResponse<Brand[]>> {
        return this.http.get<ApiResponse<Brand[]>>(`${this.url}/brands`);
    }

    public getModelsByIdBrand(id: number): Observable<ApiResponse<Model[]>> {
        return this.http.get<ApiResponse<Model[]>>(`${this.url}/brands/${id}/models`);
    }

}
