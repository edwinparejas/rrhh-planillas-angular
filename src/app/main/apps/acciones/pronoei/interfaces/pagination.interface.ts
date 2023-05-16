export interface IPagination<T> {
    success?: boolean;
    page?: number;
    count?: number;
    recordsTotal?: number;
    Items?: T[];
}