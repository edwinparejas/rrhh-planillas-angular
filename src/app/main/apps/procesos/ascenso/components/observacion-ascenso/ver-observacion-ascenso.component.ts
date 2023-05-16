import { Component, OnInit, Inject, ViewEncapsulation, OnDestroy, ViewChild, AfterViewInit } from '@angular/core';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { FormGroup, FormBuilder } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { mineduAnimations } from '@minedu/animations/animations';
import { catchError, finalize, takeUntil, filter, find } from 'rxjs/operators';
import { DataService } from 'app/core/data/data.service';
import { SharedService } from 'app/core/shared/shared.service';
import { MatPaginator } from '@angular/material/paginator';
import { Subscription, of, Observable, BehaviorSubject, Subject } from 'rxjs';
import { AdjudicacionModel } from '../../models/ascenso.model';

@Component({
    selector: 'minedu-ver-observacion-ascenso',
    templateUrl: './ver-observacion-ascenso.component.html',
    styleUrls: ['./ver-observacion-ascenso.component.scss'],
    encapsulation: ViewEncapsulation.None,
    animations: mineduAnimations
})
export class VerObservacionAscensoComponent implements OnInit, OnDestroy, AfterViewInit {
    working: false;
    form: FormGroup;
    row: number;
    idRolPassport: number = 1;
    adjudicacion: AdjudicacionModel = new AdjudicacionModel();
    constructor(
        public matDialogRef: MatDialogRef<VerObservacionAscensoComponent>,
        @Inject(MAT_DIALOG_DATA) private data: any,
        private route: ActivatedRoute,
        private router: Router,
        private formBuilder: FormBuilder,
        private dataService: DataService,
        private dataShared: SharedService,
 
        private materialDialog: MatDialog) { }

    ngAfterViewInit(): void {     }
    ngOnDestroy(): void {    }
    ngOnInit(): void {  this.obtenerAdjudicacion(this.data.dataKey.idAdjudicacion) ;    }
    handleCancel = () => {        this.matDialogRef.close();    }
    obtenerAdjudicacion = (idAdjudicacion) => {
    this.dataService.Ascenso()
    .getAdjudicacionById(idAdjudicacion)
    .pipe(
        catchError(() => of([])),
        finalize(() => { })
    )
    .subscribe((response: any) => {
        if (response && response.result) {
            this.adjudicacion=response.data;
        }
    });
  }
}

 