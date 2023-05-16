import { CollectionViewer, DataSource, SelectionModel } from '@angular/cdk/collections';
import { Component, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { ActivatedRoute, Router } from '@angular/router';
import { mineduAnimations } from '@minedu/animations/animations';
import { DataService } from 'app/core/data/data.service';
import { saveAs } from 'file-saver';
import { TablaProcesosConfiguracionAcciones } from 'app/core/model/action-buttons/action-types';
import { CentroTrabajoModel } from 'app/core/model/centro-trabajo.model';
import { CONFIGURACION_PROCESO_MESSAGE, SNACKBAR_BUTTON, PASSPORT_MESSAGE, ASISTENCIA_MESSAGE } from 'app/core/model/messages-error';
import { SecurityModel } from 'app/core/model/security/security.model';
import { buscarRolPassport, ResultadoOperacionEnum, TablaConfiguracionFuncionalidad, TablaConfiguracionSistema } from 'app/core/model/types';
import { SharedService } from 'app/core/shared/shared.service';
import { PAGE_ORIGEN } from '../_utils/constants';
// import { ModalProcesoComponent } from 'app/main/apps/procesos/configuracion/components/modal-proceso/modal-proceso.component';
import { of, BehaviorSubject, Observable } from 'rxjs';
import { catchError, finalize, tap } from 'rxjs/operators';
import { ModalIncidenciaComponent } from '../modal-incidencia-servidor/modal-incidencia-servidor.component';
import { CONTROL_RUTAS } from '../_utils/constants';
import { TipoIncidenciaEnum } from '../_utils/enum';
import { CONTROL_ASISTENCIA_MESSAGES, MESSAGE_ASISTENCIA } from '../_utils/messages';
import Swal from 'sweetalert2';
import { ModalVerInformacionServidorComponent } from '../modal-ver-informacion-servidor/modal-ver-informacion-servidor.component';
import { tipoDocumento } from '../../consolidado-aprobacion/utils/constant';
import { BuscarPersonaComponent } from '../buscar-persona/buscar-persona.component';
import { MatCheckboxChange } from '@angular/material/checkbox';


@Component({
  selector: 'minedu-registro-asistencia',
  templateUrl: './registro-asistencia.component.html',
  styleUrls: ['./registro-asistencia.component.scss'],
  encapsulation: ViewEncapsulation.None,
  animations: mineduAnimations
})
export class RegistroAsistenciaComponent implements OnInit {

  form: FormGroup;
  export: boolean = false;
  working: boolean = false;
  idControlAsistencia:number = 0;
  modificado: boolean= false; 
  maximo;
  descripcionMes:string;
  numberMes:number = 0;
  

  permisoPassport = {
    buttonCerrarAsistencia: false,
    buttonGuardarAsistencia: false,
    buttonCrearCargaMasiva: false,
    buttonEliminarCargaMasiva: false,
    buttonReporteConsolidado: false,
    buttonReporteDetallado: false,
    buttonBuscar: false,
    buttonExportar: false,
    buttonGuardarIncidencia : false
  }
  private passport: SecurityModel = new SecurityModel();
  centroTrabajo: CentroTrabajoModel = null;
  filtroGrid: any = null;
  permisoRegistrarAsistencia: boolean = false;
  selection = new SelectionModel<any>(false, []);

  combo = {
    tiposDocumentoIdentidad: [],
    regimenesLaborales: [],
    condicionesLaborales: [],
    situacionesLaborales: [],
    tiposRegistros: []  
  }
  max = new Date(new Date().setFullYear(new Date().getFullYear() + 1));


  anioMes: string = "anio-mes";
  private mes: string = "";
  private anio: number = null;

  displayedColumns: string[] = [
    'registro',
    'numeroDocumentoIdentidad',
    'apellidosNombres',
    'situacionLaboral',
    'sinIncidencias',
    'totalTardanza',
    'totalPermisoSinGoce',
    'totalPermisoConGoce',
    'totalInasistenciaInjustificada',
    'totalHuelgaParo',
    'totalLicenciaSinGoce',
    'totalLicenciaConGoce',
    'totalVacaciones',
    'acciones',
    'tipoRegistro'
  ];
  dialogRef: any;
  dataSource: RegistroAsistenciaDataSource | null;
  
  @ViewChild(MatPaginator, { static: true })
  paginator: MatPaginator;

  tardanzaEnum = TipoIncidenciaEnum.TARDANZA;
  permisoSinEnum = TipoIncidenciaEnum.PERMISO_SIN_GOCE;
  permisoConEnum = TipoIncidenciaEnum.PERMISO_CON_GOCE;
  inasistenciaEnum = TipoIncidenciaEnum.INASISTENCIA_INJUSTIFICADA;
  huelgaEnum = TipoIncidenciaEnum.HUELGA_PARO;
  licenciaSinEnum = TipoIncidenciaEnum.LICENCIA_SIN_GOCE;
  licenciaConEnum = TipoIncidenciaEnum.LICENCIA_CON_GOCE;
   datos: any;
  constructor( 
    private route: ActivatedRoute,
    private router: Router,
    private formBuilder: FormBuilder,
    private materialDialog: MatDialog,
    private sharedService: SharedService,
    private dataService: DataService) { }

  ngOnInit(): void {
    debugger
    setTimeout(_ => this.buildShared());
    const id = this.route.snapshot;
    this.idControlAsistencia =  this.route.snapshot.params['asistencia'];
    console.log(this.idControlAsistencia);
    console.log(id);
    this.buildForm();
    this.default();
    this.defaultPermisoPassport();
    this.defaultGrid();
    this.buildPassport();
    this.defaultCombos();
    this.handleCentroTrabajo();
    this.handleGridListadoCarga()
    // this.route.data.subscribe((data) => {
    //  if (data) {
    //     console.log(data);
    //      this.permisoRegistrarAsistencia = buscarRolPassport(this.passport.codigoRol);
    //     this.defaultCombos();
    //     this.handleCentroTrabajo();
    //   }
    //  });
  }
  //  this.dialogRef = this.materialDialog.open(
  //    BuscarPersonaComponent,
  //    {
  //    panelClass: 'buscar-persona-form-dialog',
  //     disableClose: true,
  //     data: {
  //        action: "busqueda",
  //      },
  //    }
  // );

  busquedaDocumento(){
    this.dialogRef = this.materialDialog.open(BuscarPersonaComponent, {
      panelClass: 'buscar-persona-form-dialog',
      disableClose: true,
      data: {
        modal: {
          icon: "create",
          title: "Devolver reportes",
          action: "busqueda",
          info: '',
          editable: true
        },
        passport: this.passport
      }
    });

    this.dialogRef.afterClosed()
      .subscribe((result: any) => {
        if (result.working) {
          this.handleGrid();
        }
      });
    
  }

  busquedaPlaza(){

  }
  defaultCombos() {
  
    this.dataService.Asistencia().getComboTiposDocumento().pipe(
      catchError(() => { this.dataService.SnackBar().msgError(ASISTENCIA_MESSAGE.REGISTRAR_ASISTENCIA_ERROR, SNACKBAR_BUTTON.CLOSE); return of(null); }),
      finalize(() => { })
    ).subscribe((response: any) => {
      if (response && response.result) {
        this.combo.tiposDocumentoIdentidad = response.data;
        console.log(response.data);
      } else {
        this.combo.tiposDocumentoIdentidad = [];
      }
      this.form.patchValue({ idTipoDocumentoIdentidad: "-1" });
    });

    this.dataService.Asistencia().getComboRegimenesLaborales().pipe(
      catchError(() => { this.dataService.SnackBar().msgError(ASISTENCIA_MESSAGE.REGISTRAR_ASISTENCIA_ERROR, SNACKBAR_BUTTON.CLOSE); return of(null); }),
      finalize(() => { })
    ).subscribe((response: any) => {
      if (response && response.result) {
        this.combo.regimenesLaborales = response.data;
      } else {
        this.combo.regimenesLaborales = [];
      }
      this.form.patchValue({ idRegimenLaboral: "-1" });
    });

    this.dataService.Asistencia().getComboCondicionLaboral().pipe(
      catchError(() => { this.dataService.SnackBar().msgError(ASISTENCIA_MESSAGE.REGISTRAR_ASISTENCIA_ERROR, SNACKBAR_BUTTON.CLOSE); return of(null); }),
      finalize(() => { })
    ).subscribe((response: any) => {
      if (response && response.result) {
        this.combo.condicionesLaborales = response.data;
      } else {
        this.combo.condicionesLaborales = [];
      }
      this.form.patchValue({ idCondicionLaboral: "-1" });
    });

    this.dataService.Asistencia().getComboSituacionLaboral().pipe(
      catchError(() => { this.dataService.SnackBar().msgError(ASISTENCIA_MESSAGE.REGISTRAR_ASISTENCIA_ERROR, SNACKBAR_BUTTON.CLOSE); return of(null); }),
      finalize(() => { })
    ).subscribe((response: any) => {
      if (response && response.result) {
        this.combo.situacionesLaborales = response.data;
      } else {
        this.combo.situacionesLaborales = [];
      }
      this.form.patchValue({ idSituacionLaboral: "-1" });
    });

    this.dataService.Asistencia().getComboTipoRegistro().pipe(
      catchError(() => { this.dataService.SnackBar().msgError(ASISTENCIA_MESSAGE.REGISTRAR_ASISTENCIA_ERROR, SNACKBAR_BUTTON.CLOSE); return of(null); }),
      finalize(() => { })
    ).subscribe((response: any) => {
      if (response && response.result) {
        this.combo.tiposRegistros = response.data;
      } else {
        this.combo.tiposRegistros = [];
      }
      this.form.patchValue({ idTipoRegistro: "-1" });
    });


  }

  ngAfterViewInit() {
    this.paginator.page
      .pipe(
        tap(() => this.handleGrid())
      )
      .subscribe();
  }
  buildShared() {
    this.sharedService.setSharedBreadcrumb("Registrar asistencia mensual");
    this.sharedService.setSharedTitle("Registrar asistencia mensual");
  }


  buildForm() {   
    this.form = this.formBuilder.group({
      idTipoDocumentoIdentidad: [null],
      numeroDocumentoIdentidad: [null],
      codigoPlaza:[null],
      idRegimenLaboral: [null],
      idCondicionLaboral: [null],
      idSituacionLaboral:[null],
      idTipoRegistro:[null]
    });  
    this.form.get('idTipoDocumentoIdentidad').valueChanges.subscribe(value => {
      if(value == tipoDocumento.DNI)   
      {
        this.validarTipoDocumentoIdentidad(value);
      }   
      if(value == tipoDocumento.CARNET_DE_EXTRANJERIA)   
      {
        this.validarCarnetExtranjeria(value);
      }   
     
    });   
  }


  buildPassport() {
    this.passport = this.dataService.Storage().getInformacionUsuario();
    console.log( this.passport);
  }

  default() {
    this.form.patchValue({ idTipoDocumentoIdentidad: "-1", idRegimenLaboral: "-1", idCondicionLaboral: "-1", idSituacionLaboral: "-1", idTipoRegistro: "-1" });
  }


  defaultPermisoPassport() {
    this.permisoPassport.buttonCerrarAsistencia = this.dataService.Storage().tienePermisoAccion(TablaProcesosConfiguracionAcciones.Modificar);
    this.permisoPassport.buttonGuardarAsistencia = this.dataService.Storage().tienePermisoAccion(TablaProcesosConfiguracionAcciones.Agregar);
    this.permisoPassport.buttonGuardarIncidencia = this.dataService.Storage().tienePermisoAccion(TablaProcesosConfiguracionAcciones.Agregar);
    this.permisoPassport.buttonCrearCargaMasiva = this.dataService.Storage().tienePermisoAccion(TablaProcesosConfiguracionAcciones.Importar);
    this.permisoPassport.buttonEliminarCargaMasiva = this.dataService.Storage().tienePermisoAccion(TablaProcesosConfiguracionAcciones.Eliminar);
    this.permisoPassport.buttonReporteConsolidado = this.dataService.Storage().tienePermisoAccion(TablaProcesosConfiguracionAcciones.Exportar);
    this.permisoPassport.buttonReporteDetallado = this.dataService.Storage().tienePermisoAccion(TablaProcesosConfiguracionAcciones.Exportar);
    this.permisoPassport.buttonExportar = this.dataService.Storage().tienePermisoAccion(TablaProcesosConfiguracionAcciones.Exportar);
    this.permisoPassport.buttonBuscar = this.dataService.Storage().tienePermisoAccion(TablaProcesosConfiguracionAcciones.Consultar);
    
  }


  defaultGrid() {
    this.dataSource = new RegistroAsistenciaDataSource(this.dataService);
    console.log('this.dataService',this.dataService)
    this.paginator.showFirstLastButtons = true;
    this.paginator._intl.itemsPerPageLabel = "Filas por tabla";
    this.paginator._intl.nextPageLabel = "Siguiente página";
    this.paginator._intl.previousPageLabel = "Página anterior";
    this.paginator._intl.firstPageLabel = "Primera página";
    this.paginator._intl.lastPageLabel = "Última página";
  }
  
  handleCentroTrabajo() {
    this.dataService.Asistencia().findCentroTrabajo(
      this.passport.codigoSede
    ).pipe(
      catchError(() => { this.dataService.SnackBar().msgError(ASISTENCIA_MESSAGE.CENTRO_TRABAJO_ERROR, SNACKBAR_BUTTON.CLOSE); return of(null); }),
    ).subscribe(response => {
      if (response && response.result) {
        this.centroTrabajo = response.data;
        console.log('centrotrabajo',this.centroTrabajo)
      } else {
        this.centroTrabajo = null;
        this.dataService.Message().msgError('Error, no se pudo obtener el centro de trabajo del usuario. Ud. no podrá realizar algunas operaciones del proceso.', () => { });
      }
    });
  }
  handleGridListadoCarga() {
    this.defaultGrid();
    const numberMes = this.validarMes();
    const anio = this.route.snapshot.queryParams.anio;
    console.log(numberMes);
    const form = this.form.value;
    console.log(form);
    
    if (
        anio > 0||
        numberMes > 0 
        )
        {
          const d = {
            idControlAsistencia : this.idControlAsistencia,
            idTipoDocumentoIdentidad: form.idTipoDocumentoIdentidad,
            numeroDocumentoIdentidad: form.numeroDocumentoIdentidad,
            codigoPlaza: form.codigoPlaza,
            idRegimenLaboral: form.idRegimenLaboral,
            idCondicionLaboral: form.idCondicionLaboral,
            idSituacionLaboral: form.idSituacionLaboral,
            idTipoRegistro: form.idTipoRegistro,            
            codigoCentroTrabajo: this.centroTrabajo?.codigoCentroTrabajo,
            numberMes: numberMes,
            anio: anio
          }
          this.filtroGrid = d;
          console.log('handleGridListadoCarga',d);
          this.dataSource.load(d,(this.paginator.pageIndex + 1), this.paginator.pageSize);
        }
        
    else{
    
      this.dataService.Message().msgWarning('Debe ingresar por lo menos un criterio de búsqueda.', () => { });
    }

  }
 
  handleGrid() {
    this.defaultGrid();
    const numberMes = this.validarMes();
    const anio = this.route.snapshot.queryParams.anio;
    console.log(numberMes);
    const form = this.form.value;
    console.log(form);
    
    if (
        form.idTipoDocumentoIdentidad && parseInt(form.idTipoDocumentoIdentidad) > 0||
        form.numeroDocumentoIdentidad || form.codigoPlaza ||
        form.idRegimenLaboral && parseInt(form.idRegimenLaboral) > 0 ||
        form.idCondicionLaboral  && parseInt(form.idCondicionLaboral) > 0||
        form.idSituacionLaboral  && parseInt(form.idSituacionLaboral) > 0||
        form.idTipoRegistro  && parseInt(form.idTipoRegistro) > 0)
        {
          const d = {
            idControlAsistencia : this.idControlAsistencia,
            idTipoDocumentoIdentidad: form.idTipoDocumentoIdentidad,
            numeroDocumentoIdentidad: form.numeroDocumentoIdentidad,
            codigoPlaza: form.codigoPlaza,
            idRegimenLaboral: form.idRegimenLaboral,
            idCondicionLaboral: form.idCondicionLaboral,
            idSituacionLaboral: form.idSituacionLaboral,
            idTipoRegistro: form.idTipoRegistro,            
            codigoCentroTrabajo: this.centroTrabajo?.codigoCentroTrabajo,
            numberMes: numberMes,
            anio: anio
          }
          this.filtroGrid = d;
          console.log(d);
          this.dataSource.load(d,(this.paginator.pageIndex + 1), this.paginator.pageSize);
        }
        
    else{
    
      this.dataService.Message().msgWarning('Debe ingresar por lo menos un criterio de búsqueda.', () => { });
    }
}

  handleLimpiar() {
    
   // this.dataSource = null;
    this.default();
  

  }
  handleBuscar(form) {

    if (!this.permisoPassport.buttonBuscar) {
      this.dataService.Message().msgWarning(PASSPORT_MESSAGE.BUTTON_UNAUTHORIZED, () => { });
      return;
    }
    this.handleGrid();
  }
  

  handleGuardar() {
    if (!this.permisoPassport.buttonGuardarAsistencia) {
      this.dataService.Message().msgWarning(PASSPORT_MESSAGE.BUTTON_UNAUTHORIZED, () => { });
      return;
    }
    if(!this.modificado)
    {
      this.dataService.Message().msgWarning('No hizo ningún cambio', () => { });
    }
    else
    {
      this.guardarAsistencia();
    }

  }

  guardarAsistencia(){    
   
    this.dataService.Message().msgConfirm(MESSAGE_ASISTENCIA.M02, () => {
      this.working = true;
      this.dataService.Spinner().show("sp6");
      this.dataService.Asistencia().saveSinIncidenciaServidor( this.dataSource.data.filter(a=>a.bloquear === true),this.passport.nombreCompleto.toUpperCase()).pipe(
          catchError((e) => of(e)),
          finalize(() => {
              this.dataService.Spinner().hide("sp6")
              this.working = false;
          })
      ).subscribe(response => {
          if (response && response.result) {
             
              this.dataService.Message().msgInfo(MESSAGE_ASISTENCIA.M07, () => {  this.handleGrid(); });
          } else if (response && response.statusCode === ResultadoOperacionEnum.NotFound) {
              this.dataService.Message().msgWarning(response.messages[0], () => { });
          } else if (response && response.statusCode === ResultadoOperacionEnum.UnprocessableEntity) {
              this.dataService.Message().msgWarning(response.messages[0], () => { });
          } else {
              this.dataService.Message().msgError('Ocurrieron algunos problemas al guardar la información.', () => { });
          }
      });
  }, () => { });

    
  }


  handleSinIncidencia(event,row){
    console.log(event);
    //this.modificado = event.source.checked;
    console.log(this.modificado);
    if(row.sinIncidencias)
    {
      console.log(row.sinIncidencias);
      row.sinIncidencias = !row.sinIncidencias;
      console.log(row.sinIncidencias);
      this.modificado = true;
    }
    else
    {
      console.log(row.sinIncidencias);
      this.modificado = true;
      this.verificarSinIncidencias(event,row);    
    }
  
  }

  handleCrear(row) {
    debugger
    if (!this.permisoPassport.buttonGuardarIncidencia) {
      this.dataService.Message().msgWarning(PASSPORT_MESSAGE.BUTTON_UNAUTHORIZED, () => { });
      return;
    }
    this.dialogRef = this.materialDialog.open(ModalIncidenciaComponent, {
      panelClass: 'modal-incidencia-dialog',
      disableClose: true,
      data: {
        modal: {
          icon: "save",
          title: "Nueva incidencia",
          action: "create",
          info: row,
          editable: true
        },
        passport: this.passport
      }
    });

    this.dialogRef.afterClosed()
      .subscribe((response: any) => {
        if (!response) {
          return;
        }
        if (response.reload) {
          this.handleGrid();
        }
      });
  }
  
  handleExportar() {
    if (!this.permisoPassport.buttonExportar) {
      this.dataService.Message().msgWarning(PASSPORT_MESSAGE.BUTTON_UNAUTHORIZED, () => { });
      return;
    }

    const numberMes = this.validarMes();
    const anio =  this.route.snapshot.queryParams.anio;
    if (this.filtroGrid) {
      this.dataService.Spinner().show("sp6");
      this.dataService.Asistencia().ExportarExcelAsistenciaServidor(this.idControlAsistencia, numberMes, anio, this.filtroGrid).pipe(
        catchError((e) => { this.dataService.SnackBar().msgError(ASISTENCIA_MESSAGE.REGISTRAR_ASISTENCIA_ERROR, SNACKBAR_BUTTON.CLOSE); return of(e); }),
        finalize(() => { this.dataService.Spinner().hide("sp6"); })
      ).subscribe((response: any) => {
        if (response) {
          saveAs(response, "Registro asistencia mensual.xlsx");
        } else if (response && (response.statusCode === 422 || response.statusCode === 404)) {
          this.dataService.Message().msgWarning(response.messages[0], () => { });
        } else {
          this.dataService.Message().msgWarning('No se encontró información para los criterios de búsqueda ingresado', () => { });
        }
      });
    } else {
      this.dataService.Message().msgWarning('Debe ingresar por lo menos un criterio de búsqueda', () => { });
      return;
    }
  }

  ngOnDestroy() {
  }

handleCargaMasiva = () => {
  debugger
  const data =  this.route.snapshot.params['asistencia'];
  const param = this.routeGenerator(data);
  console.log('datahandleCargaMasiva',data);

  this.router.navigate([param, 'cargamasiva'], {
      relativeTo: this.route  });
};


private routeGenerator = (data: any): string => {
  const param =
     
      (TablaConfiguracionSistema.PERSONAL + "").padStart(3, "0") + //4
      (TablaConfiguracionFuncionalidad.REGISTRAR_ASISTENCIA + "").padStart(4, "0") + //
      (data + "").padStart(6, "0")+
      (data + "").padStart(10, "0")+
      (data + "").padStart(10, "0");     
      console.log(param);
  return param;
};

handleEliminarMasivo=()=>{

}

eliminarAsistencia = () =>{

}

handleVerInformacion=(row)=>{
  this.dialogRef = this.materialDialog.open(ModalVerInformacionServidorComponent, {
    panelClass: 'informacion-registro-dialog',
    disableClose: true,
    data: {
      modal: {
        icon: "",
        title: "Información del servidor",
        action: "",
        info: row,
        editable: false
      },
      passport: this.passport
    }
  });

  this.dialogRef.afterClosed()
    .subscribe((response: any) => {
      if (!response) {
        return;
      }
    });
  
}

handleRetornar = () => {
  this.router.navigate(['../../'], { relativeTo: this.route });
}

ReporteDetallado = () => {
  const idControlAsistencia = this.route.snapshot.params['asistencia'];
  const param = this.route.snapshot.params['asistencia'];
  const queryParams = {
    origen: PAGE_ORIGEN.REGISTRO_ASISTENCIA,
    idControlAsistencia: idControlAsistencia,
    descripcionMes: this.route.snapshot.queryParams.descripcionMes,
    anio: this.route.snapshot.queryParams.anio,
    centroTrabajo : this.passport.nombreSede,
  }
  console.log(this.route);
   this.router.navigate([param,'detallado',], { relativeTo: this.route, queryParams });
};

handleVerReporteConsolidado = () => {
  const idControlAsistencia = this.route.snapshot.params['asistencia'];
  const param = this.route.snapshot.params['asistencia'];
  const queryParams = {
    origen: PAGE_ORIGEN.REGISTRO_ASISTENCIA,
    idControlAsistencia: idControlAsistencia,
    descripcionMes: this.route.snapshot.queryParams.descripcionMes,
    anio: this.route.snapshot.queryParams.anio,
    centroTrabajo : this.passport.nombreSede,
  }
  console.log(this.route);
   this.router.navigate([param,'consolidado',], { relativeTo: this.route, queryParams });
};

handleCerrar(){
  const data ={
    
    idControlAsistencia:  Number(this.route.snapshot.params['asistencia']),
    usuarioModificacion:this.passport.numeroDocumento
  }
  this.dataService.Message().msgConfirm(MESSAGE_ASISTENCIA.M02, () => {
    this.working = true;
    this.dataService.Spinner().show("sp6");
    this.dataService.Asistencia().CerrarAsistencia(data).pipe(
      catchError((e) => of(e)),
        finalize(() => {
            this.dataService.Spinner().hide("sp6")
            this.working = false;
        })
    ).subscribe(response => {
        if (response && response.result) {
            this.dataService.Message().msgInfo(MESSAGE_ASISTENCIA.M07, () => { this.handleGrid();});
        } else if (response && response.statusCode === ResultadoOperacionEnum.NotFound) {
            this.dataService.Message().msgWarning(response.messages[0], () => { });
        } else if (response && response.statusCode === ResultadoOperacionEnum.UnprocessableEntity) {
            this.dataService.Message().msgWarning(response.messages[0], () => { });
        } else {
            this.dataService.Message().msgError('Ocurrieron algunos problemas al guardar la información.', () => { });
        }
    });
}, (error) => { });
  
 

}

handleRegresar(){
  this.router.navigate(['../../'], { relativeTo: this.route });
}


crearIncidencia(selected: any, incidencia: any){
  debugger
  this.selection.clear();
  this.selection.toggle(selected);
  switch (incidencia) {
      case TipoIncidenciaEnum.TARDANZA:
          this.OpenTardanza(selected, TipoIncidenciaEnum.TARDANZA);
          break;
      case TipoIncidenciaEnum.PERMISO_SIN_GOCE:
          this.OpenPermisoSinGoce(selected, TipoIncidenciaEnum.PERMISO_SIN_GOCE);
          break;
      case TipoIncidenciaEnum.PERMISO_CON_GOCE:
          this.OpenPermisoConGoce(selected, TipoIncidenciaEnum.PERMISO_CON_GOCE);
          break;
      case TipoIncidenciaEnum.INASISTENCIA_INJUSTIFICADA:
          this.OpenInasistencia(selected, TipoIncidenciaEnum.INASISTENCIA_INJUSTIFICADA);
          break;
      case TipoIncidenciaEnum.HUELGA_PARO:
          this.OpenHuelga(selected, TipoIncidenciaEnum.HUELGA_PARO);
          break;
      case TipoIncidenciaEnum.LICENCIA_SIN_GOCE:
          this.OpenLicenciaSinGoce(selected, TipoIncidenciaEnum.LICENCIA_SIN_GOCE);
          break;
      case TipoIncidenciaEnum.LICENCIA_CON_GOCE:
          this.OpenLicenciaConGoce(selected, TipoIncidenciaEnum.LICENCIA_CON_GOCE);
          break;
  } 
}
    
    private OpenTardanza = (selected: any, tipo:any) => {
      debugger
      this.dialogRef = this.materialDialog.open(ModalIncidenciaComponent, {
          panelClass: ".modal-incidencia-dialog",
          disableClose: true,
          data: {
            modal: {
              icon: "info",
              title: "Registrar tardanza",
              action: "",
              info: selected,
              editable: false
            },
            passport: this.passport,
            tipo:tipo
          }
      });
      this.dialogRef.afterClosed().subscribe((result) => {
        console.log(result);
        if (result.working) {
         this.handleGrid();
        }
    });

}



    private OpenPermisoSinGoce = (selected: any, tipo:any) => {
      this.dialogRef = this.materialDialog.open(ModalIncidenciaComponent, {
        panelClass: ".modal-incidencia-dialog",
        disableClose: true,
        data: {
          modal: {
            icon: "info",
            title: "Registrar permiso sin goce",
            action: "",
            info: selected,
            editable: false
          },
          passport: this.passport,
          tipo:tipo
        }
    });
    this.dialogRef.afterClosed().subscribe((result) => {
      console.log(result);
      if (result.working) {
       this.handleGrid();
      }
  });
  };

  private OpenPermisoConGoce = (selected: any, tipo:any) => {
    this.dialogRef = this.materialDialog.open(ModalIncidenciaComponent, {
      panelClass: ".modal-incidencia-dialog",
      disableClose: true,
      data: {
        modal: {
          icon: "info",
          title: "Registrar permiso con goce",
          action: "",
          info: selected,
          editable: false
        },
        passport: this.passport,
        tipo:tipo
      }
  });

  this.dialogRef.afterClosed().subscribe((result) => {
    console.log(result);
    if (result.working) {
     this.handleGrid();
    }
    });
  };

  private OpenInasistencia = (selected: any, tipo:any) => {
    this.dialogRef = this.materialDialog.open(ModalIncidenciaComponent, {
      panelClass: ".modal-incidencia-dialog",
      disableClose: true,
      data: {
        modal: {
          icon: "info",
          title: "Registrar inasistencia injustificada",
          action: "",
          info: selected,
          editable: true
        },
        passport: this.passport,
        tipo:tipo
      }
  });
  this.dialogRef.afterClosed().subscribe((result) => {
    console.log(result);
    if (result.working) {
     this.handleGrid();
    }
  });

  };

  private OpenHuelga = (selected: any, tipo:any) => {
    this.dialogRef = this.materialDialog.open(ModalIncidenciaComponent, {
      panelClass: ".modal-incidencia-dialog",
      disableClose: true,
      data: {
        modal: {
          icon: "info",
          title: "Registrar huelga/paro",
          action: "",
          info: selected,
          editable: true
        },
        passport: this.passport,
        tipo:tipo
      }
  });
  this.dialogRef.afterClosed().subscribe((result) => {
    console.log(result);
    if (result.working) {
     this.handleGrid();
    }
  });

};

  private OpenLicenciaSinGoce = (selected: any, tipo:any) => {
    this.dialogRef = this.materialDialog.open(ModalIncidenciaComponent, {
      panelClass: ".modal-incidencia-dialog",
      disableClose: true,
      data: {
        modal: {
          icon: "info",
          title: "Registrar licencia sin goce",
          action: "",
          info: selected,
          editable: true
        },
        passport: this.passport,
        tipo:tipo
      }
  });
  this.dialogRef.afterClosed().subscribe((result) => {
    console.log(result);
    if (result.working) {
     this.handleGrid();
    }
  });

  };

  private OpenLicenciaConGoce = (selected: any, tipo:any) => {
    this.dialogRef = this.materialDialog.open(ModalIncidenciaComponent, {
          panelClass: ".modal-incidencia-dialog",
          disableClose: true,
          data: {
            modal: {
              icon: "info",
              title: "Registrar licencia con goce",
              action: "",
              info: selected,
              editable: true
            },
            passport: this.passport,
            tipo:tipo
          }
      });  
      this.dialogRef.afterClosed().subscribe((result) => {
        console.log(result);
        if (result.working) {
         this.handleGrid();
        }
       });
  };
  
  onKeyOnlyNumbers(e) {
    const idTipoDocumentoIdentidad = this.form.get("idTipoDocumentoIdentidad").value;
    let permiteIngreso = true;
    switch (idTipoDocumentoIdentidad) {
      case tipoDocumento.DNI:
        if (e.keyCode == 13 || (e.keyCode >= 48 && e.keyCode <= 57)) {
          permiteIngreso = true;
        } else {
          permiteIngreso = false;
        }
        break;
      
    }
    return permiteIngreso;
  }
  private verificarSinIncidencias ($event,row)
  {
    const statusIncidencia = row.sinIncidencias;
    if(row.horasTardanza == 0 && row.minutosTardanza == 0 &&
      row.horasPermisoSinGoce == 0 && row.minutosPermisoSinGoce == 0 &&
      row.horasPermisoConGoce == 0 && row.minutosPermisoConGoce == 0 &&
      row.totalLicenciaSinGoce == 0 && row.totalLicenciaConGoce == 0 &&
      row.totalHuelgaParo == 0 && row.totalInasistenciaInjustificada == 0)
    {
      this.modificado = true;
      row.sinIncidencias = true;
      row.bloquear = true;
    }
    else 
    {
      this.modificado = false;
      row.sinIncidencias = statusIncidencia;
      console.log(row.sinIncidencias );         
      //$event.checked = false;
      this.dataService.Message().msgWarning(MESSAGE_ASISTENCIA.M75, () => {        
      
        return;
      });      
    }       
  
  }

  private validarTipoDocumentoIdentidad = (value: number) => {
    this.maximo = 8;
    let validatorNumeroDocumento = null;
    validatorNumeroDocumento = Validators.compose([
      Validators.minLength(this.maximo),
      Validators.maxLength(this.maximo),
      Validators.pattern("^[0-9]*$"),
    ]);
    const numeroDocumentoIdentidad = this.form.get("numeroDocumentoIdentidad");
    numeroDocumentoIdentidad.setValidators(validatorNumeroDocumento);
    numeroDocumentoIdentidad.updateValueAndValidity();
    this.form.patchValue({ numeroDocumentoIdentidad: null });

  }
  private validarCarnetExtranjeria = (value: number) => {
    this.maximo = 12;
    let validatorNumeroDocumento = null;
    validatorNumeroDocumento = Validators.compose([
      Validators.minLength(this.maximo),
      Validators.maxLength(this.maximo),
      Validators.pattern("/^[A-Za-z0-9\s]+$/g"),
    ]);
    const numeroDocumentoIdentidad = this.form.get("numeroDocumentoIdentidad");
    numeroDocumentoIdentidad.setValidators(validatorNumeroDocumento);
    numeroDocumentoIdentidad.updateValueAndValidity();
    this.form.patchValue({ numeroDocumentoIdentidad: null });

  }
  validarMes(){

    this.descripcionMes = this.route.snapshot.queryParams.descripcionMes;
    this.anio = this.route.snapshot.queryParams.anio;
    switch(this.descripcionMes)
    {
      case 'ENERO':
        return 1;
        break;
      case 'FEBRERO':
        return 2;
        break;
        case 'MARZO':
          return 3;
        break;
      case 'ABRIL':
        return 4;
        break;
        case 'MAYO':
          return 5;
        break;
      case 'JUNIO':
        return 6;
        break;
        case 'JULIO':
          return 7;
        break;
      case 'AGOSTO':
        return 8;
        break;
        case 'SETIEMBRE':
        case 'SEPTIEMBRE':
          return 9;
        break;
      case 'OCTUBRE':
        return 10;
        break;
        case 'NOVIEMBRE':
          return 11;
        break;
      case 'DICIEMBRE':
        return 12;
        break;
    
    }
   }
  }

  export class RegistroAsistenciaDataSource extends DataSource<any>{
  private _dataChange = new BehaviorSubject<any>([]);
  private _totalRows = 0;
  private _loadingChange = new BehaviorSubject<boolean>(false);

  public loading = this._loadingChange.asObservable();

  constructor(private dataService: DataService) {
    super();
  }

  load(data: any, pageIndex: number, pageSize: number) {
    this._loadingChange.next(true);
    this.dataService.Spinner().show("sp6");
    this.dataService.Asistencia().getRegistroAsistencia(data, pageIndex, pageSize).pipe(
      catchError(()=>of([])),
      finalize(() => { this._loadingChange.next(false); this.dataService.Spinner().hide("sp6"); })
    ).subscribe((response: any) => {
      console.log(response);
      if (response && (response.data || []).length > 0) {
        this._totalRows = (response.data[0] || [{ totalRegistro: 0 }]).totalRegistro;
        this._dataChange.next(response.data || []);
      } else if (response && (response.statusCode === 422 || response.statusCode === 404)) {
        this._totalRows = 0;
        this._dataChange.next([]);
        this.dataService.Message().msgWarning(response.messages[0], () => { });
      } else {
        this._totalRows = 0;
        this._dataChange.next([]);
        this.dataService.Message().msgWarning('No se encontró información para los criterios de búsqueda ingresado', () => { });
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


