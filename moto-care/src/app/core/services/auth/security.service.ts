import { Injectable, signal, computed, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap, map } from 'rxjs';
import { Menu, UserSession, ApiResponse } from '@models';
import { environment } from 'src/environments/environment';



@Injectable({
    providedIn: 'root'
})

export class SecurityService {
    private readonly http = inject(HttpClient);
    private readonly _currentUser = signal<UserSession | null>(null);
    private readonly _rawMenus = signal<Menu[]>([]);

    private readonly urlLogin = environment.apiUrl;
    public readonly currentUser = this._currentUser.asReadonly();
    public readonly menus = this._rawMenus.asReadonly();

    public readonly isAuthenticated = computed(() => this._currentUser() !== null);
    public readonly userRole = computed(() => this._currentUser()?.role ?? 'GUEST');

    constructor() {
        this._loadSessionFromStorage();
    }


    public authenticate(credentials: { username: string, password: string }): Observable<{ user: UserSession, menus: Menu[] }> {
        return this.http.post<ApiResponse<string>>(`${this.urlLogin}/login`, credentials).pipe(
            map(response => {
                const tokenObj: any = response.recordset;
                const tokenStr = typeof tokenObj === 'string' ? tokenObj : tokenObj.token;

                let subUsername = credentials.username;

                let payload: any = {};
                try {
                    payload = JSON.parse(atob(tokenStr.split('.')[1]));
                    if (payload.sub) {
                        subUsername = payload.sub;
                    }
                } catch (e) { }

                let finalUsername = tokenObj.username || subUsername;
                let role = 'GUEST';
                if (payload.authorities && payload.authorities.length > 0) {
                    role = payload.authorities[0];
                }

                const user: UserSession = {
                    id: payload.id || 0,
                    username: finalUsername,
                    email: '',
                    role: role,
                    token: tokenStr,
                    idCompany: payload.idCompany,
                    idRole: payload.idRole
                };

                const menus: Menu[] = tokenObj.menu || [];

                return { user, menus };
            }),
            tap(({ user, menus }) => {
                this.login(user, menus);
            })
        );
    }


    public login(user: UserSession, menus: Menu[]): void {
        this._currentUser.set(user);
        this._rawMenus.set(menus);

        this.setCookie('moto_care_token', user.token, 1);

        const userDataToSave = { ...user, token: '' };
        localStorage.setItem('moto_care_data', JSON.stringify({ user: userDataToSave, menus }));
    }


    public logout(): void {
        this._currentUser.set(null);
        this._rawMenus.set([]);
        localStorage.removeItem('moto_care_data');
        this.deleteCookie('moto_care_token');
    }


    public updateMenus(newMenus: Menu[]): void {
        this._rawMenus.set(newMenus);

        const currentSession = localStorage.getItem('moto_care_data');
        if (currentSession) {
            const data = JSON.parse(currentSession);
            data.menus = newMenus;
            localStorage.setItem('moto_care_data', JSON.stringify(data));
        }
    }


    private _loadSessionFromStorage(): void {
        try {
            const token = this.getCookie('moto_care_token');
            const savedData = localStorage.getItem('moto_care_data');

            if (token && savedData) {
                const { user, menus } = JSON.parse(savedData);
                user.token = token;

                this._currentUser.set(user);
                this._rawMenus.set(menus || []);
            } else {
                this.logout();
            }
        } catch (error) {
            console.error('Error al parsear la sesión activa:', error);
            this.logout();
        }
    }

    private setCookie(name: string, value: string, days: number): void {
        let expires = '';
        if (days) {
            const date = new Date();
            date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
            expires = '; expires=' + date.toUTCString();
        }
        document.cookie = name + '=' + (value || '') + expires + '; path=/; SameSite=Lax';
    }

    private getCookie(name: string): string | null {
        const nameEQ = name + '=';
        const ca = document.cookie.split(';');
        for (let i = 0; i < ca.length; i++) {
            let c = ca[i];
            while (c.charAt(0) === ' ') c = c.substring(1, c.length);
            if (c.indexOf(nameEQ) === 0) return c.substring(nameEQ.length, c.length);
        }
        return null;
    }

    private deleteCookie(name: string): void {
        document.cookie = name + '=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT;';
    }
}