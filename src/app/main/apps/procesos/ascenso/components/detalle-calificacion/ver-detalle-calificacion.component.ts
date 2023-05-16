import { Component, OnInit, Inject, ViewEncapsulation, OnDestroy, ViewChild, AfterViewInit } from '@angular/core';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { FormGroup, FormBuilder } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { SelectionModel, DataSource, CollectionViewer } from '@angular/cdk/collections';
import { mineduAnimations } from '@minedu/animations/animations';
import { catchError, finalize, takeUntil, filter, find } from 'rxjs/operators';
import { DataService } from 'app/core/data/data.service';
import { SharedService } from 'app/core/shared/shared.service';
import { MatPaginator } from '@angular/material/paginator';
import { Subscription, of, Observable, BehaviorSubject, Subject } from 'rxjs';
import { CalificacionDetalleModel } from '../../models/ascenso.model';

@Component({
    selector: 'minedu-ver-detalle-calificacion',
    templateUrl: './ver-detalle-calificacion.component.html',
    styleUrls: ['./ver-detalle-calificacion.component.scss'],
    encapsulation: ViewEncapsulation.None,
    animations: mineduAnimations
})
export class VerDetalleCalificacionAscensoComponent implements OnInit, OnDestroy, AfterViewInit {
    working: false;
    form: FormGroup;
    row: number;
    selection = new SelectionModel<any>(true, []);
    idProceso :number;
    paginatorPageSize = 3;
    paginatorPageIndex = 1;
    seleccionado: any = null;
    idRolPassport: number = 1;
     @ViewChild('paginator', { static: true }) paginator: MatPaginator;

    calificacion: CalificacionDetalleModel = new CalificacionDetalleModel();
    constructor(
        public matDialogRef: MatDialogRef<VerDetalleCalificacionAscensoComponent>,
        @Inject(MAT_DIALOG_DATA) private data: any,
        private route: ActivatedRoute,
        private router: Router,
        private formBuilder: FormBuilder,
        private dataService: DataService,
        private dataShared: SharedService,
        private materialDialog: MatDialog) { }

    ngAfterViewInit(): void {
    
    }
    ngOnDestroy(): void {    }
    ngOnInit(): void {         console.log(this.data); this.detalleInfo(this.data.dataKey.idCalificacion);    }
    handleCancel = () => {        this.matDialogRef.close();    }
    detalleInfo = (id)=>{
    this.dataService.Ascenso()
    .getDetalleCalificacion(id)
    .pipe(
        catchError(() => of([])),
        finalize(() => { })
    )
    .subscribe((response: any) => {
        if (response && response.result) {
            this.calificacion=response.data;
        }
    });

  }
} 