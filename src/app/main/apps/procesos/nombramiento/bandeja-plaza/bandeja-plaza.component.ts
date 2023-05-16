import { CollectionViewer, DataSource, SelectionModel } from '@angular/cdk/collections';
import { Component, OnInit, ViewEncapsulation, OnDestroy, ViewChild, AfterViewInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { saveAs } from 'file-saver';
import { DataService } from 'app/core/data/data.service';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { catchError, finalize } from 'rxjs/operators';
import { mineduAnimations } from '../../../../../../@minedu/animations/animations';
import { ActivatedRoute, Router } from '@angular/router';
import { ResultadoOperacionEnum, TablaEquivalenciaNombramiento, TablaPermisos } from '../../../../../core/model/types';
import { SecurityModel } from '../../../../../core/model/security/security.model';
import { MatTableDataSource } from '@angular/material/table';
import { ModalInformacionPlazasComponent } from '../components/modal-informacion-plazas/modal-informacion-plazas.component';
import { ModalAgregarMotivoRechazoPlazasComponent } from '../components/modal-agregar-motivo-rechazo-plazas/modal-agregar-motivo-rechazo-plazas.component';
import { PASSPORT_MESSAGE } from 'app/core/model/messages-error';
import { SharedService } from 'app/core/shared/shared.service';
import { ModalConsultarMotivoRechazoPlazasComponent } from '../components/modal-consultar-motivo-rechazo-plazas/modal-consultar-motivo-rechazo-plazas.component';
import { PlazaNombramientoResponseModel } from '../models/plaza-nombramiento.model';
import { debug } from 'console';
import { CatalogoEstadoConsolidadoPlazaEnum, CatalogoEstadoDesarrolloEnum, CatalogoEstadoValidacionPlazaEnum, CatalogoSituacionValidacionEnum } from '../_utils/constants';
import { EtapaProcesoResponseModel } from '../models/etapa-proceso.model';
import { DatePipe } from '@angular/common';
import { descargarExcel } from 'app/core/utility/functions';
import { ModalIncorporarPlazaComponent } from '../components/modal-incorporar-plaza/modal-incorporar-plaza.component';

@Component({
  selector: 'minedu-bandeja-plaza',
  templateUrl: './bandeja-plaza.component.html',
  styleUrls: ['./bandeja-plaza.component.scss'],
  encapsulation: ViewEncapsulation.None,
  animations: mineduAnimations,
})
export class BandejaPlazaComponent implements OnInit {

  form: FormGroup;
  loading: false;
  export = false;
  now = new Date();
  isDisabled = false;

  esSedeDreUgel= false;
  codigoDre: string = null;
  codigoUgel: string = null;
  codigoRol: string = null;
  numeroDocumento: string;
  
  displayedColumns: string[] = [
    'select',
    'descripcionNivelEducativo',
    'descripcionGrupoInscripcion',        
    'codigoModular',
    'institucionEducativa',
    'descripcionTipoGestionInstitucionEducativa',
    'codigoPlaza',
    'descripcionCargo',
    'descripcionAreaCurricular', 
    'descripcionEspecialidad',
    'vigenciaInicio',
    'acciones'
  ];
  
  displayedColumnsResultadoFinal: string[] = [
    'descripcionNivelEducativo',
    'descripcionGrupoInscripcion',        
    'codigoModular',
    'institucionEducativa',
    'descripcionTipoGestionInstitucionEducativa',
    'codigoPlaza',
    'descripcionCargo',
    'descripcionAreaCurricular', 
    'descripcionEspecialidad',
    'vigenciaInicio',
    'acciones'
  ];
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

  /*variables responsive*/
  selection = new SelectionModel<any>(true, []);
  // PrePublicada
  dataSourcePrePublicada: PlazaDataSource | null;
  @ViewChild('paginatorPrePublicada', { static: true }) paginatorPrePublicada: MatPaginator;
  selectionPrePublicada = new SelectionModel<any>(true, []);
  // verRegistrosSeleccionados = true;

  // AConvocar
  dataSourceAConvocar: PlazaDataSource | null;
  @ViewChild('paginatorAConvocar', { static: true }) paginatorAConvocar: MatPaginator;
  selectionAConvocar = new SelectionModel<any>(true, []);

  // Observada
  dataSourceObservada: PlazaDataSource | null;
  @ViewChild('paginatorObservada', { static: true }) paginatorObservada: MatPaginator;
  selectionObservada = new SelectionModel<any>(true, []);

  // ConResumenFinal
  dataSourceConResumenFinal: PlazaDataSource | null;
  @ViewChild('paginatorConResumenFinal', { static: true }) paginatorConResumenFinal: MatPaginator;

  paginatorPageSize = 10;
  paginatorPageIndex = 0;
  eliminando = false;
  dialogRef: any;
  tiempoMensaje:number=1000;
  currentSession: SecurityModel = new SecurityModel();
  permisos = {
      autorizadoAgregar: false,
      autorizadoModificar: false,
      autorizadoEliminar: false,
      autorizadoEnviar: false,
      autorizadoExportar: false,
      autorizadoConsultar:false
  };
  hasAccessPage: boolean;
  // datos = {
  //     idRequerimiento: null
  //   };
  working=false;
  request = { 
      idEtapaProceso:null,
      esSedeDreUgel: null,
      codigoDre:null,
      codigoUgel:null,
      codigoRol:null,
      codigoModular:null,
      codigoPlaza:null,
  };

  idEtapaProceso: number;
  idPlazaNombramiento: number;

  codigoEtapa: string;
  codigoProceso:string; 
  etapaProceso: EtapaProcesoResponseModel = new EtapaProcesoResponseModel();
  plazaNombramiento: PlazaNombramientoResponseModel = new PlazaNombramientoResponseModel();

  estadoPendiente:boolean = false;
  estadoValidado:boolean = false;
  estadoAprobado:boolean = false;
  estadoPublicado:boolean = false;

  incorporarPlazas:boolean = false;
  plazasConvocar:boolean = false;
  plazasObservadas:boolean = false;
  finalizarValidacionPlazas:boolean = false;
  migrarPlazasDesiertas:boolean = false;
  publicarPlazas:boolean = false;
  aperturarPublicacionPlazas:boolean = false;


  
  constructor(
    private router: Router,      
    private route: ActivatedRoute,
    private formBuilder: FormBuilder,
    private dataService: DataService,
    private materialDialog: MatDialog,
    private sharedService: SharedService
  ) { }

  ngOnInit(): void {
    setTimeout(_ => this.buildShared());
    this.buildSeguridad();   
    this.handleResponsive();
    this.buildForm();
    this.passport();
    console.log("params",this.route.snapshot.params);
    this.idEtapaProceso = parseInt(this.route.snapshot.params.idEtapaProceso);
    
    this.dataSourcePrePublicada = new PlazaDataSource(this.dataService);
    this.dataSourcePrePublicada.codigoSituacionValidacion = CatalogoSituacionValidacionEnum.PRE_PUBLICADA;
    this.paginatorPrePublicada.showFirstLastButtons = true;
    this.paginatorPrePublicada._intl.itemsPerPageLabel = 'Registros por página';
    this.paginatorPrePublicada._intl.nextPageLabel = 'Siguiente página';
    this.paginatorPrePublicada._intl.previousPageLabel = 'Página anterior';
    this.paginatorPrePublicada._intl.firstPageLabel = 'Primera página';
    this.paginatorPrePublicada._intl.lastPageLabel = 'Última página';


    this.dataSourceAConvocar = new PlazaDataSource(this.dataService);
    this.dataSourceAConvocar.codigoSituacionValidacion = CatalogoSituacionValidacionEnum.A_CONVOCAR;
    this.paginatorAConvocar.showFirstLastButtons = true;
    this.paginatorAConvocar._intl.itemsPerPageLabel = 'Registros por página';
    this.paginatorAConvocar._intl.nextPageLabel = 'Siguiente página';
    this.paginatorAConvocar._intl.previousPageLabel = 'Página anterior';
    this.paginatorAConvocar._intl.firstPageLabel = 'Primera página';
    this.paginatorAConvocar._intl.lastPageLabel = 'Última página';


    this.dataSourceObservada = new PlazaDataSource(this.dataService);
    this.dataSourceObservada.codigoSituacionValidacion = CatalogoSituacionValidacionEnum.OBSERVADA;
    this.paginatorObservada.showFirstLastButtons = true;
    this.paginatorObservada._intl.itemsPerPageLabel = 'Registros por página';
    this.paginatorObservada._intl.nextPageLabel = 'Siguiente página';
    this.paginatorObservada._intl.previousPageLabel = 'Página anterior';
    this.paginatorObservada._intl.firstPageLabel = 'Primera página';
    this.paginatorObservada._intl.lastPageLabel = 'Última página';


    this.dataSourceConResumenFinal = new PlazaDataSource(this.dataService);
    this.dataSourceConResumenFinal.codigoSituacionValidacion = -1;
    this.paginatorConResumenFinal.showFirstLastButtons = true;
    this.paginatorConResumenFinal._intl.itemsPerPageLabel = 'Registros por página';
    this.paginatorConResumenFinal._intl.nextPageLabel = 'Siguiente página';
    this.paginatorConResumenFinal._intl.previousPageLabel = 'Página anterior';
    this.paginatorConResumenFinal._intl.firstPageLabel = 'Primera página';
    this.paginatorConResumenFinal._intl.lastPageLabel = 'Última página';

    this.resetForm();
  
    if(this.hasAccessPage){
        this.obtenerEtapaProceso();
        this.obtenerPlazaNombremiento();
        this.buscarPlazasPrePublicada(true);
        this.buscarPlazasAConvocar(true);
        this.buscarPlazasObservada(true);
        this.buscarPlazasConResumenFinal(true);
    }
    else this.dataService.Message().msgError('El rol asignado no tiene acceso a esta página.', () => { });    
  }
        
  ngAfterViewInit(): void {
    this.paginatorPrePublicada.page.subscribe(() => this.loadDataPrePublicada((this.paginatorPrePublicada.pageIndex + 1).toString(), this.paginatorPrePublicada.pageSize.toString()));
    this.paginatorAConvocar.page.subscribe(() => this.loadDataAConvocar((this.paginatorAConvocar.pageIndex + 1).toString(), this.paginatorAConvocar.pageSize.toString()));
    this.paginatorObservada.page.subscribe(() => this.loadDataObservada((this.paginatorObservada.pageIndex + 1).toString(), this.paginatorObservada.pageSize.toString()));
    //this.paginatorConResumenFinal.page.subscribe(() => this.loadDataConResumenFinal((this.paginatorConResumenFinal.pageIndex + 1).toString(), this.paginatorConResumenFinal.pageSize.toString()));
  }

  ngOnDestroy(): void { }

  buildSeguridad = () => {
    this.permisos.autorizadoAgregar = this.dataService.Storage().tienePermisoAccion(TablaPermisos.Agregar);
    this.permisos.autorizadoModificar = this.dataService.Storage().tienePermisoAccion(TablaPermisos.Modificar);
    this.permisos.autorizadoEliminar = this.dataService.Storage().tienePermisoAccion(TablaPermisos.Eliminar);
    this.permisos.autorizadoEnviar = this.dataService.Storage().tienePermisoAccion(TablaPermisos.Eliminar);
    this.permisos.autorizadoConsultar = this.dataService.Storage().tienePermisoAccion(TablaPermisos.Consultar);
    this.permisos.autorizadoExportar = this.dataService.Storage().tienePermisoAccion(TablaPermisos.Eliminar);
    this.currentSession = this.dataService.Storage().getInformacionUsuario();

    if(!this.permisos.autorizadoAgregar && !this.permisos.autorizadoModificar && !this.permisos.autorizadoEliminar && !this.permisos.autorizadoEnviar && !this.permisos.autorizadoConsultar && !this.permisos.autorizadoExportar)
    {
      this.hasAccessPage=false;
    }
    else{
      this.hasAccessPage=true;
    }
  }

  passport() {        
    const rol = this.dataService.Storage().getPassportRolSelected();
    let esUgel =  rol.CODIGO_TIPO_SEDE === TablaEquivalenciaNombramiento.CODIGO_TIPO_SEDE_UGEL;
    let esDre  =  rol.CODIGO_TIPO_SEDE === TablaEquivalenciaNombramiento.CODIGO_TIPO_SEDE_DRE;
    this.esSedeDreUgel = esUgel || esDre;
    if(esDre)
      this.codigoDre = rol.CODIGO_SEDE;
    if(esUgel)
      this.codigoUgel = rol.CODIGO_SEDE;
    this.codigoRol = rol.CODIGO_ROL
    const usuario = this.dataService.Storage().getPassportUserData();
    this.numeroDocumento= usuario.NUMERO_DOCUMENTO;
  }

  buildForm = () => {
    this.form = this.formBuilder.group({
      codigoModular: [null],
      codigoPlaza: [null],
    });
  }

  handleResponsive(): void {
    this.isMobile = this.getIsMobile();
    window.onresize = () => {
      this.isMobile = this.getIsMobile();
    };
  }

  buildShared() {
      this.sharedService.setSharedBreadcrumb("Procesos de Nombramiento");
      this.sharedService.setSharedTitle("Listado de plazas");
  }

//#region  PrePublicada
  masterTogglePrePublicada() {
    if (this.isAllSelectedPrePublicada()) {
      if (!this.isDisabled) {
        this.selectionPrePublicada.clear();
      }
    } else {
      this.dataSourcePrePublicada.data.forEach(row => {
        if (!row.isDisabled) {
          this.selectionPrePublicada.select(row);
        }
      });
    }
  }

  isAllSelectedPrePublicada() {
    const numSelected = this.selectionPrePublicada.selected.length;
    const data = this.dataSourcePrePublicada.data;
    const numRows = data.filter(row => !row.bloquear).length;
    return numSelected === numRows;
  }

  selectedGridPrePublicada(row) {
    console.log(row);
    if (!this.isDisabled)
      console.log("disable",row);
      this.selectionPrePublicada.toggle(row);
  }
//#endregion

//#region AConvocar
  masterToggleAConvocar() {
    if (this.isAllSelectedAConvocar()) {
      if (!this.isDisabled) {
        this.selectionAConvocar.clear();
      }
    } else {
      this.dataSourceAConvocar.data.forEach(row => {
        if (!row.isDisabled) {
          this.selectionAConvocar.select(row);
        }
      });
    }
  }
  
  isAllSelectedAConvocar() {
    const numSelected = this.selectionAConvocar.selected.length;
    const data = this.dataSourceAConvocar.data;
    const numRows = data.filter(row => !row.bloquear).length;
    return numSelected === numRows;
  }
  
  selectedGridAConvocar(row) {
    if (!this.isDisabled)
      this.selectionAConvocar.toggle(row);
  }
//#endregion

//#region Observada 
  masterToggleObservada() {
    if (this.isAllSelectedObservada()) {
      if (!this.isDisabled) {
        this.selectionObservada.clear();
      }
    } else {
      this.dataSourceObservada.data.forEach(row => {
        if (!row.isDisabled) {
          this.selectionObservada.select(row);
        }
      });
    }
  }
  
  isAllSelectedObservada() {
    const numSelected = this.selectionObservada.selected.length;
    const data = this.dataSourceObservada.data;
    const numRows = data.filter(row => !row.bloquear).length;
    return numSelected === numRows;
  }
  
  selectedGridObservada(row) {
    if (!this.isDisabled)
      this.selectionObservada.toggle(row);
  }
//#endregion

  handleLimpiar(): void {this.resetForm(); }

  handleBuscar(): void { 
    this.buscarPlazasPrePublicada(true); 
    this.buscarPlazasAConvocar(true); 
    this.buscarPlazasObservada(true); 
    this.buscarPlazasConResumenFinal(true); 
  }

  handleGoNombramiento = () => { this.router.navigate(['/ayni/personal/procesospersonal/procesos/nombramiento'], { relativeTo: this.route }); } 

  handlePrePublicadaClicPlazasAConvocar (){

    if (this.selectionPrePublicada.selected.length == 0) {
      this.dataService.Message().msgWarning('Seleccione al menos un registro.', () => { });
      return;
    }

    const prePublicada: any[] = this.selectionPrePublicada.selected;
    console.log("selectionPrePublicada",this.selectionPrePublicada);
    let obj = {
      idEtapaProceso: 0,
      etapaProceso: {
        idEtapaProceso: this.idEtapaProceso,
        codigoEstadoDesarrollo: CatalogoEstadoDesarrolloEnum.INICIADO,
        fechaModificacion: new Date(),
        usuarioModificacion: this.numeroDocumento,
        ipModificacion: '',
      },
      situacionValidacion: prePublicada.map(item => {
        return {
          idPlazaNombramientoDetalle: item.idPlazaNombramientoDetalle,
          codigoSituacionValidacion: CatalogoSituacionValidacionEnum.A_CONVOCAR,
          fechaModificacion: new Date(),
          usuarioModificacion: this.numeroDocumento,
          ipModificacion: '',
        };
      }),
    }

    this.dataService.Message().msgConfirm('¿Está seguro de que desea guardar la información.?', () => {
      this.dataService.Spinner().show("sp6");
      this.working = true;
      this.dataService
        .Nombramiento()
        .modificarSituacionValidacionPlazaNombramiento(obj)
        .pipe(
          catchError((e) => of(e)),
          finalize(() => { this.dataService.Spinner().hide("sp6"); this.working = false; })
        )
        .subscribe(response => {
          
          if (response && response > 0) {
            this.dataService.Message().msgSuccess('Operación realizada de forma exitosa.', () => { 
              this.buscarPlazasPrePublicada(true);
              this.selectionPrePublicada = new SelectionModel<any>(true, []);
              this.buscarPlazasAConvocar(true);
              this.selectionAConvocar = new SelectionModel<any>(true, []);
              this.buscarPlazasConResumenFinal(true);
            });
          } else if (response && (response.status === 400 || response.status === 422 || response.status === 404)) {
            this.dataService.Message().msgWarning(response.error.messages[0], () => { });
          } else {
            this.dataService.Message().msgWarning('No se puede crear la configuración del proceso.', () => { });
          }
        });
    }, () => { });

  } 

  handlePrePublicadaClicPlazasObservadas () {

    if (this.selectionPrePublicada.selected.length == 0) {
      this.dataService.Message().msgWarning('Seleccione al menos un registro.', () => { });
      return;
    }

    this.dialogRef = this.materialDialog.open(ModalAgregarMotivoRechazoPlazasComponent, {
      panelClass: 'modal-proceso-form-dialog',
      disableClose: true,
      data: {
        modal: {
          icon: "save",
          title: "Sustentar motivo de observación de plazas",
          action: "create",
          info: { instancia: 16 },
          editable: true
        },
        selection: this.selectionPrePublicada.selected,
        idEtapaProceso: this.idEtapaProceso
      }
    });

    this.dialogRef.afterClosed()
      .subscribe((response: any) => {
        if (!response) {
          return;
        }
        if (response.reload) {
          this.buscarPlazasPrePublicada(true);
          this.selectionPrePublicada = new SelectionModel<any>(true, []);
          this.buscarPlazasObservada(true); 
          this.selectionObservada = new SelectionModel<any>(true, []);
          this.buscarPlazasConResumenFinal(true);
        }
      });
  }

  handleAConvocarClicPlazasObservadas(){
  
    if (this.selectionAConvocar.selected.length == 0) {
      this.dataService.Message().msgWarning('Seleccione al menos un registro.', () => { });
      return;
    }

    this.dialogRef = this.materialDialog.open(ModalAgregarMotivoRechazoPlazasComponent, {
      panelClass: 'modal-proceso-form-dialog',
      disableClose: true,
      data: {
        modal: {
          icon: "save",
          title: "Sustentar motivo de observación de plazas",
          action: "create",
          info: { instancia: 16 },
          editable: true
        },
        selection: this.selectionAConvocar.selected,
        idEtapaProceso: this.idEtapaProceso
      }
    });

    this.dialogRef.afterClosed()
      .subscribe((response: any) => {
        if (!response) {
          return;
        }
        if (response.reload) {
          this.buscarPlazasAConvocar(true);
          this.selectionAConvocar = new SelectionModel<any>(true, []);
          this.buscarPlazasObservada(true); 
          this.selectionObservada = new SelectionModel<any>(true, []);
          this.buscarPlazasConResumenFinal(true);
        }
      });
  }

  handleObservadaClicPlazasAConvocar(){
    
    if (this.selectionObservada.selected.length == 0) {
      this.dataService.Message().msgWarning('Seleccione al menos un registro.', () => { });
      return;
    }

    const observada: any[] = this.selectionObservada.selected;

    let obj = {
      idEtapaProceso: 0,
      etapaProceso: {
        idEtapaProceso: this.idEtapaProceso,
        codigoEstadoDesarrollo: CatalogoEstadoDesarrolloEnum.INICIADO,
        fechaModificacion: new Date(),
        usuarioModificacion: this.numeroDocumento,
        ipModificacion: '',
      },
      situacionValidacion: observada.map(item => {
        return {
          idPlazaNombramientoDetalle: item.idPlazaNombramientoDetalle,
          codigoSituacionValidacion: CatalogoSituacionValidacionEnum.A_CONVOCAR,
          fechaModificacion: new Date(),
          usuarioModificacion: this.numeroDocumento,
          ipModificacion: '',
        };
      }),
    }

    this.dataService.Message().msgConfirm('¿Está seguro de que desea guardar la información.?', () => {
      this.dataService.Spinner().show("sp6");
      this.working = true;
      this.dataService
        .Nombramiento()
        .modificarSituacionValidacionPlazaNombramiento(obj)
        .pipe(
          catchError((e) => of(e)),
          finalize(() => { this.dataService.Spinner().hide("sp6"); this.working = false; })
        )
        .subscribe(response => {
          
          if (response && response > 0) {
            this.dataService.Message().msgSuccess('Operación realizada de forma exitosa.', () => { 
              this.buscarPlazasAConvocar(true);
              this.selectionAConvocar = new SelectionModel<any>(true, []);
              this.buscarPlazasObservada(true);
              this.selectionObservada = new SelectionModel<any>(true, []);
              this.buscarPlazasConResumenFinal(true);
            });
          } else if (response && (response.status === 400 || response.status === 422 || response.status === 404)) {
            this.dataService.Message().msgWarning(response.error.messages[0], () => { });
          } else {
            this.dataService.Message().msgWarning('No se puede crear la configuración del proceso.', () => { });
          }
        });
    }, () => { });
  }

  handleFinalizarValidacionPlazas(){

    if (this.dataSourcePrePublicada.totalregistro > 0 ) {
      this.dataService.Message().msgWarning('Aun existe registros PrePublicados.', () => { });
      return;
    }

    let obj = {
      plazoNombramiento:{
        idEtapaProceso: this.idEtapaProceso,
        codigoEstadoValidacionPlaza: CatalogoEstadoValidacionPlazaEnum.VALIDADO,
        
        fechaModificacion: new Date(),
        usuarioModificacion: this.numeroDocumento,
        ipModificacion: '',
      },
      consolidadoPlazo:{
        idEtapaProceso: this.idEtapaProceso,
        idAlcanceProceso: this.plazaNombramiento.idAlcanceProceso,
        idPlazaNombramiento: this.plazaNombramiento.idPlazaNombramiento,
        codigoEstadoConsolidado: CatalogoEstadoConsolidadoPlazaEnum.VALIDADO,
      
        fechaCreacion: new Date(),
        usuarioCreacion: this.numeroDocumento,
        ipCreacion: '',
      },
    }

    this.dataService.Message().msgConfirm('¿Está seguro de que desea guardar la información.?', () => {
      this.dataService.Spinner().show("sp6");
      this.working = true;
      this.dataService
        .Nombramiento()
        .modificarEstadoValidacionPlazaPlazaNombramiento(obj)
        .pipe(
          catchError((e) => of(e)),
          finalize(() => { this.dataService.Spinner().hide("sp6"); this.working = false; })
        )
        .subscribe(response => {
          
          if (response && response > 0) {
            this.dataService.Message().msgSuccess('Operación realizada de forma exitosa.', () => { 
              this.obtenerPlazaNombremiento();
            });
          } else if (response && (response.status === 400 || response.status === 422 || response.status === 404)) {
            this.dataService.Message().msgWarning(response.error.messages[0], () => { });
          } else {
            this.dataService.Message().msgWarning('No se puede crear la configuración del proceso.', () => { });
          }
        });
    }, () => { });

  }

//false validar
  handlePublicarPlazas(){

    let obj = {
      plazoNombramiento:{
        idEtapaProceso: this.idEtapaProceso,
        codigoEstadoValidacionPlaza: CatalogoEstadoValidacionPlazaEnum.PUBLICADO,
        
        fechaModificacion: new Date(),
        usuarioModificacion: this.numeroDocumento,
        ipModificacion: '',
      }
    }

    this.dataService.Message().msgConfirm('¿Está seguro de que desea guardar la información.?', () => {
      this.dataService.Spinner().show("sp6");
      this.working = true;
      this.dataService
        .Nombramiento()
        .modificarEstadoValidacionPlazaPlazaNombramiento(obj)
        .pipe(
          catchError((e) => of(e)),
          finalize(() => { this.dataService.Spinner().hide("sp6"); this.working = false; })
        )
        .subscribe(response => {
          
          if (response && response > 0) {
            this.dataService.Message().msgSuccess('Operación realizada de forma exitosa.', () => { 
              this.obtenerPlazaNombremiento();
            });
          } else if (response && (response.status === 400 || response.status === 422 || response.status === 404)) {
            this.dataService.Message().msgWarning(response.error.messages[0], () => { });
          } else {
            this.dataService.Message().msgWarning('No se puede crear la configuración del proceso.', () => { });
          }
        });
    }, () => { });

  }

  
  handleIncorporarPlazas(plazaNombramiento){

    this.dialogRef = this.materialDialog.open(ModalIncorporarPlazaComponent, {
      panelClass: 'minedu-modal-incorporar-plaza',
      disableClose: true,
      data: {
        modal: {
          icon: "save",
          title: "Incorporar PLazas",
          action: "informate",
          info: { instancia: 16 },
          editable: true
        },
        idEtapaProceso: plazaNombramiento.idEtapaProceso,
        idDesarrolloProceso: plazaNombramiento.idDesarrolloProceso
      }
    });

    this.dialogRef.afterClosed()
      .subscribe((response: any) => {
        if (!response) {

          return;
        }
        if (response.reload) { 
        }
      });

  }
//falta desarrollar
  handleVerListaPlazas(){
    return
  }

  handleInformacion(row){

    this.dialogRef = this.materialDialog.open(ModalInformacionPlazasComponent, {
      panelClass: 'modal-proceso-form-dialog',
      disableClose: true,
      data: {
        modal: {
          icon: "save",
          title: "Informacion completa de la plaza",
          action: "informate",
          info: { instancia: 16 },
          editable: true
        },
        idPlazaNombramientoDetalle: row.idPlazaNombramientoDetalle,
      }
    });

    this.dialogRef.afterClosed()
      .subscribe((response: any) => {
        if (!response) {
          return;
        }
        if (response.reload) { 
        }
      });

  }

  handleMotivo(row){

    this.dialogRef = this.materialDialog.open(ModalConsultarMotivoRechazoPlazasComponent, {
        panelClass: 'modal-proceso-form-dialog',
        disableClose: true,
        data: {
          modal: {
            icon: "save",
            title: "Motivo de no publicación de plazas",
            action: "create",
            info: { instancia: 16 },
            editable: true
          },
          idPlazaNombramientoDetalle: row.idPlazaNombramientoDetalle,
        }
      });
  
      this.dialogRef.afterClosed()
        .subscribe((response: any) => {
          if (!response) {
            return;
          }
          if (response.reload) {
            this.buscarPlazasAConvocar();
            this.buscarPlazasObservada(); 
          }
        });
  }
  
  //#region PrePublicada   
  buscarPlazasPrePublicada = (fistTime: boolean = false) => {
    this.setRequest();
    if (fistTime) {
      this.dataSourcePrePublicada.load(this.request, 1, 10);
    } 
    else {          
      this.dataSourcePrePublicada.load(
        this.request,
        this.paginatorPrePublicada.pageIndex + 1,
        this.paginatorPrePublicada.pageSize
      );
    }
  } 

  loadDataPrePublicada(pageIndex, pageSize): void {
    this.setRequest();
    this.dataSourcePrePublicada.load(
      this.request,
      this.paginatorPrePublicada.pageIndex + 1,
      this.paginatorPrePublicada.pageSize
    );
  }
  
  handleExportarPrePublicada = () => {
    if (this.dataSourcePrePublicada.data.length === 0) {
      this.dataService.Message().msgWarning('No se encontró información para exportar.', () => { });
      return;
    }
    this.setRequest();
    this.export = true;
    this.dataService.Spinner().show('sp6');
    this.dataService
      .Nombramiento()
      .getExportPlazaNombramiento(this.request, this.dataSourcePrePublicada.codigoSituacionValidacion, 1, this.dataSourcePrePublicada.dataTotal)
      .pipe(catchError((e) => of(null)), finalize(() => {
        this.dataService.Spinner().hide('sp6');
        this.export = false;
      }))
      .subscribe((response: any) => {
        if (response) {
          console.log("exportando","Test");
          var datePipe = new DatePipe('es-Pe');
          console.log('datePipe',datePipe);
          var date = datePipe.transform(new Date(), 'yyyy-MM-dd')
          descargarExcel(response, 'desarrollo-etapa-nombramiento-plazas'+date+'.xlsx');
        } 
        else {
          this.dataService.Message().msgWarning('No se encontró información para los criterios de búsqueda ingresado', () => { });
        }
      });
  }
  //#endregion

  //#region AConvocar 
  buscarPlazasAConvocar = (fistTime: boolean = false) => {
    this.setRequest();
    if (fistTime) {
      this.dataSourceAConvocar.load(this.request, 1, 10);
    } 
    else {          
      this.dataSourceAConvocar.load(
        this.request,
        this.paginatorAConvocar.pageIndex + 1,
        this.paginatorAConvocar.pageSize
      );
    }
  }

  loadDataAConvocar(pageIndex, pageSize): void {
    this.setRequest();
    this.dataSourceAConvocar.load(
      this.request,
      this.paginatorAConvocar.pageIndex + 1,
      this.paginatorAConvocar.pageSize
    );
  }
  
  handleExportarAConvocar = () => {
    if (this.dataSourceAConvocar.data.length === 0) {
      this.dataService.Message().msgWarning('No se encontró información para exportar.', () => { });
      return;
    }

    this.export = true;
    this.dataService.Spinner().show('sp6');
    this.dataService
      .Nombramiento()
      .getExportPlazaNombramiento(this.request, this.dataSourceAConvocar.codigoSituacionValidacion, 1, this.dataSourceAConvocar.dataTotal)
      .pipe(catchError((e) => of(null)), finalize(() => {
        this.dataService.Spinner().hide('sp6');
        this.export = false;
      }))
      .subscribe((response: any) => {
        if (response) {
          console.log("exportando","Test");
          var datePipe = new DatePipe('es-Pe');
          console.log('datePipe',datePipe);
          var date = datePipe.transform(new Date(), 'yyyy-MM-dd')
          descargarExcel(response, 'desarrollo-etapa-nombramiento-plazas'+date+'.xlsx');
        } 
        else {
          this.dataService.Message().msgWarning('No se encontró información para los criterios de búsqueda ingresado', () => { });
        }
      });
  }
  //#endregion

  //#region Observada 
  buscarPlazasObservada = (fistTime: boolean = false) => {
    this.setRequest();
    if (fistTime) {
      this.dataSourceObservada.load(this.request, 1, 10);
    } 
    else {          
      this.dataSourceObservada.load(
        this.request,
        this.paginatorObservada.pageIndex + 1,
        this.paginatorObservada.pageSize
      );
    }
  }

  loadDataObservada(pageIndex, pageSize): void {
    this.setRequest();
    this.dataSourceObservada.load(
      this.request,
      this.paginatorObservada.pageIndex + 1,
      this.paginatorObservada.pageSize
    );
  }
  
  handleExportarObservada = () => {
    if (this.dataSourceObservada.data.length === 0) {
      this.dataService.Message().msgWarning('No se encontró información para exportar.', () => { });
      return;
    }

    this.export = true;
    this.dataService.Spinner().show('sp6');
    this.dataService
      .Nombramiento()
      .getExportPlazaNombramiento(this.request, this.dataSourceObservada.codigoSituacionValidacion, 1, this.dataSourceObservada.dataTotal)
      .pipe(catchError((e) => of(null)), finalize(() => {
        this.dataService.Spinner().hide('sp6');
        this.export = false;
      }))
      .subscribe((response: any) => {
        if (response) {
          console.log("exportando","Test");
          var datePipe = new DatePipe('es-Pe');
          console.log('datePipe',datePipe);
          var date = datePipe.transform(new Date(), 'yyyy-MM-dd')
          descargarExcel(response, 'desarrollo-etapa-nombramiento-plazas'+date+'.xlsx');
        } 
        else {
          this.dataService.Message().msgWarning('No se encontró información para los criterios de búsqueda ingresado', () => { });
        }
      });
  }
  //#endregion

  //#region ConResumenFinal 
  buscarPlazasConResumenFinal = (fistTime: boolean = false) => {
    this.setRequest();
    if (fistTime) {
      this.dataSourceConResumenFinal.load(this.request, 1, 10);
    } 
    else {          
      this.dataSourceConResumenFinal.load(
        this.request,
        this.paginatorConResumenFinal.pageIndex + 1,
        this.paginatorConResumenFinal.pageSize
      );
    }
  }

  loadDataConResumenFinal(pageIndex, pageSize): void {
    this.setRequest();
    this.dataSourceConResumenFinal.load(
      this.request,
      this.paginatorConResumenFinal.pageIndex + 1,
      this.paginatorConResumenFinal.pageSize
    );
  }

  handleExportarConResumenFinal = () => {
    if (this.dataSourceConResumenFinal.data.length === 0) {
      this.dataService.Message().msgWarning('No se encontró información para exportar.', () => { });
      return;
    }

    this.export = true;
    this.dataService.Spinner().show('sp6');
    this.dataService
      .Nombramiento()
      .getExportPlazaNombramiento(this.request, this.dataSourceConResumenFinal.codigoSituacionValidacion, 1, this.dataSourceConResumenFinal.dataTotal)
      .pipe(catchError((e) => of(null)), finalize(() => {
        this.dataService.Spinner().hide('sp6');
        this.export = false;
      }))
      .subscribe((response: any) => {
        if (response) {
          console.log("exportando","Test");
          var datePipe = new DatePipe('es-Pe');
          console.log('datePipe',datePipe);
          var date = datePipe.transform(new Date(), 'yyyy-MM-dd')
          descargarExcel(response, 'desarrollo-etapa-nombramiento-plazas'+date+'.xlsx');
        } 
        else {
          this.dataService.Message().msgWarning('No se encontró información para los criterios de búsqueda ingresado', () => { });
        }
      });
  }
  //#endregion

  resetForm = () => {  
      this.form.reset(); 
  }

  setRequest = () => {
    this.request = {
        codigoModular: this.form.get('codigoModular').value,
        codigoPlaza: this.form.get('codigoPlaza').value,
        esSedeDreUgel: this.esSedeDreUgel,
        codigoDre:  this.codigoDre,
        codigoUgel:  this.codigoUgel,
        codigoRol: this.codigoRol,
        idEtapaProceso:this.idEtapaProceso,
    };
  }

  obtenerEtapaProceso = () => {
      this.dataService
      .Nombramiento()
      .getEtapaProceso(this.idEtapaProceso)
      .pipe(
          catchError(() => of([])),
          finalize(() => { })
      )
      .subscribe((response: any) => {
          if (response) {
              this.etapaProceso = response;
          }
      });
  }
  
  obtenerPlazaNombremiento = () => {
    this.dataService
    .Nombramiento()
    .getPlazaNombramientoPorEtapaProceso(this.idEtapaProceso, this.codigoDre, this.codigoUgel,this.codigoRol)
    .pipe(
        catchError(() => of([])),
        finalize(() => { })
    )
    .subscribe((response: any) => {
        if (response) {
          console.log('response',response);
            this.plazaNombramiento = response;
            this.incorporarPlazas = this.plazaNombramiento.incorporarPlazas;
            this.plazasConvocar = this.plazaNombramiento.plazasConvocar;
            this.plazasObservadas = this.plazaNombramiento.plazasObservadas;
            this.finalizarValidacionPlazas = this.plazaNombramiento.finalizarValidacionPlazas;
            this.migrarPlazasDesiertas = this.plazaNombramiento.migrarPlazasDesiertas;
            this.publicarPlazas = this.plazaNombramiento.publicarPlazas;
            this.aperturarPublicacionPlazas = this.plazaNombramiento.aperturarPublicacionPlazas;

            this.estadoPendiente = this.plazaNombramiento.codigoEstadoValidacionPlaza === CatalogoEstadoValidacionPlazaEnum.PENDIENTE;
            this.estadoValidado = this.plazaNombramiento.codigoEstadoValidacionPlaza === CatalogoEstadoValidacionPlazaEnum.VALIDADO;
            this.estadoAprobado = this.plazaNombramiento.codigoEstadoValidacionPlaza === CatalogoEstadoValidacionPlazaEnum.APROBADO;
            this.estadoPublicado = this.plazaNombramiento.codigoEstadoValidacionPlaza === CatalogoEstadoValidacionPlazaEnum.PUBLICADO;
        }
    });
  }

}

export class PlazaDataSource extends DataSource<any> {  
  private _dataChange = new BehaviorSubject<any>([]);
  private _loadingChange = new BehaviorSubject<boolean>(false);
  public codigoSituacionValidacion = 0;

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
    }
    else {
      this.dataService
        .Nombramiento()
        .getPagePlazaNombramiento(data, this.codigoSituacionValidacion, pageIndex, pageSize)
        .pipe(
          catchError((e) => of(e)),
          finalize(() => {
            this._loadingChange.next(false);
          })
        )
        .subscribe((response: any) => {
          if (response) {
            this._dataChange.next(response || []);
              this.totalregistro = (response || []).length === 0 ? 0 : response[0].totalRegistro;
              
              // if ((response || []).length === 0) {
              //   this.dataService.Message().msgWarning('No se encontró información de nombramiento(s) para los criterios de búsqueda ingresados.', () => { });
              // }
          }
          else if (response && response.statusCode === ResultadoOperacionEnum.NotFound) {
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