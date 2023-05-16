import { Component, Inject, OnInit, ViewEncapsulation } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { ActivatedRoute, Router } from '@angular/router';
import { mineduAnimations } from '@minedu/animations/animations';
import { DataService } from 'app/core/data/data.service';
import { SharedService } from 'app/core/shared/shared.service';
import { DocumentViewerComponent } from 'app/main/apps/components/document-viewer/document-viewer.component';
import { of } from 'rxjs';
import { catchError, finalize } from 'rxjs/operators';

@Component({
  selector: 'minedu-ver-informacion-sustento',
  templateUrl: './ver-informacion-sustento.component.html',
  styleUrls: ['./ver-informacion-sustento.component.scss'],
  encapsulation: ViewEncapsulation.None,
    animations: mineduAnimations
})
export class VerInformacionSustentoComponent implements OnInit {

  InfoDocumentoSustento: any = {};

  dialogRef: any;
  
  constructor(
    public matDialogRef: MatDialogRef<VerInformacionSustentoComponent>,
    @Inject(MAT_DIALOG_DATA) private data: any,
    private route: ActivatedRoute,
    private router: Router,
    private formBuilder: FormBuilder,
    private dataService: DataService,
    private dataShared: SharedService,
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
    console.log(this.InfoDocumentoSustento);
  }

  handleMostrarAdjunto(fileTEMP) {
    console.log("Mostrar pdf", fileTEMP);
    this.handlePreview(fileTEMP, fileTEMP.name);
  }

  handlePreview(file: any, codigoAdjuntoAdjunto: string) {
    console.log("mostrar pDF 2", file)
    this.dialogRef = this.materialDialog.open(DocumentViewerComponent, {
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

    this.dialogRef.afterClosed().subscribe((response: any) => {
        if (!response) {
            console.log('close modal', response);
        }
    });
  }

}
