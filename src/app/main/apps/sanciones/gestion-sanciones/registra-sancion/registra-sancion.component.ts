import { Component, Inject, OnInit, ViewEncapsulation } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { mineduAnimations } from '@minedu/animations/animations';
import { DataService } from 'app/core/data/data.service';
//import { SancionesService } from 'app/core/data/services/sanciones.service';
import { TipoOperacionEnum } from 'app/core/model/types';
import { ResultadoOperacionEnum } from 'app/main/apps/bandejas/actividades/gestion-pendientes/_utils/constants';
//import { DocumentoSustentoModel, ResolucionModel, ServidorPublicoModel } from 'app/main/apps/sanciones/models/sanciones.model';
//import { SancionModel } from 'app/main/apps/sanciones/models/sanciones.model';
import { SituacionLaboralEnum, TipoDocumentoIdentidadEnum } from 'app/main/apps/licencias/_utils/constants';
import { of } from 'rxjs';
import { catchError, finalize } from 'rxjs/operators';
//import { SancionResponseModel } from '../../models/sanciones.model';
import { EstadoSancionEnum,GrupoAccionEnum } from '../../_utils/constants';
import { FaltaResponseModel,ResolucionRequestModel,SancionModel,SancionResponseModel, DocumentoSustentoModel, ResolucionModel, ServidorPublicoModel } from '../../models/sanciones.model';
import { TablaPermisos } from '../../../../../core/model/types';
import { SecurityModel } from '../../../../../core/model/security/security.model';
import { saveAs } from "file-saver";
@Component({
    selector: 'minedu-registra-sancion',
    templateUrl: './registra-sancion.component.html',
    styleUrls: ['./registra-sancion.component.scss'],
    encapsulation: ViewEncapsulation.None,
    animations: mineduAnimations,
})
export class RegistraSancionComponent implements OnInit {
    dialogTitle:string;
    icon = 'create';
    
    grabado = false;
    working = false;
    form: FormGroup;
    comboLists = {
        listaTipoDocumento: [],
        listaResolucion: [],
        listTiposSustento: [],
        listTiposTipoFormato: []
    };
    currentSession: SecurityModel = new SecurityModel();
    permisos = {
        autorizadoAgregar: false,
        autorizadoModificar: false,
        autorizadoEliminar: false,
        autorizadoEnviar: false,
        autorizadoExportar: false,
        autorizadoConsultar:false
    };
    tiempoMensaje:number=2000; 
    falta: FaltaResponseModel = null;
    resolucionRequest:ResolucionRequestModel=new    ResolucionRequestModel();
    sancion: SancionResponseModel = null;
    documentosSustento: DocumentoSustentoModel[] = [];
    idOperacion: number;
    idDre = 1;
    idUgel = 1;
    servidorPublico: ServidorPublicoModel;
    idServidorPublicoSelected: number;
    idSancion: number;
    idFalta: number;
    formParent:any;
    estadoSancionRegistrado = EstadoSancionEnum.PENDIENTE;
    resolucion: ResolucionModel=new ResolucionModel() ;
    existeResolucion:boolean;
    existePDFResolucion:boolean;
    constructor(
        public matDialogRef: MatDialogRef<RegistraSancionComponent>,
        @Inject(MAT_DIALOG_DATA) private data: any,
        private formBuilder: FormBuilder,
        private dataService: DataService,
    ) {
        this.idOperacion = data.idOperacion;
        this.idFalta=data.idFalta;
        this.formParent=data.parent;
    }

    ngOnInit(): void {
        this.buildForm();
        this.buildSeguridad();        
        this.configurarDatoInicial();
        if (this.idOperacion === TipoOperacionEnum.Modificar) {
             this.getDataSancion(this.idSancion);
        } else {
            this.obtenerDatosFalta(this.idFalta);
        }
    }
    buildForm(): void {
        this.form = this.formBuilder.group({
            codigoResolucion: [null, Validators.required],
            observaciones: [null],
        });
    }
    buildSeguridad = () => {
        this.currentSession= this.dataService.Storage().getInformacionUsuario();
    }

    getDataSancion = (idSancion: number) => {
        this.dataService
            .Sanciones()
            .getSancionById(idSancion)
            .pipe(
                catchError((e) => of(e)),
                finalize(() => {
                    this.dataService.Spinner().hide("sp6");
                    this.working = false;
                })
            )
            .subscribe((response: any) => {
                if (response && response.result) {
                    this.sancion=response.data;
                    this.form.get('codigoResolucion').setValue(this.sancion.codigoResolucion);
                    this.form.get('observaciones').setValue(this.sancion.observaciones);

                    this.buscarResolucion();
                    this.working = false;
                } else if (response && response.statusCode === ResultadoOperacionEnum.NotFound) {
                    this.dataService.Message().msgWarning(response.messages[0], () => { });
                } else if (response && response.statusCode === ResultadoOperacionEnum.UnprocessableEntity) {
                    this.dataService.Message().msgWarning(response.messages[0], () => { });
                } else {
                    this.dataService.Message().msgError('Ocurrieron algunos problemas al obtener información de sancion.', () => { });
                }
            });
    }
    obtenerDatosFalta = (idFalta: number) => {
        this.dataService
            .Sanciones()
            .getFaltaById(idFalta)
            .pipe(
                catchError((e) => of(e)),
                finalize(() => {
                    this.working = false; 
                })
            )
            .subscribe((response: any) => {
                if (response && response.result) {
                    this.falta = response.data;
                    if(this.falta.idFalta>0)this.getDataSancion(this.falta.idFalta);
                } else if (response && response.statusCode === ResultadoOperacionEnum.NotFound) {
                    this.dataService.Message().msgWarning(response.messages[0], () => { });
                } else if (response && response.statusCode === ResultadoOperacionEnum.UnprocessableEntity) {
                    this.dataService.Message().msgWarning(response.messages[0], () => { });
                } else {
                    this.dataService.Message().msgError('Ocurrieron algunos problemas al obtener información de falta.', () => { });
                }

               
            });
    }
    descargarResolucion = () => {
        const data =this.resolucion;
        
        if (data.codigoDocumentoResolucion === null || data.codigoDocumentoResolucion === '') {
            this.dataService.Message().msgWarning('No tiene resolución.', () => { });
            return;
        }        
        this.dataService.Spinner().show("sp6");
        this.dataService.Documento().descargar(data.codigoDocumentoResolucion)
            .pipe(
                catchError((e) => of(null)),
                finalize(() => this.dataService.Spinner().hide("sp6"))
            ).subscribe(response => {
                if (response) {
                    saveAs(response, "documentoresolucion.pdf");
                } else {
                    this.dataService.Message().msgWarning('No se pudo descargar la resolución', () => { });
                }
            });
    }
    handleCancel = () => {
        this.matDialogRef.close({ grabado: this.grabado });
    }
    buscarResolucion = () => {
        this.resolucionRequest.numeroDocumentoIdentidad=this.falta.numeroDocumentoIdentidad;
        this.resolucionRequest.numeroResolucion=this.form.get("codigoResolucion").value;
        this.resolucionRequest.codigoGrupoAccion=GrupoAccionEnum.SANCIONES;
        this.setResolucion(); 
    }
    validarDatos = () => {
        let result = true;
        if (!this.form.valid) {
            this.dataService.Message().msgWarning('Debe ingresar datos obligatorios.', () => { });
            result = false;
        }
        if(!this.existeResolucion){
            this.dataService.Message().msgWarning('No hay Resolución seleccionada. Verifíque número de resolución!', () => { });
            result = false;
        }
        return result;
    }

    prepararData = (row: any, idOperacion: number = TipoOperacionEnum.Registrar) => {
         
        const model: SancionModel = new SancionModel();
        model.idSancion = idOperacion === TipoOperacionEnum.Registrar ? 0 : row.idSancion;
        model.idFalta = this.idFalta;
        model.idServidorPublico =this.falta.idServidorPublico;
        model.idPersona =this.falta.idServidorPublico;
        model.codigoResolucion = row.codigoResolucion;
        model.observaciones = row.observaciones;
        model.codigoAccion=this.resolucion.codigoAccion;
        model.codigoMotivoAccion=this.resolucion.codigoMotivoAccion;
        model.anio=this.resolucion.anio;
        model.meses=this.resolucion.meses;
        model.dias=this.resolucion.dias;
        model.fechaResolucion=this.resolucion.fechaResolucion;
        model.fechaInicio=this.resolucion.fechaInicio;
        model.fechaFin=this.resolucion.fechaFin;
        model.codigoDocumentoResolucion=this.resolucion.codigoDocumentoResolucion;
        model.usuarioCreacion= this.currentSession.numeroDocumento;
        model.usuarioModificacion= this.currentSession.numeroDocumento;

        return model;
    }
    handleSave = (form) => {
        if (!this.validarDatos()) {
            return;
        }
        const sancion = this.prepararData(this.form.getRawValue(), this.idOperacion);
        const resultMessage = 'Operación realizada de forma exitosa.';
        if (this.idOperacion === TipoOperacionEnum.Registrar) {
            this.dataService.Message().msgConfirm('¿Está seguro de que desea guardar la información?', () => {
                this.working = true;
                this.dataService.Spinner().show('sp6');
                this.dataService.Sanciones().crearSancion(sancion).pipe(
                    catchError((e) => of(e)),
                    finalize(() => {
                        this.dataService.Spinner().hide('sp6')
                        this.working = false;
                    })
                ).subscribe(response => {
                    if (response && response.result) {
                        this.dataService.Message().msgAutoCloseSuccessNoButton(resultMessage,this.tiempoMensaje, () => { });
                        this.resetForm();
                        this.grabado = true;
                        this.formParent.buscarFaltas();
                        this.matDialogRef.close({ grabado: this.grabado });
                    } else if (response && response.statusCode === ResultadoOperacionEnum.NotFound) {
                        this.dataService.Message().msgWarning(response.messages[0], () => { });
                    } else if (response && response.statusCode === ResultadoOperacionEnum.UnprocessableEntity) {
                        this.dataService.Message().msgWarning(response.messages[0], () => { });
                    } else {
                        this.dataService.Message().msgError('Ocurrieron algunos problemas al guardar la información.', () => { });
                    }
                });
            }, (error) => { });
         }
        
    }


    limpiarResolucion=()=>{
        this.resolucion=new ResolucionModel();
    }
    resetForm = () => {
        this.form.reset();
    }

    configurarDatoInicial = () => {
        if (this.idOperacion === TipoOperacionEnum.Registrar) {
            this.icon = 'create';
            this.dialogTitle = 'Registrar nueva sanción';
        } else if (this.idOperacion === TipoOperacionEnum.Modificar) {
            this.dialogTitle = 'Modificar sanción';
        }
    }

    setResolucion=( )=>{
        this.existeResolucion=false;
        this.existePDFResolucion=false;
        this.dataService.Spinner().show('sp6');
        // this.dataService.Resolucion().getResoluciones(this.resolucionRequest).pipe(
        //     catchError((e) => of(e)),
        //     finalize(() => { this.dataService.Spinner().hide('sp6') })
        // ).subscribe(response => {
        //     if (response && response.result) {
        //             this.resolucion=response.data[0];
        //             this.existeResolucion=true;
        //             if ( this.resolucion.codigoDocumentoResolucion === null ||  this.resolucion.codigoDocumentoResolucion === '') 
        //                 this.existePDFResolucion=false;
        //             else
        //                  this.existePDFResolucion=true;
                      
                    
        //     } else if (response && response.statusCode === ResultadoOperacionEnum.NotFound) {
        //         this.limpiarResolucion();
        //         this.dataService.Message().msgWarning(response.messages[0], () => { });
        //     } else if (response && response.statusCode === ResultadoOperacionEnum.UnprocessableEntity) {
        //         this.dataService.Message().msgWarning(response.messages[0], () => { });
        //         this.limpiarResolucion();
        //     } else {
        //         this.limpiarResolucion();
        //         this.dataService.Message().msgError('Ocurrieron algunos problemas al consultar la información.', () => { });
        //     }
        // });
                console.log(this.resolucion);
    }
 
     
}
