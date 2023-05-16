import { Component, OnInit, Input, ViewEncapsulation } from '@angular/core';
import { SelectionModel, CollectionViewer } from '@angular/cdk/collections';
import { DataSource } from '@angular/cdk/table';
import { BehaviorSubject, Observable } from 'rxjs';
import { mineduAnimations } from '../../../../../../../../@minedu/animations/animations';

@Component({
    selector: 'minedu-requisito-minimo',
    templateUrl: './requisito-minimo.component.html',
    styleUrls: ['./requisito-minimo.component.scss'],
    encapsulation: ViewEncapsulation.None,
    animations: mineduAnimations,
})
export class RequisitoMinimoComponent implements OnInit {
    dataSource: RequisitoMinimoDataSource | null;
    isMobile = false;
    @Input() data: any[] = [];
    @Input() soloLectura: boolean;
    getIsMobile(): boolean {
        const w = document.documentElement.clientWidth;
        const breakpoint = 992;
        if (w < breakpoint) {
            return true;
        } else {
            return false;
        }
    }
    selection = new SelectionModel<any>(true, []);
    displayedColumns: string[] = [
        'registro',
        'descripcion',
        'acreditaDocumento'
    ];
    constructor() { }

    ngOnInit(): void {
        this.dataSource = new RequisitoMinimoDataSource();
        this.handleResponsive();
        this.dataSource.load(this.data, 1, 20);
    }

    handleResponsive(): void {
        this.isMobile = this.getIsMobile();
        window.onresize = () => {
            this.isMobile = this.getIsMobile();
        };
    }

    actualizarLista = (data: any[]) => {
        this.data = data;
        this.dataSource.load(this.data, 1, 20);
    }

    calcularPuntajeFinal = (row) => {
        if (row.acreditaDocumento === true) {
            row.puntajeFinal = 1;
        } else {
            row.puntajeFinal = 0;
        }
    }

}

export class RequisitoMinimoDataSource extends DataSource<any>{
    private _dataChange = new BehaviorSubject<any>([]);
    private _loadingChange = new BehaviorSubject<boolean>(false);

    public loading = this._loadingChange.asObservable();
    public totalregistro = 0;

    constructor() {
        super();
    }

    load(data: any, pageIndex, pageSize): void {
        this._loadingChange.next(false);
        // this._dataChange.next(data);
        this._dataChange.next(data || []);
        this.totalregistro = 0;
    }

    connect(collectionViewer: CollectionViewer): Observable<[]> {
        return this._dataChange.asObservable();
    }

    disconnect(collectionViewer: CollectionViewer): void {
        this._dataChange.complete();
        this._loadingChange.complete();
    }

    get data(): any {
        return this._dataChange.value || [];
    }
}
