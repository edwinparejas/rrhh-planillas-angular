import { pageSizeGrilla, selectPageSizeDefault } from '../_utils/grilla';
import { EstadoValidacionPlazaEnum, SituacionPlazasEnum } from '../../reasignacion/_utils/constants';

export class bandejaValidacionPlazas {
    private _codigoEstadoValidacionAnterior:boolean;
    private _tabsOpcion:any;
    private _idFlujoEstado: number = 0;
    private _iteracion: number = 0;
	constructor() {
	    this.generarTabsOpcion();
	}

    public mostrarOpcionesSegunEstadoValidacionAnterior = () =>{
	return this._codigoEstadoValidacionAnterior;
    }
    private generarTabsOpcion =() => {
	let tapOpcion = [
	    {
		tabIndex:0,
		idSituacionValidacion: SituacionPlazasEnum.PRE_PUBLICADA
	    },
	    {
		tabIndex:1,
		idSituacionValidacion: SituacionPlazasEnum.A_CONVOCAR
	    },
	    {
		tabIndex:2,
		idSituacionValidacion: SituacionPlazasEnum.OBSERVADA
	    }
	];
	this._tabsOpcion = Object.assign({}, ...tapOpcion.map((x) => ({[x.tabIndex]: x.idSituacionValidacion})));
    }
    public getTabOpcion = () => this._tabsOpcion;
    public asignarEstadoValidacionAnterior 
                        = (estado:number):void => {
	this._codigoEstadoValidacionAnterior = estado == EstadoValidacionPlazaEnum.PREPUBLICADO;
    }
    public setFlujoEstado = (flujoEstado: any) => {
      if (flujoEstado != null) {
        var metadata = JSON.parse(flujoEstado.metaData);
        if(typeof metadata != 'object')metadata = JSON.parse(metadata);
        this._iteracion = metadata.Iteracion;
        this._idFlujoEstado = flujoEstado.idFlujoEstado;
      }
    }
    getIdFlujoEstado = () => this._idFlujoEstado;
    getIteracion = () => this._iteracion;
    getConfiguracionPaginacion = (): any => {
      return {
        'selectPageSize': selectPageSizeDefault,
        'pageSize': pageSizeGrilla
      }
    };
}
