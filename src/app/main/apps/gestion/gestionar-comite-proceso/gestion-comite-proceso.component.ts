import { Component, OnInit, ViewEncapsulation, ViewChild, AfterViewInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { DataService } from 'app/core/data/data.service';
import { mineduAnimations } from '@minedu/animations/animations';
import { SelectionModel, DataSource, CollectionViewer } from '@angular/cdk/collections';
import { MatPaginator } from '@angular/material/paginator';
import { BehaviorSubject, of, Observable, forkJoin } from 'rxjs';
import { catchError, finalize, tap } from 'rxjs/operators'; 
import { ModalComiteComponent } from './modal-comite/modal-comite.component';
import { CentroTrabajoModel } from 'app/core/model/centro-trabajo.model';
import { TablaEquivalenciaSede, TablaRolPassport } from 'app/core/model/types';
import { FormGroup, FormBuilder } from '@angular/forms';
import { SecurityModel } from 'app/core/model/security/security.model';
import { descargarExcel } from 'app/core/utility/functions';
import * as moment from 'moment';
import { HttpErrorResponse } from '@angular/common/http';
import { ModalComitesGeneradosComponent } from './modal-comites-generados/modal-comites-generados.component';
import { ModalProyectoResolucionComponent } from './modal-proyecto-resolucion/modal-proyecto-resolucion.component';
import { MESSAGE_GESTION } from '../_utils/messages';
import { ModalSustentarModificacionComite } from './modal-sustento-modificacion/modal-sustentar-modificacion.component';
import { CodigoEstadoComite } from '../_utils/types-gestion';

@Component({
  selector: 'minedu-gestion-comite-proceso',
  templateUrl: './gestion-comite-proceso.component.html',
  styleUrls: ['./gestion-comite-proceso.component.scss'],
  encapsulation: ViewEncapsulation.None,
  animations: mineduAnimations
})
export class GestionarComiteProcesoComponent implements  OnInit, AfterViewInit {
  form: FormGroup;
  tiempoMensaje: number = 3000; 

  nombresComite: Array<any>;
  cargosComite: Array<any>;
  tiposMiembro: Array<any>;
  estados: Array<any>;
  codEstadoComite = CodigoEstadoComite;

  working: boolean = false;

  centroTrabajo: CentroTrabajoModel = null;
  filtroGrid: any = null;

  esProyecto: boolean = false;

  cabeceraProceso: any;

  private passport: SecurityModel = new SecurityModel();

  filtro = {
    instancia: true,
    subInstancia: true
  }
  permisoComite: any ;

  boton = {
    generarProyectos: false,
    verProyectosResolucion: false,
    nuevoMiembroComite: false,
    aprobarComite: false,
    verComite: false,
    modificarComite: false,
    modificarMiembroComite: false
  }

  displayedColumns: string[] = [
    'registro',
    'nombreComite',
    'numeroDocumentoIdentidad',
    'nombresCompletos',
    'tipoMiembroComite',
    'cargoNombreComite',
    'estadoComite',
    'acciones'
  ];

  dialogRef: any;

  dataSource: ComitesDataSource | null;
  selection = new SelectionModel<any>(false, []);
  @ViewChild(MatPaginator, { static: true })
  paginator: MatPaginator;

  combo = {
    instancias: [],
    subInstancias: [],
    nombresComite: [],
    cargosComite: [],
    estadosComite: []
  };


  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private formBuilder: FormBuilder,
    private materialDialog: MatDialog,
    private dataService: DataService) { }

  ngOnInit() {
    this.cabeceraProceso = {idProceso : parseInt(this.route.snapshot.params.proceso)};
    this.buildPassport();
    this.buildPaginators(this.paginator);
    this.buildForm();
    if (this.cabeceraProceso.idProceso > 0 ) {
      this.loadCabeceraProceso();
      this.entidadPassport();
      this.getCombosYCabecera();
    }
    this.defaultCombos();
  }

  ngAfterViewInit() {
    this.paginator.page
      .pipe(
        tap(() => this.cargarGrilla())
      )
      .subscribe();
  }

  buildForm() {
    this.form = this.formBuilder.group({
      nombreComite: [null],
      cargoComite: [null],
      tipoMiembro: [null],
      estadoComite: [null]
    });
  }

  getCombosYCabecera() {
    forkJoin(
      [
        this.dataService.GestionProcesos().getComboDescripcionNombresComite(this.cabeceraProceso.idProceso, true),
        this.dataService.GestionProcesos().getComboDescripcionCargosNombreComite(this.cabeceraProceso.idProceso, true),
        this.dataService.GestionProcesos().getComboDescripcionTiposMiembrosComite(this.cabeceraProceso.idProceso, true),
        this.dataService.GestionProcesos().getComboEstadosComite()
      ]
    ).pipe(
      catchError(() => { return of(null); }),
      finalize(() => { this.dataService.Spinner().hide("sp6"); })
    ).subscribe(response => {

      this.nombresComite = response[0];
      this.cargosComite = response[1];
      this.tiposMiembro = response[2];
      this.estados = response[3];
    })

  }

  loadCabeceraProceso() {
    this.dataService.GestionProcesos().getCabeceraProceso(this.cabeceraProceso.idProceso)
      .pipe(
        catchError(() => { return of(null); }),
      ).subscribe(response => {
        if (response) {
          this.cabeceraProceso = response;
        }
      });
  }

  evaluarBotonesPagina() {
    this.boton.generarProyectos = this.permisoComite.generarProyecto && this.permisoComite.comiteAprobado;

    this.boton.nuevoMiembroComite = this.permisoComite.nuevoMiembro && !this.permisoComite.comiteAprobado;
    this.boton.aprobarComite = this.permisoComite.aprobarComite && !this.permisoComite.comiteAprobado;
    this.boton.verComite = this.permisoComite.comiteAprobado;
    this.boton.modificarComite = this.permisoComite.modificarComite && this.permisoComite.comiteAprobado;
  }


  buildPassport() {
    this.passport = this.dataService.Storage().getInformacionUsuario();
    
    if (this.passport.codigoTipoSede === TablaEquivalenciaSede.CODIGO_TIPO_SEDE)
        this.passport.codigoSede = TablaEquivalenciaSede.CODIGO_SEDE;
    
    const esRolMonitor = this.passport.codigoRol === TablaRolPassport.MONITOR;
    
    if (esRolMonitor && this.passport.codigoTipoSede !== TablaEquivalenciaSede.CODIGO_TIPO_SEDE_UGEL) {
      const instancia = this.dataService.Storage().getInstanciaSelected();
      if (instancia) {
        this.passport.codigoTipoSede = instancia.codigoTipoSede;
        this.passport.codigoSede = instancia.codigoInstancia;
      } else { 
        this.dataService.Message().msgWarning(MESSAGE_GESTION.INVALID_INSTANCIA_MONITOR, 
          () => { this.handleRegresar(); }); 
      };
    }
  }
  
  buildPaginators(paginator: MatPaginator): void {
    this.dataSource = new ComitesDataSource(this.dataService);
    paginator.showFirstLastButtons = true;
    paginator._intl.itemsPerPageLabel = "Registros por página";
    paginator._intl.nextPageLabel = "Siguiente página";
    paginator._intl.previousPageLabel = "Página anterior";
    paginator._intl.firstPageLabel = "Primera página";
    paginator._intl.lastPageLabel = "Última página";
    paginator._intl.getRangeLabel = (page: number, pageSize: number, length: number) => {
        if (length === 0 || pageSize === 0) {return `0 de ${length}`;}
        const length2 = Math.max(length, 0);
        const startIndex = page * pageSize;
        const endIndex = startIndex < length2 ? Math.min(startIndex + pageSize, length2) : startIndex + pageSize;
        return `${startIndex + 1} – ${endIndex} de ${length2}`;
    }
}

  entidadPassport(){
    this.dataService.GestionProcesos().entidadPassport(this.passport.codigoSede).pipe(
      catchError((error: HttpErrorResponse) => {
        this.dataService.Message().msgWarning(error.error.messages[0]); return of(null);
      }),
    ).subscribe((response: any) => {
      if (response.length > 0){
        if (response.length > 1)
          response = response.filter(x => x.idNivelInstancia <= 3);
          
        if (response.length == 1 && response[0].idNivelInstancia == 3)
          this.passport.codigoTipoSede = TablaEquivalenciaSede.CODIGO_TIPO_SEDE_UGEL;

        this.centroTrabajo = response[0];
        this.instaurarPermiso();
      }
    });
  }

  instaurarPermiso() {
    const dAcceso = {
      idProceso: this.cabeceraProceso.idProceso, 
      codigoRolPassport: this.passport.codigoRol,
      idOtraInstancia: this.centroTrabajo.idOtraInstancia,
      idInstancia: this.centroTrabajo.idDre,
      idSubInstancia: this.centroTrabajo.idUgel,
      idInstitucionEducativa: this.centroTrabajo.idInstitucionEducativa
    };
    
    this.dataService.GestionProcesos().obtenerPermisoComite(dAcceso).pipe(
      catchError((error: HttpErrorResponse) => {
        this.dataService.Message().msgWarning(error.error.messages[0], () => { this.handleRegresar(); }); return of(null);
      }),
    ).subscribe((response: any) => {
      if (response) {
        this.permisoComite = response;  
        this.evaluarBotonesPagina();
        this.cargarGrilla(true);
      }
    });
  }

  defaultCombos() {
    this.form.patchValue({
      nombreComite: "-1",
      cargoComite: "-1",
      tipoMiembro: "-1",
      estadoComite: "-1"
    });
  }

  handleLimpiar() {
    this.defaultCombos();
    this.cargarGrilla(true);
  }

  handleBuscar() {

    this.cargarGrilla();
  }

  cargarGrilla(autoSearch: boolean = false) {
    const form = this.form.value;

    const data = {
      idProceso: this.cabeceraProceso.idProceso,
      idAlcanceProceso: this.permisoComite.idAlcanceProceso,
      nombreComite: form.nombreComite === '-1' ? null : form.nombreComite,
      cargoComite: form.cargoComite === '-1' ? null : form.cargoComite,
      tipoMiembroComite: form.tipoMiembro === '-1' ? null : form.tipoMiembro,
      idEstadoComite: form.estadoComite === '-1' ? null : form.estadoComite,
      paginaActual: (this.paginator.pageIndex + 1),
      tamanioPagina: this.paginator.pageSize

    };
    this.dataSource.load(data, (this.paginator.pageIndex + 1), this.paginator.pageSize, autoSearch);

  }

  btnCrear() {
    this.dialogRef = this.materialDialog.open(ModalComiteComponent, {
      panelClass: 'modal-comite-form-dialog',
      disableClose: true,
      data: {
        modal: {
          icon: "save",
          title: "Nuevo miembro de comité",
          action: "create",
          disabled: false
        },
        idComite: 0,
        cabeceraProceso: this.cabeceraProceso,
        permisoComite: this.permisoComite,
        registro: null
      }
    });

    this.dialogRef.afterClosed()
      .subscribe((response: any) => {
        if (!response) {
          return;
        }
        if (response.reload) {
          this.getCombosYCabecera();
          this.instaurarPermiso();
        }
      });
  }

  btnAprobarComite() {

    this.dataService.GestionProcesos().verificarCantidadTitulares(this.cabeceraProceso.idProceso, this.permisoComite.idAlcanceProceso).pipe(
      catchError((error: HttpErrorResponse) => {
        this.dataService.Message().msgWarning(error.error.messages[0], () => { }); return of(null);
      }),
    ).subscribe((Ok: any) => {
      if (Ok) {        

        let data = {
          codigoRolPassport: this.passport.codigoRol,
          idProceso: this.cabeceraProceso.idProceso,
          idAlcanceProceso: this.permisoComite.idAlcanceProceso,
          maestroProceso: this.cabeceraProceso.descripcionMaestroProceso,
          anio: this.cabeceraProceso.anio,
          sedeUsuario: this.passport.nombreSede,
          usuarioCreacion: this.passport.numeroDocumento
        };

        this.dataService.Message().msgConfirm(MESSAGE_GESTION.M103, () => {
          this.dataService.Spinner().show("sp6");
          this.working = true;
          this.dataService.GestionProcesos().updateAprobarComision(data)
            .pipe(
              catchError((error: HttpErrorResponse) => {
                this.dataService.Message().msgWarning(error.error.messages[0]); return of(null);
              }),
              finalize(() => { this.dataService.Spinner().hide("sp6"); this.working = false; })
            ).subscribe(response => {
              if (response && response > 0) {
                this.dataService.Message().msgAutoCloseSuccessNoButton(MESSAGE_GESTION.M07, this.tiempoMensaje);
                this.getCombosYCabecera();
                this.instaurarPermiso();
              }
            });
        });

      }
    });
  }

  btnVerComite() {
    this.dialogRef = this.materialDialog.open(ModalComitesGeneradosComponent, {
      panelClass: 'modal-comite-generados-dialog',
      disableClose: true,
      width: '500px',
      data: {
        modal: {
          icon: "info",
          title: "Comités aprobados",
          origin: "aprobacion",
        },
        idProceso: this.cabeceraProceso.idProceso,
        idAlcanceProceso: this.permisoComite.idAlcanceProceso
      }
    });

    this.dialogRef.afterClosed()
      .subscribe((response: any) => {

      });
  }

  btnVerProyectos() {
    this.dialogRef = this.materialDialog.open(ModalComitesGeneradosComponent, {
      panelClass: 'modal-comite-generados-dialog',
      disableClose: true,
      width: '500px',
      data: {
        modal: {
          icon: "info",
          title: "Proyecto de Resolución generados",
          origin: "proyecto",
        },
        idProceso: this.cabeceraProceso.idProceso,
        idAlcanceProceso: this.permisoComite.idAlcanceProceso
      }
    });

    this.dialogRef.afterClosed()
      .subscribe((response: any) => {

      });
  }

  btnModificar(row: any) {
    this.dialogRef = this.materialDialog.open(ModalComiteComponent, {
      panelClass: 'modal-comite-form-dialog',
      disableClose: true,
      data: {
        modal: {
          icon: "edit",
          title: "Modificar miembro de comité",
          action: "edit",
          disabled: true
        },
        idComite: row.idComite,
        cabeceraProceso: this.cabeceraProceso,
        permisoComite: this.permisoComite,
        registro: row,
        estadoComite: row.estadoComite
      }
    });

    this.dialogRef.afterClosed()
      .subscribe((response: any) => {
        if (!response) {
          return;
        }
        if (response.reload) {
          this.getCombosYCabecera();
          this.instaurarPermiso();
        }
      });
  }

  btnModificarComite() {
    this.dataService.Message().msgConfirm(MESSAGE_GESTION.CONFIRM_MODIFICAR_COMITE, () => {
      this.dataService.Spinner().show("sp6");
      this.working = true;

      var data = {
        idAlcanceProceso: this.permisoComite.idAlcanceProceso,
        usuarioCreacion: this.passport.numeroDocumento
      };

      this.dataService.GestionProcesos().updateModificarMiembros(data)
        .pipe(
          catchError((error: HttpErrorResponse) => {
            this.dataService.Message().msgWarning(error.error.messages[0]); return of(null);
          }),
          finalize(() => { this.dataService.Spinner().hide("sp6"); this.working = false; })
        ).subscribe(response => {
          if (response) {
            if (response > 0) {
              this.dataService.Message().msgAutoCloseSuccessNoButton(MESSAGE_GESTION.M07, this.tiempoMensaje);
              this.getCombosYCabecera();
              this.instaurarPermiso();
            }
            else
              this.dataService.Message().msgWarning('No se pudo realizar el registro.');
          }
        });
    });

  }

  btnExportar() {
    let form = this.form.value;

    const data = {
      idProceso: this.cabeceraProceso.idProceso,
      idAlcanceProceso: this.permisoComite.idAlcanceProceso,
      nombreComite: form.nombreComite === '-1' ? null : form.nombreComite,
      cargoComite: form.cargoComite === '-1' ? null : form.cargoComite,
      tipoMiembroComite: form.tipoMiembro === '-1' ? null : form.tipoMiembro,
      idEstadoComite: form.estadoComite === '-1' ? null : form.estadoComite

    };

    this.dataService.Spinner().show("sp6");
    this.dataService.GestionProcesos().exportarComite(data).pipe(
      catchError((error: HttpErrorResponse) => {
        this.dataService.Message().msgWarning(error.error.messages[0]); return of(null);
      }),
      finalize(() => { this.dataService.Spinner().hide("sp6"); this.working = false; })
    ).subscribe((response: any) => {
      if (response) {
        const fecha = moment().format('DD-MM-YYYY');
        descargarExcel(response, `Miembros Comité ${fecha}.xlsx`);

      } else if (response && (response.statusCode === 422 || response.statusCode === 404)) {
        this.dataService.Message().msgWarning(response.messages[0], () => { });
      } else {
        this.dataService.Message().msgWarning('Ocurrio un error inseperado en el servidor.', () => { });
      }
    });
  }


  btnGenerarProyecto() {
    this.dialogRef = this.materialDialog.open(ModalProyectoResolucionComponent, {
      panelClass: 'modal-generar-proyecto-resolucion-form-dialog',
      disableClose: true,
      width: '1000px',
      data: {
        modal: {
          icon: "description",
          title: "Generar proyecto de resolución",
          action: "proyecto",
        },
        passport: this.passport,
        proceso: this.cabeceraProceso,
        permisoComite: this.permisoComite,
        centroTrabajo: this.centroTrabajo
      }
    });

    this.dialogRef.afterClosed()
      .subscribe((response: any) => {
        if (!response) return;
        
        if (response.reload) {
          this.getCombosYCabecera();
          this.instaurarPermiso();
        }
      });

  }

  handleSustentoModificacion(row: any) {
    this.dialogRef = this.materialDialog.open(ModalSustentarModificacionComite, {
      panelClass: 'modal-sustentar-modificacion-form-dialog',
      disableClose: true,
      data: {
        modal: {
          icon: "info",
          title: "Detalle del sustento de modificación",
          action: "info",
        },
        registro: row
      }
    });
  }

  btnEliminar(row: any) {
    var data = {
      idComite: row.idComite,
      usuarioModificacion: this.passport.numeroDocumento
    }

    this.dataService.Message().msgConfirm(MESSAGE_GESTION.M05, () => {
      this.dataService.Spinner().show("sp6");
      this.working = true;
      this.dataService.GestionProcesos().deleteMiembroComite(data)
        .pipe(
          catchError((error: HttpErrorResponse) => {
            this.dataService.Message().msgWarning(error.error.messages[0]); return of(null);
          }),
          finalize(() => { this.dataService.Spinner().hide("sp6"); this.working = false; })
        ).subscribe(response => {

          if (response) {
            if (response > 0)
              this.dataService.Message().msgAutoCloseSuccessNoButton(MESSAGE_GESTION.M07, this.tiempoMensaje);
            else
              this.dataService.Message().msgWarning('No se puede eliminar el miembro del comité.');
          }

          this.getCombosYCabecera();
          this.instaurarPermiso();
        });
    });
  }

  btnInformacion(row: any) {

    this.dialogRef = this.materialDialog.open(ModalComiteComponent, {
      panelClass: 'modal-comite-form-dialog',
      disableClose: true,
      data: {
        modal: {
          icon: "info",
          title: "Información completa",
          action: "info",
          disabled: true
        },
        idComite: row.idComite,
        cabeceraProceso: this.cabeceraProceso,
        permisoComite: this.permisoComite,
        registro: row
      }
    });

    this.dialogRef.afterClosed()
      .subscribe((response: any) => {
        if (!response) {
          return;
        }
        if (response.reload) {
          this.cargarGrilla(true);
        }
      });
  }

  handleRegresar() {
    this.router.navigate(['../../'], { relativeTo: this.route });
  }

  permiteModificarMiembroComite(row) {
    if (this.permisoComite.modificarMiembroComite)
      if (row.estadoComite === 'REGISTRADO' || (row.estadoComite === 'APROBADO' && !this.permisoComite?.comiteAprobado))
        return true;
      
    return false;
  }

  permiteEliminarMiembroComite(row) {
    if (this.permisoComite.modificarMiembroComite)
      if (row.estadoComite === 'REGISTRADO')
        return true;
    
    return false
  }

  permiteVerInformacionMiembroComite(row) {
    if (row.estadoComite !== 'REGISTRADO')
      return true;
    else
      return false
  }

  permiteVerProyectoResolucion() {
    return this.permisoComite?.proyResolucionGenerado;
  }

  permiteVerModificacionSustentoMiembroComite(row) {
    return row.estadoComite === 'MODIFICADO';
  }
}

export class ComitesDataSource extends DataSource<any>{

  private _dataChange = new BehaviorSubject<any>([]);
  private _totalRows = 0;
  private _loadingChange = new BehaviorSubject<boolean>(false);

  public loading = this._loadingChange.asObservable();

  constructor(private dataService: DataService) {
    super();
  }

  load(data: any, pageIndex: number, pageSize: number, autoSearch: boolean) {
    this._loadingChange.next(true);
    this.dataService.Spinner().show("sp6");

    this.dataService.GestionProcesos().getMiembrosComite(data, pageIndex, pageSize).pipe(
      catchError((error: HttpErrorResponse) => {
        if (!autoSearch)
          this.dataService.Message().msgWarning(error.error.messages[0]); return of(null);
      }),
      finalize(() => { this._loadingChange.next(false); this.dataService.Spinner().hide("sp6"); })
    ).subscribe((response: any) => {
      if (response) {
        this._totalRows = (response[0] || [{ totalRegistro: 0 }]).totalRegistro;
        this._dataChange.next(response || []);
      } else {
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

