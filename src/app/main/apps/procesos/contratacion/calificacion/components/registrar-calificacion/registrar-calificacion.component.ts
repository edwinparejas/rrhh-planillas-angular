import { CollectionViewer, DataSource, SelectionModel } from '@angular/cdk/collections';
import { AfterViewInit, Component, Inject, OnDestroy, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { mineduAnimations } from '@minedu/animations/animations';
import { DataService } from 'app/core/data/data.service';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { catchError, finalize } from 'rxjs/operators';
import { PlazaModel, ServidorPublicoModel, CalificacionResponse, CalificacionModel, DetalleCalificacionModel, EtapaResponseModel } from '../../../models/contratacion.model';
import { ResultadoPunComponent } from '../resultado-pun/resultado-pun.component';
import { CriterioEvaluacionComponent } from '../criterio-evaluacion/criterio-evaluacion.component';
import { TipoOperacionEnum, ResultadoOperacionEnum } from '../../../../../../../core/model/types';
import { SecurityModel } from '../../../../../../../core/model/security/security.model';
import { RequisitoMinimoComponent } from '../requisito-minimo/requisito-minimo.component';
import { EtapaFaseEnum } from '../../../_utils/constants';

@Component({
    selector: 'minedu-registrar-calificacion',
    templateUrl: './registrar-calificacion.component.html',
    styleUrls: ['./registrar-calificacion.component.scss'],
    encapsulation: ViewEncapsulation.None,
    animations: mineduAnimations,
})
export class RegistrarCalificacionComponent implements OnInit {
    icon = 'create';
    dialogTitle: string = 'Registrar calificaciones';
    grabajo = false;
    working = false;
    form: FormGroup;
    persona = new ServidorPublicoModel();
    plaza = new PlazaModel();
    isMobile = false;
    calificacion: CalificacionResponse;
    calificacionRow: any;
    idEtapa: number;
    currentSession: SecurityModel = new SecurityModel();
    resultadosPun: any[] = [];
    requisitosMinimos: any[] = [];
    formacionAcademica: any[] = [];
    formacionProfesional: any[] = [];
    experienciaLaboral: any[] = [];
    otros: any[] = [];
    idOperacion: number;
    grabado = false;
    etapaResponse: EtapaResponseModel;
    etapaFase = EtapaFaseEnum;
    @ViewChild(ResultadoPunComponent) private resultadoPunComponent: ResultadoPunComponent;
    @ViewChild('requisitoMinimoComponent') private requisitoMinimoComponent: RequisitoMinimoComponent;
    @ViewChild('formacionAcademicaComponent') private formacionAcademicaComponent: CriterioEvaluacionComponent;
    @ViewChild('formacionProfesionalComponent') private formacionProfesionalComponent: CriterioEvaluacionComponent;
    @ViewChild('experienciaLaboralComponent') private experienciaLaboralComponent: CriterioEvaluacionComponent;

    getIsMobile(): boolean {
        const w = document.documentElement.clientWidth;
        const breakpoint = 992;
        if (w < breakpoint) {
            return true;
        } else {
            return false;
        }
    }
    request = {
        idRegimenLaboral: null,
        idNivelEducativo: null,
        idEtapa: null,
        idTipoCalificacion: null,
        idCalificacion: null,
        activo: true
    };
    displayedColumns: string[] = [
        'pruebas',
        'resultados'
    ];

    constructor(
        public matDialogRef: MatDialogRef<RegistrarCalificacionComponent>,
        @Inject(MAT_DIALOG_DATA) private data: any,
        private formBuilder: FormBuilder,
        private dataService: DataService,) {
        this.idEtapa = data.idEtapa;
        this.calificacionRow = data.calificacionesRow;
        this.currentSession = data.currentSession;
        this.etapaResponse = data.etapaResponse;
    }

    ngOnInit(): void {
        this.loadCalificacion();
    }

    setRequest = () => {
        this.request = {
            idRegimenLaboral: this.calificacionRow.idRegimenLaboral,
            idNivelEducativo: this.calificacionRow.idNivelEducativa,
            idEtapa: this.idEtapa,
            idTipoCalificacion: 1,
            idCalificacion: this.calificacionRow.idCalificacion,
            activo: true
        };
    }

    loadCalificacion = () => {
        this.dataService.Contrataciones()
            .getCalificacion(this.calificacionRow.idCalificacion)
            .pipe(
                catchError(() => of([])),
                finalize(() => { })
            )
            .subscribe((response: any) => {
                if (response && response.result) {
                    this.calificacion = response.data;

                    if (this.etapaResponse.codigoEtapaFase === this.etapaFase.FASE1) {
                        this.resultadosPun = response.data.resultadosPun;
                        this.resultadoPunComponent.actualizarLista(this.resultadosPun);
                    }

                    this.requisitosMinimos = response.data.requisitosMinimos;
                    this.requisitoMinimoComponent.actualizarLista(this.requisitosMinimos);

                    if (this.calificacion.empate === true) {
                        this.formacionAcademica = response.data.formacionesAcademicas;
                        if (this.formacionAcademicaComponent != null) this.formacionAcademicaComponent.actualizarLista(this.formacionAcademica);

                        this.formacionProfesional = response.data.formacionesProfesionales;
                        if (this.formacionProfesionalComponent != null) this.formacionProfesionalComponent.actualizarLista(this.formacionProfesional);

                        this.experienciaLaboral = response.data.experienciasLaborales;
                        if (this.experienciaLaboralComponent != null) this.experienciaLaboralComponent.actualizarLista(this.experienciaLaboral);
                    }
                }
            });
    }

    noSePresentoChange = (event) => {
        this.calificacion.noSePresento = event.source.checked;
    }

    handleCancel = () => {
        this.matDialogRef.close({ grabado: this.grabajo });
    }

    prepararData = (idOperacion: number = TipoOperacionEnum.Registrar) => {
        const model: CalificacionModel = new CalificacionModel();
        model.idCalificacion = this.calificacion.idCalificacion;
        model.idProceso = this.calificacion.idProceso;
        model.idEtapa = this.calificacion.idEtapa;
        model.idPostulacion = this.calificacion.idPostulacion;
        model.idEstadoCalificacion = 0;
        model.publicadoPreliminar = false;
        model.codigoCargaMasiva = null;
        model.detalleReclamo = null;
        model.noSePresento = this.calificacion.noSePresento;
        model.ordenMerito = 0;
        model.puntajeTotal = null;
        model.usuarioRegistro = this.currentSession.numeroDocumento;

        model.requisitosMinimos = [];
        this.requisitosMinimos.forEach(element => {
            if (element.acreditaDocumento === true) {
                let requisitoMinimo = new DetalleCalificacionModel();
                requisitoMinimo.idDetalleCalificacion = element.idDetalleCalificacion;
                requisitoMinimo.idTipoCalificacion = element.idTipoCalificacion;
                requisitoMinimo.idCriterioCalificacion = element.idCriterioCalificacion;
                requisitoMinimo.idTipoPuntaje = element.idTipoPuntaje;
                requisitoMinimo.idDetalleCalificacionPadre = null;
                requisitoMinimo.puntajeUnitario = element.puntajeUnitario;
                requisitoMinimo.cantidad = element.cantidad;
                requisitoMinimo.puntaje = 1; // 1:selected, 0: unselected
                model.requisitosMinimos.push(requisitoMinimo);
            }
        });

        model.formacionesAcademicas = [];
        this.formacionAcademica.forEach(element => {
            if (element.acreditaDocumento === true) {
                let formacionAcademica = new DetalleCalificacionModel();
                formacionAcademica.idDetalleCalificacion = element.idDetalleCalificacion;
                formacionAcademica.idTipoCalificacion = element.idTipoCalificacion;
                formacionAcademica.idCriterioCalificacion = element.idCriterioCalificacion;
                formacionAcademica.idTipoPuntaje = element.idTipoPuntaje;
                formacionAcademica.idDetalleCalificacionPadre = null;
                formacionAcademica.puntajeUnitario = element.puntajeUnitario;
                formacionAcademica.cantidad = +element.cantidad;
                formacionAcademica.puntaje = element.puntajeFinal;
                model.formacionesAcademicas.push(formacionAcademica);
            }
        });

        model.formacionesProfesionales = [];
        this.formacionProfesional.forEach(element => {
            if (element.acreditaDocumento === true) {
                let formacionProfesional = new DetalleCalificacionModel();
                formacionProfesional.idDetalleCalificacion = element.idDetalleCalificacion;
                formacionProfesional.idTipoCalificacion = element.idTipoCalificacion;
                formacionProfesional.idCriterioCalificacion = element.idCriterioCalificacion;
                formacionProfesional.idTipoPuntaje = element.idTipoPuntaje;
                formacionProfesional.idDetalleCalificacionPadre = null;
                formacionProfesional.puntajeUnitario = element.puntajeUnitario;
                formacionProfesional.cantidad = +element.cantidad;
                formacionProfesional.puntaje = element.puntajeFinal;
                model.formacionesProfesionales.push(formacionProfesional);
            }
        });

        model.experienciasLaborales = [];
        this.experienciaLaboral.forEach(element => {
            if (element.acreditaDocumento === true) {
                let experienciaLaboral = new DetalleCalificacionModel();
                experienciaLaboral.idDetalleCalificacion = element.idDetalleCalificacion;
                experienciaLaboral.idTipoCalificacion = element.idTipoCalificacion;
                experienciaLaboral.idCriterioCalificacion = element.idCriterioCalificacion;
                experienciaLaboral.idTipoPuntaje = element.idTipoPuntaje;
                experienciaLaboral.idDetalleCalificacionPadre = null;
                experienciaLaboral.puntajeUnitario = element.puntajeUnitario;
                experienciaLaboral.cantidad = +element.cantidad;
                experienciaLaboral.puntaje = element.puntajeFinal;
                model.experienciasLaborales.push(experienciaLaboral);
            }
        });
        return model;
    }

    handleSave = () => {
        const calificacion = this.prepararData();
        if (this.idOperacion === TipoOperacionEnum.Registrar) {
            this.dataService.Message().msgConfirm('¿Esta seguro de que desea guardar la información?', () => {
                this.dataService.Spinner().show('sp6');
                this.working = true;
                this.createCalificacion(calificacion);
            });
        } else {
            this.dataService.Message().msgConfirm('¿Esta seguro de que desea guardar la información?', () => {
                this.dataService.Spinner().show('sp6');
                this.working = true;
                this.modificarCalificacion(calificacion);
            });
        }

    }

    createCalificacion = (calificacion: any) => {
        const resultMessage = 'Operación realizada de forma exitosa.';
        this.dataService.Contrataciones().crearCalificacion(calificacion).pipe(
            catchError((e) => of(e)),
            finalize(() => {
                this.dataService.Spinner().hide('sp6');
                this.working = false;
            })
        ).subscribe(response => {
            if (response && response.result) {
                this.grabado = true;
                this.dataService.Message().msgInfo(resultMessage, () => { });
            } else if (response && response.statusCode === ResultadoOperacionEnum.NotFound) {
                this.dataService.Message().msgWarning(response.messages[0], () => { });
            } else if (response && response.statusCode === ResultadoOperacionEnum.UnprocessableEntity) {
                this.dataService.Message().msgWarning(response.messages[0], () => { });
            } else {
                this.dataService.Message().msgError('Ocurrieron algunos problemas al guardar la información.', () => { this.working = false; });
            }
        });
    }

    modificarCalificacion = (calificacion: any) => {
        const resultMessage = 'Operación realizada de forma exitosa.';
        this.dataService.Contrataciones().modificarCalificacion(calificacion).pipe(
            catchError((e) => of(e)),
            finalize(() => {
                this.dataService.Spinner().hide('sp6');
                this.working = false;
            })
        ).subscribe(response => {
            if (response && response.result) {
                this.grabado = true;
                this.dataService.Message().msgInfo(resultMessage, () => { });
                this.matDialogRef.close({ grabado: true });
            } else if (response && response.statusCode === ResultadoOperacionEnum.NotFound) {
                this.dataService.Message().msgWarning(response.messages[0], () => { });
            } else if (response && response.statusCode === ResultadoOperacionEnum.UnprocessableEntity) {
                this.dataService.Message().msgWarning(response.messages[0], () => { });
            } else {
                this.dataService.Message().msgError('Ocurrieron algunos problemas al guardar la información.', () => { this.working = false; });
            }
        });
    }

    calculateEvaluacionExpediente = () => {
        let puntajeTotal = 0;
        this.formacionAcademica.forEach(element => {
            if (element.tieneSubcriterios != true) {
                if (element.puntajeFinal != null) {
                    puntajeTotal = puntajeTotal + element.puntajeFinal;
                }
            }
        });

        this.calificacion.puntajeFormacionAcademica = puntajeTotal;
        puntajeTotal = 0;
        this.formacionProfesional.forEach(element => {
            if (element.tieneSubcriterios != true) {
                if (element.puntajeFinal != null) {
                    puntajeTotal = puntajeTotal + element.puntajeFinal;
                }
            }
        });

        this.calificacion.puntajeFormacionProfesional = puntajeTotal;
        puntajeTotal = 0;
        this.experienciaLaboral.forEach(element => {
            if (element.tieneSubcriterios != true) {
                if (element.puntajeFinal != null) {
                    puntajeTotal = puntajeTotal + element.puntajeFinal;
                }
            }
        });
        this.calificacion.puntajeExperienciaLaboral = puntajeTotal;
        this.calificacion.puntajeEvaluacionExpediente = this.calificacion.puntajeFormacionAcademica + this.calificacion.puntajeFormacionProfesional + this.calificacion.puntajeExperienciaLaboral;
    }

}