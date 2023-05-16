import { EstadoCalificacionEnum, EtapaCalificacionResultadoPreliminarEnum, EtapaCalificacionResultadoFinalEnum} from '../_utils/constants';
import { selectPageSizeDefault, pageSizeGrilla } from '../_utils/grilla';
export class bandejaCalificacionPUNModel {
  constructor() {
    this.configurarPermisosAcciones();
  }
  private _idFlujoEstado: number = 0;

  private _verCargaMaisva: boolean;
  private _verEliminarCargaMaisva: boolean;
  private _verGenerarOrdenDeMeritoPreliminar: boolean;
  private _verPublicarCuadorDeMeritoPreliminar: boolean;
  private _verCuadroDeMeritoPreliminar: boolean;
  private _verGenerarOrdenDeMeritoFinal: boolean;
  private _verPublicarCuadorDeMeritoFinal: boolean;
  private _verCuadroDeMeritoFinal: boolean;
  private _permisoAccionesCMPreliminar: any[];
  private _permisoAccionesCMFinal: any[];
  private _etapaCuadroDeMeritoPreliminar: number = 0;
  private _etapaCuadroDeMeritoFinal: number = 0;

  private _controlesActivos: any;

  private configurarPermisosAcciones = () => {
    this._permisoAccionesCMPreliminar = [
      {
        acciones: "REALIZARCALIFICACION",
        etapas: [
          {
            conReclamo: [false],
            codigos: [
              EtapaCalificacionResultadoPreliminarEnum.EN_PROCESO
            ],
            estadoPermitidos: [
              EstadoCalificacionEnum.PENDIENTE,
              EstadoCalificacionEnum.APTO,
              EstadoCalificacionEnum.NO_APTO,
              EstadoCalificacionEnum.OBSERVADO,
            ]
          }
        ]
      },
      {
        acciones: "VERINFORMACIONCOMPLETA",
        etapas: [
          {
            conReclamo: [false, true],
            codigos: [
              EtapaCalificacionResultadoPreliminarEnum.FINALIZADO
            ],
            estadoPermitidos: [
              EstadoCalificacionEnum.APTO,
              EstadoCalificacionEnum.NO_APTO,
              EstadoCalificacionEnum.OBSERVADO,
            ]
          }
        ]
      },
      {
        acciones: "OBSERVAR",
        etapas: [
          {
            conReclamo: [false],
            codigos: [
              EtapaCalificacionResultadoPreliminarEnum.EN_PROCESO
            ],
            estadoPermitidos: [
              EstadoCalificacionEnum.PENDIENTE,
              EstadoCalificacionEnum.APTO,
              EstadoCalificacionEnum.NO_APTO
            ]
          }
        ]
      },
      {
        acciones: "VEROBSERVAR",
        etapas: [
          {
            conReclamo: [false, true],
            codigos: [
              EtapaCalificacionResultadoPreliminarEnum.EN_PROCESO,
              EtapaCalificacionResultadoPreliminarEnum.FINALIZADO
            ],
            estadoPermitidos: [
              EstadoCalificacionEnum.OBSERVADO
            ]
          }
        ]
      },
      {
        acciones: "VERRECLAMO",
        etapas: [
          {
            conReclamo: [true],
            codigos: [
              EtapaCalificacionResultadoPreliminarEnum.FINALIZADO
            ],
            estadoPermitidos: [
              EstadoCalificacionEnum.APTO,
              EstadoCalificacionEnum.NO_APTO,
              EstadoCalificacionEnum.OBSERVADO,
            ]
          }
        ]
      },
      {
        acciones: "REGISTRARRECLAMO",
        etapas: [
          {
            conReclamo: [false],
            codigos: [
              EtapaCalificacionResultadoPreliminarEnum.FINALIZADO
            ],
            estadoPermitidos: [
              EstadoCalificacionEnum.APTO,
              EstadoCalificacionEnum.NO_APTO,
              EstadoCalificacionEnum.OBSERVADO,
            ]
          }
        ]
      }
    ];
    this._permisoAccionesCMFinal = [
      {
        acciones: "REALIZARCALIFICACION",
        etapas: [
          {
            conReclamoResultadoFinal: [false, true],
            conReclamoResultadoPreliminar: [true],
            codigos: [
              EtapaCalificacionResultadoFinalEnum.EN_PROCESO
            ],
            estadoPermitidos: [
              EstadoCalificacionEnum.APTO,
              EstadoCalificacionEnum.NO_APTO,
              EstadoCalificacionEnum.OBSERVADO,
            ]
          }
        ]
      },
      {
        acciones: "VERINFORMACIONCOMPLETA",
        etapas: [
          {
            conReclamoResultadoFinal: [false],
            conReclamoResultadoPreliminar: [false],
            codigos: [
              EtapaCalificacionResultadoFinalEnum.EN_PROCESO
            ],
            estadoPermitidos: [
              EstadoCalificacionEnum.APTO,
              EstadoCalificacionEnum.NO_APTO,
              EstadoCalificacionEnum.OBSERVADO,
            ]
          },
          {
            conReclamoResultadoFinal: [false],
            conReclamoResultadoPreliminar: [true, false],
            codigos: [
              EtapaCalificacionResultadoFinalEnum.FINALIZADO
            ],
            estadoPermitidos: [
              EstadoCalificacionEnum.APTO,
              EstadoCalificacionEnum.NO_APTO,
              EstadoCalificacionEnum.OBSERVADO,
            ]
          }
        ]
      },
      {
        acciones: "OBSERVAR",
        etapas: [
          {
            conReclamoResultadoFinal: [false, true],
            conReclamoResultadoPreliminar: [true],
            codigos: [
              EtapaCalificacionResultadoFinalEnum.EN_PROCESO
            ],
            estadoPermitidos: [
              EstadoCalificacionEnum.APTO,
              EstadoCalificacionEnum.NO_APTO
            ]
          }
        ]
      },
      {
        acciones: "VEROBSERVAR",
        etapas: [
          {
            conReclamoResultadoFinal: [true, false],
            conReclamoResultadoPreliminar: [false, true],
            codigos: [
              EtapaCalificacionResultadoFinalEnum.EN_PROCESO
            ],
            estadoPermitidos: [
              EstadoCalificacionEnum.OBSERVADO
            ]
          },
          {
            conReclamoResultadoFinal: [false],
            conReclamoResultadoPreliminar: [false, true],
            codigos: [
              EtapaCalificacionResultadoFinalEnum.FINALIZADO
            ],
            estadoPermitidos: [
              EstadoCalificacionEnum.OBSERVADO
            ]
          }
        ]
      },
      {
        acciones: "VERRECLAMO",
        etapas: [
          {
            conReclamoResultadoFinal: [true, false],
            conReclamoResultadoPreliminar: [true],
            codigos: [
              EtapaCalificacionResultadoFinalEnum.EN_PROCESO,
              EtapaCalificacionResultadoFinalEnum.FINALIZADO
            ],
            estadoPermitidos: [
              EstadoCalificacionEnum.APTO,
              EstadoCalificacionEnum.NO_APTO,
              EstadoCalificacionEnum.OBSERVADO,
            ]
          }
        ]
      }
    ];
  }


  private mostrarAccionResultadoPreliminar = (
    tipoAccion: string,
    conReclamoResultadoPreliminar: boolean,
    estado: number
  ): boolean => {
    var accion = this._permisoAccionesCMPreliminar.find(x => x.acciones == tipoAccion);
    let mostrarAccion: boolean = accion.etapas?.some(x =>
      x.codigos.some(c => c == this._etapaCuadroDeMeritoPreliminar)
      && x.conReclamo?.some(e => e == conReclamoResultadoPreliminar)
      && x.estadoPermitidos?.some(e => e == estado)
    );

    return mostrarAccion;
  }

  mostrarRealizarCalificacionPreliminar = (
    conReclamoResultadoPreliminar: boolean,
    estado: number,
  ): boolean => this.mostrarAccionResultadoPreliminar(
    "REALIZARCALIFICACION",
    conReclamoResultadoPreliminar,
    estado
  ) && this._controlesActivos.btnRealizarCalificacion;

  mostrarVerInformacionCompletaPreliminar = (
    conReclamoResultadoPreliminar: boolean,
    estado: number,
  ): boolean => this.mostrarAccionResultadoPreliminar(
    "VERINFORMACIONCOMPLETA",
    conReclamoResultadoPreliminar,
    estado
  );

  mostrarObservarPreliminar = (
    conReclamoResultadoPreliminar: boolean,
    estado: number,
  ): boolean => this.mostrarAccionResultadoPreliminar(
    "OBSERVAR",
    conReclamoResultadoPreliminar,
    estado
  ) && this._controlesActivos.btnObservarPostulante;

  mostrarVerObservarPreliminar = (
    conReclamoResultadoPreliminar: boolean,
    estado: number,
  ): boolean => this.mostrarAccionResultadoPreliminar(
    "VEROBSERVAR",
    conReclamoResultadoPreliminar,
    estado
  );

  mostrarVerReclamoPreliminar = (
    conReclamoResultadoPreliminar: boolean,
    estado: number,
  ): boolean => this.mostrarAccionResultadoPreliminar(
    "VERRECLAMO",
    conReclamoResultadoPreliminar,
    estado
  );

  mostrarRegistrarReclamoPreliminar = (
    conReclamoResultadoPreliminar: boolean,
    estado: number,
  ): boolean => this.mostrarAccionResultadoPreliminar(
    "REGISTRARRECLAMO",
    conReclamoResultadoPreliminar,
    estado
  ) && this._controlesActivos.btnRegistrarReclamo;

  private mostrarAccionResultadoFinal = (
    tipoAccion: string,
    conReclamoResultadoPreliminar: boolean,
    conReclamoResultadoFinal: boolean,
    estado: number
  ): boolean => {
    let mostrarAccion: boolean = false;
    var accion = this._permisoAccionesCMFinal
      .find(x => x.acciones == tipoAccion);
    var etapas = accion?.etapas
      .find(x =>
        x.codigos.some(c => c == this._etapaCuadroDeMeritoFinal)
        && x.conReclamoResultadoPreliminar.some(c => c == conReclamoResultadoPreliminar)
        && x.conReclamoResultadoFinal.some(c => c == conReclamoResultadoFinal)
      );
    mostrarAccion = etapas?.estadoPermitidos.some(x => x == estado);
    return mostrarAccion;
  }

  mostrarRealizarCalificacionFinal = (
    conReclamoResultadoPreliminar: boolean,
    conReclamoResultadoFinal: boolean,
    estado: number,
  ): boolean => this.mostrarAccionResultadoFinal(
    "REALIZARCALIFICACION",
    conReclamoResultadoPreliminar,
    conReclamoResultadoFinal,
    estado
  ) && this._controlesActivos.btnRealizarCalificacion;

  mostrarVerInformacionCompletaFinal = (
    conReclamoResultadoPreliminar: boolean,
    conReclamoResultadoFinal: boolean,
    estado: number
  ): boolean => this.mostrarAccionResultadoFinal(
    "VERINFORMACIONCOMPLETA",
    conReclamoResultadoPreliminar,
    conReclamoResultadoFinal,
    estado
  );

  mostrarObservarFinal = (
    conReclamoResultadoPreliminar: boolean,
    conReclamoResultadoFinal: boolean,
    estado: number
  ): boolean => this.mostrarAccionResultadoFinal(
    "OBSERVAR",
    conReclamoResultadoPreliminar,
    conReclamoResultadoFinal,
    estado
  ) && this._controlesActivos.btnObservarPostulante;

  mostrarVerObservarFinal = (
    conReclamoResultadoPreliminar: boolean,
    conReclamoResultadoFinal: boolean,
    estado: number,
  ): boolean => this.mostrarAccionResultadoFinal(
    "VEROBSERVAR",
    conReclamoResultadoPreliminar,
    conReclamoResultadoFinal,
    estado
  );

  mostrarVerReclamoFinal = (
    conReclamoResultadoPreliminar: boolean,
    conReclamoResultadoFinal: boolean,
    estado: number
  ): boolean => this.mostrarAccionResultadoFinal(
    "VERRECLAMO",
    conReclamoResultadoPreliminar,
    conReclamoResultadoFinal,
    estado
  );

  public setFlujoEstado = (flujoEstado: any) => {
    if (flujoEstado != null) {
      var metaData = JSON.parse(flujoEstado.metaData);
      this._idFlujoEstado = flujoEstado.idFlujoEstado;
      this._verCargaMaisva = metaData.VerCargaMaisva;
      this._verEliminarCargaMaisva = metaData.VerEliminarCargaMaisva;
      this._verGenerarOrdenDeMeritoPreliminar = metaData.VerGenerarOrdenDeMeritoPreliminar;
      this._verPublicarCuadorDeMeritoPreliminar = metaData.VerPublicarCuadorDeMeritoPreliminar;
      this._verCuadroDeMeritoPreliminar = metaData.VerCuadroDeMeritoPreliminar;
      this._verGenerarOrdenDeMeritoFinal = metaData.VerGenerarOrdenDeMeritoFinal;
      this._verPublicarCuadorDeMeritoFinal = metaData.VerPublicarCuadorDeMeritoFinal;
      this._verCuadroDeMeritoFinal = metaData.VerCuadroDeMeritoFinal;
      this._etapaCuadroDeMeritoPreliminar = metaData.EtapaCuadroDeMeritoPreliminar;
      this._etapaCuadroDeMeritoFinal = metaData.EtapaCuadroDeMeritoFinal;
    }
  }

  getIdFlujoEstado = () => this._idFlujoEstado;

  verCargaMaisva = () => this._verCargaMaisva 
                         && this._controlesActivos.btnCargaMassiva;
  verEliminarCargaMaisva = () => this._verEliminarCargaMaisva 
                                  && this._controlesActivos.btnEliminarCargaMasiva;
  verGenerarOrdenDeMeritoPreliminar = () => this._verGenerarOrdenDeMeritoPreliminar && this._controlesActivos.btnGenerarOrdenMerito;
  verPublicarCuadorDeMeritoPreliminar = () => this._verPublicarCuadorDeMeritoPreliminar 
                                              && this._controlesActivos.btnPublicarCuadroMeritoPreliminar;
  verCuadroDeMeritoPreliminar = () => this._verCuadroDeMeritoPreliminar;
  verGenerarOrdenDeMeritoFinal = () => this._verGenerarOrdenDeMeritoFinal;
  verPublicarCuadorDeMeritoFinal = () => this._verPublicarCuadorDeMeritoFinal 
                                         && this._controlesActivos.btnPublicarCuadroMeritoFinal;
  verCuadroDeMeritoFinal = () => this._verCuadroDeMeritoFinal;

  setAccesoUsuario = (data: any) => {
                this._controlesActivos = { 
                    btnCargaMassiva:data.cargaMasiva,
                    btnEliminarCargaMasiva:data.eliminarCargaMasiva,
                    btnGenerarOrdenMerito:data.generarOrdenMerito, 
                    btnPublicarCuadroMeritoFinal:data.publicarCuadroMeritoFinal, 
                    btnPublicarCuadroMeritoPreliminar:data.publicarCuadroMeritoPreliminar, 

                    btnPublicarResultadoFinal:data.publicarResultadoFinal, 
                    btnPublicarResultadoPreliminar:data.publicarResultadoPreliminar, 

                    btnObservarPostulante: data.observarPostulante,
                    btnRealizarCalificacion:data.realizarCalificacion, 
                    btnRegistrarReclamo:data.registrarReclamo,
                 }; 
  }
  getConfiguracionPaginacion = (): any => {
    return {
      'selectPageSize': selectPageSizeDefault,
      'pageSize': pageSizeGrilla
    }
  };
}
