import { Component, OnInit, AfterViewInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { DataService } from '../../../../../core/data/data.service';
import { SecurityModel } from 'app/core/model/security/security.model';
import { accionPersonalRegistro, accionReference, codigoAreaDesempenioLaboral, EstadoDesplazamientoEnum, regimenLaboral, tipoSede } from '../_utils/constants';
import { catchError, finalize, takeUntil } from 'rxjs/operators';
import { of, Subject } from 'rxjs';
import { MatDialog } from '@angular/material/dialog';
import { ObservarAccionDesplazamientoComponent } from '../components/observar-accion-desplazamiento/observar-accion-desplazamiento.component';
import { GenerarProyectoComponent } from '../components/generar-proyecto/generar-proyecto.component';
import { RegistrarDesplazamientoService } from './services/registrar-desplazamiento.service';
import { RegexPatterns } from '../_utils/regexPatterns';
import * as moment from 'moment';
import { desplazamientoErrorMessages } from '../_utils/desplazamiento.error.messages';
import { DesplazamientoDataService } from './services/desplazamiento-data.service';
import { ReglasFechaValidacionService } from './services/reglas-fecha-validacion.service';

@Component({
    selector: 'minedu-registro-desplazamiento',
    templateUrl: './registro-desplazamiento.component.html',
    styleUrls: ['./registro-desplazamiento.component.scss']
})
export class RegistroDesplazamientoComponent implements OnInit, OnDestroy {
    idAccionPersonal: number;
    currentSession: SecurityModel;

    nombreCabecera = "Nuevo Registro";
    formulario: FormGroup;
    esPorMandatoJudicial = false;

    PERMUTA: number = accionReference.PERMUTA;
    ENCARGATURA: number = accionReference.ENCARGATURA;
    DESTAQUE: number = accionReference.DESTAQUE;
    ROTACION: number = accionReference.ROTACION;
    DESIGNACION: number = accionReference.DESIGNACION;
    REASIGNACION: number = accionReference.REASIGNACION;
    ASCENSOCARGO: number = accionReference.ASCENSOCARGO;
    ASCENSOESCALAMAGISTERIAL: number = accionReference.ASCENSOESCALAMAGISTERIAL;
    UBICACIONESCALAMAGISTERIAL: number = accionReference.UBICACIONESCALAMAGISTERIAL;
    RETORNAR: number = accionReference.RETORNAR;
    UBICACION: number = accionReference.UBICACION;
    estadosDesplazamientoEnum = EstadoDesplazamientoEnum;

    codigoEstadoDesplazamiento: number = null;
    idAccionValue: number = null;

    private _unsubscribeAll: Subject<any>;

    constructor(
        private dataService: DataService,
        private materialDialog: MatDialog,
        private router: Router,
        private route: ActivatedRoute,
        private formBuilder: FormBuilder,
        private registrarDesplazamientoService: RegistrarDesplazamientoService,
        private desplazamientoDataService: DesplazamientoDataService,
        private reglasFechaValidacionService: ReglasFechaValidacionService
    ) {
        this._unsubscribeAll = new Subject();
        this.registrarDesplazamientoService.iniciar();
    }

    ngOnInit(): void {
        this.idAccionPersonal = this.route.snapshot.params.id;
        this.buildForm();
        this.currentSession = this.dataService.Storage().getInformacionUsuario();
        this.listenPorMandatoJudicial();
        this.listenMotivoAccion();
        this.getInfAccionPersonal();
    }


    ngOnDestroy(): void {
        this._unsubscribeAll.next();
        this._unsubscribeAll.complete();
        this.registrarDesplazamientoService.matar();
    }

    generarProyecto() {
        if (!this.isValidForm()) return;

        const accionPersonalForm = this.formulario.controls["accionPersonal"] as FormGroup;

        const idRegimenLaboral = accionPersonalForm?.controls["idRegimenLaboral"].value;
        const strRegimenLaboral = accionPersonalForm?.controls["strRegimenLaboral"].value;

        const idGrupoAccion = accionPersonalForm?.controls["idGrupoAccion"].value;
        const strGrupoAccion = accionPersonalForm?.controls["strGrupoAccion"].value;

        const idAccion = accionPersonalForm?.controls["idAccion"].value;
        const strAccion = accionPersonalForm?.controls["strAccion"].value;

        const idMotivoAccion = accionPersonalForm?.controls["idMotivoAccion"].value;
        const strMotivoAccion = accionPersonalForm?.controls["strMotivoAccion"].value;

        const dataRequest = this.buildBodyData();
        const dialogRef = this.materialDialog.open(GenerarProyectoComponent, {
            panelClass: 'minedu-ver-informacion-adjudicacion-dialog',
            width: '980px',
            disableClose: true,
            data: {
                idRegimenLaboral,
                abreviaturaRegimenLaboral: strRegimenLaboral,
                idGrupoAccion,
                abreviaturaGrupoAccion: strGrupoAccion,
                idAccion,
                abreviaturaAccion: strAccion,
                idMotivoAccion,
                abreviaturaMotivoAccion: strMotivoAccion,
                info: dataRequest
            }
        });
        dialogRef.afterClosed().pipe(takeUntil(this._unsubscribeAll)).subscribe((response) => {
            if (response?.isSuccess) {
                this.handleRegresar();
            }
        });
    }

    handleLimpiar() {
        if (!this.idAccionPersonal) {
            this.formulario.reset();
            return;
        }
        (this.formulario.controls["datosPersonales"] as FormGroup).reset();
        (this.formulario.controls["adjudicacionPersona"] as FormGroup).reset();
        (this.formulario.controls["plazaOrigen"] as FormGroup).reset();
        (this.formulario.controls["plazaDestino"] as FormGroup).reset();
        (this.formulario.controls["datosAccion"] as FormGroup).reset();
    }

    handleRegresar() {
        this.router.navigate(['ayni/personal/acciones/desplazamiento']);
    }

    private buildForm() {

        this.formulario = this.formBuilder.group({
            codigoEstadoDesplazamiento: [null],
            accionPersonal: this.formBuilder.group({
                porMandatoJudicial: [false],
                porProceso: [false],
                idRegimenLaboral: [null, [Validators.required]],
                strRegimenLaboral: [null],
                idGrupoAccion: [null, [Validators.required]],
                strGrupoAccion: [null],
                idAccion: [null, [Validators.required]],
                strAccion: [null],
                idMotivoAccion: [null, [Validators.required]],
                strMotivoAccion: [null]
            }),
            datosPersonales: this.formBuilder.group({}),
            adjudicacionPersona: this.formBuilder.group({
                esValido: [false],
                adjudicado: [null],
                idAdjudicacionProceso: [null],
                codigoAdjudicacionProceso: [null],
                fechaInformeEscalafonario: [null],
                numeroInformeEscalafonario: [null],
                tiempoServicio: [null],
                documentoEscalafonario: [null],
                fechaInicioAdjudicacion: [null],
                fechaFinAdjudicacion: [null],
                codigoPlazaDestino: [null],
                itemPlaza: [null],
                tipoPlaza: [null],
                institucionEducativa: [null],
                regimenLaboral: [null],
                condicionLaboral: [null],
                jornadaLaboral: [null],
                categoriaRemunerativa: [null],
                tipoCargo: [null],
                modalidadEducativa: [null],
                nivelEducativo: [null],
                areaCurricular: [null],
                cargo: [null],
                vigenciaFin: [null],
                situacionLaboral: [null],
                mensaje: [null]
            }),
            plazaOrigen: this.formBuilder.group({}),
            plazaDestino: this.formBuilder.group({}),
            datosAccion: this.formBuilder.group({})
        });
    }

    private listenPorMandatoJudicial() {
        const accionPersonalForm = this.formulario?.controls["accionPersonal"] as FormGroup;
        accionPersonalForm?.controls["porMandatoJudicial"].valueChanges.pipe(takeUntil(this._unsubscribeAll)).subscribe(esPorMandatoJudicial => {
            if (esPorMandatoJudicial == null) return;
            this.esPorMandatoJudicial = esPorMandatoJudicial;
        });
    }

    private listenMotivoAccion() {

        const accionPersonalForm = this.formulario.controls["accionPersonal"] as FormGroup;

        accionPersonalForm?.controls["idMotivoAccion"].valueChanges.pipe(takeUntil(this._unsubscribeAll)).subscribe(idMotivoAccion => {
            if (idMotivoAccion == null) return;
            return this.idAccionValue = accionPersonalForm.controls["idAccion"].value;
        });
    }

    handleObservacion() {
        
        if (!this.isValidForm()) return;

        var dataRequest = this.buildBodyData();
        const dialogRef = this.materialDialog.open(ObservarAccionDesplazamientoComponent, {
            panelClass: 'Minedu-observar-accion-desplazamiento-dialog',
            disableClose: true,
            data: {
                info: dataRequest
            }
        });
        dialogRef.afterClosed()
            .pipe(takeUntil(this._unsubscribeAll)).subscribe((response: any) => {
                if (response) {
                    this.handleRegresar()
                }
                return;
            });
    }

    private isValidForm() {
        const accionPersonalForm = this.formulario?.controls["accionPersonal"] as FormGroup;
        const idAccion = accionPersonalForm?.controls["idAccion"]?.value;
        const idRegimenLaboral = accionPersonalForm?.controls["idRegimenLaboral"]?.value;


        let isFormValid = true;
        let errorMessage = null; "DEBE INGRESAR TODOS LOS CAMPOS OBLIGATORIOS."

        switch (idAccion) {

            case this.DESIGNACION:
                {
                    const validator1 = this.reglasFechaValidacionService.fechaInicioMayorFechaTermino(this.formulario);
                    const validator2 = this.reglasFechaValidacionService.fechaInicioMenorPlazaVigenciaInicio(this.formulario);
                    const validator3 = this.reglasFechaValidacionService.fechaInicioFinRango4AniosMenor30Dias(this.formulario);
                    const validator = ([validator1, validator2, validator3].filter(x => x.isValid === false))[0] ?? null;

                    if (validator) {
                        isFormValid = validator.isValid;
                        errorMessage = validator.errorMessage;
                    }
                    break;
                }

            case this.DESTAQUE:
                {
                    const validator1 = this.reglasFechaValidacionService.fechaInicioMayorFechaTermino(this.formulario);
                    const validator2 = this.reglasFechaValidacionService.fechaInicioMenorPlazaVigenciaInicio(this.formulario);
                    const validator3 = this.reglasFechaValidacionService.fechaInicioFinRangoMayorAnioFiscalMenor30Dias(this.formulario);
                    const validator = ([validator1, validator2, validator3].filter(x => x.isValid === false))[0] ?? null;

                    if (validator) {
                        isFormValid = validator.isValid;
                        errorMessage = validator.errorMessage;
                    }
                    break;
                }


            case this.REASIGNACION:
                {
                    const validator = this.reglasFechaValidacionService.fechaInicioMenorPlazaVigenciaInicio(this.formulario);
                    isFormValid = validator.isValid;
                    if (!validator.isValid) errorMessage = validator.errorMessage;
                    break;
                }
            case this.ASCENSOCARGO:
                {
                    // const validator1 = this.reglasFechaValidacionService.fechaInicioMayorFechaTermino(this.formulario);
                    const validator2 = this.reglasFechaValidacionService.fechaInicioMenorPlazaVigenciaInicio(this.formulario);
                    const validator = [validator2].filter(x => x.isValid === false)[0] ?? null;

                    if (validator) {
                        isFormValid = validator.isValid;
                        errorMessage = validator.errorMessage;
                    }

                    break;
                }

            case this.ASCENSOESCALAMAGISTERIAL:
                {
                    // const validator1 = this.reglasFechaValidacionService.fechaInicioMayorFechaTermino(this.formulario);
                    const validator2 = this.reglasFechaValidacionService.fechaInicioMenorPlazaVigenciaInicio(this.formulario);
                    const validator = [validator2].filter(x => x.isValid === false)[0] ?? null;

                    if (validator) {
                        isFormValid = validator.isValid;
                        errorMessage = validator.errorMessage;
                    }

                    break;
                }
            case this.ROTACION:
                {
                    const validator2 = this.reglasFechaValidacionService.fechaInicioMenorPlazaVigenciaInicio(this.formulario);
                    const validator = [validator2].filter(x => x.isValid === false)[0] ?? null;

                    if (validator) {
                        isFormValid = validator.isValid;
                        errorMessage = validator.errorMessage;
                    }

                    break;
                }
            case this.ENCARGATURA:
                {
                    const validator1 = this.reglasFechaValidacionService.fechaInicioMayorFechaTermino(this.formulario);
                    const validator2 = this.reglasFechaValidacionService.fechaInicioMenorPlazaVigenciaInicio(this.formulario);
                    const validator = [validator1, validator2].filter(x => x.isValid === false)[0] ?? null;

                    if (validator) {
                        isFormValid = validator.isValid;
                        errorMessage = validator.errorMessage;
                    }

                    break;
                }
            case this.PERMUTA:
                {
                    const validator1 = this.reglasFechaValidacionService.fechaInicioMenorPlazaVigenciaInicio(this.formulario);
                    let validatorX = { isValid: true, errorMessage: '' };

                    switch (idRegimenLaboral) {
                        case regimenLaboral.LEY_30512: {
                            validatorX = this.reglasFechaValidacionService.fechaInicio1erDiaMesMarzoProxAnio(this.formulario);
                            break;
                        }
                        case regimenLaboral.LEY_30493: {
                            validatorX = this.reglasFechaValidacionService.fechaInicio1erDiaMesMarzoProxAnio(this.formulario);
                            break;
                        }
                        case regimenLaboral.LEY_276: {
                            validatorX = this.reglasFechaValidacionService.fechaInicio1erDiaMesEneroProxAnio(this.formulario);
                            break;
                        }
                        case regimenLaboral.LEY_29944: {
                            const plazaOrigenForm = this.formulario.controls["plazaOrigen"] as FormGroup;
                            const plazaDestinoForm = this.formulario.controls["plazaDestino"] as FormGroup;

                            const codigoAreaDesempenioLaboralOrigen = plazaOrigenForm.controls["codigoAreaDesempenioLaboral"].value;
                            const codigoAreaDesempenioLaboralDestino = plazaDestinoForm.controls["codigoAreaDesempenioLaboral"].value;

                            if (codigoAreaDesempenioLaboralOrigen == codigoAreaDesempenioLaboralDestino) {
                                if (codigoAreaDesempenioLaboralOrigen == codigoAreaDesempenioLaboral.GESTION_PEDAGOGICA) {
                                    validatorX = this.reglasFechaValidacionService.fechaInicio1erDiaMesMarzoProxAnio(this.formulario);
                                }
                                else if (codigoAreaDesempenioLaboralOrigen == codigoAreaDesempenioLaboral.GESTION_INSTITUCIONAL) {
                                    validatorX = this.reglasFechaValidacionService.fechaInicio1erDiaMesEneroProxAnio(this.formulario);
                                }
                            } else {
                                const isValid = false;
                                const errorMessage = "Área de Desempeño laboral es distinto entre las plazas ingresadas.";
                                validatorX = { isValid, errorMessage };
                            }

                            break;
                        }
                    }

                    const validator = [validator1, validatorX].filter(x => x.isValid === false)[0] ?? null;

                    if (validator) {
                        isFormValid = validator.isValid;
                        errorMessage = validator.errorMessage;
                    }

                    break;
                }

        }

        if (!this.formulario.valid) {
            this.formulario.markAllAsTouched();
            errorMessage = "DEBE INGRESAR TODOS LOS CAMPOS OBLIGATORIOS.";
            isFormValid = false;
        }

        if (!isFormValid) {
            this.dataService.Message().msgWarning(errorMessage);
        }
        return isFormValid;
    }

    handleCrear() {
        if (!this.isValidForm()) return;

        const accionPersonalForm = this.formulario?.controls["accionPersonal"] as FormGroup;
        const porMandatoJudicial = accionPersonalForm?.controls["porMandatoJudicial"]?.value ?? false;
        const codigoEstadoDesplazamiento = this.formulario?.controls["codigoEstadoDesplazamiento"].value;

        if (!porMandatoJudicial || codigoEstadoDesplazamiento == EstadoDesplazamientoEnum.AUTORIZADO) {
            this.guardarAccionGrabada();
            return;
        }

        this.dataService.Message().msgConfirm('¿ESTÁ SEGURO DE QUE DESEA SOLICITAR AUTORIZACION PARA LA ACCION POR SENTENCIA JUDICIAL?', () => {
            this.guardarAccionGrabada();
        }, () => { });
    }

    private guardarAccionGrabada() {
        let isSuccess = true;
        this.dataService.Message().msgConfirm('¿ESTÁ SEGURO DE QUE DESEA GUARDAR EL REGISTRO?', () => {
            this.dataService.Spinner().show("sp6");
            var dataRequest: any = null;
            dataRequest = this.buildBodyData();
            this.dataService.AccionesPersonal()
                .registrarAccionPersonal(dataRequest)
                .pipe(
                    catchError((error) => {
                        isSuccess = false;
                        const errorMessage = error?.error?.messages[0]?.toUpperCase() ?? null;
                        this.dataService.Message().msgWarning('"' + errorMessage + '"');
                        return of(null);
                    }),
                    finalize(() => { this.dataService.Spinner().hide("sp6"); })
                )
                .pipe(takeUntil(this._unsubscribeAll)).subscribe(response => {
                    if (isSuccess && response) {
                        this.dataService.Message().msgAutoCloseSuccessNoButton('OPERACIÓN REALIZADA DE FORMA EXITOSA.', 3000, () => {
                            this.handleRegresar();
                        });

                    } else if (response && (response.statusCode === 422 || response.statusCode === 404)) {
                        this.dataService.Message().msgWarning('Error, no se pudo crear el registro.', () => { });
                    }
                });
        }, () => { });
    }

    private async getInfAccionPersonal() {
        if (!this.idAccionPersonal) return;

        this.nombreCabecera = "Modificar Registro";
        let isSuccess = true;
        const response = await this.dataService.AccionesPersonal()
            .getInformacionAccionPersonal(this.idAccionPersonal)
            .pipe(
                catchError(() => {
                    isSuccess = false;
                    return of(null);
                }),
                finalize(() => { })
            ).toPromise();

        if (isSuccess && response) {
            this.registrarDesplazamientoService.accionPersonalItem = response;
            this.codigoEstadoDesplazamiento = response.codigoEstadoDesplazamiento;
            this.formulario.controls["codigoEstadoDesplazamiento"].setValue(response.codigoEstadoDesplazamiento);

            if (this.codigoEstadoDesplazamiento !== EstadoDesplazamientoEnum.AUTORIZADO &&
                this.codigoEstadoDesplazamiento !== EstadoDesplazamientoEnum.NO_AUTORIZADO &&
                this.codigoEstadoDesplazamiento !== EstadoDesplazamientoEnum.REGISTRADO &&
                this.codigoEstadoDesplazamiento !== EstadoDesplazamientoEnum.OBSERVADO
            ) {
                this.handleRegresar();
            }
        }
    }

    private buildBodyData() {
        //ACCION PERSONAL
        return this.desplazamientoDataService.buildBodyData(this.formulario, this.currentSession, this.idAccionPersonal);
    }

}
