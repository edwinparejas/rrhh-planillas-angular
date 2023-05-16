import { CollectionViewer, DataSource } from "@angular/cdk/collections";
import { MatPaginator } from "@angular/material/paginator";
import { DataService } from "app/core/data/data.service";
import { ResultadoOperacionEnum } from "app/core/model/types";
import { BehaviorSubject, Observable, of } from "rxjs";
import { catchError, finalize } from "rxjs/operators";

export class BonificacionFamiliarAnularDataSource extends DataSource<any> {
    private _dataChange = new BehaviorSubject<any>([]);
    private _loadingChange = new BehaviorSubject<boolean>(false);

    public loading = this._loadingChange.asObservable();
    public totalRegistros = 0;

    constructor(private dataService: DataService, private _matPaginator: MatPaginator) {
        super();
    }

    load(data: any, pageIndex, pageSize,fistTime:boolean = false): void {
        
        console.log('load table',data);
        this._loadingChange.next(false);
        this._dataChange.next(data || []);
        this.totalRegistros = (data || []).length === 0 ? 0 : data[0].totalRegistros;
        
        console.log('this._dataChange.value',this._dataChange.value);
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
    obtenerDataSource(): any {
        
        return this._dataChange.value || [];
    }
} 