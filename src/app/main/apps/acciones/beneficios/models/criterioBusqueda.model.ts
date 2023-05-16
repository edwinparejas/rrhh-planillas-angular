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
	return new validacionRespuesta(false,'"CÓDIGO MODULAR NO VÁLIDO, DEBE INGRESAR UN CÓDIGO CON SEIS (6) Ó SIETE (7) DÍGITOS."');
    }

    public static validarCodigoPlaza(codigoPlaza:string):validacionRespuesta {
	let cantidad = codigoPlaza.length;
	if(cantidad == 12) return new validacionRespuesta(true,'');
	return new validacionRespuesta(false,'"CÓDIGO NO VÁLIDO, DEBE INGRESAR UN CÓDIGO DE PLAZA CON DOCE (12) DÍGITOS."');
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
