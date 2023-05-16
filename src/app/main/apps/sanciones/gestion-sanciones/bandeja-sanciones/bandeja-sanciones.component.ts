import { CollectionViewer, DataSource, SelectionModel } from '@angular/cdk/collections';
import { AfterViewInit, Component, OnDestroy, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { ActivatedRoute, Router } from '@angular/router';
import { mineduAnimations } from '@minedu/animations/animations';
import { DataService } from 'app/core/data/data.service';
import { SharedService } from 'app/core/shared/shared.service';
import { EstadoLicenciaEnum, TipoDocumentoIdentidadEnum } from 'app/main/apps/licencias/_utils/constants';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { catchError, finalize } from 'rxjs/operators';
import { RegistraSancionComponent } from '../registra-sancion/registra-sancion.component';
import * as moment from 'moment';
import { SancionesService } from 'app/core/data/services/sanciones.service';
import { saveAs } from 'file-saver';
import { EstadoFaltaEnum, EstadoSancionEnum,ResultadoOperacionEnum,GrupoAccionEnum } from '../../_utils/constants';
import { TipoOperacionEnum } from 'app/core/model/types';
import { InformacionSancionComponent } from '../informacion-sancion/informacion-sancion.component';
import { ResolucionModel } from '../../models/sanciones.model';
import { SecurityModel } from '../../../../../core/model/security/security.model';
import { GlobalsService } from 'app/core/shared/globals.service';
import { TablaPermisos } from '../../../../../core/model/types';

@Component({
    selector: 'minedu-bandeja-sanciones',
    templateUrl: './bandeja-sanciones.component.html',
    styleUrls: ['./bandeja-sanciones.component.scss'],
    encapsulation: ViewEncapsulation.None,
    animations: mineduAnimations,
})
export class BandejaSancionesComponent implements OnInit, OnDestroy, AfterViewInit {
    form: FormGroup;
    export = false;
    estado = EstadoLicenciaEnum;
    comboLists = {
        listaTipoDocumento: [],
        listaRegimenLaboral: [],
        listaAccion: [],
        listaMotivosAccion:[]
    };
    idDNI:number;
    minDate = new Date();
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
    dataSource: SancionesDataSource | null;
    selection = new SelectionModel<any>(true, []);
    paginatorPageSize = 10;
    paginatorPageIndex = 0;
    maxLengthnumeroDocumentoIdentidad = 8;
    @ViewChild('paginator', { static: true }) paginator: MatPaginator;
    dialogRef: any;
    estadoSancion = EstadoSancionEnum;
    estadoSancionRegistrado = EstadoFaltaEnum.REGISTRADO;

    displayedColumns: string[] = [
        'registro',
        'fechaResolucion',
        'numeroResolucion',
        'abreviaturaRegimenLaboral',
        'numeroDocumentoIdentidad',
        'nombres',
        'descripcionAccion',
        'descripcionMotivoAccion',
        'fechaInicio',
        'fechaFin',
        'estado',
        'descripcionOrigen',
        'acciones'
    ];
    request = {
        codigoSede: null,
        codigoTipoSede:null,
        codigoRolPassport: null, 
        idTipoDocumentoIdentidad: TipoDocumentoIdentidadEnum.DNI,
        numeroDocumentoIdentidad: null,
        idRegimenLaboral: null,
        idAccion: null,
        idMotivoAccion: null,
    };

    constructor(
        private route: ActivatedRoute,
        private router: Router,
        private formBuilder: FormBuilder,
        private dataService: DataService,
        private sharedService: SharedService,  
        private materialDialog: MatDialog,
        private service: SancionesService,
        public globals: GlobalsService,
    ) { }

    ngOnInit(): void {
        setTimeout(_ => this.buildShared());
        this.buildForm();
        this.buildSeguridad(); 

       
        this.dataSource = new SancionesDataSource(
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
            this.loadAcciones();
            this.loadMotivoAccion(-1);
           // this.buscarSancion();
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
        
    setRequest = () => {
         
        this.request = {
            codigoSede: this.globals.PASSPORT_CODIGO_SEDE,
            codigoTipoSede:this.globals.PASSPORT_CODIGO_TIPO_SEDE,
            codigoRolPassport: this.globals.PASSPORT_CODIGO_PASSPORT,            
            idTipoDocumentoIdentidad: this.form.get('idTipoDocumentoIdentidad').value,
            numeroDocumentoIdentidad: this.form.get('numeroDocumentoIdentidad').value,
            idRegimenLaboral: this.form.get('idRegimenLaboral').value,
            idAccion: this.form.get('idAccion').value,
            idMotivoAccion: this.form.get('idMotivoAccion').value,
        };
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
            numeroDocumentoIdentidad: [
                null,
            ],
            idRegimenLaboral: [
                null,
                Validators.compose([Validators.maxLength(60)]),
            ],
            idAccion: [
                null,
                Validators.compose([Validators.maxLength(60)]),
            ],
            idMotivoAccion: [
                null,
                Validators.compose([Validators.maxLength(60)]),
            ],
        });
    }
    buildShared() {
        this.sharedService.setSharedBreadcrumb("Gestión de faltas y sanciones");
        this.sharedService.setSharedTitle("Gestión de faltas y sanciones");
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
        this.buscarSancion();
    }

    resetForm = () => {
        this.form.reset();
        this.form.get('idTipoDocumentoIdentidad').setValue(this.idDNI);
        this.form.get('idRegimenLaboral').setValue(0);
        this.form.get('idAccion').setValue(0);
        this.form.get('idMotivoAccion').setValue(0);
        /*
        this.form
            .get('idTipoDocumentoIdentidad')
            .setValue(TipoDocumentoIdentidadEnum.DNI);
        this.maxLengthnumeroDocumentoIdentidad = 8;
        */
    }

    handleNuevo = () => {
        // TODO:
        // const idLicencia = this.form.get("idLicencia");
        this.dialogRef = this.materialDialog.open(RegistraSancionComponent, {
            panelClass: "registra-sancion-dialog",
            width: "1280px",
            disableClose: true,
            data: {
                action: "registrar",
                idOperacion: TipoOperacionEnum.Registrar,
                /*  servidorPublico: this.servidorPublico,
                 idLicencia,
                 anio: this.form.get("anio").value.getFullYear(), */
            },
        });
        this.dialogRef.afterClosed().subscribe((resp) => {
            if (resp?.grabado === true) {
                this.buscarSancion();
            }
        });
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
            .exportarExcelSanciones(
                this.request,
                1,
                this.dataSource.dataTotal
            )
            .pipe(
                catchError((e) => of(null)),
                finalize(() => {
                    this.dataService.Spinner().hide('sp6');
                    this.export = false;
                })
            )
            .subscribe((response: any) => {
                if (response) {
                    saveAs(response, 'sanciones.xlsx');
                } else {
                    this.dataService
                        .Message()
                        .msgWarning(
                            'No se encontró información para los criterios de búsqueda ingresados.',
                            () => { }
                        );
                }
            });
    }

    validarCamposObligatorios = () => {
        let result = true;
        if (this.request.idTipoDocumentoIdentidad === null &&
            this.request.numeroDocumentoIdentidad === null &&
            this.request.idRegimenLaboral === null &&
            this.request.idAccion === null &&
            this.request.idMotivoAccion === null ) {
            this.dataService.Message().msgWarning('Debe especificar por lo menos un criterio de búsqueda.', () => { });
            result = false;
        }

        /*if (result === true) {
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

    buscarSancion = () => {
        this.setRequest();
        if (!this.validarCamposObligatorios()) {
            return;
        }
        this.paginator.pageSize=this.paginatorPageSize;
        this.dataSource = new SancionesDataSource(this.dataService);
        this.dataSource.load(
            this.request,
            this.paginator.pageIndex + 1,
            this.paginator.pageSize
        );

    }

    loadTipoDocumentoIdentidad = () => {
        this.service
            .getComboTiposDocumento()
            .pipe(
                catchError(() => of([])),
                finalize(() => { })
            )
            .subscribe((response: any) => {
                if (response && response.result) {
                    response.data.splice(0,0,{idCatalogoItem:0,abreviaturaCatalogoItem:"TODOS"});
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
        this.service
            .getRegimenLaboral(null)
            .pipe(
                catchError(() => of([])),
                finalize(() => { })
            )
            .subscribe((response: any) => {
                if (response && response.result) {
                    const data = response.data.map((x) => ({
                        ...x,
                        value: x.idRegimenLaboral,
                        label: `${x.abreviaturaRegimenLaboral}`,
                    }));
                    data.splice(0,0,{value:0,label:"TODOS"});
                    this.comboLists.listaRegimenLaboral = data;
                }
            });
    }

    loadAcciones = () => {
        this.service
            .getComboAcciones({
                idGrupoAccion:GrupoAccionEnum.SANCIONES,
                activo:true,
                idRegimenLaboral:null,
                codigoRolPassport:null
            })
            .pipe(
                catchError(() => of([])),
                finalize(() => { })
            )
            .subscribe((response: any) => {
                if (response && response.result) {
                    const data = response.data.map((x) => ({
                        ...x,
                        value: x.idAccion,
                        label: `${x.descripcionAccion}`,
                    }));
                    data.splice(0,0,{value:0,label:"TODOS"});
                    this.comboLists.listaAccion = data;
                }
            });
    }
    loadMotivoAccion = (idAccion:number) => {
        this.service
            .getComboMotivosAccion({
                idGrupoAccion:GrupoAccionEnum.SANCIONES,
                idAccion:idAccion,
                activo:true,
                idRegimenLaboral:null,
                codigoRolPassport:null
            })
            .pipe(
                catchError(() => of([])),
                finalize(() => { })
            )
            .subscribe((response: any) => {
                if (response && response.result) {
                    const data = response.data.map((x) => ({
                        ...x,
                        value: x.idMotivoAccion,
                        label: `${x.descripcionMotivoAccion}`,
                    }));
                    
                    data.splice(0,0,{value:0,label:"TODOS"});
                    this.comboLists.listaMotivosAccion = data;
                }else{
                    this.comboLists.listaMotivosAccion = [{value:0,label: "TODOS"}];
                }
            });
    }

    handleEditar = (row: any) => {
        /*
        if (row?.codigoEstadoLicencia !== EstadoFaltaEnum.REGISTRADO) {
            return;
        }*/
        console.log(row);
        this.dialogRef = this.materialDialog.open(RegistraSancionComponent, {
            panelClass: 'registra-sancion-dialog',
            width: '1280px',
            disableClose: true,
            data: {
                action: 'editar',
                idOperacion: TipoOperacionEnum.Modificar,
                idSancion: row.idSancion,
            },
        });
        this.dialogRef.afterClosed().subscribe((resp) => {
            if (resp?.grabado) {
                this.handleBuscar();
            }
        });
    }

    handleViewInfo = (row: any, i) => {
        this.dialogRef = this.materialDialog.open(InformacionSancionComponent, {
            panelClass: 'informacion-sancion-dialog',
            width: '1100px',
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

    handleEliminar = (row: any, i) => {
        /*     if (row?.codigoEstadoLicencia !== EstadoLicenciaEnum.REGISTRADO) {
                return;
            } */
        this.dialogRef = this.materialDialog.open(InformacionSancionComponent, {
            panelClass: 'informacion-sancion-dialog',
            width: '1280px',
            disableClose: true,
            data: {
                idSancion: row.idSancion,
                eliminado: true,
            },
        });
        this.dialogRef.afterClosed().subscribe((resp) => {
            if (resp?.grabado) {
                this.handleBuscar();
            }
        });
    }
    descargarResolucion = (resolucion: any) => {
        const data =resolucion;
        
        if (data.codigoDocumentoResolucion === null || data.codigoDocumentoResolucion === '') {
            this.dataService.Message().msgWarning('No tiene resolución.', () => { });
            return;
        }        
        this.dataService.Spinner().show("sp6");
        this.dataService.Documento().descargar(data.codigoDocumentoResolucion)
            .pipe(
                catchError((e) => of(null)),
                finalize(() => this.dataService.Spinner().hide("sp6"))
            ).subscribe(response => {
                if (response) {
                    saveAs(response, "documentoresolucion.pdf");
                } else {
                    this.dataService.Message().msgWarning('No se pudo descargar la resolución', () => { });
                }
            });
    }
   
 
}

export class SancionesDataSource extends DataSource<any> {
    private _dataChange = new BehaviorSubject<any>([]);
    private _loadingChange = new BehaviorSubject<boolean>(false);

    public loading = this._loadingChange.asObservable();
    public totalregistro = 0;
    resoluciones: Array<ResolucionModel>=[];
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
                .getListaSanciones(data, pageIndex, pageSize)
                .pipe(
                    catchError(() => of([])),
                    finalize(() => this._loadingChange.next(false))
                )
                .subscribe((response: any) => {
                   
                    if (response && response.result) {
                            this._dataChange.next(response.data || []);
                            this.totalregistro =(response.data || []).length === 0  ? 0: response.data[0].totalregistro;
                            if (this.totalregistro  === 0) {
                                this.dataService
                                    .Message()
                                    .msgWarning(
                                        'No se encontró información de la(s) sanciones(s) para los criterios de búsqueda ingresados.',
                                        () => { }
                                    );
                            }else{
                                
                               // this.setResolucion();
                                console.log(response.data);
                                // response.data.map(function(sancion)=>{
                                        
                                // });





                            }
                    }else if (response && response.statusCode === ResultadoOperacionEnum.NotFound) {
                        this.dataService.Message().msgWarning(response.messages[0], () => { });
                    } else if (response && response.statusCode === ResultadoOperacionEnum.UnprocessableEntity) {
                        this.dataService.Message().msgWarning(response.messages[0], () => { });
                    } else {
                        this.dataService.Message().msgError('Ocurrieron algunos problemas al obtener la información.', () => {  });
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
