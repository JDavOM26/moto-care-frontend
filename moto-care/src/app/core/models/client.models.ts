export interface Client {
    idClient: number,
    firstName: string,
    lastName: string,
    documentNumber: string,
    email: string,
    phoneNumber: string,
    idDocumentType: number,
    idAddress: number,
    createdDate?: Date
}