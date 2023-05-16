import { Component, Input, OnInit, ViewEncapsulation } from "@angular/core";
import { mineduAnimations } from "@minedu/animations/animations";
import { DataService } from "app/core/data/data.service";
import { of } from "rxjs";
import { catchError, finalize } from "rxjs/operators";

@Component({
    selector: "minedu-cabecera-desarrollo-proceso-encargatura",
    templateUrl: "./cabecera-desarrollo-proceso-encargatura.component.html",
    styleUrls: ["./cabecera-desarrollo-proceso-encargatura.component.scss"],
    encapsulation: ViewEncapsulation.None,
    animations: mineduAnimations,
})
export class CabeceraDesarrolloProcesoEncargaturaComponent implements OnInit {
    @Input() verInstancia: boolean = false;
    @Input() idDesarrolloProceso: number;

    desarrolloProcesoEncargatura: any;
    
    constructor(private dataService: DataService) { }

    ngOnInit(): void {
        this.loadDesarrolloProcesoEncargatura();
    }

    loadDesarrolloProcesoEncargatura() {
        const request = {
            idDesarrolloProceso: this.idDesarrolloProceso
        };
        this.dataService.Encargatura().getDesarrolloProcesoEncargatura(request).pipe(catchError(() => of([])), finalize(() => { })).subscribe((result: any) => {
            if (result) {
                this.desarrolloProcesoEncargatura = {
                    idEtapaProceso: result.idEtapaProceso,
                    descripcionEtapa: result.descripcionEtapa,
                    fechaCreacionEtapa: result.fechaCreacionEtapa,
                    anio: result.anio,
                    codigoProceso: result.codigoProceso,
                    descripcionProceso: result.descripcionProceso,
                    idRegimenLaboral: result.idRegimenLaboral,
                    descripcionRegimenLaboral: result.descripcionRegimenLaboral,
                    idDre: result.idDre,
                    descripcionDre: result.descripcionDre,
                    idUgel: result.idUgel,
                    descripcionUgel: result.descripcionUgel,
                    codigoNumeroConvocatoria: result.codigoNumeroConvocatoria,
                    descripcionNumeroConvocatoria: result.descripcionNumeroConvocatoria,
                    codigoEstadoDesarrollo: result.codigoEstadoDesarrollo,
                    descripcionEstadoDesarrollo: result.descripcionEstadoDesarrollo
                }
            }
        });
    }
}