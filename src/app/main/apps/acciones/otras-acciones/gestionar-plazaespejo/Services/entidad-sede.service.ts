import { Injectable } from '@angular/core';
import { DataService } from 'app/core/data/data.service';
import { Observable, BehaviorSubject } from 'rxjs';
import { StorageService } from 'app/core/data/services/storage.service';

@Injectable({
    providedIn: 'root'
})
export class EntidadSedeService {

    entidadSedeSelected$: Observable<IEntidadSedeSession>;
    esRolMonitor$: Observable<boolean>;

    private entidadSedeSelectedSubject: BehaviorSubject<IEntidadSedeSession>;
    private esRolMonitorSubject: BehaviorSubject<boolean>;

    constructor(private dataService: DataService, private storageService: StorageService) {
        this.entidadSedeSelectedSubject = new BehaviorSubject<IEntidadSedeSession>(null);
        this.entidadSedeSelected$ = this.entidadSedeSelectedSubject.asObservable();

        this.esRolMonitorSubject = new BehaviorSubject<boolean>(false);
        this.esRolMonitor$ = this.esRolMonitorSubject.asObservable();
    }

    get passportInstanciaModel() {
        return (this.dataService.Storage().getInstanciaSelected());
    }

    get passportRolSelected() {
        return this.dataService.Storage().getPassportRolSelected();
    }

    get entidadSede() {
        return this.entidadSedeSelectedSubject.value;
    }

    set entidadSede(entidadSede) {
        this.entidadSedeSelectedSubject.next(entidadSede);
    }

    get esRolMonitor() {
        return this.esRolMonitorSubject.value;
    }

    proccessInit() {
        console.log(this.passportRolSelected);

        let entidadSede: IEntidadSedeSession = {
            codigoSede: this.passportRolSelected.CODIGO_SEDE,
            codigoTipoSede: this.passportRolSelected.CODIGO_TIPO_SEDE,
            codigoRol: this.passportRolSelected.CODIGO_ROL
        };

        const esRolMonitor = this.passportRolSelected.CODIGO_ROL == 'AYNI_019';

        if (esRolMonitor) {
            entidadSede = this.passportInstanciaModel ?
                {
                    codigoSede: this.passportInstanciaModel.codigoInstancia,
                    codigoTipoSede: this.passportInstanciaModel.codigoTipoSede,
                    codigoRol: this.passportRolSelected.CODIGO_ROL
                }
                : null;
        }
        this.esRolMonitorSubject.next(esRolMonitor);
        this.entidadSedeSelectedSubject.next(entidadSede);
    }
}

export interface IEntidadSedeSession {
    codigoRol?: string;
    codigoSede?: string;
    codigoTipoSede?: string;
    idDre?: number;
    idUgel?: number;
}