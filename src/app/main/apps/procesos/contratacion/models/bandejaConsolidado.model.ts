import { pageSizeGrilla, selectPageSizeDefault } from '../_utils/grilla';

export class bandejaConsolidadoModel {

  private _idFlujoEstado: number = 0;
  private _iteracion: number = 0;
  private _esPrimeraAprobacion:boolean = true;

  public getIdFlujoEstado = () => this._idFlujoEstado;
  public getIteracion = () => this._iteracion;
  public getEsPrimeraAprobacion = () => this._esPrimeraAprobacion;

  public setFlujoEstado = (flujoEstado: any) => {
    if (flujoEstado != null) {
      var metadata = JSON.parse(flujoEstado.metaData);
      if(typeof(metadata) != 'object') metadata = JSON.parse(metadata);
      this._iteracion = metadata.Iteracion;
      this._esPrimeraAprobacion = metadata.EsPrimeraAprobacion;
      this._idFlujoEstado = flujoEstado.idFlujoEstado;
    }
  }
  getConfiguracionPaginacion = (): any => {
    return {
      'selectPageSize': selectPageSizeDefault,
      'pageSize': pageSizeGrilla
    }
  };
}
