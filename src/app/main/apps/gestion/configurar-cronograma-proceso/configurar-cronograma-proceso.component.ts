import { Component, OnInit, ViewEncapsulation, ViewChild, AfterViewInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormGroup } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { DataService } from 'app/core/data/data.service';
import { mineduAnimations } from '@minedu/animations/animations';
import { SelectionModel, DataSource, CollectionViewer } from '@angular/cdk/collections';
import { MatPaginator } from '@angular/material/paginator';
import { BehaviorSubject, of, Observable, forkJoin } from 'rxjs';
import { catchError, finalize, tap } from 'rxjs/operators';
import { CentroTrabajoModel } from 'app/core/model/centro-trabajo.model';
import { TablaEquivalenciaSede, TablaRolPassport } from 'app/core/model/types';
import { ModalRegistrarVigenciaComponent } from './modal-registrar-vigencia/modal-registrar-vigencia.component';
import { SecurityModel } from 'app/core/model/security/security.model';
import { descargarExcel } from 'app/core/utility/functions';
import { HttpErrorResponse } from '@angular/common/http';
import { ModalCulminarPublicarEtapasComponent } from './modal-culminar-publicar-etapas/modal-culminar-publicar-etapas.component';
import { ModalCronogramasGeneradosComponent } from './modal-cronogramas-generados/modal-cronogramas-generados.component';
import * as moment from 'moment';
import { MESSAGE_GESTION } from '../_utils/messages';
import { CodigoCatalogo, CodigoEstadoCronograma, CodigoTipoCronograma, TipoCronograma } from '../_utils/types-gestion';
import { ModalSustentarModificacionCronograma } from './modal-sustento-modificacion/modal-sustentar-modificacion.component';

@Component({
  selector: 'minedu-configurar-cronograma-proceso',
  templateUrl: './configurar-cronograma-proceso.component.html',
  styleUrls: ['./configurar-cronograma-proceso.component.scss'],
  encapsulation: ViewEncapsulation.None,
  animations: mineduAnimations
})
export class ConfigurarCronogramaProcesoComponent implements OnInit, AfterViewInit {

  form: FormGroup;
  export: boolean = false;
  working: boolean = false;
  fechaActual = new Date(new Date().setHours(0, 0, 0, 0));
  permisoAccion: any = {
    accesoMigrarCronograma: false,
    accesoPublicarCronograma: false,
    accesoAprobarCronograma: false,
    accesoGenerarProyectoCronograma: false,
    permisoCrearActividad: false
  };

  permisoCronograma: any ;
  cabeceraProceso: any;
  
  private passport: SecurityModel = new SecurityModel();

  centroTrabajo: CentroTrabajoModel = null;
  haypublicados= false;
  combo = {
    instancias: [],
    subInstancias: [],
    centrosTrabajo: []
  }
  etapas: [];
  estadosCronograma: [];

  filtro = {
    instancia: false,
    subInstancia: false,
    centroTrabajo: false
  }
  codEstadoCronograma = CodigoEstadoCronograma;
  codTipoCronograma = CodigoTipoCronograma;
  tipoCronograma: String;
  esNacional = false;

  displayedColumns: string[] = [
    'registro',
    'instanciaSubInstancia',
    'centroTrabajo',
    'etapa',
    'actividad',
    'fechaInicioNacional',
    'fechaFinNacional',
    'duracionMinimaNacional',
    'duracionMaximaNacional',
    'fechaInicioActividad',
    'fechaFinActividad',
    'estado',
    'opciones'
  ];
  dialogRef: any;

  dataSource: CronogramasDataSource | null;
  selection = new SelectionModel<any>(false, []);
  @ViewChild(MatPaginator, { static: true })
  paginator: MatPaginator;

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
    this.defaultCombo();
  }

  ngAfterViewInit() {
    this.paginator.page
      .pipe(
        tap(() => this.handleGrid())
      )
      .subscribe();
  }

  buildForm() {
    this.form = this.formBuilder.group({
      codigoInstancia: [null],
      idSubInstancia: [null],
      idCentroTrabajo: [null],
      idEtapa: [null],
      idEstadoCronograma: [null]
    });

    this.form.get("codigoInstancia").valueChanges.subscribe(value => {
      this.combo.subInstancias = [];
      this.form.patchValue({ idSubInstancia: "-1" });
      if (value && value !== "-1") {
        this.comboSubInstancias(value);
      }
    });

    this.form.get("idSubInstancia").valueChanges.subscribe(value => {
      this.combo.centrosTrabajo = [];
      this.form.patchValue({ idCentroTrabajo: "-1" });
      if (value !== "-1") {
        this.comboCentrosTrabajo(value);
      }
    });
    
    this.form.get("idEtapa").valueChanges.subscribe(value => {
      this.paginator.pageIndex = 0;
    });

    this.form.get("idEstadoCronograma").valueChanges.subscribe(value => {
      this.paginator.pageIndex = 0;
    });
  }

  getCombosYCabecera() {
    forkJoin(
      [
        this.dataService.GestionProcesos().getEtapasLista(this.cabeceraProceso.idProceso),
        this.dataService.GestionProcesos().getCatalogoItemXCodigoCatalogo(CodigoCatalogo.EstadosCronograma)
      ]
    ).pipe(
      catchError((error: HttpErrorResponse) => {
        this.dataService.Message().msgWarning(error.error.messages[0]); return of(null);
      }),
      finalize(() => { this.dataService.Spinner().hide("sp6"); })
    ).subscribe(response => {
      this.etapas = response[0];
      this.estadosCronograma = response[1];      
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
    this.dataSource = new CronogramasDataSource(this.dataService);
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

  defaultCombo() {
    this.form.patchValue({ codigoInstancia: "-1", idSubInstancia: "-1", idCentroTrabajo: "-1", idEtapa: "-1", idEstadoCronograma: "-1" });
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
      codigoTipoSede: this.passport.codigoTipoSede,
      idOtraInstancia: this.centroTrabajo.idOtraInstancia,
      idInstancia: this.centroTrabajo.idDre,
      idSubInstancia: this.centroTrabajo.idUgel,
      idInstitucionEducativa: this.centroTrabajo.idInstitucionEducativa,
      usuarioCreacion: this.passport.numeroDocumento
    };
    
    this.dataService.GestionProcesos().obtenerPermisoCronograma(dAcceso).pipe(
      catchError((error: HttpErrorResponse) => {
        this.dataService.Message().msgWarning(error.error.messages[0], () => { this.handleRegresar(); }); return of(null);
      }),
    ).subscribe((response: any) => {
      if (response) {
        this.permisoCronograma = response;  
        this.organizarColumnas();
        this.handleGrid(true);
      }
    });
  }

  organizarColumnas() {
    if (this.permisoCronograma.codigoTipoCronograma == CodigoTipoCronograma.Nacional){          
      this.esNacional = true;
      this.tipoCronograma = TipoCronograma.Nacional;
      this.displayedColumns = this.displayedColumns.filter(x => x != 'fechaInicioActividad');
      this.displayedColumns = this.displayedColumns.filter(x => x != 'fechaFinActividad');

      if (this.permisoCronograma.maximaDuracion){
        this.displayedColumns = this.displayedColumns.filter(x => x != 'fechaInicioNacional');
        this.displayedColumns = this.displayedColumns.filter(x => x != 'fechaFinNacional');

      } else if (this.permisoCronograma.registroVigencia){
        this.displayedColumns = this.displayedColumns.filter(x => x != 'duracionMinimaNacional');
        this.displayedColumns = this.displayedColumns.filter(x => x != 'duracionMaximaNacional');
      }
    }        
    else if (this.permisoCronograma.codigoTipoCronograma == CodigoTipoCronograma.Regional)
      this.tipoCronograma = TipoCronograma.Regional;

    else if (this.permisoCronograma.codigoTipoCronograma == CodigoTipoCronograma.Local)
      this.tipoCronograma = TipoCronograma.Local;    
    
    this.dataSource.connect(null).subscribe((response: any) => {
      if (!this.esNacional && response.length > 0) {
        if (response.some(x => x.duracionMinimaNacional && x.duracionMaximaNacional)) {
          this.displayedColumns = this.displayedColumns.filter(x => x != 'fechaInicioNacional');
          this.displayedColumns = this.displayedColumns.filter(x => x != 'fechaFinNacional');
        } else {
          this.displayedColumns = this.displayedColumns.filter(x => x != 'duracionMinimaNacional');
          this.displayedColumns = this.displayedColumns.filter(x => x != 'duracionMaximaNacional');
        }
      }
    });

    if(this.permisoCronograma?.filtroCentroTrabajo === true) {
      this.filtro = {
        instancia: true,
        subInstancia: true,
        centroTrabajo: true
      }
      this.comboInstancias();
    }
  }

  comboInstancias() {
    this.combo.instancias = [];
    if (!this.centroTrabajo) return;

    this.dataService.GestionProcesos().getInstancias(this.centroTrabajo.idDre).pipe(
      catchError((error: HttpErrorResponse) => {
        this.dataService.Message().msgWarning(error.error.messages[0]); return of(null);
      }),
    ).subscribe(response => {
      if (response) {
        this.combo.instancias = response;
        if (response.length == 1)
          this.form.patchValue({ codigoInstancia: response[0].codigoInstancia });
      }
    });
  }

  comboSubInstancias(codigoInstancia: any) {
    const instancia = this.combo.instancias.find(r => r.codigoInstancia === codigoInstancia);
    this.dataService.GestionProcesos().getSubInstancias(this.cabeceraProceso.idProceso, instancia.idInstancia).pipe(
      catchError((error: HttpErrorResponse) => {
        this.dataService.Message().msgWarning(error.error.messages[0]); return of(null);
      }),
    ).subscribe((response: any) => {
      if (response) {
        this.combo.subInstancias = response;
        if (response.length == 1)
          this.form.patchValue({ idSubInstancia: response[0].idSubInstancia });
      }
    });
  }
  
  comboCentrosTrabajo(idSubInstancia: any) {
    this.dataService.GestionProcesos().getCentrosTrabajo(this.cabeceraProceso.idProceso, this.centroTrabajo.idDre, idSubInstancia).pipe(
      catchError((error: HttpErrorResponse) => {
        this.dataService.Message().msgWarning(error.error.messages[0]); return of(null);
      }),
    ).subscribe((response: any) => {
      if (response) {
        this.combo.centrosTrabajo = response;
        if (response.length == 1)
          this.form.patchValue({ idCentroTrabajo: response[0].idCentroTrabajo });
      }
    });
  }
  
  handleGrid(autoSearch: boolean = false) {
    const form = this.form.value;
    if ((form.idEtapa && parseInt(form.idEtapa) > 0) ||
      form.codigoInstancia ||
      (form.idSubInstancia && parseInt(form.idSubInstancia) > 0) ||
      (form.idEstadoCronograma && parseInt(form.idEstadoCronograma) > 0)) {
      const d = {
        idProceso: this.cabeceraProceso.idProceso,
        idEtapa: form.idEtapa === '-1' ? null : form.idEtapa,
        idEstadoCronograma: form.idEstadoCronograma  === '-1' ? null : form.idEstadoCronograma,
        codigoTipoCronograma: this.permisoCronograma.codigoTipoCronograma,
        idOtraInstancia: this.centroTrabajo.idOtraInstancia,
        idInstancia: this.centroTrabajo.idDre,
        idSubInstancia: form.idSubInstancia !== "-1" ? form.idSubInstancia : this.centroTrabajo.idUgel,
        idCentroTrabajo: form.idCentroTrabajo !== "-1" ? form.idCentroTrabajo : 0,
        idInstitucionEducativa: this.centroTrabajo.idInstitucionEducativa,
        codigoRolPassport: this.passport.codigoRol,
        paginaActual: (this.paginator.pageIndex + 1),
        tamanioPagina: this.paginator.pageSize
      };
      this.dataSource.load(d, autoSearch);
    } else {
      this.dataService.Message().msgWarning(MESSAGE_GESTION.M01, () => { });
    }
  }

  permiteRegistrarVigencia(row) {
    const accesoEtapa = this.permisoCronograma.accesoEtapasProceso.find(x => x.idEtapa === row.idEtapa);

    if (!accesoEtapa.registrarFecha || !row.accesoRegistrarVigencia) return false;
    if (!this.esNacional && row.esResponsableSistema) return false;    
    return true;
  }

  permiteModificarVigencia(row) {
    const accesoEtapa = this.permisoCronograma.accesoEtapasProceso.find(x => x.idEtapa === row.idEtapa);

    if (row.codigoEstadoCronograma !== CodigoEstadoCronograma.Publicado) return false;
    if (!accesoEtapa.registrarFecha || !row.accesoModificarVigencia) return false;
    if (!this.esNacional && row.esResponsableSistema) return false;

    if (this.esNacional && this.permisoCronograma.registroVigencia &&
        new Date(row.fechaInicioNacional) < this.fechaActual && 
        new Date(row.fechaFinNacional)    < this.fechaActual ) return false;

    if (!this.esNacional && 
        new Date(row.fechaInicioActividad) < this.fechaActual && 
        new Date(row.fechaFinActividad)    < this.fechaActual ) return false;

    return true;
  }
 
  handleSustentoModificacion(row: any) {
    this.dialogRef = this.materialDialog.open(ModalSustentarModificacionCronograma, {
      panelClass: 'modal-sustentar-modificacion-form-dialog',
      disableClose: true,
      data: {
        modal: {
          icon: "info",
          title: "Sustento de modificación del cronograma",
          action: "info",
        },
        registro: row
      }
    });
  }

  handleLimpiar() {
    this.defaultCombo();    
    this.handleGrid(true);
  }

  handleBuscar() {
    this.handleGrid();
  }

  handleRegistrarVigencia(row) {
    this.dialogRef = this.materialDialog.open(ModalRegistrarVigenciaComponent, {
      panelClass: 'modal-registrar-vigencia-form-dialog',
      disableClose: true,
      width: this.permisoCronograma.maximaDuracion && !row.esResponsableSistema ? '500px' : '700px',
      data: {
        modal: {
          icon: "insert_invitation",
          title: "Registrar Vigencia " + this.tipoCronograma,
          action: "registrar",
          tipoCronograma: this.tipoCronograma
        },
        passport: this.passport,
        permisoCronograma: this.permisoCronograma,
        anioProceso: this.cabeceraProceso.anio,
        cronograma: row
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
  
  handleModificarVigencia(row) {
    this.dialogRef = this.materialDialog.open(ModalRegistrarVigenciaComponent, {
      panelClass: 'modal-registrar-vigencia-form-dialog',
      disableClose: true,
      width: this.permisoCronograma.maximaDuracion && !row.esResponsableSistema ? '500px' : '700px',
      data: {
        modal: {
          icon: "insert_invitation",
          title: "Modificar Vigencia " + this.tipoCronograma,
          action: "modificar",
          tipoCronograma: this.tipoCronograma
        },
        passport: this.passport,
        permisoCronograma: this.permisoCronograma,
        anioProceso: this.cabeceraProceso.anio,
        cronograma: row
      }
    });

    this.dialogRef.afterClosed()
      .subscribe((response: any) => {
        if (!response) {
          return;
        }
        if (response.reload) {
          this.instaurarPermiso();
        }
      });
  }

  handleVerInformacion(row) {
    this.dialogRef = this.materialDialog.open(ModalRegistrarVigenciaComponent, {
      panelClass: 'modal-registrar-vigencia-form-dialog',
      disableClose: true,
      width: this.permisoCronograma.maximaDuracion && !row.esResponsableSistema ? '500px' : '700px',
      data: {
        modal: {
          icon: "info",
          title: "Información Completa",
          action: "info",
          tipoCronograma: this.tipoCronograma,
          idCentroTrabajo: this.centroTrabajo?.idCentroTrabajo ?? 1
        },
        passport: this.passport,
        permisoCronograma: this.permisoCronograma,
        cronograma: row
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

  btnExportar() {
    
    const form = this.form.value;
    if ((form.idEtapa && parseInt(form.idEtapa) > 0) ||
      form.codigoInstancia ||
      (form.idSubInstancia && parseInt(form.idSubInstancia) > 0) ||
      (form.idEstadoCronograma && parseInt(form.idEstadoCronograma) > 0)) {
      const d = {
        idProceso: this.cabeceraProceso.idProceso,
        idEtapa: form.idEtapa === '-1' ? null : form.idEtapa,
        idEstadoCronograma: form.idEstadoCronograma  === '-1' ? null : form.idEstadoCronograma,
        codigoTipoCronograma: this.permisoCronograma.codigoTipoCronograma,
        idOtraInstancia: this.centroTrabajo.idOtraInstancia,
        idInstancia: this.centroTrabajo.idDre,
        idSubInstancia: this.centroTrabajo.idUgel,
        idInstitucionEducativa: this.centroTrabajo.idInstitucionEducativa,
        codigoRolPassport: this.passport.codigoRol
      };

      this.dataService.Spinner().show("sp6");
      this.dataService.GestionProcesos().exportarCronograma(d).pipe(
        catchError((error: HttpErrorResponse) => {
          this.dataService.Message().msgWarning(error.error.messages[0]); return of(null);
        }),
        finalize(() => { this.dataService.Spinner().hide("sp6"); })
      ).subscribe((response: any) => {
        if (response) {
          const tipo = this.cabeceraProceso.descripcionTipoProceso;
          const codigo = this.cabeceraProceso.codigoProceso;
          const fecha = moment().format('DDMMYYYY');
          let fileName: string;
          if (this.permisoCronograma.codigoTipoCronograma === CodigoTipoCronograma.Nacional)
            fileName = `ACTIVIDADES DEL PROCESO ${tipo} ${codigo} ${fecha}`;
          else
            fileName = `Actividades Cronograma ${this.tipoCronograma} ${fecha}`;

          descargarExcel(response, `${fileName}.xlsx`);
        }
      });
    } else {
      this.dataService.Message().msgWarning(MESSAGE_GESTION.M01, () => { });
    }
  }

  btnPublicar() {
    this.dialogRef = this.materialDialog.open(ModalCulminarPublicarEtapasComponent, {
      panelClass: 'modal-culminar-publicar-etapas-form-dialog',
      disableClose: true,
      data: {
        modal: {
          icon: "save",
          title: "Publicar el cronograma",
          origin: "publicar",
          action: "save",
          disabled: true
        },
        passport: this.passport,
        permisoCronograma: this.permisoCronograma,
        cabeceraProceso: this.cabeceraProceso,
        centroTrabajo: this.centroTrabajo
      }
    });

    this.dialogRef.afterClosed()
      .subscribe((response: any) => {
        if (!response) {
          return;
        }
        if (response.reload) {
          this.instaurarPermiso();
        }
      });
  }

  btnCulminar() {
    this.dialogRef = this.materialDialog.open(ModalCulminarPublicarEtapasComponent, {
      panelClass: 'modal-culminar-publicar-etapas-form-dialog',
      disableClose: true,
      data: {
        modal: {
          icon: "save",
          title: "Culminar el cronograma",
          origin: "culminar",
          action: "save",
          disabled: true
        },
        passport: this.passport,
        permisoCronograma: this.permisoCronograma,
        cabeceraProceso: this.cabeceraProceso,
        centroTrabajo: this.centroTrabajo
      }
    });

    this.dialogRef.afterClosed()
      .subscribe((response: any) => {
        if (!response) {
          return;
        }
        if (response.reload) {
          this.instaurarPermiso();
        }
      });
  }
  
  btnGenerarProyectoResolucion() {
    this.dialogRef = this.materialDialog.open(ModalCulminarPublicarEtapasComponent, {
      panelClass: 'modal-culminar-publicar-etapas-form-dialog',
      disableClose: true,
      data: {
        modal: {
          icon: "save",
          title: "Generar proyecto",
          origin: "proyecto",
          action: "save",
        },
        passport: this.passport,
        permisoCronograma: this.permisoCronograma,
        cabeceraProceso: this.cabeceraProceso,
        centroTrabajo: this.centroTrabajo
      }
    });

    this.dialogRef.afterClosed()
      .subscribe((response: any) => {
        if (!response) {
          return;
        }
        if (response.reload) {
          this.instaurarPermiso();
        }
      });
  }

  btnVerProyectos() {
    this.dialogRef = this.materialDialog.open(ModalCronogramasGeneradosComponent, {
      panelClass: 'modal-cronogramas-generados-dialog',
      disableClose: true,
      width: '500px',
      data: {
        modal: {
          icon: "info",
          title: "Proyecto de Resolución generados",
          origin: "proyecto",
        },
        permisoCronograma: this.permisoCronograma,
        cabeceraProceso: this.cabeceraProceso,
        centroTrabajo: this.centroTrabajo
      }
    });

    this.dialogRef.afterClosed()
      .subscribe((response: any) => {

      });
  }

  btnVerCronogramas() {
    this.dialogRef = this.materialDialog.open(ModalCronogramasGeneradosComponent, {
      panelClass: 'modal-cronogramas-generados-dialog',
      disableClose: true,
      width: '500px',
      data: {
        modal: {
          icon: "info",
          title: "Cronogramas publicados",
          origin: "publicacion",
        },
        permisoCronograma: this.permisoCronograma,
        cabeceraProceso: this.cabeceraProceso,
        centroTrabajo: this.centroTrabajo
      }
    });

    this.dialogRef.afterClosed()
      .subscribe((response: any) => {

      });
  }

  btnModificar() {
    this.dialogRef = this.materialDialog.open(ModalCulminarPublicarEtapasComponent, {
      panelClass: 'modal-culminar-publicar-etapas-form-dialog',
      disableClose: true,
      data: {
        modal: {
          icon: "save",
          title: "Modificar el cronograma",
          origin: "modificar",
          action: "save",
        },
        passport: this.passport,
        permisoCronograma: this.permisoCronograma,
        cabeceraProceso: this.cabeceraProceso,
        centroTrabajo: this.centroTrabajo
      }
    });

    this.dialogRef.afterClosed()
      .subscribe((response: any) => {
        if (!response) {
          return;
        }
        if (response.reload) {
          this.instaurarPermiso();
        }
      });
  }

  handleRegresar() {
    this.router.navigate(['../../'], { relativeTo: this.route });
  }
}

export class CronogramasDataSource extends DataSource<any>{

  private _dataChange = new BehaviorSubject<any>([]);
  private _totalRows = 0;
  private _loadingChange = new BehaviorSubject<boolean>(false);

  public loading = this._loadingChange.asObservable();

  constructor(private dataService: DataService) {
    super();
  }

  load(data: any, autoSearch: boolean = false) {
    this._loadingChange.next(true);
    this.dataService.Spinner().show("sp6");

    this.dataService.GestionProcesos().obtenerCronogramas(data).pipe(
      catchError((error: HttpErrorResponse) => {
        if (!autoSearch)
          this.dataService.Message().msgWarning(error.error.messages[0]); return of(null);
      }),
      finalize(() => { this._loadingChange.next(false); this.dataService.Spinner().hide("sp6"); })
    ).subscribe((response: any) => {
      if (response && (response || []).length > 0) {
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

