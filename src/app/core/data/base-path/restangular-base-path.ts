import { Injectable } from "@angular/core";
import { environment } from "environments/environment";

@Injectable()
export class RestangularBasePath {
    public comunesApi = environment.comunesPrefix;
    public documentosApi = environment.documentosPrefix;
    public gestionProcesosApi = environment.gestionProcesosPrefix;
    public asistenciaApi = environment.asistenciaPrefix;
    public licenciasApi = environment.licenciasPrefix;
    public alertasApi = environment.alertasPrefix;
    public actividadesApi = environment.actividadesPrefix;
    public accionesApi = environment.accionesPrefix;
    public accionesDesplazamientoApi = environment.desplazamientoPrefix;
    public solicitudesApi = environment.solicitudesPrefix;
    public sancionesApi = environment.sancionesPrefix;
    public contratacionesApi = environment.contratacionesPrefix;

    public historialApi = environment.historialPrefix;
    public passportApi = environment.passportPrefix;
    public kongAuthApi = environment.kongAuthPrefix;
    public cargaMasivaApi = environment.cargaMasivaPrefix;
    public ascensoApi = environment.ascensoPrefix;
    public rotacionApi = environment.rotacionPrefix;

    public reasignacionesApi = environment.reasignacionesPrefix;
    public nombramientoApi = environment.nombramientoPrefix;
    public accionesGrabadasApi = environment.accionesGrabadasPrefix;

    public encargaturaApi = environment.encargaturaPrefix;
    public cuadroHorasApi = environment.cuadroHorasPrefix;
    public cuadroHoras30512Api = environment.cuadroHoras30512Prefix;

    public vinculacionesApi = environment.vinculacionesPrefix;
    public aprobacionesApi = environment.aprobacionesPrefix;
    public reportesCAPApi = environment.reportesCAPPrefix;
    
    public proyectosResolucionApi = environment.proyectosResolucionPrefix;    

    public desvinculacionesApi = environment.desvinculacionesPrefix;
    public plazaEspejoApi = environment.plazaEspejoPrefix;
    public beneficiosApi = environment.beneficiosPrefix;

    public personalHistorialApi = environment.personalHistorialPrefix;

    public otrasFuncionalidadesApi = environment.otrasFuncionalidadesPrefix;

    public plazaReubicacionApi = environment.plazaReubicacionPrefix;
    public plazaAdecuacionApi = environment.plazaAdecuacionPrefix;
}
