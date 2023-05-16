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

@Component({
  selector: 'minedu-buscar-sancion-administrativa',
  templateUrl: './buscar-sancion-administrativa.component.html',
  styleUrls: ['./buscar-sancion-administrativa.component.scss'],
  encapsulation: ViewEncapsulation.None,
  animations: mineduAnimations,
})
export class BuscarSancionAdministrativaComponent implements OnInit {

  icon = 'search';
  dialogTitle: string = 'Sanciones Administrativas';
  grabajo = false;
  working = false;
  form: FormGroup; 
  
  idPersonaSeleccionado:0; 
  isMobile = false;
  selection = new SelectionModel<any>(true, []);

  tipoSancion = 0;
  idRegimenLaboral = 0;
  mensajeSancion = "";

  getIsMobile(): boolean {
    const w = document.documentElement.clientWidth;
    const breakpoint = 992;
    if (w < breakpoint) {
        return true;
    } else {
        return false;
    }
  }

  dataSource: SancionAdministrativaDataSource | null;
  request = {
    idTipoDocumentoIdentidad: 1,
    numeroDocumentoIdentidad: '',
    tipoSancion: 0,
    idRegimenLaboral: 0
  };

  paginatorPageSize = 10;
  paginatorPageIndex = 0;

  displayedColumns: string[] = [      
    'nro',
    'tipoSancion',
    'numeroResolucion',
    'fechaInicioSancion',
    'fechaFinSancion',
    'diasSancion',
    'estadoSancion'
  ];



  @ViewChild('paginator', { static: true }) 
  paginator: MatPaginator;
  
  constructor(
    public matDialogRef: MatDialogRef<BuscarSancionAdministrativaComponent>,        
    @Inject(MAT_DIALOG_DATA) private data: any,
    private formBuilder: FormBuilder,
    private dataService: DataService,
    public globals: GlobalsService,
    private sharedService: SharedService, 
    private route: ActivatedRoute,
    private router: Router,
    private materialDialog: MatDialog
  ) { }


  persona: any = {};
 
  


  ngOnInit(): void {
    // this.idPersonaSeleccionado = this.data.idPersonaSeleccionado;
    debugger
    this.persona = this.data.persona;
    this.request.idTipoDocumentoIdentidad = this.data.id_tipo_documento; //this.form.get('idTipoDocumentoIdentidad').value,
    this.request.numeroDocumentoIdentidad = this.data.numero_documento; 
    this.tipoSancion = this.data.tipoSancion;
    this.mensajeSancion = this.data.mensajeSancion;
    this.idRegimenLaboral = this.data.idRegimenLaboral;
    this.dataSource= new SancionAdministrativaDataSource(this.dataService);
    this.loadData(1, 10);
    
  }

  setRequest = () => {
    this.request = {        
      idTipoDocumentoIdentidad: this.request.idTipoDocumentoIdentidad,//this.idPersonaSeleccionado,
      numeroDocumentoIdentidad: this.request.numeroDocumentoIdentidad, //'46287964'
      tipoSancion: this.tipoSancion,
      idRegimenLaboral: this.idRegimenLaboral
    };
  }

  loadData(pageIndex, pageSize): void {
    this.setRequest();
    this.dataSource.load(
        this.request
    );
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
        this.dataSource.load(this.request);
        
    } else {                 
        this.dataSource.load(
            this.request
        );
    }
  }

}



export class SancionAdministrativaDataSource extends DataSource<any>{

  private _dataChange = new BehaviorSubject<any>([]);
  private _loadingChange = new BehaviorSubject<boolean>(false);

  public loading = this._loadingChange.asObservable();
  public totalregistro = 0;

  constructor(private dataService: DataService) {
      super();
  }

  // load(data: any, pageIndex, pageSize): void {
  load(data: any): void {
      this._loadingChange.next(false);
          this.dataService.AccionesVinculacion().getSancionesAdministrativas(data)
          .pipe(
              catchError((e) => of(e)),
              finalize(() => this._loadingChange.next(false))
          ).subscribe((response: any) => {
              console.log('Buscar Adjudicaciones', response);
              //console.log('data del servicio--total ',response[0].totalregistro);
              //console.log('RESPONSE DATA SERVICIO ',response[0]);
              this._dataChange.next(response || []);
              // this.totalregistro = ((response || []).length === 0) ? 0 : response[0].totalregistro;
              
              if ((response || []).length === 0) {
                  this.dataService.Message().msgWarning('No se encontró información de adjudicaciones de el(los) servidor(es) para los criterios de búsqueda ingresados.', () => { });
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