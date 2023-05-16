import { Component, OnInit, ViewEncapsulation, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { mineduAnimations } from '../../../../../../../@minedu/animations/animations';
import { DataService } from '../../../../../../core/data/data.service';
import { RegimenGrupoAccionEnum, TipoDocumentosIdentidadActivoEnum, TipoZonaEnum, TipoEstadoPronoeiEnum, SituacionResolucionEnum, TipoResolucionEnum, MESSAGE_GESTION, CodigoNivelAcademicoEnum } from '../../_utils/constants';
import { ICatalogoResponse } from '../../interfaces/catalogo.interface';
import { RegexPatterns } from '../../_utils/regexPatterns';
import { Observable, of, Subject, BehaviorSubject } from 'rxjs';
import { catchError, finalize, takeUntil } from 'rxjs/operators';
import { ActivatedRoute, Router } from '@angular/router';
import { IPersonaResponse } from '../../interfaces/persona.interface';
import { ICentroTrabajoResponse } from '../../interfaces/centro-trabajo.interface';
import { PronoeiCatalogoDataService } from '../../services/pronoei-catalogo-data.service';
import { IRegimenGrupoAccionResponse } from '../../interfaces/regimen-grupo-accion.interface';
import { IPronoeiGetByIdResponse } from '../../interfaces/pronoei.interface';
import { GenerarProyectoComponent } from '../popups/generar-proyecto/generar-proyecto.component';
import { CodigoDreUgelService } from '../../services/codigo-dre-ugel.service';
import { RegimenGrupoAccionService } from '../../services/regimen-grupo-accion.service';
import { BuscarCentroTrabajoComponent } from '../popups/buscar-centro-trabajo/buscar-centro-trabajo.component';
import { IMaestroPermisoResponse } from '../../interfaces/maestro-permiso.interface';

@Component({
    selector: 'minedu-pronoei-new',
    templateUrl: './pronoei-new.component.html',
    styleUrls: ['./pronoei-new.component.scss'],
    encapsulation: ViewEncapsulation.None,
    animations: mineduAnimations,
})
export class PronoeiNewComponent implements OnInit, OnDestroy {

    form: FormGroup;

    nombreCabecera = "Nuevo Registro";

    persona$: Observable<IPersonaResponse>;
    private personaBehaviorSubject = new BehaviorSubject<IPersonaResponse>(null);

    centroTrabajo$: Observable<ICentroTrabajoResponse>;
    private centroTrabajoBehaviorSubject = new BehaviorSubject<ICentroTrabajoResponse>(null);

    nvlAcademicoActivoCatalogo$: Observable<ICatalogoResponse[]> | null;
    secundariaDataCatalogo$: Observable<ICatalogoResponse[]> | null;
    nivelSuperiorDataCatalogo$: Observable<ICatalogoResponse[]> | null;
    gradoAcademicoDataCatalogo$: Observable<ICatalogoResponse[]> | null;

    situacionAcademicaActivoCatalogo$: Observable<ICatalogoResponse[]> | null;
    tipoDocumentoIdentidadActivo$: Observable<ICatalogoResponse[]> | null;


    regimenGrupoAccionData$: Observable<IRegimenGrupoAccionResponse>;

    minDate = new Date(new Date().getFullYear(), 0, 1)
    untilDate = new Date(new Date().getFullYear() + 1, 11, 31);
    newMinDate = new Date();
    maxDate = new Date();
    esModificar = false;
    monto = 0;

    private _unsubscribeAll: Subject<any>;
    private passport: any | null;
    private pronoeiId: number | null;

    maestroPermiso$: Observable<IMaestroPermisoResponse>;

    esNivelEducativoSecundaria = false;
    esNivelEducativoSuperior = false;
    esGradoAcademico = false;

    constructor(
        private formBuilder: FormBuilder,
        private materialDialog: MatDialog,
        private dataService: DataService,
        private pronoeiCatalogoDataService: PronoeiCatalogoDataService,
        private codigoDreUgelService: CodigoDreUgelService,
        private regimenGrupoAccionService: RegimenGrupoAccionService,
        private router: Router,
        private activatedRoute: ActivatedRoute
    ) {
        this._unsubscribeAll = new Subject();
        this.persona$ = this.personaBehaviorSubject.asObservable();
        this.centroTrabajo$ = this.centroTrabajoBehaviorSubject.asObservable();
        this.regimenGrupoAccionData$ = this.regimenGrupoAccionService.regimenGrupoAccionData$;
        this.maestroPermiso$ = this.pronoeiCatalogoDataService?.maestroPermiso$;
        this.secundariaDataCatalogo$ = of([]);
        this.nivelSuperiorDataCatalogo$ = of([]);
        this.gradoAcademicoDataCatalogo$ = of([]);
    }

    ngOnInit(): void {
        this.cargarTodo();

    }

    ngOnDestroy(): void {
        this._unsubscribeAll.next();
        this._unsubscribeAll.complete();
        this.personaBehaviorSubject.complete();
        this.centroTrabajoBehaviorSubject.complete();
        this.codigoDreUgelService.complete();
        this.pronoeiCatalogoDataService.complete();
    }

    buscarPersona() {
        this.getDatosPersona();
    }

    validacionFechaPronoei() {
        this.minDate = new Date(new Date().getFullYear(), 0, 1);
        this.newMinDate = (new Date(this.form.get('fechaInicio').value));
        this.maxDate = new Date(this.newMinDate.getFullYear(), 11, 31);
    }

    async onChangeNivelEducativo() {

        //limpiando lista   
        this.limpiarGradoAlcanzado();
        this.situacionAcademicaActivoCatalogo$ = of([]);
        this.form.controls["idSituacionAcademica"].setValue(-1);


        const idNivelEducativoFaValue = this.form.controls["idNivelEducativoFa"].value;
        if (!idNivelEducativoFaValue) return;

        const nvlAcademicoLista = this.pronoeiCatalogoDataService.nvlAcademicoActivoCatalogo;
        var nvlAcademicoEntity = nvlAcademicoLista.find(x => x.id_catalogo_item == idNivelEducativoFaValue);
        if (!nvlAcademicoEntity) return;

        this.form.get('idSecundaria').clearValidators();
        this.form.get('idSuperior').clearValidators();
        this.form.get('idSecundaria').setValue(-1);
        this.form.get('idSuperior').setValue(-1);
        this.esNivelEducativoSecundaria = false;
        this.esNivelEducativoSuperior = false;

        if (nvlAcademicoEntity?.codigo_catalogo_item == CodigoNivelAcademicoEnum.SECUNDARIA) {
            this.esNivelEducativoSecundaria = true;
            await this.loadNivelSecundaria(idNivelEducativoFaValue);
            this.form.get('idSecundaria').setValidators([Validators.required, Validators.pattern(RegexPatterns.POSITIVE_NUMBERS)]);
            this.form.get('idSecundaria').updateValueAndValidity();
            this.form.controls["idSecundaria"].setValue(-1);
            return;
        }
        else if (nvlAcademicoEntity?.codigo_catalogo_item == CodigoNivelAcademicoEnum.SUPERIOR) {
            this.esNivelEducativoSuperior = true;
            await this.loadNivelSuperior(idNivelEducativoFaValue);
            this.form.get('idSuperior').setValidators([Validators.required, Validators.pattern(RegexPatterns.POSITIVE_NUMBERS)]);
            this.form.get('idSuperior').updateValueAndValidity();
            this.form.controls["idSuperior"].setValue(-1);
            return;
        }

        await this.loadSituacionAcademica();
    }

    async handleGuardar() {
        if (!this.form.valid) {
            this.form.markAllAsTouched();
            this.dataService.Message().msgWarning(`"${MESSAGE_GESTION.M08}"`, () => { });
            return;
        } else {
            const message = this.esModificar ? `"${MESSAGE_GESTION.M03}"` : `"${MESSAGE_GESTION.M02}"`;
            this.dataService.Message().msgConfirm(message, async () => {
                const gestionPronoei = this.formDataValue;
                const personaValue = this.personaBehaviorSubject.value;
                personaValue.codigoEstadoCivil = +personaValue.codigoEstadoCivil;
                const persona = { ...personaValue } as IPersonaResponse;

                const idMaestroFormacionAcademica = await this.getIdSituacionAcademica();
                const formacionAcademica = { idMaestroFormacionAcademica };
                const request = { gestionPronoei, persona, formacionAcademica };

                this.dataService.Spinner().show("sp6");
                let isSuccess = true;
                const response = await this.dataService
                    .AccionesVinculacion()
                    .guardarNuevaGestionPronoei(request)
                    .pipe(
                        finalize(() => { this.dataService.Spinner().hide("sp6"); }),
                        catchError((err) => {
                            isSuccess = false;
                            this.dataService.Message().msgWarning('"Ocurrió un error al realizar esta operación"'.toUpperCase());
                            return of([]);
                        })
                    )
                    .toPromise();

                if (isSuccess) {

                    this.dataService.Message().msgAutoCloseSuccessNoButton(MESSAGE_GESTION.M07, 3000, () => {
                        this.router.navigate(['ayni/personal/acciones/pronoei']);
                    });

                }
            });
        }
    }


    getIdSituacionAcademica = async () => {

        const idNivelEducativo = this.form.get("idNivelEducativoFa").value;
        const idSecundaria = this.form.get("idSecundaria").value;
        const idSuperior = this.form.get("idSuperior").value;
        const idSituacionAcademica = this.form.get("idSituacionAcademica").value;
        const idGradoAcademico = this.form.get("idGradoAlcanzado").value;

        const id_nivel_educativo = idNivelEducativo == -1 ? null : idNivelEducativo;
        const id_secundaria = idSecundaria == -1 ? null : idSecundaria;
        const id_superior = idSuperior == -1 ? null : idSuperior;
        const id_situacion_academica = idSituacionAcademica == -1 ? null : idSituacionAcademica;
        const id_grado_academico = idGradoAcademico == -1 ? null : idGradoAcademico;

        const request = {
            id_nivel_educativo,
            id_secundaria,
            id_superior,
            id_situacion_academica,
            id_grado_academico,
        };

        var response = await this.dataService.AccionesVinculacion()
            .getObtenerMaestroFormacionAcademica(request)
            .pipe(catchError((error) => of(null)))
            .toPromise();
        return response?.id_maestro_formacion_academica ?? null;
    }

    async handleEnviarAccionesGrabadas() {

        if (!this.form.valid) {
            this.dataService.Message().msgWarning(`"${MESSAGE_GESTION.M08}"`, () => { });
            return;
        }
        const message = MESSAGE_GESTION.M90;
        this.dataService.Message().msgConfirm(message, async () => {
            const gestionPronoei = this.formDataValue;
            const personaValue = this.personaBehaviorSubject.value;
            personaValue.codigoEstadoCivil = +personaValue.codigoEstadoCivil;
            const persona = { ...personaValue } as IPersonaResponse;

            const request = { gestionPronoei, persona };

            this.dataService.Spinner().show("sp6");
            let isSuccess = true;

            const _response = await this.dataService
                .AccionesVinculacion()
                .enviarAccionesGrabadasPronoei(request)
                .pipe(
                    finalize(() => this.dataService.Spinner().hide("sp6")),
                    catchError((err) => {
                        isSuccess = false;
                        this.dataService.Message().msgWarning('"Ocurrió un error al realizar esta operación"'.toUpperCase());
                        return of([]);
                    })
                ).toPromise();

            if (isSuccess && _response) {
                this.dataService.Spinner().hide("sp6");
                this.dataService.Message().msgAutoCloseSuccessNoButton(MESSAGE_GESTION.M07, 3000, () => {
                    this.router.navigate(['ayni/personal/acciones/pronoei']);
                });
            }
        }, () => { });

    }

    handleLimpiar() {
        this.dataService.Message()
            .msgConfirm('¿ESTÁ SEGURO QUE DESEA LIMPIAR EL FORMULARIO?',
                () => {
                    if (!this.esModificar) {
                        this.form.reset();
                        this.personaBehaviorSubject.next(null);
                        this.centroTrabajoBehaviorSubject.next(null);
                        return;
                    }

                    this.form.controls["codigoModular"].reset();
                    this.form.controls["codModularEncontrado"].reset();
                    this.form.controls["fechaInicio"].reset();
                    this.form.controls["fechaFin"].reset();
                    this.form.controls["checkImpedimento"].reset();

                    this.limpiarNivelEducativoFa();
                    this.limpiarSecundaria();
                    this.limpiarSuperior();
                    this.limpiarSituacionAcademica();
                    this.limpiarGradoAlcanzado();

                    this.form.controls["celular"].reset();
                    this.form.controls["telefono"].reset();
                    this.form.controls["email"].reset();
                    this.form.controls["anotaciones"].reset();
                    this.centroTrabajoBehaviorSubject.next(null);

                }, () => { });
    }

    handleCancelar() {
        this.router.navigate(['ayni/personal/acciones/pronoei']);
    }

    onKeyPressNumeroDocumento(e: any, tiposDocumento: ICatalogoResponse[]): boolean {
        const _tipoDocumento = this.form.get('idTipoDocumentoIdentidad').value;
        const tipoDocumentoSelect = tiposDocumento.find(m => m.id_catalogo_item == _tipoDocumento);
        if (tipoDocumentoSelect?.codigo_catalogo_item == TipoDocumentosIdentidadActivoEnum.DNI) {
            //------------ DNI
            const reg = /^\d+$/;
            const pressedKey = String.fromCharCode(!e.charCode ? e.which : e.charCode);
            if (!reg.test(pressedKey)) {
                e.preventDefault();
                return false;
            }
        } else {
            //------------ PASAPORTE O CARNET DE EXTRANJERIA
            var inp = String.fromCharCode(e.keyCode);

            if (/[a-zA-Z0-9]/.test(inp)) {
                return true;
            } else {
                e.preventDefault();
                return false;
            }
        }
    }

    async buscarCentroTrabajo(e) {
        e?.preventDefault();
        const codigoModular = this.form.controls["codigoModular"].value;

        if (![6, 7].includes(codigoModular?.length) || codigoModular == null) {
            const errorMessage = MESSAGE_GESTION.EX_FILTER_NOTFOUND;
            this.dataService.Message().msgWarning(`"${errorMessage}"`);
            return false;
        }

        const dataUserLoginModel = this.codigoDreUgelService.getCodigoDreUgel();
        const idDre = dataUserLoginModel.idDre;
        const idUgel = dataUserLoginModel.idUgel;

        this.dataService.Spinner().show("sp6");
        let isSuccess = true;
        const response = await this.dataService
            .AccionesVinculacion()
            .getCentroTrabajoxCodMod({ codigoModular, idDre, idUgel })
            .pipe(
                finalize(() => this.dataService.Spinner().hide("sp6")),
                catchError((err) => {
                    const errorMessage = err.error.messages[0];
                    isSuccess = false;
                    this.dataService.Message().msgWarning(`"${errorMessage}"`);
                    this.centroTrabajoBehaviorSubject.next(null);
                    this.form.controls['codModularEncontrado'].setValue(null);
                    return of([]);
                })
            )
            .toPromise();

        if (isSuccess && response) {
            const centroTrabajo = response as ICentroTrabajoResponse;
            if (centroTrabajo) {
                this.form.controls['codModularEncontrado'].setValue(centroTrabajo.codigo_modular);

                const codZona = centroTrabajo.cod_zona ? +centroTrabajo.cod_zona : null;
                this.form.controls['codZona'].setValue(codZona);

                this.centroTrabajoBehaviorSubject.next(centroTrabajo);
                this.form.controls['fechaInicio'].markAsTouched();
                this.form.controls['fechaFin'].markAsTouched();
            }
        }
    }

    handleGenerarProyecto() {

        if (!this.form.valid) {
            this.dataService.Message().msgWarning(`"${MESSAGE_GESTION.M08}"`, () => { });
            return;
        }

        const gestionPronoei = this.formDataValue;
        const personaValue = this.personaBehaviorSubject.value;
        personaValue.codigoEstadoCivil = personaValue.codigoEstadoCivil ? +personaValue.codigoEstadoCivil : null;
        const persona = { ...personaValue } as IPersonaResponse;
        const request = { gestionPronoei, persona };
        const idGestionPronoei = this.activatedRoute.snapshot.paramMap.get('pronoeiId') ?? null;

        this.materialDialog.open(GenerarProyectoComponent, {
            panelClass: 'minedu-generar-proyecto-dialog',
            width: '980px',
            disableClose: true,
            data: {
                title: "Generar proyecto de resoluci&oacute;n",
                formDataPronoei: request,
                idGestionPronoei: +idGestionPronoei
            }
        });
    }

    onChangeCheckImpedimento(event) {
        if (!event?.checked) {
            this.form.controls['checkImpedimento'].setValue(null);
        }
    }

    buscarCentroTrabajoDialogo() {
        const currentSession = this.dataService.Storage().getInformacionUsuario();
        var dialogRef = this.materialDialog.open(BuscarCentroTrabajoComponent, {
            panelClass: 'buscar-centro-trabajo-form-dialog',
            width: "1000px",
            disableClose: true,
            data: {
                action: "requerimiento",
                currentSession: currentSession
            },
        });

        dialogRef.afterClosed()
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((response: any) => {
                if (!response) {
                    return;
                }
                if (response?.centroTrabajo?.codigoCentroTrabajo) {
                    const codCentroTrabajo = response?.centroTrabajo?.codigoCentroTrabajo;
                    this.form.controls['codigoModular'].setValue(codCentroTrabajo);
                    this.buscarCentroTrabajo(null);
                }
            });
    }

    private loadNivelSecundaria = async (idNivelEducativo) => {

        const request = {
            id_nivel_educativo: idNivelEducativo
        };

        var response = await this.dataService
            .AccionesVinculacion()
            .getObtenerSecundarioPonNivelEducativo(request)
            .pipe(catchError((error) => of(null)))
            .toPromise();

        if (response) {
            const data = response.map((x) => ({
                ...x,
                value: x.id_catalogo_item,
                label: `${x.descripcion_catalogo_item}`,
            }));

            this.secundariaDataCatalogo$ = of(data);
        }
    }

    async loadSituacionAcademica() {
        this.limpiarGradoAlcanzado();

        this.situacionAcademicaActivoCatalogo$ = of([]);
        const idNivelEducativoValue = this.form.get('idNivelEducativoFa').value;
        const idSecundariaValue = this.form.get('idSecundaria').value;
        const idSuperiorValue = this.form.get('idSuperior').value;

        const _idNivelEducativo = idNivelEducativoValue == -1 ? null : idNivelEducativoValue;
        const _idSecundaria = idSecundariaValue == -1 ? null : idSecundariaValue;
        const _idSuperior = idSuperiorValue == -1 ? null : idSuperiorValue;

        await this.loadNivelSituacionAcademica(_idNivelEducativo, _idSecundaria, _idSuperior);
    }

    private loadNivelSituacionAcademica = async (idNivelEducativo, idSecundaria, idSuperior) => {
        this.situacionAcademicaActivoCatalogo$ = of([]);
        this.form.controls["idSituacionAcademica"].setValue(-1);

        const request = {
            id_nivel_educativo: idNivelEducativo,
            id_secundaria: idSecundaria,
            id_superior: idSuperior
        };

        var response = await this.dataService
            .AccionesVinculacion()
            .getComboSituacionAcademica(request)
            .pipe(catchError((error) => of(null)))
            .toPromise();

        if (response) {
            const data = response.map((x) => ({
                ...x,
                value: x.id_catalogo_item,
                label: `${x.descripcion_catalogo_item}`,
            }));

            this.situacionAcademicaActivoCatalogo$ = of(data);
        }
    }


    async onChangeSituacionAcademica() {
        this.gradoAcademicoDataCatalogo$ = of([]);

        const idNivelEducativoValue = this.form.controls["idNivelEducativoFa"].value;
        const idSecundariaValue = this.form.controls["idSecundaria"].value;
        const idSuperiorValue = this.form.controls["idSuperior"].value;
        const idSituacionAcademicaValue = this.form.controls["idSituacionAcademica"].value;

        const idNivelEducativo = idNivelEducativoValue == -1 ? null : idNivelEducativoValue;
        const idSecundaria = idSecundariaValue == -1 ? null : idSecundariaValue;
        const idSuperior = idSuperiorValue == -1 ? null : idSuperiorValue;
        const idSituacionAcademica = idSituacionAcademicaValue == -1 ? null : idSituacionAcademicaValue;

        await this.loadComboGradosAcademicos(idNivelEducativo, idSecundaria, idSuperior, idSituacionAcademica);
    }

    private loadComboGradosAcademicos = async (idNivelEducativo, idSecundaria, idSuperior, idSituacionAcademica) => {
        this.form.get('idGradoAlcanzado').clearValidators();
        this.esGradoAcademico = false

        const request = {
            id_nivel_educativo: idNivelEducativo,
            id_secundaria: idSecundaria,
            id_superior: idSuperior,
            id_situacion_academica: idSituacionAcademica
        };

        var response = await this.dataService
            .AccionesVinculacion()
            .getObtenerGradoAcademico(request)
            .pipe(catchError((error) => of(null)))
            .toPromise();
        if (response && response?.length > 0) {

            this.esGradoAcademico = true;
            const data = response.map((x) => ({
                ...x,
                value: x.id_catalogo_item,
                label: `${x.descripcion_catalogo_item}`,
            }));

            this.gradoAcademicoDataCatalogo$ = of(data);
            this.form.get('idGradoAlcanzado').setValidators([Validators.required, Validators.pattern(RegexPatterns.POSITIVE_NUMBERS)]);
            this.form.get('idGradoAlcanzado').updateValueAndValidity();
            this.form.controls["idGradoAlcanzado"].setValue(-1);
        }
    }



    private limpiarNivelEducativoFa() {
        this.form.get('idNivelEducativoFa').setValue(-1);
    }

    private limpiarSecundaria() {
        this.esNivelEducativoSecundaria = false;
        this.form.get('idSecundaria').clearValidators();
        this.form.controls["idSecundaria"].setValue(-1);
        this.secundariaDataCatalogo$ = of([]);
    }

    private limpiarSuperior() {
        this.esNivelEducativoSuperior = false;
        this.form.get('idSuperior').clearValidators();
        this.form.controls["idSuperior"].setValue(-1);
        this.nivelSuperiorDataCatalogo$ = of([]);
    }

    private limpiarSituacionAcademica() {
        this.form.get('idSituacionAcademica').clearValidators();
        this.form.controls["idSituacionAcademica"].setValue(-1);
        this.situacionAcademicaActivoCatalogo$ = of([]);
    }

    private limpiarGradoAlcanzado() {
        this.esGradoAcademico = false;
        this.form.get('idGradoAlcanzado').clearValidators();
        this.form.controls["idGradoAlcanzado"].setValue(-1);
        this.gradoAcademicoDataCatalogo$ = of([]);
    }




    loadNivelSuperior = async (idNivelEducativo) => {

        const request = {
            id_nivel_educativo: idNivelEducativo
        };

        var response = await this.dataService
            .AccionesVinculacion()
            .getObtenerSuperiorPonNivelEducativo(request)
            .pipe(catchError((error) => of(null)))
            .toPromise();

        if (response) {
            const data = response.map((x) => ({
                ...x,
                value: x.id_catalogo_item,
                label: `${x.descripcion_catalogo_item}`,
            }));
            this.nivelSuperiorDataCatalogo$ = of(data);

        }
    }



    private async obtenerPronoeiData() {
        const responseId = this.activatedRoute.snapshot.paramMap.get('pronoeiId') ?? null;
        if (responseId) {

            this.nombreCabecera = "Modificar Registro"
            this.pronoeiId = +responseId;
            this.dataService.Spinner().show("sp6");
            const response = await this.dataService.AccionesVinculacion().getPronoeiPorId(this.pronoeiId).toPromise();
            this.dataService.Spinner().hide("sp6");
            if (response) {
                const pronoeiData = response as IPronoeiGetByIdResponse;

                if (pronoeiData.codigoEstadoPronoei !== TipoEstadoPronoeiEnum.REGISTRADO) {
                    this.router.navigate(['ayni/personal/acciones/pronoei']);
                    return;
                }
                this.esModificar = true;
                this.form.controls["esMandatoJudicial"].setValue(pronoeiData.esMandatoJudicial);
                this.form.controls["fechaInicio"].setValue(pronoeiData.fechaInicio);
                this.form.controls["fechaFin"].setValue(pronoeiData.fechaFin);
                this.form.controls["checkImpedimento"].setValue(pronoeiData.checkImpedimento);

                this.form.controls["anotaciones"].setValue(pronoeiData.anotaciones);

                const persona: IPersonaResponse = {
                    numeroDocumentoIdentidad: pronoeiData.persona.numeroDocumentoIdentidad,
                    idTipoDocumentoIdentidad: pronoeiData.persona.tipoDocumentoIdentidad,
                    primerApellido: pronoeiData.persona.primerApellido,
                    segundoApellido: pronoeiData.persona.segundoApellido,
                    nombres: pronoeiData.persona.nombres,
                    fechaNacimiento: pronoeiData.persona.fechaNacimiento,
                    fechaNacimientoStr: pronoeiData.persona.fechaNacimientoStr,
                    sexo: pronoeiData.persona.descripcionGenero,
                    estadoCivil: pronoeiData.persona.descripcionEstadoCivil,
                    tipoDocumentoIdentidad: pronoeiData.persona.descTipoDocumentoIdentidad,
                };
                this.form.controls["documentoEncontrado"].setValue(pronoeiData.persona.numeroDocumentoIdentidad);

                this.personaBehaviorSubject.next(persona);

                const centroTrabajo: ICentroTrabajoResponse = {
                    id_centro_trabajo: pronoeiData.institucionEducativa.idCentroTrabajo,
                    codigo_modular: pronoeiData.institucionEducativa.codigoModular,
                    institucion_educativa: pronoeiData.institucionEducativa.centroTrabajo,
                    descripcion_dre: pronoeiData.institucionEducativa.descDre,
                    descripcion_ugel: pronoeiData.institucionEducativa.descUgel,
                    descripcion_modalidad_educativa: pronoeiData.institucionEducativa.descModalidadEducativa,
                    descripcion_nivel_educativo: pronoeiData.institucionEducativa.descNivelEducativo,
                    tipo_gestion_educativa: pronoeiData.institucionEducativa.descTipoGestion,
                    dependencia_institucion_educativa: pronoeiData.institucionEducativa.descDependencia,
                    cod_zona: pronoeiData.institucionEducativa.codigoZona,
                    centro_poblado_institucion_educativa: pronoeiData.institucionEducativa.centroPoblado,
                    zona: pronoeiData.institucionEducativa.descripcionZona,
                    departamento: pronoeiData.institucionEducativa.departamento,
                    provincia: pronoeiData.institucionEducativa.provincia,
                    distrito: pronoeiData.institucionEducativa.distrito,
                }
                this.centroTrabajoBehaviorSubject.next(centroTrabajo);

                const idNivelEducativoFaValue = pronoeiData?.maestroFormacionAcademica?.idNivelEducativoFa;
                this.form.controls["idNivelEducativoFa"].setValue(idNivelEducativoFaValue);
                await this.onChangeNivelEducativo();

                if (pronoeiData?.maestroFormacionAcademica?.idSecundaria) {
                    this.form.controls["idSecundaria"].setValue(pronoeiData?.maestroFormacionAcademica?.idSecundaria);
                    await this.loadSituacionAcademica();
                }
                else if (pronoeiData?.maestroFormacionAcademica?.idSuperior) {
                    this.form.controls["idSuperior"].setValue(pronoeiData?.maestroFormacionAcademica?.idSuperior);
                    await this.loadSituacionAcademica();
                }

                if (pronoeiData?.maestroFormacionAcademica?.idSituacionAcademica) {
                    this.form.controls["idSituacionAcademica"].setValue(pronoeiData?.maestroFormacionAcademica?.idSituacionAcademica);
                    await this.onChangeSituacionAcademica();
                }

                if (pronoeiData?.maestroFormacionAcademica?.idNivelGradoAcademico) {
                    this.form.controls["idGradoAlcanzado"].setValue(pronoeiData?.maestroFormacionAcademica?.idNivelGradoAcademico);
                }

                const codZona = centroTrabajo.cod_zona ? +centroTrabajo.cod_zona : null;

                this.form.controls["codZona"].setValue(codZona);
                this.form.controls["codModularEncontrado"].setValue(centroTrabajo.codigo_modular);
                this.form.controls["codigoModular"].setValue(centroTrabajo.codigo_modular);
                this.form.controls["idTipoDocumentoIdentidad"].setValue(persona.idTipoDocumentoIdentidad);
                this.form.controls["numeroDocumentoIdentidad"].setValue(persona.numeroDocumentoIdentidad);
                this.form.controls["celular"].setValue(pronoeiData.persona.celular);
                this.form.controls["telefono"].setValue(pronoeiData.persona.telefono);
                this.form.controls["email"].setValue(pronoeiData.persona.email);

            }
        }
    }


    private get formDataValue() {
        const persona = this.personaBehaviorSubject.value;
        const centroTrabajo = this.centroTrabajoBehaviorSubject.value;
        const dataUserLoginModel = this.codigoDreUgelService.getCodigoDreUgel();
        const request = {
            idGestionPronoei: this.pronoeiId,
            idDre: dataUserLoginModel.idDre,
            idUgel: dataUserLoginModel.idUgel,
            idRegimenGrupoAccion: RegimenGrupoAccionEnum.PRONOEI,
            idPersona: null,
            idTipoDocumentoIdentidad: persona.idTipoDocumentoIdentidad,
            numeroDocumentoIdentidad: persona.numeroDocumentoIdentidad,
            idCentroTrabajo: centroTrabajo.id_centro_trabajo,
            codEstadoPronoei: TipoEstadoPronoeiEnum.REGISTRADO,
            codigoTipoZona: centroTrabajo.cod_zona ? +centroTrabajo.cod_zona : null,
            idSituacionResolucion: null,

            idNivelEducativoFa: this.form.controls['idNivelEducativoFa'].value,
            idSituacionAcademica: this.form.controls['idSituacionAcademica'].value,
            codSituacionResolucion: SituacionResolucionEnum.ORIGINAL,
            codTipoResolucion: TipoResolucionEnum.NO_ESPECIFICADO,
            annio: (new Date(this.form.get('fechaInicio').value).getFullYear()),
            esMandatoJudicial: this.form.controls['esMandatoJudicial'].value,
            fechaInicio: (new Date(this.form.controls['fechaInicio'].value)),
            fechaFin: (new Date(this.form.controls['fechaFin'].value)),
            checkImpedimento: this.form.controls['checkImpedimento'].value,
            idGradoAlcanzado: this.form.controls['idGradoAlcanzado'].value,
            anotaciones: this.form.controls['anotaciones'].value,

            codigoProcesoAprobacion: null,
            codigoAccionGrabada: null,
            codigoProyectoResolucion: null,
            fechaProyectoResolucion: null,
            numeroProyectoResolucion: null,
            documentoProyectoResolucion: null,
            codigoResolucion: null,
            fechaResolucion: null,
            numeroResolucion: null,
            documentoResolucion: null,

            celular: this.form.controls['celular'].value,
            telefono: this.form.controls['telefono'].value,
            email: this.form.controls['email'].value,

            fechaCreacion: new Date(),
            usuarioCreacion: this.passport.nombreUsuario
        }
        return request;
    }

    private async cargarTodo() {
        this.formBuilderInit();
        await this.getDreUgelData();
        await this.cargarCombos();
        await this.obtenerPronoeiData();
        this.buildPassport();
    }

    private async getDreUgelData() {
        var entidadSede = await this.codigoDreUgelService.getCodigoDreUgelFromServiceInit();
        const entidadPassport = this.codigoDreUgelService.passportModel;

        const tipoSedeList = ['TS001', 'TS002', 'TS012'];
        if (entidadPassport.CODIGO_ROL == 'AYNI_019' &&
            (!entidadSede || !entidadSede?.codigoTipoSede || !tipoSedeList.includes(entidadSede.codigoTipoSede))) {
            this.router.navigate(['/ayni/personal/inicio']);
            return;
        }
    }

    private validarAccionPermiso() {
        const maestroPermiso = this.pronoeiCatalogoDataService.maestroPermiso;
        const responseId = this.activatedRoute.snapshot.paramMap.get('pronoeiId') ?? null;
        if ((!maestroPermiso.nuevoRegistro && !responseId) || (!maestroPermiso.editarRegistro && responseId)) {
            this.handleCancelar();
        }
    }

    private buildPassport() {
        this.passport = this.dataService.Storage().getInformacionUsuario();
    }

    private async getDatosPersona() {

        if ((this.form.get('idTipoDocumentoIdentidad').value == TipoDocumentosIdentidadActivoEnum.CARNET_EXTRANJERIA ||
            this.form.get('idTipoDocumentoIdentidad').value == TipoDocumentosIdentidadActivoEnum.PASAPORTE) &&
            !this.form.get('numeroDocumentoIdentidad').valid) {

            const errorMessage = MESSAGE_GESTION.EX08;
            this.dataService.Message().msgWarning(`"${errorMessage}"`);
            return false;
        }

        if (this.form.get('idTipoDocumentoIdentidad').value == TipoDocumentosIdentidadActivoEnum.DNI &&
            !this.form.get('numeroDocumentoIdentidad').valid) {
            const errorMessage = MESSAGE_GESTION.EX03;
            this.dataService.Message().msgWarning(`"${errorMessage}"`);
            return false;
        }

        if (!this.form.get('idTipoDocumentoIdentidad').valid || !this.form.get('numeroDocumentoIdentidad').valid) {
            const errorMessage = MESSAGE_GESTION.M43;
            this.dataService.Message().msgWarning(`"${errorMessage}"`);
            return false;
        }

        const request = {
            numeroDocumentoIdentidad: this.form.get('numeroDocumentoIdentidad').value,
            idTipoDocumentoIdentidad: this.form.get('idTipoDocumentoIdentidad').value,
        };

        this.dataService.Spinner().show("sp6");
        let isSuccess = true;
        const response = await this.dataService.AccionesVinculacion()
            .getPersonaPronoei(request)
            .pipe(
                finalize(() => this.dataService.Spinner().hide("sp6")),
                catchError((err) => {
                    isSuccess = false;
                    const errorMessage = err.error.messages[0];
                    this.dataService.Message().msgWarning(`"${errorMessage}"`.toUpperCase());

                    if (!this.esModificar) {
                        this.form.controls['documentoEncontrado'].setValue(null);
                        this.personaBehaviorSubject.next(null);
                    }

                    return of([]);
                })
            )
            .toPromise();

        if (isSuccess && response) {
            const personaResponse = response as IPersonaResponse;

            if (personaResponse.tiene_pronoei) {
                this.dataService.Message().msgWarning(`"${MESSAGE_GESTION.M135}"`);
                return;
            }

            this.form.controls['documentoEncontrado'].setValue(personaResponse.numeroDocumentoIdentidad);
            this.personaBehaviorSubject.next(personaResponse);
        }
    }

    private validarTipoDoc(tipoDoc: number) {

        let regExpr: RegExp = null;

        switch (tipoDoc) {
            case TipoDocumentosIdentidadActivoEnum.DNI:
                regExpr = RegexPatterns.DNI;
                break;
            case TipoDocumentosIdentidadActivoEnum.PASAPORTE:
                regExpr = RegexPatterns.PASAPORTE;
                break;
            case TipoDocumentosIdentidadActivoEnum.CARNET_EXTRANJERIA:
                regExpr = RegexPatterns.CARNET_EXTRANJERIA;
                break;
        }

        if (regExpr) {
            const numeroDocumentoIdentidad = this.form.get("numeroDocumentoIdentidad");
            numeroDocumentoIdentidad.setValidators([Validators.required, Validators.pattern(regExpr)]);
            numeroDocumentoIdentidad.updateValueAndValidity();
            this.form.patchValue({ numeroDocumentoIdentidad: null });
        }
    }

    private formBuilderInit() {
        this.form = this.formBuilder.group({
            esMandatoJudicial: [false, [Validators.required]],
            idTipoDocumentoIdentidad: [-1, [Validators.required, Validators.pattern(RegexPatterns.POSITIVE_NUMBERS)]],
            numeroDocumentoIdentidad: [null, [Validators.required]],
            documentoEncontrado: [null, Validators.required],
            codigoModular: [null],
            codModularEncontrado: [null, Validators.required],
            fechaInicio: [null, [Validators.required]],
            fechaFin: [null, [Validators.required]],
            checkImpedimento: [null, [Validators.required]],
            idNivelEducativoFa: [-1, [Validators.required, Validators.pattern(RegexPatterns.POSITIVE_NUMBERS)]],

            idSecundaria: [null],
            idSuperior: [null],


            idSituacionAcademica: [-1, [Validators.required, Validators.pattern(RegexPatterns.POSITIVE_NUMBERS)]],
            idGradoAlcanzado: [null],

            celular: [null, [Validators.minLength(9), Validators.required]],
            telefono: [null, [Validators.minLength(7), Validators.maxLength(9)]],
            email: [null, [Validators.required, Validators.pattern(RegexPatterns.EMAIL)]],
            anotaciones: [null],
            codZona: [null, [Validators.required]]
        });

        this.form.controls["numeroDocumentoIdentidad"].disable();
        this.form.controls['fechaFin'].disable();

        this.form.get("idTipoDocumentoIdentidad").valueChanges
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((value) => {
                if (!this.esModificar) {
                    this.form.controls['documentoEncontrado'].setValue(null);
                    this.personaBehaviorSubject.next(null);
                }

                if (value) {
                    this.validarTipoDoc(value);
                    this.form.controls["numeroDocumentoIdentidad"].enable();
                }
            });

        this.form.get("fechaInicio").valueChanges
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe(value => {
                if (value) {
                    this.form.controls['fechaFin'].setValue(null);
                    this.form.controls['fechaFin'].enable();
                    this.validacionFechaPronoei();
                }
            });


        this.form.get('codZona').valueChanges
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe(value => {

                switch (value) {
                    case TipoZonaEnum.RURAL:
                        this.monto = 700;
                        break;

                    case TipoZonaEnum.URBANA:
                        this.monto = 500;
                        break;

                    default:
                        this.monto = null;
                }
            });
    }

    private async cargarCombos() {
        this.nvlAcademicoActivoCatalogo$ = this.pronoeiCatalogoDataService.nvlAcademicoActivoCatalogo$;
        this.tipoDocumentoIdentidadActivo$ = this.pronoeiCatalogoDataService.tipoDocumentoIdentidadActivo$;

        this.pronoeiCatalogoDataService.DataCombosPronoeiRegistroInit();
        await this.pronoeiCatalogoDataService.cargarPronoeiMaestroPermiso();
        this.validarAccionPermiso();
    }

}
