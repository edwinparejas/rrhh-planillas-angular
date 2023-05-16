import { mineduAnimations } from '@minedu/animations/animations';
import { Component, OnInit, ViewEncapsulation, OnDestroy, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { DataSource } from '@angular/cdk/table';
import { BehaviorSubject, Observable, of, Subject } from 'rxjs';
import { DataService } from 'app/core/data/data.service';
import { catchError, delay, finalize, takeUntil, tap, take } from 'rxjs/operators';
import { CollectionViewer, SelectionModel } from '@angular/cdk/collections';
import { MatPaginator, MatPaginatorIntl } from '@angular/material/paginator';
import { ActivatedRoute, Router } from '@angular/router';
import { EstadoDesplazamientoEnum, MESSAGE_GESTION, ResultadoOperacionEnum, TipoDocumentosIdentidadActivoEnum } from '../_utils/constants';
import { MatDialog } from '@angular/material/dialog';
import { TablaPermisos } from '../../../../../core/model/types';
import { SecurityModel } from '../../../../../core/model/security/security.model';
import { descargarExcel } from 'app/core/utility/functions';
import { BuscarCentroTrabajoComponent } from '../components/buscar-centro-trabajo/buscar-centro-trabajo.component';
import { BuscadorServidorPublicoComponent } from '../components/buscador-servidor-publico/buscador-servidor-publico.component';
import { BuscarPlazaComponent } from '../components/buscar-plaza/buscar-plaza.component';
import { AccionesPersonalDesplazamiento, AccionPersonalModels } from '../models/desplazamiento.model';
import * as moment from 'moment';
import { DocumentViewerComponent } from 'app/main/apps/components/document-viewer/document-viewer.component';
import { MatPaginatorIntlCro } from 'app/core/data/resolvers/mat-paginator-intl-cro';
import { GenerarProyectoComponent } from '../components/generar-proyecto/generar-proyecto.component';
import { StorageService } from 'app/core/data/services/storage.service';
import { GenerarProyectoService } from '../components/generar-proyecto/generar-proyecto.service';
import { InformacionAccionPersonalPopupComponent } from '../components/informacion-accion-personal/components/informacion-accion-personal-popup/informacion-accion-personal-popup.component';
import { EntidadSedeService } from '../Services/entidad-sede.service';


@Component({
    selector: 'minedu-bandeja-desplazamiento',
    templateUrl: './bandeja-desplazamiento.component.html',
    styleUrls: ['./bandeja-desplazamiento.component.scss'],
    encapsulation: ViewEncapsulation.None,
    animations: mineduAnimations,
    providers: [{ provide: MatPaginatorIntl, useClass: MatPaginatorIntlCro }],
})
export class BandejaDesplazamientoComponent implements OnInit, OnDestroy {
    panelOpenState: boolean = false;
    verInformacion: boolean = false;
    form: FormGroup;
    // loading: false;
    export = false;
    now = new Date();
    minDate = new Date(this.now.getFullYear(), 0, 1);
    maxDate = new Date(this.now.getFullYear(), 11, 31);
    idAccionPersonal = 0;
    urlArchivoPDF = "";
    filtro: any = null;
    IDROLPASSPORT: string = null;
    IDNIVELINSTANCIA: string = null;
    comboLists = {
        listAnio: [],
        listRegimenlaboral: [],
        listEstadoProceso: [],
        listEstadosDesplazamiento: [],
        listMandatoJudicial: [],
        listGrupoAccion: [],
        listAccion: [],
        listMotivoAccion: [],
        listTipoDocumento: [],
        listCargaRemunerativa: [],
    };
    displayedColumns: string[] = [
        "seleccione",
        'registro',
        'codigo',
        'regimenLaboral',
        'proceso',
        'fechaCreacionProceso',
        'tipoDocumento',
        'documento',
        'apellidosNombres',
        'fechaInicio',
        'fechaFin',
        'etapa',
        'estado',
        'acciones'
    ];
    isMobile = false;
    dataSource: AscensoDataSource | null;
    selection = new SelectionModel<any>(true, []);
    paginatorPageSize = 10;
    paginatorPageIndex = 0;
    @ViewChild('paginator', { static: true })
    paginator: MatPaginator;

    AccionesPersonal: AccionPersonalModels = new AccionPersonalModels();
    eliminando = false;
    dialogRef: any;

    currentSession: SecurityModel = new SecurityModel();
    permisos = {
        autorizadoAgregar: false,
        autorizadoModificar: false,
        autorizadoEliminar: false,
        autorizadoEnviar: false,
        autorizadoExportar: false,
        autorizadoConsultar: false
    };
    hasAccessPage: boolean;
    estadosDesplazamientoEnum = EstadoDesplazamientoEnum;
    request: any = {
        anio: null,
        paginaActual: 1,
        tamanioPagina: 10,
    };

    private _unsubscribeAll: Subject<any>;
    constructor(
        private route: ActivatedRoute,
        private router: Router,
        private formBuilder: FormBuilder,
        private dataService: DataService,
        private materialDialog: MatDialog,
        private storageService: StorageService,
        private generarProyectoService: GenerarProyectoService,
        private entidadSedeService: EntidadSedeService

    ) {
        this._unsubscribeAll = new Subject();
    }

    ngOnInit(): void {
        this.cargarTodo();
    }

    private async cargarTodo() {
        this.visualizarProyectoResolucionAutomatico();
        this.buildSeguridad();
        this.buildForm();
        this.setConfPaginator();

        await this.setIdsRolCentroTrabajo();

        this.dataSource = new AscensoDataSource(this.dataService);
        this.resetForm();

        // if (!this.hasAccessPage) {
        //     this.dataService.Message().msgError('El rol asignado no tiene acceso a esta página.');
        // }

        await this.loadCargarCombos();
        this.primeraCarga();
    }

    private visualizarProyectoResolucionAutomatico() {

        this.generarProyectoService.visualizarProyectoResolucion$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe(documentoProyectoResolucion => {
                if (documentoProyectoResolucion) {
                    this.visualizarPdf({ documentoProyectoResolucion });
                    this.generarProyectoService.visualizarProyectoResolucion = null;
                }
            });
    }

    private async setIdsRolCentroTrabajo() {

        const { codigoSede } = this.entidadSedeService.entidadSede;
        const codigoRolPassport = this.currentSession.codigoRol;

        let isSuccess = true;
        const response = await this.dataService.AccionesPersonal()
            .getRolCentroTrabajo(codigoRolPassport, codigoSede)
            .pipe(
                catchError(() => { isSuccess = false; return of([]); }),
                finalize(() => { })
            )
            .toPromise();

        if (isSuccess && response) {
            this.IDROLPASSPORT = response?.rolPassport?.idRolPassport;
            this.IDNIVELINSTANCIA = response?.centroTrabajo?.idNivelInstancia;
        }
    }

    private primeraCarga() {
        const vigenciaInicio = null;
        const vigenciaFin = null;

        this.request = {
            ...this.form.value,
            vigenciaInicio,
            vigenciaFin,
            paginaActual: 1,
            tamanioPagina: 10,
        };

        this.paginator.page
            .pipe(
                delay(0),
                tap(() => this.loadData(
                    (this.paginator.pageIndex + 1).toString(),
                    this.paginator.pageSize.toString()
                )),
                takeUntil(this._unsubscribeAll)
            )
            .subscribe();

        this.form.controls['idMandatoJudicial'].setValue(-1);
        this.handleBuscar();
    }

    ngOnDestroy(): void {
        this._unsubscribeAll.next();
        this._unsubscribeAll.complete();
    }

    private setConfPaginator() {
        this.paginator.showFirstLastButtons = true;
        this.paginator._intl.itemsPerPageLabel = "Filas por tabla";
        this.paginator._intl.nextPageLabel = "Siguiente página";
        this.paginator._intl.previousPageLabel = "Página anterior";
        this.paginator._intl.firstPageLabel = "Primera página";
        this.paginator._intl.lastPageLabel = "Última página";

        this.paginator._intl.getRangeLabel = function (page, pageSize, length) {
            if (length === 0 || pageSize === 0) {
                return '0 de ' + length;
            }
            length = Math.max(length, 0);
            const startIndex = page * pageSize;
            // If the start index exceeds the list length, do not try and fix the end index to the end.
            const endIndex = startIndex < length ?
                Math.min(startIndex + pageSize, length) :
                startIndex + pageSize;
            return startIndex + 1 + ' - ' + endIndex + ' de ' + length;
        };
    }



    buildSeguridad = () => {
        this.currentSession = this.dataService.Storage().getInformacionUsuario();

        // if (!this.permisos.autorizadoAgregar && !this.permisos.autorizadoModificar &&
        //     !this.permisos.autorizadoEliminar && !this.permisos.autorizadoEnviar &&
        //     !this.permisos.autorizadoConsultar && !this.permisos.autorizadoExportar) {
        //     this.hasAccessPage = false;
        // } else {
        //     this.hasAccessPage = true;
        // }
        console.log("session", this.currentSession);
        console.log("passport", this.storageService.passport);
    }


    enviarProyectoResolucion(row) {

        this.dialogRef = this.materialDialog.open(GenerarProyectoComponent, {
            panelClass: 'minedu-ver-informacion-adjudicacion-dialog',
            width: '980px',
            disableClose: true,
            data: {
                abreviaturaRegimenLaboral: row.descripcionRegimenLaboral,
                abreviaturaGrupoAccion: row.descripcionGrupoAccion,
                abreviaturaAccion: row.descripcionAccion,
                abreviaturaMotivoAccion: row.descripcionMoitvoAccion,
                info: {
                    idAccionPersonal: row.idAccionPersonal,
                    fechaCreacion: new Date(),
                    usuarioCreacion: this.currentSession.nombreUsuario
                },
                esRegistro: false
            }
        });

        this.dialogRef
            .afterClosed()
            .subscribe((response) => {
                if (response?.isSuccess) {
                    this.handleBuscar();
                }
            });

    }

    private buildForm(): void {
        this.form = this.formBuilder.group({
            anio: [null],
            idRegimenLaboral: [-1],
            idGrupoAccion: [-1],
            idMandatoJudicial: [-1],
            idEstadoProceso: [-1],
            idEstadoDesplazamiento: [-1],
            idAccion: [-1],
            idMotivoAccion: [-1],
            descripcion: [null],
            idTipoDocumento: [-1],
            idCargaRemunerativa: [-1],
            codigoCentroTrabajo: [null, Validators.maxLength(10)],
            numeroDocumentoIdentidad: [null],
            codigoPlaza: [null],
            anioInicio: [null],
            anioFin: [null],
        });

        this.form.controls["idGrupoAccion"].disable();
        this.form.controls["idAccion"].disable();
        this.form.controls["idMotivoAccion"].disable();
        this.form.controls['anioFin'].disable();
        this.form.controls['numeroDocumentoIdentidad'].disable();

        this.form.controls['anioInicio'].valueChanges
            .pipe(takeUntil(this._unsubscribeAll)).subscribe(x => {
                this.form.controls['anioFin'].setValue(null);
                if (x) {
                    this.form.controls['anioFin'].enable();
                }
            });

        this.form.controls['anio'].valueChanges
            .pipe(takeUntil(this._unsubscribeAll)).subscribe(x => {
                const maxYear = this.form.controls['anio'].value;
                this.minDate = new Date(maxYear.getFullYear(), 0, 1);
                this.maxDate = new Date(maxYear.getFullYear(), 11, 31);

                this.form.controls['anioInicio'].setValue(null);
                this.form.controls['anioFin'].setValue(null);
                this.form.controls['anioFin'].disable();
            });
    }

    handleLimpiar(): void {
        this.resetForm();
    }

    handleBuscar(): void { this.buscarAccionDesplazamiento(); }
    handleGoPublicaciones = (row) => { this.router.navigate(['./publicacion/' + row.idEtapa], { relativeTo: this.route }); }
    handleGoPostulantes = (row) => { this.router.navigate(['./postulante/' + row.idEtapa], { relativeTo: this.route }); }
    handleGoCalificaciones = (row) => { this.router.navigate(['./calificacion/' + row.idProceso + '/' + row.idEtapa], { relativeTo: this.route }); }
    handleGoAdjudicaciones = (row) => { this.router.navigate(['./adjudicacion/' + row.idProceso], { relativeTo: this.route }); }
    handleGoPlazas = (row) => { this.router.navigate(['./plaza/' + row.idProceso], { relativeTo: this.route }); }


    buscarAccionDesplazamiento = (fistTime: boolean = false) => {
        this.setRequest();
        if (fistTime) {
            this.dataSource.load(this.request, 0, 10);

        } else {

            this.dataSource.load(
                this.request,
                this.paginator.pageIndex + 1,
                this.paginator.pageSize
            );
        }
    }


    loadData(pageIndex, pageSize): void {
        this.setRequest();
        this.dataSource.load(
            this.request,
            this.paginator.pageIndex + 1,
            this.paginator.pageSize
        );
    }

    resetForm = () => {
        //this.form.reset();
        this.form.clearValidators();
        this.form.get('anio').setValue(new Date());
        this.form.controls['idRegimenLaboral'].setValue(-1);
        this.form.controls['idGrupoAccion'].setValue(-1);
        this.form.controls['idAccion'].setValue(-1);
        this.form.controls['idMotivoAccion'].setValue(-1);
        this.form.controls['idMandatoJudicial'].setValue(-1);
        this.form.controls['idTipoDocumento'].setValue(-1);


        this.form.controls['idEstadoDesplazamiento'].setValue(-1);
        this.form.controls['anioInicio'].setValue(null);
        this.form.controls['anioFin'].setValue(null);
        //Limpiamos combos dependientes
        this.form.controls['anioFin'].disable();

        this.form.controls['numeroDocumentoIdentidad'].reset();
        this.form.controls['numeroDocumentoIdentidad'].disable();

        this.loadGrupoAccion(-1);
        this.loadAccion(-1);
        this.loadMotivoAccion(-1);

        //busqueda avanzada
        this.form.controls['codigoPlaza'].reset();
        this.form.controls['codigoCentroTrabajo'].reset();
        this.form.controls['idCargaRemunerativa'].reset();
    }

    /*============= CARGA DE COMBOS BUSCADOR =====================*/
    loadCargarCombos = async () => {
        await this.loadRegimenLaboral();
        await this.loadEstadosDesplazamiento();
        await this.loadMandatoJudicial();
        await this.loadTipoDocumento();
        await this.loadCargaRemunerativa();
        await this.loadGrupoAccion(-1);
        await this.loadAccion(-1);
        await this.loadMotivoAccion(-1);
    }

    loadRegimenLaboral = async () => {
        //IDROL E INSTANCIA
        let isSuccess = true;
        this.comboLists.listMotivoAccion = [];
        this.comboLists.listAccion = [];
        this.form.controls['idGrupoAccion'].setValue(-1);
        this.form.controls['idAccion'].setValue(-1);
        this.form.controls['idMotivoAccion'].setValue(-1);


        const response = await this.dataService.AccionesPersonal()
            .getComboRegimenLaboral(this.IDROLPASSPORT, this.IDNIVELINSTANCIA, true)
            .pipe(
                catchError(() => { isSuccess = false; return of([]); }),
                finalize(() => { })
            ).toPromise();

        if (isSuccess && response) {
            const data = response.map((x) => ({
                ...x,
                value: x.idRegimenLaboral,
                label: `${x.descripcionRegimenLaboral}`,
            }));
            this.comboLists.listRegimenlaboral = data;
        };
    }

    loadMandatoJudicial = async () => {
        let isSuccess = true;
        const response = await this.dataService.AccionesPersonal()
            .getComboMandatoJudicial()
            .pipe(
                catchError(() => { isSuccess = false; return of([]); }),
                finalize(() => { })
            ).toPromise();

        if (isSuccess && response) {
            const data = response.map((x) => ({
                ...x,
                value: x.idMandatoJudicial,
                label: `${x.descripcionMandatoJudicial}`,
            }));
            this.comboLists.listMandatoJudicial = data;
            this.form.controls['idMandatoJudicial'].setValue(-1);
        }
    }

    loadGrupoAccion = async (data) => {
        let isSuccess = true;
        this.form.controls['idGrupoAccion'].setValue(-1);
        this.form.controls['idAccion'].setValue(-1);
        this.form.controls['idMotivoAccion'].setValue(-1);

        this.form.controls['idGrupoAccion'].disable();
        this.form.controls["idAccion"].disable();
        this.form.controls["idMotivoAccion"].disable();

        this.comboLists.listMotivoAccion = [];
        this.comboLists.listGrupoAccion = [];

        if (data === -1) { return; }

        //Cargando Escala magisterial
        this.loadCargaRemunerativa();

        const response = await this.dataService.AccionesPersonal()
            .getComboGrupoAccion(data, this.IDROLPASSPORT, this.IDNIVELINSTANCIA, true)
            .pipe(
                catchError(() => { isSuccess = false; return of([]); }),
                finalize(() => { })
            ).toPromise();

        if (isSuccess && response) {
            const data = response.map((x) => ({
                ...x,
                value: x.idGrupoAccion,
                label: `${x.descripcionGrupoAccion}`,
            }));
            this.comboLists.listGrupoAccion = data;
            if (response?.length > 0) {
                this.form.controls["idGrupoAccion"].enable();
            }
        }
    }

    loadAccion = async (data) => {
        let isSuccess = true;
        this.form.controls['idAccion'].setValue(-1);
        this.form.controls['idMotivoAccion'].setValue(-1);
        this.form.controls["idMotivoAccion"].disable();

        this.form.controls["idAccion"].disable();
        this.comboLists.listAccion = [];

        if (+data === -1) { return; }
        const idRegimenLaboral = this.form.controls["idRegimenLaboral"].value;

        const response = await this.dataService.AccionesPersonal()
            .getComboAccion(data, this.IDROLPASSPORT, this.IDNIVELINSTANCIA, idRegimenLaboral, true)
            .pipe(
                catchError(() => { isSuccess = false; return of([]); }),
                finalize(() => { })
            ).toPromise();

        if (isSuccess && response) {
            const data = response.map((x) => ({
                ...x,
                value: x.idAccion,
                label: `${x.descripcionAccion}`,
            }));
            this.comboLists.listAccion = data;

            if (response?.length > 0) {
                this.form.controls["idAccion"].enable();
            }
        }
    }

    loadMotivoAccion = async (idAccion) => {
        this.form.controls['idMotivoAccion'].setValue(-1);
        this.form.controls["idMotivoAccion"].disable();

        if (+idAccion === -1) { return; }

        const idRegimenLaboral = this.form.controls["idRegimenLaboral"].value;
        const idGrupoAccion = this.form.controls["idGrupoAccion"].value;
        let isSuccess = true;

        const response = await this.dataService.AccionesPersonal()
            .getMotivoAccion(idAccion, this.IDROLPASSPORT, this.IDNIVELINSTANCIA, idRegimenLaboral, idGrupoAccion, true)
            .pipe(
                catchError(() => { isSuccess = false; return of([]); }),
                finalize(() => { })
            ).toPromise();

        if (isSuccess && response) {
            const data = response.map((x) => ({
                ...x,
                value: x.idMotivoAccion,
                label: `${x.descripcionMotivoAccion}`,
            }));
            this.comboLists.listMotivoAccion = data;

            if (response?.length > 0) {
                this.form.controls["idMotivoAccion"].enable();
            }
        }

    }

    loadEstadosDesplazamiento = async () => {
        let isSuccess = true;
        const response = await this.dataService.AccionesPersonal().
            getComboEstadosDesplazamiento()
            .pipe(
                catchError(() => { isSuccess = false; return of([]); }),
                finalize(() => { })
            ).toPromise();

        if (isSuccess && response) {
            const data = response.map((x) => ({
                ...x,
                value: x.codigoCatalogoItem,
                label: `${x.descripcionCatalogoItem}`,
            }));
            this.comboLists.listEstadosDesplazamiento = data;
        }
    }

    loadEstadoProceso = async () => {
        let isSuccess = true;
        const response = await this.dataService.Ascenso()
            .getComboEstadoProceso()
            .pipe(
                catchError(() => { isSuccess = false; return of([]); }),
                finalize(() => { })
            ).toPromise();

        if (isSuccess && response) {
            const data = response.map((x) => ({
                ...x,
                value: x.idCatalogoItem,
                label: `${x.descripcionCatalogoItem}`,
            }));
            this.comboLists.listEstadoProceso = data;
        }
    }

    loadTipoDocumento = async () => {
        let isSuccess = true;
        const response = await this.dataService.AccionesPersonal()
            .getComboTipoDocumento()
            .pipe(
                catchError(() => { isSuccess = false; return of([]); }),
                finalize(() => { })
            ).toPromise();

        if (isSuccess && response) {
            const data = response.map((x) => ({
                ...x,
                value: x.idCatalogoItem,
                label: `${x.descripcionCatalogoItem}`,
            }));
            this.comboLists.listTipoDocumento = data;
        }
    }

    loadCargaRemunerativa = async () => {
        let isSuccess = true;
        const idRegimenLaboralValue = this.form.controls["idRegimenLaboral"].value
        const idRegimenLaboral = idRegimenLaboralValue !== -1 ? idRegimenLaboralValue : null;

        const response = await this.dataService.AccionesPersonal()
            .getComboCargaRemunerativaPorRegimenLaboral(idRegimenLaboral)
            .pipe(
                catchError(() => { isSuccess = false; return of([]); }),
                finalize(() => { })
            ).toPromise();

        if (isSuccess && response) {
            const data = response.map((x) => ({
                ...x,
                value: x.idCategoriaRemunerativa,
                label: `${x.descripcionCategoriaRemunerativa}`,
            }));
            this.comboLists.listCargaRemunerativa = data;
        }
    }


    /*============= ********************* ===============*/

    handleNuevo = () => {
        // const idRegimenLaboral = this.form.controls["idRegimenLaboral"].value;
        this.router.navigate(['./registrar'], { relativeTo: this.route });
    }

    handleEditar = (row) => {
        console.log('editar', row)
        this.router.navigate(['./editar/' + row.idAccionPersonal], { relativeTo: this.route });
    }

    private detalleAccionPersonal = async (idAccionPersonal: number) => {

        this.dataService.Spinner().show("sp6");
        const response = await this.dataService.AccionesPersonal()
            .getInformacionPersonalAccion(idAccionPersonal)
            .pipe(
                catchError(() => of(null)),
                finalize(() => {
                    this.dataService.Spinner().hide("sp6");
                })
            ).toPromise();

        if (!response) return;
        return response;
    }


    private async verInformacionAccionPersonalPopup(idAccionPersonal: number, esEliminar: boolean = false) {
        const accionPersonalData = await this.detalleAccionPersonal(idAccionPersonal);

        if (!accionPersonalData) return;

        this.dialogRef = this.materialDialog.open(InformacionAccionPersonalPopupComponent, {

            panelClass: 'informacion-accion-personal-dialog',
            width: '980px',
            disableClose: true,
            data: { accionPersonalData, esEliminar }
        });

        if (!esEliminar) return;

        this.dialogRef.afterClosed().pipe(takeUntil(this._unsubscribeAll))
            .subscribe((response) => {
                if (response?.isSuccess) {
                    this.handleBuscar();
                }
            });
    }


    verInformacionAccionPersonal = (idAccionPersonal) => {
        this.verInformacionAccionPersonalPopup(idAccionPersonal);
    }

    eliminarAccionPersonal = (idAccionPersonal) => {
        this.verInformacionAccionPersonalPopup(idAccionPersonal, true);
    }

    handlePreview(file: any, codigoAdjuntoAdjunto: string) {
        console.log("mostrar pDF 2", file)
        this.dialogRef = this.materialDialog.open(DocumentViewerComponent, {
            panelClass: "modal-viewer-form-dialog",
            disableClose: true,
            data: {
                modal: {
                    icon: "remove_red_eye",
                    title: "Accion Grabada",
                    file: file,
                    fileName: codigoAdjuntoAdjunto,
                },
            },
        });
    }
    visualizarPdf(registro) {
        console.log("visualizar", registro.documentoProyectoResolucion)
        //var registro1 = "4/02817822-49d1-ec11-b81b-0050569005a4"
        console.log("pdf", registro);
        const codigoDocumentoReferencia = registro.documentoProyectoResolucion;
        if (codigoDocumentoReferencia === null) {
            this.dataService
                .Util()
                .msgWarning(
                    "LA ACCIÓN GRABADA NO TIENE DOCUMENTO ADJUNTO.",
                    () => { }
                );
            return true;
        }

        this.dataService.Spinner().show("sp6");
        this.dataService
            .Documento()
            .descargar(codigoDocumentoReferencia)
            .pipe(
                catchError((e) => of(null)),
                finalize(() => this.dataService.Spinner().hide("sp6"))
            )
            .subscribe(
                (data) => {
                    const nombreArchivo = registro.documentoProyectoResolucion + ".pdf";
                    this.handlePreview(data, nombreArchivo);
                    //saveAs(data, nombreArchivo);
                },
                (error) => {
                    this.dataService
                        .Util()
                        .msgWarning(
                            "NO SE ENCONTRÓ EL DOCUMENTO DE SUSTENTO",
                            () => { }
                        );
                }
            );
    }

    enviarAccionesGrabadas = (row) => {
        this.dataService.Message().msgConfirm('¿ESTÁ SEGURO DE QUE DESEA ENVIAR A ACCIONES GRABADAS?', async () => {
            this.idAccionPersonal = row.idAccionPersonal;
            var listAccion = new AccionesPersonalDesplazamiento();
            listAccion = {
                idAccionPersonal: this.idAccionPersonal
            }

            const { codigoSede, codigoTipoSede } = this.entidadSedeService.entidadSede;

            var accionesGrabadas = {
                usuarioCreacion: this.currentSession.nombreUsuario,
                numeroDocumentoIdentidad: this.currentSession.numeroDocumento,
                codigoTipoDocumentoIdentidad: this.currentSession.tipoNumeroDocumento,
                codigoTipoSede,
                codigoSede,
                accionesPersonalDesplazamiento: []
            };

            accionesGrabadas.accionesPersonalDesplazamiento.push(listAccion);
            this.dataService.Spinner().show("sp6");

            let isSuccess = true;
            var response = await this.dataService.AccionesPersonal()
                .enviarAccionesGrabadas(accionesGrabadas)

                .pipe(
                    catchError((err) => {
                        isSuccess = false;
                        this.dataService.Message().msgWarning(`"${err?.messages[0]}"`.toUpperCase());
                        return of(null);
                    }),
                    finalize(() => {
                        this.dataService.Spinner().hide("sp6");
                    })
                ).toPromise();

            if (isSuccess && response) {
                // this.AccionesPersonal = response;
                this.dataService.Message().msgSuccess('"SE ENVIÓ CORRECTAMENTE A ACCIONES GRABADAS."', () => {
                    this.handleBuscar();
                });
            }
        });
    }


    setRequest = () => {

        const { idDre, idUgel } = this.entidadSedeService.entidadSede;

        const idEstadoDesplazamiento = (this.comboLists.listEstadosDesplazamiento
            .find(x => x.codigoCatalogoItem == this.form.get('idEstadoDesplazamiento').value))?.idCatalogoItem ?? -1;

        const _vigenciaInicio = this.form.get('anioInicio').value;
        const _vigenciaFin = _vigenciaInicio && this.form.get('anioFin').value ? this.form.get('anioFin').value : null;

        const vigenciaInicio = _vigenciaInicio ? moment(_vigenciaInicio).format('DD-MM-YYYY') : null;
        let vigenciaFin = _vigenciaFin ? moment(_vigenciaFin).format('DD-MM-YYYY') : null;
        vigenciaFin = vigenciaFin !== "31-12-1969" ? vigenciaFin : null;

        this.request = {
            anio: this.form.get('anio').value.getFullYear(),
            idRegimenLaboral: this.form.get('idRegimenLaboral').value,
            idDre: idDre,
            idUgel: idUgel,
            idGrupoAccion: this.form.get('idGrupoAccion').value,
            idAccion: this.form.get('idAccion').value,
            idMotivoAccion: this.form.get('idMotivoAccion').value,
            idMandatoJudicial: this.form.get('idMandatoJudicial').value,
            idTipoDocumento: this.form.get('idTipoDocumento').value,
            numeroDocumentoIdentidad: this.form.get('numeroDocumentoIdentidad').value,
            idEstadoDesplazamiento,
            vigenciaInicio,
            vigenciaFin,
            codigoPlaza: this.form.get('codigoPlaza').value,
            codigoModular: this.form.get('codigoCentroTrabajo').value,
            idCargaRemunerativa: this.form.get('idCargaRemunerativa').value,
            paginaActual: 1,
            tamanioPagina: 10
        };
    }


    handleExportar = () => {
        this.setRequest();

        const data = this.dataSource.data;

        if (data.length === 0) {
            this.dataService.Message().msgWarning('"NO SE ENCONTRÓ INFORMACIÓN PARA EXPORTAR."');
            return;
        }
        this.dataService.Spinner().show("sp6");
        this.dataService.AccionesPersonal().exportarExcelAccionPersonal(this.request).pipe(
            catchError((e) => of(null)),
            finalize(() => {
                this.dataService.Spinner().hide("sp6");
            })
        )
            .subscribe((response: any) => {
                console.log("response", response)
                if (response) {
                    // saveAs(response, "Consolidado_Plazas.xlsx");
                    descargarExcel(response, 'accionPersonal.xlsx');
                } else {
                    this.dataService.Message().msgWarning('"NO SE GENERÓ CORRECTAMENTE EL ARCHIVO EXCEL DE CONSOLIDADO DE PLAZAS."');
                }
            });
    }

    onKeyPressNumeroDocumento(e: any): boolean {
        const _tipoDocumento = this.form.controls['idTipoDocumento'].value;
        if (_tipoDocumento == 1) {
            //------------ DNI
            const reg = /^\d+$/;
            const pressedKey = String.fromCharCode(!e.charCode ? e.which : e.charCode);
            if (!reg.test(pressedKey)) {
                e.preventDefault();
                return false;
            }
        } else if (_tipoDocumento != -1 && _tipoDocumento != null) {
            //------------ PASAPORTE O CARNET DE EXTRANJERIA
            var inp = String.fromCharCode(e.keyCode);

            if (/[a-zA-Z0-9]/.test(inp)) {
                return true;
            } else {
                e.preventDefault();
                return false;
            }
        }
    }

    onChangeTipoDocumento(): void {
        const idTipoDocumento = this.form.controls['idTipoDocumento'].value;
        this.form.controls['numeroDocumentoIdentidad'].setValue(null);
        if (idTipoDocumento == -1) {
            this.form.controls['numeroDocumentoIdentidad'].disable();
            return;
        }
        this.form.controls['numeroDocumentoIdentidad'].enable();
    }

    buscarCentrotrabajo(event) { }

    busquedaPersonalizada() {
        var codigoIngresado = this.form.controls["codigoCentroTrabajo"].value;

        if (codigoIngresado !== null && codigoIngresado !== "") {
            this.buscarCentrotrabajo(null);
            return;
        }
        const currentSession = this.dataService.Storage().getInformacionUsuario();

        const dialogRef = this.materialDialog.open(
            BuscarCentroTrabajoComponent,
            {
                panelClass: "buscar-centro-trabajo-form-dialog",
                width: "1300px",
                disableClose: true,
                data: {
                    action: "requerimiento",
                    idTipoOperacion: 0,//TablaTipoOperacion.REGISTRAR,
                    registrado: false,
                    currentSession
                },
            }
        );

        dialogRef.afterClosed()
            .pipe(
                take(1),
                takeUntil(this._unsubscribeAll)
            )
            .subscribe((response: any) => {
                const codigoCentroTrabajo = response?.centroTrabajo?.codigoCentroTrabajo;
                if (codigoCentroTrabajo) {
                    this.form.get('codigoCentroTrabajo').setValue(codigoCentroTrabajo);
                }
            });
    }
    //---Inicio Búsqueda servidor publico


    private async busquedaServPublicoServicio({ idRegimenLaboral, idTipoDocumentoIdentidad, numeroDocumentoIdentidad }) {
        const { codigoSede } = this.entidadSedeService.entidadSede;

        const request = {
            codigoSede,
            idRegimenLaboral,
            idTipoDocumentoIdentidad,
            numeroDocumentoIdentidad,
            buscarEnOtraSede: false
        };

        this.dataService.Spinner().show("sp6");
        return await this.dataService
            .AccionesPersonal()
            .getListarServidorPublico(request, 1, 10)
            .pipe(
                catchError((e) => of(null)),
                finalize(() => {
                    this.dataService.Spinner().hide("sp6");
                })
            ).toPromise();

    }


    busquedaPersonalizadaServidorPublicoEnter = async () => {
        const numeroDocumentoLength = (this.form.controls['numeroDocumentoIdentidad'].value || '').length;
        const dniLength = 8

        if ((this.form.get('idTipoDocumento').value == TipoDocumentosIdentidadActivoEnum.CARNET_EXTRANJERIA ||
            this.form.get('idTipoDocumento').value == TipoDocumentosIdentidadActivoEnum.PASAPORTE) &&
            numeroDocumentoLength < 9) {

            const errorMessage = MESSAGE_GESTION.EX08;

            setTimeout(() => {
                this.dataService.Message().msgWarning(`${errorMessage}`);
            }, 300);

            return false;
        }

        if (this.form.get('idTipoDocumento').value == TipoDocumentosIdentidadActivoEnum.DNI &&
            numeroDocumentoLength < dniLength) {
            const errorMessage = MESSAGE_GESTION.EX03;

            setTimeout(() => {
                this.dataService.Message().msgWarning(`${errorMessage}`);
            }, 300);

            return false;
        }

        const idRegimenLaboral = this.form.controls["idRegimenLaboral"].value;
        const idTipoDocumentoIdentidad = this.form.controls["idTipoDocumento"].value;
        const numeroDocumentoIdentidad = this.form.controls["numeroDocumentoIdentidad"].value;

        const servidorPublico = await this.busquedaServPublicoServicio({ idRegimenLaboral, idTipoDocumentoIdentidad, numeroDocumentoIdentidad });

        if (!servidorPublico) {
            this.dataService.Message().msgWarning("No se encontró información del servidor para los criterios de búsqueda ingresados.");
            return;
        }
    }

    busquedaPersonalizadaServidorPublico() {
        const selectedTipoDoc = this.form.controls["idTipoDocumento"].value;
        const selectedRegimen = this.form.controls["idRegimenLaboral"].value;
        const numeroDocumentoIdentidad = this.form.controls["numeroDocumentoIdentidad"].value;

        this.dialogRef = this.materialDialog.open(BuscadorServidorPublicoComponent, {
            panelClass: 'minedu-buscador-servidor-publico-dialog',
            disableClose: true,
            data: {
                action: 'busqueda',
                idTipoDocumentoSeleccionado: selectedTipoDoc,
                idRegimenLaboralSeleccionado: selectedRegimen,
                numeroDocumentoIdentidad
            }
        });
        this.dialogRef.afterClosed().subscribe((response) => {
            if (response != null) {
                const servidorPublico = response;
                this.form.controls["idTipoDocumento"].setValue(servidorPublico.idTipoDocumentoIdentidad);
                this.form.controls["numeroDocumentoIdentidad"].setValue(servidorPublico.numeroDocumentoIdentidad);
                this.form.controls["numeroDocumentoIdentidad"].enable();
            }
        });
    }


    buscarPlazaDialogo(event) {
        event.preventDefault();
        const codigoPlaza = this.form.get("codigoPlaza").value ?? null;
        // if (codigoPlaza) {
        //     this.buscarPlaza(event);
        //     return;
        // }
        const selectedRegimen = this.form.controls["idRegimenLaboral"].value;
        const currentSession = this.dataService.Storage().getInformacionUsuario();



        this.dialogRef = this.materialDialog.open(BuscarPlazaComponent, {
            panelClass: 'buscar-plaza-form-dialog',
            disableClose: true,
            data: {
                action: 'busqueda',
                idRegimenLaboralSeleccionado: selectedRegimen,
                codigoPlaza,
                currentSession
            },
        });

        this.dialogRef.afterClosed()
            .subscribe((response: any) => {
                if (!response) {
                    return;
                }
                // console.log('LLEGO DE PLAZA',response);
                this.form.patchValue({ codigoPlaza: response.codigoPlaza });
                this.form.get('codigoPlaza').setValue(response.codPlaza);
                // this.plaza = response;
            });
    }
    //--Fin Plaza
    isAllSelected() {
        const numSelected = this.selection?.selected?.length;
        const numRows = this.dataSource?.data?.length;
        return numSelected === numRows;
    }

    masterToggle() {
        this.isAllSelected()
            ? this.selection.clear()
            : this.dataSource.data.forEach((row) => this.selection.select(row));
    }

    checkboxLabel(row): string {
        if (!row) {
            return `${this.isAllSelected() ? "select" : "deselect"} all`;
        }
        return `${this.selection.isSelected(row) ? "deselect" : "select"} row ${row.position + 1
            }`;
    }

    enviarAccionesGrabadasMasivo() {


        const arrSelected = [... this.selection.selected];

        if (this.validarEstadoParaEnviarAccionesGrabadas(arrSelected)) {
            return;
        }

        if (this.selection.selected.length > 0) {
            this.dataService.Message().msgConfirm('¿ESTÁ SEGURO DE QUE DESEA ENVIAR A ACCIONES GRABADAS?', async () => {

                const { codigoTipoSede, codigoSede } = this.entidadSedeService.entidadSede;

                var accionesGrabadas = {
                    usuarioCreacion: this.currentSession.nombreUsuario,
                    numeroDocumentoIdentidad: this.currentSession.numeroDocumento,
                    codigoTipoDocumentoIdentidad: this.currentSession.tipoNumeroDocumento,
                    codigoTipoSede,
                    codigoSede,
                    accionesPersonalDesplazamiento: []
                };


                for (let i = 0; i < arrSelected.length; i++) {
                    var accionesEntity = new AccionesPersonalDesplazamiento();
                    accionesEntity = {
                        idAccionPersonal: arrSelected[i].idAccionPersonal
                    }

                    accionesGrabadas.accionesPersonalDesplazamiento.push(accionesEntity);
                }

                this.dataService.Spinner().show("sp6");
                let isSuccess = true;
                const _response = this.dataService.AccionesPersonal()
                    .enviarAccionesGrabadas(accionesGrabadas)
                    .pipe(
                        catchError((err) => {
                            isSuccess = false;
                            this.dataService.Message().msgWarning(`"${err.error?.messages[0]}"`.toUpperCase());
                            
                            return of(null);
                        }),
                        finalize(() => {
                            this.dataService.Spinner().hide("sp6");
                        })
                    ).toPromise();

                _response.then((response: any) => {
                    if (isSuccess && response) {
                        this.AccionesPersonal = response;
                        this.dataService.Message().msgSuccess('SE ENVIÓ CORRECTAMENTE A ACCIONES GRABADAS.', () => {
                            this.handleBuscar();
                            this.selection = new SelectionModel<any>(true, []);
                        });
                    }
                });
            });

        } else {
            this.dataService
                .Message()
                .msgWarning(
                    "DEBE SELECCIONAR POR LO MENOS UN REGISTRO PARA ENVIO A ACCIONES GRABADAS",
                    () => { }
                );
            this.selection = new SelectionModel<any>(true, []);
        }
    }

    validarEstadoParaEnviarAccionesGrabadas(filas) {
        console.log(filas);
        let registrosInvalidos = 0;
        for (let i = 0; i < filas.length; i++) {
            if (filas[i].estado != this.estadosDesplazamientoEnum.REGISTRADO && filas[i].estado != this.estadosDesplazamientoEnum.AUTORIZADO) {
                registrosInvalidos++;
            }
        }
        if (registrosInvalidos > 0) {
            this.dataService.Message().msgWarning("DEBE SELECCIONAR SOLO REGISTROS CON ESTADO REGISTRADO O AUTORIZADO PARA ENVIAR A ACCIONES GRABADAS", () => {
                this.selection = new SelectionModel<any>(true, []);
            });
        }
        return registrosInvalidos > 0;
    }

}
// verInformacionAccionPersonal = () => {

// }

export class AscensoDataSource extends DataSource<any> {
    private _dataChange = new BehaviorSubject<any>([]);
    private _loadingChange = new BehaviorSubject<boolean>(false);

    public loading = this._loadingChange.asObservable();
    public totalregistro = 0;

    constructor(private dataService: DataService) {
        super();
    }

    async load(data: any, pageIndex, pageSize): Promise<void> {
        this._loadingChange.next(true);
        this._dataChange.next([]);
        this.dataService.Spinner().show("sp6");
        if (data.tamanioPagina && data.paginaActual) {
            let isSuccess = true;
            var response = await this.dataService
                .AccionesPersonal()
                .getListarAccionPersonal(data, pageIndex, pageSize)
                .pipe(
                    catchError((e) => { isSuccess = false; return of(e); }),
                    finalize(() => {
                        this.dataService.Spinner().hide("sp6")
                        this._loadingChange.next(false);
                    })
                ).toPromise();

            if (isSuccess && response) {
                this._dataChange.next(response || []);
                this.totalregistro = (response || []).length === 0 ? 0 : response[0].totalregistro;
                console.log('totalregistro', this.totalregistro)
                if ((response || []).length === 0) {
                    this.dataService
                        .Message()
                        .msgWarning(
                            'NO SE ENCONTRÓ INFORMACIÓN DE DESPLAZAMIENTO(S) PARA LOS CRITERIOS DE BÚSQUEDA INGRESADOS.',
                            () => { }
                        );
                }
            }
            else if (response && response.statusCode === ResultadoOperacionEnum.NotFound) {
                this.dataService.Message().msgWarning(response.messages[0]);
            } else if (response && response.statusCode === ResultadoOperacionEnum.UnprocessableEntity) {
                this.dataService.Message().msgWarning(response.messages[0]);
            } else {
                this.dataService.Message().msgError('Ocurrieron algunos problemas al obtener la información.');
            }

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


