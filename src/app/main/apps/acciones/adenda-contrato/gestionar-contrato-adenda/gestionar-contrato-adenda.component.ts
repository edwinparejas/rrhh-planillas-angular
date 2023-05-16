
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
 import { of } from 'rxjs';
 import { catchError, finalize } from 'rxjs/operators';
import { runInThisContext } from 'vm';
 import { BuscarPlazaComponent } from '../../gestionar-vinculacion/components/buscar-plaza/buscar-plaza.component';
import { MESSAGE_GESTION } from '../../gestionar-vinculacion/models/vinculacion.model';
 
 
 @Component({
   selector: 'minedu-gestion-contrato-adenda',
   templateUrl: './gestionar-contrato-adenda.component.html',
   styleUrls: ['./gestionar-contrato-adenda.component.scss'],
   encapsulation: ViewEncapsulation.None,
   animations: mineduAnimations
 })

 export class GestionContratoAdenda implements OnInit {

  nombreCabecera = "";
  nombreCabecera2 = "";

  datos_cabecera: any = {};
  datos_regimen: any = {};
  datos_regimen_accion: any = {};
  datos_accion: any = {};
  datos_pensionario: any = {};
  datos_Formacion_Academica: any = {};
  datos_Contacto: any = {};
  datos_documento_sustento_adenda: any = {};  

  isContrato: boolean = false;
  isAccionContrato: any;
  isEdit: boolean = false;
  isInformacion: boolean = false;

  isMandatoJudicial: boolean = false;
  isMotivoMandatoJudicial : boolean = false;
  
  tipo: any;
  id_gestion_contrato: any;  
  remuneracion: any;
  GenerarContrato : any;
  GenerarAdenda : any;
  id_estado_contrato: any; 

  working = false;

  form: FormGroup;
  dataSource: MatTableDataSource<any>;

  isCampoEdit : boolean = false;
  isAdenda: boolean = false;
  isAccionAdenda: any;
  isEditAdenda: boolean = false;
  isInfoAdenda: boolean = false;
  id_gestion_adenda: any;
  id_documento_sustento_adenda: any;
  id_persona: any;

  datos_contrato: any = {};

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

    tiposDocumentoSustento: [],
    tiposFormato: [],
    tiposComision: [],

    departamentos: [],
    provincias: [],
    distritos: [],
  };

  seBuscoPersona: boolean = false;
  seBuscoPlaza: boolean = false;
  tieneVinculacionesVigente: boolean = false;
  tieneSancionesAdministrativas: boolean = false;
  
  tieneGradoAcademico: boolean = false;

  idSituacionAcademica = 0;

  nivelSecundaria: boolean = false;
  nivelSuperior: boolean = false;
  nivelGradoPendiente: boolean = false; 
  nivelEstudio: boolean = false;
  nivelGradoAcademico: boolean = false;
  nivelSituacionAcademico: boolean = false;

  idConGrado = 0;
  id_nivel_especifico  = 0;
  id_situacion_academica = 0;
  id_grado_academico = 0;
  codigo_nivel = 0;
  codigo_nivel_especifico = 0;

  codigo_grado_academico = 0;
  codigo_situacion_academica = 0;
  id_maestro_formacion_academica : any;

  TipoPlaza = 0;
  idPlazaDesierta = 0;
  estaEnProcesoAdjudicacion: boolean = true;

  dataUserLoginModel: any;
  minDate = new Date(new Date().getFullYear(), 0, 1)
  untilDate = new Date(new Date().getFullYear() + 1, 1, 31);
  maxDate = new Date();
  nowDate = new Date();
  newMinDate = new Date();


  fechaValidacion = new Date();
  private passport: SecurityModel = new SecurityModel();
  persona: any = {};
  plaza: any = {};
  adjudicacion: any = {};
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
     
  dialogRef: any;
  
  constructor(
    private formBuilder: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private materialDialog: MatDialog,
    private dataService: DataService,
    private sharedService: SharedService
  ) {
  }
  
  ngOnInit(): void {

    this.maxDate = this.untilDate;
    this.obtenerPeriodoLectivo();
    console.log(this.minDate);

    this.route.paramMap.subscribe((params: any) => {
        //tipo => contrato , adenda(a)
        this.tipo = params.get('tipo');    
                
        

        if(this.tipo =="contrato"){

          this.nombreCabecera = "Nuevo Contrato DL 1057";
          this.nombreCabecera2 = "Nuevo Contrato";

          this.isContrato = true;

          this.isAccionContrato = params.get('accion');

          if(this.isAccionContrato == "edit") {
            this.nombreCabecera = "Modificar Registro DL 1057";
            this.nombreCabecera2 = "Modificar Contrato";
            this.isEdit = true;
            this.id_gestion_contrato = params.get('id_gestion_contrato');
          } else
          if(this.isAccionContrato == "info") {
            this.nombreCabecera = "Información completa";
            this.nombreCabecera2 = "Ver Contrato";
            this.isInformacion = true;
            this.id_gestion_contrato = params.get('id_gestion_contrato');
          } 

        }      
        else
        if(this.tipo =="adenda"){

          this.nombreCabecera = "Nueva Adenda DL 1057";
          this.nombreCabecera2 = "Nueva Adenda";

          this.isAdenda = true;

          this.isAccionAdenda = params.get('accion');

          if(this.isAccionAdenda == "edit") {
            this.nombreCabecera = "Modificar Adenda DL 1057";
            this.nombreCabecera2 = "Modificar Adenda";
            this.isEditAdenda = true;
            this.id_gestion_adenda = params.get('id_gestion_adenda');
          } else
          if(this.isAccionAdenda == "info") {
            this.nombreCabecera = "Información completa";
            this.nombreCabecera2 = "Ver Adenda";
            this.isInfoAdenda = true;
            this.id_gestion_adenda = params.get('id_gestion_adenda');
          } else {
            // Nueva Adenda
            this.id_gestion_contrato = params.get('id_gestion_contrato');
          }
          
        } 
        
    });

    this.buildForm();
    this.buildPassport();
    this.obtenerCodigoDreUgelLogeado();
    this.loadCombos();
    this.dataSource = new MatTableDataSource([]);
    setTimeout(_ => this.buildShared());

    this.setView();

  }

  buscarPlaza(event) {
    event.preventDefault();
    this.onBuscarPlaza();
  }

  onBuscarPlaza() {
    const codigoPlaza = this.form.get("codigoPlaza").value;
    if (!codigoPlaza) {
      this.dataService.Message().msgWarning('"INGRESE EL CÓDIGO DE PLAZA PARA REALIZAR LA BPUSQUEDA."', () => { });
      return;
    }
    this.dataService.Spinner().show("sp6");
    this.dataService.AccionesVinculacion().getPlazaPorCodigo(codigoPlaza).pipe(
      catchError(() => of(null)),
      finalize(() => { this.dataService.Spinner().hide("sp6"); })
    ).subscribe(response => {
      if (response) {
        if(response.id_regimen_laboral == 8) {
          this.seBuscoPlaza = true;
          this.plaza = response;
          this.TipoPlaza = response.id_tipo_plaza;
          this.idPlazaDesierta = response.id_plazas_desiertas;

          this.form.patchValue({
            codigoPlaza: ''
          }); 
        } else {
          this.dataService.Message().msgWarning('"EL CODIGO DE PLAZA DEBE SER EL MISMO QUE DEL REGIMEN LABORAL."', () => { });
          this.plaza = null;
        }
        
      } else {
        this.dataService.Message().msgWarning('"NO SE ENCONTRÓ INFORMACIÓN PARA LOS CRITERIOS DE BÚSQUEDA INGRESADO."', () => { });
        this.plaza = null;
      }
    });
  }

  buscarPlazaDialogo(event) {
    event.preventDefault();
    const codigoPlaza = this.form.get("codigoPlaza").value;
    if (codigoPlaza) {
      this.buscarPlaza(event);
      return;
    }

    this.dialogRef = this.materialDialog.open(BuscarPlazaComponent, {
      panelClass: 'buscar-plaza-form-dialog',
      disableClose: true,
      data: {
        opcion: 'nueva-contrato'
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

  buscarPersona(event) {
      
    if (!(this.form.get('idTipoDocumentoIdentidad').value > 0 && this.form.get('numeroDocumentoIdentidad').value.length > 0)) {
      return;
    }
    let idMotivoAccionSelected = this.form.get('idMotivoAccion').value;
    let esEnProcesoAdjudicacion = this.combo.motivosAccion.filter(m => m.id_motivo_accion == idMotivoAccionSelected)[0].es_proceso;
    this.dataService.Spinner().show("sp6");

    
      //1-Buscar en Reniec o Migraciones
      let request = {
        numeroDocumentoIdentidad : this.form.get('numeroDocumentoIdentidad').value,
        idTipoDocumentoIdentidad : this.form.get('idTipoDocumentoIdentidad').value,
        idRegimenLaboral : this.form.get('idRegimenLaboral').value,
        idAccion : this.form.get('idAccion').value,
        idMotivoAccion : this.form.get('idMotivoAccion').value,
      }
      this.dataService.AccionesVinculacion().getPersona(request).subscribe(
        (response) => {
          console.log("getPersona() => ", response);
          this.dataService.Spinner().hide("sp6");
          this.seBuscoPersona = true;
          this.persona = response;

          this.tieneVinculacionesVigente = this.persona.tiene_vinculaciones;
          this.tieneSancionesAdministrativas = this.persona.tiene_sanciones;

          this.handleBuscarPersonaDatosEstudiosPensionario();
        },
        (error: HttpErrorResponse) => {
          this.dataService.Spinner().hide("sp6");
          this.dataService.Message().msgWarning('"NÚMERO DE DOCUMENTO NO SE ENCUENTRA REGISTRADO"');
          console.log(error);
        }
      )

    this.form.patchValue({
      numeroDocumentoIdentidad: '',
      idTipoDocumentoIdentidad: -1
    }); 
    debugger
    this.datos_cabecera = {     
      RowMotivosAccion:  this.combo.motivosAccion.filter(m => m.id_motivo_accion == this.form.get('idMotivoAccion').value)[0]      
    }
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
          /*this.form.patchValue({
            celular: response.celular,
            telefonoFijo: response.telefono_principal,
            correoElectronico: response.correo,

            numeroCuspp: response.numero_cussp,
            fechaIngresoSPP: response.fecha_afiliacion,
            fechaDevengue: response.fecha_primer_devengue,
            folios: response.folios
          })*/
        }
      },
      (error: HttpErrorResponse) => {

      }
    )
  }

  setView(): void {
    debugger;
    if (this.isContrato) {
      this.form.patchValue({
        idRegimenLaboral: 8
      })
      this.loadComboAcciones(8);

      if(this.isEdit || this.isInformacion) {
        this.loadDatosContratoPorId();
      }

    }

    if (this.isAdenda) {
      this.form.patchValue({
        idRegimenLaboral: 8
      })
      this.loadComboAcciones(8);      

      if(this.isEditAdenda || this.isInfoAdenda) {
        this.loadDatosAdendaPorId();
      }    
      else {
        this.loadDatosContratoPorId();
      }  

    }
  }
  
  loadComboAcciones(id_regimen_laboral) {
    
    this.dataService.AccionesVinculacion().getComboAccionPorRegimenLaboral(id_regimen_laboral).subscribe(
      (response) => {
          
        this.combo.acciones = response;
        this.combo.motivosAccion = [];

        if (this.id_gestion_contrato == undefined || this.id_gestion_contrato == null) {
            this.form.patchValue({
              idAccion: 0,
              idMotivoAccion: 0
            })
        }       
                  
        if (this.isContrato) {          

          this.form.patchValue({
            idAccion: 34
          })
          this.loadComboMotivoAccion(34);

        }

        if (this.isAdenda) {          

          this.form.patchValue({
            idAccion: 32
          })
          this.loadComboMotivoAccion(32);
            
        }

        this.isCampoEdit = true;
        this.datos_regimen_accion = {
          RowdAcciones:  this.combo.acciones.filter(m => m.id_accion == this.form.get('idAccion').value)[0] 
        }  

        if(this.seBuscoPersona && this.isInformacion == false && this.isEdit == false && this.isInfoAdenda == false  && this.isEditAdenda == false ) {
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
   
    if (this.id_gestion_contrato == undefined || this.id_gestion_contrato == null) {
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
      },
      (error: HttpErrorResponse) => {
        console.log(error);
      }
    )

    if(this.seBuscoPersona && this.isInformacion == false && this.isEdit == false && this.isInfoAdenda == false  && this.isEditAdenda == false ) {
      this.LimpiarAccion();
    }
  }

  loadCombos() {

    if(this.isContrato){
      this.loadComboTipoDocumento();
      this.loadComboNivelEducativo();  
    }
    this.loadComboRegimenLaboral();  
    
    this.loadComboRegimenPensionario();
    this.loadComboAFP();
    this.loadComboTipoComision();
      
    this.loadComboUbigeoDepartamentos();

    if(this.isAdenda){
      this.loadComboTipoDocumentoSustento();
    }    
    
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

  onChangeTipoDocumento() {
    const idTipoDocumento = this.form.get('idTipoDocumentoIdentidad').value;    
    this.form.patchValue({
      numeroDocumentoIdentidad: ''
    });
  }

  loadComboTipoDocumentoSustento() {
    let request = {
      codigoCatalogo: 20
    }
    this.dataService.AccionesVinculacion().getCatalogoItem(request).subscribe(
      (response) => {
        this.combo.tiposDocumentoSustento = response;
      },
      (error: HttpErrorResponse) => {
        console.log(error);
      }
    )
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

      }
      

    } 
  }




  loadComboTipoComision() {
    let request = {
      codigoCatalogo: 69
    }
    this.dataService.AccionesVinculacion().getCatalogoItem(request).subscribe(
      (response) => {
        this.combo.tiposComision = response;
        this.combo.tiposComision.unshift({
          id_catalogo_item: -1,
          descripcion_catalogo_item: '--SELECCIONE--'
        })
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
        this.combo.afps.unshift({
          id_afp: -1,
          descripcion_afp: '--SELECCIONE--'
        })
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
        this.combo.regimenesPensionarios.unshift({
          id_regimen_pensionario: -1,
          descripcion_regimen_pensionario: '--SELECCIONE--'
        })
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

  loadComboRegimenLaboral() {
    const params = {
      estado: true,
      vinculacion: false
    }
    this.dataService.AccionesVinculacion().getComboRegimenLaboralPorEstado(params).subscribe(
      (response) => {
        this.combo.regimenesLaborales = response;
        debugger;
        // Pintar Regimen Laboral
        if(this.isContrato || this.isAdenda) {
          this.isCampoEdit = true;
          this.datos_regimen = {
            RowDescripcionRegimenLaboral:  this.combo.regimenesLaborales.filter(m => m.idRegimenLaboral == 8)[0]  
          }
        }     
      
      
      },
      (error: HttpErrorResponse) => {
        console.log(error);
      }
    )
  }

  buildForm() {     
  
    if (this.isContrato)
      this.form = this.formBuilder.group({
        idRegimenLaboral: [null],
        idAccion: [null],
        idMotivoAccion: [0, Validators.required],
        esMandatoJudicial: [false],
        idTipoDocumentoIdentidad: [-1],
        numeroDocumentoIdentidad: [null],
        idAdjudicacion: [null],
        codigoPlaza: [null],
        
        idTipoResolucion: [null],
        fechaInicio: [null, Validators.required],
        fechaTermino: [null, Validators.required],
        numeroRuc: [null, Validators.required],
        renumeracionMensual: [null, Validators.required],

        idRegimenPensionario: [null, Validators.required],
        idAfp: [null],
        idTipoComision: [null],
        numeroCuspp: [null],
        fechaIngresoSPP: [null, Validators.required],
        fechaDevengue: [null, Validators.required],
        folios: [null, Validators.compose([Validators.required, Validators.pattern(/^[0-9]\d*$/), Validators.maxLength(3)])],  
        
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
        idSituacionAcademica: [null, Validators.required],
        correoElectronico: [null, [Validators.required, Validators.pattern(this.regEmail)]],
        celular: [null, Validators.required],
        telefonoFijo: [null],
        anotaciones: [null],

        codigoDocumentoPensionario: [null],
        tieneImpedimento: [false, Validators.required],
        adjuntarDocumento: [null, Validators.required],
        
        direccionDomicilio: [null, Validators.required],
        idDepartamento: [null, Validators.required],
        idProvincia: [null, Validators.required],
        idDistrito: [null, Validators.required],   

        foliosSustento: [null],  
  
      });  
      
      if (this.isAdenda)
      this.form = this.formBuilder.group({
        // Seccion Cabecera
        idRegimenLaboral: [null],
        idAccion: [null],
        idMotivoAccion: [0, Validators.required],
        esMandatoJudicial: [false],
                
        // Datos de la accion
        fechaInicio: [null, Validators.required],
        fechaTermino: [null, Validators.required],
        numeroRuc: [null],
        renumeracionMensual: [null, Validators.required],
        tieneImpedimento: [false, Validators.required],

        // Datos Sistema pensionario
        idRegimenPensionario: [null, Validators.required],
        idAfp: [null],
        idTipoComision: [null],
        numeroCuspp: [null],
        fechaIngresoSPP: [null, Validators.required],
        fechaDevengue: [null, Validators.required],        
        adjuntarDocumento: [null, Validators.required],
        folios: [null, Validators.compose([Validators.required, Validators.pattern(/^[0-9]\d*$/), Validators.maxLength(3)])],  
        codigoDocumentoPensionario: [null],  
        
        //Datos de Contacto
        celular: [null, Validators.required],
        telefonoFijo: [null],
        correoElectronico: [null, [Validators.required, Validators.pattern(this.regEmail)]],
        direccionDomicilio: [null, Validators.required],
        idDepartamento: [null, Validators.required],
        idProvincia: [null, Validators.required],
        idDistrito: [null, Validators.required],  

        //Documento de sustento
        idDocumentosustentoAdenda: [null],
        idTipoDocumentoSustento: [null, Validators.required],
        numeroDocumentoSustento: [null, Validators.required],
        foliosSustento: [null, Validators.compose([Validators.required, Validators.pattern(/^[0-9]\d*$/), Validators.maxLength(3)])],    
        fechaEmision: [null, Validators.required],
        codigoDocumentoSustento: [null],  
        adjuntarDocumentoSustento: [null, Validators.required],

        //Anotaciones
        anotaciones: [null],
  
      }); 

      this.form.get("folios").valueChanges.subscribe(value => {
        if (value && value.slice(0, 1) == "0") 
          this.form.patchValue({ folios: value.replace(/^0+/, '') });
      });

      this.form.get("foliosSustento").valueChanges.subscribe(value => {
        if (value && value.slice(0, 1) == "0") 
          this.form.patchValue({ foliosSustento: value.replace(/^0+/, '') });
      });

      if(this.isEdit || this.isEditAdenda) {
        this.form.get('adjuntarDocumento').clearValidators();
      }

      if(this.isEditAdenda) {
        this.form.get('adjuntarDocumentoSustento').clearValidators();
      }
      


    
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

  buildShared() {
    
    if (this.isContrato) {
      this.sharedService.setSharedBreadcrumb("Nuevo contrato DL 1057");
      this.sharedService.setSharedTitle("Nuevo contrato DL 1057");
    }
  }

  buildPassport() {
    this.passport = this.dataService.Storage().getInformacionUsuario();
    console.log("buildPassport() => ", this.passport)
  }

  obtenerCodigoDreUgelLogeado(): void {
    const rolSelected = this.dataService.Storage().getPassportRolSelected();
    const request = {
      codigoEntidadSede: rolSelected.CODIGO_SEDE
    };
    this.dataService.AccionesVinculacion().getCodigoDreUgel(request).subscribe(
      (response) => {
        console.log('obtenerCodigoDreUgelLogeado() =>', response);
        this.dataUserLoginModel = response;
      }, 
      (error: HttpErrorResponse) => {
      }
    )
  }  

  onChangeRegimenPensionario(idRegimenPensionario) {
         
    let idRegimenPensionarioSelect = this.form.get('idRegimenPensionario').value;

    if (idRegimenPensionarioSelect != 2) { //si no es sistema privado de pensiones
      this.form.get('numeroCuspp').clearValidators();
      this.form.get('idAfp').clearValidators();
      this.form.get('idTipoComision').clearValidators();

      this.form.patchValue({
        idAfp: null,
        idTipoComision: null,
        numeroCuspp: null
      })
    } else {
      this.form.get('numeroCuspp').setValidators(Validators.required);
      this.form.get('idAfp').setValidators(Validators.required);
      this.form.get('idTipoComision').setValidators(Validators.required);
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

  handleAdjunto(file) {
    if (file === null) {
      this.form.patchValue({ adjuntarDocumento: null });
      return;
    }      

    this.form.patchValue({ adjuntarDocumento: file[0] });
  }

  handleAdjuntoSustento(file) {
    if (file === null) {
      this.form.patchValue({ adjuntarDocumentoSustento: null });
      return;
    }      

    this.form.patchValue({ adjuntarDocumentoSustento: file[0] });
  }

  

  

  esMotivoAccionProceso (idMotivoAccionSelected) {
    this.estaEnProcesoAdjudicacion = this.combo.motivosAccion.filter(m => m.id_motivo_accion == idMotivoAccionSelected)[0].es_proceso;    

    if(this.seBuscoPersona && this.isInformacion == false && this.isEdit == false && this.isInfoAdenda == false  && this.isEditAdenda == false ) {
      this.LimpiarAccion();
    }

    this.isMotivoMandatoJudicial = this.combo.motivosAccion.filter(m => m.id_motivo_accion == idMotivoAccionSelected)[0].mandato_judicial;

    this.validarMandatoJudicial();

  }

  LimpiarAccion() {
    this.persona = {};
      this.adjudicacion = {};
      this.plaza = {};
      this.seBuscoPersona = false;
      this.seBuscoPlaza = false;

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

  validarMandatoJudicial(){
    debugger
    let data = this.form.value;

    if(data.esMandatoJudicial) {
      this.isMandatoJudicial = true;
    } else {
      this.isMandatoJudicial = false;
    }

    this.ValidarMotivoMandatoJudicial();

  }

  ValidarMotivoMandatoJudicial(){

    if(this.isMotivoMandatoJudicial! && this.isMandatoJudicial) {
      this.dataService.Message().msgWarning(MESSAGE_GESTION.M198, () => { 
        this.form.patchValue({
          idMotivoAccion: -1
        })
       });      
    }

  }



  handleGenerarContrato() {
    this.handleGuardarContrato(true);
  }

  getDataViewContrato() : FormData {
    let data = this.form.value;
    let viewModel = new FormData();
    this.remuneracion = parseFloat(data.renumeracionMensual);

    viewModel.append('gestion_contrato.id_gestion_contrato', this.id_gestion_contrato == null ? '0' : this.id_gestion_contrato);
    viewModel.append('gestion_contrato.id_dre', this.dataUserLoginModel == null ? '0' : this.dataUserLoginModel.idDre == null ? '0' : this.dataUserLoginModel.idDre);
    viewModel.append('gestion_contrato.id_ugel', this.dataUserLoginModel == null ? '0' : this.dataUserLoginModel.idUgel == null ? '0' : this.dataUserLoginModel.idUgel);
     
    viewModel.append('gestion_contrato.id_regimen_grupo_accion', this.combo.motivosAccion.length == 0 ? 0 : (this.combo.motivosAccion.filter(m => m.id_motivo_accion == data.idMotivoAccion)[0].id_regimen_grupo_accion));
    viewModel.append('gestion_contrato.id_persona', (this.persona && this.persona.id_persona != undefined ? this.persona.id_persona : 0));
    viewModel.append('gestion_contrato.id_plaza', (this.persona && this.persona.id_plaza != undefined &&  this.persona.id_plaza > 0 ? this.persona.id_plaza : this.plaza.id_plaza));   
    viewModel.append('gestion_contrato.es_mandato_judicial', data.esMandatoJudicial);
    viewModel.append('gestion_contrato.annio', (new Date()).getFullYear().toString());
    viewModel.append('gestion_contrato.fecha_inicio', (new Date(data.fechaInicio)).toUTCString()) ;
    viewModel.append('gestion_contrato.fecha_fin', (new Date(data.fechaTermino)).toUTCString()) ;
    viewModel.append('gestion_contrato.numero_ruc', data.numeroRuc);
    viewModel.append('gestion_contrato.remuneracion_mensual', data.renumeracionMensual);
    viewModel.append('gestion_contrato.check_impedimento', data.tieneImpedimento);
    viewModel.append('gestion_contrato.anotaciones', data.anotaciones);
    viewModel.append('gestion_contrato.usuario_creacion', this.passport.nombreUsuario);

    
    viewModel.append('persona.numeroDocumentoIdentidad', this.persona.numeroDocumentoIdentidad);
    viewModel.append('persona.idTipoDocumentoIdentidad', this.persona.idTipoDocumentoIdentidad);
    viewModel.append('persona.primerApellido', this.persona.primerApellido);
    viewModel.append('persona.segundoApellido', this.persona.segundoApellido);
    viewModel.append('persona.nombres', this.persona.nombres);
    viewModel.append('persona.fechaNacimiento', this.persona.fechaNacimiento);
    viewModel.append('persona.fechaNacimientoStr', this.persona.fechaNacimientoStr);
    viewModel.append('persona.sexo', this.persona.sexo);
    viewModel.append('persona.codigoGenero', this.persona.codigoGenero);
    
    if (this.persona.id_persona != undefined) {
      viewModel.append('persona.id_persona', this.persona.id_persona);
    }

    viewModel.append('persona.estadoCivil', this.persona.estadoCivil);
    if (this.persona.codigoEstadoCivil != undefined) {
      viewModel.append('persona.codigoEstadoCivil', this.persona.codigoEstadoCivil);
    }    
    viewModel.append('persona.celular', data.celular);
    viewModel.append('persona.telefono_fijo', data.telefonoFijo);
    viewModel.append('persona.correo', data.correoElectronico);
    viewModel.append('persona.direccion_domicilio', data.direccionDomicilio);
    viewModel.append('persona.id_departamento', data.idDepartamento);
    viewModel.append('persona.id_provincia', data.idProvincia);
    viewModel.append('persona.id_distrito', data.idDistrito);

    viewModel.append('sistemaPersionario.idRegimenPensionario', data.idRegimenPensionario);
    viewModel.append('sistemaPersionario.idAfp', (data.idAfp == undefined || data.idAfp == null) ? 0 : data.idAfp );
    viewModel.append('sistemaPersionario.idTipoComision', (data.idTipoComision == undefined || data.idTipoComision == null)  ? 0 : data.idTipoComision );
    viewModel.append('sistemaPersionario.numeroCuspp', (data.numeroCuspp == undefined || data.numeroCuspp == null) ? '' : data.numeroCuspp );
    viewModel.append('sistemaPersionario.fechaIngresoSPP', new Date(data.fechaIngresoSPP).toUTCString());
    viewModel.append('sistemaPersionario.fechaDevengue', new Date(data.fechaDevengue).toUTCString());
    viewModel.append('sistemaPersionario.folios', data.folios);

    viewModel.append('formacionAcademica.id_nivel_educativo', data.idNivelEducativo);
    viewModel.append('formacionAcademica.id_situacion_academica', data.idSituacionAcademica);
    viewModel.append('formacionAcademica.id_grado_academico', data.idGradoAcademico == null ? '0' : data.idGradoAcademico );
    viewModel.append('formacionAcademica.id_maestro_formacion_academica',  this.id_maestro_formacion_academica);
    viewModel.append('formacionAcademica.titulo', data.titulos);
    viewModel.append('formacionAcademica.especialidad', data.especialidad);
    viewModel.append('formacionAcademica.numero_registro_titulo', data.nroRegistroTitulo);

    viewModel.append('GenerarContrato', this.GenerarContrato);
   
    viewModel.append('documento', data.adjuntarDocumento);
    

    return viewModel;
  }
  
  handleGuardarContrato(generarContrato: boolean) {
    if (!this.form.get('tieneImpedimento').value) {
      this.dataService.Message().msgWarning('"VALIDAR QUE LA PERSONA NO CUENTE CON IMPEDIMENTO VIGENTE."', () => { });
      return;
    }

    this.GenerarContrato = generarContrato;

    var archivoSustento: File

    let data = this.form.value;

    archivoSustento = data.adjuntarDocumento
    
    this.getIdSituacionAcademica();
    let viewModelContrato  = this.getDataViewContrato();
    
    this.dataService.Message().msgConfirm('¿ESTÁ SEGURO QUE DESEA GUARDAR LA INFORMACIÓN?', () => {
      this.dataService.Spinner().show("sp6");
      this.working = true;
      this.dataService.AccionesVinculacion().guardarNuevoGestionContrato(viewModelContrato).subscribe(
        (response) => {
          this.dataService.Spinner().hide("sp6");
          this.dataService.Message().msgAutoCloseSuccessNoButton('"OPERACIÓN REALIZADA DE FORMA EXITOSA."', 3000, () => {
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
    }, () => { });
    
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

  handleLimpiar() {
    this.dataService.Message().msgConfirm('¿ESTÁ SEGURO QUE DESEA LIMPIAR EL FORMULARIO?', () => {

      if(this.isContrato) {
        this.persona = {};
        this.adjudicacion = {};
        this.plaza = {};
        this.seBuscoPersona = false;
        this.seBuscoPlaza = false;
      }      

      this.form.reset();

      this.setView();

    }, () => { });

    
  }

  handleCancelar () {
    if (this.isContrato){
      this.router.navigate(['ayni/personal/acciones/contratoadenda']);
    } 
    if (this.isAdenda){      
      this.router.navigate(['ayni/personal/acciones/contratoadenda/bandeja-adenda/'+ this.id_gestion_contrato]);
    }          
  }

  handleGuardar(): void {
    
    if (this.isContrato) {
      this.handleGuardarContrato(false);
    } 
    
    if (this.isAdenda) {
      this.handleGuardarAdenda(false);
    } 

  }


  validacionFechaVinculacion(){  

    this.newMinDate = (new Date(this.form.get('fechaInicio').value)) ;
    this.maxDate = new Date(this.newMinDate.setDate(this.newMinDate.getDate() + 30))

  }

  handleGenerarAdenda() {
    this.handleGuardarAdenda(true);
  }

  getDataViewAdenda() : FormData {
    let data = this.form.value;
    let viewModel = new FormData();
    this.remuneracion = parseFloat(data.renumeracionMensual);

    

    viewModel.append('adenda.id_gestion_adenda', this.id_gestion_adenda == null ? '0' : this.id_gestion_adenda);     
    viewModel.append('adenda.id_documento_sustento_adenda', (this.id_documento_sustento_adenda == null || this.id_documento_sustento_adenda == undefined ) ? '0' : this.id_documento_sustento_adenda);      
    viewModel.append('adenda.id_gestion_contrato', this.id_gestion_contrato == null ? '0' : this.id_gestion_contrato);
    viewModel.append('adenda.id_regimen_grupo_accion', this.combo.motivosAccion.length == 0 ? 0 : (this.combo.motivosAccion.filter(m => m.id_motivo_accion == data.idMotivoAccion)[0].id_regimen_grupo_accion));
    viewModel.append('adenda.es_mandato_judicial', data.esMandatoJudicial);    
    viewModel.append('adenda.fecha_inicio', (new Date(data.fechaInicio)).toUTCString()) ;
    viewModel.append('adenda.fecha_fin', (new Date(data.fechaTermino)).toUTCString()) ;    
    viewModel.append('adenda.check_impedimento', data.tieneImpedimento);
    viewModel.append('adenda.anotaciones', data.anotaciones);
    viewModel.append('adenda.usuario_creacion', this.passport.nombreUsuario);
    
    viewModel.append('persona.celular', data.celular);
    viewModel.append('persona.telefono_fijo', data.telefonoFijo);
    viewModel.append('persona.correo', data.correoElectronico);
    viewModel.append('persona.direccion_domicilio', data.direccionDomicilio);
    viewModel.append('persona.id_departamento', data.idDepartamento);
    viewModel.append('persona.id_provincia', data.idProvincia);
    viewModel.append('persona.id_distrito', data.idDistrito);
       

    viewModel.append('sistemaPersionario.idRegimenPensionario', data.idRegimenPensionario);
    viewModel.append('sistemaPersionario.idAfp', (data.idAfp == undefined || data.idAfp == null) ? 0 : data.idAfp );
    viewModel.append('sistemaPersionario.idTipoComision', (data.idTipoComision == undefined || data.idTipoComision == null)  ? 0 : data.idTipoComision );
    viewModel.append('sistemaPersionario.numeroCuspp', (data.numeroCuspp == undefined || data.numeroCuspp == null) ? '' : data.numeroCuspp );
    viewModel.append('sistemaPersionario.fechaIngresoSPP', new Date(data.fechaIngresoSPP).toUTCString());
    viewModel.append('sistemaPersionario.fechaDevengue', new Date(data.fechaDevengue).toUTCString());
    viewModel.append('sistemaPersionario.folios', data.folios);

    viewModel.append('documento_sustento_adenda.id_documento_sustento_adenda', (data.idDocumentosustentoAdenda == undefined || data.idDocumentosustentoAdenda == null) ? '0' : data.idDocumentosustentoAdenda );
    viewModel.append('documento_sustento_adenda.id_tipo_documento', data.idTipoDocumentoSustento);
    viewModel.append('documento_sustento_adenda.numero_documento_sustento', data.numeroDocumentoSustento);
    viewModel.append('documento_sustento_adenda.folios', data.foliosSustento);
    viewModel.append('documento_sustento_adenda.fechaEmision',new Date(data.fechaEmision).toUTCString()); 


    viewModel.append('id_persona', this.id_persona);

    viewModel.append('generarAdenda', this.GenerarAdenda);
   
    viewModel.append('documento', data.adjuntarDocumento);
    viewModel.append('documento_sustento', data.adjuntarDocumentoSustento);
    

    return viewModel;
  }

  handleGuardarAdenda(_generarAdenda: boolean) {

    const usuario = this.dataService.Storage().getPassportUserData(); 

    this.GenerarAdenda = _generarAdenda;

    if (!this.form.get('tieneImpedimento').value) {
      this.dataService.Message().msgWarning('"VALIDAR QUE LA PERSONA NO CUENTE CON IMPEDIMENTO VIGENTE."', () => { });
      return;
    }
    debugger;
   
    let viewModelAdenda  = this.getDataViewAdenda();

    this.dataService.Message().msgConfirm('¿ESTÁ SEGURO QUE DESEA GUARDAR LOS CAMBIOS?', () => {
      this.dataService.Spinner().show("sp6");
      this.working = true;
      this.dataService.AccionesVinculacion().guardarNuevoGestionAdenda(viewModelAdenda).subscribe(
        (response) => {
          this.dataService.Spinner().hide("sp6");
          this.dataService.Message().msgAutoCloseSuccessNoButton('"OPERACIÓN REALIZADA DE FORMA EXITOSA."', 3000, () => {
            this.working = false;
            this.router.navigate(['ayni/personal/acciones/contratoadenda/bandeja-adenda/'+ this.id_gestion_contrato]);
          });
        },
        (error: HttpErrorResponse) => {
          this.working = false;
          this.dataService.Spinner().hide("sp6")
          console.log(error);
          this.dataService.Message().msgWarning("Ocurrió un error al realizar esta operación");
        }
      )
    }, () => { });

  }

  loadDatosContratoPorId(): void {
    debugger;
    this.dataService.Spinner().show("sp6");
    this.dataService.AccionesVinculacion().getGestionContratoPorId(this.id_gestion_contrato).subscribe(
      (response) => {
        this.dataService.Spinner().hide("sp6");
        console.log('loadDatosContratoPorId => ', response);
        debugger;
        this.datos_contrato = response;
        this.id_persona = response.id_persona;

        if(this.isEdit || this.isInformacion ) {
          this.seBuscoPersona = true;

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
          id_plaza: response.id_plaza
        }        
        this.form.patchValue({

          esMandatoJudicial: response.es_mandato_judicial,
          idRegimenLaboral: response.id_regimen_laboral,
          idAccion: response.id_accion,
          idMotivoAccion: response.id_motivo_accion,

          idTipoDocumentoIdentidad: response.id_tipo_documento_identidad,
          numeroDocumentoIdentidad: response.numero_documento_identidad,

          codigoPlaza: response.codigo_plaza,

          fechaInicio: response.fecha_inicio,
          fechaTermino: response.fecha_fin,
          numeroRuc: response.numero_ruc,
          renumeracionMensual: response.remuneracion_mensual,

          tieneImpedimento: response.check_impedimento,

          correoElectronico: response.correo,
          celular: response.celular,
          telefonoFijo: response.telefono,    
          direccionDomicilio: response.direccion,
          idDepartamento: response.id_departamento, 

          idRegimenPensionario: response.id_regimen_pensionario,
          idAfp: response.id_afp,
          idTipoComision: response.id_tipo_comision,
          numeroCuspp: response.codigo_cuspp,
          fechaIngresoSPP: response.fecha_afiliacion,
          fechaDevengue: response.fecha_devengue,
          folios: response.folios,
          codigoDocumentoPensionario: response.codigo_documento_pensionario,  

          idNivelEducativo: response.id_nivel_educativo,
          idSituacionAcademica: response.id_situacion_academica,
          idGradoAcademico: response.id_grado_academico,
          titulos: response.titulo,
          especialidad: response.especialidad,
          nroRegistroTitulo: response.numero_registro_titulo,

          anotaciones: response.anotaciones,                        

        });

        this.loadComboAcciones(response.id_regimen_laboral);        
        this.loadComboMotivoAccion(response.id_accion);

        this.onChangeRegimenPensionario(response.id_regimen_pensionario);

        this.loadComboSituacinoAcademica(response.id_nivel_educativo);
        
        
        this.onBuscarPlaza();    
        
        this.loadComboUbigeoProvincias(response.id_departamento);

        this.form.patchValue({
          idProvincia:  response.id_provincia   
        });
        this.loadComboUbigeoDistritos(response.id_provincia);

        this.form.patchValue({
          idDistrito:  response.id_distrito   
        });

        this.datos_cabecera = {                   
          descripcionMotivoAccion:  response.descripcion_motivo_accion,
          descripcionMandatoJudicial: response.descripcion_mandato_judicial       
        } 

        this.datos_accion = {
          fechaInicioStr: response.fecha_inicio_str,
          fechaTerminoStr: response.fecha_fin_str,
          numeroRuc: response.numero_ruc,
          renumeracionMensual: response.remuneracion_mensual
        }

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
          titulos: response.titulo,
          especialidad: response.especialidad,
          nroRegistroTitulo: response.numero_registro_titulo
        }

        this.datos_Contacto = {
          correoElectronico: response.correo,
          celular: response.celular,
          telefonoFijo: response.telefono,
          direccion: response.direccion,
          descripcionDepartamento: response.descripcion_departamento,
          descripcionProvincia: response.descripcion_provincia,
          descripcionDistrito: response.descripcion_distrito,
          anotaciones: response.anotaciones
        }


        } else {
          this.form.patchValue({
            fechaInicio: this.datos_contrato.fecha_inicio,
            fechaTermino: this.datos_contrato.fecha_fin,
            numeroRuc: this.datos_contrato.numero_ruc,
            renumeracionMensual: this.datos_contrato.remuneracion_mensual
          })

          this.datos_accion = {
            fechaInicioStr: response.fecha_inicio_str,
            fechaTerminoStr: response.fecha_fin_str,
            numeroRuc: response.numero_ruc,
            renumeracionMensual: response.remuneracion_mensual
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

  loadDatosAdendaPorId(): void {
    this.dataService.Spinner().show("sp6");
    this.dataService.AccionesVinculacion().getAdendaPorId(this.id_gestion_adenda).subscribe(
      (response) => {
        debugger;
        this.dataService.Spinner().hide("sp6");
        console.log('loadDatosAdendaPorId => ', response);  
        
        this.id_gestion_contrato = response.id_gestion_contrato;
        this.id_documento_sustento_adenda = response.id_documento_sustento_adenda;
        this.id_persona = response.id_persona;

        if(this.isEditAdenda || this.isInfoAdenda) {
          this.seBuscoPersona = true;
        
        this.form.patchValue({

          esMandatoJudicial: response.es_mandato_judicial,
          idRegimenLaboral: response.id_regimen_laboral,
          idAccion: response.id_accion,
          idMotivoAccion: response.id_motivo_accion,

          idTipoDocumentoIdentidad: response.id_tipo_documento_identidad,
          tipoDocumentoIdentidad: response.tipo_documento_identidad,
          numeroDocumentoIdentidad: response.numero_documento_identidad,

          codigoPlaza: response.codigo_plaza,

          fechaInicio: response.fecha_inicio,
          fechaTermino: response.fecha_fin,
          numeroRuc: response.numero_ruc,
          renumeracionMensual: response.remuneracion_mensual,

          tieneImpedimento: response.check_impedimento,

          correoElectronico: response.correo,
          celular: response.celular,
          telefonoFijo: response.telefono,    
          direccionDomicilio: response.direccion,
          idDepartamento: response.id_departamento, 

          idRegimenPensionario: response.id_regimen_pensionario,
          idAfp: response.id_afp,
          idTipoComision: response.id_tipo_comision,
          numeroCuspp: response.codigo_cuspp,
          fechaIngresoSPP: response.fecha_afiliacion,
          fechaDevengue: response.fecha_devengue,
          folios: response.folios,
          codigoDocumentoPensionario: response.codigo_documento_pensionario,  
         

          anotaciones: response.anotaciones,     
          
          idDocumentosustentoAdenda: response.id_documento_sustento_adenda,
          idTipoDocumentosustentoAdenda: response.id_tipo_documento_sustento,
          codigoDocumentoSustento: response.codigo_documento_sustento,
          
          foliosSustento: response.numero_folios,
          fechaEmision: response.fecha_emision         

        });

        this.loadComboAcciones(response.id_regimen_laboral);        
        this.loadComboMotivoAccion(response.id_accion);

        this.onChangeRegimenPensionario(response.id_regimen_pensionario);
        
        this.loadComboUbigeoProvincias(response.id_departamento);

        this.form.patchValue({
          idProvincia:  response.id_provincia   
        });
        this.loadComboUbigeoDistritos(response.id_provincia);

        this.form.patchValue({
          idDistrito:  response.id_distrito   
        });

        this.loadComboTipoDocumentoSustento();

        this.form.patchValue({
          idTipoDocumentoSustento:  response.id_tipo_documento_sustento ,
          numeroDocumentoSustento: response.numero_documento_sustento  
        });

        this.datos_accion = {
          fechaInicioStr: response.fecha_inicio_str,
          fechaTerminoStr: response.fecha_fin_str,
          numeroRuc: response.numero_ruc,
          renumeracionMensual: response.remuneracion_mensual
        }

        this.datos_cabecera = {                   
          descripcionMotivoAccion:  response.descripcion_motivo_accion,
          descripcionMandatoJudicial: response.descripcion_mandato_judicial       
        } 

        this.datos_accion = {
          fechaInicioStr: response.fecha_inicio_str,
          fechaTerminoStr: response.fecha_fin_str,
          numeroRuc: response.numero_ruc,
          renumeracionMensual: response.remuneracion_mensual
        }

        this.datos_pensionario = {
          descripcionRegimenPensionario: response.descripcion_regimen_pensionario,
          descripcionAfp: response.descripcion_afp,
          descripcionTipoComision: response.descripcion_tipo_comision,
          codigoCuspp: response.codigo_cuspp,
          fechaIngresoSPPStr: response.fecha_afiliaciono_strg,
          fechaDevengueStr: response.fecha_devengue_strg,   
          folios: response.folios
        }

        this.datos_Contacto = {
          correoElectronico: response.correo,
          celular: response.celular,
          telefonoFijo: response.telefono,
          direccion: response.direccion,
          descripcionDepartamento: response.descripcion_departamento,
          descripcionProvincia: response.descripcion_provincia,
          descripcionDistrito: response.descripcion_distrito,
          anotaciones: response.anotaciones
        }
        
        this.datos_documento_sustento_adenda = {
          tipoDocumentoSustento: response.tipo_documento_identidad_sustento,
          numeroDocumentoSustento: response.numero_documento_sustento,
          numeroFoliosSustento: response.numero_folios,
          fechaEmisionSustentoStr: response.fecha_emision_str
        }

        } else {

          this.id_persona = response.datos_contrato.id_persona;

          this.datos_accion = {
            fechaInicioStr: this.datos_contrato.fecha_inicio_str,
            fechaTerminoStr: this.datos_contrato.fecha_fin_str,
            numeroRuc: this.datos_contrato.numero_ruc,
            renumeracionMensual: this.datos_contrato.remuneracion_mensual
          }

          this.form.patchValue({
            fechaInicio: this.datos_contrato.fecha_inicio,
            fechaTermino: this.datos_contrato.fecha_fin,
            numeroRuc: this.datos_contrato.numero_ruc,
            renumeracionMensual: this.datos_contrato.remuneracion_mensual
          })

        }                


      },
      (error: HttpErrorResponse) => {
        this.dataService.Spinner().hide("sp6")
        console.log(error);
        this.dataService.Message().msgWarning("Ocurrió un error al obtener datos de la vinculación");
      }
    )
  }



 }