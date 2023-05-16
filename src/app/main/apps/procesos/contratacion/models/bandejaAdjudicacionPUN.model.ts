import { EstadoAdjudicacionEnum, EstadoEtapaProcesoEnum } from '../../reasignacion/_utils/constants';
import { EtapaAdjudicacionEnum } from '../_utils/constants';

export class bandejaAdjudicacionPUNModel {
	private _estadoFinalizada: boolean;
	private _acciones: any[];
	private _codigoEstadoDesarrollo: number = 0;

	constructor() {
		this.configurarPermisosAcciones();
	}
	asignarEstadoFinalizada = (estado: boolean) => {
		this._estadoFinalizada = estado;
	}
	asignarCodigoEstadoDesarrollo = (codigoEstadoDesarrollo: number) => this._codigoEstadoDesarrollo = codigoEstadoDesarrollo;

	private configurarPermisosAcciones = () => {
		this._acciones = [
			{
				accion: "VERINFORMACION",
				etapas: [
					{
						codigos:[
						         EtapaAdjudicacionEnum.EN_PROCESO,
						         EtapaAdjudicacionEnum.FINALIZADO
						        ],
						estadoPermitidos: [
							EstadoAdjudicacionEnum.ADJUDICADO,
							EstadoAdjudicacionEnum.NO_ADJUDICADO,
							EstadoAdjudicacionEnum.OBSERVADO,
						]
					}
				]
			},
			{
				accion: "ADJUDICAR",
				etapas: [
					{
						codigos:[EtapaAdjudicacionEnum.EN_PROCESO],
						estadoPermitidos: [
							EstadoAdjudicacionEnum.PENDIENTE,
							EstadoAdjudicacionEnum.NO_ADJUDICADO
						]
					}
				]

			},
			{
				accion: "NOADJUDICAR",
				etapas: [
					{
						codigos: [EtapaAdjudicacionEnum.EN_PROCESO],
						estadoPermitidos: [
							EstadoAdjudicacionEnum.PENDIENTE,
						]
					}
				]
			},
			{
				accion: "VEROBSERVACION",
				etapas: [
					{
						codigos:[EtapaAdjudicacionEnum.EN_PROCESO],
						estadoPermitidos: [
							EstadoAdjudicacionEnum.OBSERVADO
						]
					}
				]
			},
			{
				accion: "VERSUBSANACION",
				etapas: [
					{
						codigos:[
						        EtapaAdjudicacionEnum.EN_PROCESO,
							EtapaAdjudicacionEnum.FINALIZADO
						        ],
						estadoPermitidos: [
							EstadoAdjudicacionEnum.ADJUDICADO,
							EstadoAdjudicacionEnum.NO_ADJUDICADO
						]
					}
				]
			},
			{
				accion: "SUBSANAROBSERVACION",
				etapas: [
					{
						codigos: [EtapaAdjudicacionEnum.EN_PROCESO],
						estadoPermitidos: [
							EstadoAdjudicacionEnum.OBSERVADO
						]
					}
				]
			}
		];
	}
	private mostrarAccion = (
	                         tipoAccion: string,
				 estado: number,
				 idIteracion:number = null
	                        ): boolean => {
		let accion: any = this._acciones.find(x => x.accion == tipoAccion);

		let permiso = accion.etapas.find(x => 
						 x.codigos.some(c => c == this._etapa)
						);

		let mostrarAccion = permiso?.estadoPermitidos.some(x => x == estado);

		let mismaIteracion: boolean = true;
		if(idIteracion) 
		    mismaIteracion = idIteracion == this._idFlujoEstado;

		return mostrarAccion && mismaIteracion;
	}
	mostrarVerInformacion = (estado: number): boolean => this.mostrarAccion("VERINFORMACION", estado);
	mostrarAdjudicar = (estado: number, idIteracion?:number): boolean => this.mostrarAccion("ADJUDICAR", estado,idIteracion);
	mostrarNoAdjudicar = (estado: number, idIteracion?:number): boolean => this.mostrarAccion("NOADJUDICAR", estado,idIteracion);
	mostrarVerObservacion = (estado: number): boolean => this.mostrarAccion("VEROBSERVACION", estado);
	mostrarVerSubsanacion = (estado: number, detalleSubsanacion: any): boolean =>
		this.mostrarAccion("VERSUBSANACION", estado) 
		&& detalleSubsanacion != null;
	mostrarSubsanarObservacion = (estado: number, idIteracion?:number): boolean => 
	                    this.mostrarAccion("SUBSANAROBSERVACION", estado,idIteracion);

	private _verFinalizarAdjudicacion: boolean = false;
	private _verFinalizarEtapa: boolean = false;
	private _idFlujoEstado: number = 0;
	private _etapa: number = 0;

	setFlujoEstado = (flujoEstado: any) => {
		if (flujoEstado != null) {
			var metaData = JSON.parse(flujoEstado.metaData);
			//this._verFinalizarAdjudicacion = metaData.VerFinalizarAdjudicacion;
			//this._verFinalizarEtapa = metaData.VerFinalizarEtapa;
			this._idFlujoEstado = flujoEstado.idFlujoEstado;
			//this._etapa = metaData.Etapa;
		}
	}
	verFinalizarAdjudicacion = () => this._verFinalizarAdjudicacion;
	verFinalizarEtapa = () => this._verFinalizarEtapa;
	getIdFlujoEstado = () => this._idFlujoEstado;
}
