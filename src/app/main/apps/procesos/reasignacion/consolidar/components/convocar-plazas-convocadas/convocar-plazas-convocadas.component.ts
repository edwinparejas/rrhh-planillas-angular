import { CollectionViewer, DataSource } from '@angular/cdk/collections';
import { Component, Input, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { mineduAnimations } from '@minedu/animations/animations';
import { DataService } from 'app/core/data/data.service';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { catchError, finalize } from 'rxjs/operators';
// import { ConsolidadoPlazaModel } from '../../../models/reasignacion.model';

@Component({
  selector: 'minedu-convocar-plazas-convocadas',
  templateUrl: './convocar-plazas-convocadas.component.html',
  styleUrls: ['./convocar-plazas-convocadas.component.scss'],
  encapsulation: ViewEncapsulation.None,
  animations: mineduAnimations,
})
export class ConvocarPlazasConvocadasComponent implements OnInit {

  dataSource: PlazaObservadaDataSource | null;
  @ViewChild('paginator', { static: true }) paginator: MatPaginator;
  @Input() etapaProceso: number;
  // @Input() consolidadoPlaza: ConsolidadoPlazaModel;
  paginatorPageSize = 10;
  paginatorPageIndex = 0;
  working = false;
  dialogRef: any;
  isMobile = false;

  displayedColumns: string[] = [
    'registro',
    'codigo_modular',
    'centro_trabajo',
    'modalidad',
    'nivel_educativo',
    'tipo_gestion',
    'codigo_plaza',
    'cargo',
    'area_curricular',
    'tipo_plaza',
    'vigencia_inicio',
    'vigencia_fin',
    'acciones',
  ];

  request: any = {};

  constructor(
    private dataService: DataService,
    private materialDialog: MatDialog
  ) { }

  ngOnInit(): void {
    this.dataSource = new PlazaObservadaDataSource(this.dataService);
    this.paginator.showFirstLastButtons = true;
    this.paginator._intl.itemsPerPageLabel = 'Filas por tabla';
    this.paginator._intl.nextPageLabel = 'Siguiente página';
    this.paginator._intl.previousPageLabel = 'Página anterior';
    this.paginator._intl.firstPageLabel = 'Primera página';
    this.paginator._intl.lastPageLabel = 'Última página';
    this.handleResponsive();
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

  ngAfterViewInit(): void {
    this.paginator.page.subscribe(() => this.loadData());
  }

  loadData(): void {
    this.dataSource.load(
      this.request,
      this.paginator.pageIndex + 1,
      this.paginator.pageSize
    );
  }

  actualizarLista = (request: any) => {
    this.request = request;
    this.buscarPlazas();
  }

  buscarPlazas = () => {
    this.dataSource.load(
      this.request,
      this.paginator.pageIndex + 1,
      this.paginator.pageSize
    );
  }
}

export class PlazaObservadaDataSource extends DataSource<any> {
  private _dataChange = new BehaviorSubject<any>([]);
  private _loadingChange = new BehaviorSubject<boolean>(false);
  public loading = this._loadingChange.asObservable();
  public totalregistro = 0;

  constructor(private dataService: DataService) {
    super();
  }

  load(data: any, pageIndex, pageSize): void {
    this.dataService.Spinner().show('sp6');
    this._loadingChange.next(false);
    if (data.idEtapaProceso === null) {
      this._loadingChange.next(false);
      this._dataChange.next([]);
    } else {
      this.dataService
        .Reasignaciones()
        .getListConvocarObservar(data, pageIndex, pageSize).pipe(
          catchError(() => of([])),
          finalize(() => {
            this._loadingChange.next(false);
            this.dataService.Spinner().hide('sp6');
          })
        )
        .subscribe((response: any) => {
          this._dataChange.next(response || []);
          this.totalregistro = (response || []).length === 0 ? 0 : response[0].total_rows;
          if ((response || []).length === 0) {
            this.dataService
              .Message()
              .msgWarning('"NO SE ENCONTRÓ INFORMACIÓN DE LAS PLAZAS CONVOCADAS PARA LOS CRITERIOS DE BÚSQUEDA."', () => { });
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
