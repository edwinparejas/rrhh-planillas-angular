import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { of, Subject } from 'rxjs';
import { catchError, finalize, takeUntil } from 'rxjs/operators';
import { DataService } from '../../../../../../../../../core/data/data.service';
import { CatalogoEnum } from '../../../../types/Enums';

@Component({
    selector: 'minedu-atencion-plaza-espejo',
    templateUrl: './atencion-plaza-espejo.component.html',
    styleUrls: ['./atencion-plaza-espejo.component.scss']
})
export class AtencionPlazaEspejoComponent implements OnInit, OnDestroy {

    @Input('accionPersonal')
    accionPersonal: any;

    @Input('actividadResolucion')
    actividadResolucion: any;


    @Input('form')
    form: FormGroup;
    @Input('ver')
    ver = false;

    tipoCargos: any[] = [];
    cargos: any[] = [];
    jornadasLaborales: any[] = [];

    tipoCargoStr: string = null;
    cargoStr: string = null;
    jornadaLaboralStr: string = null;


    private _unsubscribeAll: Subject<any>;

    constructor(private dataService: DataService) {
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
        await this.obtenerTipoCargoData();
        this.cargarAccionPersonal();
        this.form.controls["limpiar"]?.valueChanges
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe(limpiar => {
                if (limpiar) {
                    this.cargos = [];
                    this.jornadasLaborales = [];
                }

            });
    }

    private async cargarAccionPersonal() {

        const anotaciones = this.accionPersonal?.datosAccion?.anotaciones ?? null;
        this.form.controls["anotaciones"].setValue(anotaciones);
        this.form.controls["anotaciones"].disable();

        let idTipoCargo = this.accionPersonal?.idTipoCargo ?? this.actividadResolucion?.idTipoCargoNuevo;
        let idCargo = this.accionPersonal?.idCargo ?? this.actividadResolucion?.idCargoNuevo;
        let idJornadaLaboral = this.accionPersonal?.idJornadaLaboral ?? this.actividadResolucion?.idJornadaNuevo;

        if (this.ver) {
            idTipoCargo = this.actividadResolucion?.idTipoCargoNuevo ?? null;
            idCargo = this.actividadResolucion?.idCargoNuevo ?? null;
            idJornadaLaboral = this.actividadResolucion?.idJornadaNuevo ?? null;
        }

        if (idTipoCargo) {
            this.form?.controls["idTipoCargo"].setValue(idTipoCargo);
            await this.obtenerDataCargos();
        }

        if (idCargo) {
            this.form?.controls["idCargo"].setValue(idCargo);
            await this.obtenerDataJornadasLaborales();
            this.form?.controls["idJornadaLaboral"].setValue(idJornadaLaboral);
        }

        if (!this.ver) return;

        const tipoCargoItem = this.tipoCargos.find(x => x.id == idTipoCargo);
        this.tipoCargoStr = tipoCargoItem?.descripcion ?? null;

        const cargoItem = this.cargos.find(x => x.id == idCargo);
        this.cargoStr = cargoItem?.descripcion ?? null;

        const jornadaItem = this.jornadasLaborales.find(x => x.id == idJornadaLaboral);
        this.jornadaLaboralStr = jornadaItem?.descripcion ?? null;
    }

    async tipoCargoChangeEvent() {
        const idTipoCargo = this.form?.controls["idTipoCargo"].value ?? null;

        this.form?.patchValue({
            idCargo: null,
            idJornadaLaboral: null
        });

        this.cargos = [];
        this.jornadasLaborales = [];

        this.form?.markAsUntouched();

        if (!idTipoCargo) return;
        await this.obtenerDataCargos();
    }

    async cargoChangeEvent() {
        const idCargo = this.form?.controls["idCargo"].value ?? null;

        this.form?.patchValue({
            idJornadaLaboral: null
        });

        this.jornadasLaborales = [];

        this.form?.markAsUntouched();

        if (!idCargo) return;

        await this.obtenerDataJornadasLaborales();
    }


    private async obtenerTipoCargoData() {
        const codigos: number[] = [
            CatalogoEnum.TIPOCARGO,
        ];
        const response = await this.dataService
            .AccionesPlazaEspejo()
            .getCatalogos(codigos)
            .pipe(
                catchError((e) => {
                    return of([]);
                }),
                finalize(() => { })).toPromise();

        if (response) {
            this.tipoCargos = response;
        }
    }

    private async obtenerDataCargos() {
        const idRegimenLaboral = this.actividadResolucion?.idRegimenLaboral;
        const idTipoCargo = this.form?.controls["idTipoCargo"].value;

        if (!idRegimenLaboral) return;

        const response = await this.dataService
            .AccionesPlazaEspejo()
            .getCargosPoIdeRegimenLaboral(idRegimenLaboral, idTipoCargo)
            .pipe(
                catchError(() => {
                    return of([]);
                }),
                finalize(() => { })).toPromise();
        if (response) {
            this.cargos = response;
        }
    }

    private async obtenerDataJornadasLaborales() {
        this.form?.controls["idJornadaLaboral"].setValidators([]);
        const idTipoCargo = this.form?.controls["idTipoCargo"].value;
        const idCargo = this.form?.controls["idCargo"].value;

        const response = await this.dataService
            .AccionesPlazaEspejo()
            .getJornadasLaborales(idTipoCargo, idCargo)
            .pipe(
                catchError(() => {
                    return of([]);
                }),
                finalize(() => { })).toPromise();
        if (response) {
            this.jornadasLaborales = response;
        }

        if (this.jornadasLaborales?.length > 0) {
            this.form?.controls["idJornadaLaboral"].setValidators([Validators.required]);
        }
        this.form?.controls["idJornadaLaboral"].updateValueAndValidity();
    }

}

