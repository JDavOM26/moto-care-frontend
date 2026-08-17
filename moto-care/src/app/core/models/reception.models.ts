import { Client } from "./client.models";
import { Motorcycle } from "./motorcycle.models";

export interface ReceptionRequest {
    mileage: number;
    initialDiagnosis: string;
    promisedDate: Date;
    client: Client;
    motorcycle: Motorcycle;
}

export interface ReceptionStatsDto {
    vehiclesInWorkshop: number;
    receptionsToday: number;
    pendingDiagnosis: number;
    promisedToday: number;
}

export interface WorkOrderProjection {
    id: number;
    plate: string;
    motorcycleModel: string;
    color: string;
    mileageEntry: number;
    customerName: string;
    technicianName: string;
    idStatus: number;
    statusName: string;
    statusColor: string;
    promisedDate: Date;
    createdDate: Date;
    clientDiagnosis: string;
}


export interface WorkOrderDetails {
    id?: number;
    idOrder?: number;
    idItem?: number;
    quantity?: number;
    amount?: number;
    unitPrice: number;
    subtotal?: number;
    description?: string;
    observation?: string;
    itemType?: string;
}

export interface WorkOrderStatusHistoryDto {
    id: number;
    idCompany: number;
    idWorkOrder: number;
    idPreviousState: number;
    idNewState: number;
    idEmployee: number;
    observation: string;
    createdDate: Date;
    previousStateName?: string;
    newStateName?: string;
    employeeName?: string;
}