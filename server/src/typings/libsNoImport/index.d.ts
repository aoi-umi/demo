type ErrorConfigType = {
    code: string;
    status?: number;
}

type ApiListQueryArgs = {
    page?: number;
    rows?: number;
    orderBy?: string;
    sortOrder?: string;
}