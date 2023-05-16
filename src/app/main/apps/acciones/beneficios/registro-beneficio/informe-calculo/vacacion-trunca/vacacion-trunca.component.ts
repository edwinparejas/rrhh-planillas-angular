import { HttpErrorResponse } from '@angular/common/http';
import { Component, Input, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { mineduAnimations } from '@minedu/animations/animations';
import { DataService } from 'app/core/data/data.service';
import { PASSPORT_MESSAGE } from 'app/core/model/messages-error';
import { MISSING_TOKEN } from 'app/core/model/types';
import { Console } from 'console';
import { of } from 'rxjs';
import { catchError, finalize } from 'rxjs/operators';
import { AgregarVacacionesComponent } from '../../../components/agregar-vacaciones/agregar-vacaciones.component';
import { MensajesSolicitud, TipoFormularioBeneficioEnum } from '../../../_utils/constants';
import { generarFormDataUtil } from '../../../_utils/formDataUtil';
import { VacacionesTruncasDataSource } from './DataSource/VacacionesTruncasDataSource';

@Component({
  selector: 'minedu-vacacion-trunca',
  templateUrl: './vacacion-trunca.component.html',
  styleUrls: ['./vacacion-trunca.component.scss'],
  encapsulation: ViewEncapsulation.None,
    animations: mineduAnimations
})
export class VacacionTruncaComponent implements OnInit {

    @Input() form:FormGroup;
    isMobile = false;
    dialogRef: any;
    constructor(
      private materialDialog: MatDialog,
      private formBuilder: FormBuilder,
      private dataService: DataService,
    ) { }

    ngOnInit() {
        this.form.get("guardar").valueChanges.subscribe(x => {
            if(x)
                this.guardar();
         });
         this.form.get("validarGenerarProyecto").valueChanges.subscribe(x => {
            if(x && this.form.get('tipoFormularioBeneficio').value==TipoFormularioBeneficioEnum.VacacionesTruncas){
                if(this.validarGuardar()){
                    this.form.patchValue({ 
                        //listaVacacionesTruncas: this.dataSource.obtenerDataSource(),
                        generarProyecto:true
                    });
                    
                }
            }
         });
         this.form.get("validarEnviarAccionesGrabadas").valueChanges.subscribe(x => {
            if(x && this.form.get('tipoFormularioBeneficio').value==TipoFormularioBeneficioEnum.VacacionesTruncas){
                this.EnviarAccionesGrabadas();
            }
         });
        this.buildGrid();
        this.loadTable();
    }

    /**
    * Seccion informe*/
    
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
    onKeyPressBaseCalculo(e: any): boolean {
        const reg = /[0-9]?[0-9]?(\.[0-9][0-9]?)?/;
        const pressedKey = String.fromCharCode(!e.charCode ? e.which : e.charCode);
        if (!reg.test(pressedKey)) {
        e.preventDefault();
        return false;
        }  
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
                    .guardarBeneficioVacacionesTruncas(
                        generarFormDataUtil(this.form.value)
                    )
                    .pipe(catchError((error) => {
                        debugger
                        this.dataService.Message().msgWarning('"'+error.messages[0].toUpperCase()+'"');
                        return of(null);
                    }), finalize(() => {
                        this.dataService.Spinner().hide("sp6");
                    })).subscribe((response) => {
                        debugger
                        if (response) {
                                this.dataService
                                    .Util()
                                    .msgAutoCloseSuccess(
                                        "OPERACIÓN REALIZADA DE FORMA EXITOSA",
                                        2000,
                                        () => {
                                            this.form.patchValue({ 
                                                retornar: true
                                            }); 
                                        }
                                    );
                                //@aqui retornamos el response, para ver si en la vista de lista, lo recibe
                                return response;
                        } else if (
                            response &&
                            (response.statusCode === 422 ||
                                response.statusCode === 404)
                        ) {
                            this.dataService.Message().msgWarning('"'+response.messages[0]+'"', () => {});
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
                        // else {
                        //     this.dataService
                        //         .Util()
                        //         .msgError(
                        //             "OCURRIERON ALGUNOS PROBLEMAS AL GUARDAR LOS DOCUMENTOS DE SUSTENTO, POR FAVOR INTENTE DENTRO DE UNOS SEGUNDOS, GRACIAS.",
                        //             () => {}
                        //         );
                        // }
                    });
            },
            () => {}
        );
    }
    validarGuardar(){
        
        if(!this.form.get('fechaBeneficio').value)
        {
            this.dataService.Message().msgAutoCloseWarning(MensajesSolicitud.M19, 3000, () => {

            });
            return false;
        }
        console.log('listaVacacionesTruncas',this.dataSource.obtenerDataSource());
        if(this.dataSource.obtenerDataSource().length==0)
        {
            this.dataService.Message().msgAutoCloseWarning(MensajesSolicitud.M28, 3000, () => {

            });
            return false;
        }
        return true;
    }
     guardar(){
        console.log('guardando');
        if(!this.validarGuardar())
            return;
        
        this.dataService.Message().msgConfirm('¿ESTÁ SEGURO QUE DESEA GUARDAR LA INFORMACIÓN?', () => {
            //this.dataService.Spinner().show("sp6");
            
            this.dataService.Beneficios().guardarBeneficioVacacionesTruncas(generarFormDataUtil(this.form.value)).pipe(
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
     generarObjetoProyectoResolucion() {
        
        let data = this.form.value;
        data.accionesGrabadas = false;
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
      

    /**
    *Seccion vacaciones truncas*/
     dataSource: VacacionesTruncasDataSource | null;
     displayedColumns: string[] = [
        'numero',
        'mesInicioVacacionesTruncas',
        'mesFinVacacionesTruncas',
        'anioVacacionesTruncas',
        'cantidadMeses',
        'importeRemuneracionMensual',
        'importeBeneficio',
        'acciones',
    ];
    paginatorPageSize = 5;
    paginatorPageIndex = 0;
    @ViewChild('paginator', { static: true }) 
    paginator: MatPaginator;

    listaVacacionesTruncas = [];
    
      mesDefault =0;
     buildGrid() {
        
        this.dataSource = new VacacionesTruncasDataSource(this.dataService, this.paginator);
        this.paginator.showFirstLastButtons = true;
        this.paginator._intl.itemsPerPageLabel = "Registros por página";
        this.paginator._intl.nextPageLabel = "Siguiente página";
        this.paginator._intl.previousPageLabel = "Página anterior";
        this.paginator._intl.firstPageLabel = "Primera página";
        this.paginator._intl.lastPageLabel = "Última página";
        this.paginator._intl.getRangeLabel = (page: number, pageSize: number, length: number) => {
            if (length === 0 || pageSize === 0) {return `0 de ${length}`;}
            const length2 = Math.max(length, 0);
            const startIndex = page * pageSize;
            const endIndex = startIndex < length2 ? Math.min(startIndex + pageSize, length2) : startIndex + pageSize;
            return `${startIndex + 1} – ${endIndex} de ${length2}`;
        }
      }

      loadTable = (fistTime: boolean = false) => {
        this.setListaVacacionesTruncas();
        if (fistTime) {
          this.dataSource.load(this.listaVacacionesTruncas, 1, 10,fistTime);
        }
        else {
          this.dataSource.load(
            this.listaVacacionesTruncas,
            1,//this.paginator.pageIndex + 1,
            10,//this.paginator.pageSize,
            fistTime
          );
        }
      }
      setListaVacacionesTruncas = () => {
        
    }
    getValueOrNullFromCero(value){
        return value==0?null:value;
    }
    getValueOrNullFromEmpy(value){
        return value==''?null:value;
    }
    onKeyPressAnio(e: any): boolean {
        const reg = /^\d+$/;
        const pressedKey = String.fromCharCode(!e.charCode ? e.which : e.charCode);
        if (!reg.test(pressedKey)) {
          e.preventDefault();
          return false;
        } 
    }
    onKeyPresscantidadMeses(e: any): boolean {
        const reg = /^\d+$/;
        const pressedKey = String.fromCharCode(!e.charCode ? e.which : e.charCode);
        if (!reg.test(pressedKey)) {
          e.preventDefault();
          return false;
        } 
    }
    onKeyPressDecimal(e: any): boolean {
        const reg = /[0-9]|[.]/;
        const pressedKey = String.fromCharCode(!e.charCode ? e.which : e.charCode);
        if (!reg.test(pressedKey)) {
        e.preventDefault();
        return false;
        }  
    }
    handleAgregar(event){
        var datosVacacion= {
            idDetalleVacaciones:0,
            numero:0
        };
        event.preventDefault();
        this.dialogRef = this.materialDialog.open(AgregarVacacionesComponent, {
        panelClass: 'agregar-vacaciones-form-dialog',
        disableClose: true,
        data: datosVacacion
        });

        this.dialogRef.afterClosed()
        .subscribe((response: any) => {
            this.handleAgregarEnTabla(response.data);
        });
    }
    handleAgregarEnTabla(item) {
        console.log('handleAgregarEnTabla',item);
        let newRow = {
            idDetalleVacaciones : 0,
            mesInicioVacacionesTruncas: item.mesInicioVacacionesTruncas,
            mesInicioTexto:item.mesInicioTexto,
            mesFinVacacionesTruncas:item.mesFinVacacionesTruncas,
            mesFinTexto:item.mesFinTexto,
            anioVacacionesTruncas:''+item.anioVacacionesTruncas,
            cantidadMeses: item.cantidadMeses,
            importeRemuneracionMensual:item.importeRemuneracionMensual,
            importeBeneficio: item.importeBeneficio,
            totalRegistros:this.listaVacacionesTruncas.length+1,
            numero:0,
        };
        console.log('newRow',newRow);
        this.listaVacacionesTruncas.push(newRow);
        console.log('listaVacacionesTruncas',this.listaVacacionesTruncas);
        let numero = 1;
        this.listaVacacionesTruncas.forEach(element => {
            element.idDetalleVacaciones = numero;
            element.numero=numero;
            numero++;
        });
        this.dataSource.load(
            this.listaVacacionesTruncas,
            1,//this.paginator.pageIndex + 1,
            10,//this.paginator.pageSize,
            false
          );
        this.form.patchValue({ 
            listaVacacionesTruncas: this.dataSource.obtenerDataSource()
        });
    }
    handleSeleccionFechaInicio(mes,row:any){
        console.log('handleSeleccionFechaInicio',mes);
        console.log('handleSeleccionFechaInicio',row);
        row.mesInicio = mes;
        row.mesInicioTexto = this.getMest(mes);
    }
    handleSeleccionFechaFin(mes,row:any){
        console.log('handleSeleccionFechaInicio',mes);
        console.log('handleSeleccionFechaInicio',row);
        row.mesFin = mes;
        row.mesFinTexto = this.getMest(mes);
    }
    getMest(numero){
        var Meses= ['ENERO','FEBRERO','MARZO','ABRIL','MAYO','JUNIO','JULION','AGOSTO','SETIEMBRE','OCTUBRE','NOVIEMBRE','DICIEMBRE']
        return Meses[numero-1]
    }
    handlerChangeMeses(e: any, id: number) {
    }
    handleEditarVacacionTrunca(row:any){
        
        let datosVacacion= row
        datosVacacion.idDetalleVacaciones=row.idDetalleVacaciones;
        datosVacacion.numero=row.numero;
        this.dialogRef = this.materialDialog.open(AgregarVacacionesComponent, {
        panelClass: 'agregar-vacaciones-form-dialog',
        disableClose: true,
        data: datosVacacion
        });

        this.dialogRef.afterClosed()
        .subscribe((response: any) => {
            this.handleEditarEnTabla(response.data);
        });
    }
    handleEditarEnTabla(item) {
        
        let editrow = {
            mesInicioVacacionesTruncas: item.mesInicioVacacionesTruncas,
            mesInicioTexto:item.mesInicioTexto,
            mesFinVacacionesTruncas:item.mesFinVacacionesTruncas,
            mesFinTexto:item.mesFinTexto,
            anioVacacionesTruncas:item.anioVacacionesTruncas,
            cantidadMeses: item.cantidadMeses,
            importeRemuneracionMensual:item.importeRemuneracionMensual,
            importeBeneficio: item.importeBeneficio,
            totalRegistros:this.listaVacacionesTruncas.length,
            idDetalleVacaciones:item.idDetalleVacaciones,
            numero:item.numero,
        };
        console.log('handleEditarEnTabla',editrow);
        console.log('listaVacacionesTruncas',this.listaVacacionesTruncas);
        
        this.listaVacacionesTruncas.forEach(element => {
            if(element.numero == editrow.numero){
                
                console.log('cambiando',editrow.numero);
                //element = newRow;
                element.mesInicioVacacionesTruncas= editrow.mesInicioVacacionesTruncas,
                element.mesInicioTexto=editrow.mesInicioTexto,
                element.mesFinVacacionesTruncas=editrow.mesFinVacacionesTruncas,
                element.mesFinTexto=editrow.mesFinTexto,
                element.anioVacacionesTruncas=editrow.anioVacacionesTruncas,
                element.cantidadMeses= editrow.cantidadMeses,
                element.importeRemuneracionMensual=editrow.importeRemuneracionMensual,
                element.importeBeneficio= editrow.importeBeneficio,
                element.totalRegistros=this.listaVacacionesTruncas.length
            }
        });
        
        console.log('listaVacacionesTruncas cambiado',this.listaVacacionesTruncas);
        this.dataSource.load(
            this.listaVacacionesTruncas,
            1,//this.paginator.pageIndex + 1,
            10,//this.paginator.pageSize,
            false
          );
        this.form.patchValue({ 
            listaVacacionesTruncas: this.dataSource.obtenerDataSource()
        });
    }
    handleEliminarVacacionTrunca(row:any,index){
        
        console.log('handleEliminarVacacionTrunca',row);
        console.log(index);
        
        this.listaVacacionesTruncas.splice(index,1);
        //this.listaVacacionesTruncas.splice()
        let numero = 1;
        this.listaVacacionesTruncas.forEach(element => {
            element.idDetalleVacaciones = numero;
            element.numero=numero;
            numero++;
        });
        this.dataSource.load(
            this.listaVacacionesTruncas,
            1,//this.paginator.pageIndex + 1,
            10,//this.paginator.pageSize,
            false
          );
        this.form.patchValue({ 
            listaVacacionesTruncas: this.dataSource.obtenerDataSource()
        });
    }
    handleGuardarVacacionTrunca(row:any){
        console.log('handleGuardarVacacionTrunca',row);
        row.edit = false;
    }

    getData() {
        
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
        numeroInformeCalculo:dataForm.numeroInformeCalculo,
        fechaBeneficio:dataForm.fechaBeneficio,
        conInformeCalculo:dataForm.conInformeCalculo,

        listaVacacionesTruncas: this.dataSource.obtenerDataSource(),

        //Anotacioens
        anotaciones:dataForm.anotaciones,
        }

        return data;
      }
}
