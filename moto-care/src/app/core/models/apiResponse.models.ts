
export interface ApiResponse<T = any> {
    code: number;
    msg: string;
    recordset: T;
    type: string;
}


export interface PageableRequest {
    page: number;
    size: number;
    sort?: string[];
}

export interface Page<T> {
    content: T[];
    pageable: {
        pageNumber: number;
        pageSize: number;
        offset: number;
        paged: boolean;
        unpaged: boolean;
    };
    last: boolean;
    totalPages: number;
    totalElements: number;
    size: number;
    number: number;
    first: boolean;
    numberOfElements: number;
    empty: boolean;
}
