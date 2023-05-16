import { CollectionViewer, DataSource, SelectionModel } from '@angular/cdk/collections';
import { AfterViewInit, Component, OnDestroy, OnInit, ViewChild, ViewEncapsulation, ɵConsole } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { ActivatedRoute, Router } from '@angular/router';
import { mineduAnimations } from '@minedu/animations/animations';
import { DataService } from 'app/core/data/data.service';
import { SharedService } from 'app/core/shared/shared.service';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { catchError, finalize } from 'rxjs/operators';
import { RegistraFaltaComponent } from '../registra-falta/registra-falta.component';
import * as moment from 'moment';
import { EstadoFaltaEnum,TipoDocumentoIdentidadEnum,CodigoRolEnum } from '../../_utils/constants';
import { saveAs } from 'file-saver';
import { TipoOperacionEnum } from 'app/core/model/types';
import { RegistraSancionComponent } from '../registra-sancion/registra-sancion.component';
import { InformacionFaltaComponent } from '../informacion-falta/informacion-falta.component';
import { TablaPermisos } from '../../../../../core/model/types';
import { SecurityModel } from '../../../../../core/model/security/security.model';
import { GlobalsService } from 'app/core/shared/globals.service';
 

@Component({
    selector: 'minedu-bandeja-faltas',
    templateUrl: './bandeja-faltas.component.html',
    styleUrls: ['./bandeja-faltas.component.scss'],
    encapsulation: ViewEncapsulation.None,
    animations: mineduAnimations,
})
export class BandejaFaltasComponent implements OnInit, OnDestroy, AfterViewInit {

    form: FormGroup;
    comboLists = {
        listaTipoDocumento: [],
        listaRegimenLaboral: [],
        listaTipoFalta: [],
    };
    hasAccessPage: boolean;
    currentSession: SecurityModel = new SecurityModel();
    permisos = {
        autorizadoAgregar: false,
        autorizadoModificar: false,
        autorizadoEliminar: false,
        autorizadoEnviar: false,
        autorizadoExportar: false,
        autorizadoConsultar:false
    };
  
    dataSource: FaltasDataSource | null;
    selection = new SelectionModel<any>(true, []);
     paginatorPageSize = 10;
     paginatorPageIndex = 0;
    maxLengthnumeroDocumentoIdentidad = 8;
    @ViewChild('paginator', { static: true }) paginator: MatPaginator;
    dialogRef: any;
    estadoFaltaInvestigado = EstadoFaltaEnum.INVESTIGADO;
    estadoFaltaDecidido = EstadoFaltaEnum.DECIDIDO;
    idDNI:number=0;
    estadoFalta = EstadoFaltaEnum;
    export = false;

    displayedColumns: string[] = [
        'registro',
        'numeroExpediente',
        'fechaRegistro',
        'nombreCompleto',
        'numeroDocumentoIdentidad',
        'centroTrabajo',
        'regimenLaboral',
        'tipoFalta',
        'Estado',
        'diasTranscurridos',
        'acciones',
    ];

    request = {
        codigoSede: null,
        codigoTipoSede: null,
        codigoRolPassport: null,
        idTipoDocumentoIdentidad: TipoDocumentoIdentidadEnum.DNI,
        numeroDocumentoIdentidad: null,
        idRegimenLaboral: null,
        idTipoFalta: null,
        fechaRegistro: null,
    };

    constructor(
        private route: ActivatedRoute,
        private router: Router,
        private formBuilder: FormBuilder,
        private dataService: DataService,
        private sharedService: SharedService,  
        private materialDialog: MatDialog,
        public globals: GlobalsService,
    ) { }

    ngOnInit(): void {
        setTimeout(_ => this.buildShared());
        this.buildForm();
        this.buildSeguridad(); 

        this.dataSource = new FaltasDataSource(
            this.dataService
        );
        this.paginator.showFirstLastButtons = true;
        this.paginator._intl.itemsPerPageLabel = 'Filas por tabla';
        this.paginator._intl.nextPageLabel = 'Siguiente página';
        this.paginator._intl.previousPageLabel = 'Página anterior';
        this.paginator._intl.firstPageLabel = 'Primera página';
        this.paginator._intl.lastPageLabel = 'Última página';
        this.resetForm();

        if(this.hasAccessPage){
            this.loadTipoDocumentoIdentidad();
            this.loadRegimenLaboral();
            this.loadTipoFalta();
            this.buscarFaltas(true);
        }
        else this.dataService.Message().msgError('El rol asignado no tiene acceso a esta página.', () => { });
        
       
    }

    ngAfterViewInit(): void {
        this.paginator.page.subscribe(() =>
            this.loadData(
                (this.paginator.pageIndex + 1).toString(),
                this.paginator.pageSize.toString()
            )
        );
    }
    ngOnDestroy(): void { }

    loadData(pageIndex, pageSize): void {
        this.setRequest();
        this.dataSource.load(
            this.request,
            this.paginator.pageIndex + 1,
            this.paginator.pageSize
        );
    }
    buildSeguridad = () => {
         
        this.permisos.autorizadoAgregar = this.dataService.Storage().tienePermisoAccion(TablaPermisos.Agregar);
        this.permisos.autorizadoModificar = this.dataService.Storage().tienePermisoAccion(TablaPermisos.Modificar);
        this.permisos.autorizadoEliminar = this.dataService.Storage().tienePermisoAccion(TablaPermisos.Eliminar);
        this.permisos.autorizadoEnviar = this.dataService.Storage().tienePermisoAccion(TablaPermisos.Eliminar);
        this.permisos.autorizadoConsultar = this.dataService.Storage().tienePermisoAccion(TablaPermisos.Consultar);
        this.permisos.autorizadoExportar = this.dataService.Storage().tienePermisoAccion(TablaPermisos.Eliminar);
       
      if(!this.permisos.autorizadoAgregar && !this.permisos.autorizadoModificar &&
        !this.permisos.autorizadoEliminar && !this.permisos.autorizadoEnviar &&
        !this.permisos.autorizadoConsultar && !this.permisos.autorizadoExportar)
         { 
             this.hasAccessPage=false;
         }else{
          this.hasAccessPage=true;
         }

        this.currentSession = this.dataService.Storage().getInformacionUsuario();

        this.globals.PASSPORT_CODIGO_SEDE=this.currentSession.codigoSede;
        this.globals.PASSPORT_CODIGO_TIPO_SEDE=this.currentSession.codigoTipoSede;
        this.globals.PASSPORT_CODIGO_PASSPORT=this.currentSession.idRol.toString();

    }
    buildForm(): void {
        this.form = this.formBuilder.group({

            anio: [null, Validators.required],

            idTipoDocumentoIdentidad: [null, Validators.required],
            numeroDocumentoIdentidad: [null,  ],
            idRegimenLaboral: [ null,Validators.compose([Validators.maxLength(60)]), ],
            idTipoFalta: [null, Validators.compose([Validators.maxLength(60)]), ],
            fechaRegistro: [null,Validators.compose([Validators.maxLength(60)]),
            ],
        });
    }

    selectTipoDocumento(tipoDocumento: number): void {
        this.maxLengthnumeroDocumentoIdentidad =
            tipoDocumento === TipoDocumentoIdentidadEnum.DNI ? 8 : 12;

        this.form
            .get('numeroDocumentoIdentidad')
            .setValidators([
                Validators.maxLength(this.maxLengthnumeroDocumentoIdentidad),
            ]);
    }

    handleLimpiar(): void {
        this.resetForm();
    }

    handleBuscar(): void {
        this.buscarFaltas();
    }

    resetForm = () => {
        this.form.reset();
        this.form.get('idTipoDocumentoIdentidad').setValue(this.idDNI);
        this.form.get('idRegimenLaboral').setValue(0);
        this.form.get('idTipoFalta').setValue(0);
        
    }
    buildShared() {
        this.sharedService.setSharedBreadcrumb("Gestión de faltas y sanciones");
        this.sharedService.setSharedTitle("Gestión de faltas y sanciones");
    }
    validarCamposObligatorios = () => {
        let result = true;
        if (this.request.idTipoDocumentoIdentidad === null &&
            this.request.numeroDocumentoIdentidad === null &&
            this.request.idRegimenLaboral === null &&
            this.request.idTipoFalta === null &&
            this.request.fechaRegistro === null) {
            this.dataService.Message().msgWarning('Debe especificar por lo menos un criterio de búsqueda.', () => { });
            result = false;
        }

       /* if (result === true) {
            if (this.request.idTipoDocumentoIdentidad != null &&
                this.request.numeroDocumentoIdentidad == null) {
                this.dataService
                    .Message()
                    .msgWarning('Debe ingresar número de documento de identidad.', () => { });
                result = false;
            }
        }*/

        if (result === true) {
            if (this.request.numeroDocumentoIdentidad != null &&
                this.request.idTipoDocumentoIdentidad == null) {
                this.dataService
                    .Message()
                    .msgWarning('Debe seleccionar tipo de documento de identidad.', () => { });
                result = false;
            }
        }

        return result;
    }

    handleExportar = () => {
        if (this.dataSource.data.length === 0) {
            this.dataService
                .Message()
                .msgWarning('No se encontró información para para exportar.', () => { });
            return;
        }

        this.export = true;
        this.dataService.Spinner().show('sp6');
        this.dataService
            .Sanciones()
            .exportarExcelFaltas(
                this.request,
                1,
                this.dataSource.dataTotal)
            .pipe(
                catchError((e) => of(null)),
                finalize(() => {
                    this.dataService.Spinner().hide('sp6');
                    this.export = false;
                })
            )
            .subscribe((response: any) => {
                if (response) {
                    saveAs(response, 'faltas.xlsx');
                } else {
                    this.dataService
                        .Message()
                        .msgWarning(
                            'No se encontró información para los criterios de búsqueda ingresado',
                            () => { }
                        );
                }
            });
    }

    handleNuevo = () => {
        this.dialogRef = this.materialDialog.open(RegistraFaltaComponent, {
            panelClass: 'registra-falta-dialog',
            width: '1280px',
            disableClose: true,
            data: {
                action: 'registrar',
                idOperacion: TipoOperacionEnum.Registrar,
                idFalta: 0,
                parent:this
            },
        });
        this.dialogRef.afterClosed().subscribe((resp) => {
            if (resp?.grabado === true) {
                this.buscarFaltas();
            }
        });
    }

    loadTipoDocumentoIdentidad = () => {
        this.dataService.Sanciones()
            .getComboTiposDocumento()
            .pipe(
                catchError(() => of([])),
                finalize(() => { })
            )
            .subscribe((response: any) => {
                    var index=0;
                    response.data.splice(index,0,
                               {idCatalogoItem:0,
                                abreviaturaCatalogoItem:"TODOS"});
                if (response && response.result) {
                    const data = response.data.map((x) => ({
                        ...x,
                        value: x.idCatalogoItem,
                        label: `${x.abreviaturaCatalogoItem}`,
                    }));

                    this.idDNI=0;
                    data.forEach(x => {
                        if(x.label==='DNI' || x.label==='D.N.I.') this.idDNI=  x.value; 
                    });
                    this.form.get('idTipoDocumentoIdentidad').setValue(this.idDNI);
                    
                    this.comboLists.listaTipoDocumento = data;
                }
            });
    }

    loadRegimenLaboral = () => {
        this.dataService.Sanciones()
            .getRegimenLaboral(null)
            .pipe(
                catchError(() => of([])),
                finalize(() => { })
            )
            .subscribe((response: any) => {
                var index=0;
                response.data.splice(index,0,
                           {idRegimenLaboral:0,
                            abreviaturaRegimenLaboral:"TODOS"});
                if (response && response.result) {
                    const data = response.data.map((x) => ({
                        ...x,
                        value: x.idRegimenLaboral,
                        label: `${x.abreviaturaRegimenLaboral}`,
                    }));
                    this.comboLists.listaRegimenLaboral = data;
                }
            });
    }

    loadTipoFalta = () => {
        this.dataService.Sanciones()
            .getComboTiposFalta()
            .pipe(
                catchError(() => of([])),
                finalize(() => { })
            )
            .subscribe((response: any) => {
                var index=0;
                response.data.splice(index,0,
                           {idCatalogoItem:0,
                            descripcionCatalogoItem:"TODOS"});
                if (response && response.result) {
                    const data = response.data.map((x) => ({
                        ...x,
                        value: x.idCatalogoItem,
                        label: `${x.descripcionCatalogoItem}`,
                    }));
                    this.comboLists.listaTipoFalta = data;
                }
            });
    }

    clearDate = (e) => {
        console.log('clearDate', e);
    }

    buscarFaltas = (fistTime: boolean = false) => {
        this.setRequest();
        if (fistTime) {
            this.dataSource.load(this.request, 1, 10);
        } else {       
                // if (!this.validarCamposObligatorios()) {
                //     return;
                // }

                this.dataSource = new FaltasDataSource(this.dataService);
                this.dataSource.load(
                    this.request,
                    this.paginator.pageIndex + 1,
                    this.paginator.pageSize
                );
        }
    }

    handleEditar = (row: any) => {
        /*
        if (row?.codigoEstadoLicencia !== EstadoFaltaEnum.REGISTRADO) {
            return;
        }*/
        this.dialogRef = this.materialDialog.open(RegistraFaltaComponent, {
            panelClass: 'registra-falta-dialog',
            width: '1280px',
            disableClose: true,
            data: {
                action: 'editar',
                idOperacion: TipoOperacionEnum.Modificar,
                idFalta: row.idFalta,
            },
        });
        this.dialogRef.afterClosed().subscribe((resp) => {
            if (resp?.grabado) {
                this.handleBuscar();
            }
        });
    }


    handleViewInfo = (row: any, i) => {
        this.dialogRef = this.materialDialog.open(InformacionFaltaComponent, {
            panelClass: 'informacion-falta-dialog',
            width: '1280px',
            disableClose: true,
            data: {

                idFalta: row.idFalta,
                eliminado: false,
            },
        });
        this.dialogRef.afterClosed().subscribe((resp) => {
            if (resp?.grabado) {
                this.handleBuscar();
            }
        });
    }
    handleSancionar= (row: any, i) => {
        this.dialogRef = this.materialDialog.open(RegistraSancionComponent, {
            panelClass: "registra-sancion-dialog",
            width: "1100",
            disableClose: true,
            data: {
                action: "registrar",
                idOperacion: TipoOperacionEnum.Registrar,
                idFalta: row.idFalta,
                parent:this
                
            },
        });
        this.dialogRef.afterClosed().subscribe((resp) => {
            if (resp?.grabado === true) {
               // this.buscarSancion();
            }
        });
    }
    handleEliminar = (row: any, i) => {
        /*     if (row?.codigoEstadoLicencia !== EstadoLicenciaEnum.REGISTRADO) {
                return;
            } */
        this.dialogRef = this.materialDialog.open(InformacionFaltaComponent, {
            panelClass: 'informacion-falta-dialog',
            width: '1280px',
            disableClose: true,
            data: {
                idFalta: row.idFalta,
                eliminado: true,
            },
        });
        this.dialogRef.afterClosed().subscribe((resp) => {
            if (resp?.grabado) {
                this.handleBuscar();
            }
        });
    }

    setRequest = () => {
        let fechaRegistro = null;
        const fecha = this.form.get('fechaRegistro').value;
        if (fecha != null) {
            fechaRegistro = moment(fecha).format('DD/MM/YYYY');
        }
        this.request = {
            codigoSede: this.globals.PASSPORT_CODIGO_SEDE,
            codigoTipoSede:this.globals.PASSPORT_CODIGO_TIPO_SEDE,
            codigoRolPassport: this.globals.PASSPORT_CODIGO_PASSPORT,
            idTipoDocumentoIdentidad: this.form.get('idTipoDocumentoIdentidad').value,
            numeroDocumentoIdentidad: this.form.get('numeroDocumentoIdentidad').value,
            idRegimenLaboral: this.form.get('idRegimenLaboral').value,
            idTipoFalta: this.form.get('idTipoFalta').value,
            fechaRegistro: fechaRegistro,
        };
        console.log(this.request);
    }
      
}

export class FaltasDataSource extends DataSource<any> {
    private _dataChange = new BehaviorSubject<any>([]);
    private _loadingChange = new BehaviorSubject<boolean>(false);

    public loading = this._loadingChange.asObservable();
    public totalregistro = 0;

    constructor(private dataService: DataService) {
        super();
    }

    load(data: any, pageIndex, pageSize): void {
        this._loadingChange.next(false);

        if (data.anio === null) {
            this._loadingChange.next(false);
            this._dataChange.next([]);
        } else {
            this.dataService
                .Sanciones()
                .getListaFaltas(data, pageIndex, pageSize)
                .pipe(
                    catchError(() => of([])),
                    finalize(() => this._loadingChange.next(false))
                )
                .subscribe((response: any) => {
                    this._dataChange.next(response.data || []);
                    this.totalregistro =
                        (response.data || []).length === 0
                            ? 0
                            : response.data[0].totalregistro;
                    if ((response.data || []).length === 0) {
                        this.dataService
                            .Message()
                            .msgWarning(
                                'No se encontró información de la(s) falta(s) para los criterios de búsqueda ingresados.',
                                () => { }
                            );
                    }
                });
        }
    }

    connect(collectionViewer: CollectionViewer): Observable<[]> {
        return this._dataChange.asObservable();
    }

    disconnect(collectionViewer: CollectionViewer): void {
        this._dataChange.complete();
        this._loadingChange.complete();
    }

    get dataTotal(): any {
        return this.totalregistro;
    }

    get data(): any {
        return this._dataChange.value || [];
    }
}
