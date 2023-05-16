import { Component, OnInit, ViewEncapsulation, ViewChild, Input } from '@angular/core';
import { mineduAnimations } from '@minedu/animations/animations';
import { BehaviorSubject, of, Observable } from 'rxjs';
import { SelectionModel, DataSource, CollectionViewer } from '@angular/cdk/collections';
import { FormGroup } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { catchError, finalize } from 'rxjs/operators';
import { MatPaginator } from '@angular/material/paginator';

import { DataService } from 'app/core/data/data.service';
import { GlobalsService } from 'app/core/shared/globals.service';
import { LocalStorageService } from '@minedu/services/secure/local-storage.service';
import { PASSPORT_MESSAGE } from 'app/core/model/message';
import { MISSING_TOKEN } from 'app/core/model/types';
import { TablaAccionesPassport } from 'app/core/model/action-types';
import { TablaMetodosCargaMasiva } from 'app/core/model/types-cargamasiva';

@Component({
  selector: 'minedu-detalle-error',
  templateUrl: './detalle-error.component.html',
  styleUrls: ['./detalle-error.component.scss'],
  encapsulation: ViewEncapsulation.None,
  animations: mineduAnimations
})
export class DetalleErrorComponent implements OnInit {

  @Input() public listarDetalleError: Function;


  form: FormGroup;
  working = false;
  mostrar: boolean = false;

  formatos: any[] = [];
  displayedGrid: string[] = [];
  displayedColumns: string[] = [];
  titulosGrid: string[] = [];

  visible: boolean = false;
  exportar: boolean = true;
  idEstado: any;

  dataFormato = {
    idCarga: null,
    error: null,
    usuarioModificacion: null,
    idFormato: null,
    codigoRol: null,
    codigoTipoSede: null,
    codigoSede: null,
  };

  parametro: any = null;
  registroConsulta: any = null;

  datosSistema = {
    datosRegistroOrigen: null,
    codigoSistema: null,
    codigoFuncionalidad: null,
    parametro: null,
    parametro2: null,
    idParametro: null
  };

  ultimoRegistro: any;
  idFormato: any;

  dataSource: ErrorCargaDataSource | null;
  selection = new SelectionModel<any>(false, []);

  @ViewChild('paginatorCargaMasivaError', { static: true }) paginator: MatPaginator;

  constructor(
    private route: ActivatedRoute,
    private dataService: DataService,
    public globals: GlobalsService,
    private localStorageService: LocalStorageService
  ) {
  }

  ngOnInit(): void {
    this.route.data.subscribe((data) => {
      if (data) {
        this.route.params.subscribe((parametro) => { if (parametro) { this.parametro = parametro.codigo; } });

        this.datosSistema = {
          datosRegistroOrigen: this.parametro,
          codigoSistema: this.parametro.substr(0, 3),
          codigoFuncionalidad: this.parametro.substr(3, 4),
          parametro: this.parametro.substr(7, 10),
          parametro2: this.parametro.substr(17, 10),
          idParametro: this.parametro.substr(27, 10)
        };

        this.registroConsulta = data['Ratificacion'];
      }
    });

    this.buildForm();
    this.loadDataSource();
  }

  buildForm() {
    this.ultimoRegistro = JSON.parse(this.localStorageService.getItem('registro'));
    const data = {
      codigoSistema: this.datosSistema.codigoSistema,
      codigoFuncionalidad: this.datosSistema.codigoFuncionalidad
    };

    this.dataService.CargaMasiva().getFormato(data).pipe(
      catchError((e) => of(e)),
      finalize(() => { })
    ).subscribe((response: any) => {
      if (response && response.result) {
        this.formatos = response.data;
        if (this.ultimoRegistro !== null) {
          const formato = this.formatos.find(x => x.idFormato === parseInt(this.ultimoRegistro.idFormato));
          this.tituloGrilla(formato);
          this.loadCargaMasiva(this.dataFormato);
        }
      } else if (response && (response.statusCode === 401 || response.error === MISSING_TOKEN.INVALID_TOKEN)) {
        this.dataService.Message().msgInfo(PASSPORT_MESSAGE.SESION_END, () => { this.dataService.Storage().passportUILogin(); });
      }
    });
  }

  loadDataSource() {
    this.dataSource = new ErrorCargaDataSource(this.dataService);
    this.displayedColumns = [];
  }

  ngAfterViewInit() {
    this.paginator.page.subscribe(() => this.loadData((this.paginator.pageIndex + 1).toString(), this.paginator.pageSize.toString()));
  }

  loadData(pageIndex, pageSize) {
    this.obtenerClavePublica(TablaAccionesPassport.Consultar, true, TablaMetodosCargaMasiva.GRID_ERRORES, { pageIndex: pageIndex, pageSize: pageSize });
  }

  private handleLoadData(parametro) {
    this.dataSource.load(this.dataFormato, parametro.pageIndex, parametro.pageSize);
  }

  loadCargaMasiva(data) {
    if (data.idCarga !== null) {
      this.dataSource = new ErrorCargaDataSource(this.dataService);
      this.dataSource.load(data, (this.paginator.pageIndex + 1), this.globals.paginatorPageSize);
    } else {
      this.dataService.Spinner().hide("sp6");
    }
  }

  tituloGrilla(formato) {
    let columns = '';
    let titulos = '';

    columns = 'fila,' + formato.columnas + ',detalleError';
    titulos = 'Registro,' + formato.titulos + ',Detalle de errores';

    this.displayedGrid = columns.split(',');
    this.titulosGrid = titulos.split(',');

    this.displayedColumns = this.displayedGrid;
  }

  cargarDatosError(data, sw = undefined) {

    const usuario = this.dataService.Storage().getPassportUserData();
    if (!usuario) {
      this.dataService.Util().msgWarning('Datos de usuario no encontrado, por favor vuelva ingresar.', () => { });
      return;
    }

    const rol = this.dataService.Storage().getPassportRolSelected();
    this.dataFormato = {
      idCarga: data.idCarga,
      error: 1,
      usuarioModificacion: usuario.NOMBRES_USUARIO,
      idFormato: data.idFormato,
      codigoRol: rol.CODIGO_ROL,
      codigoTipoSede: rol.CODIGO_TIPO_SEDE,
      codigoSede: rol.CODIGO_SEDE
    };

    this.idFormato = parseInt(data.idFormato);

    if (sw) {
      const formato = this.formatos.find(x => x.idFormato === this.idFormato);
      this.tituloGrilla(formato);
      this.loadCargaMasiva(this.dataFormato);
    } else {
      this.buildForm();
    }
  }

  exportarDetalleError() {
    if (this.dataSource.totalRegistros === 0) return true;
    this.obtenerClavePublica(TablaAccionesPassport.Consultar, true, TablaMetodosCargaMasiva.EXPORTAR_ERRORES);
  }

  private handleExportarErrores() {
    this.dataService.CargaMasiva().exportarDetalleCargaMasivaExcel(this.dataFormato)
      .pipe(
        catchError(() => { return of(null) }),
        finalize(() => { this.dataService.Spinner().hide("sp6"); })
      ).subscribe((response) => {
        const nombreFile: string = 'DetalleCargaMasiva.xlsx';
        this.dataService.CargaMasiva().downloadFile(response, nombreFile);
      });
  }

  obtenerClavePublica(operacion: TablaAccionesPassport, requiredLogin: boolean, method: TablaMetodosCargaMasiva, param?: any) {
    this.dataService.Spinner().show("sp6");
    this.dataService.Passport().boot().pipe(
      catchError(() => of(null))
    ).subscribe((response: any) => {
      if (response) {
        const d = response;
        this.confirmarOperacion(d.Token, operacion, requiredLogin, method, param);
      } else {
        this.dataService.Spinner().hide("sp6");
        if (!requiredLogin) { this.dataService.Message().msgWarning(PASSPORT_MESSAGE.PERMISO_NOT_FOUND, () => { }); }
        else { this.dataService.Message().msgInfo(PASSPORT_MESSAGE.BUTTON_UNAUTHORIZED, () => { this.dataService.Storage().passportUILogin(); }); }
        return;
      }
    });
  }

  confirmarOperacion(token: any, operacion: TablaAccionesPassport, requiredLogin: boolean, method: TablaMetodosCargaMasiva, parametro?: any) {
    const parametroPermiso = this.dataService.Storage().getParamAccion(operacion);
    if (!parametroPermiso) {
      this.dataService.Spinner().hide("sp6");
      this.dataService.Message().msgWarning(PASSPORT_MESSAGE.PERMISO_NOT_FOUND, () => { });
      return;
    }
    const param = this.dataService.Cifrado().PassportEncode(token, parametroPermiso);
    this.dataService.Passport().getAutorizacion(param).pipe(
      catchError(() => { return of(null) }),
      finalize(() => { })
    ).subscribe(response => {
      if (response && !response.HasErrors) {
        const data = response.Data[0];
        if (data.ESTA_AUTORIZADO) {
          switch (method) {
            case TablaMetodosCargaMasiva.GRID_ERRORES: {
              this.handleLoadData(parametro);
              break;
            }
            case TablaMetodosCargaMasiva.EXPORTAR_ERRORES: {
              this.handleExportarErrores();
              break;
            }
          }
        } else {
          this.dataService.Spinner().hide("sp6");
          if (!requiredLogin) { this.dataService.Message().msgWarning(PASSPORT_MESSAGE.PERMISO_NOT_FOUND, () => { }); }
          else { this.dataService.Message().msgInfo(PASSPORT_MESSAGE.BUTTON_UNAUTHORIZED, () => { this.dataService.Storage().passportUILogin(); }); }
          return;
        }
      } else {
        this.dataService.Spinner().hide("sp6");
        this.dataService.Message().msgInfo(PASSPORT_MESSAGE.BUTTON_UNAUTHORIZED, () => { this.dataService.Storage().passportUILogin(); });
      }
    });
  }

}

export class ErrorCargaDataSource extends DataSource<any>{

  private _dataChange = new BehaviorSubject<any>([]);
  private _loadingChange = new BehaviorSubject<boolean>(false);

  public loading = this._loadingChange.asObservable();
  public totalRegistros = 0;
  public registrosCorrectos = 0;
  public registrosErrados = 0;
  public nombreArchivo = '';
  public fechaCarga = '';

  constructor(
    private dataService: DataService) {
    super();
  }

  load(data, pageIndex, pageSize) {
    this._loadingChange.next(true);
    this.dataService.CargaMasiva().listaDetalleErrorCargaMasiva(data, pageIndex, pageSize).pipe(
      catchError((e) => of(e)),
      finalize(() => { this._loadingChange.next(false); this.dataService.Spinner().hide("sp6"); })
    ).subscribe((response: any) => {
      if (response && response.result) {
        this._dataChange.next(response.data || []);
        this.totalRegistros = ((response.data || []).length === 0) ? 0 : response.data[0].totalRegistros;
        this.nombreArchivo = ((response.data || []).length === 0) ? '' : response.data[0].nombreArchivo;
        this.fechaCarga = ((response.data || []).length === 0) ? '' : response.data[0].fechaCarga;

        this.registrosErrados = ((response.data || []).length === 0) ? 0 : response.data[0].registrosErrados;
        this.registrosCorrectos = ((response.data || []).length === 0) ? 0 : response.data[0].registrosCorrectos;
      }
      else if (response && (response.statusCode === 401 || response.error === MISSING_TOKEN.INVALID_TOKEN)) {
        this.dataService.Message().msgInfo(PASSPORT_MESSAGE.SESION_END, () => { this.dataService.Storage().passportUILogin(); });
      } else {
        this._dataChange.next([]);
        this.totalRegistros = 0;
        this.registrosErrados = 0;
        this.registrosCorrectos = 0;
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

  get data(): any {
    return this._dataChange.value || [];
  }
}
