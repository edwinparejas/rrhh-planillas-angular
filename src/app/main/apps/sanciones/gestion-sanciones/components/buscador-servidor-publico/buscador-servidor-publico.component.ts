import { Component, OnInit, Inject, ViewEncapsulation, OnDestroy, ViewChild, AfterViewInit } from '@angular/core';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { SelectionModel, DataSource, CollectionViewer } from '@angular/cdk/collections';
import { mineduAnimations } from '@minedu/animations/animations';
import { catchError, finalize, takeUntil, filter, find } from 'rxjs/operators';
import { DataService } from 'app/core/data/data.service';
import { SharedService } from 'app/core/shared/shared.service';
// import { GlobalsService } from 'app/core/shared/globals.service';

import { MatPaginator } from '@angular/material/paginator';
import { Subscription, of, Observable, BehaviorSubject, Subject } from 'rxjs';
import { SecurityModel } from '../../../../../../core/model/security/security.model';
import { CentroTrabajoModel } from '../../../../../../core/model/centro-trabajo.model';
import { GlobalsService } from 'app/core/shared/globals.service';
import { ResultadoOperacionEnum} from '../../../_utils/constants';
   

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
    idDNI:number;
    dataSource: ServidorPublicoDataSource | null;
    selection = new SelectionModel<any>(true, []);
    currentSession: SecurityModel = new SecurityModel();
    centroTrabajo: CentroTrabajoModel = null;
    seleccionado: any = null;
    paginatorPageSize = 5;
    paginatorPageIndex = 1;
    comboLists = {
        listTipoDocumento: []
    };

    // TODO
    request = {
        codigoSede: null,
        codigoTipoSede:null,
        codigoRolPassport:null,
        idTipoDocumentoIdentidad: null,
        numeroDocumentoIdentidad: null,
        primerApellido: null,
        segundoApellido: null,
        nombres: null
    };

    displayedColumns: string[] = [
        'numeroDocumentoIdentidadCompleto',
        'nombreCompleto',
        'fechaNacimiento',
        'descripcionUgel',
        'centroTrabajo',
        'abreviaturaRegimenLaboral',
        'situacionLaboral'
    ];

    @ViewChild('paginator', { static: true }) paginator: MatPaginator;
    private _unsubscribeAll: Subject<any>;
    private sharedSubscription: Subscription;

    isMobile = false;
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
        public matDialogRef: MatDialogRef<BuscadorServidorPublicoComponent>,
        @Inject(MAT_DIALOG_DATA) private data: any,
        private route: ActivatedRoute,
        private router: Router,
        private formBuilder: FormBuilder,
        private dataService: DataService,
        private dataShared: SharedService,
        public globals: GlobalsService,
        private materialDialog: MatDialog) {
            this._unsubscribeAll = new Subject();
         }

    ngAfterViewInit(): void {
        this.paginator.page.subscribe(() => this.loadData((this.paginator.pageIndex + 1).toString(), this.paginator.pageSize.toString()));
    }

    ngOnDestroy(): void {
    }

    ngOnInit(): void {
        this.buildForm();
        this.buildSeguridad();
        this.handleResponsive();
        this.loadTipoDocumentoIdentidad();
      //  this.loadCentroTrabajo();
      /*
        this.dataSource = new ServidorPublicoDataSource(this.dataService);
        this.paginator.showFirstLastButtons = true;
        this.paginator._intl.itemsPerPageLabel = 'Filas por tabla';
        this.paginator._intl.nextPageLabel = 'Siguiente página';
        this.paginator._intl.previousPageLabel = 'Página anterior';
        this.paginator._intl.firstPageLabel = 'Primera página';
        this.paginator._intl.lastPageLabel = 'Última página';
*/
        //this.buscarServidorPublico();
    }

    buildSeguridad = () => {
        this.currentSession = this.dataService.Storage().getInformacionUsuario();

         this.globals.PASSPORT_CODIGO_SEDE=this.currentSession.codigoSede;
         this.globals.PASSPORT_CODIGO_TIPO_SEDE=this.currentSession.codigoTipoSede;
         this.globals.PASSPORT_CODIGO_PASSPORT=this.currentSession.idRol.toString();

    }

    loadCentroTrabajo = () => {
        const codigoCentroTrabajo = this.currentSession.codigoSede;
        this.dataService
            .Licencias()
            .getCentroTrabajoByCodigo(codigoCentroTrabajo, true)
            .pipe(
                catchError(() => of([])),
                finalize(() => { })
            )
            .subscribe((response: any) => {
                if (response && response.result) {
                    this.centroTrabajo = response.data;
                }
            });
    }

    handleResponsive(): void {
        this.isMobile = this.getIsMobile();
        window.onresize = () => {
            this.isMobile = this.getIsMobile();
        };
    }

    loadData(pageIndex, pageSize) {
        this.request = {
            codigoSede: this.globals.PASSPORT_CODIGO_SEDE,
            codigoTipoSede:this.globals.PASSPORT_CODIGO_TIPO_SEDE,
            codigoRolPassport: this.globals.PASSPORT_CODIGO_PASSPORT,
            idTipoDocumentoIdentidad: this.form.get('idTipoDocumentoIdentidad').value,
            numeroDocumentoIdentidad: this.form.get('numeroDocumentoIdentidad').value,
            primerApellido: this.form.get('primerApellido').value,
            segundoApellido: this.form.get('segundoApellido').value,
            nombres: this.form.get('nombres').value
        };
        this.dataSource.load(this.request,  pageIndex, pageSize);
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
        this.dataService.Sanciones().getComboTiposDocumento().pipe(
            catchError(() => of([])),
            finalize(() => { })
        ).subscribe((response: any) => {
            if (response && response.result) {
                const data = response.data.map(x => ({
                    ...x,
                    value: x.idCatalogoItem,
                    label: `${x.descripcionCatalogoItem}`
                }));
                this.idDNI=0;
                    data.forEach(x => {
                        if(x.label==='DNI' || x.label==='D.N.I.') this.idDNI=  x.value; 
                    });
                    this.form.get('idTipoDocumentoIdentidad').setValue(this.idDNI);
                this.comboLists.listTipoDocumento = data;
            }
        });
    }

    cargarFiltro(): void {
        this.request = this.form.getRawValue();
    }

    buscarServidorPublico = () => {
        this.cargarFiltro();
       this.request.codigoSede= this.globals.PASSPORT_CODIGO_SEDE,//this.currentSession.codigoSede;
        this.request.codigoTipoSede= this.globals.PASSPORT_CODIGO_TIPO_SEDE,// this.currentSession.codigoTipoSede;
        this.request.codigoRolPassport=this.globals.PASSPORT_CODIGO_TIPO_SEDE// this.currentSession.codigoRol;
        
    /*     if (this.request.idTipoDocumentoIdentidad != null && this.request.numeroDocumentoIdentidad == null) {
            this.dataService.Message().msgWarning('Debe ingresar Número de documento.', () => { });
            return;
        }

        if (this.request.idTipoDocumentoIdentidad == null && this.request.numeroDocumentoIdentidad != null) {
            this.dataService.Message().msgWarning('Debe ingresar Tipo de documento.', () => { });
            return;
        }
*/
     /*   if (this.request.idTipoDocumentoIdentidad === null &&
            this.request.numeroDocumentoIdentidad === null &&
            this.request.nombres === null &&
            this.request.primerApellido === null &&
            this.request.segundoApellido === null) {
            this.dataService.Message().msgWarning('Debe especificar por lo menos un criterio de búsqueda.', () => { });
        } else {
            */
            this.dataSource = new ServidorPublicoDataSource(this.dataService);
            this.dataSource.load(this.request, (this.paginator.pageIndex + 1), this.paginatorPageSize);
      //  }
    }

    handleLimpiar(): void {
        this.form.reset();
        this.form.get('idTipoDocumentoIdentidad').setValue(this.idDNI);
    }

    handleBuscar(): void {
        this.buscarServidorPublico();
    }

    onSelect(selected: any): void {
        this.selection.clear();
        this.selection.toggle(selected);
        this.seleccionado = selected;
        // TODO:
        // this.dataShared.sendDataSharedBuscarDocumento({ registro: selected });

    }
     selectedRow(row) {
        this.selection.clear();
        this.selection.toggle(row);
        return row;
      }
    handleSelect = (form) => {
        if (this.seleccionado === null) {
            this.dataService.Message().msgWarning('Debe seleccionar un registro.', () => { });
        } else {
            this.matDialogRef.close({ servidorPublico: this.seleccionado });
        }
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
        this._loadingChange.next(false);

       /* if (data.codigoModular === null && data.codigoPlaza === null && data.idRegimenLaboral === null && data.idCargo === null && data.numeroDocumentoReferencia === null) {
            this._loadingChange.next(false);
            this._dataChange.next([]);
        } else {
            */
            this.dataService.Sanciones().getListaServidorPublico(data, pageIndex, pageSize).pipe(
                catchError((e) => of(e)),
                finalize(() => this._loadingChange.next(false))
            ).subscribe((response: any) => {
                this._dataChange.next(response.data || []);
                this.totalregistro = ((response.data || []).length === 0) ? 0 : response.data[0].totalRegistro;
                if ((response.data || []).length === 0) {
                    this.dataService.Message().msgWarning('No se encontró información de la(s) servidor(es) para los criterios de búsqueda ingresados.', () => { });
                }
                
                if (response && response.result) {
 
                } else if (response && response.statusCode === ResultadoOperacionEnum.NotFound) {
                    this.dataService.Message().msgWarning(response.messages[0], () => { });
                } else if (response && response.statusCode === ResultadoOperacionEnum.UnprocessableEntity) {
                    this.dataService.Message().msgWarning(response.messages[0], () => { });
                } else {
                    this.dataService.Message().msgError('Ocurrieron algunos problemas al consultar la información, por favor intente dentro de unos segundos, gracias.', () => { });
                }                                
                 
            });
       //s }

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

