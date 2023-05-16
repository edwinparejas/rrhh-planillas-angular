import { AfterViewInit, Component, Inject, OnInit, ViewEncapsulation } from "@angular/core";
import { FormBuilder } from "@angular/forms";
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from "@angular/material/dialog";
import { mineduAnimations } from "@minedu/animations/animations";
import { DataService } from "app/core/data/data.service";
import { PASSPORT_MESSAGE } from "app/core/model/messages-error";
import { of } from "rxjs";
import { catchError, finalize } from "rxjs/operators";

@Component({
    selector: "minedu-modal-motivo-eliminacion",
    templateUrl: "./modal-motivo-eliminacion.component.html",
    styleUrls: ["./modal-motivo-eliminacion.component.scss"],
    encapsulation: ViewEncapsulation.None,
    animations: mineduAnimations,
})
export class ModalMotivoEliminacionComponent
    implements OnInit, AfterViewInit
{
    detalleMotivo:string;
    constructor(
        public matDialogRef: MatDialogRef<ModalMotivoEliminacionComponent>,
        @Inject(MAT_DIALOG_DATA) private data: any,
        private formBuilder: FormBuilder,
        private dataService: DataService,
        private materialDialog: MatDialog
    ) {
        this.detalleMotivo=data.detalleMotivo;
        
    }
    ngOnInit(): void {
       
    }
    ngAfterViewInit(): void {
        
    }
}