import { saveAs } from "file-saver";
import { CollectionViewer, SelectionModel } from '@angular/cdk/collections';
import { AfterViewInit, Component, OnDestroy, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { ActivatedRoute, Router } from '@angular/router';
import { DataService } from 'app/core/data/data.service';
import { ACCIONES_GRABADAS_MESSAGE } from 'app/core/model/message';
import { PASSPORT_MESSAGE } from 'app/core/model/messages-error';
import { MISSING_TOKEN, PassportRol, TablaEstadoAccionesGrabadas, TablaPermisos } from 'app/core/model/types';
import { DocumentViewerComponent } from 'app/main/apps/components/document-viewer/document-viewer.component';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { catchError, finalize, tap } from 'rxjs/operators';
import { DataSource } from "@angular/cdk/table";
import { mineduAnimations } from "@minedu/animations/animations";
import { environment } from "environments/environment";
import { throwToolbarMixedModesError } from "@angular/material/toolbar";
import { descargarExcel } from "app/core/utility/functions";
import { StorageService } from "app/core/data/services/storage.service";
import { AccesoUsuario } from "../Models/accionesGrabadas.model";
import { CriteriosBusquedaAccionesGrabadasComponent } from "../Components/criterios-busqueda-acciones-grabadas/criterios-busqueda-acciones-grabadas.component";
import { CODIGO_SISTEMA_PERSONAL } from "../_utils/constants";
import { ModalMotivoEliminacionComponent } from "../Components/modal-motivo-eliminacion/modal-motivo-eliminacion.component";
import { ModalGenerarProyectoResolucionComponent } from "../Components/modal-generar-proyecto-resolucion/modal-generar-proyecto-resolucion.component";
import { ModalEliminarAccionGrabadaComponent } from "../Components/modal-eliminar-accion-grabada/modal-eliminar-accion-grabada.component";
import { ModalVistaInformacionComponent } from "../Components/modal-vista-informacion/modal-vista-informacion.component";
import { EntidadSedeService } from "../Services/entidad-sede.service";
import { SecurityModel } from "app/core/model/security/security.model";

@Component({
  selector: 'minedu-bandeja-acciones-grabadas',
  templateUrl: './bandeja-acciones-grabadas.component.html',
  styleUrls: ['./bandeja-acciones-grabadas.component.scss'],
  encapsulation: ViewEncapsulation.None,
  animations: mineduAnimations,
})
export class BandejaAccionesGrabadasComponent implements OnInit, OnDestroy, AfterViewInit {

    maxDate = new Date();
    now = new Date();
    formBusqueda: any = null;
    working = true;
    export = false;
    Acceso:AccesoUsuario={
        GENERAR_PROYECTO_INDIVIDUAL:false,
        GENERAR_PROYECTO_MASIVO:false,
        ELIMINAR_ACCION_GRABADA:false
    };

    displayedColumns: string[] = [
        "seleccione",
        "regimenLaboralDes",
        "grupoAccion",
        "accion",
        "motivoAccion",
        "esMandatoJudicial",
        "codigoPlaza",
        "documento",
        "apellidosYNombres",
        "fechaInicio",
        "fechaFin",
        "codigoEstadoAccionGrabada",
        "acciones",
    ];

    dialogRef: any;
    dataSource: AccionesGrabadasDataSource | null;
    paginatorPageSize = 10;
    paginatorPageIndex = 0;
    selection = new SelectionModel<any>(true, []);
    @ViewChild(MatPaginator, { static: true })
    paginator: MatPaginator;
    motivo_accion_rectificar: string = "RECTIFICAR";
    estadoPendienteDeProyecto = TablaEstadoAccionesGrabadas.PENDIENTE_DE_PROYECTO;
    estadoCreandoProyecto = TablaEstadoAccionesGrabadas.CREANDO_PROYECTO;
    estadoEnProyecto = TablaEstadoAccionesGrabadas.EN_PROYECTO;
    estadoEliminado = TablaEstadoAccionesGrabadas.ELIMINADO;
    estadoConResolucion = TablaEstadoAccionesGrabadas.CON_RESOLUCION;
    tienePermisoExportar: boolean = false;
    esProyectoIndividual: boolean;
    toolTipErrorProyectoResolucion: string = ACCIONES_GRABADAS_MESSAGE.GENERAR_PROYECTO_RESOLUCION;

    currentSession: SecurityModel = new SecurityModel();
    idDreLogueado: number = null;
    idUgelLogueado: number = null;
    puedeCrearProyectoResolucion: boolean = false;

    dialogRefPreview: any;   
    @ViewChild('criteriosBusqueda') CriteriosBusquedaAccionesGrabadasComponent: CriteriosBusquedaAccionesGrabadasComponent;
    constructor(
        private dataService: DataService,
        private router: Router,
        private route: ActivatedRoute,
        private materialDialog: MatDialog,
        private entidadSedeService: EntidadSedeService
    ) { }

     ngOnInit() {
        this.cargarTodo();

        setTimeout(() => {
            this.loadBusqueda(); 
        }, 2000);
        
    }
    private async cargarTodo() {

        this.formBusqueda = { 
            ...this.formBusqueda,
            anio: this.now.getFullYear(), 
            sistema :CODIGO_SISTEMA_PERSONAL
        };
        
        this.currentSession = this.dataService.Storage().getInformacionUsuario();
        await this.setIdsRolCentroTrabajo();

        this.datosSede();
        this.accesousuario();

        this.dataSource = new AccionesGrabadasDataSource(this.dataService);

        this.paginator.showFirstLastButtons = true;
        this.paginator._intl.itemsPerPageLabel = 'Registros por página';
        this.paginator._intl.nextPageLabel = "Siguiente página";
        this.paginator._intl.previousPageLabel = "Página anterior";
        this.paginator._intl.firstPageLabel = "Primera página";
        this.paginator._intl.lastPageLabel = "Última página";
        this.paginator._intl.getRangeLabel = (page: number, pageSize: number, length: number) => {
            if (length === 0 || pageSize === 0) {return `0 of ${length}`;}
            const length2 = Math.max(length, 0);
            const startIndex = page * pageSize;
            const endIndex = startIndex < length2 ? Math.min(startIndex + pageSize, length2) : startIndex + pageSize;
            return `${startIndex + 1} – ${endIndex} de ${length2}`;
        }
    }
    private async setIdsRolCentroTrabajo() {
        this.currentSession.codigoSede=this.entidadSedeService.entidadSede.codigoSede;
        this.currentSession.codigoTipoSede=this.entidadSedeService.entidadSede.codigoTipoSede;
    }
    // obtenerCodigoDreUgelLogeado() {  
    //     const rolSelected = this.dataService.Storage().getPassportRolSelected();
    //     const sedeSeleccionado = rolSelected.CODIGO_SEDE;
    //     this.dataService
    //         .AccionesGrabadas()
    //         .getObtenerCodigoDreUgel(sedeSeleccionado)
    //         .pipe(
    //             catchError((e) => of(e)),
    //             finalize(() => {
    //                 this.dataService.Spinner().hide("sp6");
    //             })
    //         )
    //         .subscribe((response) => {
    //             if (response) {
    //                 this.idDreLogueado = response.idDre;
    //                 this.idUgelLogueado = response.idUgel;
    //             } else if (response && (response.statusCode === 422 || response.statusCode === 404)) {
    //                 this.dataService
    //                     .Util()
    //                     .msgWarning(response.messages[0], () => { });
    //             } else if (response && (response.statusCode === 401 || response.error === MISSING_TOKEN.INVALID_TOKEN)) {
    //                 this.dataService.Message().msgInfo(PASSPORT_MESSAGE.SESION_END, () => { this.dataService.Storage().passportUILogin(); });
    //             } else {

    //             }
    //         });
    // }

    
    // validarMostrarControlesPermitidos() {
    //     const rolSelected = this.dataService.Storage().getPassportRolSelected();
    //     const solSeleccionado = rolSelected.CODIGO_ROL;

    //     if (solSeleccionado == PassportRol.RESPONSABLE_PERSONAL) {
    //         this.puedeCrearProyectoResolucion = true;
    //     }      

    //     if (solSeleccionado == PassportRol.ESPECIALISTA_DE_RACIONALIZACION) {
    //         this.puedeCrearProyectoResolucion = true;
    //     }
    // }


    // formularioBusquedaSeteado: any;

    buscar(data: any) {
        if (data.isClean) {
            this.formBusqueda = null;
            return;
        }
        this.selection = new SelectionModel<any>(true, []);
        // this.formularioBusquedaSeteado = data;
        
        this.formBusqueda = {
            ...this.formBusqueda,
            anio: data.form.anio.getFullYear(),
            fechaInicio: data.form.fechaVigenciaInicio,
            fechaFin: data.form.fechaVigenciaFin,
            idTipoDocumento: data.form.idTipoDocumentoIdentidad,
            numeroDocumento: data.form.numeroDocumentoIdentidad,
            codigoPlaza: data.form.idCodigoPlaza,
            idRegimenLaboral: data.form.idRegimenLaboral,
            idGrupoAccion: data.form.idGrupoAccion,
            idAccion: data.form.idAccion,
            idMotivoAccion: data.form.idMotivoAccion,
            esMandatoJudicial: data.form.esMandatoJudicial,
            idEstado: data.form.idEstadoAccionGrabada,
            butonAccion:data.form.butonAccion,
            // idNivelInstancia: data.form.idNivelInstancia,
            // idDre: data.form.idDre,
            // idUgel: data.form.idUgel,
            // idOtraInstancia: data.form.idOtraInstancia,
            // idInstancia : data.form.idInstancia,
            // idSubInstancia: data.form.idSubInstancia
        };
        this.dataSource.load(this.formBusqueda, (this.paginator.pageIndex + 1), this.paginator.pageSize??this.paginatorPageSize);
    }

    ngAfterViewInit() {
        this.paginator.page.pipe(tap(() => this.loadBusqueda())).subscribe();
    }

    loadBusqueda() {   
        
        // if(this.formBusqueda.idNivelInstancia==undefined){
        //     this.dataService.Message().msgWarning('"NO SE PUDO OBTENER LA INSTANCIA"', () => { });
        //     return;
        // }

        this.dataSource.load(this.formBusqueda, (this.paginator.pageIndex + 1), this.paginator.pageSize??this.paginatorPageSize);
    }

    datosSede(){
        
        const data={
            codigoSede: this.currentSession.codigoSede,
            activo:true
        }
        this.dataService
            .AccionesGrabadas()
            .obtenerCentroTrabajoPorCodigoSede(data).pipe(catchError((e) => of([e])),
            finalize(() => {})
        )
        .subscribe((response) => {  
            if(response){      
                this.formBusqueda = {
                    ...this.formBusqueda,
                    idNivelInstancia: response.codigoNivelInstancia,
                    idDre: response.idDre,
                    idUgel: response.idUgel,
                    idOtraInstancia: response.idOtraInstancia
                };

                this.idUgelLogueado = response.idUgel; 
                this.idDreLogueado = response.idDre;
            }
            else{
                this.dataService.Message().msgWarning('"NO SE PUDO OBTENER LOS DATOS DEL USUARIO LOGUEADO."', () => { });
            }
        });
    }

    accesousuario(){
        const data={
            codTipoSede: this.currentSession.codigoTipoSede,
            codRol:this.currentSession.codigoRol
        }
        
        this.dataService
            .AccionesGrabadas()
            .obtenerAccesoUsuario(data).pipe(catchError((e) => of([e])),
            finalize(() => {})
        )
        .subscribe((response) => {   
            this.Acceso = {
                GENERAR_PROYECTO_INDIVIDUAL:response.generaR_PROYECTO_INDIVIDUAL,
                GENERAR_PROYECTO_MASIVO:response.generaR_PROYECTO_MASIVO,
                ELIMINAR_ACCION_GRABADA:response.eliminaR_ACCION_GRABADA
            };
        });
    }

    create() {
        this.router.navigate(["./create"], { relativeTo: this.route });
    }

    private handleCreate() {
        this.router.navigate(["./create"], { relativeTo: this.route });
    }

    private validDownload(accionGrabada) {
        if (!accionGrabada.codigoDocumentoResolucion) {
            this.dataService.Message().msgWarning('"EL REGISTRO NO TIENE DOCUMENTO ADJUNTADO."', () => { });
            return;
        }
        this.dataService.Spinner().show('sp6');
        this.dataService
            .Documento()
            .descargar(accionGrabada.codigoDocumentoResolucion)
            .pipe(
                catchError((e) => { return of(e); }),
                finalize(() => this.dataService.Spinner().hide("sp6"))
            ).subscribe((response) => {
                if (response ) {
                    this.handlePreview(response, accionGrabada.codigoDocumentoResolucion);
                } else {
                    this.dataService.Message().msgWarning('"NO SE PUDO DESCARGAR EL DOCUMENTO DE PROYECTO RESOLUCIÓN"', () => { });
                }
            });
    }

    private validMotivoEliminacion(accionGrabada){
        this.dialogRef = this.materialDialog.open(
            ModalMotivoEliminacionComponent,
            {
                panelClass: "modal-motivo-eliminacion-dialog",
                width: '480px',
                disableClose: true,
                data: {
                    detalleMotivo: accionGrabada.motivoEliminacion
                },
            }
        ).afterClosed().subscribe((response: any) => {
            
        });
    }

    private handlePreview(file: any, codigoAdjuntoAdjunto: string) {
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

        this.dialogRef.afterClosed().subscribe((response: any) => {
            if (!response) {
                return;
            }
        });
    }

    handleModalGenerarProyectoResolucionIndividual(accionGrabadaSeleccionada) {
        
        //seteamos que es una llamada desde una accion grabada para Proyecto resolucion INDIVIDUAL
        this.esProyectoIndividual = true;

        const lstAccionesGrabadasSeleccionadas = [
            {
                idAccionGrabada: accionGrabadaSeleccionada.idAccionGrabada,
                idRegimenLaboral: accionGrabadaSeleccionada.idRegimenLaboral,
                regimenLaboralDes: accionGrabadaSeleccionada.regimenLaboralDes,
                idGrupoAccion: accionGrabadaSeleccionada.idGrupoAccion,
                grupoAccion: accionGrabadaSeleccionada.grupoAccion,
                idAccion: accionGrabadaSeleccionada.idAccion,
                accion: accionGrabadaSeleccionada.accion,
                idMotivoAccion: accionGrabadaSeleccionada.idMotivoAccion,
                motivoAccion: accionGrabadaSeleccionada.motivoAccion,
                codigoPlaza: accionGrabadaSeleccionada.codigoPlaza,
                idDetalleAccionGrabada: accionGrabadaSeleccionada.idDetalleAccionGrabada,
                esLista: accionGrabadaSeleccionada.esLista,
                esMandatoJudicial: accionGrabadaSeleccionada.esMandatoJudicial,
                codigoTipoDocumentoIdentidad: accionGrabadaSeleccionada.codigoTipoDocumentoIdentidad,
                numeroDocumentoIdentidad: accionGrabadaSeleccionada.numeroDocumentoIdentidad,
            },
        ];

        this.validarAccionesGrabadasYMostrarModal(lstAccionesGrabadasSeleccionadas);
    };

    handleModalGenerarProyectoResolucionMasivo() {
        
        if (this.validarEstadoParaGenerarProyecto(this.selection.selected)) {
            return;
        }
        this.esProyectoIndividual = false;

        if (this.selection.selected.length > 0) {
            let lstAccionesGrabadasSeleccionadas: any[] = [];
            for (let i = 0; i < this.selection.selected.length; i++) {
                const itemAccionesGrabadasSeleccionadas = {
                    idAccionGrabada: this.selection.selected[i].idAccionGrabada,
                    idRegimenLaboral: this.selection.selected[i].idRegimenLaboral,
                    regimenLaboralDes: this.selection.selected[i].regimenLaboralDes,
                    idGrupoAccion: this.selection.selected[i].idGrupoAccion,
                    grupoAccion: this.selection.selected[i].grupoAccion,
                    idAccion: this.selection.selected[i].idAccion,
                    accion: this.selection.selected[i].accion,
                    idMotivoAccion: this.selection.selected[i].idMotivoAccion,
                    motivoAccion: this.selection.selected[i].motivoAccion,
                    codigoPlaza: this.selection.selected[i].codigoPlaza,
                    idDetalleAccionGrabada: this.selection.selected[i].idDetalleAccionGrabada,
                    esLista: this.selection.selected[i].esLista,
                    esMandatoJudicial: this.selection.selected[i].esMandatoJudicial,
                    codigoTipoDocumentoIdentidad: this.selection.selected[i].codigoTipoDocumentoIdentidad,
                    numeroDocumentoIdentidad: this.selection.selected[i].numeroDocumentoIdentidad,
                };

                lstAccionesGrabadasSeleccionadas.push(itemAccionesGrabadasSeleccionadas);
            }

            this.validarAccionesGrabadasYMostrarModal(lstAccionesGrabadasSeleccionadas);


        } else {
            this.dataService
                .Message()
                .msgWarning(
                    ACCIONES_GRABADAS_MESSAGE.M91,
                    () => { }
                );
        }
        this.selection = new SelectionModel<any>(true, []);
    }

    validarEstadoParaGenerarProyecto(filas) {
        let repetidos = 0;
        for (let i = 0; i < filas.length; i++) {
            if (filas[i].codigoEstadoAccionGrabada != this.estadoPendienteDeProyecto) {
                repetidos++;
            }
        }
        if (repetidos > 0) {
            this.dataService.Message().msgWarning('"DEBE SELECCIONAR SOLO ACCIONES GRABADAS CON ESTADO PENDIENTE DE PROYECTO"', () => {
                this.selection = new SelectionModel<any>(true, []);
            });
        }
        return repetidos > 0;
    }

    validarAccionesGrabadasYMostrarModal(lstAccionesGrabadasSeleccionadas) {

        let datosAccion: any;
        this.dataService.Spinner().show("sp6");

        this.dataService
            .AccionesGrabadas()
            .postValidarAccionesGrabadasParaGenerarProyecto(lstAccionesGrabadasSeleccionadas, this.idUgelLogueado, this.idDreLogueado)
            .pipe(
                catchError((e) => of(e)),
                finalize(() => {
                    this.dataService.Spinner().hide("sp6");
                })
            )
            .subscribe((response) => {
                if (response) {                    
                    if (response.valido) {
                        datosAccion = {
                            regimenLaboral: response.regimenLaboral,
                            grupoAccion: response.grupoAccion,
                            accion: response.accion,
                            motivoAccion: response.motivoAccion,

                            codigoRegimenLaboral: response.codigoRegimenLaboral,
                            codigoGrupoAccion: response.codigoGrupoAccion,
                            codigoAccion: response.codigoAccion,
                            codigoMotivoAccion: response.codigoMotivoAccion,
                            codigoUgel: response.codigoUgel,
                            codigoDre: response.codigoDre,

                            esMandatoJudicial: response.esMandatoJudicial
                        };
                        this.mostrarModalGenerarProyectoResolucion(lstAccionesGrabadasSeleccionadas, datosAccion);
                    } else {
                        this.dataService.Message()
                            .msgWarning('"'+response.mensaje.toUpperCase()+'"', () => { });
                    }
                } else if (
                    response &&
                    (response.statusCode === 422 ||
                        response.statusCode === 404)
                ) {
                    this.dataService
                        .Util()
                        .msgWarning(response.messages[0], () => { });
                } else if (response && (response.statusCode === 401 || response.error === MISSING_TOKEN.INVALID_TOKEN)) {
                    this.dataService.Message().msgInfo(PASSPORT_MESSAGE.SESION_END, () => { this.dataService.Storage().passportUILogin(); });
                } else {
                    this.dataService
                        .Util()
                        .msgError(
                            '"OCURRIERON ALGUNOS PROBLEMAS AL GUARDAR LOS DOCUMENTOS DE SUSTENTO, POR FAVOR INTENTE DENTRO DE UNOS SEGUNDOS, GRACIAS."',
                            () => { }
                        );
                }
            });
    }



    mostrarModalGenerarProyectoResolucion(pLstAccionesGrabadasSeleccionadas, pDatosAccion) {
        const anioPasado = 2021;
        this.dialogRef = this.materialDialog.open(
            ModalGenerarProyectoResolucionComponent,
            {
                panelClass: "modal-generar-proyecto-resolucion-form-dialog",
                disableClose: true,
                data: {
                    anioPasado: anioPasado,
                    anio:this.formBusqueda.anio,
                    anioConfigurado: null,
                    datosIged: [],
                    title: "Generar proyecto de resoluci&oacute;n",
                    tiposResolucion: [],
                    datopasado: "pasando valorrrr",
                    accionesGrabadas: pLstAccionesGrabadasSeleccionadas,
                    datosAccion: pDatosAccion,
                    esProyectoIndividual: this.esProyectoIndividual,
                    currentSession: this.currentSession
                },
            }
        )
            .afterClosed().subscribe((response: any) => {
                if(response!=undefined){
                this.selection = new SelectionModel<any>(true, []);
                if (this.esProyectoIndividual) {
                    //@llamar al presivualizar
                    var proyectoResol = {
                        codigoDocumentoResolucion: response.documentoProyectoResolucion
                    }
                    this.validDownload(proyectoResol);
                }
                this.loadBusqueda();
                }
            });
    }

    mostrarModalEliminarAccionGrabada(fila) {
        const idAccionGrabada = fila.idAccionGrabada;
        this.dialogRef = this.materialDialog.open(
            ModalEliminarAccionGrabadaComponent,
            {
                panelClass: "modal-eliminar-accion-grabada-form-dialog",
                disableClose: true,
                data: {
                    title: "Eliminar acci&oacute;n grabada",
                    idAccionGrabada: fila.idAccionGrabada
                },
            }
        ).afterClosed().subscribe((response: any) => {
            this.loadBusqueda();
        });

    }


    exportar() {
        if (this.dataSource.dataTotal == 0) {
            this.dataService
                .Message()
                .msgWarning(
                    ACCIONES_GRABADAS_MESSAGE.M73,
                    () => { }
                );
            return;
        }

        let data=this.CriteriosBusquedaAccionesGrabadasComponent.exportarData();
        
        /* */
        if (data.isClean) {
            this.formBusqueda = null;
            return;
        }

        // this.formularioBusquedaSeteado = data;
        this.formBusqueda = {
            ...this.formBusqueda,
            anio: data.form.anio.getFullYear(),
            fechaInicio: data.form.fechaVigenciaInicio,
            fechaFin: data.form.fechaVigenciaFin,
            idTipoDocumento: data.form.idTipoDocumentoIdentidad,
            numeroDocumento: data.form.numeroDocumentoIdentidad,
            codigoPlaza: data.form.idCodigoPlaza,
            idRegimenLaboral: data.form.idRegimenLaboral,
            idGrupoAccion: data.form.idGrupoAccion,
            idAccion: data.form.idAccion,
            idMotivoAccion: data.form.idMotivoAccion,
            esMandatoJudicial: data.form.esMandatoJudicial,
            idEstado: data.form.idEstadoAccionGrabada,
            // idNivelInstancia: data.form.idNivelInstancia,
            // idDre: data.form.idDre,
            // idUgel: data.form.idUgel,
            // idOtraInstancia: data.form.idOtraInstancia,
            // idInstancia : data.form.idInstancia,
            // idSubInstancia: data.form.idSubInstancia
        };

       debugger

        const dd = this.now.getDate();
        const mm = this.now.getMonth() + 1;
        const yyyy = this.now.getFullYear();
        let nombreExcel = `accionesgrabadas-${this.formBusqueda.anio}-${dd}-${mm}-${yyyy}.xlsx`;

        this.formBusqueda.sistema = Number(this.formBusqueda.sistema || 0);
        this.formBusqueda.anio = Number(this.formBusqueda.anio || 0);
        this.formBusqueda.idTipoDocumento = Number(this.formBusqueda.idTipoDocumento || 0);
        this.formBusqueda.idRegimenLaboral = Number(this.formBusqueda.idRegimenLaboral || 0);
        this.formBusqueda.idGrupoAccion = Number(this.formBusqueda.idGrupoAccion || 0);
        this.formBusqueda.idAccion = Number(this.formBusqueda.idAccion || 0);
        this.formBusqueda.idMotivoAccion = Number(this.formBusqueda.idMotivoAccion || 0);
        this.formBusqueda.idEstado = Number(this.formBusqueda.idEstado || 0);
        this.formBusqueda.esMandatoJudicial= Number(this.formBusqueda.esMandatoJudicial || 0);

        this.dataService.Spinner().show("sp6");
        this.dataService.AccionesGrabadas().exportar(this.formBusqueda).pipe(catchError((error) => {
            let errorResult=JSON.parse(error.error);
            this.dataService.Message().msgWarning('"'+errorResult.messages[0].toUpperCase()+'"');
            return of(null);
        }), finalize(() => {
                this.dataService.Spinner().hide("sp6");
        })).subscribe((response:any) => {
                if (response) {
                    descargarExcel(response, nombreExcel);
                }
            });
    }

    ngOnDestroy(): void { }

    isAllSelected() {
        const numSelected = this.selection.selected.length;
        const numRows = this.dataSource.data.length;
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

    descargar(registro) {
        const codigoDocumentoReferencia = registro.codigoDocumentoResolucion;
        if (codigoDocumentoReferencia === null) {
            this.dataService
                .Util()
                .msgWarning(
                    "La accion grabada no tiene documento adjunto.",
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
                    const nombreArchivo = registro.codigoDocumentoResolucion + ".pdf";
                    saveAs(data, nombreArchivo);
                },
                (error) => {
                    this.dataService
                        .Util()
                        .msgWarning(
                            "No se encontro el documento de sustento",
                            () => { }
                        );
                }
            );
    }

    handleVistaProyecto(fila){
        const idAccionGrabada = fila.idAccionGrabada;
        this.dialogRef = this.materialDialog.open(
            ModalVistaInformacionComponent,
            {
                panelClass: "modal-vista-informacion-dialog",
                width: "1000px",
                disableClose: true,
                data: {
                    title: "Vista informaci&oacute;n",
                    idAccionGrabada: fila.idAccionGrabada
                },
            }
        ).afterClosed().subscribe((response: any) => {
            this.loadBusqueda();
        });
    }
}

export class AccionesGrabadasDataSource extends DataSource<any> {
    private _dataChange = new BehaviorSubject<any>([]);
    private _totalRows = 0;
    private _loadingChange = new BehaviorSubject<boolean>(false);

    public loading = this._loadingChange.asObservable();

    constructor(private dataService: DataService) {
        super();
    }

    load(data: any, pageIndex: number, pageSize: number) {
        this._loadingChange.next(true);
        this.dataService.Spinner().show("sp6");
        this.dataService
            .AccionesGrabadas()
            .getAccionesGrabadas(data, pageIndex, pageSize)
            .pipe(catchError((error) => {
                this.dataService.Message().msgWarning('"'+error.messages[0].toUpperCase()+'"');
                return of(null);
            }), finalize(() => {
                this.dataService.Spinner().hide("sp6");
                this._loadingChange.next(false);
            })).subscribe((result: any) => {
                this._dataChange.next(result || []);
                this._totalRows = (result || []).length === 0 ? 0 : result[0].total;
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