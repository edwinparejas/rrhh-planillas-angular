import { Component, OnInit, Inject, ViewEncapsulation, OnDestroy, ViewChild, AfterViewInit } from '@angular/core';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { FormGroup, FormBuilder } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { SelectionModel, DataSource, CollectionViewer } from '@angular/cdk/collections';
import { mineduAnimations } from '@minedu/animations/animations';
import { catchError, finalize, takeUntil, filter, find } from 'rxjs/operators';
import { DataService } from 'app/core/data/data.service';
import { SharedService } from 'app/core/shared/shared.service';
import { MatPaginator } from '@angular/material/paginator';
import { Subscription, of, Observable, BehaviorSubject, Subject } from 'rxjs';
import { ResultadoOperacionEnum } from '../../_utils/constants';
import { GlobalsService } from 'app/core/shared/globals.service';
@Component({
    selector: 'minedu-buscador-servidor-publico',
    templateUrl: './buscador-servidor-publico.component.html',
    styleUrls: ['./buscador-servidor-publico.component.scss'],
    encapsulation: ViewEncapsulation.None,
    animations: mineduAnimations
})
export class BuscadorServidorPublicoComponent implements OnInit, OnDestroy, AfterViewInit {
    working: false;
    form: FormGroup;
    selectedDocu = 0;
    dataSource: ServidorPublicoDataSource | null;
    selection = new SelectionModel<any>(true, []);

    paginatorPageSize = 10;
    paginatorPageIndex = 1;
    seleccionado: any = null;

    comboLists = {
        listTipoDocumento: []
    };
    idDNI:number;
    // TODO
    request = {
        idTipoDocumentoIdentidad: 0,
        numeroDocumentoIdentidad: null,
        primerApellido: null,
        segundoApellido: null,
        nombres: null,
        idRolPassport: null,
    };
    idRolPassport: number = 1;
    displayedColumns: string[] = [
        'numeroDocumentoIdentidad',
        'primerApellido',
        'fechaNacimiento',
        'descripcionUgel',
        'centroTrabajo',
        'abreviaturaRegimenLaboral',
        'situacionLaboral',
        'estado'
    ];

    @ViewChild('paginator', { static: true }) paginator: MatPaginator;
    private _unsubscribeAll: Subject<any>;
    private sharedSubscription: Subscription;

    constructor(
        public matDialogRef: MatDialogRef<BuscadorServidorPublicoComponent>,
        @Inject(MAT_DIALOG_DATA) private data: any,
        private route: ActivatedRoute,
        private router: Router,
        private formBuilder: FormBuilder,
        private dataService: DataService,
        private dataShared: SharedService,
        public globals: GlobalsService,
        private materialDialog: MatDialog) { }

    ngAfterViewInit(): void {
       this.paginator.page.subscribe(() => this.loadData((this.paginator.pageIndex + 1).toString(), this.paginator.pageSize.toString()));
    }
    ngOnDestroy(): void {     }
    ngOnInit(): void {
        this.loadTipoDocumentoIdentidad();
        this.buildForm();
        this.dataSource = new ServidorPublicoDataSource(this.dataService);
        this.paginator.showFirstLastButtons = true;
        this.paginator._intl.itemsPerPageLabel = 'Filas por tabla';
        this.paginator._intl.nextPageLabel = 'Siguiente página';
        this.paginator._intl.previousPageLabel = 'Página anterior';
        this.paginator._intl.firstPageLabel = 'Primera página';
        this.paginator._intl.lastPageLabel = 'Última página';
       // this.paginator.pageIndex=this.paginatorPageIndex;
        //this.paginator.pageSize=this.paginatorPageSize;
        //this.paginatorPageSize = 10;
        //this.paginatorPageIndex = 1;
       
       // this.resetForm();
       // this.buscarServidorPublico();
       
    }
    loadData(pageIndex, pageSize) {
        this.setRequest();
     
        this.dataSource.load(
            this.request,
            pageIndex ,
            pageSize);
    }
    buildForm = () => {
        this.form = this.formBuilder.group({
            idTipoDocumentoIdentidad: [null],
            numeroDocumentoIdentidad: [null],
            primerApellido: [null],
            segundoApellido: [null],
            nombres: [null],
        });
    }
    loadTipoDocumentoIdentidad = () => {
        this.dataService.Ascenso().getComboTipodocumento().pipe(
            catchError(() => of([])),
            finalize(() => { })
        ).subscribe((response: any) => {
            if (response && response.result) {
                const data = response.data.map(x => ({
                    ...x,
                    value: x.idCatalogoItem,
                    label: `${x.abreviaturaCatalogoItem}`
                }));

                this.idDNI=0;
                data.forEach(x => {
                    if(x.label==='DNI' || x.label==='D.N.I.') this.idDNI=  x.value; 
                });
                this.form.controls['idTipoDocumentoIdentidad'].setValue(this.idDNI);
                this.comboLists.listTipoDocumento = data;
            }
        });
    }
    setRequest = () => {
         this.request = {
            idTipoDocumentoIdentidad: this.form.get('idTipoDocumentoIdentidad').value,
            numeroDocumentoIdentidad: this.form.get('numeroDocumentoIdentidad').value,
            primerApellido: this.form.get('primerApellido').value,
            segundoApellido: this.form.get('segundoApellido').value,
            nombres: this.form.get('nombres').value,
            idRolPassport: this.idRolPassport
        };
      }
    resetForm = () => {  
        this.form.reset(); 
        this.form.controls['idTipoDocumentoIdentidad'].setValue(this.idDNI);
    }
    cargarFiltro(): void {
        this.request = this.form.getRawValue();
    }
    buscarServidorPublico = () => {
        this.setRequest();
        if (this.request.idTipoDocumentoIdentidad === null &&
            this.request.numeroDocumentoIdentidad === null &&
            this.request.nombres === null &&
            this.request.primerApellido === null &&
            this.request.segundoApellido === null) {
            this.dataService.Message().msgWarning('Debe especificar por lo menos un criterio de búsqueda.', () => { });
        } else {
            this.dataSource = new ServidorPublicoDataSource(this.dataService);
            this.dataSource.load(this.request, (this.paginator.pageIndex + 1), this.paginatorPageSize);
        }
    }

    handleLimpiar(): void {
        this.resetForm();
    }

    handleBuscar(): void {
        this.buscarServidorPublico();
    }
 
    selectedRow(row) {
        this.selection.clear();
        this.selection.toggle(row);
        return row;
      }
 handleCancel = () => {
        this.matDialogRef.close();
    }

}

export class ServidorPublicoDataSource extends DataSource<any>{

    private _dataChange = new BehaviorSubject<any>([]);
    private _loadingChange = new BehaviorSubject<boolean>(false);

    public loading = this._loadingChange.asObservable();
    public totalregistro = 0;

    constructor(private dataService: DataService) {
        super();
    }

    load(data: any, pageIndex, pageSize): void {
       // pageIndex=1;
        console.log(pageIndex,'  -  ',pageSize);
        this._loadingChange.next(false);

        if (data.codigoModular === null && data.codigoPlaza === null && data.idRegimenLaboral === null && data.idCargo === null && data.numeroDocumentoReferencia === null) {
            this._loadingChange.next(false);
            this._dataChange.next([]);
        } else {
            this.dataService.Ascenso().getListaServidorPublico(data, pageIndex, pageSize).pipe(
                catchError((e) => of(e)),
                finalize(() => this._loadingChange.next(false))
            ).subscribe((response: any) => {

            if (response && response.result) {
                this._dataChange.next(response.data || []);
                this.totalregistro = ((response.data || []).length === 0) ? 0 : response.data[0].totalRegistro;
                if ((response.data || []).length === 0) {
                    this.dataService.Message().msgWarning('No se encontró información de la(s) servidor(es) para los criterios de búsqueda ingresados.', () => { });
                }
            }else if (response && response.statusCode === ResultadoOperacionEnum.NotFound) {
                this.dataService.Message().msgWarning(response.messages[0], () => { });
            }else if (response && response.statusCode === ResultadoOperacionEnum.UnprocessableEntity) {
                this.dataService.Message().msgWarning(response.messages[0], () => { });
            }else {
                this.dataService.Message().msgError('Ocurrieron algunos problemas al obtener la información.', () => {  });
            }
            });
        }

        this._dataChange.next(data);
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

 