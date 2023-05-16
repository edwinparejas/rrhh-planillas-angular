import { DataService } from "app/core/data/data.service";
import update from "immutability-helper";
import { of } from "rxjs";
import { catchError, finalize } from "rxjs/operators";
import {
    IContainerReporteConsolidado,
    IFormBusquedaConsolidado,
} from "../../../../interfaces/reporte-asistencia.interface";
import { saveAs } from "file-saver";

export class ReporteConsolidadoMensualSource {
    constructor(
        private getState: () => IContainerReporteConsolidado,
        private setState: (newState: IContainerReporteConsolidado) => void,
        private dataService: DataService
    ) {}

    setFormBusquedaConsolidado = (
        idControlAsistencia: any,
        descripcionMes: any,
        anio: any
    ) => {
        const state = this.getState();
        const buscar = state.formBusquedaConsolidadoModel;
        buscar.idControlAsistencia = idControlAsistencia;
        buscar.descripcionMes = descripcionMes;
        buscar.anio = anio;

        this.setState(
            update(state, {
                formBusquedaConsolidadoModel: { $set: buscar },
            })
        );
    };

    asyncGridReporteConsolidado = (p: number, pp: number) => {
        this.dataService.Spinner().show("sp6");
        const state = this.getState();
        const buscar = state.formBusquedaConsolidadoModel;
        buscar.p = p;
        buscar.pp = pp;

        this.dataService
            .Asistencia()
            .getReporteConsolidado(buscar.idControlAsistencia, buscar)
            .pipe(
                catchError(() => of([])),
                finalize(() => {
                    this.dataService.Spinner().hide("sp6");
                })
            )
            .subscribe((response) => {
                this.asyncGridReporteConsolidadoSuccess(response.data, buscar);
            });
    };

    private asyncGridReporteConsolidadoSuccess = (
        items,
        buscar: IFormBusquedaConsolidado
    ) => {
        let totalRow = 0;
        const state = this.getState();
        if ((items || []).length > 0) {
            totalRow = (items[0] || [{ totalRegistro: 0 }]).totalRegistro;
        } else {
            totalRow = 0;
            this.dataService
                .Message()
                .msgWarning("No se encontró información para la búsqueda.");
        }
        const grillaReporteConsoliadoModel = state.grillaReporteConsoliadoModel;
        grillaReporteConsoliadoModel.servidores = items;
        grillaReporteConsoliadoModel.loading = false;
        grillaReporteConsoliadoModel.totalRow = totalRow;

        this.setState(
            update(state, {
                grillaReporteConsoliadoModel: {
                    $set: grillaReporteConsoliadoModel,
                },
                formBusquedaConsolidadoModel: { $set: buscar },
            })
        );
    };

    asyncDownloadExcel = () => {
        this.dataService.Spinner().show("sp6");
        const state = this.getState();
        const buscar = state.formBusquedaConsolidadoModel;
        this.dataService
            .Asistencia()
            .postReporteConsolidadoPdf(buscar)
            .pipe(
                catchError((e) => of(null)),
                finalize(() => {
                    this.dataService.Spinner().hide("sp6");
                })
            )
            .subscribe((response) => {
                if (response) {
                    const nameFile = "Reporte_Asistencia_Consolidado.pdf";
                    saveAs(response, nameFile);
                }
            });
    };
}
