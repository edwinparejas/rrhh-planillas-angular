import {Component, Inject, OnInit, ViewEncapsulation} from '@angular/core';
import {DataService} from '../../../../../../core/data/data.service';
import {catchError, finalize} from 'rxjs/operators';
import {of} from 'rxjs';
import {mineduAnimations} from '../../../../../../../@minedu/animations/animations';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material/dialog';

@Component({
    selector: "minedu-informacion-plaza-encargatura",
    templateUrl: "./informacion-plaza-encargatura.component.html",
    styleUrls: ["./informacion-plaza-encargatura.component.scss"],
    encapsulation: ViewEncapsulation.None,
    animations: mineduAnimations
})
export class InformacionPlazaEncargaturaComponent implements OnInit {
    idPlazaEncargaturaDetalle : number;
    plazaEncargaturaDetalle: any;

    constructor(
        public dialogRef: MatDialogRef<InformacionPlazaEncargaturaComponent>,
        @Inject(MAT_DIALOG_DATA) private data: any,
        private dataService: DataService
    ) {
        this.idPlazaEncargaturaDetalle = this.data.idPlazaEncargaturaDetalle;
    }

    ngOnInit(): void {
        this.loadPlazaEncargatura();
    }

    loadPlazaEncargatura() {
        this.dataService.Encargatura().getPlazaEncargaturaDetalle(this.idPlazaEncargaturaDetalle).pipe(catchError(() => of([])), finalize(() => {})).subscribe((result: any) => {
            if (result) {
                this.plazaEncargaturaDetalle = {
                    idPlazaEncargaturaDetalle: result.idPlazaEncargaturaDetalle,
                    idPlazaEncargatura: result.idPlazaEncargatura,
                    codigoPlaza: result.codigoPlaza,
                    descripcionRegimenLaboral: result.descripcionRegimenLaboral,
                    descripcionCondicion: result.descripcionCondicion,
                    descripcionTipoPlaza: result.descripcionTipoPlaza,
                    descripcionCargo: result.descripcionCargo,
                    descripcionEspecialidad: result.descripcionEspecialidad,
                    descripcionJornadaLaboral: result.descripcionJornadaLaboral,
                    vigenciaInicio: result.vigenciaInicio,
                    vigenciaFin: result.vigenciaFin,
                    motivoVacancia: result.motivoVacancia,
                    codigoModular: result.codigoModular,
                    institucionEducativa: result.institucionEducativa,
                    descripcionUgel: result.descripcionUgel,
                    descripcionDre: result.descripcionDre,
                    abreviaturaModalidadEducativa: result.abreviaturaModalidadEducativa,
                    descripcionModalidadEducativa: result.descripcionModalidadEducativa,
                    descripcionNivelEducativo: result.descripcionNivelEducativo,
                    descripcionTipoIEPadron: result.descripcionTipoIEPadron,
                    descripcionTipoGestionInstitucionEducativa: result.descripcionTipoGestionInstitucionEducativa,
                    descripcionDependenciaInstitucionEducativa: result.descripcionDependenciaInstitucionEducativa,
                    descripcionModeloServicio: result.descripcionModeloServicio,
                    descripcionTipoRuralidad: result.descripcionTipoRuralidad,
                    esBilingue: result.esBilingue,
                    esFrontera: result.esFrontera,
                    esVRAEM: result.esVRAEM,
                    descripcionLenguaInstitucionEducativa: result.descripcionLenguaInstitucionEducativa,
                    descripcionFormaAtencion: result.descripcionFormaAtencion,
                    descripcionAreaCurricular: result.descripcionAreaCurricular
                }
            }
        });
    }

    handleCancel() {
        this.dialogRef.close();
    }
}