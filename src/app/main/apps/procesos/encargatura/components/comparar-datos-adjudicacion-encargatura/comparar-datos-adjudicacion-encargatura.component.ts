import { Component, Inject, Input, OnInit, ViewEncapsulation } from "@angular/core";
import { MatDialogRef, MAT_DIALOG_DATA } from "@angular/material/dialog";
import { mineduAnimations } from "@minedu/animations/animations";
import { DataService } from "app/core/data/data.service";
import { SecurityModel } from "app/core/model/security/security.model";
import { of } from "rxjs";
import { catchError, finalize } from "rxjs/operators";

@Component({
    selector: "minedu-comparar-datos-adjudicacion-encargatura",
    templateUrl: "./comparar-datos-adjudicacion-encargatura.component.html",
    styleUrls: ["./comparar-datos-adjudicacion-encargatura.component.scss"],
    encapsulation: ViewEncapsulation.None,
    animations: mineduAnimations,
})
export class CompararDatosAdjudicacionEncargaturaComponent implements OnInit {
    idAdjudicacion: number;
    idPlazaEncargaturaDetalle: number;

    currentSession: SecurityModel = new SecurityModel();
    loading = false;
    plazaPostulacionEncargatura: any;
    
    constructor(
        public dialogRef: MatDialogRef<CompararDatosAdjudicacionEncargaturaComponent>,
        @Inject(MAT_DIALOG_DATA) private data: any,
        private dataService: DataService
    ) {
        this.idAdjudicacion=data.idAdjudicacion;
        this.idPlazaEncargaturaDetalle=data.idPlazaEncargaturaDetalle;
        this.currentSession=data.currentSession;
    }

    ngOnInit(): void {
        
    } 
    handleAccion($event) {
        this.dialogRef.close($event);
    }    
}