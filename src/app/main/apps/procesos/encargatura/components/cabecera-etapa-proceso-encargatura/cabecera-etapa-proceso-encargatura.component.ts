import { Component, Input, OnInit, ViewEncapsulation } from "@angular/core";
import { mineduAnimations } from "@minedu/animations/animations";
import { DataService } from "app/core/data/data.service";
import { of } from "rxjs";
import { catchError, finalize } from "rxjs/operators";

@Component({
    selector: "minedu-cabecera-etapa-proceso-encargatura",
    templateUrl: "./cabecera-etapa-proceso-encargatura.component.html",
    styleUrls: ["./cabecera-etapa-proceso-encargatura.component.scss"],
    encapsulation: ViewEncapsulation.None,
    animations: mineduAnimations,
})
export class CabeceraEtapaProcesoEncargaturaComponent implements OnInit {
    @Input() idEtapaProceso: number;

    etapaProcesoEncargatura: any;
    
    constructor(private dataService: DataService) { }

    ngOnInit(): void {
        this.loadEtapaProcesoEncargatura();
    }

    loadEtapaProcesoEncargatura() {
        const request = {
            idEtapaProceso: this.idEtapaProceso
        };
        this.dataService.Encargatura().getEtapaProcesoEncargatura(request).pipe(catchError(() => of([])), finalize(() => { })).subscribe((result: any) => {
            if (result) {
                this.etapaProcesoEncargatura = {
                    idEtapaProceso: result.idEtapaProceso,
                    descripcionEtapa: result.descripcionEtapa,
                    fechaCreacionEtapa: result.fechaCreacionEtapa,
                    anio: result.anio,
                    codigoProceso: result.codigoProceso,
                    descripcionProceso: result.descripcionProceso,
                    idRegimenLaboral: result.idRegimenLaboral,
                    descripcionRegimenLaboral: result.descripcionRegimenLaboral,
                    codigoNumeroConvocatoria: result.codigoNumeroConvocatoria,
                    descripcionNumeroConvocatoria: result.descripcionNumeroConvocatoria
                }
            }
        });
    }
}