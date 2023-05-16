import { Component, Inject, OnInit, ViewEncapsulation } from '@angular/core';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { mineduAnimations } from '@minedu/animations/animations';
import { DataService } from 'app/core/data/data.service';
import { of } from 'rxjs';
import { finalize, catchError } from 'rxjs/operators';
import { DocumentViewerComponent } from "app/main/apps/components/document-viewer/document-viewer.component";


@Component({
    selector: 'minedu-modal-informacion-sustento',
    templateUrl: './modal-informacion-sustento.component.html',
    styleUrls: ['./modal-informacion-sustento.component.scss'],
    encapsulation: ViewEncapsulation.None,
    animations: mineduAnimations,
})
export class ModalInformacionSustentoComponent implements OnInit {

    dialogTitle = 'Información de Sustento';
    working = false;
    sustento: any;
    dialogRef: any;


    constructor(public matDialogRef: MatDialogRef<ModalInformacionSustentoComponent>,
                @Inject(MAT_DIALOG_DATA) private data: any,
                private materialDialog: MatDialog,
                private dataService: DataService
    ) { }

    ngOnInit(): void {
        this.working = true;
        this.sustento = this.data.sustento;
        this.working = false;
        if (this.data.dialogTitle != null){
            this.dialogTitle = this.data.dialogTitle;
        }
    }

    handleCancel = () => { this.matDialogRef.close(); }

    handleVerPlazasPublicadas(file: string, esbecario:boolean=false, nombreDre:string){
        console.log("Data en sustento",this.sustento);

        if (!file) {
            this.dataService
                .Message()
                .msgWarning(
                    '"NO SE ENCONTRÓ EL DOCUMENTO SOLICITADO."',
                    () => {}
                );
            return;
        }

        var nombreDocumento =nombreDre;

        // console.log("file: ", file)
        console.log("Data archivo: ",file, nombreDocumento);
        
        this.dataService.Spinner().show("sp6");
        this.dataService
            .Documento()
            .descargar(file)
            .pipe(
                catchError((e) => {
                    this.dataService
                        .SnackBar()
                        .msgError(
                            "Error, no se pudo acceder al servicio.",
                            "Cerrar"
                        );
                    return of(e);
                }),
                finalize(() => this.dataService.Spinner().hide("sp6"))
            )
            .subscribe((response) => {
                if (response) {
                    this.handlePreview(response, nombreDocumento);
                } else {
                    this.dataService
                        .Message()
                        .msgWarning(
                            '"NO SE PUDO OBTENER EL DOCUMENTO SOLICITADO."',
                            () => {}
                        );
                }
            });
    }

    handlePreview(file: any, nameFile: string) {
        console.log("Data en sustento",this.sustento);
        this.dialogRef = this.materialDialog.open(DocumentViewerComponent, {
            panelClass: "modal-viewer-form-dialog",
            disableClose: true,
            data: {
                modal: {
                    icon: "remove_red_eye",
                    title: "Informacion de sustento - Documento",
                    file: file,
                    fileName:nameFile
                },
            },
        });

        this.dialogRef.afterClosed().subscribe((response: any) => {
            if (!response) {
                return;
            }
            if (response.download) {
                saveAs(file, nameFile + ".pdf");
            }
        });
    }
}
function saveAs(file: any, arg1: string) {
    throw new Error("Function not implemented.");
}