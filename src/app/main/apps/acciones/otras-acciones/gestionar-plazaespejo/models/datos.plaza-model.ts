export class DatosPlazaModel {
    origen:plaza;
    destino:plaza;
    constructor(){
	this.origen = new plaza();
	this.destino = new plaza();
    }
    cargaDatos = (plaza:any) =>{
	Object.entries(plaza.origen).forEach(x =>{
	    this.origen[x[0]]=x[1];
	});
	
	Object.entries(plaza.destino).forEach(x =>{
	    this.destino[x[0]]=x[1];
	});
    }
}
class plaza{
    codigoPlaza:string;
    tipoPlaza:string;
    centroTrabajo:string;
    regimenLaboral:string;
    condicionLaboral:string;
    jornadaLaboral:string;
    escalaMagisterial:string;
    tipoServidor:string;
    modalidad:string;
    nivelEducativo:string;
    areaCurricular:string;
    cargo:string;
}
