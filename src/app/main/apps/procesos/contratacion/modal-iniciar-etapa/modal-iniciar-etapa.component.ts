import { Component, OnInit, ViewEncapsulation, Inject, QueryList, ViewChild } from "@angular/core";
import { mineduAnimations } from "@minedu/animations/animations";
import { FormGroup, FormBuilder, Validators } from "@angular/forms";
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from "@angular/material/dialog";
import { DataService } from "app/core/data/data.service";
import { BehaviorSubject, Observable, of } from "rxjs";
import { catchError, finalize, tap } from "rxjs/operators";
import { CollectionViewer, DataSource } from "@angular/cdk/collections";
import { saveAs } from 'file-saver';
import { ResultadoOperacionEnum, MISSING_TOKEN } from 'app/core/model/types';
import { PASSPORT_MESSAGE } from 'app/core/model/messages-error';

@Component({
    selector: 'minedu-modal-iniciar-etapa',
    templateUrl: './modal-iniciar-etapa.component.html',
    styleUrls: ['./modal-iniciar-etapa.component.scss'],
    encapsulation: ViewEncapsulation.None,
    animations: mineduAnimations,
})
export class ModalIniciarEtapaComponent implements OnInit {

    constructor(
        public matDialogRef: MatDialogRef<ModalIniciarEtapaComponent>,
        @Inject(MAT_DIALOG_DATA) 
        public data: any,
        private formBuilder: FormBuilder
    ) { 
    }

    ngOnInit(): void {
        
    }

    onNoClick(flag: any): void {
        this.matDialogRef.close(flag);
    }
}
