import { CollectionViewer, DataSource, SelectionModel } from '@angular/cdk/collections';
import { HttpErrorResponse } from '@angular/common/http';
import { AfterViewInit, Component, OnDestroy, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { ActivatedRoute, Router, RouterLinkWithHref } from '@angular/router';
import { mineduAnimations } from '@minedu/animations/animations';
import { DataService } from 'app/core/data/data.service';
import { StorageService } from 'app/core/data/services/storage.service';
import { SecurityModel } from 'app/core/model/security/security.model';
import { TablaPermisos, TablaTipoDocumentoConfiguracion } from 'app/core/model/types';
import { SharedService } from 'app/core/shared/shared.service';
import { descargarExcel } from 'app/core/utility/functions';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { catchError, finalize, tap } from 'rxjs/operators';


import * as moment from 'moment';
import { isNull } from 'lodash';
import { CentroTrabajoModel, criterioBusqueda, MESSAGE_GESTION, TablaEquivalenciaSede } from './models/historial-personla.model';



@Component({ 
  selector: 'minedu-historial-personal',
  templateUrl: './historial-personal.component.html',
  styleUrls: ['./historial-personal.component.scss'],
  encapsulation: ViewEncapsulation.None,
  animations: mineduAnimations,
})
export class HistorialPersonalComponent implements OnInit, OnDestroy, AfterViewInit {
  // AccionesPersonal: AccionPersonalModels = new AccionPersonalModels();

  passportModular={
    idNivelInstancia: null,        
    idEntidadSede: null, 
    idRolPassport: null
  }

  maxLenghtDocumento: number = 12;
  longitudDocumentoExacta: boolean = false;

  isSelectPricipal = false;
  
  centroTrabajo: CentroTrabajoModel = null;

  idEtapaProceso: number;

  Nombre_Usuario = "";
  idDre = 0
  idUgel = 0
  codigoTipoSede = "";

  form: FormGroup;
  formExportar: any = {};
  loading: false;
  
  export = false;

  entidad = false;
  
  now = new Date();
  untilDate = new Date();
  untilDateFin = new Date(new Date().getFullYear(), 11, 31);
  minDate = new Date((new Date).getFullYear(), 0, 1);
  maxDate = new Date(new Date().getFullYear(), 11, 31);

  dialogRef: any;

  comboLists = {    
    listTipoDocumento: [],
    listCondicionLaboral: [],
    listSituacionLaboral: [],
    listRegimenLaboral: []        
  };
  private currentSession: SecurityModel = new SecurityModel();
  private passport: SecurityModel = new SecurityModel();
  dataUserLoginModel: any;

  permisos = {
    autorizadoAgregar: false,
    autorizadoModificar: false,
    autorizadoEliminar: false,
    autorizadoEnviar: false,
    autorizadoExportar: false,
    autorizadoConsultar: false,
    autorizadoProyecto: false
  };
  hasAccessPage: boolean;

  displayedColumns: string[] = [
    'nro',
    'documentos',
    'apellidos_nombres',
    'centro_laboral',
    'condicion_laboral',
    'situacion_laboral',
    'regimen_laboral',
    'acciones'
  ];
  

  centroTrabajoFiltroSeleccionado: any;

  dataSource: HistorialPersonalDataSource | null;
  selection = new SelectionModel<any>(true, []);
  @ViewChild(MatPaginator, { static: true })
  paginator: MatPaginator;
  
  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private formBuilder: FormBuilder,
    private dataService: DataService,
    private sharedService: SharedService,
    private materialDialog: MatDialog,
    private storageService: StorageService
  ) {}
  
  ngOnInit(): void {
    setTimeout(_ => this.buildShared());
    // setTimeout(_ => this.obtenerCodigoDreUgelLogeado(), 100);

    
    this.buildForm();
    
    this.buildPassport();        
    this.buildSeguridad();
    this.loadCombos();
    
    this.dataSource = new HistorialPersonalDataSource(this.dataService);
    this.paginator.showFirstLastButtons = true;
    this.paginator._intl.itemsPerPageLabel = "Registros por página";
    this.paginator._intl.nextPageLabel = "Siguiente página";
    this.paginator._intl.previousPageLabel = "Página anterior";
    this.paginator._intl.firstPageLabel = "Primera página";
    this.paginator._intl.lastPageLabel = "Última página";
    
    this.paginator._intl.getRangeLabel = function (page, pageSize, length) {
      debugger;
      if (length === 0 || pageSize === 0) {
        return '0 de ' + length;
      }
      length = Math.max(length, 0);
      const startIndex = page * pageSize;
      // If the start index exceeds the list length, do not try and fix the end index to the end.
      const endIndex = startIndex < length ?
        Math.min(startIndex + pageSize, length) :
        startIndex + pageSize;
      return startIndex + 1 + ' - ' + endIndex + ' de ' + length;
    }; 

    this.entidadPassport();
    this.obtenerCodigoDreUgelLogeado();    

    this.codigoTipoSede = this.passport.codigoTipoSede;
    console.log("codigoRol: ",this.currentSession.codigoRol);
    console.log("TioSede: ",this.codigoTipoSede);
    /*if (this.currentSession.codigoRol=='AYNI_019' && (this.codigoTipoSede=='TS001' || this.codigoTipoSede=='TS002' || this.codigoTipoSede=='TS012' || this.codigoTipoSede=='TS013')){
      this.handleModalInstancia();
    }*/

    this.form.get("idTipoDocumento").valueChanges.subscribe(value => {
      if (!value)
        return;

      let tipoDocumentoIdentidad = this.comboLists.listTipoDocumento.find(x => x.id_catalogo_item === value).codigo_catalogo_item;

      this.form.get('numeroDocumentoIdentidad').clearValidators();
      this.form.get('numeroDocumentoIdentidad').updateValueAndValidity();

      if (TablaTipoDocumentoConfiguracion.DNI === tipoDocumentoIdentidad) {
        this.maxLenghtDocumento = 8;
        this.longitudDocumentoExacta = true;
        this.form.get('numeroDocumentoIdentidad').setValidators([Validators.compose([Validators.required, Validators.maxLength(8), Validators.minLength(8), Validators.pattern(/^[0-9]+$/)])]);
        this.form.get('numeroDocumentoIdentidad').updateValueAndValidity();
      }

      if (TablaTipoDocumentoConfiguracion.CE === tipoDocumentoIdentidad || 
          TablaTipoDocumentoConfiguracion.PASS === tipoDocumentoIdentidad) {
        this.maxLenghtDocumento = 12;
        this.longitudDocumentoExacta = false;
        this.form.get('numeroDocumentoIdentidad').setValidators([Validators.compose([Validators.required, Validators.maxLength(12), Validators.minLength(9), Validators.pattern(/^[a-zA-Z0-9]+$/)])]);
        this.form.get('numeroDocumentoIdentidad').updateValueAndValidity();
      }

    });

  }

  entidadPassport(){
    this.dataService.AccionesVinculacion().entidadPassport(this.passport.codigoSede).pipe(
      catchError((error: HttpErrorResponse) => {
        this.dataService.Message().msgWarning(error.error.messages[0]); return of(null);
      }),
    ).subscribe((response: any) => {
      if (response.length > 0){
        if (response.length > 1)
          response = response.filter(x => x.idNivelInstancia <= 3);
          console.log("entidadPassport: ",response);
        if (response.length == 1 && response[0].idNivelInstancia == 3)
        this.passport.codigoTipoSede = TablaEquivalenciaSede.CODIGO_TIPO_SEDE_UGEL;

        this.centroTrabajo = response[0];
        this.idDre = this.centroTrabajo?.idDre;
        this.idUgel = this.centroTrabajo?.idUgel;
        this.codigoTipoSede = this.passport.codigoTipoSede;        
      }else{
        this.centroTrabajo = null;
      }
    });
  }

  

  buildShared() {
    console.log('buildShared');
    // this.sharedService.setSharedBreadcrumb("Gestionar Acciones de vinculación");
    // this.sharedService.setSharedTitle("Gestionar vinculación");
  }

  buildPassport() {
    debugger
    this.passport = this.dataService.Storage().getInformacionUsuario();    
    const usuario = this.dataService.Storage().getPassportUserData();
    this.Nombre_Usuario = usuario.NOMBRES_USUARIO;
    const rolSelected = this.dataService.Storage().getPassportRolSelected();
    console.log("this.passport", this.passport);
    console.log("usuario =>", usuario);
    console.log("rolSelected =>", rolSelected);
  }

  buildSeguridad = () => {
    debugger   

    this.currentSession = this.dataService.Storage().getInformacionUsuario();
    
    console.log("session", this.currentSession);
  }

  buildForm(): void {
    this.form = this.formBuilder.group({      
      idTipoDocumento: [-1],
      numeroDocumentoIdentidad: [null],
      primerApellido: [null],
      segundoApellido: [null],
      nombres: [null],
      idCondicionLaboral: [-1],
      idSituacionLaboral: [-1],
      idRegimenLaboral: [-1],
      idDre: [null],
      idUgel: [null]
    });
   
  }

  ngAfterViewInit(): void {
    // throw new Error('Method not implemented.');
    this.paginator.page
      .pipe(
        tap(() => this.loadGrid())
      )
      .subscribe();
  }

  ngOnDestroy(): void {
    // throw new Error('Method not implemented.');
  }

  isAllSelected() {
    const numSelected = this.selection.selected.length;
    const numRows = this.dataSource.data.length;
    return numSelected === numRows;
  }

  masterToggle() {
    this.isAllSelected()
        ? this.selection.clear()
        : this.dataSource.data.forEach((row) => this.selection.select(row));
  }

  checkboxLabel(row): string {
    if (!row) {      
        return `${this.isAllSelected() ? "select" : "deselect"} all`;               
    }
    return `${this.selection.isSelected(row) ? "deselect" : "select"} row ${row.position + 1}`;
  }

  handleLimpiar(): void {
    // this.form.reset();
    this.form.patchValue({   
      idTipoDocumento: -1,      
      numeroDocumentoIdentidad: null,
      primerApellido: null,
      segundoApellido: null,
      nombres: null,
      idCondicionLaboral: -1,   
      idSituacionLaboral: -1,
      idRegimenLaboral: -1
    })

    this.handleBuscar();
  }

  obtenerCodigoDreUgelLogeado(): void {
    debugger;    
    const rolSelected = this.dataService.Storage().getPassportRolSelected();
    const sedeSeleccionado = rolSelected.CODIGO_SEDE;
    const request = {
      codigoEntidadSede: sedeSeleccionado
    };
    this.dataService.AccionesVinculacion().getCodigoDreUgel(request).subscribe(
      (response) => {
        console.log('obtenerCodigoDreUgelLogeado() =>', response);
        this.dataUserLoginModel = response;
        this.idUgel = response.idUgel;
        this.idDre = response.idDre;
        if (this.dataUserLoginModel == null) {
          this.dataService
            .Message()
            .msgWarning(
              '"NO SE ENCONTRÓ INFORMACIÓN PARA LOS CRITERIOS DE BÚSQUEDA INGRESADOS."',
              () => { }
            );
        } 
        else {
          this.handleBuscar();
        }
      }, 
      (error: HttpErrorResponse) => {
      }
    )
  }




  handleExportar(): void {

    this.dataService.Spinner().show("sp6");    
      
      this.dataService.PersonalHistorial().getHistorialPersonalExcel(this.formExportar).subscribe(
        (response) => {
          this.dataService.Spinner().hide("sp6");
          const fecha = moment().format('DDMMYYYY');
          descargarExcel(response, `historial ${fecha}.xlsx`);
        },
        (error: HttpErrorResponse) => {
          this.dataService.Spinner().hide("sp6")
          this.dataService.Message().msgWarning("OCURRIÓ AL REALIZAR AL EXPORTAR EL HISTORIAL PERSONAL.");
        }
      )
      
  }

  handleGrid() {

    const form = this.form.value;
    form.codigoRolPassport = this.passport.codigoRol;
    form.codigoTipoSede = this.passport.codigoTipoSede;
    form.idDre = this.idDre;
    form.idUgel = this.idUgel;

    console.log('handleBuscar()', form);

    this.loadGrid();

  }


  handleBuscar(): void {
    debugger
    const form = this.form.value;
    form.codigoRolPassport = this.passport.codigoRol;
    form.codigoTipoSede = this.passport.codigoTipoSede;
    form.idDre = this.idDre;
    form.idUgel = this.idUgel; 

    console.log('handleBuscar()', form);
    

    if(this.form.value.idTipoDocumento > 0) {
      let numeroDocumento = ''
      if( !isNull(this.form.value.numeroDocumentoIdentidad) ) {
        numeroDocumento = this.form.value.numeroDocumentoIdentidad
      }
      let validacionDocumento = criterioBusqueda.validarNumeroDocumento(this.form.value.idTipoDocumento, numeroDocumento);
      if (!validacionDocumento.esValido) {
          this.dataService.Message().msgWarning(validacionDocumento.mensaje);
          return;
      }
    }


    this.loadGrid();

    this.formExportar = {
      idTipoDocumento: this.form.value.idTipoDocumento,
      numeroDocumentoIdentidad: this.form.value.numeroDocumentoIdentidad,
      primerApellido: this.form.value.primerApellido,
      segundoApellido: this.form.value.segundoApellido,
      nombres: this.form.value.nombres,
      idCondicionLaboral: this.form.value.idCondicionLaboral,
      idSituacionLaboral: this.form.value.idSituacionLaboral,
      idRegimenLaboral: this.form.value.idRegimenLaboral,
      idDre: this.idDre,
      idUgel: this.idUgel
    }

  }

  loadGrid(){    
    this.dataSource.load(this.form.value, (this.paginator.pageIndex + 1), this.paginator.pageSize);
  }

  loadCombos = () => {
    this.loadTipoDocumento();
    this.loadCondicionLaboral();
    this.loadSituacionLaboral();
    this.loadRegimenLaboral();
  }  

  loadTipoDocumento = () => {
    let request = {
      codigoCatalogo: 6,
      Inactivo: false
    }
    this.dataService.PersonalHistorial().getCatalogoItem(request).subscribe(
      (response) => {
        this.comboLists.listTipoDocumento = response;
        this.comboLists.listTipoDocumento.unshift({
          id_catalogo_item: -1,
          descripcion_catalogo_item: '--TODOS--'
        })
      },
      (error: HttpErrorResponse) => {
        console.log(error);
      }
    )
  }

  loadCondicionLaboral = () => {
    let request = {
      codigoCatalogo: 13
    }
    this.dataService.PersonalHistorial().getCatalogoItem(request).subscribe(
      (response) => {
        this.comboLists.listCondicionLaboral = response;
        this.comboLists.listCondicionLaboral.unshift({
          id_catalogo_item: -1,
          descripcion_catalogo_item: '--TODOS--'
        })
      },
      (error: HttpErrorResponse) => {
        console.log(error);
      }
    )
  }

  loadSituacionLaboral = () => {
    let request = {
      codigoCatalogo: 11
    }
    this.dataService.PersonalHistorial().getCatalogoItem(request).subscribe(
      (response) => {
        this.comboLists.listSituacionLaboral = response;
        this.comboLists.listSituacionLaboral.unshift({
          id_catalogo_item: -1,
          descripcion_catalogo_item: '--TODOS--'
        })
      },
      (error: HttpErrorResponse) => {
        console.log(error);
      }
    )
  }

  loadRegimenLaboral = () => {
    
    let request = {
      codigoRol: this.currentSession.codigoRol
    }
    this.dataService.PersonalHistorial().getComboRegimenLaboral(request).subscribe(
      (response) => {
        this.comboLists.listRegimenLaboral = response;
        this.comboLists.listRegimenLaboral.unshift({
          idRegimenLaboral: -1,
          abreviaturaRegimenLaboral: '--TODOS--'
        })
      },
      (error: HttpErrorResponse) => {
        console.log(error);
      }
    )
  }
 


  onChangeTipoDocumento() {
    const idTipoDocumento = this.form.get('idTipoDocumento').value;
    if (idTipoDocumento == -1) {
      this.form.patchValue({
        numeroDocumentoIdentidad: ''
      });
    }
  }


  onKeyPressNumeroDocumento(e: any): boolean {
    let _idTipoDocumento  = this.form.get('idTipoDocumento').value;
    let tipoDocumentoSelect = this.comboLists.listTipoDocumento.find(m => m.id_catalogo_item == _idTipoDocumento);
    if (tipoDocumentoSelect.codigo_catalogo_item == 1) {
      //------------ DNI
      const reg = /^\d+$/;
      const pressedKey = String.fromCharCode(!e.charCode ? e.which : e.charCode);
      if (!reg.test(pressedKey)) {
        e.preventDefault();
        return false;
      }  
    } else {
      //------------ PASAPORTE O CARNET DE EXTRANJERIA
      var inp = String.fromCharCode(e.keyCode);

      if (/[a-zA-Z0-9]/.test(inp)) {
        return true;
      } else {
        e.preventDefault();
        return false;
      }
    }
    
  }

  onChangeMinMaxDate() {

    this.form.patchValue({
      fechaInicio: null,
      fechaTermino: null
    })
    const anio = new Date(this.form.get('anioDt').value).getFullYear();
    this.minDate = new Date(anio, 0, 1);
    this.untilDate = new Date(anio, 11, 31);
    this.untilDateFin = new Date(anio, 11, 31);
  }

  handleEnviarConsolidado(row) {
    this.router.navigate(['ayni/personal/historialpersonal/consolidado/' + row.id_servidor_publico  ]) 
  }

}


export class HistorialPersonalDataSource extends DataSource<any>{

  private _dataChange = new BehaviorSubject<any>([]);
  private _loadingChange = new BehaviorSubject<boolean>(false);
  private _totalRows = 0;

  public loading = this._loadingChange.asObservable();

  constructor(private dataService: DataService) {
    super();
  }

  load(data: any, pageIndex: number, pageSize: number) {
    debugger
    console.log('data pagination', data);
    data.anio= new Date(data.anioDt).getFullYear();
    data.paginaActual = pageIndex;
    data.tamanioPagina = pageSize;

    this._loadingChange.next(true);
    this.dataService.PersonalHistorial().getPersonaHistorialPaginado(data).pipe(
      catchError(() => of([])),
      finalize(() => this._loadingChange.next(false))
    ).subscribe((response: any) => {
      if (response) {
        console.log('response is true'); 
        this._totalRows = (response[0] || [{ total: 0 }]).total;
        this._dataChange.next(response || []);

        if ((response || []).length === 0) {
            this.dataService.Message().msgWarning(MESSAGE_GESTION.M09);
        }

      } else {
        console.log('response is false');
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