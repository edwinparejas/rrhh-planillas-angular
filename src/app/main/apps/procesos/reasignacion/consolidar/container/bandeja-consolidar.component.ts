import { Component, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { DataService } from 'app/core/data/data.service';
import { SecurityModel } from 'app/core/model/security/security.model';
import { SharedService } from 'app/core/shared/shared.service';
import { EtapaProcesoResponseModel, OpcionFiltro, ResultadoOperacionEnum } from '../../models/reasignacion.model';
import { HttpClient } from '@angular/common/http';
import { TablaPermisos } from 'app/core/model/types';
import { ActivatedRoute, Router } from '@angular/router';
import { catchError, finalize } from 'rxjs/operators';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { mineduAnimations } from '@minedu/animations/animations';
import { CollectionViewer, DataSource } from '@angular/cdk/collections';
import { MatPaginator } from '@angular/material/paginator';

@Component({
  selector: 'minedu-bandeja-consolidar',
  templateUrl: './bandeja-consolidar.component.html',
  styleUrls: ['./bandeja-consolidar.component.scss'],
  encapsulation: ViewEncapsulation.None,
  animations: mineduAnimations,
})
export class BandejaConsolidarComponent implements OnInit {
  form: FormGroup;
  etapa: EtapaProcesoResponseModel = new EtapaProcesoResponseModel();
  opcionFiltro: OpcionFiltro = new OpcionFiltro();
  idep: number;
  currentSession: SecurityModel = new SecurityModel();
  dataSource: ConsolidarDataSource | null;
  @ViewChild('paginator', { static: true }) paginator: MatPaginator;
  ipAddress = '';
  paginatorPageIndex = 0;
  paginatorPageSize = 10;
  comboLists = {
    listInstancia: [],
    listSubInstancia: [],
    listEstadoConsolidado: [],
  };
  isMobile = false;
  getIsMobile(): boolean {
    const w = document.documentElement.clientWidth;
    const breakpoint = 992;
    if (w < breakpoint) {
      return true;
    } else {
      return false;
    }
  }
  permisos = {
    autorizadoAgregar: false,
    autorizadoModificar: false,
    autorizadoEliminar: false,
    autorizadoEnviar: false,
    autorizadoExportar: false
  };
  request = {
    idep: 0,
    instancia: 0,
    subinstancia: 0,
    estado: 0,
    pageIndex: 0,
    pageSize: 0
  }
  displayedColumns: string[] = [
    "registro",
    "instancia",
    "subinstancia",
    "estado",
    "fech_vali",
    "fech_aprob",
    "fech_recha",
    "acciones",
  ];


  constructor(
    private dataService: DataService,
    private formBuilder: FormBuilder,
    private sharedService: SharedService,
    private http: HttpClient,
    private route: ActivatedRoute,
    private router: Router,
  ) { }

  ngOnInit(): void {
    setTimeout(_ => this.buildShared());
    this.buildForm();
    this.handleResponsive();
    this.buildSeguridad();
    this.loadInstancia();
    this.loadSubInstancia();
    this.loadEstadoConsolidado();
    this.dataSource = new ConsolidarDataSource(this.dataService);
    this.paginator.showFirstLastButtons = true;
    this.paginator._intl.itemsPerPageLabel = 'Filas por tabla';
    this.paginator._intl.nextPageLabel = 'Siguiente página';
    this.paginator._intl.previousPageLabel = 'Página anterior';
    this.paginator._intl.firstPageLabel = 'Primera página';
    this.paginator._intl.lastPageLabel = 'Última página';

    this.route.params.subscribe(
      params => {
        this.idep = params['id'];
        this.buscarEtapaProceso();
      });
    this.buscarConsolidado(true);
  }

  buildShared() {
    this.sharedService.setSharedBreadcrumb("Consolidado de Plazas");
    this.sharedService.setSharedTitle("Consolidado de Plazas");
  }
  buildForm(): void {
    this.form = this.formBuilder.group({
      idInstancia: [null],
      idSubInstancia: [null],
      idEstado: [null]
    });
  }
  handleResponsive(): void {
    this.isMobile = this.getIsMobile();
    window.onresize = () => {
      this.isMobile = this.getIsMobile();
    };
  }
  buildSeguridad = () => {
    this.permisos.autorizadoExportar = this.dataService.Storage().tienePermisoAccion(TablaPermisos.Eliminar);
    this.currentSession = this.dataService.Storage().getInformacionUsuario();
  }

  buscarEtapaProceso = () => {
    let dato = {
      id: Number(this.idep)
    }
    this.dataService.Reasignaciones()
      .getBuscarEtapaProceso(dato)
      .pipe(
        catchError(() => of([])),
        finalize(() => { })
      )
      .subscribe((response: any) => {
        if (response) {
          this.etapa = response[0];
          if (response.length === 0) {
            this.dataService
              .Message()
              .msgWarning(
                'No se encontró información de la Etapa Proceso',
                () => { }
              );
          }
        }
        else if (response === ResultadoOperacionEnum.NotFound) {
          this.dataService.Message().msgWarning(response.messages[0], () => { });
        } else if (response === ResultadoOperacionEnum.UnprocessableEntity) {
          this.dataService.Message().msgWarning(response.messages[0], () => { });
        } else {
          this.dataService.Message().msgError('Ocurrieron algunos problemas al obtener la información.', () => { });
        }
      });
  }
  loadInstancia = () => {
    this.dataService.Reasignaciones()
      .getComboInstancia()
      .pipe(
        catchError(() => of([])),
        finalize(() => { })
      )
      .subscribe((response: any) => {
        if (response) {
          const data = response.map((x) => ({
            ...x,
            value: x.id,
            label: `${x.descripcion}`,
          }));
          this.comboLists.listInstancia = data;
          this.comboLists.listInstancia.unshift({ value: this.opcionFiltro.item.value, label: this.opcionFiltro.item.label });
        }
      });
  }
  loadSubInstancia = () => {
    this.dataService.Reasignaciones()
      .getComboSubInstancia()
      .pipe(
        catchError(() => of([])),
        finalize(() => { })
      )
      .subscribe((response: any) => {
        if (response) {
          const data = response.map((x) => ({
            ...x,
            value: x.id,
            label: `${x.descripcion}`,
          }));
          this.comboLists.listSubInstancia = data;
          this.comboLists.listSubInstancia.unshift({ value: this.opcionFiltro.item.value, label: this.opcionFiltro.item.label });
        }
      });
  }
  loadEstadoConsolidado = () => {
    this.dataService
      .Reasignaciones()
      .getComboEstadoConsolidado()
      .pipe(
        catchError(() => of([])),
        finalize(() => { })
      )
      .subscribe((response: any) => {
        if (response) {
          const data = response.map((x) => ({
            ...x,
            value: x.id,
            label: `${x.descripcion}`,
          }));
          this.comboLists.listEstadoConsolidado = data;
          this.comboLists.listEstadoConsolidado.unshift({ value: this.opcionFiltro.item.value, label: this.opcionFiltro.item.label });
        }
      });
  }

  handleBuscar = () => {
    this.buscarConsolidado();
  }
  setRequest = () => {
    this.request = {
      idep: Number(this.idep),
      instancia: this.form.get('idInstancia').value === null ? 0 : this.form.get('idInstancia').value,
      subinstancia: this.form.get('idSubInstancia').value === null ? 0 : this.form.get('idSubInstancia').value,
      estado: this.form.get('idEstado').value === null ? 0 : this.form.get('idEstado').value,
      pageIndex: 1, pageSize: 10
    };
  };

  buscarConsolidado = (fistTime: boolean = false) => {
    this.setRequest();
    if (fistTime) {
      this.dataSource.load(this.request, 1, 10, true);
    } else {
      this.dataSource.load(
        this.request,
        this.paginator.pageIndex + 1,
        this.paginator.pageSize);
    }
  }
  handleLimpiar(): void {
    this.resetForm();
  }
  resetForm = () => {
    this.form.reset();
    this.form.get('idInstancia').setValue("");
    this.form.get('idSubInstancia').setValue("");
    this.form.get('idEstado').setValue("");
  }
  handleRetornar(): void {
    this.router.navigate(['../../'], { relativeTo: this.route });
  }
  handleConsolidadoPlaza = (row) => {
    // this.router.navigate(["../../convocar-plazas/" + this.idep + "/" + row.instancia + "/" + row.subinstancia],
    this.router.navigate(["../../convocar-plazas/" + this.idep + "/" + row.idcp],
      { relativeTo: this.route }
    )
  }

  handleAprobarMasivo = () => {
    const resultMessage = '"SE REALIZÓ CORRECTAMENTE LA APROBACIÓN MASIVA DE PLAZAS."';
    this.dataService.Message().msgConfirm("¿ESTÁ SEGURO QUE DESEA APROBAR MASIVAMENTE LAS PLAZAS?",
      () => {

        let dato = {
          idep: Number(this.idep),
          instancia: '',
          usuario: this.currentSession.nombreUsuario,
          ip: this.ipAddress
        }
        this.dataService.Spinner().show("sp6");
        this.dataService.Reasignaciones()
          .aprobarMasivoConsolidado(dato).pipe(
            catchError((e) => of(e)),
            finalize(() => {
              this.dataService.Spinner().hide("sp6");
            })
          )
          .subscribe((response: any) => {
            if (response || []) {
              if (response.length === 0) {
                this.dataService.Message().msgAutoCloseSuccessNoButton(resultMessage, 3000, () => { });
                this.handleBuscar();
              }
            } else if (response && response.statusCode === ResultadoOperacionEnum.NotFound) {
              this.dataService.Message().msgWarning(response.messages[0], () => { });
            } else if (response && response.statusCode === ResultadoOperacionEnum.UnprocessableEntity) {
              this.dataService.Message().msgWarning(response.messages[0], () => { });
            } else {
              this.dataService.Message().msgError('"OCURRIERON PROBLEMAS AL TRATAR DE APROBAR MASIVAMENTE LAS PLAZAS."', () => { });
            }
          });
      }, (error) => { }
    );
  }
}

export class ConsolidarDataSource extends DataSource<any> {
  private _dataChange = new BehaviorSubject<any>([]);
  private _loadingChange = new BehaviorSubject<boolean>(false);
  public loading = this._loadingChange.asObservable();
  public totalregistro = 0;
  public aprobados = 0;
  public pendientes = 0;
  public rechazados = 0;
  public validados = 0;

  constructor(private dataService: DataService) {
    super();
  }

  load(data: any, pageIndex, pageSize, firsTime = false): void {
    this._loadingChange.next(false);
    if (!firsTime) this.dataService.Spinner().show("sp6");
    this.dataService
      .Reasignaciones()
      .getConsolidadoPlazas(data, pageIndex, pageSize)
      .pipe(
        catchError(() => of([])),
        finalize(() => {
          this._loadingChange.next(false);
          if (!firsTime) this.dataService.Spinner().hide("sp6");
        })
      )
      .subscribe((response: any) => {
        this._dataChange.next(response || []);
        this.totalregistro = (response || []).length === 0 ? 0 : response[0].total_rows;
        this.aprobados = 0;
        this.pendientes = 0;
        this.rechazados = 0;
        this.validados = 0;
        for (let i = 0; i < response.length; i++) {
          if (response[i].estado === "Validado") {
            this.validados++;
          }
          if (response[i].estado === "Pendiente") {
            this.pendientes++;
          }
          if (response[i].estado === "Rechazado") {
            this.rechazados++;
          }
          if (response[i].estado === "Aprobado") {
            this.aprobados++;
          }
        }
        if ((response || []).length === 0) {
          this.dataService.Message().msgWarning('"NO SE ENCONTRÓ INFORMACIÓN PARA LOS CRITERIOS DE BÚSQUEDA SELECCIONADO."',
            () => { }
          );
        }
      });
  }
  connect(collectionViewer: CollectionViewer): Observable<any[] | readonly any[]> {
    return this._dataChange.asObservable();
  }
  disconnect(collectionViewer: CollectionViewer): void {
    this._dataChange.complete();
    this._loadingChange.complete();
  }
  get dataTotal(): any {
    return this.totalregistro;
  }
  get data(): any {
    return this._dataChange.value || [];
  }
}
