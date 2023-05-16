import { DataSource, CollectionViewer } from "@angular/cdk/collections";
import { DataService } from "app/core/data/data.service";
import { BehaviorSubject, of, Observable } from "rxjs";
import { catchError, finalize } from "rxjs/operators";
import { CodigoDreUgelService } from "../../../services/codigo-dre-ugel.service";



export class GestionPronoeiDataSource extends DataSource<any>{

    private _dataChange = new BehaviorSubject<any>([]);
    private _loadingChange = new BehaviorSubject<boolean>(false);
    private _totalRows = 0;

    public loading = this._loadingChange.asObservable();

    constructor(private dataService: DataService) {
        super();
    }

    load(data: any, pageIndex: number, pageSize: number) {
        data.paginaActual = pageIndex;
        data.tamanioPagina = pageSize;
        if (data.tamanioPagina && data.paginaActual) {
            this._loadingChange.next(true);
            this.getDataFromService(data);
        }
    }


    private async getDataFromService(data: any) {
        
        var response = await this.dataService
            .AccionesVinculacion()
            .getGestionPronoeiPaginado(data)
            .pipe(catchError(() => of([])),
                finalize(() => this._loadingChange.next(false))
            ).toPromise();

        if (response) {
            this._totalRows = (response[0] || [{ total: 0 }]).total;
            this._dataChange.next(response || []);

            if ((response || []).length === 0) {
                if (data?.searchByButton) {
                    this.dataService
                        .Message()
                        .msgWarning(
                            '"NO SE ENCONTRÓ INFORMACIÓN PARA LOS CRITERIOS DE BÚSQUEDA INGRESADOS."',
                            () => { }
                        );
                }
            }

        } else {
            this._totalRows = 0;
            this._dataChange.next([]);
        }
    }

    connect(collectionViewer: CollectionViewer): Observable<[]> {
        return this._dataChange.asObservable();
    }

    disconnect(collectionViewer: CollectionViewer): void {
        this._dataChange.complete();
        this._loadingChange.complete();
    }

    get dataTotal(): any {
        return this._totalRows;
    }
    get data(): any {
        return this._dataChange.value || [];
    }
}