import {
    Component,
    OnInit,
    ViewEncapsulation,
    OnDestroy,
    ViewChild,
    AfterViewInit,
} from '@angular/core';
import { mineduAnimations } from '@minedu/animations/animations';
import { BehaviorSubject, of, Observable } from 'rxjs';
import {
    SelectionModel,
    DataSource,
    CollectionViewer,
} from '@angular/cdk/collections';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { catchError, finalize } from 'rxjs/operators';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';

import { DataService } from 'app/core/data/data.service';
import { SharedService } from 'app/core/shared/shared.service';
import { BuscadorServidorPublicoComponent } from '../../../components/buscador-servidor-publico/buscador-servidor-publico.component';
import { RegistraLicenciaComponent } from '../registra-licencia/registra-licencia.component';
import { ServidorPublicoModel } from '../../../models/licencia.model';
import { saveAs } from 'file-saver';

import { TipoDocumentoIdentidadEnum, SituacionLaboralEnum, EstadoLicenciaEnum } from '../../../_utils/constants';
import Swal from 'sweetalert2';
import { TablaEquivalenciaSede, TablaNivelInstanciaCodigo, TablaTipoDocumentoConfiguracion, TipoOperacionEnum } from 'app/core/model/types';
import { SeleccionVinculacionComponent } from '../../../components/seleccion-vinculacion/seleccion-vinculacion.component';
import { InformacionLicenciaComponent } from '../../../components/informacion-licencia/informacion-licencia.component';
import { SecurityModel } from '../../../../../../core/model/security/security.model';
import { CentroTrabajoModel } from '../../../../../../core/model/centro-trabajo.model';
import { OrigenEliminacionEnum } from '../../../_utils/constants';
import { HttpErrorResponse } from '@angular/common/http';
import { MESSAGE_LICENCIAS } from '../../../_utils/messages';
import { InformacionPlazaComponent } from '../../../components/informacion-plaza/informacion-plaza.component';


@Component({
    selector: 'minedu-maternidad-lista-licencia',
    templateUrl: './maternidad-lista-licencia.component.html',
    styleUrls: ['./maternidad-lista-licencia.component.scss'],
    encapsulation: ViewEncapsulation.None,
    animations: mineduAnimations,
})
export class MaternidadListaComponent
    implements OnInit, OnDestroy, AfterViewInit {
    form: FormGroup;
    loading: false;
    export = false;

    comboLists = {
        listTipoDocumento: []
    };
    dataSource: MaternidadDataSource | null;
    selection = new SelectionModel<any>(true, []);
    private passport: SecurityModel = new SecurityModel();

    paginatorPageSize = 10;
    paginatorPageIndex = 0;
    @ViewChild('paginator', { static: true }) paginator: MatPaginator;
    eliminando = false;
    dialogRef: any;
    estadoLicenciaRegistrado = EstadoLicenciaEnum.REGISTRADO;
    estadoLicencia = EstadoLicenciaEnum;
    maxLengthDocumento = 8;
    longitudDocumentoExacta: boolean = false;
    permisoLicenciaSalud: any;

    request = {
        idServidorPublico: null
    };

    idServidorPublicoSelected: number;
    servidorPublico: ServidorPublicoModel = new ServidorPublicoModel();
    currentSession: SecurityModel = new SecurityModel();
    centroTrabajo: CentroTrabajoModel = null;

    displayedColumns: string[] = [
        'registro',
        'descripcionAccion',
        'descripcionMotivoAccion',
        'fechaInicio',
        'fechaFin',
        'cantidadDias',
        'diasCargoMinedu',
        'diasCargoEssalud',
        'numeroCertificado',
        'estadoLicencia',
        'codigoResolucion',
        'acciones',
    ];

    now = new Date();
    minDate = new Date('July 21, 1890 01:15:00');
    untilDate = new Date();

    constructor(
        private route: ActivatedRoute,
        private router: Router,
        private formBuilder: FormBuilder,
        private dataService: DataService,
        private sharedService: SharedService,
        // public globals: GlobalsService,
        private materialDialog: MatDialog,

    ) { }

    ngOnInit(): void {
        this.buildForm();
        this.buildSeguridad();
        this.buildPassport();
        this.entidadPassport();
        this.loadTipoDocumentoIdentidad();
        this.dataSource = new MaternidadDataSource(this.dataService);
        this.buildPaginators(this.paginator);
        this.loadCentroTrabajo();
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

    buildForm(): void {
        this.form = this.formBuilder.group({
            idTipoDocumentoIdentidad: [null, Validators.required],
            numeroDocumentoIdentidad: [null, Validators.required],
        });

        this.form.get("idTipoDocumentoIdentidad").valueChanges.subscribe(value => {
            if (!value)
            return;
            this.form.get('numeroDocumentoIdentidad').setValue('');
    
            let tipoDocumentoIdentidad = this.comboLists.listTipoDocumento.find(x => x.idCatalogoItem === value).codigoCatalogoItem;
    
            this.form.get('numeroDocumentoIdentidad').clearValidators();
            this.form.get('numeroDocumentoIdentidad').updateValueAndValidity();
    
            if (TablaTipoDocumentoConfiguracion.DNI === tipoDocumentoIdentidad) {
                this.maxLengthDocumento = 8;
                this.longitudDocumentoExacta = true;
                this.form.get('numeroDocumentoIdentidad').setValidators([Validators.compose([Validators.required, Validators.maxLength(8), Validators.minLength(8), Validators.pattern(/^[0-9]+$/)])]);
                this.form.get('numeroDocumentoIdentidad').updateValueAndValidity();
            }
    
            if (TablaTipoDocumentoConfiguracion.CE === tipoDocumentoIdentidad || 
                TablaTipoDocumentoConfiguracion.PASS === tipoDocumentoIdentidad) {
                this.maxLengthDocumento = 12;
                this.longitudDocumentoExacta = false;
                this.form.get('numeroDocumentoIdentidad').setValidators([Validators.compose([Validators.required, Validators.maxLength(12), Validators.minLength(9), Validators.pattern(/^[a-zA-Z0-9]+$/)])]);
                this.form.get('numeroDocumentoIdentidad').updateValueAndValidity();
            }  
        });
    }
    
    buildPaginators(paginator: MatPaginator): void {
        paginator.showFirstLastButtons = true;
        paginator._intl.itemsPerPageLabel = "Registros por página";
        paginator._intl.nextPageLabel = "Siguiente página";
        paginator._intl.previousPageLabel = "Página anterior";
        paginator._intl.firstPageLabel = "Primera página";
        paginator._intl.lastPageLabel = "Última página";
        paginator._intl.getRangeLabel = (page: number, pageSize: number, length: number) => {
            if (length === 0 || pageSize === 0) {return `0 de ${length}`;}
            const length2 = Math.max(length, 0);
            const startIndex = page * pageSize;
            const endIndex = startIndex < length2 ? Math.min(startIndex + pageSize, length2) : startIndex + pageSize;
            return `${startIndex + 1} – ${endIndex} de ${length2}`;
        }
    }

    resetForm = () => {
        this.form.reset();
        const tipoDocumento = this.comboLists.listTipoDocumento.find(x => x.codigoCatalogoItem === TipoDocumentoIdentidadEnum.DNI);
        this.form.get('idTipoDocumentoIdentidad').setValue(tipoDocumento.idCatalogoItem);
    }

    buildSeguridad = () => {               
        this.currentSession = this.dataService.Storage().getInformacionUsuario();
    }

    buildPassport() {
        this.passport = this.dataService.Storage().getInformacionUsuario();
        
        if (this.passport.codigoTipoSede === TablaEquivalenciaSede.CODIGO_TIPO_SEDE)
            this.passport.codigoSede = TablaEquivalenciaSede.CODIGO_SEDE;    
    }

    entidadPassport(){
        this.dataService.Licencias().entidadPassport(this.passport.codigoSede).pipe(
            catchError((error: HttpErrorResponse) => {
                this.dataService.Message().msgWarning(error.error.messages[0]); return of(null);
            }),
        ).subscribe((response: any) => {
            if (response.length > 0){
                if (response.length > 1)
                response = response.filter(x => x.idNivelInstancia <= TablaNivelInstanciaCodigo.UGEL);
                
                if (response.length == 1 && response[0].idNivelInstancia == TablaNivelInstanciaCodigo.UGEL)
                this.passport.codigoTipoSede = TablaEquivalenciaSede.CODIGO_TIPO_SEDE_UGEL;
        
                this.centroTrabajo = response[0];
                //this.handleGrid(true); modificado en licencia
                this.getPermisosLicenciaSalud();
            }else{
                this.centroTrabajo = null;
            }
        });
    }

    getPermisosLicenciaSalud() {
        this.dataService.Licencias().obtenerPermisosLicenciaSalud(this.passport.codigoRol, this.passport.codigoTipoSede)
            .pipe(
                catchError((error: HttpErrorResponse) => {
                this.dataService.Message().msgWarning(error.error.messages[0]); return of(null);
                }),
            ).subscribe(response => {
                if (response)
                    this.permisoLicenciaSalud = response;
            });
    }

    loadData(pageIndex, pageSize): void {
        this.request = {
            idServidorPublico: this.idServidorPublicoSelected
        };
        this.dataSource.load(
            this.request,
            this.paginator.pageIndex + 1,
            this.paginator.pageSize
        );
    }

    handleBuscar(): void {
        this.buscarServidorPublico();
    }

    handleExportar = () => {

        if (this.dataSource.data.length === 0) {
            this.dataService
                .Message()
                .msgWarning(MESSAGE_LICENCIAS.RESULT_NULL_EXPORTAR, () => { });
            return;
        }

        const fileName = this.servidorPublico.numeroDocumentoIdentidad + '_' +
            this.servidorPublico.primerApellido + '_' + this.servidorPublico.segundoApellido + '_' +
            this.servidorPublico.nombres + '.xlsx';
        this.export = true;
        this.dataService.Spinner().show('sp6');
        this.dataService
            .Licencias()
            .exportarListaLicenciasBienestar(
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
                    saveAs(response, fileName);
                } else {
                    this.dataService
                        .Message()
                        .msgWarning(
                            MESSAGE_LICENCIAS.RESULT_NULL_BUSQUEDA,
                            () => { }
                        );
                }
            });
    };

    handleNuevo = () => {
        if (
            this.servidorPublico?.idServidorPublico === null ||
            this.servidorPublico?.idServidorPublico === undefined ||
            this.servidorPublico?.idServidorPublico <= 0
        ) {
            this.dataService.Message().msgWarning(MESSAGE_LICENCIAS.INVALID_SERVIDOR_PUBLICO, () => { });
            return;
        }

        if (this.servidorPublico?.codigoSituacionLaboral == SituacionLaboralEnum.cesante) {
            this.dataService.Message().msgWarning(MESSAGE_LICENCIAS.INVALID_SERVIDOR_PUBLICO_CESADO, () => { });
            return;
        }

        this.dialogRef = this.materialDialog.open(RegistraLicenciaComponent, {
            panelClass: 'registra-licencia-dialog',
            width: '1280px',
            disableClose: true,
            data: {
                action: 'registrar',
                idOperacion: TipoOperacionEnum.Registrar,
                servidorPublico: this.servidorPublico,
                idLicencia: 0,
                currentSession: this.currentSession
            },
        });
        this.dialogRef.afterClosed().subscribe((resp) => {
            if (resp?.grabado) {
                this.buscarLicencias();
            }
        });
    }

    handleEditar = (row: any, i) => {
        if (row?.codigoEstadoLicencia !== EstadoLicenciaEnum.REGISTRADO) {
            return;
        }
        this.dialogRef = this.materialDialog.open(RegistraLicenciaComponent, {
            panelClass: 'registra-licencia-dialog',
            width: '1280px',
            disableClose: true,
            data: {
                action: 'editar',
                idOperacion: TipoOperacionEnum.Modificar,
                servidorPublico: this.servidorPublico,
                idLicencia: row.idLicencia,
                licencia: row,
                currentSession: this.currentSession
            },
        });
        this.dialogRef.afterClosed().subscribe((resp) => {
            if (resp?.grabado) {
                this.buscarLicencias();
            }
        });
    }

    handleViewInfo = (row: any, i) => {
        this.dialogRef = this.materialDialog.open(InformacionLicenciaComponent, {
            panelClass: 'informacion-licencia-dialog',
            width: '1180px',
            disableClose: true,
            data: {
                idLicencia: row.idLicencia,
                eliminado: false,
                currentSession: this.currentSession
            },
        });
        this.dialogRef.afterClosed().subscribe((resp) => {
            if (resp?.grabado) {
                this.handleBuscar();
            }
        });
    }

    handleEliminar = (row: any, i) => {
        if (row?.codigoEstadoLicencia !== EstadoLicenciaEnum.REGISTRADO) {
            return;
        }
        this.dialogRef = this.materialDialog.open(InformacionLicenciaComponent, {
            panelClass: 'informacion-licencia-dialog',
            width: '1180px',
            disableClose: true,
            data: {
                idLicencia: row.idLicencia,
                eliminado: true,
                origen: OrigenEliminacionEnum.REGISTRADO,
                currentSession: this.currentSession
            },
        });
        this.dialogRef.afterClosed().subscribe((resp) => {
            if (resp?.grabado) {
                this.buscarLicencias();
            }
        });
    }

    validaNumericos = (event) => {
        if (event.charCode >= 48 && event.charCode <= 57) {
            return true;
        }
        return false;
    }
    
    buscarServidorPublico(): void {
        if (!this.form.valid) {
            this.dataService.Message().msgWarning(MESSAGE_LICENCIAS.M01, () => { });
            return;
        }

        if (this.centroTrabajo === null) {
            this.dataService.Message().msgWarning(MESSAGE_LICENCIAS.M01, () => { });
            return;
        }

        const idTipoDocumentoIdentidad = this.form.get('idTipoDocumentoIdentidad').value;
        const numeroDocumentoIdentidad = this.form.get('numeroDocumentoIdentidad').value;
        if (numeroDocumentoIdentidad.length === 0 || numeroDocumentoIdentidad.length < 8) {
            return;
        }

        const request = {
            idDre: this.centroTrabajo.idDre,
            idUgel: this.centroTrabajo.idUgel,
            idTipoDocumentoIdentidad: idTipoDocumentoIdentidad,
            numeroDocumentoIdentidad: numeroDocumentoIdentidad
        };

        this.dataService
            .Licencias()
            .getListaServidorPublico(request)
            .pipe(
                catchError((error: HttpErrorResponse) => {
                    this.dataService.Message().msgWarning(error.error.messages[0]); return of(null);
                }),
                finalize(() => { })
            )
            .subscribe((response: any) => {
                if (!response || response?.length == 0) return;
                const servidorPublico = response[0];

                if (servidorPublico) {
                    if (response.length > 1) {
                        this.seleccionarVinculacion(request, servidorPublico);
                    } else {
                        this.idServidorPublicoSelected = servidorPublico.idServidorPublico;
                        this.obtenerDatosServidorPublico(this.idServidorPublicoSelected);
                    }
                } else {
                    this.dataService.Message().msgWarning(MESSAGE_LICENCIAS.RESULT_NULL_SERVIDOR_PUBLICO,() => { });
                    this.idServidorPublicoSelected = null;
                    this.servidorPublico = new ServidorPublicoModel();
                    this.request.idServidorPublico = null;
                    this.dataSource.load(this.request, 1, 10);
                }
                
            });
    }

    seleccionarVinculacion = (request: any, servidorPublico: any) => {
        this.dialogRef = this.materialDialog.open(
            SeleccionVinculacionComponent,
            {
                panelClass: 'seleccion-vinculacion-dialog',
                width: '1280px',
                disableClose: true,
                data: {
                    action: 'busqueda',
                    servidorPublico: servidorPublico,
                    centroTrabajo: this.centroTrabajo
                },
            }
        );

        this.dialogRef.afterClosed().subscribe((resp) => {
            if (resp) 
                this.obtenerDatosServidorPublico(resp.servidorPublico.idServidorPublico);
        });
    }

    obtenerDatosServidorPublico = (idServidorPublico: number) => {
        this.dataService
            .Licencias()
            .getServidorPublico(idServidorPublico)
            .pipe(
                catchError((error: HttpErrorResponse) => {
                    this.dataService.Message().msgWarning(error.error.messages[0]); return of(null);
                }),
                finalize(() => { })
            )
            .subscribe((response: any) => {
                if (response) {
                    this.servidorPublico = response;
                    this.idServidorPublicoSelected = this.servidorPublico.idServidorPublico;
                    this.buscarLicencias();
                }
            });
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

    loadTipoDocumentoIdentidad = () => {
        this.dataService
            .Licencias()
            .getComboTiposDocumento()
            .pipe(
                catchError(() => of([])),
                finalize(() => { })
            )
            .subscribe((response: any) => {
                if (response && response.result) {
                    const data = response.data.map((x) => ({
                        ...x,
                        value: x.idCatalogoItem,
                        label: `${x.descripcionCatalogoItem}`,
                    }));
                    this.comboLists.listTipoDocumento = data;
                    
                    this.resetForm();
                }
            });
    }

    busquedaPersonalizada(): void {
        this.dialogRef = this.materialDialog.open(
            BuscadorServidorPublicoComponent,
            {
                panelClass: 'minedu-buscador-servidor-publico-dialog',
                width: '1080px',
                disableClose: true,
                data: {
                    action: 'busqueda',
                },
            }
        );

        this.dialogRef.afterClosed().subscribe((resp) => {
            if (!resp) return;
            const servidorPublico = resp;
            this.idServidorPublicoSelected = servidorPublico.idServidorPublico;
            this.form.get('idTipoDocumentoIdentidad').setValue(servidorPublico.idTipoDocumentoIdentidad);
            this.form.get('numeroDocumentoIdentidad').setValue(servidorPublico.numeroDocumentoIdentidad);
            this.buscarServidorPublico();
        });
    }

    handleVerInformacionPlaza() {
        this.materialDialog.open(InformacionPlazaComponent, {
            panelClass: 'minedu-informacion-plaza',
            width: '1080px',
            disableClose: true,
            data: {
                codigoPlaza: this.servidorPublico.codigoPlaza,
                idServidorPublico: this.servidorPublico.idServidorPublico
            }
        });
    }

    buscarLicencias = () => {

        this.request = {
            idServidorPublico: this.idServidorPublicoSelected
        };

        if (
            this.request.idServidorPublico === null 
        ) {
            this.dataService
                .Message()
                .msgWarning(
                    MESSAGE_LICENCIAS.M01,
                    () => { }
                );
        } else {
            this.dataSource = new MaternidadDataSource(this.dataService);
            this.dataSource.load(
                this.request,
                this.paginator.pageIndex + 1,
                this.paginator.pageSize
            );
        }
    }

    handleEnviar = (row) => {
        let message = '¿Está seguro de que desea enviar el registro de licencia?';
        message = message + ' La licencia será enviada para generar el Proyecto de resolución.';
        Swal.fire({
            title: '',
            text: message,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d84d2a',
            cancelButtonColor: '#333333',
            confirmButtonText: 'Sí',
            cancelButtonText: 'Cancelar',
        }).then((result) => {
            if (result.value) {
                this.dataService.Licencias()
                    .enviarLicencia(row.idLicencia, this.currentSession.numeroDocumento)
                    .subscribe(
                        (rest) => {
                            //  this.matDialogRef.close();

                            this.buscarLicencias();
                        },
                        (error) => {
                            // this.mensajeService.mostrarMensajeError(error);
                        }
                    );
            }

        });
    }

    soloNumeros = (event) => {
        console.log("e", event);
        if (this.form.get('idTipoDocumentoIdentidad').value === TipoDocumentoIdentidadEnum.DNI) {
            return event.charCode >= 48 && event.charCode <= 57;
        } else {
            return true;
        }
    }

    descargarResolucion = (row) => {
        const data = row;
        if (data.codigoDocumentoResolucion === null || data.codigoDocumentoResolucion === '00000000-0000-0000-0000-000000000000' ||
            data.codigoDocumentoResolucion === '') {
            this.dataService.Message().msgWarning(MESSAGE_LICENCIAS.M01, () => { });
            return;
        }
        this.dataService.Spinner().show('sp6');
        this.dataService.Documento().descargar(data.codigoDocumentoResolucion)
            .pipe(
                catchError((e) => of(null)),
                finalize(() => this.dataService.Spinner().hide('sp6'))
            ).subscribe(response => {
                if (response) {
                    saveAs(response, 'certificado.pdf');
                } 
            });
    }
}

export class MaternidadDataSource extends DataSource<any> {
    private _dataChange = new BehaviorSubject<any>([]);
    private _loadingChange = new BehaviorSubject<boolean>(false);

    public loading = this._loadingChange.asObservable();
    public totalregistro = 0;

    constructor(private dataService: DataService) {
        super();
    }

    load(data: any, pageIndex, pageSize): void {
        this._loadingChange.next(false);
        this.dataService.Spinner().show('sp6');
        if (data.idServidorPublico === null) {
            this._loadingChange.next(false);
            this._dataChange.next([]);
            this.dataService.Spinner().hide('sp6');
        } else {
            this.dataService
                .Licencias()
                .getListaLicenciasBienestar(data, pageIndex, pageSize)
                .pipe(
                    catchError((error: HttpErrorResponse) => {
                        this.dataService.Message().msgWarning(error.error.messages[0]); return of(null);
                    }),
                    finalize(() => {
                        this._loadingChange.next(false);
                        this.dataService.Spinner().hide('sp6');
                    })
                )
                .subscribe((response: any) => {
                    this._dataChange.next(response.data || []);
                    this.totalregistro =
                        (response.data || []).length === 0
                            ? 0
                            : response.data[0].totalregistro;
                    if ((response.data || []).length === 0) {
                        /*
                        this.dataService
                            .Message()
                            .msgWarning(
                                'No se encontró información de la(s) licencia(s) para los criterios de búsqueda ingresados.',
                                () => { }
                            );*/
                    }
                });
        }

        /* this._dataChange.next(data);
        this.totalregistro = 0; */
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
