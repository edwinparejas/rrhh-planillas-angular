import { CollectionViewer, DataSource, SelectionModel } from '@angular/cdk/collections';
import { HttpErrorResponse } from '@angular/common/http';
import { AfterViewInit, Component, OnDestroy, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { ActivatedRoute, Router, RouterLinkWithHref } from '@angular/router';
import { mineduAnimations } from '@minedu/animations/animations';
import { DataService } from 'app/core/data/data.service';
import { StorageService } from 'app/core/data/services/storage.service';
import { SecurityModel } from 'app/core/model/security/security.model';
import { TablaPermisos } from 'app/core/model/types';
import { SharedService } from 'app/core/shared/shared.service';
import { descargarExcel } from 'app/core/utility/functions';
import { BehaviorSubject, Observable, of, Subject } from 'rxjs';
import { catchError, finalize, takeUntil, tap } from 'rxjs/operators';
import { DocumentViewerComponent } from '../../components/document-viewer/document-viewer.component';

import { BuscarPersonaComponent } from './components/buscar-persona/buscar-persona.component';
import { BuscarPlazaComponent } from './components/buscar-plaza/buscar-plaza.component';
import { GenerarProyectoComponent } from './components/generar-proyecto/generar-proyecto.component';
import { AccionesPersonalVinculacion, TablaEstadoVinculacion, CentroTrabajoModel, TablaEquivalenciaSede, MESSAGE_GESTION, criterioBusqueda } from './models/vinculacion.model';
import { ObservarVinculacionComponent } from './vinculacion/components/observar-vinculacion/observar-vinculacion.component';
import { ModalMonitorVinculacionComponent } from "./vinculacion/components/modal-monitor-instancias/modal-monitor-vinculacion.component";
import * as moment from 'moment';
import { isNull } from 'lodash';
import { CodigoDreUgelService } from '../pronoei/services/codigo-dre-ugel.service';
import { BuscarCentroTrabajoComponent } from '../pronoei/components/popups/buscar-centro-trabajo/buscar-centro-trabajo.component';



@Component({ 
  selector: 'minedu-gestionar-vinculacion',
  templateUrl: './gestionar-vinculacion.component.html',
  styleUrls: ['./gestionar-vinculacion.component.scss'],
  encapsulation: ViewEncapsulation.None,
  animations: mineduAnimations,
})
export class GestionarVinculacionComponent implements OnInit, OnDestroy, AfterViewInit {
  // AccionesPersonal: AccionPersonalModels = new AccionPersonalModels();

  passportModular={
    idNivelInstancia: null,        
    idEntidadSede: null, 
    idRolPassport: null
  }

  private _unsubscribeAll: Subject<any>;

  isSelectPricipal = false;

  estadoRegistrado = TablaEstadoVinculacion.REGISTRADO;
  estadoAutorizado = TablaEstadoVinculacion.AUTORIZADO;

  centroTrabajo: CentroTrabajoModel = null;

  idEtapaProceso: number;

  Nombre_Usuario = "";
  idDre = 0
  idUgel = 0
  codigoTipoSede = "";
  codigoSede = "";
  codigoRol = "";

  ConteoBusqueda = 0;
  form: FormGroup;
  formExportar: any = {};
  loading: false;

   
  
  export = false;

  entidad = false;
  
  now = new Date();
  untilDate = new Date();
  untilDateFin = new Date(new Date().getFullYear(), 11, 31);
  minDate = new Date((new Date).getFullYear(), 0, 1);
  minDateFin = new Date((new Date).getFullYear(), 0, 1);
  maxDate = new Date(new Date().getFullYear(), 11, 31);

  dialogRef: any;

  comboLists = {
    listAnio: [],
    listRegimenlaboral: [],
    listAccion: [],
    listMotivoAccion: [],
    listMotivoAccionTotal: [],
    listMandatoJudicial: [],
    listTipoDocumento: [],
    listEstado: []
  };
  private currentSession: SecurityModel = new SecurityModel();
  private passport: SecurityModel = new SecurityModel();
  dataUserLoginModel: any;

  permisos = {
    autorizadoAgregar: false,
    autorizadoModificar: false,
    autorizadoEliminar: false,
    autorizadoEnviar: false,
    autorizadoExportar: false,
    autorizadoConsultar: false,
    autorizadoProyecto: false
  };
  hasAccessPage: boolean;

  displayedColumns: string[] = [
    'seleccione',
    'regimen_laboral',
    'accion',
    'motivo_accion',
    'mandato_judicial',
    'documentos',
    'apellidos_nombres',
    'fecha_inicio',
    'fecha_fin',
    'codigo_plaza',
    'estado',
    'situacion_resolucion',
    'acciones'
  ];
  

  centroTrabajoFiltroSeleccionado: any;

  dataSource: GestionVinculacionDataSource | null;
  selection = new SelectionModel<any>(true, []);
  @ViewChild(MatPaginator, { static: true })
  paginator: MatPaginator;
  
  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private formBuilder: FormBuilder,
    private dataService: DataService,
    private sharedService: SharedService,
    private materialDialog: MatDialog,
    private storageService: StorageService,
    private codigoDreUgelService: CodigoDreUgelService
  ) {
    this._unsubscribeAll = new Subject();
  }
  
  ngOnInit(): void {
    setTimeout(_ => this.buildShared());
    // setTimeout(_ => this.obtenerCodigoDreUgelLogeado(), 100);

    
    this.buildForm();
    
    this.buildPassport();   
    this.getDreUgelData();     
    this.buildSeguridad();    

    this.loadCombos();
    
    this.dataSource = new GestionVinculacionDataSource(this.dataService);
    this.paginator.showFirstLastButtons = true;
    this.paginator._intl.itemsPerPageLabel = "Registros por página";
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
    debugger;
    //this.entidadPassport();
    //this.obtenerCodigoDreUgelLogeado();    
/*
    this.codigoTipoSede = this.passport.codigoTipoSede;
    console.log("codigoRol: ",this.currentSession.codigoRol);
    console.log("TioSede: ",this.codigoTipoSede);
    */
    /*if (this.currentSession.codigoRol=='AYNI_019' && (this.codigoTipoSede=='TS001' || this.codigoTipoSede=='TS002' || this.codigoTipoSede=='TS012' || this.codigoTipoSede=='TS013')){
      this.handleModalInstancia();
    }*/

  }

  private async getDreUgelData() {

    this.codigoTipoSede = this.codigoDreUgelService.passportModel.CODIGO_TIPO_SEDE;
    this.codigoSede = this.codigoDreUgelService.passportModel.CODIGO_SEDE;
    this.codigoRol = this.codigoDreUgelService.passportModel.CODIGO_ROL;

    var entidadSede = await this.codigoDreUgelService.getCodigoDreUgelFromServiceInit();
    const codigos = this.codigoDreUgelService.getCodigoDreUgel();
    const entidadPassport = this.codigoDreUgelService.passportModel
    const tipoSedeList = ['TS001', 'TS002', 'TS012'];
    if (entidadPassport.CODIGO_ROL == 'AYNI_019' &&
        (!entidadSede || !entidadSede?.codigoTipoSede || !tipoSedeList.includes(entidadSede.codigoTipoSede))) {
        this.router.navigate(['/ayni/personal/inicio']);
        return;
    }

    if (codigos) {
        
        this.idUgel = codigos.idUgel;
        this.idDre = codigos.idDre;

        this.handleBuscar();

        this.ObtenerPermisoVinculacion();
    }
  }

  entidadPassport(){
    this.dataService.AccionesVinculacion().entidadPassport(this.passport.codigoSede).pipe(
      catchError((error: HttpErrorResponse) => {
        this.dataService.Message().msgWarning(error.error.messages[0]); return of(null);
      }),
    ).subscribe((response: any) => {
      if (response.length > 0){
        if (response.length > 1)
          response = response.filter(x => x.idNivelInstancia <= 3);
          console.log("entidadPassport: ",response);
        if (response.length == 1 && response[0].idNivelInstancia == 3)
        this.passport.codigoTipoSede = TablaEquivalenciaSede.CODIGO_TIPO_SEDE_UGEL;

        
        this.centroTrabajo = response[0];
        this.idDre = this.centroTrabajo?.idDre;
        this.idUgel = this.centroTrabajo?.idUgel;
        this.codigoTipoSede = this.passport.codigoTipoSede; 
               
      }else{
        this.centroTrabajo = null;
      }
    });
  }

  handleModalInstancia(){
    debugger
    console.log("codigoSede Original: ",this.currentSession.codigoSede);

    // console.log("Busqueda personalizada data ",  this.idEtapaProceso, 'busqueda');
    this.dialogRef = this.materialDialog.open(ModalMonitorVinculacionComponent, {
        panelClass: "minedu-modal-monitor-vinculacion",
        width: "1100px",
        disableClose: true,
        data: {
            codigoRol:this.currentSession.codigoRol,
            codigoSede:this.currentSession.codigoSede,
            codigoTipoSede:this.currentSession.codigoTipoSede,
        },
    });

    this.dialogRef.afterClosed().subscribe((result) => {
      debugger
        if (result != null) {
            // console.log("Respuesta de Modal ",result);
            //this.form.get("codigoPlaza").setValue(result.plaza.codigo_plaza.trim());
            // this.plazaFiltroSeleccionado = { ...result.plaza };
            if(result.codigoSede != null)
                this.handleSeleccionarSedeMonitor(result.codigoSede);
                this.obtenerCodigoDreUgelLogeado();
                
        }
    });
  }

  handleSeleccionarSedeMonitor(codigoSede){
    debugger
    // console.log("Detalles de Sesion 150103",this.dataService.Storage().getPassportRolSelected());
    var rolSession = this.dataService.Storage().getPassportRolSelected();
    rolSession.CODIGO_SEDE = codigoSede;//"150209";
    this.dataService.Storage().setPassportRolSelected(rolSession);
    // console.log("Detalles de Sesion ¿150209??",this.dataService.Storage().getPassportRolSelected());
    this.currentSession = this.dataService.Storage().getInformacionUsuario();
    console.log("codigoSede Alterado: ",this.currentSession);

    this.dataService.Storage().getInformacionUsuario()
  }

  /*variables responsive*/
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

  buildShared() {
    console.log('buildShared');
    // this.sharedService.setSharedBreadcrumb("Gestionar Acciones de vinculación");
    // this.sharedService.setSharedTitle("Gestionar vinculación");
  }

  buildPassport() {
    debugger
    this.passport = this.dataService.Storage().getInformacionUsuario();    
    const usuario = this.dataService.Storage().getPassportUserData();
    this.Nombre_Usuario = usuario.NOMBRES_USUARIO;
    const rolSelected = this.dataService.Storage().getPassportRolSelected();
    console.log("this.passport", this.passport);
    console.log("usuario =>", usuario);
    console.log("rolSelected =>", rolSelected);
  }

  buildSeguridad = () => {    

    this.currentSession = this.dataService.Storage().getInformacionUsuario();
    
    console.log("session", this.currentSession);
  }

  buildForm(): void {
    this.form = this.formBuilder.group({
      anio: [this.now.getFullYear(), Validators.required],
      anioDt: [this.now],
      idRegimenLaboral: [-1],
      idAccion: [-1],
      idMotivoAccion: [-1],
      idMandatoJudicial: [-1],
      idTipoDocumento: [-1],
      numeroDocumentoIdentidad: [null],
      idEstado: [-1],
      codigoPlaza: [null],
      codigoModular: [null],
      fechaInicio: [null],
      fechaTermino: [null],
      idDre: [null],
      idUgel: [null],
      conteoBusqueda: [0],
    });
   

    this.form.get("anioDt").valueChanges.subscribe(value => {
      debugger
      if (value) {
        this.onChangeMinMaxDate(); 
      }
    });

    this.form.get("fechaInicio").valueChanges.subscribe(value => {
      debugger
      if (value) {
        this.minDateFin = this.form.get('fechaInicio').value;
      }
    });
  }

  ngAfterViewInit(): void {
    // throw new Error('Method not implemented.');
    this.paginator.page
      .pipe(
        tap(() => this.loadGrid())
      )
      .subscribe();
  }

  ngOnDestroy(): void {
    this._unsubscribeAll.next();
        this._unsubscribeAll.complete();
        this.codigoDreUgelService.complete();
    // throw new Error('Method not implemented.');
  }

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
    return `${this.selection.isSelected(row) ? "deselect" : "select"} row ${row.position + 1}`;
  }

  handleLimpiar(): void {
    // this.form.reset();
    this.form.patchValue({
      anio: this.now.getFullYear(),
      anioDt: this.now,
      idRegimenLaboral: -1,
      idAccion: -1,
      idMotivoAccion: -1,
      idMandatoJudicial: -1,
      idTipoDocumento: -1,
      numeroDocumentoIdentidad: null,
      idEstado: -1,
      codigoPlaza: null,
      codigoModular: null,
      fechaInicio: null,
      fechaTermino: null,
    })

    this.handleBuscar();
  }

  obtenerCodigoDreUgelLogeado(): void {
    debugger;    
    const rolSelected = this.dataService.Storage().getPassportRolSelected();
    const sedeSeleccionado = rolSelected.CODIGO_SEDE;
    const request = {
      codigoEntidadSede: sedeSeleccionado
    };
    this.dataService.AccionesVinculacion().getCodigoDreUgel(request).subscribe(
      (response) => {
        console.log('obtenerCodigoDreUgelLogeado() =>', response);
        this.dataUserLoginModel = response;
        this.idUgel = response.idUgel;
        this.idDre = response.idDre;
        if (this.dataUserLoginModel == null) {
          if(this.ConteoBusqueda == 0) {
            this.ConteoBusqueda = 1 ;
          } else {
            this.dataService
            .Message()
            .msgWarning(
              '"NO SE ENCONTRÓ INFORMACIÓN PARA LOS CRITERIOS DE BÚSQUEDA INGRESADOS."',
              () => { }
            );
          }

          
        } 
        else {
          this.handleBuscar();
        }
      }, 
      (error: HttpErrorResponse) => {
      }
    )
  }

  ObtenerPermisoVinculacion(): void {
    debugger;
    const request = {
      CodigoRol: this.codigoRol,
      CodigoTipoSede: this.codigoTipoSede
    };
    
    this.dataService.AccionesVinculacion().getObtenerPermisoVinculacion(request).subscribe(
      (response) => {
        console.log('obtenerPermisoVinculacion() =>', response);           
        this.permisos.autorizadoAgregar = response.nuevoRegistro;
        this.permisos.autorizadoModificar = response.editarRegistro;
        this.permisos.autorizadoEliminar = response.eliminarRegistro;
        this.permisos.autorizadoEnviar = response.accionesGrabadas;
        this.permisos.autorizadoProyecto = response.generarProyecto;
      }, 
      (error: HttpErrorResponse) => {
        this.dataService.Message().msgWarning('"'+error.error.messages[0]+'"');
        this.dataService.Spinner().hide("sp6");
        console.log(error);
      }
    )
    
  }

  handleNuevo(): void {
    debugger
    this.router.navigate(['ayni/personal/acciones/vinculacion/agregar'])
  }

  handleExportar(): void {

    this.dataService.Spinner().show("sp6");    
      
      this.dataService.AccionesVinculacion().getGestionVinculacionExcel(this.formExportar).subscribe(
        (response) => {
          this.dataService.Spinner().hide("sp6");
          const fecha = moment().format('DDMMYYYY');
          descargarExcel(response, `Vinculación ${fecha}.xlsx`);
        },
        (error: HttpErrorResponse) => {
          this.dataService.Spinner().hide("sp6")
          this.dataService.Message().msgWarning("OCURRIÓ AL REALIZAR AL EXPORTAR LA VINCULACIÓN.");
        }
      )
      
  }

  handleGrid() {

    const form = this.form.value;
    form.codigoRolPassport = this.passport.codigoRol;
    form.codigoTipoSede = this.passport.codigoTipoSede;
    form.codigoCentroTrabajo = this.passport.codigoSede;
    form.codigoCentroTrabajoMaestro = this.passport.codigoSede;
    form.idDre = this.idDre;
    form.idUgel = this.idUgel;

    console.log('handleBuscar()', form);

    this.loadGrid();

  }


  handleBuscar(): void {
    debugger
    const form = this.form.value;
    form.codigoRolPassport = this.passport.codigoRol;
    form.codigoTipoSede = this.passport.codigoTipoSede;
    form.codigoCentroTrabajo = this.passport.codigoSede;
    form.codigoCentroTrabajoMaestro = this.passport.codigoSede;
    form.idDre = this.idDre;
    form.idUgel = this.idUgel;

    const _vigenciaInicio = this.form.get('fechaInicio').value;
    const _vigenciaFin =  this.form.get('fechaTermino').value;
    const vigenciaInicio = _vigenciaInicio ? moment(_vigenciaInicio).format('MM-DD-YYYY') : null;
    let vigenciaFin = _vigenciaFin ? moment(_vigenciaFin).format('MM-DD-YYYY') : null;

    form.fechaInicio = vigenciaInicio;
    form.fechaTermino = vigenciaFin;

    console.log('handleBuscar()', form);

    if(this.form.value.codigoModular) {
      let validacionCodigoTrabajo = criterioBusqueda.validarCodigoTrabajo(this.form.value.codigoModular);
      if (!validacionCodigoTrabajo.esValido) {
          this.dataService.Message().msgWarning(validacionCodigoTrabajo.mensaje);
          return;
      }
    }

    if(this.form.value.codigoPlaza) {
      let validacionCodigoPlaza = criterioBusqueda.validarCodigoPlaza(this.form.value.codigoPlaza);
      if (!validacionCodigoPlaza.esValido) {
          this.dataService.Message().msgWarning(validacionCodigoPlaza.mensaje);
          return;
      }
    }

    if(this.form.value.idTipoDocumento > 0) {
      let numeroDocumento = ''
      if( !isNull(this.form.value.numeroDocumentoIdentidad) ) {
        numeroDocumento = this.form.value.numeroDocumentoIdentidad
      }
      let validacionDocumento = criterioBusqueda.validarNumeroDocumento(this.form.value.idTipoDocumento, numeroDocumento);
      if (!validacionDocumento.esValido) {
          this.dataService.Message().msgWarning(validacionDocumento.mensaje);
          return;
      }
    }

    this.loadGrid();

    this.formExportar = {
      anio: new Date(this.form.value.anioDt).getFullYear(),
      idRegimenLaboral: this.form.value.idRegimenLaboral,
      idAccion : this.form.value.idAccion,
      idMotivoAccion : this.form.value.idMotivoAccion,
      idMandatoJudicial : this.form.value.idMandatoJudicial,
      idTipoDocumento : this.form.value.idTipoDocumento,
      numeroDocumentoIdentidad : this.form.value.numeroDocumentoIdentidad,
      idEstado : this.form.value.idEstado,
      codigoPlaza : this.form.value.codigoPlaza,
      codigoModular : this.form.value.codigoModular,
      fechaInicio : this.form.value.fechaInicio,
      fechaTermino : this.form.value.fechaTermino,
      idDre : this.form.value.idDre,
      idUgel : this.form.value.idUgel,
    }

  }

  loadGrid(){
    
    

    this.dataSource.load(this.form.value, (this.paginator.pageIndex + 1), this.paginator.pageSize);
  }

  loadCombos = () => {
    this.loadAnio();
    this.loadRegimenesLaborales();
    //this.loadAcciones();
    //this.loadMotivosAcciones();
    this.loadMandatoJudicial();
    this.loadTipoDocumento();
    this.loadEstado();
    //this.loadComboAcciones2(this);
    this.loadMotivosAccionesTotal();
  } 

  loadComboAcciones2(id_regimen_laboral) {
    debugger
    if(id_regimen_laboral === -1){
      this.form.get('idMotivoAccion').disable()
      this.form.patchValue({     
        idMotivoAccion: -1
      })
    } else {
      this.form.get('idMotivoAccion').enable()
    }
  } 

  loadComboAcciones(id_regimen_laboral) {
    
    if (id_regimen_laboral == undefined) {
      return;
    }

    this.dataService.AccionesVinculacion().getComboAccionPorRegimenLaboral(id_regimen_laboral).subscribe(
      (response) => {
        
        this.comboLists.listAccion = response;
        this.comboLists.listAccion.unshift({
          id_accion: -1,
          descripcion_accion: '--TODOS--'
        })
        this.comboLists.listMotivoAccion = [];  
        
        this.form.patchValue({
          idAccion: 0,
          idMotivoAccion: 0
        })
      },
      (error: HttpErrorResponse) => {
        console.log(error);
      }
    )
  }

  loadAnio = () => {
    this.dataService.AccionesVinculacion().getComboAnio().subscribe(
      (response) => {
        if (response) {
          const data = response.map(m => {
            return {
              value: m,
              label: m
            };
          })
          debugger
          this.comboLists.listAnio = data;
      }
      },
      (error: HttpErrorResponse) => {
        console.log(error);
      }
    )
  }

  loadRegimenesLaborales = () => {
    let request = {
      codigoRol: this.currentSession.codigoRol
    }
    this.dataService.AccionesVinculacion().getComboRegimenLaboral(request).subscribe(
      (response) => {
        this.comboLists.listRegimenlaboral = response;
        this.comboLists.listRegimenlaboral.unshift({
          idRegimenLaboral: -1,
          descripcionRegimenLaboral: '--TODOS--'
        })
      },
      (error: HttpErrorResponse) => {
        console.log(error);
      }
    )
  }

  loadAcciones = () => {
    this.dataService.AccionesVinculacion().getComboAccion().subscribe(
      (response) => {
        this.comboLists.listAccion = response;
        this.comboLists.listAccion.unshift({
          id_accion: -1,
          descripcion_accion: '--TODOS--'
        })
      },
      (error: HttpErrorResponse) => {
        console.log(error);
      }
    )
  }

  loadMotivosAcciones = (id_accion) => {

    this.form.patchValue({
            idMotivoAccion: -1
          })
    
    if (id_accion == undefined) {
      return;
    }

    const params = {
      id_accion: id_accion,
      id_regimen_laboral: parseInt(this.form.get('idRegimenLaboral').value)
    }
    this.dataService.AccionesVinculacion().getComboMotivoAccionPorAccion(params).subscribe(
      (response) => {
        this.comboLists.listMotivoAccion = response;
        this.comboLists.listMotivoAccion.unshift({
          id_motivo_accion: -1,
          descripcion_motivo_accion: '--TODOS--'
        })
      },
      (error: HttpErrorResponse) => {
        console.log(error);
      }
    )
  }

  loadMotivosAccionesTotal = () => {
    
    const params = {
      id_accion: 0
    }
    this.dataService.AccionesVinculacion().getComboMotivoAccion(params).subscribe(
      (response) => {
        this.comboLists.listMotivoAccionTotal = response;
        
      },
      (error: HttpErrorResponse) => {
        console.log(error);
      }
    )
  }

  loadMandatoJudicial= () => {
    this.comboLists.listMandatoJudicial.unshift({
      value: 1,
      label: 'SI'
    })
    this.comboLists.listMandatoJudicial.unshift({
      value: 0,
      label: 'NO'
    })
    this.comboLists.listMandatoJudicial.unshift({
      value: -1,
      label: '--TODOS--'
    })
  }

  loadTipoDocumento = () => {
    let request = {
      codigoCatalogo: 6,
      Inactivo: true
    }
    this.dataService.AccionesVinculacion().getCatalogoItem(request).subscribe(
      (response) => {
        this.comboLists.listTipoDocumento = response;
        this.comboLists.listTipoDocumento.unshift({
          id_catalogo_item: -1,
          descripcion_catalogo_item: '--TODOS--'
        })
      },
      (error: HttpErrorResponse) => {
        console.log(error);
      }
    )
  }

  loadEstado = () => {
    let request = {
      codigoCatalogo: 134
    }
    this.dataService.AccionesVinculacion().getCatalogoItem(request).subscribe(
      (response) => {
        this.comboLists.listEstado = response;
        this.comboLists.listEstado.unshift({
          id_catalogo_item: -1,
          descripcion_catalogo_item: '--TODOS--'
        })
      },
      (error: HttpErrorResponse) => {
        console.log(error);
      }
    )
  }


  buscarPlaza(event) {
    event.preventDefault();
    const codigoPlaza = this.form.get("codigoPlaza").value;
    if (!codigoPlaza) {
      this.dataService.Message().msgWarning('Ingrese el código de plaza para realizar la búsqueda.', () => { });
      return;
    }
  }

  onKeyPressCodigoPlaza(e: any): boolean {
    var inp = String.fromCharCode(e.keyCode);

      if (/[a-zA-Z0-9]/.test(inp)) {
        return true;
      } else {
        e.preventDefault();
        return false;
      }  
  }

  busquedaPlazaPersonalizada = () => {
    this.dialogRef = this.materialDialog.open(BuscarPlazaComponent, {
        panelClass: 'buscar-plaza-form-dialog',
        width: "1200px",
        disableClose: true,
        data: {
            action: "busqueda",
            currentSession:this.currentSession,
            idEtapaProceso:this.idEtapaProceso,
            idRegimenLaboral: this.form.get('idRegimenLaboral').value,
            idDre: this.idDre,
            idUgel: this.idUgel
        },
    });

    this.dialogRef.afterClosed().subscribe((resp) => {
      if (resp != null) {
        debugger;
          const plaza = resp;
          this.form.patchValue({ 
            codigoPlaza: plaza.plaza.codigo_plaza
          });           
      }
  });

  };


  buscarPlazaDialogo(event) {
    event.preventDefault();
    const codigoPlaza = this.form.get("codigoPlaza").value;
    if (codigoPlaza) {
      this.buscarPlaza(event);
      return;
    }

    this.dialogRef = this.materialDialog.open(BuscarPlazaComponent, {
      panelClass: 'buscar-plaza-form-dialog',
      disableClose: true,
      data: {
        codigoRol: this.passport.codigoRol,
        codigoTipoSede: this.passport.codigoSede
      }
    });

    this.dialogRef.afterClosed()
      .subscribe((response: any) => {
        if (!response) {
          return;
        }
        console.log(response);
        this.form.patchValue({ codigoPlaza: response.codigo_plaza });
        // this.plaza = response;
      });
  }

  buscarPlazaPersona(event) {
    event.preventDefault();
    const codigoPlaza = this.form.get("codigoPlaza").value;
    if (codigoPlaza) {
      this.buscarPlaza(event);
      return;
    }

    this.dialogRef = this.materialDialog.open(BuscarPersonaComponent, {
      panelClass: 'buscar-persona-form-dialog',
      disableClose: true,
      data: {
        esProceso: false
      }
    });

    this.dialogRef.afterClosed()
      .subscribe((response: any) => {
        if (!response) {
          return;
        }
        console.log('persona selected - close => ', response);
        this.form.patchValue({ 
          numeroDocumentoIdentidad: response.numeroDocumentoIdentidad,
          idTipoDocumento: response.idTipoDocumentoIdentidad
        });
        // this.plaza = response;
      });
  }

  busquedaServidorPublicoPersonalizada = () => {
    this.dialogRef = this.materialDialog.open(
      BuscarPersonaComponent,
        {
            panelClass: "buscar-persona-form-dialog",
            width: "980px",
            disableClose: true,
            data: {
                action: "busqueda",
                TipoDocumento: this.form.get('idTipoDocumento').value,
                NumeroDocumento: this.form.get('numeroDocumentoIdentidad').value,                
                idRegimenLaboral: this.form.get('idRegimenLaboral').value,
                idDre : this.idDre,
                idUgel : this.idUgel
            },
        }
    );
    this.dialogRef.afterClosed().subscribe((resp) => {
        if (resp != null) {
            const servidorPublico = resp;
            this.form.patchValue({ 
              numeroDocumentoIdentidad: servidorPublico.servidorPublico.numeroDocumentoIdentidad,
              idTipoDocumento: servidorPublico.servidorPublico.idTipoDocumentoIdentidad
            });           
        }
    });
};

  buscarCentroTrabajo(event) {
    event.preventDefault();
    const codigoCentroTrabajo = this.form.get("codigoModular").value;
    if (!codigoCentroTrabajo) {
      this.dataService.Message().msgWarning('Ingrese el código de centro de trabajo para realizar la búsqueda', () => { });
      return;
    }
  }

  buscarCentroTrabajoDialogo(event) {
    event.preventDefault();
    const codigoModular = this.form.get("codigoModular").value;
    if (codigoModular) {
      this.buscarCentroTrabajo(event);
      return;
    }
    this.dialogRef = this.materialDialog.open(BuscarCentroTrabajoComponent, {
      panelClass: 'buscar-centro-trabajo-form-dialog',
      width: "1000px",
                disableClose: true,
                data: {
                    action: "requerimiento",
                    currentSession:this.currentSession
                },
    });

    this.dialogRef.afterClosed()
      .subscribe((response: any) => {
        if (!response) {
          return;
        }
        // this.centroTrabajo = response;
        this.form.patchValue({
          codigoModular: response.codigo_centro_trabajo
        })
      });
  }

  busquedaCentroTrabajoPersonalizada = () => {
    this.passportModular.idNivelInstancia=1;
    this.passportModular.idEntidadSede=1


    const currentSession = this.dataService.Storage().getInformacionUsuario();
    var dialogRef = this.materialDialog.open(BuscarCentroTrabajoComponent, {
        panelClass: 'buscar-centro-trabajo-form-dialog',
        width: "1000px",
        disableClose: true,
        data: {
            action: "requerimiento",
            currentSession: currentSession
        },
    });

    dialogRef.afterClosed()
        .pipe(takeUntil(this._unsubscribeAll))
        .subscribe((response: any) => {
            if (!response) {
                return;
            }
            const codCentroTrabajo = response?.centroTrabajo?.codigoCentroTrabajo;
            this.form.controls['codigoModular'].setValue(codCentroTrabajo);
        });
  };



  onChangeTipoDocumento() {
    const idTipoDocumento = this.form.get('idTipoDocumento').value;
    if (idTipoDocumento == -1) {
      this.form.patchValue({
        numeroDocumentoIdentidad: ''
      });
    }
  }


  onKeyPressNumeroDocumento(e: any): boolean {
    let _idTipoDocumento  = this.form.get('idTipoDocumento').value;
    let tipoDocumentoSelect = this.comboLists.listTipoDocumento.find(m => m.id_catalogo_item == _idTipoDocumento);
    if (tipoDocumentoSelect.codigo_catalogo_item == 1) {
      //------------ DNI
      const reg = /^\d+$/;
      const pressedKey = String.fromCharCode(!e.charCode ? e.which : e.charCode);
      if (!reg.test(pressedKey)) {
        e.preventDefault();
        return false;
      }  
    } else {
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

  onChangeMinMaxDate() {

    this.form.patchValue({
      fechaInicio: null,
      fechaTermino: null
    })
    const anio = new Date(this.form.get('anioDt').value).getFullYear();
    this.minDate = new Date(anio, 0, 1);
    this.untilDate = new Date(anio, 11, 31);
    this.minDateFin = new Date(anio, 0, 1);
    this.untilDateFin = new Date(anio, 11, 31);
  }

  handleModificar(row) {
    this.router.navigate(['ayni/personal/acciones/vinculacion/accion/modificar/' + row.id_gestion_vinculacion]) 
  }

  handleCompletar(row) {
    this.router.navigate(['ayni/personal/acciones/vinculacion/accion/modificar/' + row.id_gestion_vinculacion]) 
  }

  handleInformacion(row) {
    this.router.navigate(['ayni/personal/acciones/vinculacion/accion/informacion/' + row.id_gestion_vinculacion]) 
  }

  handleObservar(obj) {
    let dialogRef = this.materialDialog.open(ObservarVinculacionComponent, {
      panelClass: 'Minedu-observar-accion-desplazamiento-dialog',
        disableClose: true,        
        data: {
          id_gestion_vinculacion: obj.id_gestion_vinculacion,
          observaciones: obj.observaciones,
          is_saved: true,
          info: null,
          soloVer: true,
          dialogTitle: 'Observación de la Adjudicación'
        }
    });
    dialogRef.afterClosed()
    .subscribe((response: any) => {
      debugger
      if (!response) {
        return;
      }
      console.log(response);
    });
  }

  handleEliminar(obj) {
    this.dataService.Message().msgConfirm('¿ESTÁ SEGURO QUE DESEA ELIMINAR LA VINCULACIÓN.?', () => {
      this.dataService.Spinner().show("sp6");
      let viewModel = {
        id_gestion_vinculacion: obj.id_gestion_vinculacion
      }
      this.dataService.AccionesVinculacion().eliminarGestionVinculacion(viewModel).subscribe(
        (response) => {
          this.dataService.Spinner().hide("sp6");
          this.dataService.Message().msgAutoCloseSuccessNoButton('"OPERACIÓN REALIZADA DE FORMA EXITOSA"', 3000, () => {
            this.handleBuscar();
          });

        },
        (error: HttpErrorResponse) => {
          this.dataService.Spinner().hide("sp6")
          this.dataService.Message().msgWarning("Ocurrió un error al realizar esta operación");
        }
      )
    }, () => { });
  }

  //Send 'acciones grabadas' row x row
  handleEnviarAccionesGrabas(row) {
    this.dataService.Message().msgConfirm('¿ESTÁ SEGURO DE QUE DESEA ENVIAR LA INFORMACIÓN A ACCIONES GRABADAS?', () => {

      var listaAcciones = new AccionesPersonalVinculacion();
      listaAcciones = {
        id_gestion_vinculacion: row.id_gestion_vinculacion,
      }

      var accionesGrabadas =  {
        usuarioCreacion: "SYSTEM",
        numeroDocumentoIdentidad : "40405050",
        codigoTipoDocumentoIdentidad: 1,
        codigoTipoSede: "1",
        codigoSede: "1",
        accionesGestionVinculacion: []
      };

      accionesGrabadas.accionesGestionVinculacion.push(listaAcciones);

      this.dataService.AccionesVinculacion()
        .enviarAccionesGrabadas(accionesGrabadas)
        .pipe(
            catchError(() => of([])),
            finalize(() => { })
        )
        .subscribe((response: any) => {
            console.log('Acciones Grabadas', response);
            if (response) {
                // this.AccionesPersonal = response;
                this.dataService.Message().msgAutoCloseSuccessNoButton("OPERACIÓN REALIZADA DE FORMA EXITOSA", 3000, () => {
                  this.handleBuscar();
                });     
            }
        });
    });
  }


  handleEnviarAccionesGrabadasMasivo() {
    if (this.validarEstadoParaEnviarAccionesGrabadas(this.selection.selected)) {
      return;
    }

    if (this.selection.selected.length > 0) {
      let vinculacionesSeleccionadas: any[] = [];
      for (let i = 0; i < this.selection.selected.length; i++) {
        const itemVinculacion = {
          id_gestion_vinculacion: this.selection.selected[i].id_gestion_vinculacion
        }
        vinculacionesSeleccionadas.push(itemVinculacion);
      }
      
      this.validarEnvioAccionesGrabadas(vinculacionesSeleccionadas);

    } else {
      
        this.dataService.Message().msgWarning(MESSAGE_GESTION.M91);

        
    }
  }

  validarEstadoParaEnviarAccionesGrabadas(filas) {
    let repetidos = 0;


    for (let i = 0; i < filas.length; i++) {
      if (filas[i].codigo_estado_vinculacion == this.estadoRegistrado ||  filas[i].codigo_estado_vinculacion == this.estadoAutorizado) {
          console.log("REGISTRO VALIDADO");
      } else {
        repetidos++;
      }
    }
    if (repetidos > 0) {
      this.dataService.Message().msgWarning('"DEBE SELECCIONAR SOLO VINCULACIONES CON ESTADO REGISTRADO O AUTORIZADO"', () => {
        this.selection = new SelectionModel<any>(true, []);
      });
    }
    return repetidos > 0;
  }

  validarEnvioAccionesGrabadas(listaVinculacionesSeleccionadas) {
    this.dataService.Message().msgConfirm('¿ESTÁ SEGURO DE QUE DESEA ENVIAR LA INFORMACIÓN SELECCIONADA A ACCIONES GRABADAS?', () => {

      var accionesGrabadas =  {
        usuarioCreacion: this.Nombre_Usuario,
        codigoTipoSede: this.passport.codigoRol,
        codigoSede: this.passport.codigoSede,
        accionesGestionVinculacion: listaVinculacionesSeleccionadas
      };

      this.dataService.AccionesVinculacion()
        .enviarAccionesGrabadas(accionesGrabadas)
        .pipe(
            catchError(() => of([])),
            finalize(() => { })
        )
        .subscribe((response: any) => {
            console.log('Acciones Grabadas', response);
            if (response) {
                // this.AccionesPersonal = response;
                this.dataService.Message().msgAutoCloseSuccessNoButton("OPERACIÓN REALIZADA DE FORMA EXITOSA", 3000, () => {
                  this.handleBuscar();
                });     
            } else {
              this.dataService.Message().msgWarning('"ERROR, NO SE PUDO CREAR LA ACCION GRABADA."', () => { });
              this.dataService.Spinner().hide("sp6");
            }  
        });
    });
  }

  handleEnviarProyectoResolucion(row) {
debugger
    let regimenLaboral = this.comboLists.listRegimenlaboral.filter(m => m.idRegimenLaboral == row.id_regimen_laboral)[0];
    let grupoAccion = {
      id_grupo_accion: 12,
      codigo_grupo_accion: 12,
      descripcion_grupo_accion: 'VINCULACIÓN'
    };
    let descripcion_accion = row.descripcion_accion;//this.comboLists.listAccion.filter(m => m.id_accion == row.id_accion)[0];
    let descripcion_motivo_accion = row.descripcion_motivo_accion;//this.comboLists.listMotivoAccionTotal.filter(m => m.id_motivo_accion == row.id_motivo_accion)[0];
    
    let mandatoJudicial = row.mandato_judicial_desc;

    this.dialogRef = this.materialDialog.open(GenerarProyectoComponent, {
      panelClass: 'minedu-ver-informacion-adjudicacion-dialog',
      disableClose: true,
      data: {
        title: "Generar proyecto de resoluci&oacute;n",
        datosAccion: {
          regimen_laboral: regimenLaboral,
          grupo_accion: grupoAccion,
          descripcion_accion: descripcion_accion,
          descripcion_motivo_accion: descripcion_motivo_accion,
          //accion: accion,
          //motivo_accion: motivoAccion,
          mandato_judicial: mandatoJudicial,
          idDre: this.idDre,
          idUgel: this.idUgel
        },
        formDataVinculacion: null,
        idGestionVinculacion: row.id_gestion_vinculacion,
        enProceso: row.es_proceso
      },
      
    });
    this.dialogRef.afterClosed()
    .subscribe((response: any) => {
      debugger
      if (!response) {
        this.handleBuscar();
      }
      if (response.reload) {
        this.handleBuscar();
      }
    });
  }

  handleVerPdfProyectoResolucion(row) {
    this.dataService.Spinner().show('sp6');
    this.dataService.Documento().descargar(row.documento_proyecto_resolucion)
        .pipe(
            catchError((e) => {
                return of(e);
            }),
            finalize(() => this.dataService.Spinner().hide('sp6'))
        ).subscribe(response => {
            if (response) {
                this.handlePreviewS1(response, row.documento_proyecto_resolucion);
            } else {
                this.dataService.Message().msgWarning('NO SE PUDO OBTENER EL DOCUMENTO DE SUSTENTO.', () => {
                });
            }
        });
  }

  handlePreviewS1(file: any, codigoAdjuntoSustento: string) {
    this.dialogRef = this.materialDialog.open(DocumentViewerComponent, {
        panelClass: 'modal-viewer-form-dialog',
        disableClose: true,
        data: {
            modal: {
                icon: 'remove_red_eye',
                title: 'Proyecto resolución',
                file: file,
                fileName: codigoAdjuntoSustento
            }
        }
    });

    this.dialogRef.afterClosed()
        .subscribe((response: any) => {
            if (!response) {
                return;
            }
        });
  };

}


export class GestionVinculacionDataSource extends DataSource<any>{

  private _dataChange = new BehaviorSubject<any>([]);
  private _loadingChange = new BehaviorSubject<boolean>(false);
  private _totalRows = 0;

  public loading = this._loadingChange.asObservable();

  constructor(private dataService: DataService) {
    super();
  }

  load(data: any, pageIndex: number, pageSize: number) {
    debugger
    console.log('data pagination', data);
    data.anio= new Date(data.anioDt).getFullYear();
    data.paginaActual = pageIndex;
    data.tamanioPagina = pageSize;

    this._loadingChange.next(true);
    this.dataService.AccionesVinculacion().getGestionVinculacionPaginado(data).pipe(
      catchError(() => of([])),
      finalize(() => this._loadingChange.next(false))
    ).subscribe((response: any) => {
      if (response) {
        console.log('response is true'); 
        this._totalRows = (response[0] || [{ total: 0 }]).total;
        this._dataChange.next(response || []);

        if(data.conteoBusqueda == 0) {
          data.conteoBusqueda = 1 ;
        } else {
          if ((response || []).length === 0) {
            this.dataService.Message().msgWarning(MESSAGE_GESTION.M09);
        }
        }

      } else {
        console.log('response is false');
        this._totalRows = 0;
        this._dataChange.next([]);
      }
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