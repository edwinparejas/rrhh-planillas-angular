import { HttpErrorResponse } from '@angular/common/http';
import { Component, ElementRef, Input, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { mineduAnimations } from '@minedu/animations/animations';
import { DataService } from 'app/core/data/data.service';
import { PASSPORT_MESSAGE } from 'app/core/model/messages-error';
import { MISSING_TOKEN } from 'app/core/model/types';
import { of } from 'rxjs';
import { catchError, finalize, tap } from 'rxjs/operators';
import { AgregarBeneficiarioComponent } from '../../../components/agregar-beneficiario/agregar-beneficiario.component';
import { MensajesSolicitud, TipoFormularioBeneficioEnum } from '../../../_utils/constants';
import { generarFormDataUtil } from '../../../_utils/formDataUtil';
import { EditarSubsidioTitularDataSource } from './DataSource/EditarSubsidioTitularDataSource';

@Component({
  selector: 'minedu-editar-subsidio-familiar',
  templateUrl: './editar-subsidio-familiar.component.html',
  styleUrls: ['./editar-subsidio-familiar.component.scss'],
  encapsulation: ViewEncapsulation.None,
    animations: mineduAnimations
})
export class EditarSubsidioFamiliarComponent implements OnInit { 

    @Input() form:FormGroup;
    disabled:boolean = true;
    dialogRef: any;
    isMobile = false;
    dataSource: EditarSubsidioTitularDataSource | null;
     displayedColumns: string[] = [
        'numero',
        'parentesco',
        'tipoDocumento',
        'documento',
        'estadoRENIEC',
        'nombres', 
        'importeBeneficio',
        // 'acciones',
    ];
    paginatorPageSize = 5;
    paginatorPageIndex = 0;
    @ViewChild('paginator', { static: true }) paginator: MatPaginator;
    @ViewChild('divpaginator', { static: true }) divpaginator: ElementRef;
    firstLoadTable = false;
    listaBeneficiario = [];
    tipoFallecidoFamiliar = false;
    constructor(
        private materialDialog: MatDialog,
      private formBuilder: FormBuilder,
      private dataService: DataService,
    ) { }
  
  ngOnInit() {
    
    this.listaBeneficiario = this.form.get('listaBeneficiario').value;
    this.tipoFallecidoLoad();
    this.cargarDatos();
    if(this.tipoFallecidoFamiliar){
        this.divpaginator.nativeElement.style.display='none';
        //this.divpaginator.nativeElement.hidden=true;
    }
    this.form.get("validarGenerarProyecto").valueChanges.subscribe(x => {
        if(x && this.form.get('tipoFormularioBeneficio').value==TipoFormularioBeneficioEnum.SubsidioFamiliar){
            if(this.validarGuardar()){
                this.form.patchValue({ 
                    //listaVacacionesTruncas: this.dataSource.obtenerDataSource(),
                    generarProyecto:true
                });
                
            }
        }
     });
    this.form.get("validarEnviarAccionesGrabadas").valueChanges.subscribe(x => {
        if(x && this.form.get('tipoFormularioBeneficio').value==TipoFormularioBeneficioEnum.SubsidioFamiliar){
            this.EnviarAccionesGrabadas();
        }
     });
    
     //this.form.get("importeBeneficio").setValidators([Validators.required]);
     this.form.get("guardar").valueChanges.subscribe(x => {
        if(x)
            this.guardar();
     })
     
  }
  cargarDatos(){
    var tipoFallecido = this.form.get('tipoFallecido').value;
    if(tipoFallecido==1){
        const idMotivoAccion = this.form.get('idMotivoAccion').value;
        var reques = {
            idTipoDocumentoIdentidad:this.form.get('idTipoDocumentoIdentidad').value,
            numeroDocumentoIdentidad:this.form.get('numeroDocumentoIdentidad').value,
            numeroInformeEscalafonario:this.form.get('numeroInformeEscalafonario').value,
            //anio: 0,//no hay input del año
            tipoInforme: this.obtenerTipoInforme(idMotivoAccion),
            motivoInforme: this.obtenerMotivoInforme(idMotivoAccion),
            codigoSede:this.form.get('codigoSede').value,
            codigoTipoSede:this.form.get('codigoTipoSede').value
        }
        this.loadInformeEscalafonario(reques);
    }
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
        case 7:
        case 8:
            re = 30;//OTORGAR SUBSIDIO POR LUTO Y SEPELIO
            break;
        case 16://OTORGAR REMUNERACION VACACIONAL TRUNCA
            re = 29;
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
            re = 11;//INFORME DE OTORGAMIENTO 
            break;
        case 13:
            re = 11;//INFORME DE OTORGAMIENTO 
            break;
        case 7:
        case 8:
            re = 17;//INFORME DE OTORGAR SUBSIDIO POR LUTO - SEPELIO
            break;
        case 16:
            re = 11;//INFORME DE OTORGAMIENTO 
            break;
        default:
            break;
    }
    return re;
  }
  loadInformeEscalafonario(request) {
    this.dataService.Beneficios().getInformeEscalafonario(request).pipe(catchError(() => of([])), finalize(() => { })).subscribe((result: any) => {
        if (result) {
            this.setFormResponse(result);
        }else
            this.dataService.Message().msgWarning(MensajesSolicitud.M12, () => { });
    });
}
setFormResponse(item){
    if(!item.documentoInformeEscalafonario)
        {
            this.dataService.Message().msgWarning(MensajesSolicitud.M12, () => { });
            return;
        }
    const formatYmd = date => date.toISOString().slice(0, 10);
    
    let familiarDirectoFallecido = null;

    var listMotivoAccion = [7,8];
    var idMotivoAccion = this.form.get("idMotivoAccion").value;
    var re = false;
    if(listMotivoAccion.includes(idMotivoAccion))
    {
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
        motivoBeneficio:this.obtenerMotivoInformePorId(this.obtenerMotivoInforme(idMotivoAccion)),
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
  tipoFallecidoLoad(){
    var tipoFallecido = this.form.get('tipoFallecido').value;
    if(tipoFallecido==1){
        this.form.patchValue({ 
            idTipoSubsidio: 1
        }); 
        this.form.get('idTipoSubsidio').setValue(1);
        this.tipoFallecidoFamiliar = true;
        this.buildGrid();
        //this.divpaginator.nativeElement.style.display='none';
    }else{
        this.form.patchValue({ 
            idTipoSubsidio: 2
        }); 
        this.form.get('idTipoSubsidio').setValue(2);
        this.buildGrid();
        this.tipoFallecidoFamiliar = false;
        //this.divpaginator.nativeElement.style.display='block';        
        this.loadTable();
    }
    
    console.log('tipoSubsidio',this.form.get('tipoSubsidio').value)
}
tipoFallecidoselect(event){
    var tipoFallecido = event.value;
    if(tipoFallecido==1){
        this.tipoFallecidoFamiliar = true;
        this.divpaginator.nativeElement.style.display='none';
        this.form.patchValue({ 
            tipoSubsidio:"FAMILIAR",
        }); 
    }else{
        this.tipoFallecidoFamiliar = false;
        this.divpaginator.nativeElement.style.display='block';
        this.loadTable();
        this.form.patchValue({ 
            tipoSubsidio:"TITULAR",
        }); 
    }
    this.setFormResponseError();
    
    console.log('tipoSubsidio',this.form.get('tipoSubsidio').value)
}
  ngAfterContentInit() {
    // setTimeout(() => {
         this.paginator.page.pipe(tap(() => this.loadTable())).subscribe();
    // });
}
  buildGrid() {
        
    this.dataSource = new EditarSubsidioTitularDataSource(this.dataService, this.paginator);
    // this.paginator.showFirstLastButtons = true;
    // this.paginator._intl.itemsPerPageLabel = "Registros por página";
    // this.paginator._intl.nextPageLabel = "Siguiente página";
    // this.paginator._intl.previousPageLabel = "Página anterior";
    // this.paginator._intl.firstPageLabel = "Primera página";
    // this.paginator._intl.lastPageLabel = "Última página";
    // this.paginator._intl.getRangeLabel = (page: number, pageSize: number, length: number) => {
    //     if (length === 0 || pageSize === 0) {return `0 de ${length}`;}
    //     const length2 = Math.max(length, 0);
    //     const startIndex = page * pageSize;
    //     const endIndex = startIndex < length2 ? Math.min(startIndex + pageSize, length2) : startIndex + pageSize;
    //     return `${startIndex + 1} – ${endIndex} de ${length2}`;
    // }
  }

  loadTable = (fistTime: boolean = false) => {
    this.setListaBeneficiarios();
    if (fistTime) {
      this.dataSource.load(this.listaBeneficiario, 1, 5,fistTime);
    }
    else {
      this.dataSource.load(
        this.listaBeneficiario,
        1,//this.paginator.pageIndex + 1,
        10,//this.paginator.pageSize,
        fistTime
      );
    }
  }
  
handleAgregar(event){
    var data= {
        idBeneficiario:0
    };
    event.preventDefault();
    this.dialogRef = this.materialDialog.open(AgregarBeneficiarioComponent, {
    panelClass: 'agregar-beneficiario-form-dialog',
    disableClose: true,
    data: data
    });

    this.dialogRef.afterClosed()
    .subscribe((response: any) => {
        this.handleAgregarEnTabla(response.data);
    });
}
handleAgregarEnTabla(item) {
    console.log('handleAgregarEnTabla',item);
    debugger;
    let newRow = {
        idBeneficiario : 0,
        operacion:1,
        idParentesco: item.idParentesco,
        parentesco:item.parentescoTexto,
        idEstadoReniec:item.idEstadoReniec,
        estadoReniecTexto:item.estadoRENIEC,
        idTipoDocumentoIdentidad: item.idTipoDocumentoIdentidad,
        tipoDocumentoIdentidad:item.tipoDocumentoIdentidadTexto,
        numeroDocumentoIdentidad:item.numeroDocumentoIdentidad,
        nombres: item.nombres +' ' + item.primerApellido +' ' + item.segundoApellido,
        importeBeneficio:parseFloat(item.importeBeneficio),
        totalRegistros:this.listaBeneficiario.length,
        numero:0,
    };
    
    console.log('newRow',newRow);
    this.listaBeneficiario.push(newRow);
    console.log('listaVacacionesTruncas',this.listaBeneficiario);
    let numero = 1;
    this.listaBeneficiario.forEach(element => {
        element.numero=numero;
        numero++;
    });
    this.dataSource.load(
        this.listaBeneficiario,
        1,//this.paginator.pageIndex + 1,
        10,//this.paginator.pageSize,
        false
    );
    this.form.patchValue({ 
        listaBeneficiario: this.dataSource.obtenerDataSource()
    });

}
  handleEditarBeneficiario(row:any){
        
    let datosTabla= row
    datosTabla.idBeneficiario =row.numero;
    
    this.dialogRef = this.materialDialog.open(AgregarBeneficiarioComponent, {
    panelClass: 'agregar-beneficiario-form-dialog',
    disableClose: true,
    data: datosTabla
    });

    this.dialogRef.afterClosed()
    .subscribe((response: any) => {
        this.handleEditarEnTabla(response.data);
    });
}
handleEliminarBeneficiario(row:any,index){
        
    console.log('handleEliminarBeneficiario',row);
    console.log(index);
    
    this.listaBeneficiario.splice(index,1);
    //this.listaVacacionesTruncas.splice()
    let numero = 1;
    this.listaBeneficiario.forEach(element => {
        element.numero=numero;
        numero++;
    });
    this.dataSource.load(
        this.listaBeneficiario,
        1,//this.paginator.pageIndex + 1,
        10,//this.paginator.pageSize,
        false
      );
      this.form.patchValue({ 
        listaBeneficiario: this.dataSource.obtenerDataSource()
    });
}
handleEditarEnTabla(item) {
        
    let editrow = {
        numero: item.idBeneficiario,
        idParentesco : item.idParentesco,
        parentescoTexto: item.parentescoTexto,
        idTipoDocumentoIdentidad:item.idTipoDocumentoIdentidad,
        tipoDocumentoIdentidadTexto:item.tipoDocumentoIdentidadTexto,
        numeroDocumentoIdentidad:item.numeroDocumentoIdentidad,
        idEstadoReniec:item.idEstadoReniec,
        estadoReniecTexto:item.estadoRENIEC,
        idPersona:item.idPersona,        
        nombres: item.nombres +' ' + item.primerApellido +' ' + item.segundoApellido,
        primerApellido: item.primerApellido,
        segundoApellido:item.segundoApellido,
        importeBeneficio:parseFloat(item.importeBeneficio),
    };
    console.log('handleEditarEnTabla',editrow);
    console.log('listaBeneficiarios',this.listaBeneficiario);
    
    this.listaBeneficiario.forEach(element => {
        if(element.numero == editrow.numero){
            
            console.log('cambiando',editrow.numero);
            //element = newRow;
            element.idParentesco = item.idParentesco,
            element.parentescoTexto= item.parentescoTexto,
            element.idTipoDocumentoIdentidad=item.idTipoDocumentoIdentidad,
            element.tipoDocumentoIdentidadTexto=item.tipoDocumentoIdentidadTexto,
            element.numeroDocumentoIdentidad=item.numeroDocumentoIdentidad,
            element.idEstadoReniec=item.idEstadoReniec,
            element.idPersona=item.idPersona,
            element.nombres=item.nombres,
            element.primerApellido= item.primerApellido,
            element.segundoApellido=item.segundoApellido,
            element.importeBeneficio=item.importeBeneficio,
            element.totalRegistros=this.listaBeneficiario.length
        }
    });
    
    console.log('listaBeneficiarios cambiado',this.listaBeneficiario);
    this.dataSource.load(
        this.listaBeneficiario,
        1,//this.paginator.pageIndex + 1,
        10,//this.paginator.pageSize,
        false
      );
      this.form.patchValue({ 
        listaBeneficiario: this.dataSource.obtenerDataSource()
    });
}
  setListaBeneficiarios = () => {
    let numero = 1;
    this.listaBeneficiario.forEach(element => {
        element.numero=numero;
        numero++;
    });
}
  onKeyPress(e: any): boolean {
    
    var inp = String.fromCharCode(e.keyCode);
    if (/[a-zA-Z0-9]|[-]|[\/]|[\\]|[ ]/.test(inp)) {
    return true;
    } else {
    e.preventDefault();
    return false;
    }
}
onKeyPressImporteBeneficio(e: any): boolean {
    const reg = /[0-9]|[.]/;
    const pressedKey = String.fromCharCode(!e.charCode ? e.which : e.charCode);
    if (!reg.test(pressedKey)) {
    e.preventDefault();
    return false;
    }  
}
onKeyPressnumeroInformeCalculo(e: any): boolean {
    var inp = String.fromCharCode(e.keyCode);
      if (/[a-zA-Z0-9]/.test(inp)) {
        return true;
      } else {
        e.preventDefault();
        return false;
      }
  }
  handleBuscarInformeCalculo(){
    
}
selectConInformeCalculo(){
    
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
/**
    * Métodos Integración Back*/
 validarGuardar(){
    if(!this.form.get('fechaBeneficio').value)
    {
        this.dataService.Message().msgAutoCloseWarning(MensajesSolicitud.M19, 3000, () => {

        });
        return false;
    }
    if(!this.form.get('actaDefuncion').value)
    {
        this.dataService.Message().msgAutoCloseWarning(MensajesSolicitud.M30, 3000, () => {

        });
        return false;
    }
    if(this.tipoFallecidoFamiliar){
        if(!this.form.get('importeBeneficio').value)
        {
            this.dataService.Message().msgAutoCloseWarning(MensajesSolicitud.M27, 3000, () => {

            });
            return false;
        }
    }else{
        if(this.dataSource.obtenerDataSource().length==0)
        {
            this.dataService.Message().msgAutoCloseWarning(MensajesSolicitud.M29, 3000, () => {

            });
            return false;
        }
    }
    return true;
 }
 EnviarAccionesGrabadas =()=>{
    if(!this.validarGuardar())
        return;        
    this.form.patchValue({ 
        //listaVacacionesTruncas: this.dataSource.obtenerDataSource(),
        accionesGrabadas:true
    });
    let mensajeEnviar = "LA ACCION POR SENTENCIA JUDICIAL REQUIERE DE AUTORIZACION PARA GENERAR EL PROYECTO DE RESOLUCION ¿ESTÁ SEGURO DE QUE DESEA SOLICITAR AUTORIZACION PARA LA ACCION POR SENTENCIA JUDICIAL?";
        if(!this.form.get('mandatoJudicial').value){
            mensajeEnviar ="¿ESTÁ SEGURO QUE DESEA ENVIAR A ACCIONES GRABADAS?"; 
        }
        this.dataService.Message().msgConfirm(
            mensajeEnviar,
            () => {
            this.dataService.Spinner().show("sp6");
            this.dataService
                .Beneficios()
                .guardarEditarBeneficioSubsidioFamiliar(
                    generarFormDataUtil(this.form.value)
                ).pipe(
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
        },
        () => {}
    );
}
 guardar(){
    if(!this.validarGuardar())
        return;
    
    console.log('guardando');
    this.dataService.Message().msgConfirm('¿ESTÁ SEGURO QUE DESEA GUARDAR LA INFORMACIÓN?', () => {
        
        //this.dataService.Spinner().show("sp6");
        this.dataService.Beneficios().guardarEditarBeneficioSubsidioFamiliar(generarFormDataUtil(this.form.value)).pipe(
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

 /**
    * Métodos Util */
  getData() {
    const usuario = this.dataService.Storage().getPassportUserData();
    const formatYmd = date => date.toISOString().slice(0, 10);
    let dataForm = this.form.value;
    console.log('dataForm',dataForm)
    let data = {
    //Rol
    codigoRol :dataForm.codigoRol,
    codigoSede:dataForm.codigoSede,
    codigoTipoSede:dataForm.codigoTipoSede,
    //Acción Personal
    mandatoJudicial: dataForm.mandatoJudicial,
    idRegimenLaboral: dataForm.idRegimenLaboral,
    idAccion:dataForm.idAccion,
    idMotivoAccion:dataForm.idMotivoAccion,

    //Servidor Público
    idTipoDocumentoIdentidad:dataForm.idTipoDocumentoIdentidad,
    numeroDocumentoIdentidad:dataForm.numeroDocumentoIdentidad,
    idPersona:dataForm.idPersona,
    idServidorPublico:dataForm.idServidorPublico,
    codigoServidorPublico:dataForm.codigoServidorPublico,
    idNivelInstancia:dataForm.idNivelInstancia,
    idCentroTrabajo:dataForm.idCentroTrabajo,
    idSituacionLaboral:dataForm.idSituacionLaboral,
    idCondicionLaboral:dataForm.idCondicionLaboral,
    fechaInicioVinculacion:dataForm.fechaInicioVinculacion,
    fechaFinVinculacion:dataForm.fechaFinVinculacion,
    codigoPlaza:dataForm.codigoPlaza,
    idCategoriaRemunerativa:dataForm.idCategoriaRemunerativa,
    //Informe escalafonario
    numeroInformeEscalafonario:dataForm.numeroInformeEscalafonario,
    nombreDocumentoInformeEscalafonario :dataForm.nombreDocumentoInformeEscalafonario,
    documentoInformeEscalafonario:dataForm.documentoInformeEscalafonario,
    fechaInformeEscalafonario:dataForm.fechaInformeEscalafonario,
    fechaBeneficioInformeEscalafonario:dataForm.fechaBeneficioInformeEscalafonario,
    aniosTiempoServicio:dataForm.aniosTiempoServicio,
    aniosUltimoCargo:dataForm.aniosTiempoServicio,
    motivoBeneficio:dataForm.motivoBeneficio,

    //Informe cálculo
    //numeroInformeCalculo:dataForm.numeroInformeCalculo,
    fechaBeneficio:dataForm.fechaBeneficio,
    conInformeCalculo:false,//dataForm.conInformeCalculo,
    importeBeneficio:parseFloat(dataForm.importeBeneficio),
    //Subsidio
    idTipoSubsidio:dataForm.idTipoSubsidio,
    tipoSubsidio:dataForm.idTipoSubsidio==1?"FAMILIAR":"TITULAR",
    fechaDefuncion:dataForm.fechaDefuncion,
    idTipoDocumentoIdentidadDefuncion:dataForm.idTipoDocumentoIdentidadDefuncion,
    numeroDocumentoIdentidadDefuncion:dataForm.numeroDocumentoIdentidadDefuncion,
    codigoParentescoDefuncion:dataForm.codigoParentescoDefuncion,
    actaDefuncion:dataForm.actaDefuncion,
    

    listaBeneficiario:this.dataSource.obtenerDataSource(),
    //Anotacioens
    anotaciones:dataForm.anotaciones,

    //Auditoria
    fechaCreacion: new Date(),
    usuarioCreacion: usuario.NOMBRES_USUARIO+" "+usuario.APELLIDO_PATERNO+" "+usuario.APELLIDO_MATERNO,
    ipCreacion: "",
    }

    return data;
  }
}
