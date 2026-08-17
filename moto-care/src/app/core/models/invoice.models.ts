
export interface InvoiceRequest {
    idOrder?: number;
    invoiceNumber?: string;
    idMethodPayment?: number;
    paymentReference?: string;
    amountReceived?: number;
    note?: string;
}

export interface Invoice {
    id: number;
    idOrder: number;
    invoiceNumber: string;
    idInvoiceStatus: number;
    idCompany: number;
    subtotal: number;
    iva: number;
    total: number;
    emissionDate: Date;
}
