import { HttpErrorResponse, HttpParams } from '@angular/common/http';
import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute, Router } from '@angular/router';
import { mineduAnimations } from '@minedu/animations/animations';
import { DataService } from 'app/core/data/data.service';
import { SecurityModel } from 'app/core/model/security/security.model';
import { TablaPermisos } from 'app/core/model/types';
import { SharedService } from 'app/core/shared/shared.service';
import { DocumentViewerComponent } from 'app/main/apps/components/document-viewer/document-viewer.component';
import { of } from 'rxjs';
import { catchError, finalize } from 'rxjs/operators';
import { RechazoMandatoJudicialComponent } from '../components/rechazo-mandato-judicial/rechazo-mandato-judicial.component';

@Component({
  selector: 'minedu-ver-beneficio',
  templateUrl: './ver-beneficio.component.html',
  styleUrls: ['./ver-beneficio.component.scss'],
  encapsulation: ViewEncapsulation.None,
    animations: mineduAnimations
})
export class VerBeneficioComponent implements OnInit {

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
      tipoFormulario:any = 1;
      tipoFormularioNombre:string;
  ngOnInit() {
    console.log('load VerBeneficioComponent');
    setTimeout(() => this.buildShared());
    this.idDetalleGestionBeneficio =  this.route.snapshot.paramMap.get("idDetalleGestionBeneficio");
    this.tipoFormulario =  this.route.snapshot.paramMap.get("tipoFormulario");
    if(this.tipoFormulario==1){
        this.tipoFormularioNombre = 'Ver Registro de Beneficio';
    }else{
        this.tipoFormularioNombre = 'Aprobación de Mandato Judicial'
    }
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
    console.log('load VerBeneficioComponent setFormDetalleBeneficio');
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
        
        documentoInformeEscalafonario:data.documentoInformeEscalafonario,
        fechaInformeEscalafonario:data.fechaInformeEscalafonario,
        tiempoServicioOficiales:data.tiempoServicioOficiales,
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
        importeBeneficioAnio:data.importeBeneficioAnio,
        importeBeneficioMes:data.importeBeneficioMes,
        importeBeneficioDia:data.importeBeneficioDia,
        importeBeneficioAnioTexto:(!data.tiempoServicioCalculo)?'':data.tiempoServicioCalculo.substring(0,9),
        importeBeneficioMesTexto:(!data.tiempoServicioCalculo)?'':data.tiempoServicioCalculo.substring(10,19),
        importeBeneficioDiaTexto:(!data.tiempoServicioCalculo)?'':data.tiempoServicioCalculo.substring(20),
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
        //Incentivo Estudios
        //Premio Anual
        //Anotacioens
        anotaciones:data.anotaciones,
        
        });
        this.dataService.Spinner().hide("sp6");
        
    }
  buildForm() {
    this.form = this.formBuilder.group({
        estado:[null],
        //Rol
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
        importeBeneficioAnio:[null],
        importeBeneficioMes:[null],
        importeBeneficioDia:[null],
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
        tipoSubsidio:[null],
        listaBeneficiario:[null],
        //Vacaciones Truncas
        listaVacacionesTruncas:[null],
        //Bonificación Familiar
        periocidad:[null],
        //Bonificacion Personal
        listaBonificacionFamiliar:[null],
        quinquenio:[null],
        quinquenioTexto:[null],
         //Incentivo Profesiona
         descripcionTipoBeneficio:[null],
         descripcionCategoriaBeneficio:[null],
         //Incentivo Estudios
         //Premio Anual
        //Anotacioens
        anotaciones:[null], 
        //Form
        guardar:[false],
        retornar:[false]
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
  handleCancelar =()=>{
    this.router.navigate(
        ['/ayni/personal/acciones/beneficios'], 
        { relativeTo: this.route }
    ); 
    }
    getDataRespuestaAprobacionesOk(idRegistro){
        const usuario = this.dataService.Storage().getPassportUserData();
        return {
            "idRegistro":idRegistro,
            "codigoEstadoAprobaciones": 1,
            "usuarioCreacion":usuario.NUMERO_DOCUMENTO,
            "codigoSede":this.currentSession.codigoSede,
            "codigoTipoSede":this.currentSession.codigoTipoSede,
            "codigoRol":this.currentSession.codigoRol
            }
    }
    getDataRespuestaAprobacionesRechazo(idRegistro,motivoRechazo){
        
        const usuario = this.dataService.Storage().getPassportUserData();
        return {
            "idRegistro":idRegistro,
            "codigoEstadoAprobaciones": 3,
            "motivoRechazo": motivoRechazo,
            "usuarioCreacion":usuario.NUMERO_DOCUMENTO,
            "codigoSede":this.currentSession.codigoSede,
            "codigoTipoSede":this.currentSession.codigoTipoSede,
            "codigoRol":this.currentSession.codigoRol
            }
    }
    handleAutorizar=()=>{
        this.dataService.Message().msgConfirm('¿ESTÁ SEGURO QUE DESEA APROBAR?', () => {
            this.dataService.Spinner().show("sp6");
            
            this.dataService.Beneficios().respuestaAprobaciones(this.getDataRespuestaAprobacionesOk(this.idDetalleGestionBeneficio)).pipe(
                catchError((response : HttpErrorResponse) =>{
                    this.dataService.Message().msgWarning(response.error.messages[0]);
                    return of(null);
                }),
                finalize(()=>{this.dataService.Spinner().hide("sp6");})
            ).subscribe(
              (response:any) => {
                if(response){
                    this.dataService.Message().msgAutoCloseSuccessNoButton('"OPERACIÓN REALIZADA DE FORMA EXITOSA."', 3000, () => {
                        this.form.patchValue({ 
                            retornar: true
                        });
                    });
                }
              });
          }, () => { });
    }
    handleRechazar=()=>{
        event.preventDefault();
        this.dataService.Message().msgConfirm('¿ESTÁ SEGURO QUE DESEA DESAPROBAR LA INFORMACIÓN?', () => {
            
            var data= {
                idBeneficiario:0
            };
           
            this.dialogRef = this.materialDialog.open(RechazoMandatoJudicialComponent, {
                panelClass: 'minedu-rechazo-mandato-judicial-form-dialog',
                disableClose: true,
                data: data
            });
        
            this.dialogRef.afterClosed()
            .subscribe((response: any) => {
                this.dataService.Beneficios().respuestaAprobaciones(this.getDataRespuestaAprobacionesRechazo(this.idDetalleGestionBeneficio,response.data.motivoRechazo)).pipe(
                    catchError((response : HttpErrorResponse) =>{
                        this.dataService.Message().msgWarning(response.error.messages[0]);
                        return of(null);
                    }),
                    finalize(()=>{this.dataService.Spinner().hide("sp6");})
                ).subscribe(
                  (response:any) => {
                    if(response){
                        this.dataService.Message().msgAutoCloseSuccessNoButton('"OPERACIÓN REALIZADA DE FORMA EXITOSA."', 3000, () => {
                            this.form.patchValue({ 
                                retornar: true
                            });
                        });
                    }
                  });
            });
          }, () => { });
    }
    handleVerDocumento() {
       
        this.dataService.Spinner().show('sp6');
        this.dataService.Documento().descargar(this.form.get("documentoInformeEscalafonario").value)
            .pipe(
                catchError((e:HttpErrorResponse) => {
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
                    title: 'Informe Escalafonario',
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

}
