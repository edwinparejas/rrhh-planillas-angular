import { Component, OnInit, ViewEncapsulation, ViewChild } from '@angular/core';
import { mineduAnimations } from '@minedu/animations/animations';
import { BehaviorSubject, of, Observable } from 'rxjs';
import { SelectionModel, DataSource, CollectionViewer } from '@angular/cdk/collections';
import { ActivatedRoute } from '@angular/router';
import { catchError, finalize } from 'rxjs/operators';
import { MatPaginator } from '@angular/material/paginator';
import { ArchivoCargaComponent } from './../archivo-carga/archivo-carga.component';
import { DataService } from 'app/core/data/data.service';
import { GlobalsService } from 'app/core/shared/globals.service';
import { TablaEstadoCargaMasiva, TablaMetodosCargaMasiva } from 'app/core/model/types-cargamasiva';
import { LocalStorageService } from '@minedu/services/secure/local-storage.service';
import { PASSPORT_MESSAGE } from 'app/core/model/message';
import { MISSING_TOKEN } from 'app/core/model/types';
import { TablaAccionesPassport } from 'app/core/model/action-types';

@Component({
  selector: 'minedu-historial-carga',
  templateUrl: './historial-carga.component.html',
  styleUrls: ['./historial-carga.component.scss'],
  encapsulation: ViewEncapsulation.None,
  animations: mineduAnimations
})
export class HistorialCargaComponent implements OnInit {

  parametro: any = null;
  registroConsulta: any = null;

  datosSistema = {
    datosRegistroOrigen: null,
    codigoSistema: null,
    codigoFuncionalidad: null,
    parametro: null,
    parametro2: null,
    idParametro: null,
    codigoRol: null,
    codigoTipoSede: null,
    codigoSede: null
  };

  EstadoCargaMasiva = {
    EnProcesoCarga: TablaEstadoCargaMasiva.EnProcesoCarga,
    Cargado: TablaEstadoCargaMasiva.Cargado,
    EnProcesoValidacion: TablaEstadoCargaMasiva.EnProcesoValidacion,
    Validado: TablaEstadoCargaMasiva.Validado,
    ProcesandoCarga: TablaEstadoCargaMasiva.ProcesandoCarga,
    Procesado: TablaEstadoCargaMasiva.Procesado,
    Anulado: TablaEstadoCargaMasiva.Anulado,
    CargadoConError: TablaEstadoCargaMasiva.CargadoConError,
    ValidadoConError: TablaEstadoCargaMasiva.ValidadoConError,
    ProcesadoConError: TablaEstadoCargaMasiva.ProcesadoConError
  };

  displayedColumns: string[] = ['index', 'idCarga', 'idFormato', 'formato', 'nombreArchivo', 'usuario', 'fechaCarga', 'registrosCorrectos', 'registrosErrados', 'estado', 'accion'];

  dataSource: HistorialCargaDataSource | null;
  selection = new SelectionModel<any>(false, []);
  verDetalle: boolean = false;
  @ViewChild('paginatorCargaMasivaHistorial', { static: true }) paginator: MatPaginator;

  @ViewChild(ArchivoCargaComponent) listarDetalle: ArchivoCargaComponent;

  constructor(
    private route: ActivatedRoute,
    private dataService: DataService,
    public globals: GlobalsService,
    private localStorageService: LocalStorageService
  ) {
  }

  ngOnInit(): void {
    setTimeout(() => {
      this.dataService.Spinner().show("sp6");
    }, 0);
    this.route.data.subscribe((data) => {
      if (data) {
        this.route.params.subscribe((parametro) => { if (parametro) { this.parametro = parametro.codigo; } });

        const rol = this.dataService.Storage().getPassportRolSelected();
        this.datosSistema = {
          datosRegistroOrigen: this.parametro,
          codigoSistema: this.parametro.substr(0, 3),
          codigoFuncionalidad: this.parametro.substr(3, 4),
          parametro: this.parametro.substr(7, 10),
          parametro2: this.parametro.substr(17, 10),
          idParametro: this.parametro.substr(27, 10),
          codigoRol: rol.CODIGO_ROL,
          codigoTipoSede: rol.CODIGO_TIPO_SEDE,
          codigoSede: rol.CODIGO_SEDE
        };

        this.registroConsulta = data['Ratificacion'];
      }
    });

    this.buildForm();
  }

  ngAfterViewInit() {
    this.paginator.page.subscribe(() => this.loadData((this.paginator.pageIndex + 1).toString(), this.paginator.pageSize.toString()));
  }


  loadData(pageIndex, pageSize) {
    this.obtenerClavePublica(TablaAccionesPassport.Consultar, true, TablaMetodosCargaMasiva.GRID_HISTORIAL_CARGAS_MASIVAS, { pageIndex: pageIndex, pageSize: pageSize });
  }

  private handleLoadData(parametro) {
    this.dataSource.load(this.datosSistema, parametro.pageIndex, parametro.pageSize);
  }

  buildForm() {
    this.dataSource = new HistorialCargaDataSource(this.dataService);
    this.dataSource.load(this.datosSistema, (this.paginator.pageIndex + 1), this.globals.paginatorPageSize);
  }

  exportarHistorial() {
    const data = this.dataSource.data;    
    if (data.length == 0) {
      this.dataService.Message().msgWarning('NO HAY REGISTROS DE HISTORIAL DE CARGAS PARA EXPORTAR.', () => { });
      return;
    }
    this.obtenerClavePublica(TablaAccionesPassport.Consultar, true, TablaMetodosCargaMasiva.EXPORTAR_DETALLE_CARGA_MASIVA);
  }

  private handleExportarHistorial() {
    this.dataService.CargaMasiva().exportarHistorialCargaMasivaExcel()
      .pipe(
        catchError(() => { return of(null) }),
        finalize(() => { this.dataService.Spinner().hide("sp6"); })
      ).subscribe((response) => {
        const nombreFile: string = 'HistorialCargaMasiva.xlsx';
        this.dataService.CargaMasiva().downloadFile(response, nombreFile);
      });
  }

  cerrar(resp) {
    this.localStorageService.removeItem('registro_procesado');
  }

  cerrar_carga() {
    this.verDetalle = false;
    this.localStorageService.removeItem('registro_procesado');
  }


  ver(registro) {
    this.verDetalle = true;
    setTimeout(() => {
      const data = {
        idCarga: registro.idCarga,
        idFormato: registro.idFormato,
        codigoEstado: registro.codigoEstado,
        idEstado: registro.idEstado
      }
      this.localStorageService.setItem('registro_procesado', JSON.stringify(data));
      this.listarDetalle.cargarDatosProcesados(data);
    }, 600);
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
            case TablaMetodosCargaMasiva.GRID_HISTORIAL_CARGAS_MASIVAS: {
              this.handleLoadData(parametro);
              break;
            }
            case TablaMetodosCargaMasiva.EXPORTAR_DETALLE_CARGA_MASIVA: {
              this.handleExportarHistorial();
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

export class HistorialCargaDataSource extends DataSource<any>{

  private _dataChange = new BehaviorSubject<any>([]);
  private _loadingChange = new BehaviorSubject<boolean>(false);

  public loading = this._loadingChange.asObservable();
  public totalRegistros = 0;

  constructor(
    private dataService: DataService) {
    super();
  }

  load(data, pageIndex, pageSize) {
    this._loadingChange.next(true);
    this.dataService.CargaMasiva().getCargaMasivaHistorial(data, pageIndex, pageSize).pipe(
      catchError((e) => of(e)),
      finalize(() => { this._loadingChange.next(false); this.dataService.Spinner().hide("sp6"); })
    ).subscribe((response: any) => {
      if (response && response.result) {
        this._dataChange.next(response.data || []);
        this.totalRegistros = ((response.data || []).length === 0) ? 0 : response.data[0].totalRegistro;
      }
      else if (response && (response.statusCode === 401 || response.error === MISSING_TOKEN.INVALID_TOKEN)) {
        this.dataService.Message().msgInfo(PASSPORT_MESSAGE.SESION_END, () => { this.dataService.Storage().passportUILogin(); });
      } else {
        this._dataChange.next([]);
        this.totalRegistros = 0;
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
