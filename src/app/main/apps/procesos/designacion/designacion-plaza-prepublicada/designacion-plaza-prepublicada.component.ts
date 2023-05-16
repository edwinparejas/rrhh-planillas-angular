import { saveAs } from 'file-saver';
import { SelectionModel, CollectionViewer } from '@angular/cdk/collections';
import { DataSource } from '@angular/cdk/table';
import { AfterViewInit, Component, OnDestroy, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { FormGroup, FormBuilder } from '@angular/forms';
import { MatPaginator } from '@angular/material/paginator';
import { ActivatedRoute, Router } from '@angular/router';
import { mineduAnimations } from '@minedu/animations/animations';
import { DataService } from 'app/core/data/data.service';
import { TablaProcesosConfiguracionAcciones } from 'app/core/model/action-buttons/action-types';
import { PASSPORT_MESSAGE, CONFIGURACION_PROCESO_MESSAGE, SNACKBAR_BUTTON } from 'app/core/model/messages-error';
import { SecurityModel } from 'app/core/model/security/security.model';
import { SharedService } from 'app/core/shared/shared.service';
import { of, BehaviorSubject, Observable } from 'rxjs';
import { tap, catchError, finalize } from 'rxjs/operators';

@Component({
  selector: 'minedu-designacion-plaza-prepublicada',
  templateUrl: './designacion-plaza-prepublicada.component.html',
  styleUrls: ['./designacion-plaza-prepublicada.component.scss'],
  encapsulation: ViewEncapsulation.None,
  animations: mineduAnimations
})
export class DesignacionPlazaPrepublicadaComponent implements OnInit, OnDestroy, AfterViewInit {

  form: FormGroup;
  working: boolean = false;
  plaza: any = null;

  permisoPassport = {
    buttonExportarProceso: false,
    buttonConsultarProceso: false
  }

  private passport: SecurityModel = new SecurityModel();
  filtroGrid: any = null;

  combo = {
    regimenesLaborales: [],
    estadosDesignacion: []
  }
  max = new Date(new Date().setFullYear(new Date().getFullYear() + 1));

  displayedColumns: string[] = [
    'region',
    'instanciaSubInstancia',
    'centroTrabajo',
    'codigoPlaza',
    'tipoCargo',
    'cargo',
    'condicionPlaza',
    'tipoPlaza',
    'fechaInicio',
    'fechaFin',
    'opciones'
  ];


  dataSource: PlazasPrepublicadasDataSource | null;
  selection = new SelectionModel<any>(false, []);
  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private formBuilder: FormBuilder,
    private sharedService: SharedService,
    private dataService: DataService) { }

  ngOnInit(): void {
    this.defaultPermisoPassport();
    this.defaultGrid();
    this.buildPassport();
    this.route.data.subscribe((data) => {
      if (data) {
        this.combo.estadosDesignacion = (data['EstadosDesignacion'] || { data: [] }).data;
      }
    });
  }


  ngAfterViewInit() {
    this.paginator.page
      .pipe(
        tap(() => {
          if (!this.permisoPassport.buttonExportarProceso) {
            this.dataService.Message().msgWarning(PASSPORT_MESSAGE.BUTTON_UNAUTHORIZED, () => { });
            return;
          }
          this.obtenerClavePublica(TablaProcesosConfiguracionAcciones.Consultar);
        })
      )
      .subscribe();
  }

  buildPassport() {
    this.passport = this.dataService.Storage().getInformacionUsuario();
  }

  defaultPermisoPassport() {
    this.permisoPassport.buttonExportarProceso = this.dataService.Storage().tienePermisoAccion(TablaProcesosConfiguracionAcciones.Exportar);
    this.permisoPassport.buttonConsultarProceso = this.dataService.Storage().tienePermisoAccion(TablaProcesosConfiguracionAcciones.Consultar);
  }

  defaultGrid() {
    this.dataSource = new PlazasPrepublicadasDataSource(this.dataService);
    this.paginator.showFirstLastButtons = true;
    this.paginator._intl.itemsPerPageLabel = "Filas por tabla";
    this.paginator._intl.nextPageLabel = "Siguiente página";
    this.paginator._intl.previousPageLabel = "Página anterior";
    this.paginator._intl.firstPageLabel = "Primera página";
    this.paginator._intl.lastPageLabel = "Última página";
  }



  handleGrid() {
    const form = this.form.value;
    if (form.anio ||
      (form.idRegimenLaboral && parseInt(form.idRegimenLaboral) > 0) ||
      (form.idEstado && parseInt(form.idEstado) > 0)) {
      const d = {
        anio: form.anio,
        idRegimenLaboral: form.idRegimenLaboral,
        idEstado: form.idEstado,
        codigoRolPassport: this.passport?.codigoRol
      }
      this.filtroGrid = d;
      this.dataSource.load(d, (this.paginator.pageIndex + 1), this.paginator.pageSize);
    } else {
      this.dataService.Message().msgWarning('Debe ingresar por lo menos un criterio de búsqueda.', () => { });
    }
  }

  handlePlazasaConvocar() {

  }

  handlePlazasObservadas() {

  }

  handleMigrarPlazas() {

  }

  handleInformacion(row) {

  }

  handleExportar() {
    if (!this.permisoPassport.buttonExportarProceso) {
      this.dataService.Message().msgWarning(PASSPORT_MESSAGE.BUTTON_UNAUTHORIZED, () => { });
      return;
    }
    this.obtenerClavePublica(TablaProcesosConfiguracionAcciones.Exportar);
  }

  exportar() {
    if (this.filtroGrid) {
      this.dataService.Spinner().show("sp6");
      this.dataService.GestionProcesos().exportarProcesos(this.filtroGrid).pipe(
        catchError((e) => { this.dataService.SnackBar().msgError(CONFIGURACION_PROCESO_MESSAGE.EXPORTAR_PROCESOS, SNACKBAR_BUTTON.CLOSE); return of(e); }),
        finalize(() => { this.dataService.Spinner().hide("sp6"); })
      ).subscribe((response: any) => {
        if (response) {
          saveAs(response, "Designacion de procesos.xlsx");
        } else if (response && (response.statusCode === 422 || response.statusCode === 404)) {
          this.dataService.Message().msgWarning(response.messages[0], () => { });
        } else {
          this.dataService.Message().msgWarning('No se encontró información para los criterios de búsqueda ingresado', () => { });
        }
      });
    } else {
      this.dataService.Message().msgWarning('Debe ingresar por lo menos un criterio de búsqueda', () => { });
      return;
    }
  }


  obtenerClavePublica(operacion: TablaProcesosConfiguracionAcciones) {
    this.dataService.Spinner().show("sp6");
    this.dataService.Passport().boot().pipe(
      catchError(() => of(null))
    ).subscribe((response: any) => {
      if (response) {
        const d = JSON.parse(response);
        this.confirmarOperacion(d.Token, operacion);
      } else {
        this.dataService.Spinner().hide("sp6");
        this.dataService.Message().msgWarning(PASSPORT_MESSAGE.BUTTON_UNAUTHORIZED, () => { });
      }
    });
  }

  confirmarOperacion(token: any, operacion: TablaProcesosConfiguracionAcciones) {
    console.log(operacion);
    const parametroPermiso = this.dataService.Storage().getParamAccion(operacion);
    const param = this.dataService.Cifrado().PassportEncode(token, parametroPermiso);
    this.dataService.Passport().getAutorizacion(param).pipe(
      catchError(() => { this.dataService.SnackBar().msgError(PASSPORT_MESSAGE.BUSCAR_AUTHORIZACION, 'Cerrar'); return of(null) }),
      finalize(() => { this.dataService.Spinner().hide("sp6"); })
    ).subscribe(response => {
      if (response && !response.HasErrors) {
        const data = response.Data[0];
        if (data.ESTA_AUTORIZADO) {
          switch (operacion) {
            case TablaProcesosConfiguracionAcciones.Consultar: {
              this.handleGrid();
              break;
            }
            case TablaProcesosConfiguracionAcciones.Exportar: {
              this.exportar();
              break;
            }
          }
        } else {
          this.dataService.Message().msgWarning(PASSPORT_MESSAGE.BUTTON_UNAUTHORIZED, () => { });
        }
      } else {
        this.dataService.Message().msgWarning(PASSPORT_MESSAGE.BUTTON_UNAUTHORIZED, () => { });
      }
    });
  }

  ngOnDestroy() {
  }
}


export class PlazasPrepublicadasDataSource extends DataSource<any>{

  private _dataChange = new BehaviorSubject<any>([]);
  private _totalRows = 0;
  private _loadingChange = new BehaviorSubject<boolean>(false);

  public loading = this._loadingChange.asObservable();

  constructor(private dataService: DataService) {
    super();
  }

  load(data: any, pageIndex: number, pageSize: number) {
    this._loadingChange.next(true);
    this.dataService.Spinner().show("sp6");
    this.dataService.Designacion().consultarDesignaciones(data, pageIndex, pageSize).pipe(
      catchError((e) => { return of(e); }),
      finalize(() => { this._loadingChange.next(false); this.dataService.Spinner().hide("sp6"); })
    ).subscribe((response: any) => {
      if (response && (response.data || []).length > 0) {
        this._totalRows = (response.data[0] || [{ totalRegistro: 0 }]).totalRegistro;
        this._dataChange.next(response.data || []);
      } else if (response && (response.statusCode === 422 || response.statusCode === 404)) {
        this._totalRows = 0;
        this._dataChange.next([]);
        this.dataService.Message().msgWarning(response.messages[0], () => { });
      } else {
        this._totalRows = 0;
        this._dataChange.next([]);
        this.dataService.Message().msgWarning('No se encontró información para los criterios de búsqueda ingresado', () => { });
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

