import { Combo } from "../../util";
import { FormType } from "../../util/enum";
import {
    IModalVerCompetencia,
    IModalVerCompetenciaGrilla,
    IModalVerFormacion,
    IModalVerFormacionGrilla,
    IPlanDetalleFiltro,
    IPlanDetalleFiltroForm,
    IPlanDetalleFiltroLista,
    IPlanDetalleGrilla,
    IPlanEstudioDetalle,
    IPlanEstudioDetalleItem,
    IPlanEstudioFull,
} from "./plan-estudios.store.interface";

export class PlanEstudioDetalleModel implements IPlanEstudioDetalle {
    idPlanEstudio = null;
    isLoading = false;
    error = null;
    title = "Gestionar Plan de Estudios Detalle";
    detalleFiltro = new PlanDetalleFiltroModel();
    detalleGrilla = new PlanDetalleGrillaModel();
    planEstudio = new PlanEstudioFullModel();
}

export class PlanDetalleFiltroModel implements IPlanDetalleFiltro {
    isLoading = false;
    filterLists = new PlanDetalleFiltroListaModel();
    formModel = new PlanDetalleFiltroFormModel();
}

export class PlanDetalleFiltroListaModel implements IPlanDetalleFiltroLista {
    componentesCurricular = new Combo();
    carrerasProgramas = new Combo();
    ciclos = new Combo();
    cursosModulo = new Combo();
    formacionesAcademico = new Combo();
}

export class PlanDetalleFiltroFormModel implements IPlanDetalleFiltroForm {
    idAreaComponenteCurricular = null;
    idCarreraProgramaEstudios = null;
    idCiclo = null;
    idCursoModulo = null;
    idFormacionProfesional = null;
}

export class PlanEstudioFullModel implements IPlanEstudioFull {
    idPlanEstudio = null;
    idEstadoPlanEstudio = null;
    dsEstadoPlanEstudio = null;
    codEstadoPlanEstudio = null;
    nombrePlanEstudio = null;
    descripcionPlan = null;
    motivoNoVigencia = null;
    codigoCargamasiva = null;
}

export class PlanDetalleGrillaModel implements IPlanDetalleGrilla {
    isLoading = false;
    totalRow = null;
    detallePlan = [];
    displayedColumns = [
        "rowNum",
        "nombrePlanEstudio",
        "descripcionAreaComponente",
        "dsCarreraProgramaEstudios",
        "dsCiclo",
        "dsAreaCursoModulo",
        "cantidadCreditos",
        "competenciaNivelGrupo",
        "cantidadHorasSemanales",
        "formacionProfesionalGrupo",
    ];
}

export class PlanEstudioDetalleItemModel implements IPlanEstudioDetalleItem {
    rowNum = null;
    rowTotal = null;
    idPlanEstudioDetalle = null;
    idPlanEstudio = null;
    nombrePlanEstudio = null;
    idAreaComponenteCurricular = null;
    descripcionAreaComponente = null;
    idCarreraProgramaEstudios = null;
    dsCarreraProgramaEstudios = null;
    idCiclo = null;
    dsCiclo = null;
    idCursoModulo = null;
    dsAreaCursoModulo = null;
    cantidadCreditos = null;
    cantidadHorasSemanales = null;
    competenciaNivelGrupo = null;
    formacionProfesionalGrupo = null;
}

export class ModalVerCompetenciaModel implements IModalVerCompetencia {
    isLoading = false;
    error = null;
    title = "Ver Competencia Nivel";
    formType = FormType.CONSULTAR;
    icon = "info";
    codigos = null;
    grilla = new ModalVerCompetenciaGrillaModel();
}
export class ModalVerCompetenciaGrillaModel
    implements IModalVerCompetenciaGrilla
{
    isLoading = false;
    totalRow = null;
    competencias = [];
    displayedColumns = [
        "rowNum",
        "codigoCompetenciaNivel",
        "descripcionCompetenciaNivel",
    ];
}

export class ModalVerFormacionModel implements IModalVerFormacion {
    isLoading = false;
    error = null;
    title = "Ver Formacion Profesional";
    formType = FormType.CONSULTAR;
    icon = "info";
    codigos = null;
    grilla = new ModalVerFormacionGrillaModel();
}
export class ModalVerFormacionGrillaModel implements IModalVerFormacionGrilla {
    isLoading = false;
    totalRow = null;
    formaciones = [];
    displayedColumns = [
        "rowNum",
        "codigoFormacionProfesional",
        "descripcionFormacionProfesional",
    ];
}
