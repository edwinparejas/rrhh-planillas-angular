import { PassportTipoSede } from '../_utils/constants';
import { pageSizeGrilla, selectPageSizeDefault } from '../_utils/grilla';

export class bandejaIncorporacion {
    private displayedColumnsGrillaIncorporacion: any[] = [
	{nombre:"registro"},
	{nombre:"instancia",ocultar:[PassportTipoSede.UGEL]},
	{nombre:"subinstancia",ocultar:[PassportTipoSede.UGEL]},
	{nombre:"codigoModular"},
	{nombre:"centroTrabajo"},
	{nombre:"nivelEducativo"},
	{nombre:"tipoGestion"},
	{nombre:"codigoPlaza"},
	{nombre:"cargo"},
	{nombre:"areaCurricular"},
	{nombre:"tipoPlaza"},
	{nombre:"vigenciaInicio"},
	{nombre:"vigenciaFin"},
	{nombre:"acciones"},
    ];
    private columms:any;
    public setUpColumnas(codigoTipoSede:string) {
	var columnasVisibibles = this.displayedColumnsGrillaIncorporacion.filter(x =>{
	    if(x?.ocultar)
		{
		    var respuesta = x?.ocultar.some(f => f == codigoTipoSede);
		    return !respuesta;
		}
		return true;
	});
	this.columms = columnasVisibibles.map(x => x.nombre);
    }

    public getColumns():any{
	return this.columms;
    }

    getConfiguracionPaginacion = (): any => {
      return {
        'selectPageSize': selectPageSizeDefault,
        'pageSize': pageSizeGrilla
      }
    };
}
