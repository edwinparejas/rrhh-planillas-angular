import { Component, Inject, OnInit, ViewEncapsulation, ViewChild } from '@angular/core';
import { mineduAnimations } from '../../../../../../../@minedu/animations/animations';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialog } from '@angular/material/dialog';
import { DataService } from '../../../../../../core/data/data.service';
import { RegistroExpedientePostulanteEncargaturaComponent } from '../registro-expediente-postulante-encargatura/registro-expediente-postulante-encargatura.component';
import { catchError, finalize } from 'rxjs/operators';
import { of } from 'rxjs';
import { EtapaEnum } from '../../_utils/constants';
import { ENCARGATURA_MESSAGE } from '../../_utils/message';
import { SecurityModel } from 'app/core/model/security/security.model';
import { DocumentViewerComponent } from 'app/main/apps/components/document-viewer/document-viewer.component';
import { RegistroInformeEscalafonarioPostulanteEncargaturaComponent } from '../registro-informe-escalafonario-postulante-encargatura/registro-informe-escalafonario-postulante-encargatura.component';
import { RegistroPlazaPostulanteEncargaturaComponent } from '../registro-plaza-postulante-encargatura/registro-plaza-postulante-encargatura.component';

@Component({
    selector: "minedu-modificar-postulante-encargatura",
    templateUrl: "./modificar-postulante-encargatura.component.html",
    styleUrls: ["./modificar-postulante-encargatura.component.scss"],
    encapsulation: ViewEncapsulation.None,
    animations: mineduAnimations
})
export class ModificarPostulanteEncargaturaComponent implements OnInit {
    idEtapaProceso: number;
    idDesarrolloProceso: number;
    idPostulacion: number;
    idPlazaEncargaturaDetalle: number;
    selectedTipoDoc: number;
    numeroDocumento:string;
    codigoEtapa: number;
    datosPostulanteEncargatura = {
        idPlazaEncargaturaDetalle: 0,
        titulo: null,
        fechaExpedicionTitulo: null,
        fechaRegistroTitulo: null,
        NumeroInformeEscalafonario:"",
        FechaInformeEscalafonario:"",
        DocumentoInformeEscalafonario:""
    };
    plazaEncargaturaDetalle: any;
    informe: any;
    etapaEnum = EtapaEnum;
    loading = false;
    dialogRefPreview: any;
    currentSession: SecurityModel = new SecurityModel();
    @ViewChild('registroExpedientePostulante') registroExpedientePostulanteEncargaturaComponent: RegistroExpedientePostulanteEncargaturaComponent;
    @ViewChild('registroPlazaPostulante') registroPlazaPostulanteEncargaturaComponent: RegistroPlazaPostulanteEncargaturaComponent;
    @ViewChild('registroInformeEscalafonario') registroInformeEscalafonarioEncargaturaComponent: RegistroInformeEscalafonarioPostulanteEncargaturaComponent;

    constructor(
        public dialogRef: MatDialogRef<ModificarPostulanteEncargaturaComponent>,
        @Inject(MAT_DIALOG_DATA) private data: any,
        private dataService: DataService,
        private materialDialog: MatDialog
    ) {        
        this.idEtapaProceso = this.data.idEtapaProceso;
        this.idDesarrolloProceso = this.data.idDesarrolloProceso;
        this.idPostulacion = this.data.idPostulacion;
        this.idPlazaEncargaturaDetalle = this.data.idPlazaEncargaturaDetalle;
        this.codigoEtapa = this.data.codigoEtapa;
        this.currentSession=this.data.currentSession;
    }

    ngOnInit(): void {
        this.loadPostulante();
        if (this.codigoEtapa != EtapaEnum.RatificacionCargo) {
            this.loadPlazaEncargatura();            
            this.loadInforme();
        }
    }

    loadPostulante() {
        this.dataService.Encargatura().getDatosPostulanteEncargatura(this.idPostulacion).pipe(catchError(() => of([])), finalize(() => { })).subscribe((result: any) => {
            if (result) {
                this.registroExpedientePostulanteEncargaturaComponent.form.patchValue({
                    numeroExpediente: result.numeroExpediente,
                    fechaExpediente: result.fechaExpediente
                });
            }
        });
    }

    loadPlazaEncargatura() {
        this.dataService.Encargatura().getDatosPostulanteEncargatura(this.idPostulacion).pipe(catchError(() => of([])), finalize(() => { })).subscribe((result: any) => {
            if (result) {
                this.registroPlazaPostulanteEncargaturaComponent.formPlazaTitulo.patchValue({
                    titulo: result.titulo,
                    fechaExpedicionTitulo:result.fechaExpedicionTitulo ,
                    fechaRegistroTitulo:result.fechaRegistroTitulo 
                });
            }
        });

        this.dataService.Encargatura().getPlazaEncargaturaDetalle(this.idPlazaEncargaturaDetalle).pipe(catchError(() => of([])), finalize(() => {})).subscribe((result: any) => {
            if (result) {
                this.registroPlazaPostulanteEncargaturaComponent.formPlazaPostular.patchValue({
                    codigoPlaza: result.codigoPlaza
                });

                this.registroPlazaPostulanteEncargaturaComponent.handleBuscar();
            }
        });
    }

    loadInforme() { 
        const data={
            idPostulacion:this.idPostulacion
        }
        this.dataService.Encargatura().getInformePostulante(data).pipe(catchError(() => of([])), finalize(() => { })).subscribe((result: any) => {
            if (result) {
                this.selectedTipoDoc = result.idTipoDocumentoIdentidad;
                this.numeroDocumento = result.numeroDocumentoIdentidad;
                this.registroInformeEscalafonarioEncargaturaComponent.idTipoDocumento = result.idTipoDocumentoIdentidad;
                this.registroInformeEscalafonarioEncargaturaComponent.numeroDocumentoIdentidad = result.numeroDocumentoIdentidad;

                this.registroInformeEscalafonarioEncargaturaComponent.formInformeEscalafonarioPostular.patchValue({
                    numeroInformeEscalafonario: result.numeroInformeEscalafonario
                });
                this.registroInformeEscalafonarioEncargaturaComponent.handleBuscar();
            }
        });
    }

    handleSave() {
        if (this.registroExpedientePostulanteEncargaturaComponent.form.valid == false) {
            this.dataService.Message().msgWarning('"DEBE INGRESAR CAMPOS OBLIGATORIOS EN LA PESTAÑA DE EXPEDIENTE."', () => { });
            return;
        }

        const expediente = this.registroExpedientePostulanteEncargaturaComponent.form.getRawValue();

        if (this.codigoEtapa != EtapaEnum.RatificacionCargo
            && (this.registroPlazaPostulanteEncargaturaComponent.formPlazaTitulo.valid == false || 
                this.registroPlazaPostulanteEncargaturaComponent.formPlazaPostular.valid == false)) 
        {
            this.dataService.Message().msgWarning('"DEBE INGRESAR CAMPOS OBLIGATORIOS EN LA PESTAÑA DE PLAZA A POSTULAR."', () => { });
            return;
        }        

        if(this.codigoEtapa != EtapaEnum.RatificacionCargo
            && ((this.registroPlazaPostulanteEncargaturaComponent.plazaEncargaturaDetalle || []).length == 0))
        {
            this.dataService.Message().msgWarning('"DEBE BUSCAR UNA PLAZA, EN LA PESTAÑA DE PLAZA A POSTULAR."', () => { });
            return;
        }
        
        // if (this.codigoEtapa != EtapaEnum.Ratificacion 
        //     && ((this.registroInformeEscalafonarioEncargaturaComponent.informe || []).length == 0)) {
        //     this.dataService.Message().msgWarning('"NO HAY INFORME ESCALAFONARIO."', () => { });
        //     return;
        // }

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
            debugger
            if(informeEscalafonario){
                this.datosPostulanteEncargatura.NumeroInformeEscalafonario=informeEscalafonario.numeroInformeEscalafonario;
                this.datosPostulanteEncargatura.FechaInformeEscalafonario=informeEscalafonario.fechaInformeEscalafonario;
                this.datosPostulanteEncargatura.DocumentoInformeEscalafonario=informeEscalafonario.documentoInformeEscalafonario;
            }
        } 
        else{
            this.datosPostulanteEncargatura.idPlazaEncargaturaDetalle = this.idPlazaEncargaturaDetalle
        }

        const request = {
            idPostulacion: this.idPostulacion,
            
            numeroExpediente: expediente.numeroExpediente,
            fechaExpediente: expediente.fechaExpediente,
            
            titulo: this.datosPostulanteEncargatura.titulo,
            fechaExpedicionTitulo: this.datosPostulanteEncargatura.fechaExpedicionTitulo,
            fechaRegistroTitulo: this.datosPostulanteEncargatura.fechaRegistroTitulo,            
            idPlazaEncargaturaDetalle: this.datosPostulanteEncargatura.idPlazaEncargaturaDetalle,

            NumeroInformeEscalafonario: this.datosPostulanteEncargatura.NumeroInformeEscalafonario,
            FechaInformeEscalafonario: this.datosPostulanteEncargatura.FechaInformeEscalafonario,
            DocumentoInformeEscalafonario: this.datosPostulanteEncargatura.DocumentoInformeEscalafonario,
            
            UsuarioModificacion:this.currentSession.nombreUsuario,
        };
        
        this.dataService.Message().msgConfirm('¿ESTÁ SEGURO QUE DESEA GUARDAR LOS CAMBIOS?', () => {
            this.loading = true;
            this.dataService.Spinner().show("sp6");
            this.dataService.Encargatura().getActualizarPostulanteEncargatura(request).pipe(catchError((e) => of(e)), finalize(() => {
                this.dataService.Spinner().hide("sp6")
                this.loading = false;
            })).subscribe(result => {
                if (result == 1) {
                    this.dataService.Message().msgAutoInfo(ENCARGATURA_MESSAGE.M07,3000, () => { });
                    this.dialogRef.close();
                } else {
                    this.dataService.Message().msgError('"OCURRIERON ALGUNOS PROBLEMAS AL GUARDAR LA INFORMACIÓN."', () => { });
                }
            });
        }, () => { });
    }

    handleCancel() {
        this.dialogRef.close();
    }

    handleVerDocumentoSustento = () => {
        const codigoAdjunto = this.informe.documentoInformeEscalafonario;

        if (!codigoAdjunto) {
            this.dataService.Message().msgWarning('"EL REGISTRO NO TIENE DOCUMENTO DE SUSTENTO."', () => {
            });
            return;
        }
        this.dataService.Spinner().show('sp6');
        this.dataService.Documento().descargar(codigoAdjunto)
            .pipe(
                catchError((e) => {
                    return of(e);
                }),
                finalize(() => this.dataService.Spinner().hide('sp6'))
            ).subscribe(response => {
                if (response) {
                    this.handlePreview(response, codigoAdjunto);
                } else {
                    this.dataService.Message().msgWarning('"NO SE PUDO OBTENER EL DOCUMENTO DE SUSTENTO."', () => {
                    });
                }
            });
    };

    handlePreview(file: any, codigoAdjuntoSustento: string) {
        this.dialogRefPreview = this.materialDialog.open(DocumentViewerComponent, {
            panelClass: 'modal-viewer-form-dialog',
            disableClose: true,
            data: {
                modal: {
                    icon: 'remove_red_eye',
                    title: 'Documento de sustento',
                    file: file,
                    fileName: codigoAdjuntoSustento
                }
            }
        });

        this.dialogRefPreview.afterClosed()
            .subscribe((response: any) => {
                if (!response) {
                    return;
                }
            });
    };
    loadCambios(reloadOnlyChild = false) {
    }
}