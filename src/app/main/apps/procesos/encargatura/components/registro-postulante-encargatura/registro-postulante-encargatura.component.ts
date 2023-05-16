import { Component, Input, Inject, OnInit, ViewEncapsulation, ViewChild } from '@angular/core';
import { mineduAnimations } from '../../../../../../../@minedu/animations/animations';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialog } from '@angular/material/dialog';
import { DataService } from '../../../../../../core/data/data.service';
import { catchError, finalize } from 'rxjs/operators';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { RegistroExpedientePostulanteEncargaturaComponent } from '../registro-expediente-postulante-encargatura/registro-expediente-postulante-encargatura.component';
import { RegistroPlazaPostulanteEncargaturaComponent } from '../registro-plaza-postulante-encargatura/registro-plaza-postulante-encargatura.component';
import { ValidaVinculacionVigenteEncargaturaComponent } from '../valida-vinculacion-vigente-encargatura/valida-vinculacion-vigente-encargatura.component';
import { CollectionViewer, DataSource, SelectionModel } from "@angular/cdk/collections";
import { EtapaEnum, TipoDocumentoIdentidadEnum } from '../../_utils/constants';
import { ENCARGATURA_MESSAGE } from '../../_utils/message';
import { SancionServidorPublicoEncargaturaComponent } from '../sancion-servidor-publico-encargatura/sancion-servidor-publico-encargatura.component';
import { SecurityModel } from 'app/core/model/security/security.model';
import { RegistroInformeEscalafonarioPostulanteEncargaturaComponent } from '../registro-informe-escalafonario-postulante-encargatura/registro-informe-escalafonario-postulante-encargatura.component';

@Component({
    selector: "minedu-registro-postulante-encargatura",
    templateUrl: "./registro-postulante-encargatura.component.html",
    styleUrls: ["./registro-postulante-encargatura.component.scss"],
    encapsulation: ViewEncapsulation.None,
    animations: mineduAnimations
})
export class RegistroPostulanteEncargaturaComponent implements OnInit {
    idEtapaProceso: number;
    idDesarrolloProceso: number;
    codigoEtapa: number;
    numeroDocumento:string;
    selectedTipoDoc:number;
    codigoDescripcionMaestroProceso: number;
    idRegimenLaboral: number;
    datosPostulanteEncargatura = {
        idPlazaEncargaturaDetalle: 0,
        titulo: null,
        fechaExpedicionTitulo: null,
        fechaRegistroTitulo: null,
        NumeroInformeEscalafonario:"",
        FechaInformeEscalafonario:"",
        DocumentoInformeEscalafonario:""
    };
    currentSession: SecurityModel = new SecurityModel();
    servidorPublico: any;
    form: FormGroup;
    loading = false;
    cumpleNormaTecnica = false;
    etapaEnum = EtapaEnum;
    selectedTabIndex: number;
    dialogRef: any;
    ShowServidorPublico:boolean=false;
    @ViewChild('registroExpedientePostulante') registroExpedientePostulanteEncargaturaComponent: RegistroExpedientePostulanteEncargaturaComponent;
    @ViewChild('registroPlazaPostulante') registroPlazaPostulanteEncargaturaComponent: RegistroPlazaPostulanteEncargaturaComponent;
    @ViewChild('registroInformeEscalafonario') registroInformeEscalafonarioEncargaturaComponent: RegistroInformeEscalafonarioPostulanteEncargaturaComponent;
    now = new Date();
    comboLists = {
        listTipoDocumento: []
    };
    selection = new SelectionModel<any>(false, []);
    request = {
        codigoEtapa: 0,
        codigoDescripcionMaestroProceso: 0,
        idEtapaProceso: 0,
        idDesarrolloProceso: 0,
        codigoTipoDocumentoIdentidad: -1,
        numeroDocumentoIdentidad: null
    };
    maxLengthnumeroDocumentoIdentidad: number;
    

    constructor(
        public matDialogRef: MatDialogRef<RegistroPostulanteEncargaturaComponent>,
        @Inject(MAT_DIALOG_DATA) private data: any,
        private formBuilder: FormBuilder,
        private dataService: DataService,
        private materialDialog: MatDialog
    ) {
        this.idEtapaProceso = this.data.idEtapaProceso;
        this.idDesarrolloProceso = this.data.idDesarrolloProceso;
        this.codigoEtapa = this.data.codigoEtapa;
        this.codigoDescripcionMaestroProceso = this.data.codigoDescripcionMaestroProceso;
        this.currentSession = this.data.currentSession;
        this.idRegimenLaboral=this.data.idRegimenLaboral;
    }

    ngOnInit(): void {
        this.buildForm();
        this.loadCombos();
        this.selectedTabIndex = 0;
    }

    handleSelectTab(e) {
        this.selectedTabIndex = e.index;
    }

    buildForm() {
        this.form = this.formBuilder.group({
            idTipoDocumento: ["-1", Validators.required],
            numDocumento: [null, Validators.required],
        });
        this.form.get("numDocumento").disable();
    }

    loadCombos() {
        this.loadTipoDocumento();
        this.form.get('idTipoDocumento').setValue("-1");
    }

    loadTipoDocumento() {
        this.dataService.Encargatura().getComboTipoDocumento().pipe(catchError(() => of([])), finalize(() => { })).subscribe((result: any) => {
            if (result) {
                this.comboLists.listTipoDocumento = result.map((x) => ({
                    ...x,
                    value: x.idTipoDocumento,
                    label: x.descripcionTipoDocumento
                }));
            }
        });
    }

    selectTipoDocumento(tipoDocumento: number): void {
        this.form.get("numDocumento").setValue("");
        this.maxLengthnumeroDocumentoIdentidad =
            tipoDocumento === TipoDocumentoIdentidadEnum.DNI ? 8 : 12;
        
        if(tipoDocumento===null || 
           tipoDocumento===undefined || 
           tipoDocumento<=0)this.form.get("numDocumento").disable();
        else this.form.get("numDocumento").enable();

        this.form
            .get("numDocumento")
            .setValidators([
                Validators.minLength(this.maxLengthnumeroDocumentoIdentidad),
                Validators.maxLength(this.maxLengthnumeroDocumentoIdentidad)
            ]);
        this.ShowServidorPublico=false;
        this.validatexto();
    };

    validaNumericos = (event) => {
        if (event.charCode >= 48 && event.charCode <= 57) {
            return true;
        }
        return false;
    };

    validatexto(){
        if(this.maxLengthnumeroDocumentoIdentidad==8){
            if(!Number(this.form.get("numDocumento").value))
            {
                this.form.get("numDocumento").setValue("");
                this.limpiarCampos();
            }
        };
    };

    setRequest() {
        const idEtapaProceso = this.idEtapaProceso;
        const idDesarrolloProceso = this.idDesarrolloProceso;
        const codigoEtapa = this.codigoEtapa;
        const codigoDescripcionMaestroProceso = this.codigoDescripcionMaestroProceso;
        const idTipoDocumento = Number(this.form.get("idTipoDocumento").value);
        const numDocumento = this.form.get("numDocumento").value;

        this.request = {
            codigoEtapa: codigoEtapa,
            codigoDescripcionMaestroProceso: codigoDescripcionMaestroProceso,
            idEtapaProceso: idEtapaProceso,
            idDesarrolloProceso: idDesarrolloProceso,
            codigoTipoDocumentoIdentidad: idTipoDocumento > -1 ? idTipoDocumento : null,
            numeroDocumentoIdentidad: numDocumento
        };
    }

    handleBuscar(): void {
        if(this.form.get("idTipoDocumento").value=="-1"){
            let mensajes='"ELEGIR TIPO DE DOCUMENTO"';
            this.dataService.Message().msgWarning(mensajes, () => { });
            return;
        }
        if(this.form.get("numDocumento").value==""){
            let mensajes='"INGRESAR NÚMERO DE DOCUMENTO"';
            this.dataService.Message().msgWarning(mensajes, () => { });
            return;
        } 

        if (this.form.valid == false) {
            let mensajes="";
            if (this.form.controls.numDocumento.valid == false) {
                let mensajeNumDocumento=(this.form.get("idTipoDocumento").value === TipoDocumentoIdentidadEnum.DNI ? ENCARGATURA_MESSAGE.M34 : ENCARGATURA_MESSAGE.M116);
                mensajes=(mensajes.length==0?mensajes+mensajeNumDocumento:mensajes+", "+mensajeNumDocumento);                
            }            
            this.dataService.Message().msgWarning(mensajes, () => { });
            return;
        }
        this.setRequest();
        this.loading = true;
        this.dataService.Spinner().show('sp6');
        
        this.dataService.Encargatura().loadVinculacionesVigentes(this.request).pipe(catchError((error) => {
            this.dataService.Message().msgWarning('"'+error.error.messages[0].toUpperCase()+'"');
            this.limpiarCampos();
            return of(null);
        }), finalize(() => {
            this.dataService.Spinner().hide("sp6");
            this.loading = false;
        })).subscribe((resultVinculaciones: any) => {
            if (resultVinculaciones !== null) {
                this.loading = true;
                this.dataService.Spinner().show('sp6');
                this.dataService.Encargatura().loadSancionesAdministrativas(this.request).pipe(catchError((error) => {
                    this.dataService.Message().msgWarning('"'+error.error.messages[0].toUpperCase()+'"');
                    this.limpiarCampos();
                    return of(null);
                }), finalize(() => {
                    this.dataService.Spinner().hide("sp6");
                    this.loading = false;
                })).subscribe((resultSanciones: any) => {
                    if (resultSanciones !== null) {
                        if (resultSanciones.length > 0) {
                            this.materialDialog.open(SancionServidorPublicoEncargaturaComponent, {
                                panelClass: 'minedu-sancion-servidor-publico-encargatura',
                                width: '720px',
                                disableClose: true,
                                data: {
                                    listSancionesAdministrativas: resultSanciones,
                                    servidorPublico: resultVinculaciones[0]
                                }
                            });
                            this.limpiarCampos();
                        } else {
                            this.dialogRef = this.materialDialog.open(ValidaVinculacionVigenteEncargaturaComponent, {
                                panelClass: 'minedu-valida-vinculacion-vigente-encargatura',
                                width: '1040px',
                                disableClose: true,
                                data: {
                                    listVinculacionesVigentes: resultVinculaciones,
                                    servidorPublico: resultVinculaciones[0],
                                    codigoEtapa: this.codigoEtapa,
                                    codigoModular:this.currentSession.codigoSede,
                                    idRegimenLaboral:this.idRegimenLaboral
                                }
                            });
                            this.dialogRef.afterClosed().subscribe((result: any) => {
                                debugger
                                if (result.event == 'Select') {
                                    this.ShowServidorPublico=true;
                                    this.servidorPublico = result?.data;
                                    if(this.servidorPublico)this.limpiarTabs();
                                    else this.limpiarCampos();
                                }
                                else this.limpiarCampos();
                            });
                        }
                    }
                });
            }
            else{                
                this.limpiarCampos();
            }
        });
         
    };

    limpiarCampos(): void {
        this.ShowServidorPublico=false;
        this.servidorPublico=null;
        this.limpiarTabs();
        
    };
    
    limpiarTabs(): void {
        this.registroExpedientePostulanteEncargaturaComponent.form.patchValue({
            numeroExpediente: "",
            fechaExpediente: ""
        });
        if (this.codigoEtapa != EtapaEnum.RatificacionCargo)
        {
            this.registroPlazaPostulanteEncargaturaComponent.formPlazaTitulo.patchValue({
                titulo: "",
                fechaExpedicionTitulo:"",
                fechaRegistroTitulo:"",
            });
            this.registroPlazaPostulanteEncargaturaComponent.formPlazaPostular.patchValue({
                codigoPlaza: "",
            });

            this.registroPlazaPostulanteEncargaturaComponent.plazaEncargaturaDetalle=null;

            this.registroInformeEscalafonarioEncargaturaComponent.formInformeEscalafonarioPostular.patchValue({
                numeroInformeEscalafonario:""
            });            
            this.registroInformeEscalafonarioEncargaturaComponent.informe=null;
        }
    };

    handleSave(): void {
        if (this.form.valid == false || this.cumpleNormaTecnica == false) {
            this.dataService.Message().msgWarning(ENCARGATURA_MESSAGE.M08, () => { });
            return;
        }

        if (this.registroExpedientePostulanteEncargaturaComponent.form.valid == false) {
            this.dataService.Message().msgWarning('"DEBE INGRESAR CAMPOS OBLIGATORIOS EN LA PESTAÑA DE DATOS DE POSTULACIÓN."', () => { });
            return;
        }

        const expediente = this.registroExpedientePostulanteEncargaturaComponent.form.getRawValue();

        if (this.codigoEtapa != EtapaEnum.RatificacionCargo
            && (this.registroPlazaPostulanteEncargaturaComponent.formPlazaTitulo.valid == false || 
                this.registroPlazaPostulanteEncargaturaComponent.formPlazaPostular.valid == false) )   
        {
            this.dataService.Message().msgWarning('"DEBE INGRESAR CAMPOS OBLIGATORIOS EN LA PESTAÑA DE PLAZA A POSTULAR."', () => { });
            return;
        }

        if(this.codigoEtapa != EtapaEnum.RatificacionCargo
            && ((this.registroPlazaPostulanteEncargaturaComponent.plazaEncargaturaDetalle || []).length == 0))
        {
            this.dataService.Message().msgWarning('"DEBE BUSCAR UNA PLAZA, EN LA PESTAÑA DE INFORME ESCALAFONARIO."', () => { });
            return;
        }

        if (this.codigoEtapa != EtapaEnum.RatificacionCargo
            && (this.registroInformeEscalafonarioEncargaturaComponent.formInformeEscalafonarioPostular.valid == false) )   
        {
            this.dataService.Message().msgWarning('"DEBE INGRESAR CAMPOS OBLIGATORIOS EN LA PESTAÑA DE INFORME ESCALAFONARIO."', () => { });
            return;
        }

        if (this.codigoEtapa != EtapaEnum.RatificacionCargo 
            && ((this.registroInformeEscalafonarioEncargaturaComponent.informe || []).length == 0)) {
            this.dataService.Message().msgWarning('"NO HAY INFORME ESCALAFONARIO."', () => { });
            return;
        }

        if (this.codigoEtapa != EtapaEnum.RatificacionCargo) {
            const plazaEncargaturaDetalle = this.registroPlazaPostulanteEncargaturaComponent.plazaEncargaturaDetalle;
            const formPlazaTitulo = this.registroPlazaPostulanteEncargaturaComponent.formPlazaTitulo.getRawValue();
            const informeEscalafonario = this.registroInformeEscalafonarioEncargaturaComponent.informe;

            this.datosPostulanteEncargatura = {
                idPlazaEncargaturaDetalle: plazaEncargaturaDetalle.idPlazaEncargaturaDetalle,
                titulo: formPlazaTitulo.titulo,
                fechaExpedicionTitulo: formPlazaTitulo.fechaExpedicionTitulo,
                fechaRegistroTitulo: formPlazaTitulo.fechaRegistroTitulo,
                NumeroInformeEscalafonario:null,
                FechaInformeEscalafonario:null,
                DocumentoInformeEscalafonario:null
            };
            
            if(informeEscalafonario){
                this.datosPostulanteEncargatura.NumeroInformeEscalafonario=informeEscalafonario.numeroInformeEscalafonario;
                this.datosPostulanteEncargatura.FechaInformeEscalafonario=informeEscalafonario.fechaInformeEscalafonario;
                this.datosPostulanteEncargatura.DocumentoInformeEscalafonario=informeEscalafonario.documentoInformeEscalafonario;
            }
        } else {
            this.datosPostulanteEncargatura.idPlazaEncargaturaDetalle = this.servidorPublico.idPlazaEncargaturaDetalle;
        }

        const request = {
            idEtapaProceso: this.idEtapaProceso,
            idDesarrolloProceso: this.idDesarrolloProceso,
            idServidorPublico: this.servidorPublico.idServidorPublico,
            idPersona: this.servidorPublico.idPersona,
            codigoEtapa:this.codigoEtapa,
            cumpleNormaTecnica: this.cumpleNormaTecnica,

            numeroExpediente: expediente.numeroExpediente,
            fechaExpediente: expediente.fechaExpediente,

            titulo: this.datosPostulanteEncargatura.titulo,
            fechaExpedicionTitulo: this.datosPostulanteEncargatura.fechaExpedicionTitulo,
            fechaRegistroTitulo: this.datosPostulanteEncargatura.fechaRegistroTitulo,
            idPlazaEncargaturaDetalle: this.datosPostulanteEncargatura.idPlazaEncargaturaDetalle,

            NumeroInformeEscalafonario: this.datosPostulanteEncargatura.NumeroInformeEscalafonario,
            FechaInformeEscalafonario: this.datosPostulanteEncargatura.FechaInformeEscalafonario,
            DocumentoInformeEscalafonario: this.datosPostulanteEncargatura.DocumentoInformeEscalafonario,
            
            UsuarioCreacion:this.currentSession.nombreUsuario
        };

        this.dataService.Message().msgConfirm(ENCARGATURA_MESSAGE.CONFIRM_GUARDAR_INFORMACION, () => {
            this.loading = true;
            this.dataService.Spinner().show("sp6");
            this.dataService.Encargatura().getRegistrarPostulacionEncargatura(request).pipe(catchError((error) => {
                this.dataService.Message().msgWarning('"'+error.error.messages[0].toUpperCase()+'"');
                return of(null);
            }), finalize(() => {
                this.dataService.Spinner().hide("sp6");
                this.loading = false;
            })).subscribe((result: any) => {
                if (result !== null) {
                    if (result === true) {
                        this.dataService.Message().msgAutoInfo(ENCARGATURA_MESSAGE.M07, 3000,() => { });
                        this.matDialogRef.close();
                    } else {
                        this.dataService.Message().msgError(ENCARGATURA_MESSAGE.OPERACION_ERROR, () => { });
                    }
                }
            });
        }, () => { });
    }

    handleCancel() {
        this.matDialogRef.close();
    }    

    loadCambios(reloadOnlyChild = false) {
    }
}