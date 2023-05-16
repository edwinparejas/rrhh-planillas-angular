import { HttpParams } from '@angular/common/http';
import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute, Router } from '@angular/router';
import { mineduAnimations } from '@minedu/animations/animations';
import { DataService } from 'app/core/data/data.service';
import { PASSPORT_MESSAGE } from 'app/core/model/messages-error';
import { SecurityModel } from 'app/core/model/security/security.model';
import { MISSING_TOKEN, TablaPermisos } from 'app/core/model/types';
import { SharedService } from 'app/core/shared/shared.service';
import { DocumentViewerComponent } from 'app/main/apps/components/document-viewer/document-viewer.component';
import { of } from 'rxjs';
import { catchError, finalize } from 'rxjs/operators';
import { GenerarProyectoComponent } from '../components/generar-proyecto/generar-proyecto.component';
import { MensajesSolicitud } from '../_utils/constants';

@Component({
  selector: 'minedu-editar-beneficio',
  templateUrl: './editar-beneficio.component.html',
  styleUrls: ['./editar-beneficio.component.scss'],
  encapsulation: ViewEncapsulation.None,
    animations: mineduAnimations
})
export class EditarBeneficioComponent implements OnInit {

    constructor(
        private router: Router,      
        private route: ActivatedRoute,
        private formBuilder: FormBuilder,
        private dataService: DataService,
        private materialDialog: MatDialog,
        private sharedService: SharedService,
      ) { }
      form: FormGroup;
      loading: false;
      isMobile = false;
      currentSession: SecurityModel = new SecurityModel();
      hasAccessPage: boolean;
      disponibleAnular:boolean = true;
      dialogRef: any;
      idDetalleGestionBeneficio:any;
  ngOnInit() {
    setTimeout(() => this.buildShared());
    this.idDetalleGestionBeneficio =  this.route.snapshot.paramMap.get("idDetalleGestionBeneficio");
   
    this.buildSeguridad();
    this.handleResponsive();
    this.buildForm();
    this.passport();
    if (!this.hasAccessPage) {
        this.dataService.Message().msgInfo(
            "NO CUENTA CON PERMISOS REQUERIDOS", () => {
            this.handleCancelar();
        });
    }
    this.getDetalleBeneficio(this.idDetalleGestionBeneficio);
    this.form.get("generarProyecto").valueChanges.subscribe(x => {
        if(x){
            this.GenerarProyectoResolucion();
        }
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
                this.setFormDetalleBeneficio(result);
            }
        });
};
getQuinquenioTexto(val){
    var re="Primer";
    switch (val) {
        case 1:
            re = "Primer"
            break;
        case 2:
            re = "Segundo"
            break;
        case 3:
            re = "Tercer"
            break;
        case 4:
            re = "Cuarto"
            break;
        case 5:
            re = "Quinto"
            break;
        case 6:
            re = "Sexto"
            break;
        case 7:
            re = "Septimo"
            break;
        default:
            re = "Octavo"
            break;
    }  
    return re;
 }
setFormDetalleBeneficio(data){
    this.form.patchValue({ 
        estado:data.estado,
        //identificadores
        idPersona: data.idPersona,
        idServidorPublico: data.idServidorPublico,
        idGestionBeneficio: data.idGestionBeneficio,
        idDetalleGestionBeneficio: data.idDetalleGestionBeneficio,
        idNivelInstancia: data.idNivelInstancia,
        idCentroTrabajo: data.idCentroTrabajo,
        idRegimenLaboral: data.idRegimenLaboral,
        idAccion:data.idAccion,
        idMotivoAccion:data.idMotivoAccion,

        //Acción Personal
        mandatoJudicial: data.mandatoJudicial,
        regimenLaboral: data.regimenLaboral,
        administrativo: data.administrativo,
        accion: data.accion,
        motivoAccion: data.motivoAccion,

        //Servidor Público
        idTipoDocumentoIdentidad:data.idTipoDocumentoIdentidad,
        tipoDocumentoIdentidad:data.tipoDocumentoIdentidad,
        numeroDocumentoIdentidad:data.numeroDocumentoIdentidad,
        nombres:data.nombres,
        primerApellido:data.primerApellido,
        segundoApellido:data.segundoApellido,
        estadoCivil:data.estadoCivil,
        sexo:data.sexo,
        fechaNacimiento:data.fechaNacimiento,

        fechaInicioVinculacion:data.fechaInicioVinculacion,
        fechaFinVinculacion:data.fechaFinVinculacion,
        condicionLaboral:data.condicionLaboral,
        situacionLaboral:data.situacionLaboral,
        escalaMagisterial:data.escalaMagisterial,
        codigoModular:data.codigoModular,
        centroTrabajo:data.centroTrabajo,
        nivelEducativo:data.nivelEducativo,
        categoriaRemunerativa:data.descripcionCategoriaRemunerativa,
        grupoOcupacional:data.grupoOcupacional,
        codigoPlaza:data.codigoPlaza,
        jornadaLaboral:data.jornadaLaboral,
        cargo:data.cargo,
        //Informe escalafonario
        numeroInformeEscalafonario:data.numeroInformeEscalafonario,
        
        documentoInformeEscalafonario:data.numeroInformeEscalafonario,
        fechaInformeEscalafonario:data.fechaInformeEscalafonario,
        tiempoServicioOficiales:data.tiempoServicioOficiales,
        aniosTiempoServicio:data.tiempoServicioOficiales,
        aniosUltimoCargo:data.tiempoServicioOficiales,
        motivoInforme:data.motivoInforme,
        motivoBeneficio:data.motivoInforme,
        //Informe cálculo
        numeroInformeCalculo:data.numeroInformeCalculo,
        fechaBeneficio:data.fechaBeneficio,
        conInformeCalculo:data.conInformeCalculo,
        baseCalculo:data.baseCalculo,
        factorCalculo:data.factorCalculo,
        importeBeneficio:data.importeBeneficio,
        //29944
        tiempoServicioCalculo:data.tiempoServicioCalculo,
        //276
        tiempoServicioCalculoAnio:data.importeBeneficioAnio,
        tiempoServicioCalculoMes:data.importeBeneficioMes,
        tiempoServicioCalculoDia:data.importeBeneficioDia,
        tiempoServicioCalculoAnioTexto:(!data.tiempoServicioCalculo)?'':data.tiempoServicioCalculo.substring(0,9),
        tiempoServicioCalculoMesTexto:(!data.tiempoServicioCalculo)?'':data.tiempoServicioCalculo.substring(10,19),
        tiempoServicioCalculoDiaTexto:(!data.tiempoServicioCalculo)?'':data.tiempoServicioCalculo.substring(20),
        //credito devengado
        idTipoCreditoDevengado:data.idTipoCreditoDevengado,
        descripcionTipoCreditoDevengado:data.descripcionTipoCreditoDevengado,
        fechaInicioCreditoDevengado:data.fechaInicioCreditoDevengado,
        fechaFinCreditoDevengado:data.fechaFinCreditoDevengado,
        totalLiquidacionDevengado:data.totalLiquidacionDevengado,
        pagadoDevengado:data.pagadoDevengado,
        totalDeudaDevengado:data.totalDeudaDevengado,
        interesLegalDevengado:data.interesLegalDevengado,
        porPagarDevengado:data.porPagarDevengado,

        //luto sepelio
        listaBeneficiario: data.tipoSubsidio=="TITULAR" ? data.listaBeneficiarioSubsidioTitular : null,
        actaDefuncion:data.numeroActaDefuncion,
        tipoSubsidio:data.tipoSubsidio,
        tipoFallecido:data.tipoSubsidio=="TITULAR"?2:1,
        idTipoSubsidio:data.tipoSubsidio=="TITULAR"?2:1,
        // tipoFallecido:[null],
        // actaDefuncion:[null],
        fechaDefuncion:data.fechaDefuncion,
        // descripcionTipoDocumentoIdentidadDefuncion:[null],
        // numeroDocumentoIdentidadDefuncion:[null],
        // nombresDefuncion:[null],
        // primerApellidoDefuncion:[null],
        // segundoApellidoDefuncion:[null],
        // parentescoDefuncion:[null],
        
        //Vacaciones Truncas
        listaVacacionesTruncas:data.listaVacacionesTruncas,
        //Bonificación Familiar
        listaBonificacionFamiliar:data.listaBeneficiarioBonificacionFamiliar,
        periocidad:data.periocidad,
        //Bonificacion Personal
        quinquenio:data.quinquenio,
        quinquenioTexto:this.getQuinquenioTexto(data.quinquenio),
        //Incentivo Profesional
        descripcionTipoBeneficio:data.descripcionTipoBeneficio,
        descripcionCategoriaBeneficio:data.descripcionCategoriaBeneficio,
        idTipoBeneficio:data.idTipoBeneficio,
        idCategoriaBeneficio:data.idCategoriaBeneficio,
        //Incentivo Estudios
        
        //Anotacioens
        anotaciones:data.anotaciones,
        
        });
        this.dataService.Spinner().hide("sp6");
    }
  buildForm() {
    
    const usuario = this.dataService.Storage().getPassportUserData();
    this.form = this.formBuilder.group({
        //Rol
        estado:[null],
        codigoRol :[null],
        codigoSede :[null],
        codigoTipoSede :[null],
        //identificadores
        idPersona: [null],
        idServidorPublico: [null],
        idGestionBeneficio: [null],
        idDetalleGestionBeneficio: [null],
        idNivelInstancia: [null],
        idCentroTrabajo: [null],
        idRegimenLaboral: [null],
        idAccion:[null],
        idMotivoAccion:[null],

        //Acción Personal
        mandatoJudicial: [null, Validators.required],
        regimenLaboral: [null],
        administrativo: [null],
        accion: [null],
        motivoAccion: [null],

        //Servidor Público
        idTipoDocumentoIdentidad:[null],
        tipoDocumentoIdentidad:[null],
        numeroDocumentoIdentidad:[null],
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
        centroTrabajo:[null],
        nivelEducativo:[null],
        categoriaRemunerativa:[null],
        grupoOcupacional:[null],
        codigoPlaza:[null],
        jornadaLaboral:[null],
        cargo:[null],
        //Informe escalafonario
        numeroInformeEscalafonario:[null],
        documentoInformeEscalafonario:[null],
        fechaInformeEscalafonario:[null],
        tiempoServicioOficiales:[null],
        aniosTiempoServicio:[null],
        aniosUltimoCargo:[null],
        motivoInforme:[null],
        motivoBeneficio:[null],
        //Informe cálculo
        numeroInformeCalculo:[null],
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
        descripcionTipoCreditoDevengado:[null],
        fechaInicioCreditoDevengado:[null],
        fechaFinCreditoDevengado:[null],
        totalLiquidacionDevengado:[null],
        pagadoDevengado:[null],
        totalDeudaDevengado:[null],
        interesLegalDevengado:[null],
        porPagarDevengado:[null],

        //luto sepelio
        tipoFallecido:[null],
        idTipoSubsidio:[null],
        actaDefuncion:[null],
        fechaDefuncion:[null],
        descripcionTipoDocumentoIdentidadDefuncion:[null],
        numeroDocumentoIdentidadDefuncion:[null],
        nombresDefuncion:[null],
        primerApellidoDefuncion:[null],
        segundoApellidoDefuncion:[null],
        parentescoDefuncion:[null],
        
        listaBeneficiario:[null],

        tipoSubsidio:[null],

        //Vacaciones Truncas
        listaVacacionesTruncas:[null],
        //Bonificación Familiar
        listaBonificacionFamiliar:[null],
        periocidad:[null],
        //Bonificacion Personal
        quinquenio:[null],
        quinquenioTexto:[null],
        //Incentivo Profesiona
        descripcionTipoBeneficio:[null],
        descripcionCategoriaBeneficio:[null],
        idTipoBeneficio:[null],
        idCategoriaBeneficio:[null],
        //Incentivo Estudios
        //Premio Anual
        //Anotacioens
        anotaciones:[null], 
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
        tipoMotivoAccion:[null],

        //Auditoria
        fechaCreacion: new Date(),
        usuarioCreacion: usuario.NUMERO_DOCUMENTO,
        ipCreacion: '',
        //Auditoria
        fechaModificacion: new Date(),
        usuarioModificacion: usuario.NUMERO_DOCUMENTO,
        ipModificacion: '',
    });

    this.form.get("retornar").valueChanges.subscribe(x => {
        if(x)
            this.handleCancelar();
     })
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
addParam(queryParam:HttpParams,param,value){
    if(value)
        queryParam = queryParam.set(param, value);
    return queryParam
}
getValueOrNullFromCero(value){
    return value==0?null:value;
  }
  getValueOrNullFromEmpy(value){
    return value==""?null:value;
  }
  buildSeguridad() {
    this.currentSession = this.dataService.Storage().getInformacionUsuario();
    const request = {
        codigoRol: this.currentSession.codigoRol
    }
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
  buildShared() {
    this.sharedService.setSharedTitle('Acciones de Personal: Beneficios');
    this.sharedService.setSharedBreadcrumb('Anular Registro de Beneficio');
}
handleGuardar =()=>{
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
  handleCancelar =()=>{
    this.router.navigate(
        ['/ayni/personal/acciones/beneficios'], 
        { relativeTo: this.route }
    ); 
    }
    handleAnular=()=>{
        
    }

    handleVerDocumento() {
        this.dataService.Spinner().show('sp6');
        this.dataService.Documento().descargar(this.form.get("documentoInformeEscalafonario").value)
            .pipe(
                catchError((e) => {
                    return of(null);
                }),
                finalize(() => this.dataService.Spinner().hide('sp6'))
            ).subscribe(response => {
                if (response) {
                    this.handlePreview(response, this.form.get("documentoInformeEscalafonario").value);
                } else {
                    this.dataService.Message().msgWarning('NO SE PUDO OBTENER EL DOCUMENTO.', () => {
                    });
                }
            });
      }
      handlePreview(file: any, codigoAdjuntoSustento: string) {
        this.dialogRef = this.materialDialog.open(DocumentViewerComponent, {
            panelClass: 'modal-viewer-form-dialog',
            disableClose: true,
            data: {
                modal: {
                    icon: 'remove_red_eye',
                    title: 'Contrato',
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
      handleEnviarAccionesGrabadas =()=>{
        this.form.patchValue({ 
            validarEnviarAccionesGrabadas:true
        });
        //this.EnviarAccionesGrabadas();
    }
    handleGenerarProyectoResolucion =()=>{
        //event.preventDefault();
        this.form.patchValue({ 
            validarGenerarProyecto:true
        });
        //this.GenerarProyectoResolucion();
        
    }
      GenerarProyectoResolucion=()=>{
        let regimenLaboralTexto = this.form.get('regimenLaboral').value;
        let grupoAccionTexto = 'BENEFICIOS';
        let accionTexto = this.form.get('accion').value;
        let motivoAccionTexto = this.form.get('motivoAccion').value;
        // let mandatoJudicial = this.form.get('mandatoJudicial').value;
        // let codigoSede =  this.form.get('codigoSede').value;
        // let codigoTipoSede =  this.form.get('codigoTipoSede').value;
        
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
            operacion:2
            //idBeneficio:this.idDetalleGestionBeneficio
          }
        });
    
        this.dialogRef.afterClosed()
          .subscribe((response: any) => {
            if (!response) {
              return;
            }
            console.log('persona selected - close => ', response);
            this.form.patchValue({ 
                retornar: true
            });
            // this.plaza = response;
          });
    }

      /**
       * Enviar acciones grabadas
       */
      
       EnviarAccionesGrabadas =()=>{
        var listIDRegistros = [];
        listIDRegistros.push(parseInt(this.idDetalleGestionBeneficio));
        
        this.dataService.Message().msgConfirm('¿ESTÁ SEGURO DE QUE DESEA ENVIAR A ACCIONES GRABADAS.?', () => {
        
            console.log("no se cancelo");
            const usuario = this.dataService.Storage().getPassportUserData();
            
            var dataBeneficio = {
                idRegistros:listIDRegistros,
                fechaCreacion: new Date(),
                usuarioCreacion: usuario.NUMERO_DOCUMENTO,
                ipCreacion:":1",
            }
            this.dataService.Beneficios()
                .enviarAccionesGrabadas(dataBeneficio)
                .pipe(
                    catchError(() => of([])),
                    finalize(() => { })
                )
                .subscribe((response: any) => {
                    console.log('Acciones Grabadas', response);
                    if (response) {
                        this.dataService.Message().msgSuccess('"SE ENVIÓ CORRECTAMENTE A ACCIONES GRABADAS."', () => {
                            this.handleCancelar();
                        });
                    }
                });
        }, () => { });
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
}
