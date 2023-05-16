import { CollectionViewer, DataSource } from "@angular/cdk/collections";
import { Component, Inject, OnInit, AfterViewInit, OnDestroy, ViewChild, ViewEncapsulation} from '@angular/core';
import { mineduAnimations } from "@minedu/animations/animations";
import { FormBuilder, FormGroup, Validators} from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef} from '@angular/material/dialog';
import { DataService } from "app/core/data/data.service";
import { catchError, finalize} from 'rxjs/operators';
import { BehaviorSubject, Observable, of } from "rxjs";

import { MatPaginator } from "@angular/material/paginator";
import { ActivatedRoute, Router } from "@angular/router";
import { SharedService } from "app/core/shared/shared.service";
import { saveAs } from "file-saver";
import {MatDialog} from '@angular/material/dialog';

@Component({
    selector: "minedu-valida-encargatura-ratificada-encargatura",
    templateUrl: "./valida-encargatura-ratificada-encargatura.component.html",
    styleUrls: ["./valida-encargatura-ratificada-encargatura.component.scss"],
    encapsulation: ViewEncapsulation.None,
    animations: mineduAnimations
})
export class ValidaEncargaturaRatificadaEncargaturaComponent implements OnInit {
    idCalificacion: number;
    form: FormGroup;
    loading = false;
    isMobile = false;
    displayedColumns: string[] = [
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
    dataSource: EncargaduraRatificadaDataSource | null;
    paginatorPageSize = 10;
    paginatorPageIndex = 0;
    getIsMobile(): boolean {
        const w = document.documentElement.clientWidth;
        const breakpoint = 992;
        if (w < breakpoint) {
            return true;
        } else {
            return false;
        }
    }
    request = {
        idTipoDocumento: null,
        numDocumento: null,
    };
    constructor(
        public dialogRef: MatDialogRef<ValidaEncargaturaRatificadaEncargaturaComponent>,
        @Inject(MAT_DIALOG_DATA) private data: any,
        private formBuilder: FormBuilder,
        private dataService: DataService
    ) {
        this.idCalificacion = data.idCalificacion
    }

    ngOnInit(): void {
        this.buildForm();
        this.dataSource = new EncargaduraRatificadaDataSource(this.dataService);
    }

    handleResponsive() {
        this.isMobile = this.getIsMobile();
        window.onresize = () => {
            this.isMobile = this.getIsMobile();
        };
    }

    buildForm() {
        this.form = this.formBuilder.group({
            idMotivoObservacion: [null, Validators.required],
            anotacionesObservacion: [null, [Validators.required, Validators.maxLength(4000)]]
        });
    }
}
export class EncargaduraRatificadaDataSource extends DataSource<any> {
    private _dataChange = new BehaviorSubject<any>([]);
    private _loadingChange = new BehaviorSubject<boolean>(false);

    public loading = this._loadingChange.asObservable();
    public totalRegistros = 0;

    constructor(private dataService: DataService) {
        super();
    }

    load(data: any, firstTime = false) : void {
        this._loadingChange.next(false);
        if (!firstTime) {
            this.dataService.Spinner().show("sp6");
        }
        console.log(data);
        this.dataService.Encargatura().searchVinculacionVigenteEncargatura(data).pipe(catchError(() => of([])), finalize(() => {
            this._loadingChange.next(false);
            if (!firstTime) {
                this.dataService.Spinner().hide("sp6");
            }
        })).subscribe((result: any) => {
            console.log(result);
            this._dataChange.next(result || []);
            this.totalRegistros = (result || []).length === 0 ? 0 : result[0].totalRegistros;
            console.log(this.totalRegistros);
            if ((result || []).length === 0) {
                this.dataService.Message().msgWarning('"NO SE ENCONTRÓ INFORMACIÓN DE POSTULANTES PARA LOS CRITERIOS DE BÚSQUEDA INGRESADOS."', () => {});
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
    
    handleCancel() {
       // this.dialogRef.close();
    }
} 