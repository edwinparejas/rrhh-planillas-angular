import { CollectionViewer, DataSource, SelectionModel } from '@angular/cdk/collections';
import { HttpErrorResponse } from '@angular/common/http';
import { AfterViewInit, Component, OnDestroy, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { ActivatedRoute, Router } from '@angular/router';
import { mineduAnimations } from '@minedu/animations/animations';
import { DataService } from 'app/core/data/data.service';
import { CentroTrabajoModel } from 'app/core/model/centro-trabajo.model';
import { SecurityModel } from 'app/core/model/security/security.model';
import { TablaEquivalenciaSede, TablaRolPassport } from 'app/core/model/types';
import { descargarExcel } from 'app/core/utility/functions';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { catchError, finalize, tap } from 'rxjs/operators';
import { InstanciasViewComponent } from '../components/instancias-view/instancias-view.component';
import { MESSAGE_GESTION } from './_utils/messages';
import { CodigoEstadoProceso } from './_utils/types-gestion';

@Component({
  selector: 'minedu-gestion-proceso',
  templateUrl: './gestion-proceso.component.html',
  styleUrls: ['./gestion-proceso.component.scss'],
  encapsulation: ViewEncapsulation.None,
  animations: mineduAnimations
})
export class GestionarProcesoComponent implements OnInit, OnDestroy, AfterViewInit {

  form: FormGroup;
  export: boolean = false;
  working: boolean = false;
  tiempoMensaje: number = 3000;

  private passport: SecurityModel = new SecurityModel();
  centroTrabajo: CentroTrabajoModel = null;
  codEstadoProceso = CodigoEstadoProceso;
  filtroGrid: any = null;
  permisoGeneral: any;

  combo = {
    regimenesLaborales: [],
    estadosProceso: [],
    tiposProceso: [],
    procesos: []
  }
  max = new Date(new Date().setFullYear(new Date().getFullYear() + 1));

  displayedColumns: string[] = [
    'index',
    'anio',
    'regimenLaboral',
    'tipoProceso',
    'proceso',
    'codigo',
    'numeroConvocatoria',
    'tipoAlcance',
    'fechaCreacion',
    'estado',
    'opciones'
  ];

  dialogRef: any;

  dataSource: ProcesosDataSource | null;
  selection = new SelectionModel<any>(false, []);
  @ViewChild(MatPaginator, { static: true })
  paginator: MatPaginator;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private formBuilder: FormBuilder,
    private dataService: DataService,
    private _materialDialog: MatDialog
    ) { }

  ngOnInit(): void {
    this.buildForm();
    this.default();
    this.defaultGrid();
    this.buildPassport();
    
    if (this.passport.codigoRol === TablaRolPassport.MONITOR && 
      this.passport.codigoTipoSede !== TablaEquivalenciaSede.CODIGO_TIPO_SEDE_UGEL) {
      // this.CambiarInstancia();
      
    } else {
      this.getPermisoGeneral();
      this.defaultComboRegimenLaboral();
      this.defaultComboTiposProceso();
      this.defaultComboEstadosProceso();
      this.entidadPassport();
    }
  }


  ngAfterViewInit() {
    this.paginator.page
      .pipe(
        tap(() => this.handleGrid(true))
      )
      .subscribe();
  }

  buildForm() {
    this.form = this.formBuilder.group({
      anio: [null],
      fechaConfiguracion: [new Date()],
      idRegimenLaboral: [null],
      idTipoProceso: [null],
      idDescripcionMaestroProceso: [null],
      idEstado: [null]
    });

    this.form.get("fechaConfiguracion").valueChanges.subscribe(value => {
      this.form.patchValue({ anio: value?.getFullYear() });
    });
    
    this.form.get("idTipoProceso").valueChanges.subscribe(value => {
      this.combo.procesos = [];
      this.form.patchValue({ idDescripcionMaestroProceso: "-1" });
      if (value && value > 0 ) {
        this.form.get('idDescripcionMaestroProceso').enable();
        this.defaultComboProcesos(value);
      } else
        this.form.get('idDescripcionMaestroProceso').disable();
    });
  }

  CambiarInstancia() {
    this.dialogRef = this._materialDialog.open(InstanciasViewComponent, {
        panelClass: "modal-instancias",
        disableClose: true,
        data: {},
    });
    
    this.dialogRef.afterClosed()
      .subscribe((response: any) => {
        if (!response) { 
          this.dataService.Message().msgWarning(MESSAGE_GESTION.INVALID_INSTANCIA_MONITOR, 
            () => { this.router.navigate(["ayni", "personal"]) }); 
          return; 
          };
         
        if (response) {
          const esRolMonitor = this.passport.codigoRol === TablaRolPassport.MONITOR;
          
          if (esRolMonitor && this.passport.codigoTipoSede !== TablaEquivalenciaSede.CODIGO_TIPO_SEDE_UGEL) {
            const instancia = this.dataService.Storage().getInstanciaSelected();
            if (instancia) {
              this.passport.codigoTipoSede = instancia.codigoTipoSede;
              this.passport.codigoSede = instancia.codigoInstancia;
              
              this.getPermisoGeneral();
              this.defaultComboRegimenLaboral();
              this.defaultComboTiposProceso();
              this.defaultComboEstadosProceso();
              this.entidadPassport();
            }
          }
        }
      });
  }

  buildPassport() {
    this.passport = this.dataService.Storage().getInformacionUsuario();
    
    if (this.passport.codigoTipoSede === TablaEquivalenciaSede.CODIGO_TIPO_SEDE)
        this.passport.codigoSede = TablaEquivalenciaSede.CODIGO_SEDE;    
  }

  default() {
    this.form.patchValue({ fechaConfiguracion: new Date(), idRegimenLaboral: "-1", idTipoProceso: "-1", idDescripcionMaestroProceso: "-1", idEstado: "-1" });
  }

  defaultGrid() {
    this.dataSource = new ProcesosDataSource(this.dataService);
    this.buildPaginators(this.paginator);
  }

  buildPaginators(paginator: MatPaginator): void {
      paginator.showFirstLastButtons = true;
      paginator._intl.itemsPerPageLabel = "Registros por página";
      paginator._intl.nextPageLabel = "Siguiente página";
      paginator._intl.previousPageLabel = "Página anterior";
      paginator._intl.firstPageLabel = "Primera página";
      paginator._intl.lastPageLabel = "Última página";
      paginator._intl.getRangeLabel = (page: number, pageSize: number, length: number) => {
          if (length === 0 || pageSize === 0) {return `0 de ${length}`;}
          const length2 = Math.max(length, 0);
          const startIndex = page * pageSize;
          const endIndex = startIndex < length2 ? Math.min(startIndex + pageSize, length2) : startIndex + pageSize;
          return `${startIndex + 1} – ${endIndex} de ${length2}`;
      }
  }

  entidadPassport(){
    this.dataService.GestionProcesos().entidadPassport(this.passport.codigoSede).pipe(
      catchError((error: HttpErrorResponse) => {
        this.dataService.Message().msgWarning(error.error.messages[0]); return of(null);
      }),
    ).subscribe((response: any) => {
      if (response.length > 0){
        if (response.length > 1)
          response = response.filter(x => x.idNivelInstancia <= 3);
          
        if (response.length == 1 && response[0].idNivelInstancia == 3)
          this.passport.codigoTipoSede = TablaEquivalenciaSede.CODIGO_TIPO_SEDE_UGEL;

        this.centroTrabajo = response[0];
        this.handleGrid(true);
      }else{
        this.centroTrabajo = null;
      }
    });
  }
  
  getPermisoGeneral() {
    this.dataService.GestionProcesos().obtenerPermisoGeneral(this.passport.codigoRol)
      .pipe(
        catchError((error: HttpErrorResponse) => {
          this.dataService.Message().msgWarning(error.error.messages[0]); return of(null);
        }),
      ).subscribe(response => {
        if (response)
          this.permisoGeneral = response;
      });
  }

  defaultComboRegimenLaboral() {
    this.dataService.GestionProcesos().getComboRegimenesLaborales(this.passport.codigoRol).pipe(
      catchError((error: HttpErrorResponse) => {
        this.dataService.Message().msgWarning(error.error.messages[0]); return of(null);
      }),
      finalize(() => { })
    ).subscribe((response: any) => {
      if (response) 
        this.combo.regimenesLaborales = response;
      else 
        this.combo.regimenesLaborales = [];
      this.form.patchValue({ idRegimenLaboral: "-1" });
    });
  }

  defaultComboTiposProceso() {
    this.dataService.GestionProcesos().getComboTiposProceso(this.passport.codigoRol).pipe(
      catchError((error: HttpErrorResponse) => {
        this.dataService.Message().msgWarning(error.error.messages[0]); return of(null);
      }),
      finalize(() => { })
    ).subscribe((response: any) => {
      if (response) {
        this.combo.tiposProceso = response;
      } else {
        this.combo.tiposProceso = [];
      }
      this.form.patchValue({ idTipoProceso: "-1" });
    });
  }

  defaultComboProcesos(pIdTipoProceso) {
    if (!pIdTipoProceso) {
      this.combo.procesos = [];
      this.form.patchValue({ idDescripcionMaestroProceso: "-1" });
      return;
    }
    this.dataService.GestionProcesos().getComboMaestroProcesos(this.passport.codigoRol, null, pIdTipoProceso).pipe(
      catchError((error: HttpErrorResponse) => {
        this.dataService.Message().msgWarning(error.error.messages[0]); return of(null);
      }),
      finalize(() => { })
    ).subscribe((response: any) => {
      if (response) {
        this.combo.procesos = response.filter((v,i,a)=>a.findIndex(t=>(t.idDescripcionMaestroProceso===v.idDescripcionMaestroProceso))===i);
      } else {
        this.combo.procesos = [];
      }
      this.form.patchValue({ idDescripcionMaestroProceso: "-1" });
    });
  }

  defaultComboEstadosProceso() {
    this.dataService.GestionProcesos().getComboEstadosProceso().pipe(
      catchError((error: HttpErrorResponse) => {
        this.dataService.Message().msgWarning(error.error.messages[0]); return of(null);
      }),
      finalize(() => { })
    ).subscribe((response: any) => {
      if (response) {
        this.combo.estadosProceso = response;
      } else {
        this.combo.estadosProceso = [];
      }
      this.form.patchValue({ idEstado: "-1" });
    });
  }

  handleGrid(autoSearch: boolean = false) {
    const form = this.form.value;
    if (form.anio ||
      (form.idRegimenLaboral && parseInt(form.idRegimenLaboral) > 0) ||
      (form.idTipoProceso && parseInt(form.idTipoProceso) > 0) ||
      (form.idEstado && parseInt(form.idEstado) > 0)) {
      const d = {
        anio: form.anio,
        idRegimenLaboral: form.idRegimenLaboral === "-1" ? null : form.idRegimenLaboral,
        idTipoProceso: form.idTipoProceso === "-1" ? null : form.idTipoProceso,
        idDescripcionMaestroProceso: form.idDescripcionMaestroProceso === "-1" ? null : form.idDescripcionMaestroProceso,
        idEstado: form.idEstado === "-1" ? null : form.idEstado,
        codigoRolPassport: this.passport?.codigoRol,
        codigoTipoSede: this.passport?.codigoTipoSede,
        idOtraInstancia: this.centroTrabajo?.idOtraInstancia,
        idDre: this.centroTrabajo?.idDre,
        idUgel: this.centroTrabajo?.idUgel,
        idInstitucionEducativa: this.centroTrabajo?.idInstitucionEducativa
      }
      this.filtroGrid = d;
      this.dataSource.load(d, (this.paginator.pageIndex + 1), this.paginator.pageSize, autoSearch);
    } else {
      this.dataService.Message().msgWarning(MESSAGE_GESTION.M01, () => { });
    }
  }

  handleLimpiar() {
    this.default();
    this.handleGrid(true);
  }

  handleBuscar() {
    this.handleGrid();
  }

  handleCrear() {
    this.router.navigate([0, 'create','proceso'], { relativeTo: this.route, skipLocationChange:true });
  }

  handleExportar() {
    if (this.filtroGrid) {
      this.dataService.Spinner().show("sp6");
      this.dataService.GestionProcesos().exportarProcesos(this.filtroGrid).pipe(
        catchError((error: HttpErrorResponse) => {
          this.dataService.Message().msgWarning(error.error.messages[0]); return of(null);
        }),
        finalize(() => { this.dataService.Spinner().hide("sp6"); })
      ).subscribe((response: any) => {
        if (response) {
          descargarExcel(response, `Gestión de Procesos ${this.form.value.anio}.xlsx`);
        }
      });
    } else {
      this.dataService.Message().msgWarning(MESSAGE_GESTION.M01, () => { });
      return;
    }
  }

  handleEtapas(row: any) {
    this.router.navigate([row.idProceso, 'etapas'], { relativeTo: this.route });
  }

  handleCronograma(row: any) {
    this.router.navigate([row.idProceso, 'cronogramas'], { relativeTo: this.route });
  }

  handleComite(row: any) {
    this.router.navigate([row.idProceso, 'comites'], { relativeTo: this.route });
  }

  routeGenerator = (data: any): string => {
    const param = data.anio + "" +
      (data.idRegimenLaboral + "").padStart(3, "0") +
      (data.idTipoProceso + "").padStart(3, "0") +
      data.codigoProceso.replace("-", "") + "" +
      data.idProceso;
    return param;
  }

  handleInformacion(row) {
    this.router.navigate([row.idProceso, 'info','proceso'], { relativeTo: this.route, skipLocationChange:true });
  }

  handleModificar(row) {
    this.router.navigate([row.idProceso, 'edit','proceso'], { relativeTo: this.route, skipLocationChange:true });
  }

  handleEliminar(row, index) {
    var data = {
      idProceso: row.idProceso,
      usuarioModificacion: this.passport.numeroDocumento
    }

    this.dataService.Message().msgConfirm(MESSAGE_GESTION.M05, () => {
      this.dataService.Spinner().show("sp6");
      this.working = true;
      this.dataService.GestionProcesos().deleteProceso(data)
        .pipe(
          catchError((error: HttpErrorResponse) => {
            this.dataService.Message().msgWarning(error.error.messages[0]); return of(null);
          }),
          finalize(() => { this.dataService.Spinner().hide("sp6"); this.working = false; })
        ).subscribe(response => {
          if (response && response > 0) 
            this.dataService.Message().msgAutoCloseSuccessNoButton(MESSAGE_GESTION.M07, this.tiempoMensaje);
          this.handleGrid(true);
        });
    });
  }

  handleNuevaConvocatoria(row: any) {
    this.router.navigate([row.idProceso, 'nuevaconvocatoria', 'proceso'], { relativeTo: this.route });
  }

  ngOnDestroy() {
  }
}

export class ProcesosDataSource extends DataSource<any>{

  private _dataChange = new BehaviorSubject<any>([]);
  private _totalRows = 0;
  private _loadingChange = new BehaviorSubject<boolean>(false);

  public loading = this._loadingChange.asObservable();

  constructor(private dataService: DataService) {
    super();
  }

  load(data: any, pageIndex: number, pageSize: number, autoSearch: boolean) {
    this._loadingChange.next(true);
    this.dataService.Spinner().show("sp6");
    this.dataService.GestionProcesos().consultarProcesos(data, pageIndex, pageSize).pipe(
      catchError((error: HttpErrorResponse) => {
        if (!autoSearch)
          this.dataService.Message().msgWarning(error.error.messages[0]); return of(null);
      }),
      finalize(() => { this._loadingChange.next(false); this.dataService.Spinner().hide("sp6"); })
    ).subscribe((response: any) => {
      if (response && (response || []).length > 0) {
        this._totalRows = (response[0] || [{ totalRegistro: 0 }]).totalRegistro;
        this._dataChange.next(response || []);
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

