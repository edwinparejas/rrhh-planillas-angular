import { CollectionViewer, DataSource } from "@angular/cdk/collections";
import { AfterViewInit, Component, OnInit, ViewChild, ViewEncapsulation } from "@angular/core";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { MatPaginator } from "@angular/material/paginator";
import { ActivatedRoute, Router } from "@angular/router";
import { DataService } from "app/core/data/data.service";
import { SharedService } from "app/core/shared/shared.service";
import { BehaviorSubject, Observable, of } from "rxjs";
import { catchError, finalize } from "rxjs/operators";
import { OpcionFiltro } from "../models/contratacion.model";
import { CatalogoItemEnum, EstadoConsolidadoPlazaEnum, RegimenLaboralEnum, GrupoDocumentoPublicadoEnum, TipoAccionEnum, FlujoEstadoEnum } from "../_utils/constants";
import { saveAs } from "file-saver";
import { mineduAnimations } from "@minedu/animations/animations";
import { MatDialog } from "@angular/material/dialog";
import { MotivoRechazoComponent } from "./components/motivo-rechazo/motivo-rechazo.component";
import { ResultadoOperacionEnum } from "../../../../../core/model/types";
import { descargarExcel } from "app/core/utility/functions";
import { DocumentViewerComponent } from "app/main/apps/components/document-viewer/document-viewer.component";
import { SecurityModel } from "app/core/model/security/security.model";
import { DatePipe } from "@angular/common";
import { bandejaConsolidadoModel } from '../models/bandejaConsolidado.model';
import { ModalDocumentosPublicadosComponent } from '../components/modal-documentos-publicados/modal-documentos-publicados.component';

@Component({
  selector: "minedu-bandeja-consolidado-plaza",
  templateUrl: "./bandeja-consolidado-plaza.component.html",
  styleUrls: ["./bandeja-consolidado-plaza.component.scss"],
  encapsulation: ViewEncapsulation.None,
  animations: mineduAnimations,
})
export class BandejaConsolidadoPlazaComponent implements OnInit, AfterViewInit {

  etapaResponse: any = {};
  idEtapaProceso: number;
  codSedeCabecera: string; // added
  form: FormGroup;
  regimenLaboral = RegimenLaboralEnum;
  paginatorPageIndex = 0;
  paginatorPageSize = 10;
  @ViewChild("paginator", { static: true }) paginator: MatPaginator;
  dataSource: ConsolidadoDataSource | null;
  dialogRef: any;
  consolidadoPlazasPdf: string;
  opcionFiltro: OpcionFiltro = new OpcionFiltro();
  estadoConsolidado = EstadoConsolidadoPlazaEnum;
  isMobile = false;
  idDre = 1;
  idUgel = 1;

  totalRegistros: any = 0;
  totalPendientes: any = 0;
  totalValidados: any = 0;
  totalRechazados: any = 0;
  totalAprobados: any = 0;
  anio: any = 0;
  descripcionMaestroProceso: any = '';

  currentSession: SecurityModel = new SecurityModel();

  comboLists = {
    listInstancia: [],
    listSubInstancia: [],
    listEstadoConsolidado: [],
  };

  request = {
    idProceso: null,
    idEtapaProceso: null,
    idDre: null,
    idUgel: null,
    idEstado: null,
    anio: null,
    maestroProceso: null,
    usuarioCreacion: null,
    codigoCentroTrabajoMaestro: null,
    numeroDocumentoIdentidad: null,
    tipoDocumento: null,
    codigoRol: null,
    idIteracion: null,
    idFlujoEstado: null
  };

  displayedColumns: string[] = [
    "registro",
    "idInstancia",
    "idSubInstancia",
    "estadoConsolidado",
    "fechaValidacion",
    "fechaAprobacion",
    "fechaRechazo",
    "acciones",
  ];
  bandejaConsolidado: bandejaConsolidadoModel =
    new bandejaConsolidadoModel();
  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private formBuilder: FormBuilder,
    private dataService: DataService,
    private sharedService: SharedService,
    private datePipe: DatePipe,
    private materialDialog: MatDialog
  ) { }

  ngOnInit(): void {
    setTimeout((_) => this.buildShared());
    this.idEtapaProceso = this.route.snapshot.params.id;
    this.buildForm();
    this.handleResponsive();
    this.loadInstancia(true);
    this.loadEstadosConsolidado();
    this.dataSource = new ConsolidadoDataSource(this.dataService);
    this.paginator.showFirstLastButtons = true;
    this.paginator._intl.itemsPerPageLabel = "Registros por página";
    this.paginator._intl.nextPageLabel = "Siguiente página";
    this.paginator._intl.previousPageLabel = "Página anterior";
    this.paginator._intl.firstPageLabel = "Primera página";
    this.paginator._intl.lastPageLabel = "Última página";
    this.paginator._intl.getRangeLabel = (page: number, pageSize: number, length: number) => {
      if (length === 0 || pageSize === 0) { return `0 de ${length}`; }
      const length2 = Math.max(length, 0);
      const startIndex = page * pageSize;
      const endIndex = startIndex < length2 ? Math.min(startIndex + pageSize, length2) : startIndex + pageSize;
      return `${startIndex + 1} – ${endIndex} de ${length2}`;
    }
    this.obtenerEtapa();
    this.resetForm();

    this.currentSession = this.dataService.Storage().getInformacionUsuario();
    this.codSedeCabecera = this.currentSession.codigoSede;

    this.selectComboInstanciaDefault();
    this.obtenerDetallesConsolidadoPlazas()
    this.obtenerFlujoEstado();
  }

  selectComboInstanciaDefault() {
    console.log("codigos Sede", this.currentSession.idSede, this.currentSession.idTipoSede, this.currentSession.codigoLocalSede, this.currentSession.codigoPadreSede)

    this.dataService.Contrataciones().getDefaultValueComboInstanciasByCodSede(this.currentSession.codigoSede).pipe(
      catchError(() => of([])),
      finalize(() => { })
    )
      .subscribe((response: any) => {
        if (response) {
          //console.log("Datos de instancia  por codSede response:",response);
          this.form.get("idInstancia").setValue(response.idInstancia);
        }
      });
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

  buildShared() {
    this.sharedService.setSharedBreadcrumb("Contratación / Plazas Consolidadas");
    this.sharedService.setSharedTitle("Consolidado de Plazas");
  }

  ngAfterViewInit(): void {
    this.paginator.page.subscribe(() => this.loadData());
  }

  loadData(): void {
    this.setRequest();
    this.dataSource.load(this.request, this.paginator.pageIndex + 1, this.paginator.pageSize);
  }

  buildForm(): void {
    this.form = this.formBuilder.group({
      idInstancia: [null],
      idSubInstancia: [null],
      idEstadoConsolizadoPlaza: [null],
    });

    this.form.get("idInstancia").valueChanges.subscribe((value) => {
      let idNivelInstancia = null;
      let idInstancia = null;

      if (value === "-1") {
        return;
      }

      if (this.comboLists.listInstancia.length !== 0 && value !== null && value !== undefined) {
        const data = this.comboLists.listInstancia.find((x) => x.id_instancia === value);
        idNivelInstancia = parseInt(value.toString().split("-")[0]);
        idInstancia = data.id; // TODO: Verificar boton limpiar en primera carga de formulario-- UNDEFINED
      }

      this.loadSubInstancia(idInstancia, true);
      setTimeout((_) => {
        this.handleBuscar();
        this.obtenerPermitirGenerarPDF();
      });
    });
  }

  obtenerEtapa = () => {
    this.dataService.Contrataciones().obtenerCabeceraEtapaProcesoById(this.idEtapaProceso).pipe(
      catchError(() => of([])),
      finalize(() => { })
    )
      .subscribe((response: any) => {
        if (response) {
          this.etapaResponse = response;
          this.buscarConsolidado();
        }
      });
  };

  obtenerDetallesConsolidadoPlazas = () => {

    let data = {
      "idEtapaProceso": this.idEtapaProceso,
      "codigoCentroTrabajoMaestro": this.codSedeCabecera
    }

    this.dataService.Contrataciones().getDetalleEstadosYCantidadesConsolidado(data).pipe(
      catchError(() => of([])),
      finalize(() => { })
    )
      .subscribe((response: any) => {
        if (response) {
          //this.buscarConsolidado();
          // debugger;
          this.totalRegistros = response.detalleMotivoRechazo.totalIGED;
          this.totalValidados = response.detalleMotivoRechazo.totalValidados;
          this.totalPendientes = response.detalleMotivoRechazo.totalPendientes;
          this.totalRechazados = response.detalleMotivoRechazo.totalRechazados;
          this.totalAprobados = response.detalleMotivoRechazo.totalAprobados;
          this.anio = response.detalleMotivoRechazo.anio;
          this.descripcionMaestroProceso = response.detalleMotivoRechazo.descripcionMaestroProceso;

          console.log("Detalles calculados estados consoliddo plazas", response, "datos", this.totalRegistros, this.totalValidados, this.totalPendientes, this.totalRechazados);

        }
      });
  };

  loadInstancia = (activo) => {
    this.dataService.Contrataciones().getComboInstancia(activo).pipe(
      catchError(() => of([])),
      finalize(() => { })
    )
      .subscribe((response: any) => {
        if (response) {
          const data = response.map((x) => ({
            ...x,
            value: x.id_instancia,
            label: `${x.descripcion_instancia}`,
          }));
          this.comboLists.listInstancia = data;
          this.comboLists.listInstancia.unshift({ value: this.opcionFiltro.item.value, label: this.opcionFiltro.item.label });
        }
      });
  };

  loadSubInstancia = (idInstancia, activo) => {
    if (idInstancia == null || idInstancia == -1) {
      this.comboLists.listSubInstancia = [];
      this.comboLists.listSubInstancia.unshift({ value: this.opcionFiltro.item.value, label: this.opcionFiltro.item.label });

      return;
    } else {
      this.dataService.Contrataciones().getComboSubinstancia(idInstancia, activo).pipe(
        catchError(() => of([])),
        finalize(() => { })
      )
        .subscribe((response: any) => {
          if (response) {
            const data = response.map((x) => ({
              ...x,
              value: x.id_subinstancia,
              label: `${x.descripcion_subinstancia}`,
            }));

            this.comboLists.listSubInstancia = data;
            this.comboLists.listSubInstancia.unshift({ value: this.opcionFiltro.item.value, label: this.opcionFiltro.item.label });
            this.form.get("idSubInstancia").setValue(this.opcionFiltro.item.value);
          }
        });
    }
  };

  loadEstadosConsolidado = () => {
    this.dataService.Contrataciones().getComboEstadosConsolidadoPlaza(CatalogoItemEnum.ESTADOS_CONSOLIDADO).pipe(
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
  };

  handleBuscar = () => {
    this.buscarConsolidado();
  };

  buscarConsolidado(): void {
    this.setRequest();
    this.dataSource.load(this.request, this.paginator.pageIndex + 1, this.paginator.pageSize);
  }

  handleLimpiar(): void {
    this.resetForm();
    this.handleBuscar();
  }

  setRequest = () => {
    this.currentSession = this.dataService.Storage().getInformacionUsuario();

    const dre = this.form.get("idInstancia").value;// this.form.get("idInstancia").value; 
    const ugel = this.form.get("idSubInstancia").value;
    const estado = this.form.get("idEstadoConsolizadoPlaza").value;
    this.request = {
      idProceso: this.etapaResponse.id_proceso,
      idEtapaProceso: this.etapaResponse.id_etapa_proceso,
      idDre: dre == -1 ? null : parseInt(dre?.toString().split("-")[1]), //dre
      idUgel: ugel == -1 ? null : parseInt(ugel?.toString().split("-")[1]), //ugel
      idEstado: estado == -1 ? null : estado,
      usuarioCreacion: this.currentSession.numeroDocumento,
      maestroProceso: null,
      anio: null,
      codigoCentroTrabajoMaestro: this.currentSession.codigoSede,
      numeroDocumentoIdentidad: this.currentSession.numeroDocumento,
      tipoDocumento: this.currentSession.tipoNumeroDocumento,
      codigoRol: this.currentSession.codigoRol,
      idIteracion:this.bandejaConsolidado.getIteracion(),
      idFlujoEstado:this.bandejaConsolidado.getIdFlujoEstado()
    };
  };

  resetForm = () => {
    //this.form.reset();
    //this.form.get("idInstancia").setValue(this.opcionFiltro.item.value);
    this.form.get("idSubInstancia").setValue(this.opcionFiltro.item.value);
    this.form.get("idEstadoConsolizadoPlaza").setValue(this.opcionFiltro.item.value);
  };

  handleRetornar = () => {
    //this.router.navigate(["../../"], { relativeTo: this.route });
    this.router.navigate(["../../../../../bandejas/aprobacionespendientes"], { relativeTo: this.route });

    // http://localhost:4200/ayni/personal/bandejas/aprobacionespendientes
  };

  handleExportar = () => {
    if (this.dataSource.data.length === 0) {
      this.dataService.Message().msgWarning('"NO SE ENCONTRÓ INFORMACIÓN PARA EXPORTAR."', () => { });
      return;
    }

    // ************************************************************************************************
    let fechaActual = new Date();
    var dateString = new Date(fechaActual.getTime() - (fechaActual.getTimezoneOffset() * 60000))
      .toISOString()
      .split("T")[0];
    try {
      var nombreExportar: string = "Consolidado_Plazas" + " - " + dateString + ".xlsx"; //+(this.form.get('anio').value);
    } catch{
      var nombreExportar: string = "Consolidado_Plazas" + "" + ".xlsx";
    }
    // ************************************************************************************************


    this.dataService.Spinner().show("sp6");
    this.dataService.Contrataciones().exportarConsolidadoPlaza(this.request).pipe(
      catchError((e) => of(null)),
      finalize(() => {
        this.dataService.Spinner().hide("sp6");
      })
    )
      .subscribe((response: any) => {
        if (response) {
          descargarExcel(response.file, nombreExportar);
        } else {
          this.dataService.Message().msgWarning('"NO SE GENERÓ CORRECTAMENTE EL ARCHIVO EXCEL DE CONSOLIDADO DE PLAZAS."', () => { });
        }
      });
  }
  permiteGenerarPDF:boolean = false;
  obtenerPermitirGenerarPDF = () => {
    this.setRequest();
    this.dataService
      .Contrataciones()
      .getPremitirGenerarPDF(this.request)
      .pipe(
        catchError(() => of([])),
        finalize(() => {
        })
      ).subscribe((response: boolean) => {
        this.permiteGenerarPDF = response;
      });
  }
  handleAprobarPlazas = () => {
    //if (this.totalValidados == 0){
    //this.dataService.Message().msgWarning('"NO EXISTE REGISTROS CON EL ESTADO VALIDADO PARA REALIZAR LA APROBACIÓN MASIVA"'); //M146
    //return;
    //}

    this.setRequest();
    this.dataService
      .Contrataciones()
      .getPremitirAprobar(this.request)
      .pipe(
        catchError(() => of([])),
        finalize(() => {
        })
      ).subscribe((response: any) => {
        if (!response) {
          return this.dataService
            .Message()
            .msgWarning('"NO SE PUEDE REALIZAR LA APROBACIÓN MASIVA, YA QUE NO EXISTEN REGISTROS VALIDADOS"');
        }
        procesarAprobacion();
      });
    let procesarAprobacion = () => {
      this.dataService.Message().msgConfirm("¿ESTÁ SEGURO QUE DESEA APROBAR LA VALIDACIÓN DE PLAZAS DE TODAS LAS IGED?",
        () => {
          this.dataService.Spinner().show("sp6");
          this.dataService.Contrataciones().aprobarMasivoConsolidadoPlazas(this.request).pipe(
            catchError((e) => of(e)),
            finalize(() => {
              this.dataService.Spinner().hide("sp6");
            })
          )
            .subscribe((response: any) => {
              if (response) {
                this.dataService.Message().msgAutoCloseSuccessNoButton('"OPERACIÓN REALIZADA DE FORMA EXITOSA."', 3000, () => { });
                this.handleBuscar();
                this.obtenerPermitirGenerarPDF();
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

  handleGenerarPdf = () => {

    let totalAprobadosOK = this.totalAprobados;//this.dataSource.data[0].totalAprobados==null?0:this.dataSource.data[0].totalAprobados;
    let totalRegistrosOK = this.totalRegistros;//this.dataSource.data[0].total_registros==null?0:this.dataSource.data[0].total_registros;

    if ((totalRegistrosOK == 0) || (totalAprobadosOK < totalRegistrosOK)) {
      //this.dataService.Message().msgWarning('"EL CONSOLIDADO DE PLAZAS SE GENERARÁ CUANDO TODAS LAS UGELES ESTÉN EN ESTADO APROBADO"', () => {} ); // M147
      //return;
      this.dataService.Message().msgWarning('"NO SE PUEDE GENERAR EL LISTADO DE PLAZAS, EXISTE REGISTROS NO APROBADOS"'); // M147
      return;
    }

    this.request.maestroProceso = this.descripcionMaestroProceso;//"CONTRATACIÓN DOCENTE";
    this.request.usuarioCreacion = this.currentSession.numeroDocumento;
    this.request.anio = this.anio;//2021;

    const resultMessage = '"SE GENERÓ CORRECTAMENTE EL DOCUMENTO PDF DE LAS PLAZAS."';
    this.dataService.Message().msgConfirm("¿ESTÁ SEGURO DE GENERAR EL DOCUMENTO PDF DE LAS PLAZAS?",
      () => {
        this.dataService.Spinner().show("sp6");
        this.dataService.Contrataciones().generarPdfConsolidadoPlazas(this.request).pipe(
          catchError((e) => of(e)),
          finalize(() => {
            this.dataService.Spinner().hide("sp6");
          })
        )
          .subscribe((response: any) => {
            if (response.file) {
              this.consolidadoPlazasPdf = response.file;
              this.dataService.Message().msgAutoCloseSuccessNoButton(resultMessage, 3000, () => { });
            } else if (response && response.statusCode === ResultadoOperacionEnum.NotFound) {
              this.dataService.Message().msgWarning(response.messages[0], () => { });
            } else if (response && response.statusCode === ResultadoOperacionEnum.UnprocessableEntity) {
              this.dataService.Message().msgWarning(response.messages[0], () => { });
            } else {
              this.dataService.Message().msgError('"OCURRIERON PROBLEMAS AL TRATAR DE GENERAR EL DOCUMENTO PDF."', () => { });
            }
          });
      }, (error) => { }
    );
  }

  handleVerConsolidadoPlazas() {
            this.dialogRef = this.materialDialog.open(ModalDocumentosPublicadosComponent, {
                panelClass: 'minedu-modal-documentos-publicados',
                disableClose: true,
                data: {
                    idEtapaProceso: this.idEtapaProceso,
                    idGrupoDocumento: GrupoDocumentoPublicadoEnum.CONSOLIDADO,
                    nombreDocumento: 'Plazas Contratación Docente',
                    esbecario:false,
                    dialogTitle:"Consolidado de plazas",
                    columnTitle:"Aprobación",
		    codigoCentroTrabajoMaestro: this.codSedeCabecera,
                    idIteracion:this.bandejaConsolidado.getIteracion(),
                    esDre : true
                }
            });
    //let fechaActual = new Date();
    //var dateString = new Date(fechaActual.getTime() - (fechaActual.getTimezoneOffset() * 60000))
      //.toISOString()
      //.split("T")[0];
    //let nombreArchivo = "Plazas Contratación Docente - " + dateString + " - " + this.currentSession.codigoPadreSede;
//
    //if (!this.consolidadoPlazasPdf) {
      //this.dataService.Message().msgWarning('"NO SE PUDO ACCEDER AL DOCUMENTO PDF DEL CONSOLIDADO DE PLAZAS."', () => { });
      //return;
    //}
    //this.dataService.Spinner().show("sp6");
    //this.dataService.Documento().descargar(this.consolidadoPlazasPdf).pipe(
      //catchError((e) => { this.dataService.SnackBar().msgError('"ERROR, NO SE PUDO ACCEDER AL SERVICIO."', 'Cerrar'); return of(e); }),
      //finalize(() => this.dataService.Spinner().hide("sp6"))
    //).subscribe(response => {
      //if (response) {
        //console.log("datos documento consolidado plazas viewer", response);
        //this.handlePreview(response, nombreArchivo);
      //} else {
        //this.dataService.Message().msgWarning('"NO SE PUDO ACCEDER AL DOCUMENTO PDF DEL CONSOLIDADO DE PLAZAS."', () => { });
      //}
    //});
  }

  handlePreview(file: any, nameFile: string) {
    this.dialogRef = this.materialDialog.open(DocumentViewerComponent, {
      panelClass: 'modal-viewer-form-dialog',
      disableClose: true,
      data: {
        modal: {
          icon: "remove_red_eye",
          title: "Consolidado Plazas",
          file: file,
          fileName: nameFile
        }
      }
    });

    this.dialogRef.afterClosed().subscribe((response: any) => {
      if (!response) {
        return;
      }
      if (response.download) {
        saveAs(file, nameFile + ".pdf");
      }
    });
  }

  handleMotivoRechazo = (detalleConsolidado) => {
    this.dialogRef = this.materialDialog.open(MotivoRechazoComponent, {
      panelClass: "motivo-rechazo-dialog",
      width: "700px",
      disableClose: true,
      data: {
        action: "motivoDetalle",
        detalle: detalleConsolidado
      },
    });
    this.dialogRef.afterClosed().subscribe((resp) => {
      if (resp?.grabado) {
        this.buscarConsolidado();
      }
    });
  }

  handleGoConsolidadoPlzaDetalle = (row) => {
    this.router.navigate(["../../consolidadoplazadetalle/" + this.etapaResponse.id_etapa_proceso + "/" + row.id_consolidado_plaza],//
      { relativeTo: this.route }
    )
  };

  transformarFecha(date) {
    return this.datePipe.transform(date, 'dd/MM/yyyy HH:mm a');
  }

  obtenerFlujoEstado (){
    let data = {
      idEtapaProceso: this.idEtapaProceso,
      codigoDre: this.currentSession.codigoSede,
      codigoTipoAccion: TipoAccionEnum.CONSOLIDADO,
      codigoEstadoInformacion: FlujoEstadoEnum.PENDIENTE,
    }
    this.dataService.Contrataciones()
    .getFlujoEstadoPorCodigoDre(data)
    .pipe(
      catchError(() => { return of(null); })
    )
    .subscribe(this.bandejaConsolidado.setFlujoEstado);
  }
}

export class ConsolidadoDataSource extends DataSource<any> {
  private _dataChange = new BehaviorSubject<any>([]);
  private _loadingChange = new BehaviorSubject<boolean>(false);
  public loading = this._loadingChange.asObservable();
  public totalregistro = 0;

  constructor(private dataService: DataService) {
    super();
  }

  load(data: any, pageIndex, pageSize): void {
    this._loadingChange.next(false);
    this.dataService.Spinner().show("sp6");
    if (data.idProceso == null && data.idEtapaProceso == null) {
      this._loadingChange.next(false);
      this._dataChange.next([]);
    } else {
      this.dataService
        .Contrataciones()
        .getListaConsolidadoPlaza(data, pageIndex, pageSize)
        .pipe(
          catchError(() => of([])),
          finalize(() => {
            this._loadingChange.next(false);
            this.dataService.Spinner().hide("sp6");
          })
        ).subscribe((response: any) => {
          this._dataChange.next(response || []);
          this.totalregistro = (response || []).length === 0 ? 0 : response[0].total_registros;
          if ((response || []).length === 0) {
            this.dataService.Message().msgWarning('"NO SE ENCONTRÓ INFORMACIÓN PARA LOS CRITERIOS DE BÚSQUEDA SELECCIONADO."',
              () => { }
            );
          }
        });
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
