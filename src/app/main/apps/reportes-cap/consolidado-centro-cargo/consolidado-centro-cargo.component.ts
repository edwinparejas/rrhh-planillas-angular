import { CollectionViewer, DataSource, SelectionModel } from '@angular/cdk/collections';
import { HttpErrorResponse } from '@angular/common/http';
import { AfterViewInit, Component, OnDestroy, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { MatTabGroup } from '@angular/material/tabs';
import { mineduAnimations } from '@minedu/animations/animations';
import { DataService } from 'app/core/data/data.service';
import { CentroTrabajoModel } from 'app/core/model/centro-trabajo.model';
import { SecurityModel } from 'app/core/model/security/security.model';
import { TablaEquivalenciaSede, TablaTipoCentroTrabajo } from 'app/core/model/types';
import { descargarExcel } from 'app/core/utility/functions';
import { saveAs } from 'file-saver';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { catchError, finalize, tap } from 'rxjs/operators';
import { DocumentViewerComponent } from '../../components/document-viewer/document-viewer.component';
import { BuscarCentroTrabajoComponent } from '../components/buscar-centro-trabajo/buscar-centro-trabajo.component';
import { MESSAGE_REPORTES_CAP } from '../_utils/messages';
import { CodigoNivelInstancia, CodigoTipoReporteCAP } from '../_utils/types-reportes-cap';

@Component({
  selector: 'minedu-consolidado-centro-cargo',
  templateUrl: './consolidado-centro-cargo.component.html',
  styleUrls: ['./consolidado-centro-cargo.component.scss'],
  encapsulation: ViewEncapsulation.None,
  animations: mineduAnimations
})
export class ConsolidadoCentroCargoComponent implements OnInit, OnDestroy, AfterViewInit {

  form: FormGroup;
  export: boolean = false;
  working: boolean = false;
  tiempoMensaje: number = 3000;  

  private passport: SecurityModel = new SecurityModel();
  
  idSubinstancia: any = null;

  mostrarInstancia : boolean = false;
  mostrarSubinstancia: boolean = false;
  mostrarTipoCentroTrabajo: boolean = false;
  mostrarModalidadNivelEducativo: boolean = false;
  mostrarInstitucionEducativa: boolean = false;

  codigoNivelInstancia: number = 0;

  centroTrabajo: CentroTrabajoModel = null;
  filtroGrid: any = null;

  max = new Date(new Date().setFullYear(new Date().getFullYear()));

  instancias: any[];
  subinstancias: any[];
  tiposCentroTrabajo: any[] = [];
  modalidades: any[] = [];
  nivelesEducativos: any[] = []; 

  consulta = {
    codigoTipoReporteCAP: null,
    idOtraInstancia: null,
    idInstancia: null,
    idSubinstancia: null,
    idTipoCentroTrabajo: null,
    codigoNivelInstancia: null,
    codigoTipoSede: null,
    codigoSede: null,
    idModalidadEducativa: null,
    idNivelEducativo: null,
    codigoCentroTrabajo: null,
    usuarioCreacion: null,
    nombreUsuario: null
  };

  displayedColumns: string[] = [
    'index',
    'centroTrabajo',
    'regimenLaboral',
    'tipoCargo',
    'cargo',
    'nombrados',
    'contratados',
    'otros',
    'plazasOcupadas',
    'plazasVacantes',
    'totalPlazas'
  ];
  displayedSPanColumns: string[] = [
    'span-index',
    'span-centroTrabajo',
    'span-regimenLaboral',
    'span-tipoCargo',
    'span-cargo',
    'span-condicionLaboral',
    'span-plazasOcupadas',
    'span-plazasVacantes',
    'span-totalPlazas'
  ];

  displayedHistorialColumns: string[] = [
    'index',
    'anio',
    'instancia',
    'subinstancia',
    'tipoCentroTrabajo',
    'codigoModular',
    'fechaReporte',
    'usuario',
    'estado',
    'reporte'
  ];
  dataSourceHistorial: MatTableDataSource<any> = new MatTableDataSource<any>();

  dialogRef: any;

  private _loadingChange = new BehaviorSubject<boolean>(false);
  dataSource: ReporteDataSource | null;
  loadingHistorial = this._loadingChange.asObservable();
  cantidadLoadings = 0;
  selection = new SelectionModel<any>(false, []);
  
  @ViewChild('paginatorReporte', { static: true }) paginator: MatPaginator;
  @ViewChild('paginatorHistorial', { static: true }) paginatorHistorial: MatPaginator;

  @ViewChild('tabs') tabGroup: MatTabGroup;

  constructor(
    private formBuilder: FormBuilder,
    private dataService: DataService,
    private materialDialog: MatDialog
    ) { }

  ngOnInit(): void {
    this.buildForm();
    this.defaultGrid();
    this.buildPassport();
    this.loadInstancia(true);
  }


  ngAfterViewInit() {
    this.paginator.page
      .pipe(
        tap(() => this.handleGrid(true))
      )
      .subscribe();

      this.paginatorHistorial.page
        .pipe(
          tap(() => this.loadHistorialReportes())
        )
        .subscribe();
  }

  buildForm() {
    this.form = this.formBuilder.group({
      idInstancia: [null],
      idSubinstancia: [null],
      idTipoCentroTrabajo: [null],
      idModalidadEducativa: [null],
      idNivelEducativo: [null],
      codigoCentroTrabajo: [null]
    });

    this.form.get("idInstancia").valueChanges.subscribe((value) => {
      this.subinstancias = [];
      this.form.patchValue({ idSubinstancia: '-1' });
      this.mostrarInstancia = true;
      this.mostrarSubinstancia = false;
      if (value !== null && value !== undefined && value !== "-1") {
          const data = this.instancias.find((x) => x.idInstancia === value);
          const codigoNivelInstancia = parseInt(value.split("-")[0].toString());
          const idInstancia = data.id;

          if (codigoNivelInstancia == CodigoNivelInstancia.MINEDU) {
              this.mostrarInstancia = true;
              this.mostrarSubinstancia = false;
              this.loadTipoCentroTrabajo(codigoNivelInstancia, true);
          }
          else {
              this.loadSubinstancia(idInstancia, true);
              this.mostrarInstancia = true;
              this.mostrarSubinstancia = true;
          }
          this.form.controls["idSubinstancia"].setValue("-1");
          this.form.controls["idTipoCentroTrabajo"].setValue("-1");
      } else {
          this.mostrarInstancia = true;
          this.mostrarSubinstancia = false;
          this.tiposCentroTrabajo=[];
      }
    });
    
    this.form.get("idSubinstancia").valueChanges.subscribe((value) => {
      this.form.patchValue({ idTipoCentroTrabajo: "-1" });
  
      if (value && value !== "-1") {
          const codigoNivelInstancia = parseInt(value.split("-")[0].toString());
          this.tiposCentroTrabajo = [];  
          this.loadTipoCentroTrabajo(codigoNivelInstancia, true);          
      } else {
        this.form.controls["idTipoCentroTrabajo"].setValue("-1");
        this.form.controls["idTipoCentroTrabajo"].disable({onlySelf: true, emitEvent: false});
      }
    });

    this.form.get("idTipoCentroTrabajo").valueChanges.subscribe((value) => {
      this.form.patchValue({ idModalidadEducativa: "-1", idNivelEducativo: "-1", codigoCentroTrabajo: '' });
      this.mostrarModalidadNivelEducativo = false;
      this.mostrarInstitucionEducativa = false;

      if (value && value !== "-1") {
          const tipoCentroTrabajo = this.tiposCentroTrabajo.find(pred => pred.idTipoCentroTrabajo === value);
          if (tipoCentroTrabajo.codigoTipoCentroTrabajo == TablaTipoCentroTrabajo.INSTITUCION_EDUCATIVA_DRE||
              tipoCentroTrabajo.codigoTipoCentroTrabajo == TablaTipoCentroTrabajo.INSTITUCION_EDUCATIVA_UGEL) {
              this.mostrarInstitucionEducativa = true;
          } else {
              this.mostrarInstitucionEducativa = false;
          }

          if (tipoCentroTrabajo.codigoTipoCentroTrabajo == TablaTipoCentroTrabajo.INSTITUCION_EDUCATIVA_DRE ||
              tipoCentroTrabajo.codigoTipoCentroTrabajo == TablaTipoCentroTrabajo.INSTITUCION_EDUCATIVA_UGEL ||
              tipoCentroTrabajo.codigoTipoCentroTrabajo == TablaTipoCentroTrabajo.INSTITUTO_SUPERIOR_DRE ||
              tipoCentroTrabajo.codigoTipoCentroTrabajo == TablaTipoCentroTrabajo.INSTITUTO_SUPERIOR_UGEL
          ) {
              this.mostrarModalidadNivelEducativo = true;
              this.mostrarInstitucionEducativa = true;
              this.getModalidadesEducativas(value);
          } else {
              this.mostrarModalidadNivelEducativo = false;
          }
      }
    });
    
    this.form.get("idModalidadEducativa").valueChanges.subscribe((value) => {
      this.nivelesEducativos = [];
      this.form.patchValue({ idNivelEducativo: null });
      if (value && value !== "-1") {
          this.getNivelesEducativos(value);
      }
    });
  }

  buildPassport() {
    this.passport = this.dataService.Storage().getInformacionUsuario();
    if (this.passport.codigoTipoSede === TablaEquivalenciaSede.CODIGO_TIPO_SEDE_OFICINA)
      this.passport.codigoSede = TablaEquivalenciaSede.CODIGO_SEDE;
  }
  
  default() {
    this.form.patchValue({
      idInstancia: "-1",
      idSubinstancia: "-1"
    });

    switch (this.codigoNivelInstancia) {

        case CodigoNivelInstancia.MINEDU: {
            const idInstancia = this.codigoNivelInstancia + "-" + this.centroTrabajo.idOtraInstancia;
            this.form.controls["idInstancia"].setValue(idInstancia);
            this.form.controls["idInstancia"].enable({onlySelf: true, emitEvent: false});
            this.mostrarInstancia = true;
            this.mostrarSubinstancia = false;
            break;
        }
        case CodigoNivelInstancia.DRE: {
            if(this.passport.codigoTipoSede === TablaEquivalenciaSede.CODIGO_TIPO_INSTITUCION_EDUCATIVA){
                const idInstancia = this.codigoNivelInstancia + "-" + this.centroTrabajo.idDre;
                this.form.controls["idInstancia"].setValue(idInstancia);
                this.form.controls["idInstancia"].disable({onlySelf: true, emitEvent: false});

                const idSubinstancia = CodigoNivelInstancia.UGEL  + "-" + this.centroTrabajo.idUgel;
                this.form.controls["idSubinstancia"].setValue(idSubinstancia);
                this.form.controls["idSubinstancia"].disable({onlySelf: true, emitEvent: false});
                this.mostrarInstancia = true;
                this.mostrarSubinstancia = true;
            }
            else{
                const idInstancia = this.codigoNivelInstancia + "-" + this.centroTrabajo.idDre;
                this.form.controls["idInstancia"].setValue(idInstancia);
                this.form.controls["idInstancia"].disable({onlySelf: true, emitEvent: false});
                this.mostrarInstancia = true;
                this.mostrarSubinstancia = true;
            }                
            break;
        }
        case CodigoNivelInstancia.UGEL:
        case CodigoNivelInstancia.IIEE: {
            const idInstancia = CodigoNivelInstancia.DRE + "-" + this.centroTrabajo.idDre;
            this.form.controls["idInstancia"].setValue(idInstancia);
            this.form.controls["idInstancia"].disable({onlySelf: true, emitEvent: false});

            const idSubinstancia = this.codigoNivelInstancia + "-" + this.centroTrabajo.idUgel;
            this.form.controls["idSubinstancia"].setValue(idSubinstancia);
            this.form.controls["idSubinstancia"].disable({onlySelf: true, emitEvent: false});
            this.mostrarInstancia = true;
            this.mostrarSubinstancia = true;
            break;
        }
    }

    this.form.controls["codigoCentroTrabajo"].reset();
  }

  defaultGrid() {
    this.dataSource = new ReporteDataSource(this.dataService);
    this.buildPaginators(this.paginator);
    this.buildPaginators(this.paginatorHistorial);
  }

  buildPaginators(paginator: MatPaginator): void {
      paginator.showFirstLastButtons = true;
      paginator._intl.itemsPerPageLabel = "Registros por página";
      paginator._intl.nextPageLabel = "Siguiente página";
      paginator._intl.previousPageLabel = "Página anterior";
      paginator._intl.firstPageLabel = "Primera página";
      paginator._intl.lastPageLabel = "Última página";
      paginator.pageSize = 10;
      paginator._intl.getRangeLabel = (page: number, pageSize: number, length: number) => {
          if (length === 0 || pageSize === 0) {return `0 de ${length}`;}
          const length2 = Math.max(length, 0);
          const startIndex = page * pageSize;
          const endIndex = startIndex < length2 ? Math.min(startIndex + pageSize, length2) : startIndex + pageSize;
          return `${startIndex + 1} – ${endIndex} de ${length2}`;
      }
  }

  entidadPassport(){
    this.cargarLoading();
    this.dataService.ReportesCAP().entidadPassport(this.passport.codigoSede).pipe(
      catchError((error: HttpErrorResponse) => {
        this.dataService.Message().msgWarning(error.error.messages[0]); return of(null);
      }),
      finalize(() => this.descargarLoading())
    ).subscribe((response: any) => {
      if (response.length > 0){
        this.codigoNivelInstancia = response[0].idNivelInstancia;
        this.centroTrabajo = response[0];
        this.default();
        this.loadHistorialReportes();
      }else{
        this.dataService.Util().msgWarning(MESSAGE_REPORTES_CAP.INVALID_ENTIDAD_PASSPORT, () => { });
        this.centroTrabajo = null;
      }
    });
  }
  
  loadInstancia(activo) {
    this.cargarLoading();
    this.dataService.ReportesCAP().getInstancias(activo)
      .pipe(
        catchError((error: HttpErrorResponse) => {
          this.dataService.Message().msgWarning(error.error.messages[0]); return of(null);
        }),
        finalize(() => this.descargarLoading())
      ).subscribe((instancias) => {
        if (instancias) {
          this.instancias = instancias;
          this.entidadPassport();
        }
      });
  }

  loadSubinstancia(idInstancia, activo) {
    this.cargarLoading();
    this.dataService.ReportesCAP().getSubInstancias(idInstancia, activo)
        .pipe(
          catchError((error: HttpErrorResponse) => {
            this.dataService.Message().msgWarning(error.error.messages[0]); return of(null);
          }),
          finalize(() => this.descargarLoading())
        ).subscribe((subinstancias) => {
            if (subinstancias)
              this.subinstancias = subinstancias; 
        });
  }

  loadTipoCentroTrabajo = (codigoNivelInstancia, activo) => {
    this.cargarLoading();
    this.dataService.ReportesCAP().getTipoCentroTrabajo(codigoNivelInstancia, activo)
        .pipe(
          catchError((error: HttpErrorResponse) => {
            this.dataService.Message().msgWarning(error.error.messages[0]); return of(null);
          }),
          finalize(() => this.descargarLoading())
        )
        .subscribe((tiposCentroTrabajo) => {
            if (tiposCentroTrabajo) {
              this.tiposCentroTrabajo = tiposCentroTrabajo;
              if (this.tiposCentroTrabajo.length === 1) {
                  this.form.controls["idTipoCentroTrabajo"].setValue( this.tiposCentroTrabajo[0].idTipoCentroTrabajo );
                  this.form.controls["idTipoCentroTrabajo"].disable({onlySelf: true, emitEvent: false});
              } else {
                  this.form.controls["idTipoCentroTrabajo"].setValue("-1");
                  this.form.controls["idTipoCentroTrabajo"].enable({onlySelf: true, emitEvent: false});
              }
            }
        });
  }
  
  getModalidadesEducativas(idTipoCentroTrabajo) {
    this.cargarLoading()
    let esDre = this.centroTrabajo.idUgel != 0 ? false : true;
    this.dataService.ReportesCAP().getModalidadesEducativas(idTipoCentroTrabajo, esDre)
      .pipe(
        catchError((error: HttpErrorResponse) => {
          this.dataService.Message().msgWarning(error.error.messages[0]); return of(null);
        }),
        finalize(() => this.descargarLoading())
      )
      .subscribe((response) => {
          this.modalidades = [];
          if (response) 
            this.modalidades = response;
      });
  }

  getNivelesEducativos(idModalidadEducativa) {
    if (!idModalidadEducativa) return;
    this.cargarLoading()
    this.dataService.ReportesCAP().getNivelesEducativos(idModalidadEducativa)
      .pipe(
        catchError((error: HttpErrorResponse) => {
          this.dataService.Message().msgWarning(error.error.messages[0]); return of(null);
        }),
        finalize(() => this.descargarLoading())
      )
      .subscribe((response) => {
          this.nivelesEducativos = [];
          if (response) 
            this.nivelesEducativos = response;
      });
  }

  busquedaPersonalizada(data) {
    var codigoIngresado = this.form.controls["codigoCentroTrabajo"].value;

    if (codigoIngresado !== null && codigoIngresado !== "") {
        //this.buscarCentrotrabajo(null);
        //return;
    }

    this.dialogRef = this.materialDialog.open(
        BuscarCentroTrabajoComponent,
        {
            panelClass: "buscar-centro-trabajo-dialog",
            width: "1300px",
            disableClose: true,
            data: {
                action: "requerimiento",
                centroTrabajo: this.centroTrabajo,
                centrosTrabajo: [],
                permiteBuscar: true
            },
        }
    );

    this.dialogRef.afterClosed().subscribe((response: any) => {
        if (!response) {
            return;
        }

        var data = [response];
        this.setCentroTrabajo(data);
    });
  }

  setCentroTrabajo(data) {
    if (data.length > 1) {
        this.form.controls["codigoCentroTrabajo"].setValue("");
        this.busquedaPersonalizada(data);
        this.dataService.Util().msgWarning(MESSAGE_REPORTES_CAP.CENTRO_TRABAJO, () => { });
        return;
    }
    this.form.patchValue({codigoCentroTrabajo: data[0].codigoCentroTrabajo});
  }

  validacionParametros(): boolean {
    const data = this.form.getRawValue();
    if (
      (data.idInstancia === "-1") ||
      (data.idSubinstancia === "-1")
    ) {
      this.dataService.Message().msgWarning(MESSAGE_REPORTES_CAP.M01, () => { });
      return false;
    }
    return true;
  }

  setParametrosConsulta() {
    const data = this.form.getRawValue();
    var codigoNivelInstancia = null;
    var idOtraInstancia = null;
    var idInstancia = null;
    var idSubinstancia = null;

    if (data.idInstancia !== "-1") {
      idOtraInstancia = this.centroTrabajo.idOtraInstancia;
      codigoNivelInstancia = data.idSubinstancia.split('-')[0];
      idInstancia = data.idInstancia.split('-')[1];
    }
    if (data.idSubinstancia !== "-1") {
      codigoNivelInstancia = data.idSubinstancia.split('-')[0];
      idSubinstancia = data.idSubinstancia.split('-')[1];
    }

    this.consulta = {
      codigoTipoReporteCAP: CodigoTipoReporteCAP.CONSOLIDADO_SP_X_CENTRO_CARGO,
      idOtraInstancia: idOtraInstancia,
      idInstancia: +idInstancia,
      idSubinstancia: +idSubinstancia,
      idTipoCentroTrabajo: +(data.idTipoCentroTrabajo !== "-1" ? data.idTipoCentroTrabajo : 0),
      codigoNivelInstancia: +codigoNivelInstancia,
      codigoTipoSede: this.passport.codigoTipoSede,
      codigoSede: this.passport.codigoSede,
      idModalidadEducativa: +(data.idModalidadEducativa !== "-1" ? data.idModalidadEducativa : 0),
      idNivelEducativo: +(data.idNivelEducativo !== "-1" ? data.idNivelEducativo : 0),
      codigoCentroTrabajo: data.codigoCentroTrabajo.trim(),
      usuarioCreacion: this.passport.numeroDocumento,
      nombreUsuario: this.passport.nombreCompleto
    };
  }

  handleGenerarReporte() {
    if (!this.validacionParametros()) return;

    this.setParametrosConsulta();
    this.dataService.Message().msgConfirm(MESSAGE_REPORTES_CAP.M47, () => {
      this.cargarLoading();
      this.dataService.ReportesCAP().obtenerIdReporteCAPExistenteEnMes(this.consulta)
      .pipe(
        catchError((error: HttpErrorResponse) => {
          this.dataService.Message().msgWarning(error.error.messages[0]); return of(null);
        }),
        finalize(() => { this.descargarLoading(); this.working = false; })
      )
      .subscribe(idReporteExistente => {
        if (idReporteExistente && idReporteExistente > 0)
          this.dataService.Message().msgConfirm(MESSAGE_REPORTES_CAP.CONFIRM_GENERAR_REPORTE_REEMPLAZO, () => {
            this.generarReporte() }, () => { });
        else
          this.generarReporte();
      });
    }, () => { });
  }
  
  generarReporte() {
    this.cargarLoading();
    this.working = true;
    this.dataService.ReportesCAP().GenerarReporteCAP(this.consulta)
      .pipe(
        catchError((error: HttpErrorResponse) => {
          this.dataService.Message().msgWarning(error.error.messages[0]); return of(null);
        }),
        finalize(() => { this.descargarLoading(); this.working = false; })
      )
      .subscribe(codigoDocumentoGenerado => {
        if (codigoDocumentoGenerado) {
          this.dataService.Message().msgAutoCloseSuccessNoButton(MESSAGE_REPORTES_CAP.M07, this.tiempoMensaje, () => {
            this.tabGroup.selectedIndex = 1;
            this.loadHistorialReportes();
          });
          //this.handlePreview("Consolidado por Centro Trabajo y Cargo", this.pdfFromBase64(codigoDocumentoGenerado.cadenaBase64), "Consolidado por Centro Trabajo y Cargo");
        }
      });
  }

  handleGrid(autoSearch: boolean = false) {
    if (!this.validacionParametros()) return;

    this.setParametrosConsulta();
    this.tabGroup.selectedIndex = 0;    
    this.dataSource.load(this.consulta, (this.paginator.pageIndex + 1), this.paginator.pageSize, autoSearch);
  }

  handleLimpiar() {
    this.default();
    this.defaultGrid();
  }

  handleBuscar() {
    this.paginator.pageIndex = 0;
    this.handleGrid();
  }

  handleExportar() {
    if (this.consulta) {
      this.cargarLoading();
      this.dataService.ReportesCAP().exportarConsolidadoCentroCargo(this.consulta).pipe(
        catchError((error: HttpErrorResponse) => {
          this.dataService.Message().msgWarning(error.error.messages[0]); return of(null);
        }),
        finalize(() => { this.descargarLoading(); })
      ).subscribe((response: any) => {
        if (response) {
          const anio = new Date().getFullYear();
          const subinstancia = this.subinstancias.find((x) => x.id === this.consulta.idSubinstancia).descripcionSubinstancia;
          const tipoCentroTrabajo = this.tiposCentroTrabajo.find((x) => x.idTipoCentroTrabajo === this.consulta.idTipoCentroTrabajo)?.descripcionTipoCentroTrabajo || '';
          descargarExcel(response, `Reporte Consolidado servidores públicos por Cent. Trab. y Cargo ${anio} ${subinstancia} ${tipoCentroTrabajo}.xlsx`);
        }
      });
    } else {
      this.dataService.Message().msgWarning(MESSAGE_REPORTES_CAP.M01, () => { });
      return;
    }
  }

  loadHistorialReportes() {    
    this.paginatorHistorial.length = 0;
    this.dataSourceHistorial.paginator = this.paginatorHistorial;
    this.dataSourceHistorial.paginator.firstPage();
    this._loadingChange.next(true);
    this.cargarLoading();
    const data = {
      codigoTipoReporteCAP: CodigoTipoReporteCAP.CONSOLIDADO_SP_X_CENTRO_CARGO,
      codigoTipoSede: this.passport.codigoTipoSede,
      idDre: this.centroTrabajo.idDre,
      idUgel: this.centroTrabajo.idUgel
    };
    this.dataService.ReportesCAP().consultarHistorialReportesCAP(data, (this.paginatorHistorial.pageIndex + 1), this.paginatorHistorial.pageSize).pipe(
      catchError(() => of([])),
      finalize(() => { this.descargarLoading(); this._loadingChange.next(false);})
    ).subscribe((response: any) => {
      if (response?.length > 0)
        this.dataSourceHistorial.data = response;
    });
  }

  handleVerReporteCAP(codigoDocumentoGenerado: string) {
    if (!codigoDocumentoGenerado) return;
    this.cargarLoading();
    this.dataService.Documento().descargar(codigoDocumentoGenerado)
      .pipe(
        catchError((error: HttpErrorResponse) => {
          this.dataService.Message().msgWarning(error.error.messages[0]); return of(null);
        }),
        finalize(() => { this.descargarLoading(); this.working = false; })
      ).subscribe(response => {
        if (response) {
          this.handlePreview("Consolidado por Centro Trabajo y Cargo", response, "Consolidado por Centro Trabajo y Cargo");
        }
      });
  }
  
  pdfFromBase64(base64: string) {
    const byteArray = new Uint8Array(
      atob(base64)
        .split("")
        .map(char => char.charCodeAt(0))
    );
    return new Blob([byteArray], { type: "application/pdf" });
  }
  
  handlePreview(title: string, file: any, nameFile: string) {
    this.dialogRef = this.materialDialog.open(DocumentViewerComponent, {
        panelClass: 'modal-viewer-form-dialog',
        disableClose: true,
        data: {
            modal: {
              icon: 'remove_red_eye',
              title: title,
              file: file,
              fileName: nameFile
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
    });
  }

  cargarLoading() {
    if (this.cantidadLoadings == 0)
      this.dataService.Spinner().show("sp6");
    this.cantidadLoadings++;
  }

  descargarLoading() {
    this.cantidadLoadings--;
    if (this.cantidadLoadings == 0)
      this.dataService.Spinner().hide("sp6");
  }

  ngOnDestroy() {
  }
}

export class ReporteDataSource extends DataSource<any>{

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
    this.dataService.ReportesCAP().consultarConsolidadoCentroCargo(data, pageIndex, pageSize).pipe(
      catchError((error: HttpErrorResponse) => {
        if (!autoSearch){
          this._totalRows = 0;
          this._dataChange.next([]);
          this.dataService.Message().msgWarning(error.error.messages[0]); return of(null);
        }
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

