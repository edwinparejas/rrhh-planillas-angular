export class DatosResolucionModel {
    tipoResolucion:string;
    numeroResolucion:string;
    fechResolucion:string;
    codigoDocumentoResolucion:string;
    regimenLaboral:string;
    grupoAccion:string;
    accion:string;
    motivoAccion:string;

    cargaDatos = (resolucion:any) =>{
	Object.entries(resolucion).forEach(x =>{
	    this[x[0]]=x[1];
	});
    }
}
