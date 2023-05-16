import { Component, OnInit, ViewEncapsulation, ViewChild, Inject } from "@angular/core";
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from "@angular/material/dialog";
import { DataService } from "app/core/data/data.service";
import { MatPaginator } from "@angular/material/paginator";
import { mineduAnimations } from "../../../../../../../@minedu/animations/animations";
import { CollectionViewer, DataSource, SelectionModel } from "@angular/cdk/collections";
import { Subscription, BehaviorSubject, of, Observable, Subject } from "rxjs";
import { catchError, finalize, tap } from "rxjs/operators";
import { DocumentViewerComponent } from "app/main/apps/components/document-viewer/document-viewer.component";
import { saveAs } from 'file-saver';
import { DatePipe } from "@angular/common";
import { SecurityModel } from 'app/core/model/security/security.model';
import { EstadoDocumentoEnum } from '../../_utils/constants';


@Component({
  selector: 'minedu-modal-documentos-publicados',
  templateUrl: './modal-documentos-publicados.component.html',
  styleUrls: ['./modal-documentos-publicados.component.scss'],
  animations: mineduAnimations,
  encapsulation: ViewEncapsulation.None,
})
export class ModalDocumentosPublicadosComponent implements OnInit {

  dialogTitle = "Listado de Documentos Publicados";
  columnTitle = "Pre Publicación"
  working = false;
  isMobile = false;
  dialogRef: any;
  idPlaza: number;
  totalregistro = 0;
  idEtapaProceso: number;
  idGrupoDocumento: number;
  idRegimenLaboral: number;
  idIteracion: number;
  esDre: boolean;
  codigoCentroTrabajoMaestro: string;
  nombreDocumento: string;
  fecha = new Date();
  paginatorDocumentosPageIndex = 0;
  paginatorDocumentosPageSize = 10;
  @ViewChild("paginatorDocumentos", { static: true }) paginatorDocumentos: MatPaginator;
  dataSourceDocumentosPublicados: PlazasContratacionDocumentosPublicadosDataSource | null;

  displayedColumnsDocumentosPublicados: string[] = [
    "registro",
    "fecha",
    "estado",
    "acciones",
  ];

  request = {
    idEtapaProceso: null,
    idGrupoDocumento: null,
    anio: null,
    codigoCentroTrabajoMaestro: null,
    codigoDre : null
  };

  estadoDocumentoEnum = EstadoDocumentoEnum;
  idDocumentoPublicado: string;
  currentSession: SecurityModel = new SecurityModel();
  constructor(
    public matDialogRef: MatDialogRef<ModalDocumentosPublicadosComponent>,
    @Inject(MAT_DIALOG_DATA) private data: any,
    private datePipe: DatePipe,
    private materialDialog: MatDialog,
    private dataService: DataService
  ) { }

  ngOnInit(): void {
    this.idEtapaProceso = this.data.idEtapaProceso;
    this.idGrupoDocumento = this.data.idGrupoDocumento;
    this.nombreDocumento = this.data.nombreDocumento;
    this.idRegimenLaboral = this.data.idRegimenLaboral;
    this.idIteracion = this.data.idIteracion;
    this.esDre = this.data.esDre;
    this.codigoCentroTrabajoMaestro = this.data.codigoCentroTrabajoMaestro;
    this.buildGrids();
    this.handleBuscar(true);
    this.handleResponsive();
    if (this.data.dialogTitle != null) {
      this.dialogTitle = this.data.dialogTitle;
    }
    if (this.data.columnTitle != null) {
      this.columnTitle = this.data.columnTitle;
    }
    this.currentSession = this.dataService.Storage().getInformacionUsuario();
  }

  buildGrids(): void {
    this.dataSourceDocumentosPublicados = new PlazasContratacionDocumentosPublicadosDataSource(this.dataService);
    this.buildPaginators(this.paginatorDocumentos);
  }

  buildPaginators(paginator: MatPaginator): void {
    paginator.showFirstLastButtons = true;
    paginator._intl.itemsPerPageLabel = "Registros por página";
    paginator._intl.nextPageLabel = "Siguiente página";
    paginator._intl.previousPageLabel = "Página anterior";
    paginator._intl.firstPageLabel = "Primera página";
    paginator._intl.lastPageLabel = "Última página";
    paginator._intl.getRangeLabel = (page: number, pageSize: number, length: number) => {
      if (length === 0 || pageSize === 0) { return `0 de ${length}`; }
      const length2 = Math.max(length, 0);
      const startIndex = page * pageSize;
      const endIndex = startIndex < length2 ? Math.min(startIndex + pageSize, length2) : startIndex + pageSize;
      return `${startIndex + 1} – ${endIndex} de ${length2}`;
    }
  }

  ngAfterViewInit() {
    this.paginatorDocumentos.page.pipe(tap(() => this.handleBuscar())).subscribe();
  }

  handleBuscar(load: boolean = false) {
    this.request = {
      idEtapaProceso: this.idEtapaProceso,
      idGrupoDocumento: this.idGrupoDocumento,
      anio: this.fecha.getFullYear(),
      codigoCentroTrabajoMaestro: this.codigoCentroTrabajoMaestro,
      codigoDre: this.codigoCentroTrabajoMaestro
    };

    if (load) {
      this.dataSourceDocumentosPublicados.load(this.request, 
                                              this.paginatorDocumentos.pageIndex + 1,
                                              this.paginatorDocumentosPageSize,
                                              this.esDre);
    } else {
      this.dataSourceDocumentosPublicados.load(this.request,
                                               this.paginatorDocumentos.pageIndex + 1,
                                               this.paginatorDocumentos.pageSize,
                                               this.esDre);
    }
  }

  handleVerPlazasPublicadas(file: string) {
    if (!file) {
      this.dataService.Message().msgWarning('"NO SE ENCONTRÓ EL DOCUMENTO SOLICITADO."', () => { });
      return;
    }
    this.dataService.Spinner().show("sp6");
    this.dataService.Documento().descargar(file).pipe(
      catchError((e) => { this.dataService.SnackBar().msgError('Error, no se pudo acceder al servicio.', 'Cerrar'); return of(e); }),
      finalize(() => this.dataService.Spinner().hide("sp6"))
    ).subscribe(response => {
      if (response) {
        this.handlePreview(response, this.nombreDocumento);
      } else {
        this.dataService.Message().msgWarning('"NO SE PUDO OBTENER EL DOCUMENTO SOLICITADO."', () => { });
      }
    });
  }

  handlePreview(file: any, nameFile: string) {
    this.dialogRef = this.materialDialog.open(DocumentViewerComponent, {
      panelClass: 'modal-viewer-form-dialog',
      disableClose: true,
      data: {
        modal: {
          icon: "remove_red_eye",
          title: "Proceso Contratación - Plazas Publicadas",
          file: file
        }
      }
    });

    this.dialogRef.afterClosed()
      .subscribe((response: any) => {
        if (!response) {
          return;
        }
        if (response.download) {
          saveAs(file, nameFile + ".pdf");
        }
      }
      );
  }

  handleCancel = () => { this.matDialogRef.close(); }

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

  transformarFecha(date) {
    return this.datePipe.transform(date, 'dd/MM/yyyy HH:mm a');
  }

  isSeleccionadoTodosPrepublicadas: boolean = false;
  filaSeleccionadasPrePublicadas: any[] = [];
  filaNoSeleccionadas: any[] = [];
  selectionPlazasPrepublicadas = new SelectionModel<any>(true, []);

  masterTogglePlazasPrepublicadas = ({ checked }) => {
    this.isSeleccionadoTodosPrepublicadas = checked;
    this.filaSeleccionadasPrePublicadas = [];
    this.filaNoSeleccionadas = [];
  };

  isAllSelectedPlazasPrepublicadas = () => {
    const numSelected = this.selectionPlazasPrepublicadas.selected.length;
    const numRows = this.dataSourceDocumentosPublicados.data.length;
    return numSelected === numRows;
  };

  checkboxAllPlazasPrePublicadas(): string {
    let estilo: string = null;
    estilo = `${(this.isAllSelectedPlazasPrepublicadas() || this.isSeleccionadoTodosPrepublicadas) ? "select" : "deselect"} all`;
    return estilo;
  }

  selectedRowPrepublicadas = (row) => {
    this.selectionPlazasPrepublicadas.toggle(row);
    if (!this.isSeleccionadoTodosPrepublicadas) {
      var existeFila = this.filaSeleccionadasPrePublicadas?.some(x => x.idDocumentoPublicadoDetalle == row.idDocumentoPublicadoDetalle);
      if (existeFila) {
        this.filaSeleccionadasPrePublicadas = this.filaSeleccionadasPrePublicadas?.filter(x => x.idDocumentoPublicadoDetalle != row.idDocumentoPublicadoDetalle);
      } else {
        this.filaSeleccionadasPrePublicadas.push(row);
      }
    }

    if (this.isSeleccionadoTodosPrepublicadas) {
      var existeFila = this.filaNoSeleccionadas?.some(x => x.idDocumentoPublicadoDetalle == row.idDocumentoPublicadoDetalle);
      if (existeFila) {
        this.filaNoSeleccionadas = this.filaNoSeleccionadas?.filter(x => x.idDocumentoPublicadoDetalle != row.idDocumentoPublicadoDetalle);
      } else {
        this.filaNoSeleccionadas.push(row);
      }
    }
    this.idDocumentoPublicado = row.idDocumentoPublicado;
  };

  verificaSeleccionPrePublicadas = (row): boolean => {
    if (!this.isSeleccionadoTodosPrepublicadas) {
      let estaSeleccioando = this.filaSeleccionadasPrePublicadas
        .some(fila =>
          fila.idDocumentoPublicadoDetalle
          == row.idDocumentoPublicadoDetalle);
      return estaSeleccioando || this.isSeleccionadoTodosPrepublicadas;
    }

    if (this.isSeleccionadoTodosPrepublicadas) {
      let estaSeleccioando = this.filaNoSeleccionadas
        .some(fila =>
          fila.idDocumentoPublicadoDetalle
          == row.idDocumentoPublicadoDetalle);
      return !estaSeleccioando;
    }
  }

  checkboxLabelPlazasPrepublicadas(row?: any): string {
    let estilo: string = null;
    estilo = `${this.selectionPlazasPrepublicadas.isSelected(row) ? "deselect" : "select"} row ${row?.position + 1}`;
    return estilo;
  }

  handleIniciarGeneracionPdf = () => {
    if (
      (
        this.filaSeleccionadasPrePublicadas.length == 0 && !this.isSeleccionadoTodosPrepublicadas
      )
    ) {
      return this.dataService
        .Message()
        .msgWarning('"SELECCIONE DOCUMENTOS PARA INICIAR EL PROCESO DE GENERACIÓN DE PDF"', () => { });
    }

    const confirmationMessage = "<strong>¿ESTÁ SEGURO QUE DESEA INICIAR EL PROCESO DE GENERACIÓN DE PDF?</strong>";
    this.dataService
      .Message()
      .msgConfirm(confirmationMessage,
        () => {
          const request = {
            seleccionandos: this.filaSeleccionadasPrePublicadas,
            esSelecionarTodo: this.isSeleccionadoTodosPrepublicadas,
            noSeleccionandos: this.filaNoSeleccionadas,
            idDocumentoPublicado: this.idDocumentoPublicado,
            usuarioModificacion: this.currentSession.numeroDocumento,
            nombreUsuarioModifica: this.currentSession.nombreCompleto,
            idIteracion: this.idIteracion
          };
          this.dataService.Spinner().show("sp6");
          this.dataService
            .Contrataciones()
            .actualizarEstadoDocumento(request).pipe(
              catchError(() => of([])),
              finalize(() => { this.dataService.Spinner().hide("sp6"); })
            )
            .subscribe((result: number) => {
              if (result == 1) {
                return this.dataService
                  .Message()
                  .msgAutoCloseSuccessNoButton('"OPERACIÓN REALIZADA DE FORMA EXITOSA."', 3000,
                    () => {
                      this.filaSeleccionadasPrePublicadas = [];
                      this.isSeleccionadoTodosPrepublicadas = false;
                      this.filaNoSeleccionadas = [],
                        this.handleBuscar();
                    });

              }
              return this.dataService
                .Message()
                .msgWarning('"OCURRIO UN ERROR AL PROCESO LA INFORMACION"', () => { });
            });
        }
      );
  }

  VerificarIteracionActual = () => {
    if (this.dataSourceDocumentosPublicados.idIteracion == this.idIteracion
      || this.dataSourceDocumentosPublicados.idIteracion == null) {
      return true;
    } else {
      return false;
    }
  }
  verificarIteracion = (row: any): boolean => {
    if (row.idIteracion == this.idIteracion) {
      return true
    }
    return false;
  }
}

export class PlazasContratacionDocumentosPublicadosDataSource extends DataSource<any> {
  private _dataChange = new BehaviorSubject<any>([]);
  private _loadingChange = new BehaviorSubject<boolean>(false);
  public loading = this._loadingChange.asObservable();
  public totalregistro = 0;
  public idIteracion = 0;

  constructor(private dataService: DataService) {
    super();
  }

  load(data: any, pageIndex, pageSize, esDre = false): void {
    this._loadingChange.next(false);
    if (data.idEtapaProceso === null) {
      this._loadingChange.next(false);
      this._dataChange.next([]);
    } else {
      if (!esDre) {
        this.dataService
        .Contrataciones()
        .getBuscarDocumentoPublicadoDetallePaginado(data, pageIndex, pageSize)
        .pipe(
          catchError(() => of([])),
            finalize(() => {
            this._loadingChange.next(false);
            this.dataService.Spinner().hide("sp6");
          })
        )
        .subscribe((documentosPublicados: any) => {
          this._dataChange.next(documentosPublicados || []);
          this.idIteracion = documentosPublicados[0].idIteracion;
          this.totalregistro = (documentosPublicados || []).length === 0 ? 0 : documentosPublicados[0].total_registros;
        });
      } else {
        this.dataService
        .Contrataciones()
        .getBuscarDocumentoPublicadoDetallePaginadoPorDre(data, pageIndex, pageSize)
        .pipe(
          catchError(() => of([])),
            finalize(() => {
            this._loadingChange.next(false);
            this.dataService.Spinner().hide("sp6");
          })
        )
        .subscribe((documentosPublicados: any) => {
          this._dataChange.next(documentosPublicados || []);
          this.idIteracion = documentosPublicados[0].idIteracion;
          this.totalregistro = (documentosPublicados || []).length === 0 ? 0 : documentosPublicados[0].total_registros;
        });

      }
    }
  }

  connect(collectionViewer: CollectionViewer): Observable<[]> {
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
