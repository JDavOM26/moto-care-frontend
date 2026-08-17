export interface ProviderLookup {
    id: number;
    name: string;
}

export interface ProviderDto {
    id: number;
    name: string;
    contactName: string;
    phone: string;
    email: string;
}

export interface ProviderRequestDto {
    id?: number;
    name: string;
    contactName: string;
    phone: string;
    email: string;
}