import { Component, Inject, OnInit, ViewEncapsulation } from '@angular/core';
import { mineduAnimations } from '../../../../../../../@minedu/animations/animations';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialog } from '@angular/material/dialog';
import { DataService } from '../../../../../../core/data/data.service';
import { catchError, finalize } from 'rxjs/operators';
import { of } from 'rxjs';
import { EtapaEnum } from '../../_utils/constants';
import { DocumentViewerComponent } from 'app/main/apps/components/document-viewer/document-viewer.component';


@Component({
    selector: "minedu-informacion-postulante-encargatura",
    templateUrl: "./informacion-postulante-encargatura.component.html",
    styleUrls: ["./informacion-postulante-encargatura.component.scss"],
    encapsulation: ViewEncapsulation.None,
    animations: mineduAnimations
})
export class InformacionPostulanteEncargaturaComponent implements OnInit {
    idPostulacion: number;
    idPlazaEncargaturaDetalle: number;
    codigoEtapa: number;
    datosPostulanteEncargatura: any;
    plazaEncargaturaDetalle: any;
    informe: any;
    etapaEnum = EtapaEnum;
    dialogRefPreview: any;

    constructor(
        public dialogRef: MatDialogRef<InformacionPostulanteEncargaturaComponent>,
        @Inject(MAT_DIALOG_DATA) private data: any,
        private dataService: DataService,
        private materialDialog: MatDialog
    ) {
        this.idPostulacion = this.data.idPostulacion;
        this.idPlazaEncargaturaDetalle = this.data.idPlazaEncargaturaDetalle;
        this.codigoEtapa = this.data.codigoEtapa;
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
                this.datosPostulanteEncargatura = {
                    titulo: result.titulo,
                    fechaExpedicionTitulo: result.fechaExpedicionTitulo,
                    fechaRegistroTitulo: result.fechaRegistroTitulo,
                    idPostulacion: result.idPostulacion,
                    numeroExpediente: result.numeroExpediente,
                    fechaExpediente: result.fechaExpediente,
                    idServidorPublico: result.idServidorPublico,
                    fechaInicioVinculacion: result.fechaInicioVinculacion,
                    fechaFinVinculacion: result.fechaFinVinculacion,
                    numeroDocumentoIdentidad: result.numeroDocumentoIdentidad,
                    primerApellido: result.primerApellido,
                    segundoApellido: result.segundoApellido,
                    nombres: result.nombres,
                    idPlaza: result.idPlaza,
                    codigoPlaza: result.codigoPlaza,
                    idTipoPlaza: result.idTipoPlaza,
                    descripcionTipoPlaza: result.descripcionTipoPlaza,
                    idCargo: result.idCargo,
                    descripcionCargo: result.descripcionCargo,
                    codigoModular: result.codigoModular,
                    institucionEducativa: result.institucionEducativa,
                    idRegimenLaboral: result.idRegimenLaboral,
                    descripcionRegimenLaboral: result.descripcionRegimenLaboral,
                    codigoCondicionLaboral: result.codigoCondicionLaboral,
                    descripcionCondicionLaboral: result.descripcionCondicionLaboral,
                    codigoSituacionLaboral: result.codigoSituacionLaboral,
                    descripcionSituacionLaboral: result.descripcionSituacionLaboral,
                    codigoGenero: result.codigoGenero,
                    descripcionGenero: result.descripcionGenero
                }
            }
        });
    }

    loadPlazaEncargatura() {        
        this.dataService.Encargatura().getPlazaEncargaturaDetalle(this.idPlazaEncargaturaDetalle).pipe(catchError(() => of([])), finalize(() => {})).subscribe((result: any) => {
            if (result) {
                this.plazaEncargaturaDetalle = {
                    idPlazaEncargaturaDetalle: result.idPlazaEncargaturaDetalle,
                    idPlazaEncargatura: result.idPlazaEncargatura,
                    codigoPlaza: result.codigoPlaza,
                    descripcionRegimenLaboral: result.descripcionRegimenLaboral,
                    descripcionCondicion: result.descripcionCondicion,
                    descripcionTipoPlaza: result.descripcionTipoPlaza,
                    descripcionCargo: result.descripcionCargo,
                    descripcionEspecialidad: result.descripcionEspecialidad,
                    descripcionJornadaLaboral: result.descripcionJornadaLaboral,
                    plazaVigenciaInicio: result.plazaVigenciaInicio,
                    plazaVigenciaFin: result.plazaVigenciaFin,
                    motivoVacancia: result.motivoVacancia,
                    codigoModular: result.codigoModular,
                    institucionEducativa: result.institucionEducativa,
                    descripcionUgel: result.descripcionUgel,
                    descripcionDre: result.descripcionDre,
                    abreviaturaModalidadEducativa: result.abreviaturaModalidadEducativa,
                    descripcionNivelEducativo: result.descripcionNivelEducativo,
                    descripcionTipoIEPadron: result.descripcionTipoIEPadron,
                    descripcionTipoGestionInstitucionEducativa: result.descripcionTipoGestionInstitucionEducativa,
                    descripcionDependenciaInstitucionEducativa: result.descripcionDependenciaInstitucionEducativa,
                    descripcionModeloServicio: result.descripcionModeloServicio,
                    descripcionTipoRuralidad: result.descripcionTipoRuralidad,
                    esBilingue: result.esBilingue,
                    esFrontera: result.esFrontera,
                    esVRAEM: result.esVRAEM,
                    descripcionLenguaInstitucionEducativa: result.descripcionLenguaInstitucionEducativa
                }
            }
        });
    }

    loadInforme() { 
        const data={
            idPostulacion:this.idPostulacion
        }
        this.dataService.Encargatura().getInformePostulante(data).pipe(catchError(() => of([])), finalize(() => { })).subscribe((result: any) => {
            if (result) {
                this.informe={
                    numeroInformeEscalafonario: result.numeroInformeEscalafonario,
                    fechaInformeEscalafonario: result.fechaInformeEscalafonario,
                    documentoInformeEscalafonario: result.documentoInformeEscalafonario
                };
            }
        });
    }

    handleCancel() {
        this.dialogRef.close();
    }

    handleVerDocumentoSustento = () => {
        const codigoAdjunto = this.informe.documentoInformeEscalafonario;

        if (!codigoAdjunto) {
            this.dataService.Message().msgWarning('"EL REGISTRO NO TIENE INFORME ESCALAFONARIO."', () => {
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
                    this.dataService.Message().msgWarning('"NO SE PUDO OBTENER EL INFORME ESCALAFONARIO."', () => {
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
                    title: 'Informe escalafonario',
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
}