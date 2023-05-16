import { CollectionViewer, DataSource } from "@angular/cdk/collections";
import { DatePipe } from "@angular/common";
import { MatPaginator } from "@angular/material/paginator";
import { DataService } from "app/core/data/data.service";
import { ResultadoOperacionEnum } from "app/core/model/types";
import { descargarExcel } from "app/core/utility/functions";
import { BehaviorSubject, Observable, of } from "rxjs";
import { catchError, finalize } from "rxjs/operators";

export class BeneficioDataSource extends DataSource<any> {
    private _dataChange = new BehaviorSubject<any>([]);
    private _loadingChange = new BehaviorSubject<boolean>(false);

    public loading = this._loadingChange.asObservable();
    public totalRegistros = 0;

    constructor(private dataService: DataService, private _matPaginator: MatPaginator) {
        super();
        
    }

    load(queryParam: any, pageIndex, pageSize,fistTime:boolean = false): void {
        
        console.log('load table');
        this._loadingChange.next(true);
        if(!fistTime)
            this.dataService.Spinner().show("sp6");
        
        queryParam = queryParam.set('paginaActual', pageIndex);
        queryParam = queryParam.set('paginaTamanio', pageSize == undefined ? 10 : pageSize);
        this.dataService.Beneficios().searchBeneficiosPaginado(queryParam).pipe(catchError(() => of([])), finalize(() => {
            this._loadingChange.next(false);
            this.dataService.Spinner().hide("sp6");
        })).subscribe((response: any) => {
            
        console.log('response table');
            console.log(response);
            if (response) {
              this._dataChange.next(response || []);
              this.totalRegistros = (response || []).length === 0 ? 0 : response[0].totalRegistros;
              if ((response || []).length === 0) {
                if(!fistTime)
                  this.dataService.Message().msgWarning('"NO SE ENCONTRÓ INFORMACIÓN DE ACUERDO CON LOS CRITERIOS DE BÚSQUEDA INGRESADOS."', () => { });
              }
              
        console.log('fin response table');
            }
            else if (response && response.statusCode === ResultadoOperacionEnum.NotFound) {
              this.dataService.Message().msgWarning(response.messages[0], () => { });
            } else if (response && response.statusCode === ResultadoOperacionEnum.UnprocessableEntity) {
              this.dataService.Message().msgWarning(response.messages[0], () => { });
            } else {
              this.dataService.Message().msgError('OCURRIERON ALGUNOS PROBLEMAS AL OBTENER LA INFORMACIÓN.', () => { });
            }
          });
          
        console.log('fin');
    }
    exportar(data: any): void {
        this.dataService.Spinner().show("sp6");
        this.dataService.Beneficios().searchBeneficiosExportar(data).pipe(catchError(() => of([])), finalize(() => {
            this.dataService.Spinner().hide("sp6");
        })).subscribe((response: any) => {
            if (response) {
                var datePipe = new DatePipe('es-Pe');
                console.log('datePipe',datePipe);
                var date = datePipe.transform(new Date(), 'yyyy-MM-dd')
                descargarExcel(response, 'BENEFICIOS-'+date+'.xlsx');
            }
            else if (response && response.statusCode === ResultadoOperacionEnum.NotFound) {
              this.dataService.Message().msgWarning(response.messages[0], () => { });
            } else if (response && response.statusCode === ResultadoOperacionEnum.UnprocessableEntity) {
              this.dataService.Message().msgWarning(response.messages[0], () => { });
            } else {
              this.dataService.Message().msgError('OCURRIERON ALGUNOS PROBLEMAS AL OBTENER LA INFORMACIÓN.', () => { });
            }
          });
    }
    connect(collectionViewer: CollectionViewer): Observable<any[]> {
        return this._dataChange.asObservable();
    }

    disconnect(collectionViewer: CollectionViewer): void {
        this._dataChange.complete();
        this._loadingChange.complete();
    }

    get dataTotal(): any {
        return this.totalRegistros;
    }

    get data(): any {
        return this._dataChange.value || [];
    }
} 