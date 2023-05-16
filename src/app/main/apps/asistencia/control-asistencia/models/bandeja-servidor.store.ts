import { Store } from "@minedu/store/store";
import { BandejaServidorModel, InitialState } from "./bandeja-servidor.model";
import { Injectable } from "@angular/core";
import { BusquedaBandejaServidorSource } from "./source/busqueda-bandeja-servidor.source";
import { DataService } from "app/core/data/data.service";
import { ModalIncidenciaServidorSource } from './source/modal-incidencia-servidor.source';

@Injectable({
    providedIn: 'root'
})
export class BandejaServidorStore extends Store<BandejaServidorModel> {
    busquedaBandejaServidorSource: BusquedaBandejaServidorSource;
    modalIncidenciaServidorSource: ModalIncidenciaServidorSource;

    constructor(dataService: DataService) {
        super(InitialState);

        this.busquedaBandejaServidorSource = new BusquedaBandejaServidorSource(
            this.buildScopedGetState("containerBandejaServidorModel"),
            this.buildScopedSetState("containerBandejaServidorModel"),
            dataService
        );

        this.modalIncidenciaServidorSource = new ModalIncidenciaServidorSource(
            this.buildScopedGetState("modalIncidenciaModel"),
            this.buildScopedSetState("modalIncidenciaModel"),
            dataService
        );
    }
}
