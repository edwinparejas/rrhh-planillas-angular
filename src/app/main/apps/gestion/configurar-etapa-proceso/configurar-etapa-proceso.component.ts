import { Component, OnInit, ViewEncapsulation, ViewChild, AfterViewInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { DataService } from 'app/core/data/data.service';
import { mineduAnimations } from '@minedu/animations/animations';
import { SelectionModel, DataSource, CollectionViewer } from '@angular/cdk/collections';
import { MatPaginator } from '@angular/material/paginator';
import { BehaviorSubject, of, Observable } from 'rxjs';
import { catchError, finalize, tap } from 'rxjs/operators';
import { ModalEtapaComponent } from './modal-etapa/modal-etapa.component';
import { CentroTrabajoModel } from 'app/core/model/centro-trabajo.model';
import { SecurityModel } from 'app/core/model/security/security.model';
import { HttpErrorResponse } from '@angular/common/http';
import { TablaEquivalenciaSede, TablaRolPassport } from 'app/core/model/types';
import { descargarExcel } from 'app/core/utility/functions';
import * as moment from 'moment';
import { MESSAGE_GESTION } from '../_utils/messages';
import { CodigoCatalogo, CodigoEstadoEtapa } from '../_utils/types-gestion';

@Component({
  selector: 'minedu-configurar-etapa-proceso',
  templateUrl: './configurar-etapa-proceso.component.html',
  styleUrls: ['./configurar-etapa-proceso.component.scss'],
  encapsulation: ViewEncapsulation.None,
  animations: mineduAnimations
})
export class ConfigurarEtapaProcesoComponent implements OnInit, AfterViewInit {

  tiempoMensaje: number = 3000; 
  centroTrabajo: CentroTrabajoModel = null;
  codEstadoEtapa = CodigoEstadoEtapa;
  permisoEtapa: any;
  cabeceraProceso: any;

  private passport: SecurityModel = new SecurityModel();

  displayedColumns: string[] = [
    'registro',
    'etapa',
    'vigenciaInicio',
    'vigenciaTermino',
    'aceptaPostulanteWeb',
    //'aceptaExpedienteWeb',
    'aceptaReclamosWeb',
    'fechaCreacion',
    'estado',
    'opciones'
  ];

  dialogRef: any;

  dataSource: EtapasDataSource | null;
  selection = new SelectionModel<any>(false, []);
  @ViewChild(MatPaginator, { static: true })
  paginator: MatPaginator;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private materialDialog: MatDialog,
    private dataService: DataService) { }

  ngOnInit() {
    this.cabeceraProceso = {idProceso : parseInt(this.route.snapshot.params.proceso)};
    this.buildPassport();
    this.buildPaginators(this.paginator);
    this.getPermisoEtapa();

    if (this.cabeceraProceso.idProceso > 0) {
      this.loadCabeceraProceso();
      this.entidadPassport();
    }
  }

  ngAfterViewInit() {
    this.paginator.page
      .pipe(
        tap(() => this.handleGrid())
      )
      .subscribe();
  }
  
  buildPassport() {
    this.passport = this.dataService.Storage().getInformacionUsuario();
    
    if (this.passport.codigoTipoSede === TablaEquivalenciaSede.CODIGO_TIPO_SEDE)
        this.passport.codigoSede = TablaEquivalenciaSede.CODIGO_SEDE;
    
    const esRolMonitor = this.passport.codigoRol === TablaRolPassport.MONITOR;
    
    if (esRolMonitor && this.passport.codigoTipoSede !== TablaEquivalenciaSede.CODIGO_TIPO_SEDE_UGEL) {
      const instancia = this.dataService.Storage().getInstanciaSelected();
      if (instancia) {
        this.passport.codigoTipoSede = instancia.codigoTipoSede;
        this.passport.codigoSede = instancia.codigoInstancia;
      } else { 
        this.dataService.Message().msgWarning(MESSAGE_GESTION.INVALID_INSTANCIA_MONITOR, 
          () => { this.handleRegresar(); }); 
      };
    }
  }

  buildPaginators(paginator: MatPaginator): void {
    this.dataSource = new EtapasDataSource(this.dataService);
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

  handleGrid() {
    const p = {
      idProceso: this.cabeceraProceso.idProceso,
      paginaActual: (this.paginator.pageIndex + 1),
      tamanioPagina: this.paginator.pageSize
    }
    this.dataSource.load(p, (this.paginator.pageIndex + 1), this.paginator.pageSize);
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
        setTimeout(() => this.handleGrid(), 0);
      }else{
        this.centroTrabajo = null;
      }
    });
  }

  getPermisoEtapa() {
    this.dataService.GestionProcesos().obtenerPermisoEtapa(this.passport.codigoRol)
      .pipe(
        catchError(() => { return of(null); }),
      ).subscribe(response => {
        if (response) {
          this.permisoEtapa = response;
        }
      });
  }

  loadCabeceraProceso() {
    this.dataService.GestionProcesos().getCabeceraProceso(this.cabeceraProceso.idProceso)
      .pipe(
        catchError(() => { return of(null); }),
      ).subscribe(response => {
        if (response) {
          this.cabeceraProceso = response;
        }
      });
  }

  permiteModificarEtapa(row) {
    return row.descripcionEstadoEtapa === 'REGISTRADO';
  }

  permiteVerInformacionEtapa(row) {
    const estado = row.descripcionEstadoEtapa;
    return estado === 'INACTIVO' || estado === 'FINALIZADO'  || estado === 'CANCELADO';
  }

  permiteCancelarEtapa(row) {
    return row.descripcionEstadoEtapa === 'REGISTRADO' || row.descripcionEstadoEtapa === 'FINALIZADO';
  }

  permiteInactivarEtapa(row) {
    return row.descripcionEstadoEtapa === 'REGISTRADO';
  }

  permiteRestauarEtapa(row) {
    return row.descripcionEstadoEtapa === 'INACTIVO';
  }

  handleExportar() {
    const d = {
      idProceso: this.cabeceraProceso.idProceso
    }

    this.dataService.GestionProcesos().exportarEtapaProceso(d).pipe(
      catchError((error: HttpErrorResponse) => {
        this.dataService.Message().msgWarning(error.error.messages[0]); return of(null);
      }),
    ).subscribe(
      (response) => {
        if (response) {
          const tipo = this.cabeceraProceso.descripcionTipoProceso;
          const ley = this.cabeceraProceso.descripcionRegimenLaboral.split("-", 1)[0].trim();
          const codigo = this.cabeceraProceso.codigoProceso;
          const fecha = moment().format('DDMMYYYY');
          descargarExcel(response, `ETAPAS ${tipo} ${codigo} ${ley} ${fecha}.xlsx`);
        } 
      }
    )
  }
 
  handleModificar(row: any) {
    if (row.registro > 1) {
      let etapaAnterior = this.dataSource.data.find(x => x.registro == row.registro -1);
      if (!etapaAnterior.vigenciaInicio && !etapaAnterior.vigenciaTermino){
        this.dataService.Message().msgWarning('"DEBE GESTIONAR PRIMERO LA ETAPA DE ' + etapaAnterior.etapa + '"', () => { });
        return;
      }
    }
   
    this.dialogRef = this.materialDialog.open(ModalEtapaComponent, {
      panelClass: 'modal-etapa-form-dialog',
      disableClose: true,
      data: {
        modal: {
          icon: "create",
          title: "Modificar etapa",
          action: "edit",
          disabled: true
        },
        passport: this.passport,
        proceso: this.cabeceraProceso,
        etapaProceso: row
      }
    });

    this.dialogRef.afterClosed()
      .subscribe((response: any) => {
        if (!response) {
          return;
        }
        if (response.reload) {
          this.handleGrid();
        }
      });
  }

  handleInfoEtapa(row: any) {
    this.dialogRef = this.materialDialog.open(ModalEtapaComponent, {
      panelClass: 'modal-etapa-form-dialog',
      disableClose: true,
      data: {
        modal: {
          icon: "create",
          title: "Información completa de la Etapa",
          action: "info",
          disabled: true
        },
        passport: this.passport,
        proceso: this.cabeceraProceso,
        etapaProceso: row
      }
    });

    this.dialogRef.afterClosed()
      .subscribe((response: any) => {
        if (!response) {
          return;
        }
        if (response.reload) {
          this.handleGrid();
        }
      });
  }

  handleCancelarEtapa(row: any) {
    this.dialogRef = this.materialDialog.open(ModalEtapaComponent, {
      panelClass: 'modal-etapa-form-dialog',
      disableClose: true,
      data: {
        modal: {
          icon: "pan_tool",
          title: "Cancelar etapa",
          action: "cancel",
          disabled: true
        },
        passport: this.passport,
        proceso: this.cabeceraProceso,
        etapaProceso: row
      }
    });

    this.dialogRef.afterClosed()
      .subscribe((response: any) => {
        if (!response) {
          return;
        }
        if (response.reload && response.result == 1) {
          this.handleGrid();
        }
        
        if (response.result == 2) {
          this.handleRegresar();
        }
      });
  }

  handlerInactivarEtapa(row: any) {
    this.dataService.Message().msgConfirm(MESSAGE_GESTION.M128, () => {
      this.dataService.Spinner().show("sp6");
      this.onInactivarEtapa(row);
    });
  }

  onInactivarEtapa(item: any) {
    let form = {
      idProceso: this.cabeceraProceso.idProceso,
      idEtapaProceso: item.idEtapaProceso,
      codigoCatalogoItem: CodigoEstadoEtapa.Inactivo,
      usuarioModificacion: this.passport.numeroDocumento
    };
    this.dataService.GestionProcesos().actualizarEtapaProceso(form).pipe(
      catchError((error: HttpErrorResponse) => {
        this.dataService.Message().msgWarning(error.error.messages[0]); return of(null);
      }),
      finalize(() => { this.dataService.Spinner().hide("sp6"); })
    ).subscribe(response => {
      if (response && response > 0)
        this.dataService.Message().msgAutoCloseSuccessNoButton(MESSAGE_GESTION.M07, this.tiempoMensaje);
      this.handleGrid();
    });
  }

  handleRestaurarEtapa(row: any) {
    this.dataService.Message().msgConfirm(MESSAGE_GESTION.M129, () => {
      this.dataService.Spinner().show("sp6");
      this.onRestaurarEtapa(row);
    });
  }

  onRestaurarEtapa(item: any) {
    let form = {
      idProceso: this.cabeceraProceso.idProceso,
      idEtapaProceso: item.idEtapaProceso,
      codigoCatalogoItem: CodigoEstadoEtapa.Registrado,
      usuarioModificacion: this.passport.numeroDocumento
    };
    this.dataService.GestionProcesos().actualizarEtapaProceso(form).pipe(
      catchError((error: HttpErrorResponse) => {
        this.dataService.Message().msgWarning(error.error.messages[0]); return of(null);
      }),
      finalize(() => { this.dataService.Spinner().hide("sp6"); })
    ).subscribe(response => {
      if (response && response > 0)
        this.dataService.Message().msgAutoCloseSuccessNoButton(MESSAGE_GESTION.M07, this.tiempoMensaje);
      this.handleGrid();
    });
  }

  handleRegresar() {
    this.router.navigate(['../../'], { relativeTo: this.route });
  }
}

export class EtapasDataSource extends DataSource<any>{

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

    this.dataService.GestionProcesos().getEtapas(data, pageIndex, pageSize).pipe(
      catchError((error: HttpErrorResponse) => {
        this.dataService.Message().msgWarning(error.error.messages[0]); return of(null);
      }),
      finalize(() => { this._loadingChange.next(false); this.dataService.Spinner().hide("sp6"); })
    ).subscribe((response: any) => {
      if (response) {
        this._totalRows = response[0].totalRegistro;
        this._dataChange.next(response || []);
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

