import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { of, Subject } from 'rxjs';
import { catchError, finalize, takeUntil } from 'rxjs/operators';
import { DataService } from '../../../../../../../core/data/data.service';
import { MatDialog } from '@angular/material/dialog';
import { BuscadorServidorPublicoComponent } from '../../../components/buscador-servidor-publico/buscador-servidor-publico.component';
import { DocumentViewerComponent } from 'app/main/apps/components/document-viewer/document-viewer.component';
import { BuscarVinculacionesComponent } from '../../../components/buscar-vinculaciones/buscar-vinculaciones.component';
import { RegistrarDesplazamientoService } from '../../services/registrar-desplazamiento.service';
import { MESSAGE_GESTION, TipoDocumentosIdentidadActivoEnum } from '../../../_utils/constants';
import { EntidadSedeService } from '../../../Services/entidad-sede.service';

@Component({
    selector: 'minedu-datos-personales-permuta',
    templateUrl: './datos-personales-permuta.component.html',
    styleUrls: ['./datos-personales-permuta.component.scss']
})
export class DatosPersonalesPermutaComponent implements OnInit, OnDestroy {


    @Input('parentForm')
    parentForm: FormGroup;

    @Input('accionPersonalItem')
    accionPersonalItem: any = null;

    tipoDocumentoList = [];

    private _unsubscribeAll: Subject<any>;

    constructor(private formBuilder: FormBuilder,
        private registrarDesplazamientoService: RegistrarDesplazamientoService,
        private dataService: DataService,
        private entidadSedeService: EntidadSedeService,
        private materialDialog: MatDialog
    ) {

        this._unsubscribeAll = new Subject();
    }

    ngOnInit(): void {
        this.buildForm();
        this.getAccionPersonaItem();
        this.loadTipoDocumento();
    }
    ngOnDestroy(): void {
        this._unsubscribeAll.next();
        this._unsubscribeAll.complete();
    }

    private buildForm() {

        const permutaForm = this.formBuilder.group({
            datosServidor1: this.datosPersonalFormItem,
            datosServidor2: this.datosPersonalFormItem,
        })

        this.parentForm?.setControl("datosPersonales", permutaForm);
    }

    getDatosServidorForm(num: number) {
        const datosPersonalesForm = this.parentForm?.controls["datosPersonales"] as FormGroup;
        const form = datosPersonalesForm?.controls[`datosServidor${num}`] as FormGroup;
        return form;
    }
    handleBuscarInformeEscalafonarioBtn(form: FormGroup) {
        this.handleBuscarInformeEscalafonario(form);
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


    busquedaPersonalizadaServidorPublico(form: FormGroup, formNum: number) {

        const idTipoDocumentoSeleccionado = form.controls["idTipoDocumentoIdentidad"].value;
        const numeroDocumentoIdentidad = form.controls["numeroDocumentoIdentidad"].value;
        const idRegimenLaboralSeleccionado = (this.parentForm.controls["accionPersonal"] as FormGroup).controls["idRegimenLaboral"].value;

        this.limpiarDatosPersonalesFormsData(form);

        if (formNum == 1) (this.parentForm.controls["plazaOrigen"] as FormGroup).reset();
        else if (formNum == 2) (this.parentForm.controls["plazaDestino"] as FormGroup).reset();

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

            this.busquedaPersonalizadaAccion(servidorPublico, form, formNum);

        });

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

    private busquedaPersonalizadaAccion(servidorPublico, form: FormGroup, formNum: number) {
        if (!servidorPublico) return;

        const personaForm = form.controls["persona"] as FormGroup;

        form.controls["idTipoDocumentoIdentidad"].setValue(servidorPublico.idTipoDocumentoIdentidad);
        form.controls["numeroDocumentoIdentidad"].setValue(servidorPublico.numeroDocumentoIdentidad);

        personaForm.controls["idPersona"].setValue(servidorPublico.idPersona);
        personaForm.controls["nombreCompleto"].setValue(servidorPublico.nombreCompleto);
        personaForm.controls["estadoCivil"].setValue(servidorPublico.estadoCivil);
        personaForm.controls["sexo"].setValue(servidorPublico.sexo);
        personaForm.controls["fechaNacimiento"].setValue(servidorPublico.fechaNacimiento);

        this.buscarVinculacion(form, formNum);
    }

    async busquedaPersonalizadaServidorPublicoEnter(form: FormGroup, formNum: number) {

        const numeroDocumentoLength = (form.controls['numeroDocumentoIdentidad'].value || '').length;
        const dniLength = 8;
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
            this.limpiarDatosPersonalesFormsData(form);
            this.cleanForms();
            setTimeout(() => {
                this.dataService.Message().msgWarning(`${errorMessage}`, () => { });
            }, 300);
            return false;
        }

        const idTipoDocumentoIdentidad = form.controls["idTipoDocumentoIdentidad"].value;
        const numeroDocumentoIdentidad = form.controls["numeroDocumentoIdentidad"].value;
        const idRegimenLaboral = (this.parentForm.controls["accionPersonal"] as FormGroup).controls["idRegimenLaboral"].value;

        this.limpiarDatosPersonalesFormsData(form);

        if (formNum == 1) (this.parentForm.controls["plazaOrigen"] as FormGroup).reset();
        else if (formNum == 2) (this.parentForm.controls["plazaDestino"] as FormGroup).reset();

        this.cleanForms();

        const servidorPublico = await this.busquedaServPublicoServicio({ idRegimenLaboral, idTipoDocumentoIdentidad, numeroDocumentoIdentidad });
        if (!servidorPublico) return;

        this.busquedaPersonalizadaAccion(servidorPublico[0], form, formNum);
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

    private buscarVinculacion = async (form: FormGroup, formNum: number) => {

        const personaForm = form.controls["persona"] as FormGroup;
        const idPersonaSeleccionado = personaForm.controls["idPersona"].value;

        const vinculacionList = await this.obtenerVinculacionAsync(idPersonaSeleccionado);
        if ((vinculacionList || []).length === 0) {
            this.dataService.Message().msgWarning('No se encontró información de vinculacion de el(los) servidor(es) para los criterios de búsqueda ingresados.', () => { });
            return;
        }

        if (vinculacionList.length == 1) {
            const response = vinculacionList[0];
            this.setVinculacion(form, response, formNum);
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
                this.setVinculacion(form, response, formNum);
            });
    }

    private async setVinculacion(form: FormGroup, response: any, formNum: number) {
        const vinculacionForm = form.controls["vinculacion"] as FormGroup;

        vinculacionForm.controls["idServidorPublico"].setValue(response.idServidorPublico);
        vinculacionForm.controls["codigoPlaza"].setValue(response.codigoPlaza);

        const plaza = await this.obtenerPlaza(response.codigoPlaza, response.idServidorPublico);

        if (plaza) {
            const plazaOrigenForm = this.parentForm.controls["plazaOrigen"] as FormGroup;
            const plazaDestinoForm = this.parentForm.controls["plazaDestino"] as FormGroup;
            if (formNum == 1) plazaOrigenForm.patchValue({ ...plaza });
            else if (formNum == 2) plazaDestinoForm.patchValue({ ...plaza });
        }
    }

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
                    return of(e);
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


    private get datosPersonalFormItem() {
        return this.formBuilder.group({
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
                    const errMessage: string = e?.error?.messages[0];
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
        // form.controls["documentoInformeEscalafonario"].setValue(null);
        // form.controls["fechaInformeEscalafonario"].setValue(null);
        // form.controls["aniosTiempoServicio"].setValue(null);
    }

    getControlValue(form: FormGroup, controlName: string) {
        return form.controls[controlName]?.value ?? null;
    }

    get accionPersonalForm() {
        return this.parentForm?.controls["accionPersonal"] as FormGroup;
    }

    limpiarDataTipoNumDoc(event = null, form: FormGroup, formNum: number) {
        form.controls["numeroDocumentoIdentidad"].reset()
        this.limpiarDatosPersonalesFormsData(form);
        this.cleanForms();
        if (formNum == 1) (this.parentForm.controls["plazaOrigen"] as FormGroup).reset();
        else if (formNum == 2) (this.parentForm.controls["plazaDestino"] as FormGroup).reset();
    }

    limpiarDatosPersonalesFormsData(form: FormGroup) {
        const personaForm = form.controls["persona"] as FormGroup
        const informeEscalafonarioForm = form.controls["informeEscalafonario"] as FormGroup
        const vinculacionForm = form.controls["vinculacion"] as FormGroup
        personaForm.reset();
        informeEscalafonarioForm.reset();
        vinculacionForm.reset();
    }

    private cleanForms() {
        // if (this.esModificar) return;
        // (this.parentForm.controls["datosPersonales"] as FormGroup).reset();
        (this.parentForm.controls["adjudicacionPersona"] as FormGroup).reset();
        (this.parentForm.controls["datosAccion"] as FormGroup).reset();
    }



    private async getAccionPersonaItem() {

        this.registrarDesplazamientoService.accionPersonalItem$
            .pipe(takeUntil(this._unsubscribeAll)).subscribe(async (item: any) => {
                if (!item) return;
                this.cargarDatosOrigen(item);
                this.cargarDatosDestino(item);
            });
    }


    async cargarDatosOrigen(item) {
        if (item?.idTipoDocumentoIdentidadOrigen) {
            const form = this.datosPersonalFormItem;
            form.controls["idTipoDocumentoIdentidad"].setValue(item?.idTipoDocumentoIdentidadOrigen);
            form.controls["numeroDocumentoIdentidad"].setValue(item?.numeroDocumentoIdentidadOrigen);

            const form1Persona = (form.controls["persona"] as FormGroup);
            form1Persona.controls["idPersona"].setValue(item?.idPersonaS1);
            form1Persona.controls["nombreCompleto"].setValue(item?.nombreCompletoS1);
            form1Persona.controls["estadoCivil"].setValue(item?.estadoCivilS1);
            form1Persona.controls["sexo"].setValue(item?.sexoS1);
            form1Persona.controls["fechaNacimiento"].setValue(item?.fechaNacimientoS1);

            const form1Vinculacion = (form.controls["vinculacion"] as FormGroup);
            form1Vinculacion.controls["idServidorPublico"].setValue(item?.idServidorPublicoOrigen);
            form1Vinculacion.controls["codigoPlaza"].setValue(item?.codigoPlazaOrigen);

            const form1InformeEscalafonario = (form.controls["informeEscalafonario"] as FormGroup);
            form1InformeEscalafonario.controls["numeroInformeEscalafonario"].setValue(item?.informeEscalafonarioOrigen);

            this.handleBuscarInformeEscalafonario(form);

            if (item?.idServidorPublicoOrigen && item?.codigoPlazaOrigen) {
                const plazaOrigen = await this.obtenerPlaza(item?.codigoPlazaOrigen, item?.idServidorPublicoOrigen);
                if (plazaOrigen) {
                    const plazaOrigenForm = this.parentForm.controls["plazaOrigen"] as FormGroup;
                    plazaOrigenForm.patchValue({ ...plazaOrigen });
                }
            }

            const datosPersonalesForm = this.parentForm?.controls["datosPersonales"] as FormGroup;
            datosPersonalesForm?.setControl("datosServidor1", form);
        }

    }
    async cargarDatosDestino(item) {
        if (item?.idTipoDocumentoIdentidadDestino) {
            const form = this.datosPersonalFormItem;
            form.controls["idTipoDocumentoIdentidad"].setValue(item?.idTipoDocumentoIdentidadDestino);
            form.controls["numeroDocumentoIdentidad"].setValue(item?.numeroDocumentoIdentidadDestino);

            const formPersona = (form.controls["persona"] as FormGroup);
            formPersona.controls["idPersona"].setValue(item?.idPersonaS2);
            formPersona.controls["nombreCompleto"].setValue(item?.nombreCompletoS2);
            formPersona.controls["estadoCivil"].setValue(item?.estadoCivilS2);
            formPersona.controls["sexo"].setValue(item?.sexoS2);
            formPersona.controls["fechaNacimiento"].setValue(item?.fechaNacimientoS2);

            const formVinculacion = (form.controls["vinculacion"] as FormGroup);
            formVinculacion.controls["idServidorPublico"].setValue(item?.idServidorPublicoDestino);
            formVinculacion.controls["codigoPlaza"].setValue(item?.codigoPlazaDestino);

            const form1InformeEscalafonario = (form.controls["informeEscalafonario"] as FormGroup);
            form1InformeEscalafonario.controls["numeroInformeEscalafonario"].setValue(item?.informeEscalafonarioDestino);

            this.handleBuscarInformeEscalafonario(form);

            if (item?.idServidorPublicoDestino && item?.codigoPlazaDestino) {
                const plazaDestino = await this.obtenerPlaza(item?.codigoPlazaDestino, item?.idServidorPublicoDestino);
                if (plazaDestino) {
                    const plazaDestinoForm = this.parentForm.controls["plazaDestino"] as FormGroup;
                    plazaDestinoForm.patchValue({ ...plazaDestino });
                }
            }

            const datosPersonalesForm = this.parentForm?.controls["datosPersonales"] as FormGroup;
            datosPersonalesForm?.setControl("datosServidor2", form);
        }

    }



}
