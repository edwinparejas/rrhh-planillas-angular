import { CollectionViewer, DataSource, SelectionModel } from '@angular/cdk/collections';
import { HttpErrorResponse } from '@angular/common/http';
import { AfterViewInit, Component, Inject, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { ActivatedRoute, Router } from '@angular/router';
import { mineduAnimations } from '@minedu/animations/animations';
import { DataService } from 'app/core/data/data.service';
import { GlobalsService } from 'app/core/shared/globals.service';
// import { SecurityModel } from 'app/core/data/model/security.model';
// import { SharedService } from 'app/core/data/shared/shared.service';
import { BehaviorSubject, Observable, of, Subject, Subscription } from 'rxjs';
import { catchError, finalize, tap } from 'rxjs/operators';

@Component({
  selector: 'servidorpublico-buscador-persona',
  templateUrl: './buscador-persona.component.html',
  styleUrls: ['./buscador-persona.component.scss'],
  encapsulation: ViewEncapsulation.None,
  animations: mineduAnimations
})
export class BuscadorPersonaComponent implements OnInit, AfterViewInit {
  working: false;
  form: FormGroup;
  maxLengthnumeroDocumentoIdentidad: number;
  dataSource: PersonaDataSource | null;
  selection = new SelectionModel<any>(true, []);
  seleccionado: any = null;
//   currentSession: SecurityModel = new SecurityModel();
  comboLists = {
    listTipoDocumento: []
  };

  request = {
    idTipoDocumentoIdentidad: null,
    idCentroTrabajo: null,
    numeroDocumentoIdentidad: null,
    nacionalidad: null,
    primerApellido: null,
    segundoApellido: null,
    nombres: null
  };

  displayedColumns: string[] = [
    'nro',
    'numeroDocumentoIdentidadCompleto',
    'nombreCompleto',
    'fechaNacimiento',
    'edad',
    'nacionalidad',
    'estadoCivil',
    'estado'
  ];

  @ViewChild('paginator', { static: true }) paginator: MatPaginator;
  // private _unsubscribeAll: Subject<any>;
  // private sharedSubscription: Subscription;

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
      public matDialogRef: MatDialogRef<BuscadorPersonaComponent>,
      @Inject(MAT_DIALOG_DATA) private dataDialog: any,
      private route: ActivatedRoute,
      private router: Router,
      private formBuilder: FormBuilder,
      private dataService: DataService,
      // private dataShared: SharedService,
      public globals: GlobalsService,
      private materialDialog: MatDialog) { }

  ngAfterViewInit(): void {
       // this.paginator.page.pipe(tap(() => this.buscarServidorPublico())).subscribe();

        this.paginator.page.subscribe(() =>
          this.loadData(
              (this.paginator.pageIndex + 1).toString(),
              this.paginator.pageSize.toString()
          )
      );

  }

  ngOnInit(): void {
    this.buildForm();
    // this.buildSeguridad();
    this.handleResponsive();
    this.loadTipoDocumentoIdentidad();
    this.dataSource = new PersonaDataSource(this.dataService);
    this.paginator.showFirstLastButtons = true;
    this.paginator._intl.itemsPerPageLabel = 'Registros por página';
    this.paginator._intl.nextPageLabel = 'Siguiente página';
    this.paginator._intl.previousPageLabel = 'Página anterior';
    this.paginator._intl.firstPageLabel = 'Primera página';
    this.paginator._intl.lastPageLabel = 'Última página';
    this.paginator._intl.getRangeLabel = (page: number, pageSize: number, length: number) => {
        if (length === 0 || pageSize === 0) {return `0 de ${length}`;}
        const length2 = Math.max(length, 0);
        const startIndex = page * pageSize;
        const endIndex = startIndex < length2 ? Math.min(startIndex + pageSize, length2) : startIndex + pageSize;
        return `${startIndex + 1} – ${endIndex} de ${length2}`;
    }
  }

//   buildSeguridad = () => {
//     this.currentSession = this.dataService.Storage().getInformacionUsuario();
//     console.log("codigos Sede", this.currentSession.idSede, this.currentSession.idTipoSede, this.currentSession.codigoLocalSede, this.currentSession.codigoPadreSede)
//   }

  handleResponsive(): void {
    this.isMobile = this.getIsMobile();
    window.onresize = () => {
        this.isMobile = this.getIsMobile();
    };
  }

  loadData(pageIndex, pageSize) {
    this.dataSource.load(this.request, pageIndex, pageSize);
  }

  buildForm = () => {
      this.form = this.formBuilder.group({
          idTipoDocumentoIdentidad: [null],
          idCentroTrabajo: [null],
          numeroDocumentoIdentidad: [null],
          nacionalidad: [null],
          primerApellido: [null],
          segundoApellido: [null],
          nombres: [null],
      });
      
      if(this.dataDialog.idTipoDocumentoIdentidad > 0)
      {
        this.form.patchValue({idTipoDocumentoIdentidad: this.dataDialog.idTipoDocumentoIdentidad});
      }
      if(this.dataDialog.numeroDocumentoIdentidad)
      {
        this.form.patchValue({numeroDocumentoIdentidad: this.dataDialog.numeroDocumentoIdentidad});
      }
      // else
      // {
      //   this.form.get("numeroDocumentoIdentidad").disable();
      // }

      const usuario = this.dataService.Storage().getPassportRolSelected();
      this.form.patchValue({idCentroTrabajo: usuario.CODIGO_SEDE});
  }

  loadTipoDocumentoIdentidad = () => {
    let req = {
      codigoCatalogo: 6,
      Inactivo: false
    }

    this.dataService.OtrasFuncionalidades().getCatalogoItem(req).pipe(
        catchError(() => of([])),
        finalize(() => { })
    ).subscribe((response: any) => {
        this.comboLists.listTipoDocumento = response;
        this.comboLists.listTipoDocumento.unshift({
            id_catalogo_item: -1,
            descripcion_catalogo_item: '--TODOS--'
        });
    },
    (error: HttpErrorResponse) => {
      console.log(error);
    });
  }

  cargarFiltro(): void {
      this.request = this.form.getRawValue();
  }

  buscarServidorPublico = () => {
    this.cargarFiltro();
        
    if (this.request.numeroDocumentoIdentidad === '') this.request.numeroDocumentoIdentidad = null;    

    if (this.request.idTipoDocumentoIdentidad === null && this.request.numeroDocumentoIdentidad === null && this.request.nombres === null && this.request.primerApellido === null && this.request.segundoApellido === null) {
        this.dataService.Message().msgWarning('"DEBE ESPECIFICAR POR LO MENOS UN CRITERIO DE BÚSQUEDA."', () => { });
        return;
    }
    
    this.dataSource = new PersonaDataSource(this.dataService);
    this.dataSource.load(this.request, (this.paginator.pageIndex + 1), this.globals.paginatorPageSize);
        
  }

  handleLimpiar(): void {
    this.form.reset();
  }

  handleBuscar(): void {
    this.paginator.pageIndex = 0;
    this.buscarServidorPublico();
  }

  onSelect(selected: any): void {
      this.selection.clear();
      this.selection.toggle(selected);
      // this.seleccionado = selected;
      this.matDialogRef.close({ persona: selected });
  }

  handleSelect = (form) => {
      if (this.seleccionado === null) {
          this.dataService.Message().msgWarning('"DEBE SELECCIONAR UN REGISTRO."', () => { });
      } else {
          this.matDialogRef.close({ persona: this.seleccionado });
      }
  }

  handleCancel = () => {
      this.matDialogRef.close();
  }

  selectTipoDocumento(tipoDocumento: number): void {
      this.form.get('numeroDocumentoIdentidad').setValue('');
      this.maxLengthnumeroDocumentoIdentidad = tipoDocumento === 1 ? 8 : 12;
      
      // if(tipoDocumento===null || 
      //     tipoDocumento===undefined || 
      //     tipoDocumento<=0)this.form.get("numeroDocumentoIdentidad").disable();
      //  else this.form.get("numeroDocumentoIdentidad").enable();

      this.form.get('numeroDocumentoIdentidad').setValidators([ Validators.maxLength(this.maxLengthnumeroDocumentoIdentidad) ]);
  }

  validaNumericos = (event) => {
      if (event.charCode >= 48 && event.charCode <= 57) {
          return true;
      }
      return false;
  }

  validaLetras = (event) => {
      var key = event.keyCode || event.which,
        tecla = String.fromCharCode(key).toLowerCase(),
        letras = " áéíóúabcdefghijklmnñopqrstuvwxyz",
        especiales = [8, 37, 39, 46],
        tecla_especial = false;
  
      for (var i in especiales) {
        if (key == especiales[i]) {
          tecla_especial = true;
          break;
        }
      }
  
      if (letras.indexOf(tecla) == -1 && !tecla_especial) {
        return false;
      }
    };
}

export class PersonaDataSource extends DataSource<any>{

  private _dataChange = new BehaviorSubject<any>([]);
  private _loadingChange = new BehaviorSubject<boolean>(false);

  public loading = this._loadingChange.asObservable();
  public totalregistro = 0;

  constructor(private dataService: DataService) {
      super();
  }

  load(data: any, pageIndex, pageSize): void {
      this.dataService.Spinner().show("sp6");
      this._loadingChange.next(false);
      this.dataService.OtrasFuncionalidades().getPersonaTransversal(data, pageIndex, pageSize).pipe(
          catchError(() => of([])),
          finalize(() => {
              this._loadingChange.next(false);
              this.dataService.Spinner().hide("sp6");
          })
      ).subscribe((response: any) => {
          this._dataChange.next(response || []);
          this.totalregistro = ((response || []).length === 0) ? 0 : response[0].totalRegistro;
          if ((response || []).length === 0) {
              this.dataService.Message().msgWarning('"NO SE ENCONTRÓ INFORMACIÓN PARA LOS CRITERIOS DE BÚSQUEDA INGRESADOS."', () => { });
          }
      });

      this._dataChange.next(data);
      this.totalregistro = 0;
  }

  connect(collectionViewer: CollectionViewer): Observable<[]> {
      return this._dataChange.asObservable();
  }

  disconnect(collectionViewer: CollectionViewer): void {
      this._dataChange.complete();
      this._loadingChange.complete();
  }

  get data(): any {
      return this._dataChange.value || [];
  }
}

