import { Component, OnInit, ViewEncapsulation, ViewChild } from "@angular/core";
import { FormBuilder, FormGroup} from "@angular/forms";
import { MatDialog } from "@angular/material/dialog";
import { DataService } from "app/core/data/data.service";
import { ActivatedRoute, Router } from "@angular/router";
import { MatPaginator } from "@angular/material/paginator";
import { CollectionViewer, DataSource, SelectionModel } from "@angular/cdk/collections";
import { mineduAnimations } from "../../../../../../@minedu/animations/animations";
import { SharedService } from "../../../../../core/shared/shared.service";
import {  BehaviorSubject, of, Observable, forkJoin } from "rxjs";
import { BusquedaPlazaComponent } from "../components/busqueda-plaza/busqueda-plaza.component";
import { BuscarCentroTrabajoComponent } from "../components/buscar-centro-trabajo/buscar-centro-trabajo.component";
import { catchError, finalize, tap } from "rxjs/operators";
import { SituacionPlazasEnum, TipoFormatoPlazaEnum, EstadoValidacionPlazaEnum, GrupoDocumentoPublicadoEnum, EstadoEtapaProcesoEnum, RegimenLaboralEnum, CodigoMaestroActividad, TipoAccionEnum, FlujoEstadoEnum, EtapaEnum } from '../_utils/constants';
import { IActualizarIdDocumentoSustentoViewModel, IActualizarPlazaPublicacionSituacionValidacionViewModel, IPlazasContratacionValidacion } from "../models/contratacion.model";
import { descargarExcel } from "app/core/utility/functions";
import { InformacionPlazaValidacionComponent } from "./informacion-plaza-validacion/informacion-plaza-validacion.component";
import { DocumentViewerComponent } from "app/main/apps/components/document-viewer/document-viewer.component";
import { saveAs } from 'file-saver';
import { ModalPlazaObservadaComponent } from "./modal-plaza-observada/modal-plaza-observada.component";
import { ModalInformacionPlazaObservadaComponent } from "./modal-informacion-plaza-observada/modal-informacion-plaza-observada.component";
import { ModalDocumentosPublicadosComponent } from "../components/modal-documentos-publicados/modal-documentos-publicados.component";
import { SecurityModel } from "app/core/model/security/security.model";
import {  TablaPermisos } from "app/core/model/types";
import { ModalMotivoRechazoValidacionComponent } from "../components/modal-motivo-rechazo-validacion/modal-motivo-rechazo-validacion.component";
import { criterioBusqueda } from '../models/criterioBusqueda.model';
import { bandejaValidacionPlazas } from '../models/bandejaValidacionPlazas';

@Component({
    selector: "minedu-bandeja-validacion-plazas",
    templateUrl: "./bandeja-validacion-plazas.component.html",
    styleUrls: ["./bandeja-validacion-plazas.component.scss"],
    animations: mineduAnimations,
    encapsulation: ViewEncapsulation.None
})
export class BandejaValidacionPlazasComponent implements OnInit {
    idEstadoDesarrollo: number;
    ocultarLoader:boolean=false;
    semaforoValidacionPlaza:any;
    validacionPlaza;
    soloLectura = true;
    form: FormGroup;
    idEtapaProceso: number;
    anio: number;
    codSedeCabecera:any;
    estadoDesarrollo:any;
    totalIncorporados: number=0;
    comiteAprobado:boolean;
    currentTabIndex:number;

    nroEtapasIniciadas = 0;
    fechaFinRegional = new Date();

    isSeleccionadoTodosPrepublicadas: boolean = false;
    noSeleccionados: any[] = [];
    totalSeleccionadosPrepublicadas: number = 0;

    firstTime = true;
    dialogRef: any;
    becario: string;
    isMobile = false;
    totalregistro = 0;
    selectedTabIndex = 0;
    fecha = new Date();
    plazaFiltroSeleccionado: any;
    paginatorPlazasPrepublicadasPageIndex = 0;
    paginatorPlazasPrepublicadasPageSize = 10;
    paginatorPlazasConvocarPageIndex = 0;
    paginatorPlazasConvocarPageSize = 10;
    paginatorPlazasObservarPageIndex = 0;
    paginatorPlazasObservarPageSize = 10;
    @ViewChild("paginatorPlazasPrepublicadas", { static: true }) paginatorPlazasPrepublicadas: MatPaginator;
    @ViewChild("paginatorPlazasConvocar", { static: true }) paginatorPlazasConvocar: MatPaginator;
    @ViewChild("paginatorPlazasObservar", { static: true }) paginatorPlazasObservar: MatPaginator;
    centroTrabajoFiltroSeleccionado: any;
    estadoPlaza = EstadoValidacionPlazaEnum;
    selectionPlazasPrepublicadas = new SelectionModel<any>(true, []);
    selectionPlazasConvocar = new SelectionModel<any>(true, []);
    selectionPlazasObservar = new SelectionModel<any>(true, []);
    dataSourcePrepublicadas: PlazasContratacionPrepublicadasDataSource | null;
    dataSourceConvocadas: PlazasContratacionConvocadasDataSource | null;
    dataSourceObservadas: PlazasContratacionObservadasDataSource | null;
    displayedColumnsPlazasPrepublicadas: string[] = [
        "registro",
        "codigo_modular",
        "centro_trabajo",
        "nivel_educativo",
        "tipo_gestion",
        "codigo_plaza",
        "cargo",
        "area_curricular",
        "tipo_plaza",
        "vigencia_inicio",
        "vigencia_fin",
        "es_becario",
        "acciones",
    ];
    displayedColumnsPlazasConvocar: string[] = [
        "registro",
        "codigo_modular",
        "centro_trabajo",
        "nivel_educativo",
        "tipo_gestion",
        "codigo_plaza",
        "cargo",
        "area_curricular",
        "tipo_plaza",
        "vigencia_inicio",
        "vigencia_fin",
        "es_becario",
        "acciones",
    ];
    displayedColumnsPlazasObservar: string[] = [
        "registro",
        "codigo_modular",
        "centro_trabajo",
        "nivel_educativo",
        "tipo_gestion",
        "codigo_plaza",
        "cargo",
        "area_curricular",
        "tipo_plaza",
        "vigencia_inicio",
        "vigencia_fin",
        "es_becario",
        "motivo_observacion",
        "acciones",
    ];
    request = {
        idPlaza: null,
        codigoPlaza: null,
        idCentroTrabajo: null,
        codigoCentroTrabajo: null,
        idEtapaProceso: null,
        esBecario: null,
        codigoCentroTrabajoMaestro:null,
        anio:null
    };

    permisos = {
        autorizadoAgregar: false,
        autorizadoModificar: false,
        autorizadoEliminar: false,
        autorizadoEnviar: false,
        autorizadoExportar: false,
        autorizadoConsultar:false,
    };
    currentSession: SecurityModel = new SecurityModel();
    bandejaValidacionPlazas:bandejaValidacionPlazas = new bandejaValidacionPlazas();
    filaSeleccionadasPrePublicadas:any[]=[];
    filaSeleccionadasConvocar:any[]=[];
    filaSeleccionadasObservar:any[]=[];
    filaNoSeleccionadas:any[]=[];
    idSituacionValidacion:number = 0;
    procesarBuscar = {};
    constructor(private sharedService: SharedService,
        private formBuilder: FormBuilder,
        private route: ActivatedRoute,
        private router: Router,
        private materialDialog: MatDialog,
        private dataService: DataService,
    ) {}

    ngOnInit(): void {
      this.configurarBuscar();
      if (this.route.routeConfig.path.search('ver-validacion-plazas/') > -1) {
        this.soloLectura = true;
      } else {
        this.soloLectura = false;
      }
      setTimeout((_) => this.buildShared());
      this.idEtapaProceso = parseInt(this.route.snapshot.params.id);
      this.buildForm();
      this.buildGrids();
      this.handleResponsive();
      this.obtenerPlazaContratacion();
      this.buildSeguridad();
      this.ocultarBreadCrumOriginal();
      this.codSedeCabecera = this.currentSession.codigoSede;
      this.obtenerFechaDeCortePublicacion();
      this.obtenerEstadoDesarrolloEtapa();
      this.idSituacionValidacion = SituacionPlazasEnum.PRE_PUBLICADA;
      this.obtenerFlujoEstado();
    }

    obtenerFlujoEstado (){
        let data = {
            idEtapaProceso: this.idEtapaProceso,
            codigoCentroTrabajoMaestro: this.currentSession.codigoSede,
            codigoTipoAccion: TipoAccionEnum.PLAZA,
            codigoEstadoInformacion: FlujoEstadoEnum.PENDIENTE,
        }
        this.dataService.Contrataciones()
	    .getFlujoEstado(data)
	    .pipe(
		 catchError(() => { return of(null); })
	     )
	    .subscribe(this.bandejaValidacionPlazas.setFlujoEstado);
    }

    private configurarBuscar = () =>{
      this.procesarBuscar[0] = this.buscarPlazasContratacionPrepublicadas;
      this.procesarBuscar[1] = this.buscarPlazasContratacionConvocadas;
      this.procesarBuscar[2] = this.buscarPlazasContratacionObservadas;
    }
    buildSeguridad = () => {
        this.permisos.autorizadoAgregar = this.dataService.Storage().tienePermisoAccion(TablaPermisos.Agregar);
        this.permisos.autorizadoModificar = this.dataService.Storage().tienePermisoAccion(TablaPermisos.Modificar);
        this.permisos.autorizadoEliminar = this.dataService.Storage().tienePermisoAccion(TablaPermisos.Eliminar);
        this.permisos.autorizadoExportar = this.dataService.Storage().tienePermisoAccion(TablaPermisos.Eliminar);
        this.permisos.autorizadoEnviar = true;
        this.currentSession = this.dataService.Storage().getInformacionUsuario();
        this.buildSeguridadControles(this.currentSession.codigoRol);
    
    };

    ocultarBreadCrumOriginal(){
        let div = document.getElementsByClassName('bread-original');
        for(let i = 0; i < div.length; i++) {
            const dv = div[i] as HTMLElement;
            dv.style.display = "none";
        }
    }

    // TODO : CLEAN HARDCODE
    controlesActivos:ControlesActivos = {
        btnFinalizarValidacionPlazas:false,
	btnPublicarPlazas:false,
	btnAperturarPublicacion:false,
	btnIncorporarPlazas: false,
	btnPlazasConvocar:false,
	btnPlazasObservadas:false,
        btnVerPlazasPDF:false,
	btnExportar:false,
	btnEliminarPlazas:false   
    }
    buildSeguridadControles = (codigoRol:string) => {
        const data = { 
            idEtapaProceso:this.idEtapaProceso, 
            codTipoSede:this.currentSession.codigoTipoSede,
            codRol:codigoRol,
        }

        console.log("Datos entrada seguridad: ",data);
        this.dataService.Contrataciones().getObtenerAccesoUsuariosValidacionPlazas(data).pipe(catchError((e) => of([e])),
            finalize(() => {})
        )
        .subscribe((response: any) => {
            if (response) {
                this.controlesActivos = { 
                    btnFinalizarValidacionPlazas:response.finalizarValidacionPlazas,
                    btnPublicarPlazas:response.publicarPlazas, 
                    btnAperturarPublicacion:response.aperturarPublicacionPlazas, 
                    btnIncorporarPlazas: response.incorporarPlazas,
                    btnPlazasConvocar:response.plazasConvocar, 
                    btnPlazasObservadas:response.plazasObservadas, 
                    btnVerPlazasPDF:true, 
                    btnExportar:true, 
                    btnEliminarPlazas:response.incorporarPlazas
                 }; 
            }
        });       

    }

    obtenerPlazaContratacion(): void {
        this.currentSession = this.dataService.Storage().getInformacionUsuario();

        let d = {
            idEtapaProceso: this.idEtapaProceso,
            codigoCentroTrabajoMaestro:this.currentSession.codigoSede,
        }
        
        this.dataService
        .Contrataciones()
        .getObtenerPlazaContratacionPorIdEtapaProceso(d)
        .pipe(
          catchError((e) => of([e])),
            finalize(() => {})
        )
        .subscribe((response: any) => {
          if (response) {
            if (response.length > 0) {
              if (response[0].estadoValidacionPlaza == 'PRE PUBLICADO') {
                this.validacionPlaza = 'PENDIENTE';
              } else {
                this.validacionPlaza = response[0].estadoValidacionPlaza;
              }
              if(this.validacionPlaza == "PUBLICANDO PLAZAS"){
                this.handleEvaluarCambioEstadoPublicacion();
              }
            }
            else {
              this.validacionPlaza = 'PENDIENTE';
            }
            this.semanforoValidacionPlaza();
          }
          console.log("Estado ValidacionPlaza:", this.validacionPlaza);
        });
    }

    handleEvaluarCambioEstadoPublicacion =()=>{
	this.ocultarLoader = true; 
	this.validacionPlaza ="PUBLICANDO PLAZAS";
	const interval = setInterval(() => {
        let d = {
            idEtapaProceso: this.idEtapaProceso,
            codigoCentroTrabajoMaestro:this.currentSession.codigoSede,
        }
        this.dataService.Contrataciones().getObtenerPlazaContratacionPorIdEtapaProceso(d).pipe(catchError((e) => of([e])),
            finalize(() => {})
        )
        .subscribe((response: any) => {
            if (response) {
                    this.validacionPlaza = response[0].estadoValidacionPlaza;
		    this.semanforoValidacionPlaza();
                    this.obtenerFlujoEstado();
		    if(this.validacionPlaza !="PUBLICANDO PLAZAS") {
                        this.obtenerFlujoEstado();
			this.ocultarLoader = false; 
	              clearInterval(interval);
		    }
	    }
	});
	},10000);
    }

    ngAfterViewInit() {
        this.paginatorPlazasPrepublicadas.page.pipe(tap(() => this.buscarPlazasContratacionPublicadas())).subscribe();
        this.paginatorPlazasConvocar.page.pipe(tap(() => this.buscarPlazasContratacionPublicadas())).subscribe();
        this.paginatorPlazasObservar.page.pipe(tap(() => this.buscarPlazasContratacionPublicadas())).subscribe();
    }

    buildForm(): void {
        this.form = this.formBuilder.group({
            codigoCentroTrabajo: [null],
            codigoPlaza: [null],
            plazasPara: [null],
            fechaActual: [null],
        });

        this.form.get("plazasPara").setValue("-1");
        setTimeout((_) =>{ 
          this.dataService
          .Contrataciones()
          .obtenerCabeceraEtapaProcesoById(this.idEtapaProceso)
          .pipe(
            catchError(() => of([])),
              finalize(() => {})
          ).subscribe((response: any) => {
            if (response) {
              this.anio = response.anio;
              this.handleBuscar();
            }
          });
        });
    }

    buildGrids(): void {
        this.dataSourcePrepublicadas = new PlazasContratacionPrepublicadasDataSource(this.dataService);
        this.dataSourceConvocadas = new PlazasContratacionConvocadasDataSource(this.dataService);
        this.dataSourceObservadas = new PlazasContratacionObservadasDataSource(this.dataService);
        this.buildPaginators(this.paginatorPlazasPrepublicadas);
        this.buildPaginators(this.paginatorPlazasConvocar);
        this.buildPaginators(this.paginatorPlazasObservar);
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

    handleLimpiar(): void {
        this.resetForm();
        this.buildGrids();
        this.setRequest();
        this.firstTime = true;
        this.procesarBuscar[this.currentTabIndex??0]();
        this.firstTime = false;
    }

    resetForm = () => {
        this.form.reset();
        this.form.get("plazasPara").setValue("-1");
    };

    handleBuscar = () => {
	this.paginatorPlazasObservar.firstPage();
	this.paginatorPlazasConvocar.firstPage();
	this.paginatorPlazasPrepublicadas.firstPage();
        this.buscarPlazasContratacionPublicadas();
    }

    handleIncorporarPlazas() {
        this.currentSession = this.dataService.Storage().getInformacionUsuario();
        
        const data = {
            idEtapaProceso : this.idEtapaProceso,
            codigoCentroTrabajoMaestro: this.currentSession.codigoSede,
            fragmentoUrlRetornar:'validacion-plazas',
            idRegimen : RegimenLaboralEnum.LEY_30328
        };
        console.log("Datos, enviados a bandeja Incorporar Plazas",data);
        this.router.navigate([
            "ayni",
            "personal",
            "procesospersonal",
            "procesos",
            "contratacion",
            "bandeja-incorporacion-plazas",
            "bandeja-incorporacion",
            this.idEtapaProceso.toString(),
            {
              codigoCentroTrabajoMaestro: data.codigoCentroTrabajoMaestro,
              fragmentoUrlRetornar:data.fragmentoUrlRetornar,
              idRegimen:data.idRegimen,
              textosConcatenadosConGuion:encodeURIComponent('Validación plazas-TextoComplemento'),
              idEstadoDesarrollo: this.idEstadoDesarrollo
            },
        ]);
        

    }
    verificarIniciarEstadoPorIncorporacion(){
        if (this.estadoDesarrollo == 'PENDIENTE' && this.totalIncorporados>0){
            // inicializar etapa por incorporacion
            
             // ****************** codigo para  iniciar estado segun requerimiento de pruebas unitariasconvocar plazas ****************
             if (this.estadoDesarrollo == 'PENDIENTE') { // EstadoEtapaProcesoEnum.PENDIENTE

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
                            this.estadoDesarrollo = 'INICIADO';
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

    checkboxLabelPlazasPrepublicadas(row?: any): string {
	let estilo;
        estilo =  `${this.selectionPlazasPrepublicadas.isSelected(row) ? "deselect" : "select"} row ${row?.position + 1}`;
        return  estilo;
    }
    checkboxAllPlazasPrePublicadas(): string {
	let estilo;
	estilo = `${(this.isAllSelectedPlazasPrepublicadas() || this.isSeleccionadoTodosPrepublicadas) ? "select" : "deselect"} all`;
	return estilo;
    }

    verificaSeleccionPrePublicadas = (row):boolean =>{
	if(!this.isSeleccionadoTodosPrepublicadas) {
	    let estaSeleccioando = this.filaSeleccionadasPrePublicadas
					.some(fila => 
					      fila.id_plaza_contratacion_detalle 
					      == row.id_plaza_contratacion_detalle);
	    return estaSeleccioando || this.isSeleccionadoTodosPrepublicadas;
	}

	if(this.isSeleccionadoTodosPrepublicadas) {
	    let estaSeleccioando = this.filaNoSeleccionadas
					.some(fila => 
					      fila.id_plaza_contratacion_detalle 
					      == row.id_plaza_contratacion_detalle);
	    return !estaSeleccioando;
	}

    }

    verificaSeleccionConvocar = (row):boolean =>{
	if(!this.isSeleccionadoTodosPrepublicadas) {
	    let estaSeleccioando =	this.filaSeleccionadasConvocar
	    .some(fila => 
		  fila.id_plaza_contratacion_detalle 
		  == row.id_plaza_contratacion_detalle);
		  return estaSeleccioando || this.isSeleccionadoTodosPrepublicadas;
	}

	if(this.isSeleccionadoTodosPrepublicadas) {
	    let estaSeleccioando = this.filaNoSeleccionadas
					.some(fila => 
					      fila.id_plaza_contratacion_detalle 
					      == row.id_plaza_contratacion_detalle);
	    return !estaSeleccioando;
	}
    }

    verificaSeleccionObservar = (row):boolean =>{
	if(!this.isSeleccionadoTodosPrepublicadas) {
	    let estaSeleccioando =	this.filaSeleccionadasObservar
	    .some(fila => 
		  fila.id_plaza_contratacion_detalle 
		  == row.id_plaza_contratacion_detalle);
		  return estaSeleccioando || this.isSeleccionadoTodosPrepublicadas;
	}

	if(this.isSeleccionadoTodosPrepublicadas) {
	    let estaSeleccioando = this.filaNoSeleccionadas
	    .some(fila => 
		  fila.id_plaza_contratacion_detalle 
		  == row.id_plaza_contratacion_detalle);
		  return !estaSeleccioando;
	}
    }
    masterTogglePlazasPrepublicadas = ({checked}) => {
	this.isSeleccionadoTodosPrepublicadas = checked;
	this.filaSeleccionadasPrePublicadas = [];
	this.filaNoSeleccionadas = [];
    };

    masterTogglePlazasConvocar = ({checked}) => {
	this.isSeleccionadoTodosPrepublicadas = checked;
	this.filaSeleccionadasConvocar= [];
	this.filaNoSeleccionadas = [];
    };

    masterTogglePlazasObservar = ({checked}) => {
	this.isSeleccionadoTodosPrepublicadas = checked;
	this.filaSeleccionadasObservar= [];
	this.filaNoSeleccionadas = [];
    };

    selectedRowPrepublicadas = (row) => {
	this.selectionPlazasPrepublicadas.toggle(row);
	if (!this.isSeleccionadoTodosPrepublicadas) {
	    var existeFila = this.filaSeleccionadasPrePublicadas?.some(x => x.id_plaza == row.id_plaza);
	    if(existeFila){
		this.filaSeleccionadasPrePublicadas = this.filaSeleccionadasPrePublicadas?.filter(x => x.id_plaza != row.id_plaza);
	    }else{
		this.filaSeleccionadasPrePublicadas.push(row);
	    }
	} 

        if (this.isSeleccionadoTodosPrepublicadas) {
	    var existeFila = this.filaNoSeleccionadas?.some(x => x.id_plaza == row.id_plaza);
	    if(existeFila){
		this.filaNoSeleccionadas = this.filaNoSeleccionadas?.filter(x => x.id_plaza != row.id_plaza);
	    }else{
		this.filaNoSeleccionadas.push(row);
	    }
        }

    };

    selectedRowConvocar = (row) => {
	this.selectionPlazasConvocar.toggle(row);
	if (!this.isSeleccionadoTodosPrepublicadas) {
	    var existeFila = this.filaSeleccionadasConvocar?.some(x => x.id_plaza == row.id_plaza);
	    if(existeFila){
		this.filaSeleccionadasConvocar = this.filaSeleccionadasConvocar?.filter(x => x.id_plaza != row.id_plaza);
	    }else{
		this.filaSeleccionadasConvocar.push(row);
	    }
	}

        if (this.isSeleccionadoTodosPrepublicadas) {
	    var existeFila = this.filaNoSeleccionadas?.some(x => x.id_plaza == row.id_plaza);
	    if(existeFila){
		this.filaNoSeleccionadas = this.filaNoSeleccionadas?.filter(x => x.id_plaza != row.id_plaza);
	    }else{
		this.filaNoSeleccionadas.push(row);
	    }
        }
    };

    selectedRowObservar = (row) => {
	this.selectionPlazasObservar.toggle(row);
	if (!this.isSeleccionadoTodosPrepublicadas) {
	    var existeFila = this.filaSeleccionadasObservar?.some(x => x.id_plaza == row.id_plaza);
	    if(existeFila){
		this.filaSeleccionadasObservar = this.filaSeleccionadasObservar?.filter(x => x.id_plaza != row.id_plaza);
	    }else{
		this.filaSeleccionadasObservar.push(row);
	    }
	}

        if (this.isSeleccionadoTodosPrepublicadas) {
	    var existeFila = this.filaNoSeleccionadas?.some(x => x.id_plaza == row.id_plaza);
	    if(existeFila){
		this.filaNoSeleccionadas = this.filaNoSeleccionadas?.filter(x => x.id_plaza != row.id_plaza);
	    }else{
		this.filaNoSeleccionadas.push(row);
	    }
        }
    };
    changeTotalSeleccionados = () => {

        console.log("this.noSeleccionados     ", this.noSeleccionados);

        if (this.isSeleccionadoTodosPrepublicadas == true)
            this.totalSeleccionadosPrepublicadas = this.dataSourcePrepublicadas?.dataTotal- this.noSeleccionados?.length;
        else
            this.totalSeleccionadosPrepublicadas = this.selectionPlazasPrepublicadas?.selected?.length;
        console.log("this.totalSeleccionados     ", this.totalSeleccionadosPrepublicadas);

    }
    agregarNoSeleccionados = (row, estado: boolean) => {
        if (estado) {
            const exist = this.noSeleccionados.find(x => x.idPlazaContratacionDetalle == row.idPlazaContratacionDetalle);
            if (exist == null) {
                this.noSeleccionados.push(row);
            }
        } else {
            const seleccionados = Object.assign([], this.noSeleccionados);
            this.noSeleccionados = [];
            seleccionados.forEach(element => {
                if (element.idPlazaContratacionDetalle != row.idPlazaContratacionDetalle) {
                    this.noSeleccionados.push(row);
                }
            });
        }
    }

    isAllSelectedPlazasPrepublicadas = () => {
        const numSelected = this.selectionPlazasPrepublicadas.selected.length;
        const numRows = this.dataSourcePrepublicadas.data.length;
        return numSelected === numRows;
    };

    checkboxLabelPlazasConvocar(row?: any): string {
        if (!row) {
            return `${this.isAllSelectedPlazasConvocar() ? "select" : "deselect"} all`;
        }
        return `${this.selectionPlazasConvocar.isSelected(row) ? "deselect" : "select"} row ${row.position + 1}`;
    }


    isAllSelectedPlazasConvocar = () => {
        const numSelected = this.selectionPlazasConvocar.selected.length;
        const numRows = this.dataSourceConvocadas.data.length;
        return numSelected === numRows;
    };

    checkboxLabelPlazasObservar(row?: any): string {
        if (!row) {
            return `${this.isAllSelectedPlazasObservar() ? "select" : "deselect"} all`;
        }
        return `${this.selectionPlazasObservar.isSelected(row) ? "deselect" : "select"} row ${row.position + 1}`;
    }


    isAllSelectedPlazasObservar = () => {
        const numSelected = this.selectionPlazasObservar.selected.length;
        const numRows = this.dataSourceObservadas.data.length;
        return numSelected === numRows;
    };

    buscarPlazasContratacionPublicadas = () => {
        this.setRequest();

        if (this.request.codigoPlaza) {
	    let validacionCodigoPlaza = criterioBusqueda.validarCodigoPlaza(this.request.codigoPlaza);
            if (!validacionCodigoPlaza.esValido) {
                this.dataService.Message().msgWarning(validacionCodigoPlaza.mensaje);
                return;
            }
        }

        if (this.request.codigoCentroTrabajo) {
	    let validacionCodigoTrabajo = criterioBusqueda.validarCodigoTrabajo(this.request.codigoCentroTrabajo);
            if (!validacionCodigoTrabajo.esValido) {
                this.dataService.Message().msgWarning(validacionCodigoTrabajo.mensaje);
                return;
            }
        }

        this.buscarPlazasContratacion();
	this.firstTime=false;
    };

    private buscarPlazasContratacion = () => {     
        this.procesarBuscar[this.currentTabIndex??0]();
        this.firstTime = false;
    };

    private buscarPlazasContratacionPrepublicadas = () => {
        this.selectionPlazasPrepublicadas = new SelectionModel<any>(true, []);
        this.dataSourcePrepublicadas.load(this.request, 
					this.paginatorPlazasPrepublicadas.pageIndex + 1,
					this.paginatorPlazasPrepublicadas.pageSize, 
					this.firstTime
					 );
    };


    private buscarPlazasContratacionConvocadas = () => {
        this.selectionPlazasConvocar = new SelectionModel<any>(true, []);
        this.dataSourceConvocadas.load(this.request, this.paginatorPlazasConvocar.pageIndex + 1, this.paginatorPlazasConvocar.pageSize,this.firstTime);
    };

    private buscarPlazasContratacionObservadas = () => {
        this.selectionPlazasObservar = new SelectionModel<any>(true, []);
        this.dataSourceObservadas.load(this.request, this.paginatorPlazasObservar.pageIndex + 1, this.paginatorPlazasObservar.pageSize,this.firstTime);
    };

    setRequest(): void {
        const formulario = this.form.getRawValue();

        let idPlaza = this.plazaFiltroSeleccionado ? this.plazaFiltroSeleccionado.id_plaza : null;
        let codigoPlaza = !formulario.codigoPlaza?null:formulario.codigoPlaza.toUpperCase();
        let idCentroTrabajo = this.centroTrabajoFiltroSeleccionado ? this.centroTrabajoFiltroSeleccionado.id_centro_trabajo : null;
        let codigoCentroTrabajo = formulario.codigoCentroTrabajo;
        let becario = formulario.plazasPara != "-1" ? formulario.plazasPara : null;

        this.request = {
            idEtapaProceso: this.idEtapaProceso,
            idPlaza: idPlaza !=undefined ? idPlaza:null,
            codigoPlaza: codigoPlaza,
            idCentroTrabajo: idCentroTrabajo,
            codigoCentroTrabajo: codigoCentroTrabajo,
            esBecario: becario == "1" && becario != null ? true : becario == "0" && becario != null ? false : null,
            codigoCentroTrabajoMaestro:this.currentSession.codigoSede,
            anio: this.anio
        };
    }

    busquedaCentroTrabajoPersonalizada = () => {
        this.dialogRef = this.materialDialog.open(BuscarCentroTrabajoComponent, {
            panelClass: "buscar-centro-trabajo-dialog",
            width: "1300px",
            disableClose: true,
            data: {
                action: "requerimiento",
                codigoSede : this.currentSession.codigoSede,
		idEtapaProceso: this.idEtapaProceso
            },
        });

        this.dialogRef.afterClosed().subscribe((result) => {
            if (result != null) {
                this.form.get("codigoCentroTrabajo").setValue(result.centroTrabajo.codigo_centro_trabajo);
                this.centroTrabajoFiltroSeleccionado = { ...result.centroTrabajo };
            }
        });
    };

    busquedaPlazaPersonalizada(): void {
        this.dialogRef = this.materialDialog.open(BusquedaPlazaComponent, {
            panelClass: "buscar-plaza-dialog",
            width: "1900px",
            disableClose: true,
            data: {
                action: "busqueda",
                tipoFormato: TipoFormatoPlazaEnum.GENERAL,
                idEtapaProceso : this.idEtapaProceso,
		idRegimenLaboral: RegimenLaboralEnum.LEY_30328,
		codigoCentroTrabajo: this.currentSession.codigoSede

            },
        });

        this.dialogRef.afterClosed().subscribe((result) => {
            if (result != null) {
                this.form.get("codigoPlaza").setValue(result.plaza.codigoPlaza.trim());
                this.plazaFiltroSeleccionado = { ...result.plaza };
            }
        });
    }

    informacionValidacionPlazaView = (id) => {
        this.dialogRef = this.materialDialog.open(InformacionPlazaValidacionComponent, {
            panelClass: "informacion-validacion-plazas-dialog",
            width: "1000px",
            disableClose: true,
            data: {
                idEtapaProceso: this.idEtapaProceso,
                idPlaza: id,
                anio:this.anio
            },
        });
    };

    informacionMotivoPlazaObservadaView = (plazaMotivoObservada) => {
        this.dialogRef = this.materialDialog.open(ModalInformacionPlazaObservadaComponent, {
            panelClass: "modal-informacion-plaza-observada-dialog",
            width: "1000px",
            disableClose: true,
            data: {
                plazaObservada: plazaMotivoObservada,
            },
        });
    };

    handleFinalizarValidacionPlazas = () => {
        if (this.dataSourcePrepublicadas.data.length !== 0) {
            this.dataService.Message().msgWarning('"NO SE PUEDE FINALIZAR LA VALIDACIÓN, AÚN SE TIENE PLAZAS PREPUBLICADAS EN LA GRILLA."', () => { }); // M1111
            return;
        }

        const confirmationMessage = "<strong>¿ESTÁ SEGURO QUE DESEA FINALIZAR LA VALIDACIÓN DE LAS PLAZAS?</strong><br>Al finalizar la validación de las plazas se enviarán a la instancia superior para solicitar su aprobación.";
        this.dataService.Message().msgConfirm(confirmationMessage,
            () => {
                const request = {
                    idEtapaProceso: this.idEtapaProceso,
                    idEstadoValidacion: this.estadoPlaza.VALIDADO,
                    usuarioModificacion: "ADMIN",
                    codigoCentroTrabajoMaestro:this.currentSession.codigoSede,
                    tipoDocumentoIdentidad: this.currentSession.tipoNumeroDocumento,
                    numeroDocumentoIdentidad: this.currentSession.numeroDocumento,
                };

                this.dataService.Spinner().show("sp6");
                this.dataService.Contrataciones().actualizarPlazaContratacionEstadoValidacion(request).pipe(
                    catchError(() => of([])),
                    finalize(() => {
                        this.dataService.Spinner().hide("sp6");
                    })
                )
                .subscribe((result: number) => {
                    if (result) {
                        this.dataService.Message().msgAutoCloseSuccessNoButton('"OPERACIÓN REALIZADA DE FORMA EXITOSA."', 3000, () => {
                            this.obtenerPlazaContratacion();
                        });
                    } else {
                        this.dataService.Message().msgWarning('"OCURRIÓ UN PROBLEMA AL TRATAR DE FINALIZAR LA VALIDACIÓN."')
                    }                        
                });
            }
        );
    }

    handlePublicarPlazas() {
        //if (this.dataSourceConvocadas.data[0].codigo_estado_validacion !== this.estadoPlaza.APROBADO || this.validacionPlaza != "APROBADO") {
        
        if (this.validacionPlaza != "APROBADO") {
            this.dataService.Message().msgWarning('"LAS PLAZAS AÚN NO HAN SIDO APROBADAS POR LA INSTANCIA SUPERIOR."', () => { });
            return;
        }

        const confirmationMessage = "<strong>¿ESTÁ SEGURO QUE DESEA REALIZAR LA PUBLICACIÓN DE LAS PLAZAS?</strong>";
        this.dataService.Message().msgConfirm(confirmationMessage,
            () => {
                const request = {
                    idEtapaProceso: this.idEtapaProceso,
                    idEstadoValidacion: this.estadoPlaza.PUBLICADO,
                    maestroProceso: 'CONTRATACIÓN DOCENTE',
                    anio: this.fecha.getFullYear(), // TODO: HARCODE DETECTED
                    instancia: this.currentSession.codigoPadreSede,//'DRE BARRANCA',
                    subInstancia: this.currentSession.nombreSede,//'UGEL BARRANCA',
                    usuarioModificacion: this.currentSession.numeroDocumento,
                    codigoCentroTrabajoMaestro:this.currentSession.codigoSede,
                    idFlujoEstado : this.bandejaValidacionPlazas.getIdFlujoEstado()
                };
                this.dataService.Spinner().show("sp6");
                this.dataService.Contrataciones().actualizarPlazaContratacionEstadoValidacion(request).pipe(
                    catchError(() => of([])),
                    finalize(() => {
                        this.dataService.Spinner().hide("sp6");
                    })
                )
                .subscribe((result: number) => {
                    if (result) {
                        this.dataService.Message().msgAutoCloseSuccessNoButton('"OPERACIÓN REALIZADA DE FORMA EXITOSA."', 3000, () => {});
                        //this.obtenerPlazaContratacion();
			this.handleEvaluarCambioEstadoPublicacion();	
                    } else {
                        this.dataService.Message().msgWarning('"OCURRIÓ UN PROBLEMA AL TRATAR DE FINALIZAR LA VALIDACIÓN."')
                    }                        
                });
            }
        );
    }

    handleFinalizarEtapaProceso = () => {
        this.currentSession = this.dataService.Storage().getInformacionUsuario();

        this.dataService.Message().msgConfirm('¿ESTÁ SEGURO DE FINALIZAR LA ETAPA DE PUBLICACIÓN?',
            () => {
                const request = {
                    idEtapaProceso: this.idEtapaProceso,
                    idEstadoDesarrollo: EstadoEtapaProcesoEnum.FINALIZADO,
                    usuarioCreacion: "ADMIN",
                    codigoCentroTrabajoMaestro:this.currentSession.codigoSede,
                };

                this.dataService.Spinner().show("sp6");
                this.dataService.Contrataciones().registrarPlazaContratacionSiguienteEtapaDirectaResultadosPUN(request).pipe(
                    catchError((e) => of(e)),
                    finalize(() => {
                        this.dataService.Spinner().hide("sp6");
                    })
                )
                .subscribe((response) => {
                    if (response) {
                        this.dataService.Message().msgAutoCloseSuccessNoButton('"OPERACIÓN REALIZADA DE FORMA EXITOSA."', 3000, () => {});
                        this.obtenerEstadoDesarrolloEtapa();
                    } else {
                        this.dataService.Message().msgError('"OCURRIERON ERRORES AL TRATAR DE FINALIZAR LA ETAPA PROCESO."', () => {});
                    }
                });
            }
        );
    }

    handleVerPlazasPublicadas() {
        this.dialogRef = this.materialDialog.open(ModalDocumentosPublicadosComponent, {
            panelClass: 'minedu-modal-documentos-publicados',
            disableClose: true,
            data: {
                idEtapaProceso: this.idEtapaProceso,
                idGrupoDocumento: GrupoDocumentoPublicadoEnum.PUBLICACION,
                nombreDocumento: 'Plazas_Publicadas',
                dialogTitle:"Publicación de plazas de contratación docente",
                columnTitle:"Publicación",
                codigoCentroTrabajoMaestro: this.codSedeCabecera,
                idIteracion:this.bandejaValidacionPlazas.getIteracion()
            }
        });
    
        this.dialogRef.afterClosed()
            .subscribe((response: any) => {
                if (!response) {
                    return;
                }
            }
        );
    }

    descargarDocumentoPdf = (documento) => {
        this.dataService.Spinner().show("sp6");
        this.dataService.Documento().descargar(documento).pipe(
            catchError((e) => { this.dataService.SnackBar().msgError('"ERROR, NO SE PUDO ACCEDER AL SERVICIO."', 'Cerrar'); return of(e); }),
            finalize(() => this.dataService.Spinner().hide("sp6"))
            ).subscribe(response => {
                if (response) {
                this.handlePreview(response, "Plazas_Publicadas");
            } else {
                this.dataService.Message().msgWarning('"NO SE PUDO ACCEDER AL DOCUMENTO PDF DE LAS PLAZAS PUBLICADAS."', () => { });
            }
        });
    }

    handlePreview(file: any, nameFile: string) {
        this.dialogRef = this.materialDialog.open(DocumentViewerComponent, {
            panelClass: 'modal-viewer-form-dialog',
            disableClose: true,
            data: {
                modal: {
                    icon: "remove_red_eye",
                    title: "Plazas Publicadas",
                    file: file
                }
            }
        });
    
        this.dialogRef.afterClosed()
            .subscribe((response: any) => {
                if (!response) {
                    return;
                }
                if (response.download) {
                    saveAs(file, nameFile + ".pdf");
                }
            }
        );
    }

    handlePlazasConvocar = () => {
        if ((this.filaSeleccionadasPrePublicadas||[])?.length == 0 
	    && !this.isSeleccionadoTodosPrepublicadas) {
            this.dataService.Message().msgWarning('"DEBE SELECCIONAR COMO MÍNIMO UN REGISTRO DE LA GRILLA."', () => {});
            return;
        }

        this.dataService.Message().msgConfirm('¿ESTÁ SEGURO QUE DESEA CONVOCAR LAS PLAZAS?',
            () => {
	    let plazasSeleccionadas = this.filaSeleccionadasPrePublicadas
		                .map(item => {
				   return { idPlazaContratacionConvocar :  item.id_plaza_contratacion_detalle}
				});
	    let plazasNoSeleccionadas = this.filaNoSeleccionadas
		                .map(item => {
				   return { idPlazaContratacion:  item.id_plaza_contratacion_detalle}
				});

                const request = {
                    idEtapaProceso: this.idEtapaProceso, //SituacionPlazasEnum.PRE_PUBLICADA,
                    usuarioModificacion: "ADMIN",
                    plazas: null,
                    plazasConvocar: plazasSeleccionadas,
                    plazasObservar: null,
                    codigoCentroTrabajoMaestro : this.currentSession.codigoSede,
                    isSeleccionadoTodosPrepublicadas:this.isSeleccionadoTodosPrepublicadas,
		    tipoMovimiento:"PrePublicadaAConvocar",
		    plazasNoSeleccionadas:plazasNoSeleccionadas
                };
                this.dataService.Spinner().show("sp6");
                this.dataService.Contrataciones().actualizarPlazaSituacionValidacion(request).pipe(
                    catchError(() => of([])),
                    finalize(() => {
                        this.dataService.Spinner().hide("sp6");
                    })
                )
                .subscribe((result: number) => {
                    if (result) {

                        // ****************** codigo para  iniciar estado segun requerimiento de pruebas unitariasconvocar plazas ****************
                        if (this.estadoDesarrollo == 'PENDIENTE') { // EstadoEtapaProcesoEnum.PENDIENTE

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
                                        this.obtenerEstadoDesarrolloEtapa();
                                    });
                                }
                                else{
                                    this.dataService.Message().msgWarning('"LA ETAPA ANTERIOR TODAVÍA NO HA SIDO FINALIZADA."', () => {});
                                }
                            });
                
                           
                        } 
                        // ****************** fin de codigo
                        this.dataService.Message().msgAutoCloseSuccessNoButton('"OPERACIÓN REALIZADA DE FORMA EXITOSA."',  3000);
			this.paginatorPlazasPrepublicadas.firstPage();
			this.paginatorPlazasConvocar.firstPage();
			this.paginatorPlazasObservar.firstPage();
                        this.firstTime = true;
                        this.buscarPlazasContratacion();
			this.filaSeleccionadasPrePublicadas=[];
			this.isSeleccionadoTodosPrepublicadas = false;
                        //this.buscarPlazasContratacionConvocadas();
                    } else {
                        this.dataService.Message().msgWarning('"OCURRIÓ UN PROBLEMA AL TRATAR DE CONVOCAR LA PLAZA."')
                    }
                });
            }
        );
    };

    handlePlazasObservar = () => {        
        if ((this.filaSeleccionadasPrePublicadas||[])?.length == 0 
	    && !this.isSeleccionadoTodosPrepublicadas) {
            this.dataService.Message().msgWarning('"DEBE SELECCIONAR COMO MÍNIMO UN REGISTRO DE LA GRILLA."', () => {});
            return;
        }
	let tipoMovimiento = 'PrePublicadaAObservadas';
        let seleccionados = this.filaSeleccionadasPrePublicadas;
	let cantidadTotalFilas = this.dataSourcePrepublicadas?.dataTotal;

        this.handleObservarPlazasModal(seleccionados,tipoMovimiento,cantidadTotalFilas);
    }

    observarPlazas = (seleccionados,tipoMovimiento:string) => {

	let plazasObservar = seleccionados
	.map(item => {
	    return { idPlazaContratacionObservar :  item.id_plaza_contratacion_detalle}
	});

	let plazasNoSeleccionadas = this.filaNoSeleccionadas
	.map(item => {
	    return { idPlazaContratacion:  item.id_plaza_contratacion_detalle}
	});

        const request = {
            idEtapaProceso: this.idEtapaProceso,// SituacionPlazasEnum.PRE_PUBLICADA,
            usuarioModificacion: "ADMIN",
            plazas: null,
            plazasConvocar: null,
            plazasObservar: plazasObservar,
            codigoCentroTrabajoMaestro : this.currentSession.codigoSede,
            isSeleccionadoTodosPrepublicadas:this.isSeleccionadoTodosPrepublicadas,
	    tipoMovimiento:tipoMovimiento,
	    plazasNoSeleccionadas:plazasNoSeleccionadas
        };

        this.dataService.Spinner().show("sp6");
        this.dataService.Contrataciones().actualizarPlazaSituacionValidacion(request).pipe(
            catchError(() => of([])),
            finalize(() => {
                this.dataService.Spinner().hide("sp6");
            })
        )
        .subscribe((result: number) => {
            if (result) {
                // ****************** codigo para  iniciar estado segun requerimiento de pruebas unitariasconvocar plazas ****************
                if (this.estadoDesarrollo == 'PENDIENTE') { // EstadoEtapaProcesoEnum.PENDIENTE

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
                                this.obtenerEstadoDesarrolloEtapa();
                                console.log("Estado cambiado a INICIADO", this.estadoDesarrollo)
                                /*this.router.navigate(['./validacion-plazas/' + this.idEtapaProceso], {
                                    relativeTo: this.route,
                                })*/
                            });
                            // *************************************
                            // this.dialogRef = this.materialDialog.open(ModalIniciarEtapaComponent, {
                            //     panelClass: "modal-iniciar-etapa-dialog",
                            //     width: "400px",
                            //     disableClose: true,
                            //     data: {
                            //         mensaje: '¿Desea iniciar el desarrollo del proceso o desea visualizar las plazas publicadas?'
                            //     },
                            // });
                    
                            // this.dialogRef.afterClosed().subscribe((response: any) => {
                            //     if (response == 'I') {
                            //         let data = {
                            //             idEtapaProceso: row.id_etapa_proceso,
                            //             usuarioModificacion: this.passport.numeroDocumento,
                            //             idEstadoDesarrollo: EstadoEtapaProcesoEnum.INICIADO,
                            //             codigoCentroTrabajoMaestro: this.currentSession.codigoSede
                            //         };
                            //         this.dataService.Contrataciones().putActualizarEtapaProceso(data).pipe(
                            //             catchError((e) => of([e])),
                            //             finalize(() => {
                            //             })
                            //         )
                            //         .subscribe((d: any) => {
                            //             this.router.navigate(['./validacion-plazas/' + row.id_etapa_proceso], {
                            //                 relativeTo: this.route,
                            //             })
                            //         });
                            //     } else if (response == 'V') {
                            //         this.router.navigate(['./ver-validacion-plazas/' + row.id_etapa_proceso], {
                            //             relativeTo: this.route,
                            //         })
                            //     } else {
                            //         return;
                            //     }
                            // });
                            // *************************************
                        }
                        else{
                            this.dataService.Message().msgWarning('"LA ETAPA ANTERIOR TODAVÍA NO HA SIDO FINALIZADA."', () => {});
                        }
                    });
        
                   
                } else {
                    /*this.router.navigate(['./validacion-plazas/' + row.id_etapa_proceso], {
                        relativeTo: this.route,
                    })*/
                }
                // ****************** fin de codigo
                // this.dataService.Message().msgAutoCloseSuccessNoButton('"OPERACIÓN REALIZADA DE FORMA EXITOSA."',  3000);
                this.firstTime = true;
		this.paginatorPlazasPrepublicadas.firstPage();
		this.paginatorPlazasConvocar.firstPage();
		this.paginatorPlazasObservar.firstPage();
		this.buscarPlazasContratacion();
		this.filaSeleccionadasPrePublicadas = [];
		this.filaSeleccionadasConvocar = [];
		this.filaSeleccionadasObservar = [];
		this.filaNoSeleccionadas = [];
		this.isSeleccionadoTodosPrepublicadas = false;
            } else {
                this.dataService.Message().msgWarning('"OCURRIÓ UN PROBLEMA AL TRATAR DE CONVOCAR LA PLAZA."')
            }
        });
    }

    handlePlazasConvocarObservar = () => {
        this.firstTime = true;
        if ((this.filaSeleccionadasConvocar||[])?.length == 0
	   && !this.isSeleccionadoTodosPrepublicadas) {
            this.dataService.Message().msgWarning('"DEBE SELECCIONAR COMO MÍNIMO UN REGISTRO DE LA GRILLA."', () => {});
            return;
        }
        let seleccionados = this.filaSeleccionadasConvocar;
	let cantidadTotalFilas = this.dataSourceConvocadas?.dataTotal;
	let tipoMovimiento:string = 'ConvocarAObservadas';
        this.dataService.Message().msgConfirm('¿ESTÁ SEGURO QUE DESEA OBSERVAR LAS PLAZAS?',
            () => {
                this.handleObservarPlazasModal(seleccionados,tipoMovimiento,cantidadTotalFilas);
            }
        );
    }
    
    handleIniciarEtapa(){
        console.log("ESTADO ANTES DE INICIAR etapa",this.estadoDesarrollo);
        if (this.estadoDesarrollo == 'PENDIENTE'){
            let data = {
                idEtapaProceso: this.idEtapaProceso,
                usuarioModificacion: this.currentSession.numeroDocumento,
                idEstadoDesarrollo: EstadoEtapaProcesoEnum.INICIADO,
                codigoCentroTrabajoMaestro: this.currentSession.codigoSede
            };
            console.log("datos para inciar etapa", data)
            this.dataService.Contrataciones().putActualizarEtapaProceso(data).pipe(
                catchError((e) => of([e])),
                finalize(() => {
                })
            )
            .subscribe((d: any) => {
                this.obtenerEstadoDesarrolloEtapa();
                console.log("Estado de desarrollo, aperturado",this.estadoDesarrollo);
             });
        }
    }

    handlePlazasObservarConvocar = () => {
        if ((this.filaSeleccionadasObservar ||[])?.length == 0 
	    && !this.isSeleccionadoTodosPrepublicadas) {
            this.dataService.Message().msgWarning('"DEBE SELECCIONAR COMO MÍNIMO UN REGISTRO DE LA GRILLA."', () => {});
            return;
        }

        this.dataService.Message().msgConfirm('¿ESTÁ SEGURO QUE DESEA CONVOCAR LAS PLAZAS?',
            () => {

	    let plazasSeleccionadas = this.filaSeleccionadasObservar
		                .map(item => {
				   return { idPlazaContratacionConvocar :  item.id_plaza_contratacion_detalle}
				});

				let plazasNoSeleccionadas = this.filaNoSeleccionadas
				.map(item => {
				    return { idPlazaContratacion:  item.id_plaza_contratacion_detalle}
				});

                const request = {
                    idEtapaProceso:this.idEtapaProceso,// SituacionPlazasEnum.PRE_PUBLICADA,
                    usuarioModificacion: "ADMIN",
                    plazas: null,
                    plazasConvocar: plazasSeleccionadas,
                    plazasObservar: null,
                    codigoCentroTrabajoMaestro : this.currentSession.codigoSede,
                    isSeleccionadoTodosPrepublicadas:this.isSeleccionadoTodosPrepublicadas, // TODO *******************************ARREGARo
		    tipoMovimiento:'ObservadasAConvocar',
		    plazasNoSeleccionadas:plazasNoSeleccionadas,
		    conEliminarDatosObservaciones:true
                };

                this.dataService.Spinner().show("sp6");
                this.dataService.Contrataciones().actualizarPlazaSituacionValidacion(request).pipe(
                    catchError(() => of([])),
                    finalize(() => {
                        this.dataService.Spinner().hide("sp6");
                    })
                )
                .subscribe((result: number) => {
                    if (result) {
                        //const dataRequest = { idMotivo: null, detalle: null, flag: 1 };
                        //this.actualizarPlazaDocumentoSustento(this.filaSeleccionadasObservar, dataRequest);
			this.paginatorPlazasObservar.firstPage();
			this.firstTime = true;
                        this.buscarPlazasContratacionObservadas();
                    } else {
                        this.dataService.Message().msgWarning('"OCURRIÓ UN PROBLEMA AL TRATAR DE CONVOCAR LA PLAZA."')
                    }
                });
            }
        );
    }

    actualizarPlazaDocumentoSustento(seleccionados: any, data: any) {
        const ids = [];
        for(let i = 0; i < seleccionados.length; i++) {
            let idPlazaContratacion = seleccionados[i].id_plaza_contratacion_detalle;
            ids.push(idPlazaContratacion);
        }

	let plazasNoSeleccionadas = this.filaNoSeleccionadas
	.map(item => {
	    return { idPlazaContratacion:  item.id_plaza_contratacion_detalle}
	});

        const request: IActualizarIdDocumentoSustentoViewModel =
        {
            idMotivoNoPublicacion: data.idMotivo,
            detalleNoPublicacion: data.detalle,
            plazasObservar: ids.map((p) => {
                return {
                    idPlazaContratacionObservar: p,
                };
            }),
            usuarioModificacion: "ADMIN",
            flag: data.flag,
	    isSeleccionadoTodosPrepublicadas:this.isSeleccionadoTodosPrepublicadas, 
	    plazasNoSeleccionadas:plazasNoSeleccionadas
        };

        this.dataService.Spinner().show("sp6");
        this.dataService
	    .Contrataciones()
	    .actualizarIdDocumentoSustento(request)
	    .pipe(
            catchError(() => of([])),
            finalize(() => { this.dataService.Spinner().hide("sp6"); })
	    )
        .subscribe((result: any) => {
            if (!result) {
                this.dataService.Message().msgWarning('"HUBO ERRORES AL TRATAR DE ACTUALIZAR LA(S) PLAZA(S) SELECCIONADA(S)."', () => {});
            } else {
                //this.dataService.Message().msgAutoCloseSuccessNoButton('"OPERACIÓN REALIZADA DE FORMA EXITOSA."',  3000);
		this.paginatorPlazasConvocar.firstPage();
                this.buscarPlazasContratacion();
            }
        });
    }

    handleObservarPlazasModal(
	                      seleccionados: any[],
			      tipoMovimiento:string,
			      cantidadTotalFilas:number
			     ): void {
	let plazasNoSeleccionadas = this.filaNoSeleccionadas
	.map(item => {
	    return { idPlazaContratacion:  item.id_plaza_contratacion_detalle}
	});
        this.setRequest();
        this.dialogRef = this.materialDialog.open(ModalPlazaObservadaComponent, {
            panelClass: "modal-plaza-observada-dialog",
            width: "980px",
            disableClose: true,
            data: {
                plazasObservadas: seleccionados,
		cantidadTotalFilas:(cantidadTotalFilas - this.filaNoSeleccionadas?.length),
		isSeleccionadoTodosPrepublicadas: this.isSeleccionadoTodosPrepublicadas,
		noSeleccionados:plazasNoSeleccionadas,
		idEtapaProceso:this.idEtapaProceso,
		codigoCentroTrabajoMaestro:this.request.codigoCentroTrabajoMaestro,
		idSituacionValidacion: this.idSituacionValidacion 
            },
        });

        this.dialogRef.afterClosed().subscribe((response: any) => {
            if (!response) {
                return;
            } else {
                if (response.id !== "0") {
                    this.observarPlazas(seleccionados,tipoMovimiento);
                    //this.actualizarPlazaDocumentoSustento(seleccionados, response);
                    console.log("observacion finbalizada")
                    this.handleIniciarEtapa();
                } else {
                    console.log("observacion finbalizada 2")
                    return;
                }
            }
            // console.log("observacion finbalizada3", response)
            this.firstTime = true;
            this.buscarPlazasContratacionObservadas();
        });
    }

    handleExportarPlazasPrepublicadas = () => {
        this.handleExportarPlazasValidadas(this.dataSourcePrepublicadas.data, SituacionPlazasEnum.PRE_PUBLICADA, "Validacion_Plazas_Prepublicadas");
    }

    handleExportarPlazasConvocar = () => {
        this.handleExportarPlazasValidadas(this.dataSourceConvocadas.data, SituacionPlazasEnum.A_CONVOCAR, "Validacion_Plazas_Convocadas");
    }

    handleExportarPlazasObservadas = () => {
        this.handleExportarPlazasValidadas(this.dataSourceObservadas.data, SituacionPlazasEnum.OBSERVADA, "Validacion_Plazas_Observadas");
    }

    handleExportarPlazasValidadas = (data: any[], codigoValidacion: number, nombreExcel: string) => {
        if (data.length == 0) {
            this.dataService.Message().msgWarning('"NO SE ENCONTRÓ INFORMACIÓN PARA EXPORTAR."', () => {});
            return;
        }
        this.setRequest();
        let requestExport: IPlazasContratacionValidacion = { 
            idEtapaProceso: this.idEtapaProceso, 
            idSituacionValidacion: codigoValidacion ,
            codigoCentroTrabajoMaestro:this.currentSession.codigoSede,
            anio:this.anio,
            codigoCentroTrabajo : this.request.codigoCentroTrabajo,
            codigoPlaza : this.request.codigoPlaza,
            esBecario: this.request.esBecario
        };

        // ************************************************************************************************
        let fechaActual = new Date();
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
        this.dataService.Contrataciones().exportarExcelValidacionPublicacionPlazas(requestExport).pipe(
            catchError((e) => of(null)),
            finalize(() => {
                this.dataService.Spinner().hide("sp6");
            })
        )
        .subscribe((response: any) => {
            if (response) {
                // descargarExcel(response.file, nombreExcel);
                descargarExcel(response.file, nombreExportar);
            } else {
                this.dataService.Message().msgWarning('"NO SE PUDO GENERAR EL DOCUMENTO EXCEL DE LAS PLAZAS A EXPORTAR."', () => {});
            }
        });
    }

    handleRetornar = () => {
        this.router.navigate(["../../"], { relativeTo: this.route });
    };

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

    buildShared() {
        this.sharedService.setSharedBreadcrumb("Contratación / Publicación de Plazas");
        this.sharedService.setSharedTitle("Validación de Plazas");
    }

    
    obtenerFechaDeCortePublicacion = () => {
        let idProcesoEtapa = +this.route.snapshot.params.id;
        let codSede = this.currentSession.codigoSede;
        let codigoMaestroActividad = CodigoMaestroActividad.PUBLICACION_VALIDACION; // TODO: CREAR ENUM PARA ACTIVIDAD VALIDACIOND E PLAZAS

        this.dataService
            .Contrataciones()
            .obtenerFechaDeCortePublicacion(idProcesoEtapa, codSede, codigoMaestroActividad) // verificar
            .pipe(
                catchError(() => of([])),
                finalize(() => {})
            )
            .subscribe((response: any) => {
                if (response) {
                    console.log("obtener fecha corte:",response);
                    // this.fechaCorte = response.fechaDeCorte;
                    this.fechaFinRegional = response.fechaFinRegional;
                    this.nroEtapasIniciadas = +response.nroEtapasIniciadas;
                    // if(this.fechaCorte)
                    //    this.fechaCorteVisible = this.fechaCorte;
                }
            });
    };
    handleAperturarValidacionPlazas  = () => {
        let idProcesoEtapa = +this.route.snapshot.params.id;
        let codSede = this.currentSession.codigoSede;
        let codigoMaestroActividad = CodigoMaestroActividad.PUBLICACION_VALIDACION; // TODO: CREAR ENUM PARA ACTIVIDAD VALIDACIOND E PLAZAS

        let buscarEtapaInicio = {
          'codigoCentroTrabajo':this.currentSession.codigoSede,
          'anio':this.anio,
          'codigoEtapa':EtapaEnum.CONTRATACIÓN_POR_RESULTADOS_DE_LA_PUN
        }; 

	 forkJoin([
	    this.dataService
		.Contrataciones()
		.obtenerFechaDeCortePublicacion(idProcesoEtapa, codSede, codigoMaestroActividad),
	    this.dataService
		    .Contrataciones()
			    .getVerificarEstadoIniciadoEtapa(buscarEtapaInicio)
	 ]).subscribe(x =>{
	     if(validarFecha(x[0].fechaFinRegional))return;
	     if(validarExistePostulantesRegistradosSiguienteProceso(x[1]))return;
	     procesarApertura();
	 });

	 let validarFecha = (fechaFinRegional:any):boolean =>{
	     let fechaActual = new Date();

	     let fFinRegional = ((new Date(fechaFinRegional).toISOString()).split('T')[0]).split('-')
	     let fFinRegionalActividad = new Date(+fFinRegional[0],(+fFinRegional[1])-1,+fFinRegional[2]);

	     let fActual =((fechaActual.toISOString()).split('T')[0]).split('-');
	     let fFinActual= new Date(+fActual[0],(+fActual[1])-1,+fActual[2]);

	     if(fFinActual > fFinRegionalActividad){
		 this.dataService
		 .Message()
		 .msgWarning('"NO SE PUEDE APERTURAR LA PUBLICACIÓN DE PLAZAS, YA QUE FINALIZÓ LA ACTIVIDAD PUBLICACIÓN DE PLAZAS"', () => {}); // M152
		 return true;
	     }
	 };
	 let validarExistePostulantesRegistradosSiguienteProceso = (respuesta:boolean):boolean =>{
	     if(respuesta){
			this.dataService
			.Message()
			.msgWarning('"NO SE PUEDE APERTURAR LA PUBLICACIÓN DE PLAZAS, YA QUE EL PROCESO DE LA ETAPA CONTRATACIÓN PUN SE ENCUENTRA INICIADA"', () => {}); 
			return true;
	     }
	 }

	let procesarApertura = () => {
	    const request: any = {
		idEtapaProceso: this.idEtapaProceso,
		idEstadoDesarrollo: EstadoEtapaProcesoEnum.FINALIZADO,
		usuarioModificacion: 'ADMIN',
		ipModificacion : '::1',
		fechaModificacion : new Date(),
		codigoCentroTrabajoMaestro:this.currentSession.codigoSede,
                idFlujoEstado : this.bandejaValidacionPlazas.getIdFlujoEstado()
	    };
	    this.dataService
		.Message()
		.msgConfirm('¿ESTÁ SEGURO QUE DESEA REALIZAR LA APERTURA DE LA PUBLICACIÓN DE PLAZAS?',
		() => {
		    this.dataService.Spinner().show("sp6");
		    this.dataService
		        .Contrataciones()
			.putAperturarPlazasValidacion(request)
		    .pipe(
			catchError((e) => of(e)),
			finalize(() => {
			    this.dataService.Spinner().hide("sp6");
			})
		    )
		    .subscribe((response) => {
			if (response > 0) {
			    this.dataService
			        .Message()
				.msgAutoCloseSuccessNoButton('"OPERACIÓN REALIZADA DE FORMA EXITOSA."', 3000, () => {});
			    this.obtenerPlazaContratacion();
                            this.obtenerFlujoEstado();
			} else {
			    this.dataService
			        .Message()
				.msgError('"OCURRIERON ERRORES AL TRATAR DE APERTURAR LA ETAPA DE VALIDACION DE PLAZAS"', () => {});
			}
		    });
		}, (error) => {}
	    );
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
                    this.estadoDesarrollo = response.estadoDesarrollo;
                    this.comiteAprobado = response.comiteAprobado;
                    this.totalIncorporados = response.totalIncorporados;
		    this.bandejaValidacionPlazas.asignarEstadoValidacionAnterior(response.codigoEstadoValidacionAnterior);
                    console.log("estado servicio comite aprobado", this.comiteAprobado)
                    console.log("total Incorporados : ", response);

                    this.verificarIniciarEstadoPorIncorporacion();
                    /*if (this.validacionPlaza == 'PENDIENTE' && this.totalIncorporados>0){
                        this.dataService.Message().msgAutoCloseSuccessNoButton('INICIAR SUB-PROCESO!!."',3000,() => {                           
                        });                       
                    }*/
                }
            console.log("Estado de desarrollo : ", this.estadoDesarrollo);

            });
    };

    onSelectedIndexChange(tabIndex: number){
	this.isSeleccionadoTodosPrepublicadas = false;
        this.currentTabIndex = tabIndex;
        this.firstTime = true; // evita que generemos mensajes al navegar con los tabs
        this.handleBuscar();
	this.filaSeleccionadasPrePublicadas = [];
	this.filaSeleccionadasConvocar = [];
	this.filaSeleccionadasObservar = [];
	this.filaNoSeleccionadas = [];
	this.idSituacionValidacion = this.bandejaValidacionPlazas.getTabOpcion()[tabIndex];
    }

    handleEliminarPlazaIncorporada(row, i){
        //  console.log("eliminando plaza incorporada A ", i, " :",row);

        this.dataService.Message().msgConfirm('¿ESTÁ SEGURO QUE DESEA ELIMINAR LA INFORMACIÓN?',
            () => {
                this.dataService.Spinner().show("sp6");
                console.log("eliminando plaza incorporada A ", i, " :",row);
                console.log("eliminando plaza c detalle :", row.id_plaza_contratacion_detalle);
                // ****************************************************************
                let request: any =
                {
                    idPlazaContratacionDetalleIncorporada: row.id_plaza_contratacion_detalle,
                    codigoCentroTrabajoMaestro: this.currentSession.codigoSede,
                    codigoRolPassport: this.currentSession.codigoRol,
                    idEtapaProceso: this.idEtapaProceso,
                    ipCreacion: '',
                    usuarioModificacion: "ADMIN",
                    // plazas: seleccionados.map((s) => { // multiples plazas
                    //     return {
                    //         idPlazaContratacionDetalle: s.id_plaza_contratacion_detalle,
                    //     };
                    // }),
                };

                this.dataService.Contrataciones().eliminarPlazaIncorporada(request).pipe(
                    catchError(() => of([])),
                    finalize(() => {
                        this.dataService.Spinner().hide("sp6");
                    })
                )
                .subscribe((result: number) => {
                    if (result) {
                        this.dataService.Message().msgAutoCloseSuccessNoButton('"OPERACIÓN REALIZADA DE FORMA EXITOSA."',3000,() => {                           
                        });
                        this.handleBuscar();
                    } else {
                        this.dataService.Message().msgError('"ERROR, SURGIÓ UN PROBLEMA AL TRATAR DE ELIMINAR PLAZA."',() => {});
                    }                    
                });
                // ****************************************************************

                this.dataService.Spinner().hide("sp6");                
            }, (error) => {}
        );
        
    }
    handleVerMotivoRechazo(){
        this.dialogRef = this.materialDialog.open(ModalMotivoRechazoValidacionComponent, {
            panelClass: 'minedu-modal-motivo-rechazo-validacion',
            width: '540px',
            disableClose: false,
            data: {
                // idPlazaEncargatura: this.plazaEncargatura.idPlazaEncargatura
                idEtapaProceso : this.idEtapaProceso,
                codigoCentroTrabajoMaestro: this.currentSession.codigoSede,
                mensaje:"Motivo de rechazo"
            }
        });
    }

    semanforoValidacionPlaza = () => {
	let colores:any = {
	    'PENDIENTE':{'orange-500':true},
	    'VALIDADO':{'green-600':true},
	    'RECHAZADO':{'red-600':true},
	    'APROBADO':{'green-600':true},
	    'PUBLICANDO PLAZAS':{'color-black':true},
	    'PUBLICADO':{'blue-600':true},
	    'APERTURADO':{'color-black':true}
	};
	let c = colores[this.validacionPlaza]
	this.semaforoValidacionPlaza = colores[this.validacionPlaza];
    }

    handleActualizarEstado = () =>  this.obtenerPlazaContratacion();
    handleInformacionDesarrolloProceso = ({idEstadoDesarrollo}) =>{
      this.idEstadoDesarrollo = idEstadoDesarrollo;
    }
}

export class PlazasContratacionPrepublicadasDataSource extends DataSource<any> {
    private _dataChange = new BehaviorSubject<any>([]);
    private _loadingChange = new BehaviorSubject<boolean>(false);
    public loading = this._loadingChange.asObservable();
    public totalregistro = 0;

    constructor(private dataService: DataService) {
        super();
    }

    load(data: any, 
	 pageIndex,
	 pageSize,
	 firstTime=false
	): void {
        this.dataService.Spinner().show("sp6");
        this._loadingChange.next(false);
        if (data.idEtapaProceso === null) {
            this._loadingChange.next(false);
            this._dataChange.next([]);
        } else {
            data.idSituacionValidacion = SituacionPlazasEnum.PRE_PUBLICADA;

            this.dataService.Contrataciones().buscarPlazasContratacionPrepublicacionPaginado(data, pageIndex, pageSize).pipe(
                catchError(() => of([])),
                finalize(() => {
                    this._loadingChange.next(false);
                    this.dataService.Spinner().hide("sp6");
                })
            )
            .subscribe((plazasContratacion: any) => {
                this._dataChange.next(plazasContratacion || []);
                this.totalregistro = (plazasContratacion || []).length === 0 ? 0 : plazasContratacion[0].total_registros;
		if ((plazasContratacion || []).length === 0 && !firstTime) {
                    this.dataService
		        .Message()
			.msgWarning('"NO SE ENCONTRÓ INFORMACIÓN PARA LOS CRITERIOS DE BÚSQUEDA INGRESADOS."', () => {});
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

export class PlazasContratacionConvocadasDataSource extends DataSource<any> {
    private _dataChange = new BehaviorSubject<any>([]);
    private _loadingChange = new BehaviorSubject<boolean>(false);
    public loading = this._loadingChange.asObservable();
    public totalregistro = 0;

    constructor(private dataService: DataService) {
        super();
    }

    load(data: any, pageIndex, pageSize,firstTime=false): void {
        this.dataService.Spinner().show("sp6");
        this._loadingChange.next(false);
        if (data.idEtapaProceso === null) {
            this._loadingChange.next(false);
            this._dataChange.next([]);
        } else {
            data.idSituacionValidacion = SituacionPlazasEnum.A_CONVOCAR;

            this.dataService.Contrataciones().buscarPlazasContratacionPrepublicacionPaginado(data, pageIndex, pageSize).pipe(
                catchError(() => of([])),
                finalize(() => {
                    this._loadingChange.next(false);
                    this.dataService.Spinner().hide("sp6");
                })
            )
            .subscribe((plazasContratacion: any) => {
                this._dataChange.next(plazasContratacion || []);
                this.totalregistro = (plazasContratacion || []).length === 0 ? 0 : plazasContratacion[0].total_registros;
                if ((plazasContratacion || []).length === 0 && !firstTime) {
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

export class PlazasContratacionObservadasDataSource extends DataSource<any> {
    private _dataChange = new BehaviorSubject<any>([]);
    private _loadingChange = new BehaviorSubject<boolean>(false);
    public loading = this._loadingChange.asObservable();
    public totalregistro = 0;

    constructor(private dataService: DataService) {
        super();
    }

    load(data: any, pageIndex, pageSize,firstTime=false): void {
        this.dataService.Spinner().show("sp6");
        this._loadingChange.next(false);
        if (data.idEtapaProceso === null) {
            this._loadingChange.next(false);
            this._dataChange.next([]);
        } else {
            data.idSituacionValidacion = SituacionPlazasEnum.OBSERVADA;

            this.dataService.Contrataciones().buscarPlazasContratacionPrepublicacionPaginado(data, pageIndex, pageSize).pipe(
                catchError(() => of([])),
                finalize(() => {
                    this._loadingChange.next(false);
                    this.dataService.Spinner().hide("sp6");
                })
            )
            .subscribe((plazasContratacion: any) => {
                this._dataChange.next(plazasContratacion || []);
                this.totalregistro = (plazasContratacion || []).length === 0 ? 0 : plazasContratacion[0].total_registros;
                if ((plazasContratacion || []).length === 0 && !firstTime) {
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

interface ControlesActivos{
    btnFinalizarValidacionPlazas:boolean,
    btnPublicarPlazas:boolean,
    btnAperturarPublicacion:boolean,
    btnIncorporarPlazas: boolean,
    btnPlazasConvocar:boolean,
    btnPlazasObservadas:boolean
    btnVerPlazasPDF:boolean,
    btnExportar:boolean,
    btnEliminarPlazas:boolean
    // btnFinalizarEtapa : boolean,
    // btnAperturaEtapa : boolean,
    // btnPrePublicarPlazas:boolean,
    // btnPlazaBecarios:boolean,
}
