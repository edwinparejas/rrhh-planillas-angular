import { Component, OnInit, ViewEncapsulation, AfterViewInit, ViewChild, Inject } from '@angular/core';
import { mineduAnimations } from '@minedu/animations/animations';
import { FormGroup, FormBuilder } from '@angular/forms';
import { SelectionModel, CollectionViewer } from '@angular/cdk/collections';
import { MatPaginator } from '@angular/material/paginator';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { DataService } from 'app/core/data/data.service';
import { tap, catchError, finalize } from 'rxjs/operators';
import { DataSource } from '@angular/cdk/table';
import { BehaviorSubject, of, Observable } from 'rxjs';

@Component({
  selector: 'minedu-buscar-vinculacion',
  templateUrl: './buscar-vinculacion.component.html',
  styleUrls: ['./buscar-vinculacion.component.scss'],
  encapsulation: ViewEncapsulation.None,
  animations: mineduAnimations
})
export class BuscarVinculacionComponent implements OnInit, AfterViewInit {
  form: FormGroup;  
  listVinculacion: vinculacionModel[] = [];

  displayedColumns: string[] = [
    'regimenLaboral',
    'condicionLaboral',
    'centroTrabajo',
    'codigoPlaza',
    'jornadaLaboral',
    'modalidad',
    'nivelEducativo',
    'areaCurricular',
  ];

  dataSource: VinculacionDataSource | null;
  selection = new SelectionModel<any>(false, []);
  @ViewChild(MatPaginator, { static: true })
  paginator: MatPaginator;

  constructor(
    public matDialogRef: MatDialogRef<BuscarVinculacionComponent>,
    @Inject(MAT_DIALOG_DATA) private data: any,
    private formBuilder: FormBuilder,
    private dataService: DataService
  ) { }

  ngOnInit(): void {
    this.buildData();
    this.dataSource = new VinculacionDataSource(this.dataService, this.paginator);
    this.buildData();
    this.loadVinculacion(); 
  }

  buildData() {
    this.listVinculacion = [];
    for (var val of this.data.data) {
      let vinculacion = new vinculacionModel();
      vinculacion.idRegimenLaboral = val.idRegimenLaboral;
      vinculacion.regimenLaboral = val.descripcionRegimenLaboral;
      vinculacion.condicionLaboral = 'NOMBRADO';
      vinculacion.centroTrabajo = 'I.E. MIGUEL GRAU SEMINARIO	';
      vinculacion.codigoPlaza = '43645SAXD32';
      vinculacion.jornadaLaboral = '8 HORAS';
      vinculacion.modalidad = 'EBR';
      vinculacion.nivelEducativo = 'SECUNDARIA';
      vinculacion.areaCurricular = 'MATEMÁTICA';
      this.listVinculacion.push(vinculacion);
    }    
  }

  ngAfterViewInit() {
  }

  loadVinculacion() {
    this.dataSource.load(this.listVinculacion);
  }

  selectedRow(row) {
    this.selection.clear();
    this.selection.toggle(row);
    return row;
  }
}

export class VinculacionDataSource extends DataSource<any>{  
  private _dataChange = new BehaviorSubject<any>([]);
  private _loadingChange = new BehaviorSubject<boolean>(false);
  private _totalRows = 0;
  public loading = this._loadingChange.asObservable();
  constructor(private dataService: DataService, private _matPaginator: MatPaginator) {
    super();
  }

  load(data: any) {
    this._loadingChange.next(true);
    //Servicio para traer vinculación
    this._totalRows = data.length;
    this._dataChange.next(data);
    this._loadingChange.next(false);   
    // this.dataService.Acciones().buscarPlaza(data, pageIndex, pageSize).pipe(
    //   catchError(() => of([])),
    //   finalize(() => this._loadingChange.next(false))
    // ).subscribe((response: any) => {
    //   if (response && response.result) {
    //     this._totalRows = (response.data[0] || [{ total: 0 }]).total;
    //     this._dataChange.next(response.data);
    //   } else {
    //     this._totalRows = 0;
    //     this._dataChange.next([]);
    //   }
    // });
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

export class vinculacionModel {
    idRegimenLaboral = null;
    regimenLaboral = null;
    condicionLaboral = null;
    centroTrabajo = null;
    codigoPlaza = null;
    jornadaLaboral = null;
    modalidad = null;
    nivelEducativo = null;
    areaCurricular = null;
}