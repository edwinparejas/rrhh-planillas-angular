import { CONTRATACION_MESSAGE } from "./contratacionMensajes";

export class criterioBusqueda {
    private _esActivoSubInstancia:boolean;

    esActivoSubInstancia = ():boolean =>{
	return this._esActivoSubInstancia;
    }

    asignarActivoSubInstancia = (esActivoSubInstancia:boolean) =>{
	this._esActivoSubInstancia = esActivoSubInstancia;
    }

    public static validarCodigoTrabajo(codigoTrabajo:string):validacionRespuesta {
	let cantidad = codigoTrabajo.length;
	if(cantidad == 6 || cantidad == 7)return new validacionRespuesta(true,'');
	return new validacionRespuesta(false,CONTRATACION_MESSAGE.M38_VAL_COD_MODULAR);
    }

    public static validarCodigoPlaza(codigoPlaza:string):validacionRespuesta {
	let cantidad = codigoPlaza.length;
	if(cantidad == 12) return new validacionRespuesta(true,'');
	return new validacionRespuesta(false,CONTRATACION_MESSAGE.M64_VAL_PLAZA_DIGITOS);
    }
}
export class validacionRespuesta{
    esValido:boolean;
    mensaje:string;
    constructor(esValido:boolean, mensaje:string) {
	this.esValido = esValido;
	this.mensaje = mensaje;
    }
}
