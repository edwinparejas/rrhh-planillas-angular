import { pageSizeGrilla, selectPageSizeDefault } from '../_utils/grilla';

export class bandejaPublicacion {

  private _idFlujoEstado: number = 0;
  private _iteracion: number = 0;
  private confirmationMessage = '"SE VA REALIZAR LA PRE PUBLICACIÓN DE PLAZAS. ESTO PUEDE TOMAR UN TIEMPO."<br><strong>¿ESTÁ SEGURO QUE DESEA REALIZAR LA PRE PUBLICACIÓN DE LAS PLAZAS?</strong>'; // M108
  public getconfirmationMessage = () => this.confirmationMessage;
  private mensajeValidacionTotalSiguienteEtapa = '"NO SE PUEDE REALIZAR LA PRE PUBLICACIÓN DE PLAZAS, YA QUE NO SE HA CREADO EL SIGUIENTE PROCESO DE CONTRATACIÓN."'; // M108
  public getMensajeValidacionTotalSiguienteEtapa = () => this.mensajeValidacionTotalSiguienteEtapa;

  getConfiguracionPaginacion = (): any => {
    return {
      'selectPageSize': selectPageSizeDefault,
      'pageSize': pageSizeGrilla
    }
  };

  public getIdFlujoEstado = () => this._idFlujoEstado;
  public getIteracion = () => this._iteracion;

  public setFlujoEstado = (flujoEstado: any) => {
    if (flujoEstado != null) {
      var metadata = JSON.parse(flujoEstado.metaData);
      this._iteracion = metadata.Iteracion;
      this._idFlujoEstado = flujoEstado.idFlujoEstado;
    }
  }
}
