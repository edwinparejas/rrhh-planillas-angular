import { ICombo } from "../../util";
import { FormType } from "../../util/enum";

export interface IPlanEstudioDetalle {
    idPlanEstudio: number;
    isLoading: boolean;
    error: any;
    title: string;
    detalleFiltro: IPlanDetalleFiltro;
    detalleGrilla: IPlanDetalleGrilla;
    planEstudio: IPlanEstudioFull;
}

export interface IPlanDetalleFiltro {
    isLoading: boolean;
    filterLists: IPlanDetalleFiltroLista;
    formModel: IPlanDetalleFiltroForm;
}

export interface IPlanEstudioFull {
    idPlanEstudio: number;
    idEstadoPlanEstudio: number;
    dsEstadoPlanEstudio: string;
    codEstadoPlanEstudio: number;
    nombrePlanEstudio: string;
    descripcionPlan: string;
    motivoNoVigencia: string;
    codigoCargamasiva: string;
}

export interface IPlanDetalleFiltroLista {
    componentesCurricular: ICombo;
    carrerasProgramas: ICombo;
    ciclos: ICombo;
    cursosModulo: ICombo;
    formacionesAcademico: ICombo;
}

export interface IPlanDetalleFiltroForm {
    idAreaComponenteCurricular: string;
    idCarreraProgramaEstudios: string;
    idCiclo: string;
    idCursoModulo: string;
    idFormacionProfesional: string;
}

export interface IPlanDetalleGrilla {
    isLoading: boolean;
    totalRow: number;
    detallePlan: IPlanEstudioDetalleItem[];
    displayedColumns: string[];
}

export interface IPlanEstudioDetalleItem {
    rowNum: number;
    rowTotal: number;
    idPlanEstudioDetalle: number;
    idPlanEstudio: number;
    nombrePlanEstudio: string;
    idAreaComponenteCurricular: number;
    descripcionAreaComponente: string;
    idCarreraProgramaEstudios: number;
    dsCarreraProgramaEstudios: string;
    idCiclo: number;
    dsCiclo: string;
    idCursoModulo: number;
    dsAreaCursoModulo: string;
    cantidadCreditos: number;
    cantidadHorasSemanales: number;
    competenciaNivelGrupo: string;
    formacionProfesionalGrupo: string;
}

export interface IModalVerCompetencia {
    isLoading: boolean;
    error: any;
    title: string;
    formType: FormType;
    icon: string;
    codigos: string;
    grilla: IModalVerCompetenciaGrilla;
}
export interface IModalVerCompetenciaGrilla {
    isLoading: boolean;
    totalRow: number;
    competencias: IModalVerCompetenciaGrillaItem[];
    displayedColumns: string[];
}
export interface IModalVerCompetenciaGrillaItem {
    rowNum: number;
    codigoCompetenciaNivel: number;
    descripcionCompetenciaNivel: string;
}
export interface IModalVerFormacion {
    isLoading: boolean;
    error: any;
    title: string;
    formType: FormType;
    icon: string;
    codigos: string;
    grilla: IModalVerFormacionGrilla;
}
export interface IModalVerFormacionGrilla {
    isLoading: boolean;
    totalRow: number;
    formaciones: IModalVerFormacionGrillaItem[];
    displayedColumns: string[];
}
export interface IModalVerFormacionGrillaItem {
    rowNum: number;
    codigoFormacionProfesiona: number;
    descripcionFormacionProfesiona: string;
}
