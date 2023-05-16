import { Component, Input, OnInit, OnDestroy } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { of, Subject } from 'rxjs';
import { catchError, finalize, takeUntil } from 'rxjs/operators';
import { accionReference, regimenLaboral } from '../../../_utils/constants';
import { DataService } from '../../../../../../../core/data/data.service';
import { IPlazaDestinoRequest } from '../../../models/plaza.interface';
import * as moment from 'moment';

@Component({
    selector: 'minedu-seccion-plaza',
    templateUrl: './seccion-plaza.component.html',
    styleUrls: ['./seccion-plaza.component.scss']
})
export class SeccionPlazaComponent implements OnInit, OnDestroy {

    @Input('parentForm')
    parentForm: FormGroup;

    idAccion: number;
    idRegimenLaboral: number;
    verPlazaDestinoBuscador = false;

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

    LEY_30512: number = regimenLaboral.LEY_30512;
    LEY_29944: number = regimenLaboral.LEY_29944;
    LEY_276: number = regimenLaboral.LEY_276;

    categoriaRemu: string = '';

    private _unsubscribeAll: Subject<any>;

    constructor(private formBuilder: FormBuilder,
        private dataService: DataService) { this._unsubscribeAll = new Subject(); }

    ngOnDestroy(): void {
        this._unsubscribeAll.next();
        this._unsubscribeAll.complete();
    }

    ngOnInit(): void {
        this.buildForm();
        this.loadCategoriaRemuStr();
        this.verPlazaDestinoBuscadorFn();
    }

    loadCategoriaRemuStr() {
        const accionPersonalForm = this.parentForm.controls["accionPersonal"] as FormGroup;
        this.cargarCategoriaRemunerativaStr();
        accionPersonalForm.controls["idRegimenLaboral"]
            .valueChanges.pipe(takeUntil(this._unsubscribeAll))
            .subscribe(idRegimenLaboral => {
                this.cargarCategoriaRemunerativaStr();
            });

        accionPersonalForm.controls["idMotivoAccion"].valueChanges.pipe(takeUntil(this._unsubscribeAll)).subscribe(x => {
            this.idAccion = accionPersonalForm.controls["idAccion"].value;
        });

        this.plazaOrigenForm.controls["codigoPlazaOrigen"].valueChanges.pipe(takeUntil(this._unsubscribeAll)).subscribe(x => {
            this.verPlazaDestinoBuscadorFn();
        });
    }
    cargarCategoriaRemunerativaStr() {
        const accionPersonalForm = this.parentForm.controls["accionPersonal"] as FormGroup;
        const idRegimenLaboral = accionPersonalForm.controls["idRegimenLaboral"].value;
        this.idRegimenLaboral = idRegimenLaboral;
        this.categoriaRemu = "Categoría Remunerativa";

        if (idRegimenLaboral === regimenLaboral.LEY_29944) {
            this.categoriaRemu = "Escala Magisterial"
        } else if (idRegimenLaboral === regimenLaboral.LEY_30512 || idRegimenLaboral === regimenLaboral.LEY_276) {
            this.categoriaRemu = "Categoría Remunerativa"
        }
    }

    verPlazaDestinoBuscadorFn() {
        this.verPlazaDestinoBuscador = false;
        const accionPersonalForm = this.parentForm.controls["accionPersonal"] as FormGroup;
        this.idAccion = accionPersonalForm.controls["idAccion"].value;

        if (this.idAccion) {
            const porProcesoValue = accionPersonalForm.controls['porProceso'].value ?? false;
            this.verPlazaDestinoBuscador = this.idAccion != this.PERMUTA && !porProcesoValue;
        }
    }


    set plazaOrigenForm(form: FormGroup) {
        this.parentForm?.setControl("plazaOrigen", form);
    }

    get plazaOrigenForm() {
        return this.parentForm?.controls["plazaOrigen"] as FormGroup;
    }

    set plazaDestinoForm(form: FormGroup) {
        this.parentForm?.setControl("plazaDestino", form);
    }

    get plazaDestinoForm() {
        return this.parentForm?.controls["plazaDestino"] as FormGroup;
    }

    getControlValue(form: FormGroup, controlName: string) {
        const value = form.controls[controlName]?.value ?? null;
        return value;
    }


    private buildForm() {
        const plazaOrigen = this.formBuilder.group({
            itemPlaza: [null],
            codigoPlazaOrigen: [null, [Validators.required]],
            tipoPlaza: [null],
            institucionEducativa: [null],
            regimenLaboral: [null],
            condicionLaboral: [null],
            jornadaLaboral: [null],
            grupoOcupacional: [null],
            categoriaRemunerativa: [null],
            tipoCargo: [null],
            modalidadEducativa: [null],
            nivelEducativo: [null],
            areaCurricular: [null],
            cargo: [null],
            vigenciaInicio: [null],
            idAreaDesempenioLaboral: [null],
            codigoAreaDesempenioLaboral: [null]
        });

        const plazaDestino = this.formBuilder.group({
            esValido: [false],
            codigoPlazaFiltro: [null],
            itemPlaza: [null],
            codigoPlazaOrigen: [null, [Validators.required]],
            tipoPlaza: [null],
            institucionEducativa: [null],
            regimenLaboral: [null],
            condicionLaboral: [null],
            jornadaLaboral: [null],
            grupoOcupacional: [null],
            categoriaRemunerativa: [null],
            tipoCargo: [null],
            modalidadEducativa: [null],
            nivelEducativo: [null],
            areaCurricular: [null],
            cargo: [null],
            vigenciaInicio: [null],
            idAreaDesempenioLaboral: [null],
            codigoAreaDesempenioLaboral: [null]
        });

        this.plazaOrigenForm = plazaOrigen;
        this.plazaDestinoForm = plazaDestino;
    }

    buscarPlazaDestino() {
        const plazaDestino = this.parentForm.controls["plazaDestino"] as FormGroup;
        const codigoPlaza = plazaDestino.controls["codigoPlazaFiltro"].value;
        this.obtenerPlaza(codigoPlaza)
    }

    private async obtenerPlaza(codigoPlazaDestino) {
        if (!codigoPlazaDestino) return;

        const plazaOrigen = this.plazaOrigenForm;
        const codigoPlazaOrigen = plazaOrigen.controls["codigoPlazaOrigen"].value;

        const datosPersonales = this.parentForm?.controls["datosPersonales"] as FormGroup;
        const vinculacion = datosPersonales.controls["vinculacion"] as FormGroup;
        const idServidorPublicoOrigen = vinculacion.controls["idServidorPublico"].value;
        // const idServidorPublicoDestino = vinculacion.controls["idServidorPublico"].value;

        const accionPersonalForm = this.parentForm?.controls["accionPersonal"] as FormGroup;

        const idRegimenLaboral = accionPersonalForm.controls["idRegimenLaboral"].value;
        const idGrupoAccion = accionPersonalForm.controls["idGrupoAccion"].value;
        const idMotivoAccion = accionPersonalForm.controls["idMotivoAccion"].value;
        const idAccion = accionPersonalForm.controls["idAccion"].value;
        const esPorProceso = accionPersonalForm.controls["porProceso"].value;

        const datosAccionForm = this.parentForm?.controls["datosAccion"] as FormGroup;
        const _fechaInicioAccion = datosAccionForm.controls["fechaInicio"].value;
        if (!_fechaInicioAccion) {
            datosAccionForm.controls["fechaInicio"].markAsTouched();
            this.dataService.Message().msgWarning('INGRESAR LA FECHA DE INICIO.');
            return;
        }

        const fechaInicioAccion = _fechaInicioAccion ? moment(_fechaInicioAccion).format('MM-DD-YYYY') : null;

        const request = {
            idRegimenLaboral,
            idGrupoAccion,
            idMotivoAccion,
            codigoPlazaDestino,
            codigoPlazaOrigen,
            idServidorPublicoOrigen,
            // idServidorPublicoDestino,
            idAccion,
            fechaInicioAccion,
            esPorProceso
        } as IPlazaDestinoRequest;

        this.dataService.Spinner().show('sp6');

        this.dataService.AccionesPersonal()
            .getPlazaDestino(request)
            .pipe(
                catchError((error) => {
                    const errorMessage = error?.error?.messages[0]?.toUpperCase() ?? null;
                    this.dataService.Message().msgWarning(`"${errorMessage}"`);
                    return of(null);
                }),
                finalize(() => {

                    this.dataService.Spinner().hide('sp6');
                })
            )
            .pipe(takeUntil(this._unsubscribeAll)).subscribe((response: any) => {
                if (!response) return;
                const plazaDestino = this.plazaDestinoForm;

                if (response.esValido === false) {
                    const mensaje: string = response.mensajeValidacion;
                    this.dataService.Message().msgWarning(mensaje.toUpperCase(), () => {
                        plazaDestino.reset();
                    });
                } else {
                    plazaDestino.patchValue({ ...response, codigoPlazaFiltro: codigoPlazaDestino, codigoPlazaOrigen: codigoPlazaDestino });
                }
            });
    }



}
