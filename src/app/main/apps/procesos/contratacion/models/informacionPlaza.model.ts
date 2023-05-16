export class informacionPlaza {
    valorNoEncontrado = (valor:any):string => {
	return (valor||null)==null?'NO REGISTRADO':valor;
    }
}
