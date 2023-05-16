import {Component, Inject, OnInit, ViewEncapsulation} from '@angular/core';
import {DataService} from '../../../../../../core/data/data.service';
import {catchError, finalize} from 'rxjs/operators';
import {of} from 'rxjs';
import {mineduAnimations} from '../../../../../../../@minedu/animations/animations';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material/dialog';
import { EstadoAdjudicacionEnum, EtapaEnum } from '../../_utils/constants';

@Component({
    selector: "minedu-informacion-adjudicacion-encargatura",
    templateUrl: "./informacion-adjudicacion-encargatura.component.html",
    styleUrls: ["./informacion-adjudicacion-encargatura.component.scss"],
    encapsulation: ViewEncapsulation.None,
    animations: mineduAnimations
})
export class InformacionAdjudicacionEncargaturaComponent implements OnInit {
    idAdjudicacion: number;
    adjudicacionEncargatura: any;
    EtapaValidacionEnum=EtapaEnum;
    estadoAdjudicacionEnum = EstadoAdjudicacionEnum;
    loading = false;

    constructor(
        public dialogRef: MatDialogRef<InformacionAdjudicacionEncargaturaComponent>,
        @Inject(MAT_DIALOG_DATA) private data: any,
        private dataService: DataService
    ) {
        this.idAdjudicacion = this.data.idAdjudicacion;
    }

    ngOnInit(): void {
        this.loadAdjudicacionEncargatura();
    }

    loadAdjudicacionEncargatura() {
        const request = {
            idAdjudicacion: this.idAdjudicacion
        }
        this.dataService.Encargatura().getAdjudicacionEncargatura(request).pipe(catchError((error) => {
            this.dataService.Message().msgWarning('"'+error.error.messages[0].toUpperCase()+'"');
            return of(null);
        }), finalize(() => {
            this.dataService.Spinner().hide("sp6");
            this.loading = false;
        })).subscribe((result: any) => {
            if (result) {
                this.adjudicacionEncargatura = {
                    idAdjudicacion: result.idAdjudicacion,
                    numeroDocumentoIdentidad: result.numeroDocumentoIdentidad,
                    primerApellido: result.primerApellido,
                    segundoApellido: result.segundoApellido,
                    nombres: result.nombres,
                    idCategoriaRemunerativa: result.idCategoriaRemunerativa,
                    descripcionCategoriaRemunerativa: result.descripcionCategoriaRemunerativa,
                    ordenMerito: result.ordenMerito,
                    puntajeFinal: result.puntajeFinal,
                    codigoPlaza: result.codigoPlaza,
                    motivoVacancia: result.motivoVacancia,
                    vigenciaInicio: result.vigenciaInicio,
                    vigenciaFin: result.vigenciaFin,
                    idTipoPlaza: result.idTipoPlaza,
                    descripcionTipoPlaza: result.descripcionTipoPlaza,
                    idRegimenLaboral: result.idRegimenLaboral,
                    descripcionRegimenLaboral: result.descripcionRegimenLaboral,
                    idJornadaLaboral: result.idJornadaLaboral,
                    descripcionJornadaLaboral: result.descripcionJornadaLaboral,
                    codigoModular: result.codigoModular,
                    institucionEducativa: result.institucionEducativa,
                    esBilingue: result.esBilingue,
                    esFrontera: result.esFrontera,
                    esVraem: result.esVraem,
                    idModeloServicio: result.idModeloServicio,
                    descripcionModeloServicio: result.descripcionModeloServicio,
                    idModalidadEducativa: result.idModalidadEducativa,
                    abreviaturaModalidadEducativa: result.abreviaturaModalidadEducativa,
                    descripcionModalidadEducativa: result.descripcionModalidadEducativa,
                    idNivelEducativo: result.idNivelEducativo,
                    descripcionNivelEducativo: result.descripcionNivelEducativo,
                    idCargo: result.idCargo,
                    descripcionCargo: result.descripcionCargo,
                    codigoCondicion: result.codigoCondicion,
                    descripcionCondicion: result.descripcionCondicion,
                    codigoTipoIEPadron: result.codigoTipoIEPadron,
                    descripcionTipoIEPadron: result.descripcionTipoIEPadron,
                    codigoTipoGestionInstitucionEducativa: result.codigoTipoGestionInstitucionEducativa,
                    descripcionTipoGestionInstitucionEducativa: result.descripcionTipoGestionInstitucionEducativa,
                    codigoDependenciaInstitucionEducativa: result.codigoDependenciaInstitucionEducativa,
                    descripcionDependenciaInstitucionEducativa: result.descripcionDependenciaInstitucionEducativa,
                    codigoTipoRuralidad: result.codigoTipoRuralidad,
                    descripcionTipoRuralidad: result.descripcionTipoRuralidad,
                    codigoFormaAtencion: result.codigoFormaAtencion,
                    descripcionFormaAtencion: result.descripcionFormaAtencion,
                    codigoLenguaInstitucionEducativa: result.codigoLenguaInstitucionEducativa,
                    descripcionLenguaInstitucionEducativa: result.descripcionLenguaInstitucionEducativa,
                    codigoGenero: result.codigoGenero,
                    descripcionGenero: result.descripcionGenero,
                    codigoEtapaProceso: result.codigoEtapaProceso,
                    codigoEstadoAdjudicacion: result.codigoEstadoAdjudicacion,
                    descripcionMotivoNoAdjudicacion: result.descripcionMotivoNoAdjudicacion,
                    anotacionesNoAdjudicacion: result.anotacionesNoAdjudicacion
                }
            }
        });
    }

    handleCancel() {
        this.dialogRef.close();
    }
}