export function numeroFilaGrilla(index:number,paginator:any){
    return (paginator.pageSize * paginator.pageIndex)+(index+1);
}
