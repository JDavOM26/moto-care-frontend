import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { ApiResponse, ItemCategoryLookup } from '@models';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({
    providedIn: 'root'
})
export class ItemCategoryService {

    private readonly http = inject(HttpClient);
    private readonly url = environment.apiUrl;

    getItemCategoriesLookup(search?: string): Observable<ApiResponse<ItemCategoryLookup[]>> {
        let params = new HttpParams();

        if (search && search.trim() !== '') {
            params = params.set('search', search.trim());
        }
        return this.http.get<ApiResponse<ItemCategoryLookup[]>>(`${this.url}/item-category/lookup`, { params });
    }
}
