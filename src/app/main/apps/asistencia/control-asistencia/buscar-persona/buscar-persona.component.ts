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
import { ASISTENCIA_MESSAGE, SNACKBAR_BUTTON } from 'app/core/model/messages-error';

@Component({
  selector: 'minedu-buscar-persona',
  templateUrl: './buscar-persona.component.html',
  styleUrls: ['./buscar-persona.component.scss'],
  encapsulation: ViewEncapsulation.None,
  animations: mineduAnimations
})
export class BuscarPersonaComponent implements OnInit, AfterViewInit {

  form: FormGroup;


  displayedColumns: string[] = [
    'documento',
    'apellidosNombres',
    'fechaNacimiento',
    'iged',
    'centroTrabajo',
    'regimenLaboral',
    'condicionLaboral',
    'estadoActual'
  ];

  dataSource: DocumentoIdentidadDataSource | null;
  selection = new SelectionModel<any>(false, []);
  @ViewChild(MatPaginator, { static: true })
  paginator: MatPaginator;
  combo = {
    tiposDocumentoIdentidad: []
   
  }
  constructor(
    public matDialogRef: MatDialogRef<BuscarPersonaComponent>,
    @Inject(MAT_DIALOG_DATA) private data: any,
    private formBuilder: FormBuilder,
    private dataService: DataService
  ) { }

  ngOnInit(): void {
    this.buildForm();
    this.buildData();
    this.dataSource = new DocumentoIdentidadDataSource(this.dataService, this.paginator);
    this.paginator.showFirstLastButtons = true;
    this.paginator._intl.itemsPerPageLabel = "Filas por tabla";
    this.paginator._intl.nextPageLabel = "Siguiente página";
    this.paginator._intl.previousPageLabel = "Página anterior";
    this.paginator._intl.firstPageLabel = "Primera página";
    this.paginator._intl.lastPageLabel = "Última página";
  }

  buildForm() {
    this.form = this.formBuilder.group({
      codigoSede:"16",
      codigoTipoSede:"TS005",
      idTipoDocumentoIdentidad: [null],
      numeroDocumentoIdentidad: [null],
      primerApellido: [null],
      segundoApellido: [null],
      nombres: [null]
    });
  }

  buildData() {
    this.dataService.Asistencia().getComboTiposDocumento().pipe(
      catchError(() => { this.dataService.SnackBar().msgError(ASISTENCIA_MESSAGE.REGISTRAR_ASISTENCIA_ERROR, SNACKBAR_BUTTON.CLOSE); return of(null); }),
      finalize(() => { })
    ).subscribe((response: any) => {
      if (response && response.result) {
        this.combo.tiposDocumentoIdentidad = response.data;
        console.log(response.data);
      } else {
        this.combo.tiposDocumentoIdentidad = [];
      }
      this.form.patchValue({ idTipoDocumentoIdentidad: "-1" });
    });
  }

  ngAfterViewInit() {
    this.paginator.page
      .pipe(
        tap(() => this.loadDatosDocumentoIdentidad())
      )
      .subscribe();
  }

  loadDatosDocumentoIdentidad() {
    this.dataSource.load(this.form.value, (this.paginator.pageIndex + 1), this.paginator.pageSize);
  }

  selectedRow(row) {
    this.selection.clear();
    this.selection.toggle(row);
    return row;
  }

  limpiar() {
    this.form.patchValue({
      codigoSede:1,
      codigoTipoSede:1,
      idTipoDocumentoIdentidad: null,
      numeroDocumentoIdentidad: null,
      primerApellido: null,
      segundoApellido: null,
      nombres: null
    });
  }

  buscar() {
    debugger
    const form = this.form.value;
    if (form.idTipoDocumentoIdentidad || form.numeroDocumentoIdentidad || form.primerApellido || form.segundoApellido || form.nombres) {
      this.dataSource.load(this.form.value, 1, 10);
    } else {
      this.dataService.Message().msgWarning('Ingrese al menos un criterio de búsqueda.', () => { });
      return;
    }
  }
  
  handleSeleccionar(){

  }
}

export class DocumentoIdentidadDataSource extends DataSource<any>{

  private _dataChange = new BehaviorSubject<any>([]);
  private _loadingChange = new BehaviorSubject<boolean>(false);
  private _totalRows = 0;

  public loading = this._loadingChange.asObservable();

  constructor(private dataService: DataService, private _matPaginator: MatPaginator) {
    super();
  }

  load(data: any, pageIndex: number, pageSize: number) {
    debugger
    this._loadingChange.next(true);
    this.dataService.Asistencia().buscarServidorPublico(data, pageIndex, pageSize).pipe(
      catchError(() => of(null)),
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
