import { Component, Inject, OnInit, ViewChild, ViewEncapsulation  } from '@angular/core';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
//import { CuadroHorasCentroTrabajoService } from 'app/core/data/services/cuadro-horas-centrotrabajo.service';
import { HttpErrorResponse } from '@angular/common/http';
//import { CuadroHorasProcesoService } from 'app/core/data/services/cuadro-horas-proceso.service';
import { FormBuilder, FormGroup } from '@angular/forms';
import { DataService } from 'app/core/data/data.service';
import { isArray } from 'lodash';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { CollectionViewer, DataSource, SelectionModel } from '@angular/cdk/collections';
import { MatPaginator } from '@angular/material/paginator';
import { mineduAnimations } from '../../../../../../../@minedu/animations/animations';
 
@Component({
  selector: 'servidorpublico-ver-detalles',
  templateUrl: './ver-detalles.component.html',
  styleUrls: ['./ver-detalles.component.scss'],
  encapsulation: ViewEncapsulation.None,
  animations: mineduAnimations,
})
export class VerDetallesComponent implements OnInit {

  dialogRef: any;
  procesoHeader: any = {};
  plazaHeader : any = {}

  form: FormGroup;

  displayedColumnsPendientesDistribuir: string[] = [
    'areaCurricular',
    'primero',
    'segundo',
    'tercero',
    'cuarto',
    'quinto',
    'total'
  ]

  displayComunsPlazasVacantes: string[] = [
    
    'codigoPlaza',
    'cargo',
    'areaCurricular',
    'tipoPlaza',
    'jornadaLaboral',
    'horasLectivas',
    'vigenciaInicio',
    'vigenciaFin',
    'acciones'
  ]
  displayedColumns: string[] = [
    "descripcionAreaCurricular",
    "primero",
    "segundo",
    "tercero",
    "cuarto",
    "quinto",
    "total"
 
  ];
  totalizado={
    totalHoraLectivas:0,
    totalHoraDistribuidas:0,
    totalHoraPendientes:0,
    totalPlazas:0
  }
  paramGlobal={
    idProceso:0,
    idEtapa:0,
    idCentroTrabajo:0,
    idInstitucionEducativa:0,
    idParametroInicial:0,
    idEtapaProceso:0
  }
  areasCurricularesUsadas: string;
  totalHoraLectivas:number;
  //dataSourcePendienteDistribucion: PendienteDistribucionDataSource | null;
  dataSource: PlazaCuadroHoraDataSource | null;
  servidor:any;
  selection = new SelectionModel<any>(false, []);
  @ViewChild(MatPaginator, { static: true })
  paginator: MatPaginator;
  constructor( public matDialogRef: MatDialogRef<VerDetallesComponent>,
    @Inject(MAT_DIALOG_DATA) private data: any,
  
    private formBuilder: FormBuilder,
    private dataService: DataService,
    ) { }

  ngOnInit(): void {
    this.paramGlobal=this.data.dataKey.dataInicial;
    this.servidor=this.data.dataKey.servidor;
  
    console.log("****paramGlobal****",this.paramGlobal);
    console.log("****dataKey****",this.data.dataKey);
    this.loadProcesoHeader();
 
    this.dataSource = new PlazaCuadroHoraDataSource(this.dataService);
    this.paginator.showFirstLastButtons = true;
    this.paginator._intl.itemsPerPageLabel = "Filas por tabla";
    this.paginator._intl.nextPageLabel = "Siguiente página";
    this.paginator._intl.previousPageLabel = "Página anterior";
    this.paginator._intl.firstPageLabel = "Primera página";
    this.paginator._intl.lastPageLabel = "Última página"; 
    this.paginator.pageSize=10;

    let request ={
      idPlazaCuadroHora:this.data.dataKey.servidor.idCuadroHoraServidorPublico  
    };
   
    this.dataSource.load(request, this.paginator.pageIndex + 1, this.paginator.pageSize,(response)=>{

  })
}

  
  loadProcesoHeader() {
    
    this.dataService.CuadroHoras().obtenerPlazaPorCodigo({
    codigoPlaza:  this.servidor.codigoPlaza
    }).subscribe(
      (response) => {
        console.log("obtenerPlazaPorCodigo",response)
        this.plazaHeader = response
      },
      (error: HttpErrorResponse) => {
        console.log(error);
      }
    )
  }
 
 

  handleCancel = () => {this.matDialogRef.close();}

   
}

export class PlazaCuadroHoraDataSource extends DataSource<any> {
  private _dataChange = new BehaviorSubject<any>([]);
  private _totalRows = 0;
  private _loadingChange = new BehaviorSubject<boolean>(false);

  public loading = this._loadingChange.asObservable();

  constructor(
    private dataService: DataService 
     
   ) {
    super();
  }

  load(data: any, pageIndex: number, pageSize: number,callback) {
    this._loadingChange.next(true);
    this.dataService.Spinner().show("sp6");
    
    data.paginaActual = pageIndex;
    data.tamanioPagina = pageSize;

    this.dataService.CuadroHoras().getPlazaHoraAsignadaDistribucionPaginado(data).pipe(
      catchError((e) => { return  this.configCatch(e);        }),
     // finalize(() => { })
    ).subscribe(
      (response) => {
        if (response) {
          
            this._totalRows = (response[0] || [{ totalRegistro: 0 }]).totalRegistro;
            this._loadingChange.next(false);
            this._dataChange.next(response || []);
            
            if(this._totalRows== undefined || this._totalRows==0){
              this.dataService.Util().msgWarning(("NO SE ENCONTRÓ INFORMACIÓN DE DISTRIBUCION DE HORAS DEL SERVIDOR PUBLICO ").toUpperCase(), () => { });
            }
            this.dataService.Spinner().hide("sp6");
            callback(true)
        } else {
          this._totalRows = 0;
          this._dataChange.next([]);
          this.dataService.Util().msgWarning("NO HAY REGISTROS PARA MOSTRAR", () => { });
          callback(false)
        }




        this._loadingChange.next(false);
        this.dataService.Spinner().hide("sp6");
      },
      (error: HttpErrorResponse) => {
        console.log(error);
        this._loadingChange.next(false);
        this.dataService.Spinner().hide("sp6");
      }
    )
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
  private configCatch(e: any) {
    if (e && e.status === 400 && isArray(e.error.messages)) {
      this.dataService.Util().msgWarning(e.error.messages[0], () => { });
    } else {
      this.dataService.Util().msgError('Error recuperando datos del servidor, por favor intente dentro de unos segundos, gracias.', () => { });
    }
    this.dataService.Spinner().hide("sp6");
    return of(e) 
  }
}