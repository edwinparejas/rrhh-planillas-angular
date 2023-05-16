import { AsistenciaService } from "./services/asistencia.service";
import { GestionProcesosService } from "./services/gestion-procesos.service";
import { DocumentoService } from "./services/documento.service";
import { UtilService } from "./services/util.service";
import { Injectable } from "@angular/core";
import { NgxSpinnerService } from "ngx-spinner";
import { MessageService } from "./services/message.service";
import { ComunesMaestroService } from "./services/comunes-maestro.service";
import { PassportService } from "./services/passport.service";
import { LicenciasService } from "./services/licencias.service";
import { ActividadesService } from "./services/actividades.service";
import { AccionesPersonalService } from "./services/acciones-personal.service";
import { SolicitudesService } from "./services/solicitudes.service";
import { SancionesService } from "./services/sanciones.service";
import { SnackBarService } from "./services/snack-bar.service";
import { CargamasivaService } from "./services/cargamasiva.service";
import { ContratacionesService } from "./services/contrataciones.service";
import { AscensoService } from "./services/ascenso.service";
import { KongAuthService } from "./services/kong-auth.service";
import { StorageService } from "./services/storage.service";
import { EncryptDecryptService } from "./services/encrypt-decrypt.service";
import { DesignacionProcesosService } from "./services/designacion-procesos.service";
import { RotacionService } from "./services/rotacion.service";
import { ProcesoReasignacionService } from "./services/proceso-reasignacion.service";
import { NombramientoService } from './services/nombramiento.service';
import { AccionesGrabadasService } from "./services/acciones-grabadas.service";
import { EncargaturaService } from "./services/encargatura.service";
import { CuadroHorasService } from "./services/cuadro-horas.service";
import { VinculacionesService } from "./services/vinculaciones.service";
import { AprobacionService } from "./services/aprobaciones.service";
import { ProyectosResolucionService } from './services/proyectos-resolucion.service';
import { CuadroHoras30512Service } from "./services/cuadro-hora-30512.service";
import { DesvinculacionesService } from "./services/desvinculacionesService";
import { ReportesCAPService } from "./services/reportes-cap.service";
import { AccionesPlazaEspejoService } from './services/acciones-plazaespejo.service';
import { BeneficiosService } from "./services/acciones-beneficios.service";
import { PersonalHistorialService } from "./services/personal-historial.service";
import { OtrasFuncionalidadesService } from "./services/otras-funcionalidades.service";
import { AccionDesplazamientoService } from "./services/acciones-desplazamiento.service";
import { PlazaReubicacionService } from "./services/plaza-reubicacion.service";
import { PlazaAdecuacionService } from "./services/plaza-adecuacion.service";

@Injectable({
    providedIn: "root",
})
export class DataService {
    constructor(
        private spinner: NgxSpinnerService,
        private message: MessageService,
        private util: UtilService,
        private comunes: ComunesMaestroService,
        private crypto: EncryptDecryptService,
        private storage: StorageService,
        private passport: PassportService,
        private kong: KongAuthService,
        private documento: DocumentoService,
        private asistencia: AsistenciaService,
        private gestionProcesosService: GestionProcesosService,
        private designacion: DesignacionProcesosService,
        private licencias: LicenciasService,
        private actividadesService: ActividadesService,
        private accionesService: AccionesPersonalService,
        private accionesPersonalService: AccionDesplazamientoService,
        private solicitudes: SolicitudesService,
        private sanciones: SancionesService,
        private snackBar: SnackBarService,
        private cargamasiva: CargamasivaService,
        private contrataciones: ContratacionesService,
        private ascenso: AscensoService,
        private rotacion: RotacionService,
        private reasignaciones: ProcesoReasignacionService,
        private nombramiento: NombramientoService,
        private accionesGrabadas: AccionesGrabadasService,
        private encargatura: EncargaturaService,
        private cuadroHoras: CuadroHorasService,
        private cuadroHoras30512: CuadroHoras30512Service,
        private accionesVinculacion: VinculacionesService,
        private aprobacionService: AprobacionService,
        private proyectosResoluccionService: ProyectosResolucionService,
        private accionesDesvinculacion: DesvinculacionesService,
        private reportesCAP: ReportesCAPService,
        private accionesPlazaEspejo: AccionesPlazaEspejoService,
        private beneficios: BeneficiosService,
        private personalHistorial: PersonalHistorialService,
        private otrasFuncionalidades: OtrasFuncionalidadesService,
        private plazaReubicacion: PlazaReubicacionService,
        private plazaAdecuacion: PlazaAdecuacionService,

    ) { }

    Spinner(): NgxSpinnerService {
        return this.spinner;
    }

    Message(): MessageService {
        return this.message;
    }

    Util(): UtilService {
        return this.util;
    }

    SnackBar(): SnackBarService {
        return this.snackBar;
    }

    Cifrado(): EncryptDecryptService {
        return this.crypto;
    }

    Storage(): StorageService {
        return this.storage;
    }

    Passport(): PassportService {
        return this.passport;
    }

    Kong(): KongAuthService {
        return this.kong;
    }

    Maestro(): ComunesMaestroService {
        return this.comunes;
    }

    Documento(): DocumentoService {
        return this.documento;
    }

    Asistencia(): AsistenciaService {
        return this.asistencia;
    }

    GestionProcesos(): GestionProcesosService {
        return this.gestionProcesosService;
    }

    Licencias(): LicenciasService {
        return this.licencias;
    }

    Actividades(): ActividadesService {
        return this.actividadesService;
    }

    Acciones(): AccionesPersonalService {
        return this.accionesService;
    }

    AccionesPersonal(): AccionDesplazamientoService {
        return this.accionesPersonalService;
    }

    Solicitudes(): SolicitudesService {
        return this.solicitudes;
    }

    Sanciones(): SancionesService {
        return this.sanciones;
    }

    CargaMasiva(): CargamasivaService {
        return this.cargamasiva;
    }

    Contrataciones(): ContratacionesService {
        return this.contrataciones;
    }

    Ascenso(): AscensoService {
        return this.ascenso;
    }

    Designacion(): DesignacionProcesosService {
        return this.designacion;
    }

    Rotacion(): RotacionService {
        return this.rotacion;
    }

    Reasignaciones(): ProcesoReasignacionService {
        return this.reasignaciones;
    }

    Nombramiento(): NombramientoService {
        return this.nombramiento;
    }

    AccionesGrabadas(): AccionesGrabadasService {
        return this.accionesGrabadas;
    }

    Encargatura(): EncargaturaService {
        return this.encargatura;
    }

    CuadroHoras(): CuadroHorasService {
        return this.cuadroHoras;
    }

    CuadroHoras30512Service(): CuadroHoras30512Service {
        return this.cuadroHoras30512;
    }

    AccionesVinculacion(): VinculacionesService {
        return this.accionesVinculacion;
    }
    
    Aprobacion(): AprobacionService {
        return this.aprobacionService;
    }

    ProyectosResolucion(): ProyectosResolucionService {
        return this.proyectosResoluccionService;
    }

    AccionesDesvinculacion(): DesvinculacionesService {
        return this.accionesDesvinculacion;
    }
    
    ReportesCAP(): ReportesCAPService {
        return this.reportesCAP;
    }

    AccionesPlazaEspejo(): AccionesPlazaEspejoService {
        return this.accionesPlazaEspejo;
    }
    
    Beneficios(): BeneficiosService {
        return this.beneficios;
    }

    PersonalHistorial(): PersonalHistorialService {
        return this.personalHistorial;
    }

    OtrasFuncionalidades(): OtrasFuncionalidadesService{
        return this.otrasFuncionalidades;
    }

    PlazaReubicacion(): PlazaReubicacionService {
        return this.plazaReubicacion;
      }
    
      PlazaAdecuacion(): PlazaAdecuacionService {
        return this.plazaAdecuacion;
      }
}