import { pageSizeGrilla, selectPageSizeDefault } from '../_utils/grilla';

export class bandejaPlazaPUNModel {
	private _verMigrarPlazaDesierta:boolean;
	private _verPublicarPlaza:boolean;
	private _verAperturarPublicacionPlaza:boolean;
	private _verIncorporarPlaza:boolean;
	private _verListadoPlaza:boolean;
	private _conPrimeraPublicacionPlaza:boolean;
	private _etapa:number;
	private _idFlujoEstado:number; 
        private _iteracion:number;
	 
    private _controlesActivos:ControlesActivos = {
	    btnAperturarPublicacion:false,
	    btnIncorporarPlazas: false,
	    btnPlazaDesierto:false,
	    btnPublicarPlazas:false,
	    btnEliminarPlazas:false,
            btnVerPlazasPDF:true, 
            btnExportar:true
    }
	constructor() { }

	setFlujoEstado = (flujoEstado: any): void => {
		if (flujoEstado != null) {
			var metaData = JSON.parse(flujoEstado.metaData);
			this._verMigrarPlazaDesierta = metaData.VerMigrarPlazaDesierta;
			this._verPublicarPlaza= metaData.VerPublicarPlaza;
			this._verAperturarPublicacionPlaza= metaData.VerAperturarPublicacionPlaza;
			this._verIncorporarPlaza= metaData.VerIncorporarPlaza;
			this._verListadoPlaza = metaData.VerListadoPlaza;
                        this._iteracion = metaData.Iteracion;

			this._etapa = metaData.Etapa;
			this._idFlujoEstado = flujoEstado.idFlujoEstado;
			this._conPrimeraPublicacionPlaza= flujoEstado.ConPrimeraPublicacion;
		}
	}
	setSeguridad = (seguridad:any):void => {
	    if(seguridad){
                this._controlesActivos = {...this._controlesActivos, 
                    btnAperturarPublicacion:seguridad.aperturarPublicacionPlazas, 
                    btnIncorporarPlazas: seguridad.incorporarPlazas,
                    btnPlazaDesierto: seguridad.plazasDesiertasCD,
                    btnPublicarPlazas:seguridad.publicarPlazas, 
                    btnEliminarPlazas:seguridad.incorporarPlazas
                 }; 
	    }
	}
	getVerMigrarPlazaDesierta = ():boolean => 
	                             this._verMigrarPlazaDesierta 
				     && this._controlesActivos.btnPlazaDesierto;
	getVerPublicarPlaza = ():boolean => 
	                          this._verPublicarPlaza
			       && this._controlesActivos.btnPublicarPlazas;
	getVerAperturarPublicacionPlaza = ():boolean => 
	                                this._verAperturarPublicacionPlaza
					&& this._controlesActivos.btnAperturarPublicacion;
	getVerIncorporarPlaza = ():boolean => 
	                      this._verIncorporarPlaza
			      && this._controlesActivos.btnIncorporarPlazas;
	getIdFlujoEstado = ():number => this._idFlujoEstado;
	getIteracion = ():number => this._iteracion;
	getVerListadoPlaza = ():boolean => this._verListadoPlaza || this._conPrimeraPublicacionPlaza;
	getComandoMetaData = ():string => "PLAZA_PUN";
	getEliminarPlaza = ():boolean => this._controlesActivos.btnEliminarPlazas;
        getConfiguracionPaginacion = (): any => {
          return {
            'selectPageSize': selectPageSizeDefault,
            'pageSize': pageSizeGrilla
          }
        };
}

interface ControlesActivos{
    btnAperturarPublicacion:boolean,
    btnIncorporarPlazas: boolean,
    btnPlazaDesierto:boolean,
    btnPublicarPlazas:boolean
    btnEliminarPlazas:boolean
    btnVerPlazasPDF: boolean
    btnExportar:boolean
}
