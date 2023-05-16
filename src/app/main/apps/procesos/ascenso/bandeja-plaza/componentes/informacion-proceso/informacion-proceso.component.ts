import { Component, Input, ViewEncapsulation } from "@angular/core";
import { ActivatedRoute } from "@angular/router";
import { DataService } from "app/core/data/data.service";
import { of } from "rxjs";
import { catchError, finalize } from "rxjs/operators";
import { mineduAnimations } from "../../../../../../../../@minedu/animations/animations";
import { EtapaResponseModel } from "../../../models/ascenso.model";

@Component({
    selector: 'informacion-proceso-plaza',
    templateUrl: './informacion-proceso.component.html',
    styleUrls: ['./informacion-proceso.component.scss'],
    encapsulation: ViewEncapsulation.None,
    animations: mineduAnimations,
})

export class InformacionProcesoPlaza {
    @Input() idProcesoEtapa: number;
    @Input() consolidado: boolean = false;
    etapaResponse: EtapaResponseModel;
    etapa: EtapaResponseModel = new EtapaResponseModel();
    idProceso:number;
    hasAccessPage: boolean;
    constructor(
        private rutaActiva: ActivatedRoute,
        private dataService: DataService,
        ) {}

    ngOnInit(): void {
        this.idProceso = this.rutaActiva.snapshot.params.idProceso;
        if(!this.hasAccessPage){
            this.obtenerProcesoEtapa();
        }
        else this.dataService.Message().msgError('El rol asignado no tiene acceso a esta página.', () => { }); 
    }

    obtenerProcesoEtapa = () => {
        this.dataService.Ascenso()
        .getProcesoById(this.idProceso)
        .pipe(
            catchError(() => of([])),
            finalize(() => { })
        )
        .subscribe((response: any) => {
            if (response) {
                this.etapa=response;
            }
        });
    }
}