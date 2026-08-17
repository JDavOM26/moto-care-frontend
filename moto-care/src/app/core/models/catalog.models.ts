
export interface Area {
    id: number;
    name: string;
    description: string;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
    createdBy: number;
    updatedBy: number;
}

export interface Role {
    id: number,
    name: string,
    description: string
}

export interface Department {
    id: number,
    name: string
}

export interface Municipality {
    id: number,
    idDepartment: number,
    name: string
}

export interface Gender {
    id: number,
    name: string
}

export interface DocumentType {
    id: number,
    name: string
}

export interface Position {
    id: number,
    name: string,
    description: string
}
