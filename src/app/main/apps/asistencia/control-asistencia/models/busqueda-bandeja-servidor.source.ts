import {
    BuscarServidorModel,
    ContainerBandejaServidorModel,
    ServidorListaModel,
} from "../bandeja-servidor.model";
import { DataService } from "app/core/data/data.service";
import { catchError, finalize } from "rxjs/operators";
import update from "immutability-helper";
import { of } from "rxjs";
import { saveAs } from "file-saver";

export class BusquedaBandejaServidorSource {
    constructor(
        private getState: () => ContainerBandejaServidorModel,
        private setState: (newState: ContainerBandejaServidorModel) => void,
        private dataService: DataService
    ) {}

    //#region grilla servidor
    asyncLoadGrillaServidorLoad = (
        buscarServidorModel: BuscarServidorModel,
        p: string,
        pp: string
    ) => {
        this.dataService.Spinner().show("sp6");
        const state = this.getState();
        const buscar = buscarServidorModel;

        if (p && pp) {
            buscar.p = p;
            buscar.pp = pp;
        }

        this.dataService
            .Asistencia()
            .getBandejaServidor(
                state.grillaBandejaServidorModel.idControlAsistencia,
                buscar
            )
            .pipe(
                catchError(() => of([])),
                finalize(() => {
                    this.dataService.Spinner().hide("sp6");
                })
            )
            .subscribe((response) => {
                this.asyncLoadGrillaServidorSuccess(response.data, buscar);
            });
    };

    asyncLoadGrillaServidor = (p: string, pp: string) => {
        this.dataService.Spinner().show("sp6");
        const state = this.getState();

        const buscar = state.formBuscarServidorModel.buscarServidorModel;

        if (p && pp) {
            buscar.p = p;
            buscar.pp = pp;
        }

        this.dataService
            .Asistencia()
            .getBandejaServidor(
                state.grillaBandejaServidorModel.idControlAsistencia,
                buscar
            )
            .pipe(
                catchError(() => of([])),
                finalize(() => {
                    this.dataService.Spinner().hide("sp6");
                })
            )
            .subscribe((response) => {
                this.asyncLoadGrillaServidorSuccess(response.data, buscar);
            });
    };

    asyncLoadGrillaServidorPostIncidencia = () => {
        const buscar = this.getState().formBuscarServidorModel
            .buscarServidorModel;

        let p = "1";
        let pp = "10";
        if (buscar) {
            if (buscar.p && buscar.pp) {
                p = buscar.p;
                pp = buscar.pp;
            }
        }

        this.asyncLoadGrillaServidor(p, pp);
    };

    private asyncLoadGrillaServidorSuccess = (
        items,
        buscar: BuscarServidorModel
    ) => {
        let totalRow = 0;
        const state = this.getState();
        if ((items || []).length > 0) {
            totalRow = (items[0] || [{ totalRegistro: 0 }]).totalRegistro;
        } else {
            totalRow = 0;
            this.dataService
                .Message()
                .msgWarning(
                    "No se encontró información para los criterios de búsqueda ingresado",
                    () => {}
                );
        }

        const newItems = items.map((x) => ({
            ...x,
            sinIncidencias: x.sinIncidencias
                ? true
                : state.grillaBandejaServidorModel.selectArray.indexOf(
                      x.idAsistenciaServidor
                  ) > -1
                ? true
                : false,
        }));

        this.setState(
            update(state, {
                grillaBandejaServidorModel: {
                    servidores: {
                        data: { $set: newItems },
                    },
                    totalRow: { $set: totalRow },
                    loading: { $set: false },
                },
                formBuscarServidorModel: {
                    buscarServidorModel: {
                        p: { $set: buscar.p },
                        pp: { $set: buscar.pp },
                    },
                },
            })
        );
    };

    //#region Check-Sin-Incidencia
    asyncControlIncidencia = (
        servidor: ServidorListaModel,
        checked: boolean
    ) => {
        for (let item of this.getState().grillaBandejaServidorModel.servidores
            .data) {
            if (item.idAsistenciaServidor == servidor.idAsistenciaServidor)
                item.sinIncidencias = checked;
        }

        if (checked) {
            this.pushSelectArray(servidor.idAsistenciaServidor);
        } else {
            this.spliceSelectArray(servidor.idAsistenciaServidor);
        }
    };

    private pushSelectArray = (idAsistenciaServidor: number) => {
        const state = this.getState();
        const grilla = state.grillaBandejaServidorModel;
        let seleccionados: Array<number> = grilla.selectArray;

        if (seleccionados.indexOf(idAsistenciaServidor) == -1)
            seleccionados.push(idAsistenciaServidor);

        this.setState(
            update(state, {
                grillaBandejaServidorModel: {
                    selectArray: { $set: seleccionados },
                },
            })
        );
    };

    private spliceSelectArray = (idAsistenciaServidor: number) => {
        const state = this.getState();
        const grilla = state.grillaBandejaServidorModel;
        let seleccionados: Array<number> = grilla.selectArray;

        const index = seleccionados.indexOf(idAsistenciaServidor, 0);
        if (index > -1) seleccionados.splice(index, 1);

        this.setState(
            update(state, {
                grillaBandejaServidorModel: {
                    selectArray: { $set: seleccionados },
                },
            })
        );
    };

    //#endregion

    //#endregion

    //#region form-busqueda-bandeja-servidor
    asynComboTiposDocumento = () => {
        this.dataService.Spinner().show("sp6");

        return this.dataService
            .Asistencia()
            .getComboTiposDocumento()
            .pipe(
                catchError(() => of([])),
                finalize(() => {
                    this.dataService.Spinner().hide("sp6");
                })
            )
            .subscribe((response) => {
                const state = this.getState();
                this.setState(
                    update(state, {
                        grillaBandejaServidorModel: {
                            filterLists: {
                                tiposDocumentos: { $set: response.data },
                            },
                        },
                    })
                );
            });
    };

    asynComboRegimenesLaboral = () => {
        this.dataService.Spinner().show("sp6");

        return this.dataService
            .Asistencia()
            .getComboRegimesLaborales()
            .pipe(
                catchError(() => of([])),
                finalize(() => {
                    this.dataService.Spinner().hide("sp6");
                })
            )
            .subscribe((response) => {
                const state = this.getState();
                this.setState(
                    update(state, {
                        grillaBandejaServidorModel: {
                            filterLists: {
                                regimenesLaboral: { $set: response.data },
                            },
                        },
                    })
                );
            });
    };

    getFormBusquedaBandejaServidorModel = () => {
        return this.getState().formBuscarServidorModel.buscarServidorModel;
    };

    setFormBusquedaBandejaServidorModel = (
        form: BuscarServidorModel,
        p: string,
        pp: string
    ) => {
        const state = this.getState();
        form.p = p;
        form.pp = pp;

        this.setState(
            update(state, {
                formBuscarServidorModel: {
                    buscarServidorModel: { $set: form },
                },
                grillaBandejaServidorModel: {
                    selectArray: { $set: [] },
                },
            })
        );
    };
    //#endregion

    //#region acciones
    setBandejaServidor = (idControlAsistencia: number) => {
        const state = this.getState();
        this.setState(
            update(state, {
                title: { $set: "Registrar asistencia mensual" },
                grillaBandejaServidorModel: {
                    idControlAsistencia: { $set: idControlAsistencia },
                },
            })
        );
    };

    asyncDownloadExcel = () => {
        this.dataService.Spinner().show("sp6");
        const state = this.getState();
        const buscar = state.formBuscarServidorModel.buscarServidorModel;
        this.dataService
            .Asistencia()
            .postExcelControlAsistenciaMensual(
                state.grillaBandejaServidorModel.idControlAsistencia,
                buscar
            )
            .pipe(
                catchError((e) => of(null)),
                finalize(() => {
                    this.dataService.Spinner().hide("sp6");
                })
            )
            .subscribe((response) => {
                if (response) {
                    const nameFile = "Control_asistencia_servidor.xlsx";
                    saveAs(response, nameFile);
                }
            });
    };

    //#region save
    asyncSaveSinIncidenciasValid = (): boolean => {
        const state = this.getState();
        return state.grillaBandejaServidorModel.selectArray.length > 0;
    };

    asyncSaveSinIncidencias = (usuario: string) => {
        this.dataService.Spinner().show("sp6");
        const state = this.getState();
        return new Promise((resolve, reject) => {
            this.dataService
                .Asistencia()
                .saveSinIncidenciaServidor(
                    state.grillaBandejaServidorModel.selectArray,
                    usuario
                )
                .pipe(
                    catchError(() => of([])),
                    finalize(() => {
                        this.dataService.Spinner().hide("sp6");
                    })
                )
                .subscribe(
                    (resp) => {
                        resolve(resp);
                    },
                    (err) => {
                        reject(err);
                    }
                );
        });
    };

    asyncSaveSinIncidenciasSuccess = () => {
        this.asyncLoadGrillaServidorPostIncidencia();
        const state = this.getState();

        this.setState(
            update(state, {
                grillaBandejaServidorModel: {
                    selectArray: { $set: new Array() },
                },
            })
        );
    };
    //#endregion

    //#endregion

    setModalCargando = (show: boolean) => {
        if (show) {
            this.dataService.Spinner().show("sp6");
        } else {
            this.dataService.Spinner().hide("sp6");
        }
    };
}
