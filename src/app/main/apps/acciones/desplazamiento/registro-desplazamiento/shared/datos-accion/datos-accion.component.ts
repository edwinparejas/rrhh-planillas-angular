import { Component, Input, OnInit, AfterViewInit, OnDestroy } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { DataService } from 'app/core/data/data.service';
import { of, Subject } from 'rxjs';
import { catchError, finalize, takeUntil } from 'rxjs/operators';
import { accionReference } from '../../../_utils/constants';
import { RegistrarDesplazamientoService } from '../../services/registrar-desplazamiento.service';

@Component({
    selector: 'minedu-datos-accion',
    templateUrl: './datos-accion.component.html',
    styleUrls: ['./datos-accion.component.scss']
})
export class DatosAccionComponent implements OnInit, OnDestroy {

    @Input('parentForm')
    parentForm: FormGroup;


    @Input('accionPersonalItem')
    accionPersonalItem: any = null;

    idAccion: number = null;

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

    categoriaRemunerativaList: any[] = [];

    private _unsubscribeAll: Subject<any>;

    constructor(private formBuilder: FormBuilder,
        private dataService: DataService,
        private registrarDesplazamientoService: RegistrarDesplazamientoService) {
        this._unsubscribeAll = new Subject();
    }

    ngOnDestroy(): void {
        this._unsubscribeAll.next();
        this._unsubscribeAll.complete();
    }

    ngOnInit(): void {
        this.buildForm();
        this.getAccionPersonaItem();
        this.accionPersonalChange();
    }

    get form() {
        return this.parentForm.controls["datosAccion"] as FormGroup;
    }

    set form(form: FormGroup) {
        this.parentForm?.setControl("datosAccion", form);
    }

    get accionPersonalForm() {
        return this.parentForm?.controls["accionPersonal"] as FormGroup;
    }

    buildForm() {
        this.form = this.formBuilder.group({
            fechaInicio: [null],
            fechaTermino: [null],
            escalaMagisterial: [null],
        });

        const accionPersonalForm = this.parentForm.controls["accionPersonal"] as FormGroup;
        this.idAccion = +accionPersonalForm.controls["idAccion"].value;
        this.validacionPorDesplazamiento();

        accionPersonalForm.controls["idMotivoAccion"].valueChanges
            .pipe(takeUntil(this._unsubscribeAll)).subscribe(x => {
                this.idAccion = accionPersonalForm.controls["idAccion"].value;
                this.validacionPorDesplazamiento();
            });
    }

    private accionPersonalChange() {
        const accionPersonalForm = this.parentForm.controls["accionPersonal"] as FormGroup;
        this.getCategoriaRemunerativa();
        accionPersonalForm.controls["idAccion"].valueChanges
            .pipe(takeUntil(this._unsubscribeAll)).subscribe(x => {
                this.getCategoriaRemunerativa();
            });
    }

    private async getCategoriaRemunerativa() {

        const accionPersonalForm = this.parentForm.controls["accionPersonal"] as FormGroup;
        const idRegimenLaboralValue = accionPersonalForm.controls["idRegimenLaboral"].value;
        const idAccionValue = accionPersonalForm.controls["idAccion"].value;

        if (idRegimenLaboralValue == -1) return;
        if (idAccionValue == -1) return;
        if (idAccionValue !== this.ASCENSOESCALAMAGISTERIAL && idAccionValue !== this.UBICACIONESCALAMAGISTERIAL) return;

        let isSuccess = true;
        const response = await this.dataService.AccionesPersonal()
            .getComboCargaRemunerativaPorRegimenLaboral(idRegimenLaboralValue)
            .pipe(
                catchError((error) => {
                    isSuccess = false;
                    return of(null);
                }),
                finalize(() => { })
            ).toPromise();


        if (isSuccess && response) {
            const data = response?.map((x) => ({
                ...x,
                value: x.idCategoriaRemunerativa,
                label: `${x.descripcionCategoriaRemunerativa}`,
            }));

            this.categoriaRemunerativaList = data;
        }
    }

    private validacionPorDesplazamiento() {
        this.form.clearValidators();
        switch (this.idAccion) {
            case this.REASIGNACION,
                this.PERMUTA,
                this.RETORNAR,
                this.ASCENSOCARGO,
                this.ROTACION:
                this.form.controls["fechaInicio"].setValidators([Validators.required]);
                this.form.controls["fechaInicio"].updateValueAndValidity();
                break;

            case this.ASCENSOESCALAMAGISTERIAL:
                this.form.controls["fechaInicio"].setValidators([Validators.required]);
                this.form.controls["fechaInicio"].updateValueAndValidity();
                this.form.controls["escalaMagisterial"].setValidators([Validators.required]);
                this.form.controls["escalaMagisterial"].updateValueAndValidity();                

                break;
            case
                this.ENCARGATURA,
                this.DESIGNACION,
                this.ASCENSOESCALAMAGISTERIAL,
                this.DESTAQUE:

                this.form.controls["fechaInicio"].setValidators([Validators.required]);
                this.form.controls["fechaInicio"].updateValueAndValidity();
                this.form.controls["fechaTermino"].setValidators([Validators.required]);
                this.form.controls["fechaTermino"].updateValueAndValidity();
                break;
        }
    }

    private async getAccionPersonaItem() {

        this.registrarDesplazamientoService.accionPersonalItem$
            .pipe(takeUntil(this._unsubscribeAll)).subscribe(async (item: any) => {
                if (!item) return;
                const accionPersonalForm = this.parentForm?.controls["datosAccion"] as FormGroup;

                accionPersonalForm.controls["fechaInicio"].setValue(item?.fechaInicioVigencia);
                accionPersonalForm.controls["fechaTermino"].setValue(item?.fechaFinVigencia);
                accionPersonalForm.controls["escalaMagisterial"].setValue(item?.idCategoriaRemunerativaAscenso);
            });

    }

    getControlValue(form: FormGroup, controlName: string) {
        return form.controls[controlName].value;
    }
}
