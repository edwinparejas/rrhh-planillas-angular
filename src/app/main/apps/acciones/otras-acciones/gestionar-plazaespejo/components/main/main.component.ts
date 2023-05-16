import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { DataService } from 'app/core/data/data.service';
import { LoadingService } from 'app/core/data/interceptors/loading.service';
import { EntidadPassportService } from '../../Services/entidad-passport.service';
import { EntidadSedeService } from '../../Services/entidad-sede.service';
import { TablaEquivalenciaSede } from '../../types/Enums';
import { Observable, of } from 'rxjs';

@Component({
    selector: 'minedu-main',
    templateUrl: './main.component.html',
    styleUrls: ['./main.component.scss']
})
export class MainComponent implements OnInit {

    mostrar$: Observable<boolean>;

    constructor(
        private router: Router,
        private entidadSedeService: EntidadSedeService,
        private entidadPassportService: EntidadPassportService,
        private loadingService: LoadingService,
        private dataService: DataService,
    ) {
        this.mostrar$ = of(false);
    }

    ngOnInit(): void {
        this.escucharLoader();
        this.esperarRespuesta();
    }

    async esperarRespuesta() {
        await this.rolMonitorValidacion();
        this.mostrar$ = of(true);
    }

    private escucharLoader() {
        this.loadingService.loading.subscribe(value => {
            if (value) {
                this.dataService.Spinner().show("sp6");
            } else {
                this.dataService.Spinner().hide("sp6");
            }
        });

    }


    private async rolMonitorValidacion() {
        this.entidadSedeService.proccessInit();
        const entidadSede = this.entidadSedeService.entidadSede;
        const esRolMonitor = this.entidadSedeService.esRolMonitor;
        const tipoSedeList = [TablaEquivalenciaSede.CODIGO_TIPO_SEDE_DRE, TablaEquivalenciaSede.CODIGO_TIPO_SEDE_UGEL, 'TS012'];

        if (esRolMonitor && (!entidadSede || !entidadSede?.codigoTipoSede || !tipoSedeList.includes(entidadSede.codigoTipoSede))) {
            this.router.navigate(['/ayni/personal/inicio']);
            return;
        }
        await this.entidadPassportService.actualizarEntidadSede();
    }

}
