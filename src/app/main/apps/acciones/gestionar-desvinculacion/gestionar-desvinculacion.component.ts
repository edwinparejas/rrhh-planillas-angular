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
import * as moment from 'moment';
import { AccionesPersonalVinculacion, TablaEstadoDesvinculacion, CentroTrabajoModel, TablaEquivalenciaSede } from './models/desvinculacion.model';
import { ModalMonitorVinculacionComponent } from '../gestionar-vinculacion/vinculacion/components/modal-monitor-instancias/modal-monitor-vinculacion.component';
import { BuscarPersonaComponent } from './components/buscar-persona/buscar-persona.component';
import { BuscarPlazaComponent } from './components/buscar-plaza/buscar-plaza.component';

import { GenerarProyectoComponent } from './components/generar-proyecto/generar-proyecto.component';
import { CodigoDreUgelService } from '../pronoei/services/codigo-dre-ugel.service';
import { BuscarCentroTrabajoComponent } from '../pronoei/components/popups/buscar-centro-trabajo/buscar-centro-trabajo.component';

@Component({ 
    selector: 'minedu-gestionar-desvinculacion',
    templateUrl: './gestionar-desvinculacion.component.html',
    styleUrls: ['./gestionar-desvinculacion.component.scss'],
    encapsulation: ViewEncapsulation.None,
    animations: mineduAnimations,
  })

  export class GestionarDesvinculacionComponent implements OnInit, OnDestroy, AfterViewInit {
    // AccionesPersonal: AccionPersonalModels = new AccionPersonalModels();
  
    isSelectPricipal = false;

    private _unsubscribeAll: Subject<any>;
  
    estadoRegistrado = TablaEstadoDesvinculacion.REGISTRADO;
    estadoAutorizado = TablaEstadoDesvinculacion.AUTORIZADO;
  
    centroTrabajo: CentroTrabajoModel = null;
  
    idEtapaProceso: number;
  
    Nombre_Usuario = "";
    idDre = 0
    idUgel = 0
    codigoTipoSede = "";
    codigoSede = "";
    codigoRol = "";
  
    form: FormGroup;
    formExportar: any = {};
    loading: false;
    
    export = false;
  
    entidad = false;
    
    now = new Date();
    untilDate = new Date();
    minDate = new Date((new Date).getFullYear(), 0, 1);
    maxDate = new Date(new Date().getFullYear() + 1, 11, 31);
  
    dialogRef: any;

    passportModular={
      idNivelInstancia: null,        
      idEntidadSede: null, 
      idRolPassport: null
    }
  
    comboLists = {
      listAnio: [],
      listRegimenlaboral: [],
      listAccion: [],
      listMotivoAccion: [],
      listMandatoJudicial: [],
      listTipoDocumento: [],
      listEstado: [],
      listEscala: []
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
      autorizadoConsultar: false
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
      'estado',
      'acciones'
    ];
  
    centroTrabajoFiltroSeleccionado: any;
  
    dataSource: GestionDesvinculacionDataSource | null;
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
      //this.entidadPassport();
      this.getDreUgelData(); 
      

      this.buildSeguridad();
      this.loadCombos();
  
      this.dataSource = new GestionDesvinculacionDataSource(this.dataService);
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
  
      
      //this.obtenerCodigoDreUgelLogeado();     
      
    }

    private async getDreUgelData() {

      this.codigoTipoSede = this.codigoDreUgelService.passportModel.CODIGO_TIPO_SEDE;
      this.codigoSede = this.codigoDreUgelService.passportModel.CODIGO_SEDE;
      this.codigoRol = this.codigoDreUgelService.passportModel.CODIGO_ROL;

      console.log('this.codigoSede => ',this.codigoSede);

      const rolSelected = this.dataService.Storage().getPassportRolSelected();
      const sedeSeleccionado = rolSelected.CODIGO_SEDE;

      console.log('sedeSeleccionado => ',sedeSeleccionado);
  
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

      }

      console.log('codigos => ', codigos);

    }
  
    entidadPassport(){
      this.dataService.AccionesDesvinculacion().entidadPassport(this.passport.codigoSede).pipe(
        catchError((error: HttpErrorResponse) => {
          this.dataService.Message().msgWarning(error.error.messages[0]); return of(null);
        }),
      ).subscribe((response: any) => {
        if (response.length > 0){
          if (response.length > 1)
            response = response.filter(x => x.idNivelInstancia <= 3);
  
          if (response.length == 1 && response[0].idNivelInstancia == 3)
          this.passport.codigoTipoSede = TablaEquivalenciaSede.CODIGO_TIPO_SEDE_UGEL;
  
          this.centroTrabajo = response[0];
          this.idDre = this.centroTrabajo?.idDre;
          this.idUgel = this.centroTrabajo?.idUgel;
          this.codigoTipoSede = this.passport.codigoTipoSede;
  
          this.handleBuscar();
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
                  this.handleBuscar();
  
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
      console.log("codigoSede Alterado: ",this.currentSession.codigoSede);
  
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
      this.passport = this.dataService.Storage().getInformacionUsuario();    
      const usuario = this.dataService.Storage().getPassportUserData();
      this.Nombre_Usuario = usuario.NOMBRES_USUARIO;
      const rolSelected = this.dataService.Storage().getPassportRolSelected();
      console.log("this.passport", this.passport);
      console.log("usuario =>", usuario);
      console.log("rolSelected =>", rolSelected);
    }
  
    buildSeguridad = () => {
      debugger
      this.permisos.autorizadoAgregar = this.dataService.Storage().tienePermisoAccion(TablaPermisos.Agregar);
      this.permisos.autorizadoModificar = this.dataService.Storage().tienePermisoAccion(TablaPermisos.Modificar);
      this.permisos.autorizadoEliminar = this.dataService.Storage().tienePermisoAccion(TablaPermisos.Eliminar);
      this.permisos.autorizadoEnviar = this.dataService.Storage().tienePermisoAccion(TablaPermisos.Eliminar);
      this.permisos.autorizadoConsultar = this.dataService.Storage().tienePermisoAccion(TablaPermisos.Consultar);
      this.permisos.autorizadoExportar = this.dataService.Storage().tienePermisoAccion(TablaPermisos.Eliminar);
      this.currentSession = this.dataService.Storage().getInformacionUsuario();
      if (!this.permisos.autorizadoAgregar && !this.permisos.autorizadoModificar &&
          !this.permisos.autorizadoEliminar && !this.permisos.autorizadoEnviar &&
          !this.permisos.autorizadoConsultar && !this.permisos.autorizadoExportar) {
          this.hasAccessPage = false;
      } else {
          this.hasAccessPage = true;
      }
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
        idEscalaMagisterial: [-1],
      });
     
  
      this.form.get("anioDt").valueChanges.subscribe(value => {
        debugger
        if (value) {
          this.onChangeMinMaxDate(); 
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
      debugger;
  
      if(this.isSelectPricipal){
        this.selection.clear() ;
        this.isSelectPricipal = false;
      } else {
        this.isAllSelected()             
        ? this.selection.clear()          
        : this.dataSource.data.forEach(
          (row) => { 
            if(row.codigo_estado_vinculacion===1) 
            this.selection.select(row)
  
            this.isSelectPricipal = true;
          });    
      }
  
        
          
          //(row) => this.selection.select(row)
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
        idEscalaMagisterial: -1,
      })
  
  
      this.handleBuscar();
    }
  
    obtenerCodigoDreUgelLogeado(): void {
      const rolSelected = this.dataService.Storage().getPassportRolSelected();
      const sedeSeleccionado = rolSelected.CODIGO_SEDE;
      const request = {
        codigoEntidadSede: sedeSeleccionado
      };
      this.dataService.AccionesDesvinculacion().getCodigoDreUgel(request).subscribe(
        (response) => {
          console.log('obtenerCodigoDreUgelLogeado() =>', response);
          this.dataUserLoginModel = response;
          if (this.dataUserLoginModel == null) {
            this.dataService
              .Message()
              .msgWarning(
                '"NO SE ENCONTRÓ INFORMACIÓN PARA LOS CRITERIOS DE BÚSQUEDA INGRESADOS."',
                () => { }
              );
          } else {
            this.handleBuscar();
          }
        }, 
        (error: HttpErrorResponse) => {
        }
      )
    }
  
    handleNuevo(): void {
      debugger
      this.router.navigate(['ayni/personal/acciones/desvinculacion/agregar'])
    }
  
    handleExportar(): void {
  
      this.dataService.Spinner().show("sp6");    
        
        this.dataService.AccionesDesvinculacion().getGestionDesvinculacionExcel(this.formExportar).subscribe(
          (response) => {
            this.dataService.Spinner().hide("sp6");
            const fecha = moment().format('DDMMYYYY');
            descargarExcel(response, `Desvinculacion ${fecha}.xlsx`);
          },
          (error: HttpErrorResponse) => {
            this.dataService.Spinner().hide("sp6")
            this.dataService.Message().msgWarning("OCURRIÓ AL REALIZAR AL EXPORTAR LA DESVINCULACIÓN.");
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
        idEscalaMagisterial  : this.form.value.idEscalaMagisterial,
      }
  
    }
  
    loadGrid(){
      this.dataSource.load(this.form.value, (this.paginator.pageIndex + 1), this.paginator.pageSize);
    }
  
    loadCombos = () => {
      this.loadAnio();
      this.loadRegimenesLaborales();
      this.loadAcciones();
      this.loadMotivosAcciones();
      this.loadMandatoJudicial();
      this.loadTipoDocumento();
      this.loadEstado();
      //this.loadComboAcciones2(this);
      this.loadEscalaMagisteri();
    } 
  
    loadComboAcciones(id_regimen_laboral) {
    
      if (id_regimen_laboral == undefined) {
        return;
      }

      const params = {
        id_regimen_laboral: parseInt(this.form.get('idRegimenLaboral').value),
        codigoRol: this.currentSession.codigoRol
      }     

      this.dataService.AccionesDesvinculacion().getComboAccionPorRegimenLaboral(params).subscribe(
        (response) => {
          this.comboLists.listAccion = response;
          this.comboLists.listMotivoAccion = [];                  
        },
        (error: HttpErrorResponse) => {
          console.log(error);
        }
      )
    }

    loadComboMotivoAccion (id_accion) {
        
      this.comboLists.listMotivoAccion = [];       
      
      if (id_accion == undefined) {
        return;
      }
      const params = {
        id_accion: id_accion,
        id_regimen_laboral: parseInt(this.form.get('idRegimenLaboral').value),
        codigoRol: this.currentSession.codigoRol
      }
      this.dataService.AccionesDesvinculacion().getComboMotivoAccionPorAccion(params).subscribe(
        (response) => {
          this.comboLists.listMotivoAccion = response;            
        },
        (error: HttpErrorResponse) => {
          console.log(error);
        }
      )
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
  
    loadAnio = () => {
      this.dataService.AccionesDesvinculacion().getComboAnio().subscribe(
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
      this.dataService.AccionesDesvinculacion().getComboRegimenLaboral(request).subscribe(
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

    loadEscalaMagisteri = () => {
      
      this.dataService.AccionesDesvinculacion().getComboEscala().subscribe(
        (response) => {
          this.comboLists.listEscala = response;
          this.comboLists.listEscala.unshift({
            idEscalaMagisterial: -1,
            descripcionEscala: '--TODOS--'
          })
        },
        (error: HttpErrorResponse) => {
          console.log(error);
        }
      )
    }
  
    loadAcciones = () => {
      this.dataService.AccionesDesvinculacion().getComboAccion().subscribe(
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
  
    loadMotivosAcciones = () => {
      const params = {
        id_accion: 0
      }
      this.dataService.AccionesDesvinculacion().getComboMotivoAccion(params).subscribe(
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
        Inactivo: false
      }
      this.dataService.AccionesDesvinculacion().getCatalogoItem(request).subscribe(
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
        codigoCatalogo: 177
      }
      this.dataService.AccionesDesvinculacion().getCatalogoItem(request).subscribe(
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
          this.handleBuscar();
        });
    }
  
    
  
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

          // Buscar 
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

            this.handleBuscar();

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
      const anio = new Date(this.form.get('anioDt').value).getFullYear();
      this.minDate = new Date(anio, 0, 1);
      this.untilDate = new Date(anio, 11, 31);
    }
  
    handleModificar(row) {
      this.router.navigate(['ayni/personal/acciones/desvinculacion/accion/modificar/' + row.id_gestion_vinculacion]) 
    }
  
    handleInformacion(row) {
      this.router.navigate(['ayni/personal/acciones/desvinculacion/accion/informacion/' + row.id_gestion_vinculacion]) 
    }
      
  
    handleEliminar(obj) {
      this.dataService.Message().msgConfirm('¿ESTÁ SEGURO DE QUE DESEA ELIMINAR LA DESVINCULACIÓN.?', () => {
        this.dataService.Spinner().show("sp6");
        let viewModel = {
          id_gestion_desvinculacion: obj.id_gestion_vinculacion
        }
        this.dataService.AccionesDesvinculacion().eliminarGestionDesvinculacion(viewModel).subscribe(
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
  
        this.dataService.AccionesDesvinculacion()
          .enviarAccionesGrabadas(accionesGrabadas)
          .pipe(
              catchError(() => of([])),
              finalize(() => { })
          )
          .subscribe((response: any) => {
              console.log('Acciones Grabadas', response);
              if (response) {
                  // this.AccionesPersonal = response;
                  this.dataService.Message().msgSuccess('"SE ENVIÓ CORRECTAMENTE A ACCIONES GRABADAS."', () => { 
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
        this.dataService
          .Message()
          .msgWarning(
            "'DEBE SELECCIONAR POR LO MENOS UN REGISTRO DE ACCIONES GRABADAS'",
            () => { }
          );
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
        this.dataService.Message().msgWarning("DEBE SELECCIONAR SOLO DESVINCULACIONES CON ESTADO REGISTRADO O AUTORIZADO", () => {
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
  
        this.dataService.AccionesDesvinculacion()
          .enviarAccionesGrabadas(accionesGrabadas)
          .pipe(
              catchError(() => of([])),
              finalize(() => { })
          )
          .subscribe((response: any) => {
              console.log('Acciones Grabadas', response);
              if (response) {
                  // this.AccionesPersonal = response;
                  this.dataService.Message().msgSuccess('"SE ENVIÓ CORRECTAMENTE A ACCIONES GRABADAS."', () => { 
                    this.handleBuscar();
                  });
              }
          });
      });
    }

    handleEnviarProyectoResolucion(row) {
      debugger
          let regimenLaboral = this.comboLists.listRegimenlaboral.filter(m => m.idRegimenLaboral == row.id_regimen_laboral)[0];
          let grupoAccion = {
            id_grupo_accion: 6,
            codigo_grupo_accion: 6,
            descripcion_grupo_accion: 'DESVINCULACIÓN'
          };
          let accion = this.comboLists.listAccion.filter(m => m.id_accion == row.id_accion)[0];
          let motivoAccion = this.comboLists.listMotivoAccion.filter(m => m.id_motivo_accion == row.id_motivo_accion)[0];
          let mandatoJudicial = row.mandato_judicial_desc;
      
          this.dialogRef = this.materialDialog.open(GenerarProyectoComponent, {
            panelClass: 'minedu-ver-informacion-adjudicacion-dialog',
            disableClose: true,
            data: {
              title: "Generar proyecto de resoluci&oacute;n",
              datosAccion: {
                regimen_laboral: regimenLaboral,
                grupo_accion: grupoAccion,
                accion: accion,
                motivo_accion: motivoAccion,
                mandato_judicial: mandatoJudicial,
                idDre: this.idDre,
                idUgel: this.idUgel
              },
              formDataVinculacion: null,
              idGestionDesvinculacion: row.id_gestion_vinculacion,
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

    handleVerPdfCartaCese(row) {
      this.dataService.Spinner().show('sp6');
      this.dataService.Documento().descargar(row.documento_carta_cese)
          .pipe(
              catchError((e) => {
                  return of(e);
              }),
              finalize(() => this.dataService.Spinner().hide('sp6'))
          ).subscribe(response => {
              if (response) {
                  this.handlePreviewS1(response, row.documento_carta_cese);
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
                  
              }
          });
    };


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
                  idAccion: this.form.get('idAccion').value,
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

              this.handleBuscar();
          }
      });
  };


  buscarPlazaPersona(event) {
    event.preventDefault();
    const codigoPlaza = this.form.get("codigoPlaza").value;
    if (codigoPlaza) {
      this.buscarPlaza(event);
      return;
    }

    //this.busquedaServidorPublicoPersonalizada();
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
            idDre : this.idDre,
            idUgel : this.idUgel
        },
    });

    this.dialogRef.afterClosed().subscribe((result) => {
        if (result != null) {
            this.form.get("codigoPlaza").setValue(result.plaza.codigoPlaza.trim());

        }
    });
  };

  

  
  }


  
  
  export class GestionDesvinculacionDataSource extends DataSource<any>{
  
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
      this.dataService.AccionesDesvinculacion().getGestionDesvinculacionPaginado(data).pipe(
        catchError(() => of([])),
        finalize(() => this._loadingChange.next(false))
      ).subscribe((response: any) => {
        if (response) {
          console.log('response is true'); 
          this._totalRows = (response[0] || [{ total: 0 }]).total;
          this._dataChange.next(response || []);
  
          if ((response || []).length === 0) {
            this.dataService
                .Message()
                .msgWarning(
                  '"NO SE ENCONTRÓ INFORMACIÓN PARA LOS CRITERIOS DE BÚSQUEDA INGRESADOS."',
                    () => { }
                );
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


  