import { CalificacionEtapaEnum, EstadoCalificacionEnum, EtapaCalificacionResultadoPreliminarEnum, EtapaCalificacionResultadoFinalEnum, EtapaCalificacionEnum } from '../_utils/constants';

export class bandejaCalificacionModel {
	constructor() {
		this.configurarPermisosAcciones();
	}
	private _verResultadoPreliminar: boolean = false;
	private _verPdfResultadoPreliminar: boolean = false;
	private _verResultadoFinal: boolean = false;
	private _verPdfResultadoFinal: boolean = false;
	private _idFlujoEstado: number = 0;
	private _idEtapa: number = 0;
	private _accionesPublicacionPreliminar: any[];
	private _accionesOtraIteracionPublicacionPreliminar: any[];
	private _accionesPublicacionFinal: any[];
	private _accionesOtraIteracionPublicacionFinal: any[];

	private configurarPermisosAcciones = () => {
		this._accionesOtraIteracionPublicacionPreliminar = [
			{
				accion: "VEROBSERVACION",
				etapas: [
					{
						conReclamo: [true, false],
						estadoPermitidos: [
							EstadoCalificacionEnum.OBSERVADO
						]
					}
				]
			},
			{
				accion: "VERINFORMACIONCOMPLETA",
				etapas: [
					{
						conReclamo: [true, false],
						estadoPermitidos: [
							EstadoCalificacionEnum.APTO,
							EstadoCalificacionEnum.NO_APTO,
							EstadoCalificacionEnum.OBSERVADO
						]
					}
				]
			},
			{
				accion: "VERRECLAMO",
				etapas: [
					{
						conReclamo: [true],
						estadoPermitidos: [
							EstadoCalificacionEnum.APTO,
							EstadoCalificacionEnum.NO_APTO,
							EstadoCalificacionEnum.OBSERVADO
						]
					}
				]
			}
		];
		this._accionesPublicacionPreliminar = [
			{
				accion: "REVISARREQUISITOS",
				etapas: [
					{
						codigos: [
							EtapaCalificacionResultadoPreliminarEnum.EN_PROCESO
						],
						conReclamoResultadoPreliminar: [false],
						estadoPermitidos: [
							EstadoCalificacionEnum.PENDIENTE,
							EstadoCalificacionEnum.APTO,
							EstadoCalificacionEnum.NO_APTO,
							EstadoCalificacionEnum.OBSERVADO
						]
					}
				]
			},
			{
				accion: "OBSERVARPOSTULANTE",
				etapas: [
					{
						codigos: [
							EtapaCalificacionResultadoPreliminarEnum.EN_PROCESO
						],
						conReclamoResultadoPreliminar: [false],
						estadoPermitidos: [
							EstadoCalificacionEnum.PENDIENTE,
							EstadoCalificacionEnum.APTO,
							EstadoCalificacionEnum.NO_APTO
						]
					}
				]
			},
			{
				accion: "VEROBSERVACION",
				etapas: [
					{
						codigos: [
							EtapaCalificacionResultadoPreliminarEnum.EN_PROCESO,
							EtapaCalificacionResultadoPreliminarEnum.FINALIZADO,

						],
						conReclamoResultadoPreliminar: [true, false],
						estadoPermitidos: [
							EstadoCalificacionEnum.OBSERVADO
						]
					}
				]
			},
			{
				accion: "VERINFORMACIONCOMPLETA",
				etapas: [
					{
						codigos: [
							EtapaCalificacionResultadoPreliminarEnum.FINALIZADO
						],
						conReclamoResultadoPreliminar: [true, false],
						estadoPermitidos: [
							EstadoCalificacionEnum.APTO,
							EstadoCalificacionEnum.NO_APTO,
							EstadoCalificacionEnum.OBSERVADO
						]
					}
				]
			},
			{
				accion: "REGISTRARRECLAMO",
				etapas: [
					{
						codigos: [
							EtapaCalificacionResultadoPreliminarEnum.FINALIZADO
						],
						conReclamoResultadoPreliminar: [false],
						estadoPermitidos: [
							EstadoCalificacionEnum.APTO,
							EstadoCalificacionEnum.NO_APTO,
							EstadoCalificacionEnum.OBSERVADO
						]
					}
				]
			},
			{
				accion: "VERRECLAMO",
				etapas: [
					{
						codigos: [
							EtapaCalificacionResultadoPreliminarEnum.FINALIZADO
						],
						conReclamoResultadoPreliminar: [true],
						estadoPermitidos: [
							EstadoCalificacionEnum.APTO,
							EstadoCalificacionEnum.NO_APTO,
							EstadoCalificacionEnum.OBSERVADO
						]
					}
				]
			}
		];
		this._accionesPublicacionFinal = [
			{
				accion: "REVISARREQUISITOS",
				etapas: [
					{
						codigos: [
							EtapaCalificacionResultadoFinalEnum.EN_PROCESO
						],
						conReclamoResultadoFinal: [true, false],
						conReclamoResultadoPreliminar: [true],
						estadoPermitidos: [
							EstadoCalificacionEnum.APTO,
							EstadoCalificacionEnum.NO_APTO,
							EstadoCalificacionEnum.OBSERVADO
						]
					}
				]
			},
			{
				accion: "OBSERVARPOSTULANTE",
				etapas: [
					{
						codigos: [
							EtapaCalificacionResultadoFinalEnum.EN_PROCESO
						],
						conReclamoResultadoFinal: [true, false],
						conReclamoResultadoPreliminar: [true],
						estadoPermitidos: [
							EstadoCalificacionEnum.APTO,
							EstadoCalificacionEnum.NO_APTO,
							EstadoCalificacionEnum.OBSERVADO
						]
					}
				]
			},
			{
				accion: "VEROBSERVACION",
				etapas: [
					{
						codigos: [
							EtapaCalificacionResultadoFinalEnum.EN_PROCESO,
						],
						conReclamoResultadoFinal: [true, false],
						conReclamoResultadoPreliminar: [false, true],
						estadoPermitidos: [
							EstadoCalificacionEnum.OBSERVADO
						]
					},
					{
						codigos: [
							EtapaCalificacionResultadoFinalEnum.FINALIZADO,
						],
						conReclamoResultadoFinal: [false],
						conReclamoResultadoPreliminar: [false, true],
						estadoPermitidos: [
							EstadoCalificacionEnum.OBSERVADO
						]
					}
				]
			},
			{
				accion: "VERINFORMACIONCOMPLETA",
				etapas: [
					{
						codigos: [
							EtapaCalificacionResultadoFinalEnum.EN_PROCESO,
						],
						conReclamoResultadoFinal: [false],
						conReclamoResultadoPreliminar: [false],
						estadoPermitidos: [
							EstadoCalificacionEnum.APTO,
							EstadoCalificacionEnum.NO_APTO,
							EstadoCalificacionEnum.OBSERVADO
						]
					},
					{
						codigos: [
							EtapaCalificacionResultadoFinalEnum.FINALIZADO,
						],
						conReclamoResultadoFinal: [false],
						conReclamoResultadoPreliminar: [false, true],
						estadoPermitidos: [
							EstadoCalificacionEnum.APTO,
							EstadoCalificacionEnum.NO_APTO,
							EstadoCalificacionEnum.OBSERVADO
						]
					}
				]
			},
			{
				accion: "VERRECLAMO",
				etapas: [
					{
						codigos: [
							EtapaCalificacionResultadoFinalEnum.EN_PROCESO
						],
						conReclamoResultadoFinal: [true],
						conReclamoResultadoPreliminar: [true],
						estadoPermitidos: [
							EstadoCalificacionEnum.APTO,
							EstadoCalificacionEnum.NO_APTO,
							EstadoCalificacionEnum.OBSERVADO
						]
					}
				]
			}
		];
		this._accionesOtraIteracionPublicacionFinal = [
			{
				accion: "VEROBSERVACION",
				etapas: [
					{
						conReclamo: [false],
						estadoPermitidos: [EstadoCalificacionEnum.OBSERVADO]
					}
				]
			},
			{
				accion: "VERINFORMACIONCOMPLETA",
				etapas: [
					{
						conReclamo: [false],
						estadoPermitidos: [
							EstadoCalificacionEnum.APTO,
							EstadoCalificacionEnum.NO_APTO,
							EstadoCalificacionEnum.OBSERVADO
						]
					}
				]
			}
		];
	}

	private _etapaResultadoPreliminar: number = 0;
	private mostrarAccionResultadoPreliminar = (
		tipoAccion: string,
		conReclamoResultadoPreliminar: boolean,
		estado: number,
		idIteracion: number = null
	): boolean => {
		let mostrarAccion: boolean = false;
		let evaluarOtraIteracion = (
		    tipoAccion: string,
		    conReclamoResultadoPreliminar: boolean,
		    estado: number
		 ):boolean => {
		     var accion = this._accionesOtraIteracionPublicacionPreliminar
		     .find(x => x.accion == tipoAccion);

		     var etapas = accion?.etapas.find(x =>
						      x.conReclamo
						      .some(c => c == conReclamoResultadoPreliminar)
						     );
		     let mostrarAccion = etapas?.estadoPermitidos.some(x => x == estado);
		     return mostrarAccion;
		}

		if(this._idEtapa == EtapaCalificacionEnum.EN_PROCESO){
		    if (idIteracion == this._idFlujoEstado) {
			var accion = this._accionesPublicacionPreliminar
			.find(x => x.accion == tipoAccion);
			var etapas = accion?.etapas.find(x =>
							 x.codigos
							 .some(c => c == this._etapaResultadoPreliminar)
							 && x.conReclamoResultadoPreliminar
							 .some(c => c == conReclamoResultadoPreliminar)
							);
							mostrarAccion = etapas?.estadoPermitidos.some(x => x == estado);
		    }

		    if(idIteracion != this._idFlujoEstado){
		       mostrarAccion = evaluarOtraIteracion(tipoAccion, conReclamoResultadoPreliminar,estado);

		    }
		}

		if(this._idEtapa == EtapaCalificacionEnum.FINALIZADO){
		       mostrarAccion = evaluarOtraIteracion(tipoAccion, conReclamoResultadoPreliminar,estado);
		}

		return mostrarAccion;
	}

	private _etapaResultadoFinal: number = 0;
	private mostrarAccionResultadoFinal = (
		tipoAccion: string,
		conReclamoResultadoPreliminar: boolean,
		conReclamoResultadoFinal: boolean,
		estado: number,
		idIteracion: number
	): boolean => {
	    let mostrarAccion:boolean = false;

	    let evaluarOtraIteracion =(
		tipoAccion: string,
		conReclamoResultadoFinal: boolean,
		estado: number
	    ):boolean => {
		var accion = this._accionesOtraIteracionPublicacionFinal
		.find(x => x.accion == tipoAccion);

		var etapas = accion?.etapas.find(x =>
						 x.conReclamo
						 .some(c => c == conReclamoResultadoFinal)
						);
		let mostrarAccion = etapas?.estadoPermitidos.some(x => x == estado);
		return mostrarAccion;
	    }

	    if(this._idEtapa == EtapaCalificacionEnum.EN_PROCESO){
		if(idIteracion == this._idFlujoEstado) {
		    var accion = this._accionesPublicacionFinal
		    .find(x => x.accion == tipoAccion);
		    var etapas = accion?.etapas
		    .find(x =>
			  x.codigos.some(c => c == this._etapaResultadoFinal)
			  && x.conReclamoResultadoPreliminar.some(c => c == conReclamoResultadoPreliminar)
			  && x.conReclamoResultadoFinal.some(c => c == conReclamoResultadoFinal)
			 );
			 mostrarAccion = etapas?.estadoPermitidos.some(x => x == estado);

		}

		if(idIteracion != this._idFlujoEstado){
		    mostrarAccion = evaluarOtraIteracion(tipoAccion,conReclamoResultadoFinal,estado);
		}
	    }
	    if(this._idEtapa == EtapaCalificacionEnum.FINALIZADO){
		mostrarAccion = evaluarOtraIteracion(tipoAccion,conReclamoResultadoFinal,estado);
	    }

	    return mostrarAccion;
	}
	public setFlujoEstado = (flujoEstado: any) => {
		if (flujoEstado != null) {
			var botones = JSON.parse(flujoEstado.metaData);
			this._verResultadoPreliminar = botones.VerResultadoPreliminar;
			this._verPdfResultadoPreliminar = botones.VerPdfResultadoPreliminar;
			this._verResultadoFinal = botones.VerResultadoFinal;
			this._verPdfResultadoFinal = botones.VerPdfResultadoFinal;
			this._idFlujoEstado = flujoEstado.idFlujoEstado;
			this._idEtapa = botones.Etapa;
			this._etapaResultadoPreliminar = botones.EtapaResultadoPreliminar;
			this._etapaResultadoFinal = botones.EtapaResultadoFinal;
		}
	}

	mostrarRevisarRequisitosResultadoPreliminar = (
		conReclamoResultadoPreliminar: boolean,
		estado: number,
		idIteracion: number = null
	): boolean => this.mostrarAccionResultadoPreliminar(
		"REVISARREQUISITOS",
		conReclamoResultadoPreliminar,
		estado,
		idIteracion
	);

	mostrarObservarPostulanteResultadoPreliminar = (
		conReclamoResultadoPreliminar: boolean,
		estado: number,
		idIteracion: number
	): boolean => this.mostrarAccionResultadoPreliminar(
		"OBSERVARPOSTULANTE",
		conReclamoResultadoPreliminar,
		estado,
		idIteracion
	);

	mostrarVerObservacionResultadoPreliminar = (
		conReclamoResultadoPreliminar: boolean,
		estado: number,
		idIteracion: number
	): boolean => this.mostrarAccionResultadoPreliminar(
		"VEROBSERVACION",
		conReclamoResultadoPreliminar,
		estado,
		idIteracion
	);

	mostrarVerInformacionCompletaResultadoPreliminar = (
		conReclamoResultadoPreliminar: boolean,
		estado: number,
		idIteracion: number 
	): boolean => this.mostrarAccionResultadoPreliminar(
		"VERINFORMACIONCOMPLETA",
		conReclamoResultadoPreliminar,
		estado,
		idIteracion
	);

	mostrarRegistrarReclamoResultadoPreliminar = (
		conReclamoResultadoPreliminar: boolean,
		estado: number,
		idIteracion: number
	): boolean => this.mostrarAccionResultadoPreliminar(
		"REGISTRARRECLAMO",
		conReclamoResultadoPreliminar,
		estado,
		idIteracion
	);

	mostrarVerReclamoResultadoPreliminar = (
		conReclamoResultadoPreliminar: boolean,
		estado: number,
		idIteracion: number
	): boolean => this.mostrarAccionResultadoPreliminar(
		"VERRECLAMO",
		conReclamoResultadoPreliminar,
		estado,
		idIteracion
	);

	mostrarRevisarRequisitosResultadoFinal = (
		conReclamoResultadoPreliminar: boolean,
		conReclamoResultadoFinal: boolean,
		estado: number,
		idIteracion: number
	): boolean => this.mostrarAccionResultadoFinal(
		"REVISARREQUISITOS",
		conReclamoResultadoPreliminar,
		conReclamoResultadoFinal,
		estado,
		idIteracion
	);

	mostrarObservarPostulanteResultadoFinal = (
		conReclamoResultadoPreliminar: boolean,
		conReclamoResultadoFinal: boolean,
		estado: number,
		idIteracion: number
	): boolean => this.mostrarAccionResultadoFinal(
		"OBSERVARPOSTULANTE",
		conReclamoResultadoPreliminar,
		conReclamoResultadoFinal,
		estado,
		idIteracion
	);

	mostrarVerObservacionResultadoFinal = (
		conReclamoResultadoPreliminar: boolean,
		conReclamoResultadoFinal: boolean,
		estado: number,
		idIteracion: number
	): boolean => this.mostrarAccionResultadoFinal(
		"VEROBSERVACION",
		conReclamoResultadoPreliminar,
		conReclamoResultadoFinal,
		estado,
		idIteracion
	);

	mostrarVerInformacionCompletaResultadoFinal = (
		conReclamoResultadoPreliminar: boolean,
		conReclamoResultadoFinal: boolean,
		estado: number,
		idIteracion: number
	): boolean => this.mostrarAccionResultadoFinal(
		"VERINFORMACIONCOMPLETA",
		conReclamoResultadoPreliminar,
		conReclamoResultadoFinal,
		estado,
		idIteracion
	);

	mostrarVerReclamoResultadoFinal = (
		conReclamoResultadoPreliminar: boolean,
		conReclamoResultadoFinal: boolean,
		estado: number,
		idIteracion: number
	): boolean => this.mostrarAccionResultadoFinal(
		"VERRECLAMO",
		conReclamoResultadoPreliminar,
		conReclamoResultadoFinal,
		estado,
		idIteracion
	);

	public verResultadoPreliminar = () => this._verResultadoPreliminar;
	public verPdfResultadoPreliminar = () => this._verPdfResultadoPreliminar;
	public verResultadoFinal = () => this._verResultadoFinal;
	public verPdfResultadoFinal = () => this._verPdfResultadoFinal;
	public getIdFlujoEstado = () => this._idFlujoEstado;
	public getEtapaPreliminar = (): boolean => this._idEtapa == CalificacionEtapaEnum.PRELIMINAR;
	public getEtapaFinal = (): boolean => this._idEtapa == CalificacionEtapaEnum.FINAL;
}
