import { Component, OnInit, ViewEncapsulation, OnDestroy, ViewChild, AfterViewInit, Input } from '@angular/core';
import { mineduAnimations } from '@minedu/animations/animations';
import { Subscription, BehaviorSubject, of, Observable, Subject } from 'rxjs';
import { SelectionModel, DataSource, CollectionViewer } from '@angular/cdk/collections';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { saveAs } from 'file-saver';
import { catchError, finalize, takeUntil, filter, find, tap } from 'rxjs/operators';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { DataService } from 'app/core/data/data.service';
import { SharedService } from 'app/core/shared/shared.service';
import { CentroTrabajoModel } from 'app/core/model/centro-trabajo.model';
import { MessageService } from 'app/core/data/services/message.service';
import { TablaProcesosConfiguracionAcciones } from 'app/core/model/action-buttons/action-types';
import { ASISTENCIA_MESSAGE, CONFIGURACION_PROCESO_MESSAGE, PASSPORT_MESSAGE, SNACKBAR_BUTTON } from 'app/core/model/messages-error';
import { buscarRolPassport, ResultadoOperacionEnum } from 'app/core/model/types';
import { EstadoConsolidadoAprobacionEnum, EstadoControlConsolidadoEnum } from '../../control-asistencia/_utils/enum';
import { SecurityModel } from 'app/core/model/security/security.model';
import { ConsolidadoAprobacionModel } from '../model/consolidado.model';
import { MESSAGE_ASISTENCIA } from '../../utils/messages';
import Swal from 'sweetalert2';
import { ModalRechazoSolicitudComponent } from '../modal-rechazo-solicitud/modal-rechazo-solicitud.component';
import { MatTableDataSource } from '@angular/material/table';
// import { ProcesosDataSource } from 'app/main/apps/procesos/configuracion/configurar-proceso/configurar-proceso.component';
import { PAGE_ORIGEN } from '../../control-asistencia/_utils/constants';



@Component({
  selector: 'minedu-consolidado-aprobacion',
  templateUrl: './consolidado-aprobacion-asistencia.component.html',
  styleUrls: ['./consolidado-aprobacion-asistencia.component.scss'],
  encapsulation: ViewEncapsulation.None,
  animations: mineduAnimations
})
export class ConsolidadoAprobacionAsistenciaComponent implements OnInit {

  form: FormGroup;
  export: boolean = false;
  working: boolean = false;
  private modular: CentroTrabajoModel = null;
  now = new Date().getFullYear()-2;
  data:any;
  maxDate = new Date(new Date().setFullYear(new Date().getFullYear() +1));
  permisoPassport = {
    hasPermissionEnviarCompensaciones :  false,
    hasPermisionAprobarMasivo:  false,
    hasPermissionRechazarMasivo : false,
    hasPermisionAprobar:  false,
    hasPermissionRechazar : false,
    hasPermisionExportar:  false,
    hasPermissionBuscar :  false
  }
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

  private passport: SecurityModel = new SecurityModel();
  centroTrabajo: CentroTrabajoModel = null;
  filtroGrid: any = null;
  permisoVerConsolidadoAprobacion: boolean = false;  
  isDisabled: boolean = false;
  filtro: any = null;
  max = new Date(new Date().setFullYear(new Date().getFullYear() + 1));
 
  comboLists = {
    listEstadosControlConsolidado: [],
    listMeses: []   
  }; 

  paginatorPageSize = 10;
  paginatorPageIndex = 0;


  displayedColumns: string[] = [
    'select',
    'centroTrabajo',
    'codigoCentroTrabajo',       
    'nivelEducativo',
    'modalidadEducativa',
    'descripcionEstadoConsolidado',
    'fechaSolicitada',    
    'acciones'
  ];


  dialogRef: any;
  private _loadingChange = new BehaviorSubject<boolean>(false);
  loading = this._loadingChange.asObservable();
  totalRegistros: number = 0;
  dataSource: MatTableDataSource<any> = new MatTableDataSource<any>();
  selection = new SelectionModel<any>(true, []);
  
  @ViewChild(MatPaginator, { static: true })
  paginator: MatPaginator;


  estadoAprobadoEnum = EstadoConsolidadoAprobacionEnum.APROBADO;
  estadoPendienteEnum = EstadoConsolidadoAprobacionEnum.PENDIENTE_DE_APROBACION;

  request = {       
    anio: null,
    idMes: null,
    codigoCentroTrabajo: null,
    idEstado: null,
   
  };
  
  constructor(   
    private router: Router,
    private route: ActivatedRoute,
    private formBuilder: FormBuilder,
    private utilService: MessageService,
    private materialDialog: MatDialog,
    private sharedService: SharedService,
    private dataService: DataService
  ) { }

  ngOnInit(): void {
    setTimeout(_ => this.buildShared());
        this.buildForm();
        this.default();     
        this.defaultGrid();
        this.defaultPermisoPassport(); 
        this.buildPassport();
        this.route.data.subscribe((data) => {
            if (data) {
              this.permisoVerConsolidadoAprobacion = buscarRolPassport(this.passport.codigoRol);             
              this.handleCentroTrabajo();
              this.defaultComboControlConsolidado();
              this.defaultComboListMeses()
            }
          });     
          this.handleResponsive();
  }

  handleResponsive(): void {
    this.isMobile = this.getIsMobile();
    window.onresize = () => {
        this.isMobile = this.getIsMobile();
    };
  }

  ngAfterViewInit() {
    this.paginator.page
      .pipe(
        tap(() => this.handleGrid())
      )
      .subscribe();
  }


  buildShared() {
    this.sharedService.setSharedBreadcrumb("Consolidado para aprobación");
    this.sharedService.setSharedTitle("Consolidado para aprobación");
  }
  buildForm() {
    this.form = this.formBuilder.group({
        anio: [null],
        idMes : -1,        
        codigoCentroTrabajo: [null],
        idEstado : -1,
        fechaConsolidado: [new Date()]
    });
    // this.form.get("fechaConsolidado").valueChanges.subscribe(value => {
    //   this.form.patchValue({ anio: value?.getFullYear() });
    // });     
}

buildPassport() {
  this.passport = this.dataService.Storage().getInformacionUsuario();
}
default() {
  this.form.patchValue({ fechaAsistencia: new Date() });
}

selectedGrid(row) {
    this.selection.toggle(row);
  }

  isAllSelected() {
    const numSelected = this.selection.selected.length;
    const data = this.dataSource.data;
    const numRows = data.filter(row => !row.bloquear).length;
    return numSelected === numRows;
  }

  customSelected() {
    this.dataSource.data.forEach(row => {
      if (row.idPropuestaAdecuacion) {
        this.selection.select(row);
      }
    });
  }

  masterToggle() {
    if (this.isAllSelected()) {
      this.selection.clear();
    } else {
      this.dataSource.data.forEach(row => {
        this.selection.select(row);
      });
    }
  }

  resetGrid() {
    this.dataSource = new MatTableDataSource([]);
    this.totalRegistros = 0;
  }

  checkboxLabel(row?: any): string {
    if (!row) {
      return `${this.isAllSelected() ? 'select' : 'deselect'} all`;
    }
    return `${this.selection.isSelected(row) ? 'deselect' : 'select'} row ${row.idCentroTrabajo}`;
  }



defaultPermisoPassport() {
  this.permisoPassport.hasPermissionEnviarCompensaciones = this.dataService.Storage().tienePermisoAccion(TablaProcesosConfiguracionAcciones.Derivar);
  this.permisoPassport.hasPermisionAprobarMasivo = this.dataService.Storage().tienePermisoAccion(TablaProcesosConfiguracionAcciones.Aprobar);
  this.permisoPassport.hasPermissionRechazarMasivo = this.dataService.Storage().tienePermisoAccion(TablaProcesosConfiguracionAcciones.Aprobar);
  this.permisoPassport.hasPermisionAprobar = this.dataService.Storage().tienePermisoAccion(TablaProcesosConfiguracionAcciones.Aprobar);
  this.permisoPassport.hasPermissionRechazar = this.dataService.Storage().tienePermisoAccion(TablaProcesosConfiguracionAcciones.Aprobar);
  this.permisoPassport.hasPermisionExportar = this.dataService.Storage().tienePermisoAccion(TablaProcesosConfiguracionAcciones.Exportar);
  this.permisoPassport.hasPermissionBuscar = this.dataService.Storage().tienePermisoAccion(TablaProcesosConfiguracionAcciones.Consultar);
}
defaultGrid() {
  this.dataSource = new MatTableDataSource([]);
  this.paginator.showFirstLastButtons = true;
  this.paginator._intl.itemsPerPageLabel = "Filas por tabla";
  this.paginator._intl.nextPageLabel = "Siguiente página";
  this.paginator._intl.previousPageLabel = "Página anterior";
  this.paginator._intl.firstPageLabel = "Primera página";
  this.paginator._intl.lastPageLabel = "Última página";
  
}
handleCentroTrabajo() {
  this.dataService.Asistencia().findCentroTrabajo(
      this.passport.codigoSede
    ).pipe(
      catchError((e) => of(e)),
    ).subscribe(response => {
      if (response && response.result) {
        this.centroTrabajo = response.data;
        console.log("centro");
        console.log(this.centroTrabajo);
      } else {
        this.centroTrabajo = null;
        this.dataService.Message().msgError('Error, no se pudo obtener el centro de trabajo del usuario.el proceso.', () => { });
      }
    });
}  

defaultComboControlConsolidado() {
  this.dataService.Asistencia().listarEstadoAsistenciaMensual().pipe(
    catchError(() => { this.dataService.SnackBar().msgError(ASISTENCIA_MESSAGE.ESTADOS_ASISTENCIA_MENSUAL_ERROR, SNACKBAR_BUTTON.CLOSE); return of(null); }),
    finalize(() => { })
  ).subscribe((response: any) => {
    console.log(response);
    if (response && response.result) {      
      this.comboLists.listEstadosControlConsolidado = response.data.filter(a=>a.idCatalogoItem == 40 || a.idCatalogoItem == 36);
    } else {
      this.comboLists.listEstadosControlConsolidado = [];
    }
    this.form.patchValue({ idEstado: "-1" });
  });
}
defaultComboListMeses() {

  this.dataService.Asistencia().getMeses().pipe(
    catchError(() => { this.dataService.SnackBar().msgError(ASISTENCIA_MESSAGE.MESES_ERROR, SNACKBAR_BUTTON.CLOSE); return of(null); }),
    finalize(() => { })
  ).subscribe((response: any) => {
    if (response && response.result) {
      this.comboLists.listMeses = response.data;
    } else {
      this.comboLists.listMeses = [];
    }
    this.form.patchValue({ idMes: "-1" });
  });
}

handleGrid() {
  const form = this.form.value;
  console.log(form);
  if (form.anio)            
  {
    const d = {
      anio: new Date(form.anio).getFullYear(),     
      idMes: form.idMes,
      idEstado: form.idEstado, 
      codigoCentroTrabajo: this.centroTrabajo?.codigoCentroTrabajo

    }
    this.filtroGrid = d;
    this.cargarConsolidado(d, (this.paginator.pageIndex + 1), this.paginator.pageSize);
  } else {
    this.dataService.Message().msgWarning('Debe ingresar por lo menos un criterio de búsqueda.', () => { });
  }
}

cargarConsolidado(data:any,pageIndex:any,pageSize:any ){
  this.dataService.Spinner().show('sp6');
  this.selection.clear();
  this._loadingChange.next(true);
  this.dataService.Asistencia().getBandejaConsolidadoAprobacion(data, pageIndex, pageSize).pipe(
    catchError(() => of([])),
      finalize(() => { this._loadingChange.next(false); this.dataService.Spinner().hide('sp6'); })
  ).subscribe((response: any) => {
    console.log(response);
    if (response && (response.data || []).length > 0) {
      this.dataSource = new MatTableDataSource(response.data || []);
      this.totalRegistros = (response.data[0] || [{ totalRegistro: 0 }]).totalRegistro;
    } else if (response && (response.statusCode === 422 || response.statusCode === 404)) {
      this.totalRegistros = 0;
      this.dataSource = new MatTableDataSource([]);
      this.dataService.Message().msgWarning(response.messages[0], () => { });
    } else {
      this.totalRegistros = 0;
      this.dataSource = new MatTableDataSource([]);
      this.dataService.Message().msgWarning('No se encontró información para los criterios de búsqueda ingresados.', () => { });
    }
  });       
}

  handleLimpiar =() =>{
    //this.form.reset();
    this.form.get("anio").setValue(new Date().getFullYear()); 
    this.form.get("idMes").setValue(-1); 
    this.form.get("idEstado").setValue(-1); 
  }

  handleBuscar =(form) =>{
    if (!this.permisoPassport.hasPermissionBuscar) {
      this.dataService.Message().msgWarning(PASSPORT_MESSAGE.BUTTON_UNAUTHORIZED, () => { });
      return;
    }
    this.handleGrid();   
  }


  handleExportar =() =>{
    if (!this.permisoPassport.hasPermisionExportar) {
      this.dataService.Message().msgWarning(PASSPORT_MESSAGE.BUTTON_UNAUTHORIZED, () => { });
      return;
    }
  
    if (this.filtroGrid) {
      this.dataService.Spinner().show("sp6");
      this.dataService.Asistencia().exportarConsolidadoAprobacion(this.filtroGrid).pipe(
        catchError((e) => { this.dataService.SnackBar().msgError(ASISTENCIA_MESSAGE.EXPORTAR_ASISTENCIA_APROBACION, SNACKBAR_BUTTON.CLOSE); return of(e); }),
        finalize(() => { this.dataService.Spinner().hide("sp6"); })
      ).subscribe((response: any) => {
        if (response) {
          saveAs(response, "Consolidado para aprobación.xlsx");
        } else if (response && (response.statusCode === 422 || response.statusCode === 404)) {
          this.dataService.Message().msgWarning(response.messages[0], () => { });
        } else {
          this.dataService.Message().msgWarning('No se encontró información para los criterios de búsqueda ingresado', () => { });
        }
      });
    } else {
      this.dataService.Message().msgWarning('Debe ingresar por lo menos un criterio de búsqueda', () => { });
      return;
    }
  }


  handleAprobar = (row) => {
    //pedneitne de aprobacion

    if (!this.permisoPassport.hasPermisionAprobar) {
      this.dataService.Message().msgWarning(PASSPORT_MESSAGE.BUTTON_UNAUTHORIZED, () => { });
      return;
    }
    this.dataService.Message().msgWarning(MESSAGE_ASISTENCIA.M82, () => { 


      row.usuarioAprobador =  this.data = this.passport.numeroDocumento;
      
      console.log(row);
      this.dataService.Asistencia().postAprobar(row).pipe(
        catchError((e) => of(e)),
        finalize(() => {
            this.dataService.Spinner().hide("sp6")
            this.working = false;
        })
        ).subscribe(response => {
            if (response && response.result) {
                this.dataService.Message().msgInfo(MESSAGE_ASISTENCIA.M07, () => {   this.handleGrid();});         
            } else if (response && response.statusCode === ResultadoOperacionEnum.NotFound) {
                this.dataService.Message().msgWarning(response.messages[0], () => { });
            } else if (response && response.statusCode === ResultadoOperacionEnum.UnprocessableEntity) {
                this.dataService.Message().msgWarning(response.messages[0], () => { });
            } else {
                this.dataService.Message().msgError('Ocurrieron algunos problemas al aprocesar su solicitud, intente de nuevo', () => { });
            }
        });
    
    });
  
  }
  
  handleRechazar = (row) => {
    // pendiente de aprobacion
    const d = {
      anio: new Date(this.form.value.anio).getFullYear(),     
      idMes: this.form.value.idMes,
      idEstado: this.form.value.idEstado, 
      codigoCentroTrabajo: this.centroTrabajo?.codigoCentroTrabajo
    }
    if (!this.permisoPassport.hasPermissionRechazar) {
      this.dataService.Message().msgWarning(PASSPORT_MESSAGE.BUTTON_UNAUTHORIZED, () => { });
      return;
    }
    row.anio = new Date(this.form.value.anio).getFullYear();
    this.dialogRef = this.materialDialog.open(ModalRechazoSolicitudComponent, {
      panelClass: 'modal-motivo-devolucion-form-dialog',
      disableClose: true,
      data: {
        modal: {
          icon: "info",
          title: "Rechazar solicitud de aprobación",
          action: "create",
          info: row,
          esMasivo: false,
          info_:d,
          editable: true
        },
        passport: this.passport
      }
    });

    this.dialogRef.afterClosed()
      .subscribe((response: any) => {
       
        if (response) {
          this.handleGrid();
        }
      });
    
  }
  
  handleVerReporteDetallado = (row) => {
    const queryParams = {
      origen: PAGE_ORIGEN.CONSOLIDADO_APROBACION,
      descripcionMes: row.descripcionMes,
      anio: new Date(this.form.value.anio).getFullYear(),
  }
    this.router.navigate([row.idControlAsistencia,'detallado',], { relativeTo: this.route, queryParams});
  };


  handleVerReporteConsolidado = (row) => {
    const queryParams = {
      origen: PAGE_ORIGEN.CONSOLIDADO_APROBACION,
      descripcionMes: row.descripcionMes,
      anio: new Date(this.form.value.anio).getFullYear(),
      //centroTrabajo = row.
  }
    this.router.navigate([row.idControlAsistencia,'consolidado',], { relativeTo: this.route, queryParams});
  };



  handleAprobarMasivo = () => {
    if (this.selection.selected.length === 0) {
      this.dataService.Message().msgWarning('Debe seleccionar como mínimo un registro de la grilla.', () => { });
      return;      
    }
    const select = this.selection.selected.filter(a=>a.idEstado == EstadoConsolidadoAprobacionEnum.APROBADO);
    if(select.length != 0){
      this.dataService.Message().msgWarning('Selección inválida', () => {this.selection.clear(); });
      return;
    }
     

  const data:any[] = [];
  // = this.selection.selected.map(pre=>{return prependListener.});
  this.selection.selected.forEach(element => {
      const ControlAsistencia = {
        idControlAsistencia:element.idControlAsistencia,
          idCentroTrabajo: element.idCentroTrabajo,          
          idEstado: element.idEstado,
          usuarioAProbador: this.passport.numeroDocumento,
          
       
      };
      data.push(ControlAsistencia);
  });
  const request = {
    controlesAsistencia: data
  };
  const resultMessage = 'Operación realizada de forma exitosa.';
    this.dataService.Message().msgConfirm(MESSAGE_ASISTENCIA.M80, () => {
        this.working = true;
        this.dataService.Spinner().show("sp6");
        this.dataService.Asistencia().aprobarMasivo(request).pipe(
            catchError((e) => of(e)),
            finalize(() => {
                this.dataService.Spinner().hide("sp6")
                this.working = false;
            })
        ).subscribe(response => {
            if (response && response.result) {
                this.dataService.Message().msgInfo(MESSAGE_ASISTENCIA.M07, () => {this.handleGrid(); });
            } else if (response && response.statusCode === ResultadoOperacionEnum.NotFound) {
                this.dataService.Message().msgWarning(response.messages[0], () => { });
            } else if (response && response.statusCode === ResultadoOperacionEnum.UnprocessableEntity) {
                this.dataService.Message().msgWarning(response.messages[0], () => { });
            } else {
                this.dataService.Message().msgError('Ocurrieron algunos problemas al guardar la información.', () => { });
            }
        });
    }, (error) => { });


  }

  handleRechazarMasivo = () => {
    if (this.selection.selected.length === 0) {
      this.dataService.Message().msgWarning('Debe seleccionar como mínimo un registro de la grilla.', () => { });
      return;
    }
    const select = this.selection.selected.filter(a=>a.idEstado == EstadoConsolidadoAprobacionEnum.APROBADO);
    console.log(select);
    if(select.length != 0){
      this.dataService.Message().msgWarning(MESSAGE_ASISTENCIA.M84, () => {this.selection.clear(); });
      return;
    }
     
     
     
  const data: any[] = [];
  this.selection.selected.forEach(element => {
      const ControlAsistencia = {
        idControlAsistencia:element.idControlAsistencia,
        idCentroTrabajo: element.idCentroTrabajo,          
        idEstado: element.idEstado,
        usuarioRechazado: this.passport.numeroDocumento,
        usuarioRolRechazado: this.passport.nombreRol

      };
      data.push(ControlAsistencia);
  });
  const request = {
    controlesAsistencia: data
  };
  const d = {
    anio: new Date(this.form.value.anio).getFullYear(),     
    idMes: this.form.value.idMes,
    idEstado: this.form.value.idEstado, 
    codigoCentroTrabajo: this.centroTrabajo?.codigoCentroTrabajo
  }
  this.dialogRef = this.materialDialog.open(ModalRechazoSolicitudComponent, {
    panelClass: 'modal-motivo-devolucion-form-dialog',
    disableClose: true,
    data: {
      modal: {
        icon: "info",
        title: "Rechazar solicitud ",
        action: "",
        info: request,
        info_: d,
        esMasivo: true,
        editable: false
      },
      passport: this.passport
    }
  });

  this.dialogRef.afterClosed()
    .subscribe((response: any) => {
      if (response) {
    this.handleGrid();
      }

    });
   
  }

  handleEnviarCompensaciones = () => {
    if (this.selection.selected.length === 0) {
      this.dataService.Message().msgWarning('Debe seleccionar como mínimo un registro de la grilla.', () => { });
      return;
    }
    const select = this.selection.selected.filter(a=>a.idEstado === EstadoConsolidadoAprobacionEnum.PENDIENTE_DE_APROBACION);
    console.log(this.selection.selected);
    console.log(select);
    if(select.length != 0){
      this.dataService.Message().msgWarning('Selección inválida', () => {this.selection.clear(); });
      return;
    }
   
   
  const data: any[] = [];
  this.selection.selected.forEach(element => {
      const ControlAsistencia = {
        idControlAsistencia:element.idControlAsistencia,
        idCentroTrabajo: element.idCentroTrabajo,          
        idEstado: element.idEstado,
        usuarioRechazado: this.passport.numeroDocumento,
        usuarioRolDevolucionCompensaciones: this.passport.nombreRol,
      
      };
      data.push(ControlAsistencia);
  });
      const request = {
        controlesAsistencia: data
      };

      const resultMessage = 'Operación realizada de forma exitosa.';
    this.dataService.Message().msgConfirm(MESSAGE_ASISTENCIA.M85, () => {
        this.working = true;
        this.dataService.Spinner().show("sp6");
        this.dataService.Asistencia().enviarCompensaciones(request).pipe(
            catchError((e) => of(e)),
            finalize(() => {
                this.dataService.Spinner().hide("sp6")
                this.working = false;
            })
        ).subscribe(response => {
            if (response && response.result) {
                this.dataService.Message().msgInfo(resultMessage, () => { this.handleGrid();});
            } else if (response && response.statusCode === ResultadoOperacionEnum.NotFound) {
                this.dataService.Message().msgWarning(response.messages[0], () => { });
            } else if (response && response.statusCode === ResultadoOperacionEnum.UnprocessableEntity) {
                this.dataService.Message().msgWarning(response.messages[0], () => { });
            } else {
                this.dataService.Message().msgError('Ocurrieron algunos problemas al guardar la información.', () => { });
            }
        });
    }, (error) => { });
    
  }
}



