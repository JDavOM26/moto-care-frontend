export interface StockResponseDto {
    id: number;
    idCompany: number;
    idCategory?: number;
    idSupplier?: number;
    idItem: number;
    availableQuantity: number;
    reservedQuantity: number;
    itemName?: string;
    categoryName?: string;
    sku?: string;
    salesPrice?: number;
    supplierName?: string;
    purchasePrice?: number;
    minimumStock?: number;
    maximumStock?: number;
    physicalLocation?: string;
}

export interface InventoryStatsDto {
    totalStock: number;
    lowStock: number;
    outOfStock: number;
    normal: number;
}

export interface InventoryMovementDto {
    id: number;
    movementType: 'ENTRADA' | 'SALIDA' | 'AJUSTE';
    quantity: number;
    resultingQuantity: number;
    reason: string;
    movementDate: string;
    movementUser: string;
}
