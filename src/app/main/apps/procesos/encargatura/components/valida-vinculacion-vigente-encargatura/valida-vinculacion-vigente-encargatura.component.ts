import { CollectionViewer, DataSource, SelectionModel } from "@angular/cdk/collections";
import { Component, Inject, OnInit, AfterViewInit, OnDestroy, ViewChild, ViewEncapsulation } from '@angular/core';
import { mineduAnimations } from "@minedu/animations/animations";
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { DataService } from "app/core/data/data.service";
import { catchError, finalize } from 'rxjs/operators';
import { BehaviorSubject, Observable, of } from "rxjs";
import { ENCARGATURA_MESSAGE } from "../../_utils/message";

@Component({
    selector: "minedu-valida-vinculacion-vigente-encargatura",
    templateUrl: "./valida-vinculacion-vigente-encargatura.component.html",
    styleUrls: ["./valida-vinculacion-vigente-encargatura.component.scss"],
    encapsulation: ViewEncapsulation.None,
    animations: mineduAnimations
})
export class ValidaVinculacionVigenteEncargaturaComponent implements OnInit {
    listVinculacionesVigentes: any[];
    codigoEtapa: number;
    idRegimenLaboral: number;
    servidorPublico: any;
    loading = false;
    isMobile = false;
    displayedColumns: string[] = [
        "idServidorPublico",
        "instancia",
        "subInstancia",
        "centroTrabajo",
        "modalidad",
        "nivelEducativo",
        "codigoPlaza",
        "tipoPlaza",
        "regimenLaboral",
        "condicionLaboral",
        "situacionLaboral",
        "cargo",
        "areaCurricular",
        "especialidad",
        "jornadaLaboral",
        "fechaInicio",
        "fechaFin"
    ];
    dataSource: VinculacionVigenteDataSource | null;
    selection = new SelectionModel<any>(false, []);
    request = {
        idServidorPublico: null,
        codigoEtapa: 0,
        codigoModular:'',
        idRegimenLaboral:0
    };
    paginatorPageSize = 10;
    paginatorPageIndex = 0;
    codigoModular: any;
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
        public dialogRef: MatDialogRef<ValidaVinculacionVigenteEncargaturaComponent>,
        @Inject(MAT_DIALOG_DATA) private data: any,
        private dataService: DataService
    ) {
        this.listVinculacionesVigentes = this.data.listVinculacionesVigentes;
        this.codigoEtapa = this.data.codigoEtapa;
        this.servidorPublico = this.data.servidorPublico;
        this.codigoModular=this.data.codigoModular;
        this.idRegimenLaboral=this.data.idRegimenLaboral;
    }

    ngOnInit(): void {
        this.dataSource = new VinculacionVigenteDataSource();
        this.dataSource.load(this.listVinculacionesVigentes);
    }

    handleResponsive() {
        this.isMobile = this.getIsMobile();
        window.onresize = () => {
            this.isMobile = this.getIsMobile();
        };
    }

    setRequest() {
        const idServidorPublico = this.selection.selected[0].idServidorPublico;
        const codigoEtapa = this.codigoEtapa;
        this.request = {
            idServidorPublico: idServidorPublico,
            codigoEtapa: codigoEtapa,
            codigoModular:this.codigoModular,
            idRegimenLaboral:this.idRegimenLaboral
        };
    }

    handleSeleccionar() {
        if (this.selection.selected.length == 0) {
            this.dataService.Message().msgWarning(ENCARGATURA_MESSAGE.M91, () => { });
            return;
        }
        this.setRequest();
        this.loading = true;
        this.dataService.Spinner().show("sp6");
        this.dataService.Encargatura().loadServidorPublico(this.request).pipe(catchError((error) => {
            this.dataService.Message().msgWarning('"'+error.error.messages[0].toUpperCase()+'"');
            return of(null);
        }), finalize(() => {
            this.dataService.Spinner().hide("sp6");
            this.loading = false;
        })).subscribe((result: any) => {
            if (result !== null) {
                this.dialogRef.close({event:'Select', data: this.selection.selected[0]});
            } else {
                this.dialogRef.close({event:'Select'});
            }
        });
    }

    handleCancel() {
        this.dialogRef.close({event:'Cancel'});
    }
}

export class VinculacionVigenteDataSource extends DataSource<any> {
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