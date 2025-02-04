export interface ResData<T> {
    data: T,
    extra: {
        now: number;
    },
    status_code: number;
}