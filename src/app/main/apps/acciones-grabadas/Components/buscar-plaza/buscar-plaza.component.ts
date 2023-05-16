import { AfterViewInit, Component, Inject, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { DataSource } from "@angular/cdk/table";
import { FormBuilder, FormGroup } from '@angular/forms';
import { CollectionViewer, SelectionModel } from '@angular/cdk/collections';
import { MatPaginator } from '@angular/material/paginator';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { DataService } from 'app/core/data/data.service';
import { catchError, finalize, tap } from 'rxjs/operators';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { MISSING_TOKEN } from 'app/core/model/types';
import { PASSPORT_MESSAGE } from 'app/core/model/messages-error';
import { mineduAnimations } from '@minedu/animations/animations';
import { ACCIONES_GRABADAS_MESSAGE } from 'app/core/model/message';
import { SecurityModel } from 'app/core/model/security/security.model';

@Component({
  selector: 'minedu-buscar-plaza',
  templateUrl: './buscar-plaza.component.html',
  styleUrls: ['./buscar-plaza.component.scss'],
  encapsulation: ViewEncapsulation.None,
  animations: mineduAnimations,
})
export class BuscarPlazaComponent implements OnInit , AfterViewInit {
  form: FormGroup;
  currentSession: SecurityModel = new SecurityModel();
  regimenesLaborales: any[] = [];
  paginatorPageSize = 10;
  paginatorPageIndex = 0;
  
  displayedColumns: string[] = [
      "rowNum",
      "codigoPlaza",
      "itemPlaza",
      "tipoPlaza",
      "codigoCentroTrabajo",
      "anexo",
      "centroTrabajo",
      "modalidad",
      "nivelEducativo",
      "regimenLaboral",
      "cargo",
      "jornadaLaboral",
      "motivoVacancia",
  ];

  dataSource: PlazaDataSource | null;
  selection = new SelectionModel<any>(false, []);
  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;

  constructor(
      public matDialogRef: MatDialogRef<BuscarPlazaComponent>,
      @Inject(MAT_DIALOG_DATA) private data: any,
      private formBuilder: FormBuilder,
      private dataService: DataService
  ) { 
        this.currentSession=this.data.currentSession;
  }

  ngOnInit(): void {
      this.buildForm();
      this.buildData();
      this.limpiar();
      this.paginator.showFirstLastButtons = true;
      this.paginator._intl.itemsPerPageLabel = "Registros por página";
      this.paginator._intl.nextPageLabel = "Siguiente página";
      this.paginator._intl.previousPageLabel = "Página anterior";
      this.paginator._intl.firstPageLabel = "Primera página";
      this.paginator._intl.lastPageLabel = "Última página";
      this.paginator._intl.getRangeLabel = (page: number, pageSize: number, length: number) => {
          if (length === 0 || pageSize === 0) {return `0 of ${length}`;}
          const length2 = Math.max(length, 0);
          const startIndex = page * pageSize;
          const endIndex = startIndex < length2 ? Math.min(startIndex + pageSize, length2) : startIndex + pageSize;
          return `${startIndex + 1} – ${endIndex} de ${length2}`;
      }
  }

  buildForm() {
      this.form = this.formBuilder.group({
          codigoPlaza: [null],
          centroTrabajo: [null],
          codigoCentroTrabajo: [null],
          codigoRegimenLaboral: ["-1", null]
      });
  }

  buildData() {
      this.dataService
          .AccionesGrabadas()
          .getRegimenesLaborales()
          .pipe(
              catchError((e) => {
                  return of(e);
              }),
              finalize(() => { })
          )
          .subscribe((response) => {
              if (response) {
                  this.regimenesLaborales = response;
              } else if (response && (response.statusCode === 401 || response.error === MISSING_TOKEN.INVALID_TOKEN)) {
                  this.dataService.Message().msgInfo(PASSPORT_MESSAGE.SESION_END, () => { this.dataService.Storage().passportUILogin(); });
              }
          });
  }

  ngAfterViewInit() {
    this.paginator.page.subscribe(() => this.buscar());
  }

  onSelect(selected) {
      this.selection.clear();
      this.selection.toggle(selected);
      
      this.matDialogRef.close({ plaza: selected });
  }

  limpiar() {
      this.form.patchValue({
          codigoPlaza: null,
          centroTrabajo: null,
          codigoCentroTrabajo: null,
          codigoRegimenLaboral: "-1",
      });

      this.dataSource = new PlazaDataSource(this.dataService, this.paginator);
  }

  obtenerParametrosBusqueda(butonAccion: boolean = false) {
      
      const codigoTipoSede = this.currentSession.codigoTipoSede;
      const codigoRolPassport = this.currentSession.codigoRol;
      const form = this.form.value;
      const parametros = {
          codigoPlaza: form.codigoPlaza,
          centroTrabajo: form.centroTrabajo,
          codigoCentroTrabajo: form.codigoCentroTrabajo,
          codigoRegimenLaboral: form.codigoRegimenLaboral.toString(),
          codigoTipoSede: codigoTipoSede,
          codigoRolPassport: codigoRolPassport,
          butonAccion:butonAccion
      };
      return parametros;
  }

  handleBuscar(): void {
    this.buscar(true);
  }

  buscar(butonAccion: boolean = false) {
    if(!this.form.valid){
        let mensajes="";
        if (this.form.controls.codigoCentroTrabajo.valid == false) {
            mensajes=(mensajes.length==0?ACCIONES_GRABADAS_MESSAGE.M38:mensajes+", "+ACCIONES_GRABADAS_MESSAGE.M38);                
        }
        if (this.form.controls.codigoPlaza.valid == false) {
            mensajes=(mensajes.length==0?ACCIONES_GRABADAS_MESSAGE.M64:mensajes+", "+ACCIONES_GRABADAS_MESSAGE.M64);                 
        }

        this.dataService.Message().msgWarning(mensajes, () => { });
        return;
    }

    const parametros = this.obtenerParametrosBusqueda(butonAccion);
    debugger
    this.dataSource.load(parametros, (this.paginator.pageIndex + 1), this.paginator.pageSize??this.paginatorPageSize);
  }
}

export class PlazaDataSource extends DataSource<any> {
  private _dataChange = new BehaviorSubject<any>([]);
  private _loadingChange = new BehaviorSubject<boolean>(false);
  private _totalRows = 0;

  public loading = this._loadingChange.asObservable();

  constructor(
      private dataService: DataService,
      private _matPaginator: MatPaginator
  ) {
      super();
  }

  load(data: any, pageIndex: number, pageSize: number) {
    this._loadingChange.next(false);

    this.dataService.Spinner().show("sp6");
    this.dataService
        .AccionesGrabadas()
        .buscarPlaza(data, pageIndex, pageSize)
        .pipe(catchError((error) => {
        this.dataService.Message().msgWarning('"'+error.messages[0].toUpperCase()+'"');
        return of(null);
        }), finalize(() => {
            this.dataService.Spinner().hide("sp6");
            this._loadingChange.next(false);
        })).subscribe((result: any) => {
            this._dataChange.next(result || []);
            this._totalRows = (result || []).length === 0 ? 0 : result[0].total;
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


