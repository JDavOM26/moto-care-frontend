import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { ApiResponse, Page, PageableRequest } from '@models';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

export interface UserDto {
  id?: number;
  username?: string;
  firstName?: string;
  lastName?: string;
  role?: string;
  status?: string;
  email?: string;
  createdDate?: Date;
}

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private readonly http = inject(HttpClient);
  // Se asume que el endpoint es /employees basado en el backend, o /users si se actualiza.
  private readonly url = `${environment.apiUrl}/employees`;

  public getAllUsers(pageable?: PageableRequest): Observable<ApiResponse<Page<UserDto>>> {
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
    return this.http.get<ApiResponse<Page<UserDto>>>(`${this.url}`, { params });
  }

  public createUser(user: any): Observable<ApiResponse<any>> {
    return this.http.post<ApiResponse<any>>(`${this.url}`, user);
  }

  public updateUser(id: number, user: any): Observable<ApiResponse<any>> {
    return this.http.put<ApiResponse<any>>(`${this.url}/${id}`, user);
  }

  public toggleUserStatus(id: number): Observable<ApiResponse<any>> {
    return this.http.patch<ApiResponse<any>>(`${this.url}/${id}`, null);
  }
}
