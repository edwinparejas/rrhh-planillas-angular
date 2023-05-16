import { Component, EventEmitter, Input, OnInit, Output, ViewEncapsulation } from "@angular/core";
import { mineduAnimations } from "@minedu/animations/animations";
import { DataService } from "app/core/data/data.service";
import { Observable, of, Subscription } from "rxjs";
import { catchError, finalize} from "rxjs/operators";
import { EtapaResponseModel } from "../../models/contratacion.model";

@Component({
    selector: "minedu-panel-validacionn30493",
    templateUrl: "./panel-validacionn30493.component.html",
    styleUrls: ["./panel-validacionn30493.component.scss"],
    encapsulation: ViewEncapsulation.None,
    animations: mineduAnimations,
})
export class PanelValidacionn30493Component implements OnInit {

    private eventsSubscription: Subscription;
    etapaResponse: EtapaResponseModel;

    @Output() eventPublicarPlazas = new EventEmitter<any>();
    @Output() eventAperturarPlazas = new EventEmitter<any>();
    @Output() eventVerListadoPlazas = new EventEmitter<any>();


    @Input() idProcesoEtapa: number;
    @Input() codSede: string;
    @Input() actualizarEstadoValidacion: Observable<void>;

    constructor(private dataService: DataService) {}

    ngOnInit(): void {
        console.log(this.idProcesoEtapa, " ??? ", this.codSede)
        //this.obtenerEstadoDesarrolloEtapa();
        this.obtenerValidacionPlaza();
        // this.eventsSubscription = this.actualizarEstadoValidacion.subscribe(() => this.obtenerValidacionPlaza());
    }
    ngOnDestroy() {
        // this.eventsSubscription.unsubscribe();
      }

    @Input() validacionPlaza:string;
    @Input() controlesActivos:any;

    handleVerListadoPlazas(){
        this.eventVerListadoPlazas.emit(null);
    }

    handlePublicarPlazas(){
        this.eventPublicarPlazas.emit(null);
    }

    handleAperturarPlaza(){
        this.eventAperturarPlazas.emit(null);
    }


    obtenerValidacionPlaza(){
        
        let d = {
            idEtapaProceso: this.idProcesoEtapa,
            codigoCentroTrabajoMaestro:this.codSede,
        }
        
        this.dataService.Contrataciones().getObtenerPlazaContratacionPorIdEtapaProceso(d).pipe(catchError((e) => of([e])),
            finalize(() => {})
        )
        .subscribe((response: any) => {
            if (response) {
                console.log("Validacion Response: ",response)
                if (response.length > 0) {
                    if (response[0].estadoValidacionPlaza == 'PRE PUBLICADO') {
                        this.validacionPlaza = 'PENDIENTE';
                    } else {
                        this.validacionPlaza = response[0].estadoValidacionPlaza;
                    }
                }
                else {
                    this.validacionPlaza = 'PENDIENTE';
                }
            }
            console.log("Estado ValidacionPlaza:", this.validacionPlaza);
        });
    }

    /*obtenerEstadoDesarrolloEtapa = () => {
        console.log("Cabecera: CodigoSede procesado", this.codSede);

        if(this.codSede==undefined) {
            this.codSede = '000000'
        }

        this.dataService
            .Contrataciones()
            .obtenerCabeceraEstadoDesarrolloEtapaProceso(this.idProcesoEtapa, this.codSede)
            .pipe(
                catchError(() => of([])),
                finalize(() => {})
            )
            .subscribe((response: any) => {
                if (response) {
                    console.log("response validation", response)
                    this.etapaResponse.descripcionEstadoEtapaProceso = response.estadoDesarrollo;
                }
            });
    };*/
}
