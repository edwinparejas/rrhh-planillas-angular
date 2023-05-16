import { IGrillaSource, IGrillaDefinition } from '../components/grilla-actividad/grilla-actividad.component';
import { IdTipoActividadEnum } from '../types/Enums';

export class GrillaActividadModel {


    loading = false;
    gridSource: IGrillaSource<any> = {
        items: [],
        paginaActual: 1,
        tamanioPagina: 10,
        total: 0
    };
    defaultGridSource: IGrillaSource<any> = {
        items: [],
        paginaActual: 1,
        tamanioPagina: 10,
        total: 0
    };
    gridDefinition: IGrillaDefinition = {
        columns: [
            {
                label: 'N°',
                field: 'registro'
            },
            {
                label: 'Tipo de Resolución',
                field: 'tipoResolucion'
            },
            {
                label: 'Numero Resolucion',
                field: 'numeroResolucion'
            },
            {
                label: 'Fecha de resolucion',
                field: 'fechaResolucion',
                isDatetime: true
            },
            {
                label: 'Regimen Laboral',
                field: 'regimenLaboral'
            },
            {
                label: 'Grupo Accion',
                field: 'grupoAccion'
            },
            {
                label: 'Accion',
                field: 'accion'
            },
            {
                label: 'Motivo de Accion',
                field: 'motivoAccion'
            },
            {
                label: 'Documento',
                field: 'documento',
                template: 'tpl-documento'
            },
            {
                label: 'Apellidos y Nombres',
                field: 'apellidoRazonSocial',
                template: 'tpl-nombreCompleto'
            },
            {
                label: 'Fecha Vig Inicio',
                field: 'fechaVigenciaInicio',
                isDatetime: true
            },
            {
                label: 'Fecha Vig Fin',
                field: 'fechaVigenciaFin',
                isDatetime: true
            },
            {
                label: 'Código Plaza',
                field: 'codigoPlazaOrigen',
            },
            {
                label: 'Estado',
                field: 'estado'
            },
            {
                label: 'Acciones',
                field: 'acciones',
                template: 'tpl-acciones'
            }
        ]
    };
    request: any;



    constructor(public esRealizados: boolean = false) {
        if (esRealizados) {

            const plazaEspejoColumn = {
                label: 'Código Plaza Espejo',
                field: 'codigoPlazaEspejo',
            }

            this.gridDefinition.columns.splice(13, 0, plazaEspejoColumn);
        }
    }

    configurarRequest = (request) => {

        if (request?.paginaActual >= 0) {
            this.gridSource.paginaActual = request.paginaActual;
        }
        if (request?.tamanioPagina >= 0) {
            this.gridSource.tamanioPagina = request.tamanioPagina;
        }

        this.request = {
            ...{
                paginaActual: this.gridSource.paginaActual,
                tamanioPagina: this.gridSource.tamanioPagina
            },
            ...request
        }

    }

    configurarDataInicial = (idDre: number, idUgel: number) => {

        this.request = {
            idTipoActividad: IdTipoActividadEnum.GENERACION_PLAZAS_ESPEJO,
            idDre: idDre,
            idUgel: idUgel,
            ...this.defaultGridSource,
        };
    }

    cargaDataPaginado = (response: any) => {
        const total = response[0]?.totalRegistros | 0;
        
        this.gridSource = {
            ...this.gridSource,
            items: response,
            total: total
        }
        this.gridSource = this.gridSource;
    }
}
