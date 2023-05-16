export class DatosPersonaModel {
    documento:string;
    primerApellido:string;
    segundoApellido:string;
    nombres:string;
    situacionLaboral:string;
    regimenLaboral:string;
    centroTrabajo:string;
    cargo:string;
    fechaNacimiento:string;
    sexo:string;

    cargaDatos = (persona:any) =>{
	Object.entries(persona).forEach(x =>{
	    this[x[0]]=x[1];
	});
    }
}
