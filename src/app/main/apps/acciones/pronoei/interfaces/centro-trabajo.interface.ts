export interface ICentroTrabajoResponse {
    codigo_modular?: string;
    institucion_educativa?: string;
    id_dre?: number;
    codigo_dre?: string;
    descripcion_dre?: string;
    id_ugel?: number;
    codigo_ugel?: string;
    descripcion_ugel?: string;
    id_institucion_educativa?: number;
    descripcion_tipo_centro_trabajo?: string;
    descripcion_modalidad_educativa?: string;
    id_modalidad_educativa?: number;
    id_nivel_educativo?: number;
    descripcion_nivel_educativo?: string;
    id_centro_trabajo?: number;
    tipo_institucion_educativa?: string;
    tipo_gestion_educativa?: string;
    dependencia_institucion_educativa?: string;
    codigo_modalidad_educativa?: number;
    cod_zona?:string;
    centro_poblado_institucion_educativa?:string;
    zona?: string;
    departamento?:string
    provincia?:string
    distrito?:string
}
