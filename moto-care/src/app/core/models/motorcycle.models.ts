export interface Motorcycle {
    id: number;
    licensePlate: string;
    vinChasis: string;
    engineNumber: string;
    modelId: number;
    colorId: number;
    brandId?: number;
    brandName?: string;
    modelName?: string;
    modelYear?: number;
}


/* --- Models for Motorcycle Catalog --- */
export interface Brand {
    id: number;
    name: string;
}

export interface Color {
    id: number;
    name: string;
    hexCode: string;
}

export interface Model {
    id: number;
    name: string;
    year: number;
    idBrand: number;
}