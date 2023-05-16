import { CollectionViewer, DataSource, SelectionModel } from '@angular/cdk/collections';
import { Component, Inject, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { MatPaginator } from '@angular/material/paginator';
import { ActivatedRoute, Router } from '@angular/router';
import { mineduAnimations } from '@minedu/animations/animations';
import { DataService } from 'app/core/data/data.service';
import { ResultadoOperacionEnum } from 'app/core/model/types';
import { SharedService } from 'app/core/shared/shared.service';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { catchError, finalize } from 'rxjs/operators';
import { TablaPermisos } from 'app/core/model/types';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { SecurityModel } from 'app/core/model/security/security.model';
import { EtapaProcesoResponseModel } from '../../models/reasignacion.model';
import { descargarExcel } from 'app/core/utility/functions';
import { HttpClient } from '@angular/common/http';
import { BuscarCentroTrabajoComponent } from "../buscar-centro-trabajo/buscar-centro-trabajo.component";
import { BuscarPlazaComponent } from "../buscar-plaza/buscar-plaza.component";
import { MatDialog } from '@angular/material/dialog';
import { InformacionPlazaComponent } from '../../plazas/components/informacion-plaza/informacion-plaza.component';
const dutchRangeLabel = (page: number, pageSize: number, length: number) => {
    if (length == 0 || pageSize == 0) { return `0 de ${length}`; }   
    length = Math.max(length, 0);
    const startIndex = page * pageSize;
  
    // If the start index exceeds the list length, do not try and fix the end index to the end.
    const endIndex = startIndex < length ?
        Math.min(startIndex + pageSize, length) :
        startIndex + pageSize;
  
    return `${startIndex + 1} - ${endIndex} de ${length}`;
  }

@Component({
  selector: 'minedu-incorporar-plazas',
  templateUrl: './incorporar-plazas.component.html',
  styleUrls: ['./incorporar-plazas.component.scss'],
  encapsulation: ViewEncapsulation.None,
  animations: mineduAnimations,
})
export class IncorporarPlazasComponent implements OnInit {
  form: FormGroup;
  idplr: number;
  idep: number;
  codSedeCabecera:string; 
  plaza: EtapaProcesoResponseModel = new EtapaProcesoResponseModel();
  dataSource: InCorporarPlazaDataSource | null;
  @ViewChild('paginator', { static: true }) paginator: MatPaginator;
  selection = new SelectionModel<any>(true, []);
  paginatorPageIndex = 0;
  paginatorPageSize = 10;
  ipAddress = '';
  dialogRef: any;

  displayedColumns: string[] = [
    'select',
    'codigo_modular',
    'centro_trabajo',
    'modalidad',
    'nivel_educativa',
    'tipo_gestion',
    'codigo_plaza',
    'cargo',
    'area_curricular',
    'tipo_plaza',
    'vigencia_inicio',
    'vigencia_fin',
    'acciones'
  ];

  currentSession: SecurityModel = new SecurityModel();
  permisos = {
    autorizadoAgregar: false,
    autorizadoModificar: false,
    autorizadoEliminar: false,
    autorizadoEnviar: false,
    autorizadoExportar: false
  };

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
    private http: HttpClient,
    private route: ActivatedRoute,
    private router: Router,
    private dataService: DataService,
    private sharedService: SharedService,
    private materialDialog: MatDialog,
    private formBuilder: FormBuilder,
    public MatDialogRef: MatDialogRef<IncorporarPlazasComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { action: string, idep: number, idDesarrolloProceso: number }
  ) { }

  ngOnInit(): void {
    this.codSedeCabecera = '000000'; //Cod Minedu Prepublicacion // this.currentSession.codigoSede;
    this.idep = this.data.idep;
    this.buildForm();
    this.handleResponsive();
    this.buildSeguridad();
    this.dataSource = new InCorporarPlazaDataSource(this.dataService);
    this.paginator.showFirstLastButtons = true;
    this.paginator._intl.itemsPerPageLabel = 'Registros por página';
    this.paginator._intl.nextPageLabel = 'Siguiente página';
    this.paginator._intl.previousPageLabel = 'Página anterior';
    this.paginator._intl.firstPageLabel = 'Primera página';
    this.paginator._intl.lastPageLabel = 'Última página';
    this.paginator._intl.getRangeLabel = dutchRangeLabel;
    this.buscarListAgregarPlaza(true);
  }

  buildForm(): void {
    this.form = this.formBuilder.group({
      codigoModular: [null],
      codigoPlaza: [null],
      codigo_modular: [null],
      codigo_plaza: [null]
    });
  }
  buildSeguridad = () => {
    /*
    this.permisos.autorizadoAgregar = this.dataService.Storage().tienePermisoAccion(TablaPermisos.Agregar);
    this.permisos.autorizadoModificar = this.dataService.Storage().tienePermisoAccion(TablaPermisos.Modificar);
    this.permisos.autorizadoEliminar = this.dataService.Storage().tienePermisoAccion(TablaPermisos.Eliminar);
    this.permisos.autorizadoEnviar = this.dataService.Storage().tienePermisoAccion(TablaPermisos.Eliminar);
    this.permisos.autorizadoEnviar = true;
    */
    this.permisos.autorizadoExportar = this.dataService.Storage().tienePermisoAccion(TablaPermisos.Eliminar);
    this.currentSession = this.dataService.Storage().getInformacionUsuario();
  }

  handleResponsive(): void {
    this.isMobile = this.getIsMobile();
    window.onresize = () => {
      this.isMobile = this.getIsMobile();
    };
  }

  request = {
    idDesarrolloProceso: 0,
    codigoModular: '',
    codigoPlaza: '',
    pageIndex: 0,
    pageSize: 10
  };

  setRequest = () => {
    this.request = {
      idDesarrolloProceso: Number(this.data.idDesarrolloProceso),
      codigoModular: this.form.get('codigoModular').value,
      codigoPlaza: this.form.get('codigoPlaza').value,
      pageIndex: 1,
      pageSize: 10
    }
  }

  ngAfterViewInit(): void {
    this.paginator.page.subscribe(() =>
      this.loadData(
        this.paginator.pageIndex + 1,
        this.paginator.pageSize)
    );
  }

  loadData(pageIndex, pageSize): void {
    this.setRequest();
    this.dataSource.load(
      this.request,
      this.paginator.pageIndex + 1,
      this.paginator.pageSize
    );
  }

  busquedaCentroTrabajoPersonalizada = () => {
    this.dialogRef = this.materialDialog.open(
        BuscarCentroTrabajoComponent,
        {
            panelClass: "buscar-centro-trabajo-dialog",
            width: "1100px",
            disableClose: true,
            data: {
                action: "requerimiento",
            },
        }
    );

    this.dialogRef.afterClosed().subscribe((result) => {
        if (result != null) {
            // this.form.get("idCodigoModular").setValue(result.centroTrabajo.codigo_centro_trabajo);
            this.form.get("codigoModular").setValue(result.centroTrabajo.codigo_centro_trabajo);
        }
    });
    // console.log('abrir');
  };

  busquedaPlazaPersonalizada(): void {
    this.dialogRef = this.materialDialog.open(BuscarPlazaComponent, {
        // panelClass: "buscar-plaza-dialog",
        panelClass: 'buscar-plaza-form',
        width: "1200px",
        disableClose: true,
        data: {
            action: "busqueda",
            tipoFormato: 1, // TipoFormatoPlazaEnum.GENERAL,
        },
    });

    this.dialogRef.afterClosed().subscribe((result) => {
        if (result != null) {
            // this.form.get("idCodigoPlaza").setValue(result.plaza.codigo_plaza.trim());
            //OBS21
            this.form.get("codigoPlaza").setValue(result.codigoPlaza.trim());
        }
    });
  }

  dialogInformacion(row): void {
    this.dialogRef = this.materialDialog.open(InformacionPlazaComponent,
      {
        panelClass: 'informacion-plaza',
        disableClose: true,
        data: {
          idPlazaReasignacion: Number(row.id_plaza_reasignacion),
          idPlazaReasignacionDetalle: Number(row.id_plaza_reasignacion_detalle),
          idPlaza: Number(row.id_plaza)
        },
      }
    );

    this.dialogRef.afterClosed().subscribe((resp) => {
        this.selection.clear();
    });
  }

  /*Selecciona todas las filas si no están todas seleccionadas; de lo contrario, selección clara.*/
  masterToggle = () => {
    this.isAllSelected() ?
      this.selection.clear() :
      this.dataSource.data.forEach(row => this.selection.select(row));
  }
  /*Si el número de elementos seleccionados coincide con el número total de filas.*/
  isAllSelected = () => {
    const numSelected = this.selection.selected.length;
    const numRows = this.dataSource.data.length;
    return numSelected === numRows;
  }
  /* La etiqueta de la casilla de verificación en la fila pasada */
  checkboxLabel(row): string {
    if (!row) {
      return `${this.isAllSelected() ? 'deselect' : 'select'} all`;
    }
    return `${this.selection.isSelected(row) ? 'deselect' : 'select'} row ${row.registro + 1}`;
  }

  handleAsignar = () => {
    var codigoSede = this.codSedeCabecera;
    var codigoTipoSede= this.currentSession.codigoTipoSede;
    if(codigoTipoSede !== "TS005"){
        codigoSede = this.currentSession.codigoSede;
    }
    let plazas = [];
    let asignarPlaza: any = this.selection.selected;
    if (asignarPlaza.length === 0) {
      this.dataService.Message()
        .msgWarning('DEBE DE SELECCIONAR AL MENOS UN REGISTRO, PARA AGREGAR PLAZA(S).',
          () => { });
      return;
    }
    for (let i = 0; i < asignarPlaza.length; i++) {

      let idpl = asignarPlaza[i].id_plaza
      plazas.push(idpl);
    }
    const dato = {
      idEtapaProceso: Number(this.idep),
      idsPlazas: plazas,
      usuario: this.currentSession.numeroDocumento,
      codigoCentroTrabajoMaestro: codigoSede
    }
    const confirmationMessage = "<strong>¿ESTA SEGURO QUE DESEA INCORPORAR LA(S) PLAZA(S)? </strong>"; // M114
    this.dataService.Message().msgConfirm(confirmationMessage,
        () => {
            this.dataService.Spinner().show("sp6");
    this.dataService.Reasignaciones()
      .getAsignarPlaza(dato)
      .pipe(
        catchError(() => of([])),
        finalize(() => {  this.dataService.Spinner().hide("sp6"); })
      )
      .subscribe((response: any) => {
        if (response) {
          this.MatDialogRef.close('guardado');
        }
        else if (response === ResultadoOperacionEnum.NotFound) {
          this.dataService.Message().msgWarning(response.messages[0], () => { });
          return
        } else if (response === ResultadoOperacionEnum.UnprocessableEntity) {
          this.dataService.Message().msgWarning(response.messages[0], () => { });
          return
        } else {
          this.dataService.Message().msgError('OCURRIERON ALGUNOS PROBLEMAS AL INCORPORAR LA(S) PLAZA(S).', () => { });
          return
        }
      });
    }, (error) => {});
  }
  resetForm = () => {
    this.form.reset();
  }

  handleLimpiar(): void {
    this.resetForm();
    this.buscarListAgregarPlaza();
  }

  handleBuscar(): void {
    this.buscarListAgregarPlaza(true);
  }

  buscarListAgregarPlaza = (fistTime: boolean = false) => {
    this.setRequest();
    if (fistTime) {
      this.dataSource.load(this.request, 1, 10, true);
    } else {
      this.dataSource.load(
        this.request,
        this.paginator.pageIndex + 1,
        this.paginator.pageSize,
        false
      );
    }
  }

  handleCancel = () => {
    this.MatDialogRef.close();
  }

  reExport = {
    idEtapaProceso: 0,
    idDesarrolloProceso: 0,
    codigoModular: '',
    codigoPlaza: ''
    // operacion: ''
  };

  setReExport = () => {
    this.reExport = {
      idDesarrolloProceso: Number(this.data.idDesarrolloProceso),
      idEtapaProceso: Number(this.data.idep),
      codigoModular: this.form.get('codigoModular').value,
      codigoPlaza: this.form.get('codigoPlaza').value
    };
  }

  handleExportar(): void {

    if (this.dataSource.data.length === 0) {
      this.dataService
        .Message()
        .msgWarning('No se encontró información para exportar.', () => { });
      return;
    }
    this.dataService.Spinner().show('sp6');
    this.setReExport();
    this.dataService
      .Reasignaciones()
      .exportarPrePubPlaPlazasParaReasignacion(this.reExport)
      .pipe(
        catchError((e) => of(null)),
        finalize(() => {
          this.dataService.Spinner().hide('sp6');
        })
      )
      .subscribe((response: any) => {
        if (response) {
          descargarExcel(response, 'Plazas a Asignar - ' + this.idplr + '.xlsx');
          this.dataService.Message().msgAutoCloseSuccessNoButton('"OPERACIÓN REALIZADA DE FORMA EXITOSA."',3000,() => {});
        } else {
          this.dataService
            .Message()
            .msgWarning(
              '"NO SE ENCONTRÓ INFORMACIÓN PARA LOS CRITERIOS DE BÚSQUEDA INGRESADO."',
              () => { }
            );
        }
      });
  }
}



export class InCorporarPlazaDataSource extends DataSource<any> {
  private _dataChange = new BehaviorSubject<any>([]);
  private _loadingChange = new BehaviorSubject<boolean>(false);

  public loading = this._loadingChange.asObservable();
  public totalregistro = 0;

  constructor(private dataService: DataService) {
    super();
  }
  //pageIndex, pageSize,
  // load(data: any, firsTime = false): void {
  load(data: any, pageIndex, pageSize, firsTime = false): void {
    this._loadingChange.next(false);
    // if (!firsTime) this.dataService.Spinner().show('sp6');
    //this.dataService.Spinner().show('sp6');
    // if (data.anio === null) {
    //   this._loadingChange.next(false);
    //   this._dataChange.next([]);
    // } else {
    this.dataService
      .Reasignaciones()
      // .getListAgregarPlazas(data, pageIndex, pageSize)
      .getPrePubPlaPlazasParaReasignacion(data, pageIndex, pageSize)
      .pipe(
        catchError((e) => of(e)),
        finalize(() => {
          this._loadingChange.next(false);
          this.dataService.Spinner().hide('sp6');
        //   if (!firsTime) this.dataService.Spinner().hide('sp6');
        })
      )
      .subscribe((response: any) => {
        if (response) {
          this._dataChange.next(response);
          this.totalregistro = response.length === 0 ? 0 : response[0].total_rows;
          if (response.length === 0) {
            this.dataService
              .Message()
              .msgWarning(
                '"NO SE ENCONTRÓ INFORMACIÓN DE LA(S) PLAZA(S) PARA LOS CRITERIOS DE BÚSQUEDA INGRESADOS."',
                () => { }
              );
          }
        }
        else if (response === ResultadoOperacionEnum.NotFound) {
          this.dataService.Message().msgWarning(response.messages[0], () => { });
        } else if (response === ResultadoOperacionEnum.UnprocessableEntity) {
          this.dataService.Message().msgWarning(response.messages[0], () => { });
        } else {
          this.dataService.Message().msgError('"OCURRIERON ALGUNOS PROBLEMAS AL OBTENER LA INFORMACIÓN."', () => { });
        }
      });
    // }

    // this._dataChange.next(data);
    // this.totalregistro = 0;
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
