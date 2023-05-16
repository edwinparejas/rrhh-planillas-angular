import { BusquedaCentroTrabajoComponent } from '../../../components/busqueda-centro-trabajo/busqueda-centro-trabajo.component';
import { SelectionModel, DataSource, CollectionViewer } from '@angular/cdk/collections';
import { AfterViewInit, Component, Inject, OnDestroy, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { FormGroup, FormBuilder } from '@angular/forms';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { mineduAnimations } from '@minedu/animations/animations';
import { DataService } from 'app/core/data/data.service';
import { GlobalsService } from 'app/core/shared/globals.service';
import { SharedService } from 'app/core/shared/shared.service';
import { of, BehaviorSubject, Observable, Subject } from 'rxjs';
import { catchError, filter, finalize, takeUntil } from 'rxjs/operators';
import { BusquedaPlazaComponent } from '../../../components/busqueda-plaza/busqueda-plaza.component';

import { InformacionPlazaComponent } from '../../../components/informacion-plaza/informacion-plaza.component';
import { descargarExcel } from 'app/core/utility/functions';
import { RotacionModel } from 'app/core/model/rotacion.model';
import { ActivatedRoute, Router } from "@angular/router";


@Component({
  selector: 'minedu-incorporar-plazas',
  templateUrl: './incorporar-plazas.component.html',
  styleUrls: ['./incorporar-plazas.component.scss'],
  encapsulation: ViewEncapsulation.None,
  animations: mineduAnimations,
})

export class IncorporarPlazasComponent implements OnInit, OnDestroy, AfterViewInit {

  form: FormGroup;
  working = false;
  workingAgregar = false;
  dialogRef: any;

  request = {
    anexoCentroTrabajo: null,
    codigoModular: null,
    codigoPlaza: null,
    idDesarrolloProceso: null, 
  };

  idEtapaProceso: any;
  idDesarrolloProceso: any;
  codigoPlaza:any;
  codigoModular:any;

  displayedColumns: string[] = [
    'select',
    'codigoModular',
    'centroTrabajo',
    'modalidad',
    'nivelEducativo',
    'tipoGestion',
    'codigoPlaza',
    'cargo',
    'grupoOcupacional',
    'categoriaRemunerativa',
    'tipoPlaza',
    'fechaVigenciaInicio',
    'fechaVigenciaFin',
    'acciones'
  ];

  dataSourceIncorporarPlaza: IncorporarPlazaDataSource | null;
  selectionIncorporarPlaza = new SelectionModel<any>(true, []);
  @ViewChild('paginatorPlaza', { static: true }) paginatorIncorporarPlaza: MatPaginator;
  paginatorPageSize = 10;
  paginatorPageIndex = 0;

  private _unsubscribeAll: Subject<any>;
  constructor(
    // public matDialogRef: MatDialogRef<IncorporarPlazasComponent>,
    // @Inject(MAT_DIALOG_DATA) private data: any,
    private route: ActivatedRoute,
    private router: Router,
    private formBuilder: FormBuilder,
    private dataService: DataService,
    private sharedService: SharedService,
    private materialDialog: MatDialog,
    public globals: GlobalsService,
  ) {
    this._unsubscribeAll = new Subject();
  }

  ngOnInit(): void {
    // console.log("Probando rutas", this.data);
    this.buildForm();
    setTimeout(() => { this.buildGrid(); }, 0);
    this.sharedService.onWorking
      .pipe(
        filter(value => {
          return value !== null;
        }),
        takeUntil(this._unsubscribeAll)
      ).subscribe(working => this.working = working);
      this.idEtapaProceso = +this.route.snapshot.params.idEtapaProceso;
      this.idDesarrolloProceso = +this.route.snapshot.params.idDesarrolloProceso;      
  }

  private buildGrid() {
    this.dataSourceIncorporarPlaza = new IncorporarPlazaDataSource(this.dataService, this.sharedService);
    IncorporarPlazasComponent.buildPaginators(this.paginatorIncorporarPlaza);
  }

  private static buildPaginators(paginator: MatPaginator): void {
    paginator.showFirstLastButtons = true;
    paginator._intl.itemsPerPageLabel = 'Registros por página';
    paginator._intl.nextPageLabel = 'Siguiente página';
    paginator._intl.previousPageLabel = 'Página anterior';
    paginator._intl.firstPageLabel = 'Primera página';
    paginator._intl.lastPageLabel = 'Última página';
  }

  buildForm() {
    this.form = this.formBuilder.group({
      codigoModular: [null],
      anexoCentroTrabajo: [null],
      codigoPlaza: [null]
    });
  }

  default() {
    this.form.controls['anexoCentroTrabajo'].reset();
    this.form.controls['codigoModular'].reset();
    this.form.controls['codigoPlaza'].reset();
  }

  ngAfterViewInit() {
    this.paginatorIncorporarPlaza.page.subscribe(() => { this.handleBuscar(); });
  }

  ngOnDestroy(): void {
    this._unsubscribeAll.next();
    this._unsubscribeAll.complete();
  }


  /*
  *-------------------------------------------------------------------------------------------------------------
  * OPERACIONES PLAZAS
  *-------------------------------------------------------------------------------------------------------------
  */
  handleBuscar = () => {
    console.log("hola buscar", this.request)
    this.working = true;
    this.setRequest();
    this.dataSourceIncorporarPlaza.load(
      this.request,
      this.paginatorIncorporarPlaza.pageIndex + 1,
      this.paginatorIncorporarPlaza.pageSize
    );
  };

  masterToggle = () => {
    this.isAllSelected() ?
      this.selectionIncorporarPlaza.clear() :
      this.dataSourceIncorporarPlaza.data.forEach(row => this.selectionIncorporarPlaza.select(row));
  };

  isAllSelected = (): boolean => {
    const numSelected = this.selectionIncorporarPlaza.selected.length;
    const numRows = this.dataSourceIncorporarPlaza.data.length;
    return numSelected === numRows;
  };

  selectedGrid = (param) => {
    this.selectionIncorporarPlaza.toggle(param);
  };

  handleLimpiar() {
    this.default();
  }

  busquedaPlazas = () => {

  };

  busquedaPlazasDialog = ($event) => {
    this.dialogRef = this.materialDialog.open(
      BusquedaPlazaComponent,
      {
        panelClass: 'buscar-plaza-form',
        disableClose: true,
        data: {
          action: 'busqueda',
        },
      }
    );

    this.dialogRef.afterClosed().subscribe((resp) => {
      if (resp != null) {
        this.form.get('codigoPlaza').setValue(resp.codigoPlaza);
      }
    });
  };

  buscarCentroTrabajoDialog(event) {
    const codigoCentroTrabajo = this.form.get('codigoModular').value;
    if (codigoCentroTrabajo) {
      this.busquedaCentroTrabajo(event);
      return;
    }
    this.handleCentroTrabajoDialog([]);
  }

  busquedaCentroTrabajo(event) {
    event.preventDefault();
    const codigoCentroTrabajo = this.form.get('codigoModular').value;

    if (!codigoCentroTrabajo) {
      this.dataService.Message().msgWarning('"DEBE INGRESAR UN CÓDIGO MODULAR PARA REALIZAR LA BÚSQUEDA."', () => {
      });
      return;
    }
    if (codigoCentroTrabajo.length < 6 || codigoCentroTrabajo.length > 7) {
      this.dataService.Message().msgWarning('"CÓDIGO MODULAR NO VÁLIDO, DEBE INGRESAR UN NÚMERO CON (6 a 7) DÍGITOS."', () => {
      });
      return;
    }

    const data = {
      codigoCentroTrabajo: codigoCentroTrabajo.trim(),
      codigoNivelInstancia: parseInt(this.dataService.Storage().getCurrentUser().codigoNivelInstancia)
    };

    this.dataService.Spinner().show('sp6');
    this.dataService.Rotacion().getListCentroTrabajo(data, 1, 10).pipe(
      catchError((e) => of(null)),
      finalize(() => {
        this.dataService.Spinner().hide('sp6');
      })
    ).subscribe((response: any) => {
      if (response) {
        const data: any[] = response;
        if (data.length === 1) {
          this.setCentroTrabajo(data[0]);
        } else if (data.length > 1) {
          this.handleCentroTrabajoDialog(data);
          this.dataService.Message().msgAutoInfo('"SE ENCONTRÓ MÁS DE UN REGISTRO PARA EL CÓDIGO MODULAR INGRESADO, SELECCIONE UN REGISTRO"', 3000, () => {
          });
        } else {
          this.dataService.Message().msgWarning('"NO SE ENCONTRÓ INFORMACIÓN PARA LOS CRITERIOS DE BÚSQUEDA INGRESADOS"', () => {
          });
        }
      } else {
        this.dataService.Message().msgError('"OCURRIERON ALGUNOS PROBLEMAS AL BUSCAR EL CENTRO DE TRABAJO, POR FAVOR INTENTE DENTRO DE UNOS SEGUNDOS, GRACIAS."', () => {
        });
      }
    });
  }

  private handleCentroTrabajoDialog(registros: any[]) {
    this.dialogRef = this.materialDialog.open(
      BusquedaCentroTrabajoComponent,
      {
        panelClass: 'buscar-centro-trabajo-form',
        width: '1300px',
        disableClose: true,
        data: {
          registrado: false,
          centrosTrabajo: registros,
          permiteBuscar: registros.length === 0
        },
      }
    );

    this.dialogRef.afterClosed().subscribe((response) => {
      if (!response) {
        return;
      }
      this.setCentroTrabajo(response);
    });
  }

  private setCentroTrabajo = (data) => {
    this.form.patchValue({ codigoModular: data.codigoCentroTrabajo, anexoCentroTrabajo: data.anexoCentroTrabajo });
  };

  handleVerInformacionPlaza = (row) => {
    console.log("row", row)
    this.dialogRef = this.materialDialog.open(InformacionPlazaComponent,
      {
        panelClass: 'informacion-plaza',
        disableClose: true,
        data: { idPlaza: row.idPlaza },
      }
    );

    this.dialogRef.afterClosed().subscribe((resp) => {
      this.selectionIncorporarPlaza.clear();
    });
  }

  handleExportarPlazas = () => {
    if (this.dataSourceIncorporarPlaza.data.length === 0) {
      this.dataService
        .Message()
        .msgWarning(
          '"NO SE ENCONTRÓ INFORMACIÓN PARA EXPORTAR."',
          () => {
          }
        );
      return;
    }
    this.dataService.Spinner().show('sp6');
    this.dataService
      .Rotacion()
      .exportarIncorporarPlaza(this.request)
      .pipe(
        catchError((e) => of(null)),
        finalize(() => {
          this.dataService.Spinner().hide('sp6');
        })
      )
      .subscribe((response: any) => {
        if (response) {
          descargarExcel(response, 'plazas.xlsx');
        } else {
          this.dataService
            .Message()
            .msgWarning(
              '"NO SE ENCONTRÓ INFORMACIÓN PARA LOS CRITERIOS DE BÚSQUEDA INGRESADO"',
              () => {
              }
            );
        }
      });
  };

  handleAgregarPlazas = () => {
    //console.log("incorporarPlaza", this.data);
    const plazas: any[] = this.selectionIncorporarPlaza.selected;
    if (plazas.length === 0) {
      this.dataService.Message().msgWarning('"SELECCIONE AL MENOS UN REGISTRO PARA PROCEDER CON LA OPERACIÓN."', () => { });
      return;
    }
    this.workingAgregar = true;
    //const { idPlazaRotacion, idDesarrolloProceso, idEtapaProceso } = this.data;
    let idPlazaRotacion = +this.route.snapshot.params.idPlazaRotacion;
    let idDesarrolloProceso = +this.route.snapshot.params.idDesarrolloProceso;
    let idEtapaProceso = +this.route.snapshot.params.idEtapaProceso;
    console.log("plazas incor", plazas);
    const plazasIncorporar = plazas.map(t => { return { idPlaza: t.idPlaza, idCentroTrabajo: t.idCentroTrabajo } });
    const data = {
      plazas: plazasIncorporar,
      idPlazaRotacion: idPlazaRotacion,
      idDesarrolloProceso: idDesarrolloProceso,
      idEtapaProceso: idEtapaProceso
    };
    console.log('handleAgregarPlazas', data);
    
    this.dataService.Message().msgConfirm("¿ESTA SEGURO QUE DESEA INCORPORAR LAS PLAZAS A LA ETAPA UNICA?", () => {
      this.dataService.Spinner().show('sp6');
      this.dataService
        .Rotacion()
        .incorporarPlaza(data)
        .pipe(
          catchError((e) => of(null)),
          finalize(() => { this.dataService.Spinner().hide('sp6'); this.workingAgregar = false; })
        ).subscribe((response: any) => {
          if (response) {
            this.masterToggle();           
            this.selectionIncorporarPlaza.clear();
            // this.dataService.Message().msgSuccess('Operación realizada de manera exitosa.', () => { });
            this.dataService.Message().msgAutoCloseSuccessNoButton('"OPERACIÓN REALIZADA DE FORMA EXITOSA."', 3000, () => {              
              this.handleRetornar();
            });            
          } else {
            this.dataService.Message().msgWarning('"ERROR AL INCORPORAR LAS PLAZAS"', () => { });
          }
        });

    }, () => { this.workingAgregar = false; });
  }


  private setRequest = () => {
    //const { idDesarrolloProceso } = this.data;
    let idDesarrolloProceso = +this.route.snapshot.params.idDesarrolloProceso;
    this.request = {
      anexoCentroTrabajo: this.form.get('anexoCentroTrabajo').value,
      // codigoPlaza: this.form.get('codigoPlaza').value,
      // codigoModular: this.form.get('codigoModular').value,
      codigoPlaza: this.codigoPlaza,
      codigoModular: this.codigoModular,
      idDesarrolloProceso: idDesarrolloProceso
    };
  };

  handleCancelar(event: boolean = false) {
    //this.matDialogRef.close(event);
      
  }

  handleRetornar = () => {
    
    this.router.navigate(
        ["../../../../plazas/" + this.idEtapaProceso+'/'+ this.idDesarrolloProceso],{ relativeTo: this.route }
      );  
  };

}


export class IncorporarPlazaDataSource extends DataSource<any> {

  private _dataChange = new BehaviorSubject<any>([]);
  private _loadingChange = new BehaviorSubject<boolean>(false);

  public loading = this._loadingChange.asObservable();
  public totalregistro = 0;

  constructor(private dataService: DataService, private sharedService: SharedService) {
    super();
  }

  load(data: any, pageIndex, pageSize) {
    this._loadingChange.next(true);
    this.dataService.Spinner().show('sp6');
    this.dataService.Rotacion().getIncorporarPlazaGrid(data, pageIndex, pageSize).pipe(
      catchError((e) => of(null)),
      finalize(() => {
        this._loadingChange.next(false);
        this.dataService.Spinner().hide('sp6');
        this.sharedService.sendWorking(false);
      })
    ).subscribe((response: any) => {
      if (response && (response || []).length > 0) {
        this.totalregistro = (response[0] || [{ totalRegistros: 0 }]).totalRegistros;
        this._dataChange.next(response || []);
      } else {
        this.totalregistro = 0;
        this._dataChange.next([]);
        this.dataService.Message().msgWarning('"NO SE ENCONTRÓ INFORMACIÓN PARA LOS CRITERIOS DE BÚSQUEDA INGRESADOS."', () => {
        });
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
    return this.totalregistro;
  }
  get data(): any {
    return this._dataChange.value || [];
  }
}