import { HttpErrorResponse, HttpParams } from '@angular/common/http';
import { Component, Input, OnInit, ViewEncapsulation } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { mineduAnimations } from '@minedu/animations/animations';
import { DataService } from 'app/core/data/data.service';
import { DocumentViewerComponent } from 'app/main/apps/components/document-viewer/document-viewer.component';
import { of } from 'rxjs';
import { catchError, finalize } from 'rxjs/operators';
import { MensajesSolicitud } from '../../_utils/constants';

@Component({
  selector: 'minedu-editar-informe-escalafonario',
  templateUrl: './editar-informe-escalafonario.component.html',
  styleUrls: ['./editar-informe-escalafonario.component.scss'],
  encapsulation: ViewEncapsulation.None,
    animations: mineduAnimations
})
export class EditarInformeEscalafonarioComponent implements OnInit {
    @Input() form:FormGroup;
    dialogRef: any;
  constructor(
    
    private formBuilder: FormBuilder,
    private dataService: DataService,
    private materialDialog: MatDialog
  ) { }

  ngOnInit() {
  }

  /**
    * Métodos HTML*/
   onKeyPressNumeroInformeEscalafonario(e: any): boolean {
    var inp = String.fromCharCode(e.keyCode);
      if (/[a-zA-Z0-9]|[-]|[ ]/.test(inp)) {
        return true;
      } else {
        e.preventDefault();
        return false;
      }
  }
  handleBuscarInformeEscalafonario(){
    if(!this.form.get('idMotivoAccion').value)
        {
            this.dataService.Message().msgWarning(MensajesSolicitud.M13, () => { });
            return;
        }
    if(!this.form.get('idTipoDocumentoIdentidad').value)
    {
        this.dataService.Message().msgWarning(MensajesSolicitud.M14, () => { });
        return;
    }
    if(!this.form.get('numeroDocumentoIdentidad').value)
    {
        this.dataService.Message().msgWarning(MensajesSolicitud.M15, () => { });
        return;
    }
    if(!this.form.get('numeroInformeEscalafonario').value)
    {
        this.dataService.Message().msgWarning(MensajesSolicitud.M16, () => { });
        return;
    }
    var anioIE = this.obtenerAniodeInformeEscalafonario(this.form.get('numeroInformeEscalafonario').value);
    if(anioIE > new Date().getFullYear()){
        this.dataService.Message().msgWarning(MensajesSolicitud.M32, () => { });
        return;
    }
    const idMotivoAccion = this.form.get('idMotivoAccion').value;
   
    let queryParam = new HttpParams();

        queryParam = this.addParam(queryParam,'idTipoDocumentoIdentidad', this.getValueOrNullFromCero(this.form.get('idTipoDocumentoIdentidad').value));
        queryParam = this.addParam(queryParam,'numeroDocumentoIdentidad', this.getValueOrNullFromEmpy(this.form.get('numeroDocumentoIdentidad').value));
        queryParam = this.addParam(queryParam,'numeroInformeEscalafonario', this.getValueOrNullFromEmpy(this.form.get('numeroInformeEscalafonario').value));
        
        queryParam = this.addParam(queryParam,'anio', anioIE);
        queryParam = this.addParam(queryParam,'tipoInforme',this.obtenerTipoInforme(idMotivoAccion));
        queryParam = this.addParam(queryParam,'motivoInforme', this.obtenerMotivoInforme(idMotivoAccion));
        queryParam = this.addParam(queryParam,'codigoSede', this.getValueOrNullFromEmpy(this.form.get('codigoSede').value));
        queryParam = this.addParam(queryParam,'codigoTipoSede', this.getValueOrNullFromEmpy(this.form.get('codigoTipoSede').value));

    this.form.patchValue({ motivoBeneficio:this.obtenerMotivoInformePorId(this.obtenerMotivoInforme(idMotivoAccion))});
    this.loadInformeEscalafonario(queryParam);
  }
  addParam(queryParam:HttpParams,param,value){
    if(value)
        queryParam = queryParam.set(param, value);
    return queryParam
}
obtenerAniodeInformeEscalafonario(numeroIE)
{
    let indexGuion = numeroIE.indexOf('-',0);
    if(indexGuion>5){
        let anioString = numeroIE.substring(indexGuion+1).trim();
        let valorAnio = parseInt(anioString,10);
        return valorAnio;
    }
    else
    return 9999;
    
}
getValueOrNullFromCero(value){
    return value==0?null:value;
  }
  getValueOrNullFromEmpy(value){
    return value==""?null:value;
  }
  obtenerMotivoInformePorId(idMotivoInforme){
    let re = null;
    switch (idMotivoInforme) {
        case 25:
            re = 'OTORGAR COMPENSACION POR TIEMPO DE SERVICIOS';//25
            break;
        case 26:
            re = 'OTORGAR CREDITO DEVENGADO';//26;//
            break;
        case 30:
            re = 'OTORGAR SUBSIDIO POR LUTO Y SEPELIO';//30;//
            break;
        case 29:
            re = 'OTORGAR REMUNERACION VACACIONAL TRUNCA';//29;
            break;
        case 23:
            re = 'OTORGAR ASIGNACION POR TIEMPO DE SERVICIOS POR 25 AÑOS';//23;
            break;
        case 24:
            re = 'OTORGAR ASIGNACION POR TIEMPO DE SERVICIOS POR 30 AÑOS';//24;
            break;
        case 224:
            re = 'OTORGAR GRATIFICACIÓN POR TIEMPO DE SERVICIOS POR 25 AÑOS';//24;
            break;
        case 27:
            re = 'OTORGAR INCENTIVO POR ESTUDIOS DE POST GRADO';//27;
            break;
        case 28:
            re = 'OTORGAR INCENTIVO POR EXCELENCIA PROFESIONAL Y DESEMPEÑO DESTACADO';//28;
            break;
        default:
            re = 'OTROS';
            break;
    }
    return re;
  }
  obtenerMotivoInforme(idMotivoAccion){
    let re = null;
    switch (idMotivoAccion) {
        case 5:
            re = 25;//OTORGAR COMPENSACION POR TIEMPO DE SERVICIOS
            break;
        case 13:
            re = 26;//OTORGAR CREDITO DEVENGADO
            break;
        case 8:
            re = 30;//OTORGAR SUBSIDIO POR LUTO Y SEPELIO
            break;
        case 16://OTORGAR REMUNERACION VACACIONAL TRUNCA
            re = 29;
            break;
        case 9://OTORGAR ASIGNACION POR TIEMPO DE SERVICIOS POR 25 AÑOS
            re = 23;
            break;
        case 10://OTORGAR ASIGNACION POR TIEMPO DE SERVICIOS POR 30 AÑOS
            re = 24;
            break;
        case 203://OTORGAR GRATIFICACION POR TIEMPO DE SERVICIOS POR 30 AÑOS
            re = 24;
            break;
        case 203://NO HAY gratificacion
            re = 224;
            break;
        case 11://NO HAY bonificacion familiar
            re = 224;
            break;
        case 12://NO HAY bonificacion titular
            re = 224;
            break;
        case 14://OTORGAR INCENTIVO POR ESTUDIOS DE POST GRADO
            re = 27;
            break;
        case 15://OTORGAR INCENTIVO POR EXCELENCIA PROFESIONAL Y DESEMPEÑO DESTACADO
            re = 28;
            break;
        case 12://NO HAY premio anual
            re = 224;
            break;
        default:
            break;
    }
    return re;
  }
  obtenerTipoInforme(idMotivoAccion){
    let re = null;
    switch (idMotivoAccion) {
        case 5:
        case 13:
            re = 11;//INFORME DE OTORGAMIENTO 
            break;
        case 8:
            re = 17;//INFORME DE OTORGAR SUBSIDIO POR LUTO - SEPELIO
            break;
        case 16:
        case 9:
        case 10:
        case 14:
        case 15:
            re = 11;//INFORME DE OTORGAMIENTO 
            break;
        default:
            re = 108;//OTROS
            break;
    }
    return re;
  }
  /**
    * Métodos Integración Back*/
    loadInformeEscalafonario(request) {
        this.dataService.Spinner().show('sp6');
        this.dataService.Beneficios().getInformeEscalafonario(request).pipe(catchError(() => of([])), finalize(() => { })).subscribe((result: any) => {
            this.dataService.Spinner().hide('sp6');
            if (result) {
                this.setFormResponse(result);
            }else
                this.dataService.Message().msgWarning(MensajesSolicitud.M12, () => { 
                    this.setFormResponseError();
                });
        });
    }

    handleVerDocumento() {
        if(!this.form.get('idMotivoAccion').value)
        {
            this.dataService.Message().msgWarning(MensajesSolicitud.M13, () => { });
            return;
        }
        if(!this.form.get('documentoInformeEscalafonario').value)
        {
            this.dataService.Message().msgWarning(MensajesSolicitud.M12, () => { });
            return;
        }
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
    /**
    * Métodos Util */
     setFormResponse(item){
        if(!item.documentoInformeEscalafonario)
            {
                this.dataService.Message().msgWarning(MensajesSolicitud.M12, () => { this.setFormResponseError(); });
                return;
            }
        const formatYmd = date => date.toISOString().slice(0, 10);
        
        let familiarDirectoFallecido = null;

        var listMotivoAccion = [7,8];
        var idMotivoAccion = this.form.get("idMotivoAccion").value;
        var re = false;
        if(listMotivoAccion.includes(idMotivoAccion))
        {
            if(this.form.get("tipoSubsidio").value == "FAMILIAR")
                if(item.familiaresDirectosFallecidos.length != 0)
                {
                    familiarDirectoFallecido = item.familiaresDirectosFallecidos[0];
                }else
                {
                    this.dataService.Message().msgWarning(MensajesSolicitud.M17, () => { });
                    return;
                }
        }
        
        this.form.patchValue({ 
            //numeroInformeEscalafonario:"",
            //motivoBeneficio:this.obtenerMotivoInformePorId(this.request.motivoInforme),
            nombreDocumentoInformeEscalafonario:item.nombreDocumentoInformeEscalafonario,
            documentoInformeEscalafonario:item.documentoInformeEscalafonario,
            fechaInformeEscalafonario:item.fechaInformeEscalafonario,
            //fechaBeneficioInformeEscalafonario:formatYmd(new Date()),
            aniosTiempoServicio:item.aniosTiempoServicio,
            aniosUltimoCargo:item.aniosUltimoCargo,
            //numeroInformeCalculo:"",
            conInformeCalculo:false,
            fechaDefuncion: (familiarDirectoFallecido==null)?null:familiarDirectoFallecido.fechaDefuncion,
            idTipoDocumentoIdentidadDefuncion:(familiarDirectoFallecido==null)?null:familiarDirectoFallecido.idTipoDocumentoIdentidad,
            descripcionTipoDocumentoIdentidadDefuncion:(familiarDirectoFallecido==null)?null:familiarDirectoFallecido.descripcionTipoDocumentoIdentidad,
            numeroDocumentoIdentidadDefuncion:(familiarDirectoFallecido==null)?null:familiarDirectoFallecido.numeroDocumentoIdentidad,
            nombresDefuncion:(familiarDirectoFallecido==null)?null:familiarDirectoFallecido.nombres,
            primerApellidoDefuncion:(familiarDirectoFallecido==null)?null:familiarDirectoFallecido.primerApellido,
            segundoApellidoDefuncion:(familiarDirectoFallecido==null)?null:familiarDirectoFallecido.segundoApellido,
            parentescoDefuncion:(familiarDirectoFallecido==null)?null:familiarDirectoFallecido.parentesco,
            codigoParentescoDefuncion:(familiarDirectoFallecido==null)?null:familiarDirectoFallecido.codigoParentesco
            });
    }
    setFormResponseError(){
        this.form.patchValue({ 
            //numeroInformeEscalafonario:"",
            //motivoBeneficio:this.obtenerMotivoInformePorId(this.request.motivoInforme),
            nombreDocumentoInformeEscalafonario:null,
            documentoInformeEscalafonario:null,
            fechaInformeEscalafonario:null,
            //fechaBeneficioInformeEscalafonario:formatYmd(new Date()),
            aniosTiempoServicio:null,
            aniosUltimoCargo:null,
            //numeroInformeCalculo:"",
            conInformeCalculo:false,
            fechaDefuncion: null,
            idTipoDocumentoIdentidadDefuncion:null,
            descripcionTipoDocumentoIdentidadDefuncion:null,
            numeroDocumentoIdentidadDefuncion:null,
            nombresDefuncion:null,
            primerApellidoDefuncion:null,
            segundoApellidoDefuncion:null,
            parentescoDefuncion:null,
            codigoParentescoDefuncion:null,
            });
            console.log('setFormResponseError','set nulls')
    }
}
