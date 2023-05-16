import { Component, OnInit, ViewEncapsulation, ViewChild } from '@angular/core';
import { mineduAnimations } from '@minedu/animations/animations';
import { Subscription, BehaviorSubject, of, Observable, Subject } from 'rxjs';
import { SelectionModel, DataSource, CollectionViewer } from '@angular/cdk/collections';
import { ActivatedRoute, Router } from '@angular/router';
import { catchError, finalize } from 'rxjs/operators';
import { MatTabChangeEvent } from '@angular/material/tabs';
import { MatPaginator } from '@angular/material/paginator';
import { ArchivoCargaComponent } from './archivo-carga/archivo-carga.component';
import { DetalleErrorComponent } from './detalle-error/detalle-error.component';
import { HistorialCargaComponent } from './historial-carga/historial-carga.component';
import { DataService } from 'app/core/data/data.service';
import { GlobalsService } from 'app/core/shared/globals.service';
import { TablaEstadoCargaMasiva, TablaMetodosCargaMasiva } from 'app/core/model/types-cargamasiva';
import { LocalStorageService } from '@minedu/services/secure/local-storage.service';
import { PASSPORT_MESSAGE } from 'app/core/model/message';
import { MISSING_TOKEN } from 'app/core/model/types';
import { TablaAccionesPassport } from 'app/core/model/action-types';
import { SharedService } from '../../../../core/shared/shared.service';

@Component({
  selector: 'minedu-carga-masiva',
  templateUrl: './carga-masiva.component.html',
  styleUrls: ['./carga-masiva.component.scss'],
  encapsulation: ViewEncapsulation.None,
  animations: mineduAnimations
})
export class CargaMasivaComponent implements OnInit {


  working = false;
  displayedColumns: string[] = ['index', 'idCarga', 'idFormato', 'formato', 'nombreArchivo', 'usuario', 'fechaCarga', 'estado', 'accion'];
  ultimoRegistro: any;
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

  dataSource: CargaMasivaDataSource | null;
  selection = new SelectionModel<any>(false, []);
  nuevaCarga = false;
  verDetalle = false;
  verCargasEnProceso = false;
  ocultarSeccionInferior: boolean = true;


  @ViewChild('paginatorCargaMasiva', { static: true }) paginator: MatPaginator;
  @ViewChild(ArchivoCargaComponent) archivoCarga: ArchivoCargaComponent
  @ViewChild(ArchivoCargaComponent) listarDetalle: ArchivoCargaComponent;
  @ViewChild(DetalleErrorComponent) listarDetalleError: DetalleErrorComponent;

  @ViewChild(ArchivoCargaComponent) private tabArchivoCarga: ArchivoCargaComponent;
  @ViewChild(HistorialCargaComponent) private tabHistorialCarga: HistorialCargaComponent;

  constructor(
    private sharedService: SharedService,
    private route: ActivatedRoute,
    private router: Router,
    private dataService: DataService,
    public globals: GlobalsService,
    private localStorageService: LocalStorageService
  ) {
  }

  ngOnInit(): void {
    setTimeout((_) => this.buildShared());
    
    this.route.data.subscribe((data) => {
      if (data) {
          console.log("Carga Masiva >> data recibida: ", data)
        this.route.params.subscribe((parametro) => { if (parametro) { this.parametro = parametro.codigo; } });
        console.log("Carga Masiva >> parametro: ", this.parametro)
        
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
        console.log("Carga Masiva >> data Datos de sistema generado: ", this.datosSistema);
        

        this.registroConsulta = data['CargaMasiva'];
      }
    });

    this.dataSource = new CargaMasivaDataSource(this.dataService);
    this.paginator.showFirstLastButtons = true;
    this.paginator._intl.itemsPerPageLabel = 'Registros por página';
    this.paginator._intl.nextPageLabel = 'Siguiente página';
    this.paginator._intl.previousPageLabel = 'Página anterior';
    this.paginator._intl.firstPageLabel = 'Primera página';
    this.paginator._intl.lastPageLabel = 'Última página';
  }

  ngAfterViewInit() {
    this.paginator.page.subscribe(() => this.loadData((this.paginator.pageIndex + 1).toString(), this.paginator.pageSize.toString()));
    setTimeout(() => {
      this.refrescar();
    }, 0);
  }

  loadCargaMasivaCabecera() {
    this.dataSource.load(this.datosSistema, (this.paginator.pageIndex + 1), this.globals.paginatorPageSize);
  }

  loadData(pageIndex, pageSize) {
    this.dataSource.load(this.datosSistema, pageIndex, pageSize);
  }

  nuevo() {
    this.obtenerClavePublica(TablaAccionesPassport.Agregar, true, TablaMetodosCargaMasiva.NUEVA_CARGA);
  }

  private handleNuevaCarga() {
    this.ocultarSeccionInferior = false;
    this.dataService.Spinner().hide("sp6");
    if (this.nuevaCarga) return true;
    this.nuevaCarga = true;
    this.verDetalle = false;
    this.localStorageService.removeItem('registro');
    this.archivoCarga.enabledControls();
    this.listarDetalleError.loadDataSource();
  }

  cerrar(resp) {
    this.localStorageService.removeItem('registro');
    this.nuevaCarga = false;
    this.verDetalle = false;
  }

  cargarDocumento(resp) {
    if (resp) {
      this.nuevaCarga = false;
      this.verDetalle = true;
    }
    else {
      this.nuevaCarga = false;
      this.verDetalle = true;
    }
  }

  cerrar_carga() {
    this.localStorageService.removeItem('registro');
    this.nuevaCarga = false;
    this.verDetalle = false;
  }

  refrescar() {
    this.obtenerClavePublica(TablaAccionesPassport.Consultar, true, TablaMetodosCargaMasiva.REFRESCAR);
  }

  private handleRefrescar() {
    this.ultimoRegistro = JSON.parse(this.localStorageService.getItem('registro'));
    this.loadCargaMasivaCabecera();
    if (this.ultimoRegistro !== null) {
      setTimeout(() => {
        if (this.nuevaCarga || this.verDetalle) {
          this.listarDetalle.cargarDatos(this.ultimoRegistro);

          if (this.ultimoRegistro.codigoEstado === TablaEstadoCargaMasiva.ValidadoConError)
            this.listarDetalleError.cargarDatosError(this.ultimoRegistro);
        }
      }, 600);
    }
    else {
      setTimeout(() => {
        if (this.nuevaCarga || this.verDetalle) {
          this.listarDetalleError.loadDataSource();
        }
      }, 600);
    }
  }

  retornar() {
    this.localStorageService.removeItem('registro');
    this.router.navigate(['../../'], { relativeTo: this.route });
  }

  ver(registro) {
    this.obtenerClavePublica(TablaAccionesPassport.Consultar, true, TablaMetodosCargaMasiva.VER_DETALLE, registro);
  }

  private handleVer(registro) {
    this.ocultarSeccionInferior = false;
    this.nuevaCarga = false;
    this.verDetalle = true;
    setTimeout(() => {
      const data = {
        idCarga: registro.idCarga,
        idFormato: registro.idFormato,
        codigoEstado: registro.codigoEstado,
        idEstado: registro.idEstado
      };

      this.localStorageService.setItem('registro', JSON.stringify(data));
      this.listarDetalle.cargarDatos(data);

      if (data.codigoEstado === TablaEstadoCargaMasiva.ValidadoConError || data.codigoEstado === TablaEstadoCargaMasiva.ProcesadoConError)
        this.listarDetalleError.cargarDatosError(data, true);
    }, 900);
  }

  anular(idCarga: string) {
    this.obtenerClavePublica(TablaAccionesPassport.Importar, true, TablaMetodosCargaMasiva.ANULAR_CARGA, { idCarga: idCarga });
  }

  private handleAnular(parametro) {
    const usuario = this.dataService.Storage().getPassportUserData();
    const rol = this.dataService.Storage().getPassportRolSelected();
    const carga = {
      idCarga: parametro.idCarga,
      // usuarioModificacion: 'Admin',
      usuarioModificacion: usuario.NOMBRES_USUARIO,
      codigoTipoSede: rol.CODIGO_TIPO_SEDE,
      codigoSede: rol.CODIGO_SEDE
    };
    this.dataService.Spinner().hide("sp6");
    this.dataService.Util().msgConfirm('¿Está seguro de que desea anular la carga masiva?', () => {
      this.dataService.Spinner().show("sp6");
      this.dataService.CargaMasiva().anularCargaMasiva(carga).pipe(
        catchError((e) => of(e)),
        finalize(() => { this.working = false; this.dataService.Spinner().hide("sp6"); })
      ).subscribe(response => {
        if (response && response.result) {
          this.dataService.Util().msgSuccess('Operación realizada de forma exitosa',
            () => {
              this.ocultarSeccionInferior = true;
              this.loadCargaMasivaCabecera();
            });
        } else if (response && response.statusCode === 404) {
          this.dataService.Util().msgWarning(response.messages[0], () => { });
        } else if (response && response.statusCode === 422) {
          this.dataService.Util().msgWarning(response.messages[0], () => { });
        } else if (response && (response.statusCode === 401 || response.error === MISSING_TOKEN.INVALID_TOKEN)) {
          this.dataService.Message().msgInfo(PASSPORT_MESSAGE.SESION_END, () => { this.dataService.Storage().passportUILogin(); });
        } else {
          this.dataService.Util().msgError('Ocurrieron algunos problemas al anular la carga masiva, por favor intente dentro de unos segundos, gracias.', () => { });
        }
      });
    }, () => { });
  }


  onTabChanged(event: MatTabChangeEvent) {
    this.ocultarSeccionInferior = true;
    if (event.index === 0) 
    { 
      this.tabHistorialCarga.cerrar_carga();
      this.refrescar(); 
    }
    else {
      this.cerrar_carga();
      this.tabHistorialCarga.ngOnInit();
    }
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
    /*
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
        */
        let data = {
            ESTA_AUTORIZADO : true
        };
        if (data.ESTA_AUTORIZADO) {  
          switch (method) {
            case TablaMetodosCargaMasiva.NUEVA_CARGA: {
              this.handleNuevaCarga();
              break;
            }
            case TablaMetodosCargaMasiva.REFRESCAR: {
              this.handleRefrescar();
              break;
            }
            case TablaMetodosCargaMasiva.VER_DETALLE: {
              this.handleVer(parametro);
              break;
            }
            case TablaMetodosCargaMasiva.ANULAR_CARGA: {
              this.handleAnular(parametro);
              break;
            }          
          }
        } else {
          this.dataService.Spinner().hide("sp6");
          if (!requiredLogin) { this.dataService.Message().msgWarning(PASSPORT_MESSAGE.PERMISO_NOT_FOUND, () => { }); }
          else { this.dataService.Message().msgInfo(PASSPORT_MESSAGE.BUTTON_UNAUTHORIZED, () => { this.dataService.Storage().passportUILogin(); }); }
          return;
        }
        /*
      } else {
        this.dataService.Spinner().hide("sp6");
        this.dataService.Message().msgInfo(PASSPORT_MESSAGE.BUTTON_UNAUTHORIZED, () => { this.dataService.Storage().passportUILogin(); });
      }
    });
    */
  }

  buildShared() {
    this.sharedService.setSharedBreadcrumb("Contratación / Contratación Resultados de PUN");
    this.sharedService.setSharedTitle("Carga Masiva");
}
}

export class CargaMasivaDataSource extends DataSource<any>{

  private _dataChange = new BehaviorSubject<any>([]);
  private _loadingChange = new BehaviorSubject<boolean>(false);

  public loading = this._loadingChange.asObservable();
  public totalregistro = 0;

  constructor(private dataService: DataService) {
    super();
  }

  load(data, pageIndex, pageSize) {
    this.dataService.Spinner().show("sp6");
    this._loadingChange.next(true);
    this.dataService.CargaMasiva().getCargaMasiva(data, pageIndex, pageSize).pipe(
      catchError((e) => of(e)),
      finalize(() => { this._loadingChange.next(false); this.dataService.Spinner().hide("sp6"); })
    ).subscribe((response: any) => {
      if (response && response.result) {
        this._dataChange.next(response.data || []);
        this.totalregistro = ((response.data || []).length === 0) ? 0 : response.data[0].totalRegistro;
      } else if (response && (response.statusCode === 401 || response.error === MISSING_TOKEN.INVALID_TOKEN)) {
        this.dataService.Message().msgInfo(PASSPORT_MESSAGE.SESION_END, () => { this.dataService.Storage().passportUILogin(); });
      } else {
        this._dataChange.next([]);
        this.totalregistro = 0;
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
