import { CatalogoEnum } from '../types/Enums';

export class DatosDeplazamientoModel {

  private todos = [{ id: -1, descripcion: '--SELECCIONAR--' }];
  comboLists = {
      tipoCargos: this.todos,
      cargos: this.todos,
      jornadasLaborales: this.todos
  };

  cargarCatalogo= (items:any[]) => {
      this.comboLists
          .tipoCargos =[...this.todos,
			...items
			   .filter(x =>
				x.codigo == CatalogoEnum.TIPOCARGO
				)
	               ];
  }

  cargarCargos = (items:any[]) => {
      this.comboLists
          .cargos =[...this.todos,
		     ...items
	           ];
  }

  cargarJornadasLaborales = (items:any[]) => {
      this.comboLists
          .jornadasLaborales =[...this.todos,
		     ...items
	           ];
  }
}
