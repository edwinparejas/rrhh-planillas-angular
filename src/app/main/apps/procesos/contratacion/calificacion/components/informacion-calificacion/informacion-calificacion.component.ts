import { Component, Inject, OnInit, ViewEncapsulation, ViewChild } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { mineduAnimations } from '@minedu/animations/animations';
import { DataService } from 'app/core/data/data.service';
import { of } from 'rxjs';
import { catchError, finalize } from 'rxjs/operators';
import { CalificacionResponse } from '../../../models/contratacion.model';
import { ResultadoPunComponent } from '../resultado-pun/resultado-pun.component';
import { CriterioEvaluacionComponent } from '../criterio-evaluacion/criterio-evaluacion.component';
import { RequisitoMinimoComponent } from '../requisito-minimo/requisito-minimo.component';

@Component({
    selector: 'minedu-informacion-calificacion',
    templateUrl: './informacion-calificacion.component.html',
    styleUrls: ['./informacion-calificacion.component.scss'],
    encapsulation: ViewEncapsulation.None,
    animations: mineduAnimations,
})
export class InformacionCalificacionComponent implements OnInit {
    dialogTitle = 'Detalle de calificaciones';
    working = false;
    calificacion: CalificacionResponse;
    calificaciones: any;
    idEtapa: number;
    resultadosPun: any[] = [];
    requisitosMinimos: any[] = [];
    formacionAcademica: any[] = [];
    formacionProfesional: any[] = [];
    experienciaLaboral: any[] = [];

    @ViewChild(ResultadoPunComponent) private resultadoPunComponent: ResultadoPunComponent;
    @ViewChild('requisitoMinimoComponent') private requisitoMinimoComponent: RequisitoMinimoComponent;
    @ViewChild('formacionAcademicaComponent') private formacionAcademicaComponent: CriterioEvaluacionComponent;
    @ViewChild('formacionProfesionalComponent') private formacionProfesionalComponent: CriterioEvaluacionComponent;
    @ViewChild('experienciaLaboralComponent') private experienciaLaboralComponent: CriterioEvaluacionComponent;


    constructor(
        public matDialogRef: MatDialogRef<InformacionCalificacionComponent>,
        @Inject(MAT_DIALOG_DATA) private data: any,
        private dataService: DataService,
        private formBuilder: FormBuilder) {
        this.calificaciones = data.calificacionesRow;
        this.idEtapa = data.idEtapa;
        // this.currentSession = data.currentSession;
    }

    ngOnInit(): void {
        this.loadCalificacion();
    }

    handleCancel = () => {
        this.matDialogRef.close();
    }

    loadCalificacion = () => {
        this.dataService.Contrataciones()
            .getCalificacion(this.calificaciones.idCalificacion)
            .pipe(
                catchError(() => of([])),
                finalize(() => { })
            )
            .subscribe((response: any) => {
                if (response && response.result) {
                    this.calificacion = response.data;

                    this.resultadosPun = response.data.resultadosPun;
                    this.resultadoPunComponent.actualizarLista(this.resultadosPun);

                    this.requisitosMinimos = response.data.requisitosMinimos;
                    this.requisitoMinimoComponent.actualizarLista(this.requisitosMinimos);

                    if (this.calificacion.empate === true) {
                        this.formacionAcademica = response.data.formacionesAcademicas;
                        if (this.formacionAcademicaComponent != null) this.formacionAcademicaComponent.actualizarLista(this.formacionAcademica);

                        this.formacionProfesional = response.data.formacionesProfesionales;
                        if (this.formacionProfesionalComponent != null) this.formacionProfesionalComponent.actualizarLista(this.formacionProfesional);

                        this.experienciaLaboral = response.data.experienciasLaborales;
                        if (this.experienciaLaboralComponent != null) this.experienciaLaboralComponent.actualizarLista(this.experienciaLaboral);
                    }
                }
            });
    }
}
