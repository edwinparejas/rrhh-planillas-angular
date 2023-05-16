import { Component, OnInit, ViewEncapsulation, AfterViewInit, ViewChild, Inject } from '@angular/core';
import { mineduAnimations } from '@minedu/animations/animations';
import { FormGroup, FormBuilder } from '@angular/forms';
import { SelectionModel, CollectionViewer } from '@angular/cdk/collections';
import { MatPaginator } from '@angular/material/paginator';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { DataService } from 'app/core/data/data.service';
import { tap, catchError, finalize, map } from 'rxjs/operators';
import { DataSource } from '@angular/cdk/table';
import { BehaviorSubject, of, Observable } from 'rxjs';

@Component({
  selector: 'minedu-buscar-centro-trabajo',
  templateUrl: './buscar-centro-trabajo.component.html',
  styleUrls: ['./buscar-centro-trabajo.component.scss'],
  encapsulation: ViewEncapsulation.None,
  animations: mineduAnimations
})
export class BuscarCentroTrabajoComponent implements OnInit, AfterViewInit {

  form: FormGroup;
  tiposCentroTrabajo: any[] = [];
  instancias: any[] = [];
  subinstancias: any[] = [];

  displayedColumns: string[] = [
    'codigoCentroTrabajo',
    'centroTrabajo',
    'instancia',
    'subInstancia',
    'tipoCentroTrabajo'
  ];

  ocultarInstancia = false;
  ocultarSubinstancia = false;
  ocultarTipoCentroTrabajo = false;
  ocultarInstitucionesEducativas = false;

  dataSource: CentroTrabajoDataSource | null;
  selection = new SelectionModel<any>(false, []);
  @ViewChild(MatPaginator, { static: true })
  paginator: MatPaginator;

  constructor(
    public matDialogRef: MatDialogRef<BuscarCentroTrabajoComponent>,
    @Inject(MAT_DIALOG_DATA) private data: any,
    private formBuilder: FormBuilder,
    private dataService: DataService
  ) { }

  ngOnInit(): void {
    this.buildForm();
    this.buildData();
    this.dataSource = new CentroTrabajoDataSource(this.dataService, this.paginator);
    this.paginator.showFirstLastButtons = true;
    this.paginator._intl.itemsPerPageLabel = "Filas por tabla";
    this.paginator._intl.nextPageLabel = "Siguiente página";
    this.paginator._intl.previousPageLabel = "Página anterior";
    this.paginator._intl.firstPageLabel = "Primera página";
    this.paginator._intl.lastPageLabel = "Última página";
  }

  buildForm() {
    this.form = this.formBuilder.group({
      idNivelInstancia: [null],
      idInstancia: [null],
      idSubinstancia: [null],
      idTipoCentroTrabajo: [null],
      institucionEducativa: [null]
    });

    this.form.get("idInstancia").valueChanges.subscribe(value => {
      this.subinstancias = [];
      this.form.patchValue({ idSubinstancia: null });
      if (value) {
        this.loadUgeles(value);
      }
    });
  }

  buildData() {
    this.loadDre();
    this.loadTipoCentroTrabajo();
  }

  ngAfterViewInit() {
    this.paginator.page
      .pipe(
        tap(() => this.loadCentroTrabajo())
      )
      .subscribe();
  }

  loadDre() {
    this.dataService.Maestro().getDres().pipe(
      catchError(() => of(null)),
      map((response: any) => response)
    ).subscribe(response => {
      if (response && response.result) {
        this.instancias = response.data;
      }
    });
  }

  loadTipoCentroTrabajo() {
    this.dataService.Acciones().getTiposCentroTrabajo().pipe(
      catchError(() => of(null)),
      map((response: any) => response)
    ).subscribe(response => {
      if (response && response.result) {
        this.tiposCentroTrabajo = response.data;
      }
    });
  }

  loadUgeles(pIdInstancia: any) {
    if (!pIdInstancia) {
      return;
    }
    this.dataService.Maestro().getUgeles(pIdInstancia).pipe(
      catchError(() => of([])),
      map((response: any) => response)
    ).subscribe(response => {
      if (response && response.result) {
        this.subinstancias = response.data;
      }
    });
  }

  loadCentroTrabajo() {
    this.dataSource.load(this.form.value, (this.paginator.pageIndex + 1), this.paginator.pageSize);
  }

  selectedRow(row) {
    this.selection.clear();
    this.selection.toggle(row);
    return row;
  }

  limpiar() {
    this.form.patchValue({
      idInstancia: null,
      idSubinstancia: null,
      idTipoCentroTrabajo: null,
      institucionEducativa: null
    });
  }

  buscar() {
    const form = this.form.value;
    if (form.idInstancia || form.idSubinstancia || form.idTipoCentroTrabajo || form.institucionEducativa) {
      this.dataSource.load(this.form.value, 1, 5);
    } else {
      this.dataService.Message().msgWarning('Ingrese al menos un criterio de búsqueda.', () => { });
      return;
    }
  }

  handleSeleccionar(){
    
  }
}

export class CentroTrabajoDataSource extends DataSource<any>{

  private _dataChange = new BehaviorSubject<any>([]);
  private _loadingChange = new BehaviorSubject<boolean>(false);
  private _totalRows = 0;

  public loading = this._loadingChange.asObservable();

  constructor(private dataService: DataService, private _matPaginator: MatPaginator) {
    super();
  }

  load(data: any, pageIndex: number, pageSize: number) {
    this._loadingChange.next(true);
    this.dataService.Acciones().buscarCentroTrabajo(data, pageIndex, pageSize).pipe(
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
