import { Component, Input, OnInit, ViewEncapsulation } from "@angular/core";
import { mineduAnimations } from "../../../../../../../@minedu/animations/animations";
import { DataService } from "app/core/data/data.service";
import { EtapaResponseModel } from "../../models/reasignacion.model";
import { catchError, finalize } from "rxjs/operators";
import { of } from "rxjs";

@Component({
    selector: "minedu-informacion-proceso-etapa",
    templateUrl: "./informacion-proceso-etapa.component.html",
    styleUrls: ["./informacion-proceso-etapa.component.scss"],
    encapsulation: ViewEncapsulation.None,
    animations: mineduAnimations,
})
export class InformacionProcesoEtapaComponent implements OnInit {
    @Input() idProcesoEtapa: number;
    @Input() consolidado: boolean = false;

    @Input() codSede: string;

    etapaResponse: EtapaResponseModel;
    

    constructor(private dataService: DataService,) {}

    ngOnInit(): void {
        this.obtenerEtapa();        
    }

    obtenerEtapa = () => {
        this.dataService
            .Reasignaciones()
            .getDatosProcesoEtapaById(this.idProcesoEtapa)           
            .pipe(
                catchError(() => of([])),
                finalize(() => {})
            )
            .subscribe((response: any) => {
                if (response) {
                    this.etapaResponse = {
                        // anio: response.anio,
                        anio: response.anioProceso,
                        // codigoEtapa: response.codigo,
                        codigoEtapa: response.codigoProceso,
                        // codigoProceso: response.codigo,
                        codigoProceso: response.codigoProceso,
                        // codigoEtapaFase: response.codigo,
                        codigoEtapaFase: response.codigoProceso,
                        // descripcionEstadoEtapaProceso: response.estado,
                        descripcionEstadoEtapaProceso: response.estadoProceso,
                        // descripcionEtapa: response.etapa,
                        descripcionEtapa: response.etapaFase,
                        // descripcionEtapaFase: response.etapa,
                        descripcionEtapaFase: response.etapaFase,
                        // descripcionNumeroConvocatoria: response.numero_convocatoria,
                        descripcionNumeroConvocatoria: response.numeroConvocatoria,
                        // descripcionRegimenLaboral: response.regimen_laboral,
                        descripcionRegimenLaboral: response.regimenLaboral,
                        // descripcionTipoProceso: response.proceso,
                        descripcionTipoProceso: response.maestroProceso,
                        // fechaCreacion: response.fecha_creacion,
                        fechaCreacion: response.fechaCreacionProceso,
                        // idEtapa: response.id_etapa_proceso,
                        idEtapa: response.idEtapaProceso,
                        // idProceso: response.id_proceso
                        idProceso: response.idProceso
                    };

                    this.obtenerEstadoDesarrolloEtapa();
                }
            });
    };

    obtenerEstadoDesarrolloEtapa = () => {
        this.dataService
            .Reasignaciones()
            .obtenerEstadoDesarrolloEtapaProcesoPorCodigoSede(this.idProcesoEtapa, this.codSede)          
            .pipe(
                catchError(() => of([])),
                finalize(() => {})
            )
            .subscribe((response: any) => {
                if (response) {
                    this.etapaResponse.descripcionEstadoEtapaProceso = response.estadoDesarrollo;
                }
            });
    };
}
