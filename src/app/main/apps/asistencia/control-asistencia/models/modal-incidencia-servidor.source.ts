import { of } from "rxjs";
import { ModalIncidenciaModel } from "../bandeja-servidor.model";
import { DataService } from "app/core/data/data.service";
import { catchError, finalize } from "rxjs/operators";
import update from "immutability-helper";
import { IncidenciaListaModel } from "../bandeja-servidor.model";
import { TipoRegistroEnum } from "../../../../_utils/enum";
import * as moment from "moment";

export class ModalIncidenciaServidorSource {
    constructor(
        private getState: () => ModalIncidenciaModel,
        private setState: (newState: ModalIncidenciaModel) => void,
        private dataService: DataService
    ) {}

    //#region init
    setModalIncidencia = (
        idAsistenciaServidor: string,
        idTipoIncidencia: number,
        title: string,
        onlyFecha: boolean,
        mes: string,
        anio: number
    ) => {
        const state = this.getState();
        let displayedColumns: string[];
        if (onlyFecha) {
            displayedColumns = ["registro", "fechaIncidencia", "accion"];
        } else {
            displayedColumns = [
                "registro",
                "fechaIncidencia",
                "horas",
                "minutos",
                "accion",
            ];
        }
        const fechas = this.setFechas(mes, anio);
        this.setState(
            update(state, {
                title: { $set: title },
                idAsistenciaServidor: { $set: idAsistenciaServidor },
                idTipoIncidencia: { $set: idTipoIncidencia },
                onlyFecha: { $set: onlyFecha },
                displayedColumns: { $set: displayedColumns },
                dateMax: { $set: fechas.dateMax },
                dateMin: { $set: fechas.dateMin },
            })
        );
    };

    getModalIncidencia = () => {
        return this.getState();
    };

    resetModalIncidencia = () => {
        this.setState(new ModalIncidenciaModel());
    };
    //#endregion

    asynGrillaModalIncidencia = () => {
        this.dataService.Spinner().show("sp6");
        const state = this.getState();

        const idAsistenciaServidor = state.idAsistenciaServidor;
        const idTipoIncidencia = state.idTipoIncidencia;

        return this.dataService
            .Asistencia()
            .getModalIncidenciaServidor(
                idAsistenciaServidor.toString(),
                idTipoIncidencia.toString()
            )
            .pipe(
                catchError(() => of([])),
                finalize(() => {
                    this.dataService.Spinner().hide("sp6");
                })
            )
            .subscribe((response) => {
                let totalRow = 0;
                if ((response.data || []).length > 0) {
                    totalRow = response.data.length;
                }

                this.setState(
                    update(state, {
                        incidencias: {
                            $set: response.data,
                        },
                        incidenciasNoVisual: { $set: response.data },
                        totalRow: { $set: totalRow },
                    })
                );
            });
    };

    //#region acciones
    asyncValidarIncidencia = (form: any): boolean => {
        const state = this.getState();
        if (state.onlyFecha) {
            if (form.fechaIncidencia) {
                const f = moment(form.fechaIncidencia).isValid();
                if (f) {
                    const listaReglaUno = state.incidencias.filter(
                        (x) =>
                            x.fechaIncidencia ===
                            moment(form.fechaIncidencia).format("DD/MM/YYYY")
                    );

                    return !(listaReglaUno.length > 0);
                }
                return false;
            }
            return false;
        } else {
            //if (form.fechaIncidencia && form.horas && form.minutos) {
            const h = Number.isInteger(form.horas);
            const m = Number.isInteger(form.minutos);
            const f = moment(form.fechaIncidencia).isValid();

            if (h && m) {
                const suma = form.horas + form.minutos;
                if (suma > 0 && f) {
                    if (form.horas >= 24) {
                        // no puedo ingresar mas de 24 horas ?
                        return false;
                    }
                    if (form.minutos >= 60) {
                        // no puedo ingresar mas de 60 minutos ?
                        return false;
                    }
                }
            }

            const listaReglaUno = state.incidencias.filter(
                (x) =>
                    x.fechaIncidencia ===
                    moment(form.fechaIncidencia).format("DD/MM/YYYY")
            );

            const r = !(listaReglaUno.length > 0);

            return h && m && f && r;
        }
    };

    asyncAgregarIncidencia = (form: any) => {
        const state = this.getState();
        const lista = state.incidencias;
        const totalRow = lista.length;
        const nuevaFecha = moment(form.fechaIncidencia).format("DD/MM/YYYY");
        let cantidadIncidencia = null;
        let horas = null;
        let minutos = null;

        if (state.onlyFecha) {
            cantidadIncidencia = 1; // por dia
        } else {
            cantidadIncidencia = form.horas * 60 + form.minutos; // por minutos
            horas = form.horas;
            minutos = form.minutos;
        }

        const incidencia = this.createIncidencia(
            horas,
            minutos,
            cantidadIncidencia,
            nuevaFecha,
            totalRow,
            "usuarioFalta"
        );
        this.addIncidencia(incidencia);
    };

    private addIncidencia = (incidencia: IncidenciaListaModel) => {
        const listaNoVisual = this.getState().incidenciasNoVisual;
        listaNoVisual.push(incidencia);
        this.setIncidenciasAdd(listaNoVisual);
    };

    private setIncidenciasAdd = (listaNoVisual: any[]) => {
        const listaNew = listaNoVisual.filter((x) => !x.eliminado);

        this.setState(
            update(this.getState(), {
                loading: { $set: false },
                incidencias: {
                    $set: listaNew,
                },
                incidenciasNoVisual: { $set: listaNoVisual },
                totalRow: { $set: listaNew.length },
            })
        );
    };

    private createIncidencia(
        horas: number,
        minutos: number,
        cantidadIncidencia: number,
        fechaIncidencia: string,
        totalRow: number,
        createIncidencia: string
    ): IncidenciaListaModel {
        const state = this.getState();

        return {
            registro: totalRow + 1,
            fechaIncidencia: fechaIncidencia,
            //fechaIncidencia: "2020-08-01",
            horas: horas,
            minutos: minutos,
            cantidadIncidencia: cantidadIncidencia,
            usuarioCreacion: createIncidencia,

            idIncidencia: null,
            idAsistenciaServidor: state.idAsistenciaServidor,
            idTipoIncidencia: state.idTipoIncidencia,
            idTipoRegistro: TipoRegistroEnum.INDIVIDUAL,
            hovered: false,
            eliminado: false,
        };
    }

    deleteIncidencia = (registro: number) => {
        const listaNoVisual = this.getState().incidenciasNoVisual;
        this.setIncidenciasDelete(listaNoVisual, registro);
    };

    private setIncidenciasDelete = (listaNoVisual: any[], registro: number) => {
        let registroNew = 0;
        //la lista general  (listaNoVisual) se busca los no eliminados (false)
        //para asignar el nro de la lista (registroNew)
        //se marca eliminado el item que tenga el mismo nro (registro) y no sea eliminado (false)
        const listaNew = listaNoVisual.map((x, index) => {
            if (!x.eliminado) {
                if (registro == x.registro) {
                    x["eliminado"] = true;
                    //registroNew = registroNew - 1;
                } else {
                    registroNew = registroNew + 1;
                    x["registro"] = registroNew;
                }
            }
            return {
                ...x,
            };
        });

        //de la nueva lista se filtra los que no son eliminados para mostrar en la grilla
        const listaSinEliminados = listaNew.filter((x) => !x.eliminado);
        //como la grilla lista items temporales y de BD, es necesario quedarnos solo con data que va impactar en la BD
        //entonces se filta los registros temporales eliminados, quedanso solo items temporales sin eliminar e items de DB eliminados

        let listaReal = listaNew.map((x, i) => {
            let conforme = true;
            if (x.idIncidencia == null) {
                if (x.eliminado) {
                    conforme = false;
                }
            }
            if (conforme) {
                return {
                    ...x,
                };
            }
        });

        listaReal = listaReal.filter((x) => x != undefined);

        this.setState(
            update(this.getState(), {
                loading: { $set: false },

                incidencias: {
                    $set: listaSinEliminados,
                },
                incidenciasNoVisual: { $set: listaReal },
                totalRow: { $set: listaSinEliminados.length },
            })
        );
    };

    asynSaveIncidenciasValid = () => {
        const state = this.getState();
        //registro eliminado
        const listaReglaUno = state.incidenciasNoVisual.filter(
            (x) => x.idIncidencia && x.eliminado
        );
        //registro nuevo
        const listaReglaDos = state.incidenciasNoVisual.filter(
            (x) => x.idIncidencia == null && !x.eliminado
        );
        let cantidadUno = 0;
        let cantidadDos = 0;
        if (listaReglaUno) {
            cantidadUno = listaReglaUno.length;
        }
        if (listaReglaDos) {
            cantidadDos = listaReglaDos.length;
        }
        return cantidadUno + cantidadDos > 0;
    };

    asynSaveIncidencias = (): Promise<any> => {
        const state = this.getState();
        return new Promise((resolve, reject) => {
            this.dataService
                .Asistencia()
                .saveIncidenciasServidor(
                    state.idAsistenciaServidor.toString(),
                    state.incidenciasNoVisual
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
    //#endregion

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

    private setFechas = (mes: string, anio: number) => {
        const idMes = this.getIdMes(mes);
        const mesNuevo = moment([anio, idMes - 1]); //conteo de meses empieza en 0
        const startOfMonth = mesNuevo
            .startOf("month")
            .format("YYYY-MM-DD HH:mm");
        const endOfMonth = mesNuevo.endOf("month").format("YYYY-MM-DD HH:mm");

        return {
            dateMin: new Date(startOfMonth),
            dateMax: new Date(endOfMonth),
        };
    };
}
