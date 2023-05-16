import { Component, Inject, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { ActivatedRoute } from '@angular/router';
import { mineduAnimations } from '@minedu/animations/animations';
import { DataService } from 'app/core/data/data.service';
import { SharedService } from 'app/core/shared/shared.service';
import { DocumentosSustentoComponent } from 'app/main/apps/sanciones/gestion-sanciones/components/documentos-sustento/documentos-sustento.component';
import { DocumentoSustentoModel } from 'app/main/apps/sanciones/models/sanciones.model';
import { of } from 'rxjs';
import { catchError, finalize } from 'rxjs/operators';
import Swal from 'sweetalert2';
import {  FaltaResponseModel } from '../../models/sanciones.model';
import { ResultadoOperacionEnum } from 'app/core/model/types';
import { SecurityModel } from '../../../../../core/model/security/security.model';

@Component({
    selector: 'minedu-informacion-falta',
    templateUrl: './informacion-falta.component.html',
    styleUrls: ['./informacion-falta.component.scss'],
    encapsulation: ViewEncapsulation.None,
    animations: mineduAnimations,
})
export class InformacionFaltaComponent implements OnInit {
    currentSession: SecurityModel = new SecurityModel();
    falta: FaltaResponseModel = null;
    dialogTitle = 'Información de falta';
    working = false;
    documentosSustento: DocumentoSustentoModel[] = [];
    idFalta: 0;
    @ViewChild(DocumentosSustentoComponent)
    private documentosSustentoComponent: DocumentosSustentoComponent;
    eliminado: boolean;
    constructor(
        public matDialogRef: MatDialogRef<InformacionFaltaComponent>,
        @Inject(MAT_DIALOG_DATA) private data: any,
        private route: ActivatedRoute,
        private dataService: DataService,
        private dataShared: SharedService,
        private materialDialog: MatDialog) {
        if (data.eliminado === true) {
            this.dialogTitle = 'Eliminar Falta';
        }
    }

    ngOnInit(): void {
        this.buildSeguridad();
        this.working = true;
        this.idFalta = this.data.idFalta;
        this.eliminado = this.data.eliminado;
        this.obtenerDatosFalta(this.idFalta);
    }

    handleCancel = () => {
        this.matDialogRef.close();
    }

    buildSeguridad = () => {
        this.currentSession= this.dataService.Storage().getInformacionUsuario();
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
                    this.documentosSustento = this.falta.documentosSustento; 
                    this.documentosSustentoComponent.actualizarLista(this.documentosSustento); 
                } else if (response && response.statusCode === ResultadoOperacionEnum.NotFound) {
                    this.dataService.Message().msgWarning(response.messages[0], () => { });
                } else if (response && response.statusCode === ResultadoOperacionEnum.UnprocessableEntity) {
                    this.dataService.Message().msgWarning(response.messages[0], () => { });
                } else {
                    this.dataService.Message().msgError('Ocurrieron algunos problemas al obtener la información.', () => { });
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
            cancelButtonText: 'No',
        }).then((result) => {
            if (result.value) {
                this.dataService
                    .Sanciones()
                    .deleteFalta({ 
                                idFalta:this.idFalta,
                                usuarioModificacion:this.currentSession.numeroDocumento,
                                ipModificacion:''
                                })
                    .subscribe(response=>{
                        if (response && response.result) {
                            this.dataService.Message().msgAutoCloseSuccessNoButton("Falta eliminada correctamente.",1500,  () => { });
                            this.matDialogRef.close({ grabado: true });
                        } else if (response && response.statusCode === ResultadoOperacionEnum.NotFound) {
                            this.dataService.Message().msgWarning(response.messages[0], () => { });
                        } else if (response && response.statusCode === ResultadoOperacionEnum.UnprocessableEntity) {
                            this.dataService.Message().msgWarning(response.messages[0], () => { });
                        } else {
                            this.dataService.Message().msgError('Ocurrieron algunos problemas al guardar la información.', () => { });
                        }
                        
                    });
            }
        });
    }

}
