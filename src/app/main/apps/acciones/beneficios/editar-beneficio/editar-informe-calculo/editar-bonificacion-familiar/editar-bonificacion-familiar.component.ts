import { HttpErrorResponse } from '@angular/common/http';
import { AfterContentInit, Component, ElementRef, Input, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { mineduAnimations } from '@minedu/animations/animations';
import { DataService } from 'app/core/data/data.service';
import { PASSPORT_MESSAGE } from 'app/core/model/messages-error';
import { MISSING_TOKEN } from 'app/core/model/types';
import { of } from 'rxjs';
import { catchError, finalize, tap } from 'rxjs/operators';
import { AgregarBonificacionComponent } from '../../../components/agregar-bonificacion/agregar-bonificacion.component';
import { MensajesSolicitud, TipoFormularioBeneficioEnum } from '../../../_utils/constants';
import { generarFormDataUtil } from '../../../_utils/formDataUtil';
import { EditarBonificacionFamiliarDataSource } from './DataSource/EditarBonificacionFamiliarDataSource';

@Component({
  selector: 'minedu-editar-bonificacion-familiar',
  templateUrl: './editar-bonificacion-familiar.component.html',
  styleUrls: ['./editar-bonificacion-familiar.component.scss'],
  encapsulation: ViewEncapsulation.None,
    animations: mineduAnimations
})
export class EditarBonificacionFamiliarComponent implements OnInit,AfterContentInit { 

    @Input() form:FormGroup;
    disabled:boolean = true;
    dialogRef: any;
    isMobile = false;
    dataSource: EditarBonificacionFamiliarDataSource | null;
     displayedColumns: string[] = [
        'numero',
        'parentesco',
        'tipoDocumento',
        'documento',
        'estadoRENIEC',
        'nombres',
        'fechaNacimiento',
        'fechaVigenciaBonificacion',
        'importeBeneficio',
        // 'acciones',
    ];
    paginatorPageSize = 5;
    paginatorPageIndex = 0;
    @ViewChild('paginator', { static: true }) paginator: MatPaginator;
    @ViewChild('divpaginator') divpaginator: ElementRef;
    firstLoadTable = false;
    listaBeneficiarios = [];
    tipoFallecidoFamiliar = false;
    constructor(
        private materialDialog: MatDialog,
      private formBuilder: FormBuilder,
      private dataService: DataService,
    ) { }
  
  ngOnInit() {
    this.listaBeneficiarios = this.form.get('listaBonificacionFamiliar').value;
    var numero = 1;
    this.listaBeneficiarios.forEach(element => {
        element.numero=numero;
        numero++;
    });
    this.form.patchValue({ 
        periocidad: "Mensual"
    }); 
    this.buildGrid();
    this.loadTable();
    this.form.get("validarGenerarProyecto").valueChanges.subscribe(x => {
        if(x && this.form.get('tipoFormularioBeneficio').value==TipoFormularioBeneficioEnum.BonificacionFamiliar){
            if(this.validarGuardar()){
                this.form.patchValue({ 
                    //listaVacacionesTruncas: this.dataSource.obtenerDataSource(),
                    generarProyecto:true
                });
                
            }
        }
     });
    this.form.get("validarEnviarAccionesGrabadas").valueChanges.subscribe(x => {
        if(x && this.form.get('tipoFormularioBeneficio').value==TipoFormularioBeneficioEnum.BonificacionFamiliar){
           this.EnviarAccionesGrabadas();
        }
     });
     //this.form.get("importeBeneficio").setValidators([Validators.required]);
     this.form.get("guardar").valueChanges.subscribe(x => {
        if(x)
            this.guardar();
     })
     
  }
  ngAfterContentInit() {
    // setTimeout(() => {
         this.paginator.page.pipe(tap(() => this.loadTable())).subscribe();
    // });
}
  buildGrid() {
        
    this.dataSource = new EditarBonificacionFamiliarDataSource(this.dataService, this.paginator);
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
      this.dataSource.load(this.listaBeneficiarios, 1, 5,fistTime);
    }
    else {
      this.dataSource.load(
        this.listaBeneficiarios,
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
    this.dialogRef = this.materialDialog.open(AgregarBonificacionComponent, {
    panelClass: 'agregar-bonificacion-form-dialog',
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
    let newRow = {
        idBeneficiario : 0,
        idParentesco: item.idParentesco,
        parentesco:item.parentescoTexto,
        idEstadoReniec:item.idEstadoReniec,
        estadoReniec:item.estadoRENIEC,
        idTipoDocumentoIdentidad: item.idTipoDocumentoIdentidad,
        tipoDocumentoIdentidad:item.tipoDocumentoIdentidadTexto,
        numeroDocumentoIdentidad:item.numeroDocumentoIdentidad,
        nombres: item.nombres,
        primerApellido: item.primerApellido,
        segundoApellido:item.segundoApellido,
        fechaNacimiento:item.fechaNacimiento,
        fechaBonificacion:item.fechaVigenciaBonificacion,
        importeBeneficio:parseFloat(item.importeBeneficio),
        totalRegistros:this.listaBeneficiarios.length,
        numero:0,
    };
    
    console.log('newRow',newRow);
    this.listaBeneficiarios.push(newRow);
    console.log('listaVacacionesTruncas',this.listaBeneficiarios);
    let numero = 1;
    this.listaBeneficiarios.forEach(element => {
        element.numero=numero;
        numero++;
    });
    this.dataSource.load(
        this.listaBeneficiarios,
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
    
    this.dialogRef = this.materialDialog.open(AgregarBonificacionComponent, {
    panelClass: 'agregar-bonificacion-form-dialog',
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
    
    this.listaBeneficiarios.splice(index,1);
    //this.listaVacacionesTruncas.splice()
    let numero = 1;
    this.listaBeneficiarios.forEach(element => {
        element.numero=numero;
        numero++;
    });
    this.dataSource.load(
        this.listaBeneficiarios,
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
        nombres:item.nombres,
        primerApellido: item.primerApellido,
        segundoApellido:item.segundoApellido,
        fechaNacimiento:item.fechaNacimiento,
        fechaVigenciaBonificacion:item.fechaVigenciaBonificacion,
        importeBeneficio:parseFloat(item.importeBeneficio),
    };
    console.log('handleEditarEnTabla',editrow);
    console.log('listaBeneficiarios',this.listaBeneficiarios);
    
    this.listaBeneficiarios.forEach(element => {
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
            element.fechaNacimiento=item.fechaNacimiento,
            element.fechaVigenciaBonificacion=item.fechaVigenciaBonificacion,
            element.importeBeneficio=item.importeBeneficio,
            element.totalRegistros=this.listaBeneficiarios.length
        }
    });
    
    console.log('listaBeneficiarios cambiado',this.listaBeneficiarios);
    this.dataSource.load(
        this.listaBeneficiarios,
        1,//this.paginator.pageIndex + 1,
        10,//this.paginator.pageSize,
        false
      );
      this.form.patchValue({ 
        listaBeneficiario: this.dataSource.obtenerDataSource()
    });
}
  setListaBeneficiarios = () => {
        
}
  onKeyPress(e: any): boolean {
    const reg = /^\d+$/;
      const pressedKey = String.fromCharCode(!e.charCode ? e.which : e.charCode);
      if (!reg.test(pressedKey)) {
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
tipoFallecidoselect(event){
    var tipoFallecido = event.value;
    if(tipoFallecido==1){
        this.tipoFallecidoFamiliar = true;
        this.divpaginator.nativeElement.style.display='none';
    }else{
        this.tipoFallecidoFamiliar = false;
        this.divpaginator.nativeElement.style.display='block';
        this.loadTable();
    }
}
/**
    * Métodos Integración Back*/
 validarGuardar(){
    if(!this.form.get('motivoBeneficio').value)
        {
            this.dataService.Message().msgAutoCloseWarning(MensajesSolicitud.M33, 3000, () => {

            });
            return false;
        }
    if(!this.form.get('fechaBeneficio').value)
    {
        this.dataService.Message().msgAutoCloseWarning(MensajesSolicitud.M19, 3000, () => {

        });
        return false;
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
                .guardarEditarBeneficioBonificacionFamiliar(
                    generarFormDataUtil(this.form.value)
                )
                .pipe(
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
        this.dataService.Beneficios().guardarEditarBeneficioBonificacionFamiliar(generarFormDataUtil(this.form.value)).pipe(
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
    aniosUltimoCargo:dataForm.aniosUltimoCargo,
    motivoBeneficio:dataForm.motivoBeneficio,

    //Informe cálculo
    //numeroInformeCalculo:dataForm.numeroInformeCalculo,
    fechaBeneficio:dataForm.fechaBeneficio,
    conInformeCalculo:false,//dataForm.conInformeCalculo,
    
    //Bonificación familiar
    periocidad:dataForm.periocidad,
    

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
