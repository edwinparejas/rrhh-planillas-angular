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
  selector: 'minedu-buscar-plaza',
  templateUrl: './buscar-plaza.component.html',
  styleUrls: ['./buscar-plaza.component.scss'],
  encapsulation: ViewEncapsulation.None,
  animations: mineduAnimations
})
export class BuscarPlazaComponent implements OnInit, AfterViewInit {

  form: FormGroup;

  regimenesLaborales: any[] = [];

  displayedColumns: string[] = [
    'codigoPlaza',
    'codigoModular',
    'centroTrabajo',
    'modalidad',
    'nivelEducativo',
    'regimenLaboral',
    'cargo',
    'areaCurricular',
    'jornadaLaboral',
    'condicionPlaza',
    'tipoPlaza'
  ];

  dataSource: PlazaDataSource | null;
  selection = new SelectionModel<any>(false, []);
  @ViewChild(MatPaginator, { static: true })
  paginator: MatPaginator;

  constructor(
    public matDialogRef: MatDialogRef<BuscarPlazaComponent>,
    @Inject(MAT_DIALOG_DATA) private data: any,
    private formBuilder: FormBuilder,
    private dataService: DataService
  ) { }

  ngOnInit(): void {
    this.buildForm();
    this.buildData();
    this.dataSource = new PlazaDataSource(this.dataService, this.paginator);
    this.paginator.showFirstLastButtons = true;
    this.paginator._intl.itemsPerPageLabel = "Filas por tabla";
    this.paginator._intl.nextPageLabel = "Siguiente página";
    this.paginator._intl.previousPageLabel = "Página anterior";
    this.paginator._intl.firstPageLabel = "Primera página";
    this.paginator._intl.lastPageLabel = "Última página";

  }

  buildForm() {
    this.form = this.formBuilder.group({
      codigoPlaza: [null],
      centroTrabajo: [null],
      codigoCentroTrabajo: [null],
      idRegimenLaboral: [null]
    });
  }

  buildData() {
    this.dataService.Acciones().getComboRegimenesLaborales(10).pipe(
      catchError(() => of(null)),
      finalize(() => { })
    ).subscribe(response => {
      if (response && response.result) {
        this.regimenesLaborales = response.data;
      }
    });
  }

  ngAfterViewInit() {
    this.paginator.page
      .pipe(
        tap(() => this.loadPlaza())
      )
      .subscribe();
  }

  loadPlaza() {
    this.dataSource.load(this.form.value, (this.paginator.pageIndex + 1), this.paginator.pageSize);
  }

  selectedRow(row) {
    this.selection.clear();
    this.selection.toggle(row);
    return row;
  }

  limpiar() {
    this.form.patchValue({
      codigoPlaza: null,
      centroTrabajo: null,
      codigoCentroTrabajo: null,
      idRegimenLaboral: null
    });
  }

  buscar() {
    const form = this.form.value;
    if (form.codigoPlaza || form.centroTrabajo || form.codigoCentroTrabajo || form.idRegimenLaboral) {
      this.dataSource.load(this.form.value, 1, 5);
    } else {
      this.dataService.Message().msgWarning('Ingrese al menos un criterio de búsqueda.', () => { });
      return;
    }
  }

  handleExportar() {

  }

  handleSeleccionar(){
    
  }
}

export class PlazaDataSource extends DataSource<any>{

  private _dataChange = new BehaviorSubject<any>([]);
  private _loadingChange = new BehaviorSubject<boolean>(false);
  private _totalRows = 0;

  public loading = this._loadingChange.asObservable();

  constructor(private dataService: DataService, private _matPaginator: MatPaginator) {
    super();
  }

  load(data: any, pageIndex: number, pageSize: number) {
    this._loadingChange.next(true);
    this.dataService.Acciones().buscarPlaza(data, pageIndex, pageSize).pipe(
      catchError(() => of([])),
      finalize(() => this._loadingChange.next(false))
    ).subscribe((response: any) => {
      if (response && response.result) {
        this._totalRows = (response.data[0] || [{ total: 0 }]).total;
        this._dataChange.next(response.data);
      } else {
        this._totalRows = 0;
        this._dataChange.next([]);
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
