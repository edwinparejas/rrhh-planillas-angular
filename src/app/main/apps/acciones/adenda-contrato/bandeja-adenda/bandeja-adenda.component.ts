import { CollectionViewer, DataSource, SelectionModel } from '@angular/cdk/collections';
import { HttpErrorResponse } from '@angular/common/http';
import { AfterViewInit, Component, OnDestroy, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { ActivatedRoute, Router } from '@angular/router';
import { mineduAnimations } from '@minedu/animations/animations';
import { DataService } from 'app/core/data/data.service';
import { SharedService } from 'app/core/shared/shared.service';
import { descargarExcel } from 'app/core/utility/functions';
import { DocumentViewerComponent } from 'app/main/apps/components/document-viewer/document-viewer.component';
import * as moment from 'moment';
// import { parseInt } from 'lodash';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { catchError, finalize, tap } from 'rxjs/operators';
import { AdjuntarDocumentoComponent } from '../components/adjuntar-documento/adjuntar-documento.component';

@Component({
  selector: 'minedu-bandeja-adenda',
  templateUrl: './bandeja-adenda.component.html',
  styleUrls: ['./bandeja-adenda.component.scss'],
  encapsulation: ViewEncapsulation.None,
  animations: mineduAnimations
})
export class BandejaAdendaComponent implements OnInit, OnDestroy, AfterViewInit {

  id_gestion_contrato: number = 0;
  datos_contrato: any = {};

  persona: any = {};
  plaza: any = {};

  form: FormGroup;
  displayedColumns: string[] = [
    'nro',
    'numeroAdenda',
    'fechaAdenda',
    'motivoAccion',
    'mandatoJudicial',
    'numeroDocumentoIdentidad',
    'nombresCompletos',
    'fechaInicio',
    'fechaFin',
    'tipoDocumento',
    'numeroDocumento',
    'estado',
    'opciones'
  ];

  dialogRef: any;
  
  dataSource: AdendaDataSource | null;
  selection = new SelectionModel<any>(false, []);
  @ViewChild(MatPaginator, { static: true })
  paginator: MatPaginator;

  constructor(
    private formBuilder: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private materialDialog: MatDialog,
    private dataService: DataService,
    private sharedService: SharedService
  ) { }

  ngOnDestroy(): void {
    // throw new Error('Method not implemented.');
  }

  ngOnInit(): void {
    this.plaza = {};
    this.persona = {};
    this.datos_contrato = {};
    
    this.route.paramMap.subscribe((params: any) => {
      debugger;
      this.id_gestion_contrato = params.get('id_gestion_contrato');
      console.log('id_gestion_contrato => ', this.id_gestion_contrato);
      
    })
    setTimeout(_ => this.buildShared());
    this.buildGrid();
    this.loadBusqueda();
    this.loadContratoPorId();
  }

  ngAfterViewInit() {
    this.paginator.page
      .pipe(
        tap(() => this.loadBusqueda())
      )
      .subscribe();
  }

  buildShared() {
    this.sharedService.setSharedBreadcrumb("Gestionar adendas DL 1057");
    this.sharedService.setSharedTitle("Gestionar adendas DL 1057");
  }

  loadBusqueda(): void {
    debugger
    let model = {
      id_gestion_contrato: this.id_gestion_contrato
    }
    this.dataSource.load(model, (this.paginator.pageIndex + 1), this.paginator.pageSize);
  }

  buildGrid() {
    this.dataSource = new AdendaDataSource(this.dataService, this.paginator);
    this.paginator.showFirstLastButtons = true;
    this.paginator._intl.itemsPerPageLabel = "Filas por tabla";
    this.paginator._intl.nextPageLabel = "Siguiente página";
    this.paginator._intl.previousPageLabel = "Página anterior";
    this.paginator._intl.firstPageLabel = "Primera página";
    this.paginator._intl.lastPageLabel = "Última página";

    this.paginator._intl.getRangeLabel = function (page, pageSize, length) {
      if (length === 0 || pageSize === 0) {
        return '0 de ' + length;
      }
      length = Math.max(length, 0);
      const startIndex = page * pageSize;
      // If the start index exceeds the list length, do not try ngAfterViewInit fix the end index to the end.
      const endIndex = startIndex < length ?
        Math.min(startIndex + pageSize, length) :
        startIndex + pageSize;
      return startIndex + 1 + ' - ' + endIndex + ' de ' + length;
    }; 
  }


  loadContratoPorId(): void {
    this.dataService.Spinner().show("sp6");
    this.dataService.AccionesVinculacion().getGestionContratoPorId(this.id_gestion_contrato).subscribe(
      (response) => {
        this.dataService.Spinner().hide("sp6");
        console.log('loadContratoPorId => ', response);
        
        this.datos_contrato = response;

      },
      (error: HttpErrorResponse) => {
        this.dataService.Spinner().hide("sp6")
        console.log(error);
        this.dataService.Message().msgWarning("Ocurrió un error al obtener datos de la vinculación");
      }
    )
  }

  handleRetornar() : void {
    this.router.navigate(['ayni/personal/acciones/contratoadenda'])
  }

  handleNuevo() : void {
    this.router.navigate(['ayni/personal/acciones/contratoadenda/agregaradenda/adenda/' + this.id_gestion_contrato]);
  }

  handleModificar(row) {
    this.router.navigate(['ayni/personal/acciones/contratoadenda/accionadenda/adenda/edit/' + row.id_gestion_adenda ])
  }

  handleInformacion(row) {
    this.router.navigate(['ayni/personal/acciones/contratoadenda/accionadenda/adenda/info/' + row.id_gestion_adenda ])
  }
  
  handleExportar() {
    this.dataService.Spinner().show("sp6");
      let body = {
        id_gestion_contrato: parseInt(this.id_gestion_contrato.toString())
      }

      this.dataService.AccionesVinculacion().getGestionAdendaExcel(body).subscribe(
        (response) => {
          this.dataService.Spinner().hide("sp6");
          const fecha = moment().format('DDMMYYYY');
          descargarExcel(response, `Adendas DL 1057 ${fecha}.xlsx`);
        },
        (error: HttpErrorResponse) => {
          this.dataService.Spinner().hide("sp6")
          this.dataService.Message().msgWarning("Ocurrió un error al realizar esta operación");
        }
      )
  }

  handleAdjuntarContratoSuscrito(row) {
    let dialogRef = this.materialDialog.open(AdjuntarDocumentoComponent, {
      panelClass: 'adjuntar-documento-suscrito-form-dialog',
        disableClose: true,
        data: {
          id_gestion_contrato: 0,
          id_gestion_adenda: row.id_gestion_adenda,
          titulo: 'Adjuntar adenda suscrita'
        }
    });
    dialogRef.afterClosed()
    .subscribe((response: any) => {
      debugger
      if (!response) {
        return;
      }
      console.log(response);
    });
  }

  handleEliminarAdenda(row) {
    this.dataService.Message().msgConfirm('¿ESTÁ SEGURO DE QUE DESEA ELIMINAR LA ADENDA.?', () => {
      this.dataService.Spinner().show("sp6");
      let viewModel = {
        id_gestion_adenda: parseInt(row.id_gestion_adenda)
      }
      this.dataService.AccionesVinculacion().eliminarGestionAdenda(viewModel).subscribe(
        (response) => {
          this.dataService.Spinner().hide("sp6");
          this.dataService.Message().msgAutoCloseSuccessNoButton('"OPERACIÓN REALIZADA DE FORMA EXITOSA."', 3000, () => {
            this.loadBusqueda();
          });
        },
        (error: HttpErrorResponse) => {
          this.dataService.Spinner().hide("sp6")
          this.dataService.Message().msgWarning("Ocurrió un error al realizar esta operación");
        }
      )
    }, () => { });
  }

  handleGenerarAdenda (row) {
    this.dataService.Message().msgConfirm('¿ESTÁ SEGURO DE QUE DESEA GENERAR LA ADENDA.?', () => {
      this.dataService.Spinner().show("sp6");
      let viewModel = {
        id_gestion_adenda: parseInt(row.id_gestion_adenda),
        id_gestion_contrato: parseInt(row.id_gestion_contrato),
        locationPdfTemplates: '',
        pathWrite: ''
      }
      this.dataService.AccionesVinculacion().generarAdenda(viewModel).subscribe(
        (response) => {
          this.dataService.Spinner().hide("sp6");
          this.dataService.Message().msgAutoCloseSuccessNoButton('"OPERACIÓN REALIZADA DE FORMA EXITOSA."', 3000, () => {
            this.loadBusqueda();
          });
        },
        (error: HttpErrorResponse) => {
          this.dataService.Spinner().hide("sp6")
          this.dataService.Message().msgWarning("Ocurrió un error al realizar esta operación");
        }
      )
    }, () => { });
  }

  handleVerAdendaSuscrita(row) {
    this.dataService.AccionesVinculacion().getGestionAdendaDocumentos(row.id_gestion_adenda).subscribe(
      (resp) => {
        console.log("handleVerAdendaSuscrita() =>", resp);
        this.dataService.Spinner().show('sp6');
        this.dataService.Documento().descargar(resp.documento_adenda_firmado ?? resp.documento_adenda_sin_firma)
            .pipe(
                catchError((e) => {
                    return of(e);
                }),
                finalize(() => this.dataService.Spinner().hide('sp6'))
            ).subscribe(response => {
                if (response) {
                    this.handlePreviewS1(response, resp.documento_adenda_firmado);
                } else {
                    this.dataService.Message().msgWarning('NO SE PUDO OBTENER EL DOCUMENTO DE SUSTENTO.', () => {
                    });
                }
            });
      },
      (error: HttpErrorResponse) => {
        console.log("handleVerContratoSuscrito() => ", error);
      }
    );
  }

  handlePreviewS1(file: any, codigoAdjuntoSustento: string) {
    this.dialogRef = this.materialDialog.open(DocumentViewerComponent, {
        panelClass: 'modal-viewer-form-dialog',
        disableClose: true,
        data: {
            modal: {
                icon: 'remove_red_eye',
                title: 'Adenda',
                file: file,
                fileName: codigoAdjuntoSustento
            }
        }
    });

    this.dialogRef.afterClosed()
        .subscribe((response: any) => {
            if (!response) {
                return;
            }
        });
  };
  
}


export class AdendaDataSource extends DataSource<any>{

  private _dataChange = new BehaviorSubject<any>([]);
  private _totalRows = 0;
  private _loadingChange = new BehaviorSubject<boolean>(false);

  public loading = this._loadingChange.asObservable();

  constructor(private dataService: DataService, private _matPaginator: MatPaginator) {
    super();
  }

  load(data: any, pageIndex: number, pageSize: number) {
    debugger
    this._loadingChange.next(true);
    this.dataService.Spinner().show("sp6");
    
    data.paginaActual = pageIndex;
    data.tamanioPagina = pageSize == undefined ? 10 : pageSize;

    console.log('handleSearch() => ', data);

    this.dataService.AccionesVinculacion().getGestionAdendaPaginado(data).pipe(
      catchError(() => of([])),
      finalize(() => { this._loadingChange.next(false); this.dataService.Spinner().hide("sp6"); })
    ).subscribe((response: any) => {
      this._dataChange.next(response || []);
      if ((response || []).length > 0) {
        this._totalRows = (response[0] || [{ total: 0 }]).total;
      } else {
        this._totalRows = 0;        
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