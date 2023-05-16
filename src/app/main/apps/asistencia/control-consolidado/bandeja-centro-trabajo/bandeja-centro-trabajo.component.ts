import {
  AfterViewInit,
  OnInit,
  ViewEncapsulation,
  Component,
  OnDestroy,
  ViewChild,
} from "@angular/core";
import { mineduAnimations } from '@minedu/animations/animations';
import { TakeUntilDestroy } from "@minedu/functions/TakeUntilDestroy";
import { UtilService } from "app/core/data/services/util.service";
import { EstadoControlAsistenciaMensualEnum, EstadoControlConsolidadoEnum, TipoMotivoDevolucion } from "app/main/apps/asistencia/control-asistencia/_utils/enum";
import { MessageService } from "app/core/data/services/message.service";
import { TablaProcesosConfiguracionAcciones } from "app/core/model/action-buttons/action-types";
import { buscarRolPassport, ResultadoOperacionEnum } from "app/core/model/types";
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { saveAs } from 'file-saver';
import { DataService } from 'app/core/data/data.service';
import { SelectionModel, DataSource, CollectionViewer } from '@angular/cdk/collections';
import { MatPaginator } from '@angular/material/paginator';
import { MatDialog } from '@angular/material/dialog';
import { tap, catchError, finalize } from 'rxjs/operators';
import { Subscription, BehaviorSubject, of, Observable, pipe,Subject } from 'rxjs';
import { ASISTENCIA_MESSAGE, CONFIGURACION_PROCESO_MESSAGE, PASSPORT_MESSAGE, SNACKBAR_BUTTON } from 'app/core/model/messages-error';
import { CentroTrabajoModel } from 'app/core/model/centro-trabajo.model';
import { SharedService } from 'app/core/shared/shared.service';
import { SecurityModel } from 'app/core/model/security/security.model';
import { BuscarCentroTrabajoComponent } from "../buscar-centro-trabajo/buscar-centro-trabajo.component";
import { ModalDevolverReportesComponent } from "../modal-devolver-reportes/modal-devolver-reportes.component";
import { MatTableDataSource } from "@angular/material/table";
import { ModalVerMotivoDevolucionComponent } from "../../control-asistencia/modal-ver-motivo-devolucion/modal-ver-motivo-devolucion.component";
import { MESSAGE_ASISTENCIA } from "../../utils/messages";
import { CONTROL_RUTAS, PAGE_ORIGEN } from "../../control-asistencia/_utils/constants";
import { ModalVerMotivoDevolucionModel } from "../../control-asistencia/models/bandeja-mensual.model";
import { result } from "lodash";



@Component({
  selector: 'minedu-centro-trabajo',
  templateUrl: './bandeja-centro-trabajo.component.html',
  styleUrls: ['./bandeja-centro-trabajo.component.scss'],
  encapsulation: ViewEncapsulation.None,
  animations: mineduAnimations
})
export class CentroTrabajoComponent implements OnInit,  AfterViewInit {

  form: FormGroup;
  export: boolean = false;
  working: boolean = false;
  isDisabled = false;
  private modular: CentroTrabajoModel = null;

  permisoPassport = {
    hasPermissionBuscar :  false,
    hasPermisionExportar:  false,
    hasPermissionVerMotivo : false,
    hasPermisionDevolver:  false,
    hasPermissionRegistrar :  false,
    hasPermissionSolicitarAprobacion: false
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
  permisoVerCentroTrabajo: boolean = false;  
  filtro: any = null;

  now: any = new Date(new Date().setFullYear(new Date().getFullYear() + 1));


  comboLists = {
    listEstadosControlConsolidado: [],
    listMeses: []   
  }; 
  private _loadingChange = new BehaviorSubject<boolean>(false);
  loading = this._loadingChange.asObservable();
  totalRegistros: number = 0;
  detalleDevolucionAsistencia: ModalVerMotivoDevolucionModel;
  dataSource: MatTableDataSource<any> = new MatTableDataSource<any>();
  selection = new SelectionModel<any>(true, []);

  @ViewChild('paginatorCentroTrabajo', { static: true }) paginator: MatPaginator;

  dialogRef: any;
  anioMes: string = "anio-mes";

  displayedColumns: string[] = [
    'select',
    'centroTrabajo',
    'codigoModular',       
    'descripcionNivelEducativo',
    'descripcionModalidad',
    'descripcionEstadoConsolidado',
    'fechaRemitida',
    'fechaRechazada',
    'fechaAprobada',
    'fechaDevueltaCompensaciones',  
    'acciones'
  ];

 
  estadoPendienteAprobacionEnum = EstadoControlAsistenciaMensualEnum.PENDIENTE_DE_APROBACION;
  estadoRechazadoEnum = EstadoControlAsistenciaMensualEnum.RECHAZADO; 
  estadoRemitidoFueraPlazoEnum = EstadoControlAsistenciaMensualEnum.REMITIDO_FUERA_PLAZO;
  estadoRemitidoDentroPlazoEnum = EstadoControlAsistenciaMensualEnum.REMITIDO_DENTRO_DE_PLAZO;
  estadoDevueltoEnum = EstadoControlAsistenciaMensualEnum.DEVUELTO;
  estadoSubsanadoEnum = EstadoControlAsistenciaMensualEnum.SUBSANADO;
  estadoAprobadoEnum = EstadoControlAsistenciaMensualEnum.APROBADO;
  estadoPendienteEnum = EstadoControlAsistenciaMensualEnum.PENDIENTE;
  estadoDevueltoCompensacionesEnum = EstadoControlAsistenciaMensualEnum.DEVUELTO_POR_COMPENSACIONES;

  anio: number = this.now.getFullYear();

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
        this.defaultPermisoPassport();
        this.defaultGrid();
        this.buildPassport();
        this.route.data.subscribe((data) => {
            if (data) {
              this.permisoVerCentroTrabajo = buscarRolPassport(this.passport.codigoRol);   
              this.comboLists.listEstadosControlConsolidado  = (data['ListEstadosControlConsolidado'] || { data: [] }).data;    
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

 

  buildShared() {
    this.sharedService.setSharedBreadcrumb("Asistencia");
    this.sharedService.setSharedTitle("Control del Consolidado de la Asistencia Mensual");
  }
  buildForm() {
    this.form = this.formBuilder.group({
        anio: [null],
        idMes : [null],        
        codigoModular: [null, Validators.maxLength(7)],
        idEstado : [null],
        fechaAsistencia: [new Date()]
    });
}

buildPassport() {
  this.passport = this.dataService.Storage().getInformacionUsuario();
}
default() {
  this.form.patchValue({ fechaAsistencia: new Date(), idMes: "-1", idEstado : "-1" });
}


defaultPermisoPassport() {
  this.permisoPassport.hasPermissionBuscar = this.dataService.Storage().tienePermisoAccion(TablaProcesosConfiguracionAcciones.Consultar);
  this.permisoPassport.hasPermisionExportar = this.dataService.Storage().tienePermisoAccion(TablaProcesosConfiguracionAcciones.Exportar);
  this.permisoPassport.hasPermissionRegistrar = this.dataService.Storage().tienePermisoAccion(TablaProcesosConfiguracionAcciones.Agregar);
  this.permisoPassport.hasPermissionVerMotivo = this.dataService.Storage().tienePermisoAccion(TablaProcesosConfiguracionAcciones.Consultar);
  this.permisoPassport.hasPermisionDevolver = this.dataService.Storage().tienePermisoAccion(TablaProcesosConfiguracionAcciones.Derivar);
  this.permisoPassport.hasPermissionSolicitarAprobacion = this.dataService.Storage().tienePermisoAccion(TablaProcesosConfiguracionAcciones.Derivar);
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
      } else {
        this.centroTrabajo = null;
        this.dataService.Message().msgError('Error, no se pudo obtener el centro de trabajo del usuario.el proceso.', () => { });
      }
    });
}   
 
defaultComboControlConsolidado() {
  this.dataService.Asistencia().listarEstadoAsistenciaMensual().pipe(
    catchError(() => { this.dataService.SnackBar().msgError(ASISTENCIA_MESSAGE.CONTROL_CENTRO_TRABAJO, SNACKBAR_BUTTON.CLOSE); return of(null); }),
    finalize(() => { })
  ).subscribe((response: any) => {
    if (response && response.result) {
      this.comboLists.listEstadosControlConsolidado = response.data.filter(a=>a.idCatalogoItem != 51);

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
selectedGrid(row) {
  if (!this.isDisabled)
    this.selection.toggle(row);
}

handleGrid() {
  const form = this.form.value;
  if (
    (form.anio || parseInt(form.anio) > 0) ||
    (form.idMes || parseInt(form.idMes) > 0) ||
    (form.idEstado || parseInt(form.idEstado) > 0)
    ||(form.codigoModular && parseInt(form.codigoModular) > 0)){
      const d = {
        anio: new Date(form.anio).getFullYear(), 
        idMes: form.idMes,
        idEstado : form.idEstado,       
        codigoCentroTrabajo: this.centroTrabajo?.codigoCentroTrabajo    
    }

    this.filtroGrid = d;
    
    this._loadingChange.next(true);
    this.dataService.Asistencia().getBandejaCentroTrabajo(d,(this.paginator.pageIndex + 1), this.paginator.pageSize).pipe(
      catchError((e) => of(e)),
    finalize(() => this._loadingChange.next(false))
  ).subscribe((response: any) => {
    console.log(response); 
    if (response && response.result) {
      console.log(response);
      this.dataSource = new MatTableDataSource(response.data || []);
      this.totalRegistros = (response.data[0] || [{ totalRegistro: 0 }]).totalRegistro;
       
      this.customSelected();
    } else {
      this.totalRegistros = 0;
      this.dataService.Message().msgWarning('No se encontró información del centro de trabajo.', () => { });
    }
  });
  }
  else{    
      this.dataService.Message().msgWarning('Debe ingresar por lo menos un criterio de búsqueda.', () => { });
  }
}

ngAfterViewInit() {
  this.paginator.page
    .pipe(
      tap(() => this.handleGrid())
    )
    .subscribe();
}

busquedaCentroTrabajo = () => {
  this.dialogRef = this.materialDialog.open(BuscarCentroTrabajoComponent, {
      panelClass: 'buscar-centro-trabajo-form-dialog',  
    //width: '1000px',
      disableClose: true,
      data: {
          action: 'requerimiento',
      }
  });

  this.dialogRef.afterClosed().subscribe(result => {
      if (result != null) {
          this.form.get('codigoModular').setValue(result.centroTrabajo.codigoCentroTrabajo);
      }
  });
}





  handleLimpiar =() =>{
    //this.form.reset();
    this.form.get("anio").setValue(new Date().getFullYear()+1); 
    this.form.get("idMes").setValue(-1); 
    this.form.get("codigoModular").setValue(""); 
    this.form.get("idEstado").setValue(-1); 
    this.resetGrid();
  }

  handleBuscar =(form) =>{
    if (!this.permisoPassport.hasPermissionBuscar) {
      this.dataService.Message().msgWarning(PASSPORT_MESSAGE.BUTTON_UNAUTHORIZED, () => { });
      return;
    }
    this.handleGrid(); 
   
  }

  handleVerReporteDetallado = (row) => {
     // this.idControlAsistencia =  this.route.snapshot.params['asistencia'];
  const queryParams = {
    origen: PAGE_ORIGEN.BANDEJA_CENTRO_TRABAJO,
    descripcionMes:row.descripcionMes,
    anio: new Date(this.form.value.anio).getFullYear()
  }
  console.log(queryParams);
    const queryParams_ = {
      origen: PAGE_ORIGEN.BANDEJA_CENTRO_TRABAJO,
      descripcionMes: row.descripcionMes,
      anio: new Date(this.form.value.anio).getFullYear()
  }
    this.router.navigate([row.idControlAsistencia,'detallado',], { relativeTo: this.route, queryParams});
  };


  handleVerReporteConsolidado = (row) => {
     // this.idControlAsistencia =  this.route.snapshot.params['asistencia'];
     const queryParams = {
      origen: PAGE_ORIGEN.BANDEJA_CENTRO_TRABAJO,
      descripcionMes:row.descripcionMes,
      anio: new Date(this.form.value.anio).getFullYear()
    }
  console.log(queryParams);
    const queryParams_ = {
      origen: PAGE_ORIGEN.BANDEJA_CENTRO_TRABAJO,
      descripcionMes: row.descripcionMes,
      anio: this.anio,
  }
    this.router.navigate([row.idControlAsistencia,'consolidado',], { relativeTo: this.route, queryParams});
  };

  handleSolicitarAprobacion =() =>{
    if (this.selection.selected.length === 0) {
      this.dataService.Message().msgWarning('Debe seleccionar como mínimo un registro de la grilla.', () => { });
      return;
    }
    const select = this.selection.selected.filter(row=>row.idEstado === EstadoControlAsistenciaMensualEnum.DEVUELTO_POR_COMPENSACIONES||
        row.idEstado === EstadoControlAsistenciaMensualEnum.REMITIDO_DENTRO_DE_PLAZO ||
        row.idEstado === EstadoControlAsistenciaMensualEnum.REMITIDO_FUERA_PLAZO ||
        row.idEstado === EstadoControlAsistenciaMensualEnum.SUBSANADO )
      console.log(this.selection.selected);
      console.log(select);
      const select_ = this.selection.selected.filter(row=>row.idEstado != EstadoControlAsistenciaMensualEnum.DEVUELTO_POR_COMPENSACIONES&&
        row.idEstado != EstadoControlAsistenciaMensualEnum.REMITIDO_DENTRO_DE_PLAZO &&
        row.idEstado != EstadoControlAsistenciaMensualEnum.REMITIDO_FUERA_PLAZO &&
        row.idEstado != EstadoControlAsistenciaMensualEnum.SUBSANADO);
      console.log(select_.length);
      console.log(select_);
      bloquear: false


      if(select_.length <= 0)
      {
      const data: any[] = [];
      this.selection.selected.forEach(element => {
          const ControlAsistencia = {
            idControlAsistencia : element.idControlAsistencia,
            idCentroTrabajo: element.idCentroTrabajo,         
            usuarioSolicitante : this.passport.numeroDocumento,  
            fechaModificacion: new Date(),
            fechaSolicitada: new Date()
           
          };
          data.push(ControlAsistencia);
      });
  
      const request = {
        controlesAsistencia: data
      };
      console.log(request);
  
      
      this.dataService.Message().msgConfirm(MESSAGE_ASISTENCIA.M80, () => {
          this.working = true;
          this.dataService.Spinner().show("sp6");
          this.dataService.Asistencia().SolicitarAprobacion(request).pipe(
              catchError((e) => of(e)),
              finalize(() => {
                  this.dataService.Spinner().hide("sp6")
                  this.working = false;
              })
          ).subscribe(response => {
              if (response && response.result) {
                  this.dataService.Message().msgInfo(MESSAGE_ASISTENCIA.M07, () => { this.handleGrid();});
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
    else {
      this.dataService.Message().msgWarning(MESSAGE_ASISTENCIA.M81, () => {this.selection.clear();  });
     
      return;
    }
    
  }
  

  //
  handleExportar() {
    if (!this.permisoPassport.hasPermisionExportar) {
      this.dataService.Message().msgWarning(PASSPORT_MESSAGE.BUTTON_UNAUTHORIZED, () => { });
      return;
    }

    if (this.filtroGrid) {
      console.log(this.filtroGrid);

      this.dataService.Spinner().show("sp6");
      this.dataService.Asistencia().exportarCentroTrabajo(this.filtroGrid).pipe(
        catchError((e) => of(e)),
        finalize(() => { this.dataService.Spinner().hide("sp6"); })
      ).subscribe((response: any) => {
        if (response) {
          console.log(response)
          saveAs(response, "Control de asistencia por centro de trabajo.xlsx");
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
  //
  
 
  customSelected() {
    this.dataSource.data.forEach(row => {
      if (row.idProcesoCentroTrabajo) {
        this.selection.select(row);
      }
    });
  }
                                                                                
  isAllSelected = () => {
    const numSelected = this.selection.selected.length;
    const data = this.dataSource.data;
    const numRows = data.filter(row => !row.bloquear).length;
    return numSelected === numRows;
  }
  
   masterToggle() {
    if (this.isAllSelected()) {
      if (!this.isDisabled) {
        this.selection.clear();
      }
    } else {
      this.dataSource.data.forEach(row => {
        if (!row.isDisabled) {
          this.selection.select(row);
        }
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
  

  
  handleDevolverReportes = (row) => {
    if (!this.permisoPassport.hasPermisionDevolver) {
      this.dataService.Message().msgWarning(PASSPORT_MESSAGE.BUTTON_UNAUTHORIZED, () => { });
      return;
    }
    this.dialogRef = this.materialDialog.open(ModalDevolverReportesComponent, {
      panelClass: 'app-modal-devolver-reportes',
      disableClose: true,
      data: {
        modal: {
          icon: "create",
          title: "Devolver reportes",
          action: "",
          info: row,
          editable: true
        },
        passport: this.passport
      }
    });

    this.dialogRef.afterClosed()
      .subscribe((result: any) => {
        if (result.working) {
          this.handleGrid();
        }
      });
  }

  handleVerMotivoDevolucion = (row) => {
    if (!this.permisoPassport.hasPermissionVerMotivo) {
      this.dataService.Message().msgWarning(PASSPORT_MESSAGE.BUTTON_UNAUTHORIZED, () => { });
      return;
    }
    this.dialogRef = this.materialDialog.open(ModalVerMotivoDevolucionComponent, {
      panelClass: 'app-modal-ver-motivo-devolucion',
      disableClose: true,
      data: {
        modal: {
          icon: "info",
          title: "Ver motivo de devolución",
          action: "",
          info: row,
          editable: false
        },
        passport: this.passport,
        tipo : TipoMotivoDevolucion.DETALLE_DEVOLUCION_ASISTENCIA
      }
    });

    this.dialogRef.afterClosed()
      .subscribe((response: any) => {
        if (!response) {
          return;
        }
      });
};

  // handleVerMotivoRechazo = (row) => {
  //   this.dialogRef = this.materialDialog.open(ModalVerMotivoDevolucionComponent, {
  //     panelClass: 'app-modal-ver-motivo-devolucion',
  //     disableClose: true,
  //     data: {
  //       modal: {
  //         icon: "info",
  //         title: "Ver motivo de rechazo",
  //         action: "",
  //         info: row,
  //         editable: false
  //       },
  //       passport: this.passport,
  //       tipo : TipoMotivoDevolucion.DETALLE_RECHAZO
  //     }
  //   });

  //   this.dialogRef.afterClosed()
  //     .subscribe((response: any) => {
  //       if (!response) {
  //         return;
  //       }
  //     });
    
  // }
  routeGenerator = (data: any): string => {
    const param = data.anio + "" +    
    (data.idMes + "").padStart(3,"0") +       
    (data.idControlAsistencia + "").padStart(3,"0") ;
    return param;
}
handleVerMotivoDevolucionRechazo = (row) => {
  if (!this.permisoPassport.hasPermissionVerMotivo) {
    this.dataService.Message().msgWarning(PASSPORT_MESSAGE.BUTTON_UNAUTHORIZED, () => { });
    return;
  }
  this.dialogRef = this.materialDialog.open(ModalVerMotivoDevolucionComponent,
      { 
          panelClass: 'app-modal-ver-motivo-devolucion',
          disableClose: true,
          data:{
            modal:{
                icon : "info",
                title : "Ver Motivo de rechazo",
                action : "",   
                info: row,                   
                editable: false
            },                   
            passport : this.passport,
            tipo : TipoMotivoDevolucion.DETALLE_RECHAZO          
          }
      });
      this.dialogRef.afterClosed()
      .subscribe((response: any) => {
        if (!response) {
          return;
        }
      });
}
handleVerMotivoDevolucionCompensaciones = (row) => {
  if (!this.permisoPassport.hasPermissionVerMotivo) {
    this.dataService.Message().msgWarning(PASSPORT_MESSAGE.BUTTON_UNAUTHORIZED, () => { });
    return;
  }
  this.dialogRef = this.materialDialog.open(ModalVerMotivoDevolucionComponent,
      { 
          panelClass: 'app-modal-ver-motivo-devolucion',
          disableClose: true,
          data:{
            modal:{
                icon : "info",
                title : "Ver Motivo de devolución",
                action : "",   
                info: row,                   
                editable: false
            },                   
            passport : this.passport,
            tipo : TipoMotivoDevolucion.DETALLE_DEVOLUCION_COMPENSACIONES            
          }
      });
      this.dialogRef.afterClosed()
      .subscribe((response: any) => {
        if (!response) {
          return;
        }
      });
}

  handleRegistrarAsistencia = (row:any) => {
    if (!this.permisoPassport.hasPermissionRegistrar) {
      this.dataService.Message().msgWarning(PASSPORT_MESSAGE.BUTTON_UNAUTHORIZED, () => { });
      return;
    }
    
    this.router.navigate([ row.idControlAsistencia , 'registrarasistencia'], { relativeTo: this.route });  
  };  
}



// handleLoadModalBusqueda = () => {
//   this.bandejaCentroTrabajoStore.modalBusquedaCentroTrabajoSource.asyncLoadComboDres();

//   this.dialogRef = this.materialDialog.open(
//       ModalBusquedaCentroTrabajoComponent,
//       {
//           panelClass: "modal-busqueda-centro-trabajo",
//       }
//   );

//   this.dialogRef.componentInstance.bandejaCentroTrabajoStore = this.bandejaCentroTrabajoStore;

//   this.dialogRef.afterClosed().subscribe((response: any) => {
//       this.bandejaCentroTrabajoStore.modalBusquedaCentroTrabajoSource.resetModalBusquedaCentroTrabajo();
//       if (response != undefined) {
//           this.form.patchValue({
//               codigoCentroTrabajo: response.codigoCentroTrabajo,
//           });
//       }
//   });
// };
