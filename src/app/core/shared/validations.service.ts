import { Injectable } from "@angular/core";
import { DataService } from "../data/data.service";
import { TablaProcesosConfiguracionAcciones } from "../model/action-buttons/action-types";

@Injectable({
    providedIn: 'root'
})
export class ValidationsService {

    constructor(private dataService: DataService) {

    }

    async tienePermisoAccion(accion: TablaProcesosConfiguracionAcciones): Promise<boolean> {
        var boot = await this.dataService.Passport().boot().toPromise();
        const parametroPermiso = this.dataService.Storage().getParamAccion(accion);
        if (!parametroPermiso) {
            return false;
        }

        const param = this.dataService.Cifrado().PassportEncode(boot.Token, parametroPermiso);
        var autorizacion = await this.dataService.Passport().getAutorizacion(param).toPromise();

        if (autorizacion.HasErrors)
            debugger;
        return autorizacion.Data[0].ESTA_AUTORIZADO;
    }

}