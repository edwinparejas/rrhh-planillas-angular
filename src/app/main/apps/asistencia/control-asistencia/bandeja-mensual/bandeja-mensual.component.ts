import {
    Component,
    OnInit,
    OnDestroy,
    ViewEncapsulation,
    AfterViewInit,
    ViewChild,
} from "@angular/core";
import { TablaProcesosConfiguracionAcciones } from 'app/core/model/action-buttons/action-types';
import { MatPaginator } from '@angular/material/paginator';
import { mineduAnimations } from "@minedu/animations/animations";
import { SelectionModel, DataSource, CollectionViewer } from "@angular/cdk/collections";
import { Router, ActivatedRoute } from "@angular/router";
import { CONTROL_ASISTENCIA_MESSAGES, MESSAGE_ASISTENCIA } from "../_utils/messages";
import { TakeUntilDestroy } from "@minedu/functions/TakeUntilDestroy";
import { EstadoControlAsistenciaMensualEnum, TipoMotivoDevolucion } from "../_utils/enum";
import { MatDialog } from "@angular/material/dialog";
import { CONTROL_RUTAS, PAGE_ORIGEN } from "../_utils/constants";
import { CentroTrabajoModel } from 'app/core/model/centro-trabajo.model';
import { SharedService } from 'app/core/shared/shared.service';
import { SecurityModel } from 'app/core/model/security/security.model';
import { MessageService } from 'app/core/data/services/message.service';
import { ASISTENCIA_MESSAGE, PASSPORT_MESSAGE, SNACKBAR_BUTTON } from 'app/core/model/messages-error';
import { BehaviorSubject, of, Observable, pipe } from 'rxjs';
import { buscarRolPassport, ResultadoOperacionEnum, TablaRolPassport } from 'app/core/model/types';
import { saveAs } from 'file-saver';
import { DataService } from 'app/core/data/data.service';
import { ModalVerMotivoDevolucionComponent } from "../modal-ver-motivo-devolucion/modal-ver-motivo-devolucion.component";
import { catchError, finalize } from "rxjs/operators";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { MatTableDataSource } from "@angular/material/table";

@Component({
    selector: "app-bandeja-mensual",
    templateUrl: "./bandeja-mensual.component.html",
    styleUrls: ["./bandeja-mensual.component.scss"],
    encapsulation: ViewEncapsulation.None,
    animations: mineduAnimations,
})
export class BandejaMensualComponent
    implements OnInit, OnDestroy, AfterViewInit {
    form: FormGroup;
    export: boolean = false;
    working: boolean = false;
    filtro: any = null;
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
        hasPermissionRegistrar : false,
        hasPermisionRemitir:  false,
        hasPermissionVerDevolucion :  false
    }

    private passport: SecurityModel = new SecurityModel();
    centroTrabajo: CentroTrabajoModel = null;
    filtroGrid: any = null;
    permisoVerAsistencia: boolean = false;  
    anio : number;
  
    now = new Date(new Date().setFullYear(new Date().getFullYear()));
    now_ = new Date(new Date().setFullYear(new Date().getFullYear() + 1))
    dialogRef: any;
    displayedColumns: string[] = [    
        'index',
        'descripcionMes',
        'descripcion',
        'estadoControlAsistencia',
        'fechaRemitida',
        'fechaDevuelta',
        'fechaAprobada',       
        'acciones'
      ];

      dataSource: AsistenciaDataSource | null;
      selection = new SelectionModel<any>(false, []);  

    estadoRemitidoFueraPlazoEnum = EstadoControlAsistenciaMensualEnum.REMITIDO_FUERA_PLAZO;
    estadoRemitidoDentroPlazoEnum = EstadoControlAsistenciaMensualEnum.REMITIDO_DENTRO_DE_PLAZO;
    estadoDevueltoEnum = EstadoControlAsistenciaMensualEnum.DEVUELTO;
    estadoSubsanadoEnum = EstadoControlAsistenciaMensualEnum.SUBSANADO;
    estadoAprobadoEnum = EstadoControlAsistenciaMensualEnum.APROBADO;
    estadoPendienteEnum = EstadoControlAsistenciaMensualEnum.PENDIENTE;
    estadoDevueltoCompensacionesEnum = EstadoControlAsistenciaMensualEnum.DEVUELTO_POR_COMPENSACIONES;
    estadoCerradoEnum = EstadoControlAsistenciaMensualEnum.CERRADO;
   
    constructor(
      
        private route: ActivatedRoute,
        private router: Router,
        private formBuilder: FormBuilder,
        private utilService: MessageService,
        private materialDialog: MatDialog,
        private sharedService: SharedService,
        private dataService: DataService) { }

    ngOnInit(): void {
        setTimeout(_ => this.buildShared());
        this.buildForm();
        //this.default();
        this.buildPassport();
        this.defaultPermisoPassport();
        this.defaultGrid();
    
        this.route.data.subscribe((data) => {
            if (data) {
              this.permisoVerAsistencia = buscarRolPassport(this.passport.codigoRol);             
              this.handleCentroTrabajo();
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
       
    }

    buildShared() {
        this.sharedService.setSharedBreadcrumb("Control de Asistencia mensual");
        this.sharedService.setSharedTitle("Control de asistencia mensual");
    }


    buildForm() {
        this.form = this.formBuilder.group({
            codigoCentroTrabajo: [null, Validators.maxLength(7)],
            fechaAsistencia: [null],
            anio:null
        });

       
    }

    buildPassport() {
        this.passport = this.dataService.Storage().getInformacionUsuario();
        console.log(this.passport);
    }
    // default() {
    //     this.form.patchValue({ fechaAsistencia: now_ });
    // }

    defaultPermisoPassport() {
        this.permisoPassport.hasPermissionBuscar = this.dataService.Storage().tienePermisoAccion(TablaProcesosConfiguracionAcciones.Consultar);
        this.permisoPassport.hasPermisionExportar = this.dataService.Storage().tienePermisoAccion(TablaProcesosConfiguracionAcciones.Exportar);
        this.permisoPassport.hasPermissionRegistrar = this.dataService.Storage().tienePermisoAccion(TablaProcesosConfiguracionAcciones.Modificar);
        this.permisoPassport.hasPermisionRemitir = this.dataService.Storage().tienePermisoAccion(TablaProcesosConfiguracionAcciones.Derivar);
        this.permisoPassport.hasPermissionVerDevolucion = this.dataService.Storage().tienePermisoAccion(TablaProcesosConfiguracionAcciones.Consultar);
    }
    defaultGrid() {
        this.dataSource = new AsistenciaDataSource(this.dataService);
    }

    handleCentroTrabajo() {
        this.dataService.Asistencia().findCentroTrabajo(this.passport.codigoSede).pipe(
          catchError((e) => of(e)),
          ).subscribe(response => {
            console.log(response);
            if (response && response.result) {
              this.centroTrabajo = response.data;
            } else {
              this.centroTrabajo = null;
              this.dataService.Message().msgError('Error, no se pudo obtener el centro de trabajo asociado al usuario.', () => { });
            }
          });
    }   
   
    handleGrid() {
        const form = this.form.value;
        console.log(form);
        if (form.anio)            
        {
          const d = {
            anio: new Date(form.anio).getFullYear(),                                   
            codigoCentroTrabajo: this.centroTrabajo?.codigoCentroTrabajo
          }
          this.filtroGrid = d;
          console.log(d);
          this.dataSource.load(d);
        }
         else {
          this.dataService.Message().msgWarning('Debe ingresar por lo menos un criterio de búsqueda.', () => { });
        }
     }

     handleLimpiar() {
       // this.default();
        this.form.patchValue({ anio: this.now, fechaAsistencia: null });
        
     }
     handleBuscar(form) {
        if (!this.permisoPassport.hasPermissionBuscar) {
            this.dataService.Message().msgWarning(PASSPORT_MESSAGE.BUTTON_UNAUTHORIZED, () => { });
            return;
          }
          this.handleGrid(); 
     }

     handleExportar() {
        if (!this.permisoPassport.hasPermisionExportar) {
          this.dataService.Message().msgWarning(PASSPORT_MESSAGE.BUTTON_UNAUTHORIZED, () => { });
          return;
        }
        if (this.filtroGrid) {
          console.log(this.filtroGrid);

          this.dataService.Spinner().show("sp6");
          this.dataService.Asistencia().exportarAsistenciaMensual(this.filtroGrid).pipe(
            catchError((e) => of(e)),
            finalize(() => { this.dataService.Spinner().hide("sp6"); })
          ).subscribe((response: any) => {
            if (response) {
              console.log(response)
              saveAs(response, "Control de Asistencia mensual.xlsx");
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
 
    
    ngOnDestroy(): void {
        //throw new Error("Method not implemented.");
    }

    handleEnviarReportes = (row) => {
       
      if (!this.permisoPassport.hasPermisionRemitir) {
        this.dataService.Message().msgWarning(PASSPORT_MESSAGE.BUTTON_UNAUTHORIZED, () => { });
        return;
      }

        const request = {
            idControlAsistencia: row.idControlAsistencia,
            usuarioCreacion: this.passport.numeroDocumento,
            idEstado: row.idEstado,
            codigoCentroTrabajo : this.centroTrabajo.codigoCentroTrabajo,
            idMes : row.idMes,
            anio : row.anio,
        };
        const resultMessage = 'Operación realizada de forma exitosa.';
        this.dataService.Message().msgSend(CONTROL_ASISTENCIA_MESSAGES.CONFIRM_SEND_REPORTE, () => {
            this.working = true;
            this.dataService.Spinner().show("sp6");
            this.dataService.Asistencia().remitirReportes(request).pipe(
                catchError((e) => of(e)),
                finalize(() => {
                    this.dataService.Spinner().hide("sp6")
                    this.working = false;
                })
            ).subscribe(response => {
                if (response && response.result) {
                    this.dataService.Message().msgInfo(resultMessage, () => { 
                         
                    });  
                    this.handleGrid();              
                } else if (response && response.statusCode === ResultadoOperacionEnum.NotFound) {
                    this.dataService.Message().msgWarning(response.messages[0], () => { });
                } else if (response && response.statusCode === ResultadoOperacionEnum.UnprocessableEntity) {
                    this.dataService.Message().msgWarning(response.messages[0], () => { });
                } else {
                    this.dataService.Message().msgError('Ocurrieron algunos problemas ', () => { });
                }
            });
        });
    
    }  


    handleVerReporteDetallado = (row) => {
      const queryParams = {
        origen: PAGE_ORIGEN.BANDEJA_MENSUAL,
        descripcionMes: row.descripcionMes,
        anio: new Date(this.form.value.anio).getFullYear(),
        centroTrabajo: this.passport.nombreSede,
      }
      console.log(this.passport.nombreSede);
      this.router.navigate([row.idControlAsistencia,'detallado',], { relativeTo: this.route, queryParams});
    };


    handleVerReporteConsolidado = (row) => {
      const queryParams = {
        origen: PAGE_ORIGEN.BANDEJA_MENSUAL,
        descripcionMes: row.descripcionMes,
        anio: new Date(this.form.value.anio).getFullYear(),
        centroTrabajo: this.passport.nombreSede,
    }
    console.log(this.passport.nombreSede);
      this.router.navigate([row.idControlAsistencia,'consolidado',], { relativeTo: this.route, queryParams});
    };


    handleVerMotivoDevolucion = (row) => {
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
                  tipo: TipoMotivoDevolucion.DETALLE_DEVOLUCION_ASISTENCIA             
                }
            });
            this.dialogRef.afterClosed()
            .subscribe((response: any) => {
              if (!response) {
                return;
              }
            });
            this.handleGrid();
    }
      
    routeGenerator = (data: any): string => {
      const param = data.anio + "" +    
      (data.idMes + "").padStart(3,"0") +       
      (data.idControlAsistencia + "").padStart(3,"0") ;
      return param;
  }
    handleRegistrarAsistencia = (row:any) => {   
      if (!this.permisoPassport.hasPermissionRegistrar) {
        this.dataService.Message().msgWarning(PASSPORT_MESSAGE.BUTTON_UNAUTHORIZED, () => { });
        return;
      }
      const queryParams = {
        origen: PAGE_ORIGEN.BANDEJA_MENSUAL,
        descripcionMes: row.descripcionMes,
        anio: new Date(this.form.value.anio).getFullYear(),
    }   
      this.dataService.Spinner().show("sp6");
      this.dataService.Asistencia().getEstadoRegistroAsistencia(row.idControlAsistencia).pipe(
        catchError((e) => of(e)),
        finalize(() => { this.dataService.Spinner().hide("sp6"); })
      ).subscribe((response: any) => {
        console.log(response);
        if (response && response.data != null) {
          const data = response.data;        
          this.router.navigate([row.idControlAsistencia ,'registrarasistencia'], { relativeTo: this.route, queryParams});     
        } else {
          console.log(response);
          if(response.data == null)
          {
            console.log(response);
            this.dataService.Message().msgWarning(MESSAGE_ASISTENCIA.M01, () => { });
          }
          
        }
      });
      //
     
        
    };     
}

export class AsistenciaDataSource extends DataSource<any>{

  private _dataChange = new BehaviorSubject<any>([]);
  private _totalRows = 0;
  private _loadingChange = new BehaviorSubject<boolean>(false);

  public loading = this._loadingChange.asObservable();

  constructor(private dataService: DataService) {
    super();
  }
  load(data: any) {
    this._loadingChange.next(true);
    this.dataService.Spinner().show("sp6");
    this.dataService.Asistencia().getAsistenciaMensual(data).pipe(
      catchError((e) => of(e)),
        finalize(() => { this._loadingChange.next(false); this.dataService.Spinner().hide("sp6"); })
    ).subscribe((response: any) => {
        if (response && (response.data || []).length > 0) {
          this._totalRows = (response.data[0] || [{ totalRegistro: 0 }]).totalRegistro;
          this._dataChange.next(response.data || []);
        } else if (response && (response.statusCode === 422 || response.statusCode === 404)) {
          this._totalRows = 0;
          this._dataChange.next([]);
          this.dataService.Message().msgWarning(response.messages[0], () => { });
        } else {
          this._totalRows = 0;
          this._dataChange.next([]);
          this.dataService.Message().msgWarning('No se encontró información para los criterios de búsqueda ingresado', () => { });
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

