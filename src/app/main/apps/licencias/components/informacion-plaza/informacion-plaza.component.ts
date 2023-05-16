import {Component, Inject, OnInit, ViewEncapsulation} from '@angular/core';
import { mineduAnimations } from '@minedu/animations/animations';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material/dialog';
import { DataService } from 'app/core/data/data.service';
import {catchError, finalize} from 'rxjs/operators';
import {of} from 'rxjs';
import { HttpErrorResponse } from '@angular/common/http';

@Component({
    selector: "minedu-informacion-plaza",
    templateUrl: "./informacion-plaza.component.html",
    styleUrls: ["./informacion-plaza.component.scss"],
    encapsulation: ViewEncapsulation.None,
    animations: mineduAnimations
})
export class InformacionPlazaComponent implements OnInit {
    codigoPlaza : string;
    idServidorPublico : number;
    plaza: any;

    constructor(
        public dialogRef: MatDialogRef<InformacionPlazaComponent>,
        @Inject(MAT_DIALOG_DATA) private data: any,
        private dataService: DataService
    ) {
        this.codigoPlaza = this.data.codigoPlaza;
        this.idServidorPublico = this.data.idServidorPublico;
    }

    ngOnInit(): void {
        this.loadPlaza();
    }

    loadPlaza() {
        this.dataService.Licencias().getPlaza(this.codigoPlaza, this.idServidorPublico).pipe(
            catchError((error: HttpErrorResponse) => {
                this.dataService.Message().msgWarning(error.error.messages[0]); this.handleCancel(); return of(null);
            }),
            finalize(() => {})
        ).subscribe((result: any) => {
            if (result) 
                this.plaza = result;
        });
    }

    handleCancel() {
        this.dialogRef.close();
    }
}