import {
    Component,
    OnInit,
    ViewEncapsulation,
    OnDestroy,
    ViewChild,
    AfterViewInit,
    Input,
} from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { mineduAnimations } from '../../../../../../../@minedu/animations/animations';
import { ActivatedRoute, Router } from '@angular/router';
import { DataService } from 'app/core/data/data.service';
import { SharedService } from 'app/core/shared/shared.service';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import {
    SelectionModel,
    DataSource,
    CollectionViewer,
} from '@angular/cdk/collections';
import { Subscription, BehaviorSubject, of, Observable, Subject } from 'rxjs';
import { catchError, finalize, takeUntil, filter, find } from 'rxjs/operators';
import { MatPaginator } from '@angular/material/paginator';
import { RegistraLicenciaOtraComponent } from '../registra-licencia-otra/registra-licencia-otra.component';
import { InformacionLicenciaOtraComponent } from '../informacion-licencia-otra/informacion-licencia-otra.component';
import { saveAs } from 'file-saver';
import Swal from 'sweetalert2';
import { ServidorPublicoModel } from '../../../models/licencia.model';
import { EstadoLicenciaEnum, SituacionLaboralEnum, GrupoAccionEnum, AccionEnum } from '../../../_utils/constants';
import { TipoOperacionEnum } from 'app/core/model/types';
import { SecurityModel } from '../../../../../../core/model/security/security.model';
import { CentroTrabajoModel } from '../../../../../../core/model/centro-trabajo.model';
import { HttpErrorResponse } from '@angular/common/http';

@Component({
    selector: 'minedu-bandeja-licencia-otra',
    templateUrl: './bandeja-licencia-otra.component.html',
    styleUrls: ['./bandeja-licencia-otra.component.scss'],
    encapsulation: ViewEncapsulation.None,
    animations: mineduAnimations,
})
export class BandejaLicenciaOtraComponent implements OnInit, AfterViewInit {
    form: FormGroup;
    loading: false;
    export = false;
    estadoLicencia = EstadoLicenciaEnum;
    comboLists = {
        listAccion: [],
        listMotivoAccion: [],
        listEstadoLicencia: [],
    };
    permisos = {
        autorizadoAgregar: false,
        autorizadoModificar: false,
        autorizadoEliminar: false,
        autorizadoEnviar: false,
        autorizadoExportar: false
    };

    now = new Date();
    minDate = new Date('July 21, 1890 01:15:00');
    untilDate = new Date();
    idServidorPublico: number;
    servidorPublico: ServidorPublicoModel = new ServidorPublicoModel();
    dataSource: MaternidadDataSource | null;
    selection = new SelectionModel<any>(true, []);

    idServidorPublicoSelected: number = 1;
    idLicencia: 0;
    currentSession: SecurityModel = new SecurityModel();
    centroTrabajo: CentroTrabajoModel = null;

    displayedColumns: string[] = [
        'registro',
        'descripcionAccion',
        'descripcionMotivoAccion',
        'fechaInicio',
        'fechaFin',
        'cantidadDias',
        'estadoLicencia',
        'codigoResolucion',
        'acciones',
    ];

    paginatorPageSize = 10;
    paginatorPageIndex = 0;
    @ViewChild('paginator', { static: true }) paginator: MatPaginator;
    dialogRef: any;
    estadoLicenciaRegistrado = EstadoLicenciaEnum.REGISTRADO;
    codigoAccionConGoce = AccionEnum.LICENCIA_CON_GOCE_DE_REMUNERACIONES;
    codigoAccionSinGoce = AccionEnum.LICENCIA_SIN_GOCE_DE_REMUNERACIONES;

    request = {
        idServidorPublico: null,
        anio: null,
        idAccion: null,
        idMotivoAccion: null,
        idEstadoLicencia: null,
    };
    eliminando = false;

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
        private route: ActivatedRoute,
        private router: Router,
        private formBuilder: FormBuilder,
        private dataService: DataService,
        private dataShared: SharedService,
        private materialDialog: MatDialog
    ) { }

    ngOnInit(): void {
        this.idServidorPublico = this.route.snapshot.params.id;
        this.buildForm();
        this.handleResponsive();
        this.buildSeguridad();
        this.loadEstadoLicencia();
        this.obtenerDatosServidorPublico(this.idServidorPublico);
        this.dataSource = new MaternidadDataSource(this.dataService);
        // this.loadAccion();              
    }

    handleResponsive(): void {
        this.isMobile = this.getIsMobile();
        window.onresize = () => {
            this.isMobile = this.getIsMobile();
        };
    }

    ngAfterViewInit(): void {
        // commented
        /*
        this.paginator.page.subscribe(() =>
            this.loadData(
                (this.paginator.pageIndex + 1).toString(),
                this.paginator.pageSize.toString()
            )
        );
        */
    }

    buildForm(): void {
        this.form = this.formBuilder.group({
            idAccion: [null],
            idMotivoAccion: [null],
            idEstadoLicencia: [null],
        });
    }

    buildSeguridad = () => {
        this.currentSession = this.dataService.Storage().getInformacionUsuario();
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

    handleBuscar = () => {
        this.buscarLicencias();
    }

    loadData(pageIndex, pageSize): void {
        this.setRequest();
        if (
            this.request.idServidorPublico === null ||
            this.request.anio === null
        ) {
            this.dataService
                .Message()
                .msgWarning(
                    'Debe especificar por lo menos un criterio de búsqueda.',
                    () => { }
                );
        } else {
            this.dataSource.load(
                this.request,
                this.paginator.pageIndex + 1,
                this.paginator.pageSize
            );
        }
    }

    handleLimpiar(): void {
        this.resetForm();
    }

    resetForm = () => {
        this.form.reset();
    };

    handleNuevo = () => {
        if (
            this.servidorPublico?.idServidorPublico === null ||
            this.servidorPublico?.idServidorPublico === undefined ||
            this.servidorPublico?.idServidorPublico <= 0
        ) {
            this.dataService
                .Message()
                .msgWarning('Debe seleccionar un servidor público.', () => { });
            return;
        }

        if (this.servidorPublico?.codigoSituacionLaboral == SituacionLaboralEnum.cesante) {
            this.dataService.Message().msgWarning('Servidor público se encuentra cesado, no se puede registrar licencia.', () => { });
            return;
        }

        this.dialogRef = this.materialDialog.open(RegistraLicenciaOtraComponent, {
            panelClass: 'registra-licencia-otra-dialog',
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
                this.handleBuscar();
            }
        });
    };

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
            .Licencias()
            .exportatListaLicenciasOtras(this.request)
            .pipe(
                catchError((e) => of(null)),
                finalize(() => {
                    this.dataService.Spinner().hide('sp6');
                    this.export = false;
                })
            )
            .subscribe((response: any) => {
                if (response) {
                    saveAs(response, 'licencias.xlsx');
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

    handleEliminar = (row: any, i) => {

        this.dialogRef = this.materialDialog.open(InformacionLicenciaOtraComponent, {
            panelClass: 'informacion-licencia-otra-dialog',
            width: '1280px',
            disableClose: true,
            data: {
                idLicencia: row.idLicencia,
                eliminado: true,
                currentSession: this.currentSession
            },
        });
        this.dialogRef.afterClosed().subscribe((resp) => {
            if (resp?.grabado) {
                this.handleBuscar();
            }
        });
    }

    handleViewInfo = (row: any, i) => {
        this.dialogRef = this.materialDialog.open(InformacionLicenciaOtraComponent, {
            panelClass: 'informacion-licencia-otra-dialog',
            width: '1080px',
            disableClose: true,
            data: {
                idLicencia: row.idLicencia,
                eliminado: false,
            },
        });
        this.dialogRef.afterClosed().subscribe((resp) => {
            if (resp?.grabado) {
                this.handleBuscar();
            }
        });

    };

    handleEditar = (row: any, i) => {

        if (row?.codigoEstadoLicencia === EstadoLicenciaEnum.PENDIENTE_DE_PROYECTO || row?.codigoEstadoLicencia === EstadoLicenciaEnum.REGISTRADO) {
            this.dialogRef = this.materialDialog.open(RegistraLicenciaOtraComponent, {
                panelClass: 'registra-licencia-otra-dialog',
                width: '1280px',
                disableClose: true,
                data: {
                    action: 'editar',
                    idOperacion: TipoOperacionEnum.Modificar,
                    servidorPublico: this.servidorPublico,
                    idLicencia: row.idLicencia,
                    anio: row.anio,
                    licencia: row,
                    currentSession: this.currentSession
                },
            });
            this.dialogRef.afterClosed().subscribe((resp) => {
                if (resp?.grabado) {
                    this.handleBuscar();
                }
            });
        }
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
                    this.loadMotivoAccion();  
                    // this.buscarLicencias(); // commented
                }
            });
    }

    setRequest = () => {
        this.request = {
            idServidorPublico: this.idServidorPublico,
            anio: new Date().getFullYear(),
            idAccion: this.form.get('idAccion').value,
            idMotivoAccion: this.form.get('idMotivoAccion').value,
            idEstadoLicencia: this.form.get('idEstadoLicencia').value,
        };
    }

    buscarLicencias = () => {
        this.setRequest();
        if (
            this.request.idServidorPublico === null ||
            this.request.anio === null
        ) {
            this.dataService
                .Message()
                .msgWarning(
                    'Debe especificar por lo menos un criterio de búsqueda.',
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
    };

    loadAccion = () => {
        this.dataService
            .Licencias()
            .getAccion()
            .pipe(
                catchError(() => of([])),
                finalize(() => { })
            )
            .subscribe((resp: any) => {
                if (resp && resp.result) {
                    const data = resp.data.map((x) => ({
                        ...x,
                        value: x.idAccion,
                        label: `${x.descripcionAccion}`,
                    }));
                    this.comboLists.listAccion = data;
                }
            });
    };

    loadMotivoAccion = () => {
        // const idAccion = this.form.get('idAccion').value;
        const data = {
            idAccion: null,
            idGrupoAccion: GrupoAccionEnum.LICENCIAS,
            idRegimenLaboral: this.servidorPublico.idRegimenLaboral,
            codigoRolPassport: this.currentSession.codigoRol,
            activo: null,
        };
        this.dataService
            .Licencias()
            .getComboMotivosAccion(data)
            .pipe(
                catchError(() => of([])),
                finalize(() => { })
            )
            .subscribe((resp: any) => {
                if (resp && resp.result) {
                    const data = resp.data.map((x) => ({
                        ...x,
                        value: x.idMotivoAccion,
                        label: `${x.descripcionMotivoAccion}`,
                    }));
                    this.comboLists.listMotivoAccion = data;
                }
            });
    };

    loadEstadoLicencia = () => {
        this.dataService
            .Licencias()
            .getComboEstadoLicencia()
            .pipe(
                catchError(() => of([])),
                finalize(() => { })
            )
            .subscribe((resp: any) => {
                if (resp && resp.result) {
                    const data = resp.data.map((x) => ({
                        ...x,
                        value: x.idCatalogoItem,
                        label: `${x.descripcionCatalogoItem}`,
                    }));
                    this.comboLists.listEstadoLicencia = data;
                }
            });
    };

    handleRetornar = () => {
        this.router.navigate(['../../'], { relativeTo: this.route });
    }

    descargarResolucion = (row) => {
        const data = row;
        if (data.codigoDocumentoResolucion === null || data.codigoDocumentoResolucion === '00000000-0000-0000-0000-000000000000' ||
            data.codigoDocumentoResolucion === '') {
            this.dataService.Message().msgWarning('La licencia no tiene documento de resolución.', () => { });
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
                } else {
                    this.dataService.Message().msgWarning('No se pudo descargar resolución', () => { });
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

        if (data.anio === null && data.idServidorPublico === null) {
            this._loadingChange.next(false);
            this._dataChange.next([]);
        } else {
            this.dataService
                .Licencias()
                .getListaLicenciasOtras(data, pageIndex, pageSize)
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
                                'No se encontró información de la(s) licencia(s) para los criterios de búsqueda ingresados.',
                                () => { }
                            );
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
