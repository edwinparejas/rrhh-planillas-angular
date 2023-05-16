import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { FormBuilder,FormControl,FormGroup,Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute, Router } from '@angular/router';
import { DataService } from 'app/core/data/data.service';
import { SharedService } from 'app/core/shared/shared.service';
import { SecurityModel } from 'app/core/model/security/security.model';
import { MISSING_TOKEN, TablaPermisos } from 'app/core/model/types';
import { catchError, finalize } from 'rxjs/operators';
import { of } from 'rxjs';
import { mineduAnimations } from '@minedu/animations/animations';
import { BuscarPersonaComponent } from '../components/buscar-persona/buscar-persona.component';
import { MensajesSolicitud } from '../_utils/constants';
import { HttpErrorResponse, HttpParams } from '@angular/common/http';
import { GenerarProyectoComponent } from '../components/generar-proyecto/generar-proyecto.component';
import { PASSPORT_MESSAGE } from 'app/core/model/messages-error';
import { generarFormDataUtil } from '../_utils/formDataUtil';
import { DocumentViewerComponent } from 'app/main/apps/components/document-viewer/document-viewer.component';

@Component({
  selector: 'minedu-registro-beneficio',
  templateUrl: './registro-beneficio.component.html',
  styleUrls: ['./registro-beneficio.component.scss'],
  encapsulation: ViewEncapsulation.None,
    animations: mineduAnimations
})
export class RegistroBeneficioComponent implements OnInit {

  constructor(
    private router: Router,      
    private route: ActivatedRoute,
    private formBuilder: FormBuilder,
    private dataService: DataService,
    private materialDialog: MatDialog,
    private sharedService: SharedService
  ) { }
  /**
   * Interno Angular
   */
  /**
     * Variables */
    
   form: FormGroup;
   loading: false;
   isMobile = false;
   currentSession: SecurityModel = new SecurityModel();
   hasAccessPage: boolean;
   /**
    * Métodos  */
ngOnInit() {
    setTimeout(() => this.buildShared());
    this.buildSeguridad();
    this.handleResponsive();
    this.buildForm();
    this.passport();
    this.resetForm();
    if (!this.hasAccessPage) {
        this.dataService.Message().msgInfo(
            "NO CUENTA CON PERMISOS REQUERIDOS", () => {
            this.handleCancelar();
        });
    }
    this.form.valueChanges.subscribe(bewval=>console.log('valueChanges',bewval));
    this.form.get("enviarAccionesGrabadas").valueChanges.subscribe(x => {
        if(x){
            this.EnviarAccionesGrabadas();
        }
     });
     this.form.get("generarProyecto").valueChanges.subscribe(x => {
        if(x){
            this.GenerarProyectoResolucion();
        }
     });
     const usuario = this.dataService.Storage().getPassportUserData();
     this.form.patchValue({ 
        fechaCreacion: new Date(),
        usuarioCreacion: usuario.NUMERO_DOCUMENTO,
        ipCreacion: ":1",
    });
}
buildShared() {
    this.sharedService.setSharedTitle('Acciones de Personal: Beneficios');
    this.sharedService.setSharedBreadcrumb('Nuevo Registro de Beneficio');
}
buildSeguridad() {
    this.currentSession = this.dataService.Storage().getInformacionUsuario();
    
    this.hasAccessPage = this.dataService.Storage().tienePermisoAccion(TablaPermisos.Acceder);

    // if (!this.permisos.autorizadoAgregar && !this.permisos.autorizadoModificar && !this.permisos.autorizadoEliminar && !this.permisos.autorizadoEnviar && !this.permisos.autorizadoConsultar && !this.permisos.autorizadoExportar) {
    //   this.hasAccessPage = false;
    // }
    // else {
    //   this.hasAccessPage = true;
    // }
    if(this.hasAccessPage)
    {
        
        let queryParam = new HttpParams();
        queryParam = this.addParam(queryParam,'codigoRol',this.currentSession.codigoRol);
        this.dataService.Beneficios().getAccesoUsuario(queryParam).pipe(catchError(() => of([])), finalize(() => { })).subscribe((result: any) => {
            if (result) {
                this.hasAccessPage=result.acceso;
            }
        });
    }
};
addParam(queryParam:HttpParams,param,value){
    if(value)
        queryParam = queryParam.set(param, value);
    return queryParam
}
passport() {
    this.form.patchValue({
        codigoRol: this.currentSession.codigoRol,
        codigoSede: this.currentSession.codigoSede,
        codigoTipoSede: this.currentSession.codigoTipoSede,
      });
    
  }

getIsMobile(): boolean {
    const w = document.documentElement.clientWidth;
    const breakpoint = 992;
    if (w < breakpoint) {
        return true;
    } else {
        return false;
    }
}
handleResponsive() {
    this.isMobile = this.getIsMobile();
    window.onresize = () => {
        this.isMobile = this.getIsMobile();
    };
}
resetForm() {
    this.form.reset();
    this.resetFormSeccionAccionPersonal();
    this.form.controls['mandatoJudicial'].setValue(false);
    this.form.controls['idTipoDocumentoIdentidad'].setValue(0);
}
resetFormSeccionAccionPersonal() {
    this.form.controls['idRegimenLaboral'].setValue(0);
    this.form.controls['idAccion'].setValue(0);
    this.form.controls['idMotivoAccion'].setValue(0);
    this.comboLists.listRegimenLaboral = [];
    this.comboLists.listAccion = [];
    this.comboLists.listMotivoAccion = [];
}

/**
   * Sección Formulario
   */
  /**
    * Variables HTML*/
    comboLists = {
        listRegimenLaboral: [],
        listAccion: [],
        listMotivoAccion:[],
        listTipoDocumentoIdentidad:[],
    };
    dialogRef: any;
    servidorPublico: any = {};
   /**
    * Métodos HTML*/
    
    selectTipoDocumento(tipoDocumento: number) : void{
        const idTipoDocumentoIdentidad = this.form.get('idTipoDocumentoIdentidad').value;
        if (idTipoDocumentoIdentidad == -1) {
          this.form.patchValue({
            numeroDocumentoIdentidad: ''
          });
        }
      }
    onKeyPressNumeroDocumento(e: any): boolean {
        let _idTipoDocumento  = this.form.get('idTipoDocumentoIdentidad').value;
        let tipoDocumentoSelect = this.comboLists.listTipoDocumentoIdentidad.find(m => m.id_catalogo_item == _idTipoDocumento);
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
          } else {e.preventDefault();
            return false;
          }
        }
        
      }
      buscarPersona(event) {
        event.preventDefault();
        this.dialogRef = this.materialDialog.open(BuscarPersonaComponent, {
          panelClass: 'buscar-persona-form-dialog',
          disableClose: true,
          data: {
            esProceso: false
          }
        });
    
        this.dialogRef.afterClosed()
          .subscribe((response: any) => {
            if (!response) {
              return;
            }
            console.log('persona selected - close => ', response);
            this.form.patchValue({ 
              numeroDocumentoIdentidad: response.numeroDocumentoIdentidad,
              idTipoDocumentoIdentidad: response.idTipoDocumentoIdentidad
            });
            // this.plaza = response;
          });
      }
       
      buscarInformeEscalafonario(event) {
        event.preventDefault();
        this.dialogRef = this.materialDialog.open(BuscarPersonaComponent, {
          panelClass: 'buscar-persona-form-dialog',
          disableClose: true,
          data: {
            esProceso: false
          }
        });
    
        this.dialogRef.afterClosed()
          .subscribe((response: any) => {
            if (!response) {
              return;
            }
            console.log('persona selected - close => ', response);
            this.form.patchValue({ 
              numeroDocumentoIdentidad: response.numeroDocumentoIdentidad,
              idTipoDocumentoIdentidad: response.idTipoDocumentoIdentidad
            });
            // this.plaza = response;
          });
      }
  /**
   * Sección Footer
   */
    /**
    * Variables HTML*/
    disponibleEnviarAccionesGrabadas:boolean = true;
    disponibleGenerarProyecto:boolean = true;
    disponibleRegistrar:boolean = true;
    disponibleActualizar:boolean = true;
    disponibleLimpiar:boolean = true;
    /**
    * Métodos HTML*/
    handleBuscarServidorPublico=()=>{
       console.log("form",this.form);
    }
    generarObjetoProyectoResolucion() {

        let data = this.form.value;
        data.accionesGrabadas = true;
        const documento = new FormData();
        this.appendFormData(documento, data, "");
        console.log(documento);
        
        return documento;
    }
    convertDate(inputFormat) {
        function pad(s) { return (s < 10) ? '0' + s : s; }
        var d = new Date(inputFormat)
        return [pad(d.getDate()), pad(d.getMonth()+1), d.getFullYear()].join('-')
    }
    appendFormData(formData, data, rootName) {        
        let root = rootName || "";
        if (data instanceof File) {
            formData.append(root, data);
        } else if (data instanceof Date) {
            formData.append(root, this.convertDate(data));
        } else if (Array.isArray(data)) {
            for (var i = 0; i < data.length; i++) {
                this.appendFormData(formData, data[i], root + "[" + i + "]");
            }
        } else if (typeof data === "object" && data) {
            for (var key in data) {
                if (data.hasOwnProperty(key)) {
                    if (root === "") {
                        this.appendFormData(formData, data[key], key);
                    } else {
                        this.appendFormData(
                            formData,
                            data[key],
                            root + "." + key
                        );
                    }
                }
            }
        } else {
            if (data !== null && typeof data !== "undefined") {
                formData.append(root, data);
            }
        }
    }
    EnviarAccionesGrabadas =()=>{
        this.dataService.Util().msgConfirm(
            "¿ESTÁ SEGURO QUE DESEA ENVIAR A ACCIONES GRABADAS?",
            () => {
                this.dataService.Spinner().show("sp6");
                this.dataService
                    .Beneficios()
                    .guardarBeneficioVacacionesTruncas(
                        generarFormDataUtil(this.form.value)
                    )
                    .pipe(catchError((error: HttpErrorResponse) => {
                        this.dataService.Message().msgWarning('"'+error.error.messages[0].toUpperCase()+'"');
                        return of(null);
                    }), finalize(() => {
                        this.dataService.Spinner().hide("sp6");
                    })).subscribe((response) => {
                        if (response) {
                                this.dataService
                                    .Util()
                                    .msgAutoCloseSuccess(
                                        "OPERACIÓN REALIZADA DE FORMA EXITOSA",
                                        2000,
                                        () => {
                                            
                                        }
                                    );
                                //@aqui retornamos el response, para ver si en la vista de lista, lo recibe
                                return response;
                        } else if (
                            response &&
                            (response.statusCode === 422 ||
                                response.statusCode === 404)
                        ) {
                            this.dataService.Util().msgWarning('"'+response.messages[0]+'"', () => {});
                        } else if (
                            response &&
                            (response.statusCode === 401 ||
                                response.error === MISSING_TOKEN.INVALID_TOKEN)
                        ) {
                            this.dataService.Message().msgInfo(PASSPORT_MESSAGE.SESION_END, () => {
                                    this.dataService
                                        .Storage()
                                        .passportUILogin();
                                });
                        } 
                        
                    });
            },
            () => {}
        );
    }
    handleEnviarAccionesGrabadas =()=>{
        this.form.patchValue({ 
            validarEnviarAccionesGrabadas:true
        });
    }
    GenerarProyectoResolucion=()=>{
        
        let regimenLaboralTexto = this.form.get('regimenLaboralTexto').value;
        let grupoAccionTexto = 'BENEFICIOS';
        let accionTexto = this.form.get('accionTexto').value;
        let motivoAccionTexto = this.form.get('motivoAccionTexto').value;
        let mandatoJudicial = this.form.get('mandatoJudicial').value;
        let codigoSede =  this.form.get('codigoSede').value;
        let codigoTipoSede =  this.form.get('codigoTipoSede').value;
        
        this.dialogRef = this.materialDialog.open(GenerarProyectoComponent, {
          panelClass: 'modal-generar-proyecto-resolucion-form-dialog',
          disableClose: true,
          data: {
            title: "Generar proyecto de resolución",
            datosAccion: {
                regimen_laboral: regimenLaboralTexto,
                grupo_accion: grupoAccionTexto,
                accion: accionTexto,
                motivo_accion: motivoAccionTexto
            },
            datosBeneficio:this.form.value,
            operacion:1
          }
        });
    
        this.dialogRef.afterClosed()
          .subscribe((response: any) => {
            if (!response) {
              return;
            }
            debugger;
            console.log('response GenerarProyectoResolucion => ', response);
            this.getDetalleBeneficio(response);
            
            // this.form.patchValue({ 
            //     retornar: true
            // });
            // this.plaza = response;
          });
    }
    getDetalleBeneficio = (data: any) => {
        this.dataService.Spinner().show("sp6");
    
        this.dataService
            .Beneficios()
            .getDetalleBeneficio(data)
            .pipe(
                catchError(() => of([])),
                finalize(() => {})
            )
            .subscribe((result: any) => {
                if (result) {
                    this.handleVerProyecto(result.documentoProyectoResolucion);
                }
            });
    };
    handleVerProyecto(documentoProyectoResolucion) {
        console.log("visualizar", documentoProyectoResolucion)
        //var registro1 = "4/02817822-49d1-ec11-b81b-0050569005a4"
        console.log("pdf", documentoProyectoResolucion);
        const codigoDocumentoReferencia = documentoProyectoResolucion;
        if (codigoDocumentoReferencia === null) {
            this.dataService
                .Util()
                .msgWarning(
                    "La accion grabada no tiene documento adjunto.",
                    () => { }
                );
            return true;
        }
    
        this.dataService.Spinner().show("sp6");
        this.dataService
            .Documento()
            .descargar(codigoDocumentoReferencia)
            .pipe(
                catchError((e) => of(null)),
                finalize(() => this.dataService.Spinner().hide("sp6"))
            )
            .subscribe(
                (data) => {
                    const nombreArchivo = documentoProyectoResolucion + ".pdf";
                    this.handlePreview(data, nombreArchivo);
                    //saveAs(data, nombreArchivo);
                },
                (error) => {
                    this.dataService
                        .Util()
                        .msgWarning(
                            "No se encontro el documento de sustento",
                            () => { }
                        );
                }
            );
    }
    handlePreview(file: any, codigoAdjuntoAdjunto: string) {
        console.log("mostrar pDF 2", file)
        this.dialogRef = this.materialDialog.open(DocumentViewerComponent, {
            panelClass: "modal-viewer-form-dialog",
            disableClose: true,
            data: {
                modal: {
                    icon: "remove_red_eye",
                    title: "Proyecto Resolución",
                    file: file,
                    fileName: codigoAdjuntoAdjunto,
                },
            },
        });
        this.dialogRef.afterClosed()
        .subscribe((response: any) => {
          debugger;
          this.form.patchValue({ 
              retornar: true
          });
          // this.plaza = response;
        });
    }
    handleGenerarProyectoResolucion =()=>{
        //event.preventDefault();
        this.form.patchValue({ 
            validarGenerarProyecto:true
        });
        
    }
    handleGuardar =()=>{
        console.log('handleGuardar','enter presionado?')
        if (!this.form.valid) {
            this.dataService.Message().msgAutoCloseWarning(MensajesSolicitud.M08, 3000, () => {

            });
            return;
        }
        console.log('idServidorPublico',this.form.get('idServidorPublico').value);
        
        console.log('documentoInformeEscalafonario',this.form.get('documentoInformeEscalafonario').value);
        console.log('!value',!this.form.get('idServidorPublico').value);
        if(!this.form.get('idServidorPublico').value)
        {
            this.dataService.Message().msgAutoCloseWarning(MensajesSolicitud.M11, 3000, () => {

            });
            
            return;
        }

        if(!this.form.get('documentoInformeEscalafonario').value)
        {
            this.dataService.Message().msgAutoCloseWarning(MensajesSolicitud.M12, 3000, () => {

            });
            return;
        }
        
       this.form.patchValue({ 
            guardar: true
        });
    }
    handleLimpiar(): void {
        this.resetForm();
        this.passport();
    }
    handleCancelar =()=>{
        this.router.navigate(
            ['/ayni/personal/acciones/beneficios'], 
            { relativeTo: this.route }
        ); 
    }
    buildForm() {
        
        this.form = this.formBuilder.group({
            //Rol
            codigoRol :[null],
            codigoSede :[null],
            codigoTipoSede :[null],
            //Acción Personal
            mandatoJudicial: [false, Validators.required],
            idRegimenLaboral: [null, Validators.required],
            regimenLaboralTexto:[null],
            administrativo: [false],
            idAccion:[null, Validators.required],
            accionTexto:[null],
            idMotivoAccion:[null, Validators.required],
            motivoAccionTexto:[null],
    
            //Servidor Público
            idTipoDocumentoIdentidad:[null, Validators.required],
            numeroDocumentoIdentidad:[null, Validators.required],
            tipoDocumentoIdentidad:[null],
            idPersona:[null],
            idServidorPublico:[null],
            codigoServidorPublico:[null],
            idSituacionLaboral:[null],
            idCondicionLaboral:[null],
            nombres:[null],
            primerApellido:[null],
            segundoApellido:[null],
            estadoCivil:[null],
            sexo:[null],
            fechaNacimiento:[null],
    
            fechaInicioVinculacion:[null],
            fechaFinVinculacion:[null],
            condicionLaboral:[null],
            situacionLaboral:[null],
            escalaMagisterial:[null],
            codigoModular:[null],
            institucionEducativa:[null],
            descripcionNivelEducativo:[null],
            categoriaRemunerativa:[null],
            codigoPlaza:[null],
            descripcionJornadaLaboral:[null],
            descripcionCargo:[null],
            idNivelInstancia:[null],
            idCentroTrabajo:[null],
            idCategoriaRemunerativa:[null],
            grupoOcupacional:[null],
            //Informe escalafonario
            numeroInformeEscalafonario:[null, Validators.required],
            nombreDocumentoInformeEscalafonario:[null],
            
            documentoInformeEscalafonario:[null],
            fechaInformeEscalafonario:[null],
            fechaBeneficioInformeEscalafonario:[null],
            aniosTiempoServicio:[null],
            aniosUltimoCargo:[null],
            motivoBeneficio:[null],
    
            //Informe cálculo
            numeroInformeCalculo:new FormControl({ value: '', disabled: true }),
            fechaBeneficio:[null],
            conInformeCalculo:[false],
            baseCalculo:[null],
            factorCalculo:[null],
            importeBeneficio:[null],
            //29944
            tiempoServicioCalculo:[null],
            //276
            tiempoServicioCalculoAnio:[null],
            tiempoServicioCalculoMes:[null],
            tiempoServicioCalculoDia:[null],
    
            tiempoServicioCalculoAnioTexto:[null],
            tiempoServicioCalculoMesTexto:[null],
            tiempoServicioCalculoDiaTexto:[null],
            //credito devengado
            idTipoCreditoDevengado:[null],
            fechaInicioCreditoDevengado:[null],
            fechaFinCreditoDevengado:[null],
            totalLiquidacionCreditoDevengado:[0],
            pagadoCreditoDevengado:[0],
            totalDeudaCreditoDevengado:[0],
            interesesLegalesCreditoDevengado:[0],
            porPagarCreditoDevengado:[0],
    
            //luto sepelio
            idTipoSubsidio:[null],
            tipoSubsidio:[null],
            actaDefuncion:[null],
            fechaDefuncion:[null],
            idTipoDocumentoIdentidadDefuncion:[null],
            descripcionTipoDocumentoIdentidadDefuncion:[null],
            numeroDocumentoIdentidadDefuncion:[null],
            nombresDefuncion:[null],
            primerApellidoDefuncion:[null],
            segundoApellidoDefuncion:[null],
            parentescoDefuncion:[null],
            codigoParentescoDefuncion:[null],
            listaBeneficiario:[null],
            //Vacaciones Truncas
            listaVacacionesTruncas:[null],
            //Bonificación Familiar
            periocidad:[null],
            //Bonificación Personal
            quinquenio:[null],
            //Incentivo Profesional
            idTipoBeneficio:[null],
            idCategoriaBeneficio:[null],
            //Anotacioens
            anotaciones:[null], 

            //Auditoria
            fechaCreacion: [null],
            usuarioCreacion: [null],
            ipCreacion: [null],
            //Form
            tipoFormularioBeneficio:[false],
            guardar:[false],
            validarGenerarProyecto:[false],
            generarProyecto:[false],
            enviarAccionesGrabadas:[false],
            retornar:[false],

            //Acciones grabadas control
            accionesGrabadas:[false],
            validarEnviarAccionesGrabadas:[false],
            tipoMotivoAccion:[null]


        });
    
        this.form.get("retornar").valueChanges.subscribe(x => {
            if(x)
                this.handleCancelar();
         })

         

    }
}
