import {
    Component,
    OnInit,
    Inject,
    ViewEncapsulation,
    ViewChild,
    AfterViewInit,
} from '@angular/core';
import {
    MatDialogRef,
    MAT_DIALOG_DATA,
} from '@angular/material/dialog';
import {FormGroup, FormBuilder} from '@angular/forms';
import {
    SelectionModel,
    DataSource,
    CollectionViewer,
} from '@angular/cdk/collections';
import {mineduAnimations} from '@minedu/animations/animations';
import {catchError, finalize, tap} from 'rxjs/operators';
import {DataService} from 'app/core/data/data.service';
import {MatPaginator} from '@angular/material/paginator';
import { GlobalsService } from "app/core/shared/globals.service";
import {of, Observable, BehaviorSubject} from 'rxjs';
import { isArray } from 'lodash';

@Component({
    selector: 'minedu-buscar-plaza',
    templateUrl: './buscar-plaza.component.html',
    styleUrls: ['./buscar-plaza.component.scss'],
    encapsulation: ViewEncapsulation.None,
    animations: mineduAnimations,
})
export class BuscarPlazaComponent implements OnInit, AfterViewInit {
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
    // @ViewChild(MatPaginator, {static: true})
    @ViewChild("paginatorPlaza", { static: true })
    paginator: MatPaginator;

    constructor(
        public matDialogRef: MatDialogRef<BuscarPlazaComponent>,
        @Inject(MAT_DIALOG_DATA) private data: any,
        public globals: GlobalsService,
        private formBuilder: FormBuilder,
        private dataService: DataService
    ) {
    }

    ngOnInit(): void {
        this.buildForm();
        this.buildData();
        this.dataSource = new PlazaDataSource(this.dataService, this.paginator);
        this.paginator.showFirstLastButtons = true;
        this.paginator._intl.itemsPerPageLabel = 'Registros por página';
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
        this.dataService
            .Reasignaciones()
            .getComboRegimenLaboral()
            .pipe(
                catchError((e) => { return  this.configCatch(e);        }),
                finalize(() => {
                })
            )
            .subscribe((response) => {
                if (response) {
                    this.regimenesLaborales = response;
                }
            });
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
            this.dataSource.load(this.form.value,             
                this.paginator.pageIndex + 1,
                this.globals.paginatorPageSize);
        } else {
            this.dataService.Message().msgWarning('INGRESE AL MENOS UN CRITERIO DE BÚSQUEDA.', () => {
            });
            return;
        }
    }
    
    configCatch(e: any) { 
        if (e && e.status === 400 && isArray(e.messages)) {
          this.dataService.Util().msgWarning(e.messages[0], () => { });
        } else if(isArray(e.messages)) {
                if((e.messages[0]).indexOf("HUBO UN PROBLEMA AL PROCESAR LA SOLICITUD")!=-1)
                    this.dataService.Util().msgError(e.messages[0], () => { }); 
                else
                    this.dataService.Util().msgWarning(e.messages[0], () => { }); 
                    
        }else{
            this.dataService.Util().msgError('Error recuperando datos del servidor, por favor intente dentro de unos segundos, gracias.', () => { });
        }
        this.dataService.Spinner().hide("sp6");
        return of(e) 
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
        this.dataService
            .Reasignaciones()
            .getListPlaza(data, pageIndex, pageSize)
            .pipe(
                catchError((e) => { return  this.configCatch(e);        }),
                finalize(() => this._loadingChange.next(false))
            )
            .subscribe((response: any) => {
                // debugger;
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
    configCatch(e: any) { 
        if (e && e.status === 400 && isArray(e.messages)) {
          this.dataService.Util().msgWarning(e.messages[0], () => { });
        } else if(isArray(e.messages)) {
                if((e.messages[0]).indexOf("HUBO UN PROBLEMA AL PROCESAR LA SOLICITUD")!=-1)
                    this.dataService.Util().msgError(e.messages[0], () => { }); 
                else
                    this.dataService.Util().msgWarning(e.messages[0], () => { }); 
                    
        }else{
            this.dataService.Util().msgError('Error recuperando datos del servidor, por favor intente dentro de unos segundos, gracias.', () => { });
        }
        this.dataService.Spinner().hide("sp6");
        return of(e) 
      }
}
