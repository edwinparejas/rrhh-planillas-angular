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
import { saveAs } from 'file-saver';
import { ResumenPlazasResponseModel } from 'app/main/apps/procesos/contratacion-30493/models/contratacion.model';
import { CentroTrabajoModel, MESSAGE_GESTION, TablaEquivalenciaSede } from '../models/desvinculacion.model';
import { SolicitarAutorizacionComponent } from './components/solicitar-informacion/solicitar-autorizacion.component';
import { DocumentViewerComponent } from 'app/main/apps/components/document-viewer/document-viewer.component';
import { BuscarVinculacionesComponent } from './components/buscar-vinculaciones/buscar-vinculaciones.component';
import { RechazarAutoizacionComponent } from './components/rechazar-autorizacion/rechazar-autorizacion.component';
import { GenerarProyectoComponent } from '../components/generar-proyecto/generar-proyecto.component';
import { BuscarPersonaComponent } from '../components/buscar-persona/buscar-persona.component';
import { CodigoDreUgelService } from '../../pronoei/services/codigo-dre-ugel.service';

@Component({
    selector: 'minedu-desvinculacion',
    templateUrl: './desvinculacion.component.html',
    styleUrls: ['./desvinculacion.component.scss'],
    encapsulation: ViewEncapsulation.None,
    animations: mineduAnimations
  })


  export class DesvinculacionComponent implements OnInit {  
  
    idRegimenLaboral: number =  null;

    codigoAprobacion: "";
    codigo_estado_desvinculacion = 0;
    nombreCabecera = "";
    nombreCabecera2 = "";
    isAprobacion : boolean = false;
    dataUserLoginModel: any;
    minDate = new Date(new Date().getFullYear(), 0, 1)
    untilDate = new Date(new Date().getFullYear() + 1, 11, 31);
    maxDate = new Date();
    nowDate = new Date();

    centroTrabajo: CentroTrabajoModel = null;

    mandato_judicial_desc = "NO";

    informe: any;

    dialogRefPreview: any;
    ley276 : boolean = false;

    persona: any = {};
    datosLaborales: any = {};
    laboral: any = {};
    plaza: any = {};
    contrato: any = {};

    Nombre_Usuario = "";
    idDre : any;
    idUgel : any;
    codigoTipoSede = "";
    codigoSede = "";
    codigoRol = "";

    ValidacionFechaLimite : any;

    seBuscoPersona: boolean = false;    
    seBuscoLaboral: boolean = false;    

    seEnviaAccionesGrabadas: boolean = false;
    seGeneraCartaCese: boolean = false;

    tieneVinculacionesVigente: boolean = false;

    iCantidadServidorPublico = 0;
    idServidorPublico = 0;
    idPlaza = 0;
    tipoFiltro = 0;

    private passport: SecurityModel = new SecurityModel();

    isMandatoJudicial: boolean = false;
    isMotivoMandatoJudicial : boolean = false;
    isMotivoGenerarCese : boolean = false;
    isMotivoGenerarProyecto : boolean = false;

    private currentSession: SecurityModel = new SecurityModel();

    private _loadingChange = new BehaviorSubject<boolean>(false);
    loading = this._loadingChange.asObservable();
    dataSource: MatTableDataSource<any>;
    selection = new SelectionModel<any>(false, []);

    dialogRef: any;
    form: FormGroup;
    working = false;

    datos_cabecera: any = {};
    datos_accion: any = {};
    datos_pensionario: any = {};
    datos_Formacion_Academica: any = {};
    datos_Contacto: any = {};

    request = {
      pIdTipoDocumentoIdentidad: 0,
      pNumeroDocumentoIdentidad: "",
      pNumeroInformeEscalafonario: null,
      idUgel: 0,
      idDre: 0
    };

    requestContrato = {     
      pNumeroContrato: null
    };

    contrato_cese = {
      numeroDocumento: "0",
      numeroContrato: "",
    };

    combo = {
    regimenesLaborales: [],
    grupoAcciones: [],
    acciones: [],
    motivosAccion: [],
    tiposDocumentoIdentidad: [],
    adjudicaciones: [],
    tiposResolucion: [],
    regimenesPensionarios: [],
    afps: [],
    nivelesEducativos: [],
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

  id_gestion_desvinculacion: any;
  codigo_plaza: any;

  tipo_vinculacion: any; // (v) vinculacion, (c) contrato, (a) adenda
  tipo_accion: any; // (i) informacion

  isNew: boolean = true;
  isEdit: boolean = false;
  isBuscar: boolean = false;
  isInformacion: boolean = false;
  vinculacion: {};

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
        
      this.maxDate = this.untilDate;

      this.route.paramMap.subscribe((params: any) => {
        //tipo => vinculacion (v), contrato (c), adenda(a)
        this.tipo_vinculacion = params.get('tipo');
        console.log('this.tipo_vinculacion => ',this.tipo_vinculacion);
      });

      this.buildForm();
      this.buildPassport();

      
     // this.entidadPassport();
      this.getDreUgelData();

    //  this.buildSeguridad();
    //  this.obtenerCodigoDreUgelLogeado();

      this.loadCombos();
      

      this.dataSource = new MatTableDataSource([]);
      setTimeout(_ => this.buildShared());

      this.route.paramMap.subscribe((params: any) => {
        //tipo => vinculacion (v), contrato (c), adenda(a)
        this.tipo_vinculacion = params.get('tipo');
        this.id_gestion_desvinculacion = params.get('id');
  
       
          this.nombreCabecera = "Nueva Desvinculación";
          console.log('Nueva Desvinculación');
  
        if (this.id_gestion_desvinculacion != undefined && this.id_gestion_desvinculacion > 0) {
  
          if(this.tipo_vinculacion == "informacion") {
            this.nombreCabecera = "Ver Desvinculación";
            console.log('informacion');
            this.isInformacion = true;
          } 
          
          if(this.tipo_vinculacion == "modificar") {
            this.nombreCabecera = "Modificar Desvinculación";
            console.log('editar');
            this.isEdit = true;
          }
  
          if(this.tipo_vinculacion == "aprobacion") {
            this.nombreCabecera = "Ver Desvinculación";
            console.log('aprobacion');
            this.isInformacion = true;
            this.isAprobacion = true;
          }
  
          this.isNew = false;   
  
          this.id_gestion_desvinculacion = parseInt(params.get('id'));
          this.loadDesvinculacionPorId();
        }
  
      });

      
  
    }

    private async getDreUgelData() {

      this.codigoTipoSede = this.codigoDreUgelService.passportModel.CODIGO_TIPO_SEDE;
      this.codigoSede = this.codigoDreUgelService.passportModel.CODIGO_SEDE;
      this.codigoRol = this.codigoDreUgelService.passportModel.CODIGO_ROL;
  
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

      console.log('codigos => ', codigos);

    }

    entidadPassport(){
      this.dataService.AccionesDesvinculacion().entidadPassport(this.passport.codigoSede).pipe(
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
          this.idDre = this.centroTrabajo?.idDre;
          this.idUgel = this.centroTrabajo?.idUgel;
          this.codigoTipoSede = this.passport.codigoTipoSede;
  
          this.handleBuscar();
        }else{
          this.centroTrabajo = null;
        }
      });
    }

    buildSeguridad = () => {
      debugger
      
      this.currentSession = this.dataService.Storage().getInformacionUsuario();
   
    }

    loadDesvinculacionPorId() {
      
      this.dataService.Spinner().show("sp6");
        // this.working = true;
      this.dataService.AccionesDesvinculacion().getDesvinculacionPorId(this.id_gestion_desvinculacion).subscribe(
        (response) => {
          this.dataService.Spinner().hide("sp6");
          console.log('loadVinculacionPorId => ', response);
          this.vinculacion = response;
  
          this.seBuscoPersona = true;          
          
          this.codigo_estado_desvinculacion = response.codigo_estado_desvinculacion;

          this.codigoAprobacion = response.codigo_proceso_aprobacion;

          this.datosLaborales = {
            idServidorPublico : response.id_servidor_publico,
            codigoPlaza: response.codigo_plaza,
            idPlaza: response.id_plaza
          }
  
          this.persona = {
            primerApellido: response.primer_apellido,
            segundoApellido: response.segundo_apellido,
            nombres: response.nombres,
            estadoCivil: response.estado_civil,
            sexo: response.sexo,
            fechaNacimiento: response.fecha_nacimiento,
            edad: response.edad,
            idPersona: response.id_persona,
            idTipoDocumentoIdentidad: response.id_tipo_documento_identidad,
            descripcionTipoDocumentoIdentidad: response.descripcion_tipo_documento_identidad,
            numeroDocumentoIdentidad: response.numero_documento_identidad,
            idPlaza: response.id_plaza,            
            //            
            fechaInicioStr: response.fecha_inicio_str,
            anotaciones: response.anotaciones,
            //
            datosLaborales: this.datosLaborales
          }
          
          this.seBuscoLaboral = true;
          this.laboral = {
            codigoPlaza: response.codigo_plaza,
            descripcionTipoPlaza: response.descripcion_tipo_plaza,
            subInstancia: response.sub_instancia,
            centroTrabajo: response.centro_trabajo,
            jornadaLaboral: response.jornada_laboral,
            descripcionModalidadEducativa: response.modalidad_educativa,
            nivelEducativo: response.nivel_educativo,
            descripcionCargo: response.cargo,
            escalaMagisterial: response.escala_magisterial,
            motivoVacancia: response.motivo_vacancia
          }
          
          this.form.patchValue({
  
            esMandatoJudicial: response.es_mandato_judicial,
            idRegimenLaboral: response.id_regimen_laboral,
            idGrupoAccion: response.id_grupo_accion,
            idAccion: response.id_accion,            
            idMotivoAccion: response.id_motivo_accion,
  
            idTipoDocumentoIdentidad: response.id_tipo_documento_identidad,
            numeroDocumentoIdentidad: response.numero_documento_identidad,
            numeroInformeEscalafonario: response.numero_informe_escalafon,
            codigoInformeEscalafonario: response.codigo_informe_escalafon,
  
            codigoPlaza: response.codigo_plaza ,
            fechaInicio: response.fecha_inicio ,
            anotaciones: response.anotaciones 
          });
  
          this.datos_cabecera = {          
            DescripcionRegimenLaboral:  response.descripcion_regimen_laboral,
            descripcionGrupoAccion:  response.descripcion_grupo_accion,
            descripcionAccion:  response.descripcion_accion,
            descripcionMotivoAccion:  response.descripcion_motivo_accion,
            descripcionMandatoJudicial: response.descripcion_mandato_judicial       
          }   
          
          this.informe = {
            numeroInformeEscalafonario:response.numero_informe_escalafon,
            fechaInformeEscalafonario:response.fecha_informe_escalafon,
            documentoInformeEscalafonario:response.codigo_informe_escalafon,
            aniosTiempoServicio: response.tiempo_servicio,
            DescrSancionAdministrativa: response.flag_Sancion_administrativa == 1 ? 'SI': 'NO'

          }
  
          this.loadComboAcciones(response.id_regimen_laboral);        
          this.loadComboMotivoAccion(response.id_accion);

          this.ValidarTipoFiltro(response.id_motivo_accion);

  
        },
        (error: HttpErrorResponse) => {
          this.dataService.Spinner().hide("sp6")
          console.log(error);
          this.dataService.Message().msgWarning("Ocurrió un error al obtener datos de la desvinculación");
        }
      )
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

    loadCombos() {
      this.loadComboRegimenLaboral();  
      this.loadComboGrupoAcciones();  
      this.loadComboTipoDocumento();
    }
    
    loadComboRegimenLaboral = () => {
      let request = {
        codigoRol: this.codigoRol
      }
      this.dataService.AccionesDesvinculacion().getComboRegimenLaboral(request).subscribe(
        (response) => {
          this.combo.regimenesLaborales = response;          
        },
        (error: HttpErrorResponse) => {
          console.log(error);
        }
      )
    }

    loadComboGrupoAcciones() {
    
      this.dataService.AccionesDesvinculacion().getComboGrupoAccion().subscribe(
        (response) => {
            
          this.combo.grupoAcciones = response;             
          
        },
        (error: HttpErrorResponse) => {
          console.log(error);
        }
      )
    }

    loadComboAcciones(id_regimen_laboral) {
    
      const params = {
        id_regimen_laboral: parseInt(this.form.get('idRegimenLaboral').value),
        codigoRol: this.codigoRol
      }     

      this.dataService.AccionesDesvinculacion().getComboAccionPorRegimenLaboral(params).subscribe(
        (response) => {
          this.combo.acciones = response;
          this.combo.motivosAccion = [];    

          if (this.id_gestion_desvinculacion == undefined || this.id_gestion_desvinculacion == null) {
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
      if (this.id_gestion_desvinculacion == undefined || this.id_gestion_desvinculacion == null) {
            this.form.patchValue({
              idMotivoAccion: -1
            })
          } 
      
      if (id_accion == undefined) {
        return;
      }
      const params = {
        id_accion: id_accion,
        id_regimen_laboral: parseInt(this.form.get('idRegimenLaboral').value),
        codigoRol: this.codigoRol
      }
      this.dataService.AccionesDesvinculacion().getComboMotivoAccionPorAccion(params).subscribe(
        (response) => {
          this.combo.motivosAccion = response;
  
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
      this.dataService.AccionesDesvinculacion().getCatalogoItem(request).subscribe(
        (response) => {
          this.combo.tiposDocumentoIdentidad = response;
        },
        (error: HttpErrorResponse) => {
          console.log(error);
        }
      )
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
      this.dataService.AccionesDesvinculacion().getCodigoDreUgel(request).subscribe(
        (response) => {
          console.log('obtenerCodigoDreUgelLogeado() =>', response);
          this.dataUserLoginModel = response;
        }, 
        (error: HttpErrorResponse) => {
        }
      )
    }

    LimpiarAccion() {
      this.persona = {};
        this.plaza = {};
        this.seBuscoPersona = false;
  
        this.form.controls['idTipoDocumentoIdentidad'].reset();
        this.form.controls['TipoDocumentoIdentidad'].reset();
        this.form.controls['numeroDocumentoIdentidad'].reset();
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



    buildForm() {    

      this.form = this.formBuilder.group({
        esMandatoJudicial: [false],
        idRegimenLaboral: [null, Validators.required],
        idGrupoAccion: [0, Validators.required],
        idAccion: [0, Validators.required],
        idMotivoAccion: [0, Validators.required],        
        idTipoDocumentoIdentidad: [-1],
        TipoDocumentoIdentidad: [null],
        numeroDocumentoIdentidad: [null],   
        numeroInformeEscalafonario: [null, Validators.required],
        fechaInicio: [null, Validators.required],
        fechaInicioStr: [null],
        anotaciones:  [null],
        idGestionContrato: [null],
        numeroContrato: [null]
      });

  }

  handleAutorizar(){

    let mensaje = '¿ESTÁ SEGURO QUE DESEA AUTORIZAR LA DESVINCULACIÓN?'

    this.dataService.Message().msgConfirm(mensaje, () => {
    

      let viewModel = {        
        idDesvinculacion: this.id_gestion_desvinculacion,
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

      this.dataService.AccionesDesvinculacion().aprobarDesvinculacion(viewModel).pipe(
        catchError((e) => of(e)),
        finalize(() => {
          this.dataService.Spinner().hide("sp6")
          this.working = false;
        })
      ).subscribe(response => {
        debugger;
        if (response) {
          this.dataService.Message().msgAutoCloseSuccessNoButton("OPERACIÓN REALIZADA DE FORMA EXITOSA", 3000, () => {
            this.router.navigate(['ayni/personal/acciones/desvinculacion'])
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
     idDesvinculacion: this.id_gestion_desvinculacion,
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
         id_gestion_desvinculacion: this.id_gestion_desvinculacion,
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

  buscarPersona(event) {
      
    if (!(this.form.get('idTipoDocumentoIdentidad').value > 0 && this.form.get('numeroDocumentoIdentidad').value.length > 0)) {
      return;
    }

    if (!(this.form.get('idMotivoAccion').value > 0 )) {
      this.dataService.Message().msgWarning(MESSAGE_GESTION.M08);
      return;
    }
    this.dataService.Spinner().show("sp6");
    
     this.idRegimenLaboral = this.form.get('idRegimenLaboral').value;
    // this.idAccion = this.form.get('idAccon').value;

     console.log("tipoFiltro BuscarPersona => ", this.tipoFiltro);

      let request = {
        numeroDocumentoIdentidad : this.form.get('numeroDocumentoIdentidad').value,
        idTipoDocumentoIdentidad : this.form.get('idTipoDocumentoIdentidad').value,
        idRegimenLaboral : this.idRegimenLaboral ,
    //    idAccion : this.idAccion ,
        idDre : this.idDre,
        idUgel : this.idUgel,
        tipoFiltro: this.tipoFiltro
      }
      this.dataService.AccionesDesvinculacion().getBuscarDatosPersona(request).subscribe(
        (response) => {
          console.log("getPersona() => ", response);
          this.dataService.Spinner().hide("sp6");

          this.persona = response;          
          this.seBuscoPersona = true;   

          if(this.tipoFiltro == 1) {
            this.persona.fechaInicio = this.persona.fechaFallecimientoStr;
          }
          
          if(request.idRegimenLaboral == 6){
            this.ley276 = true;
          } else { 
            this.ley276 = false;
          }

          if(response.tiene_vinculaciones == 1) {
            this.laboral = response.datosLaborales;
            this.seBuscoLaboral = true;
          } else {
            //Modal
            this.handleVerVinculacionVigente();
          }


        },
        (error: HttpErrorResponse) => {
          this.dataService.Message().msgWarning('"'+error.error.messages[0]+'"');
          this.dataService.Spinner().hide("sp6");
          console.log(error);
        }
      )    

    this.form.patchValue({
      numeroDocumentoIdentidad: '',
      idTipoDocumentoIdentidad: -1
    });        

  }

  handleVerVinculacionVigente(){
    let dialogRef = this.materialDialog.open(BuscarVinculacionesComponent, {
      panelClass: 'minedu-buscar-vinculaciones-dialog',
        disableClose: true,
        data: {
          persona: this.persona,
          idRegimenLaboral : this.form.get('idRegimenLaboral').value  
        }
    });
    dialogRef.afterClosed().subscribe((response: any) => {
      console.log('close modal resul', response);
      if (!response || response.idServidorPublico == undefined) {
        return;
      }      
      this.idServidorPublico = response.idServidorPublico      
      this.idPlaza = response.idPlaza 
      this.handleBuscarPersonaDatosLaboral();
    });
  }

  handleBuscarPersonaDatosLaboral() {
    let request = {
      idServidorPublico: this.idServidorPublico,
      idPlaza: this.idPlaza
    }

    this.dataService.AccionesDesvinculacion().getPersonaDatosLaboral(request).subscribe(
      (response) => {
        console.log("handleBuscarPersonaDatosLaboral => response => ", response);
        if (response) {
          this.laboral = response;
          this.seBuscoLaboral = true;
        }
      },
      (error: HttpErrorResponse) => {
        this.dataService.Message().msgWarning('"'+error.error.messages[0]+'"');
        this.dataService.Spinner().hide("sp6");
        console.log(error);
      }
    )
  }
  
  getDataView() : FormData {
      
    debugger;
    let data = this.form.value;
    let viewModel = new FormData();
    viewModel.append('gestion_desvinculacion.id_gestion_desvinculacion', this.id_gestion_desvinculacion == null ? '0' : this.id_gestion_desvinculacion);
    viewModel.append('gestion_desvinculacion.id_dre', this.idDre == null ? '0' : this.idDre);
    viewModel.append('gestion_desvinculacion.id_ugel',  this.idUgel == null ? '0' : this.idUgel);
    viewModel.append('gestion_desvinculacion.id_regimen_laboral', data.idRegimenLaboral);
    viewModel.append('gestion_desvinculacion.id_grupo_accion', data.idGrupoAccion);
    viewModel.append('gestion_desvinculacion.id_accion', data.idAccion);
    viewModel.append('gestion_desvinculacion.id_motivo_accion', data.idMotivoAccion);
    viewModel.append('gestion_desvinculacion.id_persona', this.persona && this.persona.idPersona != undefined ? this.persona.idPersona : '0');
    viewModel.append('gestion_desvinculacion.id_servidor_publico', this.persona && this.persona.datosLaborales.idServidorPublico != undefined ? this.persona.datosLaborales.idServidorPublico : '0');
    viewModel.append('gestion_desvinculacion.codigo_plaza',  this.persona.datosLaborales != undefined ? this.persona.datosLaborales.codigoPlaza : '0' );    
    viewModel.append('gestion_desvinculacion.es_mandato_judicial', data.esMandatoJudicial  );
    viewModel.append('gestion_desvinculacion.fecha_desvinculacion', (new Date(data.fechaInicio)).toUTCString());
    viewModel.append('gestion_desvinculacion.usuario_creacion', this.passport.nombreUsuario);
    viewModel.append('gestion_desvinculacion.id_plaza', this.persona.datosLaborales != undefined ? this.persona.datosLaborales.idPlaza: '0'  );
    viewModel.append('gestion_desvinculacion.id_gestion_contrato', data.idGestionContrato == null ? '0' :  data.idGestionContrato);
   
    if ( this.informe != undefined) {
      viewModel.append('gestion_desvinculacion.numero_informe_escalafonario',  this.informe.numeroInformeEscalafonario);
      viewModel.append('gestion_desvinculacion.fecha_informe_escalafonario',  (new Date(this.informe.fechaInformeEscalafonario)).toUTCString());
      viewModel.append('gestion_desvinculacion.codigo_documento_informe',  this.informe.documentoInformeEscalafonario);
  
      viewModel.append('gestion_desvinculacion.tiempo_servicio', this.informe.aniosTiempoServicio);
    }    
    
    viewModel.append('gestion_desvinculacion.anotaciones', data.anotaciones);
    

    viewModel.append('gestion_desvinculacion.numeroDocumentoIdentidad', this.persona.numeroDocumentoIdentidad);
    viewModel.append('gestion_desvinculacion.idTipoDocumentoIdentidad', this.persona.idTipoDocumentoIdentidad)
    viewModel.append('gestion_desvinculacion.primerApellido', this.persona.primerApellido);
    viewModel.append('gestion_desvinculacion.segundoApellido', this.persona.segundoApellido);
    viewModel.append('gestion_desvinculacion.nombres', this.persona.nombres);

    viewModel.append('gestion_desvinculacion.codigo_rol', this.passport.codigoRol);
    viewModel.append('gestion_desvinculacion.codigo_centro_trabajo', this.plaza.codigo_centro_trabajo);

    viewModel.append('gestion_desvinculacion.contrato', data.numeroContrato);
    
    return viewModel; 

  }

  handleEnviarAccionesGrabadas() {
    this.seEnviaAccionesGrabadas = true;    
    this.handleGuardarDesvinculacion();
  }

  handleCartaCese() {
    if (!this.isMotivoGenerarCese) {
      this.dataService.Message().msgWarning('¿REGIMEN GRUPO ACCION NO ESTA CONFIGURADO PARA GENERAR CARTA CESE?', () => { });
      return;
    }

    this.seGeneraCartaCese = true;    
    this.handleGuardarDesvinculacion();
  }

  handleGuardarDesvinculacion() {    
    
    if (!this.form.valid) {
      this.dataService.Message().msgWarning('"COMPLETAR LOS CAMPOS OBLIGATORIOS"', () => { });
      return;
    }

    if (this.informe == null && this.tipoFiltro != 4) {
      this.dataService.Message().msgWarning('"REALIZAR LA BUSQUEDA DEL NÚMERO INFORME ESCALAFONARIO"', () => { });
      return;
    }

    if (this.contrato == null && this.tipoFiltro == 4) {
      this.dataService.Message().msgWarning('"REALIZAR LA BUSQUEDA DEL NÚMERO CONTRATO."', () => { });
      return;
    } 

    this.ValidarDesvinculacion();      

    console.log(this.passport);
    let data = this.form.value;
    debugger;
    let viewModel = this.getDataView();
    console.log(viewModel);
    let mensaje = '¿ESTÁ SEGURO QUE DESEA GUARDAR LOS CAMBIOS?'
    if (this.seEnviaAccionesGrabadas) {
      mensaje = '¿ESTÁ SEGURO QUE DESEA ENVIAR LA INFORMACIÓN INGRESADA A ACCIONES GRABADAS?';
    }

    if (this.seGeneraCartaCese) {
      mensaje = '¿ESTÁ SEGURO QUE DESEA GENERAR LA CARTA DE CESE?';
    }

    this.dataService.Message().msgConfirm(mensaje, () => {
      this.dataService.Spinner().show("sp6");
      this.working = true;
      debugger;
      console.log(viewModel);

      if(this.isMandatoJudicial) {
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
            // Guardar Desvinculación
            this.GuardarDesvinculacion(viewModel);            
          } else {
            this.dataService.Spinner().hide("sp6");
            this.working = false;
          }
          
        })
      
      } else {
        // Guardar Desvinculación
        this.GuardarDesvinculacion(viewModel);         
      }

      
    }, () => {
      console.log('cancel confirm')
      this.seEnviaAccionesGrabadas = false;
     });
  }

  private async ValidarLimiteEdad() {
    // validar Limite de Edad

    let data = this.form.value;
    
    let request = {
      
      idRegimenLaboral: this.form.get('idRegimenLaboral').value,
      idAccion: this.form.get('idAccion').value,
      idMotivoAccion: this.form.get('idMotivoAccion').value,
      edad: this.persona.edad,
      fechaInicio: data.fechaInicio,
      fechaNacimiento: this.persona.dtfechaNacimiento,
    }
    this.dataService.AccionesDesvinculacion().validarLimiteEdad(request).subscribe(
      (response) => {
        
        this.ValidacionFechaLimite = response;        
        
      },
      (error: HttpErrorResponse) => {
        console.log(error);
        this.dataService.Spinner().hide("sp6");
        this.dataService.Message().msgWarning('"'+error.error.messages[0]+'"');
        this.seBuscoPersona = false;
      }
    )    
  }

  async ValidarDesvinculacion(){

    await this.ValidarLimiteEdad(); 
    
    if(this.ValidacionFechaLimite.bValidacion){
      this.dataService.Message().msgWarning('"'+this.ValidacionFechaLimite.mensaje+'"');
      return;
    }

  }

  GuardarDesvinculacion(viewModel) {

    this.dataService.AccionesDesvinculacion().guardarGestionDesinculacion(viewModel).subscribe(
      (response) => {
        debugger;

        this.id_gestion_desvinculacion = response;

        if (this.seEnviaAccionesGrabadas) {
          var itemAccionGrabada = {
            id_gestion_vinculacion: this.id_gestion_desvinculacion
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
          this.GuardarAccionGrabada(accionesGrabadas);

        } else
        if (this.seGeneraCartaCese) {
          let viewModel = {
            id_gestion_desvinculacion: this.id_gestion_desvinculacion
          }
     
          this.dataService.AccionesDesvinculacion().generarCartaCese(viewModel).subscribe(
            (response) => {

              if(response) {
                
                this.dataService.AccionesDesvinculacion().obtenerCartaCese(this.id_gestion_desvinculacion).subscribe(
                  (resp) => {      
                         
                      debugger;
                      this.VerDocumento(resp.codigoDocumentoCartaCese);      
                                      
                  },
                  (error: HttpErrorResponse) => {
                    this.dataService.Spinner().hide("sp6")
                    this.dataService.Message().msgWarning("Ocurrió un error al realizar esta operación");
                  }
                )

              }             

            },
            (error: HttpErrorResponse) => {
              this.dataService.Spinner().hide("sp6")
              this.dataService.Message().msgWarning("Ocurrió un error al realizar esta operación");
            }
          )

        } else {
          this.dataService.Spinner().hide("sp6");
          this.dataService.Message().msgAutoCloseSuccessNoButton('"OPERACIÓN REALIZADA DE FORMA EXITOSA."', 3000, () => {
            this.router.navigate(['ayni/personal/acciones/desvinculacion']);
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
  }

  VerDocumento(codigo_documento) {
    this.dataService.Spinner().show('sp6');
    this.dataService.Documento().descargar(codigo_documento)
    .pipe(
        catchError((e) => {
            return of(e);
        }),
        finalize(() => this.dataService.Spinner().hide('sp6'))
    ).subscribe(response => {
        if (response) {
            this.handlePreviewS1(response, response);
        } else {
            this.dataService.Message().msgWarning('NO SE PUDO OBTENER EL DOCUMENTO.', () => {
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
                title: 'Carta Cese',
                file: file,
                fileName: codigoAdjuntoSustento
            }
        }
    });

    this.dialogRef.afterClosed()
        .subscribe((response: any) => {
          this.router.navigate(['ayni/personal/acciones/desvinculacion']);
        });
  };

  handlePreviewS2(file: any, codigoAdjuntoSustento: string) {
    this.dialogRef = this.materialDialog.open(DocumentViewerComponent, {
        panelClass: 'modal-viewer-form-dialog',
        disableClose: true,
        data: {
            modal: {
                icon: 'remove_red_eye',
                title: 'Proyecto Resolución',
                file: file,
                fileName: codigoAdjuntoSustento
            }
        }
    });

    this.dialogRef.afterClosed()
        .subscribe((response: any) => {
          this.router.navigate(['ayni/personal/acciones/desvinculacion']);
        });
  };

  GuardarAccionGrabada(accionesGrabadas) {
    this.dataService.AccionesDesvinculacion().enviarAccionesGrabadas(accionesGrabadas).subscribe(
      (resp) => {
        this.dataService.Spinner().hide("sp6");
        this.dataService.Message().msgAutoCloseSuccessNoButton('"SE ENVIÓ CORRECTAMENTE LA INFORMACIÓN A ACCIONES GRABADAS."', 3000, () => {
          this.router.navigate(['ayni/personal/acciones/desvinculacion']);
        });
      }, 
      (err: HttpErrorResponse) => {
        this.working = false;
        this.dataService.Spinner().hide("sp6");
        console.log(err);
        this.dataService.Message().msgWarning("Ocurrió un error al realizar esta operación");
      }
    )
  }

  handleBuscar(): void {     
    if (this.form.get("numeroInformeEscalafonario").valid == false) {
        this.dataService.Message().msgWarning('"DEBE INGRESAR CAMPOS OBLIGATORIOS."', () => { });
        return;
    } 
    this.obtenerInforme();
  }

  handleBuscarContrato(): void {     
    if (this.form.get("numeroContrato").valid == false) {
        this.dataService.Message().msgWarning('"DEBE INGRESAR NÚMERO CONTRATO."', () => { });
        return;
    } 
    this.obtenerContrato();
  }

  obtenerContrato():void{
    this.setContrato();
    this.dataService.Spinner().show('sp6');

    this.contrato_cese.numeroDocumento  = this.persona.numeroDocumentoIdentidad;
    this.contrato_cese.numeroContrato  = this.requestContrato.pNumeroContrato;
    this.dataService.AccionesDesvinculacion().getContrato(this.contrato_cese).pipe(catchError(() => of([])), finalize(() => {        
        this.dataService.Spinner().hide('sp6');
    })).subscribe((result: any) => {
        if((result||[]).length==0){          
            this.contrato = null;

            this.dataService.Message().msgWarning('"INFORME NO REGISTRADO PARA EL DOCUMENTO CONSULTADO."', () => {
            });
        }
        else{
            this.contrato = {
              fechaContrato:result.fechaContrato,
              fechaContratoStr:result.fechaContratoStr
            }
        }        
        
    });
  }

  handleVerDocumentoSustento = () => {
    const codigoAdjunto = this.informe.documentoInformeEscalafonario;

    if (!codigoAdjunto) {
        this.dataService.Message().msgWarning('"EL REGISTRO NO TIENE INFORME ESCALAFONARIO."', () => {
        });
        return;
    }
    this.dataService.Spinner().show('sp6');
    this.dataService.Documento().descargar(codigoAdjunto)
        .pipe(
            catchError((e) => {
                return of(e);
            }),
            finalize(() => this.dataService.Spinner().hide('sp6'))
        ).subscribe(response => {
            if (response) {
                this.handlePreview(response, codigoAdjunto);
            } else {
                this.dataService.Message().msgWarning('"NO SE PUDO OBTENER EL INFORME ESCALAFONARIO."', () => {
                });
            }
        });
    };

    handlePreview(file: any, codigoAdjuntoSustento: string) {
      this.dialogRefPreview = this.materialDialog.open(DocumentViewerComponent, {
          panelClass: 'modal-viewer-form-dialog',
          disableClose: true,
          data: {
              modal: {
                  icon: 'remove_red_eye',
                  title: 'Documento de sustento',
                  file: file,
                  fileName: codigoAdjuntoSustento
              }
          }
      });

      this.dialogRefPreview.afterClosed()
          .subscribe((response: any) => {
              if (!response) {
                  return;
              }
          });
    };

  setRequest() {
    debugger
    const idTipoDocumento = this.persona.idTipoDocumentoIdentidad;
    const numeroDocumentoIdentidad = this.persona.numeroDocumentoIdentidad;
    const numeroInformeEscalafonario = this.form.get("numeroInformeEscalafonario").value;
    this.request = {
        pIdTipoDocumentoIdentidad: idTipoDocumento,
        pNumeroDocumentoIdentidad: numeroDocumentoIdentidad,
        pNumeroInformeEscalafonario: numeroInformeEscalafonario,
        idUgel: this.idUgel,
        idDre: this.idDre
    };
  }

  setContrato() {
    debugger
    const numeroContrato = this.form.get("numeroContrato").value;
    this.requestContrato = {
        
        pNumeroContrato: numeroContrato
    };
  }

  obtenerInforme():void{
    this.setRequest();
    this.dataService.Spinner().show('sp6');
    this.dataService.AccionesDesvinculacion().getInformeEscalafonario(this.request).pipe(catchError(() => of([])), finalize(() => {        
        this.dataService.Spinner().hide('sp6');
    })).subscribe((result: any) => {
        if((result||[]).length==0){
          
            this.informe = null;

            this.dataService.Message().msgWarning('"INFORME NO REGISTRADO PARA EL DOCUMENTO CONSULTADO."', () => {
            });

        }
        else{
            this.informe = {
                numeroInformeEscalafonario:result.numeroInformeEscalafonario,
                fechaInformeEscalafonario:result.fechaInformeEscalafonario,
                documentoInformeEscalafonario:result.documentoInformeEscalafonario,
                aniosTiempoServicio: result.aniosTiempoServicio,
                DescrSancionAdministrativa: result.flagsancionAdministrativa == 1 ? 'SI': 'NO'
            }
        }        
        
    });
  }

  validarMandatoJudicial(){
    debugger
    let data = this.form.value;

    if(data.esMandatoJudicial) {
      this.isMandatoJudicial = true;
      this.mandato_judicial_desc = "SI";
    } else {
      this.isMandatoJudicial = false;
      this.mandato_judicial_desc = "NO";
    }

    console.log(this.isMandatoJudicial);

    this.ValidarMotivoMandatoJudicial();

  }

  ValidarMotivoMandatoJudicial(){

    console.log(this.isMotivoMandatoJudicial  + "&&" + this.isMandatoJudicial)
    if(this.isMotivoMandatoJudicial == false && this.isMandatoJudicial) {
      this.dataService.Message().msgWarning(MESSAGE_GESTION.M198, () => { 
        this.form.patchValue({
          idMotivoAccion: -1
        })
       });      
    }

  }

  esMotivoAccionProceso (idMotivoAccionSelected) {
    
    this.isMotivoMandatoJudicial = this.combo.motivosAccion.filter(m => m.id_motivo_accion == idMotivoAccionSelected)[0].mandato_judicial;
    this.isMotivoGenerarCese = this.combo.motivosAccion.filter(m => m.id_motivo_accion == idMotivoAccionSelected)[0].generar_cese;
    this.isMotivoGenerarProyecto = this.combo.motivosAccion.filter(m => m.id_motivo_accion == idMotivoAccionSelected)[0].generar_proyecto;

   
    this.validarMandatoJudicial();

    this.ValidarTipoFiltro(idMotivoAccionSelected);
    
  }

  ValidarTipoFiltro(filtro){
      
    console.log("Filtro => ", filtro);

    if(filtro == 50 || filtro == 51) { // DECISIÓN UNILATERAL DEL CONTRATADO, DECISIÓN UNILATERAL DEL CONTRATANTE
      this.form.get('numeroInformeEscalafonario').clearValidators();
      this.form.controls['numeroInformeEscalafonario'].reset();
      this.tipoFiltro = 4
    }  else {
      this.tipoFiltro = 0
      this.form.get('numeroInformeEscalafonario').setValidators(Validators.required);
    }
    
    if(filtro == 36) { // POR FALLECIMIENTO
      this.tipoFiltro = 1      
    }

    if(filtro == 38) { // POR LÍMITE DE EDAD
      this.tipoFiltro = 2
    }

    if(filtro == 39) { // POR RENUNCIA
      this.tipoFiltro = 3
    }  

    console.log("tipoFiltro => ", this.tipoFiltro);

  }

  handleCancelar () {
    if (this.tipo_vinculacion == "aprobacion") {
      this.router.navigate(['ayni/personal/bandejas/aprobacionespendientes']);
    }      
    else {
      this.router.navigate(['ayni/personal/acciones/desvinculacion']);
    }
  }


  handleGenerarProyecto() {
    if (!this.form.valid) {
      this.dataService.Message().msgWarning(MESSAGE_GESTION.M08);
      return;
    }

    let regimenLaboral = this.combo.regimenesLaborales.filter(m => m.idRegimenLaboral == this.form.get('idRegimenLaboral').value)[0];
    let grupoAccion = {
      id_grupo_accion: 6,
      codigo_grupo_accion: 6,
      descripcion_grupo_accion: 'DESVINCULACIÓN'
    };
    let accion = this.combo.acciones.filter(m => m.id_accion == this.form.get('idAccion').value)[0];
    debugger;
    let motivoAccion = ""
    
      motivoAccion = this.combo.motivosAccion.filter(m => m.id_motivo_accion == this.form.get('idMotivoAccion').value)[0];
    
    
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
          mandato_judicial: mandatoJudicial,
          idDre: this.idDre,
          idUgel:  this.idUgel
        },
        formDataVinculacion: this.getDataView(),
        idGestionDesvinculacion: this.id_gestion_desvinculacion
      }
    });

    this.dialogRef.afterClosed()
            .subscribe((response: any) => {
              const dataProyecto = response;
              this.handleVerProyectoResolucion(dataProyecto.id_gestion_desvinculacion);
            });

  }

  handleVerProyectoResolucion(id_gestion_desvinculacion) {
    this.dataService.AccionesDesvinculacion().getProyectoResolucionDocumentos(id_gestion_desvinculacion).subscribe(
      (resp) => {
        
        this.dataService.Spinner().show('sp6');
        this.dataService.Documento().descargar(resp.documento_proyecto)
            .pipe(
                catchError((e) => {
                    return of(e);
                }),
                finalize(() => this.dataService.Spinner().hide('sp6'))
            ).subscribe(response => {
                if (response) {
                    this.handlePreviewS2(response, resp.documento_proyecto);
                } else {
                    this.dataService.Message().msgWarning('NO SE PUDO OBTENER EL DOCUMENTO DE SUSTENTO.', () => {
                    });
                }
            });
      },
      (error: HttpErrorResponse) => {
        
      }
    );
  }

  busquedaServidorPublicoPersonalizada = () => {
    debugger;
    this.dialogRef = this.materialDialog.open(
      BuscarPersonaComponent,
        {
            panelClass: "buscar-persona-form-dialog",
            width: "980px",
            disableClose: true,
            data: {
                action: "busqueda",
                TipoDocumento: this.form.get('idTipoDocumentoIdentidad').value,
                NumeroDocumento: this.form.get('numeroDocumentoIdentidad').value,
                idRegimenLaboral: this.form.get('idRegimenLaboral').value,
                idAccion: this.form.get('idAccion').value,
                idDre : this.idDre,
                idUgel : this.idUgel              
            },
        }
    );
    this.dialogRef.afterClosed().subscribe((resp) => {
        if (resp != null) {
            const servidorPublico = resp;
            this.form.patchValue({ 
              numeroDocumentoIdentidad: servidorPublico.servidorPublico.numeroDocumentoIdentidad,
              idTipoDocumentoIdentidad: servidorPublico.servidorPublico.idTipoDocumentoIdentidad
            });    
            
            this.buscarPersona(0);
        }
    });
};

onChangeTipoDocumento() {
  const idTipoDocumento = this.form.get('idTipoDocumentoIdentidad').value;
  // if (idTipoDocumento == -1) {
  this.form.patchValue({
    numeroDocumentoIdentidad: ''
  });
  // }
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

handleLimpiar() {
  this.dataService.Message().msgConfirm('¿ESTÁ SEGURO QUE DESEA LIMPIAR EL FORMULARIO?', () => {
    this.persona = {};
    this.plaza = {};
    this.seBuscoPersona = false;
    this.seBuscoLaboral = false;
    this.form.reset();    
    this.informe = null;
  }, () => { });
}

    
  
  
  
  }