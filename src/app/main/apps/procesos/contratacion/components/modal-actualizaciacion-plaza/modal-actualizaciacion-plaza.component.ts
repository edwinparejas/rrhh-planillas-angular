import { CollectionViewer, DataSource } from "@angular/cdk/collections";
import { DatePipe } from "@angular/common";
import { Component, OnInit, ViewChild, Inject } from "@angular/core";
import {
    MatDialog,
    MatDialogRef,
    MAT_DIALOG_DATA,
} from "@angular/material/dialog";
import { MatPaginator } from "@angular/material/paginator";
import { DataService } from "app/core/data/data.service";
import { BehaviorSubject, Observable, of } from "rxjs";
import { catchError, finalize, tap } from "rxjs/operators";

@Component({
    selector: "minedu-modal-actualizaciacion-plaza",
    templateUrl: "./modal-actualizaciacion-plaza.component.html",
    styleUrls: ["./modal-actualizaciacion-plaza.component.scss"],
})
export class ModalActualizaciacionPlazaComponent implements OnInit {
    dialogTitle = "Actualizacion de datos";
    working = false;
    isMobile = false;
    dialogRef: any;
    totalregistro = 0;
    idEtapaProceso: number;
    idRegimenLaboral: number;
    codigoCentroTrabajoMaestro: string;
    fecha = new Date();
    paginatorPlazasActualizadasPageIndex = 0;
    paginatorPlazasActualizadasPageSize = 10;
    @ViewChild("paginatorPlazasActualizadas", { static: true })
    paginatorPlazasActualizadas: MatPaginator;
    dataSourcePlazasModificadas: PlazasContratacionActualizarDatosPlazaDetalleDataSource | null;

    displayedColumnsDocumentosPublicados: string[] = [
        "campo",
        "dataOriginal",
        "dataActualizada",
    ];

    request = {
        idEtapaProceso: null,
        anio: null,
        codigoCentroTrabajoMaestro: null,
    };

    constructor(
        public matDialogRef: MatDialogRef<ModalActualizaciacionPlazaComponent>,
        @Inject(MAT_DIALOG_DATA) private data: any,
        private datePipe: DatePipe,
        private materialDialog: MatDialog,
        private dataService: DataService
    ) {}

    ngOnInit(): void {
        this.idEtapaProceso = this.data.idEtapaProceso;
        this.idRegimenLaboral = this.data.idRegimenLaboral;
        this.codigoCentroTrabajoMaestro = this.data.codigoCentroTrabajoMaestro;
        console.log("Datos de Data:", this.data);
        this.buildGrids();
        this.handleBuscar(true);
        this.handleResponsive();
        if (this.data.dialogTitle != null) {
            this.dialogTitle = this.data.dialogTitle;
        }
    }
    buildGrids(): void {
        this.dataSourcePlazasModificadas =
            new PlazasContratacionActualizarDatosPlazaDetalleDataSource(
                this.dataService
            );
        this.buildPaginators(this.paginatorPlazasActualizadas);
    }

    buildPaginators(paginator: MatPaginator): void {
        paginator.showFirstLastButtons = true;
        paginator._intl.itemsPerPageLabel = "Registros por página";
        paginator._intl.nextPageLabel = "Siguiente página";
        paginator._intl.previousPageLabel = "Página anterior";
        paginator._intl.firstPageLabel = "Primera página";
        paginator._intl.lastPageLabel = "Última página";
        paginator._intl.getRangeLabel = (
            page: number,
            pageSize: number,
            length: number
        ) => {
            if (length === 0 || pageSize === 0) {
                return `0 de ${length}`;
            }
            const length2 = Math.max(length, 0);
            const startIndex = page * pageSize;
            const endIndex =
                startIndex < length2
                    ? Math.min(startIndex + pageSize, length2)
                    : startIndex + pageSize;
            return `${startIndex + 1} – ${endIndex} de ${length2}`;
        };
    }

    ngAfterViewInit() {
        this.paginatorPlazasActualizadas.page
            .pipe(tap(() => this.handleBuscar()))
            .subscribe();
    }

    handleBuscar(load: boolean = false) {
        this.request = {
            idEtapaProceso: this.idEtapaProceso,
            anio: this.fecha.getFullYear(),
            codigoCentroTrabajoMaestro: this.codigoCentroTrabajoMaestro,
        };

        if (load) {
            this.dataSourcePlazasModificadas.load(
                this.request,
                this.paginatorPlazasActualizadas.pageIndex + 1,
                this.paginatorPlazasActualizadasPageSize
            );
        } else {
            this.dataSourcePlazasModificadas.load(
                this.request,
                this.paginatorPlazasActualizadas.pageIndex + 1,
                this.paginatorPlazasActualizadas.pageSize
            );
        }
    }

    handleVerPlazasPublicadas(file: string) {
    }

    handlePreview(file: any, nameFile: string) {
        
    }

    handleCancel = () => {
        this.matDialogRef.close();
    };

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
   
}


export class PlazasContratacionActualizarDatosPlazaDetalleDataSource extends DataSource<any> {
  private _dataChange = new BehaviorSubject<any>([]);
  private _loadingChange = new BehaviorSubject<boolean>(false);
  public loading = this._loadingChange.asObservable();
  public totalregistro = 0;

  constructor(private dataService: DataService) {
      super();
  }

  load(data: any, pageIndex, pageSize): void {
      this._loadingChange.next(false);
      if (data.idEtapaProceso === null) {
          this._loadingChange.next(false);
          this._dataChange.next([]);
      } else {
          this.dataService.Contrataciones().getBuscarDocumentoPublicado(data, pageIndex, pageSize).pipe(
              catchError(() => of([])),
              finalize(() => {
                  this._loadingChange.next(false);
                  this.dataService.Spinner().hide("sp6");
              })
          )
          .subscribe((documentosPublicados: any) => {
              this._dataChange.next(documentosPublicados || []);
              this.totalregistro = (documentosPublicados || []).length === 0 ? 0 : documentosPublicados[0].total_registros;
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
