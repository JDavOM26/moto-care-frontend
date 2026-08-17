import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { ApiResponse, ReceptionRequest } from '@models';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({
    providedIn: 'root'
})

export class ReceptionService {

    private readonly http = inject(HttpClient);
    private readonly url = environment.apiUrl;

    public receiveVehicle(reception: ReceptionRequest): Observable<ApiResponse<number>> {
        return this.http.post<ApiResponse<number>>(`${this.url}/receptions`, reception);
    }

}