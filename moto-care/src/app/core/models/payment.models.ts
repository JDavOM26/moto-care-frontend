export interface PaymentRequest {
    id: number;
    idInvoice: number;
    reference: string;
    idPaymentMethod: number;
    amount: number;
    paymentDate: Date;
}
