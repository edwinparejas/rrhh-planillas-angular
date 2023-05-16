import {    Component,    OnInit,    Inject,    ViewEncapsulation,    OnDestroy,    ViewChild,    AfterViewInit,} from "@angular/core";
import {    MatDialog,    MatDialogRef,    MAT_DIALOG_DATA,} from "@angular/material/dialog";
import { FormGroup, FormBuilder, Validators } from "@angular/forms";
import {    SelectionModel,    DataSource,    CollectionViewer,} from '@angular/cdk/collections';
//import { servidorPublicoAnimations } from '@servidorpublico/animations';
import { mineduAnimations } from "@minedu/animations/animations";

import {catchError, finalize, tap} from 'rxjs/operators';
import {DataService} from 'app/core/data/data.service';
import {MatPaginator} from '@angular/material/paginator';
import { Subscription, BehaviorSubject, of, Observable, Subject } from "rxjs";
//import { CuadroHorasProcesoService } from "app/core/data/services/cuadro-horas-proceso.service";
//import { Global } from "app/core/data/services/global";
import { HttpErrorResponse } from '@angular/common/http';

@Component({
    selector: 'minedu-busqueda-plaza',
    templateUrl: './busqueda-plaza.component.html',
    styleUrls: ['./busqueda-plaza.component.scss'],
    encapsulation: ViewEncapsulation.None,
    animations: mineduAnimations,
})
export class BusquedaPlazaComponent implements OnInit, AfterViewInit {
    form: FormGroup;

    regimenesLaborales: any[] = [];

    displayedColumns: string[] = [
        'codigoPlaza',
        'codigoCentroTrabajo',
        'anexoCentroTrabajo',
        'centroTrabajo',
        'modalidad',
        'nivelEducativo',
        'regimenLaboral',
        'cargo',
        "jornadaLaboral",
        'motivoVacancia',
        'tipoPlaza',
    ];

    dataSource: PlazaDataSource | null;
    selection = new SelectionModel<any>(false, []);
    @ViewChild(MatPaginator, {static: true})
    paginator: MatPaginator;

    constructor(
        public matDialogRef: MatDialogRef<BusquedaPlazaComponent>,
        @Inject(MAT_DIALOG_DATA) private data: any,
        private formBuilder: FormBuilder,
        private dataService: DataService,
       // private cuadroHoraProcesoService: CuadroHorasProcesoService
    ) {
    }

    ngOnInit(): void {
        this.buildForm();
        this.buildData();
        this.dataSource = new PlazaDataSource(this.dataService, this.paginator);
        this.paginator.showFirstLastButtons = true;
        this.paginator._intl.itemsPerPageLabel = 'Filas por tabla';
        this.paginator._intl.nextPageLabel = 'Siguiente página';
        this.paginator._intl.previousPageLabel = 'Página anterior';
        this.paginator._intl.firstPageLabel = 'Primera página';
        this.paginator._intl.lastPageLabel = 'Última página';
    }

    buildForm() {
        this.form = this.formBuilder.group({
            codigoPlaza: [null],
            centroTrabajo: [null],
            codigoCentroTrabajo: [null],
            idRegimenLaboral: [null],
        });
    }

    buildData() {
        this.dataService.CuadroHoras()
            .getComboRegimenLaboral()
            .pipe(
                catchError((e) => {
                    return of(null);
                }),
                finalize(() => {
                })
            )
            .subscribe((response) => {
                if (response) {
                    this.regimenesLaborales = response;
                }
            }),(error: HttpErrorResponse) => {
                console.log(error);
                this.dataService.Util().msgError("OCURRIÓ UN ERROR AL REALIZAR ESTA OPERACIÓN.OBTENER PARAMETROS INICIALES");
              };
    }

    ngAfterViewInit() {
        this.paginator.page.pipe(tap(() => this.loadPlaza())).subscribe();
    }

    loadPlaza() {
        this.dataSource.load(
            this.form.value,
            this.paginator.pageIndex + 1,
            this.paginator.pageSize
        );
    }

    selectedRow(row) {
        this.selection.clear();
        this.selection.toggle(row);
        return row;
    }

    limpiar() {
        this.form.patchValue({
            codigoPlaza: null,
            centroTrabajo: null,
            codigoCentroTrabajo: null,
            idRegimenLaboral: null,
        });
    }

    buscar() {
        const form = this.form.value;
        if (
            form.codigoPlaza ||
            form.centroTrabajo ||
            form.codigoCentroTrabajo ||
            form.idRegimenLaboral
        ) {
            this.dataSource.load(this.form.value, 1, 10);
        } else {
            this.dataService.Util().msgWarning('INGRESE AL MENOS UN CRITERIO DE BÚSQUEDA.', () => {
            });
            return;
        }
    }
}

export class PlazaDataSource extends DataSource<any> {
    private _dataChange = new BehaviorSubject<any>([]);
    private _loadingChange = new BehaviorSubject<boolean>(false);
    private _totalRows = 0;

    public loading = this._loadingChange.asObservable();

    constructor(
        private dataService: DataService,
        private _matPaginator: MatPaginator
    ) {
        super();
    }

    load(data: any, pageIndex: number, pageSize: number) {
        this._loadingChange.next(true);
        this.dataService.CuadroHoras()
            .getListPlaza(data, pageIndex, pageSize)
            .pipe(
                catchError((e) => {
                    return of(null);
                }),
                finalize(() => this._loadingChange.next(false))
            )
            .subscribe((response: any) => {
                if (response) {
                    this._totalRows = (response[0] || [{total: 0}]).total;
                    this._dataChange.next(response);
                } else {
                    this._totalRows = 0;
                    this._dataChange.next([]);
                }
            });
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
