import {
    Component,
    OnInit,
    OnDestroy,
    ViewEncapsulation,
    AfterViewInit,
    ViewChild,
} from "@angular/core";
import { mineduAnimations } from "@minedu/animations/animations";
import { Router, ActivatedRoute } from "@angular/router";
import { saveAs } from 'file-saver';
import { ReporteConsolidadoMensualStore } from "../store/reporte-consolidado-mensual.store";
import { CollectionViewer, DataSource, SelectionModel } from "@angular/cdk/collections";
import { UtilService } from "app/core/data/services/util.service";
import { catchError, finalize, tap } from "rxjs/operators";
import { TakeUntilDestroy } from "@minedu/functions/TakeUntilDestroy";
import { CONTROL_RUTAS } from "app/main/apps/asistencia/control-asistencia/_utils/constants";
import { PAGE_ORIGEN } from "../../../_utils/constants";
import { MatPaginator } from "@angular/material/paginator";
import { BehaviorSubject, Observable, of } from "rxjs";
import { DataService } from "app/core/data/data.service";
import { ASISTENCIA_MESSAGE, PASSPORT_MESSAGE, SNACKBAR_BUTTON } from "app/core/model/messages-error";
import { SecurityModel } from "app/core/model/security/security.model";
import { CentroTrabajoModel } from "app/core/model/centro-trabajo.model";
import { FormBuilder } from "@angular/forms";
import { MatDialog } from "@angular/material/dialog";
import { MessageService } from "app/core/data/services/message.service";
import { SharedService } from "app/core/shared/shared.service";

@Component({
    selector: "app-reporte-consolidado-mensual",
    templateUrl: "./reporte-consolidado-mensual.component.html",
    styleUrls: ["./reporte-consolidado-mensual.component.scss"],
    encapsulation: ViewEncapsulation.None,
    animations: mineduAnimations,
})

export class ReporteConsolidadoMensualComponent
    implements OnInit, OnDestroy, AfterViewInit {
   // readonly state$ = this.store.select((s) => s);

    @ViewChild("paginatorReporteConsolidado")
    paginator: MatPaginator;
    selection = new SelectionModel<any>(false, []);
    private origen: number = null;
    dataSource: ReporteConsolidadoDataSource;
    nombreCentroTrabajo: string;
 
    filtroGrid: any;
    private passport: SecurityModel = new SecurityModel();
    centroTrabajo: CentroTrabajoModel = null;
    descripcionMes: any;
    anio: any;
    idControlAsistencia;
  

    constructor(
        private route: ActivatedRoute,
        private router: Router,
        private formBuilder: FormBuilder,
        private utilService: MessageService,
        private materialDialog: MatDialog,
        private sharedService: SharedService,
        private dataService: DataService
    ) { }

    handleCentroTrabajo() {
        this.dataService.Asistencia().findCentroTrabajo(
          this.passport.codigoSede
        ).pipe(
          catchError(() => { this.dataService.SnackBar().msgError(ASISTENCIA_MESSAGE.CENTRO_TRABAJO_ERROR, SNACKBAR_BUTTON.CLOSE); return of(null); }),
        ).subscribe(response => {
          if (response && response.result) {
            this.centroTrabajo = response.data;
          } else {
            this.centroTrabajo = null;
            this.dataService.Message().msgError('Error, no se pudo obtener el centro de trabajo del usuario. Ud. no podrá realizar algunas operaciones del proceso.', () => { });
          }
        });
    }
 	
    displayedColumns: string[] = [
        'registro',
        'numeroDocumentoIdentidad',
        'apellidosNombres',
        'descripcionRegimen',
        'descripcionCargo',
        'condicionLaboral',
        'jornadaLaboral',
        'horasTardanza',
        'minutosTardanza',
        'horasPermisoSinGoce',
        'minutosPermisoSinGoce',
        'totalInasistenciaInjustificada',
        'totalHuelgaParo',
        'totalLicenciaSinGoce',
        'sinIncidencias',
      ];
    


    ngOnInit(): void {  
      
      setTimeout(_ => this.buildShared());

        this.dataSource = new ReporteConsolidadoDataSource(this.dataService);    
        const d = {
          idControlAsistencia : this.route.snapshot.params['asistencia'],
          descripcionMes: this.route.snapshot.queryParams.descripcionMes,      
          anio: this.route.snapshot.queryParams.anio,
         }
       
      
      this.descripcionMes = this.route.snapshot.queryParams.descripcionMes;
      this.anio = this.route.snapshot.queryParams.anio;
      this.nombreCentroTrabajo = this.route.snapshot.queryParams.centroTrabajo;
      //this.getCentroTrabajo();
      console.log('this.nombreCentroTrabajo',this.nombreCentroTrabajo);
      this.origen = this.route.snapshot.queryParams.origen;
      console.log('this.route.snapshot.queryParams.origen',this.route.snapshot.queryParams.origen);
      this.idControlAsistencia =this.route.snapshot.params['asistencia']
      this.filtroGrid = d;
      console.log(d);
   
        setTimeout(() => {
          this.dataSource.load(d);
            this.paginator.showFirstLastButtons = true;
            this.paginator._intl.itemsPerPageLabel = "Filas por tabla";
            this.paginator._intl.nextPageLabel = "Siguiente página";
            this.paginator._intl.previousPageLabel = "Página anterior";
            this.paginator._intl.firstPageLabel = "Primera página";
            this.paginator._intl.lastPageLabel = "Última página";
        });
    }
  getCentroTrabajo() {
  
    const origen = this.route.snapshot.queryParams.origen;
    switch(origen)
    {
      case 2:
        this.nombreCentroTrabajo = this.route.snapshot.queryParams.centroTrabajo;
        break;
      case 3:
        this.nombreCentroTrabajo = this.route.snapshot.queryParams.centroTrabajo;
        break;
      case 4:
        return '';
        break;
      case 5:
        return '';
        break;
      case 6:
        return '';
        break;
    }
  }

  buildShared() {
    this.sharedService.setSharedBreadcrumb("Reporte consolidado de asistencia mensual");
     this.sharedService.setSharedTitle("Reporte consolidado de asistencia mensual");
  }

    ngAfterViewInit() {
    
    }
  
 
    ngOnDestroy(): void {}

    handleExportar = (): void => {

      this.dataService.Spinner().show("sp6");
      this.dataService.Asistencia().postReporteConsolidadoPdf(this.filtroGrid)
        .pipe(
          catchError((e) => of(null)),
          finalize(() => this.dataService.Spinner().hide("sp6"))
        ).subscribe(response => {
          if (response) {
            saveAs(response, "Reporte_consolidado.pdf");
          }
          else if (response && (response.statusCode === 422 || response.statusCode === 404)) {
            this.dataService.Message().msgWarning(response.messages[0], () => { });
          }
           else {
            this.dataService.Message().msgWarning('No se pudo descargar el reporte', () => { });
          }
        });     
      
    };

    handleImprimir()
    {
      window.print();
    }

    handleRetornar = () => {
    
        if (this.origen == PAGE_ORIGEN.BANDEJA_MENSUAL) {
            this.fetchRetornarMensual();
        }
        if (this.origen == PAGE_ORIGEN.BANDEJA_CENTRO_TRABAJO) {
            this.fetchRetornarCentroTrabajo();
        }
        if (this.origen == PAGE_ORIGEN.REGISTRO_ASISTENCIA) {
            this.fetchRetornarServidor();
            //this.fetchRetornarMensual();
        }
        if (this.origen == PAGE_ORIGEN.CONSOLIDADO_APROBACION) {
            this.fetchRetornarConsolidadoAprobacion();
        }
    };

    private fetchRetornarMensual = () => {

        this.router.navigateByUrl(CONTROL_RUTAS.RUTA_BANDEJA, {
            relativeTo: this.route,
        });
      //   const url = CONTROL_RUTAS.RUTA_BANDEJA;
      //   this.router.navigate([url], {
      //     relativeTo: this.route,
      // });
    };

    private fetchRetornarCentroTrabajo = () => {
 
        const queryParams = {
            idConsolidadoIged: this.route.snapshot.queryParams
                .idConsolidadoIged,
            descripcionMes: this.route.snapshot.queryParams.descripcionMes,
            anio: this.route.snapshot.queryParams.anio,
        };
        const url = CONTROL_RUTAS.RUTA_CENTRO; // + "/consolidado/centro-trabajo";
        this.router.navigate([url], { relativeTo: this.route, queryParams });
    };

    private fetchRetornarServidor = () => {
  
        const queryParams = {
            idControlAsistencia: this.route.snapshot.queryParams
                .idControlAsistencia,
            descripcionMes: this.route.snapshot.queryParams.descripcionMes,
            anio: this.route.snapshot.queryParams.anio,
        };

        const url = CONTROL_RUTAS.RUTA_BANDEJA // + "/bandeja/servidor";

        this.router.navigate([url], { relativeTo: this.route, queryParams });
    };

    private fetchRetornarConsolidadoAprobacion = () => {
        this.router.navigateByUrl(CONTROL_RUTAS.RUTA_CONSOLIDADO_APROBACION, {
            relativeTo: this.route,
        });
    };
    validarMes(descripcionMes: string): number {
        this.descripcionMes = this.route.snapshot.queryParams.descripcionMes;
        this.anio = this.route.snapshot.queryParams.anio;
        switch(this.descripcionMes)
        {
          case 'ENERO':
            return 1;
            break;
          case 'FEBRERO':
            return 2;
            break;
            case 'MARZO':
              return 3;
            break;
          case 'ABRIL':
            return 4;
            break;
            case 'MAYO':
              return 5;
            break;
          case 'JUNIO':
            return 6;
            break;
            case 'JULIO':
              return 7;
            break;
          case 'AGOSTO':
            return 8;
            break;
            case 'SETIEMBRE':
              return 9;
            break;
          case 'OCTUBRE':
            return 10;
            break;
            case 'NOVIEMBRE':
              return 11;
            break;
          case 'DICIEMBRE':
            return 12;
            break;
        
        }
      }
  
}

export class ReporteConsolidadoDataSource extends DataSource<any>{

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
      this.dataService.Asistencia().getReporteConsolidado(data.idControlAsistencia,data).pipe(
          catchError(() => of([])),
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


