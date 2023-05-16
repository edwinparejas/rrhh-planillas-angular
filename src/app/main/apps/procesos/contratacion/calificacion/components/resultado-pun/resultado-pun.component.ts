import { Component, OnInit, ViewEncapsulation, Input } from '@angular/core';
import { mineduAnimations } from '../../../../../../../../@minedu/animations/animations';
import { DataSource, CollectionViewer, SelectionModel } from '@angular/cdk/collections';
import { BehaviorSubject, Observable } from 'rxjs';

@Component({
    selector: 'minedu-resultado-pun',
    templateUrl: './resultado-pun.component.html',
    styleUrls: ['./resultado-pun.component.scss'],
    encapsulation: ViewEncapsulation.None,
    animations: mineduAnimations,
})
export class ResultadoPunComponent implements OnInit {
    dataSource: ResultadoPunDataSource | null;
    isMobile = false;
    @Input() data: any[] = [];
    @Input() puntajeTotal: number = 0;
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
        'descripcion',
        'puntaje'
    ];

    constructor() { }

    ngOnInit(): void {
        this.dataSource = new ResultadoPunDataSource();
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
        this.dataSource.load(this.data, 1, 10);
    }


}

export class ResultadoPunDataSource extends DataSource<any>{
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
