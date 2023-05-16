
import { pageSizeGrilla, selectPageSizeDefault } from '../_utils/grilla';

export class bandejaPrincipalModel {
  getConfiguracionPaginacion = (): any => {
    return {
      'selectPageSize': selectPageSizeDefault,
      'pageSize': pageSizeGrilla
    }
  };
}
