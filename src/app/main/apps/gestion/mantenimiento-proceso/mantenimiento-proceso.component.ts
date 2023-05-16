import { Component, OnInit, ViewEncapsulation, ViewChild, AfterViewInit, ChangeDetectionStrategy } from '@angular/core';
import { mineduAnimations } from '@minedu/animations/animations';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { DataService } from 'app/core/data/data.service';
import { BehaviorSubject, of } from 'rxjs';
import { catchError, finalize, tap } from 'rxjs/operators';
import { SelectionModel } from '@angular/cdk/collections';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { SecurityModel } from 'app/core/model/security/security.model';
import { TablaProcesosConfiguracionAcciones } from 'app/core/model/action-buttons/action-types';
import { HttpErrorResponse } from '@angular/common/http';
import { ActivatedRoute, Router } from '@angular/router';
import { MESSAGE_GESTION } from '../_utils/messages';
import { CodigoNumeroConvocatoria, DescripcionNumeroConvocatoria } from '../_utils/types-gestion';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'minedu-mantenimiento-proceso',
  templateUrl: './mantenimiento-proceso.component.html',
  styleUrls: ['./mantenimiento-proceso.component.scss'],
  encapsulation: ViewEncapsulation.None,
  animations: mineduAnimations,
})
export class MantenimientoProcesoComponent implements OnInit, AfterViewInit {

  form: FormGroup;
  formCargo: FormGroup;
  working = false;
  esInfo = false;
  tiempoMensaje: number = 3000;  
  claveMaestroProceso = {
    anio: 0,
    idRegimenLaboral: 0,
    idTipoProceso: 0,
    idDescripcionMaestroProceso: 0
  }

  permisoPassport = {
    buttonCrearProceso: false,
    buttonModificarProceso: false,
    buttonEliminarProceso: false
  }

  max = new Date(new Date().setFullYear(new Date().getFullYear() + 1));
  min = new Date();

  modal = {
    icon: "",
    title: "",
    action: "",
    idProceso: 0,
    editable: false
  }
  title : string;

  private passport: SecurityModel;

  cabeceraProceso: any;
  dataFiltrosAreaDesempenioCargo: any;
  combo = {
    regimenesLaborales: [],
    tiposProceso: [],
    procesos: [],
    regimenesLaboralesCargos:[],
    areasDesempenio:[],
    tiposCargo: [],
    cargos: []
  };
  numeroConvocatoria: string;


  displayedColumns: string[] = [
    'select',
    'registro',
    'codigoModular',
    'centroTrabajo',
    'instancia',
    'subInstancia',
    'tipoCentroTrabajo'
  ];
  private _loadingChangeCentros = new BehaviorSubject<boolean>(false);
  private _loadingChange = new BehaviorSubject<boolean>(false);
  loadingCentros = this._loadingChangeCentros.asObservable();
  loading = this._loadingChange.asObservable();
  totalRegistros: number = 0;

  dataSource: MatTableDataSource<any> = new MatTableDataSource<any>();
  dataSourceExcluidos: MatTableDataSource<any> = new MatTableDataSource<any>();
  selection = new SelectionModel<any>(true, []);
  verRegistrosSeleccionados = true;

  @ViewChild('paginatorProceso', { static: true }) paginator: MatPaginator;
  @ViewChild('paginatorCargos', { static: true }) paginatorCargos: MatPaginator;
  @ViewChild('paginatorExcluidos', { static: true }) paginatorExcluidos: MatPaginator;

  dataSourceRegimenLaboralSeleccionados = [];
  dataSourceRegimenLaboralNoSeleccionados = [];
  displayedColumnsRegimenesLaborales = ['select', 'registro', 'abreviaturaRegimenLaboral'];
  selectionRegimenesLaborales = new SelectionModel<any>(true, []);
  checkedSelectionRegimenesLaborales = new SelectionModel<any>(true, []);

  dataSourceTipoPlazaSeleccionados = [];
  dataSourceTipoPlazaNoSeleccionados = [];
  displayedColumnsTiposPlaza = ['select', 'registro', 'abreviaturaRegimenLaboral', 'descripcionTipoPlaza'];
  selectionTiposPlaza = new SelectionModel<any>(true, []);
  checkedSelectionTiposPlaza = new SelectionModel<any>(true, []);

  dataSourceCondicionPlazaSeleccionados = [];
  dataSourceCondicionPlazaNoSeleccionados = [];
  displayedColumnsCondicionPlaza = ['select', 'registro', 'abreviaturaRegimenLaboral', 'descripcionCondicionPlaza'];
  selectionCondicionPlaza = new SelectionModel<any>(true, []);
  checkedSelectionCondicionPlaza = new SelectionModel<any>(true, []);

  dataSourceCargoSeleccionados: MatTableDataSource<any> = new MatTableDataSource<any>();
  displayedColumnsCargo = ['registro', 'abreviaturaRegimenLaboral', 'desempeniolaboral', 'tipocargo', 'cargo', 'acciones'];

  dataSourceNivelEducativoSeleccionados = [];
  dataSourceNivelEducativoNoSeleccionados = [];
  displayedColumnsNivelEducativo = ['select', 'registro', 'modalidadeducativa', 'niveleducativo'];
  selectionNivelEducativo = new SelectionModel<any>(true, []);
  checkedSelectionNivelEducativo = new SelectionModel<any>(true, []); 

  dataSourceTipoGestionDependenciaSeleccionados = [];
  dataSourceTipoGestionDependenciaNoSeleccionados = [];
  displayedColumnsTipoGestionDependencia = ['select', 'registro', 'tipogestion', 'dependencia'];
  selectionTipoGestionDependencia = new SelectionModel<any>(true, []);
  checkedSelectionTipoGestionDependencia = new SelectionModel<any>(true, []);

  dataSourceTipoCentroTrabajoSeleccionados = [];
  dataSourceTipoCentroTrabajoNoSeleccionados = [];
  displayedColumnsTiposCentroTrabajo = ['select', 'registro', 'descripcionTipoCentroTrabajo'];
  selectionTiposCentroTrabajo = new SelectionModel<any>(true, []);
  checkedSelectionTiposCentroTrabajo = new SelectionModel<any>(true, []);
  
  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private formBuilder: FormBuilder,
    private dataService: DataService) {
  }

  ngOnInit(): void {
    this.buildPassport();
    this.buildForm();
    this.buildPaginators(this.paginator);
    this.defaultPermisoPassport();
    this.form.patchValue({ anio: new Date()?.getFullYear() });
  }

  buildPassport() {
    this.passport = this.dataService.Storage().getInformacionUsuario();
  }

  ngAfterViewInit() {
    this.paginator.page
      .pipe(
        tap(() => this.searchInstanciasGrid())
      )
      .subscribe();
  }
  
  buildForm() {
    this.form = this.formBuilder.group({
      idProceso: [null],
      anio: [null, Validators.required],
      idRegimenLaboral: [null, Validators.required],
      idTipoProceso: [null, Validators.required],
      idDescripcionMaestroProceso: [null, Validators.required],
      descripcionProceso: [null],
      minedu: [{ value: false, disabled: true }] ,
      dre: [{ value: false, disabled: true }],
      ugel: [{ value: false, disabled: true }],
      institucionesSuperiores: [{ value: false, disabled: true }],
      institucionesEducativas: [{ value: false, disabled: true }],
      requierePlazaInstitucion: [false],
      codigoModular: [""],
      centroTrabajo: [""],
      fechaProceso:  [new Date()],
    });
    
    this.formCargo = this.formBuilder.group({
      idRegimenLaboral: [null, Validators.required],
      idAreaDesempenioLaboral: [null, Validators.required],
      idTipoCargo: [null, Validators.required],
      idAreaDesempenioCargo: [null, Validators.required]
    });

    this.form.get("fechaProceso").valueChanges.subscribe(value => {
      this.form.patchValue({ anio: value?.getFullYear() });
    });

    this.formCargo.get("idRegimenLaboral").valueChanges.subscribe(idRegimenLaboral => {
      this.combo.areasDesempenio = [];
      this.formCargo.patchValue({ idAreaDesempenioLaboral: null });
      if (idRegimenLaboral && idRegimenLaboral > 0) {
        this.getComboAreaDesempenio(idRegimenLaboral);
      }
    });

    this.formCargo.get("idAreaDesempenioLaboral").valueChanges.subscribe(idAreaDesempenioLaboral => {
      this.combo.tiposCargo = [];
      this.formCargo.patchValue({ idTipoCargo: null });
      const formCargo = this.formCargo.value;
      const idRegimenLaboral = formCargo.idRegimenLaboral
      if (idRegimenLaboral && idRegimenLaboral > 0 &&
        idAreaDesempenioLaboral && idAreaDesempenioLaboral > 0) {
        this.getComboTiposCargo(idRegimenLaboral, idAreaDesempenioLaboral);
      }
    });

    this.formCargo.get("idTipoCargo").valueChanges.subscribe(idTipoCargo => {
      this.combo.cargos = [];
      const formCargo = this.formCargo.value;
      this.formCargo.patchValue({ idAreaDesempenioCargo: null });
      if (formCargo.idRegimenLaboral && formCargo.idRegimenLaboral > 0 && 
        formCargo.idAreaDesempenioLaboral && formCargo.idAreaDesempenioLaboral > 0 && 
        idTipoCargo && idTipoCargo > 0 ) {
        this.getComboCargos(formCargo.idRegimenLaboral, formCargo.idAreaDesempenioLaboral, idTipoCargo);
      }
    });

    this.initialize();
  }

  async onChangeRegimenLaboral(value: any) {
    if (!await this.evaluarCambioProceso('idRegimenLaboral', this.claveMaestroProceso.idRegimenLaboral)) return;

    this.combo.tiposProceso = [];
    this.combo.procesos = [];
    this.form.patchValue({ idTipoProceso: null });
    this.form.patchValue({ idDescripcionMaestroProceso: null });
    this.resetSeleccionMaestroProceso();
    if (value && value > 0) {
      this.getComboTiposProceso(value);
    }
  }
  
  async onChangeTipoProceso(value: any) {
    if (!await this.evaluarCambioProceso('idTipoProceso', this.claveMaestroProceso.idTipoProceso)) return;

    this.combo.procesos = [];
    this.form.patchValue({ idDescripcionMaestroProceso: null });
    this.resetSeleccionMaestroProceso();
    let idRegimenLaboral = this.form.value.idRegimenLaboral;
    if (idRegimenLaboral && parseInt(idRegimenLaboral) > 0 && value && value > 0 ) {
      this.getComboProcesos(idRegimenLaboral, value);
    }
  }

  async onChangeDescripcionMaestroProceso(value: any) {
    if (!await this.evaluarCambioProceso('idDescripcionMaestroProceso', this.claveMaestroProceso.idDescripcionMaestroProceso)) return;
    this.resetSeleccionMaestroProceso();

    if (value){
      this.claveMaestroProceso = {
        anio : this.form.value.anio,
        idRegimenLaboral: this.form.value.idRegimenLaboral,
        idTipoProceso: this.form.value.idTipoProceso,
        idDescripcionMaestroProceso: value
      };

      this.dataService.GestionProcesos().tieneProcesoAnteriorPendiente(this.claveMaestroProceso).pipe(
        catchError((error: HttpErrorResponse) => {
          this.form.controls['idDescripcionMaestroProceso'].reset();
          this.dataService.Message().msgWarning(error.error.messages[0]); return of(null);
        }),
      ).subscribe(response => {
        if (response === false) {

          const maestroProceso = this.combo.procesos.find(x => x.idDescripcionMaestroProceso == value);
          this.searchInstanciasGrid();
          this.loadRegimenesLaborales();
          this.loadTiposPlaza();
          this.loadCondicionesPlaza();
          this.getFiltrosAreasDesempenioCargo();
          this.loadAreaDesempenioCargos();
          this.loadNivelesEducativos();
          this.loadTiposGestionDependencias();
          this.loadTiposCentroTrabajo();
          this.numeroConvocatoria = maestroProceso.numeroConvocatoria;
          this.form.patchValue({ 
            minedu: maestroProceso.tieneMinedu,
            dre: maestroProceso.tieneDre, 
            ugel: maestroProceso.tieneUgel,
            institucionesSuperiores: maestroProceso.tieneInstitutoSuperior,
            institucionesEducativas: maestroProceso.tieneInstitucionEducativa,
            requierePlazaInstitucion: maestroProceso.requierePlazaInstitucion
          });
        } else {
          this.form.controls['idDescripcionMaestroProceso'].reset();
        }
      });
    }
  }

  async evaluarCambioProceso(formCrontrolName: string, valorAPermanecer: number) {
    let debeContinuar = true;
    if (this.dataSourceCargoSeleccionados.data.length > 0 || this.dataSourceExcluidos.data.length > 0)
      await this.dataService.Message().msgConfirm(MESSAGE_GESTION.CONFIRM_CAMBIO_REGIMEN_REINICIO, () => { }, 
        () => {
          this.form.get(formCrontrolName).setValue(valorAPermanecer, { emitViewToModelChange: true } );
          debeContinuar = false;
        });
     return debeContinuar;
  }

  resetSeleccionMaestroProceso () {
    this.numeroConvocatoria = "";
    this.form.patchValue({ centroTrabajo: "" });
    this.defaultCheckAlcance();
    this.resetGrid();
    this.dataSourceExcluidos = new MatTableDataSource([]);
    this.resetGridsAlcancePlaza();
  }

  buildPaginators(paginator: MatPaginator): void {
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

  initialize() {
    this.modal.idProceso = +this.route.snapshot.paramMap.get('proceso');
    this.modal.action = this.route.snapshot.paramMap.get('action');
    if (this.modal.action !== "create") {
      this.form.patchValue({ idProceso: this.modal.idProceso });
      this.form.get('idProceso').setValidators([Validators.required]);
      this.form.get('idProceso').updateValueAndValidity();
      this.removeValidations();
    }

    if (this.modal.action === "info" ) {
      this.title = "Información completa del Proceso";
      setTimeout(() => this.getProcesoPorId(), 0);
      this.loadDataModify(this.modal.idProceso);
      this.esInfo = true;
      
    } else if (this.modal.action === "create") {
      this.title = "Nuevo Proceso";
      this.buildCombo();

    } else if (this.modal.action === "edit") {
      this.title = "Modificar Proceso";
      setTimeout(() => this.getProcesoPorId(), 0);
      this.loadDataModify(this.modal.idProceso);

    } else if (this.modal.action === "nuevaconvocatoria") {
      this.title = "Registrar Nueva Convocatoria";
      setTimeout(() => this.getProcesoPorId(), 0);
      this.loadDataModify(this.modal.idProceso);
    }
  }

  defaultPermisoPassport() {
    this.permisoPassport.buttonCrearProceso = this.dataService.Storage().tienePermisoAccion(TablaProcesosConfiguracionAcciones.Agregar);
    this.permisoPassport.buttonModificarProceso = this.dataService.Storage().tienePermisoAccion(TablaProcesosConfiguracionAcciones.Modificar);
    this.permisoPassport.buttonEliminarProceso = this.dataService.Storage().tienePermisoAccion(TablaProcesosConfiguracionAcciones.Eliminar);
  }

  defaultCheckAlcance() {
    this.form.patchValue({ requierePlazaInstitucion: false});
    this.form.patchValue({ minedu: false, dre: false, ugel: false, institucionesSuperiores: false, institucionesEducativas: false});
  }

  removeValidations() {
    this.form.get('idDescripcionMaestroProceso').clearValidators();
    this.form.get('idDescripcionMaestroProceso').updateValueAndValidity();

    this.form.get('idTipoProceso').clearValidators();
    this.form.get('idTipoProceso').updateValueAndValidity();

    this.form.get('idRegimenLaboral').clearValidators();
    this.form.get('idRegimenLaboral').updateValueAndValidity();

    this.form.get('anio').clearValidators();
    this.form.get('anio').updateValueAndValidity();
  }
  
  handleBuscarCentroTrabajo(){
    let codigoModular = this.form.value.codigoModular;
    codigoModular = codigoModular.replace(' ', '');
    this.form.patchValue({codigoModular: codigoModular});
    if(this.form.value.codigoModular.length > 0 && this.form.value.codigoModular.length < 6){
      this.dataService.Message().msgWarning(MESSAGE_GESTION.M38, () => { });
      return;
    }
    this.resetGrid();
    this.searchInstanciasGrid();
  }

  searchInstanciasGrid() {
    const form = this.form.value;
    const d = {
      pCodigoModular: form.codigoModular,
      pCentroTrabajo: form.centroTrabajo,
      pIdRegimenLaboral: form.idRegimenLaboral ?? this.cabeceraProceso?.idRegimenLaboral,
      pIdTipoProceso: form.idTipoProceso ?? this.cabeceraProceso?.idTipoProceso ,
      pIdDescripcionMaestroProceso: form.idDescripcionMaestroProceso ?? this.cabeceraProceso?.idDescripcionMaestroProceso,
      pActivo: true
    }
    this.dataSource = new MatTableDataSource([]);
    this.searchInstancias(d, (this.paginator.pageIndex + 1), this.paginator.pageSize);
  }

  handleImportarAnioAnterior(){
    const form = this.form.value;
    if (!form.anio || !form.idRegimenLaboral || !form.idTipoProceso || !form.idDescripcionMaestroProceso ) {
      this.dataService.Message().msgWarning(MESSAGE_GESTION.INVALID_FILTROS_IMPORTAR, () => { });
      return;
    }

    let anioAnterior = form.anio -1;
    this.dataService.GestionProcesos().getIdProcesoAnioAnterior(anioAnterior, this.passport.codigoRol, form.idRegimenLaboral, form.idTipoProceso, form.idDescripcionMaestroProceso).pipe(
      catchError((error: HttpErrorResponse) => {
        this.dataService.Message().msgWarning(error.error.messages[0]); return of(null);
      }),
    ).subscribe((idProceso: any) => {
      if (idProceso && idProceso > 0) {
        this.dataService.Message().msgConfirm(MESSAGE_GESTION.CONFIRM_IMPORTAR_ANIO_ANTERIOR, () => {
          this.loadRegimenesLaboralesProceso(idProceso);
          this.loadTiposPlazaProceso(idProceso);
          this.loadCondicionesPlazaProceso(idProceso);
          this.loadCargosProceso(idProceso);          
          this.loadNivelesEducativosProceso(idProceso);
          this.loadTiposGestionDependenciasProceso(idProceso);
          this.loadTiposCentroTrabajoProceso(idProceso);
        }, () => { });
      } else {
        this.dataService.Message().msgWarning(MESSAGE_GESTION.RESULT_NULL_IMPORTAR_ANIO_ANTERIOR, () => { });
      }
    });
  }

  getProcesoPorId() {
    const form = this.form.value;
    this.dataService.Spinner().show("sp6");
    this.dataService.GestionProcesos().getCabeceraProceso(form.idProceso).pipe(
      catchError((error: HttpErrorResponse) => {
        this.dataService.Message().msgWarning(error.error.messages[0]); return of(null);
      }),
      finalize(() => { this.dataService.Spinner().hide("sp6"); })
    ).subscribe(response => {
      if (response) {
        const data = response;
        this.cabeceraProceso = data;
        this.form.patchValue({ 
          idRegimenLaboral: this.cabeceraProceso.idRegimenLaboral,
          idTipoProceso: this.cabeceraProceso.idTipoProceso,
          idDescripcionMaestroProceso: this.cabeceraProceso.idDescripcionMaestroProceso,
          descripcionProceso: this.cabeceraProceso.descripcionProceso,
          minedu: this.cabeceraProceso.tieneMinedu,
          dre: this.cabeceraProceso.tieneDre,
          ugel: this.cabeceraProceso.tieneUgel,
          institucionesSuperiores: this.cabeceraProceso.tieneInstitutoSuperior,
          institucionesEducativas: this.cabeceraProceso.tieneInstitucionEducativa,
          requierePlazaInstitucion: this.cabeceraProceso.requierePlazaInstitucion
         }, { emitEvent: false });
         this.setNumeroConvocatoria();
         this.searchInstanciasGrid();
         this.loadCentrosTrabajoProcesoExcluidos(this.modal.idProceso);
         this.getFiltrosAreasDesempenioCargo();
      }
    });
  }

  setNumeroConvocatoria() {
    if (this.modal.action === "nuevaconvocatoria") {
      switch (this.cabeceraProceso.codigoNumeroConvocatoria) {
        case CodigoNumeroConvocatoria.Primera:
          this.cabeceraProceso.convocatoria = DescripcionNumeroConvocatoria.Segunda;
          break;
        case CodigoNumeroConvocatoria.Segunda:
          this.cabeceraProceso.convocatoria = DescripcionNumeroConvocatoria.Tercera;
          break;
      }
    }
  }

  buildCombo() {
    this.dataService.GestionProcesos().getComboRegimenesLaborales(this.passport?.codigoRol).pipe(
      catchError((error: HttpErrorResponse) => {
        this.dataService.Message().msgWarning(error.error.messages[0]); return of(null);
      }),
    ).subscribe(response => {
      if (response) {
        this.combo.regimenesLaborales = response;
      } else {
        this.combo.regimenesLaborales = [];
      }
    });
  }

  getComboTiposProceso(pIdRegimenLaboral) {
    if (!pIdRegimenLaboral) {
      this.combo.procesos = [];
      this.combo.tiposProceso = [];
      return;
    }
    this.dataService.GestionProcesos().getComboTiposProceso(this.passport.codigoRol, pIdRegimenLaboral).pipe(
      catchError((error: HttpErrorResponse) => {
        this.dataService.Message().msgWarning(error.error.messages[0]); return of(null);
      }),
    ).subscribe((response: any) => {
      if (response) {
        this.combo.tiposProceso = response;
      } else {
        this.combo.tiposProceso = [];
      }
    });
  }
  
  getComboProcesos(pIdRegimenLaboral, pIdTipoProceso) {
    if (!pIdRegimenLaboral || !pIdTipoProceso) {
      this.combo.procesos = [];
      return;
    }
    this.dataService.GestionProcesos().getComboMaestroProcesos(this.passport.codigoRol, pIdRegimenLaboral, pIdTipoProceso, true).pipe(
      catchError((error: HttpErrorResponse) => {
        this.dataService.Message().msgWarning(error.error.messages[0]); return of(null);
      }),
    ).subscribe((response: any) => {
      if (response) {
        this.combo.procesos = response;
      } else {
        this.combo.procesos = [];
      }
    });
  }

  getFiltrosAreasDesempenioCargo() {
    let data = {};
    if (this.modal.action === 'create') {
      const form = this.form.value;
      data = {
        idRegimenLaboral: form.idRegimenLaboral,
        idTipoProceso: form.idTipoProceso,
        idDescripcionMaestroProceso: form.idDescripcionMaestroProceso
      };
    } else {
      data = {
        idRegimenLaboral: this.cabeceraProceso.idRegimenLaboral,
        idTipoProceso: this.cabeceraProceso.idTipoProceso,
        idDescripcionMaestroProceso: this.cabeceraProceso.idDescripcionMaestroProceso
      };
    }
    
    this.dataService.GestionProcesos().getFiltroAreasDesempenioCargo(data).pipe(
      catchError((error: HttpErrorResponse) => {
        this.dataService.Message().msgWarning(error.error.messages[0]); return of(null);
      }),
    ).subscribe((response: any) => {
      if (response) {
        this.dataFiltrosAreaDesempenioCargo = response;
        this.combo.regimenesLaboralesCargos = this.dataFiltrosAreaDesempenioCargo.regimenesLaborales;
      } else {
        this.combo.regimenesLaboralesCargos = [];
      }
    });
  }

  getComboAreaDesempenio(pIdRegimenLaboral) {
    if (!pIdRegimenLaboral) return;

    this.combo.areasDesempenio = this.dataFiltrosAreaDesempenioCargo.areasDesempenioLaboral.filter(x => 
      x.idRegimenLaboral === pIdRegimenLaboral);
  }

  getComboTiposCargo(pIdRegimenLaboral, pIdAreaDesempenioLaboral) {
    if (!pIdRegimenLaboral || !pIdAreaDesempenioLaboral) return;

    this.combo.tiposCargo = this.dataFiltrosAreaDesempenioCargo.tiposCargo.filter(x => 
      x.idRegimenLaboral === pIdRegimenLaboral && 
      x.idAreaDesempenioLaboral === pIdAreaDesempenioLaboral);
  }

  getComboCargos(pIdRegimenLaboral, pIdAreaDesempenioLaboral, pIdTipoCargo) {
    if (!pIdRegimenLaboral || !pIdAreaDesempenioLaboral || !pIdTipoCargo) return;

    this.combo.cargos = this.dataFiltrosAreaDesempenioCargo.cargos.filter(x => 
      x.idRegimenLaboral === pIdRegimenLaboral && 
      x.idAreaDesempenioLaboral === pIdAreaDesempenioLaboral && 
      x.idTipoCargo === pIdTipoCargo);
  }
  
  retornarRegiminesLaboralesDinamico () {
    this.dataSourceTipoPlazaSeleccionados.forEach(row => {
      if (this.esRegimenLaboralExcluido(row))
        this.checkedSelectionTiposPlaza.select(row);
    });
    this.retornarTiposPlaza(false);

    this.dataSourceCondicionPlazaSeleccionados.forEach(row => {
      if (this.esRegimenLaboralExcluido(row))
        this.checkedSelectionCondicionPlaza.select(row);
    });
    this.retornarCondicionPlaza(false);

    this.dataSourceCargoSeleccionados.data.forEach(row => {
      if ( this.esRegimenLaboralExcluido(row) )
        this.handleEliminarCargo(row);
    });
  }

  esRegimenLaboralExcluido (row){
    return this.dataSourceRegimenLaboralNoSeleccionados.some(x => x.idRegimenLaboral === row.idRegimenLaboral);
  }

  dataConRegimenLaboralValidos(dataSource) {
    return dataSource.filter(x => !this.esRegimenLaboralExcluido(x));
  }

  tieneSeleccionados(selectionModel: SelectionModel<any>): boolean {
    const existe = selectionModel.hasValue();
    if (!existe) this.dataService.Message().msgWarning(MESSAGE_GESTION.M91);
    return existe;
  }

  
  isAllSelectedRegimenLaboral() {
    const numSelected = this.selectionRegimenesLaborales.selected.length;
    const numRows = this.dataSourceRegimenLaboralNoSeleccionados.length;
    return numSelected === numRows;
  }

  isAllCheckedSelectedRegimenLaboral() {
    const numSelected = this.checkedSelectionRegimenesLaborales.selected.length;
    const numRows = this.dataSourceRegimenLaboralSeleccionados.length;
    return numSelected === numRows;
  }
  
  transferirSeleccionadosRegimenLaboral(data) {
    this.dataSourceRegimenLaboralSeleccionados = data.filter(x=>x.esSeleccionado == true);
    this.dataSourceRegimenLaboralNoSeleccionados = data.filter(x=>x.esSeleccionado == false);
    this.checkedSelectionRegimenesLaborales.clear();
    this.selectionRegimenesLaborales.clear();
  }

  agregarRegimenesLaborales() {
    if (!this.tieneSeleccionados(this.selectionRegimenesLaborales)) return;

    this.selectionRegimenesLaborales.selected.forEach(row => {
      this.dataSourceRegimenLaboralSeleccionados = [...this.dataSourceRegimenLaboralSeleccionados, row];
      this.dataSourceRegimenLaboralNoSeleccionados = this.dataSourceRegimenLaboralNoSeleccionados.filter(x=>x !== row);
    });
    this.selectionRegimenesLaborales.clear();
  }

  retornarRegimenesLaborales() {
    if (!this.tieneSeleccionados(this.checkedSelectionRegimenesLaborales)) return;
    
    this.checkedSelectionRegimenesLaborales.selected.forEach(row => {
      this.dataSourceRegimenLaboralNoSeleccionados = [...this.dataSourceRegimenLaboralNoSeleccionados, row];
      this.dataSourceRegimenLaboralSeleccionados = this.dataSourceRegimenLaboralSeleccionados.filter(x=>x !== row);
    });
    this.checkedSelectionRegimenesLaborales.clear();
    this.retornarRegiminesLaboralesDinamico();
  }

  masterToggleRegimenLaboral() {
    this.isAllSelectedRegimenLaboral() ?
    this.selectionRegimenesLaborales.clear() :
    this.dataSourceRegimenLaboralNoSeleccionados.forEach(row => this.selectionRegimenesLaborales.select(row));
  }

  masterCheckedToggleRegimenLaboral() {
    this.isAllCheckedSelectedRegimenLaboral()?
    this.checkedSelectionRegimenesLaborales.clear() : 
    this.dataSourceRegimenLaboralSeleccionados.forEach(row => this.checkedSelectionRegimenesLaborales.select(row));
  }


  isAllSelectedTipoPlaza() {
    const numSelected = this.selectionTiposPlaza.selected.length;
    const numRows = this.dataSourceTipoPlazaNoSeleccionados.filter(x => !this.esRegimenLaboralExcluido(x)).length;
    return numSelected === numRows;
  }

  isAllCheckedSelectedTipoPlaza() {
    const numSelected = this.checkedSelectionTiposPlaza.selected.length;
    const numRows = this.dataSourceTipoPlazaSeleccionados.length;
    return numSelected === numRows;
  }
  
  transferirSeleccionadosTipoPlaza(data) {
    this.dataSourceTipoPlazaSeleccionados = data.filter(x=>x.esSeleccionado == true);
    this.dataSourceTipoPlazaNoSeleccionados = data.filter(x=>x.esSeleccionado == false);
    this.checkedSelectionTiposPlaza.clear();
    this.selectionTiposPlaza.clear();
  }

  agregarTiposPlaza() {
    if (!this.tieneSeleccionados(this.selectionTiposPlaza)) return;

    this.selectionTiposPlaza.selected.forEach(row => {
      this.dataSourceTipoPlazaSeleccionados = [...this.dataSourceTipoPlazaSeleccionados, row];
      this.dataSourceTipoPlazaNoSeleccionados = this.dataSourceTipoPlazaNoSeleccionados.filter(x=>x !== row);
    });
    this.selectionTiposPlaza.clear();
  }

  retornarTiposPlaza(notificar: boolean = true) {
    if (notificar && !this.tieneSeleccionados(this.checkedSelectionTiposPlaza)) return;
    
    this.checkedSelectionTiposPlaza.selected.forEach(row => {
      this.dataSourceTipoPlazaNoSeleccionados = [...this.dataSourceTipoPlazaNoSeleccionados, row];
      this.dataSourceTipoPlazaSeleccionados = this.dataSourceTipoPlazaSeleccionados.filter(x=>x !== row);
    });
    this.checkedSelectionTiposPlaza.clear();
  }

  masterToggleTipoPlaza() {
    this.isAllSelectedTipoPlaza() ?
    this.selectionTiposPlaza.clear() :
    this.dataSourceTipoPlazaNoSeleccionados.forEach(row => {
      if (!this.esRegimenLaboralExcluido(row))
        this.selectionTiposPlaza.select(row)
    });
  }

  masterCheckedToggleTipoPlaza() {
    this.isAllCheckedSelectedTipoPlaza()?
    this.checkedSelectionTiposPlaza.clear() : 
    this.dataSourceTipoPlazaSeleccionados.forEach(row => this.checkedSelectionTiposPlaza.select(row));
  }


  isAllSelectedCondicionPlaza() {
    const numSelected = this.selectionCondicionPlaza.selected.length;
    const numRows = this.dataSourceCondicionPlazaNoSeleccionados.filter(x => !this.esRegimenLaboralExcluido(x)).length;
    return numSelected === numRows;
  }

  isAllCheckedSelectedCondicionPlaza() {
    const numSelected = this.checkedSelectionCondicionPlaza.selected.length;
    const numRows = this.dataSourceCondicionPlazaSeleccionados.length;
    return numSelected === numRows;
  }
  
  transferirSeleccionadosCondicionPlaza(data) {
    this.dataSourceCondicionPlazaSeleccionados = data.filter(x=>x.esSeleccionado == true);
    this.dataSourceCondicionPlazaNoSeleccionados = data.filter(x=>x.esSeleccionado == false);
    this.checkedSelectionCondicionPlaza.clear();
    this.selectionCondicionPlaza.clear();
  }

  agregarCondicionPlaza() {
    if (!this.tieneSeleccionados(this.selectionCondicionPlaza)) return;

    this.selectionCondicionPlaza.selected.forEach(row => {
      this.dataSourceCondicionPlazaSeleccionados = [...this.dataSourceCondicionPlazaSeleccionados, row];
      this.dataSourceCondicionPlazaNoSeleccionados = this.dataSourceCondicionPlazaNoSeleccionados.filter(x=>x !== row);
    });
    this.selectionCondicionPlaza.clear();
  }

  retornarCondicionPlaza(notificar: boolean = true) {
    if (notificar && !this.tieneSeleccionados(this.checkedSelectionCondicionPlaza)) return;
    
    this.checkedSelectionCondicionPlaza.selected.forEach(row => {
      this.dataSourceCondicionPlazaNoSeleccionados = [...this.dataSourceCondicionPlazaNoSeleccionados, row];
      this.dataSourceCondicionPlazaSeleccionados = this.dataSourceCondicionPlazaSeleccionados.filter(x=>x !== row);
    });
    this.checkedSelectionCondicionPlaza.clear();
  }

  masterToggleCondicionPlaza() {
    this.isAllSelectedCondicionPlaza() ?
    this.selectionCondicionPlaza.clear() :
    this.dataSourceCondicionPlazaNoSeleccionados.forEach(row => {
      if (!this.esRegimenLaboralExcluido(row))
        this.selectionCondicionPlaza.select(row)
    });
  }

  masterCheckedToggleCondicionPlaza() {
    this.isAllCheckedSelectedCondicionPlaza()?
    this.checkedSelectionCondicionPlaza.clear() : 
    this.dataSourceCondicionPlazaSeleccionados.forEach(row => this.checkedSelectionCondicionPlaza.select(row));
  }


  handleAgregarCargo(){
    const idRegimenLaboral = this.formCargo.value.idRegimenLaboral;
    const idAreaDesempenioLaboral = this.formCargo.value.idAreaDesempenioLaboral;
    const idTipoCargo = this.formCargo.value.idTipoCargo;
    const idAreaDesempenioCargo = this.formCargo.value.idAreaDesempenioCargo;

    if(!idRegimenLaboral || !idAreaDesempenioLaboral || !idTipoCargo || !idAreaDesempenioCargo){      
      this.dataService.Message().msgWarning(MESSAGE_GESTION.M08, () => { });
      return;
    }

    if(this.esRegimenLaboralExcluido({idRegimenLaboral: idRegimenLaboral})){      
      this.dataService.Message().msgWarning(MESSAGE_GESTION.INVALID_ALCANCE_REGIMEN_LABORAL, () => { });
      return;
    }
    
    if(this.dataSourceCargoSeleccionados.data.filter(x => x.idAreaDesempenioCargo === idAreaDesempenioCargo).length !== 0){      
      this.dataService.Message().msgWarning(MESSAGE_GESTION.M199, () => { });
      return;
    }

    const row  = {
      idAreaDesempenioCargo: idAreaDesempenioCargo,
      idRegimenLaboral: idRegimenLaboral,
      abreviaturaRegimenLaboral: this.combo.regimenesLaboralesCargos.find(x => x.idRegimenLaboral === idRegimenLaboral).abreviaturaRegimenLaboral,
      descripcionAreaDesempenioLaboral: this.combo.areasDesempenio.find(x => x.idAreaDesempenioLaboral === idAreaDesempenioLaboral).descripcionAreaDesempenioLaboral,
      descripcionCatalogoItemTipoCargo: this.combo.tiposCargo.find(x => x.idTipoCargo === idTipoCargo).descripcionCatalogoItemTipoCargo,
      descripcionCargo: this.combo.cargos.find(x => x.idAreaDesempenioCargo === idAreaDesempenioCargo).descripcionCargo,
    }
    
    const data = this.dataSourceCargoSeleccionados.data;
    data.push(row);
    this.dataSourceCargoSeleccionados.data = data;
    this.paginatorCargos.length = data.length;
    this.dataSourceCargoSeleccionados.paginator = this.paginatorCargos;
    this.dataSourceCargoSeleccionados.paginator.lastPage();
  }

  handleEliminarCargo(row: any){
    this.dataSourceCargoSeleccionados.data = 
    this.dataSourceCargoSeleccionados.data.filter(x => x.idAreaDesempenioCargo !== row.idAreaDesempenioCargo);
  }


  isAllSelectedNivelEducativo() {
    const numSelected = this.selectionNivelEducativo.selected.length;
    const numRows = this.dataSourceNivelEducativoNoSeleccionados.length;
    return numSelected === numRows;
  }

  isAllCheckedSelectedNivelEducativo() {
    const numSelected = this.checkedSelectionNivelEducativo.selected.length;
    const numRows = this.dataSourceNivelEducativoSeleccionados.length;
    return numSelected === numRows;
  }
  
  transferirSeleccionadosNivelEducativo(data) {
    this.dataSourceNivelEducativoSeleccionados = data.filter(x=>x.esSeleccionado == true);
    this.dataSourceNivelEducativoNoSeleccionados = data.filter(x=>x.esSeleccionado == false);
    this.checkedSelectionNivelEducativo.clear();
    this.selectionNivelEducativo.clear();
  }

  agregarNivelEducativo() {
    if (!this.tieneSeleccionados(this.selectionNivelEducativo)) return;

    this.selectionNivelEducativo.selected.forEach(row => {
      this.dataSourceNivelEducativoSeleccionados = [...this.dataSourceNivelEducativoSeleccionados, row];
      this.dataSourceNivelEducativoNoSeleccionados = this.dataSourceNivelEducativoNoSeleccionados.filter(x=>x !== row);
    });
    this.selectionNivelEducativo.clear();
  }

  retornarNivelEducativo() {
    if (!this.tieneSeleccionados(this.checkedSelectionNivelEducativo)) return;
    
    this.checkedSelectionNivelEducativo.selected.forEach(row => {
      this.dataSourceNivelEducativoNoSeleccionados = [...this.dataSourceNivelEducativoNoSeleccionados, row];
      this.dataSourceNivelEducativoSeleccionados = this.dataSourceNivelEducativoSeleccionados.filter(x=>x !== row);
    });
    this.checkedSelectionNivelEducativo.clear();
  }

  masterToggleNivelEducativo() {
    this.isAllSelectedNivelEducativo() ?
    this.selectionNivelEducativo.clear() :
    this.dataSourceNivelEducativoNoSeleccionados.forEach(row => this.selectionNivelEducativo.select(row));
  }

  masterCheckedToggleNivelEducativo() {
    this.isAllCheckedSelectedNivelEducativo()?
    this.checkedSelectionNivelEducativo.clear() : 
    this.dataSourceNivelEducativoSeleccionados.forEach(row => this.checkedSelectionNivelEducativo.select(row));
  }


  isAllSelectedTipoGestionDependencia() {
    const numSelected = this.selectionTipoGestionDependencia.selected.length;
    const numRows = this.dataSourceTipoGestionDependenciaNoSeleccionados.length;
    return numSelected === numRows;
  }

  isAllCheckedSelectedTipoGestionDependencia() {
    const numSelected = this.checkedSelectionTipoGestionDependencia.selected.length;
    const numRows = this.dataSourceTipoGestionDependenciaSeleccionados.length;
    return numSelected === numRows;
  }
  
  transferirSeleccionadosTipoGestionDependencia(data) {
    this.dataSourceTipoGestionDependenciaSeleccionados = data.filter(x=>x.esSeleccionado == true);
    this.dataSourceTipoGestionDependenciaNoSeleccionados = data.filter(x=>x.esSeleccionado == false);
    this.checkedSelectionTipoGestionDependencia.clear();
    this.selectionTipoGestionDependencia.clear();
  }

  agregarTipoGestionDependencia() {
    if (!this.tieneSeleccionados(this.selectionTipoGestionDependencia)) return;

    this.selectionTipoGestionDependencia.selected.forEach(row => {
      this.dataSourceTipoGestionDependenciaSeleccionados = [...this.dataSourceTipoGestionDependenciaSeleccionados, row];
      this.dataSourceTipoGestionDependenciaNoSeleccionados = this.dataSourceTipoGestionDependenciaNoSeleccionados.filter(x=>x !== row);
    });
    this.selectionTipoGestionDependencia.clear();
  }

  retornarTipoGestionDependencia() {
    if (!this.tieneSeleccionados(this.checkedSelectionTipoGestionDependencia)) return;
    
    this.checkedSelectionTipoGestionDependencia.selected.forEach(row => {
      this.dataSourceTipoGestionDependenciaNoSeleccionados = [...this.dataSourceTipoGestionDependenciaNoSeleccionados, row];
      this.dataSourceTipoGestionDependenciaSeleccionados = this.dataSourceTipoGestionDependenciaSeleccionados.filter(x=>x !== row);
    });
    this.checkedSelectionTipoGestionDependencia.clear();
  }

  masterToggleTipoGestionDependencia() {
    this.isAllSelectedTipoGestionDependencia() ?
    this.selectionTipoGestionDependencia.clear() :
    this.dataSourceTipoGestionDependenciaNoSeleccionados.forEach(row => this.selectionTipoGestionDependencia.select(row));
  }

  masterCheckedToggleTipoGestionDependencia() {
    this.isAllCheckedSelectedTipoGestionDependencia()?
    this.checkedSelectionTipoGestionDependencia.clear() : 
    this.dataSourceTipoGestionDependenciaSeleccionados.forEach(row => this.checkedSelectionTipoGestionDependencia.select(row));
  }

  
  isAllSelectedTipoCentroTrabajo() {
    const numSelected = this.selectionTiposCentroTrabajo.selected.length;
    const numRows = this.dataSourceTipoCentroTrabajoNoSeleccionados.length;
    return numSelected === numRows;
  }

  isAllCheckedSelectedTipoCentroTrabajo() {
    const numSelected = this.checkedSelectionTiposCentroTrabajo.selected.length;
    const numRows = this.dataSourceTipoCentroTrabajoSeleccionados.length;
    return numSelected === numRows;
  }
  
  transferirSeleccionadosTipoCentroTrabajo(data) {
    this.dataSourceTipoCentroTrabajoSeleccionados = data.filter(x=>x.esSeleccionado == true);
    this.dataSourceTipoCentroTrabajoNoSeleccionados = data.filter(x=>x.esSeleccionado == false);
    this.checkedSelectionTiposCentroTrabajo.clear();
    this.selectionTiposCentroTrabajo.clear();
  }

  agregarTiposCentroTrabajo() {
    if (!this.tieneSeleccionados(this.selectionTiposCentroTrabajo)) return;

    this.selectionTiposCentroTrabajo.selected.forEach(row => {
      this.dataSourceTipoCentroTrabajoSeleccionados = [...this.dataSourceTipoCentroTrabajoSeleccionados, row];
      this.dataSourceTipoCentroTrabajoNoSeleccionados = this.dataSourceTipoCentroTrabajoNoSeleccionados.filter(x=>x !== row);
    });
    this.selectionTiposCentroTrabajo.clear();
  }

  retornarTiposCentroTrabajo() {
    if (!this.tieneSeleccionados(this.checkedSelectionTiposCentroTrabajo)) return;
    
    this.checkedSelectionTiposCentroTrabajo.selected.forEach(row => {
      this.dataSourceTipoCentroTrabajoNoSeleccionados = [...this.dataSourceTipoCentroTrabajoNoSeleccionados, row];
      this.dataSourceTipoCentroTrabajoSeleccionados = this.dataSourceTipoCentroTrabajoSeleccionados.filter(x=>x !== row);
    });
    this.checkedSelectionTiposCentroTrabajo.clear();
  }

  masterToggleTipoCentroTrabajo() {
    this.isAllSelectedTipoCentroTrabajo() ?
    this.selectionTiposCentroTrabajo.clear() :
    this.dataSourceTipoCentroTrabajoNoSeleccionados.forEach(row => this.selectionTiposCentroTrabajo.select(row));
  }

  masterCheckedToggleTipoCentroTrabajo() {
    this.isAllCheckedSelectedTipoCentroTrabajo()?
    this.checkedSelectionTiposCentroTrabajo.clear() : 
    this.dataSourceTipoCentroTrabajoSeleccionados.forEach(row => this.checkedSelectionTiposCentroTrabajo.select(row));
  }

  isAllSelected() {
    const numSelected = this.selection.selected.length;
    const data = this.dataSource.data;
    const numRows = data.length;
    return numSelected === numRows;
  }

  selectedGrid(row) {
    this.selection.toggle(row);
    
    if(!this.selection.isSelected(row)){
      if (this.dataSourceExcluidos.data.filter(x => x.idCentroTrabajo === row.idCentroTrabajo).length === 0)
        this.dataSourceExcluidos.data = [...this.dataSourceExcluidos.data, row];
    }else 
      this.dataSourceExcluidos.data = this.dataSourceExcluidos.data.filter(x => x.idCentroTrabajo !== row.idCentroTrabajo);

    this.verCentrosTrabajoSeleccionados();
  }

  verCentrosTrabajoSeleccionados(){
    this.selection.clear();
    this.dataSource.data.forEach(row => {
      if(this.dataSourceExcluidos.data.filter(x => x.idCentroTrabajo === row.idCentroTrabajo).length === 0) 
        this.selection.select(row)
    });
    this.dataSourceExcluidos.paginator = this.paginatorExcluidos;
  }

  masterToggle() {
    if (this.isAllSelected()) {
      this.dataSource.data.forEach(row => {
        if (this.dataSourceExcluidos.data.filter(x => x.idCentroTrabajo === row.idCentroTrabajo).length === 0)
          this.dataSourceExcluidos.data = [...this.dataSourceExcluidos.data, row];
      });
      this.selection.clear();
    } else {
      this.dataSource.data.forEach(row => {
        this.selection.select(row);
        this.dataSourceExcluidos.data = this.dataSourceExcluidos.data.filter(x => x.idCentroTrabajo !== row.idCentroTrabajo);
      });
    }
  }

  masterToggleExcluidos($event) {
    this.dataSourceExcluidos = new MatTableDataSource([]);
    this.verCentrosTrabajoSeleccionados();  
    $event.source._checked = false;
  }

  resetGridsAlcancePlaza() {
    this.transferirSeleccionadosRegimenLaboral([]);
    this.transferirSeleccionadosTipoPlaza([]);
    this.transferirSeleccionadosCondicionPlaza([]);
    this.transferirSeleccionadosNivelEducativo([]);
    this.transferirSeleccionadosTipoGestionDependencia([]);
    this.transferirSeleccionadosTipoCentroTrabajo([]);
    this.formCargo.patchValue({idRegimenLaboral: null});
    this.combo.regimenesLaboralesCargos = [];
    this.dataFiltrosAreaDesempenioCargo = null;
    this.dataSourceCargoSeleccionados = new MatTableDataSource([]);
    this.paginatorCargos.length = 0;
    this.dataSourceCargoSeleccionados.paginator = this.paginatorCargos;
    this.paginatorCargos.firstPage();
  }

  resetGrid() {
    this.dataSource = new MatTableDataSource([]);
    this.selection.clear();
    this.totalRegistros = 0;
    this.paginator.firstPage();
  }
  
  loadRegimenesLaborales() {
    const maestroProceso = this.combo.procesos.find(x => x.idDescripcionMaestroProceso == this.form.value.idDescripcionMaestroProceso);

    this._loadingChange.next(true);
    this.dataService.GestionProcesos().getRegimenesLaborales(maestroProceso.idMaestroProceso).pipe(
      catchError(() => of([])),
      finalize(() => this._loadingChange.next(false))
    ).subscribe((response: any) => {
      if (response) {
        this.transferirSeleccionadosRegimenLaboral(response);
      } else {
        this.dataService.Message().msgWarning(MESSAGE_GESTION.RESULT_NULL_REGIMEN_LABORAL, () => { });
      }
    });
  }

  loadTiposPlaza() {
    const maestroProceso = this.combo.procesos.find(x => x.idDescripcionMaestroProceso == this.form.value.idDescripcionMaestroProceso);

    this._loadingChange.next(true);
    this.dataService.GestionProcesos().getTiposPlaza(maestroProceso.idMaestroProceso).pipe(
      catchError(() => of([])),
      finalize(() => this._loadingChange.next(false))
    ).subscribe((response: any) => {
      if (response) {
        this.transferirSeleccionadosTipoPlaza(response);
      } else {
        this.dataService.Message().msgWarning(MESSAGE_GESTION.RESULT_NULL_TIPO_PLAZA, () => { });
      }
    });
  }

  loadCondicionesPlaza() {
    const maestroProceso = this.combo.procesos.find(x => x.idDescripcionMaestroProceso == this.form.value.idDescripcionMaestroProceso);
    this._loadingChange.next(true);
    this.dataService.GestionProcesos().getCondicionesPlaza(maestroProceso.idMaestroProceso).pipe(
      catchError(() => of([])),
      finalize(() => this._loadingChange.next(false))
    ).subscribe((response: any) => {
      if (response) {
        this.transferirSeleccionadosCondicionPlaza(response);
      } else {
        this.dataService.Message().msgWarning(MESSAGE_GESTION.RESULT_NULL_CONDICION_PLAZA, () => { });
      }
    });
  }

  loadAreaDesempenioCargos() {
    const maestroProceso = this.combo.procesos.find(x => x.idDescripcionMaestroProceso == this.form.value.idDescripcionMaestroProceso);
    this._loadingChange.next(true);
    this.dataService.GestionProcesos().getAreaDesempenioCargos(maestroProceso.idMaestroProceso).pipe(
      catchError(() => of([])),
      finalize(() => this._loadingChange.next(false))
    ).subscribe((response: any) => {
      if (response?.length > 0)
        this.dataSourceCargoSeleccionados.data = response;
    });
  }

  loadNivelesEducativos() {
    const maestroProceso = this.combo.procesos.find(x => x.idDescripcionMaestroProceso == this.form.value.idDescripcionMaestroProceso);
    this._loadingChange.next(true);
    this.dataService.GestionProcesos().getModalidadesNivelesEducativos(maestroProceso.idMaestroProceso).pipe(
      catchError(() => of([])),
      finalize(() => this._loadingChange.next(false))
    ).subscribe((response: any) => {
      if (response) {
        this.transferirSeleccionadosNivelEducativo(response);
      } else {
        this.dataService.Message().msgWarning(MESSAGE_GESTION.RESULT_NULL_NIVEL_EDUCATIVO, () => { });
      }
    });
  }
  
  loadTiposGestionDependencias() {
    const maestroProceso = this.combo.procesos.find(x => x.idDescripcionMaestroProceso == this.form.value.idDescripcionMaestroProceso);
    this._loadingChange.next(true);
    this.dataService.GestionProcesos().getTiposGestionDependencias(maestroProceso.idMaestroProceso).pipe(
      catchError(() => of([])),
      finalize(() => this._loadingChange.next(false))
    ).subscribe((response: any) => {
      if (response) {
        this.transferirSeleccionadosTipoGestionDependencia(response);
      } else {
        this.dataService.Message().msgWarning(MESSAGE_GESTION.RESULT_NULL_TIPO_GESTION_DEPENDENCIA, () => { });
      }
    });
  }
  
  loadTiposCentroTrabajo() {
    const maestroProceso = this.combo.procesos.find(x => x.idDescripcionMaestroProceso == this.form.value.idDescripcionMaestroProceso);

    this._loadingChange.next(true);
    this.dataService.GestionProcesos().getTiposCentroTrabajo(maestroProceso.idMaestroProceso).pipe(
      catchError(() => of([])),
      finalize(() => this._loadingChange.next(false))
    ).subscribe((response: any) => {
      if (response) {
        this.transferirSeleccionadosTipoCentroTrabajo(response);
      } else {
        this.dataService.Message().msgWarning(MESSAGE_GESTION.RESULT_NULL_TIPO_CENTRO_TRABAJO, () => { });
      }
    });
  }
  
  searchInstancias(data: any, pageIndex, pageSize) {
    this._loadingChangeCentros.next(true);
    this.dataService.GestionProcesos().consultarCentrosTrabajo(data, pageIndex, pageSize).pipe(
      catchError((error: HttpErrorResponse) => {
        this.dataService.Message().msgWarning(error.error.messages[0]); return of(null);
      }),
      finalize(() => this._loadingChangeCentros.next(false))
    ).subscribe((response: any) => {
      if (response) {
        this.dataSource = new MatTableDataSource(response || []);
        this.totalRegistros = (response[0] || [{ totalRegistro: 0 }]).totalRegistro;
        this.verCentrosTrabajoSeleccionados();
      } else {
        this.totalRegistros = 0;
      }
    });
  }

  loadCentrosTrabajoProcesoExcluidos(pIdProceso) {
    this._loadingChangeCentros.next(true);
    this.dataService.GestionProcesos().consultarCentrosTrabajoProcesoExcluidos(pIdProceso).pipe(
      catchError((error: HttpErrorResponse) => {
        this.dataService.Message().msgWarning(error.error.messages[0]); return of(null);
      }),
      finalize(() => this._loadingChangeCentros.next(false))
    ).subscribe((response: any) => {
      if (response) {
        this.dataSourceExcluidos.data = response;
        this.verCentrosTrabajoSeleccionados();
      }
    });
  }

  loadRegimenesLaboralesProceso(pIdProceso: any) {
    this._loadingChange.next(true);
    this.dataService.GestionProcesos().consultarAlcanceProcesoRegimenLaboral(pIdProceso).pipe(
      catchError(() => of([])),
      finalize(() => this._loadingChange.next(false))
    ).subscribe((response: any) => {
      if (response?.length > 0) 
        this.transferirSeleccionadosRegimenLaboral(response);
      else 
        this.dataService.Message().msgWarning(MESSAGE_GESTION.RESULT_NULL_REGIMEN_LABORAL, () => { });      
    });
  }

  loadTiposPlazaProceso(pIdProceso: any) {
    this._loadingChange.next(true);
    this.dataService.GestionProcesos().consultarAlcanceProcesoTipoPlaza(pIdProceso).pipe(
      catchError(() => of([])),
      finalize(() => this._loadingChange.next(false))
    ).subscribe((response: any) => {
      if (response?.length > 0) 
        this.transferirSeleccionadosTipoPlaza(response);
      else 
        this.dataService.Message().msgWarning(MESSAGE_GESTION.RESULT_NULL_TIPO_PLAZA, () => { });      
    });
  }

  loadCondicionesPlazaProceso(pIdProceso: any) {
    this._loadingChange.next(true);
    this.dataService.GestionProcesos().consultarAlcanceProcesoCondicionPlaza(pIdProceso).pipe(
      catchError(() => of([])),
      finalize(() => this._loadingChange.next(false))
    ).subscribe((response: any) => {
      if (response?.length > 0) {
        this.transferirSeleccionadosCondicionPlaza(response);
      } else {
        this.dataService.Message().msgWarning(MESSAGE_GESTION.RESULT_NULL_CONDICION_PLAZA, () => { });
      }
    });
  }

  loadCargosProceso(pIdProceso: any) {
    this._loadingChange.next(true);
    this.dataService.GestionProcesos().consultarAlcanceProcesoAreaDesempenioCargo(pIdProceso).pipe(
      catchError((error: HttpErrorResponse) => {
        this.dataService.Message().msgWarning(error.error.messages[0]); return of(null);
      }),
      finalize(() => this._loadingChange.next(false))
    ).subscribe((response: any) => {
      if (response?.length > 0) {
        this.dataSourceCargoSeleccionados.data = [];
        response.forEach(x => {
          const row  = {
            idAreaDesempenioCargo: x.idAreaDesempenioCargo,
            idRegimenLaboral: x.idRegimenLaboral,
            abreviaturaRegimenLaboral: x.abreviaturaRegimenLaboral,
            descripcionAreaDesempenioLaboral: x.descripcionAreaDesempenioLaboral,
            descripcionCatalogoItemTipoCargo: x.descripcionCatalogoItemTipoCargo,
            descripcionCargo: x.descripcionCargo,
          }
          this.dataSourceCargoSeleccionados.data = [...this.dataSourceCargoSeleccionados.data, row];
        });
        this.dataSourceCargoSeleccionados.paginator = this.paginatorCargos;
      }
    });
  }

  loadNivelesEducativosProceso(pIdProceso: any) {
    this._loadingChange.next(true);
    this.dataService.GestionProcesos().consultarAlcanceProcesoNivelEducativo(pIdProceso).pipe(
      catchError(() => of([])),
      finalize(() => this._loadingChange.next(false))
    ).subscribe((response: any) => {
      if (response?.length > 0) {
        this.transferirSeleccionadosNivelEducativo(response);
      }
    });
  }

  loadTiposGestionDependenciasProceso(pIdProceso: any) {
    this._loadingChange.next(true);
    this.dataService.GestionProcesos().consultarAlcanceProcesoTipoGestionDependencia(pIdProceso).pipe(
      catchError(() => of([])),
      finalize(() => this._loadingChange.next(false))
    ).subscribe((response: any) => {
      if (response?.length > 0) {
        this.transferirSeleccionadosTipoGestionDependencia(response);
      }
    });
  }

  loadTiposCentroTrabajoProceso(pIdProceso: any) {
    this._loadingChange.next(true);
    this.dataService.GestionProcesos().consultarAlcanceProcesoTipoCentroTrabajo(pIdProceso).pipe(
      catchError(() => of([])),
      finalize(() => this._loadingChange.next(false))
    ).subscribe((response: any) => {
      if (response?.length > 0) 
        this.transferirSeleccionadosTipoCentroTrabajo(response);
      else 
        this.dataService.Message().msgWarning(MESSAGE_GESTION.RESULT_NULL_TIPO_CENTRO_TRABAJO, () => { });      
    });
  }

  validarFormulario() {
    if (this.dataSource.data[0]?.totalRegistro == this.dataSourceExcluidos.data.length) {
      this.dataService.Message().msgWarning(MESSAGE_GESTION.M127, () => { });
      return;
    }
    if (this.dataSourceRegimenLaboralSeleccionados.length == 0) {
      this.dataService.Message().msgWarning(MESSAGE_GESTION.M160, () => { });
      return;
    }
    
    if (this.dataSourceTipoPlazaSeleccionados.length == 0) {
      this.dataService.Message().msgWarning(MESSAGE_GESTION.M162, () => { });
      return;
    }

    if (!this.dataSourceRegimenLaboralSeleccionados.every(row => 
      this.dataSourceTipoPlazaSeleccionados.some(x => x.idRegimenLaboral === row.idRegimenLaboral)
      )){
      this.dataService.Message().msgWarning(MESSAGE_GESTION.M170, () => { });
      return;
    }
    if (this.dataSourceCondicionPlazaSeleccionados.length == 0) {
      this.dataService.Message().msgWarning(MESSAGE_GESTION.M163, () => { });
      return;
    }

    if (!this.dataSourceRegimenLaboralSeleccionados.every(row => 
      this.dataSourceCondicionPlazaSeleccionados.some(x => x.idRegimenLaboral === row.idRegimenLaboral)
      )){
      this.dataService.Message().msgWarning(MESSAGE_GESTION.M171, () => { });
      return;
    }
    if (this.dataSourceCargoSeleccionados.data.length == 0) {
      this.dataService.Message().msgWarning(MESSAGE_GESTION.M166, () => { });
      return;
    }

    if (!this.dataSourceRegimenLaboralSeleccionados.every(row => 
      this.dataSourceCargoSeleccionados.data.some(x => x.idRegimenLaboral === row.idRegimenLaboral)
    )){
      this.dataService.Message().msgWarning(MESSAGE_GESTION.M172, () => { });
      return;
    }

    if (this.form.value.requierePlazaInstitucion) {
      if (this.dataSourceNivelEducativoSeleccionados.length == 0) {
        this.dataService.Message().msgWarning(MESSAGE_GESTION.M164, () => { });
        return;
      }
      if (this.dataSourceTipoGestionDependenciaSeleccionados.length == 0) {
        this.dataService.Message().msgWarning(MESSAGE_GESTION.M165, () => { });
        return;
      }
    }
    if (this.dataSourceTipoCentroTrabajoSeleccionados.length == 0) {
      this.dataService.Message().msgWarning(MESSAGE_GESTION.M161, () => { });
      return;
    }
    if (!this.form.valid) {
      this.dataService.Message().msgWarning(MESSAGE_GESTION.M08, () => { });
      return;
    }
    return true;
  }

  handleCrear() {
    if (!this.validarFormulario()) return;
    this.crearProceso();
  }

  crearProceso() {
    const form = this.form.value;
    const alcanceProceso: any[] = this.dataSourceExcluidos.data;
    const alcanceRegimenLaboral: any[] = this.dataSourceRegimenLaboralSeleccionados;
    const alcanceTipoPlaza: any[] = this.dataSourceTipoPlazaSeleccionados;
    const alcanceCondicionPlaza: any[] = this.dataSourceCondicionPlazaSeleccionados;
    const alcanceCargos: any[] = this.dataSourceCargoSeleccionados.data;
    const alcanceNivelEduactivo: any[] = this.dataSourceNivelEducativoSeleccionados;
    const alcanceTipoGestionDependencia: any[] = this.dataSourceTipoGestionDependenciaSeleccionados;
    const alcanceTipoCentroTrabajo: any[] = this.dataSourceTipoCentroTrabajoSeleccionados;
    let proceso = {
      idProceso: 0,
      codigoRolPassport: this.passport.codigoRol,
      idRegimenLaboral: form.idRegimenLaboral,
      idTipoProceso: form.idTipoProceso,
      idDescripcionMaestroProceso: form.idDescripcionMaestroProceso,
      idNumeroConvocatoria: this.combo.procesos.find(x => x.idDescripcionMaestroProceso === form.idDescripcionMaestroProceso).idNumeroConvocatoria,
      anio: form.anio,
      descripcionProceso: form.descripcionProceso,
      alcanceProceso: alcanceProceso.map(item => {
        return {
          idCentroTrabajo: item.idCentroTrabajo
        };
      }),
      procesoAlcanceRegimenLaboral: alcanceRegimenLaboral.map(item => {
        return {
          idRegimenLaboral: item.idRegimenLaboral
        };
      }),
      procesoAlcanceTipoPlaza: alcanceTipoPlaza.map(item => {
        return {
          idRegimenLaboral: item.idRegimenLaboral,
          idTipoPlaza: item.idTipoPlaza
        };
      }),
      procesoAlcanceCondicionPlaza: alcanceCondicionPlaza.map(item => {
        return {
          idRegimenLaboral: item.idRegimenLaboral,
          idCondicionPlaza: item.idCondicionPlaza
        };
      }),
      procesoAlcanceAreaDesempenioCargo: alcanceCargos.map(item => {
        return {
          idAreaDesempenioCargo: item.idAreaDesempenioCargo
        };
      }),
      procesoAlcanceNivelEducativo: alcanceNivelEduactivo.map(item => {
        return {
          idNivelEducativo: item.idNivelEducativo
        };
      }),
      procesoAlcanceTipoGestionDependencia: alcanceTipoGestionDependencia.map(item => {
        return {
          idInstitucionGestionDependencia: item.idInstitucionGestionDependencia
        };
      }),
      procesoAlcanceTipoCentroTrabajo: alcanceTipoCentroTrabajo.map(item => {
        return {
          idTipoCentroTrabajo: item.idTipoCentroTrabajo
        };
      }),
      usuarioCreacion: this.passport.numeroDocumento
    }

    this.dataService.Message().msgConfirm(MESSAGE_GESTION.M02, () => {
      this.dataService.Spinner().show("sp6");
      this.working = true;
      this.dataService
        .GestionProcesos()
        .crearProceso(proceso)
        .pipe(
          catchError((error: HttpErrorResponse) => {
            this.dataService.Message().msgWarning(error.error.messages[0]); return of(null);
          }),
          finalize(() => { this.dataService.Spinner().hide("sp6"); this.working = false; })
        )
        .subscribe(response => {
          if (response && response > 0) {
            this.dataService.Message().msgAutoCloseSuccessNoButton(MESSAGE_GESTION.M07, this.tiempoMensaje, () => { this.handleRegresar({ reload: true }); });
          }
        });
    }, () => { });
  }

  handleModificar() {
    if (!this.validarFormulario()) return;
    this.modificarProceso();
  }

  modificarProceso() {    
    const alcanceProceso: any[] = this.dataSourceExcluidos.data;
    const alcanceRegimenLaboral: any[] = this.dataSourceRegimenLaboralSeleccionados;
    const alcanceTipoPlaza: any[] = this.dataSourceTipoPlazaSeleccionados;
    const alcanceCondicionPlaza: any[] = this.dataSourceCondicionPlazaSeleccionados;
    const alcanceCargos: any[] = this.dataSourceCargoSeleccionados.data;
    const alcanceNivelEduactivo: any[] = this.dataSourceNivelEducativoSeleccionados;
    const alcanceTipoGestionDependencia: any[] = this.dataSourceTipoGestionDependenciaSeleccionados;
    const alcanceTipoCentroTrabajo: any[] = this.dataSourceTipoCentroTrabajoSeleccionados;
    let proceso = {
      idProceso: this.cabeceraProceso.idProceso,
      codigoRolPassport: this.passport.codigoRol,
      descripcionProceso: this.form.value.descripcionProceso,
      alcanceProceso: alcanceProceso.map(item => {
        return {
          idCentroTrabajo: item.idCentroTrabajo
        };
      }),
      procesoAlcanceRegimenLaboral: alcanceRegimenLaboral.map(item => {
        return {
          idRegimenLaboral: item.idRegimenLaboral
        };
      }),
      procesoAlcanceTipoPlaza: alcanceTipoPlaza.map(item => {
        return {
          idRegimenLaboral: item.idRegimenLaboral,
          idTipoPlaza: item.idTipoPlaza
        };
      }),
      procesoAlcanceCondicionPlaza: alcanceCondicionPlaza.map(item => {
        return {
          idRegimenLaboral: item.idRegimenLaboral,
          idCondicionPlaza: item.idCondicionPlaza
        };
      }),
      procesoAlcanceAreaDesempenioCargo: alcanceCargos.map(item => {
        return {
          idAreaDesempenioCargo: item.idAreaDesempenioCargo
        };
      }),
      procesoAlcanceNivelEducativo: alcanceNivelEduactivo.map(item => {
        return {
          idNivelEducativo: item.idNivelEducativo
        };
      }),
      procesoAlcanceTipoGestionDependencia: alcanceTipoGestionDependencia.map(item => {
        return {
          idInstitucionGestionDependencia: item.idInstitucionGestionDependencia
        };
      }),
      procesoAlcanceTipoCentroTrabajo: alcanceTipoCentroTrabajo.map(item => {
        return {
          idTipoCentroTrabajo: item.idTipoCentroTrabajo
        };
      }),
      usuarioModificacion: this.passport.numeroDocumento
    }

    this.dataService.Message().msgConfirm(MESSAGE_GESTION.M03, () => {
      this.dataService.Spinner().show("sp6");
      this.working = true;
      this.dataService
        .GestionProcesos()
        .modificarProceso(proceso)
        .pipe(
          catchError((error: HttpErrorResponse) => {
            this.dataService.Message().msgWarning(error.error.messages[0]); return of(null);
          }),
          finalize(() => { this.dataService.Spinner().hide("sp6"); this.working = false; })
        )
        .subscribe(response => {
          if (response && response > 0) {
            this.dataService.Message().msgAutoCloseSuccessNoButton(MESSAGE_GESTION.M07, this.tiempoMensaje, () => { this.handleRegresar({ reload: true }); });
          }
        });
    }, () => { });
  }

  handleNuevaConvocatoria() {
    if (!this.validarFormulario()) return;
    this.crearNuevaConvocatoria();
  }

  crearNuevaConvocatoria() {    
    const alcanceProceso: any[] = this.dataSourceExcluidos.data;
    const alcanceRegimenLaboral: any[] = this.dataSourceRegimenLaboralSeleccionados;
    const alcanceTipoPlaza: any[] = this.dataSourceTipoPlazaSeleccionados;
    const alcanceCondicionPlaza: any[] = this.dataSourceCondicionPlazaSeleccionados;
    const alcanceCargos: any[] = this.dataSourceCargoSeleccionados.data;
    const alcanceNivelEduactivo: any[] = this.dataSourceNivelEducativoSeleccionados;
    const alcanceTipoGestionDependencia: any[] = this.dataSourceTipoGestionDependenciaSeleccionados;
    const alcanceTipoCentroTrabajo: any[] = this.dataSourceTipoCentroTrabajoSeleccionados;
    let proceso = {
      idProceso: this.cabeceraProceso.idProceso,
      codigoRolPassport: this.passport.codigoRol,
      alcanceProceso: alcanceProceso.map(item => {
        return {
          idCentroTrabajo: item.idCentroTrabajo
        };
      }),
      procesoAlcanceRegimenLaboral: alcanceRegimenLaboral.map(item => {
        return {
          idRegimenLaboral: item.idRegimenLaboral
        };
      }),
      procesoAlcanceTipoPlaza: alcanceTipoPlaza.map(item => {
        return {
          idRegimenLaboral: item.idRegimenLaboral,
          idTipoPlaza: item.idTipoPlaza
        };
      }),
      procesoAlcanceCondicionPlaza: alcanceCondicionPlaza.map(item => {
        return {
          idRegimenLaboral: item.idRegimenLaboral,
          idCondicionPlaza: item.idCondicionPlaza
        };
      }),
      procesoAlcanceAreaDesempenioCargo: alcanceCargos.map(item => {
        return {
          idAreaDesempenioCargo: item.idAreaDesempenioCargo
        };
      }),
      procesoAlcanceNivelEducativo: alcanceNivelEduactivo.map(item => {
        return {
          idNivelEducativo: item.idNivelEducativo
        };
      }),
      procesoAlcanceTipoGestionDependencia: alcanceTipoGestionDependencia.map(item => {
        return {
          idInstitucionGestionDependencia: item.idInstitucionGestionDependencia
        };
      }),
      procesoAlcanceTipoCentroTrabajo: alcanceTipoCentroTrabajo.map(item => {
        return {
          idTipoCentroTrabajo: item.idTipoCentroTrabajo
        };
      }),
      usuarioCreacion: this.passport.numeroDocumento
    }

    this.dataService.Message().msgConfirm(MESSAGE_GESTION.M02, () => {
      this.dataService.Spinner().show("sp6");
      this.working = true;
      this.dataService
        .GestionProcesos()
        .crearNuevaConvocatoriaProceso(proceso)
        .pipe(
          catchError((error: HttpErrorResponse) => {
            this.dataService.Message().msgWarning(error.error.messages[0]); return of(null);
          }),
          finalize(() => { this.dataService.Spinner().hide("sp6"); this.working = false; })
        )
        .subscribe(response => {
          if (response && response > 0) {
            this.dataService.Message().msgAutoCloseSuccessNoButton(MESSAGE_GESTION.M07, this.tiempoMensaje, () => { this.handleRegresar({ reload: true }); });
          }
        });
    }, () => { });
  }

  handleRegresar(data?: any) {
    this.router.navigate(['../../../'], { relativeTo: this.route });
  }

  loadDataModify(idProceso: any) {

    this.loadRegimenesLaboralesProceso(idProceso);
    this.loadTiposPlazaProceso(idProceso);
    this.loadCondicionesPlazaProceso(idProceso);
    this.loadCargosProceso(idProceso);
    this.loadNivelesEducativosProceso(idProceso);
    this.loadTiposGestionDependenciasProceso(idProceso);
    this.loadTiposCentroTrabajoProceso(idProceso);

  }

}