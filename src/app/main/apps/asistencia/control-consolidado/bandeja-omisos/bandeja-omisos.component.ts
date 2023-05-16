import { SelectionModel } from '@angular/cdk/collections';
import { Component, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { Router, ActivatedRoute } from '@angular/router';
import { mineduAnimations } from '@minedu/animations/animations';
import { DataService } from 'app/core/data/data.service';
import { saveAs } from 'file-saver';
import { MessageService } from 'app/core/data/services/message.service';
import { TablaProcesosConfiguracionAcciones } from 'app/core/model/action-buttons/action-types';
import { CentroTrabajoModel } from 'app/core/model/centro-trabajo.model';
import { ASISTENCIA_MESSAGE, SNACKBAR_BUTTON, CONFIGURACION_PROCESO_MESSAGE, PASSPORT_MESSAGE } from 'app/core/model/messages-error';
import { SecurityModel } from 'app/core/model/security/security.model';
import { buscarRolPassport } from 'app/core/model/types';
import { SharedService } from 'app/core/shared/shared.service';
import { PAGE_ORIGEN } from '../../control-asistencia/_utils/constants';
import { BuscarCentroTrabajoComponent } from 'app/main/apps/procesos/contratacion/components/buscar-centro-trabajo/buscar-centro-trabajo.component';
import { BehaviorSubject, of } from 'rxjs';
import { catchError, finalize, tap } from 'rxjs/operators';
import { EstadoControlConsolidadoEnum } from '../../control-asistencia/_utils/enum';
import { ModalDevolverReportesComponent } from '../modal-devolver-reportes/modal-devolver-reportes.component';


@Component({
  selector: 'minedu-omisos',
  templateUrl: './bandeja-omisos.component.html',
  styleUrls: ['./bandeja-omisos.component.scss'],
  encapsulation: ViewEncapsulation.None,
  animations: mineduAnimations
})
export class OmisosComponent implements OnInit {

  form: FormGroup;
  export: boolean = false;
  working: boolean = false;
  isDisabled : boolean = false;
  private modular: CentroTrabajoModel = null;
  isMobile: boolean = false;

  getIsMobile(): boolean {
    const w = document.documentElement.clientWidth;
    const breakpoint = 992;
    if (w < breakpoint) {
      return true;
    } else {
      return false;
    }
  }
  permisoPassport = {
    hasPermissionBuscar :  false,
    hasPermisionExportar:  false,
    hasPermissionVerMotivo : false,
    hasPermisionDevolver:  false,
    hasPermissionRegistrar :  false
  }
  private passport: SecurityModel = new SecurityModel();
  centroTrabajo: CentroTrabajoModel = null;
  filtroGrid: any = null;
  permisoVerCentroTrabajo: boolean = false;  
  filtro: any = null;

  now: any = new Date(new Date().setFullYear(new Date().getFullYear() + 1));

  textComboEstadoDefault = "Todos";
  textComboDefault = "Seleccionar";
  comboLists = {
    listEstadosControlConsolidado: [],
    listMeses: []   
  }; 

  private _loadingChange = new BehaviorSubject<boolean>(false);
  loading = this._loadingChange.asObservable();
  totalRegistros: number = 0;
  dataSource: MatTableDataSource<any> = new MatTableDataSource<any>();
  selection = new SelectionModel<any>(true, []);


  @ViewChild('paginatorOmisos', { static: true }) paginator: MatPaginator;

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
  

  
  estadoRemitidoFueraPlazoEnum = EstadoControlConsolidadoEnum.REMITIDO_FUERA_PLAZO;
  estadoRemitidoDentroPlazoEnum = EstadoControlConsolidadoEnum.REMITIDO_DENTRO_DE_PLAZO;
  estadoDevueltoEnum = EstadoControlConsolidadoEnum.DEVUELTO;
  estadoSubsanadoEnum = EstadoControlConsolidadoEnum.SUBSANADO;
  estadoAprobadoEnum = EstadoControlConsolidadoEnum.APROBADO;
  estadoPendienteEnum = EstadoControlConsolidadoEnum.PENDIENTE;
  estadoDevueltoCompensacionesEnum = EstadoControlConsolidadoEnum.DEVUELTO_POR_COMPENSACIONES;
  estadoPendienteAprobacionEnum = EstadoControlConsolidadoEnum.PENDIENTE_DE_APROBACION;
  estadoRechazadoEnum = EstadoControlConsolidadoEnum.RECHAZADO; 

  request = {       
    anio: null,
    idMes: null,
    codigoModular: null,
    idEstado: null,
   
  };

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
  ngOnDestroy(): void {
   
  }

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
        codigoCentroTrabajo: [null, Validators.maxLength(7)],
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
  this.permisoPassport.hasPermisionDevolver = this.dataService.Storage().tienePermisoAccion(TablaProcesosConfiguracionAcciones.Modificar);
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
      catchError(() => { this.dataService.SnackBar().msgError(ASISTENCIA_MESSAGE.CENTRO_TRABAJO_ERROR , SNACKBAR_BUTTON.CLOSE); return of(null); }),
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
  const data: any[] = [];
  this.dataService.Asistencia().listarEstadoAsistenciaMensual().pipe(
    catchError(() => { this.dataService.SnackBar().msgError(CONFIGURACION_PROCESO_MESSAGE.TIPOS_PROCESO, SNACKBAR_BUTTON.CLOSE); return of(null); }),
    finalize(() => { })
  ).subscribe((response: any) => {
    if (response && response.result) {
      this.comboLists.listEstadosControlConsolidado = response.data.filter(a=>a.idCatalogoItem == 35 || a.idCatalogoItem == 50);
    } else {
      this.comboLists.listEstadosControlConsolidado = [];
    }
    this.form.patchValue({ idEstado: "-1" });
  });
}
defaultComboListMeses() {

  this.dataService.Asistencia().getMeses().pipe(
    catchError(() => { this.dataService.SnackBar().msgError(CONFIGURACION_PROCESO_MESSAGE.TIPOS_PROCESO, SNACKBAR_BUTTON.CLOSE); return of(null); }),
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
  console.log(form);
  if (
    (form.anio|| parseInt(form.anio) > 0) ||
    (form.idMes || parseInt(form.idMes) > 0) ||
    (form.idEstado || parseInt(form.idEstado) > 0))
    {
      
      const d = {
        anio: new Date(form.anio).getFullYear(), 
        idMes: form.idMes,
        idEstado : form.idEstado,       
        codigoCentroTrabajo: this.centroTrabajo?.codigoCentroTrabajo
      }
      this.filtroGrid = d;
      this._loadingChange.next(true);
      this.dataService.Asistencia().getBandejaOmisos(d,(this.paginator.pageIndex + 1), this.paginator.pageSize).pipe(
        catchError((e) => of(e)),
          finalize(() => { this._loadingChange.next(false); this.dataService.Spinner().hide('sp6'); })
      ).subscribe((response: any) => {
        console.log(response);
        if (response && (response.data || []).length > 0) {
          this.dataSource = new MatTableDataSource(response.data || []);
          this.totalRegistros = (response.data[0] || [{ totalRegistro: 0 }]).totalRegistro;
          this.customSelected();
        } else {
          this.totalRegistros = 0;
          this.dataSource = new MatTableDataSource([]);
          this.dataService.Message().msgWarning('No se encontró información para los criterios de búsqueda ingresados.', () => { });
        }
      }); 

     
    }
    else{
      this.dataService.Message().msgWarning('Debe ingresar por lo menos un criterio de búsqueda.', () => { });
    }

 }
 
cargarOmisos(data:any,pageIndex:any,pageSize:any)
{
  this.dataService.Spinner().show('sp6');
  this.selection.clear();
  this._loadingChange.next(true);
  this.dataService.Asistencia().getBandejaOmisos(data,(this.paginator.pageIndex + 1), this.paginator.pageSize).pipe(
    catchError((e) => of(e)),
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
ngAfterViewInit() {
  this.paginator.page
    .pipe(
      tap(() => this.handleGrid())
    )
    .subscribe();
}

  handleLimpiar =() =>{
   
    this.form.get("anio").setValue(new Date().getFullYear()); 
    this.form.get("idMes").setValue(-1); 
    this.form.get("codigoCentroTrabajo").setValue(""); 
    this.form.get("idEstado").setValue(-1); 
  }

  handleBuscar =(form) =>{
    if (!this.permisoPassport.hasPermissionBuscar) {
      this.dataService.Message().msgWarning(PASSPORT_MESSAGE.BUTTON_UNAUTHORIZED, () => { });
      return;
    }
    this.handleGrid(); 
   
  }


  handleVerReporteDetallado = (row) => {
    const queryParams = {
      origen: PAGE_ORIGEN.BANDEJA_OMISOS,
      descripcionMes: row.descripcionMes,
      anio: new Date(this.form.value.anio).getFullYear()
  }
    this.router.navigate([row.idControlAsistencia,'detallado',], { relativeTo: this.route, queryParams});
  };


  handleVerReporteConsolidado = (row) => {
    const queryParams = {
      origen: PAGE_ORIGEN.BANDEJA_OMISOS,
      descripcionMes: row.descripcionMes,
      anio: new Date(this.form.value.anio).getFullYear()
  }
    this.router.navigate([row.idControlAsistencia,'consolidado',], { relativeTo: this.route, queryParams});
  };



  handleExportar() {
    if (!this.permisoPassport.hasPermisionExportar) {
      this.dataService.Message().msgWarning(PASSPORT_MESSAGE.BUTTON_UNAUTHORIZED, () => { });
      return;
    }

    if (this.filtroGrid) {
      console.log(this.filtroGrid);

      this.dataService.Spinner().show("sp6");
      this.dataService.Asistencia().exportarOmisos(this.filtroGrid).pipe(
      catchError((e) => { this.dataService.SnackBar().msgError(ASISTENCIA_MESSAGE.EXPORTAR_ASISTENCIA_CONSOLIDADO, SNACKBAR_BUTTON.CLOSE); return of(e); }),
        finalize(() => { this.dataService.Spinner().hide("sp6"); })
      ).subscribe((response: any) => {
        if (response) {
          console.log(response)
          saveAs(response, "Omisos-Remitidos fuera del plazo.xlsx");
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
  

 
 
  routeGenerator = (data: any): string => {
    const param = data.anio + "" +    
    (data.idMes + "").padStart(3,"0") +       
    (data.idControlAsistencia + "").padStart(3,"0") ;
    return param;
}
handleRegistrarAsistencia = (row:any) => {
    
  this.router.navigate([ row.idControlAsistencia , 'registrarasistencia'], { relativeTo: this.route });  
};    
 
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
    .subscribe((response: any) => {
      if (!response) {
        return;
      }
    });
}
}


