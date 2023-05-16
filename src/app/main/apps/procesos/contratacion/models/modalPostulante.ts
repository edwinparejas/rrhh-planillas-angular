import { validacionRespuesta } from './criterioBusqueda.model';
import { exception } from 'console';

export class modalPostulante {
  private _tiposDocumento:any[] = [
    {
      tipo:1,
      cantidadMaxima:8,
      mensaje:'"NÚMERO DE DOCUMENTO NO VÁLIDO, DEBE INGRESAR UN NÚMERO CON OCHO (8) DÍGITOS"',operacion:1
    },
    {
      tipo:11,
      cantidadMaxima:8,
      mensaje:'"NÚMERO DE DOCUMENTO NO VÁLIDO, DEBE INGRESAR UN NÚMERO CON OCHO (8) DÍGITOS"',operacion:1
    },
    {
      tipo:5,
      cantidadMinima:9,
      cantidadMaxima:12,
      mensaje:'NÚMERO DE DOCUMENTO NO VÁLIDO, DEBE INGRESAR COMO MÍNIMO NUEVE (09) CARACTERES',operacion:2
    },
    {
      tipo:15,
      cantidadMinima:9,
      cantidadMaxima:12,
      mensaje:'NÚMERO DE DOCUMENTO NO VÁLIDO, DEBE INGRESAR COMO MÍNIMO NUEVE (09) CARACTERES',operacion:2
    },
    {
      tipo:14,
      cantidadMinima:9,
      cantidadMaxima:12,
      mensaje:'NÚMERO DE DOCUMENTO NO VÁLIDO, DEBE INGRESAR COMO MÍNIMO NUEVE (09) CARACTERES',operacion:2
    },
  ];
    private _ocultar :boolean = false;
    private _verBotones:boolean=false;
    private _idFlujoEstado:number = 0;
    public validarDocumento(numeroDocumento:string, tipoDocumento:any):validacionRespuesta {
	let config = this._tiposDocumento.find(x => x.tipo == tipoDocumento);
	if(!config) throw new Error("No se encontro la configuracion para el tipo de documento");
	let cantidad = numeroDocumento.length;
	if(config.operacion == 1 && cantidad == config.cantidadMaxima)
	    return new validacionRespuesta(true,'');
	if(config.operacion == 2 && cantidad >= config.cantidadMinima && cantidad <= config.cantidadMaxima)
	    return new validacionRespuesta(true,'');

	return new validacionRespuesta(false,config.mensaje);
    }
    public setOcultar =(ocultar:boolean)=>{
	this._ocultar = ocultar;
    }

    public getOcultar =()=> this._ocultar; 

    public setFlujoEstado = (flujoEstado:any) => {
	if(flujoEstado != null){
	    var botones = JSON.parse(flujoEstado.metaData);
	    this._verBotones = botones.VerNuevo && botones.VerAprobarPostulante;
	    this._idFlujoEstado = flujoEstado.idFlujoEstado;
	}
    }
    public verBotones = () => this._verBotones;
    public getIdFlujoEstado = () => this._idFlujoEstado;
}
