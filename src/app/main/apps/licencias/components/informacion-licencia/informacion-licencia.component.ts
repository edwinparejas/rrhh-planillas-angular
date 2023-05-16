import { Component, OnInit, Inject, ViewEncapsulation, OnDestroy, AfterViewInit, ɵConsole, ViewChild, Input } from '@angular/core';
import { mineduAnimations } from '@minedu/animations/animations';
import { Subscription, BehaviorSubject, of, Observable, Subject } from 'rxjs';
import { FormGroup, FormBuilder, Validators, FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { catchError, finalize, takeUntil, filter, find } from 'rxjs/operators';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

import { DataService } from 'app/core/data/data.service';
import { SharedService } from 'app/core/shared/shared.service';
import * as moment from 'moment';
import { forEach } from 'lodash';
import { bootloader } from '@angularclass/hmr';
import Swal from 'sweetalert2';
import { saveAs } from 'file-saver';
import { DocumentosSustentoComponent } from '../documentos-sustento/documentos-sustento.component';
import { LicenciaModel, DocumentoSustentoModel } from '../../models/licencia.model';
import { SecurityModel } from '../../../../../core/model/security/security.model';

@Component({
    selector: 'minedu-informacion-licencia',
    templateUrl: './informacion-licencia.component.html',
    styleUrls: ['./informacion-licencia.component.scss'],
    encapsulation: ViewEncapsulation.None,
    animations: mineduAnimations,
})
export class InformacionLicenciaComponent implements OnInit {

    licencia: LicenciaModel = null;
    dialogTitle = 'Información de licencia';
    working = false;
    documentosSustento: DocumentoSustentoModel[] = [];
    idLicencia: 0;
    @ViewChild(DocumentosSustentoComponent)
    private documentosSustentoComponent: DocumentosSustentoComponent;
    eliminado: boolean;
    origenEliminacion: number;
    currentSession: SecurityModel = new SecurityModel();

    constructor(
        public matDialogRef: MatDialogRef<InformacionLicenciaComponent>,
        @Inject(MAT_DIALOG_DATA) private data: any,
        private route: ActivatedRoute,
        private dataService: DataService,
        private dataShared: SharedService,
        private materialDialog: MatDialog) {
        if (data.eliminado === true) {
            this.dialogTitle = 'Eliminar Licencia';
        }
        this.origenEliminacion = data.origen;
        this.currentSession = data.currentSession;
    }

    ngOnInit(): void {
        this.working = true;
        this.idLicencia = this.data.idLicencia;
        this.eliminado = this.data.eliminado;
        this.obtenerDatosLicencia(this.idLicencia);
    }

    handleCancel = () => {
        this.matDialogRef.close();
    }

    obtenerDatosLicencia = (idLicencia: number) => {
        this.dataService
            .Licencias()
            .getLicencia(idLicencia)
            .pipe(
                catchError(() => of([])),
                finalize(() => {
                    this.working = false;
                })
            )
            .subscribe((response: any) => {
                if (response && response.result) {
                    this.licencia = response.data;
                    this.documentosSustento = this.licencia.documentosSustento;
                    this.documentosSustentoComponent.actualizarLista(this.documentosSustento);
                }
            });
    }

    handleDelete = (row) => {
        Swal.fire({
            title: '',
            text: '¿Está seguro de que desea eliminar la información?',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d84d2a',
            cancelButtonColor: '#333333',
            confirmButtonText: 'Sí',
            cancelButtonText: 'Cancelar',
        }).then((result) => {
            if (result.value) {
                this.dataService.Licencias()
                    .deleteLicencia(this.idLicencia, this.origenEliminacion, this.currentSession.numeroDocumento)
                    .subscribe(
                        (rest) => {
                            this.matDialogRef.close({ grabado: true });
                        },
                        (error) => {
                            // this.mensajeService.mostrarMensajeError(error);
                        }
                    );
            }
        });
    }

    descargarSustento = () => {
        const data = this.licencia;
        if (data.detalleCertificado.codigoDocumentoCertificado === null ||
            data.detalleCertificado.codigoDocumentoCertificado === '') {
            this.dataService.Message().msgWarning('La licencia no tiene certificado adjunto.', () => { });
            return;
        }
        
        this.dataService.Spinner().show("sp6");
        this.dataService.Documento().descargar(data.detalleCertificado?.codigoDocumentoCertificado)
            .pipe(
                catchError((e) => of(null)),
                finalize(() => this.dataService.Spinner().hide("sp6"))
            ).subscribe(response => {
                if (response) {
                    saveAs(response, "certificado.pdf");
                } else {
                    this.dataService.Message().msgWarning('No se pudo descargar el certificado adjunto', () => { });
                }
            });
    }
}
