import { Component, Input, OnInit, ViewEncapsulation } from "@angular/core";
import { mineduAnimations } from "@minedu/animations/animations";
import { DataService } from "app/core/data/data.service";
import { of } from "rxjs";
import { catchError, finalize } from "rxjs/operators";

@Component({
    selector: "minedu-cabecera-plaza-postulacion-encargatura",
    templateUrl: "./cabecera-plaza-postulacion-encargatura.component.html",
    styleUrls: ["./cabecera-plaza-postulacion-encargatura.component.scss"],
    encapsulation: ViewEncapsulation.None,
    animations: mineduAnimations,
})
export class CabeceraPlazaPostulacionEncargaturaComponent implements OnInit {
    @Input() idPostulacion: number;

    loading = false;
    plazaPostulacionEncargatura: any;
    
    constructor(private dataService: DataService) { }

    ngOnInit(): void {
        this.loadPlazaPostulacionEncargatura();
    }

    loadPlazaPostulacionEncargatura() {
        const request = {
            idPostulacion: this.idPostulacion
        };
        this.loading = true;
            this.dataService.Spinner().show('sp6');
        this.dataService.Encargatura().getPlazaPostulacionEncargatura(request).pipe(catchError((error) => {
            this.dataService.Message().msgWarning('"'+error.error.messages[0].toUpperCase()+'"');
            return of(null);
        }), finalize(() => {
            this.dataService.Spinner().hide("sp6");
            this.loading = false;
        })).subscribe((result: any) => {
            if (result) {
                this.plazaPostulacionEncargatura = {
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
                    descripcionLenguaInstitucionEducativa: result.descripcionLenguaInstitucionEducativa
                }
            }
        });
    }
}