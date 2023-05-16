export class ServidorPublicoModel {
    regimenLaboral:string;
    centroTrabajo:string;
    situacionLaboral:string;
    condicionLaboral:string;
    codigoPlaza:string;
    tipoCargo:string;
    cargo:string;
    jornadaLaboral:string;

    cargaDatos = (item:any) =>{
	Object.entries(item).forEach(x =>{
	    this[x[0]]=x[1];
	});
    }
}
