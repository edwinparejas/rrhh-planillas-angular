import { SelectionModel, DataSource, CollectionViewer } from '@angular/cdk/collections';
import { AfterViewInit, Component, Inject, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { mineduAnimations } from '@minedu/animations/animations';
import { DataService } from 'app/core/data/data.service';
import { isArray } from 'lodash';
import { of, BehaviorSubject, Observable } from 'rxjs';
import { catchError, finalize, tap } from 'rxjs/operators';
import { TablaTipoDocumentoIdentidad } from '../../_utils/constants';

@Component({
  selector: 'minedu-busqueda-documento-identidad',
  templateUrl: './busqueda-documento-identidad.component.html',
  styleUrls: ['./busqueda-documento-identidad.component.scss'],
  encapsulation: ViewEncapsulation.None,
  animations: mineduAnimations,
})
export class BusquedaDocumentoIdentidadComponent implements OnInit, AfterViewInit {
  form: FormGroup;
  tiposDocumentoIdentidad: any[] = [];
  maximo: number = 8;

  displayedColumns: string[] = [
    "documento",
    "apellidosNombres",
    "fechaNacimiento",
    "iged",
    "centroTrabajo",
    "regimenLaboral",
    "condicionLaboral"
  ];

  dataSource: DocumentoIdentidadDataSource | null;
  selection = new SelectionModel<any>(false, []);
  @ViewChild(MatPaginator, { static: true })
  paginator: MatPaginator;

  constructor(
    public matDialogRef: MatDialogRef<BusquedaDocumentoIdentidadComponent>,
    @Inject(MAT_DIALOG_DATA) private data: any,
    private formBuilder: FormBuilder,
    private dataService: DataService
  ) { }

  ngOnInit(): void {
    this.buildForm();
    setTimeout(() => {
      this.buildData();
    });
    this.dataSource = new DocumentoIdentidadDataSource(this.dataService);
    this.paginator.showFirstLastButtons = true;
    this.paginator._intl.itemsPerPageLabel = "Registros por Página";
    this.paginator._intl.nextPageLabel = "Siguiente página";
    this.paginator._intl.previousPageLabel = "Página anterior";
    this.paginator._intl.firstPageLabel = "Primera página";
    this.paginator._intl.lastPageLabel = "Última página";
  }

  buildForm() {
    this.form = this.formBuilder.group({
      idTipoDocumentoIdentidad: [null],
      numeroDocumentoIdentidad: [null, Validators.compose([Validators.maxLength(this.maximo), Validators.minLength(this.maximo)])],
      primerApellido: [null],
      segundoApellido: [null],
      nombres: [null],
      codigoTipoSede: [null],
      codigoSede: [null],
    });

    const { idTipoDocumentoIdentidad, numeroDocumentoIdentidad } = this.data;
    if (idTipoDocumentoIdentidad) { this.form.patchValue({ idTipoDocumentoIdentidad: idTipoDocumentoIdentidad }); }

    if (numeroDocumentoIdentidad) { this.form.patchValue({ numeroDocumentoIdentidad: numeroDocumentoIdentidad }); }

    this.form.get("idTipoDocumentoIdentidad").valueChanges.subscribe((value) => {
      if (value) {
        this.validarTipoDocumentoIdentidad(value);
      }
    });

  }

  private validarTipoDocumentoIdentidad = (value: number) => {
    this.maximo = 8;
    const tipoDocumentoIdentidad = this.tiposDocumentoIdentidad.find(pred => pred.idCatalogoItem === value);
    let validatorNumeroDocumento = null;
    switch (tipoDocumentoIdentidad?.codigoCatalogoItem) {
      case TablaTipoDocumentoIdentidad.DNI:
        this.maximo = 8;
        validatorNumeroDocumento = Validators.compose([
          Validators.minLength(this.maximo),
          Validators.maxLength(this.maximo),
          Validators.pattern("^[0-9]*$"),
        ]);
        break;
      case TablaTipoDocumentoIdentidad.CARNET_DE_EXTRANJERIA:
        this.maximo = 12;
        validatorNumeroDocumento = Validators.compose([
          Validators.minLength(this.maximo),
          Validators.maxLength(this.maximo),
          Validators.pattern("^[a-zA-Z0-9]*$"),
        ]);
        break;
      case TablaTipoDocumentoIdentidad.PASAPORTE:
        this.maximo = 12;
        validatorNumeroDocumento = Validators.compose([
          Validators.minLength(this.maximo),
          Validators.maxLength(this.maximo),
          Validators.pattern("^[a-zA-Z0-9]*$"),
        ]);
        break;
      default:
        this.maximo = 8;
        break;
    }

    const numeroDocumentoIdentidad = this.form.get("numeroDocumentoIdentidad");

    numeroDocumentoIdentidad.setValidators(validatorNumeroDocumento);
    numeroDocumentoIdentidad.updateValueAndValidity();
    this.form.patchValue({ numeroDocumentoIdentidad: null });
  }

  onKeyOnlyNumbers(e) {
    const idTipoDocumentoIdentidad = this.form.get("idTipoDocumentoIdentidad").value;
    let permiteIngreso = true;
    const tipoDocumentoIdentidad = this.tiposDocumentoIdentidad.find(pred => pred.idCatalogoItem === idTipoDocumentoIdentidad);

    switch (tipoDocumentoIdentidad?.codigoCatalogoItem) {
      case TablaTipoDocumentoIdentidad.DNI:
        if (e.keyCode == 13 || (e.keyCode >= 48 && e.keyCode <= 57)) {
          permiteIngreso = true;
        } else {
          permiteIngreso = false;
        }
        break;
      case TablaTipoDocumentoIdentidad.CARNET_DE_EXTRANJERIA:
        permiteIngreso = true;
        break;
      case TablaTipoDocumentoIdentidad.PASAPORTE:
        permiteIngreso = true;
        break;
      default:
        permiteIngreso = false;
        break;
    }
    return permiteIngreso;
  }


  buildData() {
    const rolSelected = this.dataService.Storage().getPassportRolSelected();
    let codigoSede = "";
    let codigoTipoSede = "";
    if (rolSelected) {
      codigoSede = rolSelected.CODIGO_SEDE;
      codigoTipoSede = rolSelected.CODIGO_TIPO_SEDE;
      this.form.patchValue({ codigoTipoSede: codigoTipoSede, codigoSede: codigoSede });
    }
    this.validBuildData();
  }

  private validBuildData() {
    this.dataService
      .Rotacion()
      .getTiposDocumentoIdentidad()
      .pipe(
        catchError((e) => { return  this.configCatch(e);        }),
        finalize(() => { })
      )
      .subscribe((response) => {
        if (response) {
          this.tiposDocumentoIdentidad = response;
        }
      });
  }

  ngAfterViewInit() {
    this.paginator.page
      .pipe(tap(() => this.loadDatosDocumentoIdentidad()))
      .subscribe();
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
      nombres: null,
    });
  }

  loadDatosDocumentoIdentidad() {
    const dato = {
      pageIndex: this.paginator.pageIndex + 1,
      pageSize: this.paginator.pageSize,
    };
    this.busquedaConfirmar(dato);
  }

  buscar() {
    const form = this.form.value;
    if (
      form.idTipoDocumentoIdentidad ||
      form.numeroDocumentoIdentidad ||
      form.primerApellido ||
      form.segundoApellido ||
      form.nombres
    ) {
      const dato = {        pageIndex: 1,        pageSize: 5,      };
      this.busquedaConfirmar(dato);
    } else {
      this.dataService
        .Message()
        .msgWarning(
          "INGRESE AL MENOS UN CRITERIO DE BÚSQUEDA.",
          () => { }
        );
      return;
    }
  }

  private busquedaConfirmar = (dato: any) => {
    const pageIndex = dato.pageIndex;
    const pageSize = dato.pageSize;
    this.dataSource.load(this.form.value, pageIndex, pageSize);
  };
  configCatch(e: any) { 
    if (e && e.status === 400 && isArray(e.messages)) {
      this.dataService.Util().msgWarning(e.messages[0], () => { });
    } else if(isArray(e.messages)) {
            if((e.messages[0]).indexOf("HUBO UN PROBLEMA AL PROCESAR LA SOLICITUD")!=-1)
                this.dataService.Util().msgError(e.messages[0], () => { }); 
            else
                this.dataService.Util().msgWarning(e.messages[0], () => { }); 
                
    }else{
        this.dataService.Util().msgError('Error recuperando datos del servidor, por favor intente dentro de unos segundos, gracias.', () => { });
    }
    this.dataService.Spinner().hide("sp6");
    return of(e) 
  }
}

export class DocumentoIdentidadDataSource extends DataSource<any> {
  private _dataChange = new BehaviorSubject<any>([]);
  private _loadingChange = new BehaviorSubject<boolean>(false);
  private _totalRows = 0;

  loading = this._loadingChange.asObservable();

  constructor(private dataService: DataService) {
    super();
  }

  load(data: any, pageIndex: number, pageSize: number) {
    this._loadingChange.next(true);
    this.dataService
      .Rotacion()
      .buscarServidorPublico(data, pageIndex, pageSize)
      .pipe(
        catchError((e) => { return  this.configCatch(e);        }),
        finalize(() => this._loadingChange.next(false))
      )
      .subscribe((response: any) => {
        if (response) {
          this._totalRows = (response[0] || [{ totalRegistros: 0 }]).totalRegistros;
          this._dataChange.next(response);
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
  configCatch(e: any) { 
    if (e && e.status === 400 && isArray(e.messages)) {
      this.dataService.Util().msgWarning(e.messages[0], () => { });
    } else if(isArray(e.messages)) {
            if((e.messages[0]).indexOf("HUBO UN PROBLEMA AL PROCESAR LA SOLICITUD")!=-1)
                this.dataService.Util().msgError(e.messages[0], () => { }); 
            else
                this.dataService.Util().msgWarning(e.messages[0], () => { }); 
                
    }else{
        this.dataService.Util().msgError('Error recuperando datos del servidor, por favor intente dentro de unos segundos, gracias.', () => { });
    }
    this.dataService.Spinner().hide("sp6");
    return of(e) 
  }
}
