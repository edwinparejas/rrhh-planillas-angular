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
import { HttpParams } from '@angular/common/http';
import { SecurityModel } from 'app/core/model/security/security.model';

@Component({
  selector: 'minedu-buscar-persona',
  templateUrl: './buscar-persona.component.html',
  styleUrls: ['./buscar-persona.component.scss'],
  encapsulation: ViewEncapsulation.None,
  animations: mineduAnimations
})
export class BuscarPersonaComponent implements OnInit, AfterViewInit {
    
   currentSession: SecurityModel = new SecurityModel();
  form: FormGroup;
  tiposDocumentoIdentidad: any[] = [];
  request :HttpParams;
  displayedColumns: string[] = [
    'registro',
    'numeroDocumentoIdentidad',
    'apellidosNombres',
    'fechaNacimiento',
    'edad',
    'nacionalidad',
    'estadoCivil',
    'estado',
  ];

  dataSource: DocumentoIdentidadDataSource | null;
  selection = new SelectionModel<any>(false, []);
  @ViewChild(MatPaginator, { static: true })
  paginator: MatPaginator;
  paginatorPageSize = 5;
    paginatorPageIndex = 0;
    isMobile = false;
  constructor(
    public matDialogRef: MatDialogRef<BuscarPersonaComponent>,
    @Inject(MAT_DIALOG_DATA) private data: any,
    private formBuilder: FormBuilder,
    private dataService: DataService
  ) { }

  ngOnInit(): void {
    this.handleResponsive();
    this.buildForm();
    
    this.dataSource = new DocumentoIdentidadDataSource(this.dataService);
    this.paginator.showFirstLastButtons = true;
    this.paginator._intl.itemsPerPageLabel = "Registros por página";
    this.paginator._intl.nextPageLabel = "Siguiente página";
    this.paginator._intl.previousPageLabel = "Página anterior";
    this.paginator._intl.firstPageLabel = "Primera página";
    this.paginator._intl.lastPageLabel = "Última página";
    this.paginator._intl.getRangeLabel = (page: number, pageSize: number, length: number) => {
        if (length === 0 || pageSize === 0) {return `0 de ${length}`;}
        const length2 = Math.max(length, 0);
        const startIndex = page * pageSize;
        const endIndex = startIndex < length2 ? Math.min(startIndex + pageSize, length2) : startIndex + pageSize;
        return `${startIndex + 1} – ${endIndex} de ${length2}`;
    }
    this.resetForm();
    this.buildData();


  }
  handleResponsive(): void {
    this.isMobile = this.getIsMobile();
    window.onresize = () => {
      this.isMobile = this.getIsMobile();
    };
  }
  getIsMobile(): boolean {
    const w = document.documentElement.clientWidth;
    const breakpoint = 992;
    if (w < breakpoint) {
      return true;
    } else {
      return false;
    }
  }
  buildForm() {
    this.form = this.formBuilder.group({
      idTipoDocumentoIdentidad: [null],
      numeroDocumentoIdentidad: [null],
      primerApellido: [null],
      segundoApellido: [null],
      nombres: [null]
    });
  }
  resetForm() {
    this.form.reset();
    this.form.controls['idTipoDocumentoIdentidad'].setValue(0);    
}
addParam(queryParam:HttpParams,param,value){
    if(value)
        queryParam = queryParam.set(param, value);
    return queryParam
}
getValueOrNullFromCero(value){
    return value==0?null:value;
  }
  getValueOrNullFromEmpy(value){
    return value==""?null:value;
  }
setRequest = () => {
    let queryParam = new HttpParams();
    queryParam = this.addParam(queryParam,'idTipoDocumentoIdentidad', this.getValueOrNullFromCero(this.form.get('idTipoDocumentoIdentidad').value));
    queryParam = this.addParam(queryParam,'numeroDocumentoIdentidad', this.getValueOrNullFromEmpy(this.form.get('numeroDocumentoIdentidad').value));
    queryParam = this.addParam(queryParam,'primerApellido', this.getValueOrNullFromEmpy(this.form.get('primerApellido').value));
    queryParam = this.addParam(queryParam,'segundoApellido', this.getValueOrNullFromEmpy(this.form.get('segundoApellido').value));
    queryParam = this.addParam(queryParam,'nombres', this.getValueOrNullFromEmpy(this.form.get('nombres').value));

    queryParam = this.addParam(queryParam,'codigoRol', this.currentSession.codigoRol);
    queryParam = this.addParam(queryParam,'codigoSede', this.currentSession.codigoSede);
    queryParam = this.addParam(queryParam,'codigoTipoSede', this.currentSession.codigoTipoSede);

    this.request = queryParam;
  }
    loadData(pageIndex, pageSize): void {
        this.setRequest();
        this.dataSource.load(
        this.request,
        pageIndex,
        pageSize
        );
    }
  buildData() {
    this.dataService.Beneficios().getComboTipoDocumentoIdentidad().pipe(
      catchError(() => of(null)),
      finalize(() => { })
    ).subscribe(result => {
      if (result) {
        var index = 0;
        result.splice(index, 0,
            {
                idTipoDocumentoIdentidad: 0,
                descripcionTipoDocumentoIdentidad:"TODOS"
            });
        this.tiposDocumentoIdentidad = result.map((x) => ({
            ...x,
            value: x.idTipoDocumentoIdentidad,
            label: x.descripcionTipoDocumentoIdentidad
        }));
        
        this.currentSession = this.dataService.Storage().getInformacionUsuario();
        if(this.data.idTipoDocumentoIdentidad)
            this.form.patchValue({ 
                idTipoDocumentoIdentidad:this.data.idTipoDocumentoIdentidad
            });
      }
    });
  }

  ngAfterViewInit(): void {
    this.paginator.page.subscribe(() => this.loadData(this.paginator.pageIndex + 1, this.paginator.pageSize));
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
      idTipoDocumentoIdentidad: null,
      numeroDocumentoIdentidad: null,
      primerApellido: null,
      segundoApellido: null,
      nombres: null
    });
  }

  buscar() {
    const form = this.form.value;
    if (form.idTipoDocumentoIdentidad || form.numeroDocumentoIdentidad || form.primerApellido || form.segundoApellido || form.nombres) {
        this.setRequest();
        this.dataSource.load(this.request, 1, 5);

    } else {
      this.dataService.Message().msgWarning('"DEBE ESPECIFICAR POR LO MENOS UN CRITERIO DE BÚSQUEDA."', () => { });
      return;
    }
  }
  onKeyPressNumeroDocumento(e: any): boolean {
    let _idTipoDocumento  = this.form.get('idTipoDocumentoIdentidad').value;
    let tipoDocumentoSelect = this.tiposDocumentoIdentidad.find(m => m.value == _idTipoDocumento);
    if (tipoDocumentoSelect.value == 1) {
      //------------ DNI
      const reg = /^\d+$/;
      const pressedKey = String.fromCharCode(!e.charCode ? e.which : e.charCode);
      if (!reg.test(pressedKey)) {
        e.preventDefault();
        return false;
      }  
    } else {
      //------------ PASAPORTE O CARNET DE EXTRANJERIA
      var inp = String.fromCharCode(e.keyCode);

      if (/[a-zA-Z0-9]/.test(inp)) {
        return true;
      } else {
        e.preventDefault();
        return false;
      }
    }
    
  }
}

export class DocumentoIdentidadDataSource extends DataSource<any>{

  private _dataChange = new BehaviorSubject<any>([]);
  private _loadingChange = new BehaviorSubject<boolean>(false);
  private _totalRows = 0;

  public loading = this._loadingChange.asObservable();

  constructor(private dataService: DataService) {
    super();
  }

  load(queryParam: any, pageIndex: number, pageSize: number,fistTime: boolean = false): void  {
    this._loadingChange.next(false);
    this.dataService.Spinner().show("sp6");
    //Add pagination
    queryParam = queryParam.set('paginaActual', pageIndex);
    queryParam = queryParam.set('paginaTamanio', pageSize == undefined ? 5 : pageSize);

    this.dataService.Beneficios().getTablePersona(queryParam).pipe(
      catchError(() => of(null)),
      finalize(() => {
        this._loadingChange.next(false);
        this.dataService.Spinner().hide("sp6");
      })
    ).subscribe((response: any) => {
      if (response) {
        this._totalRows = (response[0] || [{ total: 0 }]).totalRegistros;
        this._dataChange.next(response || []);
        if ((response || []).length === 0) {
            if(!fistTime)
              this.dataService.Message().msgWarning('"NO SE ENCONTRÓ INFORMACIÓN DE ACUERDO CON LOS CRITERIOS DE BÚSQUEDA INGRESADOS."', () => { });
          }
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
