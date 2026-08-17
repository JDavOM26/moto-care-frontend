export interface BillingElement {
    id?: number;
    idCompany?: number
    name: string;
    salePrice: number;
    isService: boolean;
    createdAt?: Date;
    updatedAt?: Date;
    createdBy?: number;
    updatedBy?: number;
}

