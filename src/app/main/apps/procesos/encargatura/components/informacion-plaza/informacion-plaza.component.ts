import {Component, Inject, OnInit, ViewEncapsulation} from '@angular/core';
import {mineduAnimations} from '../../../../../../../@minedu/animations/animations';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material/dialog';
import {DataService} from '../../../../../../core/data/data.service';
import {catchError, finalize} from 'rxjs/operators';
import {of} from 'rxjs';

@Component({
    selector: "minedu-informacion-plaza",
    templateUrl: "./informacion-plaza.component.html",
    styleUrls: ["./informacion-plaza.component.scss"],
    encapsulation: ViewEncapsulation.None,
    animations: mineduAnimations
})
export class InformacionPlazaComponent implements OnInit {
    idPlaza : number;
    plaza: any;

    constructor(
        public dialogRef: MatDialogRef<InformacionPlazaComponent>,
        @Inject(MAT_DIALOG_DATA) private data: any,
        private dataService: DataService
    ) {
        this.idPlaza = this.data.idPlaza;
    }

    ngOnInit(): void {
        this.loadPlaza();
    }

    loadPlaza() {
        this.dataService.Encargatura().getPlaza(this.idPlaza).pipe(catchError(() => of([])), finalize(() => {})).subscribe((result: any) => {
            if (result) {
                this.plaza = {
                    idPlaza: result.idPlaza,
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
                    descripcionLenguaInstitucionEducativa: result.descripcionLenguaInstitucionEducativa
                }
            }
        });
    }

    handleCancel() {
        this.dialogRef.close();
    }
}