import { SelectionModel } from '@angular/cdk/collections';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { MatTableDataSource } from '@angular/material/table';
import { ActivatedRoute, Router } from '@angular/router';
import { mineduAnimations } from '@minedu/animations/animations';
import { DataService } from 'app/core/data/data.service';
import { SecurityModel } from 'app/core/model/security/security.model';
import { SharedService } from 'app/core/shared/shared.service';
import { BehaviorSubject, of } from 'rxjs';
import { catchError, finalize } from 'rxjs/operators';
import { BuscarPlazaComponent } from '../../gestionar-vinculacion/components/buscar-plaza/buscar-plaza.component';
import { GenerarProyectoComponent } from '../components/generar-proyecto/generar-proyecto.component';
import { BuscarAdjudicacionesComponent } from './components/buscar-adjudicaciones/buscar-adjudicaciones.component';
import { BuscarSancionAdministrativaComponent } from './components/buscar-sancion-administrativa/buscar-sancion-administrativa.component';
import { BuscarVinculacionesComponent } from './components/buscar-vinculaciones/buscar-vinculaciones.component';
import { ObservarVinculacionComponent } from './components/observar-vinculacion/observar-vinculacion.component';
import { saveAs } from 'file-saver';
import { ModalSolicitarInformacionComponent } from './components/modal-solicitar-informacion/modal-solicitar-informacion.component';
import { ResumenPlazasResponseModel } from 'app/main/apps/procesos/contratacion-30493/models/contratacion.model';
import { criterioBusqueda, MESSAGE_GESTION, TablaEstadoVinculacion } from '../models/vinculacion.model';
import { RechazarAutoizacionComponent } from './components/rechazar-autorizacion/rechazar-autorizacion.component';
import { ModalInformacionPlaza } from './components/modal-informacion-plaza/modal-informacion-plaza.component';
import { InformacionPlazaComponent } from './components/informacion-plaza/informacion-plaza.component';
import { SolicitarAutorizacionComponent } from './components/solicitar-autorizacion/solicitar-autorizacion.component';
import { DocumentViewerComponent } from 'app/main/apps/components/document-viewer/document-viewer.component';
import { ListarPlazasComponent } from '../components/listar-plazas/listar.plazas.components';
import { ConformidadAdjudicacionComponent } from './components/conformidad-adjudicacion/conformidad-adjudicacion.component';
import { FormacionAcademicaComponent } from './components/formacion-academica/formacion-academica.component';
import { CodigoDreUgelService } from '../../pronoei/services/codigo-dre-ugel.service';

@Component({
  selector: 'minedu-vinculacion',
  templateUrl: './vinculacion.component.html',
  styleUrls: ['./vinculacion.component.scss'],
  encapsulation: ViewEncapsulation.None,
  animations: mineduAnimations
})
export class VinculacionComponent implements OnInit {  

  nombreCabecera = "";
  nombreCabecera2 = "";
  isAprobacion : boolean = false;

  dataUserLoginModel: any;
  minDate = new Date(new Date().getFullYear(), 0, 1)
  untilDate = new Date(new Date().getFullYear() + 1, 11, 31);
  maxDate =  new Date(new Date().getFullYear() , 11, 31);
  finDia =  new Date(new Date().getFullYear() , 11, 31);
  nowDate = new Date();

  private currentSession: SecurityModel = new SecurityModel();
  private passport: SecurityModel = new SecurityModel();

  MotivoEnProceso: boolean = true;
  estaEnProcesoAdjudicacion: boolean = true;

  persona: any = {};

  validarEdad: any = {};
  personaValidacion: any = {};
  fechasValidacion: any = {};
  plaza: any = {};
  adjudicacion: any = {};

  datos_contrato: any = {};

  Nombre_Usuario = "";
  idDre : any;
  idUgel : any;
  codigoTipoSede = "";
  codigoSede = "";
  codigoRol = "";

  seBuscoPersona: boolean = false;
  seBuscoPlaza: boolean = false;
  verFechainicio: boolean = true;
  documentoEscalafon: boolean = true;

  seEnviaAccionesGrabadas: boolean = false;

  tieneVinculacionesVigente: boolean = false;
  tieneSancionesAdministrativas: boolean = false;
  VerObservacion: boolean = true;

  tieneGradoAcademico: boolean = false;

  nivelSecundaria: boolean = false;
  nivelSuperior: boolean = false;
  nivelGradoPendiente: boolean = false; 
  nivelEstudio: boolean = false;
  nivelGradoAcademico: boolean = false;
  nivelSituacionAcademico: boolean = false;

  fileDocumentoSustento: any = null;

  codigoProcesoAprobacion: any = null;

  tipoValidacionFecha = 0;
  idRegimenLaboral = 0;
  idMotivoAccion = 0;
  fechaValidacion = new Date();
  TipoPlaza = 0;
  idPlazaDesierta = 0;
  idPlaza = 0;
  idSituacionAcademica = 0;
  idConGrado = 0;
  id_nivel_especifico  = 0;
  id_situacion_academica = 0;
  id_grado_academico = 0;
  codigo_nivel = 0;
  codigo_nivel_especifico = 0;

  tipoValidacionFechaInicio = 0;
  tipoValidacionFechaFin = 0;

  tipoSancion = 0;
  mensajeSancion = "";
  mensajeEdad = "";
  tipo_vinculacion_vigentes = 0;

  codigo_grado_academico = 0;
  codigo_situacion_academica = 0;
  id_maestro_formacion_academica : any;
  newMinDate = new Date(new Date().getFullYear(), 0, 1)


  verFecha: number = 1;

  En_Vinculacion: number = 5;

  isMandatoJudicial: boolean = false;
  isMotivoMandatoJudicial : boolean = false;
  mandato_judicial_desc = "NO";

  tieneDocumento: boolean = true;
  datos_cabecera: any = {};
  datos_accion: any = {};
  datos_pensionario: any = {};
  datos_Formacion_Academica: any = {};
  datos_Contacto: any = {};

  verInformacionTieneImpedimento :  boolean = true;
  verInformacionRegimenPensionario : boolean = true;
  verInformacionFormacionAcademica : boolean = true;
  verInformacionDatosContacto : boolean = true;
  verInformacionAnotacion : boolean = true;
  tieneFormacionAcademica: boolean = false;

  CompletarDatos: boolean = true;

  verBotonEscalafon: boolean = false;

  combo = {
    regimenesLaborales: [],
    acciones: [],
    motivosAccion: [],
    tiposDocumentoIdentidad: [],
    adjudicaciones: [],
    tiposResolucion: [],
    regimenesPensionarios: [],
    afps: [],
    nivelesEducativos: [],
    nivelesSecundaria: [],
    nivelesSuperior: [],
    nivelesGrado: [],

    gradosAcademicos: [],
    areasCurriculares: [],
    centrosEstudio: [],
    situacionesAcademicas: [],

    tiposDocumento: [],
    tiposFormato: [],
    tiposComision: [],

    departamentos: [],
    provincias: [],
    distritos: [],
  };

  displayedColumns: string[] = [
    'index',
    'tipoDocumento',
    'numeroDocumento',
    'fechaEmision',
    'tipoFormato',
    'folios',
    'fechaRegistro',
    'opciones'
  ];

  private _loadingChange = new BehaviorSubject<boolean>(false);
  loading = this._loadingChange.asObservable();
  dataSource: MatTableDataSource<any>;
  selection = new SelectionModel<any>(false, []);

  dialogRef: any;
  form: FormGroup;
  working = false;

  id_gestion_vinculacion: any;
  id_gestion_contrato: any;
  id_gestion_adenda: any;  

  codigoAprobacion: "";
  codigo_estado_vinculacion: 0;

  tipo_vinculacion: any; // (v) vinculacion, (c) contrato, (a) adenda
  tipo_accion: any; // (i) informacion

  isNew: boolean = true;
  isEdit: boolean = false;
  isCompletar: boolean = false;  
  isBuscar: boolean = false;
  isInformacion: boolean = false;
  
  vinculacion: {};

  codigo_centro_trabajo : any;
  codigo_rol : any;

  regEmail =
    /^\s*$|^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

  constructor(
    private formBuilder: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private materialDialog: MatDialog,
    private dataService: DataService,
    private sharedService: SharedService,
    private codigoDreUgelService: CodigoDreUgelService
      ) {
  }

  ngOnInit(): void {
      
    this.recargarTodo();
    
  }

  async recargarTodo(){
    this.maxDate = this.untilDate;
    this.obtenerPeriodoLectivo();

    this.route.paramMap.subscribe((params: any) => {
      //tipo => vinculacion (v), contrato (c), adenda(a)
      this.tipo_vinculacion = params.get('tipo');
      console.log('this.tipo_vinculacion => ',this.tipo_vinculacion);
    });

    debugger;
    this.buildForm();
    this.buildPassport();
    await this.getDreUgelData();
    this.buildSeguridad();  

    //this.obtenerCodigoDreUgelLogeado();

    this.loadCombos();
    this.dataSource = new MatTableDataSource([]);
    setTimeout(_ => this.buildShared());

    this.route.paramMap.subscribe((params: any) => {
      //tipo => vinculacion (v), contrato (c), adenda(a)
      this.tipo_vinculacion = params.get('tipo');
      this.id_gestion_vinculacion = params.get('id');

     
        this.nombreCabecera = "Nueva Vinculación";
        console.log('Nueva Vinculación');

      if (this.id_gestion_vinculacion != undefined && this.id_gestion_vinculacion > 0) {

        if(this.tipo_vinculacion == "informacion") {
          this.nombreCabecera = "Información completa";
          console.log('informacion');
          this.isInformacion = true;
        } 
        
        if(this.tipo_vinculacion == "modificar") {
          this.nombreCabecera = "Modificar Vinculación";
          console.log('editar');
          this.isEdit = true;
          this.form.get('adjuntarDocumento').clearValidators();
        }

        if(this.tipo_vinculacion == "aprobacion") {
          this.nombreCabecera = "Aprobación - Vinculación por Mandato Judicial";
          console.log('aprobacion');
          this.isInformacion = true;
          this.isAprobacion = true;
        }

        if(this.tipo_vinculacion == "completar") {
          this.nombreCabecera = "Modificar Vinculación";
          console.log('editar');
          this.isEdit = true;
          this.isCompletar = true;
          this.form.get('adjuntarDocumento').clearValidators();
        }

        this.isNew = false;   
        this.VerObservacion = false;  

        this.id_gestion_vinculacion = parseInt(params.get('id'));

        this.loadVinculacionPorId();
        
      } else {
        this.form.get('adjuntarDocumento').setValidators(Validators.required);
      }

    });
    console.log('isMandatoJudicial' , this.isMandatoJudicial);
    console.log('isInformacion', this.isInformacion);
    console.log('isNew', this.isNew);
  }

  buildSeguridad = () => {    

    this.currentSession = this.dataService.Storage().getInformacionUsuario();
  }

  private async getDreUgelData() {

    /*
    this.codigoTipoSede = this.codigoDreUgelService.passportModel.CODIGO_TIPO_SEDE;
    this.codigoSede = this.codigoDreUgelService.passportModel.CODIGO_SEDE;
    this.codigoRol = this.codigoDreUgelService.passportModel.CODIGO_ROL;
    */

    var entidadSede = await this.codigoDreUgelService.getCodigoDreUgelFromServiceInit();
    const codigos = this.codigoDreUgelService.getCodigoDreUgel();
    const entidadPassport = this.codigoDreUgelService.passportModel
    const tipoSedeList = ['TS001', 'TS002', 'TS012'];
    if (entidadPassport.CODIGO_ROL == 'AYNI_019' &&
        (!entidadSede || !entidadSede?.codigoTipoSede || !tipoSedeList.includes(entidadSede.codigoTipoSede))) {
        this.router.navigate(['/ayni/personal/inicio']);
        return;
    }

    if (codigos) {          
        this.idUgel = codigos.idUgel;
        this.idDre = codigos.idDre;  
    }

    

  }

  handleAutorizar(){

    let mensaje = '¿ESTÁ SEGURO QUE DESEA AUTORIZAR LA VINCULACIÓN?'

    this.dataService.Message().msgConfirm(mensaje, () => {

      let viewModel = {        
        idVinculacion: this.id_gestion_vinculacion,
        codigoAprobacion: this.codigoAprobacion,
        usuarioCreacion: this.passport.numeroDocumento,
        TipoDocumentoAprobador: 1,
        numeroDocumentoAprobador: this.passport.numeroDocumento,
        
        codigoRol: this.passport.codigoRol,
        idUgel: this.idUgel,
        idDre:  this.idDre,
        codigoCentroTrabajo: this.plaza.codigo_centro_trabajo,
        primerApellidoAprobador: this.persona.primerApellido,
        segundoApellidoAprobador:this.persona.segundoApellido,
        nombresAprobador: this.persona.nombres,
        motivoRechazo: "",
      }

      this.dataService.AccionesVinculacion().aprobarVinculacion(viewModel).pipe(
        catchError((e) => of(e)),
        finalize(() => {
          this.dataService.Spinner().hide("sp6")
          this.working = false;
        })
      ).subscribe(response => {
        if (response) {
          this.dataService.Message().msgAutoCloseSuccessNoButton("OPERACIÓN REALIZADA DE FORMA EXITOSA", 3000, () => {
            this.router.navigate(['ayni/personal/acciones/vinculacion'])
          });     
        } else if (response && (response.statusCode === 422 || response.statusCode === 404)) {
          this.dataService.Message().msgWarning(response.messages[0], () => { });
        } else {
          this.dataService.Message().msgWarning('"ERROR, NO SE PUDO REGISTRAR LA OBSERVACIÓN".', () => { });
        }
      });      
      
    }, () => {
      console.log('cancel confirm')
     });

  }

  handleNoAutorizar(){

     let data = this.getDataView();

     let viewModel = {        
      idVinculacion: this.id_gestion_vinculacion,
      codigoAprobacion: this.codigoAprobacion,
      usuarioCreacion: this.passport.numeroDocumento,
      TipoDocumentoAprobador: 1,
      numeroDocumentoAprobador: this.passport.numeroDocumento,

      codigoRol: this.passport.codigoRol,
      idUgel: this.idUgel,
      idDre: this.idDre,
      codigoCentroTrabajo: this.plaza.codigo_centro_trabajo,
      primerApellidoAprobador: this.persona.primerApellido,
      segundoApellidoAprobador:this.persona.segundoApellido,
      nombresAprobador: this.persona.nombres
    }

    let dialogRef = this.materialDialog.open(RechazarAutoizacionComponent, {
      panelClass: 'Minedu-rechazar-autorizacion-dialog',
        disableClose: true,
        data: {
          id_gestion_vinculacion: this.id_gestion_vinculacion,
          dataAprobacion: viewModel,
          is_saved: false,
          info: data,
          dialogTitle: 'Rechazar solicitud de autorización'
        }
    });
    dialogRef.afterClosed()
    .subscribe((response: any) => {
      if (!response) {
        return;
      }
      console.log(response);
    });

  }

 

  buildShared() {
    if (this.tipo_vinculacion == "aprobacion") {
      this.sharedService.setSharedBreadcrumb("Aprobación");
      this.sharedService.setSharedTitle("Aprobación");
    }
    else {
      this.sharedService.setSharedBreadcrumb("Vinculación");
      this.sharedService.setSharedTitle("Vinculación");
    }
  }

  buildForm() {
    

      this.form = this.formBuilder.group({
        idRegimenLaboral: [null, Validators.required],
        idAccion: [0, Validators.required],
        idMotivoAccion: [0, Validators.required],
        esMandatoJudicial: [false, Validators.required],
        porProceso:  [false, Validators.required],
        idTipoDocumentoIdentidad: [-1],
        TipoDocumentoIdentidad: [null],
        numeroDocumentoIdentidad: [null],
        idAdjudicacion: [null],
        idPlaza: [null],
        codigoPlaza: [null],
        itemPlaza: [null],        
        idTipoResolucion: [null],
        fechaInicio: [null, Validators.required],
        fechaTermino: [null, Validators.required],
        fechaInicioStr: [null],
        fechaTerminoStr: [null],
        idRegimenPensionario: [null, Validators.required],
        idAfp: [null],
        idTipoComision: [null],
        fechaDevengue: [null],
        fechaDevengueStr: [null],
        folios: [null, Validators.compose([Validators.required, Validators.pattern(/^[0-9]\d*$/), Validators.maxLength(3)])],
        numeroCuspp: [null],
        fechaIngresoSPP: [null, Validators.required],
        fechaIngresoSPPStr: [null],
        idNivelEducativo: [null, Validators.required],
        idSecundaria: [null],
        idSuperior: [null],
        idGrado: [null],
        idEstudio: [null],

        
        idAreaCurricular: [null],
        idCentroEstudio: [null],
        anioInicio: [null],
        anioFinal: [null],
        titulos: [null, Validators.required],
        especialidad: [null, Validators.required],
        nroRegistroTitulo: [null, Validators.required],
        fechaExpedicionGrado: [null],
        idSituacionAcademica: [null, Validators.required],
        correoElectronico: [null, [Validators.required, Validators.pattern(this.regEmail)]],
        celular: [null, Validators.required],
        telefonoFijo: [null],
        anotaciones: [null],

        idTipoDocumento: [null],
        numeroDocumento: [null],
        entidadEmisora: [null],
        fechaEmision: [null],
        idTipoFormato: [null],
        sumilla: [null],
        codigoDocumento: [null],        
        tieneImpedimento: [false, this.tipo_vinculacion == 'informacion' ? '' : Validators.required],
        adjuntarDocumento: [null],
        numeroRuc: [null],
        renumeracionMensual: [null],
        direccionDomicilio: [null],
        idDepartamento: [null],
        idProvincia: [null],
        idDistrito: [null],

        enVinculacion: 5,

        codigoDocumentoPensionario: [null],       

      });

      this.form.get("folios").valueChanges.subscribe(value => {
        if (value && value.slice(0, 1) == "0") 
          this.form.patchValue({ folios: value.replace(/^0+/, '') });
      });

      this.form.get("fechaInicio").valueChanges.subscribe(value => {
        if (value) {
          //Limpiar Fecha Fin
          this.form.controls['fechaTermino'].reset();

          this.validacionFechaVinculacion2();
        }
      });   

  }


  verInformacionPlaza() {
    let dialogRef = this.materialDialog.open(InformacionPlazaComponent, {
      panelClass: 'Minedu-informacion-plaza-dialog',
        disableClose: true,
        data: {
          plaza: this.plaza
        }
    });
    dialogRef.afterClosed()
    .subscribe((response: any) => {
      if (!response) {
        return;
      }
      console.log(response);
    });
  }

  onChangeTipoDocumento() {
    const idTipoDocumento = this.form.get('idTipoDocumentoIdentidad').value;
    // if (idTipoDocumento == -1) {
    this.form.patchValue({
      numeroDocumentoIdentidad: ''
    });
    // }
  }

  buildPassport() {
    this.passport = this.dataService.Storage().getInformacionUsuario();
    const usuario = this.dataService.Storage().getPassportUserData();
    this.Nombre_Usuario = usuario.NOMBRES_USUARIO;
    const rolSelected = this.dataService.Storage().getPassportRolSelected();
  }

  obtenerCodigoDreUgelLogeado(): void {
    const rolSelected = this.dataService.Storage().getPassportRolSelected();
    const request = {
      codigoEntidadSede: rolSelected.CODIGO_SEDE
    };
    console.log('obtenerCodigoDreUgelLogeado(request) =>', request);
    this.dataService.AccionesVinculacion().getCodigoDreUgel(request).subscribe(
      (response) => {
        console.log('obtenerCodigoDreUgelLogeado() =>', response);
        this.dataUserLoginModel = response;
      }, 
      (error: HttpErrorResponse) => {
      }
    )
  }

  onKeyPressNumeroDocumento(e: any): boolean {
    let _idTipoDocumento  = this.form.get('idTipoDocumentoIdentidad').value;
    let tipoDocumentoSelect = this.combo.tiposDocumentoIdentidad.find(m => m.id_catalogo_item == _idTipoDocumento);
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

  onKeyPressSoloNumeros(e: any): boolean {
      const reg = /^\d+$/;
      const pressedKey = String.fromCharCode(!e.charCode ? e.which : e.charCode);
      if (!reg.test(pressedKey)) {
        e.preventDefault();
        return false;
      }
  }

  buscarPersona(event) {
      
    if (!(this.form.get('idTipoDocumentoIdentidad').value > 0 && this.form.get('numeroDocumentoIdentidad').value.length > 0)) {
      return;
    }

    if (!(this.form.get('idMotivoAccion').value > 0 )) {
      this.dataService.Message().msgWarning(MESSAGE_GESTION.M08);
      return;
    }

    let idMotivoAccionSelected = this.form.get('idMotivoAccion').value;
    //let esEnProcesoAdjudicacion = this.combo.motivosAccion.filter(m => m.id_motivo_accion == idMotivoAccionSelected)[0].es_proceso;
    this.dataService.Spinner().show("sp6");

    // validar duplicado
    let request = {
      numeroDocumento : this.form.get('numeroDocumentoIdentidad').value,
      idTipoDocumento : this.form.get('idTipoDocumentoIdentidad').value,
      idRegimenLaboral: this.form.get('idRegimenLaboral').value,
      idAccion: this.form.get('idAccion').value,
      idMotivoAccion: this.form.get('idMotivoAccion').value,
      idDre: this.idDre,
      idUgel:  this.idUgel
    }
    this.dataService.AccionesVinculacion().validarvinculacion(request).subscribe(
      (response) => {
        
        this.personaValidacion = response;
        console.log("personaValidacion => ", this.personaValidacion)
        if (this.personaValidacion.bError) {

          this.dataService.Spinner().hide("sp6");
          if(this.personaValidacion.iTipoMensajeSancion > 0) {
            // Mostrar Modal Sanción Administrativo

            this.persona.idTipoDocumentoIdentidad = this.form.get('idTipoDocumentoIdentidad').value;
            this.persona.numeroDocumentoIdentidad = this.form.get('numeroDocumentoIdentidad').value;
            this.persona.primerApellido = this.personaValidacion.primerApellido;
            this.persona.segundoApellido = this.personaValidacion.segundoApellido;
            this.persona.nombres = this.personaValidacion.nombres;

            this.tipoSancion = this.personaValidacion.iTipoMensajeSancion;            
            this.mensajeSancion = this.personaValidacion.mensaje;
            this.idRegimenLaboral = this.form.get('idRegimenLaboral').value;            
            
            this.handleSancionesAdministrativas();
          } else {
            this.dataService.Message().msgWarning(this.personaValidacion.mensaje);
          }
          
        }  else {
          if(this.personaValidacion.tiene_datos_pensionarios){
            this.tieneFormacionAcademica = true;
          } else {
            this.tieneFormacionAcademica = false;
          }

          this.buscarPersonaFiltro();

          this.ValidarFechasVinculacion();
          
        }
      },
      (error: HttpErrorResponse) => {
        console.log(error);
        this.dataService.Spinner().hide("sp6");
        this.dataService.Message().msgWarning('"'+error.error.messages[0]+'"');
        this.seBuscoPersona = false;
      }
    )    
  }

  ValidarFechasVinculacion(){

    let request = {
      idRegimenLaboral: this.form.get('idRegimenLaboral').value,
      idAccion: this.form.get('idAccion').value,
      idMotivoAccion: this.form.get('idMotivoAccion').value
    }

    this.dataService.AccionesVinculacion().validarFechasVinculacion(request).subscribe(
      (response) => {
        
        this.fechasValidacion = response;

        this.minDate = this.fechasValidacion.minFechaInicio;
        this.untilDate = this.fechasValidacion.maxFechaInicio;

        this.tipoValidacionFechaInicio = this.fechasValidacion.tipoValidacion;
        this.tipoValidacionFechaFin = this.fechasValidacion.tipoValidacionFechaFin;
        
      },
      (error: HttpErrorResponse) => {
        console.log(error);
        this.dataService.Spinner().hide("sp6");
        this.dataService.Message().msgWarning('"'+error.error.messages[0]+'"');
        this.seBuscoPersona = false;
      }
    )   

  }

  ValidarEdad(idRegimenLaboral, idAccion, idMotivoAccion, edad){

    let request = {
      idRegimenLaboral: idRegimenLaboral,
      idAccion: idAccion,
      idMotivoAccion: idMotivoAccion,
      edad: edad
    }

    this.dataService.AccionesVinculacion().validarEdad(request).subscribe(
      (response) => {        
        this.validarEdad = response;    

        if (this.validarEdad.bRespuesta) {          
          this.mensajeEdad = this.validarEdad.mensaje;
          return true;
        }  else {
          return false;          
        }
      },
      (error: HttpErrorResponse) => {
        console.log(error);
        this.dataService.Spinner().hide("sp6");
        this.dataService.Message().msgWarning('"'+error.error.messages[0]+'"');
        this.seBuscoPersona = false;
      }
    )   
    return false;
  }

  buscarPersonaFiltro(){
    if (this.estaEnProcesoAdjudicacion) {
      let request = {
        numeroDocumento : this.form.get('numeroDocumentoIdentidad').value,
        idTipoDocumento : this.form.get('idTipoDocumentoIdentidad').value,
        idRegimenLaboral : this.form.get('idRegimenLaboral').value,
        idAccion : this.form.get('idAccion').value,
        idMotivoAccion : this.form.get('idMotivoAccion').value,
      }
      this.dataService.AccionesVinculacion().getPersonaConProcesoAdjudicacion(request).subscribe(
        (response) => {
          console.log("getPersonaConProcesoAdjudicacion() => ", response);
          this.dataService.Spinner().hide("sp6");
          if (response != null) {
            
            this.persona = response;
            this.seBuscoPersona = true;
            debugger;                  
                        
            this.getAdjudicacionesVigentes(this.persona);  

          } else {
            this.dataService.Message().msgWarning('"NÚMERO DE DOCUMENTO NO SE ENCUENTRA ADJUDICADO EN EL PROCESO DE CONTRATACIÓN, POR LO TANTO NO SE PUEDE REALIZAR LA VINCULACIÓN"');
            this.seBuscoPersona = false;
          }
        },
        (error: HttpErrorResponse) => {
          console.log(error);
          this.dataService.Spinner().hide("sp6");
          this.dataService.Message().msgWarning('"'+error.error.messages[0]+'"');          
          this.seBuscoPersona = false;
        }
      )
    } else {

      //1-Buscar en Reniec o Migraciones
      let request = {
        numeroDocumentoIdentidad : this.form.get('numeroDocumentoIdentidad').value,
        idTipoDocumentoIdentidad : this.form.get('idTipoDocumentoIdentidad').value,
        idRegimenLaboral : this.form.get('idRegimenLaboral').value,
        idAccion : this.form.get('idAccion').value,
        idMotivoAccion : this.form.get('idMotivoAccion').value
      }
      this.dataService.AccionesVinculacion().getPersona(request).subscribe(
        (response) => {
          
          if (response != null) {
          console.log("getPersona() => ", response);
          this.dataService.Spinner().hide("sp6");
          
          this.persona = response;            
          this.seBuscoPersona = true;
          this.idRegimenLaboral = this.form.get('idRegimenLaboral').value;
          this.idMotivoAccion = this.form.get('idMotivoAccion').value;
          this.tieneVinculacionesVigente = this.persona.tiene_vinculaciones;
          this.tipo_vinculacion_vigentes = this.persona.tipo_vinculacion_vigentes;
                        
          debugger;
          if(this.tieneVinculacionesVigente){

            if(this.tipo_vinculacion_vigentes > 0){

              this.handleVerVinculacionVigente();

            }
          }

          } else {

            if(request.idTipoDocumentoIdentidad == 1) {              
              this.dataService.Message().msgWarning(MESSAGE_GESTION.M31);
            }
            if(request.idTipoDocumentoIdentidad == 4) {
              this.dataService.Message().msgWarning(MESSAGE_GESTION.M195);
            }
            if(request.idTipoDocumentoIdentidad == 5) {
              this.dataService.Message().msgWarning(MESSAGE_GESTION.M125);
            }

            this.seBuscoPersona = false;

          }
            
        },
        (error: HttpErrorResponse) => {                    
          this.dataService.Message().msgWarning('"'+error.error.messages[0]+'"');
          this.dataService.Spinner().hide("sp6");
          console.log(error);
        }
      )
    }

    this.form.patchValue({
      numeroDocumentoIdentidad: '',
      idTipoDocumentoIdentidad: -1
    });   
  }

  handleBuscarPersonaDatosEstudiosPensionario() {
    let request = {
      id_tipo_documento: this.persona.idTipoDocumentoIdentidad,
      numero_documento: this.persona.numeroDocumentoIdentidad
    }

    this.dataService.AccionesVinculacion().getPersonaDatosEstudiosPensionario(request).subscribe(
      (response) => {
        console.log("handleBuscarPersonaDatosEstudiosPensionario => response => ", response);
        if (response) {
          debugger;

          this.documentoEscalafon = true;

          this.form.get('adjuntarDocumento').clearValidators();

          this.form.patchValue({            
            numeroCuspp: response.datosPensionarios[0].numero_cussp,
            fechaIngresoSPP: response.datosPensionarios[0].fecha_afiliacion,
            fechaDevengue: response.datosPensionarios[0].fecha_primer_devengue,
            folios: response.datosPensionarios[0].folios,
            codigoDocumentoPensionario: response.datosPensionarios[0].documento_pensionario,
          })
         
          this.form.patchValue({
            idRegimenPensionario: this.combo.regimenesPensionarios.filter(m => m.codigo_regimen_pensionario == response.datosPensionarios[0].codigo_regimen_pensionario)[0].id_regimen_pensionario,
            idAfp: this.combo.afps.filter(m => m.codigo_afp == response.datosPensionarios[0].codigo_afp)[0].id_afp,            
            idTipoComision: this.combo.tiposComision.filter(m => m.codigo_catalogo_item == response.datosPensionarios[0].codigo_tipo_comision_pensionaria)[0].id_catalogo_item          
          })          

        }
      },
      (error: HttpErrorResponse) => {

      }
    )
  }
  

  esMotivoAccionProceso (idMotivoAccionSelected) {

    //let data = this.form.value;

    this.MotivoEnProceso = this.combo.motivosAccion.filter(m => m.id_motivo_accion == idMotivoAccionSelected)[0].es_proceso;
    this.estaEnProcesoAdjudicacion = this.MotivoEnProceso;

    this.form.patchValue({      
      porProceso:  this.MotivoEnProceso    
    });

    this.isMotivoMandatoJudicial = this.combo.motivosAccion.filter(m => m.id_motivo_accion == idMotivoAccionSelected)[0].mandato_judicial;

    this.validarMandatoJudicial();

    if(this.seBuscoPersona && this.isEdit == false && this.isInformacion == false) {
      this.LimpiarAccion();
    }

    this.ValidarMotivoMandatoJudicial();    
  }

  validarPorProceso() {

    let data = this.form.value;

    this.estaEnProcesoAdjudicacion = data.porProceso;

    if(data.idMotivoAccion > 0){
      if(this.estaEnProcesoAdjudicacion) {
        // Continua
        if(this.MotivoEnProceso == false) {
          this.dataService.Message().msgWarning(MESSAGE_GESTION.M198B, () => { 
            this.form.patchValue({      
              porProceso:  false      
            });
           });  

           this.estaEnProcesoAdjudicacion = false;
           return;
        }
      } 
  
      if(this.seBuscoPersona && this.isEdit == false && this.isInformacion == false) {
        this.LimpiarAccion();
      }    
  
      if(this.isMandatoJudicial && this.estaEnProcesoAdjudicacion) {
        this.dataService.Message().msgWarning(MESSAGE_GESTION.M216, () => { 
          this.form.patchValue({      
            esMandatoJudicial:  false      
          });
         });  

         this.isMandatoJudicial = false;  
      }
  
    } else {
      this.form.patchValue({      
        porProceso:  false      
      });
      return;
    }    

  }

  ValidarMotivoMandatoJudicial(){

    

    if(this.isMotivoMandatoJudicial == false && this.isMandatoJudicial) {
      this.dataService.Message().msgWarning(MESSAGE_GESTION.M198, () => { 
        this.form.patchValue({
          idMotivoAccion: -1
        })
       });      
    }

    if(this.isMandatoJudicial && this.estaEnProcesoAdjudicacion) {
      this.dataService.Message().msgWarning(MESSAGE_GESTION.M216, () => { 
        this.form.patchValue({      
          esMandatoJudicial:  false      
        });
       });  

       this.isMandatoJudicial = false;

    }

  }

  setValidacionMotivoAccion () {
    let idMotivoAccionSelected = this.form.get('idMotivoAccion').value;
    let motivo_accion = this.combo.motivosAccion.filter(m => m.id_motivo_accion == idMotivoAccionSelected)[0];
    
    let ux_current_start_date = (new Date(this.form.get('fechaInicio').value)) 
    let current_start_date = (new Date(this.form.get('fechaInicio').value)) 

    if (motivo_accion.codigo_motivo_accion == 232) { //CONTRATACION EXCEPCIONAL
      
      this.maxDate = new Date(current_start_date.setDate(current_start_date.getDate() + 30))

    } else if (motivo_accion.codigo_motivo_accion == 111) { // RECONOCER SOLO PARA EFECTOS DE PAGO
      this.maxDate = new Date(current_start_date.setDate(current_start_date.getDate() + 30))
    }
    else {
      this.maxDate = new Date(new Date().getFullYear(), 11, 31);
    }

  }

  onChangeRegimenPensionario(idRegimenPensionario) {
    /*
    if (idRegimenPensionario != 322) { //si no es sistema privado de pensiones
      this.form.get('idAfp').clearValidators();
      this.form.get('idTipoComision').clearValidators();
      // this.form.get('idRegimenPensionario').clearValidators();
    } else {
      this.form.get('idAfp').setValidators(Validators.required);
      this.form.get('idTipoComision').setValidators(Validators.required);
    }
    */
      
    let idRegimenPensionarioSelect = this.form.get('idRegimenPensionario').value;

    if (idRegimenPensionarioSelect != 2) { //si no es sistema privado de pensiones
      
      this.form.get('idAfp').clearValidators();
      this.form.get('idTipoComision').clearValidators();
      this.form.get('numeroCuspp').clearValidators();
      
      this.form.controls['idAfp'].reset();
      this.form.controls['idTipoComision'].reset();
      this.form.controls['numeroCuspp'].reset();
    } else {
      this.form.get('idAfp').setValidators(Validators.required);
      this.form.get('idTipoComision').setValidators(Validators.required);
      this.form.get('numeroCuspp').setValidators(Validators.required);
    }
    
  }

  getAdjudicacionesVigentes (persona: any) {
    this.seBuscoPlaza = false;
    this.form.patchValue({
      codigoPlaza: null
    })


    this.dataService.AccionesVinculacion().getAdjudicacionesVigentes(persona.id_persona).subscribe(
      (response) => {
        console.log('getAdjudicacionesVigentes() => ', response);
        if (response != null && response.length > 1) {
          //abrir popup para mostrar adjudicaciones vigentes
          this.handleVerAdjudicaciones();
        }
        if (response != null && response.length == 1) {
          this.adjudicacion = response[0]
          this.form.patchValue({
            idPlaza: response[0].id_plaza,
            codigoPlaza: response[0].codigo_plaza,
            itemPlaza: response[0].item_plaza,
            fechaInicio: response[0].vigencia_inicio_adjudicacion,
            fechaTermino: response[0].vigencia_fin_adjudicacion
          })
          this.persona.id_adjudicacion_proceso_persona = response[0].id_adjudicacion_proceso_persona,
          this.idPlaza = response[0].id_plaza;
          this.persona.id_plaza = response[0].id_plaza;

          // Ver Modal Conformidad de adjudicacion
          this.handleConformidadAdjudicacion();

          //this.onBuscarPlazaPorId();
         // this.validacionFechaVinculacion();
        }
      },
      (error: HttpErrorResponse) => {
        console.log(error);
      }
    )
  }

  loadCombos() {
    this.loadComboRegimenLaboral();  

    this.loadComboTipoDocumento();
    this.loadComboRegimenPensionario();
    this.loadComboAFP();
    this.loadComboTipoComision();
    this.loadComboNivelEducativo();
    
    this.loadComboUbigeoDepartamentos();
    this.loadComboTipoDocumentoSustento();
  }

  loadComboRegimenLaboral() {
    const params = {
      estado: true,
      vinculacion: true
    }
    let request = {
      codigoRol: this.currentSession.codigoRol
    }
    this.dataService.AccionesVinculacion().getComboRegimenLaboral(request).subscribe(
      (response) => {
        this.combo.regimenesLaborales = response;
      },
      (error: HttpErrorResponse) => {
        console.log(error);
      }
    )
  }

  loadComboAcciones(id_regimen_laboral) {
    
    this.dataService.AccionesVinculacion().getComboAccionPorRegimenLaboral(id_regimen_laboral).subscribe(
      (response) => {
          
        this.combo.acciones = response;
        this.combo.motivosAccion = [];
        this.form.patchValue({      
          porProceso:  false
        });

        if (this.id_gestion_vinculacion == undefined || this.id_gestion_vinculacion == null) {
          this.form.patchValue({
            idAccion: 0,
            idMotivoAccion: 0
          })
        }         

        if(this.seBuscoPersona && this.isEdit == false && this.isInformacion == false) {
          this.LimpiarAccion();
        }
        
        
      },
      (error: HttpErrorResponse) => {
        console.log(error);
      }
    )
  }

  loadComboMotivoAccion (id_accion) {
      
    this.combo.motivosAccion = [];    

    if (this.id_gestion_vinculacion == undefined || this.id_gestion_vinculacion == null) {
          this.form.patchValue({
            idMotivoAccion: -1
          })
        } 
    
    if (id_accion == undefined) {
      return;
    }
    const params = {
      id_accion: id_accion,
      id_regimen_laboral: parseInt(this.form.get('idRegimenLaboral').value)
    }
    this.dataService.AccionesVinculacion().getComboMotivoAccionPorAccion(params).subscribe(
      (response) => {
        this.combo.motivosAccion = response;
        this.form.patchValue({      
          porProceso:  false
        });

        if(this.seBuscoPersona && this.isEdit == false && this.isInformacion == false) {
          this.LimpiarAccion();

          
        }

        
      },
      (error: HttpErrorResponse) => {
        console.log(error);
      }
    )
  }

  loadComboTipoDocumento () {
    let request = {
      codigoCatalogo: 6
    }
    this.dataService.AccionesVinculacion().getCatalogoItem(request).subscribe(
      (response) => {
        this.combo.tiposDocumentoIdentidad = response;
      },
      (error: HttpErrorResponse) => {
        console.log(error);
      }
    )
  }

  loadComboRegimenPensionario() {  

    this.dataService.AccionesVinculacion().getRegimenesPensionarios().subscribe(
      (response) => {
          
        this.combo.regimenesPensionarios = response;

        
        
      },
      (error: HttpErrorResponse) => {
        console.log(error);
      }
    )
  }

  loadComboAFP() {
    this.dataService.AccionesVinculacion().getAfp().subscribe(
      (response) => {
        this.combo.afps = response;
        /*
        this.combo.afps.unshift({
          id_afp: -1,
          descripcion_afp: '--SELECCIONE--'
        })
        */
      },
      (error: HttpErrorResponse) => {
        console.log(error);
      }
    )
  }

  loadComboTipoComision() {
    let request = {
      codigoCatalogo: 69
    }
    this.dataService.AccionesVinculacion().getCatalogoItem(request).subscribe(
      (response) => {
        this.combo.tiposComision = response;
        /*
        this.combo.tiposComision.unshift({
          id_catalogo_item: -1,
          descripcion_catalogo_item: '--SELECCIONE--'
        })
        */
      },
      (error: HttpErrorResponse) => {
        console.log(error);
      }
    )
  }

  loadComboNivelEducativo() {
    let request = {
      codigoCatalogo: 153
    }
    this.dataService.AccionesVinculacion().getComboNivelEducativo(request).subscribe(
      (response) => {
        this.combo.nivelesEducativos = response;
      },
      (error: HttpErrorResponse) => {
        console.log(error);
      }
    )
  }

  onChangeNivelEducativo() {
            
    this.form.controls['idSituacionAcademica'].reset();

    const _idNivelEducativo = this.form.get('idNivelEducativo').value;   

    this.ObtenerPermisoCombosFormacionAcademica(_idNivelEducativo);

    this.nivelGradoAcademico = false;
    this.nivelEstudio = false;   
    
    this.form.get('idGrado').clearValidators();
    this.form.get('idEstudio').clearValidators();

    this.form.controls['idGrado'].reset();
    this.form.controls['idEstudio'].reset();  
  }

  ObtenerPermisoCombosFormacionAcademica(idNivelEducativo): void {
    debugger;
    const request = {
      id_nivel_educativo: idNivelEducativo
    };
    
    this.dataService.AccionesVinculacion().getObtenerPermisoCombosFormacionAcademica(request).subscribe(
      (response) => {
              
        this.nivelSecundaria = response.cuentaSecundaria;
        this.nivelSuperior = response.cuentaSuperior;          

        if(this.nivelSecundaria) {
          this.loadNivelSecundaria(idNivelEducativo);
          this.form.get('idSecundaria').setValidators(Validators.required);
        }  else {          
          this.form.get('idSecundaria').clearValidators();
          this.form.controls['idSecundaria'].reset();
        }

        if(this.nivelSuperior) {
          this.loadNivelSuperior(idNivelEducativo);         
          this.form.get('idSuperior').setValidators(Validators.required); 
        } else {          
          this.form.get('idSuperior').clearValidators();
          this.form.controls['idSuperior'].reset();
        }

        if(this.nivelSecundaria  || this.nivelSuperior ){
          this.nivelSituacionAcademico = false;
        } else {
          
          this.loadNivelSituacionAcademica(idNivelEducativo, null, null); 
        }
       
      }, 
      (error: HttpErrorResponse) => {
        this.dataService.Message().msgWarning('"'+error.error.messages[0]+'"');
        this.dataService.Spinner().hide("sp6");
        console.log(error);
      }
    )
    
  }

  loadNivelSecundaria = async (idNivelEducativo) => {

    const request = {
      id_nivel_educativo: idNivelEducativo
    };

    var response = await this.dataService.AccionesVinculacion().getObtenerSecundarioPonNivelEducativo(request).toPromise();
    if (response) {
      const data = response.map((x) => ({
        ...x,
        value: x.id_catalogo_item,
        label: `${x.descripcion_catalogo_item}`,
      }));
      this.combo.nivelesSecundaria = data;

      // Al buscar 
      if(this.codigo_nivel == 2) {
        this.id_nivel_especifico = this.combo.nivelesSecundaria.filter(m => m.codigo_catalogo_item == this.codigo_nivel_especifico)[0].id_catalogo_item;

        this.form.patchValue({
          idSecundaria: this.id_nivel_especifico,
          idSuperior: this.id_nivel_especifico      
        });

        this.codigo_nivel = 0;
      }
      
    }
  }

  loadNivelSuperior = async (idNivelEducativo) => {

    const request = {
      id_nivel_educativo: idNivelEducativo
    };

    var response = await this.dataService.AccionesVinculacion().getObtenerSuperiorPonNivelEducativo(request).toPromise();
    if (response) {
      const data = response.map((x) => ({
        ...x,
        value: x.id_catalogo_item,
        label: `${x.descripcion_catalogo_item}`,
      }));
      this.combo.nivelesSuperior = data;

      debugger;

      // Al buscar 
      if(this.codigo_nivel == 6) {
        this.id_nivel_especifico = this.combo.nivelesSuperior.filter(m => m.codigo_catalogo_item == this.codigo_nivel_especifico)[0].id_catalogo_item;

        this.form.patchValue({
          idSecundaria: this.id_nivel_especifico,
          idSuperior: this.id_nivel_especifico      
        });

        this.codigo_nivel = 0;
      }

    }
  }

  loadNivelSituacionAcademica= async (idNivelEducativo, idSecundaria, idSuperior) => {

    this.nivelSituacionAcademico = true;

    const request = {
      id_nivel_educativo: idNivelEducativo,
      id_secundaria:idSecundaria,
      id_superior: idSuperior
    };

    var response = await this.dataService.AccionesVinculacion().getComboSituacionAcademica(request).toPromise();
    if (response) {
      const data = response.map((x) => ({
        ...x,
        value: x.id_catalogo_item,
        label: `${x.descripcion_catalogo_item}`,
      }));
      this.combo.situacionesAcademicas = data;

      
     
      if(this.codigo_situacion_academica > 0) {
        this.idSituacionAcademica = this.combo.situacionesAcademicas.filter(m => m.codigo_catalogo_item == this.codigo_situacion_academica)[0].id_catalogo_item;
        this.codigo_situacion_academica = 0;

        this.form.patchValue({           
          idSituacionAcademica: this.idSituacionAcademica          
        });   
        
        this.onChangeSituacionAcademica();  
        
      } 
      
      if(!this.isNew) {
        this.form.patchValue({           
          idSituacionAcademica: this.idSituacionAcademica          
        });   

        this.onChangeSituacionAcademica();  
      }

    }
  }

  loadComboSituacinoAcademica(idNivelEducativo) {
    
    this.dataService.AccionesVinculacion().getComboSituacionAcademica(idNivelEducativo).subscribe(
      (response) => {
          
        this.combo.situacionesAcademicas = response;
        /*
        this.combo.situacionesAcademicas.unshift({
          id_catalogo_item: -1,
          descripcion_catalogo_item: '--SELECCIONE--'
        })
        */
      },
      (error: HttpErrorResponse) => {
        console.log(error);
      }
    )
  }

  ListarSituacionAcademica() {

    const _idNivelEducativo = this.form.get('idNivelEducativo').value;  
    const _idSecundaria = this.form.get('idSecundaria').value;
    const _idSuperior = this.form.get('idSuperior').value;

    this.form.controls['idSituacionAcademica'].reset();

    this.loadNivelSituacionAcademica(_idNivelEducativo, _idSecundaria, _idSuperior);
    
  }  

  onChangeSituacionAcademica() {
    
    this.combo.gradosAcademicos = [];

    const _idNivelEducativo = this.form.get('idNivelEducativo').value;
    const _idSecundaria = this.form.get('idSecundaria').value;
    const _idSuperior = this.form.get('idSuperior').value;
    const _idSituacionAcademica = this.form.get('idSituacionAcademica').value;
        
    this.loadComboGradosAcademicos(_idNivelEducativo, _idSecundaria, _idSuperior, _idSituacionAcademica);

    this.getIdSituacionAcademica();
    
  }

  loadComboGradosAcademicos= async (idNivelEducativo, idSecundaria, idSuperior, idSituacionAcademica) => {

    const request = {
      id_nivel_educativo: idNivelEducativo,
      id_secundaria:idSecundaria,
      id_superior: idSuperior,
      id_situacion_academica: idSituacionAcademica
    };

    var response = await this.dataService.AccionesVinculacion().getObtenerGradoAcademico(request).toPromise();
    if (response) {

      debugger;
      if(response.length > 0) {
        const data = response.map((x) => ({
          ...x,
          value: x.id_catalogo_item,
          label: `${x.descripcion_catalogo_item}`,
        }));
           
        this.combo.nivelesGrado = data;

        if(this.codigo_grado_academico > 0) {
          this.idConGrado = this.combo.nivelesGrado.filter(m => m.codigo_catalogo_item == this.codigo_grado_academico)[0].id_catalogo_item;
          this.codigo_grado_academico = 0;
        } 

        // Con grado
        if(idSituacionAcademica == 192 ){        
          this.nivelGradoAcademico = true;
          this.nivelEstudio = false;
          this.form.get('idEstudio').clearValidators();
          this.form.controls['idEstudio'].reset();  


          this.form.get('idGrado').setValidators(Validators.required); 
          
            this.form.patchValue({          
              idGrado: this.idConGrado
            });
  
        } else {
          this.nivelEstudio = true;
          this.nivelGradoAcademico = false;
          this.form.get('idGrado').clearValidators();
          this.form.controls['idGrado'].reset();  
          this.form.get('idEstudio').setValidators(Validators.required); 
          
            this.form.patchValue({          
              idEstudio: this.idConGrado
            });
          
        }             

      } else {
        this.nivelEstudio = false;
        this.form.get('idEstudio').clearValidators();
          this.form.controls['idEstudio'].reset();  

      }
      

    } 
  }

  
  loadComboUbigeoDepartamentos() {
    this.dataService.AccionesVinculacion().getUbigeoDepartamentos().subscribe(
      (response) => {
        this.combo.departamentos = response;
      },
      (error: HttpErrorResponse) => {
        console.log(error);
      }
    )
  }
  loadComboUbigeoProvincias(idDepartamento) {
    // let idDepartamento = this.form.get('idDepartamento').value;
    this.dataService.AccionesVinculacion().getUbigeoProvincias(idDepartamento).subscribe(
      (response) => {
        this.combo.provincias = response;
      },
      (error: HttpErrorResponse) => {
        console.log(error);
      }
    )
  }
  loadComboUbigeoDistritos(idProvincia) {
    // let idProvincia = this.form.get('idProvincia').value;
    this.dataService.AccionesVinculacion().getUbigeoDistritos(idProvincia).subscribe(
      (response) => {
        this.combo.distritos = response;
      },
      (error: HttpErrorResponse) => {
        console.log(error);
      }
    )
  }
  loadComboTipoDocumentoSustento() {
    let request = {
      codigoCatalogo: 20
    }
    this.dataService.AccionesVinculacion().getCatalogoItem(request).subscribe(
      (response) => {
        this.combo.tiposDocumento = response;
      },
      (error: HttpErrorResponse) => {
        console.log(error);
      }
    )
  }

  buscarPlaza(event) {
    event.preventDefault();
    this.onBuscarPlaza();
  }

  onBuscarPlaza() {
    const codigoPlaza = this.form.get("codigoPlaza").value;
    if (!codigoPlaza) {
      this.dataService.Message().msgWarning('"INGRESE EL CÓDIGO DE PLAZA PARA REALIZAR LA BUSQUEDA."', () => { });
      return;
    }

    let data = this.form.value;
    this.estaEnProcesoAdjudicacion = data.porProceso;

    let validacionCodigoPlaza = criterioBusqueda.validarCodigoPlaza(codigoPlaza);
      if (!validacionCodigoPlaza.esValido) {
          this.dataService.Message().msgWarning(validacionCodigoPlaza.mensaje);
          return;
      }    
      
    this.dataService.Spinner().show("sp6");

    this.dataService.AccionesVinculacion().getPlazaPorCodigo(codigoPlaza).pipe(
      catchError(() => of(null)),
      finalize(() => { this.dataService.Spinner().hide("sp6"); })
    ).subscribe(response => {
      if (response) {

        this.plaza = response;
        //this.seBuscoPlaza = true;

        if(this.isNew) {

          if(!this.estaEnProcesoAdjudicacion){
            if(response.cantidad_plazas == 1 ) {
            
              this.recargaPlaza();
              
            } else {
              //Modal
              this.handleVerPlazas();
            }  
          }
                          

        } else {
          this.VerPlaza(this.plaza);          
        }

                   
      } else {
        this.dataService.Message().msgWarning('"DATOS NO ENCONTRADOS PARA LA PLAZA INGRESADA."', () => { });
        this.plaza = null;
      }
    });
  }

  handleVerPlazas(){

    let dialogRef = this.materialDialog.open(ListarPlazasComponent, {
      panelClass: 'minedu-listar-plazas-dialog',
        disableClose: true,
        data: {
          plaza: this.plaza
        }
    });
    dialogRef.afterClosed().subscribe((response: any) => {
      console.log('close modal resul', response);
      if (!response && response.id_plaza == undefined) { 
        return;
      }    
      
      debugger;

      this.idPlaza = response.id_plaza; 
      this.persona.id_plaza = response.id_plaza;
      
      this.form.patchValue({
        idPlaza: response.id_plaza        
      })

      this.onBuscarPlazaPorId();
    });

  } 

  

  VerPlaza(data){
    this.seBuscoPlaza = true;
    this.plaza = data;
    this.TipoPlaza = data.id_tipo_plaza;
    this.idPlazaDesierta = data.id_plazas_desiertas;
    this.validacionFechaVinculacion2();
    this.form.patchValue({
      codigoPlaza: ''
    }); 
  }

  onBuscarPlazaPorId() {
    //const idPlaza = this.form.get("idPlaza").value;
    const idPlaza = this.idPlaza;

    if (!idPlaza) {
      this.dataService.Message().msgWarning('"INGRESE EL CÓDIGO DE PLAZA PARA REALIZAR LA BUSQUEDA."', () => { });
      return;
    }
    this.dataService.Spinner().show("sp6");
    this.dataService.AccionesVinculacion().getPlazaPorId(idPlaza).pipe(
      catchError(() => of(null)),
      finalize(() => { this.dataService.Spinner().hide("sp6"); })
    ).subscribe(response => {
      if (response) {
        this.plaza = response;
        this.recargaTodoPlaza();
      } else {
        this.dataService.Message().msgWarning('"DATOS NO ENCONTRADOS PARA LA PLAZA INGRESADA."', () => { });
        this.plaza = null;
      }
    });
  }

  private async recargaTodoPlaza(){
    await this.validarRegla();    
    this.TipoPlaza = this.plaza.id_tipo_plaza;
    this.idPlazaDesierta = this.plaza.id_plazas_desiertas;
    this.validacionFechaVinculacion2();
    this.form.patchValue({
      codigoPlaza: ''
    });
  }


  private async recargaPlaza(){
    await this.validarRegla();       
    
  }

  private async validarRegla(){

    let viewModel = {        
      numeroDocumento : this.persona.numeroDocumentoIdentidad,
      idTipoDocumento : this.persona.idTipoDocumentoIdentidad,
      idPlaza: this.plaza.id_plaza,
      idRegimenLaboralLogin: this.form.get("idRegimenLaboral").value,
      idAccion: this.form.get('idAccion').value,
      idMotivoAccionLogin: this.form.get("idMotivoAccion").value,
      idRegimenLaboral: this.plaza.id_regimen_laboral,
      idDreLogin: this.idDre,
      idUgelLogin: this.idUgel,
      idDre: this.plaza.id_dre,
      idUgel: this.plaza.id_ugel,
      idEstadoPlaza: this.plaza.id_estado_plaza,
      idTipoProceso: this.plaza.id_tipo_proceso,
      idTipoPlaza: this.plaza.id_tipo_plaza,
      idCondicion: this.plaza.id_condicion,
      idTipoCentroTrabajo: this.plaza.id_tipo_centro_trabajo,
      vigenciaInicio: this.plaza.vigencia_inicio,
      vigenciaFin: this.plaza.vigencia_fin,
      fechaAnioLectivo: this.fechaValidacion,
      por_proceso: this.estaEnProcesoAdjudicacion

    }

    this.idPlaza =  this.plaza.id_plaza;
    this.persona.id_plaza = this.plaza.id_plaza;
    
    this.dataService.AccionesVinculacion()
    .validarReglaPlaza(viewModel)
    .pipe(
      catchError((error) => {
        this.dataService.Message().msgWarning('"'+error.error.messages[0]+'"');
          this.dataService.Spinner().hide("sp6");
          this.seBuscoPlaza = false;
          this.plaza = null;
          this.form.patchValue({
            codigoPlaza: ''
          });   
          return of(null);
      }),
      finalize(() => { })
    ).subscribe((response: any) => {
          if (response != null) {                  
            this.VerPlaza(this.plaza);                             
          }                              
        },
        (error: HttpErrorResponse) => {      
          this.seBuscoPlaza = false;
          this.plaza = null;
          this.form.patchValue({
            codigoPlaza: ''
          });              
          this.dataService.Message().msgWarning('"'+error.error.messages[0]+'"');
          this.dataService.Spinner().hide("sp6");
          console.log(error);
          
        }            
        );
        
  }

  buscarPlazaDialogo(event) {
    event.preventDefault();
    const codigoPlaza = this.form.get("codigoPlaza").value;
    if (codigoPlaza) {
      this.buscarPlaza(event);
      return;
    }

    /*
    this.dialogRef = this.materialDialog.open(BuscarPlazaComponent, {
      panelClass: 'buscar-plaza-form-dialog',
      disableClose: true,
      data: {
        opcion: 'nueva-vinculacion'
      }
    });

    this.dialogRef.afterClosed()
      .subscribe((response: any) => {
        if (!response) {
          return;
        }
        console.log(response);
        this.form.patchValue({ codigoPlaza: response.codigo_plaza });
        this.plaza = response;
      });
    */

  }

  adjunto(pIdDocumento) {
    this.form.patchValue({ codigoDocumento: pIdDocumento });
  }

  handleAdjuntoVinculacion(file) {
    if (file === null) {
      this.form.patchValue({ adjuntarDocumento: null });
      return;
    }      

    this.form.patchValue({ adjuntarDocumento: file[0] });
  }

  handleAdjuntoSustento(file) {
    if (file === null) {
      this.form.patchValue({ adjuntarDocumentoSustento: null });
      this.fileDocumentoSustento = null;
      return;
    }
    let logo = {};
    const fileAdded: File = file[0];
    const reader = new FileReader();
    if (fileAdded.size < 2097152) {
      reader.addEventListener('load', (event: any) => {
        logo = {
          base64: event.target.result.split(',')[1],
          name: fileAdded.name,
          fileType: fileAdded.name.match(/\.[^/.]+$/)[0],
          fileSrc: event.target.result,
          index: 0,
          url: null,
          id: 0,
        };
        this.fileDocumentoSustento = logo;
      });
      reader.readAsDataURL(fileAdded);
    }
    
    this.form.patchValue({ adjuntarDocumentoSustento: logo });
  }

  handleCancelar () {
    if (this.tipo_vinculacion == "aprobacion") {
      this.router.navigate(['ayni/personal/bandejas/aprobacionespendientes']);
    }      
    else {
      this.router.navigate(['ayni/personal/acciones/vinculacion']);
    }
  }

  handleObservar() {
    // let data = new FormData();
    let data = this.getDataView();

    let dialogRef = this.materialDialog.open(ObservarVinculacionComponent, {
      panelClass: 'Minedu-observar-accion-desplazamiento-dialog',
        disableClose: true,
        data: {
          id_gestion_vinculacion: this.id_gestion_vinculacion,
          is_saved: false,
          info: data,
          dialogTitle: 'Observar la Adjudicación'          
        }
    });
    dialogRef.afterClosed()
    .subscribe((response: any) => {
      if (!response) {
        return;
      }
      console.log(response);
    });
  }

  handleEnviarAccionesGrabadas() {
    this.seEnviaAccionesGrabadas = true;
    this.handleGuardarVinculacion();
  }

  handleInformacionDocumento(row) {

  }

  handleDescargarDocumento(row) {

  }

  handleEliminar(row, index) {

  }

  handleAgregarDocumento() {

  }

  getDataView() : FormData {
      
    let data = this.form.value;
    let viewModel = new FormData();
    
    viewModel.append('gestion_vinculacion.id_gestion_vinculacion', this.id_gestion_vinculacion == null ? '0' : this.id_gestion_vinculacion);
    viewModel.append('gestion_vinculacion.id_dre', this.idDre);
    viewModel.append('gestion_vinculacion.id_ugel', this.idUgel);
    viewModel.append('gestion_vinculacion.id_regimen_grupo_accion', this.combo.motivosAccion.length == 0 ? 0 : this.combo.motivosAccion.filter(m => m.id_motivo_accion == data.idMotivoAccion)[0].id_regimen_grupo_accion);
    viewModel.append('gestion_vinculacion.id_persona', this.persona && this.persona.id_persona != undefined ? this.persona.id_persona : 0);
    viewModel.append('gestion_vinculacion.id_plaza', this.persona && this.persona.id_plaza != undefined &&  this.persona.id_plaza > 0 ? this.persona.id_plaza : this.plaza.id_plaza );
    viewModel.append('gestion_vinculacion.id_adjudicacion_proceso_persona',  this.persona && this.persona.id_adjudicacion_proceso_persona != undefined ? this.persona.id_adjudicacion_proceso_persona : '0');
    viewModel.append('gestion_vinculacion.id_tipo_resolucion', '0');
    viewModel.append('gestion_vinculacion.annio', (new Date()).getFullYear().toString());
    viewModel.append('gestion_vinculacion.es_mandato_judicial', data.esMandatoJudicial);
    viewModel.append('gestion_vinculacion.fecha_inicio', (new Date(data.fechaInicio)).toUTCString());
    viewModel.append('gestion_vinculacion.fecha_fin', (new Date(data.fechaTermino)).toUTCString());
    viewModel.append('gestion_vinculacion.check_impedimento', data.tieneImpedimento);
    viewModel.append('gestion_vinculacion.anotaciones', data.anotaciones == null ? '' : data.anotaciones);
    viewModel.append('gestion_vinculacion.fecha_resolucion', (new Date).toUTCString());
    // viewModel.append('gestion_vinculacion.numero_resolucion', null);
    // viewModel.append('gestion_vinculacion.documento_resolucion', null);
    // viewModel.append('gestion_vinculacion.fecha_creacion', this.nowDate.toUTCString());
    viewModel.append('gestion_vinculacion.usuario_creacion', this.passport.numeroDocumento);
    viewModel.append('gestion_vinculacion.usuario_modificacion', this.passport.numeroDocumento);
    // viewModel.append('gestion_vinculacion.ip_creacion', null);
    viewModel.append('gestion_vinculacion.codigo_plaza', this.plaza.codigo_plaza);

    viewModel.append('gestion_vinculacion.codigo_estado_adjudicacion_proceso', data.enVinculacion);
    viewModel.append('gestion_vinculacion.por_proceso', data.porProceso);    

    viewModel.append('gestion_vinculacion.codigo_proceso_aprobacion', this.codigoProcesoAprobacion == null ? '' : this.codigoProcesoAprobacion  );    

    viewModel.append('documento', data.adjuntarDocumento);

    viewModel.append('persona.numeroDocumentoIdentidad', this.persona.numeroDocumentoIdentidad);
    viewModel.append('persona.idTipoDocumentoIdentidad', this.persona.idTipoDocumentoIdentidad)
    viewModel.append('persona.primerApellido', this.persona.primerApellido);
    viewModel.append('persona.segundoApellido', this.persona.segundoApellido);
    viewModel.append('persona.nombres', this.persona.nombres);
    viewModel.append('persona.fechaNacimiento', this.persona.fechaNacimiento);
    viewModel.append('persona.fechaNacimientoStr', this.persona.fechaNacimientoStr);
    viewModel.append('persona.sexo', this.persona.sexo);
    viewModel.append('persona.codigoGenero', this.persona.codigoGenero);
    viewModel.append('persona.celular', data.celular);
    viewModel.append('persona.telefono_fijo', data.telefonoFijo == null ? '' : data.telefonoFijo); 
    viewModel.append('persona.correo', data.correoElectronico);
    viewModel.append('persona.estadoCivil', this.persona.estadoCivil);
    viewModel.append('persona.edad', this.persona.edad);

    if (this.persona.codigoEstadoCivil != undefined) {
      viewModel.append('persona.codigoEstadoCivil', this.persona.codigoEstadoCivil);
    }    
    if (this.persona.id_persona != undefined) {
      viewModel.append('persona.id_persona', this.persona.id_persona);
    }
    
    viewModel.append('sistemaPersionario.idRegimenPensionario', data.idRegimenPensionario)
   
    viewModel.append('sistemaPersionario.idAfp', (data.idAfp == undefined || data.idAfp == null) ? 0 : data.idAfp );
    viewModel.append('sistemaPersionario.idTipoComision', (data.idTipoComision == undefined || data.idTipoComision == null)  ? 0 : data.idTipoComision );
    viewModel.append('sistemaPersionario.numeroCuspp', (data.numeroCuspp == undefined || data.numeroCuspp == null) ? '' : data.numeroCuspp );

    viewModel.append('sistemaPersionario.fechaIngresoSPP', new Date(data.fechaIngresoSPP).toUTCString())
    if ( data.fechaDevengue != undefined) {
      viewModel.append('sistemaPersionario.fechaDevengue', new Date(data.fechaDevengue).toUTCString())
    }    
    viewModel.append('sistemaPersionario.folios', data.folios)

    viewModel.append('formacionAcademica.id_nivel_educativo', data.idNivelEducativo);
    viewModel.append('formacionAcademica.id_situacion_academica', data.idSituacionAcademica);
    viewModel.append('formacionAcademica.id_maestro_formacion_academica', this.id_maestro_formacion_academica);
    viewModel.append('formacionAcademica.titulo', data.titulos);
    viewModel.append('formacionAcademica.especialidad', data.especialidad);
    viewModel.append('formacionAcademica.numero_registro_titulo', data.nroRegistroTitulo);

    viewModel.append('gestion_vinculacion.codigo_rol', this.passport.codigoRol);
    viewModel.append('gestion_vinculacion.codigo_centro_trabajo', this.plaza.codigo_centro_trabajo);
    
    
    return viewModel;
  }

  getDataViewAdjudicacion() : FormData {
      
    let data = this.form.value;
    let viewModel = new FormData();
    
    viewModel.append('gestion_vinculacion.id_gestion_vinculacion', this.id_gestion_vinculacion == null ? '0' : this.id_gestion_vinculacion);
    viewModel.append('gestion_vinculacion.id_dre', this.idDre);
    viewModel.append('gestion_vinculacion.id_ugel', this.idUgel);
    viewModel.append('gestion_vinculacion.id_regimen_grupo_accion', this.combo.motivosAccion.length == 0 ? 0 : this.combo.motivosAccion.filter(m => m.id_motivo_accion == data.idMotivoAccion)[0].id_regimen_grupo_accion);
    viewModel.append('gestion_vinculacion.id_persona', this.persona && this.persona.id_persona != undefined ? this.persona.id_persona : 0);
    viewModel.append('gestion_vinculacion.id_plaza', this.persona && this.persona.id_plaza != undefined &&  this.persona.id_plaza > 0 ? this.persona.id_plaza : this.plaza.id_plaza );
    viewModel.append('gestion_vinculacion.id_adjudicacion_proceso_persona',  this.persona && this.persona.id_adjudicacion_proceso_persona != undefined ? this.persona.id_adjudicacion_proceso_persona : '0');
    viewModel.append('gestion_vinculacion.id_tipo_resolucion', '0');
    viewModel.append('gestion_vinculacion.annio', (new Date()).getFullYear().toString());
    viewModel.append('gestion_vinculacion.es_mandato_judicial', data.esMandatoJudicial);
  //  viewModel.append('gestion_vinculacion.fecha_inicio', (new Date(data.fechaInicio)).toUTCString());
//     viewModel.append('gestion_vinculacion.fecha_fin', (new Date(data.fechaTermino)).toUTCString());
//    viewModel.append('gestion_vinculacion.check_impedimento', data.tieneImpedimento);
 //   viewModel.append('gestion_vinculacion.anotaciones', data.anotaciones == null ? '' : data.anotaciones);
    viewModel.append('gestion_vinculacion.fecha_resolucion', (new Date).toUTCString());
    viewModel.append('gestion_vinculacion.usuario_creacion', this.passport.numeroDocumento);
    viewModel.append('gestion_vinculacion.usuario_modificacion', this.passport.numeroDocumento);
    // viewModel.append('gestion_vinculacion.ip_creacion', null);
    //viewModel.append('gestion_vinculacion.codigo_plaza', this.plaza.codigo_plaza);

    viewModel.append('gestion_vinculacion.codigo_estado_adjudicacion_proceso', data.enVinculacion);
    viewModel.append('gestion_vinculacion.por_proceso', data.porProceso);    

    viewModel.append('gestion_vinculacion.codigo_proceso_aprobacion', this.codigoProcesoAprobacion == null ? '' : this.codigoProcesoAprobacion  );    

    viewModel.append('persona.numeroDocumentoIdentidad', this.persona.numeroDocumentoIdentidad);
    viewModel.append('persona.idTipoDocumentoIdentidad', this.persona.idTipoDocumentoIdentidad)
    viewModel.append('persona.primerApellido', this.persona.primerApellido);
    viewModel.append('persona.segundoApellido', this.persona.segundoApellido);
    viewModel.append('persona.nombres', this.persona.nombres);
    viewModel.append('persona.fechaNacimiento', this.persona.fechaNacimiento);
    viewModel.append('persona.fechaNacimientoStr', this.persona.fechaNacimientoStr);
    viewModel.append('persona.sexo', this.persona.sexo);
    viewModel.append('persona.codigoGenero', this.persona.codigoGenero);
    viewModel.append('persona.celular', data.celular  == null ? '' : data.celular);
    viewModel.append('persona.telefono_fijo', data.telefonoFijo == null ? '' : data.telefonoFijo); 
    viewModel.append('persona.correo', data.correoElectronico  == null ? '' : data.correoElectronico);
    viewModel.append('persona.estadoCivil', this.persona.estadoCivil);
    viewModel.append('persona.edad', this.persona.edad);

    if (this.persona.codigoEstadoCivil != undefined) {
      viewModel.append('persona.codigoEstadoCivil', this.persona.codigoEstadoCivil);
    }    
    if (this.persona.id_persona != undefined) {
      viewModel.append('persona.id_persona', this.persona.id_persona);
    }      
    
    return viewModel;
  }

  getIdSituacionAcademica= async () => {
    debugger;     
    
        const request = {
          id_nivel_educativo: this.form.get("idNivelEducativo").value,
          id_secundaria: this.form.get("idSecundaria").value,
          id_superior: this.form.get("idSuperior").value,
          id_situacion_academica: this.form.get("idSituacionAcademica").value,
          id_grado_academico: this.form.get("idEstudio").value == null ? this.form.get("idGrado").value : this.form.get("idEstudio").value
        };
    
        var response = await this.dataService.AccionesVinculacion().getObtenerMaestroFormacionAcademica(request).toPromise();
        if (response) {
          this.id_maestro_formacion_academica = response.id_maestro_formacion_academica;
        }

    
  }


  handleActualizar() {
    if (!this.form.valid) {
      this.dataService.Message().msgWarning(MESSAGE_GESTION.M08);
      return;
    }

    console.log(this.passport);
    let data = this.form.value;
    this.getIdSituacionAcademica();
    let viewModel = this.getDataView();
    let mensaje = '¿ESTÁ SEGURO QUE DESEA GUARDAR LOS CAMBIOS?'
    
    this.dataService.Message().msgConfirm(mensaje, () => {
      this.dataService.Spinner().show("sp6");
      this.working = true;
      this.dataService.AccionesVinculacion().guardarNuevaGestionVinculacion(viewModel).subscribe(
        (response) => {
          
            this.dataService.Spinner().hide("sp6");
            this.dataService.Message().msgAutoCloseSuccessNoButton('"OPERACIÓN REALIZADA DE FORMA EXITOSA."', 3000, () => {
              this.router.navigate(['ayni/personal/acciones/vinculacion']);
            });
        },
        (error: HttpErrorResponse) => {
          this.dataService.Spinner().hide("sp6")
          this.working = false;
          console.log(error);
          this.dataService.Message().msgWarning('"'+error.error.messages[0]+'"');
        }
      )
    }, () => {
      console.log('cancel confirm')
     });
  }

  handleGenerarContrato() {
    this.handleGuardarContrato(true);
  }

  handleGenerarAdenda() {
    //this.handleGuardarAdenda(true);
  }

  handleGuardar(): void {
   
      this.handleGuardarVinculacion();

  }

  handleGuardarVinculacion() {
       
    if (!this.form.valid) {      
      this.dataService.Message().msgWarning(MESSAGE_GESTION.M08);
      return;
    }

    if (!this.form.get('tieneImpedimento').value) {
      this.dataService.Message().msgWarning('"VALIDAR QUE LA PERSONA NO CUENTE CON IMPEDIMENTO VIGENTE."', () => { });
      return;
    }


    // Validar Fechas
    let fecha_inicio = new Date(this.form.get('fechaInicio').value);

    if(fecha_inicio < new Date(this.minDate)) {

      let dia = (new Date(this.minDate)).getDate();
      var CompletarDia = "";

      if(dia.toString().length == 1) {

        CompletarDia = "0" + dia;

      } else {

        CompletarDia = "" + dia;

      }   
      
      let mes = (new Date(this.minDate)).getMonth() + 1;
      var CompletarMes = "";

      if(mes.toString().length == 1) {

        CompletarMes = "0" + mes;

      } else {

        CompletarMes = "" + mes;

      } 

      this.dataService.Message().msgWarning('"LA FECHA DE INCIO DEBE SER MAYOR A ' 
      + CompletarDia + "/"
      + CompletarMes + "/"
      + (new Date(this.minDate)).getFullYear()
      + " '"
      , () => { });
      return;
    }

    // 

    console.log(this.passport);
    let data = this.form.value;
    debugger;    
    let viewModel = this.getDataView();
    let mensaje = MESSAGE_GESTION.M08;
    if (this.seEnviaAccionesGrabadas) {
      mensaje = '¿ESTÁ SEGURO QUE DESEA ENVIAR LA INFORMACIÓN INGRESADA A ACCIONES GRABADAS?';
    }

    if(this.isMandatoJudicial && this.codigoProcesoAprobacion == null) {
      this.dataService.Spinner().hide("sp6") 
      let dialogRef = this.materialDialog.open(SolicitarAutorizacionComponent, {
        panelClass: 'Minedu-solicitar-autorizacion-dialog',
          disableClose: true
      });
      dialogRef.afterClosed().subscribe(data=>{
        debugger;
        console.log("data retorna de modal informacion ",data);
        if(data.IsConfirmacion){
          this.dataService.Spinner().show("sp6");
          this.dataService.AccionesVinculacion().guardarNuevaGestionVinculacion(viewModel).subscribe(
            (response) => {
              debugger;
              if (this.seEnviaAccionesGrabadas) {
                var itemAccionGrabada = {
                  id_gestion_vinculacion: response
                }
                var listaVinculacionesSeleccionadas: Array<any> = [];
                listaVinculacionesSeleccionadas.push(itemAccionGrabada);
    
                var accionesGrabadas =  {
                  usuarioCreacion: "SYSTEM",
                  numeroDocumentoIdentidad : "",
                  codigoTipoDocumentoIdentidad: 1,
                  codigoTipoSede: "1",
                  codigoSede: "1",
                  accionesGestionVinculacion: listaVinculacionesSeleccionadas
                };
                this.dataService.AccionesVinculacion().enviarAccionesGrabadas(accionesGrabadas).subscribe(
                  (resp) => {
                    this.dataService.Spinner().hide("sp6");
                    this.dataService.Message().msgAutoCloseSuccessNoButton('"SE ENVIÓ CORRECTAMENTE LA INFORMACIÓN A ACCIONES GRABADAS."', 3000, () => {
                      this.router.navigate(['ayni/personal/acciones/vinculacion']);
                    });
                  }, 
                  (err: HttpErrorResponse) => {
                    this.working = false;
                    this.dataService.Spinner().hide("sp6");
                    console.log(err);
                    this.dataService.Message().msgWarning("Ocurrió un error al realizar esta operación");
                  }
                )
    
              } else {
                this.dataService.Spinner().hide("sp6");
                this.dataService.Message().msgAutoCloseSuccessNoButton('"OPERACIÓN REALIZADA DE FORMA EXITOSA."', 3000, () => {
                  this.router.navigate(['ayni/personal/acciones/vinculacion']);
                });
              }
            },
            (error: HttpErrorResponse) => {
              this.dataService.Spinner().hide("sp6")
              this.working = false;
              console.log(error);
              this.dataService.Message().msgWarning('"'+error.error.messages[0]+'"');
            }
          )
        } else {
          this.dataService.Spinner().hide("sp6");
          this.working = false;
        }
        
      })
    
    } else {
      this.dataService.Message().msgConfirm(mensaje, () => {
        this.dataService.Spinner().show("sp6");
        this.working = true;
        debugger;
        console.log(viewModel);
  
        
  
          
          this.dataService.AccionesVinculacion().guardarNuevaGestionVinculacion(viewModel).subscribe(
            (response) => {
              debugger;
              if (this.seEnviaAccionesGrabadas) {
                var itemAccionGrabada = {
                  id_gestion_vinculacion: response
                }
                var listaVinculacionesSeleccionadas: Array<any> = [];
                listaVinculacionesSeleccionadas.push(itemAccionGrabada);
    
                var accionesGrabadas =  {
                  usuarioCreacion: "SYSTEM",
                  numeroDocumentoIdentidad : "",
                  codigoTipoDocumentoIdentidad: 1,
                  codigoTipoSede: "1",
                  codigoSede: "1",
                  accionesGestionVinculacion: listaVinculacionesSeleccionadas
                };
                this.dataService.AccionesVinculacion().enviarAccionesGrabadas(accionesGrabadas).subscribe(
                  (resp) => {
                    this.dataService.Spinner().hide("sp6");
                    this.dataService.Message().msgAutoCloseSuccessNoButton('"SE ENVIÓ CORRECTAMENTE LA INFORMACIÓN A ACCIONES GRABADAS."', 3000, () => {
                      this.router.navigate(['ayni/personal/acciones/vinculacion']);
                    });
                  }, 
                  (err: HttpErrorResponse) => {
                    this.working = false;
                    this.dataService.Spinner().hide("sp6")
                    console.log(err);
                    this.dataService.Message().msgWarning("Ocurrió un error al realizar esta operación");
                  }
                )
    
              } else {
                this.dataService.Spinner().hide("sp6");
                this.dataService.Message().msgAutoCloseSuccessNoButton('"OPERACIÓN REALIZADA DE FORMA EXITOSA."', 3000, () => {
                  this.router.navigate(['ayni/personal/acciones/vinculacion']);
                });
              }
            },
            (error: HttpErrorResponse) => {
              this.dataService.Spinner().hide("sp6")
              this.working = false;
              console.log(error);
              this.dataService.Message().msgWarning("Ocurrió un error al realizar esta operación");
            }
          )
        
      }, () => {
        console.log('cancel confirm')
        this.seEnviaAccionesGrabadas = false;
       });
    }

    
  }

  validarMandatoJudicial(){
    debugger
    let data = this.form.value;   

    if(data.idMotivoAccion > 0) {
      if(data.esMandatoJudicial) {
        this.isMandatoJudicial = true;
        this.mandato_judicial_desc = "SI";
      } else {
        this.isMandatoJudicial = false;
        this.mandato_judicial_desc = "NO";
      }
  
      console.log(this.isMandatoJudicial);
  
      this.ValidarMotivoMandatoJudicial();
    } else {
      this.form.patchValue({      
        esMandatoJudicial:  false      
      });
      return;
    }
    
    

  }

  

  handleGuardarContrato(generarContrato: boolean) {
    if (!this.form.get('tieneImpedimento').value) {
      this.dataService.Message().msgWarning('"VALIDAR QUE LA PERSONA NO CUENTE CON IMPEDIMENTO VIGENTE."', () => { });
      return;
    }

    let data = this.form.value;
    let viewModel = {
      gestion_contrato: {
        "id_gestion_contrato": 0,
        "id_dre": this.idDre,
        "id_ugel": this.idUgel,
        "id_regimen_grupo_accion": (this.combo.motivosAccion.filter(m => m.id_motivo_accion == data.idMotivoAccion)[0].id_regimen_grupo_accion),
        "id_persona": (this.persona && this.persona.id_persona != undefined ? this.persona.id_persona : 0),
        "id_plaza": (this.persona && this.persona.id_plaza != undefined &&  this.persona.id_plaza > 0 ? this.persona.id_plaza : this.plaza.id_plaza),
        "id_estado_contrato": 301,
        "es_mandato_judicial": data.esMandatoJudicial,
        "annio": (new Date()).getFullYear(),
        "fecha_inicio": new Date(data.fechaInicio),
        "fecha_fin": new Date(data.fechaTermino),
        "numero_ruc": data.numeroRuc,
        "remuneracion_mensual": parseFloat(data.renumeracionMensual),
        "check_impedimento": data.tieneImpedimento,
        "anotaciones": data.anotaciones,
        "fecha_creacion": new Date(),
        "usuario_creacion": null,
        "ip_creacion": null
      },
      persona: {
        "numeroDocumentoIdentidad": this.persona.numeroDocumentoIdentidad,
        "idTipoDocumentoIdentidad": this.persona.idTipoDocumentoIdentidad,
        "primerApellido": this.persona.primerApellido,
        "segundoApellido": this.persona.segundoApellido,
        "nombres": this.persona.nombres,
        "fechaNacimiento": this.persona.fecha_nacimiento,
        "fechaNacimientoStr": this.persona.fechaNacimientoStr,
        "sexo": this.persona.sexo,
        "codigoGenero": this.persona.codigoGenero,
        "id_persona": this.persona.id_persona,
        "estadoCivil": this.persona.estadoCivil,
        "codigoEstadoCivil": this.persona.codigoEstadoCivil != undefined ? parseInt(this.persona.codigoEstadoCivil) : 0,
        "celular": data.celular,
        "telefono_fijo": data.telefonoFijo,
        "correo": data.correoElectronico
      },
      sistemaPersionario: {
        "idRegimenPensionario": data.idRegimenPensionario,
        "idAfp": data.idAfp,
        "idTipoComision": data.idTipoComision,
        "numeroCuspp": data.numeroCuspp,
        "fechaIngresoSPP": new Date(data.fechaIngresoSPP),
        "fechaDevengue": null,
        "folios": 0,
        "id_persona": 0
      },
      formacionAcademica : {
        "id_formacion_academica": 0,
        "id_persona": 0,
        "id_nivel_educativo": data.idNivelEducativo,
        "id_situacion_academica": data.idSituacionAcademica,
        "id_grado_academico": data.idGradoAcademico,
        "titulo": data.titulos,
        "especialidad": data.especialidad,
        "numero_registro_titulo": data.nroRegistroTitulo
      },
      GenerarContrato: generarContrato
    }


    console.log(viewModel);



    
    this.dataService.Message().msgConfirm('¿ESTÁ SEGURO QUE DESEA GUARDAR LOS CAMBIOS?', () => {
      this.dataService.Spinner().show("sp6");
      this.working = true;
      /*
      this.dataService.AccionesVinculacion().guardarNuevoGestionContrato(viewModel).subscribe(
        (response) => {
          this.dataService.Spinner().hide("sp6");
          this.dataService.Message().msgSuccess('"OPERACIÓN REALIZADA DE FORMA EXITOSA"', () => {
            this.router.navigate(['ayni/personal/acciones/contratoadenda']);
          });
        },
        (error: HttpErrorResponse) => {
          this.working = false;
          this.dataService.Spinner().hide("sp6")
          console.log(error);
          this.dataService.Message().msgWarning("Ocurrió un error al realizar esta operación");
        }
      )
      */
    }, () => { });
    
  }

  handleGenerarProyecto() {
    if (!this.form.valid) {
      this.dataService.Message().msgWarning(MESSAGE_GESTION.M08);
      return;
    }

    if (!this.form.get('tieneImpedimento').value) {
      this.dataService.Message().msgWarning('"VALIDAR QUE LA PERSONA NO CUENTE CON IMPEDIMENTO VIGENTE."', () => { });
      return;
    }

    let regimenLaboral = this.combo.regimenesLaborales.filter(m => m.idRegimenLaboral == this.form.get('idRegimenLaboral').value)[0];
    let grupoAccion = {
      id_grupo_accion: 12,
      codigo_grupo_accion: 12,
      descripcion_grupo_accion: 'VINCULACIÓN'
    };
    let accion = this.combo.acciones.filter(m => m.id_accion == this.form.get('idAccion').value)[0];

    debugger;
    let motivoAccion  = this.combo.motivosAccion.filter(m => m.id_motivo_accion == this.form.get('idMotivoAccion').value)[0];
    
    let descripcion_accion = accion.descripcion_accion;//this.comboLists.listAccion.filter(m => m.id_accion == row.id_accion)[0];
    let descripcion_motivo_accion = motivoAccion.descripcion_motivo_accion;//this.comboLists.listMotivoAccionTotal.filter(m => m.id_motivo_accion == row.id_motivo_accion)[0];
    
    let mandatoJudicial = this.mandato_judicial_desc;


    this.dialogRef = this.materialDialog.open(GenerarProyectoComponent, {
      panelClass: 'minedu-ver-informacion-adjudicacion-dialog',      
      disableClose: true,
      data: {
        title: "Generar proyecto de resoluci&oacute;n",
        datosAccion: {
          regimen_laboral: regimenLaboral,
          grupo_accion: grupoAccion,
          accion: accion,
          motivo_accion: motivoAccion,
          descripcion_accion: descripcion_accion,
          descripcion_motivo_accion: descripcion_motivo_accion,
          mandato_judicial: mandatoJudicial,
          idDre: this.idDre,
          idUgel:  this.idUgel
        },
        formDataVinculacion: this.getDataView(),
        idGestionVinculacion: this.id_gestion_vinculacion
      }
    });
  }


  handleLimpiar() {
    this.dataService.Message().msgConfirm('¿ESTÁ SEGURO QUE DESEA LIMPIAR EL FORMULARIO?', () => {
      this.persona = {};
      this.adjudicacion = {};
      this.plaza = {};
      this.seBuscoPersona = false;
      this.seBuscoPlaza = false;

      this.form.reset();
    }, () => { });
  }

  limpiarPlaza() {   
      this.plaza = {};
      this.seBuscoPlaza = false;
   
      this.form.controls['codigoPlaza'].reset();
      this.form.controls['idTipoResolucion'].reset();
      this.form.controls['fechaInicio'].reset();
      this.form.controls['fechaTermino'].reset();
      this.form.controls['fechaInicioStr'].reset();
      this.form.controls['fechaTerminoStr'].reset();
      this.form.controls['idRegimenPensionario'].reset();
      this.form.controls['idAfp'].reset();
      this.form.controls['idTipoComision'].reset();
      this.form.controls['fechaDevengue'].reset();
      this.form.controls['fechaDevengueStr'].reset();
      this.form.controls['folios'].reset();
      this.form.controls['numeroCuspp'].reset();
      this.form.controls['fechaIngresoSPP'].reset();
      this.form.controls['fechaIngresoSPPStr'].reset();
      this.form.controls['idNivelEducativo'].reset();
      this.form.controls['idGradoAcademico'].reset();
      this.form.controls['idAreaCurricular'].reset();
      this.form.controls['idCentroEstudio'].reset();
      this.form.controls['anioInicio'].reset();
      this.form.controls['anioFinal'].reset();
      this.form.controls['titulos'].reset();
      this.form.controls['especialidad'].reset();
      this.form.controls['nroRegistroTitulo'].reset();
      this.form.controls['fechaExpedicionGrado'].reset();
      this.form.controls['idSituacionAcademica'].reset();
      this.form.controls['correoElectronico'].reset();
      this.form.controls['celular'].reset();
      this.form.controls['telefonoFijo'].reset();
      this.form.controls['anotaciones'].reset();
      this.form.controls['tieneImpedimento'].reset();
      this.form.controls['adjuntarDocumento'].reset();  

  }

  LimpiarAccion() {
    this.persona = {};
      this.adjudicacion = {};
      this.plaza = {};
      this.seBuscoPersona = false;
      this.seBuscoPlaza = false;
      this.documentoEscalafon = false;

      //this.form.controls['idTipoDocumentoIdentidad'].reset();
    //  this.form.controls['TipoDocumentoIdentidad'].reset();
   //   this.form.controls['numeroDocumentoIdentidad'].reset();
      this.form.controls['idAdjudicacion'].reset();
      this.form.controls['codigoPlaza'].reset();
      this.form.controls['idTipoResolucion'].reset();
      this.form.controls['fechaInicio'].reset();
      this.form.controls['fechaTermino'].reset();
      this.form.controls['fechaInicioStr'].reset();
      this.form.controls['fechaTerminoStr'].reset();
      this.form.controls['idRegimenPensionario'].reset();
      this.form.controls['idAfp'].reset();
      this.form.controls['idTipoComision'].reset();
      this.form.controls['fechaDevengue'].reset();
      this.form.controls['fechaDevengueStr'].reset();
      this.form.controls['folios'].reset();
      this.form.controls['numeroCuspp'].reset();
      this.form.controls['fechaIngresoSPP'].reset();
      this.form.controls['fechaIngresoSPPStr'].reset();
      this.form.controls['idNivelEducativo'].reset();
      this.form.controls['idGradoAcademico'].reset();
      this.form.controls['idAreaCurricular'].reset();
      this.form.controls['idCentroEstudio'].reset();
      this.form.controls['anioInicio'].reset();
      this.form.controls['anioFinal'].reset();
      this.form.controls['titulos'].reset();
      this.form.controls['especialidad'].reset();
      this.form.controls['nroRegistroTitulo'].reset();
      this.form.controls['fechaExpedicionGrado'].reset();
      this.form.controls['idSituacionAcademica'].reset();
      this.form.controls['correoElectronico'].reset();
      this.form.controls['celular'].reset();
      this.form.controls['telefonoFijo'].reset();
      this.form.controls['anotaciones'].reset();
      this.form.controls['tieneImpedimento'].reset();
      this.form.controls['adjuntarDocumento'].reset();  

  }


  handleVerVinculacionVigente(){
    let dialogRef = this.materialDialog.open(BuscarVinculacionesComponent, {
      panelClass: 'minedu-buscar-vinculaciones-dialog',
        disableClose: true,
        data: {
          id_gestion_vinculacion: 0,
          id_persona: this.persona.id_persona,
          persona: this.persona,
          tipo_vinculacion_vigentes: this.tipo_vinculacion_vigentes
        }
    });
    dialogRef.afterClosed().subscribe((response: any) => {
      if ((!response || response.id_plaza == undefined ) && this.tipo_vinculacion_vigentes == 1) {  

        this.LimpiarAccion();        
        return;

      } 
      
      if(this.tipo_vinculacion_vigentes == 1) {
        // Validar Vinculaciones vigentes
        let request = {          
          idPlaza : response.id_plaza,
          idRegimenLaboral: this.form.get('idRegimenLaboral').value,
          idAccion: this.form.get('idAccion').value,
          idMotivoAccion: this.form.get('idMotivoAccion').value,
          fechaInicioVinculacion: response.fecha_inicio,
          fechaFnVinculacion: response.fecha_fin
        }
        this.dataService.AccionesVinculacion().validarVinculacionVigente(request).subscribe(
          (dataResponse) => {
            
            this.personaValidacion = dataResponse;
            if (this.personaValidacion.bError) {
    
              // Mostrar Mensaje
              this.dataService.Spinner().hide("sp6");
              
              this.dataService.Message().msgWarning(this.personaValidacion.mensaje, () => {                 
                this.LimpiarAccion();                  
               });  
              
            }  else {
              // Insert plaza
              this.form.patchValue({
                codigoPlaza: response.codigo_plaza,
                idPlaza: response.id_plaza
              });
              this.idPlaza = response.id_plaza;
              this.persona.id_plaza = response.id_plaza;
                            
              this.onBuscarPlaza();
              this.handleBuscarPersonaDatosEstudiosPensionario();

            }
          },
          (error: HttpErrorResponse) => {
            console.log(error);
            this.dataService.Spinner().hide("sp6");
            this.dataService.Message().msgWarning('"'+error.error.messages[0]+'"');
            this.seBuscoPersona = false;
          }
        )    

      }
      
    });
  }

  handleSancionesAdministrativas() {
debugger;
    let dialogRef = this.materialDialog.open(BuscarSancionAdministrativaComponent, {
      panelClass: 'minedu-buscar-sanciones-administrativas-dialog',
        disableClose: true,
        data: {
          id_gestion_vinculacion: 0,
          id_tipo_documento: this.persona.idTipoDocumentoIdentidad, //this.form.get('idTipoDocumentoIdentidad').value,
          numero_documento: this.persona.numeroDocumentoIdentidad, //this.form.get('numeroDocumentoIdentidad').value
          persona: this.persona,
          tipoSancion: this.tipoSancion,
          mensajeSancion: this.mensajeSancion,
          idRegimenLaboral: this.idRegimenLaboral
        }
    });
    dialogRef.afterClosed()
    .subscribe((response: any) => {
      if (!response) {
        return;
      }
      console.log(response);
    });
  }

  handleVerAdjudicaciones() {
    let dialogRef = this.materialDialog.open(BuscarAdjudicacionesComponent, {
      panelClass: 'minedu-buscar-adjudicaciones-dialog',
        disableClose: true,
        data: {
          id_gestion_vinculacion: 0,
          id_persona: this.persona.id_persona,
          persona: this.persona
        }
    });
    dialogRef.afterClosed().subscribe((response: any) => {
      console.log('close modal resul', response);
      if (!response || response.id_adjudicacion_proceso_persona == undefined) {        
        this.LimpiarAccion();
          return;
      }
            
      this.form.patchValue({
        codigoPlaza: response.codigo_plaza,
        idPlaza: response.id_plaza,
        fechaInicio: response.vigencia_inicio_adjudicacion,
        fechaTermino: response.vigencia_fin_adjudicacion
      });
      debugger;
      this.persona.id_adjudicacion_proceso_persona = response.id_adjudicacion_proceso_persona;
      this.idPlaza = response.id_plaza;
      this.persona.id_plaza = response.id_plaza;

       // Ver Modal Conformidad de adjudicacion
       this.handleConformidadAdjudicacion();
    //  this.onBuscarPlaza();
    //  this.handleBuscarPersonaDatosEstudiosPensionario();
    });
  }

  handleConformidadAdjudicacion(){

    let infoRegistro = this.getDataViewAdjudicacion();

    let dialogRef = this.materialDialog.open(ConformidadAdjudicacionComponent, {
      panelClass: 'Minedu-conformidad-adjudicacion-dialog',
        disableClose: true,
        data: {
          persona: this.persona,
          id_adjudicacion_proceso_persona: this.persona.id_adjudicacion_proceso_persona,
          idPlaza : this.idPlaza,
          infoRegistro: infoRegistro
        }
    });
    dialogRef.afterClosed().subscribe((response: any) => {
      console.log('close modal resul', response);
      if (!response ) {
        return;
      }
      debugger;
      if(response.confirmar) {

        //this.onBuscarPlaza();
        this.onBuscarPlazaPorId();
        this.handleBuscarPersonaDatosEstudiosPensionario();
      } else{
        this.LimpiarAccion();
        return;
      }
      
    });
  }

  loadVinculacionPorId() {
      
    this.dataService.Spinner().show("sp6");
      // this.working = true;
    this.dataService.AccionesVinculacion().getVinculacionPorId(this.id_gestion_vinculacion).subscribe(
      (response) => {
        this.dataService.Spinner().hide("sp6");
        console.log('loadVinculacionPorId => ', response);

        this.vinculacion = response;

        this.seBuscoPersona = true;
        
        this.estaEnProcesoAdjudicacion = response.por_proceso;

        this.codigoAprobacion = response.codigoAprobacion;
        this.codigo_estado_vinculacion = response.codigo_estado_vinculacion;

        this.isMandatoJudicial = response.es_mandato_judicial;
        this.codigoProcesoAprobacion = response.codigo_proceso_aprobacion;

        if(!this.estaEnProcesoAdjudicacion){
          this.tieneVinculacionesVigente = response.tiene_vinculaciones;
          this.tipo_vinculacion_vigentes = 2;
        }

        if(response.codigo_documento_pensionario == null) {
          this.tieneDocumento = false;
        }

        if(response.codigo_estado_vinculacion == 1 || response.codigo_estado_vinculacion == 10 ) {
          this.VerObservacion = true;  
        }        

        this.persona = {
          primerApellido: response.primer_apellido,
          segundoApellido: response.segundo_apellido,
          nombres: response.nombres,
          estadoCivil: response.estado_civil,
          codigoEstadoCivil: response.codigoEstadoCivil,
          sexo: response.genero,
          codigoGenero: response.codigoGenero,
          fechaNacimiento: response.fecha_nacimiento,
          fechaNacimientoStr: response.fecha_nacimiento_str,
          edad: response.edad,
          id_persona: response.id_persona,
          idTipoDocumentoIdentidad: response.id_tipo_documento_identidad,
          tipoDocumentoIdentidad: response.tipo_documento_identidad,
          numeroDocumentoIdentidad: response.numero_documento_identidad,
          id_plaza: response.id_plaza,
          id_adjudicacion_proceso_persona: response.id_adjudicacion_proceso_persona
        }        
        
        this.form.patchValue({

          esMandatoJudicial: response.es_mandato_judicial,
          idRegimenLaboral: response.id_regimen_laboral,
          idAccion: response.id_accion,
          idMotivoAccion: response.id_motivo_accion,
          porProceso: response.por_proceso,

          idTipoDocumentoIdentidad: response.id_tipo_documento_identidad,
          numeroDocumentoIdentidad: response.numero_documento_identidad,

          codigoPlaza: response.codigo_plaza,

          fechaInicio: response.fecha_inicio,
          fechaTermino: response.fecha_fin,
          fechaInicioStr: response.fecha_inicio_str,
          fechaTerminoStr: response.fecha_fin_str

        });

        this.loadComboAcciones(response.id_regimen_laboral);        
        this.loadComboMotivoAccion(response.id_accion);

        this.form.patchValue({
          idMotivoAccion: response.id_motivo_accion
        })

        this.onChangeRegimenPensionario(response.id_regimen_pensionario);
    

        if(response.codigo_estado_vinculacion == TablaEstadoVinculacion.SUBSANADO ) {

          if(response.correo == null && response.celular == null) {
            this.CompletarDatos = false;
          }          

        } 

        if(this.CompletarDatos) {
          this.form.patchValue({           
  
            tieneImpedimento: response.check_impedimento,
  
            correoElectronico: response.correo,
            celular: response.celular,
            telefonoFijo: response.telefono,
  
            idRegimenPensionario: response.id_regimen_pensionario,
            idAfp: response.id_afp,
            idTipoComision: response.id_tipo_comision,
            numeroCuspp: response.codigo_cuspp,
            fechaIngresoSPP: response.fecha_afiliacion,
            fechaDevengue: response.fecha_devengue,
            fechaIngresoSPPStr: response.fecha_afiliaciono_strg,
            fechaDevengueStr: response.fecha_devengue_strg,
            folios: response.folios,
  
            idNivelEducativo: response.id_nivel_educativo,
            idSituacionAcademica: response.id_situacion_academica,
            idGradoAcademico: response.id_grado_academico,
            idSecundaria: response.id_secundaria,
            idSuperior: response.id_superior,
            idEstudio: response.id_grado_academico,
            idGrado: response.id_grado_academico,
            titulos: response.titulo,
            especialidad: response.especialidad,
            nroRegistroTitulo: response.numero_registro_titulo,
  
            anotaciones: response.anotaciones,
  
            codigoDocumentoPensionario: response.codigo_documento_pensionario
  
          });

          
  
          this.datos_pensionario = {
            descripcionRegimenPensionario: response.descripcion_regimen_pensionario,
            descripcionAfp: response.descripcion_afp,
            descripcionTipoComision: response.descripcion_tipo_comision,
            codigoCuspp: response.codigo_cuspp,
            fechaIngresoSPPStr: response.fecha_afiliaciono_strg,
            fechaDevengueStr: response.fecha_devengue_strg,   
            folios: response.folios
          }
          this.datos_Formacion_Academica = {
            descripcionNivelEducativo: response.descripcion_nivel_educativo,
            descripcionSituacionAcademica: response.descripcion_situacion_academica,
            descripcionGradoAcademico: response.descripcion_grado_academico,
            descripcionSuperior: response.descripcion_superior,
            descripcionSecundaria: response.descripcion_secundaria,
            titulos: response.titulo,
            especialidad: response.especialidad,
            nroRegistroTitulo: response.numero_registro_titulo
          }
  
          this.datos_Contacto = {
            correoElectronico: response.correo,
            celular: response.celular,
            telefonoFijo: response.telefono,
            anotaciones: response.anotaciones
          }
  
          this.onChangeNivelEducativo();
          
          this.form.patchValue({
            idSecundaria: response.id_secundaria,
            idSuperior: response.id_superior,
            idSituacionAcademica: response.id_situacion_academica          
          });
  

          this.idSituacionAcademica = response.id_situacion_academica;
          this.idConGrado = response.id_grado_academico;
  
          if(response.id_secundaria > 0 || response.id_superior > 0) {     
            this.ListarSituacionAcademica();          
          }  else {
            this.onChangeSituacionAcademica();     
          }
          
        }

        this.datos_cabecera = {          
          DescripcionRegimenLaboral:  response.descripcion_regimen_laboral,
          descripcionAccion:  response.descripcion_accion,
          descripcionMotivoAccion:  response.descripcion_motivo_accion,
          descripcionMandatoJudicial: response.descripcion_mandato_judicial,  
          descripcionPorProceso: response.descripcion_por_proceso,
        }   
        
        this.datos_accion = {
          fechaInicioStr: response.fecha_inicio_str,
          fechaTerminoStr: response.fecha_fin_str
        }

        this.onBuscarPlaza();

        this.ValidarFechasVinculacion();
  
        this.validacionFechaVinculacion2();
        
        if(response.codigo_estado_vinculacion == TablaEstadoVinculacion.OBSERVADO || this.isInformacion) {

          if(response.correo == null && response.celular == null) {
            this.verInformacionTieneImpedimento = false;
            this.verInformacionRegimenPensionario = false;
            this.verInformacionFormacionAcademica = false;
            this.verInformacionDatosContacto = false;
            this.verInformacionAnotacion = false;
          }          

        }

      },
      (error: HttpErrorResponse) => {
        this.dataService.Spinner().hide("sp6")
        console.log(error);
        this.dataService.Message().msgWarning("Ocurrió un error al obtener datos de la vinculación");
      }
    )
  }

  loadDatosContratoPorId(): void {
    this.dataService.Spinner().show("sp6");
    this.dataService.AccionesVinculacion().getGestionContratoPorId(this.id_gestion_contrato).subscribe(
      (response) => {
        this.dataService.Spinner().hide("sp6");
        console.log('loadDatosContratoPorId => ', response);
        
        this.datos_contrato = response;

        this.form.patchValue({
          fechaInicio: this.datos_contrato.fecha_inicio,
          fechaTermino: this.datos_contrato.fecha_fin,
          numeroRuc: this.datos_contrato.numero_ruc,
          renumeracionMensual: this.datos_contrato.remuneracion_mensual
        })

      },
      (error: HttpErrorResponse) => {
        this.dataService.Spinner().hide("sp6")
        console.log(error);
        this.dataService.Message().msgWarning("Ocurrió un error al obtener datos de la vinculación");
      }
    )
  }

  obtenerPeriodoLectivo() {
    this.dataService.AccionesVinculacion().getFechaLectivo().subscribe(
      (response) => {
        this.fechaValidacion = new Date(response.fechainicio);        
      },
      (error: HttpErrorResponse) => {
        console.log(error);
      }
    )
  }

  validarFecha(){

    let anio_fecha_inicio = (new Date(this.form.get('fechaInicio').value)).getFullYear();

    this.maxDate = new Date(anio_fecha_inicio, 11, 31);

  }

  validacionFechaVinculacion2(){

    

    if(this.isNew && this.verFecha > 1) {
      this.form.controls['fechaTermino'].reset();
    }
    
    this.verFecha = this.verFecha + 1;

    let anio_fecha_inicio = (new Date(this.form.get('fechaInicio').value)).getFullYear();
    let current_start_date = (new Date(this.form.get('fechaInicio').value));

    this.finDia = new Date(anio_fecha_inicio, 11, 31);      

    // Fecha fIn - fecha inicio
    if(this.tipoValidacionFechaFin == 1) {      
      this.newMinDate = new Date(current_start_date.setDate(current_start_date.getDate() + 31));
      this.maxDate = new Date(anio_fecha_inicio, 11, 31);

      if(this.newMinDate > this.finDia) {
        this.newMinDate = new Date(anio_fecha_inicio, 11, 31);
      } 

    }

    if(this.tipoValidacionFechaFin == 2) {      
      this.newMinDate = new Date(current_start_date.setDate(current_start_date.getDate() + 30));
      this.maxDate = new Date(anio_fecha_inicio, 11, 31);

      if(this.newMinDate > this.finDia) {
        this.newMinDate = new Date(anio_fecha_inicio, 11, 31);
      } 

    }

    if(this.tipoValidacionFechaFin == 3) { 
      if(this.TipoPlaza == 1 || this.TipoPlaza == 2) {

        this.newMinDate = new Date(current_start_date.setDate(current_start_date.getDate() + 30));
        this.maxDate = new Date(anio_fecha_inicio, 11, 31);
      }   
      else 
      {

        this.newMinDate = new Date(current_start_date.setDate(current_start_date.getDate() + 1));
        this.maxDate = new Date(anio_fecha_inicio, 11, 31);
      }

    }

    if(this.tipoValidacionFechaFin == 4) {      
      
      if(this.idPlazaDesierta > 0 ){

        this.newMinDate = new Date(current_start_date.setDate(current_start_date.getDate() + 31));
        this.maxDate = new Date(anio_fecha_inicio, 11, 31);

        if(this.newMinDate > this.finDia) {
          this.newMinDate = new Date(anio_fecha_inicio, 11, 31);
        } 

      } else {

        this.newMinDate = new Date(current_start_date.setDate(current_start_date.getDate() + 1));
        this.maxDate = new Date(current_start_date.setDate(current_start_date.getDate() + 29));

        if(this.maxDate > this.finDia) {
          this.maxDate = new Date(anio_fecha_inicio, 11, 31);
        } 

      }

    }

    if(this.tipoValidacionFechaFin == 5) {      
      this.newMinDate = new Date(current_start_date.setDate(current_start_date.getDate() + 1));
      this.maxDate = new Date(current_start_date.setDate(current_start_date.getDate() + 28));      

      if(this.maxDate > this.finDia) {
        this.maxDate = new Date(anio_fecha_inicio, 11, 31);
      }  
      
    }

  }


  validacionFechaVinculacion(){
       
    // Validar Tipo validacion

    // Obtener Año de fecha inicio
    debugger;
    let anio_fecha_inicio = (new Date(this.form.get('fechaInicio').value)).getFullYear();
    
    let idRegiomenLaboralSelected = this.form.get('idRegimenLaboral').value;
    let idMotivoSelected = this.form.get('idAccion').value;
    let idMotivoAccionSelected = this.form.get('idMotivoAccion').value;    

    if(idRegiomenLaboralSelected == 3 ){
      if(idMotivoSelected == 34) {
        if(idMotivoAccionSelected == 231 || idMotivoAccionSelected == 278 || idMotivoAccionSelected == 279 || idMotivoAccionSelected == 236  ) {
          this.tipoValidacionFecha = 1;
        }
        else 
        if(idMotivoAccionSelected == 232 ){
          this.tipoValidacionFecha = 2;
        }
      }
    }

    if(this.tipoValidacionFecha == 1) // RN-PER-PAQ002.10.01-006
    {
      
      // Fecha Inicio = Fecha inicio periodo lectivo 
      this.minDate = new Date(this.fechaValidacion);

      //Vigencia mínima (fecha fin – fecha de inicio)   >= 30 días
      let current_start_date = (new Date(this.form.get('fechaInicio').value))
      this.newMinDate = new Date(current_start_date.setDate(current_start_date.getDate() + 30))
      this.maxDate = new Date(anio_fecha_inicio, 11, 31);

      if(this.newMinDate > this.maxDate) {
        this.newMinDate = this.maxDate;
        this.maxDate = new Date(anio_fecha_inicio, 11, 30);
      }

    }
    else
    if(this.tipoValidacionFecha == 2) // RN-PER-PAQ002.10.01-007
    {      
      // Fecha Inicio = primer día hábil del mes que inicia el periodo lectivo.        
      
      this.fechaValidacion = new Date(this.fechaValidacion.getFullYear(), this.fechaValidacion.getMonth(), 1);

      if(this.fechaValidacion.getDay()==6) //sabado
      {
        this.minDate = new Date(this.fechaValidacion.getFullYear(), this.fechaValidacion.getMonth(), this.fechaValidacion.getDate()+2);
      }else if(this.fechaValidacion.getDay()==0){ // domingo
        this.minDate = new Date(this.fechaValidacion.getFullYear(), this.fechaValidacion.getMonth(), this.fechaValidacion.getDate()+1);
      } else {
        this.minDate = new Date(this.fechaValidacion.getFullYear(), this.fechaValidacion.getMonth(), 1);
      }     

      //Si la plaza tipo plaza = “Espejo” 
      if(this.TipoPlaza == 4)
      {
      //se encuentra desierta en el proceso de contratación
        if(this.idPlazaDesierta > 0 ){
          //-	Vigencia mínima (fecha fin – fecha de inicio)   >= 30 días      
          let current_start_date = (new Date(this.form.get('fechaInicio').value))
          this.newMinDate = new Date(current_start_date.setDate(current_start_date.getDate() + 30))

        } else {
          //NO se encuentra desierta en el proceso de contratación
          //-		Vigencia máxima (fecha fin – fecha de inicio) <= 30 días
          let current_start_date = (new Date(this.form.get('fechaInicio').value))
          this.maxDate = new Date(current_start_date.setDate(current_start_date.getDate() + 30))

        }
      }
      else {
        this.minDate = new Date(new Date().getFullYear(), 0, 1);
        this.newMinDate = (new Date(this.form.get('fechaInicio').value)) ;
        this.maxDate = new Date(new Date().getFullYear(), 11, 31);
      }
     
    } 
    else {
      this.minDate = new Date(new Date().getFullYear(), 0, 1);
      this.newMinDate = (new Date(this.form.get('fechaInicio').value)) ;
      this.maxDate = new Date(anio_fecha_inicio, 11, 31);

      if(this.newMinDate > this.maxDate) {
        this.newMinDate = this.maxDate;
        this.maxDate = new Date(anio_fecha_inicio, 11, 30);
      }

    }

  }

  handleEliminarAdjunto(){
    this.form.patchValue({ adjuntarDocumento: null, codigoDocumentoPensionario: "" });

    this.form.get('adjuntarDocumento').setValidators(Validators.required);

  }

  handleVerPdfAdjunto() {
    let data = this.form.getRawValue();
    if (data.codigoDocumentoPensionario === null) {
      return;
    }
    this.dataService.Spinner().show('sp6');
    this.dataService.Documento().descargar(data.codigoDocumentoPensionario)
        .pipe(
            catchError((e) => {
                return of(e);
            }),
            finalize(() => this.dataService.Spinner().hide('sp6'))
        ).subscribe(response => {
            if (response) {
                this.handlePreviewS1(response, data.codigoDocumentoPensionario);
            } else {
                this.dataService.Message().msgWarning('NO SE PUDO OBTENER EL DOCUMENTO DE SUSTENTO.', () => {
                });
            }
        });
  }

  handlePreviewS1(file: any, codigoAdjuntoSustento: string) {
    this.dialogRef = this.materialDialog.open(DocumentViewerComponent, {
        panelClass: 'modal-viewer-form-dialog',
        disableClose: true,
        data: {
            modal: {
                icon: 'remove_red_eye',
                title: 'Documento Adjunto',
                file: file,
                fileName: codigoAdjuntoSustento
            }
        }
    });

    this.dialogRef.afterClosed()
        .subscribe((response: any) => {
            if (!response) {
                return;
            }
        });
  };

  handleEscalafon() {
    let dialogRef = this.materialDialog.open(FormacionAcademicaComponent, {
      panelClass: 'minedu-formacion-academica-dialog',
        disableClose: true,
        data: {
          persona: this.persona
        }
    });
    dialogRef.afterClosed().subscribe((response: any) => {
      console.log('close modal resul', response);        
      
      this.form.patchValue({
        idNivelEducativo: this.combo.nivelesEducativos.filter(m => m.codigo_nivel_educativo == response.codigo_nivel)[0].id_nivel_educativo     
      });           

      // Definir cada codigo
      this.codigo_nivel = response.codigo_nivel;
      this.codigo_nivel_especifico = response.codigo_nivel_especifico;
      this.codigo_situacion_academica = response.codigo_situacion_academica;
      this.codigo_grado_academico = response.codigo_grado_academico;

      this.onChangeNivelEducativo();      

      if(this.codigo_nivel_especifico > 0 ) {     
        this.ListarSituacionAcademica();          
      }                 

    });
  }

  ActualizarDatosFormacionAcademica( id_nivel_especifico, id_situacion_academica, id_grado_academico ) {

     this.onChangeNivelEducativo();
        
     this.form.patchValue({
       idSecundaria: id_nivel_especifico,
       idSuperior: id_nivel_especifico,
       idSituacionAcademica:   id_situacion_academica        
     });

     this.idSituacionAcademica = id_situacion_academica;
     this.idConGrado = id_grado_academico;

     if(id_nivel_especifico > 0 ) {     
       this.ListarSituacionAcademica();          
     }  

     this.nivelSituacionAcademico = true;
     this.form.patchValue({           
       idSituacionAcademica: id_situacion_academica          
     });                 
     
     this.onChangeSituacionAcademica();    
  }

}


