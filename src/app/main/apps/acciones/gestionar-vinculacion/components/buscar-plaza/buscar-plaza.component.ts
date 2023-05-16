import {
  CollectionViewer,
  DataSource,
  SelectionModel,
} from "@angular/cdk/collections";
import {
  Component,
  Inject,
  OnInit,
  ViewChild,
  ViewEncapsulation,
  AfterViewInit,
  OnDestroy,
} from "@angular/core";
import { FormBuilder, FormGroup } from "@angular/forms";
import {
  MatDialog,
  MatDialogRef,
  MAT_DIALOG_DATA,
} from "@angular/material/dialog";
import { MatPaginator } from "@angular/material/paginator";
import { ActivatedRoute, Router } from "@angular/router";
import { mineduAnimations } from "@minedu/animations/animations";
import { DataService } from "app/core/data/data.service";
import { SharedService } from "app/core/shared/shared.service";
import { BehaviorSubject, Observable, of, Subject, Subscription } from "rxjs";
import { catchError, finalize } from "rxjs/operators";
import { TipoFormatoPlazaEnum, criterioBusqueda } from '../../models/vinculacion.model';
import { SecurityModel } from "app/core/model/security/security.model";
import { HttpErrorResponse } from "@angular/common/http";

@Component({
  selector: 'minedu-buscar-plaza',
  templateUrl: './buscar-plaza.component.html',
  styleUrls: ['./buscar-plaza.component.scss'],
  encapsulation: ViewEncapsulation.None,
  animations: mineduAnimations,
})
export class BuscarPlazaComponent
  implements OnInit, OnDestroy, AfterViewInit
{
  working = false;
  form: FormGroup;

  dataSource: PlazaDataSource | null;
  selection = new SelectionModel<any>(true, []);
  tipoFormatoPlaza = TipoFormatoPlazaEnum.GENERAL;
  idEtapaProceso: number =  null;
  idRegimenLaboral: number =  null;
  idDre: number =  null;
  idUgel: number =  null;

  paginatorPageSize = 5;
  paginatorPageIndex = 0;
  seleccionado: any = null;

  comboLists = {
      listRegimenLaboral: [],
  };

  request = {
      codigoPlaza: null,
      descripcionCentroTrabajo: null,
      centroTrabajo:null,
      codigoCentroTrabajo: null,
      idRegimenLaboral: null,
      tipoFormato: this.tipoFormatoPlaza,
      idEtapaProceso:null,
      idDre: null,
      idUgel: null
  };

  displayedColumns: string[] = [
      "nro",
      "codigoPlaza",
      "codigoCentroTrabajo",
      "anexoCentroTrabajo",
      "descripcionInstitucionEducativa",
      "abreviaturaModalidadEducativa",
      "descripcionNivelEducativo",
      "descripcionCargo",
      "jornadaLaboral",
      "descripcionMotivoVacancia",
      "descripcionTipoPlaza",
  ];
  currentSession: SecurityModel = new SecurityModel();   
  @ViewChild("paginator", { static: true }) paginator: MatPaginator;
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

  constructor(
      public matDialogRef: MatDialogRef<BuscarPlazaComponent>,
      @Inject(MAT_DIALOG_DATA) private data: any,
      private route: ActivatedRoute,
      private router: Router,
      private formBuilder: FormBuilder,
      private dataService: DataService,
      private dataShared: SharedService,
      private materialDialog: MatDialog
  ) {
      this.tipoFormatoPlaza =
          data?.tipoFormato != null
              ? data?.tipoFormato
              : TipoFormatoPlazaEnum.GENERAL;

      this.idEtapaProceso =
              data?.tipoFormato != null
                  ? data?.idEtapaProceso
                  : null;
      this.idRegimenLaboral =
              data?.tipoFormato != null
                  ? data?.idRegimenLaboral
                  : data?.idRegimenLaboral;

    this.idDre = data?.idDre;
    this.idUgel = data?.idUgel;

      this.currentSession = data.currentSession;                    

      console.log("Datos recibidos de pantalla principal ", this.idEtapaProceso, this.tipoFormatoPlaza);
  }

  ngOnInit(): void {
      this.working = true;
      this.buildForm();
      this.handleResponsive();
      this.loadRegimenLaboral();
      this.dataSource = new PlazaDataSource(this.dataService);
      this.paginator.showFirstLastButtons = true;
      this.paginator._intl.itemsPerPageLabel = "Registros por página";
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
      this.working = false;
  }

  handleResponsive(): void {
      this.isMobile = this.getIsMobile();
      window.onresize = () => {
          this.isMobile = this.getIsMobile();
      };
  }

  ngOnDestroy(): void {}

  ngAfterViewInit(): void {
      this.paginator.page.subscribe(() =>
          this.loadData(
              (this.paginator.pageIndex + 1).toString(),
              this.paginator.pageSize.toString()
          )
      );
  }

  loadData(pageIndex, pageSize): void {
      this.dataSource.load(
          this.request,
          this.paginator.pageIndex + 1,
          this.paginator.pageSize
      );
  }

  buildForm = () => {
      this.form = this.formBuilder.group({
          codigoPlaza: [null],
          descripcionCentroTrabajo: [null],
          codigoCentroTrabajo: [null],
          idRegimenLaboral: [null],
      });
  };

  cargarFiltro(): void {
      this.request = this.form.getRawValue();
      this.request.tipoFormato = this.tipoFormatoPlaza;
      this.request.idEtapaProceso = this.idEtapaProceso;

if(this.request.descripcionCentroTrabajo == '')
    this.request.descripcionCentroTrabajo =null;
if(this.request.codigoPlaza == '')
    this.request.codigoPlaza =null;
if(this.request.codigoCentroTrabajo == '')
    this.request.codigoCentroTrabajo =null;

if(this.request.descripcionCentroTrabajo)
    this.request.descripcionCentroTrabajo = this.request.descripcionCentroTrabajo.toUpperCase();
if(this.request.codigoPlaza)
    this.request.codigoPlaza = this.request.codigoPlaza.toUpperCase();
  }

  handleBuscar(): void {
      this.buscarPlaza();
  }

  buscarPlaza = () => {
      this.cargarFiltro();


      if (
          this.request.codigoPlaza === null &&
          this.request.descripcionCentroTrabajo === null &&
          this.request.codigoCentroTrabajo === null &&
          this.request.idRegimenLaboral === null
      ) {
          this.dataService
              .Message()
              .msgAutoCloseWarningNoButton(
                  '"DEBE ESPECIFICAR POR LO MENOS UN CRITERIO DE BÚSQUEDA."',3000,
                  () => {}
              );
      } else {
    if (this.request.codigoPlaza) {
  let validacionCodigoPlaza = criterioBusqueda.validarCodigoPlaza(this.request.codigoPlaza);
  if (!validacionCodigoPlaza.esValido) {
      this.dataService.Message().msgWarning(validacionCodigoPlaza.mensaje);
      return;
  }
    }

    if (this.request.codigoCentroTrabajo) {
  let validacionCodigoTrabajo = criterioBusqueda.validarCodigoTrabajo(this.request.codigoCentroTrabajo);
  if (!validacionCodigoTrabajo.esValido) {
      this.dataService.Message().msgWarning(validacionCodigoTrabajo.mensaje);
      return;
  }
    }

          this.dataSource.load(
              this.request,
              this.paginator.pageIndex + 1,
              this.paginator.pageSize
          );
      }
  };

  onSelect(selected: any): void {
      // this.selection.clear();
      // this.selection.toggle(selected);
      // this.seleccionado = selected;
      // // TODO:
      // // this.dataShared.sendDataSharedBuscarDocumento({ registro: selected });

      this.selection.clear();
      this.selection.toggle(selected);

      this.matDialogRef.close({ plaza: selected });
  }

  handleSelect = (form) => {
      if (this.seleccionado === null) {
          this.dataService
              .Message()
              .msgAutoCloseWarningNoButton('"DEBE SELECCIONAR UN REGISTRO."',3000, () => {});
      } else {
          this.matDialogRef.close({ plazaSelected: this.seleccionado });
      }
  };

  handleLimpiar(): void {
      this.form.reset();
if(this.idRegimenLaboral)this.setUpIdRegimenLaboral();

  }

  handleCancel = () => {
      this.matDialogRef.close();
  };

  


  loadRegimenLaboral = () => { 
    const data = {
    codigoTipoSede: this.currentSession.codigoTipoSede,
    codigoRol: this.currentSession.codigoRol
    }
    debugger;

    this.dataService.AccionesVinculacion().getComboRegimenLaboral(data).subscribe(
      (response) => {
        this.comboLists.listRegimenLaboral = response;
        this.comboLists.listRegimenLaboral.unshift({
          idRegimenLaboral: -1,
          descripcionRegimenLaboral: '--TODOS--'
        });
        
          this.setUpIdRegimenLaboral();

      },
      (error: HttpErrorResponse) => {
        console.log(error);
      }
    )

    
};


  setUpIdRegimenLaboral = () =>{
if(this.idRegimenLaboral) this.form.get('idRegimenLaboral').setValue(this.idRegimenLaboral);
  }
}
export class PlazaDataSource extends DataSource<any> {
  private _dataChange = new BehaviorSubject<any>([]);
  private _loadingChange = new BehaviorSubject<boolean>(false);

  public loading = this._loadingChange.asObservable();
  public totalregistro = 0;

  constructor(private dataService: DataService) {
      super();
  }

  load(data: any, pageIndex, pageSize): void {
      this._loadingChange.next(false);

    data.paginaActual = pageIndex;
    data.tamanioPagina = pageSize;

      if (
          data.codigoPlaza === null &&
          data.descripcionCentroTrabajo === null &&
          data.codigoCentroTrabajo === null &&
          data.idRegimenLaboral === null
      ) {
          this._loadingChange.next(false);
          this._dataChange.next([]);
      } else {
          data.centroTrabajo = data.descripcionCentroTrabajo;
          if(data.descripcionCentroTrabajo===null)
              data.centroTrabajo = data.descripcionCentroTrabajo;
          
          this.dataService.Spinner().show("sp6");
          this.dataService
              .AccionesVinculacion()
              .getPlazaPaginado(data)
              .pipe(
                  catchError(() => of([])),
                  finalize(() => {
                      this._loadingChange.next(false);
                      this.dataService.Spinner().hide("sp6");
                  })
              )
              .subscribe((response: any) => {
                  if (response) {
                      this.totalregistro = (response[0] || [{total: 0}]).total;
                      this._dataChange.next(response);
                  } else {
                      this.totalregistro = 0;
                      this._dataChange.next([]);
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
