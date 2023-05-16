import { AfterViewInit, Component, Inject, OnInit, ViewEncapsulation } from "@angular/core";
import { FormBuilder } from "@angular/forms";
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from "@angular/material/dialog";
import { mineduAnimations } from "@minedu/animations/animations";
import { DataService } from "app/core/data/data.service";
import { DocumentViewerComponent } from "app/main/apps/components/document-viewer/document-viewer.component";

@Component({
    selector: "minedu-modal-vista-informacion-sustento",
    templateUrl: "./modal-vista-informacion-sustento.component.html",
    styleUrls: ["./modal-vista-informacion-sustento.component.scss"],
    encapsulation: ViewEncapsulation.None,
    animations: mineduAnimations,
})
export class ModalVistaInformacionSustentoComponent
    implements OnInit, AfterViewInit
{
    informacionSustento:any;
    dialogRef: any;
    constructor(
        public matDialogRef: MatDialogRef<ModalVistaInformacionSustentoComponent>,
        @Inject(MAT_DIALOG_DATA) private data: any,
        private formBuilder: FormBuilder,
        private dataService: DataService,
        private materialDialog: MatDialog
    ) {

        this.informacionSustento=data.informacionSustento;
    }

    ngOnInit(): void {
        
     }
     ngAfterViewInit(): void {
         
     }
     handleMostrar(fileTEMP) {
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
         });
     }
}