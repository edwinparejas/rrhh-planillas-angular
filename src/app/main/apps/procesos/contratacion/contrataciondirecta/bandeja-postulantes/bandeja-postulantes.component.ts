import { Component, OnInit, ViewEncapsulation, ViewChild } from "@angular/core";
import { FormBuilder, FormGroup } from "@angular/forms";
import { MatDialog } from "@angular/material/dialog";
import { DataService } from "app/core/data/data.service";
import { ActivatedRoute, Router } from "@angular/router";
import { MatPaginator } from "@angular/material/paginator";
import { CollectionViewer, DataSource } from "@angular/cdk/collections";
import { mineduAnimations } from "../../../../../../../@minedu/animations/animations";
import { SharedService } from "../../../../../../core/shared/shared.service";
import { BehaviorSubject, of, Observable } from "rxjs";
import { catchError, finalize, tap } from "rxjs/operators";
import { EstadoEtapaProcesoEnum, CatalogoItemEnum, EstadoPostulacionEnum, EstadoPostulante, TipoDocumentoIdentidadEnum, TipoAccionEnum, FlujoEstadoEnum, ResultadoFinalEnum } from "../../_utils/constants";
import { IAprobarPostulanteContratacionDirecta, IEliminarPostulanteContratacionDirecta } from "../../models/contratacion.model";
import { descargarExcel } from "app/core/utility/functions";
import { CONFIGURACION_PROCESO_MESSAGE, SNACKBAR_BUTTON } from "app/core/model/messages-error";
import { ModalNuevoPostulanteComponent } from "./modal-nuevo-postulante/modal-nuevo-postulante.component";
import { BuscadorServidorPublicoComponent } from "../../components/buscador-servidor-publico/buscador-servidor-publico.component";
import { ModalInformacionPostulanteComponent } from "./modal-informacion-postulante/modal-informacion-postulante.component";
import { ModalEditarPostulanteComponent } from "./modal-editar-postulante/modal-editar-postulante.component";
import { SecurityModel } from "app/core/model/security/security.model";
import { modalPostulante } from '../../models/modalPostulante';
import { CodigoCentroTrabajoMaestroEnum, RegimenLaboralEnum } from '../../../reasignacion/_utils/constants';

@Component({
    selector: 'minedu-bandeja-postulantes',
    templateUrl: './bandeja-postulantes.component.html',
    styleUrls: ['./bandeja-postulantes.component.scss'],
    animations: mineduAnimations,
    encapsulation: ViewEncapsulation.None,
})
export class BandejaPostulantesComponent implements OnInit {
    maxLengthnumeroDocumentoIdentidad: number;
    form: FormGroup;
    idEtapaProceso: number;
    idRegimenLaboral: number;
    codigoSede:any;
    dialogRef: any;
    estadoPlaza = 0;
    becario: string;
    isMobile = false;
    tipoDocumentos: any[] = [];
    estados: any[] = [];
    idServidorPublicoSelected: number;
    paginatorPostulantesPageIndex = 0;
    paginatorPostulantesPageSize = 10;
    estado = EstadoPostulante;
    
    firstTime = true;
    ocultarBotonesAprobacion:boolean = false;
    indicadoresEstadoPostulacion = {
        totalRegistros : 0,
        totalRegistrados : 0,
        totalAprobados : 0,
        totalEliminados : 0,
    };

    requestAprobar: any;
    requestEliminar: IEliminarPostulanteContratacionDirecta | null;
    @ViewChild("paginatorPostulantes", { static: true }) paginatorPostulantes: MatPaginator;
    dataSourcePostulantes: PlazasContratacionPostulantesDataSource | null;
    displayedColumnsPostulantes: string[] = [
        "registro",
        "documento",
        "apellidos_nombres",
        "numero_expediente",
        "codigo_plaza",
        "centro_trabajo",
        "modalidad_educativa",
        "nivel_educativo",
        "tipo_plaza",
        "estado",
        "fecha_aprobacion",
        "acciones",
    ];

    request = {
        idEtapaProceso: null,
        idTipoDocumento: null,
        numeroDocumento: null,
        numeroExpediente: null,
        idEstado: null, 
        codigoCentroTrabajoMaestro : null
    };

    modalPostulante:modalPostulante = new modalPostulante();
    constructor(
        private sharedService: SharedService,
        private formBuilder: FormBuilder,
        private route: ActivatedRoute,
        private router: Router,
        private materialDialog: MatDialog,
        private dataService: DataService,
    ) { }

    ngOnInit(): void {
        setTimeout((_) => this.buildShared());
        this.idEtapaProceso = parseInt(this.route.snapshot.params.id);
        this.buildForm();
        this.buildGrids();
        this.getEstados();
        this.handleResponsive();
        this.getDocumentoTipos();
        this.currentSession = this.dataService.Storage().getInformacionUsuario();
        this.buildSeguridadControles();
        this.codigoSede = this.currentSession.codigoSede;
        this.obtenerEstadosPostulacion();
        this.obtenerEstadoDesarrolloEtapa();
	this.obtenerFlujoEstado();
    }

    validacionPlaza:string;
    verificarIniciarEstadoPorPostulantes(){
        if (this.validacionPlaza == 'PENDIENTE' && this.indicadoresEstadoPostulacion.totalRegistros>0){
            // inicializar etapa por incorporacion
             // ****************** codigo para  iniciar estado segun requerimiento de pruebas unitariasconvocar plazas ****************
             if (this.validacionPlaza == 'PENDIENTE') { // EstadoEtapaProcesoEnum.PENDIENTE

                this.currentSession = this.dataService.Storage().getInformacionUsuario();
                this.dataService.Contrataciones().VerificarEtapaProcesoAnteriorFinalizado({"idEtapaProceso":this.idEtapaProceso, "codigoCentroTrabajoMaestro":this.currentSession.codigoSede})
                .subscribe((response:any) =>{
                    if(response){
                        // ****************************************************************
                        let data = {
                            idEtapaProceso: this.idEtapaProceso,
                            usuarioModificacion: this.currentSession.numeroDocumento,
                            idEstadoDesarrollo: EstadoEtapaProcesoEnum.INICIADO,
                            codigoCentroTrabajoMaestro: this.currentSession.codigoSede
                        };
                        this.dataService.Contrataciones().putActualizarEtapaProceso(data).pipe(
                            catchError((e) => of([e])),
                            finalize(() => {
                            })
                        )
                        .subscribe((d: any) => {
                            this.validacionPlaza = 'INICIADO';
                        });
                    }
                    else{
                        this.dataService.Message().msgWarning('"LA ETAPA ANTERIOR TODAVÍA NO HA SIDO FINALIZADA."', () => {});
                    }
                });
                this.obtenerEstadoDesarrolloEtapa(); // loop infinito?
            } 
            // ****************** fin de codigo
        }
    }

    obtenerEstadoDesarrolloEtapa = () => {
        let idProcesoEtapa = this.route.snapshot.params.id;
        let codSede = this.currentSession.codigoSede;

        this.dataService
            .Contrataciones()
            .obtenerCabeceraEstadoDesarrolloEtapaProceso(idProcesoEtapa, codSede)
            .pipe(
                catchError(() => of([])),
                finalize(() => {})
            )
            .subscribe((response: any) => {
                if (response) {
                    this.validacionPlaza = response.estadoDesarrollo;
                    //this.comiteAprobado = response.comiteAprobado;
                    //this.totalIncorporados = response.totalIncorporados;
                    //console.log("estado servicio comite aprobado", this.comiteAprobado)
                    console.log("total Incorporados : ", response);

                    this.verificarIniciarEstadoPorPostulantes();
                    /*if (this.validacionPlaza == 'PENDIENTE' && this.totalIncorporados>0){
                        this.dataService.Message().msgAutoCloseSuccessNoButton('INICIAR SUB-PROCESO!!."',3000,() => {                           
                        });                       
                    }*/
                }
            console.log("Estado de desarrollo : ", this.validacionPlaza);

            });
    };

    ngAfterViewInit() {
        this.paginatorPostulantes.page.pipe(tap(() => this.handleBuscar())).subscribe();
    }
    
    handleBuscarPaginator(){
        this.paginatorPostulantes.firstPage();
        this.handleBuscar();
    }

    buildForm(): void {
        this.form = this.formBuilder.group({
            tipoDocumento: [-1],
            numeroDocumentoIdentidad: [null],
            numeroExpediente: [null],
            estado: [-1]
        });

        setTimeout((_) => this.handleBuscar());

        this.form.get('numeroDocumentoIdentidad').disable();
    }

    activarCampoNroDocumento(){
	this.maxLengthnumeroDocumentoIdentidad = this.form.get('tipoDocumento').value == 11 ? 8 : 12;
	this.form.get('numeroDocumentoIdentidad').setValue(null);
        if(this.form.get('tipoDocumento').value != -1)
            this.form.get('numeroDocumentoIdentidad').enable();
        else
            this.form.get('numeroDocumentoIdentidad').disable();
    }

    validaNumericos = (event) => {
        if (event.charCode >= 48 && event.charCode <= 57) {
            return true;
        }
        return false;
    }

    obtenerEstadosPostulacion(){

        let data = {
            idEtapaProceso: this.idEtapaProceso,
            codigoCentroTrabajoMaestro: this.currentSession.codigoSede,
        }
        console.log("data entrada indicadores: ", data);
        this.dataService.Contrataciones().getObtenerIndicadoresEstadoPostulacion(data).pipe(
            catchError(() => {
                return of(null);
            })
        )
        .subscribe((response: any) => {
            if (response) {
                console.log("Indicadores Estado Postulacion",response);
                this.indicadoresEstadoPostulacion = response;
                this.determinarOcultarBotonesAprobacion();
            } 
        });
    }
    determinarOcultarBotonesAprobacion(){
        let totalRegistros = this.indicadoresEstadoPostulacion.totalRegistros;
        let totalRegistrados = this.indicadoresEstadoPostulacion.totalRegistrados;
        let totalAprobados = this.indicadoresEstadoPostulacion.totalAprobados;
        let totalEliminados = this.indicadoresEstadoPostulacion.totalEliminados;

        if(totalRegistros == 0){
            this.ocultarBotonesAprobacion = false;
            return;
        }
        if((totalRegistros > 0) && (totalAprobados > 0) && (totalRegistrados == 0) && (totalRegistros == totalAprobados+totalEliminados)){
            this.ocultarBotonesAprobacion = true;
            return;
        }else this.ocultarBotonesAprobacion = false;
        console.log("Booleano Ocultarbotones: " + this.ocultarBotonesAprobacion)
    }

    obtenerFlujoEstado (){
        let data = {
            idEtapaProceso: this.idEtapaProceso,
            codigoCentroTrabajoMaestro: this.currentSession.codigoSede,
            codigoTipoAccion: TipoAccionEnum.POSTULACION,
            codigoEstadoInformacion: FlujoEstadoEnum.PENDIENTE,
        }
        this.dataService.Contrataciones()
	    .getFlujoEstado(data)
	    .pipe(
		 catchError(() => { return of(null); })
	     )
	    .subscribe(this.modalPostulante.setFlujoEstado);
    }

    buildGrids(): void {
        this.dataSourcePostulantes = new PlazasContratacionPostulantesDataSource(this.dataService);
        this.buildPaginators(this.paginatorPostulantes);
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

    // TODO : CLEAN HARDCODE
    currentSession: SecurityModel = new SecurityModel();
    
    controlesActivos:ControlesActivosPostulante = {
        btnAprobarPostulantes:false, btnEditarPostulante:false, btnEliminarPostulante:false, btnNuevoPostulante: false, btnSolicitarInformeEscalafonario:false, btnExportar:false  
    }
    buildSeguridadControles = () => {

        const data = { 
            idEtapaProceso:this.idEtapaProceso, 
            codRol:this.currentSession.codigoRol,
            codTipoSede:this.currentSession.codigoTipoSede
        }

        this.dataService.Contrataciones().getObtenerAccesoUsuariosPostulacion(data).pipe(catchError((e) => of([e])),
            finalize(() => {})
        )
        .subscribe((response: any) => {
            if (response) {
                console.log("Valores de tabla accesos: ",response)
                this.controlesActivos = { 
                    btnAprobarPostulantes:response.aprobarPostulantes,
                    btnNuevoPostulante:response.nuevoPostulante, 
                    btnEditarPostulante:response.editarPostulante, 
                    btnEliminarPostulante: response.eliminarPostulante,
                    btnSolicitarInformeEscalafonario:response.solicitarInformeEscalafonario,
                    btnExportar:true, 
                 }; 
            }
        });       

    }

    getDocumentoTipos() {
        this.dataService.Contrataciones().getComboTipoDocumentos(CatalogoItemEnum.TIPOS_DOCUMENTOS_IDENTIDAD).pipe(
            catchError(() => {
                this.dataService.SnackBar().msgError(CONFIGURACION_PROCESO_MESSAGE.TIPOS_DOCUMENTOS_IDENTIDAD, SNACKBAR_BUTTON.CLOSE);
                return of(null);
            })
        )
        .subscribe((response: any) => {
            if (response) {
                this.tipoDocumentos = response;
		this.form.get('tipoDocumento').setValue('-1');
            } else {
                this.dataService.SnackBar().msgError(CONFIGURACION_PROCESO_MESSAGE.TIPOS_DOCUMENTOS_IDENTIDAD, SNACKBAR_BUTTON.CLOSE);
                this.tipoDocumentos = [];
            }
        });
    }

    getEstados() {
        this.dataService.Contrataciones().getComboTipoDocumentos(CatalogoItemEnum.ESTADOS_POSTULANTE).pipe(
                catchError(() => {
                    this.dataService.SnackBar().msgError(CONFIGURACION_PROCESO_MESSAGE.ESTADOS_POSTULANTE, SNACKBAR_BUTTON.CLOSE);
                    return of(null);
                }
            )
        )
        .subscribe((response: any) => {
            if (response) {
                this.estados = response;
		this.form.get('estado').setValue('-1');
            } else {
                this.dataService.SnackBar().msgError(CONFIGURACION_PROCESO_MESSAGE.ESTADOS_POSTULANTE, SNACKBAR_BUTTON.CLOSE);
                this.tipoDocumentos = [];
            }
        });
    }

    private verificarVacioONulos = (valor)=>{
	if(!valor || valor =='-1')  return null;
	return valor;
    };
    cargarFiltros() {

        let formData = this.form.getRawValue();
	this.request = {...formData,
	     tipoDocumento: this.verificarVacioONulos(formData.tipoDocumento),
	     numeroDocumentoIdentidad: this.verificarVacioONulos(formData.numeroDocumentoIdentidad),
	     numeroExpediente: this.verificarVacioONulos(formData.numeroExpediente),
	     estado: this.verificarVacioONulos(formData.estado),
	};
    }

    handleBuscar = () => {
        
        this.cargarFiltros();
        this.currentSession = this.dataService.Storage().getInformacionUsuario();
        
        this.request.idEstado =this.verificarVacioONulos(this.form.get('estado').value);
        this.request.numeroDocumento = this.form.get('numeroDocumentoIdentidad').value;
        this.request.idTipoDocumento =this.verificarVacioONulos(this.form.get('tipoDocumento').value);
        this.request.idEtapaProceso = this.idEtapaProceso;
        this.request.codigoCentroTrabajoMaestro = this.currentSession.codigoSede;

	if(this.request.numeroDocumento && this.request.idTipoDocumento != null){
	    let validacionDocumento = this.modalPostulante.validarDocumento(this.request.numeroDocumento, this.request.idTipoDocumento);
	    if (!validacionDocumento.esValido) {
		this.dataService.Message().msgWarning(validacionDocumento.mensaje);
		return;
	    }
	    } 

        this.dataSourcePostulantes.load(this.request, this.paginatorPostulantes.pageIndex + 1, this.paginatorPostulantes.pageSize, this.firstTime);
        this.firstTime=false;

        console.log("Valor actual tipoDocumentoIdentidad",this.form.get('tipoDocumento').value);
    }
    
    busquedaPersonalizada(): void {
        this.dialogRef = this.materialDialog.open(BuscadorServidorPublicoComponent, {
            panelClass: "minedu-buscador-servidor-publico-dialog",
            width: "980px",
            disableClose: true,
            data: {
                action: "busqueda",
            },
        });
        this.dialogRef.afterClosed().subscribe(({
		 idServidorPublico,
		 idTipoDocumentoIdentidad,
		 numeroDocumentoIdentidad
		}) => {
		    this.idServidorPublicoSelected = idServidorPublico;
		    this.form.patchValue({
			tipoDocumento:idTipoDocumentoIdentidad,
			numeroDocumentoIdentidad:numeroDocumentoIdentidad,
		    });
        });
    }

    handleNuevoPostulante = () => {
        this.dialogRef = this.materialDialog.open(ModalNuevoPostulanteComponent, {
            panelClass: 'modal-nuevo-postulante-dialog',
            disableClose: true,
            data: {
                icon: "save",
                title: "Registrar Nuevo Postulante",
                idEtapaProceso: this.idEtapaProceso,
		idRegimenLaboral: RegimenLaboralEnum.LEY_30328,
		idFlujoEstado: this.modalPostulante.getIdFlujoEstado(),
            }
        });
      
        this.dialogRef.afterClosed().subscribe((response: any) => {
            if (response == 0) {
                this.handleBuscar();
		this.obtenerEstadosPostulacion();
		this.obtenerEstadoDesarrolloEtapa();
            }
        });
    }

    informacionPostulanteView = (dataPostulante) => {
        this.dialogRef = this.materialDialog.open(ModalInformacionPostulanteComponent, {
            panelClass: 'minedu-modal-informacion-postulante',
            disableClose: true,
            data: {
                icon: "eye",
                title: "Información Completa del Postulante",
                idEtapaProceso: this.idEtapaProceso,
                datos: dataPostulante
            }
        });
      
        this.dialogRef.afterClosed().subscribe((response: any) => {
            if (!response) {
                return;
            }
        });
    }

    editarPostulanteView = (dataPostulacion) => {
	if(dataPostulacion.idTipoDocumento==TipoDocumentoIdentidadEnum.DNI && !dataPostulacion.nacionalidad) dataPostulacion.nacionalidad='PERUANA';
        this.dialogRef = this.materialDialog.open(ModalEditarPostulanteComponent, {
            panelClass: 'minedu-modal-editar-postulante',
            disableClose: true,
            data: {
                icon: "save",
                title: "Modificar Postulante",
                datos: dataPostulacion,
                idEtapaProceso: this.idEtapaProceso
            }
        });
      
        this.dialogRef.afterClosed().subscribe((response: any) => {
            if (response == 0) {
                this.handleBuscar();
            }
        });
    }

    handleAprobarPostulantes = () => {
        if (this.dataSourcePostulantes.data.length == 0) {
            this.dataService.Message().msgWarning('"LISTAR LOS POSTULANTES PARA SU APROBACIÓN."', () => { });
            return;
        } else {
            const postulante = this.dataSourcePostulantes.data.find(x => x.codigoEstado == EstadoPostulante.REGISTRADO);

            if (postulante != null && postulante != undefined) {
                this.requestAprobar = {
                    idEtapaProceso: this.idEtapaProceso,
                    estadoPostulacion: EstadoPostulante.APROBADO,
                    estadoRegistrado: EstadoPostulante.REGISTRADO,
                    usuarioModificacion: "ADMIN",
                    codigoCentroTrabajoMaestro : this.currentSession.codigoSede,
		    idFlujoEstado : this.modalPostulante.getIdFlujoEstado()
                };

                const messageConfirm = "<strong>¿ESTÁ SEGURO QUE DESEA APROBAR EL LISTADO DE POSTULANTES?</strong><br>Al aprobar el listado e postulantes, aún podrá agregar postulantes para este proceso.";

                this.dataService.Message().msgConfirm(messageConfirm,
                    () => {
                        this.dataService.Spinner().show("sp6");
                        this.dataService.Contrataciones().aprobarContratacionDirectaPostulantes(this.requestAprobar).pipe(
                            catchError(() => of([])),
                            finalize(() => {
                                this.dataService.Spinner().hide("sp6");
                            })
                        )
                        .subscribe((response: any) => {
                            if (response) {
				this.dataService.Message().msgAutoCloseSuccessNoButton('"OPERACIÓN REALIZADA DE FORMA EXITOSA."',5000, () => {});
                                this.handleBuscar();
                                this.obtenerEstadosPostulacion();
				this.obtenerFlujoEstado();
                            } else {
                                this.dataService.Message().msgWarning('"OCURRIÓ UN ERRROR AL TRATAR DE APROBAR A LOS POSTULANTE."', () => { });
                            }
                        });
                    }
                );
            } else {
                this.dataService.Message().msgWarning('"NO EXISTE POSTULANTES REGISTRADOS PARA SU APROBACIÓN."', () => { });
            }
        }
    }

    handleExportarPostulantes = () => {
        if (this.dataSourcePostulantes.data.length == 0) {
            this.dataService.Message().msgWarning('"NO HA LISTADO A LOS POSTULANTES PARA SU EXPORTACIÓN."', () => { });
            return;
        }

        this.cargarFiltros();
        this.request.idEtapaProceso = this.idEtapaProceso;
        this.request.codigoCentroTrabajoMaestro = this.currentSession.codigoSede;
         // ************************************************************************************************
         let fechaActual = new Date();
         var nombreExcel = "Contratacion_Directa_Postulantes"
         var dateString = new Date(fechaActual.getTime() - (fechaActual.getTimezoneOffset() * 60000 ))
                     .toISOString()
                     .split("T")[0];
         try{
             var nombreExportar:string = nombreExcel+" - "+dateString + ".xlsx"; //+(this.form.get('anio').value);
         }catch{
             var nombreExportar:string = nombreExcel+"" + ".xlsx";
         }
         // ************************************************************************************************
 

        this.dataService.Spinner().show("sp6");
        this.dataService.Contrataciones().exportarPostulantes(this.request).pipe(
            catchError(() => of([])),
            finalize(() => {
                this.dataService.Spinner().hide("sp6");
            })
        )
        .subscribe((response: any) => {
            if (response && response != []) {
                descargarExcel(response.file, nombreExportar);
            } else {
                this.dataService.Message().msgWarning('"NO SE PUDO GENERAR EL DOCUMENTO EXCEL DE LOS POSTULANTES."', () => { });
            }
        });
    }

    eliminarPlazaIncorporada = (data, index) => {
        this.requestEliminar = {
            idPostulacion: data.idPostulacion,
            estadoPostulacion: EstadoPostulacionEnum.ELIMINADO,
            activo: false,
            usuarioModificacion: "ADMIN",
            codigoCentroTrabajoMaestro : this.currentSession.codigoSede
        };
        
        this.dataService.Message().msgConfirm('¿ESTÁ SEGURO QUE DESEA ELIMINAR AL POSTULANTE?',
            () => {
                this.dataService.Spinner().hide("sp6");
                this.dataService.Contrataciones().eliminarContratacionDirectaPostulante(this.requestEliminar).pipe(
                    catchError(() => of([])),
                    finalize(() => {
                        this.dataService.Spinner().hide("sp6");
                    })
                )
                .subscribe((response: any) => {
                    if (response > 0) {
                        this.dataService.Message().msgAutoCloseSuccessNoButton('"EL POSTULANTE HA SIDO ELIMINADO CORRECTAMENTE"', 3000);
                        this.handleBuscar();
                    } else {
                        this.dataService.Message().msgWarning('"OCURRIÓ UN ERRROR AL TRATAR DE ELIMINAR AL POSTULANTE SELECCIONADO."', () => { });
                    }
                });
            }
        );
    }

    handleLimpiar() {
        this.form.reset();
        // console.log("Valor actual tipoDocumentoIdentidad",this.form.get('tipoDocumento').value);
        this.form.get('numeroDocumentoIdentidad').disable();
        this.form.get('tipoDocumento').setValue('-1');
        this.form.get('estado').setValue('-1');
	this.firstTime = true;
	this.handleBuscar();
    }

    handleRetornar = () => {
        this.router.navigate(["../../../"], { relativeTo: this.route });
    };

    buildShared() {
        this.sharedService.setSharedBreadcrumb("Contratación / Contratación Directa");
        this.sharedService.setSharedTitle("Postulantes");
    }

    handleResponsive(): void {
        this.isMobile = this.getIsMobile();
        window.onresize = () => {
            this.isMobile = this.getIsMobile();
        };
    }

    getIsMobile(): boolean {
        const w = document.documentElement.clientWidth;
        const breakpoint = 992;
        if (w < breakpoint) {
            return true;
        } else {
            return false;
        }
    }

    handleDataInformacionProcesoEtapa = (data:any) => {
	console.log(data);
	this.idRegimenLaboral = data.idRegimeLaboral;
    }
}

export class PlazasContratacionPostulantesDataSource extends DataSource<any> {
    private _dataChange = new BehaviorSubject<any>([]);
    private _loadingChange = new BehaviorSubject<boolean>(false);
    public loading = this._loadingChange.asObservable();
    public totalregistro = 0;

    constructor(private dataService: DataService) {
        super();
    }

    load(data: any, pageIndex, pageSize, firstTime=false): void {
        this.dataService.Spinner().show("sp6");
        this._loadingChange.next(false);
        if (data.idEtapaProceso === null) {
            this._loadingChange.next(false);
            this._dataChange.next([]);
        } else {
            this.dataService.Contrataciones().buscarPostulantesPaginado(data, pageIndex, pageSize).pipe(
                catchError(() => of([])),
                finalize(() => {
                    this._loadingChange.next(false);
                    this.dataService.Spinner().hide("sp6");
                })
            )
            .subscribe((postulantes: any) => {
                this._dataChange.next(postulantes || []);
                this.totalregistro = (postulantes || []).length === 0 ? 0 : postulantes[0].totalRegistros;

                if (this.totalregistro == 0  && !firstTime) {
                    this.dataService.Message().msgWarning('"NO SE ENCONTRÓ INFORMACIÓN PARA LOS CRITERIOS DE BÚSQUEDA INGRESADOS."', () => {});
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


interface ControlesActivosPostulante{
    btnNuevoPostulante:boolean,
    btnAprobarPostulantes:boolean,
    btnEditarPostulante:boolean,
    btnEliminarPostulante: boolean,
    btnSolicitarInformeEscalafonario:boolean,
    btnExportar:boolean,
}
