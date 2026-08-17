export interface UserSession {
    id: number;
    username: string;
    email: string;
    role: string;
    token: string;
    idCompany?: number;
    idRole?: number;
}