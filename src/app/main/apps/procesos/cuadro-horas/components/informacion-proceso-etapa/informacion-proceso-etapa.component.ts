import { Component, Input, OnInit, ViewEncapsulation } from "@angular/core";
import { mineduAnimations } from "../../../../../../../@minedu/animations/animations";
import { DataService } from "app/core/data/data.service";
import { EtapaResponseModel } from "../../models/cuadro-horas.model";
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
        //this.obtenerEtapa();
        this.loadProcesoHeader(()=>{});
        
    }

    loadProcesoHeader(callback) {
        let request = {
          idEtapaProceso: (this.idProcesoEtapa)
        };
        this.dataService.CuadroHoras().getCabeceraProceso(request).pipe(
          //catchError((e) => { return  this.configCatch(e);        }),
          catchError(() => of([])),
          finalize(() => { })
        ).subscribe(
            (response) => {
                  console.log("etapaResponse", this.etapaResponse);
                  console.log("response", response);
                  //this.procesoHeader = response
            }
        )
        }
    obtenerEtapa = () => {
        this.dataService
            .Contrataciones()
            .obtenerCabeceraEtapaProcesoById(this.idProcesoEtapa)
            .pipe(
                catchError(() => of([])),
                finalize(() => {})
            )
            .subscribe((response: any) => {
                if (response) {
                    this.etapaResponse = {
                        anio: response.anio,
                        codigoEtapa: response.codigo,
                        codigoProceso: response.codigo,
                        codigoEtapaFase: response.codigo,
                        descripcionEstadoEtapaProceso: response.estado,
                        descripcionEtapa: response.etapa,
                        descripcionEtapaFase: response.etapa,
                        descripcionNumeroConvocatoria: response.numero_convocatoria,
                        descripcionRegimenLaboral: response.regimen_laboral,
                        descripcionTipoProceso: response.proceso,
                        fechaCreacion: response.fecha_creacion,
                        idEtapa: response.id_etapa_proceso,
                        idProceso: response.id_proceso,
                    };

                    this.obtenerEstadoDesarrolloEtapa();
                }
            });
    };

    obtenerEstadoDesarrolloEtapa = () => {
        // if(this.codSede==undefined) {
        //     this.codSede = '000000'
        // }

        this.dataService
            .Contrataciones()
            .obtenerCabeceraEstadoDesarrolloEtapaProceso(this.idProcesoEtapa, this.codSede)
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
