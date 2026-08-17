import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { ApiResponse, FinancialDashboardDto, PerformanceDashboardDto } from '@models';

@Injectable({
  providedIn: 'root'
})
export class DashboardService {
  private readonly http = inject(HttpClient);
  private readonly url = `${environment.apiUrl}/dashboard`;

  public getFinancialDashboard(year: number): Observable<ApiResponse<FinancialDashboardDto>> {
    let params = new HttpParams().set('year', year.toString());
    return this.http.get<ApiResponse<FinancialDashboardDto>>(`${this.url}/financial`, { params });
  }

  public getPerformanceDashboard(): Observable<ApiResponse<PerformanceDashboardDto>> {
    return this.http.get<ApiResponse<PerformanceDashboardDto>>(`${this.url}/performance`);
  }
}
