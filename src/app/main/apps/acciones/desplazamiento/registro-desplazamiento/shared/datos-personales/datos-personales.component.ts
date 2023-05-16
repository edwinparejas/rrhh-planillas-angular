import { Component, Input, OnInit, OnDestroy } from '@angular/core';
import { FormGroup, FormBuilder, FormArray, Validators, FormControl } from '@angular/forms';
import { accionReference, grupoAccion, regimenLaboral, codigosSituacionLaboralEnum, TipoDocumentosIdentidadActivoEnum, MESSAGE_GESTION } from '../../../_utils/constants';
import { RegistrarDesplazamientoService } from '../../services/registrar-desplazamiento.service';
import { DataService } from '../../../../../../../core/data/data.service';
import { MatDialog } from '@angular/material/dialog';
import { BuscadorServidorPublicoComponent } from '../../../components/buscador-servidor-publico/buscador-servidor-publico.component';
import { BuscarVinculacionesComponent } from '../../../components/buscar-vinculaciones/buscar-vinculaciones.component';
import { catchError, finalize, takeUntil } from 'rxjs/operators';
import { of, Subject } from 'rxjs';
import { DocumentViewerComponent } from 'app/main/apps/components/document-viewer/document-viewer.component';
import { IPlazaDestinoRequest } from '../../../models/plaza.interface';
import * as moment from 'moment';
import { EntidadSedeService } from '../../../Services/entidad-sede.service';

@Component({
    selector: 'minedu-datos-personales',
    templateUrl: './datos-personales.component.html',
    styleUrls: ['./datos-personales.component.scss']
})
export class DatosPersonalesComponent implements OnInit, OnDestroy {

    @Input('parentForm')
    parentForm: FormGroup;

    titulo = '';
    tipoDocumentoList = [];
    esModificar = false;

    esProcesoCheck = false;
    idAccion = 0;
    PERMUTA = accionReference.PERMUTA;

    private _unsubscribeAll: Subject<any>;

    constructor(
        private formBuilder: FormBuilder,
        private materialDialog: MatDialog,
        private dataService: DataService,
        private entidadSedeService: EntidadSedeService,
        private registrarDesplazamientoService: RegistrarDesplazamientoService
    ) {
        this._unsubscribeAll = new Subject();

    }

    ngOnInit(): void {
        this.cargarTodo();
    }

    ngOnDestroy(): void {
        this._unsubscribeAll.next();
        this._unsubscribeAll.complete();
    }

    private async cargarTodo() {
        this.buildForm();
        this.getAccionPersonaItem();
        this.loadTipoDocumento();
    }

    private async getAccionPersonaItem() {

        this.registrarDesplazamientoService.accionPersonalItem$
            .pipe(takeUntil(this._unsubscribeAll)).subscribe(async (item: any) => {
                if (!item) return;
                this.esModificar = true;
                if (item?.idTipoDocumentoIdentidadOrigen) {

                    const form1 = this.datosPersonalFormItem;
                    form1.controls["idTipoDocumentoIdentidad"].setValue(item?.idTipoDocumentoIdentidadOrigen);
                    form1.controls["numeroDocumentoIdentidad"].setValue(item?.numeroDocumentoIdentidadOrigen);

                    const form1Persona = (form1.controls["persona"] as FormGroup);
                    form1Persona.controls["idPersona"].setValue(item?.idPersonaS1);
                    form1Persona.controls["nombreCompleto"].setValue(item?.nombreCompletoS1);
                    form1Persona.controls["estadoCivil"].setValue(item?.estadoCivilS1);
                    form1Persona.controls["sexo"].setValue(item?.sexoS1);
                    form1Persona.controls["fechaNacimiento"].setValue(item?.fechaNacimientoS1);

                    const form1Vinculacion = (form1.controls["vinculacion"] as FormGroup);
                    form1Vinculacion.controls["idServidorPublico"].setValue(item?.idServidorPublicoOrigen);
                    form1Vinculacion.controls["codigoPlaza"].setValue(item?.codigoPlazaOrigen);

                    const form1InformeEscalafonario = (form1.controls["informeEscalafonario"] as FormGroup);
                    form1InformeEscalafonario.controls["numeroInformeEscalafonario"].setValue(item?.informeEscalafonarioOrigen);

                    this.handleBuscarInformeEscalafonario(form1);

                    if (item?.idServidorPublicoOrigen && item?.codigoPlazaOrigen) {
                        const plazaOrigen = await this.obtenerPlaza(item?.codigoPlazaOrigen, item?.idServidorPublicoOrigen);
                        if (plazaOrigen) {
                            const plazaOrigenForm = this.parentForm.controls["plazaOrigen"] as FormGroup;
                            plazaOrigenForm.patchValue({ ...plazaOrigen });
                        }
                    }

                    if (item?.esPorProceso) {
                        this.obtenerAdjudicacionPorServidorPublico(form1);
                    }
                    else {
                        this.obtenerPlazaDestino(item);
                    }

                    this.DatosPersonales = form1;
                }
            });
    }

    private get datosPersonalFormItem() {
        return this.formBuilder.group({
            titulo: ["Datos Personales"],
            idTipoDocumentoIdentidad: [null, Validators.required],
            numeroDocumentoIdentidad: [null, Validators.required],
            informeEscalafonario: this.formBuilder.group({
                numeroInformeEscalafonario: [null, Validators.required],
                fechaInformeEscalafonario: [null, Validators.required],
                documentoInformeEscalafonario: [null],
                aniosTiempoServicio: [null]
            }),
            persona: this.formBuilder.group({
                idPersona: [null, Validators.required],
                nombreCompleto: [null],
                estadoCivil: [null],
                sexo: [null],
                fechaNacimiento: [null]
            }),
            vinculacion: this.formBuilder.group({
                idServidorPublico: [null, Validators.required],
                codigoPlaza: [null]
            })
        });
    }

    get accionPersonalForm() {
        return this.parentForm?.controls["accionPersonal"] as FormGroup;
    }


    limpiarDatosPersonalesFormsData() {
        const personaForm = this.DatosPersonales.controls["persona"] as FormGroup;
        const informeEscalafonarioForm = this.DatosPersonales.controls["informeEscalafonario"] as FormGroup;
        const vinculacionForm = this.DatosPersonales.controls["vinculacion"] as FormGroup;
        personaForm.reset();
        informeEscalafonarioForm.reset();
        vinculacionForm.reset();
    }

    limpiarDataTipoNumDoc(event = null) {
        this.DatosPersonales.controls["numeroDocumentoIdentidad"].reset()
        this.limpiarDatosPersonalesFormsData();
        this.cleanForms();
    }



    private async busquedaServPublicoServicio({ idRegimenLaboral, idTipoDocumentoIdentidad, numeroDocumentoIdentidad }) {

        const { codigoSede } = this.entidadSedeService.entidadSede;

        const request = {
            codigoSede,
            idRegimenLaboral,
            idTipoDocumentoIdentidad,
            numeroDocumentoIdentidad,
            buscarEnOtraSede: false,
            validarSancion: true
        };

        this.dataService.Spinner().show("sp6");
        return await this.dataService
            .AccionesPersonal()
            .getListarServidorPublico(request, 1, 10)
            .pipe(
                catchError((e) => of(null)),
                finalize(() => {
                    this.dataService.Spinner().hide("sp6");
                })
            ).toPromise();

    }

    private busquedaPersonalizadaAccion(servidorPublico, form: FormGroup) {
        if (!servidorPublico) {
            this.dataService.Message().msgWarning("No se encontró información del servidor para los criterios de búsqueda ingresados.");
            return;
        }

        const personaForm = form.controls["persona"] as FormGroup;
        const accionPersonalForm = this.parentForm.controls["accionPersonal"] as FormGroup;
        const idAccion = accionPersonalForm.controls["idAccion"].value;


        if (idAccion == accionReference.RETORNAR) {

            if (servidorPublico?.codigoSituacionLaboral !== codigosSituacionLaboralEnum.DESIGNADO) {
                this.dataService.Message().msgWarning("LA SITUACIÓN LABORAL DEL SERVIDOR PÚBLICO DEBE SER DESIGNADO.");
                return;
            }
        }

        form.controls["idTipoDocumentoIdentidad"].setValue(servidorPublico.idTipoDocumentoIdentidad);
        form.controls["numeroDocumentoIdentidad"].setValue(servidorPublico.numeroDocumentoIdentidad);

        personaForm.controls["idPersona"].setValue(servidorPublico.idPersona);
        personaForm.controls["nombreCompleto"].setValue(servidorPublico.nombreCompleto);
        personaForm.controls["estadoCivil"].setValue(servidorPublico.estadoCivil);
        personaForm.controls["sexo"].setValue(servidorPublico.sexo);
        personaForm.controls["fechaNacimiento"].setValue(servidorPublico.fechaNacimiento);

        this.buscarVinculacion(form);
    }


    async busquedaPersonalizadaServidorPublicoEnter(form: FormGroup) {

        const numeroDocumentoLength = (form.controls['numeroDocumentoIdentidad'].value || '').length;
        const dniLength = 8
        let errorMessage = null;

        if (form.get('idTipoDocumentoIdentidad').value == null) {
            errorMessage = MESSAGE_GESTION.INVALID_TIPO_DOCUMENTO_PERSONA;
        }

        if ((form.get('idTipoDocumentoIdentidad').value == TipoDocumentosIdentidadActivoEnum.CARNET_EXTRANJERIA ||
            form.get('idTipoDocumentoIdentidad').value == TipoDocumentosIdentidadActivoEnum.PASAPORTE) &&
            numeroDocumentoLength < 9) {
            errorMessage = MESSAGE_GESTION.EX08;
        }

        if (form.get('idTipoDocumentoIdentidad').value == TipoDocumentosIdentidadActivoEnum.DNI &&
            numeroDocumentoLength < dniLength) {
            errorMessage = MESSAGE_GESTION.EX03;
        }

        if (errorMessage) {
            this.limpiarDatosPersonalesFormsData();
            this.cleanForms();

            setTimeout(() => {
                this.dataService.Message().msgWarning(`${errorMessage}`, () => { });
            }, 300);
            return false;
        }

        const idTipoDocumentoIdentidad = form.controls["idTipoDocumentoIdentidad"].value;
        const numeroDocumentoIdentidad = form.controls["numeroDocumentoIdentidad"].value;
        const idRegimenLaboral = (this.parentForm.controls["accionPersonal"] as FormGroup).controls["idRegimenLaboral"].value;

        this.limpiarDatosPersonalesFormsData();
        this.cleanForms();

        const servidorPublico = await this.busquedaServPublicoServicio({ idRegimenLaboral, idTipoDocumentoIdentidad, numeroDocumentoIdentidad });
        this.busquedaPersonalizadaAccion(servidorPublico[0], form);
    }

    busquedaPersonalizadaServidorPublico(form: FormGroup) {

        const idTipoDocumentoSeleccionado = form.controls["idTipoDocumentoIdentidad"].value;
        const numeroDocumentoIdentidad = form.controls["numeroDocumentoIdentidad"].value;
        const idRegimenLaboralSeleccionado = (this.parentForm.controls["accionPersonal"] as FormGroup).controls["idRegimenLaboral"].value;

        this.limpiarDatosPersonalesFormsData();
        this.cleanForms();

        const dialogRef = this.materialDialog.open(BuscadorServidorPublicoComponent, {
            panelClass: 'minedu-buscador-servidor-publico-dialog',
            width: '1300px',
            disableClose: true,
            data: {
                action: 'busqueda',
                idTipoDocumentoSeleccionado,
                idRegimenLaboralSeleccionado,
                numeroDocumentoIdentidad,
                validarSancion: false
            }
        });

        dialogRef.afterClosed().pipe(takeUntil(this._unsubscribeAll)).subscribe(async (servidorPublico) => {

            const respuesta = await this.ValidarServidorPublico(servidorPublico.idServidorPublico);

            if (!respuesta) return;
            this.busquedaPersonalizadaAccion(servidorPublico, form);
        });
    }


    private async ValidarServidorPublico(idServidorPublico) {
        return await this.dataService
            .AccionesPersonal()
            .validarSancion(idServidorPublico)
            .pipe(
                catchError((e) => {
                    const errorMessage = e?.error?.messages[0]?.toUpperCase() ?? null;
                    this.dataService.Message().msgWarning('"' + errorMessage + '"');

                    return of(null)
                }),
                finalize(() => {
                    this.dataService.Spinner().hide("sp6");
                })
            ).toPromise();
    }


    handleVerDocumentoSustento(codigoAdjunto: string) {

        if (!codigoAdjunto) {
            this.dataService.Message().msgWarning('EL REGISTRO NO TIENE INFORME ESCALAFONARIO.', () => {
            });
            return;
        }
        this.dataService.Spinner().show('sp6');
        this.dataService.Documento().descargar(codigoAdjunto)
            .pipe(
                catchError((e) => {
                    return of(null);
                }),
                finalize(() => this.dataService.Spinner().hide('sp6'))
            ).pipe(takeUntil(this._unsubscribeAll)).subscribe(response => {
                if (response) {
                    this.handlePreview(response, codigoAdjunto);
                } else {
                    this.dataService.Message().msgWarning('NO SE PUDO OBTENER EL DOCUMENTO DE SUSTENTO.', () => {
                    });
                }
            });
    };

    handleBuscarInformeEscalafonarioBtn(form: FormGroup) {
        if (this.esProcesoCheck) return;
        this.handleBuscarInformeEscalafonario(form);
    }

    getControlValue(form: FormGroup, controlName: string) {
        return form.controls[controlName]?.value ?? null;
    }

    private buildForm() {
        this.DatosPersonales = this.datosPersonalFormItem;
        const acccionPersonalForm = this.parentForm.controls["accionPersonal"] as FormGroup;

        acccionPersonalForm.controls["porProceso"].valueChanges
            .pipe(takeUntil(this._unsubscribeAll)).subscribe(esProceso => {
                this.esProcesoCheck = esProceso;
            });

        const accionPersonalForm = this.parentForm.controls["accionPersonal"] as FormGroup;
        accionPersonalForm.controls["idMotivoAccion"].valueChanges
            .pipe(takeUntil(this._unsubscribeAll)).subscribe(x => {
                this.idAccion = accionPersonalForm.controls["idAccion"].value;
            });
    }

    get DatosPersonales() {
        return this.parentForm.controls["datosPersonales"] as FormGroup;
    }

    set DatosPersonales(form: FormGroup) {
        this.parentForm?.setControl("datosPersonales", form);
    }


    private cleanForms() {
        (this.parentForm.controls["adjudicacionPersona"] as FormGroup).reset();
        (this.parentForm.controls["plazaOrigen"] as FormGroup).reset();
        (this.parentForm.controls["plazaDestino"] as FormGroup).reset();

        const accionPersonalForm = this.parentForm.controls["accionPersonal"] as FormGroup;
        const idAccion = accionPersonalForm.controls["idAccion"].value;

        if (idAccion !== accionReference.RETORNAR) {
            (this.parentForm.controls["datosAccion"] as FormGroup).reset();
        }
    }

    private async obtenerVinculacionAsync(idPersonaSeleccionado) {
        var request = {
            idPersona: idPersonaSeleccionado,
            paginaActual: 1,
            tamanioPagina: 10
        }
        this.dataService.Spinner().show('sp6');
        const response = await this.dataService
            .AccionesPersonal()
            .buscarVinculacionesPorPersona(request, request.paginaActual, request.tamanioPagina)
            .pipe(
                catchError((e) => of(null)),
                finalize(() => this.dataService.Spinner().hide('sp6'))
            ).toPromise<any[]>();

        return response;
    }

    private buscarVinculacion = async (form: FormGroup) => {

        const personaForm = form.controls["persona"] as FormGroup;
        const idPersonaSeleccionado = personaForm.controls["idPersona"].value;

        const vinculacionList = await this.obtenerVinculacionAsync(idPersonaSeleccionado);
        if ((vinculacionList || []).length === 0) {
            this.dataService.Message().msgWarning('No se encontró información de vinculacion de el(los) servidor(es) para los criterios de búsqueda ingresados.', () => { });
            return;
        }

        if (vinculacionList.length == 1) {
            const response = vinculacionList[0];
            this.setVinculacion(form, response);
            return;
        }


        const dialogRef = this.materialDialog.open(BuscarVinculacionesComponent, {
            panelClass: 'minedu-buscar-vinculaciones-dialog',
            width: '1300px',
            disableClose: true,
            data: {
                action: 'busqueda',
                idPersonaSeleccionado
            },

        });

        dialogRef.afterClosed()
            .pipe(takeUntil(this._unsubscribeAll)).subscribe(async (response) => {
                if (response == null) return;
                this.setVinculacion(form, response);
            });
    }

    private async setVinculacion(form: FormGroup, response: any) {

        const vinculacionForm = form.controls["vinculacion"] as FormGroup;

        vinculacionForm.controls["idServidorPublico"].setValue(response.idServidorPublico);
        vinculacionForm.controls["codigoPlaza"].setValue(response.codigoPlaza);

        const plazaOrigen = await this.obtenerPlaza(response.codigoPlaza, response.idServidorPublico);

        if (plazaOrigen) {
            const plazaOrigenForm = this.parentForm.controls["plazaOrigen"] as FormGroup;
            plazaOrigenForm.patchValue({ ...plazaOrigen });
        }
        const accionPersonalForm = this.parentForm.controls["accionPersonal"] as FormGroup;
        const idAccion = accionPersonalForm.controls["idAccion"].value;

        const esPorProceso = this.esPorProceso();

        if (esPorProceso) {
            this.obtenerAdjudicacionPorServidorPublico(form);
            return;
        }

        if (idAccion == accionReference.ASCENSOESCALAMAGISTERIAL) {
            const plazaOrigenForm = this.parentForm.controls["plazaOrigen"] as FormGroup;
            const plazaDestinoForm = this.parentForm.controls["plazaDestino"] as FormGroup;
            const plazaOrigenFormValue = plazaOrigenForm.value;
            plazaDestinoForm.patchValue({ ...plazaOrigenFormValue });
        }
        else if (idAccion == accionReference.RETORNAR) {
            //AQUI SUGIERE PLAZA DESTINO
            this.ObtenerPlazaSugerida(response.idServidorPublico);
        }
    }

    private ObtenerPlazaSugerida(idServidorPublico: number) {
        var isSuccess = true;
        const accionPersonalForm = this.parentForm.controls["accionPersonal"] as FormGroup;
        const idRegimenLaboral = accionPersonalForm.controls["idRegimenLaboral"].value;

        const datosAccionForm = this.parentForm.controls["datosAccion"] as FormGroup;
        const fechaInicioAccion = datosAccionForm.controls["fechaInicio"].value;

        var request = { idServidorPublico, fechaInicioAccion, idRegimenLaboral };

        this.dataService.Spinner().show("sp6");
        var promesa = this.dataService.AccionesPersonal().getPlazaDestinoSugerida(request).pipe(
            catchError((error) => {
                isSuccess = false;

                // const errorMessage = error?.error?.messages[0]?.toUpperCase() ?? null;
                // this.dataService.Message().msgWarning('"' + errorMessage + '"');

                return of(null);
            }),
            finalize(() => { this.dataService.Spinner().hide("sp6"); })
        ).toPromise();

        promesa.then(response => {
            if (isSuccess && response) {
                var plazaDestino = { ...response, codigoPlazaFiltro: response.codigoPlazaDestino, codigoPlazaOrigen: response.codigoPlazaDestino };
                const plazaDestinoForm = this.parentForm?.controls["plazaDestino"] as FormGroup;
                plazaDestinoForm.patchValue(plazaDestino);
            }
        });
    }

    private handlePreview(file: any, codigoAdjuntoSustento: string) {
        const dialogRef = this.materialDialog.open(DocumentViewerComponent, {
            panelClass: 'modal-viewer-form-dialog',
            disableClose: true,
            data: {
                modal: {
                    icon: 'remove_red_eye',
                    title: 'Informe Escalafonario',
                    file: file,
                    fileName: codigoAdjuntoSustento
                }
            }
        });

        dialogRef.afterClosed()
            .pipe(takeUntil(this._unsubscribeAll)).subscribe((response: any) => {
                if (!response) {
                    return;
                }
            });
    };

    private async obtenerPlaza(codigoPlaza, idServidorPublico) {
        let isSuccess = true;
        let plaza = null;
        const response = await this.dataService.AccionesPersonal()
            .getPlazaOrigen(codigoPlaza, idServidorPublico)
            .pipe(
                catchError(() => {
                    isSuccess = false;
                    return of([])
                }),
                finalize(() => { })
            ).toPromise();

        if (isSuccess && response) {
            plaza = response;
        }
        return plaza;
    }


    private async obtenerPlazaDestino(item) {
        if (!item?.codigoPlazaDestino) return;

        const plazaOrigen = this.parentForm?.controls["plazaOrigen"] as FormGroup;
        const codigoPlazaOrigen = plazaOrigen.controls["codigoPlazaOrigen"].value;
        const codigoPlazaDestino = item.codigoPlazaDestino;
        const idServidorPublicoOrigen = item.idServidorPublicoOrigen;

        const accionPersonalForm = this.parentForm?.controls["accionPersonal"] as FormGroup;

        const idRegimenLaboral = accionPersonalForm.controls["idRegimenLaboral"].value;
        const idGrupoAccion = accionPersonalForm.controls["idGrupoAccion"].value;
        const idMotivoAccion = accionPersonalForm.controls["idMotivoAccion"].value;
        const idAccion = accionPersonalForm.controls["idAccion"].value;

        const datosAccionForm = this.parentForm?.controls["datosAccion"] as FormGroup;
        const fechaInicioAccion = datosAccionForm.controls["fechaInicio"].value;

        const request = {
            idRegimenLaboral,
            idGrupoAccion,
            idMotivoAccion,
            codigoPlazaDestino,
            codigoPlazaOrigen,
            idServidorPublicoOrigen,
            idAccion,
            fechaInicioAccion
        } as IPlazaDestinoRequest;

        this.dataService.AccionesPersonal()
            .getPlazaDestino(request)
            .pipe(
                catchError(() => of(null)),
                finalize(() => { })
            )
            .pipe(takeUntil(this._unsubscribeAll)).subscribe((response: any) => {
                if (!response) return;

                const plazaDestino = this.parentForm?.controls["plazaDestino"] as FormGroup;

                if (response.esValido === false) {
                    const mensaje: string = response?.mensajeValidacion;
                    this.dataService.Message().msgWarning(mensaje.toUpperCase(), () => {
                        plazaDestino.reset();
                    });
                } else {
                    plazaDestino.patchValue({ ...response, codigoPlazaFiltro: item.codigoPlazaDestino, codigoPlazaOrigen: item.codigoPlazaDestino });
                }
            });
    }


    private handleBuscarInformeEscalafonario(form: FormGroup) {

        const vinculacionForm = form.controls["vinculacion"] as FormGroup;
        const idServidorPublico = vinculacionForm.controls["idServidorPublico"].value;

        const idTipoDocumentoSeleccionado = form.controls["idTipoDocumentoIdentidad"].value;
        const numeroDocumentoIdentidad = form.controls["numeroDocumentoIdentidad"].value;

        const informeEscalafonarioForm = form.controls["informeEscalafonario"] as FormGroup;
        const numeroInformeEscalafonario = informeEscalafonarioForm.controls["numeroInformeEscalafonario"].value;

        if (numeroInformeEscalafonario == null || numeroInformeEscalafonario == "") {
            this.dataService.Message().msgWarning('DEBE INGRESAR EL INFORME ESCALAFONARIO', () => {
            });
            this.limpiarInformeExcalafonario(informeEscalafonarioForm);
            return;
        }

        if (!idServidorPublico) {
            this.dataService.Message().msgWarning('DEBE HABER ELEGIDO UN SERVIDOR CON VINCULACION', () => {
            });
            this.limpiarInformeExcalafonario(informeEscalafonarioForm);
            return;
        }
        if (!idTipoDocumentoSeleccionado || !numeroDocumentoIdentidad) {
            this.dataService.Message().msgWarning('DEBE INGRESAR UN EL TIPO DE DOCUMENTO DE IDENTIDAD Y EL NÚMERO DE DOCUMENTO DE IDENTIDAD PARA REALIZAR LA BÚSQUEDA DE INFORME ESCALAFONARIO.', () => {
            });
            this.limpiarInformeExcalafonario(informeEscalafonarioForm);
            return;
        }

        let isSuccess = true;
        this.dataService.Spinner().show('sp6');
        const _response = this.dataService
            .AccionesPersonal()
            .getInformeEscalafonario(idTipoDocumentoSeleccionado, numeroDocumentoIdentidad, numeroInformeEscalafonario)
            .pipe(
                catchError((e) => {
                    isSuccess = false;
                    const errMessage: string = e?.error.messages[0];

                    if (errMessage) {
                        this.limpiarInformeExcalafonario(informeEscalafonarioForm);
                        this.dataService.Message().msgWarning(errMessage.toUpperCase(), () => { });
                    }
                    return of(null);
                }),
                finalize(() => { this.dataService.Spinner().hide('sp6'); })
            ).toPromise();

        _response.then(response => {
            if (isSuccess && response) {

                informeEscalafonarioForm.controls["documentoInformeEscalafonario"].setValue(response.documentoInformeEscalafonario);
                informeEscalafonarioForm.controls["fechaInformeEscalafonario"].setValue(response.fechaInformeEscalafonario);
                informeEscalafonarioForm.controls["aniosTiempoServicio"].setValue(response.aniosTiempoServicio);
            }
        })
    };
    private limpiarInformeExcalafonario(form: FormGroup) {
        form.reset();
    }

    private async loadTipoDocumento() {
        let isSuccess = true;
        const response = await this.dataService.AccionesPersonal()
            .getComboTipoDocumento().toPromise();

        if (isSuccess && response) {
            const data = response.map((x) => ({
                ...x,
                value: x.idCatalogoItem,
                label: `${x.descripcionCatalogoItem}`,
            }));
            this.tipoDocumentoList = data;
        }
    }

    private async obtenerAdjudicacionPorServidorPublico(form: FormGroup) {

        const vinculacionForm = form.controls["vinculacion"] as FormGroup;
        const idServidorPublico = vinculacionForm.controls["idServidorPublico"].value;

        let isSuccess = true;
        const response = await this.dataService.AccionesPersonal().validarAdjudicacionByServidorPublico({
            idServidorPublico
        }).pipe(
            catchError(({ error }) => {
                isSuccess = false;
                this.dataService.Message().msgWarning('"' + error.messages[0].toUpperCase() + '"');
                return of(null);
            }),
            finalize(() => { })
        ).toPromise();

        if (isSuccess && response) {
            const adjudicacionPersonaForm = this.parentForm.controls["adjudicacionPersona"] as FormGroup;
            adjudicacionPersonaForm.patchValue({ ...response });

            if (!response?.esValido) {
                const errMessage = response.mensaje;
                this.dataService.Message().msgWarning(errMessage.toUpperCase(), () => { });

                this.limpiarDatosPersonalesFormsData();
                this.cleanForms();
                return;
            }

            //Si se encuentra la adjudicacion se setea el codigo de la plaza destino            
            var plazaDestinoForm = this.parentForm?.controls["plazaDestino"] as FormGroup;
            plazaDestinoForm.controls["codigoPlazaOrigen"].setValue(response.codigoPlazaDestino);
            plazaDestinoForm.controls["itemPlaza"].setValue(response.itemPlaza);
            plazaDestinoForm.controls["vigenciaInicio"].setValue(response.vigenciaInicio);

            const datosAccionForm = this.parentForm?.controls["datosAccion"] as FormGroup;
            datosAccionForm.controls["fechaInicio"].setValue(response.fechaInicioAdjudicacion);
            datosAccionForm.controls["escalaMagisterial"].setValue(response.idCategoriaRemunerativaObtenida);
            
            const informeEscalafonarioForm = form.controls["informeEscalafonario"] as FormGroup;
            informeEscalafonarioForm.controls["numeroInformeEscalafonario"].setValue(response.numeroInformeEscalafonario);
            this.handleBuscarInformeEscalafonario(form);

        }

    }

    private esPorProceso() {
        const accionPersonalForm = this.parentForm.controls["accionPersonal"] as FormGroup;
        const esPorProceso = accionPersonalForm.controls["porProceso"].value;
        // const idRegimenLaboral = accionPersonalForm.controls["idRegimenLaboral"].value;
        // const idGrupoAccion = accionPersonalForm.controls["idGrupoAccion"].value;
        // const idAccion = accionPersonalForm.controls["idAccion"].value;

        return esPorProceso;
    }

}
