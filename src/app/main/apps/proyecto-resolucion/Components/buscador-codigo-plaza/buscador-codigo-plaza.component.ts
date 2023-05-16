import {
  Component,
  OnInit,
  Inject,
  ViewEncapsulation,
  OnDestroy,
  ViewChild,
  AfterViewInit,
} from "@angular/core";
import {
  MatDialog,
  MatDialogRef,
  MAT_DIALOG_DATA,
} from "@angular/material/dialog";
import { FormGroup, FormBuilder, Validators } from "@angular/forms";
import { ActivatedRoute, Router } from "@angular/router";
import {
  SelectionModel,
  DataSource,
  CollectionViewer,
} from "@angular/cdk/collections";
import { mineduAnimations } from "@minedu/animations/animations";
import { catchError, finalize, takeUntil, filter, find } from "rxjs/operators";
import { DataService } from "app/core/data/data.service";
import { SharedService } from "app/core/shared/shared.service";
import { MatPaginator } from "@angular/material/paginator";
import { Subscription, of, Observable, BehaviorSubject, Subject } from "rxjs";
import { GlobalsService } from "app/core/shared/globals.service";
import { PASSPORT_MESSAGE, PROYECTO_RESOLUCION_MESSAGE } from "app/core/model/message";
import { MISSING_TOKEN } from "app/core/model/types";
import { SecurityModel } from "app/core/model/security/security.model";
@Component({
  selector: "minedu-proyresolucion-buscador-codigo-plaza",
  templateUrl: "./buscador-codigo-plaza.component.html",
  styleUrls: ["./buscador-codigo-plaza.component.scss"],
  encapsulation: ViewEncapsulation.None,
  animations: mineduAnimations,
})
export class BuscadorCodigoPlazaComponent
  implements OnInit, OnDestroy, AfterViewInit {
  working: false;
  form: FormGroup;

  paginatorPageSize = 10;
  paginatorPageIndex = 0;
  seleccionado: any = null;
  currentSession: SecurityModel = new SecurityModel();
  comboLists = {
      listRegimenLaboral: [],
  };

  idRolPassport: number = 1;
  displayedColumns: string[] = [
      "rowNum",
      "codigoPlaza",
      "itemPlaza",
      "tipoPlaza",
      "codigoCentroTrabajo",
      "anexo",
      "descripcionCentroTrabajo",
      "abreviaturaModalidad",
      "descripcionNivelEducativo",
      "descripcionRegimenLaboral",
      "descripcionCargo",
      "especialidad",
      "jornadaLaboral",
      "tipoVacancia",
  ];

  dataSource: ServidorCodigoPlazaDataSource | null;
  selection = new SelectionModel<any>(true, []);
  @ViewChild("paginator", { static: true }) paginator: MatPaginator;

  constructor(
      public matDialogRef: MatDialogRef<BuscadorCodigoPlazaComponent>,
      @Inject(MAT_DIALOG_DATA) private data: any,
      private route: ActivatedRoute,
      private router: Router,
      private formBuilder: FormBuilder,
      private dataService: DataService,
      private dataShared: SharedService,
      public globals: GlobalsService,
      private materialDialog: MatDialog
  ) { 
    this.currentSession=this.data.currentSession;
  }
  ngOnDestroy(): void { }

  ngOnInit(): void {
      this.buildForm();
      this.loadRegimenLaboral();
      this.handleLimpiar();
      this.paginator.showFirstLastButtons = true;
      this.paginator._intl.itemsPerPageLabel = "Filas por tabla";
      this.paginator._intl.nextPageLabel = "Siguiente página";
      this.paginator._intl.previousPageLabel = "Página anterior";
      this.paginator._intl.firstPageLabel = "Primera página";
      this.paginator._intl.lastPageLabel = "Última página";
      this.paginator._intl.getRangeLabel = (page: number, pageSize: number, length: number) => {
          if (length === 0 || pageSize === 0) {return `0 de ${length}`;}
          const length2 = Math.max(length, 0);
          const startIndex = page * pageSize;
          const endIndex = startIndex < length2 ? Math.min(startIndex + pageSize, length2) : startIndex + pageSize;
          return `${startIndex + 1} – ${endIndex} de ${length2}`;
      }
  }

  buildForm = () => {
      this.form = this.formBuilder.group({
          codigoPlaza: [null],
          centroTrabajo: [null],
          codigoCentroTrabajo: [null],
          codigoRegimenLaboral: "-1"
      });
  };

  loadRegimenLaboral = () => {
      this.dataService
          .ProyectosResolucion()
          .getComboRegimenLaboral()
          .pipe(
              catchError((e) => of(e)),
              finalize(() => { })
          )
          .subscribe((response: any) => {
            if (response) {
                this.comboLists.listRegimenLaboral = response;
            } else if (response && (response.statusCode === 401 || response.error === MISSING_TOKEN.INVALID_TOKEN)) {
                this.dataService.Message().msgInfo(PASSPORT_MESSAGE.SESION_END, () => { this.dataService.Storage().passportUILogin(); });
            }
          });
  };

  ngAfterViewInit(): void {
    this.paginator.page.subscribe(() => this.buscar());
  }

  selectedRow(selected) {
      this.selection.clear();
      this.selection.toggle(selected);

      this.matDialogRef.close({ plaza: selected });
  }

  handleLimpiar(): void {
    this.form.patchValue({
        codigoPlaza: null,
        centroTrabajo: null,
        codigoCentroTrabajo: null,
        codigoRegimenLaboral: "-1",
    });

    // this.form.get("codigoRegimenLaboral").setValue("-1");

    this.dataSource = new ServidorCodigoPlazaDataSource(this.dataService);
  }

  obtenerParametrosBusqueda(butonAccion: boolean = false){
      
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
  };

  handleBuscar(): void {
    this.buscar(true);
  }

  buscar(butonAccion: boolean = false){
    if(!this.form.valid){
        let mensajes="";
        if (this.form.controls.codigoCentroTrabajo.valid == false) {
            mensajes=(mensajes.length==0?PROYECTO_RESOLUCION_MESSAGE.M38:mensajes+", "+PROYECTO_RESOLUCION_MESSAGE.M38);                
        }
        if (this.form.controls.codigoPlaza.valid == false) {
            mensajes=(mensajes.length==0?PROYECTO_RESOLUCION_MESSAGE.M64:mensajes+", "+PROYECTO_RESOLUCION_MESSAGE.M64);                 
        }

        this.dataService.Message().msgWarning(mensajes, () => { });
        return;
    }

    const parametros = this.obtenerParametrosBusqueda(butonAccion);
    debugger
    this.dataSource.load(parametros, (this.paginator.pageIndex + 1), this.paginator.pageSize??this.paginatorPageSize);
  };

}

export class ServidorCodigoPlazaDataSource extends DataSource<any> {
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
    this.dataService
        .ProyectosResolucion()
        .buscarPlaza(data, pageIndex, pageSize)
        .pipe(catchError((error) => {
        this.dataService.Message().msgWarning('"'+error.messages[0].toUpperCase()+'"');
        return of(null);
        }), finalize(() => {
            this.dataService.Spinner().hide("sp6");
            this._loadingChange.next(false);
        })).subscribe((result: any) => {
            this._dataChange.next(result || []);
            this.totalregistro = (result || []).length === 0 ? 0 : result[0].totalRegistro;
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
      return this.totalregistro;
  }

  get data(): any {
      return this._dataChange.value || [];
  }
}
