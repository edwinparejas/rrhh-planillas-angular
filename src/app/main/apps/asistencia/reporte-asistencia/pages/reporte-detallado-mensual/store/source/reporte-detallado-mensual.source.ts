import { DataService } from "app/core/data/data.service";
import {
    IAsiDetalladoCabecera,
    IContainerReporteDetallado,
    IFormBusquedaDetallado,
} from "../../../../interfaces/reporte-asistencia.interface";
import update from "immutability-helper";
import { of } from "rxjs";
import { map, catchError, finalize } from "rxjs/operators";
import { saveAs } from "file-saver";


export class ReporteDetalladoMensualSource {
    constructor(
        private getState: () => IContainerReporteDetallado,
        private setState: (newState: IContainerReporteDetallado) => void,
        private dataService: DataService
    ) {}

    fechSetFormBusquedaDetallado = (
        idControlAsistencia: any,
        descripcionMes: any,
        anio: any
    ) => {
        const state = this.getState();
        const mes = this.getIdMes(descripcionMes);

        this.setState(
            update(state, {
                formBusquedaDetalladoModel: {
                    idControlAsistencia: { $set: idControlAsistencia },
                    descripcionMes: { $set: descripcionMes },
                    mes: { $set: mes },
                    anio: { $set: anio },
                },
            })
        );
    };

    asyncGridReporteDetallado = (p: number, pp: number) => {
        this.dataService.Spinner().show("sp6");
        const state = this.getState();
        const buscar = state.formBusquedaDetalladoModel;
        buscar.p = p;
        buscar.pp = pp;

        this.dataService
            .Asistencia()
            .getReporteDetallado(buscar)
            .pipe(
                catchError(() => of([])),
                finalize(() => {
                    this.dataService.Spinner().hide("sp6");
                })
            )
            .subscribe((response) => {
                this.asyncGridReporteDetalladoSuccess(response.data, buscar);
            });
    };

    private asyncGridReporteDetalladoSuccess = (
        items,
        buscar: IFormBusquedaDetallado
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

        this.setState(
            update(state, {
                grillaReporteDetalladoModel: {
                    servidores: { $set: items },
                    loading: { $set: false },
                    totalRow: { $set: totalRow },
                },
                formBusquedaDetalladoModel: { $set: buscar },
            })
        );
    };

    asyncGridReporteDetalladoCabecera = () => {
        this.dataService.Spinner().show("sp6");
        const state = this.getState();
        const buscar = state.formBusquedaDetalladoModel;
        return this.dataService
            .Asistencia()
            .getReporteDetalladoCabecera(buscar)
            .pipe(
                map((resp) => {
                    this.dataService.Spinner().hide("sp6");
                    return resp;
                }),
                catchError(() => of([])),
                finalize(() => {
                    this.dataService.Spinner().hide("sp6");
                })
            );
    };

    asyncGridReporteDetalladoCabeceraSuccess = (
        cabecera: IAsiDetalladoCabecera
    ) => {
        const state = this.getState();
        const displayColumns = this.getDisplayedColumns(cabecera);
        this.setState(
            update(state, {
                grillaReporteDetalladoModel: {
                    cabecera: { $set: cabecera },
                    displayedColumns: { $set: displayColumns },
                },
            })
        );
    };

    asyncDownloadExcel = () => {
        this.dataService.Spinner().show("sp6");
        const state = this.getState();
        const buscar = state.formBusquedaDetalladoModel;
        this.dataService
            .Asistencia()
            .postReporteDetalladoPdf(buscar)
            .pipe(
                catchError((e) => of(null)),
                finalize(() => {
                    this.dataService.Spinner().hide("sp6");
                })
            )
            .subscribe((response) => {
                if (response) {
                    const nameFile = "Reporte_Asistencia_Detallado.pdf";
                    saveAs(response, nameFile);
                }
            });
    };

    asyncDownloadExcel_ = () => {
        this.dataService.Spinner().show("sp6");
        const state = this.getState();
        const buscar = state.formBusquedaDetalladoModel;
        this.dataService
            .Asistencia()
            .postReporteDetalladoPdf(buscar)
            .pipe(
                catchError(e => of(null)),
                finalize(() => {
                    this.dataService.Spinner().hide("sp6");
                })
            )
            .subscribe((response) => {
                if(response){
                    const nameFile = "Reporte_Asistencia_Detallado.pdf";
                    saveAs(response, "licencias.xlsx");
                }                
            });
    };

    private getDisplayedColumns = (
        cabecera: IAsiDetalladoCabecera
    ): string[] => {
        const state = this.getState();
        const columnas = state.grillaReporteDetalladoModel.displayedColumns;

        const valorUno = cabecera._30;
        const valorDos = cabecera._31;
        if (valorUno == null) {
            columnas.splice(
                columnas.findIndex((item) => item === "_30"),
                1
            );
        }
        if (valorDos == null) {
            columnas.splice(
                columnas.findIndex((item) => item === "_31"),
                1
            );
        }
        return columnas;
    };

    private getIdMes = (descripcionMes: string): number => {
        let idMes = 0;
        descripcionMes = descripcionMes.toUpperCase();
        switch (descripcionMes) {
            case "ENERO":
                idMes = 1;
                break;
            case "FEBRERO":
                idMes = 2;
                break;
            case "MARZO":
                idMes = 3;
                break;
            case "ABRIL":
                idMes = 4;
                break;
            case "MAYO":
                idMes = 5;
                break;
            case "JUNIO":
                idMes = 6;
                break;
            case "JULIO":
                idMes = 7;
                break;
            case "AGOSTO":
                idMes = 8;
                break;
            case "SEPTIEMBRE":
                idMes = 9;
                break;
            case "OCTUBRE":
                idMes = 10;
                break;
            case "NOVIEMBRE":
                idMes = 11;
                break;
            case "DICIEMBRE":
                idMes = 12;
                break;
        }
        return idMes;
    };
}