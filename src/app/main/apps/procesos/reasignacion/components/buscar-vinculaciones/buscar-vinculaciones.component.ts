import { CollectionViewer, DataSource, SelectionModel } from '@angular/cdk/collections';
import { Component, Inject, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { ActivatedRoute, Router } from '@angular/router';
import { mineduAnimations } from '@minedu/animations/animations';
import { DataService } from 'app/core/data/data.service';
import { GlobalsService } from 'app/core/shared/globals.service';
import { SharedService } from 'app/core/shared/shared.service';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { catchError, finalize } from 'rxjs/operators';
import { MatTableDataSource } from '@angular/material/table';

@Component({
  selector: 'minedu-buscar-vinculaciones',
  templateUrl: './buscar-vinculaciones.component.html',
  styleUrls: ['./buscar-vinculaciones.component.scss'],
  encapsulation: ViewEncapsulation.None,
  animations: mineduAnimations,
})
export class BuscarVinculacionesComponent implements OnInit {
  icon = 'search';
  dialogTitle: string = 'Vinculaciones vigentes';
  grabajo = false;
  working = false;
  form: FormGroup; 
  
  idPersonaSeleccionado:0; 
  isMobile = false;
  selection = new SelectionModel<any>(true, []);

  getIsMobile(): boolean {
    const w = document.documentElement.clientWidth;
    const breakpoint = 992;
    if (w < breakpoint) {
        return true;
    } else {
        return false;
    }
  }

  dataSource: VinculacionesDataSource | null;
  request = {
    id_persona: null
  };

  paginatorPageSize = 10;
  paginatorPageIndex = 0;

  displayedColumns: string[] = [      
    'instancia',
    'subInstancia',
    'centroTrabajo',
    'modalidad',
    'nivelEducativo',
    'codigoPlaza',
    'tipoPlaza',
    'regimenLaboral',
    'cargo',
    'areaCurricular',
    'jornadaLaboral',
    'fechaInicio',
    'fechaFin'
  ];
  vinculaciones = [];
  private _loadingChangeVinculaciones = new BehaviorSubject<boolean>(false);
  loadingVinculaciones = this._loadingChangeVinculaciones.asObservable();
  dataSourceVinculaciones: MatTableDataSource<any>;
  selectionVinculaciones = new SelectionModel<any>(false, []);

  @ViewChild('paginator', { static: true }) 
  paginator: MatPaginator;

  constructor(
    public matDialogRef: MatDialogRef<BuscarVinculacionesComponent>,        
    @Inject(MAT_DIALOG_DATA) private data: any,
    private formBuilder: FormBuilder,
    private dataService: DataService,
    public globals: GlobalsService,
    private sharedService: SharedService, 
    private route: ActivatedRoute,
    private router: Router,
    private materialDialog: MatDialog
  ) { }

  ngOnInit(): void {
    // this.idPersonaSeleccionado = this.data.idPersonaSeleccionado;
    this.dataSource= new VinculacionesDataSource(this.dataService);
    this.loadData(1, 10);
  }

  setRequest = () => {
    this.request = {        
      id_persona: this.data.id_persona
    };
  }

  loadData(pageIndex, pageSize): void {
    // this.setRequest();
    // this.dataSource.load(
    //     this.request,
    //     1,//this.paginator.pageIndex + 1,
    //     10//this.paginator.pageSize
    // );
    this.vinculaciones = this.data.vinculaciones;
    this.dataSourceVinculaciones = new MatTableDataSource(this.data.vinculaciones);
  }

  selectedRow(row) {
    this.selection.clear();
    this.selection.toggle(row);
    return row;
  }

  handleCancel = () => {
    this.matDialogRef.close({ });
  }

  loadVinculaciones=(fistTime: boolean = false)=>{      
    this.setRequest();
    if (fistTime) {
        this.dataSource.load(this.request, 1, 10);
        
    } else {                 
        this.dataSource.load(
            this.request,
            this.paginator.pageIndex + 1,
            this.paginator.pageSize   
        );
    }
  }
  
}




export class VinculacionesDataSource extends DataSource<any>{

  private _dataChange = new BehaviorSubject<any>([]);
  private _loadingChange = new BehaviorSubject<boolean>(false);

  public loading = this._loadingChange.asObservable();
  public totalregistro = 0;

  constructor(private dataService: DataService) {
      super();
  }

  load(data: any, pageIndex, pageSize): void {
      this._loadingChange.next(false);
          this.dataService.AccionesVinculacion().getVinculacionesVigentes(data.id_persona)
          .pipe(
              catchError((e) => of(e)),
              finalize(() => this._loadingChange.next(false))
          ).subscribe((response: any) => {
              console.log('Buscar 102', response);
              //console.log('data del servicio--total ',response[0].totalregistro);
              //console.log('RESPONSE DATA SERVICIO ',response[0]);
              this._dataChange.next(response || []);
              // this.totalregistro = ((response || []).length === 0) ? 0 : response[0].totalregistro;
              
              if ((response || []).length === 0) {
                  this.dataService.Message().msgWarning('"NO SE ENCONTRÓ INFORMACIÓN DE VINCULACIÓN DE EL(LOS) SERVIDOR(ES) PARA LOS CRITERIOS DE BÚSQUEDA INGRESADOS."', () => { });
              }
              
              // if (response && response.result) {
              
              // } else if (response && response.statusCode === ResultadoOperacionEnum.NotFound) {
              //     this.dataService.Message().msgWarning(response.messages[0], () => { });
              // } else if (response && response.statusCode === ResultadoOperacionEnum.UnprocessableEntity) {
              //     this.dataService.Message().msgWarning(response.messages[0], () => { });
              // } else {
              //                         //this.dataService.Message().msgError('Ocurrieron algunos problemas al consultar la información, por favor intente dentro de unos segundos, gracias.', () => { });
              // }
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
      return this.totalregistro;
  }

  get data(): any {
      return this._dataChange.value || [];
  }
}