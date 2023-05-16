import {
    AfterViewInit,
    OnDestroy,
    OnInit,
    ViewEncapsulation,
    Component,
    ViewChild,
} from "@angular/core";
import { mineduAnimations } from "@minedu/animations/animations";
import { Router, ActivatedRoute } from "@angular/router";
import { saveAs } from 'file-saver';
import { CollectionViewer, DataSource, SelectionModel } from "@angular/cdk/collections";
import { TakeUntilDestroy } from "@minedu/functions/TakeUntilDestroy";
import { UtilService } from "app/core/data/services/util.service";
import { ReporteDetalladoMensualStore } from "../store/reporte-detallado-mensual.store";
import { CONTROL_RUTAS } from "app/main/apps/asistencia/control-asistencia/_utils/constants";
import { PAGE_ORIGEN } from "../../../_utils/constants";
import { MatPaginator } from "@angular/material/paginator";
import { catchError, finalize, tap } from "rxjs/operators";
import { BehaviorSubject, Observable, of } from "rxjs";
import { DataService } from "app/core/data/data.service";
import { ASISTENCIA_MESSAGE, SNACKBAR_BUTTON } from "app/core/model/messages-error";
import { FormBuilder } from "@angular/forms";
import { MatDialog } from "@angular/material/dialog";
import { MessageService } from "app/core/data/services/message.service";
import { SharedService } from "app/core/shared/shared.service";

@Component({
    selector: "app-reporte-detallado-mensual",
    templateUrl: "./reporte-detallado-mensual.component.html",
    styleUrls: ["./reporte-detallado-mensual.component.scss"],
    encapsulation: ViewEncapsulation.None,
    animations: mineduAnimations,
})

export class ReporteDetalladoMensualComponent
    implements OnInit, OnDestroy, AfterViewInit {

      _29: boolean = false;
      _30: boolean = false;
      _31: boolean = false;
      nombreCentroTrabajo:string;
       

    dataSource_1: ReporteDetalladoDataSource;
    selection = new SelectionModel<any>(false, []);  
    filtroGrid;
    displayedColumns: string[];

    // dataSource_2: ReporteDetalladoCabeceraDataSource;
    // selection_1 = new SelectionModel<any>(false, []);  

    @ViewChild("paginatorReporteDetallado")
    paginator: MatPaginator;
    selection_2 = new SelectionModel<any>(false, []);
    
    private origen: number = null;
    descripcionMes : string;
    anio: number;
    idMes: number;
    idControlAsistencia:any;
  
      cabecera: any = {
        _1:'_1' ,
        _2:'_2' ,
        _3:'_3' ,      
        _4:'_4' ,
        _5:'_5' ,
        _6:'_6' ,
        _7:'_7' ,
        _8:'_8' ,
        _9:'_9' ,
        _10:'_10' ,
        _11:'_11' ,
        _12:'_12' ,
        _13:'_13' ,
        _14:'_14' ,
        _15:'_15' ,
        _16:'_16' ,
        _17:'_17' ,
        _18:'_18' ,
        _19:'_19' ,
        _20:'_20' ,
        _21:'_21' ,
        _22: '_22' ,
        _23: '_23' ,
        _24: '_24' ,
        _25:  '_25' ,
        _26:  '_26' ,
        _27: '_27' ,
        _28: '_28' ,
        _29: '_29' ,
        _30:  '_30' ,
        _31: '_31' ,
      };
    
    constructor(
        private route: ActivatedRoute,
        private router: Router,
        private formBuilder: FormBuilder,
        private utilService: MessageService,
        private materialDialog: MatDialog,
        private sharedService: SharedService,
        private dataService: DataService )
      {
       
      }

    ngOnInit() {
      setTimeout(_ => this.buildShared());
        this.dataSource_1 = new ReporteDetalladoDataSource(this.dataService); 
        //this.dataSource_2 = new ReporteDetalladoCabeceraDataSource(this.dataService); 
        this.descripcionMes =this.route.snapshot.queryParams.descripcionMes;
        this.anio = this.route.snapshot.queryParams.anio;
        this.idMes= this.validarMes(this.descripcionMes);
        this.idControlAsistencia = this.route.snapshot.params['asistencia'];
        this.nombreCentroTrabajo = this.route.snapshot.queryParams.centroTrabajo;
        this.origen=this.route.snapshot.queryParams.origen;
        this.getCentroTrabajo();
        
        console.log(this.route.snapshot.queryParams.origen);
        //this.defaultGrid(); 

        const d = {
          idControlAsistencia : this.route.snapshot.params['asistencia'],
          mes : this.validarMes(this.descripcionMes),
          anio : this.route.snapshot.queryParams.anio
        }
        this.filtroGrid = d;
        const d_1 = {
         
          mes : this.validarMes(this.descripcionMes),
          anio : this.route.snapshot.queryParams.anio,
          idControlAsistencia :  this.route.snapshot.params['asistencia']
        }
       
        setTimeout(() => {  
            
          this.dataSource_1.load(d);       
          this.loadGridHeader(d_1);     
          
            this.paginator.showFirstLastButtons = true;
            this.paginator._intl.itemsPerPageLabel = "Filas por tabla";
            this.paginator._intl.nextPageLabel = "Siguiente página";
            this.paginator._intl.previousPageLabel = "Página anterior";
            this.paginator._intl.firstPageLabel = "Primera página";
            this.paginator._intl.lastPageLabel = "Última página";
        });
     
    }
    getCentroTrabajo():string {
      const origen = this.route.snapshot.queryParams.origen;
      console.log(origen);
      switch(origen)
      {
        case 2:
          return this.route.snapshot.queryParams.centroTrabajo;
          break;
        case 3:
          return this.route.snapshot.queryParams.centroTrabajo;
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
  
   
    loadGridHeader=(data:any)=>{
      this.dataService.Asistencia().getReporteDetalladoCabecera(data).pipe(
        catchError((e) => { return of(e); }),
        finalize(() => { this.dataService.Spinner().hide("sp6"); })
    ).subscribe((response: any) => {
      console.log("detallado cabecera");
      console.log(response);
        if (response && (response.data || []).length > 0) {
          console.log(response);
         this.cabecera=response.data[0];
         if(response.data[0]._29 !== null)
         {         
           this._29 = true;
         }
         if(response.data[0]._30 !== null)
         {        
          this._30 = true;
         }
         if(response.data[0]._31 !== null)
         {         
          this._31 = true;
         }
         
        
         this.defaultGrid();
         
        } else if (response && (response.statusCode === 422 || response.statusCode === 404)) {        
          this.dataService.Message().msgWarning(response.messages[0], () => { });
        } else {         
          this.dataService.Message().msgWarning('No se encontró información para los criterios de búsqueda ingresado', () => { });
        }
      }); 
    }
    buildShared() {
      this.sharedService.setSharedBreadcrumb("Reporte detallado de asistencia mensual");
      this.sharedService.setSharedTitle("Reporte detallado de asistencia mensual");
    }
  
    ngAfterViewInit() {
        // this.defaultGrid();
        // this.paginator.page
        //     .pipe(
        //         tap(() =>
        //             this.loadData(
        //                 this.paginator.pageIndex + 1,
        //                 this.paginator.pageSize
        //             )
        //         )
        //     )
        //     .subscribe();
    }

    defaultGrid() {
      const a = this._29;
      const b = this._30;
      const c = this._31;

      if(this._29 )
      {
        this.displayedColumns = [
          'registro',
          'numeroDocumentoIdentidad',
          'apellidosNombres',
          'descripcionRegimenLaboral',
          'descripcionCargo',
          'descripcionCondicionLaboral',
          'jornadaLaboral',
          '_1' ,
          '_2' ,
          '_3' ,
          '_4' ,
          '_5' ,
          '_6' ,
          '_7' ,
          '_8' ,
          '_9' ,
          '_10' ,
          '_11',
          '_12',
          '_13',
          '_14',
          '_15',
          '_16',
          '_17',
          '_18' ,
          '_19' ,
          '_20' ,
          '_21' ,
          '_22' ,
          '_23' ,
          '_24' ,
          '_25' ,
          '_26' ,
          '_27' ,
          '_28' ,
          '_29' ,
        ];
      }
     
      if(this._30)
      {
        this.displayedColumns = [
          'registro',
          'numeroDocumentoIdentidad',
          'apellidosNombres',
          'descripcionRegimenLaboral',
          'descripcionCargo',
          'descripcionCondicionLaboral',
          'jornadaLaboral',
          '_1' ,
          '_2' ,
          '_3' ,
          '_4' ,
          '_5' ,
          '_6' ,
          '_7' ,
          '_8' ,
          '_9' ,
          '_10' ,
          '_11',
          '_12',
          '_13',
          '_14',
          '_15',
          '_16',
          '_17',
          '_18' ,
          '_19' ,
          '_20' ,
          '_21' ,
          '_22' ,
          '_23' ,
          '_24' ,
          '_25' ,
          '_26' ,
          '_27' ,
          '_28' ,
          '_29' ,
          '_30' ,
        ];
      }

      if(this._31)
      {
        this.displayedColumns = [
          'registro',
          'numeroDocumentoIdentidad',
          'apellidosNombres',
          'descripcionRegimenLaboral',
          'descripcionCargo',
          'descripcionCondicionLaboral',
          'jornadaLaboral',
          '_1' ,
          '_2' ,
          '_3' ,
          '_4' ,
          '_5' ,
          '_6' ,
          '_7' ,
          '_8' ,
          '_9' ,
          '_10' ,
          '_11',
          '_12',
          '_13',
          '_14',
          '_15',
          '_16',
          '_17',
          '_18' ,
          '_19' ,
          '_20' ,
          '_21' ,
          '_22' ,
          '_23' ,
          '_24' ,
          '_25' ,
          '_26' ,
          '_27' ,
          '_28' ,
          '_29' ,
          '_30' ,
          '_31' ,
        ];
      }
    }

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
          case 'SEPTIEMBRE':
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

  


    ngOnDestroy(): void {}


    handleExportar = (): void => {

       this.dataService.Spinner().show("sp6");
        this.dataService.Asistencia().postReporteDetalladoPdf(this.filtroGrid)
          .pipe(
            catchError((e) => of(null)),
            finalize(() => this.dataService.Spinner().hide("sp6"))
          ).subscribe(response => {
            if (response) {
              saveAs(response, "Reporte_detallado.pdf");
            }
            else if (response && (response.statusCode === 422 || response.statusCode === 404)) {
              this.dataService.Message().msgWarning(response.messages[0], () => { });
            }
             else {
              this.dataService.Message().msgWarning('No se pudo descargar el reporte', () => { });
            }
          });  
    }
    
    handleImprimir(){     

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
        }
        if (this.origen == PAGE_ORIGEN.CONSOLIDADO_APROBACION) {
            this.fetchRetornarConsolidadoAprobacion();
        }
    };

    private fetchRetornarMensual = () => {
        this.router.navigateByUrl(CONTROL_RUTAS.RUTA_BANDEJA, {
            relativeTo: this.route,
        });
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

        const url = CONTROL_RUTAS.RUTA_BANDEJA; // + "/bandeja/servidor";

        this.router.navigate([url], { relativeTo: this.route, queryParams });
    };
    private fetchRetornarConsolidadoAprobacion = () => {
        const queryParams = {
            idControlAsistencia: this.route.snapshot.queryParams
                .idControlAsistencia,
            descripcionMes: this.route.snapshot.queryParams.descripcionMes,
            anio: this.route.snapshot.queryParams.anio,
        };

        const url = CONTROL_RUTAS.RUTA_CONSOLIDADO_APROBACION; // + "/bandeja/servidor";

        this.router.navigate([url], { relativeTo: this.route, queryParams });
    };
}


export class ReporteDetalladoDataSource extends DataSource<any>{

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
      this.dataService.Asistencia().getReporteDetallado(data).pipe(
          catchError(() => of([])),
          finalize(() => { this._loadingChange.next(false); this.dataService.Spinner().hide("sp6"); })
      ).subscribe((response: any) => {
        console.log('reporte detallado');
        console.log(response);
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
//   getReporteDetallado(params: any): Observable<any> {
//     getReporteDetalladoCabecera(params: any): Observable<any>
  
// export class ReporteDetalladoCabeceraDataSource extends DataSource<any>{

//     private _dataChange = new BehaviorSubject<any>([]);
//     private _totalRows = 0;
//     private _loadingChange = new BehaviorSubject<boolean>(false);
  
//     public loading = this._loadingChange.asObservable();
  
//     constructor(private dataService: DataService) {
//       super();
//     }
//     //     detalladocabecera([FromQuery] int mes, [FromQuery] int anio)
//     load(data: any) {
//       this._loadingChange.next(true);
//       this.dataService.Spinner().show("sp6");
//       this.dataService.Asistencia().getReporteDetalladoCabecera(data).pipe(
//           catchError((e) => { this.dataService.SnackBar().msgError( ASISTENCIA_MESSAGE.ASISTENCIA_MENSUAL, SNACKBAR_BUTTON.CLOSE); return of(e); }),
//           finalize(() => { this._loadingChange.next(false); this.dataService.Spinner().hide("sp6"); })
//       ).subscribe((response: any) => {
//         console.log('detallado cabecera');
//         console.log(response);
//           if (response && (response.data || []).length > 0) {
//             this._totalRows = (response.data[0] || [{ totalRegistro: 0 }]).totalRegistro;
//             this._dataChange.next(response.data || []);
//           } else if (response && (response.statusCode === 422 || response.statusCode === 404)) {
//             this._totalRows = 0;
//             this._dataChange.next([]);
//             this.dataService.Message().msgWarning(response.messages[0], () => { });
//           } else {
//             this._totalRows = 0;
//             this._dataChange.next([]);
//             this.dataService.Message().msgWarning('No se encontró información para los criterios de búsqueda ingresado', () => { });
//           }
//         });    
//     }
  
//     connect(collectionViewer: CollectionViewer): Observable<[]> {
//       return this._dataChange.asObservable();
//     }
  
//     disconnect(collectionViewer: CollectionViewer): void {
//       this._dataChange.complete();
//       this._loadingChange.complete();
//     }
  
//     get dataTotal(): any {
//       return this._totalRows;
//     }
  
//     get data(): any {
//       return this._dataChange.value || [];
//     }
//   }
  

  