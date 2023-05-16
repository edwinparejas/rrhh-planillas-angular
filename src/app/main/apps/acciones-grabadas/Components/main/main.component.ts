import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { EntidadPassportService } from '../../Services/entidad-passport.service';
import { EntidadSedeService } from '../../Services/entidad-sede.service';
import { TablaEquivalenciaSede } from '../../_utils/constants';

@Component({
    selector: 'minedu-main',
    templateUrl: './main.component.html',
    styleUrls: ['./main.component.scss']
})
export class MainComponent implements OnInit {

    constructor(
        private router: Router,
        private entidadSedeService: EntidadSedeService,
        private entidadPassportService: EntidadPassportService,
    ) { }

    ngOnInit(): void {
        this.rolMonitorValidacion();
    }

    private async rolMonitorValidacion() {
        this.entidadSedeService.proccessInit();
        const entidadSede = this.entidadSedeService.entidadSede;
        const esRolMonitor = this.entidadSedeService.esRolMonitor;
        const tipoSedeList = [TablaEquivalenciaSede.codigoTipoSedeDre, TablaEquivalenciaSede.codigoTipoSedeUgel, 'TS012'];

        if (esRolMonitor && (!entidadSede || !entidadSede?.codigoTipoSede || !tipoSedeList.includes(entidadSede.codigoTipoSede))) {
            this.router.navigate(['/ayni/personal/inicio']);
            return;
        }
        await this.entidadPassportService.actualizarEntidadSede();
    }

}
