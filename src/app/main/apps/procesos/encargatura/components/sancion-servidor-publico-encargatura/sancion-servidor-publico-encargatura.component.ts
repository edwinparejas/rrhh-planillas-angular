import { CollectionViewer, DataSource } from "@angular/cdk/collections";
import { Component, Inject, OnInit, ViewEncapsulation } from "@angular/core";
import { MatDialogRef, MAT_DIALOG_DATA } from "@angular/material/dialog";
import { mineduAnimations } from "@minedu/animations/animations";
import { BehaviorSubject, Observable } from "rxjs";

@Component({
    selector: "minedu-sancion-servidor-publico-encargatura",
    templateUrl: "./sancion-servidor-publico-encargatura.component.html",
    styleUrls: ["./sancion-servidor-publico-encargatura.component.scss"],
    encapsulation: ViewEncapsulation.None,
    animations: mineduAnimations
})
export class SancionServidorPublicoEncargaturaComponent implements OnInit {
    listSancionesAdministrativas: any[];
    servidorPublico: any;
    isMobile = false;
    displayedColumns: string[] = [
        "rowNum",
        "tipoSancion",
        "resolucion",
        "fechaInicio",
        "fechaFin",
        "dias",
        "estado"
    ];
    dataSource: SancionServidorPublicoDataSource | null;
    getIsMobile(): boolean {
        const w = document.documentElement.clientWidth;
        const breakpoint = 992;
        if (w < breakpoint) {
            return true;
        } else {
            return false;
        }
    }
    constructor(
        public dialogRef: MatDialogRef<SancionServidorPublicoEncargaturaComponent>,
        @Inject(MAT_DIALOG_DATA) private data: any
    ) {
        this.listSancionesAdministrativas = this.data.listSancionesAdministrativas;
        this.servidorPublico = this.data.servidorPublico;
    }

    ngOnInit(): void {
        this.dataSource = new SancionServidorPublicoDataSource();
        this.dataSource.load(this.listSancionesAdministrativas);
    }

    handleResponsive() {
        this.isMobile = this.getIsMobile();
        window.onresize = () => {
            this.isMobile = this.getIsMobile();
        };
    }

    handleCancel() {
        this.dialogRef.close();
    }
}

export class SancionServidorPublicoDataSource extends DataSource<any> {
    private _dataChange = new BehaviorSubject<any>([]);
    private _loadingChange = new BehaviorSubject<boolean>(false);

    public loading = this._loadingChange.asObservable();

    constructor() {
        super();
    }

    load(data: any): void {
        this._loadingChange.next(false);
        this._dataChange.next(data || []);
    }

    connect(collectionViewer: CollectionViewer): Observable<any[]> {
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