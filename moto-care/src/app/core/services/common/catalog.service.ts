import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { ApiResponse, Area, Department, Gender, Municipality, Position, Role } from '@models';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({
    providedIn: 'root'
})

export class CatalogService {

    private readonly http = inject(HttpClient);
    private readonly url = environment.apiUrl;

    public getAreas(): Observable<ApiResponse<Area[]>> {
        return this.http.get<ApiResponse<Area[]>>(`${this.url}/areas`);
    }

    public getDepartments(): Observable<ApiResponse<Department[]>> {
        return this.http.get<ApiResponse<Department[]>>(`${this.url}/departments`);
    }

    public getMunicipalities(idDepartment: number): Observable<ApiResponse<Municipality[]>> {
        return this.http.get<ApiResponse<Municipality[]>>(`${this.url}/municipalities/${idDepartment}`);
    }

    public getGenders(): Observable<ApiResponse<Gender[]>> {
        return this.http.get<ApiResponse<Gender[]>>(`${this.url}/genders`);
    }

    public getDocumentTypes(): Observable<ApiResponse<DocumentType[]>> {
        return this.http.get<ApiResponse<DocumentType[]>>(`${this.url}/documentTypes`);
    }

    public getPositions(): Observable<ApiResponse<Position[]>> {
        return this.http.get<ApiResponse<Position[]>>(`${this.url}/positions`);
    }

    public getRoles(): Observable<ApiResponse<Role[]>> {
        return this.http.get<ApiResponse<Role[]>>(`${this.url}/roles`);
    }
}