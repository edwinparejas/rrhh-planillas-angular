export function numeroFilaGrilla(index:number,paginator:any){
    return (paginator.pageSize * paginator.pageIndex)+(index+1);
}
export const pageSizeGrilla: readonly number[] = [5, 10, 20, 30, 40, 50, 100];
export const selectPageSizeDefault: number = 10;
