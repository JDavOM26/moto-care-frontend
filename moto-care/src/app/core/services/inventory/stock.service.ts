import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { ApiResponse, Page } from '@models';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { InventoryStatsDto, StockResponseDto } from '../../models/stock.models';

@Injectable({
    providedIn: 'root'
})

export class StockService {

    private readonly http = inject(HttpClient);
    private readonly url = environment.apiUrl;

    public getCurrentStock(page: number, size: number, query?: string): Observable<ApiResponse<Page<StockResponseDto>>> {
        let params = new HttpParams()
            .set('page', page.toString())
            .set('size', size.toString());
        if (query) {
            params = params.set('query', query);
        }
        return this.http.get<ApiResponse<Page<StockResponseDto>>>(`${this.url}/stock`, { params });
    }

    public getStockById(id: number): Observable<ApiResponse<StockResponseDto>> {
        return this.http.get<ApiResponse<StockResponseDto>>(`${this.url}/stock/${id}`);
    }

    public createStock(stock: StockResponseDto): Observable<ApiResponse<void>> {
        return this.http.post<ApiResponse<void>>(`${this.url}/stock/create-new-item`, stock);
    }

    public updateStock(stock: StockResponseDto): Observable<ApiResponse<void>> {
        return this.http.put<ApiResponse<void>>(`${this.url}/stock/update-item-stock`, stock);
    }

    public getStats(): Observable<ApiResponse<InventoryStatsDto>> {
        return this.http.get<ApiResponse<InventoryStatsDto>>(`${this.url}/stock/stats`);
    }

    public registerTransaction(dto: any): Observable<ApiResponse<void>> {
        return this.http.post<ApiResponse<void>>(`${this.url}/stock/transactions`, dto);
    }

    public getMovements(itemId: number, page: number, size: number, type?: string): Observable<ApiResponse<Page<any>>> {
        let params = new HttpParams()
            .set('page', page.toString())
            .set('size', size.toString());
        if (type && type !== 'TODOS') {
            params = params.set('type', type);
        }
        return this.http.get<ApiResponse<Page<any>>>(`${this.url}/stock/${itemId}/movements`, { params });
    }
}