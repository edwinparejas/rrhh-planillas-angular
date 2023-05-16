import { Component, Inject, OnInit, ViewEncapsulation } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { ActivatedRoute, Router } from '@angular/router';
import { mineduAnimations } from '@minedu/animations/animations';
import { DataService } from 'app/core/data/data.service';
import { SharedService } from 'app/core/shared/shared.service';
import { DocumentViewerComponent } from 'app/main/apps/components/document-viewer/document-viewer.component';
import { trim } from 'lodash';

@Component({
    selector: 'minedu-ver-informacion-sustento',
    templateUrl: './ver-informacion-sustento.component.html',
    styleUrls: ['./ver-informacion-sustento.component.scss'],
    encapsulation: ViewEncapsulation.None,
    animations: mineduAnimations
})
export class VerInformacionSustentoComponent implements OnInit {

    InfoDocumentoSustento: any = {};

    constructor(
        public matDialogRef: MatDialogRef<VerInformacionSustentoComponent>,
        @Inject(MAT_DIALOG_DATA) private data: any,
        private materialDialog: MatDialog
    ) { }

    ngOnInit(): void {
        this.setInfo();
    }

    handleCancel = () => {
        this.matDialogRef.close();
    }

    setInfo() {
        this.InfoDocumentoSustento = this.data.info;
    }

    handleMostrarAdjunto(fileTEMP) {
        console.log(fileTEMP.file);
        this.handlePreview(fileTEMP, fileTEMP.name);
    }

    handlePreview(file: any, codigoAdjuntoAdjunto: string) {
        this.materialDialog.open(DocumentViewerComponent, {
            panelClass: "modal-viewer-form-dialog",
            disableClose: true,
            data: {
                modal: {
                    icon: "remove_red_eye",
                    title: "Accion Grabada",
                    file: file,
                    fileName: codigoAdjuntoAdjunto,
                },
            },
        });
    }

    esRegistrado(value: string | number) {
        if (value == null || value == 0 || trim(value as string) == '') {
            return 'NO REGISTRADO'
        }
        return value;
    }

}
